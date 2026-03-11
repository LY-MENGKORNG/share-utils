import { safeTry } from "@repo/shared/utils/safe-try";

/**
 * Wrapper for non-Error values that were thrown.
 * In JavaScript, any value can be thrown (not just Error instances). This class wraps such values to ensure consistent error handling.
 */
export class NonError<T = unknown> extends Error {
  override name = "NonError";
  readonly value: T;

  constructor(value: T) {
    let message = "Non-error value was thrown";

    // Intentionally minimal as this error is just an edge-case.
    safeTry(() => {
      if (typeof value === "string") {
        message = value;
      } else if (
        value &&
        typeof value === "object" &&
        "message" in value &&
        typeof value.message === "string"
      ) {
        message = value.message;
      }
    });

    super(message);

    this.value = value;
  }
}
