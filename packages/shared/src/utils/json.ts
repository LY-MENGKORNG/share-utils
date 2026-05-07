import type { Result } from "#/types/result"
import { safeTry } from "./safe-try"

class ParseError extends Error {
  constructor(str: string) {
    super(`Unabled to parse invalid JSON string: ${str}`)
    this.name = "ParseError"
  }
}

export function safeParse<T>(str: string): Result<T, ParseError> {
  const result = safeTry<T, ParseError>(() => JSON.parse(str) as T)

  if (!result.success) {
    result.err = new ParseError(str)
  }
  return result
}
