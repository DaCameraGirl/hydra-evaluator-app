import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed to GitHub Pages at https://dacameragirl.github.io/hydra-evaluator-app/
export default defineConfig({
  base: '/hydra-evaluator-app/',
  plugins: [react(), tailwindcss()],
})
