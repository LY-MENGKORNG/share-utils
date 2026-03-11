import type { HTTPError } from "#/errors/http-error";
import type { RetryMarker } from "#/utils/retry";
import type { HttpRequest, HttpResponse } from ".";
import type { NormalizedOptions } from "./option";

export type BeforeRequestState = {
  request: HttpRequest;
  options: NormalizedOptions;

  /**
	The number of retries attempted. `0` for the initial request, increments with each retry.

	This allows you to distinguish between initial requests and retries, which is useful when you need different behavior for retries (e.g., avoiding overwriting headers set in `beforeRetry`).
	*/
  retryCount: number;
};

export type BeforeRequestHook = (
  state: BeforeRequestState,
) => Request | Response | void | Promise<Request | Response | void>;

export type BeforeRetryState = {
  request: HttpRequest;
  options: NormalizedOptions;
  error: Error;

  /**
	The number of retries attempted. Always `>= 1` since this hook is only called during retries, not on the initial request.
	*/
  retryCount: number;
};

export type BeforeRetryHook = (
  state: BeforeRetryState,
) =>
  | Request
  | Response
  | typeof stop
  | void
  | Promise<Request | Response | typeof stop | void>;

export type AfterResponseState = {
  request: HttpRequest;
  options: NormalizedOptions;
  response: HttpResponse;

  /**
	The number of retries attempted. `0` for the initial request, increments with each retry.

	This allows you to distinguish between initial requests and retries, which is useful when you need different behavior for retries (e.g., showing a notification only on the final retry).
	*/
  retryCount: number;
};

export type AfterResponseHook = (
  state: AfterResponseState,
) => Response | RetryMarker | void | Promise<Response | RetryMarker | void>;

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

export type Hooks = {
  beforeRequest?: BeforeRequestHook[];

  beforeRetry?: BeforeRetryHook[];

  afterResponse?: AfterResponseHook[];

  beforeError?: BeforeErrorHook[];
};
