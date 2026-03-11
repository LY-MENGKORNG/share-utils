// The entry point for the http package
import { createHttpInstance } from "./core";

export type * from "#/types";
export { createHttpInstance };

const http = createHttpInstance();

export default http;
