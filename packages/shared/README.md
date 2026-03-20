# `@repo/shared`

General-purpose utility functions and shared TypeScript types.

This package can be consumed either from the package root or through subpath imports.

## What Is Included

- `safeTry` for result-based sync and async error handling
- `debounce` for cancellable debounced function wrappers
- `capitalize` for simple string capitalization
- `formatCurrency` for locale-aware currency formatting
- shared utility and type definitions under `types/`

## Import Style

Import from the package root:

```ts
import { capitalize, debounce, formatCurrency, safeTry } from "@repo/shared"
```

Or use subpath imports:

```ts
import { safeTry } from "@repo/shared/utils/safe-try"
import { debounce } from "@repo/shared/utils/debounce"
import { capitalize } from "@repo/shared/utils/string"
import { formatCurrency } from "@repo/shared/utils/currency"
```

## Utilities

### `safeTry`

Wraps a synchronous function and returns a discriminated result:

```ts
import { safeTry } from "@repo/shared/utils/safe-try"

const result = safeTry(() => JSON.parse('{"ok":true}'))

if (result.success) {
	console.log(result.value)
} else {
	console.error(result.err)
}
```

For async work, use `safeTry.async` with either a function returning a promise or a promise directly:

```ts
const result = await safeTry.async(async () => fetch("/api").then((res) => res.json()))
```

### `debounce`

Creates a debounced wrapper and returns a promise for the eventual result.

```ts
import { debounce } from "@repo/shared/utils/debounce"

const save = debounce(
	(value: string) => value.trim(),
	200,
	{ isImmediate: false, maxWait: 1000 }
)

const result = await save("  hello  ")
```

The returned function also includes `.cancel(reason)`.

### `capitalize`

Capitalizes the first character of a string:

```ts
import { capitalize } from "@repo/shared/utils/string"

capitalize("hello") // "Hello"
```

### `formatCurrency`

Formats a number with `Intl.NumberFormat`.

By default, the helper uses the `KHR` currency unless you override it:

```ts
import { formatCurrency } from "@repo/shared/utils/currency"

formatCurrency(1234.56, "km-KH") // Khmer riel by default
formatCurrency(1234.56, "en-US", { currency: "USD" })
```

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
