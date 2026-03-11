import type { stop } from "#/constants";
import type { retry } from "#/utils/retry";
import type { Input, Options } from "./option";

export type HttpInstance = {
  /**
   * Fetch the given `url`.
   * @param url - `Request` object, `URL` object, or URL string.
   * @returns A promise with `Body` method added.
   * @example
   * ```ts
   * import http from "http";
   * const json = await http("https://hi-mom.com").json();
   *
   * console.log(json);
   * => { message: "Hi Mom! 🤱" }
   * ```
   */
  <T>(url: Input, options?: Options): ResponsePromise<T>;
  get: <T>(url: Input, options?: Options) => ResponsePromise<T>;
  post: <T>(url: Input, options?: Options) => ResponsePromise<T>;
  put: <T>(url: Input, options?: Options) => ResponsePromise<T>;
  delete: <T>(url: Input, options?: Options) => ResponsePromise<T>;
  patch: <T>(url: Input, options?: Options) => ResponsePromise<T>;
  head: (url: Input, options?: Options) => ResponsePromise;
  create: (defaultOptions?: Options) => HttpInstance;
  extend: (
    defaultOptions: Options | ((parentOptions: Options) => Options),
  ) => HttpInstance;
  readonly stop: typeof stop;
  readonly retry: typeof retry;
};

export type HttpRequest<T = unknown> = {
  json: <J = T>() => Promise<J>;
} & Request;

export type HttpResponse<T = unknown> = {
  json: <J = T>() => Promise<J>;
} & Response;

/**
 * Returns a `Response` object with `Body` methods added for convenience. So you can, for example, call `http.get(input).json()` directly without having to await the `Response` first. When called like that, an appropriate `Accept` header will be set depending on the body method used. Unlike the `Body` methods of `window.Fetch`; these will throw an `HTTPError` if the response status is not in the range of `200...299`. Also, `.json()` will return `undefined` if body is empty or the response status is `204` instead of throwing a parse error due to an empty body.
 */
export type ResponsePromise<T = unknown> = {
  arrayBuffer: () => Promise<ArrayBuffer>;

  blob: () => Promise<Blob>;

  formData: () => Promise<FormData>;

  /**
   * Get the response body as raw bytes.
   * Note: This shortcut is only available when the runtime supports `Response.prototype.bytes()`.
   */
  bytes: () => Promise<Uint8Array>;

  /**
   * @example
   * ```
   * import http from 'http';
   *
   * interface User {
   *   id: number;
   *   name: string;
   * }
   *
   * const user = await http.get(...).json<User>();
   * ```
   */
  json: <J = T>() => Promise<J | undefined>;

  text: () => Promise<string>;
} & Promise<HttpResponse<T>>;
