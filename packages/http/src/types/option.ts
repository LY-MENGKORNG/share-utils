import type { LiteralUnion, Required } from "@repo/shared/types/common";
import type { Hooks } from "./hook";
import type { RetryOptions } from "./retry";

export type SearchParamsInit =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams
  | undefined;

export type SearchParamsOption =
  | SearchParamsInit
  | Record<string, string | number | boolean | undefined>
  | Array<Array<string | number | boolean>>;

export type RequestHttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "head"
  | "delete";

export type HttpMethod = LiteralUnion<
  RequestHttpMethod | "options" | "trace",
  string
>;

export interface Options extends HttpOptions, Omit<RequestInit, "headers"> {
  method?: LiteralUnion<HttpMethod, string>;

  headers?: HttpHeadersInit;
}

export type Input = string | URL | Request;

export type Progress = {
  percent: number;
  transferredBytes: number;
  /**
	Note: If it's not possible to retrieve the body size, it will be `0`.
	*/
  totalBytes: number;
};

export type HttpHeadersInit =
  | NonNullable<RequestInit["headers"]>
  | Record<string, string | undefined>;

export type HttpOptions = {
  json?: unknown;

  parseJson?: (text: string) => unknown;

  stringifyJson?: (data: unknown) => string;

  searchParams?: SearchParamsOption;

  prefixUrl?: URL | string;

  retry?: RetryOptions | number;

  timeout?: number | false;

  hooks?: Hooks;

  throwHttpErrors?: boolean | ((status: number) => boolean);

  onDownloadProgress?: (progress: Progress, chunk: Uint8Array) => void;

  onUploadProgress?: (progress: Progress, chunk: Uint8Array) => void;

  fetch?: (input: Input, init?: RequestInit) => Promise<Response>;

  context?: Record<string, unknown>;
};

export type HttpOptionsRegistry = { [K in keyof HttpOptions]-?: true };

export type InternalOptions = Required<
  Omit<Options, "hooks" | "retry" | "context" | "throwHttpErrors">,
  "fetch" | "prefixUrl" | "timeout"
> & {
  headers: Required<Headers>;
  hooks: Required<import("./hook").Hooks>;
  retry: Required<Omit<RetryOptions, "shouldRetry">> &
    Pick<RetryOptions, "shouldRetry">;
  prefixUrl: string;
  context: Record<string, unknown>;
  throwHttpErrors: boolean | ((status: number) => boolean);
};

export interface NormalizedOptions extends RequestInit {
  method: NonNullable<RequestInit["method"]>;
  credentials?: NonNullable<RequestInit["credentials"]>;
  retry: RetryOptions;
  prefixUrl: string;
  onDownloadProgress: Options["onDownloadProgress"];
  onUploadProgress: Options["onUploadProgress"];
  context: Record<string, unknown>;
}
