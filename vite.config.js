import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import sitemap from 'vite-plugin-sitemap'
import iconosBootstrap from './vite/iconosBootstrap.js'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Build: deja en bootstrap-icons.css solo los íconos usados en src/
    iconosBootstrap(),
    // App instalable (PWA): guarda la "cáscara" del sitio para abrir sin conexión.
    // El manifest es public/manifest.json (ya enlazado en index.html).
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}', 'android-chrome-*.png', 'maskable-*.png', 'apple-touch-icon.png'],
        // Librerías pesadas de exportación: se guardan recién la primera vez que se usan
        globIgnores: ['**/exceljs*', '**/html2pdf*', '**/html2canvas*'],
        cleanupOutdatedCaches: true,
        // Navegación sin conexión → index.html, salvo backend, archivos subidos, el catálogo (sitio aparte) y archivos con extensión
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//, /^\/data\//, /^\/catalogo(\/|$)/, /\.[a-z0-9]+$/i],
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && /\/assets\/(exceljs|html2pdf|html2canvas)/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'librerias-exportacion', expiration: { maxEntries: 10 } }
          },
          {
            urlPattern: ({ request, url, sameOrigin }) => sameOrigin && request.destination === 'image' && !url.pathname.startsWith('/uploads/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'imagenes', expiration: { maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 } }
          }
        ]
      }
    }),

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
        '/catalogo/',

        
      ],

      generateRobotsTxt: false 
    }),
  ],
  // ffmpeg.wasm (recorte de clips de AAAB TV) arma su propio worker: Vite no lo tiene que pre-empaquetar
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
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
