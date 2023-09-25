# Appendix C: Variance in TypeScript

As alluded to in [Changes to Types: Variance](#variance), there are several complicating factors for the discussion of variance in TypeScript:

<!-- toc -->

## Inference and pervasive mutability

For example, by the classic rules, `Array<T>` should be invariant: it is a read-write (i.e. mutable) type. That means that a very simple change, otherwise apparently safe for consumers, can break it. Start with a library function which returns `string | number`:

```ts
declare function example(): string | number;
```

A consumer might use this code in the construction of an array, and then having leaned on inference, push both `string`s and `number`s into it:

```ts
const myArray = [example()]; // Array<string | number>
myArray.push(123);           // ✅
myArray.push("hello");       // ✅
```

The author of the library might later update `example` to return only `string`s:

```ts
declare function example(): string;
```

This would be safe under the rule for write-only types, which is the intuition underlying many of the definitions below—but for our array example, it is *not* safe: `.push()`-ing in a `number` is now illegal.

```ts
const myArray = [example()]; // Array<string>
myArray.push(123);           // ❌ number not assignable to string
myArray.push("hello");       // ✅
```

What's more, we don't need an object like an array to trigger this kind of behavior. Using a `let` binding instead of a `const` binding will produce exactly the same issue. Under the original definition of `example`, this would be perfectly legal:

```ts
let value = example(); // string | number
value = 123;           // ✅
value = "hello";       // ✅
```

But it stops being valid as soon as `example` is narrowed:

```ts
let value = example(); // string
value = 123;           // ❌ number not assignable to string
value = "hello";       // ✅
```

While lint guidelines preferring `const` may *help* mitigate the latter, they are controversial[^const-controversy] and they do not and cannot help with the `Array` example or others like it. Nor is it feasible to require a “functional” immutable-update style, given that JavaScript lacks robust immutable data structures, which would allow for recommending that approach.

In this case, cautious users may work around this by explicitly annotating their types to match the return type of the:

```ts
const myArray: Array<string | number> = [example()];
let value: string | number = example();
```

We do not expect this to be common, however: the cost of this is much higher than the cost of changing one's code in the cases where it may be broken.

## Structural typing

Most programming languages where programmers must deal with variance have *nominal* type systems, and and subtyping relations can be straightforwardly specified in terms of the relations between the types—particular via subclassing (as in Java, C++, and C#) or between interfaces (as in Rust’s `trait` system). In TypeScript, however, subtyping relationships include both subclassing and interface-based subtypes and also *structural subtyping*.

Given types `A` and `B`, `B` is a subtype of `A` for the purposes of assignability (e.g. in function calls) when it is a *superset* of `A`. Most simply:

```ts
type A = {
  a: number;
}

type B = {
  a: number;
  b: string;
}

type C = {
  a?: number;
  b: string;
}

declare function takesA(a: A): void;

declare let a: A;
declare let b: B;
declare let c: C;
takesA(a); // ✅
takesA(b); // ✅
takesA(c); // ❌
```

Notice that this is *unlike* the dynamics in nominal type systems, where unless `B` explicitly declared a relationship to `A` (e.g. `class B extends A { }` or `interface B : A { }` or similar), the two are unrelated, regardless of their structural relationships. Similar dynamics play out for other kinds of types.

## Higher-order type operations

The second factor which makes dealing with TypeScript types difficult is its support for *type-level mutation*. Consider the type of `x` at points 1–4 in the following simple, but relatively idiomatic, TypeScript function definition:

```ts
function describe(x: string | number | undefined) {
  switch (typeof x) {                 // 1
    case 'string':
      return `x is the string ${x}`;  // 2
    case 'number':
      return `x is the number ${x}`;  // 3
    default:
      return `x is "undefined"`;      // 4
  }
}
```

1. The type is `string | number | undefined`.
2. The type is `string`.
3. The type is `number`.
4. The type is `undefined`.

While this quickly becomes second-nature to TypeScript developers and we don’t give it a second thought, it’s important to take a step back and consider what is actually happening here: the type of `x` is a variable—a *type-level* variable—whose value changes over the body of the function. That is, it is a *mutable type-level variable*. While it is possible to construct values whose types in TypeScript are *not* mutable (e.g. with `never` or a boolean or numeric literal value), *most* values constructed in an ordinary TypeScript program have mutable types.

What’s more, this combines with TypeScript’s use of structural typing and inference mean that many cases which would intuitively be “safe” to make changes around can in fact create compiler errors. For example, consider a function which today returns `string | number`:

```ts
declare function a(): string | number;
```

Using this function to create a value `x` will give us the type `x: string | number` as we would expect. Then we might *narrow* the type later:

```ts
const x = a(); // string | number
const y = typeof x === 'string' ? x.length : x;  // ✅
```

In general by the rules of variance, we would expect that narrowing the return type of `a` to always return `number` would be fine. This is in a “write-only” position, and so we would expect that we should allow contravariance: a narrower type is permissible. From a runtime perspective, that is true, because all existing code will continue to work (even if there are some unnecessary branches). However, TypeScript will produce a type error here, because the type of `x` no longer includes `string`, and so the `typeof x === 'string'` check can be statically known to be.

Practically speaking, this is an annoyance rather than a meaningful breaking change. It can, however, result in significant work across a code base! What is more, it is not possible to work around this merely with an explicit type definition today. Naïvely, we might expect explicit type declarations to allow us to dodge this problem in places we actually care about it:

```ts
const x: string | number = a();
const y = typeof x === 'string' ? x.length : x;  // ❌
```

In practice, however, TypeScript today (up through 4.5) will first check that the type returned by `a()` is a subtype of the declared type of `x`, and then if `a()` returns a *narrower* type than that declared for `x`, it will actually set `x`'s type to the narrower type returned by `a()` instead of the explicitly-declared type. Thus, a user who wishes to avoid this problem must *everywhere* annotate their code with explicit type casts:

```ts
const x = a() as string | number;
const y = typeof x === 'string' ? x.length : x;
```

This is very annoying; worse, it is also easy to break. TypeScript today silently allows an unsafe cast here, which can in turn produce runtime errors:

```ts
declare function a(): string | number;
const x = a() as string; // 👎🏼
const y = x.length;  // possible runtime error!
```

Thus, for the thoroughly pragmatic reason that no one would ever want to write these kinds of casts and the more principled reason that these kinds of casts as readily undermine as support the kinds of type safety TypeScript aims to provide *and* the versioning guarantees this RFC aims to provide, we simply acknowledge that from a practical standpoint, the pervasiveness of type-level mutation makes it impossible to provide a definition of breaking changes which forbids the introduction of compiler errors by even apparently-safe changes.

The problem runs the other direction, too: while this example shows now-extraneous code which can be deleted, the same underlying issue can also require *adding* code, e.g. when adding a field to a library type which was previously being used to discriminate two objects.

Given this starting code:

```ts
// provided by the library
type LibType = {
  a: boolean;
}

type MyType = {
  b: string;
}

function takesEither(obj: LibType | MyType) {
  if ('b' in obj) {
      // narrowed obj to `MyType`
    console.log(obj.b.substring(0));
  }
}
```

If the library adds a field `b` which is of any type but `string`—

```ts
type LibType = {
  a: boolean;
  b: number;
}
```

—then we have a type error in `takesEither()` because the `in` operator no longer successfully discriminates between `LibType` and `MyType`:

```ts
function takesEither(obj: LibType | MyType) {
  if ('b' in obj) {
    // `obj` is still `LibType | MyType` so `b` is now `string | number`
    console.log(obj.b.substring(0)); // ❌
  }
}
```

The compiler will dutifully report:

> Property 'substring' does not exist on type 'string | number'.

In sum, just as pervasive runtime mutability and inference made it impossible to fully specify an approach which prevents users from experiencing breaking changes.


[^const-controversy]: Rightly so, in my opinion!
