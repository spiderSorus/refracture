import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(() => {
    const runtime = process.env.REFRACTURE_RUNTIME || process.env.REFRACT_RUNTIME || 'game';
    const target = process.env.REFRACTURE_TARGET || process.env.REFRACT_TARGET || 'dev';
    const outDir = process.env.REFRACTURE_OUT_DIR || process.env.REFRACT_OUT_DIR || 'dist';
    const defaultPort = runtime === 'lab' ? 3001 : 3000;
    const port = Number(process.env.REFRACTURE_PORT || process.env.REFRACT_PORT || defaultPort);

    const entryFile = runtime === 'game'
        ? path.resolve(__dirname, 'src/entries/game.js')
        : path.resolve(__dirname, 'src/entries/lab.js');

    return {
        base: './', // Crucial for Electron & standalone target bundles
        resolve: {
            alias: {
                '@runtime-entry': entryFile
            }
        },
        define: {
            __REFRACTURE_RUNTIME__: JSON.stringify(runtime),
            __REFRACTURE_TARGET__: JSON.stringify(target),
            __REFRACT_RUNTIME__: JSON.stringify(runtime),
            __REFRACT_TARGET__: JSON.stringify(target)
        },
        server: {
            port,
            strictPort: true
        },
        build: {
            outDir,
            emptyOutDir: true
        }
    };
});
