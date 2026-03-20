import { describe, expect, it } from "bun:test"
import { isObject } from "../src/utils/object"

describe("Object utils", () => {
	describe("isObject", () => {
		it("returns true for plain objects", () => {
			expect(isObject({ hello: "world" })).toBe(true)
		})

		it("returns true for arrays because they are objects at runtime", () => {
			expect(isObject([])).toBe(true)
		})

		it("returns false for null", () => {
			expect(isObject(null)).toBe(false)
		})

		it("returns false for primitives", () => {
			expect(isObject("hello")).toBe(false)
			expect(isObject(123)).toBe(false)
			expect(isObject(false)).toBe(false)
			expect(isObject(undefined)).toBe(false)
		})
	})
})
