// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    exchangeApiKey: '',
    exchangeApiBase: '',
    apiSecret: ''
  },

  $development: {
    devtools: { enabled: true }
  },

  $production: {
    routeRules: {
      '/**': { isr: true } // 只需要留這個
    }
  },

  modules: ['@nuxt/eslint', '@nuxt/ui', '@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  devtools: {
    enabled: true
  },

  routeRules: {
    '/history': { isr: 60 }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-TW' },
      // %s 是一個佔位符，代表「每個頁面自己定義的名稱」
      titleTemplate: '%s | 沖繩旅遊即時換匯',
      // 這是保底標題，如果頁面沒給 %s，就會顯示這個
      title: '首頁',
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  }
})
