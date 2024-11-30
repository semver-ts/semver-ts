# Non-breaking changes

In each of these cases, some user code becomes *superfluous*, but it neither fails to type-check nor causes any runtime errors.

<!-- toc -->


## Symbols

A change to an exported symbol is *not* breaking when:

-   a symbol is exported which was not previously exported and which does not share a name with another symbol which was previously exported


## Interfaces, Type Aliases, and Classes

Any change to a non-user-constructible type is *not* breaking when:

-   a new optional property is added to the type, since all existing code will continue working ([playground][new-optional-prop])

-   a `readonly` object property on the type becomes a *more specific ("narrower") type*, for example if it was previously `string | string[]` and now is always `string[]`—since all user code will continue working and type-checking ([playground][narrower-property]). Note that this includes a previously-optional property becoming required.[^nit-on-comparability]

-   a new required property is added to the object—since its presence does not require the consuming code to use the property at a type level ([playground][new-required-prop])[^variance-in-discriminating]

[new-optional-prop]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgPJWAc1HANsgbwFgAoZc5OALmQGcwMRMBuUgX1NNElkRQFUADgBM4kYYVIVKNeoxZSKAIwD8NEAFcAtkuisSHEqWEQEuOFBQwNIBGGAB7EMktgNUELXRYcuABQAlDTe2CB4+iZmFlY2do7Oru6eQqLigTQpYhDC+sam5pbI1rb2TshgcADWEF4YoXh+AB7Bdb5ByABuDsA5eVGFxXFlFdW0mWnNyOPZ7V09uSRhWjWCfMgAQhAwDpbTkmQUAPSHyAhOchpDIIrkuBBgMmitYfgAvISPAEQAFhC4uA5Psg2AtpMcXPcktlkEoAJ7IXDAJRQCywm4I+4wlo+F7Id6JDy1HENAKgo4nBB4cxKYCIsBog7kEY1EK+PxwUno5lE+r+AhfX7-QHAgLsTiLODLWirJDIACCMB4e2IjOQ4LOngYl1K11Vdwe1CmIiyEne-MNPz+AKBIPFYJOBJA0LhCKRKKgDOk+qxT2JbwhbkJ02EgTJ5HVVLgNLpnoo3NZL3ZnNV3ODSf00njzwaSmTmaqNTTuYzcYLY2NaXNNEtQptooMpCAA

[narrower-property]: https://www.typescriptlang.org/play?#code/CYUwxgNghgTiAEkoGdnwPIwJYHMsDsoJ4BvAKHngAcYB7KkGAFwE8AueZJ7fHeAH07cCOANoBdANxkAvmTKgkcRNFTwAcrDoB3EMFIVqdBs3ZCeOWfIBmAV3xgmWWvngALKPmAQQyTLgIiTRgdAAoANyJbEA5-PEIIAEoOfFsAWwAjRgNKOCZbGFdIiGiAOhp6RlZSn14mN2k5BXBoZR8meChY7HiiaUVWhHb4DI5gnT1pDy8fPx7AiHHabVCoRKnPb184haWVjPWyIA

[new-required-prop]: https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgPJWAc1HANsgbwFgAoZc5OALmQGcwMRMBuUgX1NNElkRQFUADgBM4kYYVIVKNeoxZSKAIxogArgFsl0ViQ4lSwiAlxwoKGGpAIwwAPYhk5sGqgha6LDlwAKAJQ0ntggeLpGJmYWVjb2js6u7kKi4v40SWIQwrqGxqbmyJbWtg7IYHAA1hAeGMF4PgAegTXeAcgAbnbAWTkR+YUxJWWVtOkpjcijma0dXdkkIRpVgnzIAEIQMHbmk5JkFAD0+04QLm6ZyEoAnsi4wEpQZpeK5LgnMmjNIfgAvMen7kFvP5dNJXmBkKAYNBzBJfvE3NUvF9gZw9uRDsgEHhTEpgLcwNcAO7AMAACz+CUyz1KFSqgORcD8IIoQzpnzqkOhU10+lICyWKwAgjAeDtiGjkBj4SBzlcbncHlAnhKMQBhUlwJigTClUkoYAaQRbcHAWiYrbmGwXYxwNS0fWOMkocx4drQWixZB2GC600AGmpGMudjUyEJIdwEm0yGEnSYyAABgajVBwQRkABlOyLACS4Gg8CQyDYBSg2eQAHJaNmIABaW73R4V5gJgMqo6aiRO5BqEQZCTcAsrcNqSPIDVtFDd2hwRbIfl+uh2XUoCD1QS3BAkwMd2gezAgRbgMMRiT0PH4ZZ75A+OBmteCYziPzIABUndfNwyUB79ohIB3c183qMAzUJUlgAQclzAARzUYB8m7QQy0fVMiVPShcGra1fzgJRXjDElSRDMBAI0OxhGAGBILEWJqTBd5JlhCkESY4FJSOc9cHwO99xCfCIHot5OSgGFkDhE4EhGPsUiZVFpAxLFuLwvESSJIiWJlYRqVZRFal8RlmXIXT6Q5EAoVE7kdNpaTkkyW85IlXS2JEmFHP0IA


