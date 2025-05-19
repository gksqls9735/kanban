import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public',
  build: {
    sourcemap: 'inline',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'bizbee-kanban.min.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'bizbee-kanban.min.css'
          } else {
            return 'assets/[name][extname]'
          }
        }
      }
    }
  },

})
