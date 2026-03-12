import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const task = sqliteTable("task", {
  id: int("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status"),
})
