import {
   createRouter as _createRouter,
   createMemoryHistory,
   createWebHistory,
} from 'vue-router'

// Auto generates routes from vue files under ./pages
// https://kolibryjs.zip/guide/features.html#glob-import
const pages = import.meta.glob('./pages/*.vue')

const routes = Object.keys(pages).map((path) => {
   const name = path.match(/\.\/pages(.*)\.vue$/)[1].toLowerCase()
   return {
      path: name === '/home' ? '/' : name,
      component: pages[path], // () => import('./pages/*.vue')
   }
})

export function createRouter() {
   return _createRouter({
      // use appropriate history implementation for server/client
      // import.meta.env.SSR is injected by Kolibry.
      history: import.meta.env.SSR
         ? createMemoryHistory('/test/')
         : createWebHistory('/test/'),
      routes,
   })
}
