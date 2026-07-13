/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/julies-kokebok/',
  plugins: [react()],
  test: { environment: 'node' },
});
