import { safeTry } from "@repo/shared/utils/safe-try"
import type { ZodError, ZodObject, ZodRawShape } from "zod"

export default function parseEnv<T extends ZodRawShape>(
	schema: ZodObject<T>,
	buildEnv: Record<string, string | undefined> = process.env
) {
	const result = safeTry<ReturnType<typeof schema.parse>, ZodError>(() => schema.parse(buildEnv))

	if (result.success) return result.value

	const msg = result.err.issues.map((issue) => String(issue.path[0])).join(", ")

	const e = new Error(`Missing required values: ${msg}`)
	e.stack = ""

	throw e
}
