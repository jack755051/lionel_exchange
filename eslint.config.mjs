// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'nuxt/nuxt-config-keys-order': 'off'
    }
  }
)
