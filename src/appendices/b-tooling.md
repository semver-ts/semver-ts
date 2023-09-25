# Appendix B: Tooling

To successfully adopt this RFC’s recommendations, package authors need to be able to *detect* breaking changes (whether from their own changes or from TypeScript itself) and to *mitigate* them. Package *consumers* need to know the support policy for the library.

<!-- toc -->

## Documenting supported versions and policy

In line with ecosystem norms, badges linking to CI status

- An example supported versions badge (which could link to CI config):

    ![supported TypeScript versions: 4.1, 4.2 and next](https://img.shields.io/badge/TS%20Versions-4.1%20%7C%204.2%20%7C%20next-blue)

- Example support policy badges (which could link to the published recommendation from this RFC):

    ![TypeScript support policy](https://img.shields.io/badge/TS%20Support-Rolling%20Window-purple) ![TypeScript support policy](https://img.shields.io/badge/TS%20Support-Simple%20Majors-purple)


## Detect breaking changes in types

As with runtime code, it is essential to prevent unintentional changes to the API of types supplied by a package. We can accomplish this using *type tests*: tests which assert that the types exposed by the public API of the package are stable.

Package authors publishing types can use whatever tools they find easiest to use and integrate, within the constraint that the tools must be capable of catching all the kinds of breaking changes outlined above. Additionally, they must be able to run against multiple supported versions of TypeScript, so that users can detect and account for breaking changes in TypeScript.

The current options include:

-   [`dtslint`][dtslint]—used to support the DefinitelyTyped ecosystem, so it is well-tested and fairly robust. It uses the TypeScript compiler API directly, and is maintained by the TypeScript team directly. Accordingly, it is very unlikely to stop working against the versions of TypeScript it supports. However, there are several significant downsides as well:

    -   The tool checks against string representations of types, which makes it relatively fragile: it can be disturbed by changes to the representation of a type, even when those changes would not impact type-checking.

    -   **BLOCKER:** As its name suggests, it is currently powered by [tslint][tslint], which is deprecated in favor of [eslint][eslint]. While there is [initial interest][eslint-migration] in migrating to eslint, there is no active effort to accomplish this task.

    -   The developer experience of authoring assertions with dtslint is poor, with no editor-powered feedback or indication of whether you've actually written the test correctly at all. For example, if a user types `ExpectType` instead of `$ExpectType`, the assertion will simply be silently ignored.

- [`tsd`][tsd]—a full solution for testing types by writing `.test-d.ts` files with a small family of assertions and using the `tsd` command to validate all `.test-d.ts` files. Authoring has robust editor integration, since the type assertions are normal TS imports, and the type assertions are specific enough to catch all the kinds of breakage identified above. It is implemented using the TS compiler version directly, which makes its assertions fairly robust. Risks and downsides:

    -   The tool uses a patched version of the TypeScript compiler, which increases the risk of errors and the risk that at some points it will simply be unable to support a new version of TypeScript.

    -   Because the assertions are implemented as type definitions, the library is subject to the same risk of compiler breakage as the types it is testing.

    -   **BLOCKER:**  currently only supports a single version of TypeScript at a time. While the author is [interested][tsd-versions] in supporting multiple versions, it is not currently possible.

- [`expect-type`][expect-type]—a library with a variety of type assertions, inspired by Jest's matchers but tailored to types and with no runtime implementation. Like `tsd`, it is implemented as a series of function types which can be imported, and accordingly it has excellent editor integration. However, unlike `tsd`, it does *not* use the compiler API. Instead,  It is robust enough to catch all the varieties of breaking type changes. The risks with expect-type are:

    -   It currently has a single maintainer, although it has seen significant uptake since being adopted as part of [Vitest][vitest].

    -   It is relatively young. While its track record is good so far, there is not yet evidence of how it would deal with serious breaking changes like those introduced in TypeScript 3.5.

    -   Because the assertions are implemented as type definitions, the library is subject to the same risk of compiler breakage as the types it is testing.

[vitest]: https://vitest.dev

`expect-type` seems to be the best option, and a number of libraries in the TS community are already using `expect-type` successfully (see [**Appendix A**](./a-adopters.md) above). However, for the purposes of *this* RFC, we do not make a specific recommendation about which library to use; if another equally useful tool appears, authors should feel free to use it. We do, however, recommend *against* using `dtslint` or `tsd`. Beyond that, the tradeoffs above are offered to help authors make an informed choice in this space.

Users should add one of these libraries and generate a set of tests corresponding to their public API. These tests should be written in such a way as to test the imported API as consumers will consume the library. For example, type tests should not import using relative paths, but using the absolute paths at which the types should resolve, just as consumers would.

These type tests should be specific and precise. It is important, for example, to guarantee that an API element never *accidentally* becomes `any`, thereby making many things allowable which should not be in the case of function arguments, and "infecting" the caller's code by eliminating type safety on the result in the case of function return values. For example, the `expect-type` library's `.toEqualTypeOf` assertion is robust against precisely this scenario; package authors are also encouraged to use its `.not` modifier and `.toBeAny()` method where appropriate to prevent this failure mode.

To be safe, these tests should be placed in a directory which does not emit runtime code—either colocated with the library's runtime tests, or in a dedicated `type-tests` directory. Additionally, type tests should *never* export any code.

[dtslint]: https://github.com/microsoft/dtslint
[tslint]: https://github.com/palantir/tslint
[eslint]: https://github.com/eslint/eslint
[eslint-migration]: https://github.com/microsoft/dtslint/issues/300
[tsd]: https://github.com/SamVerschueren/tsd
[tsd-versions]: https://github.com/SamVerschueren/tsd/issues/47
[expect-type]: https://github.com/mmkal/ts/tree/master/packages/expect-type#readme

In addition to *writing* these tests, package authors should make sure to run the tests (as appropriate to the testing tool chosen) in their continuous integration configuration, so that any changes made to the library are validated to make sure the API has not been changed accidentally.

Further, just as packages are encouraged to test against a matrix of peer dependencies versions, they should do likewise with TypeScript. For example:

- Ember packages regularly test against Ember’s current stable release, the currently active Ember LTS release, and the canary and beta releases.
- React libraries regularly test against both the current major, any upcoming major, and sometimes a previous major.
- Node libraries regularly test against all active Node LTS releases and the current stable release.

Along the same lines, TypeScript packages should follow should test the types against all versions of TypeScript supported by the package (see the [suggested policy for version support](#supported-compiler-versions) below) as well as the upcoming version (the `next` tag for the `typescript` package on npm).

These type tests can run as normal CI jobs.
