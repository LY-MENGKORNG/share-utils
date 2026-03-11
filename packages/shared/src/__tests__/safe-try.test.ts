import { describe, expect, it } from "bun:test";
import { fetchHorses, FetchHorsesError, horses } from "./helpers/horse";
import { safeTry } from "#/utils/safe-try";

describe("▄︻デ══━一💥 Exception handling", () => {
  describe("Expectable Errors", () => {
    it("Should handle syncronous operation correctly", () => {
      const mockParseErr = () => JSON.parse("Hi mom, this must be an error!");

      // Falsty
      const result = safeTry(mockParseErr);

      expect(result.success).toBeFalse();

      // @ts-ignore
      expect(result.err).toBeInstanceOf(Error);
      // @ts-ignore
      expect(result.err.message).toContain(
        "JSON Parse error: Unexpected identifier",
      );

      // Truely
      const result2 = safeTry(() => JSON.parse('{"message": "hi mom!"}'));

      expect(result2.success).toBeTrue();

      // @ts-ignore
      expect(result2.value).toEqual({ message: "hi mom!" });
    });

    it("Should handle asyncronous operation on function returning promise correctly", async () => {
      // truely
      const result = await safeTry.async(fetchHorses);

      expect(result.success).toBeTrue();

      // @ts-ignore
      expect(result.value).toHaveLength(horses.length);

      // Falsty
      const mockFetchHorsesFailFn = () => fetchHorses({ error: true });
      const result2 = await safeTry.async(mockFetchHorsesFailFn);

      expect(result2.success).toBeFalse();

      // @ts-ignore
      expect(result2.err).toBeInstanceOf(FetchHorsesError);
      // @ts-ignore
      expect(result2.err.message).toContain("Failed to fetch horses");
    });

    it("Should handle asyncronous operation on promise parameter correctly", async () => {
      const result = await safeTry.async(fetchHorses());

      expect(result.success).toBeTrue();

      // @ts-ignore
      expect(result.value).toHaveLength(horses.length);
    });
  });
});
