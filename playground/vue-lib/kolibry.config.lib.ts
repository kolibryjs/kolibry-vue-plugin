import path from 'node:path'
import { defineConfig } from 'kolibry'
import vue from '@kolibryjs/vue-plugin'

export default defineConfig({
   root: __dirname,
   build: {
      outDir: 'dist/lib',
      lib: {
         entry: path.resolve(__dirname, 'src-lib/index.ts'),
         name: 'MyVueLib',
         formats: ['es'],
         fileName: 'my-vue-lib',
      },
      rollupOptions: {
         external: ['vue'],
         output: {
            globals: { vue: 'Vue' },
         },
      },
   },
   plugins: [vue()],
})
