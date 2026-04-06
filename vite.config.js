import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

    sitemap({
      hostname: 'https://arbitroshandball.com.ar',

      // Rutas para indexar
      dynamicRoutes: [
        '/descargas',
        '/escuela-arbitros',
        '/designaciones',
        '/tribunal-de-etica',
        '/sanciones',
        '/preguntas-frecuentes',
        '/catalogo',

        
      ],

      generateRobotsTxt: false 
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
