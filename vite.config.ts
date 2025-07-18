import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
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
