import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import sitemap from 'vite-plugin-sitemap'
import iconosBootstrap from './vite/iconosBootstrap.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Build: deja en bootstrap-icons.css solo los íconos usados en src/
    iconosBootstrap(),

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
  build: {
    // ExcelJS y html2pdf pesan ~950 KB cada uno, pero se cargan solo al exportar (utils/librerias.js)
    chunkSizeWarningLimit: 1000
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 todavía usa @import y funciones de color viejas de Sass: se silencian sus avisos
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
