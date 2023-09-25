# Definitions

<dl>

<dt>Symbols</dt>
<dd>

There are two kinds of *symbols* in TypeScript: value symbols and type symbols. (Note that these are distinct from the [Symbol][symbol] object in JavaScript.)

[symbol]: http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol

Value symbols represent values present at runtime in JavaScript:

- `let`, `const`, and `var` bindings
- `function` declarations
- `class` declarations
- `enum` and `const enum` declarations
- `namespace` declarations (which produce or represent *objects* at runtime)

Type symbols represent types which are used in type checking:

- `interface` declarations
- `type` (type alias) declarations
- `function` declarations
- `class` declarations
- `enum` and `const enum` declarations

(Note that `namespace` declarations can also be present in type-only declarations, as when a type is exported from a namespace and referenced like `let val: SomeNamespace.ExportedInterface`, but the value produced by the `namespace` is not itself a type.)

</dd>

<dt>Functions</dt>
<dd>

Unless otherwise specified, "functions" always refers interchangeably to: functions in standalone scope, whether defined with either `function` or an arrow; class methods; and class constructors.

</dd>

<dt>User constructibility</dt>
<dd>

A type is user-constructible if the consumer of a package is allowed to create their own objects which match a given type structurally, that is, *without* using a function or class exported from the package which provides the type.

For example, a package may choose to export an interface to allow users to name the type returned by a function, while specifying that the only legal way to construct such an interface is via that exported function, in which case the type is *not* user-constructible.

Alternatively, a package may export an interface or type alias explicitly for users to construct objects implementing that type, in which case the type *is* user-constructible.

</dd>
<dd>

Using the type-level `typeof` operator to construct a type using the type of an exported item from a library wholly defeats the ability of authors to specify a public API. Accordingly:

1. Authors who wish to treat any given type as user-constructible should export a type definition for it under their public API contract (see the next section).
2. A type defined in terms of `typeof` which “breaks” under the rules discussed below is *not* breaking, because it was not legally user-constructible.

</dd>
<dd>

One challenge for this definition is the common scenario where code is not ordinarily user-constructible but may need to be mocked for tests. Changes to these *do not* constitute breaking changes—but library authors can also mitigate the challenge presented by this scenario. (See discussion below under [Appendix B: Tooling – Mitigate Breaking Changes – Avoiding User constructibility](#avoiding-user-constructibility).)

</dd>
<dd>

**Non-normative example:** in Ember.js today, the interface for a `Transition` is public API and consumers can rely on its stability, but only Ember is allowed to create `Transition` instances.

If a user imported the `Transition` interface and wrote a `class CustomTransition implements Transition { ... }`, this would be stepping outside the SemVer contract.

</dd>

<dt>Public API</dt>
<dd>

**Overview:** Some packages may choose to specify that the public API consists of *documented* exports, in which case no published type may be considered public API unless it is in the documentation. Other packages may choose to say the reverse: all exports are public unless explicitly defined as private (for example with the `@private` JSDoc annotation, a note in the docs, etc.).
In either case, no change to a type documented as private is a breaking change, whether or not the type is exported, where *documented as private* is defined in terms of the documentation norm of the package in question.

</dd>
<dd>

**Documentation of user constructibility:** Exported types (interfaces, type aliases, and the type side of classes) may be defined by documentation to be user-constructible or not.

</dd>
<dd>

**Documentation of subclassibility:** Exported classes may be defined by documentation to be user-subclassible or not.

</dd>

<dd>

**Re-exports:** using the `export * from` re-export syntax can in theory cause breakage by causing export conflicts: if the library being re-exported and the library doing the re-export both export the same name. For this reason, changes caused by the `export * from ...` are never breaking changes.[^re-export-antipattern]

</dd>

</dl>


## Notes

[^re-export-antipattern]: In general, it is an antipattern for one package to re-export another package directly like this, and the cases where it makes sense (e.g. Ember re-exporting Glimmer APIs) are cases of collaborators which can manage this.
