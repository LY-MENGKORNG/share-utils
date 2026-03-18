import { requestMethods } from "#/constants/request"
import { retryAfterStatusCodes, retryMethods, retryStatusCodes } from "#/constants/retry"
import type { RequestHttpMethod } from "#/types/option"
import type { RetryOptions } from "#/types/retry"

export const normalizeRequestMethod = (input: string): string =>
	requestMethods.includes(input as RequestHttpMethod) ? input.toUpperCase() : input

type InternalRetryOptions = Required<Omit<RetryOptions, "shouldRetry" | "jitter">> &
	Pick<RetryOptions, "shouldRetry">

const defaultRetryOptions: InternalRetryOptions & { jitter: RetryOptions["jitter"] } = {
	limit: 2,
	methods: retryMethods,
	statusCodes: retryStatusCodes,
	afterStatusCodes: retryAfterStatusCodes,
	maxRetryAfter: Number.POSITIVE_INFINITY,
	backoffLimit: Number.POSITIVE_INFINITY,
	delay: (attemptCount) => 0.3 * 2 ** (attemptCount - 1) * 1000,
	jitter: undefined,
	retryOnTimeout: false,
}

export function normalizeRetryOptions(retry: number | RetryOptions = {}): InternalRetryOptions {
	if (typeof retry === "number") {
		return {
			...defaultRetryOptions,
			limit: retry,
		}
	}

	if (retry.methods && !Array.isArray(retry.methods)) {
		throw new Error("retry.methods must be an array")
	}

	retry.methods &&= retry.methods.map((method) => method.toLowerCase())

	if (retry.statusCodes && !Array.isArray(retry.statusCodes)) {
		throw new Error("retry.statusCodes must be an array")
	}

	const normalizedRetry = Object.fromEntries(
		Object.entries(retry).filter(([, value]) => value !== undefined)
	) as RetryOptions & NonNullable<{ jitter: RetryOptions["jitter"] }>

	return {
		...defaultRetryOptions,
		...normalizedRetry,
	}
}
