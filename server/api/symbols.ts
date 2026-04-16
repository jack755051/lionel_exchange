import { readSymbolsCache } from '../utils/symbols'

export default defineEventHandler(async () => {
  const cache = await readSymbolsCache()

  return {
    success: true as const,
    symbols: cache.symbols
  }
})
