import { ref, computed } from 'vue'
import { api } from '@/api/api'

const RAMAS = { M: 'Masculino', F: 'Femenino' }

// Largo máximo de registro_arbitro.categoria_handball
export const MAX_LARGO_CATEGORIAS = 255

// categoria_handball guarda una o más categorías separadas por coma
// ("Juveniles A, Mayores B"): un jugador puede estar en más de una.
export const separarCategorias = (texto) =>
  String(texto || '').split(',').map(c => c.trim()).filter(Boolean)

export const unirCategorias = (lista) =>
  [...new Set(lista.map(c => String(c).trim()).filter(Boolean))].join(', ')

export const RAMAS_HANDBALL = RAMAS

// Un único pedido compartido (y cacheado) de clubes y categorías para toda la app:
// { clubes, categorias } = solo Juveniles/Junior/Mayores (donde juega el árbitro)
// { clubesFamiliares, categoriasFamiliares } = todas las categorías (familiares)
let promesaDatosClubes = null
export const obtenerDatosClubes = () => {
  if (!promesaDatosClubes) {
    promesaDatosClubes = api.get({ entity: 'registro', action: 'obtenerDatosRegistro', payload: {} })
      .then(res => {
        if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los clubes')
        return res.payload ?? {}
      })
      .catch(e => {
        promesaDatosClubes = null
        throw e
      })
  }
  return promesaDatosClubes
}

// Clubes y categorías para los campos "donde_juega" / "categoria_handball".
// Las categorías salen de los equipos activos de cada club (equipos_larry),
// vía registro/obtenerDatosRegistro. Ambos campos se guardan por NOMBRE.
//
// obtenerClub / obtenerCategorias: funciones que devuelven el valor actual del
// formulario (el club y el texto de categorías), para filtrar por club y para
// no perder valores viejos cargados a mano que no estén en la lista.
export function useOpcionesHandball(obtenerClub, obtenerCategorias) {
  const clubes = ref([])
  const categorias = ref([])
  const cargando = ref(false)
  const error = ref('')

  const cargar = async () => {
    if (clubes.value.length || cargando.value) return
    cargando.value = true
    error.value = ''
    try {
      const datos = await obtenerDatosClubes()
      clubes.value = datos.clubes ?? []
      categorias.value = datos.categorias ?? []
    } catch (e) {
      console.error('useOpcionesHandball:', e)
      error.value = 'No se pudieron cargar los clubes y categorías.'
    } finally {
      cargando.value = false
    }
  }

  const opcionesClubes = computed(() => {
    const nombres = clubes.value.map(c => c.nombre)
    const actual = obtenerClub()
    return actual && !nombres.includes(actual) ? [actual, ...nombres] : nombres
  })

  const idClubElegido = computed(() =>
    clubes.value.find(c => c.nombre === obtenerClub())?.id ?? null
  )

  // [{ etiqueta: 'Masculino', categorias: ['Juveniles A', ...] }, ...]
  const categoriasPorRama = computed(() => {
    const grupos = {}
    for (const c of categorias.value.filter(c => c.idClub === idClubElegido.value)) {
      const etiqueta = RAMAS[c.rama] || 'Otras'
      if (!grupos[etiqueta]) grupos[etiqueta] = { etiqueta, categorias: [] }
      grupos[etiqueta].categorias.push(c.nombre)
    }
    const lista = Object.values(grupos)
    const delClub = lista.flatMap(g => g.categorias)
    const viejas = separarCategorias(obtenerCategorias()).filter(c => !delClub.includes(c))
    if (viejas.length) lista.unshift({ etiqueta: 'Cargadas anteriormente', categorias: viejas })
    return lista
  })

  return { cargando, error, cargar, opcionesClubes, categoriasPorRama }
}
