export type Options<Result> = {
	// Allowing immediate execution of the debounced function
	isImmediate?: Readonly<boolean>
	// Maximum wait time before executing the debounced function
	maxWait?: Readonly<number>
	// Callback to be executed when the debounced function is called
	callback?: (data: Result) => void
}

export type DebouncedFunction<
	// biome-ignore lint/suspicious/noExplicitAny: <reason for using any>
	Args extends any[],
	F extends (...args: Args) => ReturnType<F>,
> = {
	(this: ThisParameterType<F>, ...args: Args & Parameters<F>): Promise<ReturnType<F>>
	cancel: <Reason>(reason?: Reason) => void
}

export type DebouncedPromise<FunctionReturn> = {
	resolve: (result: FunctionReturn) => void
	reject: <Reason = string>(reason: Reason) => void
}
