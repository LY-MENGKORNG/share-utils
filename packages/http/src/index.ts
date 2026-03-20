// The entry point for the http package
import { createHttpInstance } from "./core"

const http = createHttpInstance()

export type * from "#/types"
export type * from "./constants"

export { createHttpInstance }
export default http
