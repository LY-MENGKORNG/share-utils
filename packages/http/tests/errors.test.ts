import { describe, expect, it } from "bun:test"
import { ForceRetryError } from "../src/errors/force-retry-error"
import { HTTPError } from "../src/errors/http-error"
import { NonError } from "../src/errors/non-error"
import { TimeoutError } from "../src/errors/timeout-error"

describe("HTTP errors", () => {
	it("builds an HTTPError with request and response context", () => {
		const request = new Request("https://example.com/users", { method: "POST" })
		const response = new Response('{"message":"bad"}', {
			status: 400,
			statusText: "Bad Request",
			headers: { "content-type": "application/json" },
		})

		const error = new HTTPError(
			response as never,
			request as never,
			{ method: "POST", retry: 0, prefixUrl: "", context: {} } as never
		)

		expect(error.name).toBe("HTTPError")
		expect(error.message).toContain("status code 400 Bad Request")
		expect(error.message).toContain("POST https://example.com/users")
		expect(error.request).toBe(request)
		expect(error.response).toBe(response)
	})

	it("builds a TimeoutError from the request", () => {
		const request = new Request("https://example.com/slow", { method: "GET" })
		const error = new TimeoutError(request)

		expect(error.name).toBe("TimeoutError")
		expect(error.message).toBe("Request timed out: GET https://example.com/slow")
		expect(error.request).toBe(request)
	})

	it("wraps non-Error causes in ForceRetryError", () => {
		const error = new ForceRetryError({
			code: "TOKEN_REFRESH",
			delay: 250,
			// @ts-expect-error runtime behavior
			cause: "expired",
		})

		expect(error.name).toBe("ForceRetryError")
		expect(error.message).toBe("Forced retry: TOKEN_REFRESH")
		expect(error.customDelay).toBe(250)
		expect(error.cause).toBeInstanceOf(NonError)
	})

	it("stores the thrown value in NonError", () => {
		const value = { message: "boom", code: "E_FAIL" }
		const error = new NonError(value)

		expect(error.name).toBe("NonError")
		expect(error.message).toBe("boom")
		expect(error.value).toBe(value)
	})
})
