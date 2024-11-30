# Introduction

This document defines a specification of [Semantic Versioning][semver] for managing changes to TypeScript types, including when the TypeScript compiler makes breaking changes in its type-checking and type emit across a “minor” release.

[semver]: https://semver.org

Informally, the big idea is the *no new “red squiggles” rule*:

> If you are using a library which follows the policy outlined in this specification, you should not normally get new TypeScript type errors (“red squiggles” in your editor) when upgrading the library to a new minor version.

Although this an easy-enough intuition to *describe*, implementing it correctly is tricky: thus this specification.

## Status

- Version 1.0.0-beta.4
- Last updated on July 24, 2024

## Contents

<!-- toc -->


## Reading this spec

There are three levels of detail in this spec, broken out so you can get as much detail as you like—or just get the gist!

1. **This very page** covers all the big ideas. If you are an app author, this is probably enough info to get the big idea.

2. The **Background and Basics** section dives a bit deeper. For many library authors, this section will give you enough detail to get by.

3. The **Formal Specification** section goes into every bit of nitty-gritty detail. If you are maintaining a core piece of JavaScript infrastructure like a framework or a high-usage library, you should take the time to actually work through this.

For the really brave and nerdy, **Appendix C** gets into the most arcane bits of how TypeScript and SemVer interact!


## Why?

For TypeScript packages be good citizens of the broader, semantically-versioned JavaScript ecosystem, package authors need a useful definition of SemVer for TypeScript’s type system.

This is somewhat more complicated than in other languages, even those other statically-typed languages with language-level SemVer guarantees (such as [Rust][rust-semver] and Elm), because TypeScript has an unusually flexible type system. In particular, its [structural type system][structural] means many more kinds of both breaking and non-breaking changes are possible than in languages with a [nominal type system][nominal].[^other-structural-types] Accordingly, this document proposes a definition of SemVer which accounts for the extra flexibility afforded by these features.

[rust-semver]: https://rust-lang.github.io/rfcs/1122-language-semver.html
[structural]: https://en.wikipedia.org/wiki/Structural_type_system
[nominal]: https://en.wikipedia.org/wiki/Nominal_type_system

Furthermore, unlike the rest of the JavaScript ecosystem, the TypeScript compiler explicitly *rejects* SemVer. TypeScript's core team argues that *every* change to a compiler is a breaking change, and that SemVer is therefore meaningless for TypeScript. We do not agree with this characterization, but take the TypeScript team's position as a given for the purposes of this document. Accordingly, every TypeScript non-patch release may be a breaking change, and "major" numbers for releases signify nothing beyond having reached `x.9` in the previous cycle.

This means that defining SemVer for TypeScript Types requires that we specify a definition of Semantic Versioning which can absorb breaking changes in the TypeScript compiler as well as intentional changes by package authors. As such, it also requires clearly defined TypeScript compiler version support policies.

## Summary

This section is a non-normative short summary for easy digestion. See the [Formal Specification](./formal-spec/index.md) for normative text.

### For package consumers

Things a package may do in a non-breaking way:

- widen what it accepts from you
- narrow what it provides to you
- add new exports

Things which constitute breaking changes in a package:

- narrowing what it accepts from you
- widening what it provides to you
- removing exports

Note that this summary elides *many* important details, and those details may surprise you! In particular "what it accepts" and "what it provides" have considerable depth and nuance: they include interfaces or types you can construct, function arguments, class field mutability, and more.

### For package authors

-   Public published types are part of the SemVer contract of a package, and must be versioned accordingly, per the specification above.

-   Adding a new TypeScript version to the support matrix *may* cause breaking changes. When it does not, adding it is a normal minor release. When it *does* cause a breaking change, the package must either mitigate that breakage (so consumers are not broken) *or* the package must release a major version.

-   Removing a TypeScript version from the support matrix is a breaking change, except when it falls out of the supported version range under the “rolling support windows” policy.

-   There are two recommended support policies for TypeScript compiler versions: *simple majors* and *rolling window*.

    -   In *simple majors*, dropping support for a previously supported compiler version requires a breaking change.

    -   In *rolling window*, a package may declare a range of supported versions which moves over time, similar to supporting evergreen browsers.

        Packages using the “rolling window” policy should normally support all TypeScript versions released during the current ‘LTS’ of other core packages/runtimes/etc. they support, and drop support for them only when they drop support for that ‘LTS’, to minimize the number of major versions in the ecosystem.

-   Both the currently-supported compiler versions and the compiler version support policy must be documented.

-   Packages must be authored with the following compiler options:
    -   `strict: true`
    -   `noUncheckedIndexedAccess: true`
    -   `exactOptionalPropertyTypes: true`

-   Libraries should generally be authored with the following compiler options:
    -   `esModuleInterop: false`
    -   `allowSyntheticDefaultImports: false`



## Notes

[^other-structural-types]: Many languages include structural typing in certain contexts, including Swift's protocols, Elm's record types, and row-polymorphic types in OCaml, PureScript, etc. However, of these only Elm provides language-level guidance or tooling, and at the time of authoring there is no public specification of its behavior. Its current algorithm is [implementations-specified][elm-compat] and roughly checks for addition or removal of fields.

[elm-compat]: https://github.com/elm/compiler/blob/770071accf791e8171440709effe71e78a9ab37c/builder/src/Deps/Diff.hs#L128-L136
