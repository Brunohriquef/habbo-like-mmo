import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@protocol': path.resolve(__dirname, '../../packages/protocol/src'),
      '@pathfinding': path.resolve(__dirname, '../../packages/pathfinding/src'),
    },
  },
});
