+++
date = '2025-07-05T03:52:51+02:00'
title = "Proof by Minimal Counterexample"
tags = []
draft = true
comment = true
featured = false
weight = 1
+++

## Introduction

In the context of my last post about Euler's proof on infinite primes, I was revisiting the proof of the fundamental theorem of arithmetic --- that every integer greater than 1 can be uniquely factored into prime numbers.

The proof proceeds by a classic technique called proof by minimal counterexample. I'll present the sketch of the proof here:

> Assume ... 

Looking back now, this argument sounds oddly similar to proof by induction. Like the part where we assume $\neg P$ for $n$, and then show that $\neg P$ for $n-1$, doesn't that sound like an inductive step?

It turns out, it is indeed very much related to induction, or more specifically, proof by minimal counterexample is the contraposition of proof by induction!

- Proof by minimal counterexample
- Proof by infinite descent
- Proof by mathematical/strong induction
- Proof by induction on the structure of trees
- Proof by minimal counterexample on the structure of trees
  - Optimality of Hoffman coding

<!-- TODO: Lean proof -->

- Proof of fundamental theorem of arithmetic by minimal counterexample
- Proof that no natural numbers are Dedekind-infinite by minimal counterexample
  - Start proof by assuming there exists a minimal Dedekind-infinite (von Neumann ordinal) set $s(n)$
  - Show that $n$ is also Dedekind-infinite, contradicting the minimality of $s(n)$
  - We can assume the minimal element of the set of Dedekind-infinite ordinals exists by the well-ordering principle, or by using the fact that natural numbers are well-ordered (so that we don't need to use the axiom of choice)