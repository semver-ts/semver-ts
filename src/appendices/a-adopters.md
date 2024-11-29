# Appendix A: Existing Adopters

The recommendations in this specification have been fully implemented in many packages, especially but not only in the Ember.js ecosystem.

- In 2022, the entire Ember.js project adopted this spec as governing the TypeScript type aspects of [its SemVer contract][ember-semver].

- Some of the earliest adopters (and therefore longest users) of this spec include:
    - [`ember-modifier`][ember-modifier]
    - [True Myth][true-myth]
    - [ember-async-data][ember-async-data]
    - [`ember-concurrency`][ember-concurrency]

[ember-semver]: https://emberjs.com/releases/
[ember-modifier]: https://github.com/ember-modifier/ember-modifier
[ember-async-data]: https://github.com/chriskrycho/ember-async-data
[ember-concurrency]: https://github.com/machty/ember-concurrency
[true-myth]: https://true-myth.js.org

`ember-modifier`, `ember-async-data`, and `true-myth` all publish types generated from implementation code.
`ember-concurrency` supplies a standalone, hand-written type definition file.
Since adopting this policy in these implementations (beginning in early summer 2020), no known issues have emerged, and the experience of implementing earlier versions of the recommendations from this spec have been incorporated into the final form of the spec.
