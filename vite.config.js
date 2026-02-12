import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Crucial for Electron
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist'
    }
});