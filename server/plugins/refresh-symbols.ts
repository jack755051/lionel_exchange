import { refreshSymbolsIfStale } from '../utils/symbols'

export default defineNitroPlugin(async () => {
  try {
    await refreshSymbolsIfStale()
  } catch (err) {
    console.error('[symbols] failed to refresh on startup:', err)
  }
})
