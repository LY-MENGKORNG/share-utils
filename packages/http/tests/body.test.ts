import { describe, expect, it, vi } from "bun:test"
import http from "../src"
import { HTTP_STATUS } from "../src/constants/http-status"
import { getBodySize, streamRequest, streamResponse } from "../src/utils/body"

describe("Response body streaming", () => {
	it("preserves a 200 response body when download progress is enabled", async () => {
		const onDownloadProgress = vi.fn()
		const responseBody = "hello from the server"
		const encoder = new TextEncoder()

		const response = await http.get("https://example.com/download", {
			onDownloadProgress,
			fetch: async () =>
				new Response(responseBody, {
					status: HTTP_STATUS.OK,
					headers: {
						"content-length": String(encoder.encode(responseBody).byteLength),
						"content-type": "text/plain; charset=utf-8",
					},
				}),
		})

		expect(await response.text()).toBe(responseBody)
		expect(onDownloadProgress).toHaveBeenCalledTimes(1)
		expect(onDownloadProgress).toHaveBeenCalledWith(
			expect.objectContaining({
				percent: 1,
				transferredBytes: encoder.encode(responseBody).byteLength,
				totalBytes: encoder.encode(responseBody).byteLength,
			}),
			expect.any(Uint8Array)
		)
	})

	it("reports intermediate download progress for multi-chunk streams", async () => {
		const encoder = new TextEncoder()
		const onDownloadProgress = vi.fn()
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(encoder.encode("abc"))
				controller.enqueue(encoder.encode("def"))
				controller.close()
			},
		})

		const response = streamResponse(
			{
				body: stream,
				status: HTTP_STATUS.OK,
				statusText: "OK",
				headers: new Headers({ "content-length": "1" }),
			} as Response,
			onDownloadProgress
		)

		expect(await response.text()).toBe("abcdef")
		expect(onDownloadProgress).toHaveBeenCalledTimes(2)
		expect(onDownloadProgress).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({
				percent: 1 - Number.EPSILON,
				transferredBytes: 3,
				totalBytes: 3,
			}),
			expect.any(Uint8Array)
		)
		expect(onDownloadProgress).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				percent: 1,
				transferredBytes: 6,
				totalBytes: 6,
			}),
			expect.any(Uint8Array)
		)
	})

	it("keeps no-content responses empty when download progress is enabled", async () => {
		const response = await http.get("https://example.com/download", {
			onDownloadProgress: vi.fn(),
			fetch: async () =>
				new Response(null, {
					status: HTTP_STATUS.NO_CONTENT,
				}),
		})

		expect(response.status).toBe(HTTP_STATUS.NO_CONTENT)
		expect(await response.text()).toBe("")
	})

	it("wraps explicit 204 stream responses with an empty body", async () => {
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(new TextEncoder().encode("ignored"))
				controller.close()
			},
		})

		const response = streamResponse(
			{
				body: stream,
				status: HTTP_STATUS.NO_CONTENT,
				statusText: "No Content",
				headers: new Headers(),
			} as Response,
			vi.fn()
		)

		expect(response.status).toBe(HTTP_STATUS.NO_CONTENT)
		expect(await response.text()).toBe("")
	})

	it("returns the original response when there is no body", () => {
		const response = new Response(null, { status: HTTP_STATUS.NO_CONTENT })

		expect(streamResponse(response, vi.fn())).toBe(response)
	})
})

describe("Body utils", () => {
	it("computes sizes for common body types", () => {
		const encoder = new TextEncoder()
		const formData = new FormData()
		formData.append("name", "Codex")
		formData.append("file", new Blob(["abc"]))

		expect(getBodySize(undefined)).toBe(0)
		expect(getBodySize(null)).toBe(0)
		expect(getBodySize("hello")).toBe(encoder.encode("hello").byteLength)
		expect(getBodySize(new Blob(["hello"]))).toBe(5)
		expect(getBodySize(new Uint8Array([1, 2, 3]))).toBe(3)
		expect(getBodySize(new ArrayBuffer(4))).toBe(4)
		expect(getBodySize(new URLSearchParams([["q", "bun"]]))).toBe(
			encoder.encode("q=bun").byteLength
		)
		expect(getBodySize({ ok: true } as never)).toBe(encoder.encode('{"ok":true}').byteLength)
		expect(getBodySize(formData)).toBeGreaterThan(0)
	})

	it("falls back to 0 when object serialization fails", () => {
		const circular: Record<string, unknown> = {}
		circular.self = circular

		expect(getBodySize(circular as never)).toBe(0)
	})

	it("wraps request streams and reports upload progress", async () => {
		const chunks = [new TextEncoder().encode("hello "), new TextEncoder().encode("world")]
		const onUploadProgress = vi.fn()
		const request = new Request("https://example.com/upload", {
			method: "POST",
			body: "hello world",
			duplex: "half",
		} as never)

		const wrapped = streamRequest(request, onUploadProgress, "hello world")

		expect(wrapped).not.toBe(request)
		expect(await wrapped.text()).toBe("hello world")
		expect(onUploadProgress).toHaveBeenCalled()
		expect(onUploadProgress).toHaveBeenLastCalledWith(
			expect.objectContaining({
				percent: 1,
				transferredBytes: chunks[0].byteLength + chunks[1].byteLength,
				totalBytes: chunks[0].byteLength + chunks[1].byteLength,
			}),
			expect.any(Uint8Array)
		)
	})

	it("returns the original request when there is no body", () => {
		const request = new Request("https://example.com/upload", {
			method: "POST",
		})

		expect(streamRequest(request, vi.fn())).toBe(request)
	})
})
