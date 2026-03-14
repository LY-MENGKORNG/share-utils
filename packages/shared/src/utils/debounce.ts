import type { DebounceOptions } from "#/types/debounce";
import type { Result } from "#/types/result";

export function debounce<T extends (...args: Parameters<T>[]) => ReturnType<T>, E = Error>(
	fn: T,
	wait: number,
	opts: DebounceOptions = { leading: false, maxWait: 0, trailing: true }
) {
  let timerId: ReturnType<typeof setTimeout> | undefined;
	let pending: Array<(r: Result<Awaited<ReturnType<T>>, E>) => void> = [];

	function debounced(...args: Parameters<T>[]) {
    clearTimeout(timerId);

		timerId = setTimeout(() => {

		}, wait);

    return {} as Result<T, E>;
  }
  debounced.cancel = function () {
    if (timerId) {
      timerId = clearTimeout(timerId)!
    }
	}

	return debounced;
}

// import type { DebounceCallback, DebounceFnArg } from "#/types/debounce";
// import type { Result } from "#/types/result";
// import { safeTry } from "./safe-try";

// export function debounce<F extends DebounceFnArg, E = Error>(
//   fn: F,
//   delay: number
// ): DebounceCallback<F, E> {
//   type DebounceResult = Result<Awaited<ReturnType<F>>, E>;
//   type ArgsType = Parameters<F>;

//   let timer: ReturnType<typeof setTimeout> | null = null;
//   let lastArgs: Parameters<F> | null = null;
//   let pending: Array<(r: DebounceResult) => void> = [];

//   async function invokeWithArgs(args: ArgsType): Promise<DebounceResult> {
//     const result = safeTry<ReturnType<F>, E>(() => fn(...args));
//     if (!result.success) return { success: false, err: result.err };

//     return safeTry.async(result.value);
//   }

//   const wrapped: DebounceCallback<F, E> = (...args: ArgsType) => {
//     lastArgs = args;

//     if (timer) clearTimeout(timer);

//     const promise = new Promise<DebounceResult>((resolve) => pending.push(resolve));

//     timer = setTimeout(
//       async () => {
//         timer = null;
//         const resolvers = pending;
//         pending = [];

//         const argsToUse = lastArgs!;
//         lastArgs = null;

//         const result = await invokeWithArgs(argsToUse);
//         for (const resolve of resolvers) {
//           resolve(result);
//         }
//       },
//       Math.max(0, delay)
//     );

//     return promise;
//   };

//   wrapped.cancel = () => {
//     if (timer) {
//       clearTimeout(timer);
//       timer = null;
//     }
//     lastArgs = null;

//     if (pending.length) {
//       for (const resolve of pending) {
//         resolve({
//           success: false,
//           err: new Error("Debounced call cancelled") as unknown as E,
//         });
//       }
//       pending = [];
//     }
//   };

//   return wrapped;
// }
