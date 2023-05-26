import { defineConfig, splitVendorChunkPlugin } from 'kolibry'
import vuePlugin from '@kolibryjs/vue-plugin'
import { vueI18nPlugin } from './CustomBlockPlugin'

export default defineConfig({
   resolve: {
      alias: {
         '/@': __dirname,
         '@': __dirname,
      },
   },
   plugins: [
      vuePlugin({
         reactivityTransform: true,
      }),
      splitVendorChunkPlugin(),
      vueI18nPlugin,
   ],
   build: {
      // to make tests faster
      minify: false,
      rollupOptions: {
         output: {
            // Test splitVendorChunkPlugin composition
            manualChunks(id) {
               if (id.includes('src-import'))
                  return 'src-import'
            },
         },
      },
   },
   css: {
      modules: {
         localsConvention: 'camelCaseOnly',
      },
   },
})
