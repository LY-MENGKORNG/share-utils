import { describe, expect, it, vi } from "bun:test"
import http, { createHttpInstance } from "../src"
import { HTTPError } from "../src/errors/http-error"

describe("HTTP instance", () => {
	it("supports prefixUrl and method shortcuts", async () => {
		const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = new Request(input, init)
			expect(request.url).toBe("https://api.example.com/users")
			expect(request.method).toBe("GET")
			return new Response('{"id":1}', {
				headers: { "content-type": "application/json" },
			})
		})

		const api = createHttpInstance({
			prefixUrl: "https://api.example.com",
			fetch,
		})

		await expect(api.get("users").json()).resolves.toEqual({ id: 1 })
		expect(fetch).toHaveBeenCalledTimes(1)
	})

	it("supports create for fresh instances and extend for inherited defaults", async () => {
		const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = new Request(input, init)
			expect(request.url).toBe("https://service.example.com/v1/users?role=admin")
			expect(request.headers.get("x-tenant")).toBe("core")
			return new Response("ok")
		})

		const base = createHttpInstance({
			prefixUrl: "https://service.example.com",
			headers: { "x-tenant": "core" },
			fetch,
		})
		const created = base.create({
			prefixUrl: "https://service.example.com/v1",
			headers: { "x-tenant": "core" },
			fetch,
		})
		const extended = created.extend((defaults) => ({
			...defaults,
			searchParams: { role: "admin" },
		}))

		await expect(extended.get("users").text()).resolves.toBe("ok")
		expect(extended.stop).toBe(base.stop)
		expect(extended.retry).toBe(base.retry)
	})

	it("serializes json bodies and sets the content-type header", async () => {
		const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = new Request(input, init)
			expect(request.method).toBe("POST")
			expect(request.headers.get("content-type")).toBe("application/json")
			expect(await request.text()).toBe('{"name":"Codex"}')

			return new Response(null, { status: 204 })
		})

		await expect(
			http
				.post("https://example.com/users", {
					json: { name: "Codex" },
					fetch,
				})
				.json()
		).resolves.toBeUndefined()
	})

	it("runs beforeRequest hooks and allows them to mutate the request", async () => {
		const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = new Request(input, init)
			expect(request.headers.get("x-trace-id")).toBe("trace-1")
			return new Response("ok")
		})

		const api = createHttpInstance({
			fetch,
			hooks: {
				beforeRequest: [
					({ request }) => {
						request.headers.set("x-trace-id", "trace-1")
					},
				],
			},
		})

		await expect(api.get("https://example.com").text()).resolves.toBe("ok")
	})

	it("allows beforeRequest hooks to short-circuit with a response", async () => {
		const fetch = vi.fn(async () => new Response("network"))
		const api = createHttpInstance({
			fetch,
			hooks: {
				beforeRequest: [() => new Response("short-circuit")],
			},
		})

		await expect(api.get("https://example.com").text()).resolves.toBe("short-circuit")
		expect(fetch).not.toHaveBeenCalled()
	})

	it("parses error response data and passes it through beforeError hooks", async () => {
		const api = createHttpInstance({
			fetch: async () =>
				new Response('{"message":"denied"}', {
					status: 403,
					statusText: "Forbidden",
					headers: { "content-type": "application/json" },
				}),
			hooks: {
				beforeError: [
					({ error }) => {
						error.message = `Decorated: ${error.message}`
						return error
					},
				],
			},
		})

		try {
			await api.get("https://example.com/admin").json()
			throw new Error("Expected request to fail")
		} catch (error) {
			expect(error).toBeInstanceOf(HTTPError)
			expect((error as HTTPError<{ message: string }>).data).toEqual({ message: "denied" })
			expect((error as Error).message).toContain("Decorated:")
		}
	})

	it("returns undefined for empty json responses", async () => {
		const fetch = vi.fn(
			async () =>
				new Response("", {
					status: 200,
					headers: { "content-type": "application/json" },
				})
		)

		await expect(http.get("https://example.com/empty", { fetch }).json()).resolves.toBeUndefined()
	})

	it("supports custom parseJson for successful responses", async () => {
		const fetch = vi.fn(
			async () =>
				new Response("wrapped", {
					headers: { "content-type": "application/json" },
				})
		)

		await expect(
			http
				.get("https://example.com/custom", {
					fetch,
					parseJson: (text) => ({ parsed: text.toUpperCase() }),
				})
				.json()
		).resolves.toEqual({ parsed: "WRAPPED" })
	})

	it("allows throwHttpErrors to opt out for a status code", async () => {
		const response = await http.get("https://example.com/maybe-ok", {
			throwHttpErrors: (status) => status >= 500,
			fetch: async () => new Response("forbidden", { status: 403, statusText: "Forbidden" }),
		})

		expect(response.status).toBe(403)
		expect(await response.text()).toBe("forbidden")
	})

	it("filters undefined search params and supports string search params", async () => {
		const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = new Request(input, init)
			expect(request.url).toBe("https://example.com/search?q=bun&page=2")
			return new Response("ok")
		})

		await expect(
			http
				.get("https://example.com/search", {
					searchParams: { q: "bun", page: 2, ignored: undefined },
					fetch,
				})
				.text()
		).resolves.toBe("ok")

		const fetch2 = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = new Request(input, init)
			expect(request.url).toBe("https://example.com/search?q=bun")
			return new Response("ok")
		})

		await expect(
			http
				.get("https://example.com/search?old=yes", {
					searchParams: "?q=bun",
					fetch: fetch2,
				})
				.text()
		).resolves.toBe("ok")
	})

	it("retries via afterResponse hooks and can swap the request before retry", async () => {
		const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const request = new Request(input, init)

			if (request.url.endsWith("/first")) {
				return new Response("try again", { status: 200 })
			}

			return new Response("second attempt", { status: 200 })
		})

		const api = createHttpInstance({
			fetch,
			retry: { limit: 1, methods: ["get"], delay: () => 0 },
			hooks: {
				afterResponse: [
					({ request, retryCount }) => {
						if (retryCount === 0) {
							return http.retry({
								request: new Request(request.url.replace("/first", "/second")),
							})
						}
					},
				],
			},
		})

		await expect(api.get("https://example.com/first").text()).resolves.toBe("second attempt")
		expect(fetch).toHaveBeenCalledTimes(2)
	})

	it("allows beforeRetry hooks to stop retrying with a custom response", async () => {
		const fetch = vi
			.fn()
			.mockResolvedValueOnce(new Response("fail", { status: 500, statusText: "Server Error" }))
			.mockResolvedValueOnce(new Response("should not happen"))

		const api = createHttpInstance({
			fetch,
			retry: { limit: 1, statusCodes: [500], delay: () => 0 },
			hooks: {
				beforeRetry: [() => new Response("fallback response")],
			},
		})

		await expect(api.get("https://example.com/retry").text()).resolves.toBe("fallback response")
		expect(fetch).toHaveBeenCalledTimes(1)
	})

	it("retries timeout errors when retryOnTimeout is enabled", async () => {
		const fetch = vi
			.fn()
			.mockImplementationOnce(async (input: RequestInfo | URL, init?: RequestInit) => {
				throw new DOMException(
					`Request timed out: ${new Request(input, init).method} ${new Request(input, init).url}`,
					"TimeoutError"
				)
			})
			.mockResolvedValueOnce(new Response("fast"))

		const api = createHttpInstance({
			fetch,
			timeout: false,
			retry: { limit: 1, retryOnTimeout: true, delay: () => 0 },
		})

		await expect(api.get("https://example.com/timeout").text()).resolves.toBe("fast")
		expect(fetch).toHaveBeenCalledTimes(2)
	})

	it("uses fetch directly when timeout is disabled", async () => {
		const fetch = vi.fn(async () => new Response("no-timeout"))

		await expect(
			http
				.get("https://example.com/no-timeout", {
					timeout: false,
					fetch,
				})
				.text()
		).resolves.toBe("no-timeout")
		expect(fetch).toHaveBeenCalledTimes(1)
	})

	it("throws for invalid input when prefixUrl is used with a leading slash", () => {
		expect(() =>
			createHttpInstance({
				prefixUrl: "https://example.com",
			}).get("/users")
		).toThrow("`input` must not begin with a slash when using `prefixUrl`")
	})
})
