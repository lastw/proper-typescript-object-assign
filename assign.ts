type Assign<A, B> = Pick<A, Exclude<keyof A, keyof B>> & B;

declare function assign<T, U>(t: T, u: U): Assign<T, U>;