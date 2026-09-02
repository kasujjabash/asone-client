import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    // The backend allowlists this origin for CORS. Changing the port means
    // changing DJANGO_CORS_ALLOWED_ORIGINS in the server's .env too, so fail
    // loudly rather than silently drifting onto 5174.
    port: 5173,
    strictPort: true,
  },
})
