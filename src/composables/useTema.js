import { ref, computed, watch } from 'vue'
import { esAppInstalada } from '@/utils/app'

// Tema de la app: claro, oscuro o automático (sigue la configuración del dispositivo).
// Solo existe en la app instalada: en el navegador (escritorio o celular) el sitio
// se ve siempre como siempre y el selector no aparece.
// Mientras se migran los colores, además, solo se activa en desarrollo
// (para probarlo con npm run dev). Al terminar la migración, pasar TEMA_PUBLICADO a true.
export const TEMA_PUBLICADO = false
export const temaDisponible = import.meta.env.DEV || (TEMA_PUBLICADO && esAppInstalada())

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

const aplicarTema = () => {
  const html = document.documentElement
  if (!temaDisponible) {
    html.removeAttribute('data-tema')
    html.removeAttribute('data-bs-theme')
    return
  }
  html.setAttribute('data-tema', temaEfectivo.value)
  html.setAttribute('data-bs-theme', temaEfectivo.value === 'oscuro' ? 'dark' : 'light')
}

watch(temaEfectivo, aplicarTema)

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
