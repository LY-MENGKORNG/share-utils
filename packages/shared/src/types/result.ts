export type Success<T> = { success: true; value: T }
export type Failure<E> = { success: false; err: E }
export type Thunk<T> = Promise<T> | (() => Promise<T>)

export type Result<T, E> = Success<T> | Failure<E>

export type SafeTry = {
	<T, E = Error>(input: () => T): Result<T, E>
	async: <T, E = Error>(input: Thunk<T>) => Promise<Result<T, E>>
}
