import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Puerto propio para no chocar con otros proyectos que usen el 5173
  server: { port: 5180, strictPort: true },
})
