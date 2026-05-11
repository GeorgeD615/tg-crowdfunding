import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
    },
    preview: {
        host: true,
        port: 4173,
    },
    define: {
        'process.env': {},
        'global': 'globalThis',
    },
    resolve: {
        alias: {
            'buffer': 'buffer',
            'process': 'process/browser',
        },
    },
    optimizeDeps: {
        include: ['buffer', 'process', '@ton/core', '@tonconnect/ui-react'],
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },
    build: {
        target: 'es2020',
        sourcemap: false,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', '@tonconnect/ui-react'],
                },
            },
        },
    },
});