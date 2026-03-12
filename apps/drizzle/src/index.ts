import db from "./db";
import { schema } from "./db/relation";

const server = Bun.serve({
  port: 9999,
  routes: {
    "/tasks": {
      GET: async () => {
        return new Response(JSON.stringify(await db.query.task.findMany()));
      },
      POST: async (req) => {
        const body = await req.json();
        await db.insert(schema.task).values(body);
        return new Response(JSON.stringify(await db.query.task.findMany()));
      },
    },
  },
  fetch() {
    return new Response("Hi mom!");
  },
});

console.debug(`Server running at http://localhost:${server.port}`);