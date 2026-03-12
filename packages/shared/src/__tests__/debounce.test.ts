import { describe, expect, it, mock, vi } from "bun:test"
import { sleep } from "bun"
import { fetchHorses as fetchHorseApi, FetchHorsesError, horses } from "./helpers/horse"
import { debounce } from "#/utils/debounce"

// Useful when working with API that we don't want to call directly
const fetchHorses = vi.fn(async ({ error }: { error: boolean } = { error: false }) => {
  await sleep(100)
  if (error) throw new FetchHorsesError("Failed to fetch horses 🐴")
  return fetchHorseApi({ error: false })
})

/**
 * >💡 **Tip:** {@link Symbol.dispose}
 *
 * > A method that is used to release resources held by an object. Called by the semantics of the `using` statement.
 * > It can be used to perform cleanup tasks, such as clearing mocks or resetting state.
 * > we can use it to clear mocks or do any cleanup work without 'beforeEach' or 'afterEach'.
 * > It's a good practice to avoid test pollution, especially when we are using mocks, because the state of mocks can affect other tests if not cleared properly.
 */
function createFactory() {
  return {
    debounceHorse: debounce(fetchHorses, 100),
    fetchHorses,

    [Symbol.dispose]: () => {
      mock.clearAllMocks()
    },
  }
}

describe("🏀 The utility function for debouncing", () => {
  it("🚔 debounces calls (doesn't run immediately)", async () => {
    using factory = createFactory()

    factory.debounceHorse()
    expect(factory.fetchHorses).toHaveBeenCalledTimes(0)

    await sleep(120)
    expect(factory.fetchHorses).toHaveBeenCalledTimes(1)
  })

  it("⏱️ only invokes once and uses the latest arguments", async () => {
    using factory = createFactory()

    factory.debounceHorse({ error: false })
    await sleep(50)
    factory.debounceHorse({ error: true })

    await sleep(120)
    expect(factory.fetchHorses).toHaveBeenCalledTimes(1)
    expect(factory.fetchHorses).toHaveBeenCalledWith({ error: true })
  })

  it("🧪 resolves all callers with the same final result", async () => {
    using factory = createFactory()

    const p1 = factory.debounceHorse({ error: false })
    const p2 = factory.debounceHorse({ error: false })

    await sleep(120)
    const [r1, r2] = await Promise.all([p1, p2])

    expect(r1.success).toBeTrue()
    expect(r2.success).toBeTrue()
    // @ts-ignore
    expect(r1.value).toEqual(horses)
    // @ts-ignore
    expect(r2.value).toEqual(horses)
  })

  it("🧨 wraps sync errors in the Result", async () => {
    class Boom extends Error {}
    const fn = vi.fn(() => {
      throw new Boom("boom")
    })
    const d = debounce(fn, 20)

    const p = d()
    await sleep(40)
    const r = await p

    expect(fn).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(r.value).toBeUndefined()
    // @ts-ignore
    expect(r.err).toBeInstanceOf(Boom)
  })

  it("🧯 wraps async rejections in the Result", async () => {
    const fn = vi.fn(async () => {
      throw new FetchHorsesError("Failed to fetch horses")
    })
    const d = debounce(fn, 20)

    const p = d()
    await sleep(40)
    const r = await p

    expect(fn).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(r.value).toBeUndefined()
    // @ts-ignore
    expect(r.err).toBeInstanceOf(FetchHorsesError)
  })

  it("🛑 cancel prevents invocation and resolves pending promises", async () => {
    const fn = vi.fn(() => "ok")
    const d = debounce(fn, 50)

    const p = d()
    d.cancel()

    const r = await p
    expect(fn).toHaveBeenCalledTimes(0)
    // @ts-ignore
    expect(r.value).toBeUndefined()
    // @ts-ignore
    expect(r.err).toBeInstanceOf(Error)
  })
})
