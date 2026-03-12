import { ForceRetryError } from "#/errors/force-retry-error"
import { HTTPError } from "#/errors/http-error"
import { TimeoutError } from "#/errors/timeout-error"

/**
Type guard to check if an error is an HTTPError.

@param error - The error to check
@returns `true` if the error is an HTTPError, `false` otherwise
*/
export function isHTTPError<T = unknown>(error: unknown): error is HTTPError<T> {
  return error instanceof HTTPError || (error as any)?.name === HTTPError.name
}

/**
 * Type guard to check if an error is a TimeoutError.
 *
 * @param error - The error to check
 * @returns `true` if the error is a TimeoutError, `false` otherwise
 *
 */
export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError || (error as any)?.name === TimeoutError.name
}

/**
 *
 * Type guard to check if an error is a ForceRetryError.
 * @param error - The error to check
 * @returns `true` if the error is a ForceRetryError, `false` otherwise
 */
export function isForceRetryError(error: unknown): error is ForceRetryError {
  return error instanceof ForceRetryError || (error as any)?.name === ForceRetryError.name
}
