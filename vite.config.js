import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/business-central-resource-manager/',
  plugins: [react()],
});
