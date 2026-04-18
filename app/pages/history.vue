<script setup lang="ts">
import type { HistoryRate } from '~/types/exchange'
import { PREFERRED_CURRENCIES } from '~/utils/currency'

useHead({ title: '歷史匯率' })

const route = useRoute()
const target = computed(() => String(route.query.target ?? 'JPY'))

const { data, error } = await useFetch<HistoryRate[]>('/api/history', {
  query: { target, days: 30 }
})

const stats = computed(() => {
  if (!data.value?.length) return null
  const rates = data.value.map(d => d.rate)
  const max = Math.max(...rates)
  const min = Math.min(...rates)
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length
  return { max, min, avg, range: max - min || 1 }
})
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold">
          歷史匯率走勢
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          過去 30 天 EUR → {{ target }}（ISR 快取 60 秒，60 秒內重載取快取頁）
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">切換幣別：</span>
        <UButton
          v-for="code in PREFERRED_CURRENCIES"
          :key="code"
          :variant="target === code ? 'solid' : 'soft'"
          size="sm"
          :to="{ query: { target: code } }"
        >
          {{ code }}
        </UButton>
      </div>

      <UAlert
        v-if="error"
        color="error"
        icon="i-lucide-circle-alert"
        :title="error.statusMessage ?? '載入失敗'"
      />

      <template v-else-if="data && stats">
        <div class="grid grid-cols-3 gap-4">
          <UCard>
            <div class="text-xs text-gray-500">
              最高
            </div>
            <div class="text-2xl font-bold text-green-600">
              {{ stats.max.toFixed(4) }}
            </div>
          </UCard>
          <UCard>
            <div class="text-xs text-gray-500">
              最低
            </div>
            <div class="text-2xl font-bold text-red-600">
              {{ stats.min.toFixed(4) }}
            </div>
          </UCard>
          <UCard>
            <div class="text-xs text-gray-500">
              平均
            </div>
            <div class="text-2xl font-bold">
              {{ stats.avg.toFixed(4) }}
            </div>
          </UCard>
        </div>

        <UCard>
          <div class="space-y-1">
            <div
              v-for="d in data"
              :key="d.date"
              class="flex items-center gap-3"
            >
              <span class="text-xs text-gray-500 w-24 font-mono">{{ d.date }}</span>
              <div class="flex-1 bg-gray-100 rounded h-6 relative overflow-hidden">
                <div
                  class="h-full bg-primary transition-all"
                  :style="{ width: `${((d.rate - stats.min) / stats.range) * 100}%` }"
                />
              </div>
              <span class="text-sm font-mono w-24 text-right">{{ d.rate.toFixed(4) }}</span>
            </div>
          </div>
        </UCard>

        <p class="text-xs text-gray-400">
          備註：Fixer 免費版不支援 historical 查詢，此走勢為 /latest 即時匯率 ±1% 隨機抖動生成，純粹示範 ISR 快取行為。
        </p>
      </template>
    </div>
  </UContainer>
</template>
