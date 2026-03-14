import { describe, expect, it } from "bun:test";
import { safeTry } from "#/utils/safe-try";
import { FetchHorsesError, fetchHorses, horses } from "./helpers/horse";

describe("▄︻デ══━一💥 Exception handling", () => {
	describe("Expectable Errors", () => {
		it("Should handle syncronous operation correctly", () => {
			const mockParseErr = () => JSON.parse("Hi mom, this must be an error!");

			// Falsty
			const result = safeTry(mockParseErr);

			expect(result.success).toBeFalse();

			// @ts-expect-error
			expect(result.err).toBeInstanceOf(Error);
			// @ts-expect-error
			expect(result.err.message).toContain("JSON Parse error: Unexpected identifier");

			// Truely
			const result2 = safeTry(() => JSON.parse('{"message": "hi mom!"}'));

			expect(result2.success).toBeTrue();

			// @ts-expect-error
			expect(result2.value).toEqual({ message: "hi mom!" });
		});

		it("Should handle asyncronous operation on function returning promise correctly", async () => {
			// truely
			const result = await safeTry.async(fetchHorses);

			expect(result.success).toBeTrue();

			// @ts-expect-error
			expect(result.value).toHaveLength(horses.length);

			// Falsty
			const mockFetchHorsesFailFn = () => fetchHorses({ error: true });
			const result2 = await safeTry.async(mockFetchHorsesFailFn);

			expect(result2.success).toBeFalse();

			// @ts-expect-error
			expect(result2.err).toBeInstanceOf(FetchHorsesError);
			// @ts-expect-error
			expect(result2.err.message).toContain("Failed to fetch horses");
		});

		it("Should handle asyncronous operation on promise parameter correctly", async () => {
			const result = await safeTry.async(fetchHorses());

			expect(result.success).toBeTrue();

			// @ts-expect-error
			expect(result.value).toHaveLength(horses.length);
		});
	});
});
