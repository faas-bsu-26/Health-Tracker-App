import { defineConfig } from 'vite'
import path from 'path'
// Note: using PostCSS pipeline for Tailwind processing instead of the
// @tailwindcss/vite plugin to avoid special CSS variable function requirements.
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [

    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})
