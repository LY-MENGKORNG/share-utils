import { describe, expect, it } from "bun:test"
import { ForceRetryError } from "../src/errors/force-retry-error"
import { HTTPError } from "../src/errors/http-error"
import { TimeoutError } from "../src/errors/timeout-error"
import { isForceRetryError, isHTTPError, isTimeoutError } from "../src/utils/type-guard"

describe("Type guards", () => {
	it("detects HTTPError instances and name-compatible objects", () => {
		const httpError = new HTTPError(
			new Response(null, { status: 500 }) as never,
			new Request("https://example.com") as never,
			{ method: "GET", retry: 0, prefixUrl: "", context: {} } as never
		)

		expect(isHTTPError(httpError)).toBe(true)
		expect(isHTTPError({ name: "HTTPError" })).toBe(true)
		expect(isHTTPError(new Error("nope"))).toBe(false)
	})

	it("detects TimeoutError instances and name-compatible objects", () => {
		const timeoutError = new TimeoutError(new Request("https://example.com"))

		expect(isTimeoutError(timeoutError)).toBe(true)
		expect(isTimeoutError({ name: "TimeoutError" })).toBe(true)
		expect(isTimeoutError(new Error("nope"))).toBe(false)
	})

	it("detects ForceRetryError instances and name-compatible objects", () => {
		const forceRetryError = new ForceRetryError()

		expect(isForceRetryError(forceRetryError)).toBe(true)
		expect(isForceRetryError({ name: "ForceRetryError" })).toBe(true)
		expect(isForceRetryError(new Error("nope"))).toBe(false)
	})
})
