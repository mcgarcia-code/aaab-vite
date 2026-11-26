import { onBeforeUnmount } from 'vue'

// Tiempo que la pantalla (examen online o práctica del catálogo) estuvo a la vista, con la Page Visibility API.
// Deja de contar si se cambia de pestaña, se minimiza, se pasa a otra app o se bloquea el celular.
// segundos() incluye el tramo visible en curso (antes solo se sumaba al ocultarse la pestaña,
// y los guardados intermedios mandaban 0 si nunca se había salido).
// Es el tiempo de esta sesión: el backend suma las sesiones si la pantalla se vuelve a abrir.
export function useTiempoVisible() {
  let acumuladoMs = 0
  let visibleDesde = null
  let activo = false

  const alCambiarVisibilidad = () => {
    if (document.visibilityState === 'visible') {
      if (visibleDesde === null) visibleDesde = Date.now()
    } else if (visibleDesde !== null) {
      acumuladoMs += Date.now() - visibleDesde
      visibleDesde = null
    }
  }

  const iniciar = () => {
    if (activo) return
    activo = true
    visibleDesde = document.visibilityState === 'visible' ? Date.now() : null
    document.addEventListener('visibilitychange', alCambiarVisibilidad)
  }

  const detener = () => {
    if (!activo) return
    activo = false
    document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    if (visibleDesde !== null) {
      acumuladoMs += Date.now() - visibleDesde
      visibleDesde = null
    }
  }

  const segundos = () => Math.round((acumuladoMs + (visibleDesde !== null ? Date.now() - visibleDesde : 0)) / 1000)

  onBeforeUnmount(detener)

  return { iniciar, detener, segundos }
}
