import { ref, computed, watch, unref } from 'vue'

// Paginación de una lista que ya está en el cliente (filtrada, ordenada, etc.).
// - lista: ref o computed con el array completo
// - porPagina: número, o ref/computed si cambia (ej. menos registros en el celular)
// - paginaActual: la ref de la pantalla, si ya la tiene (para reiniciarla con sus filtros); si no, se crea
// Devuelve paginaActual, totalPaginas (mínimo 1) y paginados (los registros de la página actual).
// Si la lista se achica y la página actual queda fuera de rango, vuelve a la última página.
export function usePaginacion(lista, porPagina = 10, paginaActual = ref(1)) {
  const tamano = () => Math.max(1, Number(unref(porPagina)) || 10)

  const totalPaginas = computed(() => Math.max(1, Math.ceil((unref(lista)?.length || 0) / tamano())))

  const paginados = computed(() => {
    const inicio = (paginaActual.value - 1) * tamano()
    return (unref(lista) || []).slice(inicio, inicio + tamano())
  })

  watch(totalPaginas, (total) => {
    if (paginaActual.value > total) paginaActual.value = total
  })

  return { paginaActual, totalPaginas, paginados }
}
