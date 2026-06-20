import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            outDir: 'public',
            buildBase: '/',
            scope: '/',
            manifest: {
                name: 'APTAX - AI Tax Assistant',
                short_name: 'APTAX',
                description: 'Laboratorium Pajak Digital SMK',
                theme_color: '#F3F0DF',
                background_color: '#FFFDF9',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
            }
        })
    ],
});
