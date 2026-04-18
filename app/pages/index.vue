<script setup lang="ts">
import type { RatesResponse, SymbolsResponse } from '~/types/exchange'
import { PREFERRED_CURRENCIES, toCurrencyOptions } from '~/utils/currency'

const selectedTarget = ref<string>(PREFERRED_CURRENCIES[0])

const [ratesRes, symbolsRes] = await Promise.all([
  useFetch<RatesResponse>('/api/latest', {
    query: { symbols: PREFERRED_CURRENCIES.join(',') }
  }),
  useFetch<SymbolsResponse>('/api/symbols')
])

const { data, error, refresh, status } = ratesRes
const { data: symbolsData } = symbolsRes

const currencyOptions = computed(() =>
  toCurrencyOptions(PREFERRED_CURRENCIES, symbolsData.value?.symbols)
)

useHead({ title: '即時匯率' })
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold">
          沖繩旅遊即時換匯
        </h1>
        <p class="text-sm text-gray-500">
          基準幣別：{{ data?.base ?? '—' }}
          <span class="ml-2">(Fixer 免費版鎖定 EUR)</span>
        </p>
      </div>

      <UAlert
        v-if="error"
        color="error"
        icon="i-lucide-circle-alert"
        :title="error.statusMessage ?? '載入失敗'"
      />

      <template v-else-if="data">
        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-600">選擇目標幣別：</label>
          <USelect
            v-model="selectedTarget"
            :items="currencyOptions"
            class="w-64"
          />
        </div>

        <UCard>
          <div class="text-center space-y-2 py-4">
            <p class="text-gray-500">
              1 {{ data.base }} =
            </p>
            <p class="text-5xl font-bold text-primary">
              {{ data.rates[selectedTarget]?.toFixed(4) ?? '—' }}
            </p>
            <p class="text-xl text-gray-600">
              {{ selectedTarget }}
            </p>
          </div>
        </UCard>

        <div>
          <h2 class="text-lg font-semibold mb-3">
            主要幣別一覽
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <UCard
              v-for="opt in currencyOptions"
              :key="opt.value"
            >
              <div class="text-sm text-gray-500">
                {{ data.base }} → {{ opt.value }}
              </div>
              <div class="text-2xl font-semibold">
                {{ data.rates[opt.value]?.toFixed(4) ?? '—' }}
              </div>
              <div
                v-if="symbolsData?.symbols?.[opt.value]"
                class="text-xs text-gray-400 mt-1"
              >
                {{ symbolsData.symbols[opt.value] }}
              </div>
            </UCard>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4">
          <p class="text-xs text-gray-400">
            更新時間：{{ new Date(data.timestamp * 1000).toLocaleString('zh-TW') }}
          </p>
          <UButton
            icon="i-lucide-refresh-cw"
            variant="soft"
            :loading="status === 'pending'"
            @click="refresh()"
          >
            重新整理
          </UButton>
        </div>
      </template>
    </div>
  </UContainer>
</template>
