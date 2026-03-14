import type { HttpRequest } from "#/types";

export class TimeoutError extends Error {
	public request: HttpRequest;

	constructor(request: Request) {
		super(`Request timed out: ${request.method} ${request.url}`);
		this.name = "TimeoutError";
		this.request = request;
	}
}
