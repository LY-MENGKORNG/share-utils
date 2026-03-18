import { safeTry } from "@repo/shared/utils/safe-try"
import type { Encoding } from "bun"

export const createTextDecoder = (contentType: string): TextDecoder => {
	const match = /;\s*charset\s*=\s*(?:"([^"]+)"|([^;,\s]+))/i.exec(contentType)
	const charset = match?.[1] ?? match?.[2]

	const result = safeTry(() => new TextDecoder(charset as Encoding))

	return result.success ? result.value : new TextDecoder()
}
