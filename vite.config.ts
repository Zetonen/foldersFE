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
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('pdfjs-dist') || id.includes('react-pdf')) {
            return 'pdf'
          }
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/')
          ) {
            return 'react'
          }
          if (id.includes('@reduxjs') || id.includes('react-redux')) {
            return 'redux'
          }
          if (id.includes('/zod/')) return 'zod'
          if (id.includes('@dnd-kit')) return 'dnd'
          if (id.includes('@radix-ui') || id.includes('radix-ui')) {
            return 'radix'
          }
          if (id.includes('react-router')) return 'router'

          return 'vendor'
        },
      },
    },
  },
})
