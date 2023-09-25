# Compiler considerations

To reiterate, Semantic Versioning is a matter of adherence to a *specified contract*—not a set of “gotchas”. This is particularly important when dealing with transitive or peer dependencies, especially at the level of ecosystem dependencies—including Node versions, browsers, compilers, and frameworks (such as Svelte, Vue, Ember, React, etc.). Accordingly, the specification of breaking changes as described below is further defined in terms of the TypeScript compiler support version adopted by any given package as well as specific settings.

<!-- toc -->

## Supported compiler versions

Conforming packages must adopt and clearly specify one of two support policies: *simple majors* or *rolling support windows*.


### Simple majors

In “simple majors” pattern, dropping a previously-supported TypeScript version constitutes a breaking change, because it has the same kind of impact on users of the package as dropping support for a previously-supported version of Node: they must upgrade a *different* dependency to guarantee their code continues to work. Thus, whenever dropping a previously-supported TypeScript release, packages using “simple majors” should publish a new major version.

However, bug fix/patch releases to TypeScript (as described above under [Bug fixes](#bug-fixes)) qualify for bug fix releases for packages using the “simple majors” policy. For example, if a package initially publishes support for TypeScript 4.5.0, but a critical bug is discovered and fixed in 4.5.1, the package may drop support for 4.5.0 without a major release. Dropping support for a bad version does not require publishing a new release, only documenting the change.

In this case, packages should generally couple dropping support for previously-supported TypeScript versions with dropping support for other ecosystem-level dependencies, such as previously-supported Node.js LTS versions, Ember LTS releases, React major versions, etc. (This is not a requirement for conformance, but makes for a generally healthier ecosystem.)

This pattern is recommended for “normal” packages, where major versions do not themselves have ecosystem-wide implications. For example, a package like [True Myth][true-myth] (maintained by the primary author of this specification) is small and not presently foundational to any broader ecosystem. It is safely using the “simple majors” approach today for both Node and TypeScript versions.

[true-myth]: https://true-myth.js.org


### Rolling support windows

The “rolling support windows” policy decouples compiler version support from major breaking changes, by specifying a rolling window of supported versions. For example, Ember and Ember CLI [specify][ember-cli-node] that any change landing on `master` must work on the [Current, Active LTS, and Maintenance LTS Node versions][node-versions] at the time the change lands, and that when the Node Working Group drops support for an LTS, Ember and Ember CLI do so as well *without a breaking change*. Similarly, [Redux] has maintained support over a long time horizon while informally dropping support for Node versions (and TypeScript versions!) and documenting in their releases. This allows the CLI to use new Node features as part of its public API over time, rather than being fixed at the set of features available at the time of the latest release of the library.

[ember-cli-node]: https://github.com/ember-cli/ember-cli/blob/master/docs/node-support.md
[node-versions]: https://nodejs.org/en/about/releases/
[Redux]: https://redux.js.org

Following this pattern, core ecosystem components (hypothetically including examples such `ember-source`, `react`, `@vue/cli`, etc.) could adopt a similar policy for supported TypeScript compiler versions, allowing the component to adopt new TypeScript features which impact the published types (e.g. in type emit, type system features such as conditional types, etc.) rather than being coupled to the features available at the time of release. Conforming projects which adopt this may choose any rolling support window they choose, except that if they have an LTS release schedule, upgrading to a new LTS shall not require upgrading to a new version of TypeScript.

Bug fix/patch releases to TypeScript (as described above under [Bug fixes](#bug-fixes)) qualify for bug fix releases for packages using the “rolling support windows” policy. For example, if a package initially publishes support for TypeScript 4.5.0, but a critical bug is discovered and fixed in 4.5.1, the package may drop support for 4.5.0 without a major release. Dropping support for a bad version does not require publishing a new release, only documenting the change.


## Strictness

Type-checking in TypeScript behaves differently under different “strictness” settings, and the compiler adds more strictness settings over time. Changes to types which are not breaking under looser compiler settings may be breaking under stricter compiler settings.

For example: a package with `strictNullChecks: false` could make a function return type nullable without the compiler reporting it within the package or the package’s type tests. However, as described above, this is a breaking change for consumers which have `strictNullChecks: true`. (By contrast, a *consumer* may disable strictness settings safely: code which type-checks under a stricter setting also type-checks under a less strict setting.) Likewise:

- With `noUncheckedIndexedAccess: false`, an author could change a type `SomeObj` from `{ a: string }` to `{ [key: string]: string }` and accessing `someObj.a.length` would now error.
- With `exactOptionalPropertyTypes: false` the difference between `{}` and `{ foo: undefined }` would go unchecked at runtime, although this can have significant effects on runtime type checks, since `hasOwn`, `hasOwnProperty`, and the `in` operator will treat the two differently.

Accordingly, conforming packages must use `strict: true`, `noUncheckedIndexAccess: true`, and `exactOptionalPropertyTypes: true` in their compiler settings.
Moreover, libraries must always fully specify full optionality on properties, e.g. `{ foo?: string | undefined }`, rather than `{ foo?: string }` or `{ foo: string | undefined }`.
This guarantees the library must handle all the possibly-`undefined` variants.

Additionally, communities may define further strictness settings to which they commit to conform which include “pedantic” strictness settings like `noPropertyAccessFromIndexSignature`. For example, a given community might commit to a set of *additional* strictness flags it supports for its own types for any LTS release, published in Ember’s own TypeScript documentation.

**Note:** While the TypeScript compiler may include new strictness flags under `strict: true` in any release, this is simply a special case of TypeScript’s policy on breaking changes.


## Module interop

The two flags `esModuleInterop` and `allowSyntheticDefaultImports` smooth the interoperation between ES Modules and CommonJS, AMD, and UMD modules for *emit* from TypeScript and *type resolution* by TypeScript respectively. The options are viral: enabling them in a package requires all downstream consumers to enable them as well (even if this is not desirable for whatever reasons). The reasons for this are details of how CommonJS and ES Modules interoperate for bundlers (Webpack, Parcel, etc.), and are beyond the scope of this document.

Here, it is enough to note that changing from `esModuleInterop: true` to `esModuleInterop: false` on a package which emits *is a breaking change*:

-   with `esModuleInterop: true`: [playground][emi-true]
-   with `esModuleInterop: false`: [playground][emi-false]

[emi-true]: https://www.typescriptlang.org/play?target=7#code/CYUwxgNghgTiAEBbA9sArhBByAzsxIAtGgA44AucUihEAlgEYywCeW8A3gLABQ8-8MMgB2FeADNkyAFzwAFAEp4AXgB88CjDrCA5gG5eA+CAAeJZDHIqJUgzwC+vXqEiwEKdJnhZELWo2YYNk5DATpEc0sbZAkYfG88AmIyShBqfyZWLDtQ-lNIqyFRK18AFQALbR1Zbj4jAUkZeHIWEhBkcWi7eoEGWFlFFXVhNEQGEBhugUcHIA
[emi-false]: https://www.typescriptlang.org/play?esModuleInterop=false&target=7#code/CYUwxgNghgTiAEBbA9sArhBByAzsxIAtGgA44AucUihEAlgEYywCeW8A3gLABQ8-8MMgB2FeADNkyAFzwAFAEp4AXgB88CjDrCA5gG5eA+CAAeJZDHIqJUgzwC+vXqEiwEKdJnhZELWo2YYNk5DATpEc0sbZAkYfG88AmIyShBqfyZWLDtQ-lNIqyFRK18AFQALbR1Zbj4jAUkZeHIWEhBkcWi7eoEGWFlFFXVhNEQGEBhugUcHIA

Accordingly, library authors should set both `allowSyntheticDefaultImports` and `esModuleInterop` to `false`. This allows consumers to opt into these semantics, but does not *require* them to do so. Consumers can always safely use alternative import syntaxes (including falling back to `require()` and `import()`), or can enable these flags and opt into this behavior themselves.

(If the Node ecosystem migrates fully to ES modules over the next few years, this problem will be substantially mitigated.)

