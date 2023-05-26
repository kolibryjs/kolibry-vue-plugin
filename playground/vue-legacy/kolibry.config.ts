import path from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'kolibry'
import vuePlugin from '@kolibryjs/vue-plugin'
import legacyPlugin from '@kolibryjs/legacy-plugin'

export default defineConfig({
   base: '',
   resolve: {
      alias: {
         '@': __dirname,
      },
   },
   plugins: [
      legacyPlugin({
         targets: ['defaults', 'not IE 11', 'chrome > 48'],
      }),
      vuePlugin(),
   ],
   build: {
      minify: false,
   },
   // special test only hook
   // for tests, remove `<script type="module">` tags and remove `nomodule`
   // attrs so that we run the legacy bundle instead.
   // @ts-expect-error
   __test__() {
      const indexPath = path.resolve(__dirname, './dist/index.html')
      let index = fs.readFileSync(indexPath, 'utf-8')
      index = index
         .replace(/<script type="module".*?<\/script>/g, '')
         .replace(/<script nomodule/g, '<script')
      fs.writeFileSync(indexPath, index)
   },
})
