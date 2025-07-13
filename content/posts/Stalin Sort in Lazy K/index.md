+++
title = 'Stalin Sort in Lazy K'
date = '2025-06-26T0:00:00-00:00'
tags = ['lazy k', 'lambda calculus', 'sorting']
draft = false
comment = true
featured = true
weight = 1
+++

## Introduction

This is a post about my recent attempt at implementing the Stalin sort algorithm in Lazy K.

## Lazy K

Lazy K is a minimalist programming language that is based on the SKI combinator calculus. It is an elegant language that only consists of five tokens: `S`, `K`, `I`, `(`, `)`, while being Turing complete.

The combinators are defined as follows:

- $S=\lambda x.\lambda y.\lambda z.(x~z)~(y~z)$
- $K=\lambda x.\lambda y.x$
- $I=\lambda x.x$

## Stalin Sort

Stalin sort is a ground-breaking sorting algorithm known for its simplicity and efficiency. To quote from the [official repository](https://github.com/gustavo-depaula/stalin-sort):

> Stalin Sort is also know as the best sorting algorithm of all times because of its AMAZING capacity of always ordering an array with an O(n) performance.

The algorithm works by iterating through the list and keeping track of the last seen element, removing any "comrades" that are less than or equal to the last seen element.

Never heard of it before? That's because it is a joke algorithm, and it is not meant to be taken seriously. I found it pretty funny --- hopefully I'm not offending anyone though.

It seems like the official repository is accepting implementations for various programming languages, so I thought it would be a fun exercise to revisit Lambda Calculus and Haskell.

## Implementation

Here is the implementation of the basic primitives in Lambda Calculus, based on the standard Church encoding:

$$
\begin{align}
n&\triangleq\lambda f.\lambda x.f^{\circ n}~x \\
\mathrm{eol}&\triangleq 256 \\
\mathrm{pred}&\triangleq\lambda n.\lambda f.\lambda x.n~(\lambda g.\lambda h.h~(g~f))~(\lambda u.x)~(\lambda u.u) \\
\mathrm{minus}&\triangleq\lambda m.\lambda n.n~\mathrm{pred}~m \\
\mathrm{LEQ}&\triangleq\lambda m.\lambda n.\mathrm{IsZero}~(\mathrm{minus}~m~n) \\
\mathrm{EQ}&\triangleq\lambda m.\lambda n.\mathrm{and}~(\mathrm{LEQ}~m~n)~(\mathrm{LEQ}~n~m) \\
\mathrm{true}&\triangleq\lambda a.\lambda b.a \\
\mathrm{false}&\triangleq\lambda a.\lambda b.b \\
\mathrm{and}&\triangleq\lambda p.\lambda q.p~q~p \\
\mathrm{if}&\triangleq\lambda p.\lambda a.\lambda b.p~a~b \\
\mathrm{pair}&\triangleq\lambda x.\lambda y.\lambda z.z~x~y \\
\mathrm{first}&\triangleq\lambda p.p~(\lambda x.\lambda y.x) \\
\mathrm{second}&\triangleq\lambda p.p~(\lambda x.\lambda y.y) \\
\mathrm{head}&\triangleq\lambda l.\mathrm{first}~l \\
\mathrm{tail}&\triangleq\lambda l.\mathrm{second}~l \\
\mathrm{cons}&\triangleq\lambda h.\lambda t.\mathrm{pair}~h~t
\end{align}
$$

A small caveat is that an empty list in Lazy K is represented as an integer $\mathrm{eol}\triangleq256$, so there is no need to store a boolean flag in each node to indicate if the list is empty or not, which is common in other encodings.

Building on these primitives, we can implement the Stalin sort algorithm in Lazy K in a straightforward way. The algorithm can be expressed as a recursive function that takes a list and a bound, and returns a sorted list:

$$
\begin{align}
\mathrm{stalinsort}'&\triangleq\lambda l.\lambda b.
\mathrm{if}~(\mathrm{EQ}~\mathrm{eol}~(\mathrm{head}~l))~l \\
&(\mathrm{if}~(\mathrm{LEQ}~b~(\mathrm{head}~l)) \\
&~(\mathrm{cons}~(\mathrm{head}~l)~(\mathrm{stalinsort}'~(\mathrm{tail}~l)~(\mathrm{head}~l))) \\
&~(\mathrm{stalinsort'}~(\mathrm{tail}~l)~b)) \\
\mathrm{stalinsort}&\triangleq\lambda l.\mathrm{starlinsort}'~l~0
\end{align}
$$

To implement this in Lazy K, we use the Y combinator to take the fixpoint of $\mathrm{stalinsort}'$:

$$
\begin{align}
Y&\triangleq\lambda f.(\lambda x.f~(x~x))~(\lambda x.f~(x~x)) \\
\mathrm{stalinsort}'&\triangleq Y(\lambda f.\lambda l.\lambda b.
\mathrm{if}~(\mathrm{EQ}~\mathrm{eol}~(\mathrm{head}~l))~l \\
&(\mathrm{if}~(\mathrm{LEQ}~b~(\mathrm{head}~l)) \\
&~(\mathrm{cons}~(\mathrm{head}~l)~(f~(\mathrm{tail}~l)~(\mathrm{head}~l))) \\
&~(f~(\mathrm{tail}~l)~b))) \\
\mathrm{stalinsort}&\triangleq\lambda l.\mathrm{starlinsort}'~l~0
\end{align}
$$

Now that we have the implementation in Lambda Calculus, we can convert it to SKI combinators by the following rewrite rules:

- $\lambda x.x = I$
- $\lambda x.c = K~c$ ($c$ is a constant)
- $\lambda x.f~x = f$
- $\lambda x.y~z = S(\lambda x.y)(\lambda x.z)$

I've implemented a simple [Haskell program](https://github.com/taichimaeda/lazyk-playground) that represents the above Lambda Calculus definitions, performs alpha renaming and converts them to SKI combinators.

## Result

The final result of the Stalin sort algorithm in Lazy K is as follows:

```lazyk
((S((S(K(((S((S((S(KS))((S(KK))I)))(K((SI)I))))((S((S(KS))((S(KK))I)))(K((SI)I))))((S(K(S((S(KS))((S(KK))((S((S(K((S((S(KS))((S(K(S(KS))))((S(K(S(KK))))((S((S(KS))((S(KK))I)))(KI))))))(K(KI)))))((S(K(((S((S(KS))((S(K(S(K((S((S(KS))((S((S(KS))((S(KK))I)))(KI))))((S(KK))I))))))((S((S(KS))((S(KK))((S(K((S(K(S(K((S((SI)(K(K(KI)))))(K((S(KK))I)))))))((S((S(KS))((S(KK))((S(K((S(K(S((SI)(K((S((S(KS))((S(K(S(KS))))((S((S(KS))((S(K(S(KS))))((S(K(S(KK))))((S((S(KS))((S(KK))I)))(K((S(K(S(K(SI)))))((S(K(S(KK))))((S(K(SI)))((S(KK))I))))))))))(K(K((S(KK))I)))))))(K(K(KI)))))))))((S(KK))I))))I))))(KI)))))I))))(KI)))))((S(K(S((S(K((S(K(S(K((S((SI)(K(K(KI)))))(K((S(KK))I)))))))((S((S(KS))((S(KK))((S(K((S(K(S((SI)(K((S((S(KS))((S(K(S(KS))))((S((S(KS))((S(K(S(KS))))((S(K(S(KK))))((S((S(KS))((S(KK))I)))(K((S(K(S(K(SI)))))((S(K(S(KK))))((S(K(SI)))((S(KK))I))))))))))(K(K((S(KK))I)))))))(K(K(KI)))))))))((S(KK))I))))I))))(KI)))))I))))((S(KK))I)))(((SI)I)(((SI)I)((S((S(KS))((S(KK))I)))((S((S(KS))((S(KK))I)))(KI))))))))((S(K((SI)(K((S(KK))I)))))I))))I))))))((S((S(KS))((S(K(S(KS))))((S(K(S((S(KS))((S(K(S(K((S((S(KS))((S(K(S(KS))))((S(K(S(KK))))((S((S(KS))((S(KK))I)))(KI))))))(K(KI)))))))((S(K(S((S(K((S(K(S(K((S((SI)(K(K(KI)))))(K((S(KK))I)))))))((S((S(KS))((S(KK))((S(K((S(K(S((SI)(K((S((S(KS))((S(K(S(KS))))((S((S(KS))((S(K(S(KS))))((S(K(S(KK))))((S((S(KS))((S(KK))I)))(K((S(K(S(K(SI)))))((S(K(S(KK))))((S(K(SI)))((S(KK))I))))))))))(K(K((S(KK))I)))))))(K(K(KI)))))))))((S(KK))I))))I))))(KI)))))I))))((S(KK))((S(K((SI)(K((S(KK))I)))))I))))))))((S(K(S(KK))))((S(K(S((S(K((S((S(KS))((S(KK))((S(KS))((S(K(SI)))((S(KK))I))))))(K((S(KK))I)))))((S(K((SI)(K((S(KK))I)))))I)))))((S((S(KS))((S((S(KS))((S(KK))I)))(K((S(K((SI)(K(KI)))))I)))))(K((S(K((SI)(K((S(KK))I)))))I)))))))))((S((S(KS))((S(K(S(KS))))((S(K(S(KK))))((S((S(KS))((S(KK))I)))(K((S(K((SI)(K(KI)))))I)))))))(K(KI))))))))I))(K(KI)))
```

It's very long and cryptic, but it turns out to be a valid Lazy K program! I've confirmed its correctness by fuzzing it with random inputs using this [Lazy K interpreter](https://github.com/irori/lazyk/), and it seems to work as expected.

## Conclusion

I hope you enjoyed this post, and if you have any questions or comments, feel free to reach out!
