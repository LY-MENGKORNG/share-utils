import { afterEach, describe, expect, it, mock } from "bun:test"
import { createTextDecoder } from "../src/utils/text"

describe("Text decoding utils", () => {
	const OriginalTextDecoder = globalThis.TextDecoder

	afterEach(() => {
		globalThis.TextDecoder = OriginalTextDecoder
	})

	it("should decode text correctly", () => {
		const result = createTextDecoder("text/plain")
		expect(result).toBeInstanceOf(TextDecoder)
	})

	it("should use charset from content type", () => {
		const result = createTextDecoder("text/plain; charset=utf-8")
		expect(result).toBeInstanceOf(TextDecoder)
	})

	it("should use runtime-supported non-utf charsets from content type", () => {
		const seenArgs: unknown[] = []

		globalThis.TextDecoder = class extends OriginalTextDecoder {
			// biome-ignore lint/suspicious/noExplicitAny: constructor args need to match the platform type surface
			constructor(...args: any[]) {
				seenArgs.push(args[0])
				super(...args)
			}
		}

		const result = createTextDecoder("text/plain; charset=shift_jis")

		expect(result).toBeInstanceOf(TextDecoder)
		expect(seenArgs[0]).toBe("shift_jis")
	})

	it("should fall back to the default decoder when charset is unsupported", () => {
		const calls = mock((label?: string) => {
			if (label === "x-unknown-charset") {
				throw new RangeError("Unsupported encoding")
			}
		})

		globalThis.TextDecoder = class extends OriginalTextDecoder {
			// biome-ignore lint/suspicious/noExplicitAny: constructor args need to match the platform type surface
			constructor(...args: any[]) {
				calls(args[0] as string | undefined)
				super()
			}
		}

		const result = createTextDecoder("text/plain; charset=x-unknown-charset")

		expect(result).toBeInstanceOf(TextDecoder)
		expect(calls).toHaveBeenNthCalledWith(1, "x-unknown-charset")
		expect(calls).toHaveBeenNthCalledWith(2, undefined)
	})

	it("should use default charset when none is specified", () => {
		let withArgs = false

		globalThis.TextDecoder = class extends OriginalTextDecoder {
			// biome-ignore lint/suspicious/noExplicitAny: constructor args need to match the platform type surface
			constructor(...args: any[]) {
				withArgs = args[0] !== undefined
				super(...args)
			}
		}

		const result = createTextDecoder("")

		expect(result).toBeInstanceOf(TextDecoder)
		expect(withArgs).toBe(false)
	})
})
