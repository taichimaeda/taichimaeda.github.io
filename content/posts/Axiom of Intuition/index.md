+++
date = '2025-07-04T01:18:18+02:00'
title = 'Axiom of Intuition'
tags = ['set theory', 'axiom of choice', 'well-ordering theorem', "zorn's lemma", "diaconescu's theorem"]
draft = true
comment = true
featured = false
weight = 1
+++

## Introduction

Axiom of Choice, Well-Ordering Theorem, and Zorn's Lemma. I know this topic is a bit of a cliche, but as someone who is mildly interested in set theory, I just couldn't resist writing about it...

> The Axiom of Choice is obviously true; the Well Ordering Principle is obviously false; and who can tell about Zorn's Lemma?
>
> -- Jerry Bona

<!-- From Reddit: -->
<!-- https://www.reddit.com/r/mathmemes/comments/jc4fzl/the_axiom_of_choice_is_obviously_true_the/ -->

{{< figure src="./meme.jpg" class="w-sm mx-auto" >}}

<!-- From the proof wiki: -->
<!-- https://proofwiki.org/wiki/ProofWiki:Jokes -->

## Axiom of Choice

You might be wondering what's the point of this axiom, like surely you can just pick an element from each subset, right?

Well, things are not that simple in axiomatic set theory.

## Well-Ordering Theorem

## Zorn's Lemma

## Proof Sketches

Let's (informally) prove the equivalence of these three statements.

### Axiom of Choice implies Well-Ordering Theorem

### Well-Ordering Theorem implies Zorn's Lemma

### Zorn's Lemma implies Axiom of Choice

## Diaconescu's theorem

Let's prove some interesting results that follow from the Axiom of Choice.

Typical examples include the every vector space has a basis, every graph has a spanning tree, or we can prove more exotic results like the Banach-Tarski paradox.

But if you're into proof assistants like me, you might be interested in Diaconescu's theorem, which shows that the Axiom of Choice implies the law of excluded middle --- meaning that the Axiom of Choice is incompatible with constructive logic!

The proof is very simple, but you must be particularly careful with the individual steps, as we are working in axiomatic (constructive) set theory.

For those interested, you can find the axioms of constructive ZF here:
<!-- https://plato.stanford.edu/entries/set-theory-constructive/axioms-CZF-IZF.html -->

<!-- https://en.wikipedia.org/wiki/Diaconescu%27s_theorem -->
<!-- https://proofwiki.org/wiki/Diaconescu-Goodman-Myhill_Theorem -->

<!-- TODO: -->
- The idea of the proof is that the domain, range and thus the definition of the choice function depends on the truth of P.
- Once we obtain the choice function, we can compare the return values f(U) and f(V) to determine if P is true or false.
- Therefore this makes it possible to know the truth of P without establishing a witness for it.
- Or put more informally, the choice function converts the potentially undecidable proposition P into f(U) = f(V), which is decidable because the range of f is a finite set {0, 1}.
- Disjunctive syllogism and contraposition hold in intuitionistic logic.

<!-- The situation is different when the principle is formulated in Martin-Löf type theory. There and higher-order Heyting arithmetic, the appropriate statement of the axiom of choice is (depending on approach) included as an axiom or provable as a theorem.[12] A cause for this difference is that the axiom of choice in type theory does not have the extensionality properties that the axiom of choice in constructive set theory does.[13] The type theoretical context is discussed further below. -->
<!-- https://academic.oup.com/comjnl/article-abstract/49/3/345/564624?redirectedFrom=fulltext -->


## Conclusion


