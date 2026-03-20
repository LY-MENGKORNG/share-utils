import { describe, expect, it } from "bun:test"
import delay from "../src/utils/delay"

describe("Delay utils", () => {
	it("resolves after the given delay", async () => {
		await expect(delay(1, {})).resolves.toBeUndefined()
	})

	it("rejects when the signal aborts during the delay", async () => {
		const controller = new AbortController()
		const reason = new Error("aborted")
		const promise = delay(20, { signal: controller.signal })

		setTimeout(() => controller.abort(reason), 1)

		await expect(promise).rejects.toBe(reason)
	})

	it("throws immediately when the signal is already aborted", async () => {
		const controller = new AbortController()
		const reason = new Error("already aborted")
		controller.abort(reason)

		await expect(delay(20, { signal: controller.signal })).rejects.toBe(reason)
	})
})
