import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import sitemap from 'vite-plugin-sitemap' // <--- 1. Importar el plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

    // --- 2. Añadir y configurar el plugin del sitemap ---
    sitemap({
      // ¡MUY IMPORTANTE! Reemplaza esto con el dominio final de tu sitio web
      hostname: 'https://arbitroshandball.com.ar',

      // Rutas generadas a partir de tu archivo de rutas de Vue
      dynamicRoutes: [
        '/descargas',
        '/escuela-arbitros',
        '/designaciones',
        '/tribunal-de-etica',
        '/sanciones',
        '/preguntas-frecuentes',
        '/carnet-digital',
        '/catalogo',
        
      ],

      // Opcional: Esto también generará un archivo robots.txt útil
      robots: [
        {
          userAgent: '*',
          allow: '/',
        },
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
