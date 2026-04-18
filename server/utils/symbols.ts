import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { ApiErrorResponse, SymbolsResponse } from '../../app/types/exchange'

interface SymbolsCache {
  timestamp: number
  symbols: Record<string, string>
}

const CACHE_PATH = resolve('server/data/symbols.json')
const ONE_DAY_MS = 24 * 60 * 60 * 1000

/** 讀取本地快取 */
export async function readSymbolsCache(): Promise<SymbolsCache> {
  const raw = await readFile(CACHE_PATH, 'utf-8')
  return JSON.parse(raw)
}

/** 從 fixer.io 拉取最新幣別並寫入快取 */
async function fetchAndSave(): Promise<SymbolsCache> {
  const { exchangeApiKey, exchangeApiBase } = useRuntimeConfig()

  const data = await $fetch<SymbolsResponse | ApiErrorResponse>(
    `${exchangeApiBase}/symbols`,
    { query: { access_key: exchangeApiKey } }
  )

  if (!data.success) {
    throw new Error(`Fixer API error: ${data.error.info}`)
  }

  const cache: SymbolsCache = {
    timestamp: Date.now(),
    symbols: data.symbols
  }

  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8')
  console.log('[symbols] cache refreshed')
  return cache
}

/** 檢查快取是否過期，過期就刷新 */
export async function refreshSymbolsIfStale(): Promise<SymbolsCache> {
  const cache = await readSymbolsCache()
  const age = Date.now() - cache.timestamp

  if (age > ONE_DAY_MS) {
    console.log('[symbols] cache expired, fetching fresh data...')
    return await fetchAndSave()
  }

  console.log('[symbols] cache is fresh, skip fetch')
  return cache
}
