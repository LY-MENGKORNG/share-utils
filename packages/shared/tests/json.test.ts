import { describe, expect, it } from "bun:test"
import { safeParse } from "../src/utils/json"

describe("JSON Utils", () => {
	describe("safeParse Utils", () => {
		it("should throw error as result when it failed", () => {
			const str = "hi mom! this must be an error"
			const result = safeParse(str)
			expect(result.success).toBeFalse()
			expect(result.err.message).toBe(`Unabled to parse invalid JSON string: ${str}`)
		})

		it("should parse a valid json correctly", () => {
			const result = safeParse<{ message: string }>('{"message": "Hi mom!"}')
			expect(result.success).toBeTrue()
			expect(result.value).toEqual({ message: "Hi mom!" })
		})
	})
})
