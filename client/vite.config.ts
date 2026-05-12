import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'
import path from 'path'

export default defineConfig({
  // HTTPS enabled via mkcert so the dev server is reachable from a phone over Wi-Fi
  // (camera APIs like getUserMedia require a secure origin off localhost). Set
  // VITE_DISABLE_HTTPS=1 to skip if you hit a cert-install issue and only need plain http.
  plugins: [vue(), ...(process.env.VITE_DISABLE_HTTPS === '1' ? [] : [mkcert()])],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
