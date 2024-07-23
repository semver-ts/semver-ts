# Formal Specification

TypeScript types should be treated with exactly the same (or even greater!) rigor as other elements of the JavaScript ecosystem, with the same level of commitment to stability, clear and accurate use of Semantic Versioning, testing, and clear policies about breaking changes.

TypeScript introduces two new concerns around breaking changes for packages which publish types.

1.  TypeScript does not adhere to the same norms around Semantic Versioning as the rest of the npm ecosystem, so it is important for package authors to understand when TypeScript versions may introduce breaking changes without any other change made to the package.

2.  The runtime behavior of the package is no longer the only source of potentially-breaking changes: types may be as well. In a well-typed package, runtime behavior and types should be well-aligned, but it is possible to introduce breaking changes to types without changing runtime behavior and vice versa.

Changes to the types of the public interface are subject to the same constraints as runtime code: *breaking the public published types entails a breaking change.* Not all changes to published types are *breaking*, however:

- Some changes will continue to allow user code to continue working without any issue.
- Some published types represent private API.

## Defining the contract

It is impossible to define the difference between breaking and non-breaking changes purely in the abstract. Instead, we must define exactly what changes are "backwards-compatible" and which are "breaking," and we must further define what constitutes a legitimate "bug fix" for type definitions designed to represent runtime behavior. Note that this is a *socio-technical* contract, not a purely-technical contract, and therefore (contra [Hyrum’s Law][hyrum]) a breaking change is not simply *any observable change to a system* but rather *a change to the system which violates the contract*.

[hyrum]: http://www.hyrumslaw.com

Accordingly, we propose careful and specific definitions of breaking, non-breaking, and bug-fix changes for TypeScript types. Because types are designed to represent runtime behavior, we assume throughout that these changes *do* in fact correctly represent changes to runtime behavior, and that changes which *incorrectly* represent runtime behavior are *bugs*.

**Note:** The examples supplied throughout via links to the TypeScript are illustrative rather than normative. However, the distinction between "observed" and "promised" behavior in TypeScript is quite loose: there is no independent specification, so the formal behavior of the type system is implementation-specified.

## Variance

Virtually all of the rules around what constitutes a breaking change to types come down to *variance*.[^variance] In a real sense, everything in the discussion below is a way of showing the variance rules by example.[^thanks-to-ryan]

In many cases, these are the standard variance rules applicable in any and all languages with types:

- read-only types (sources) may be covariant
- write-only types (sinks) may be contravariant
- read-write (mutable) types must be invariant

These basic intuitions underlie the guidelines below. However, several factors complicate them.

First of all, notice that the vast majority of objects in JavaScript are mutable, which means they must be *invariant*. When combined with type inference, this effectively means that *any* change to an object type *can* cause breakage for consumers. (The only real counter-examples are `readonly` types.)

Additionally, TypeScript has two other features many other languages do not which complicate reasoning about variance: *structural typing*, *higher-order type operations*. The result of these additional features is a further impossibility of safely writing types which can be *guaranteed* never to stop compiling for runtime-safe changes.

Accordingly, we propose the rules below, with the caveat that (as noted in several places throughout) they will *not* prevent all possible breakage—only the majority of it, and substantially the worst of it. Most of all, they give us a workable approach which can be well-tested and well-understood, and the edge cases identified here do not prevent the rules from being generally useful or applicable.[^satisficery]


For a more detailed explanation and analysis of the impact of variance on these rules, see [**Appendix C: Variance in TypeScript**](../appendices/c-variance-in-typescript.md).


## Notes

[^variance]: For the purposes of this discussion, I will *assume* knowledge of variance, rather than explaining it.

[^thanks-to-ryan]: Thanks to [Ryan Cavanaugh](https://github.com/RyanCavanaugh) of the TypeScript team for pointing out the various examples which motivated this discussion.

[^satisficery]: Precisely because SemVer is a *sociological* and not only a *technical* contract, the problem is tractable: We define a breaking change as above, and accept the reality that some changes are not preventable (but may in many cases be mitigated or fixed automatically). This is admittedly unsatisfying, but we believe it [satisfices](https://www.merriam-webster.com/dictionary/satisfice) our constraints.
