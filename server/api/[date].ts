import type { RatesResponse, ApiErrorResponse, RatesRequest } from '../../app/types/exchange'
import { Validators } from '../utils/validators'

export default defineEventHandler(async (event) => {
  const { exchangeApiKey, exchangeApiBase } = useRuntimeConfig()

  const date = getRouterParam(event, 'date')
  const params = getQuery(event)

  if (!Validators.isValidDate(date)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date' })
  }

  const query: RatesRequest = {
    access_key: exchangeApiKey,
    ...(params.base && { base: String(params.base) }),
    ...(params.symbols && { symbols: String(params.symbols) })
  }

  const data = await $fetch<RatesResponse | ApiErrorResponse>(
    `${exchangeApiBase}/${date}`, { query }
  )

  if (!data.success) {
    throw createError({
      statusCode: 502,
      statusMessage: data.error.info
    })
  }
  return data
})
