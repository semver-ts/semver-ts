# Conformance

To conform to this standard, a package must:

- link to the final published version of this specification
- specify the compiler support policy
- specify the currently-supported versions of TypeScript
- specify the definition of “public API” used by the library (e.g. “only documented types” vs. “all published types” etc.)
- author and publish its types with `strict: true`, `noUncheckedIndexedAccess: true`, and `exactOptionalPropertyTypes: true` in its compiler configuration
- always fully specify optional properties on objects with both `?` and `| undefined`
