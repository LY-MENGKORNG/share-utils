import { describe, expect, it } from "bun:test";
import { capitalize } from "../utils/string";

describe("String Utils", () => {
	describe("capitalize", () => {
		it("should capitalize the first letter of a string", () => {
			expect(capitalize("hello")).toBe("Hello");
		});

		it("should return the same string if it starts with a capital letter", () => {
			expect(capitalize("Hello")).toBe("Hello");
		});

		it("should return an empty string if the input is empty", () => {
			expect(capitalize("")).toBe("");
		});

		it("should return the same string if it contains only one character", () => {
			expect(capitalize("a")).toBe("A");
		});

		it("should not be modified if its first character is a non-alphabetic character", () => {
			expect(capitalize("!hello")).not.toBe("!Hello");
		});
	});
});
