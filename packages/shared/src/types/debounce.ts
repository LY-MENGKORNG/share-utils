import type { Result } from "./result";

export type DebounceFnArg = (...args: any[]) => any | Promise<any>;

export type DebounceCallback<F extends DebounceFnArg, E = Error> = ((
  ...args: Parameters<F>
) => Promise<Result<Awaited<ReturnType<F>>, E>>) & {
  cancel: () => void;
};
