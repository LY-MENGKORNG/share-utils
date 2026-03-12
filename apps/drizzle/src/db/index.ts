import "dotenv/config"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { Database } from "bun:sqlite"
import { relations, schema } from "./relation"

const client = new Database("mydb.sqlite")

const db = drizzle({
  client,
  logger: true,
  relations,
  schema,
})

export default db