## Functions

For functions which return or accept user-constructible types, the rules specified for [Non-breaking Changes: Interfaces, Type Aliases, and Classes](#interfaces-type-aliases-and-classes) hold. Otherwise, a change to a function declaration is *not* breaking when:

-   a function (including a class method or constructor) *accepts a less specific ("wider") type*, for example if it previously accepted only a `boolean` but now accepts `boolean | undefined`—since all existing user code will continue working and type-checking ([playground][wider-argument])

-   a function (including a class method) which *returns a more specific ("narrower") type*, for example if it previously returned `number | undefined` and now always returns `number`—since all user code will continue working and type-checking ([playground][narrower-return])

-   a function (including a class constructor or method) makes a previously-required argument optional—since all existing user code will continue to work with it ([playground][optional-argument])

-   changing a function from an arrow function declaration to `function` declaration, since it allows the caller to use `bind` or `call` meaningfully where they could not before. (Note that at the time of authoring, current TypeScript version 4.3, such a change introduces parameter bivariance. This is not breaking, but may be undesirable.)

[wider-argument]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEs9Iw00rac9gAUgQTQegBGGhqcyNCIAJR6AG4a8IHhcg7RsfGJqCnUdIygAOrjksiBBcUlZRVVDLX1dsgtbZ3dvf2gAD6gpbHOSFtDoKPjk9MKYEJYoPQNLE5FkckguAA6I7IOpUBrNHCYewDSag3KQ6Gw+FnZxcCQouTrWIoQJQmowk6NM6I5GTImbUmYynNXGcfHhIA

[narrower-return]: https://www.typescriptlang.org/play?#code/PTAEEkFsEMHMEsB2BTUALZAnVAXN0dQ9UAiRaSZAZwAdoBjZE0BnAV2gBtOBPUAKzZVC2GtirJEOKkQwAoEKCoVU8SDQD2mHAC5QAAzWbtoAN6hYyHADUubVAF9QAM0wbIoAORV3yALTQACaBGoieANz6cnKByPSc0Nig5JS0DKgA8pjwCOScZnKgRS5siPQ48KEWVrac9gAUAJR6wtmIsKAAPsls3OFyDtGx8YmoKdR0jKAAcoluAO7IgQXFJWUVVZY2dshNLThtsP2DCmBCWKD0GrFyzqXllYjo0IiBnMgAStS9OPUAbjt9ocuj1uM0epAAEYXUyFYrYdiYJ4AurIAD8ADp3u08KA0WjQAAGY7RfCvd5fKg-epZHJILgYra1BqNRr9MlvT7fTi-WaYBZLRk1HZNNlyIA

[optional-argument]: https://www.typescriptlang.org/play/#code/CYUwxgNghgTiAEAzArgOzAFwJYHtXwAc4A3XZAZwAooAuecjGLVAcwBp4AjO1ZAW04gYASjrEcWYAG4AUKEiwEKdNjzxkBYFAwhg1OgyasOnAPw9+gkWInSZMiCAzwo8ALyESZKgHICODG0cHw4ARgAmYVlHZ053dU1tXUo-AKCQ+AiooA


## Notes

[^nit-on-comparability]: Strictly speaking, one value may stop being comparable to another value in this scenario. However, this is both a rare edge case and fits under the standard rule where changes which simply let users delete now-defunct code are allowed.

[^variance-in-discriminating]: Mostly, anyway—see [Appendix C: On Variance in TypeScript – Higher-order type operations](../appendices/c-variance-in-typescript.md#higher-order-type-operations) for a discussion of how the `in` operator (or similar operations discriminating between unions) makes this cause breakage in some cases. These are rare enough, and easily-enough solved, that the rule remains workable.
