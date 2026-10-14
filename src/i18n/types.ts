/**
 * The shape another language's messages must have: the same keys as English,
 * with any string allowed, and functions taking the same arguments. TypeScript
 * then flags a missing or misnamed translation at build time.
 */
export type Translation<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : T extends readonly (infer U)[]
      ? readonly Translation<U>[]
      : { [K in keyof T]: Translation<T[K]> };
