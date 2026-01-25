import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This tells Vite that '@' points to your 'src' folder
      '@': path.resolve(__dirname, './src'),
    },
  },
});
