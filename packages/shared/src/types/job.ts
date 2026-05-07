export type JobHandler<T, R> = (data: T) => Promise<R> | R

export interface Job<T = any, R = any> {
  name: string
  data: T
  attempts?: number
  timeout?: number
}
