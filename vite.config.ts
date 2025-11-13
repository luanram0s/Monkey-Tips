import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Aumenta o limite de aviso de tamanho do chunk para 1000kb
    chunkSizeWarningLimit: 1000,
  },
});
