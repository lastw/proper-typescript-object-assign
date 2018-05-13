# [WIP] Proper TypeScript Object.assign

I use `Object.assign` at least for two purposes and both cases are not typesafe and confusing. What's wrong with it?


## Intro

```typescript
interface FooIsNumber {
  foo: number;
}

interface FooIsString {
  foo: string;
}

const fooIsNumber: FooIsNumber = { foo: 1 };
const fooIsString: FooIsString = { foo: 'bar' };
```

Object.assign [typings](https://github.com/Microsoft/TypeScript/tree/v2.8.3/lib/lib.es2015.core.d.ts):

```typescript
function assign<T, U>(target: T, source: U): T & U;
```


## First case: Assign one object to another

As we can see, `Object.assign` does not have any argument constraints — we are allowed to _assign Cat to Dog and further fail to bark_:

```typescript
// no matter what type is returned, we are just mutating 'fooIsNumber'
Object.assign(fooIsNumber, fooIsString); // everything is clear

fooIsNumber.foo.toFixed(2); // fails in runtime — 'foo' is a string actually
```


## Second case — replace for spread

Spread works great:

```typescript
const baz = {
  ...fooIsNumber,
  ...fooIsString
};

// type of 'foo' value is inferred correctly:

baz.foo.toFixed(2);
//      ^^^^^^^
// Property 'toFixed' does not exist on type 'string'.
```

But spread [does not work](https://github.com/Microsoft/TypeScript/issues/13557) with generic types:

```typescript
function extendFoo<T extends object>(foo: T) {
  return {
    ...foo,
//  ^^^^^^
//  Spread types may only be created from object types.

    bar: 1
  };
}
```

So, as a fix we can replace it with «non-mutating» `Object.assign`:

```typescript
const fooIsExpectedAsString = Object.assign({}, fooIsNumber, fooIsString);

fooIsExpectedAsString.foo.charCodeAt(0); // OK
```

but wait...

```typescript
fooIsExpectedAsString.foo.toFixed(2); // is OK too!
```

WHAT?

That's because `fooIsExpectedAsString` is inferred as `FooIsNumber & FooIsString` — `{ foo: string } & { foo: number }` is equivalent for `{ foo: string & number }`. This mixed value is [_absurd_](https://stackoverflow.com/questions/39906054/typescript-object-assign-confusion) — values must be replaced, not merged.


## Solutions

### Avoid `Object.assign`

Just ban it via tslint: https://palantir.github.io/tslint/rules/ban/, use spread if you can and wait for [spread types support](https://github.com/Microsoft/TypeScript/pull/13288).


### Proper Assign type

Instead `A & B` it must override `A` fields with `B` fields.

```typescript
type Assign<A, B> = Pick<A, Exclude<keyof A, keyof B>> & B;
```

- [ ] TODO: `Assign<A, B, C, D, E, F>`


### Typesafe assign functions

#### Mutate existing object

`Object.assign(x, y, z)` — we must check that on every step `x` still has it's original type.

`Assign<T, U>` will equal `T` if `T` is already `Assign<T, U>`: `Assign<T, U, U>`

```typescript
declare function assignIn<T, U>(t: Assign<T, U>, u: U): Assign<T, U>;
```

- [ ] TODO: I'm not sure in this `assignIn` typings.


#### Build new shape

`Object.assign({}, x, y)` — `x` and `y` can be any type:

```typescript
declare function assign<T, U>(t: T, u: U): Assign<T, U>;
```