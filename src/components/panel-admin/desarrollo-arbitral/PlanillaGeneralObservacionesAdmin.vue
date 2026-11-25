<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <!-- ============ HEADER ============ -->
        <div class="card-header bg-white py-3 border-bottom">
          <p class="seccion-descripcion">Observaciones de todos los árbitros</p>
        </div>

        <!-- ============ BODY ============ -->
        <div class="card-body p-0">

          <EstadoCargando v-if="cargando" texto="Cargando planilla" />

          <template v-else>

            <!-- Barra de herramientas -->
            <div class="barra-planilla d-flex flex-wrap gap-3 align-items-center px-3 py-2 border-bottom bg-light small">
              <select v-if="gruposTabs.length" aria-label="Grupo" class="form-select shadow-none fw-semibold text-dark control-barra selector-grupo" :value="grupoActivo?.clave" @change="elegirGrupo($event.target.value)">
                <option v-for="g in gruposTabs" :key="g.clave" :value="g.clave">{{ etiquetaGrupo(g) }} ({{ contarArbitros(g) }})</option>
              </select>
              <div class="form-check form-switch mb-0">
                <input v-model="soloActivos" class="form-check-input" type="checkbox" id="chkSoloActivos">
                <label class="form-check-label text-muted" for="chkSoloActivos">Solo activos</label>
              </div>
              <div class="busqueda-wrap">
                <input aria-label="Buscar árbitro" v-model="busqueda" class="form-control shadow-none control-barra" placeholder="BUSCAR ÁRBITRO...">
                <button v-if="busqueda" class="btn-limpiar-busqueda" @click="busqueda = ''" title="Limpiar búsqueda" type="button">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="d-flex align-items-center gap-1">
                <label class="text-muted text-nowrap mb-0">Año:</label>
                <select aria-label="Año" v-model="filtroAnio" class="form-select shadow-none text-uppercase text-dark control-barra" style="min-width: 110px;">
                  <option value="">TODOS</option>
                  <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                </select>
              </div>
              <BotonHerramienta tipo="excel" :disabled="cargando" @click="descargarExcel" />
              <span class="text-muted text-nowrap">{{ arbitrosVisibles.length }} árbitros</span>
              <span class="leyenda-planilla ms-auto d-flex flex-wrap gap-3">
                <span><span class="cuadrito estado-aprobada"></span> Aprobada</span>
                <span><span class="cuadrito estado-pendiente"></span> Pendiente</span>
                <span><span class="cuadrito estado-rechazada"></span> Rechazada</span>
                <span><span class="cuadrito estado-anulada"></span> Anulada</span>
              </span>
            </div>
            <!-- Tabla tipo Excel -->
            <div class="d-none d-lg-block tabla-scroll">
              <table class="tabla-excel">
                <thead>
                  <tr>
                    <th class="col-arbitro esquina">ÁRBITRO</th>
                    <th v-for="n in maxObservaciones" :key="'h-' + n" class="th-obs">Obs {{ n }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in arbitrosVisibles" :key="a.id">
                    <td class="col-arbitro celda-nombre">{{ a.apellido }}, {{ a.nombre }}</td>
                    <td
                      v-for="n in maxObservaciones"
                      :key="a.id + '-obs-' + n"
                      class="celda"
                      :class="claseCeldaObs(observacionDe(a, n))"
                      :title="tituloCeldaObs(observacionDe(a, n))"
                    >
                      <div v-if="observacionDe(a, n)" class="celda-obs-contenido">
                        <span class="celda-obs-nota">{{ textoCeldaObs(observacionDe(a, n)) }}</span>
                        <button
                          class="btn-ver-celda"
                          @click.stop="verDetalle(observacionDe(a, n))"
                          :disabled="cargandoDetalleId === observacionDe(a, n).id"
                          title="Ver detalle y comentarios"
                        >
                          <span v-if="cargandoDetalleId === observacionDe(a, n).id" class="spinner-border spinner-border-sm"></span>
                          <i v-else class="bi bi-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="arbitrosVisibles.length === 0">
                    <td class="col-arbitro celda-nombre text-muted fst-italic">Sin árbitros</td>
                    <td :colspan="maxObservaciones" class="text-muted fst-italic px-3">
                      No hay árbitros para mostrar en este grupo.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Celular y app: una tarjeta por árbitro, como las planillas del curso -->
            <div class="d-lg-none d-flex flex-column gap-3 p-3">
              <div v-if="!arbitrosVisibles.length" class="text-center py-4 text-muted fst-italic small">No hay árbitros para mostrar en este grupo.</div>
              <div v-for="a in arbitrosVisibles" :key="'m-' + a.id" class="card border-light-subtle shadow-sm rounded-3">
                <div class="card-body p-3 small">
                  <div class="fw-bold text-dark text-uppercase mb-1">{{ a.apellido }}, {{ a.nombre }}</div>
                  <div v-if="!observacionDe(a, 1)" class="text-muted fst-italic">Sin observaciones.</div>
                  <template v-for="n in maxObservaciones" :key="'m-' + a.id + '-obs-' + n">
                    <div v-if="observacionDe(a, n)" class="fila-planilla d-flex justify-content-between align-items-center gap-2">
                      <div class="min-w-0">
                        <div class="text-dark">Obs {{ n }}</div>
                        <div class="text-muted texto-07 text-break">{{ tituloCeldaObs(observacionDe(a, n)) }}</div>
                      </div>
                      <div class="flex-shrink-0 d-flex align-items-center gap-2">
                        <span class="chip-nota" :class="claseCeldaObs(observacionDe(a, n))">{{ textoCeldaObs(observacionDe(a, n)) }}</span>
                        <button type="button" class="btn-ver-celda" :disabled="cargandoDetalleId === observacionDe(a, n).id" title="Ver detalle y comentarios" aria-label="Ver detalle y comentarios" @click="verDetalle(observacionDe(a, n))">
                          <span v-if="cargandoDetalleId === observacionDe(a, n).id" class="spinner-border spinner-border-sm"></span>
                          <i v-else class="bi bi-eye"></i>
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

          </template>
        </div>
      </div>
    </div>

    <!-- ==========================================
         MODAL: DETALLE DE LA OBSERVACIÓN
         ========================================== -->
    <ModalBase :show="mostrarDetalle" @close="cerrarDetalle" titulo="Detalle de la Observación" icono="visibility" colorIcono="bg-secondary text-white" maxWidth="800px">
      <div v-if="detalle" class="text-start">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <p class="m-0 fw-bold small text-dark">Observación #{{ detalle.id }}</p>
            <p class="m-0 text-muted small">{{ formatearFecha(detalle.fecha_partido) }} — {{ nombreTorneo(detalle) }}</p>
          </div>
          <span class="align-self-center" :class="badgeEstado(detalle.estado)">{{ etiquetaEstado(detalle.estado) }}</span>
        </div>

        <div class="bg-light p-3 rounded border mb-3 border-secondary-subtle">
          <p class="m-0 small text-dark"><strong class="text-muted">Árbitros:</strong> {{ detalle.arb1 }}<span v-if="detalle.arb2 && detalle.ref2_id"> — {{ detalle.arb2 }}</span></p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Observador:</strong> {{ detalle.observador }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Categoría:</strong> {{ categoriaObs(detalle) }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Partido:</strong> {{ detalle.equipo_local }} vs {{ detalle.equipo_visitante }}</p>
          <p class="m-0 small text-dark mt-1" v-if="detalle.puntaje_final != null"><strong class="text-muted">Puntaje final:</strong> <span class="fw-bold text-danger">{{ detalle.puntaje_final }}</span></p>
        </div>

        <div v-if="(detalle.estado === 'anulada' || detalle.estado === 'rechazada') && detalle.comentario_estado" class="alert alert-danger py-2 px-3 small mb-3">
          <i class="bi bi-info-circle me-1"></i><strong>{{ detalle.estado === 'anulada' ? 'Motivo de anulación' : 'Motivo de rechazo' }}:</strong> {{ detalle.comentario_estado }}
        </div>

        <!-- Tabs: Score sheet (puntajes) / Comment sheet (comentarios) -->
        <ul class="nav nav-tabs mb-0" role="tablist">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tabDetalle === 'puntajes' }" type="button" @click="tabDetalle = 'puntajes'">
              <i class="bi bi-list-ol me-1"></i> Puntajes
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tabDetalle === 'comentarios' }" type="button" @click="tabDetalle = 'comentarios'">
              <i class="bi bi-chat-left-text me-1"></i> Comentarios
            </button>
          </li>
        </ul>

        <!-- TAB PUNTAJES (Score sheet) -->
        <div v-show="tabDetalle === 'puntajes'" class="border border-top-0 rounded-bottom overflow-hidden">
          <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.78rem;">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 text-uppercase text-muted">Categoría / Ítem</th>
                <th class="py-2 text-center text-uppercase text-muted" style="width: 150px;">Valoración</th>
                <th class="py-2 text-center text-uppercase text-muted" style="width: 90px;">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="it in (detalle.items || [])" :key="'it-' + it.id">
                <tr v-if="it.tipo === 'categoria'" class="table-light">
                  <td class="fw-bold text-dark ps-3">{{ it.categoria }}</td>
                  <td></td>
                  <td class="text-center fw-bold text-danger">{{ it.puntaje ?? '-' }}</td>
                </tr>
                <tr v-else>
                  <td class="text-dark ps-4">{{ it.item }}</td>
                  <td class="text-center text-muted">{{ it.valoracion || '-' }}</td>
                  <td class="text-center">{{ it.puntaje ?? '-' }}</td>
                </tr>
              </template>
              <tr v-if="!detalle.items || detalle.items.length === 0">
                <td colspan="3" class="text-center py-3 text-muted">Sin ítems cargados.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAB COMENTARIOS (Comment sheet) -->
        <div v-show="tabDetalle === 'comentarios'" class="border border-top-0 rounded-bottom p-3">
          <!-- Comentario por categoría -->
          <div v-if="comentariosPorCategoria.length">
            <div v-for="(c, idx) in comentariosPorCategoria" :key="'com-' + idx" class="mb-3">
              <div class="fw-bold small text-dark">{{ c.categoria }}</div>
              <div class="small text-muted texto-pre-line">{{ c.comentario }}</div>
            </div>
          </div>

          <!-- Prioridades de mejora -->
          <div v-if="detalle.prioridad_mejora_1 || detalle.prioridad_mejora_2 || detalle.prioridad_mejora_resto" class="mt-2 pt-2 border-top">
            <div class="fw-bold small text-dark mb-1">Prioridades de mejora</div>
            <div v-if="detalle.prioridad_mejora_1" class="small text-muted mb-1"><strong>1.</strong> {{ detalle.prioridad_mejora_1 }}</div>
            <div v-if="detalle.prioridad_mejora_2" class="small text-muted mb-1"><strong>2.</strong> {{ detalle.prioridad_mejora_2 }}</div>
            <div v-if="detalle.prioridad_mejora_resto" class="small text-muted mb-1 texto-pre-line">{{ detalle.prioridad_mejora_resto }}</div>
          </div>

          <!-- Influencia en el resultado -->
          <div v-if="detalle.influencia_resultado_comentarios" class="mt-2 pt-2 border-top">
            <div class="fw-bold small text-dark mb-1">Influencia en el resultado</div>
            <div class="small text-muted texto-pre-line">{{ detalle.influencia_resultado_comentarios }}</div>
          </div>

          <div v-if="!tieneComentarios" class="text-center py-3 text-muted small">
            Esta observación no tiene comentarios cargados.
          </div>
        </div>

        <!-- Acciones (dentro del cuerpo para que se vean también en mobile) -->
        <div class="d-flex flex-column flex-sm-row gap-2 mt-4">
          <button @click="descargarObservacionExcel(detalle)" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm order-1 order-sm-2 flex-sm-grow-1 d-flex align-items-center justify-content-center gap-2" :disabled="descargandoId === detalle.id">
            <span v-if="descargandoId === detalle.id" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-file-earmark-excel"></i>
            DESCARGAR EXCEL
          </button>
          <button @click="cerrarDetalle" class="btn btn-light border rounded-pill px-4 fw-bold order-2 order-sm-1 flex-sm-grow-1">CERRAR</button>
        </div>
      </div>
      <div v-else class="text-center py-4">
        <span class="spinner-border text-danger"></span>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { anioActual, conAnioActual } from '@/utils/anios'
import { ref, computed, watch, onMounted, inject } from 'vue'
import { categoriaObs, nombreDeTorneo } from '@/utils/observaciones'
import { useGruposPlanilla } from '@/composables/useGruposPlanilla'
import { normalizarTexto } from '@/utils/texto'
import { fechaArg } from '@/utils/fechas'
import { cargarExcelJS } from '@/utils/librerias'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Planilla General de Observaciones | AAAB',
  meta: [{ name: 'description', content: 'Planilla general de observaciones arbitrales por grupo.' }]
})

