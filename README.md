# share-utils

Reusable TypeScript utilities organized as a Bun monorepo.

## What This Repo Contains

This workspace currently has two packages:

- [`@repo/shared`](./packages/shared) for general-purpose utility functions and types
- [`@repo/http`](./packages/http) for a small Fetch-based HTTP client with retries, hooks, and timeout support

The repo uses:

- [Bun](https://bun.com) for package management, scripts, tests, and package builds
- [Turborepo](https://turbo.build/repo) to run workspace tasks
- [TypeScript](https://www.typescriptlang.org/) with a shared internal config in [`internal/tsconfig`](./internal/tsconfig)
- [Biome](https://biomejs.dev/) for formatting and linting

## Repository Layout

```text
.
├── internal/
│   └── tsconfig/      Shared TypeScript configuration package
├── packages/
│   ├── http/          Fetch-based HTTP client package
│   └── shared/        Shared helpers and utility types
├── package.json       Workspace scripts
├── turbo.json         Turborepo task graph
└── tsconfig.base.json Base TypeScript defaults for the repo
```

## Getting Started

```bash
bun install
```

## Workspace Commands

Run these from the repository root:

```bash
bun run build
bun run typecheck
bun run test
bun run lint
bun run lint:fix
bun run fmt
```

## Packages

### `@repo/shared`

Small reusable helpers and types used across applications and packages in this workspace.

Current utility areas include:

- safe execution helpers
- debouncing
- string helpers
- currency formatting
- shared type definitions

Read more in [`packages/shared/README.md`](./packages/shared/README.md).

### `@repo/http`

A lightweight HTTP client built on top of the Fetch API.

Current features include:

- request method shortcuts like `get`, `post`, and `patch`
- request instances with defaults
- JSON request and response helpers
- retry configuration
- timeout handling
- lifecycle hooks
- upload and download progress callbacks

Read more in [`packages/http/README.md`](./packages/http/README.md).

## Notes

- This repo is structured as a workspace-first utility library. Packages are intended to be consumed through workspace imports.
- Package APIs are still evolving. The most accurate reference is the source in each package.
