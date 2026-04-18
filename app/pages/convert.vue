<script setup lang="ts">
import type { RatesResponse, SymbolsResponse } from '~/types/exchange'
import { toCurrencyOptions } from '~/utils/currency'

useHead({ title: '換匯計算機' })

const from = ref<string>('EUR')
const to = ref<string>('JPY')
const amount = ref<number>(100)

// server:false → 僅在 client 執行，demo CSR：檢視原始碼看不到結果
const { data: rates, pending, error } = await useFetch<RatesResponse>('/api/latest', {
  server: false
})
const { data: symbolsData } = await useFetch<SymbolsResponse>('/api/symbols', {
  server: false
})

const currencyOptions = computed(() => {
  const map = symbolsData.value?.symbols ?? {}
  return toCurrencyOptions(Object.keys(map).sort(), map)
})

const converted = computed<number | null>(() => {
  if (!rates.value?.rates || !amount.value) return null
  const base = rates.value.base
  const fromRate = from.value === base ? 1 : rates.value.rates[from.value]
  const toRate = to.value === base ? 1 : rates.value.rates[to.value]
  if (!fromRate || !toRate) return null
  return (amount.value / fromRate) * toRate
})

function swap() {
  const tmp = from.value
  from.value = to.value
  to.value = tmp
}
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 class="text-3xl font-bold">
          換匯計算機
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          CSR 示範：右鍵檢視原始碼只會看到空殼，資料由 hydration 後 client 取得
        </p>
      </div>

      <UCard v-if="pending">
        <p class="text-center text-gray-500 py-4">
          載入匯率中...
        </p>
      </UCard>

      <UAlert
        v-else-if="error"
        color="error"
        icon="i-lucide-circle-alert"
        :title="error.statusMessage ?? '載入失敗'"
      />

      <template v-else>
        <UCard>
          <div class="space-y-4">
            <div class="flex items-end gap-2">
              <UFormField
                label="來源幣別"
                class="flex-1"
              >
                <USelect
                  v-model="from"
                  :items="currencyOptions"
                  class="w-full"
                />
              </UFormField>
              <UButton
                icon="i-lucide-arrow-right-left"
                variant="soft"
                square
                @click="swap"
              />
              <UFormField
                label="目標幣別"
                class="flex-1"
              >
                <USelect
                  v-model="to"
                  :items="currencyOptions"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="金額">
              <UInput
                v-model.number="amount"
                type="number"
                min="0"
                class="w-full"
              />
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <div class="text-center space-y-2 py-3">
            <p class="text-sm text-gray-500">
              {{ amount }} {{ from }} =
            </p>
            <p class="text-4xl font-bold text-primary">
              {{ converted?.toFixed(2) ?? '—' }}
            </p>
            <p class="text-lg text-gray-600">
              {{ to }}
            </p>
          </div>
        </UCard>

        <p class="text-xs text-gray-400 text-center">
          匯率基準：{{ rates?.base }}（Fixer 免費版鎖定 EUR）
        </p>
      </template>
    </div>
  </UContainer>
</template>
