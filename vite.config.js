/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    cors: false,
    // proxy: {
    //   '/api': {
    //     target: 'https://bolls.life',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //   },
    // }
  }
})