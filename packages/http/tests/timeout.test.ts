import { describe, expect, it } from "bun:test"
import timeout from "../src/utils/timeout"

describe("Timeout utils", () => {
	it("should reject after timeout", async () => {
		const request = new Request("https://example.com")
		const init = {}
		const abortController = new AbortController()
		const options = {
			timeout: 5,
			fetch: async () => {
				await new Promise((resolve) => setTimeout(resolve, 20))
				return new Response("OK")
			},
		}

		await expect(timeout(request, init, abortController, options)).rejects.toThrow()
		expect(abortController.signal.aborted).toBe(true)
	})

	it("should resolve if fetch completes before timeout", async () => {
		const request = new Request("https://example.com")
		const init = {}
		const abortController = new AbortController()
		const options = {
			timeout: 20,
			fetch: async () => {
				await new Promise((resolve) => setTimeout(resolve, 5))
				return new Response("OK")
			},
		}

		await expect(timeout(request, init, abortController, options)).resolves.toBeInstanceOf(Response)
		expect(abortController.signal.aborted).toBe(false)
	})
})
