// Asistencia a reuniones (panel admin · Reuniones y panel de coordinadores · Reuniones mensuales).
// Árbitros, grupos, filtros, paginación, asistencia de la reunión elegida (con guardado por
// árbitro) y totales de presentes/ausentes. Lo que es propio de cada pantalla (cómo se arma
// el selector de reuniones, disertantes, crear reuniones, examen) queda en cada componente.
//  - accionArbitros: 'todos' (admin, getArbitrosBasico cacheado) | 'grupos' (coordinador)
import { ref, reactive, computed, watch } from 'vue'
import { api, listaDe } from '@/api/api'
import { normalizarTexto } from '@/utils/texto'
import { usePaginacion } from '@/composables/usePaginacion'

export const normalizarAsistencia = (valor) => {
  if (valor === null || valor === undefined) return ''
  const texto = String(valor).trim().toLowerCase()
  if (texto === 'presente') return 'presente'
  if (texto === 'ausente')  return 'ausente'
  return ''
}

export function useAsistenciaReuniones({ toast, accionArbitros = 'todos' }) {
  // ─── Estado ──────────────────────────────────────────────────────
  const arbitros             = ref([])
  const arbitrosReunion      = ref([])
  const grupos               = ref([])

  const reunionSeleccionada = ref('')
  const soloActivos         = ref(false)

  const registrosExistentes = ref({})
  const asistencias         = reactive({})
  const guardando           = reactive({})
  const guardadoOk          = reactive({})

  const cargandoInicial      = ref(true)
  const cargandoArbitros     = ref(false)
  const paginaActual         = ref(1)
  const registrosPorPagina   = 10
  const mostrarFiltrosMobile = ref(false)

  const filtros = reactive({ apellido: '', nombre: '', grupo: '', subgrupo: '', asistencia: '' })

  const asistenciasGlobales = ref({})

  // ─── Grupos (fuente para filtros y desglose) ──────────────────────
  const collator = new Intl.Collator('es', { sensitivity: 'base' })

  const GRUPOS = computed(() => {
    const vistos = []
    for (const g of grupos.value) {
      const nombre = String(g.nombre || '').trim()
      if (nombre && !vistos.includes(nombre)) vistos.push(nombre)
    }
    return vistos.sort((a, b) => collator.compare(a, b))
  })

  const SUBGRUPOS = computed(() => {
    const vistos = []
    for (const g of grupos.value) {
      const sub = String(g.subgrupo || '').trim()
      if (sub && !vistos.includes(sub)) vistos.push(sub)
    }
    return vistos.sort((a, b) => collator.compare(a, b))
  })

  const nombreGrupo = (idGrupo) => {
    const g = grupos.value.find(x => Number(x.id) === Number(idGrupo))
    if (!g) return '—'
    return g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre
  }

  // ─── Computeds: modo ─────────────────────────────────────────────
  const modoReunion = computed(() => !!reunionSeleccionada.value)

  const resumenReunionActual = computed(() => {
    const r = { presentes: 0, ausentes: 0, sinRegistro: 0 }
    for (const a of arbitrosReunion.value) {
      const v = asistencias[a.id]
      if      (v === 'presente') r.presentes++
      else if (v === 'ausente')  r.ausentes++
      else                       r.sinRegistro++
    }
    return r
  })

  const resumenAsistencia = (id) =>
    asistenciasGlobales.value[id] ?? { presentes: 0, ausentes: 0, total: 0 }

  // ─── Computeds: filtrado y paginación ────────────────────────────
  // En modo reunión, los árbitros ya vienen filtrados al grupo de la reunión elegida.
  const arbitrosMostrados = computed(() =>
    modoReunion.value ? arbitrosReunion.value : arbitros.value
  )

  const arbitrosFiltrados = computed(() => {
    const { apellido, nombre, grupo, subgrupo, asistencia } = filtros
    return arbitrosMostrados.value.filter(a => {
      if (apellido && !normalizarTexto(a.apellido).includes(normalizarTexto(apellido))) return false
      if (nombre   && !normalizarTexto(a.nombre).includes(normalizarTexto(nombre)))     return false
      if (grupo    && (a.nombre_grupo || a.grupo) !== grupo)                            return false
      if (subgrupo && (a.subgrupo ?? '') !== subgrupo)                                  return false
      if (modoReunion.value && asistencia) {
        const estadoActual = asistencias[a.id] || ''
        if (asistencia === 'presente'     && estadoActual !== 'presente')                                    return false
        if (asistencia === 'ausente'      && estadoActual !== 'ausente')                                     return false
        if (asistencia === 'sin_registro' && (estadoActual === 'presente' || estadoActual === 'ausente'))    return false
      }
      return true
    })
  })

  const arbitrosOrdenados = computed(() =>
    [...arbitrosFiltrados.value].sort((a, b) =>
      normalizarTexto(a.apellido).localeCompare(normalizarTexto(b.apellido), 'es')
    )
  )

  const totalFiltrados = computed(() => arbitrosOrdenados.value.length)
  const { totalPaginas, paginados: arbitrosPaginados } = usePaginacion(arbitrosOrdenados, registrosPorPagina, paginaActual)

  // ─── Cargas ──────────────────────────────────────────────────────
  const obtenerGrupos = async () => {
    try {
      const res = await api.getCacheado({ entity: 'grupos', action: 'obtenerGrupos' })
      grupos.value = listaDe(res)
    } catch (e) { console.error('obtenerGrupos:', e) }
  }

  // Admin ve TODOS los árbitros; el coordinador, solo los de sus grupos.
  const cargarArbitros = async () => {
    try {
      const res = accionArbitros === 'grupos'
        ? await api.get({ entity: 'arbitros', action: 'obtenerArbitrosFiltradosPorGrupo', payload: { soloActivos: soloActivos.value } })
        : await api.getCacheado({ entity: 'arbitros', action: 'getArbitrosBasico', payload: { soloActivos: soloActivos.value } }, { ttl: 60 * 1000 })
      if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
    } catch (e) { console.error('cargarArbitros:', e) }
  }

  // Un solo request con los totales de presentes/ausentes por árbitro
  // (antes se pedía obtenerArbitrosReunion una vez por cada reunión).
  const cargarAsistenciasGlobales = async () => {
    if (!arbitros.value.length) return
    const mapa = {}
    arbitros.value.forEach(a => { mapa[a.id] = { presentes: 0, ausentes: 0, total: 0 } })
    try {
      const res = await api.get({ entity: 'reuniones', action: 'obtenerResumenAsistenciasReuniones', payload: {} })
      if (!res?.ok) throw new Error(res?.message || 'No se pudo obtener el resumen de asistencias')
      for (const r of (res.payload || [])) {
        const presentes = Number(r.presentes) || 0
        const ausentes  = Number(r.ausentes) || 0
        mapa[r.id_arbitro] = { presentes, ausentes, total: presentes + ausentes }
      }
      asistenciasGlobales.value = mapa
    } catch (e) { console.error('Error cargando asistencias globales:', e) }
  }

  // ─── Reunión elegida ─────────────────────────────────────────────
  const limpiarAsistencias = () => {
    Object.keys(asistencias).forEach(k => delete asistencias[k])
    Object.keys(guardando).forEach(k => delete guardando[k])
    Object.keys(guardadoOk).forEach(k => delete guardadoOk[k])
    registrosExistentes.value = {}
    arbitrosReunion.value = []
  }

  const limpiarFiltros = () => Object.keys(filtros).forEach(k => (filtros[k] = ''))

  // Árbitros convocados a un evento con su asistencia ya cargada.
  // filtrar: para quedarse con los de un grupo (el admin desglosa cada reunión por grupo).
  const cargarArbitrosReunion = async (idEvento, filtrar = (lista) => lista) => {
    const resArb = await api.get({
      entity: 'reuniones',
      action: 'obtenerArbitrosReunion',
      payload: { idEvento: Number(idEvento), soloActivos: soloActivos.value }
    })
    if ((resArb.ok || resArb.success) && resArb.payload) {
      arbitrosReunion.value = filtrar(resArb.payload)
      arbitrosReunion.value.forEach(a => {
        const asistencia = normalizarAsistencia(a.asistencia)
        if (asistencia) asistencias[a.id] = asistencia
      })
    }
  }

  // Guarda la asistencia marcada para un árbitro (guardado automático, uno por uno).
  const guardarAsistencia = async (a, idEvento) => {
    const estado = asistencias[a.id]
    if (!estado) return
    guardando[a.id] = true
    delete guardadoOk[a.id]
    try {
      const res = await api.post({
        entity: 'reuniones',
        action: 'registrarAsistenciaArbitro',
        payload: { idEvento: Number(idEvento), idArbitro: a.id, tipo: estado },
      })
      if (res.payload) {
        guardadoOk[a.id] = true
        setTimeout(() => { delete guardadoOk[a.id] }, 2500)
      } else {
        const prev = registrosExistentes.value[a.id]
        if (prev) asistencias[a.id] = prev.estado == 2 ? 'ausente' : 'presente'
        else delete asistencias[a.id]
        toast({ titulo: 'Error', mensaje: res.message || 'No se pudo guardar la asistencia.', tipo: 'danger' })
      }
    } catch {
      toast({ titulo: 'Error fatal', mensaje: 'Error de conexión con el servidor.', tipo: 'danger' })
    } finally {
      guardando[a.id] = false
    }
  }

  watch(filtros,      () => { paginaActual.value = 1 }, { deep: true })
  watch(modoReunion,  () => { paginaActual.value = 1 })

  return {
    arbitros, arbitrosReunion, grupos, reunionSeleccionada, soloActivos,
    registrosExistentes, asistencias, guardando, guardadoOk,
    cargandoInicial, cargandoArbitros, paginaActual, mostrarFiltrosMobile, filtros,
    GRUPOS, SUBGRUPOS, nombreGrupo, modoReunion, resumenReunionActual, resumenAsistencia,
    totalFiltrados, totalPaginas, arbitrosPaginados,
    obtenerGrupos, cargarArbitros, cargarAsistenciasGlobales,
    limpiarAsistencias, limpiarFiltros, cargarArbitrosReunion, guardarAsistencia
  }
}
