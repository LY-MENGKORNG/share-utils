import { describe, expect, it, vi } from "bun:test";
import parseEnv from "../src";
import { z } from "zod";

async function factory() {
	const safeTryUtils = await import("@repo/shared/utils/safe-try");
	const safeTrySpy = vi.spyOn(safeTryUtils, "safeTry");

	return {
		safeTrySpy,
		[Symbol.dispose]: () => {
			vi.clearAllMocks();
		},
	};
}

describe("parseEnv", () => {
	it("Should throw error when env variable is missing", async () => {
		await using _fac = await factory();
		const envSchema = z.object({ FOO: z.string() });
		const envBuilder = {};
		expect(() => parseEnv(envSchema, envBuilder)).toThrow("Missing required values: FOO");
	});

	it("Should parse env variable when env variable is present", () => {
		const envSchema = z.object({ FOO: z.string() });
		const envBuilder = { FOO: "bar" };
		expect(parseEnv(envSchema, envBuilder)).toEqual({ FOO: "bar" });
	});
});
