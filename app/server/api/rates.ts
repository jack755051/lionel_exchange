import type { RatesResponse, ApiErrorResponse } from '~/types/exchange'

export default defineEventHandler(async () => {
  const { exchangeApiKey, baseUrl } = useRuntimeConfig()

  const data = await $fetch<RatesResponse | ApiErrorResponse>(
    `${baseUrl}/latest`, {
      query: {
        access_key: exchangeApiKey,
        base: 'TWD',
        symbols: 'JPY'
      }
    }
  )

  if (!data.success) {
    throw createError({
      statusCode: 502,
      statusMessage: data.error.info
    })
  }

  return data
})
