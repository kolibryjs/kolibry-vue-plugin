import { defineConfig } from 'kolibry'
import vuePlugin from '@kolibryjs/vue-plugin'

export default defineConfig({
   base: '',
   resolve: {
      alias: {
         '@': __dirname,
      },
   },
   plugins: [vuePlugin()],
   server: {
      origin: 'http://localhost/server-origin/test',
   },
   build: {
      // to make tests faster
      minify: false,
   },
})
