+++
title = 'JIT-compiling CEL'
date = '2026-03-21T0:00:00-00:00'
tags = ['go', 'jit', 'cel', 'compilers']
draft = false
comment = true
featured = true
weight = 1
+++

## Introduction

This is a post about a JIT compiler I've been building for [CEL (Common Expression Language)](https://cel.dev/) in Go. The idea is simple: for filter expressions that run millions of times per second, we can skip the interpreter and emit native machine code instead.

## Why use CEL?

When you need to evaluate user-defined expressions inside a Go program, the obvious candidates are scripting languages like Lua or JavaScript.

These are general-purpose, Turing-complete languages, which is a huge problem. A bad input could spin into an infinite loop and take down your service. You'd need sandboxing, resource limits, and timeouts just to run a simple predicate safely.

CEL was designed to avoid this. It is intentionally not Turing complete. There are no unbounded loops, no general recursion, and no side effects. Evaluation cost is bounded relative (roughly linear time) to the input size.

## Who uses CEL?

This makes it safe to run untrusted expressions in production without any sandboxing. CEL has been adopted by major infrastructure projects for exactly this reason:

- **Kubernetes** uses CEL for [ValidatingAdmissionPolicy](https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/) for access control.
- **Istio** uses CEL in its [authorization policies](https://istio.io/latest/docs/reference/config/security/conditions/) for access control rules on mesh traffic.
- **Envoy** uses CEL for policy expressions in its RBAC and external authorization filters.
- **Google Cloud IAM** uses CEL for conditions on resource access.

The standard [cel-go](https://github.com/google/cel-go) implementation uses a tree-walking interpreter. It's flexible, but comes with overhead: interface boxing, map-based variable lookups, and virtual dispatch on every node. For expressions like `age >= 18 && country == "JP"`, most of that is unnecessary.

## Inspiration

This implementation is largely inspired by [sonic](https://github.com/bytedance/sonic), ByteDance's high-performance JSON library. Sonic's key idea is that JSON encoding and decoding can be JIT-compiled at runtime.

Given a JSON schema, it generates a native encoder and decoder tailored to that schema. The generated code knows exactly which fields exist, at which byte offsets, and in which order, so it can read and write memory directly instead of using reflection on every call.

The CEL JIT compiler takes the same approach. Given a Go struct type and a CEL expression, it generates the equivalent of what you'd write by hand in Go code. We also borrow sonic's `loader` package to load the generated code into executable memory at runtime.

## Constraints

This JIT compiler is not a spec-compliant CEL implementation. In particular:

- Output type is `bool` only
    - Top-level expression must evaluate to a boolean.
- Input types are scalar only
    - `int64`, `uint64`, `float64`, `bool`, `string` only. No `bytes`, `dyn`, timestamps, durations, or complex types.
- No macros are supported
    - CEL macros like `has()`, `all()`, `exists()`, and `filter()` are not supported.
- Activation is a plain Go struct
    - The interpreter resolves variables through an `Activation` interface, which usually wraps a `map[string]any`. Every lookup involves a map access and an interface assertion, which is a significant overhead.

These constraints are intentional. The goal is to keep the implementation small while covering the most common use case - policy predicates. For anything that doesn't fit, we fall back to the standard cel-go interpreter.

## Usage

The JIT compiler plugs into the standard cel-go `Program` API with two options: `UseJIT()` to enable native compilation, and `UseJITActivationType[T]()` to register the input struct type.

```go
type Request struct {
    Age     int64  `json:"age"`
    Country string `json:"country"`
}

env, _ := cel.NewEnv(
    cel.Variable("age", cel.IntType),
    cel.Variable("country", cel.StringType),
)
ast, _ := env.Compile(`age >= 18 && country == "JP"`)

program, _ := env.Program(ast, cel.UseJIT(), cel.UseJITActivationType[Request]())
```

At evaluation time, you call `JITEval` with a pointer to the struct:

```go
input := &Request{Age: 25, Country: "JP"}
result, ok := program.JITEval(input)
```

If the expression cannot be JIT-compiled (e.g., it uses unsupported features), `JITEnabled()` returns false and `JITError()` explains why. In that case, you can then fall back to the normal `Eval` path.

## Architecture

The JIT compiler is a four-stage pipeline:

### 1. Translate

The first pass lowers a checked CEL AST into a typed three-address-code (TAC) IR. Each instruction operates on virtual registers and carries a static type tag (`int64`, `uint64`, `float64`, `bool`, or `string`).

The key idea is that struct field accesses become `LOAD_FIELD` instructions with a raw byte offset. The offset is computed from the Go `reflect.Type` at compile time.

String literals are interned into a pool and referenced by index. Logical operators (`&&`, `||`, `?:`) are lowered to branches with short-circuit evaluation. The `in` operator is expanded inline for literal lists or dispatched to type-specialised Go helpers for slice/array fields.

### 2. Allocate

A linear-scan register allocator maps virtual registers to physical registers. It is type-aware: `float64` values go into floating-point registers, `string` values take a consecutive pair of integer registers (pointer + length), and everything else gets a single integer register.

When physical registers run out, the interval with the farthest end point is spilled in the standard way.

### 3. Rewrite

If spills occurred, this pass inserts explicit `SPILL_LOAD` and `SPILL_STORE` pseudo-instructions around spilled virtual registers, then re-runs allocation. If spills persist after one rewrite pass, compilation fails and we fall back to the interpreter.

### 4. Compile

The final pass emits native machine code for amd64 or arm64 using `golang-asm`. The code is loaded into executable memory via `sonic/loader` with preemption disabled, and wrapped as a `func(unsafe.Pointer) bool`.

At evaluation time, the runtime checks the input's concrete type, extracts the raw data pointer, and calls the native function directly.

## Benchmarks

I benchmarked the JIT compiler against the standard cel-go interpreter across 93 policy rules on two architectures.

### arm64 (Apple M4 Max)

| Metric | Interpreter (geomean) | JIT (geomean) | Improvement |
|---|---|---|---|
| sec/op | 101.8 ns | 7.439 ns | **-92.69%** |
| B/op | 48.53 B | 0 B | **-100.00%** |
| allocs/op | 3.071 | 0 | **-100.00%** |

### amd64 (Intel Core Ultra 5 125H)

| Metric | Interpreter (geomean) | JIT (geomean) | Improvement |
|---|---|---|---|
| sec/op | 167.7 ns | 11.13 ns | **-93.36%** |
| B/op | 48.53 B | 0 B | **-100.00%** |
| allocs/op | 3.071 | 0 | **-100.00%** |

It's roughly 10-15x faster across the board, with zero heap allocations per evaluation. Simple single-comparison rules see ~85% improvement, while complex multi-clause expressions see up to ~97%.

## Conclusion

The JIT compiler is still a work in progress, but the core pipeline is functional. The goal isn't to replace the standard CEL interpreter, but to provide a fast path for the subset of expressions where native code makes a real difference.

I hope you enjoyed this post, and if you have any questions or comments, feel free to reach out!
