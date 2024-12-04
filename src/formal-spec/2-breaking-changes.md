# Breaking Changes

<!-- toc -->

## Symbols

Changing a symbol is a breaking change when:

-   changing the name of an exported symbol (type or value), since users' existing imports will need to be updated. This is breaking for value exports (`let`, `const`, `class`, `function`) independent of types, but renaming exported `interface`, `type` alias, or `namespace` declarations is breaking as well.

-   removing an exported symbol, since users' existing imports will stop working. This is a breaking change for value exports (`let`, `const`, `class`, `function`) independent of types, but removing exported `interface`, `type` alias, or `namespace` declarations is breaking as well.

    This includes changing a previously type-and-value export such as `export class` to either—

    -   a type-only export, since the exported value symbol has been removed:

        ```diff
        -export class Foo {
        +class Foo {
          neato: string;
        }
        +
        +export type { Foo };
        ```

    -   a value-only export, since the exported type symbol has been removed:

        ```diff
        -export class Foo {
        +class _Foo {
          neato: string;
        }
        +
        +export let Foo: typeof _Foo;
        ```

-   changing the kind (*value* vs. *type*) of an exported symbol in any way, since users' imports and own definitions may both be broken, since imports resolve all symbols imported together if they share a name:

    -   Given a *value*-only exported symbol, including `namespace` declarations, adding a *type* export with the same name as the *value* may break users' code: they may have imported the value and safely created a type of the same name. Their existing import will now cause a re-declaration conflict. Note that this is distinct from adding an entirely new type export where there was no type or value export previously, since the user could never accidentally introduce the conflict, and could work around the conflict using the `as` import specifier when introducing the import.

    -   Given a *type*-only exported symbol, including `type`, `interface`, or `export type` for a type or value, adding a *value* export with the same name may break users' code: they may have imported the type and safely created a value of the same name. Their existing import will now cause a re-declaration conflict. Note that this is distinct from adding an entirely new value export where there was no type or value export previously, since the user could never accidentally introduce the conflict, and could work around the conflict using the `as` import specifier when introducing the import. (Type-only imports via `import type` do not change this because they still import the symbol into value space to use with `typeof`, e.g. to get a class' constructor.)

    -   Given a `namespace` export, changing it to a value-only export (that is, to an exported object) will break all nested type access, since types cannot be exported as nested members of non-`namespace` values. (`namespace` exports cannot be directly converted to type-only exports.)

-   changing an `interface` to a `type` alias will break any user code which used interface merging

-   changing a `namespace` export to any other type will break any code which used namespace merging

-   changing a `class` export to a type-only export will break any code which extended the class or constructed an instance of the class ([playground][class-to-type-only]), and changing a `class` export to a value-only export will break any code which referred to the class as a type ([playground][class-to-value-only])

[class-to-type-only]: https://www.typescriptlang.org/play?#code/PTAEEEDtQIgewE4EsDmTIEMA2NQBMBTAYywwQwBck5IAaUAdwAsCEDQKXGm4t2SMAZ0GMhoAgA8ADogoE8AOgBQhAW1ADhoAOpCAotNnzQAbwC+SpSFAAVJkhEOOXAgEcArkgBu2ApAqgcABmoBgcAJ5SBAC0NFjh4oYIAcGhGqTC9MxIREyMcO5YeKCQiAC22PFWYABG7AzIFHLQWEgA1uycDgBc1aB9AAZDfZoiuoIGMsnG5n2SUwEUkewmOvpJcsUW1kMDSqOgAPoAcnAUk0bFs0tRoKfnG8YAvEf3F9N4ANyWBwDK7jVRgAxRDvTaJZp4MbrBYzCx-AHAxBvR7FSSQkQo2FXCwqYikdRBdyQIhUGgcDAdQTjMHyAAUDBhl26awmqIAlCyvHAkF88Wp2ESSWToBRKQRBFjLgymR8WVKPpzQNzed99jRBAFGWzsaAXpACAxWbS8HT2d8iBqAqUHrr9Ya7mcTWbPkA

[class-to-value-only]: https://www.typescriptlang.org/play?#code/PTAEEEDtQIgewE4EsDmTIEMA2NQBMBTAYywwQwBck5IAaUAdwAsCEDQKXGm4t2SMAZ0GMhoAgA8ADogoE8AOgBQhAW1ADhoAOpCAotNnzQAbwC+SpSFAAVJkhEOOXAgEcArkgBu2ApAqgcABmoBigPljuBAC0NFgAnuKGCAHBoRqkwgqgAHKIALbYCaDxcO6MZVh4VmAMyHLOTgxInKAABpIyKaB8FG2g5JyszhjQbaqk6r1typoiAPp5FAZdcnimFhNk7L25cMvJawBcHPFSBGmL+ytGeADclnOgAMruAEZzAGKINynGknJIHgRLpBL81hslE9Xh9MoJvggluD-hJAcC9gdVsZzJYtuogu5IEQqDQOBgANYEQSg5F4AAUDH0h3kJxpzLwAEoTl44Eh7ipiJN2ASiSToBQKVSkeyGUysXgTtL5Vzwrz+VCaIIAoywezQABeUCQAgMHRy250jkPIiagKQa56w3G01Ki1WoA


