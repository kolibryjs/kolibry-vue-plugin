import { defineConfig } from 'kolibry'
import vue from '@kolibryjs/vue-plugin'

export default defineConfig({
   root: __dirname,
   build: {
      outDir: 'dist/consumer',
   },
   plugins: [vue()],
})
