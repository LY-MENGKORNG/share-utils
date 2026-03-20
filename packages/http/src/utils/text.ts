import { safeTry } from "@repo/shared/utils/safe-try"
import type { Encoding } from "bun"

export const createTextDecoder = (contentType: string): TextDecoder => {
	const match = /;\s*charset\s*=\s*(?:"([^"]+)"|([^;,\s]+))/i.exec(contentType)
	const charset = (match?.[1] ?? match?.[2]) as Encoding | undefined

	if (!charset) {
		return new TextDecoder()
	}

	const result = safeTry(() => new TextDecoder(charset))
	return result.success ? result.value : new TextDecoder()
}
