import type { RatesResponse, ApiErrorResponse, RatesRequest } from '../../app/types/exchange'

export default defineEventHandler(async (event) => {
  const { exchangeApiKey, exchangeApiBase } = useRuntimeConfig()
  const params = getQuery(event)

  const query: RatesRequest = {
    access_key: exchangeApiKey,
    ...(params.base && { base: String(params.base) }),
    ...(params.symbols && { symbols: String(params.symbols) })
  }

  const data = await $fetch<RatesResponse | ApiErrorResponse>(
    `${exchangeApiBase}/latest`, { query }
  )

  if (!data.success) {
    throw createError({
      statusCode: 502,
      statusMessage: data.error.info
    })
  }

  return data
})
