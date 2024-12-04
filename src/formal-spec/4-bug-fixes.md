# Bug fixes

As with runtime code, types may have bugs. We define a ‘bug' here as a mismatch between types and runtime code. That is: if the types allow code which will cause a runtime type error, or if they forbid code which is allowed at runtime, the types are buggy. Types may be buggy by being inappropriately *wider* or *narrower* than runtime.

For example (noting that this list is illustrative, not exhaustive):

-   If a function is typed as accepting `any` but actually requires a `string`, this will cause an error at runtime, and is a bug.

-   If a function is typed as returning `string | number` but is intended to return only `string`, this is a bug. Note that this is distinct from the runtime behavior: a package author may intentionally specify the type as wider than the current implementation with the expectation of future changes. This will not cause an error at runtime, since consumers must "narrow" the type to use it, and narrowing the type would not even be a breaking change.

-   If an interface is defined as having a property which is *not* part of the public API of the runtime object, or if an interface is defined as *missing* a property which the public API of the runtime object does have, this is a bug.

As with runtime bugs, authors are free to fix type bugs in a patch release. As with runtime code, this may break consumers who were relying on the buggy behavior. However, as with runtime bugs, this is well-understood to be part of the sociotechnical contract of semantic versioning.

In practice, this suggests two key considerations around type bugs:

1.  It is essential that types be well-tested! See discussion under [**Appendix B: Tooling**](../appendices/b-tooling.md).

2.  If a given type bug has existed for long enough, an author may choose to treat it as ["intimate API"][intimate] and change the *runtime* behavior to match the types rather than vice versa.

[intimate]: https://twitter.com/wycats/status/918644693759488005