const toast = inject('toast')

/* ====================================================
   ESTADO
   ==================================================== */
const cargando = ref(true)
const soloActivos = ref(false)
const busqueda = ref('')
const filtroAnio = ref(anioActual())

const arbitros = ref([])
const grupos = ref([])
const observaciones = ref([])   // todas las observaciones (obtenerEvaluaciones)
const grupoActivo = ref(null)

/* ====================================================
   UTILIDADES
   ==================================================== */

const formatearFecha = (fecha) => fechaArg(fecha, 'S/F')

const etiquetaEstado = (estado) => {
  const e = (estado || 'pendiente').toLowerCase()
  if (e === 'aprobada') return 'Aprobada'
  if (e === 'rechazada') return 'Rechazada'
  if (e === 'anulada') return 'Anulada'
  return 'Pendiente'
}

const badgeEstado = (estado) => {
  const e = (estado || 'pendiente').toLowerCase()
  if (e === 'aprobada') return 'estado-pill estado-aprobada'
  if (e === 'rechazada') return 'estado-pill estado-rechazada'
  if (e === 'anulada') return 'estado-pill estado-anulada'
  return 'estado-pill estado-pendiente'
}

/* ====================================================
   CARGA DE DATOS
   ==================================================== */
const cargarArbitros = async () => {
  try {
    const res = await api.getCacheado({ entity: 'arbitros', action: 'getArbitrosBasico', payload: { soloActivos: soloActivos.value } }, { ttl: 60 * 1000 })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (e) { console.error('cargarArbitros:', e) }
}

const cargarGrupos = async () => {
  try {
    const res = await api.getCacheado({ entity: 'grupos', action: 'obtenerGrupos' })
    if ((res.ok || res.success) && res.payload) grupos.value = res.payload
  } catch (e) { console.error('cargarGrupos:', e) }
}

// Torneos: se resuelve id -> nombre (reemplaza la competencia del Excel)
const torneos = ref([])

const cargarTorneos = async () => {
  try {
    const res = await api.getCacheado({ entity: 'observaciones', action: 'obtenerTorneos' })
    if ((res.ok || res.success) && Array.isArray(res.payload)) torneos.value = res.payload
  } catch (e) { console.error('cargarTorneos:', e) }
}

const nombreTorneo = (o) => nombreDeTorneo(torneos.value, o)

const cargarObservaciones = async () => {
  try {
    // El admin ve TODAS las observaciones (obtenerEvaluaciones ya devuelve todo para roles altos).
    const res = await api.get({ entity: 'observaciones', action: 'obtenerEvaluaciones', payload: {} })
    if ((res.ok || res.success) && Array.isArray(res.payload)) observaciones.value = res.payload
  } catch (e) { console.error('cargarObservaciones:', e) }
}

const cargarTodo = async () => {
  cargando.value = true
  await Promise.all([cargarArbitros(), cargarGrupos(), cargarObservaciones(), cargarTorneos()])
  if (!grupoActivo.value && gruposTabs.value.length > 0) grupoActivo.value = gruposTabs.value[0]
  cargando.value = false
}

watch(soloActivos, async () => {
  cargando.value = true
  await cargarArbitros()
  cargando.value = false
})

onMounted(cargarTodo)

/* ====================================================
   GRUPOS (SOLAPAS)  — mismo criterio que PlanillaGeneralAdmin
   ==================================================== */
const { etiquetaGrupo, perteneceAlGrupo, gruposTabs, contarArbitros, elegirGrupo } = useGruposPlanilla({ arbitros, grupos, grupoActivo, modo: 'nombre' })


const arbitrosDelGrupo = computed(() => {
  if (!grupoActivo.value) return []
  return arbitros.value
    .filter(a => perteneceAlGrupo(a, grupoActivo.value))
    .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'))
})

const arbitrosVisibles = computed(() => {
  const b = normalizarTexto(busqueda.value)
  if (!b) return arbitrosDelGrupo.value
  return arbitrosDelGrupo.value.filter(a => normalizarTexto(`${a.apellido} ${a.nombre}`).includes(b))
})

/* ====================================================
   OBSERVACIONES POR ÁRBITRO
   Índice idArbitro -> [observaciones] (ordenadas por fecha),
   contando las observaciones donde el árbitro es ref1 o ref2.
   ==================================================== */
const aniosDisponibles = computed(() => {
  const set = new Set()
  observaciones.value.forEach(o => {
    const anio = (o.fecha_partido || '').substring(0, 4)
    if (anio) set.add(anio)
  })
  return conAnioActual(set)
})

const observacionesPorArbitro = computed(() => {
  const mapa = {}
  const anio = filtroAnio.value
  observaciones.value.forEach(o => {
    if (['anulada', 'rechazada'].includes((o.estado || '').toLowerCase())) return
    if (anio && (o.fecha_partido || '').substring(0, 4) !== anio) return
    const ids = [o.ref1_id, o.ref2_id].filter(Boolean)
    ids.forEach(id => {
      if (!mapa[id]) mapa[id] = []
      mapa[id].push(o)
    })
  })
  // Ordenamos cada lista por fecha ascendente (Obs 1 = la más antigua)
  Object.values(mapa).forEach(lista =>
    lista.sort((a, b) => String(a.fecha_partido || '').localeCompare(String(b.fecha_partido || '')))
  )
  return mapa
})

// Cantidad máxima de observaciones que tiene un árbitro del grupo visible:
// determina cuántas columnas Obs 1..N se dibujan.
// Columnas mínimas que se muestran siempre, aunque no haya observaciones,
// para que la planilla quede enumerada (1..N) con casilleros vacíos.
const MIN_COLUMNAS = 20

const maxObservaciones = computed(() => {
  let max = 0
  arbitrosVisibles.value.forEach(a => {
    const lista = observacionesPorArbitro.value[a.id] || []
    if (lista.length > max) max = lista.length
  })
  return Math.max(max, MIN_COLUMNAS)
})

// Observación n-ésima (1-based) de un árbitro, o null.
const observacionDe = (a, n) => {
  const lista = observacionesPorArbitro.value[a.id] || []
  return lista[n - 1] || null
}

const claseCeldaObs = (obs) => {
  if (!obs) return 'celda-vacia'
  const e = (obs.estado || 'pendiente').toLowerCase()
  if (e === 'aprobada') return 'celda-obs celda-aprobada'
  if (e === 'rechazada') return 'celda-obs celda-rechazada'
  if (e === 'anulada') return 'celda-obs celda-anulada'
  return 'celda-obs celda-pendiente'
}

// Texto dentro de la celda: puntaje final si existe, si no la inicial del estado.
const textoCeldaObs = (obs) => {
  if (!obs) return ''
  if (obs.puntaje_final != null && obs.puntaje_final !== '') return obs.puntaje_final
  return etiquetaEstado(obs.estado).charAt(0) // P / A / R (inicial) como referencia rápida
}

const tituloCeldaObs = (obs) => {
  if (!obs) return ''
  return `${formatearFecha(obs.fecha_partido)} — ${obs.equipo_local} vs ${obs.equipo_visitante} (${etiquetaEstado(obs.estado)})`
}

/* ====================================================
   DETALLE (MODAL)
   ==================================================== */
const mostrarDetalle = ref(false)
const detalle = ref(null)
const descargandoId = ref(null)
const cargandoDetalleId = ref(null)
const tabDetalle = ref('puntajes')

// Categoría del partido con fallback a la categoría de edad del Excel.

// Comentarios por categoría (Comment sheet): los ítems tipo categoría que tienen comentario.
const comentariosPorCategoria = computed(() => {
  if (!detalle.value || !Array.isArray(detalle.value.items)) return []
  return detalle.value.items
    .filter(it => it.tipo === 'categoria' && it.comentario)
    .map(it => ({ categoria: it.categoria, comentario: it.comentario }))
})

const tieneComentarios = computed(() => {
  if (!detalle.value) return false
  return comentariosPorCategoria.value.length > 0
    || !!detalle.value.prioridad_mejora_1
    || !!detalle.value.prioridad_mejora_2
    || !!detalle.value.prioridad_mejora_resto
    || !!detalle.value.influencia_resultado_comentarios
})

const verDetalle = async (obs) => {
  cargandoDetalleId.value = obs.id
  detalle.value = null
  tabDetalle.value = 'puntajes'
  mostrarDetalle.value = true
  try {
    const res = await api.get({ entity: 'observaciones', action: 'obtenerEvaluacion', payload: { id: obs.id } })
    if ((res.ok || res.success) && res.payload) {
      detalle.value = { ...obs, ...res.payload }
    } else {
      toast({ titulo: 'Error', mensaje: 'No se pudo cargar el detalle.', tipo: 'danger' })
      mostrarDetalle.value = false
    }
  } catch (e) {
    console.error('verDetalle:', e)
    mostrarDetalle.value = false
  } finally {
    cargandoDetalleId.value = null
  }
}

const cerrarDetalle = () => {
  mostrarDetalle.value = false
  detalle.value = null
}

/* ====================================================
   EXPORTAR EXCEL (misma grilla que se ve en pantalla)
   ==================================================== */
const descargarObservacionExcel = async (obs) => {
  if (!obs) return
  descargandoId.value = obs.id
  try {
    await api.getFile(
      { entity: 'observaciones', action: 'descargarEvaluacionExcel', payload: { id: obs.id } },
      `observacion_${obs.id}.xlsx`
    )
  } catch (e) {
    console.error('descargarObservacionExcel:', e)
    toast({ titulo: 'Error', mensaje: 'No se pudo descargar el Excel de la observación.', tipo: 'danger' })
  } finally {
    descargandoId.value = null
  }
}

const descargarExcel = async () => {
  const wb = new (await cargarExcelJS()).Workbook()
  const ws = wb.addWorksheet(etiquetaGrupo(grupoActivo.value) || 'Observaciones')

  const cols = maxObservaciones.value
  ws.columns = [
    { header: 'ÁRBITRO', key: 'arb', width: 28 },
    ...Array.from({ length: cols }, (_, i) => ({ header: `Obs ${i + 1}`, key: `obs${i + 1}`, width: 14 }))
  ]

  arbitrosVisibles.value.forEach(a => {
    const fila = { arb: `${a.apellido}, ${a.nombre}` }
    for (let n = 1; n <= cols; n++) {
      const obs = observacionDe(a, n)
      fila[`obs${n}`] = obs ? `${etiquetaEstado(obs.estado)}${obs.puntaje_final != null ? ' (' + obs.puntaje_final + ')' : ''}` : ''
    }
    ws.addRow(fila)
  })

  if (cols >= 0) ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Observaciones_${etiquetaGrupo(grupoActivo.value) || 'grupo'}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; padding: 16px 0; }
.animate__animated { animation-duration: 0.4s; }

/* Búsqueda */
.busqueda-wrap { position: relative; }
.busqueda-wrap input { padding-right: 28px; min-width: 200px; }
.btn-limpiar-busqueda {
  position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
  border: none; background: transparent; color: var(--o-texto-suave, #adb5bd); cursor: pointer; padding: 0; line-height: 1;
}

/* ====================================================
   TABLA TIPO EXCEL
   ==================================================== */
/* Scroll propio (vertical y horizontal): la fila de títulos y la primera columna quedan fijas */
.tabla-scroll { max-height: 70vh; overflow: auto; -webkit-overflow-scrolling: touch; }
.tabla-excel {
  border-collapse: separate; border-spacing: 0;
  width: max-content; min-width: 0; font-size: 0.8rem; background: var(--o-tarjeta, #fff);
}

/* Mobile-first: en pantallas chicas achicamos un poco todo y limitamos
   el ancho de la columna fija de árbitro para que quede más lugar de scroll. */
@media (max-width: 575.98px) {
  .tabla-excel { font-size: 0.72rem; }
  .tabla-excel th, .tabla-excel td { padding: 3px 5px; }
  .celda-nombre { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
  .th-obs { min-width: 52px; }
  .celda { min-width: 58px; }
}
.tabla-excel th, .tabla-excel td {
  border-right: 1px solid var(--o-borde, #d4d4d8); border-bottom: 1px solid var(--o-borde, #d4d4d8);
  padding: 4px 8px; white-space: nowrap;
}
.tabla-excel thead th {
  background-color: var(--o-chip, #f1f3f5); color: var(--o-texto, #343a40); position: sticky; top: 0; z-index: 5;
  text-align: center; vertical-align: middle; font-size: 0.72rem;
}
.th-obs { min-width: 64px; }

/* Primera columna fija (árbitro) */
.col-arbitro {
  position: sticky; left: 0; background-color: var(--o-tarjeta, #fff); z-index: 6; width: 1%; white-space: nowrap; text-align: left !important;
}
.tabla-excel thead .esquina { z-index: 8; background-color: var(--o-chip, #e9ecef); }
.celda-nombre { font-weight: 600; color: var(--o-texto, #212529); border-right: 2px solid var(--o-borde, #adb5bd) !important; padding-right: 14px; }

/* Celdas de datos */
.celda { text-align: center; min-width: 72px; color: var(--o-texto, #212529); padding: 2px 4px; }
.celda-obs { font-weight: 600; }
.celda-vacia { background: var(--o-tarjeta, #fff); }

/* Contenido de la celda: nota + botón de Ver al lado */
.celda-obs-contenido { display: flex; align-items: center; justify-content: center; gap: 4px; }
.celda-obs-nota {
  min-width: 22px; padding: 1px 3px; border-radius: 3px;
}
.btn-ver-celda {
  border: none; background: transparent; color: var(--o-rojo-texto, #dc2626); cursor: pointer;
  padding: 0 2px; line-height: 1; display: inline-flex; align-items: center;
}
.btn-ver-celda .bi { font-size: 17px; }
.btn-ver-celda:hover { color: var(--o-rojo-texto, #b91c1c); }
.btn-ver-celda:disabled { opacity: 0.5; cursor: default; }

/* Colores de estado en celda (mismos tonos que las píldoras) */
.celda-aprobada { background-color: var(--o-verde-fondo, #e3f5e6); color: var(--o-verde-texto, #2f8a45); }
.celda-pendiente { background-color: var(--o-ambar-fondo, #fdf3d3); color: var(--o-ambar-texto, #a6841f); }
.celda-rechazada { background-color: var(--o-rojo-fondo, #fde7ea); color: var(--o-rojo-texto, #c0304a); }
.celda-anulada { background-color: var(--o-chip, #eef1f5); color: var(--o-texto-suave, #5b6b7f); }

/* Leyenda (cuadraditos con los mismos colores) */
.cuadrito {
  display: inline-block; width: 12px; height: 12px; border: 1px solid var(--o-borde, #ced4da);
  border-radius: 2px; margin-right: 4px; vertical-align: -1px;
}
.cuadrito.estado-aprobada { background-color: var(--o-verde-fondo, #e3f5e6) !important; }
.cuadrito.estado-pendiente { background-color: var(--o-ambar-fondo, #fdf3d3) !important; }
.cuadrito.estado-rechazada { background-color: var(--o-rojo-fondo, #fde7ea) !important; }
.cuadrito.estado-anulada { background-color: var(--o-chip, #eef1f5) !important; }

</style>
<style scoped src="@/assets/css/planilla-general.css"></style>
