import vuePlugin from '@kolibryjs/vue-plugin'
import { defineConfig } from 'kolibry'

export default defineConfig({
   css: {
      devSourcemap: true,
      preprocessorOptions: {
         less: {
            additionalData: '@color: red;',
         },
      },
   },
   plugins: [vuePlugin()],
   build: {
      sourcemap: true,
   },
})
