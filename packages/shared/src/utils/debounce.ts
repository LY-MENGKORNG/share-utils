import type { DebouncedFunction, DebouncedPromise, Options } from "#/types/debounce"

/**
 * Reusable debounce function that delays the execution of a given function until after a specified wait time has elapsed since the last invocation.
 * @param fn
 * @param waitMs
 * @param options
 * @returns
 */
// biome-ignore lint/suspicious/noExplicitAny: <reason for using any>
export function debounce<Args extends any[], F extends (...args: Args) => ReturnType<F>>(
	fn: F,
	waitMs: number = 50,
	options: Options<ReturnType<F>> = {}
): DebouncedFunction<Args, F> {
	const isImmediate = options.isImmediate ?? false
	const callback = options.callback ?? false
	const maxWait = options.maxWait

	let lastInvoke = Date.now()
	let timerId: ReturnType<typeof setTimeout> | undefined
	let promises: DebouncedPromise<ReturnType<F>>[] = []

	function nextInvokeTimeout() {
		if (maxWait !== undefined) {
			const sinceLastInvoke = Date.now() - lastInvoke

			if (sinceLastInvoke + waitMs >= maxWait) {
				return maxWait - sinceLastInvoke
			}
		}
		return waitMs
	}

	function resetTimeout() {
		if (timerId !== undefined) clearTimeout(timerId)
	}

	const debouncedFunction = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
		return new Promise<ReturnType<F>>((resolve, reject) => {
			resetTimeout()

			const shouldCallNow = isImmediate && timerId === undefined

			timerId = setTimeout(() => {
				timerId = undefined
				lastInvoke = Date.now()

				if (!isImmediate) {
					const result = fn.apply(this, args)

					if (callback) callback(result)
					for (const { resolve } of promises) resolve(result)
					promises = []
				}
			}, nextInvokeTimeout())

			if (shouldCallNow) {
				const result = fn.apply(this, args)

				if (callback) callback(result)
				return resolve(result)
			}
			promises.push({ resolve, reject })
		})
	}

	debouncedFunction.cancel = <Reason = string>(reason: Reason) => {
		resetTimeout()

		for (const { reject } of promises) reject(reason)
		promises = []
	}

	return debouncedFunction
}
