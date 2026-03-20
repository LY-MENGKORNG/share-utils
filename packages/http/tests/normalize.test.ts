import { describe, expect, it } from "bun:test"
import { normalizeRequestMethod, normalizeRetryOptions } from "../src/utils/normalize"

describe("Normalize utils", () => {
	it("uppercases known request methods", () => {
		expect(normalizeRequestMethod("get")).toBe("GET")
		expect(normalizeRequestMethod("patch")).toBe("PATCH")
	})

	it("keeps unknown methods unchanged", () => {
		expect(normalizeRequestMethod("PROPFIND")).toBe("PROPFIND")
	})

	it("builds retry options from a number", () => {
		const retry = normalizeRetryOptions(5)

		expect(retry.limit).toBe(5)
		expect(retry.retryOnTimeout).toBe(false)
		expect(retry.methods).toContain("get")
	})

	it("normalizes custom retry methods to lowercase", () => {
		const retry = normalizeRetryOptions({
			methods: ["GET", "POST"],
			statusCodes: [500],
		})

		expect(retry.methods).toEqual(["get", "post"])
		expect(retry.statusCodes).toEqual([500])
	})

	it("rejects invalid retry methods", () => {
		expect(() =>
			normalizeRetryOptions({
				// @ts-expect-error runtime validation
				methods: "GET",
			})
		).toThrow("retry.methods must be an array")
	})

	it("rejects invalid retry status codes", () => {
		expect(() =>
			normalizeRetryOptions({
				// @ts-expect-error runtime validation
				statusCodes: 500,
			})
		).toThrow("retry.statusCodes must be an array")
	})
})