## Interfaces, Type Aliases, and Classes

Object types may be defined with interfaces, type aliases, or classes. Interfaces and type aliases define type symbols only. Classes define both type symbols and value symbols. The `namespace` construct defines a value symbol (as well as introducing a context in which you can name other nested type or value symbols). The additional constraints for the value symbols introduced by classes are covered above under [**Breaking Changes: Symbols**](#symbols).

A change to any object type (user constructible or not) is breaking when:

-   a non-`readonly` object property's type changes in any way:

    -   if it was previously `string` but now is `string | number`, some of the user's existing *reads* of the property will now be wrong ([playground][reads-of-property]). Note that this includes making a property optional.

    -   if it was previously `string | number` but now is `string`, some of the user's existing *writes* to the property will now be wrong ([playground][writes-to-property]). Note that this includes making a previously-optional property required.

        Note that at present, TypeScript cannot actually catch all variants of this error. [This playground][writes-to-property] demonstrates that there is a runtime error but no *type* error in one scenario. TypeScript's type system understands these types in terms of *assignability*, rather than local *mutability*. However, package authors should test for the catchable variant of this condition.

-   a property is removed from the type entirely, since some of the user's existing uses of the type will break, even if the property was optional ([optional][optional-removed], [required][required-removed])

A change to a user-constructible type is breaking when:

-   a required property is added to the type, since all of the user's existing constructions of the type will be incorrect ([new-required-property][required-added])

A change to a non-user-constructible object type is breaking when:

-   a `readonly` object property type becomes a *less specific ("wider") type*, for example if it was previously `string` but now is `string | string[]`—since the user's existing handling of the property will be wrong in some cases ([playground][wider-property]—the playground uses a class but an interface or type alias would have the same behavior).

    Note that this includes making a property optional, since these are equivalent for the purposes of type-checking:

    ```diff
    interface A {
    - a: string;
    + a?: string;
    }
    ```

    ```diff
    interface A {
    - a: string;
    + a: string | undefined;
    }
    ```

[reads-of-property]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgOrADYfQEwiZAbwFgAoZC5OALmQGcwpQBzAbjIF8yzRJZEUAEWA5c+ImUpVaDJiGbIAPshABXALYAjaO1JdSZGKpAIwwAPYEAFnBA4MEOuixiQACgBucDKoi1n2CL4AJS0alrQEuSUUBBgqlAEXj4QAHRwqQ7yYFa6+mR4CBhwscgOYMgA7piBeCD+Na66NnYOTo1B7tUuncG6BRBFJSjlyDgirrTCop3NtvaOAa5u4zN1fWRAA

[writes-to-property]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgOrADYYHJylAewHdkBvAWAChkbk4AuZAZzClAHNkAfZEAVwC2AI2gBuKgF8qVUJFiIUAEWAATXPmJkqtOo37Cxk6ZRh8QCMMAIhkRNpCYAVAuizrCRABQA3OBj4QjK44eB4AlFrUtL7+EAB0cMgAvMgA5AAWEFgEqeKUUpRUKhAIGHgoGBBgtpghGkRBte7EeXbADs7BzV5ETaHEYXlFJWVQFVXIKqrdjMpq-UR5U-P1CcnIAEQADgRgcGAEG6LIAPQnyPCYTFRtHS599Z7L3YOn50x8CEgQKkzI0IQQBACHwmBgAJ5UIA

[optional-removed]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgEIHU4GcDyAHMYAexDgBtkBvAWAChkHk4AuZAIyKLIjhAG46jdgH5WHLj350AvnTqhIsRClQAlCAFsiANwgATKoMYt2nbrwG1ZtOtzDISZAJ4BBVBBhEoEVhmz5CEnJkAF4qJlYwKABXFGlLO2RQBDJovX1Ud09vX0xcAmJSCjDKCOQo2IAadlZ4Miw4y1sIe0dXFxhFX3UtXQMSsorG5vtk1PS9VA6utB6dfVDwkyHqtlryBuR4oA

[required-removed]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgEIHU4GcBKECOArsFBACbIDeAsAFDIPJwBcyARgPYcA2EcIAbjqN2rTjz6C6AXzp1QkWIhSo8AWw4A3clWGMW7Lr35Das2nV5hkoBN0JlyqVBBgdSrDNjxESOgLxUTKxgUIQQADSiyPDcWCjSppYQ1rb2jmSoAIIwip7qWgFBBqHhUWyssfHIiUA

[required-added]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgEIRgeyig3gWAChkTk4AuZAI00wBsI4QBuIgXyKNElkRQEEYPZAWKkK1WgyasxJKpRABXALZVosjoSIg4KiAGcADnzQZsEAKpGAJnEgiipZAzDIEmEAbBQlCMMCelOhYOMgAvCJklD5KKGyanIS6+samgjzWdg6izq7unt6+-oEglBnQEVESsfGJhEA

[wider-property]: https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEkoGdnwPIwJYHMsDsoJ4BvAKHnjimAHt8IBPeABxlpZBgBdGAueMm7Z8OANxkAvmTKgkcRNFTwA6llD4QwUhSoga9Jq3ace-QcII54AHwsicAbQC6UmQDMArvjDcs9eAALKHxgCBBkTFwCIgA5WHYAdwAKADciTxABKLxCCABKAXxPAFsAIy4dSjhuTxh8eHSITIA6Ng4uXhbw0W5AiWlZcGgFcO54KGzsXKIJORGEMfgygTUNLQlg0PDI6ZiIeJgk5Kh8zZCwiJz9w+Oys7IgA


## Functions

For functions which return or accept user-constructible types, the rules specified for [**Breaking Changes: Interfaces, Type Aliases, and Classes**](#interfaces-type-aliases-and-classes) hold. Otherwise, a change to the type of a function is breaking when:

-   an argument or return type changes entirely, for example if a function previously accepted `number` and now accepts `{ count: number }`, or previously returned `string` and now returns `boolean`—since the user will have to change all call sites for the function ([playground][changed-type])

-   a function (including a class constructor or methods) argument *requires a more specific ("narrower") type*, for example if it previously accepted `string | number` but now requires `string`—since the user will have to change some calls to the function ([playground][narrower-argument])

-   a function (including a class constructor or method) *returns a less specific ("wider") type*, for example if it previously returned `string` but now returns `string | null`—since the user's existing handling of the return value will be wrong in some cases ([playground][wider-return]).

    This includes widening from a *type guard* to a more general check. For example:

    ```diff
    -function isString(x: string | number): x is string {
    +function isString(x: string): boolean {
      return typeof x === 'string';
    }
    ```

    This change would cause user-land code that expects narrowing to break:

    ```ts
    if (isString(value)) {
      return value.length;
    } else {
      return value;
    }
    ```

-   a function (including a class constructor or method) adds any new *required* arguments—since all user invocations of the function will now be broken ([playground][new-required-argument])

-   a function (including a class constructor or method) removes an existing argument entirely—since user invocations of the function may now fail to type-check

    -   if the argument was required, *all* invocations will fail to type-check ([playground][remove-required-argument])

    -   if the argument was optional, any invocations which used it will fail to type-check ([playground][remove-optional-argument])

-   changing a function from a `function` declaration to an arrow function declaration, since it changes the type of `this`, the effect of calling `bind` or `call` on the function, and requires parameters to be contravariant instead of allowing bivariance

[changed-type]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0NigkBqBbJyoAPKY8AjknGZyoMUubIj0OPChLPSMNNK2nPYAFIEE0HqIbJAARlgAlHoAbhrwgeFyDtGx8Ymo5JS0DKgAwviIloGFJaXlldUMdQ12yK3teub0GmW6oF29WKAOg6AjYxNTctm5SFwAdIdkPUqI0WgBGABMAGZ+hM1tANshAgDakDjk1TpCYeEgA

[narrower-argument]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEs9Iw00rac9gAUgQTQesLZiLCgAD7JbJAARlgAlHoAbhrwgeFyDtGx8YmoKdR0jKAA6jOSyIEFxSVlFVUMtfV2yC1tHThdsOOgUzNzCwpgQlig9BqxclkckguAA6c7IOpUBrNACMACYAMyjOaA3Kg8GQ6HXTwYbgaTzIuQ7WIoQJgmoQy6Na7wpFzYl7MkYqnNHHIPEE8JAA

[wider-return]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEWVrac9gAUAJR6wtmIsOFyDtGx8YmoKdR0jKAA6vCxKIEFxSVlFVWWNnbITS04bbCgAD7JbNyd3QpgQlig9Bqxcs6l5ZWI6NCIgZzIAErU+zj1AG4r65tGjNith2JgHn86sgAHSvdp4Q7RfDPV4fKhfepZHJILjQpa1BqNRqdZEvd6fTjfcaTZCBPE1FZNYlyIA

[new-required-argument]: https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwEo7ictgBuAKFCRYCFOmx54yAsCgYQwanQZNWAGngAjOqmQBbTSBgd4XHgP4QQGeFHgBeQiTJUA5ARwY5OV2wFWbTQcpGTkFSndPb19eIA

[remove-required-argument]: https://www.typescriptlang.org/play/?ssl=2&ssc=35&pln=2&pc=47#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwBp4AjO1ZAW04gYASjrEcWYAG4AUKEiwEKdNjzxkBYFAwhg1OgyatR8cZNkyIIDPCjwAvIRJkqAcgI4M2nK44BGACZhWSsbTgd1TW1dSndPb194QOCgA

[remove-optional-argument]: https://www.typescriptlang.org/play?#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwBp4AjAfjtWQC2nEDACUdYjizAA3AChQkWAhTpseeMgLAoGEMGp0GTVuPiTp8uRBAZ4UeAF5CJMlQDkBHBl053HAEYAJlF5GztOJ01tXX1KT29ff3hg0OtbeDAoohBSHAp4rx8MPzTw+GAorR09AwTi0vkgA
