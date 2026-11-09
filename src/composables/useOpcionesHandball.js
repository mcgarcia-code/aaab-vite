import { ref, reactive, computed, watch } from 'vue'
import { api } from '@/api/api'

const RAMAS = { M: 'Masculino', F: 'Femenino' }

// Largo máximo de registro_arbitro.categoria_handball
export const MAX_LARGO_CATEGORIAS = 255

// categoria_handball guarda una o más categorías separadas por " | "
// ("Juveniles A | Junior Fem, C"): un jugador puede estar en más de una.
// No se usa la coma porque hay categorías que la llevan en el nombre ("Junior Fem, C").
export const SEPARADOR_CATEGORIAS = ' | '

export const separarCategorias = (texto) =>
  String(texto || '').split('|').map(c => c.trim()).filter(Boolean)

export const unirCategorias = (lista) =>
  [...new Set(lista.map(c => String(c).trim()).filter(Boolean))].join(SEPARADOR_CATEGORIAS)

export const RAMAS_HANDBALL = RAMAS

// Ramas que puede jugar el árbitro según el género declarado:
// masculino -> M, femenino -> F, X / otro / sin declarar -> ambas.
export const ramasSegunGenero = (genero) => {
  const g = String(genero || '').toLowerCase()
  if (g === 'masculino') return ['M']
  if (g === 'femenino') return ['F']
  return ['M', 'F']
}

// Listado de todos los clubes activos: [{ id, nombre }]. Un único pedido compartido y cacheado para toda la app.
let promesaClubes = null
export const obtenerClubes = () => {
  if (!promesaClubes) {
    promesaClubes = api.get({ entity: 'clubes', action: 'obtenerClubes', payload: {} })
      .then(res => {
        if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los clubes')
        return (res.payload ?? []).map(c => ({ id: String(c.club_id), nombre: c.club_nombre }))
      })
      .catch(e => {
        promesaClubes = null
        throw e
      })
  }
  return promesaClubes
}

// Categorías de un club: se piden al BE (equipos/obtenerEquiposDeClub) recién cuando se elige el club
// y quedan en un almacén compartido por club, así que no se vuelven a pedir.
// soloJuego = true: solo Juveniles/Junior/Mayores · false: todas las categorías.
// Cada categoría: { id (del equipo), idClub, rama, nombre }
const claveEquipos = (idClub, soloJuego) => `${soloJuego ? 'juego' : 'todas'}:${idClub}`
const equiposPorClub = reactive({})
const cargandoPorClub = reactive({})
const pedidosEquipos = {}

export const equiposDeClub = (idClub, soloJuego = true) => equiposPorClub[claveEquipos(idClub, soloJuego)] ?? []

export const cargandoEquiposDeClub = (idClub, soloJuego = true) => !!idClub && !!cargandoPorClub[claveEquipos(idClub, soloJuego)]

export const cargarEquiposDeClub = (idClub, soloJuego = true) => {
  if (!idClub) return Promise.resolve([])
  const clave = claveEquipos(idClub, soloJuego)
  if (equiposPorClub[clave]) return Promise.resolve(equiposPorClub[clave])
  if (!pedidosEquipos[clave]) {
    cargandoPorClub[clave] = true
    pedidosEquipos[clave] = api.get({ entity: 'equipos', action: 'obtenerEquiposDeClub', payload: { idClub, soloJuego } })
      .then(res => {
        if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las categorías del club')
        equiposPorClub[clave] = res.payload ?? []
        return equiposPorClub[clave]
      })
      .finally(() => {
        delete pedidosEquipos[clave]
        delete cargandoPorClub[clave]
      })
  }
  return pedidosEquipos[clave]
}

// [{ rama, etiqueta, categorias: [{ id, nombre, rama }] }] de las categorías ya cargadas, filtradas por rama
export const agruparPorRama = (equipos, ramas = ['M', 'F']) => {
  const grupos = {}
  for (const c of equipos.filter(c => ramas.includes(c.rama))) {
    const rama = c.rama || 'otras'
    if (!grupos[rama]) grupos[rama] = { rama, etiqueta: RAMAS[rama] || 'Otras', categorias: [] }
    grupos[rama].categorias.push(c)
  }
  return Object.values(grupos)
}

// Clubes y categorías para los campos "donde_juega" / "categoria_handball".
// Los clubes se cargan al abrir (cargar) y las categorías se piden al BE cuando se elige el club.
//
// obtenerClub / obtenerCategorias / obtenerGenero: funciones que devuelven el
// valor actual del formulario (club, texto de categorías y género), para filtrar
// por club y rama, y para no perder valores viejos que no estén en la lista.
// Con el club por NOMBRE (opcionesClubes, categoriasPorRama) o por ID (clubesPorId, equiposDelClub).
export function useOpcionesHandball(obtenerClub, obtenerCategorias, obtenerGenero = () => '') {
  const clubes = ref([])
  const cargandoClubes = ref(false)
  const error = ref('')

  const cargar = async () => {
    if (clubes.value.length || cargandoClubes.value) return
    cargandoClubes.value = true
    error.value = ''
    try {
      clubes.value = await obtenerClubes()
    } catch (e) {
      console.error('useOpcionesHandball:', e)
      error.value = 'No se pudieron cargar los clubes.'
    } finally {
      cargandoClubes.value = false
    }
  }

  // Pide las categorías del club elegido (por id) si todavía no están
  const cargarEquipos = async (idClub) => {
    try {
      await cargarEquiposDeClub(idClub)
    } catch (e) {
      console.error('useOpcionesHandball:', e)
      error.value = 'No se pudieron cargar las categorías del club.'
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
  watch(idClubElegido, (id) => { if (id) cargarEquipos(id) }, { immediate: true })

  // Cargando clubes, o las categorías del club elegido por nombre
  const cargando = computed(() => cargandoClubes.value || cargandoEquiposDeClub(idClubElegido.value))

  // [{ etiqueta: 'Masculino', categorias: ['Juveniles A', ...] }, ...]
  const categoriasPorRama = computed(() => {
    const grupos = {}
    const ramas = ramasSegunGenero(obtenerGenero())
    for (const c of equiposDeClub(idClubElegido.value).filter(c => ramas.includes(c.rama))) {
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

  // Versión por id (arbitro_equipos): el club y los equipos se identifican por su id, no por el nombre.
  const clubesPorId = computed(() => clubes.value)
  const equiposDelClubPorId = (idClub, genero = '') => agruparPorRama(equiposDeClub(idClub), ramasSegunGenero(genero))
  const cargandoEquipos = (idClub) => cargandoEquiposDeClub(idClub)

  return {
    cargando, error, cargar, opcionesClubes, categoriasPorRama,
    clubesPorId, equiposDelClub: equiposDelClubPorId, cargarEquipos, cargandoEquipos,
  }
}
