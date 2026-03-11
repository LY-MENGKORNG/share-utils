import type { Failure, Result, SafeTry, Success, Thunk } from "../types/result";

const ok = <T>(value: T): Success<T> => ({ success: true, value });
const fail = <E>(err: E): Failure<E> => ({ success: false, err });

export const safeTry: SafeTry = <T, E = Error>(input: () => T) => {
  try {
    return ok(input());
  } catch (e) {
    return fail(e as E);
  }
};

safeTry.async = async <T, E = Error>(
  input: Thunk<T>,
): Promise<Result<T, E>> => {
  if (!(input instanceof Promise)) return safeTry.async(input());
  return input.then((val) => ok(val)).catch((e: E) => fail(e));
};
