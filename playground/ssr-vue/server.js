// @ts-check
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import consolji from 'consolji'

const isTest = process.env.KOLIBRY

export async function createServer(
   root = process.cwd(),
   isProd = process.env.NODE_ENV === 'production',
   hmrPort,
) {
   const __dirname = path.dirname(fileURLToPath(import.meta.url))
   const resolve = p => path.resolve(__dirname, p)

   const indexProd = isProd
      ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
      : ''

   const manifest = isProd
      ? JSON.parse(
         fs.readFileSync(resolve('dist/client/ssr-manifest.json'), 'utf-8'),
      )
      : {}

   const app = express()

   /**
   * @type {import('kolibry').KolibryDevServer}
   */
   let kolibry
   if (!isProd) {
      kolibry = await (
         await import('kolibry')
      ).createServer({
         base: '/test/',
         root,
         logLevel: isTest ? 'error' : 'info',
         server: {
            middlewareMode: true,
            watch: {
               // During tests we edit the files too fast and sometimes chokidar
               // misses change events, so enforce polling for consistency
               usePolling: true,
               interval: 100,
            },
            hmr: {
               port: hmrPort,
            },
         },
         appType: 'custom',
      })
      // use kolibry's connect instance as middleware
      app.use(kolibry.middlewares)
   }
   else {
      app.use((await import('compression')).default())
      app.use(
         '/test/',
         (await import('serve-static')).default(resolve('dist/client'), {
            index: false,
         }),
      )
   }

   app.use('*', async (req, res) => {
      try {
         const url = req.originalUrl.replace('/test/', '/')

         let template, render
         if (!isProd) {
            // always read fresh template in dev
            template = fs.readFileSync(resolve('index.html'), 'utf-8')
            template = await kolibry.transformIndexHtml(url, template)
            render = (await kolibry.ssrLoadModule('/src/entry-server.js')).render
         }
         else {
            template = indexProd
            // @ts-expect-error is fine
            render = (await import('./dist/server/entry-server.js')).render
         }

         const [appHtml, preloadLinks] = await render(url, manifest)

         const html = template
            .replace('<!--preload-links-->', preloadLinks)
            .replace('<!--app-html-->', appHtml)

         res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
      }
      catch (e) {
         kolibry && kolibry.ssrFixStacktrace(e)
         consolji.log(e.stack)
         res.status(500).end(e.stack)
      }
   })

   return { app, kolibry }
}

if (!isTest) {
   createServer().then(({ app }) =>
      app.listen(6173, () => {
         consolji.log('http://localhost:6173')
      }),
   )
}
