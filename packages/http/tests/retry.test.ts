import { describe, expect, it } from "bun:test"
import { RetryMarker, retry } from "../src/utils/retry"

describe("Retry Utils", () => {
	it("Should return new instance of retry marker", () => {
		expect(retry()).toBeInstanceOf(RetryMarker)
	})

	it("Should return new instance of retry marker with options", () => {
		expect(retry({})).toBeInstanceOf(RetryMarker)
		expect(retry({}).options).toEqual({})
		expect(retry({ mgs: "hi" }).options).toEqual({ mgs: "hi" })
	})
})
