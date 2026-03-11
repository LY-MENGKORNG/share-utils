import type { HTTPError } from "#/errors/http-error";
import type { HttpMethod } from "./option";

export type ShouldRetryState = {
  /**
	The error that caused the request to fail.
	*/
  error: Error;

  /**
	The number of retries attempted. Starts at 1 for the first retry.
	*/
  retryCount: number;
};

export type RetryOptions = {
  limit?: number;

  methods?: HttpMethod[];

  statusCodes?: number[];

  afterStatusCodes?: number[];

  maxRetryAfter?: number;

  backoffLimit?: number;

  delay?: (attemptCount: number) => number;

  jitter?: boolean | ((delay: number) => number) | undefined;

  retryOnTimeout?: boolean;

  shouldRetry?: (
    state: ShouldRetryState,
  ) => boolean | undefined | Promise<boolean | undefined>;
};

export type ForceRetryOptions = {
  /**
	Custom delay in milliseconds before retrying.

	If not provided, uses the default retry delay calculation based on `retry.delay` configuration.

	**Note:** Custom delays bypass jitter and `backoffLimit`. This is intentional, as custom delays often come from server responses (e.g., `Retry-After` headers) and should be respected exactly as specified.
	*/
  delay?: number;

  /**
	Error code for the retry.

	This machine-readable identifier will be included in the error message passed to `beforeRetry` hooks, allowing you to distinguish between different types of forced retries.

	@example
	```
	return ky.retry({code: 'RATE_LIMIT'});
	// Resulting error message: 'Forced retry: RATE_LIMIT'
	```
	*/
  code?: string;

  /**
	Original error that caused the retry.

	This allows you to preserve the error chain when forcing a retry based on caught exceptions. The error will be set as the `cause` of the `ForceRetryError`, enabling proper error chain traversal.

	@example
	```
	try {
		const data = await response.clone().json();
		validateBusinessLogic(data);
	} catch (error) {
		return ky.retry({
			code: 'VALIDATION_FAILED',
			cause: error  // Preserves original error in chain
		});
	}
	```
	*/
  cause?: Error;

  /**
	Custom request to use for the retry.

	This allows you to modify or completely replace the request during a forced retry. The custom request becomes the starting point for the retry - `beforeRetry` hooks can still further modify it if needed.

	**Note:** The custom request's `signal` will be replaced with Ky's managed signal to handle timeouts and user-provided abort signals correctly. If the original request body has been consumed, you must provide a new body or clone the request before consuming.

	@example
	```
	// Fallback to a different endpoint
	return ky.retry({
		request: new Request('https://backup-api.com/endpoint', {
			method: request.method,
			headers: request.headers,
		}),
		code: 'BACKUP_ENDPOINT'
	});

	// Retry with refreshed authentication token
	const data = await response.clone().json();
	return ky.retry({
		request: new Request(request, {
			headers: {
				...Object.fromEntries(request.headers),
				'Authorization': `Bearer ${data.newToken}`
			}
		}),
		code: 'TOKEN_REFRESHED'
	});
	```
	*/
  request?: Request;
};

export type BeforeErrorState = {
  error: HTTPError;

  /**
	The number of retries attempted. `0` for the initial request, increments with each retry.

	This allows you to distinguish between the initial request and retries, which is useful when you need different error handling based on retry attempts (e.g., showing different error messages on the final attempt).
	*/
  retryCount: number;
};

export type BeforeErrorHook = (
  state: BeforeErrorState,
) => HTTPError | Promise<HTTPError>;
