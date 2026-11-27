/**
 * tests/node-env.d.ts
 * Dichiarazioni minime per eseguire il typecheck strict dei test Node/TSX (node:assert, process)
 * senza richiedere @types/node globale nel bundle browser di produzione.
 */

declare module 'node:assert' {
  function assert(value: unknown, message?: string | Error): asserts value;
  namespace assert {
    export function ok(value: unknown, message?: string | Error): asserts value;
    export function strictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
    export function notStrictEqual(actual: unknown, expected: unknown, message?: string | Error): void;
    export function deepStrictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
    export function throws(fn: () => unknown, error?: RegExp | ((err: Error) => boolean), message?: string): void;
    export function rejects(
      block: (() => Promise<unknown>) | Promise<unknown>,
      error?: RegExp | ((err: Error) => boolean),
      message?: string
    ): Promise<void>;
    export function fail(message?: string | Error): never;
  }
  export = assert;
}

declare const process: {
  readonly exit: (code?: number) => never;
};
