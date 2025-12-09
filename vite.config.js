import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                    cannon: ['cannon-es']
                }
            }
        }
    },
    server: {
        port: 5173,
        open: false,
        host: true
    },
    optimizeDeps: {
        include: ['three', 'cannon-es']
    }
});
