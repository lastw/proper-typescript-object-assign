declare const foo: { x: number, y: number, z: number } | { x: string, z: number };
declare const bar: { x: number };

// ok
let x: { x: number, y?: number, z: number } = assign(foo, bar);

assignIn(foo, { z: 1 });
assignIn({ x: 1, y: 2 }, { x: 3, y: 10 });



// fail
let y: { x: string, z: number } = assign(foo, bar);
let z: typeof foo = assign(foo, bar);

assignIn(foo, bar);
assignIn(foo, { x: '2' });
assignIn(foo, { unknown: 1 });