import type { ForceRetryOptions } from "#/types/retry";

/**
Marker returned by `http.retry()` to signal a forced retry from `afterResponse` hooks.
*/
export class RetryMarker {
  options: ForceRetryOptions | undefined;

  constructor(options?: ForceRetryOptions) {
    this.options = options;
  }
}

export const retry = (options?: ForceRetryOptions) => new RetryMarker(options);
