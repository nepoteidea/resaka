import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      // DOM wiring is covered by the Playwright suite.
      exclude: ['src/main.js'],
      thresholds: { lines: 95, functions: 95, branches: 90, statements: 95 },
    },
  },
});
