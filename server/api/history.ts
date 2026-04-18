import type { RatesResponse, ApiErrorResponse, HistoryRate } from '../../app/types/exchange'

// Fixer 免費方案不支援 historical endpoint，以 /latest 的即時 rate 為基準，
// 隨機抖動 ±1% 生成過去 N 天的「模擬」走勢供 ISR 示範使用。
export default defineEventHandler(async (event) => {
  const { exchangeApiKey, exchangeApiBase } = useRuntimeConfig()
  const params = getQuery(event)
  const target = String(params.target ?? 'JPY')
  const days = Math.min(90, Math.max(7, Number(params.days ?? 30)))

  const latest = await $fetch<RatesResponse | ApiErrorResponse>(
    `${exchangeApiBase}/latest`,
    { query: { access_key: exchangeApiKey, symbols: target } }
  )

  if (!latest.success) {
    throw createError({ statusCode: 502, statusMessage: latest.error.info })
  }

  const baseRate = latest.rates[target]
  if (!baseRate) {
    throw createError({ statusCode: 400, statusMessage: `Unknown target currency: ${target}` })
  }

  const history: HistoryRate[] = []
  let rate = baseRate
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const jitter = (Math.random() - 0.5) * 0.02
    rate = rate * (1 + jitter)
    history.push({ date: d.toISOString().slice(0, 10), rate })
  }
  return history
})
