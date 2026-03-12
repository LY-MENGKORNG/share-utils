import http from "#/index"
import { describe, it, expect, mock } from "bun:test"

type Todo = { id: number; title: string; completed: boolean }
const mockInitTodos: Todo[] = [
  { id: 1, title: "Todo 1", completed: false },
  { id: 2, title: "Todo 2", completed: true },
]

async function factory() {
  const server = Bun.serve({
    port: 8080,
    routes: {
      "/todos": async () => new Response(JSON.stringify(mockInitTodos)),
      "/todos/:id": async (req) => {
        const id = Number(req.params.id)
        const todo = mockInitTodos.find((todo) => todo.id === id)
        if (!todo)
          return new Response(JSON.stringify({ message: "Not found" }), {
            status: 404,
          })
        return new Response(JSON.stringify(todo))
      },
      "/todos/:id/toggle": async (req) => {
        const id = Number(req.params.id)
        const todo = mockInitTodos.find((todo) => todo.id === id)
        if (!todo)
          return new Response(JSON.stringify({ message: "Not found" }), {
            status: 404,
          })
        todo.completed = !todo.completed
        return new Response(JSON.stringify(todo))
      },
    },
    fetch() {
      return new Response(JSON.stringify({ message: "Not found" }))
    },
  })

  return {
    server,
    [Symbol.asyncDispose]: async () => {
      await server.stop(true)
      mock.clearAllMocks()
    },
  }
}

describe("🌐 Http", () => {
  it("should fetch todos", async () => {
    await using _ = await factory()
    const todos = await http("http://localhost:8080/todos").json()
    expect(todos).toEqual(mockInitTodos)
  })
  it("should fetch a todo by id", async () => {
    await using _ = await factory()
    const todo = await http("http://localhost:8080/todos/1").json()
    expect(todo).toEqual(mockInitTodos.find((todo) => todo.id === 1))
  })
})
