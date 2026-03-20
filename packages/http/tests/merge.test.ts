import { describe, expect, it } from "bun:test"
import { deepMerge, mergeHeaders, mergeHooks, validateAndMerge } from "../src/utils/merge"

describe("Merge utils", () => {
	it("validates options are objects", () => {
		expect(() =>
			validateAndMerge(
				// @ts-expect-error runtime validation
				"invalid"
			)
		).toThrow("The `options` argument must be an object")
	})

	it("merges headers and removes values explicitly set to undefined via Headers", () => {
		const result = mergeHeaders(
			{ authorization: "Bearer token", accept: "application/json" },
			new Headers({
				authorization: "undefined",
				"x-request-id": "123",
			})
		)

		expect(result.get("authorization")).toBeNull()
		expect(result.get("accept")).toBe("application/json")
		expect(result.get("x-request-id")).toBe("123")
	})

	it("merges hooks and resets a hook array when explicitly undefined", () => {
		const hook = () => undefined
		const result = mergeHooks(
			{
				beforeRequest: [hook],
				beforeRetry: [hook],
			},
			{
				beforeRequest: undefined,
			}
		)

		expect(result.beforeRequest).toEqual([])
		expect(result.beforeRetry).toEqual([hook])
		expect(result.afterResponse).toEqual([])
		expect(result.beforeError).toEqual([])
	})

	it("deep merges context shallowly and appends search params", () => {
		const merged = deepMerge(
			{
				context: { requestId: "a", role: "user" },
				searchParams: { page: 1 },
				headers: { accept: "application/json" },
			},
			{
				context: { role: "admin" },
				searchParams: new URLSearchParams([["q", "bun"]]),
				headers: { authorization: "Bearer token" },
			}
		)

		expect(merged.context).toEqual({ requestId: "a", role: "admin" })
		expect(merged.headers).toBeInstanceOf(Headers)
		expect(merged.headers.get("authorization")).toBe("Bearer token")
		expect(merged.searchParams).toBeInstanceOf(URLSearchParams)
		expect((merged.searchParams as URLSearchParams).toString()).toBe("page=1&q=bun")
	})

	it("merges array and string search params and validates array tuple shape", () => {
		const merged = deepMerge(
			{
				searchParams: [
					["page", 1],
					["enabled", true],
				],
			},
			{
				searchParams: "q=bun",
			}
		)

		expect((merged.searchParams as URLSearchParams).toString()).toBe("page=1&enabled=true&q=bun")

		expect(() =>
			deepMerge(
				{ searchParams: { page: 1 } },
				{
					searchParams: [["missing-value"]] as never,
				}
			)
		).toThrow("Array search parameters must be provided in [[key, value], ...] format")
	})

	it("rejects invalid context values and supports clearing search params", () => {
		expect(() =>
			deepMerge({
				context: [] as never,
			})
		).toThrow("The `context` option must be an object")

		const merged = deepMerge(
			{
				searchParams: { q: "bun" },
			},
			{
				searchParams: undefined,
			}
		)

		expect("searchParams" in merged).toBe(false)
	})

	it("combines multiple abort signals", () => {
		const first = new AbortController()
		const second = new AbortController()
		const merged = deepMerge({ signal: first.signal }, { signal: second.signal })

		expect(merged.signal).toBeDefined()
		expect(merged.signal).not.toBe(first.signal)
		expect(merged.signal).not.toBe(second.signal)
	})

	it("keeps a single abort signal unchanged", () => {
		const controller = new AbortController()
		const merged = deepMerge({ signal: controller.signal })

		expect(merged.signal).toBe(controller.signal)
	})
})
