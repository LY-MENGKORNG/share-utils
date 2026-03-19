import { safeTry } from "@repo/shared/utils/safe-try"
import type { HttpOptionsRegistry } from "#/types/option"

const { AbortSignal, AbortController, ReadableStream, Request } = globalThis

export const supportsAbortController = typeof AbortController === "function"
export const supportsAbortSignal =
	typeof AbortSignal === "function" && typeof AbortSignal.any === "function"
export const supportsResponseStreams = typeof ReadableStream === "function"
export const supportsFormData = typeof FormData === "function"

export const supportsRequestStreams = (() => {
	let duplexAccessed = false
	let hasContentType = false
	const supportsReadableStream = typeof ReadableStream === "function"
	const supportsRequest = typeof Request === "function"

	if (supportsReadableStream && supportsRequest) {
		const result = safeTry(() => {
			// @ts-expect-error
			hasContentType = new Request("https://empty.invalid", {
				body: new ReadableStream(),
				method: "POST",
				get duplex() {
					duplexAccessed = true
					return "half"
				},
			}).headers.has("Content-Type")
		})
		if (!result.success) {
			if (result.err instanceof Error && result.err.message === "unsupported BodyInit type") {
				return false
			}
			throw result.err
		}
	}

	return duplexAccessed && !hasContentType
})()

export const maxSafeTimeout = 2_147_483_647 as const

export const usualFormBoundarySize = new TextEncoder().encode(
	"------WebKitFormBoundaryaxpyiPgbbPti10Rw"
).length

export const httpOptionKey: HttpOptionsRegistry = {
	json: true,
	parseJson: true,
	stringifyJson: true,
	searchParams: true,
	prefixUrl: true,
	retry: true,
	timeout: true,
	hooks: true,
	throwHttpErrors: true,
	onDownloadProgress: true,
	onUploadProgress: true,
	fetch: true,
	context: true,
} as const

export const vendorSpecificOptions = {
	next: true,
} as const

export const stop = Symbol("stop")
