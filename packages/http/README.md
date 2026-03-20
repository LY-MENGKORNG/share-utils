# `@repo/http`

A lightweight HTTP client built on top of the Fetch API.

This package wraps `fetch` with a more ergonomic API while staying close to the platform request and response model.

## Features

- direct call style: `http(url, options)`
- method shortcuts: `http.get()`, `http.post()`, `http.patch()`, and more
- request instances with inherited defaults
- JSON request body support through `json`
- response shortcuts like `.json()` and `.text()`
- configurable retries with backoff and optional jitter
- timeout handling
- request lifecycle hooks
- upload and download progress callbacks
- custom `fetch`, custom JSON parsing/stringifying, and request context

## Basic Usage

```ts
import http from "@repo/http"

const user = await http.get("https://api.example.com/users/1").json<{
	id: number
	name: string
}>()
```

You can also call the default instance directly:

```ts
const response = await http("https://api.example.com/health")
```

## Creating an Instance

Use `createHttpInstance` to define shared defaults:

```ts
import { createHttpInstance } from "@repo/http"

const api = createHttpInstance({
	prefixUrl: "https://api.example.com",
	timeout: 5000,
	headers: {
		authorization: "Bearer token",
	},
})

const profile = await api.get("me").json()
```

You can also derive new instances:

```ts
const authenticated = api.extend((defaults) => ({
	...defaults,
	headers: {
		...Object.fromEntries(new Headers(defaults.headers).entries()),
		"x-role": "admin",
	},
}))
```

## Request Options

Common options supported by the client:

- `json`: serialize a request body as JSON and set `content-type`
- `parseJson`: custom response JSON parser
- `stringifyJson`: custom request JSON serializer
- `searchParams`: append query parameters to the URL
- `prefixUrl`: prepend a base URL for string inputs
- `retry`: configure retry behavior
- `timeout`: request timeout in milliseconds, or `false` to disable
- `hooks`: lifecycle hooks for request and response handling
- `throwHttpErrors`: boolean or function controlling non-2xx error throwing
- `onDownloadProgress`: receive streamed download progress updates
- `onUploadProgress`: receive streamed upload progress updates
- `fetch`: provide a custom fetch implementation
- `context`: attach arbitrary metadata to normalized options

The request input can be a `string`, `URL`, or `Request`.

## Response Shortcuts

The returned promise is extended with body helpers so you can read the response directly:

```ts
const text = await http.get("https://example.com").text()
const json = await http.get("https://example.com/data").json()
```

Available shortcuts include:

- `.json()`
- `.text()`
- `.arrayBuffer()`
- `.blob()`
- `.formData()`
- `.bytes()` when supported by the runtime

`json()` returns `undefined` for `204` responses and empty bodies.

## JSON Requests

```ts
await http.post("https://api.example.com/posts", {
	json: {
		title: "Hello",
		published: true,
	},
})
```

## Query Parameters

```ts
await http.get("https://api.example.com/search", {
	searchParams: {
		q: "bun",
		page: 1,
		includeDrafts: false,
	},
})
```

Undefined values in plain-object `searchParams` are omitted.

## Retries

Configure retry behavior with a number or a detailed object:

```ts
await http.get("https://api.example.com/items", {
	retry: {
		limit: 3,
		retryOnTimeout: true,
	},
})
```

Supported retry controls include:

- `limit`
- `methods`
- `statusCodes`
- `afterStatusCodes`
- `maxRetryAfter`
- `backoffLimit`
- `delay`
- `jitter`
- `retryOnTimeout`
- `shouldRetry`

The package also exposes `http.retry()` for forced retries from `afterResponse` hooks and `http.stop` to stop retries from `beforeRetry` hooks.

## Hooks

Supported hooks:

- `beforeRequest`
- `beforeRetry`
- `afterResponse`
- `beforeError`

Example:

```ts
const api = createHttpInstance({
	hooks: {
		beforeRequest: [
			({ request }) => {
				request.headers.set("x-trace-id", crypto.randomUUID())
			},
		],
	},
})
```

Hooks receive the normalized options and current retry count.

## Errors

The client uses custom error types under `src/errors/`:

- `HTTPError` for non-success HTTP responses when `throwHttpErrors` is enabled
- `TimeoutError` for timed out requests
- `ForceRetryError` internally for forced retry control flow
- `NonError` to wrap non-`Error` thrown values

`HTTPError` includes the `request`, `response`, normalized options, and parsed response data when available.

## Development

Run these commands from the repository root:

```bash
bun run build
bun run typecheck
bun run test
```

Or run package commands from this directory:

```bash
bun run build
bun run typecheck
bun run test
```
