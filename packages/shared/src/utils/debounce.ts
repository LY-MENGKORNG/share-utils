import type { DebounceCallback, DebounceFnArg } from "#/types/debounce";
import type { Result } from "#/types/result";
import { safeTry } from "./safe-try";

export function debounce<F extends DebounceFnArg, E = Error>(
  fn: F,
  delay: number
): DebounceCallback<F, E> {
  type DebounceResult = Result<Awaited<ReturnType<F>>, E>;
  type ArgsType = Parameters<F>;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<F> | null = null;
  let pending: Array<(r: DebounceResult) => void> = [];

  async function invokeWithArgs(args: ArgsType): Promise<DebounceResult> {
    const result = safeTry<ReturnType<F>, E>(() => fn(...args));
    if (!result.success) return { success: false, err: result.err };

    return safeTry.async(result.value);
  }

  const wrapped: DebounceCallback<F, E> = (...args: ArgsType) => {
    lastArgs = args;

    if (timer) clearTimeout(timer);

    const promise = new Promise<DebounceResult>((resolve) =>
      pending.push(resolve),
    );

    timer = setTimeout(
      async () => {
        timer = null;
        const resolvers = pending;
        pending = [];

        const argsToUse = lastArgs!;
        lastArgs = null;

        const result = await invokeWithArgs(argsToUse);
        resolvers.forEach((resolve) => resolve(result));
      },
      Math.max(0, delay),
    );

    return promise;
  };

  wrapped.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;

    if (pending.length) {
      pending.forEach((resolve) =>
        resolve({
          success: false,
          err: new Error("Debounced call cancelled") as unknown as E,
        }),
      );
      pending = [];
    }
  };

  return wrapped;

}
