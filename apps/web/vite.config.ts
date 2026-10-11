import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Relative base works on GitHub Pages under /<repo>/ without knowing the repo name.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { fs: { allow: ['../..'] } },
});
