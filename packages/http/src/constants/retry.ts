import type { HttpMethod } from "#/types/option"

export const retryMethods: HttpMethod[] = [
	"get",
	"put",
	"head",
	"delete",
	"options",
	"trace",
] as const

export const retryStatusCodes = [408, 413, 429, 500, 502, 503, 504] as const

export const retryAfterStatusCodes = [413, 429, 503] as const
