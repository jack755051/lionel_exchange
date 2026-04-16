import type { ApiErrorResponse, SymbolsResponse } from '~/types/exchange'

export default defineEventHandler(async () => {
  const { exchangeApiKey, baseUrl } = useRuntimeConfig()

  const data = await $fetch<SymbolsResponse | ApiErrorResponse>(
    `${baseUrl}/symbols`, {
      query: {
        access_key: exchangeApiKey
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
