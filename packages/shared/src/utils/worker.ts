import { parentPort, Worker } from "worker_threads"
import type { Job } from "#/types/job"

const handlers: Record<string, (data: any) => any> = {
  heavyTask: (n: number) => {
    let sum = 0
    for (let i = 0; i < 1e8; i++) sum += n
    return sum
  },
}

parentPort?.on("message", async (job) => {
  const { name, data } = job

  try {
    const result = await handlers[name](data)
    parentPort?.postMessage({ success: true, result })
  } catch (err: any) {
    parentPort?.postMessage({ success: false, error: err.message })
  }
})

type Task = {
  job: any
  resolve: (v: any) => void
  reject: (e: any) => void
}

export class WorkerPool {
  private workers: Worker[] = []
  private queue: Task[] = []
  private active = new Map<Worker, Task>()

  constructor(workerPath: string, size: number) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(workerPath)

      worker.on("message", (msg) => {
        const task = this.active.get(worker)
        if (!task) return

        this.active.delete(worker)

        if (msg.success) task.resolve(msg.result)
        else task.reject(new Error(msg.error))

        this.run()
      })

      worker.on("error", (err) => {
        const task = this.active.get(worker)
        if (task) task.reject(err)
        this.active.delete(worker)
        this.run()
      })

      this.workers.push(worker)
    }
  }

  exec(job: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ job, resolve, reject })
      this.run()
    })
  }

  private run() {
    for (const worker of this.workers) {
      if (this.active.has(worker)) continue
      const task = this.queue.shift()
      if (!task) return

      this.active.set(worker, task)
      worker.postMessage(task.job)
    }
  }

  async destroy() {
    await Promise.all(this.workers.map((w) => w.terminate()))
  }
}

export async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delay = 200): Promise<T> {
  let lastError

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      await new Promise((res) => setTimeout(res, delay * (i + 1)))
    }
  }

  throw lastError
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
  ])
}

export class JobQueue {
  constructor(private pool: WorkerPool) { }

  async add<T, R>(job: Job<T, R>): Promise<R> {
    const run = async () => {
      const result = this.pool.exec(job)
      return job.timeout ? withTimeout(result, job.timeout) : result
    }

    return withRetry(run, job.attempts ?? 1)
  }
}
