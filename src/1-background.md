# TypeScript’s Versioning Policy

TypeScript ***does not*** adhere to Semantic Versioning, but since it participates in the npm ecosystem, it uses the same format for its version numbers: `<major>.<minor>.<patch>`.

In Semantic Versioning, `<major>` would be a breaking change release, `<minor>` would be a backwards-compatible feature-addition release, and `<patch>` would be a "bug fix" release.

In TypeScript, both `<major>` and `<minor>` releases *may* introduce breaking changes of the sort that Semantic Versioning reserves for the `<major>` slot in the version number. Not all `<minor>` *or* `<major>` releases *do* introduce breaking changes in the normal Semantic Versioning sense, but either *may*. Accordingly, and for simplicity, the JavaScript ecosystem should treat *all* TypeScript `<major>.<minor>` releases as a major release.

TypeScript's use of patch releases is more in line with the rest of the ecosystem's use of patch versions. The TypeScript Wiki [currently summarizes patch releases][ts-patch-releases] as follows:

> Patch releases are periodically pushed out for any of the following:
>
> - High-priority regression fixes
> - Performance regression fixes
> - Safe fixes to the language service/editing experience
>
> These fixes are typically weighed against the cost (how hard it would be for the team to retroactively apply/release a change), the risk (how much code is changed, how understandable is the fix), as well as how feasible it would be to wait for the next version.

These three categories of fixes are well within the normally-understood range of fixes that belong in a "bug fix" release in the npm ecosystem. In these cases, a user's code may stop type-checking, but *only* if they were depending on buggy behavior. This matches users' expectations around runtime code: a SemVer patch release to a package which fixes a bug may cause packages which were depending on that bug to stop working.

By example:

-   `4.8.3` to `4.8.4`: always considered a bug fix
-   `4.8.3` to `4.9.0`: *may or may not* introduce breaking changes; equivalent to a major in the rest of the ecosystem
-   `4.9.0` to `5.0.0`: *may or may not* introduce breaking changes; equivalent to a major in the rest of the ecosystem

[ts-patch-releases]: https://github.com/microsoft/TypeScript/wiki/TypeScript's-Release-Process/e669ab1ad96edc1a7bcef5f6d9e35e24397891e5
