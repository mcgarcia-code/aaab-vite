import { ref, computed, watch } from 'vue'
import { esAppInstalada } from '@/utils/app'

// Tema de la app: claro, oscuro o automático (sigue la configuración del dispositivo).
// Solo existe en la app instalada: en el navegador (escritorio o celular) el sitio
// se ve siempre como siempre y el selector no aparece.
// Mientras se migran los colores, además, solo se activa en desarrollo.
// Al terminar la migración, pasar TEMA_PUBLICADO a true.
export const TEMA_PUBLICADO = true

// Para probarlo en el navegador con npm run dev: abrir cualquier página con ?probarTema=1
// (se recuerda en la pestaña; ?probarTema=0 lo apaga)
const probarEnNavegador = () => {
  if (!import.meta.env.DEV) return false
  try {
    const param = new URLSearchParams(window.location.search).get('probarTema')
    if (param !== null) sessionStorage.setItem('aaab.tema.probar', param)
    return sessionStorage.getItem('aaab.tema.probar') === '1'
  } catch {
    return false
  }
}

export const temaDisponible = (esAppInstalada() && (TEMA_PUBLICADO || import.meta.env.DEV)) || probarEnNavegador()

const CLAVE = 'aaab.tema'
const MODOS = ['claro', 'oscuro', 'auto']

const leerModo = () => {
  try {
    const valor = localStorage.getItem(CLAVE)
    return MODOS.includes(valor) ? valor : null
  } catch {
    return null
  }
}

const consultaOscuro = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)') : null

// Estado compartido por toda la app
const modo = ref(leerModo() ?? (TEMA_PUBLICADO ? 'auto' : 'claro'))
const dispositivoOscuro = ref(!!consultaOscuro?.matches)
consultaOscuro?.addEventListener?.('change', (e) => { dispositivoOscuro.value = e.matches })

const temaEfectivo = computed(() => {
  if (modo.value === 'auto') return dispositivoOscuro.value ? 'oscuro' : 'claro'
  return modo.value
})

// El tema solo se aplica dentro de los paneles. Las páginas públicas que se ven en la app
// (login, contraseña, registros y sus formularios) mantienen siempre sus colores originales.
// La ruta la actualiza el router en cada navegación (setRutaActual).
const enPanel = ref(typeof window !== 'undefined' && window.location.pathname.startsWith('/panel-'))
const metaColor = typeof document !== 'undefined' ? document.querySelector('meta[name="theme-color"]') : null
const COLOR_BARRA_ORIGINAL = metaColor?.getAttribute('content') || '#c8102e'

export const setRutaActual = (path) => { enPanel.value = String(path || '').startsWith('/panel-') }

const aplicarTema = () => {
  const html = document.documentElement
  if (!temaDisponible || !enPanel.value) {
    html.removeAttribute('data-tema')
    html.removeAttribute('data-bs-theme')
    metaColor?.setAttribute('content', COLOR_BARRA_ORIGINAL)
    return
  }
  html.setAttribute('data-tema', temaEfectivo.value)
  html.setAttribute('data-bs-theme', temaEfectivo.value === 'oscuro' ? 'dark' : 'light')
  // Barra de estado del celular del mismo color que el encabezado del panel
  metaColor?.setAttribute('content', temaEfectivo.value === 'oscuro' ? '#0b1222' : '#ffffff')
}

watch([temaEfectivo, enPanel], aplicarTema)

// Se llama una vez desde main.js, antes de montar la app
export const iniciarTema = () => aplicarTema()

export const useTema = () => {
  const elegirModo = (nuevo) => {
    if (!MODOS.includes(nuevo)) return
    modo.value = nuevo
    try {
      localStorage.setItem(CLAVE, nuevo)
    } catch {
      // Sin almacenamiento (modo privado): el tema se aplica igual, solo no se recuerda
    }
  }
  return { modo, temaEfectivo, temaDisponible, elegirModo }
}
