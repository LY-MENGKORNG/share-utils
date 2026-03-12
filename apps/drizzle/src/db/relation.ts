import { defineRelations } from "drizzle-orm"
import { task } from "./schema/task"

export const schema = {
  task,
}

export const relations = defineRelations(schema, (_r) => ({
  task: {},
}))
