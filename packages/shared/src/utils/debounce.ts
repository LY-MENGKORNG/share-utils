import type { DebouncedFunction, DebouncedPromise, Options } from "#/types/debounce"

/**
 * Reusable debounce function that delays the execution of a given function until after a specified wait time has elapsed since the last invocation.
 */
// biome-ignore lint/suspicious/noExplicitAny: <reason for using any>
export function debounce<Args extends any[], F extends (...args: Args) => ReturnType<F>>(
	fn: F,
	waitMs: number = 50,
	options: Options<ReturnType<F>> = {}
): DebouncedFunction<Args, F> {
	const { isImmediate = false, callback = () => {}, maxWait } = options

	let lastInvoke = Date.now()
	let timerId: ReturnType<typeof setTimeout> | undefined
	let promises: DebouncedPromise<ReturnType<F>>[] = []

  const nextInvokeTimeout = (): number => {
		if (maxWait !== undefined) {
      const sinceLastInvoke = Date.now() - lastInvoke

      // Note: sinceLastInvoke <= maxWait ensures we don't exceed maxWait
      if (sinceLastInvoke + waitMs >= maxWait && sinceLastInvoke <= maxWait) {
        return maxWait - sinceLastInvoke
			}
    }
		return waitMs
	}

	const debouncedFunction: DebouncedFunction<Args, F> = function (
		this: ThisParameterType<F>,
		...args: Parameters<F>
	) {
		return new Promise<ReturnType<F>>((resolve, reject) => {
      if (timerId !== undefined) clearTimeout(timerId)

			const shouldCallNow = isImmediate && timerId === undefined

			timerId = setTimeout(() => {
				timerId = undefined
				lastInvoke = Date.now()

				if (!isImmediate) {
					const result = fn.apply(this, args)
          callback(result)

          for (let i = 0; i < promises.length; i++) promises[i].resolve(result)
					promises = []
				}
      }, nextInvokeTimeout())

      if (!shouldCallNow) return void promises.push({ resolve, reject })

			const result = fn.apply(this, args)
			callback(result)
			return resolve(result)
		})
	}

	debouncedFunction.cancel = <Reason = string>(reason: Reason) => {
		if (timerId !== undefined) clearTimeout(timerId)

		for (let i = 0; i < promises.length; i++) promises[i].reject(reason)
		promises = []
	}

	return debouncedFunction
}
