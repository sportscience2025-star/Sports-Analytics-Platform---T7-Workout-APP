import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'exceljs': path.resolve(__dirname, 'node_modules/exceljs/dist/exceljs.min.js')
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
