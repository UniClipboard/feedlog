import { defineNuxtModule, addServerPlugin, createResolver } from '@nuxt/kit'

// Self-hosted S3-compatible blob provider. Only loaded into Node /
// Docker builds — Cloudflare uses its R2 binding and Vercel uses Vercel
// Blob via NuxtHub's build-time-selected driver, where shipping
// aws4fetch + the s3 driver would just bloat the bundle.

export default defineNuxtModule({
  meta: { name: 'blob-s3' },
  setup(_options, nuxt) {
    const preset = nuxt.options.nitro?.preset || process.env.NITRO_PRESET
    if (preset === 'cloudflare-module' || preset === 'vercel') return

    const { resolve } = createResolver(import.meta.url)
    addServerPlugin(resolve('./runtime/server/plugins/blob-s3'))
  },
})
