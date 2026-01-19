import { defineWorkersProject } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersProject({
  test: {
    globals: true,
    include: ['app/**/*.test.ts'],
    setupFiles: ['./app/test/setup.ts'],
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.test.jsonc' },
        miniflare: {
          d1Databases: ['DB'],
          kvNamespaces: ['KV'],
        },
      },
    },
  },
})
