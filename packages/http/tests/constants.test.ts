import { afterEach, describe, expect, it } from "bun:test"

const ORIGINAL_ABORT_SIGNAL = globalThis.AbortSignal
const ORIGINAL_ABORT_CONTROLLER = globalThis.AbortController
const ORIGINAL_READABLE_STREAM = globalThis.ReadableStream
const ORIGINAL_REQUEST = globalThis.Request

async function importConstantsModule(suffix: string) {
	return import(`../src/constants/index.ts?${suffix}`)
}

describe("Constants environment detection", () => {
	afterEach(() => {
		globalThis.AbortSignal = ORIGINAL_ABORT_SIGNAL
		globalThis.AbortController = ORIGINAL_ABORT_CONTROLLER
		globalThis.ReadableStream = ORIGINAL_READABLE_STREAM
		globalThis.Request = ORIGINAL_REQUEST
	})

	it("detects the current runtime capabilities", async () => {
		const constants = await importConstantsModule(`default-${Date.now()}`)

		expect(typeof constants.supportsAbortController).toBe("boolean")
		expect(typeof constants.supportsAbortSignal).toBe("boolean")
		expect(typeof constants.supportsResponseStreams).toBe("boolean")
		expect(typeof constants.supportsRequestStreams).toBe("boolean")
		expect(constants.stop).toBeTypeOf("symbol")
	})

	it("returns false for request streams when the runtime reports unsupported BodyInit", async () => {
		class FakeRequest {
			headers = new Headers()

			constructor() {
				throw new Error("unsupported BodyInit type")
			}
		}

		// @ts-expect-error test override
		globalThis.ReadableStream = class FakeReadableStream {}
		// @ts-expect-error test override
		globalThis.Request = FakeRequest

		const constants = await importConstantsModule(`unsupported-${Date.now()}`)

		expect(constants.supportsRequestStreams).toBe(false)
	})

	it("rethrows unexpected request stream detection errors", async () => {
		class FakeRequest {
			headers = new Headers()

			constructor() {
				throw new Error("boom")
			}
		}

		// @ts-expect-error test override
		globalThis.ReadableStream = class FakeReadableStream {}
		// @ts-expect-error test override
		globalThis.Request = FakeRequest

		await expect(importConstantsModule(`throws-${Date.now()}`)).rejects.toThrow("boom")
	})
})
