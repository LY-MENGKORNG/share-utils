import { describe, it, expect } from "bun:test"
import parseEnv from ".."
import { z } from "zod"

describe("parseEnv", () => {
  it("Should throw error when env variable is missing", () => {
    const envSchema = z.object({ FOO: z.string() })
    const envBuilder = {}
    expect(() => parseEnv(envSchema, envBuilder)).toThrow("Missing required values: FOO")
  })

  it("Should parse env variable when env variable is present", () => {
    const envSchema = z.object({ FOO: z.string() })
    const envBuilder = { FOO: "bar" }
    expect(parseEnv(envSchema, envBuilder)).toEqual({ FOO: "bar" })
  })
})
