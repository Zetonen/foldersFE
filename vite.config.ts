import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
  },
  base: '/',
  build: {
    rollupOptions: {
      output: {
        /**
         * FR-LAZY-02: pdf.js is the single largest dependency and is only
         * needed once a file is opened, so it must not sit in the entry chunk.
         * The rest is split so a release does not invalidate everything at once.
         */
        
      },
    },
  },
})
