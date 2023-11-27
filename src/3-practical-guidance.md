# Practical Guidance

It is insufficient merely to be *aware* of breaking changes. It is also important to *mitigate* them, to minimize churn and breakage for package users!

<!-- toc -->

## Minimize breaking changes

### Avoiding user constructibility

For types where it is useful to publish an interface for end users, but where users should not construct the interface themselves, authors have a number of options (noting that this list is not exhaustive):

-   The type can simply be documented as non-user-constructible. This is the easiest, and allows an escape hatch for scenarios like testing, where users will recognize that if the public interface changes, they will necessarily need to update their test mocks to match. This can further be mitigated by providing a sanctioned test helper to construct test versions of the types.

-   Export a nominal-like version of the type, using `export type` with a class with a private field:

    <details>

    <summary>implementation of a nominal-like class in TS</summary>

    ```ts
    class Person {
      // 1.  The private brand means this cannot be constructed other than the
      //     class's own constructor, because other approaches cannot add the
      //     private field. Even if you write a class yourself with a matching
      //     private field, TS will treat them as distinct.
      // 2.  Using `declare` means this marker has no runtime over head: it will
      //     not be emitted by TypeScript or Babel.
      // 3.  Because the class itself is declared but not exported, the only way
      //     to construct it is using the function exported lower in the module.
      declare private __brand: void;

      name: string;
      age: number;

      constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
      }
    }

    // This exports only the *type* side of `Person`, not the *value* side, so
    // users can neither call `new Person(...)` nor subclass it. Per the note
    // above, they also cannot *implement* their own version of `Person`, since
    // they do not have the ability to add the private field.
    export type { Person };

    // This is the controlled way of building a person: users can only get a
    // `Person` by calling this function, even though they can *name* the type
    // by doing `import type { Person} from '...';`.
    export function buildPerson(name: string, age: number): Person {
      return new Person(name, age);
    }
    ```

    </details>

    This *cannot* be constructed outside the module. Note that it may be useful to provide corresponding test helpers for scenarios like this, since users cannot safely provide their own mocks.

-   Document that users can create their own local aliases for these types, while *not* exporting the types in a public way. This has one of the same upsides as the use of the classes with a private brand: the type is not constructible other than via the module. It also shares the upside of being able to create your own instance of it for test code. However, it has ergonomic downsides, requiring the use of the `ReturnType` utility class and requiring all consumers to generate that utility type for themselves.

-   Provide sanctioned mocks for testing purposes. Since these live alongside, and therefore can be tested with and kept in sync with the package they are mocks for, they can also be provided with the exact same versioning stability guarantees as the package code itself.

Each of these leaves this module in control of the construction of `Person`s, which allows more flexibility for evolving the API, since non-user-constructible types are subject to fewer breaking change constraints than user-constructible types. Whichever is chosen for a given type, authors should document it clearly.


### Updating types to maintain compatibility

Sometimes, it is possible when TypeScript makes a breaking change to update the types so they are backwards compatible, without impacting consumers at all. For example, [TypeScript 3.5][3.5-breakage] changed the default resolution of an otherwise-unspecified generic type from the empty object `{}` to `unknown`. This change was an improvement in the robustness of the type system, but it meant that any code which happened to rely on the previous behavior broke.

