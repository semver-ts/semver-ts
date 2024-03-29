# Semantic Versioning for TypeScript Types Specification

This repository hosts [www.semver-ts.org](https://www.semver-ts.org), which publishes a definition of [Semantic Versioning](https://semver.org) for [TypeScript](https://www.typescriptlang.org) types.


## Working on the spec

The spec is currently a stable beta release after considerable iteration which involved input from both members of the TypeScript community at large and the Ember community specifically. We have intentionally not yet finalized it in view of gaining further feedback. Feel free to [open a discussion](https://github.com/typed-ember/semver/discussions), to [note an error](https://github.com/typed-ember/semver/issues) or to [suggest a change](https://github.com/typed-ember/semver/pulls)!

To build the site locally, you need to install [mdBook](https://rust-lang.github.io/mdBook/), [mdbook-linkcheck](https://github.com/Michael-F-Bryan/mdbook-linkcheck), and [mdbook-open-on-gh](https://github.com/badboy/mdbook-open-on-gh), [mdbook-toc](https://github.com/badboy/mdbook-toc). Then run `mdbook build` or `mdbook serve` in the root of the repository.


## History

This specification was originally authored by [Chris Krycho](https://www.chriskrycho.com) at [LinkedIn](https://www.linkedin.com), in collaboration with [Dan Freeman](https://dfreeman.io), [Mike North](https://mike.works), and [James C. Davis](https://jamescdavis.com), as part of the the [Ember.js](https://emberjs.com) ecosystem's official TypeScript support effort. For development history spec prior to publication in this repository, see:

- [an early draft and discussion in the ember-cli-typescript repository](https://github.com/typed-ember/ember-cli-typescript/pull/1158)
- [Ember RFC #730](https://github.com/emberjs/rfcs/pull/730)
