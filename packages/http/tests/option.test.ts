import { describe, expect, it } from "bun:test"
import { findUnknownOptions, hasSearchParameters } from "../src/utils/option"

describe("Option utils", () => {
	it("returns only unknown or vendor-specific options", () => {
		const request = new Request("https://example.com")
		const options = {
			method: "POST",
			json: { ok: true },
			foo: "bar",
			next: { revalidate: 60 },
			url: "https://ignored-because-request-property-exists.com",
		}

		expect(findUnknownOptions(request, options)).toEqual({
			foo: "bar",
			next: { revalidate: 60 },
		})
	})

	it("detects whether search parameters are present", () => {
		expect(hasSearchParameters(undefined)).toBe(false)
		expect(hasSearchParameters("")).toBe(false)
		expect(hasSearchParameters("q=bun")).toBe(true)
		expect(hasSearchParameters([])).toBe(false)
		expect(hasSearchParameters([["q", "bun"]])).toBe(true)
		expect(hasSearchParameters({})).toBe(false)
		expect(hasSearchParameters({ q: "bun" })).toBe(true)
		expect(hasSearchParameters(new URLSearchParams())).toBe(false)
		expect(hasSearchParameters(new URLSearchParams([["q", "bun"]]))).toBe(true)
	})
})