This example from [Google's writeup on the TS 3.5 changes][3.5-breakage] illustrates the point. Given this function:

```ts
function dontCarePromise() {
  return new Promise((resolve) => {
    resolve();
  });
}
```

In TypeScript versions before 3.5, the return type of this function was inferred to be `Promise<{}>`. From 3.5 forward, it became `Promise<unknown>`. If a user ever wrote down this type somewhere, like so:

```ts
const myPromise: Promise<{}> = dontCarePromise();
```

…then it broke on TS 3.5, with the compiler reporting an error ([playground][3.5-breakage-plaground]):

> Type 'Promise<unknown>' is not assignable to type 'Promise<{}>'.
>   Type 'unknown' is not assignable to type '{}'.

This change could be mitigated by supplying a default type argument equal to the original value ([playground][3.5-mitigation-playground]):

```ts
function dontCarePromise(): Promise<{}> {
  return new Promise((resolve) => {
    resolve();
  });
}
```

This is a totally-backwards compatible bugfix-style change, and should be released in a bugfix/point release. Users can then just upgrade to the bugfix release *before* upgrading their own TypeScript version—and will experience *zero* impact from the breaking TypeScript change.

Later, the default type argument `Promise<{}>` could be dropped and defaulted to the new value for a major release of the library when desired (per the policy [outlined below](#supported-compiler-versions), giving it the new semantics. (Also see [<b>Opt-in future types</b>](#opt-in-future-types) below for a means to allow users to *opt in* to these changes before the major version.)

[3.3-pre-breakage-playground]: https://www.typescriptlang.org/play/?ts=3.3.3&ssl=1&ssc=27&pln=1&pc=40#code/GYVwdgxgLglg9mABAEwVAwgQwE4FMAK2cAtjAM64AUAlIgN4CwAUIonlCNkmLgO6KES5KpTxk4AGwBuuWgF4AfPWatWYyTJoBuFYgC+1HUz3NmEBGSiJiAT0GkKALgFEHuADx09SuSjRY8e2FtIA
[3.5-breakage-plaground]: https://www.typescriptlang.org/play/?ts=3.5.1&ssl=1&ssc=27&pln=1&pc=40#code/GYVwdgxgLglg9mABAEwVAwgQwE4FMAK2cAtjAM64AUAlIgN4CwAUIonlCNkmLgO6KES5KpTxk4AGwBuuWgF4AfPWatWYyTJoBuFYgC+1HUz3NmEBGSiJiAT0GkKALgFEHuADx09SuSjRY8e2FtIA
[3.5-mitigation-playground]: https://www.typescriptlang.org/play/?ts=3.5.1#code/GYVwdgxgLglg9mABAEwVAwgQwE4FMAK2cAtjAM64AUAlAFyKEnm4A8A3gL4B8ibAsAChEiPFBDYkYXAHcGRUhUqU8ZOABsAbrmqIAvD35DhI3Ks1VqAbkHCOVwR0GCICMlETEAnowW56P5nZuPRQ0LDwAxSsgA


### "Downleveling" types

When a new version of TypeScript includes a backwards-incompatible change to *emitted type definitions*, as they did in [3.7][3.7-emit-change], the strategy of changing the types directly may not work. However, it is still possible to provide backwards-compatible types, using the combination of [downlevel-dts] and [typesVersions]. (In some cases, this may also require some manual tweaking of types, but this should be rare for most packages.)

- The [`downlevel-dts`][downlevel-dts] tool allows you to take a `.d.ts` file which is not valid for an earlier version of TypeScript (e.g. the changes to class field emit mentioned in [**Formal Specification: Breaking Changes**](./formal-spec/2-breaking-changes.md)), and emit a version which *is* compatible with that version. It supports targeting all TypeScript versions later than 3.4.

- TypeScript supports using the [`typesVersions`][typesVersions] key in a `package.json` file to specify a specific set of type definitions (which may consist of one or more `.d.ts` files) which correspond to a specific TypeScript version.

[downlevel-dts]: https://github.com/sandersn/downlevel-dts
[typesVersions]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html#version-selection-with-typesversions

The recommended flow would be as follows:

1.  Add `downlevel-dts`, `npm-run-all`, and `rimraf`  to your dev dependencies:

    ```sh
    npm install --save-dev downlevel-dts npm-run-all rimraf
    ```

    or

    ```sh
    yarn add --dev downlevel-dts npm-run-all rimraf
    ```

2.  Create a script to downlevel the types to all supported TypeScript versions:

    ```sh
    # scripts/downlevel.sh
    npm run downlevel-dts . --to 3.7 ts3.7
    npm run downlevel-dts . --to 3.8 ts3.8
    npm run downlevel-dts . --to 3.9 ts3.9
    npm run downlevel-dts . --to 4.0 ts4.0
    ```

3.  Update the `scripts` key in `package.json`  to generate downleveled types generated by running `downlevel-dts` on the output from `tsc`, and to clean up the results after publication. For example, using `ember-cli-typescript`’s tooling:

    ```diff
    {
      "scripts": {
    -   "prepublishOnly": "ember ts:precompile",
    +   "prepublish:types": "ember ts:precompile",
    +   "prepublish:downlevel": "./scripts/downlevel.sh",
    +   "prepublishOnly": "run-s prepublish:types prepublish:downlevel",
    -   "postpublish": "ember ts:clean",
    +   "clean:ts": "ember ts:clean",
    +   "clean:downlevel": "rimraf ./ts3.7 ./ts3.8 ./ts3.9 ./ts4.0",
    +   "clean": "npm-run-all --aggregate-output --parallel clean:*",
    +   "postpublish": "npm run clean",
      }
    }
    ```

4.  Add a `typesVersions` key to `package.json`, with the following contents:

    ```json
    {
      "types": "index.d.ts",
      "typesVersions": {
        "3.7": { "*": ["ts3.7/*"] },
        "3.8": { "*": ["ts3.8/*"] },
        "3.9": { "*": ["ts3.9/*"] },
        "4.0": { "*": ["ts4.0/*"] },
      }
    }
    ```

    This will tell TypeScript how to use the types generated by this process. Note that we explicitly include the `types` key so TypeScript will fall back to the defaults for 3.9 and higher.

5.  If using the `files` key in `package.json` to specify files to include (unusual but not impossible for TypeScript-authored packages), add each of the output directories (`ts3.7`, `ts3.8`, `ts3.9`, `ts4.0`) to the list of entries.

Now consumers using older versions of TypeScript will be buffered from the breaking changes in type definition emit.

If the community adopts this practice broadly we will want to invest in tooling to automate support for managing dependencies, downleveling, and type tests. However, the core constraints of this RFC do not depend on such tooling existing, and the exact requirements of those tools will emerge organically as the community begins implementing this RFC's recommendations.


### Opt-in future types

In the case of significant breaking changes to *only* the types—whether because the package author wants to make a change, or because of TypeScript version changes—packages may supply *future* types, which users may opt into *before* the library ships a breaking change. (We expect this use case will be rare, but important.)

In this case, package authors will need to *hand-author* the types for the future version of the types, and supply them at a specific location which users can then import directly in their `types/my-app.d.ts` file—which will override the normal types location, while not requiring the user to modify the `paths` key in their `tsconfig.json`.

This approach is a variant on [**Updating types to maintain compatibility**](#updating-types-to-maintain-compatibility). Using that same example, a package author who wanted to provide opt-in future types instead (or in addition) would follow this procedure:

1.  Backwards-compatibly *fix* the types by explicitly setting the return type on `dontCarePromise`, just as discussed above:

    ```diff
    - function dontCarePromise() {
    + function dontCarePromise(): Promise<{}> {
    ```

2.  Create a new directory, named something like `ts3.5`.

3.  Generate the type definition files for the package by running `ember ts:precompile`.

4.  Manually move the generated type definition files into `ts3.5`.

5.  In the `ts3.5` directory, either *remove* or *change* the explicit return type, so that the default from TypeScript 3.5 is restored:

    ```diff
    - function dontCarePromise(): Promise<{}> {
    + function dontCarePromise(): Promise<unknown> {
    ```

6.  Wrap each module file in the generated definition with a `declare module` specifying the *canonical* module name. For example, if our `dontCarePromise` definition were from a module at `my-library/sub-package`, we would have the following structure:

    ```
    my-library/
      ts3.5/
        index.d.ts
        sub-package.d.ts
    ```

    —and the contents of `sub-package.d.ts` would be:

    ```ts
    declare module 'my-library/sub-package' {
      export function dontCarePromise(): Promise<unknown>;
    }
    ```

7.  Explicitly include each such sub-module in the import graph available from `ts3.5/index.d.ts`—either via direct import in that file or via imports in the other modules. (Note that these imports can simply be of the form `import 'some-module';`, rather than importing specific types or values from the modules.)

7.  Commit the `ts3.5` directory, since it now needs to be maintained manually until a breaking change of the library is released which opts into the new behavior.

8.  Cut a release which includes the new fixes. With that release:

    -   Inform users about the incoming breaking change.

    -   Tell users to add `import 'fancy-package/ts3.5';` to the entry point of their package or a similar location. For example, in Ember, users would add the import to the top of their `types/my-app.d.ts` or `types/my-package.d.ts` file (which are generated by `ember-cli-typescript`).

9.  At a later point, cut a breaking change which opts into the TypeScript 3.5 behavior.

    -   Remove the `ts3.5` directory from the repository.

    -   Note in the release notes that users who did not previously opt into the changes will need to do so now.

    -   Note in the release notes that users who *did* previously opt into the changes should remove the `import 'fancy-package/ts3.5';` import from `types/my-app.d.ts` or `types/my-package.d.ts`.

### Matching exports to public API

Another optional tool for managing public API is [API Extractor][api-extractor]. Authors can mark their exports as `@public`, `@protected`, `@private`, `@alpha`, `@beta`, etc. and use the tool to generate type definitions accordingly. For example, for mitigating a future TypeScript version change, or experimenting on a new API, authors can use `@alpha` or `@beta` and use `typesVersions` to publish to a dedicated directory. Similarly, authors can make an export public for use through the package or even a set of related packages in a moinorepo, but mark it as `@private` and use API Extractor to generate types which exclude it when publishing to npm.

[api-extractor]: https://api-extractor.com


## Reasons to Make a Breaking Change

Each of the kinds of breaking changes defined below will trigger a compiler error for consumers, surfacing the error. As such, they should be easily detectable by testing infrastructure (see below under [**Detect breaking changes in types**](#detect-breaking-changes-in-types)).

There are several reasons why breaking changes may occur:

1.  The author of the package may choose to change the API for whatever reason. This is no different than the situation today for packages which do not support TypeScript. This would be a major version independent of types.

2.  The author of the package may need to make changes to adapt to changes in the JavaScript ecosystem, for example to support Octane idioms in Ember.js. This is likewise identical with the situation for packages which do not support TypeScript: it would require a major version regardless.

3.  Adopting a new version of TypeScript may change the meaning of existing types. For example, in TypeScript 3.5, generic types without a specified default type changed their default value from `{}` to `unknown`. This improved type safety, but broke many existing types, as [described in detail by Google][3.5-breakage].

4.  Adopting a new version of TypeScript may change the type definitions emitted in `.d.ts` files in backwards-incompatible ways. For example, changing to use the finalized ECMAScript spec for class fields meant that [types emitted by TypeScript 3.7 were incompatible with TypeScript 3.5 and earlier][3.7-emit-change].

[3.5-breakage]: https://github.com/microsoft/TypeScript/issues/33272
[3.7-emit-change]: https://github.com/microsoft/TypeScript/pull/33470

The kinds of breaking changes represented by reasons (1) and (2) are described in more detail in [**Formal Specification: Breaking Changes**](./formal-spec/2-breaking-changes.md); reasons (3) and (4) are discussed in [**Formal Specification: Compiler Considerations**](./formal-spec/5-compiler-considerations.md).

Additionally, there are some changes which we define *not* to be breaking changes because, while they will cause the compiler to produce a type error, they will do so in a way which simply allows the removal of now-defunct code.
