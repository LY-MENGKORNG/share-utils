import { describe, it, expect } from "bun:test"
import { createTextDecoder } from "../text"

describe("Text decoding utils", () => {
  it("should decode text correctly", () => {
    const result = createTextDecoder("text/plain")
    expect(result).toBeInstanceOf(TextDecoder)
  })

  it("should use charset from content type", () => {
    const result = createTextDecoder("text/plain; charset=utf-8")
    expect(result).toBeInstanceOf(TextDecoder)
  })
})
