<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- ============ HEADER ============ -->
        <div class="card-header bg-white py-3 border-bottom">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-table me-1"></i> Planilla General de Observaciones
            </h4>
            <span class="text-muted small d-block mt-1">
              Observaciones por árbitro, agrupadas por grupo. Hacé clic en una celda para ver el detalle.
            </span>
          </div>
        </div>

        <!-- ============ BODY ============ -->
        <div class="card-body p-0">

          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-danger" role="status"></div>
            <p class="text-muted mt-3 mb-0">Cargando planilla...</p>
          </div>

          <template v-else>

            <!-- Barra de herramientas -->
            <div class="d-flex flex-wrap gap-3 align-items-center px-3 py-2 border-bottom bg-light small">
              <div class="form-check form-switch mb-0">
                <input v-model="soloActivos" class="form-check-input" type="checkbox" id="chkSoloActivos">
                <label class="form-check-label text-muted" for="chkSoloActivos">Solo activos</label>
              </div>
              <div class="busqueda-wrap">
                <input v-model="busqueda" class="form-control form-control-sm shadow-none" placeholder="Buscar árbitro...">
                <button v-if="busqueda" class="btn-limpiar-busqueda" @click="busqueda = ''" title="Limpiar búsqueda" type="button">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="d-flex align-items-center gap-1">
                <label class="text-muted text-nowrap mb-0">Año:</label>
                <select v-model="filtroAnio" class="form-select form-select-sm shadow-none" style="min-width: 110px;">
                  <option value="">Todos</option>
                  <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
                </select>
              </div>
              <button @click="descargarExcel" class="btn btn-success btn-sm fw-bold d-flex align-items-center gap-1" :disabled="cargando">
                <i class="bi bi-file-earmark-excel-fill"></i> Descargar Excel
              </button>
              <span class="ms-auto d-flex flex-wrap gap-3">
                <span><span class="cuadrito estado-aprobada"></span> Aprobada</span>
                <span><span class="cuadrito estado-pendiente"></span> Pendiente</span>
                <span><span class="cuadrito estado-rechazada"></span> Rechazada</span>
                <span><span class="cuadrito estado-anulada"></span> Anulada</span>
              </span>
            </div>

            <!-- Solapas de grupo -->
            <div class="hojas-excel border-bottom">
              <button
                v-for="(g, i) in gruposTabs"
                :key="g.clave"
                class="hoja-tab"
                :class="{ activa: g.clave === grupoActivo?.clave }"
                :style="estiloTab(g, i)"
                @click="grupoActivo = g"
              >
                <span class="punto-color" :style="{ backgroundColor: colorDeGrupo(i) }"></span>
                {{ etiquetaGrupo(g) }}
                <span class="badge-cantidad">{{ contarArbitros(g) }}</span>
              </button>
              <span class="ms-auto pe-3 align-self-center text-muted small text-nowrap">
                {{ arbitrosVisibles.length }} árbitros en {{ etiquetaGrupo(grupoActivo) }}
              </span>
            </div>

            <!-- Tabla tipo Excel -->
            <div class="tabla-scroll">
              <table class="tabla-excel">
                <thead>
                  <tr>
                    <th class="col-arbitro esquina">ÁRBITRO</th>
                    <th v-for="n in maxObservaciones" :key="'h-' + n" class="th-obs">Obs {{ n }}</th>
                    <th v-if="maxObservaciones === 0" class="text-muted fst-italic fw-normal">
                      Sin observaciones para este grupo
                    </th>
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
                      @click="observacionDe(a, n) && verDetalle(observacionDe(a, n))"
                      :title="tituloCeldaObs(observacionDe(a, n))"
                    >
                      <template v-if="observacionDe(a, n)">
                        {{ textoCeldaObs(observacionDe(a, n)) }}
                      </template>
                    </td>
                    <td v-if="maxObservaciones === 0"></td>
                  </tr>
                  <tr v-if="arbitrosVisibles.length === 0">
                    <td class="col-arbitro celda-nombre text-muted fst-italic">Sin árbitros</td>
                    <td :colspan="maxObservaciones || 1" class="text-muted fst-italic px-3">
                      No hay árbitros para mostrar en este grupo.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </template>
        </div>
      </div>
    </div>

    <!-- ==========================================
         MODAL: DETALLE DE LA OBSERVACIÓN
         ========================================== -->
    <ModalBase :show="mostrarDetalle" @close="cerrarDetalle" titulo="Detalle de la Observación" icono="visibility" colorIcono="bg-primary text-white" maxWidth="800px">
      <div v-if="detalle" class="text-start">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <p class="m-0 fw-bold small text-dark">Observación #{{ detalle.id }}</p>
            <p class="m-0 text-muted small">{{ formatearFecha(detalle.fecha_partido) }} — {{ detalle.competencia }}</p>
          </div>
          <span class="align-self-center" :class="badgeEstado(detalle.estado)">{{ etiquetaEstado(detalle.estado) }}</span>
        </div>

        <div class="bg-light p-3 rounded border mb-3 border-secondary-subtle">
          <p class="m-0 small text-dark"><strong class="text-muted">Árbitros:</strong> {{ detalle.arb1 }}<span v-if="detalle.arb2 && detalle.ref2_id"> — {{ detalle.arb2 }}</span></p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Observador:</strong> {{ detalle.observador }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Partido:</strong> {{ detalle.equipo_local }} vs {{ detalle.equipo_visitante }} <span v-if="detalle.categoria_edad" class="badge bg-secondary ms-1">{{ detalle.categoria_edad }}</span></p>
          <p class="m-0 small text-dark mt-1" v-if="detalle.numero_partido"><strong class="text-muted">Nº Partido:</strong> {{ detalle.numero_partido }}</p>
          <p class="m-0 small text-dark mt-1" v-if="detalle.puntaje_final != null"><strong class="text-muted">Puntaje final:</strong> <span class="fw-bold text-danger">{{ detalle.puntaje_final }}</span></p>
        </div>

        <div v-if="(detalle.estado === 'anulada' || detalle.estado === 'rechazada') && detalle.comentario_estado" class="alert alert-danger py-2 px-3 small mb-3">
          <i class="bi bi-info-circle me-1"></i><strong>{{ detalle.estado === 'anulada' ? 'Motivo de anulación' : 'Motivo de rechazo' }}:</strong> {{ detalle.comentario_estado }}
        </div>

        <div class="border rounded overflow-hidden">
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
      </div>
      <div v-else class="text-center py-4">
        <span class="spinner-border text-danger"></span>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { api } from '@/api/api'
import ExcelJS from 'exceljs'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Planilla General de Observaciones | AAAB',
  meta: [{ name: 'description', content: 'Planilla general de observaciones arbitrales por grupo.' }]
})

const toast = inject('toast', (msg) => alert(msg.mensaje || msg))

/* ====================================================
   ESTADO
   ==================================================== */
const cargando = ref(true)
const soloActivos = ref(false)
const busqueda = ref('')
const filtroAnio = ref('')

const arbitros = ref([])
const grupos = ref([])
const observaciones = ref([])   // todas las observaciones (obtenerEvaluaciones)
const grupoActivo = ref(null)

/* ====================================================
   UTILIDADES
   ==================================================== */
const normalizar = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

const formatearFecha = (fechaIso) => {
  if (!fechaIso) return 'S/F'
  const [anio, mes, dia] = String(fechaIso).split(' ')[0].split('-')
  if (!anio || !mes || !dia) return fechaIso
  return `${dia}/${mes}/${anio}`
}

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
    const res = await api.get({ entity: 'arbitros', action: 'getArbitrosBasico', payload: { soloActivos: soloActivos.value } })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (e) { console.error('cargarArbitros:', e) }
}

const cargarGrupos = async () => {
  try {
    const res = await api.get({ entity: 'grupos', action: 'obtenerGrupos' })
    if ((res.ok || res.success) && res.payload) grupos.value = res.payload
  } catch (e) { console.error('cargarGrupos:', e) }
}

const cargarObservaciones = async () => {
  try {
    // El admin ve TODAS las observaciones (obtenerEvaluaciones ya devuelve todo para roles altos).
    const res = await api.get({ entity: 'observaciones', action: 'obtenerEvaluaciones', payload: {} })
    if ((res.ok || res.success) && Array.isArray(res.payload)) observaciones.value = res.payload
  } catch (e) { console.error('cargarObservaciones:', e) }
}

const cargarTodo = async () => {
  cargando.value = true
  await Promise.all([cargarArbitros(), cargarGrupos(), cargarObservaciones()])
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
const etiquetaGrupo = (g) => {
  if (!g) return ''
  if (g.clave === 'singrupo') return 'Sin grupo'
  return g.subgrupo ? `${g.nombre} ${g.subgrupo}` : g.nombre
}

const perteneceAlGrupo = (a, g) => {
  const grupoArb = a.nombre_grupo || a.grupo || ''
  const subArb = a.subgrupo || ''
  if (g.clave === 'singrupo') {
    return !grupos.value.some(gr =>
      normalizar(grupoArb) === normalizar(gr.nombre) &&
      normalizar(subArb) === normalizar(gr.subgrupo || '')
    )
  }
  return normalizar(grupoArb) === normalizar(g.nombre) &&
         normalizar(subArb) === normalizar(g.subgrupo || '')
}

const gruposTabs = computed(() => {
  const tabs = grupos.value.map(g => ({ ...g, clave: `${g.id}` }))
  const sinGrupo = { clave: 'singrupo', id: null, nombre: 'Sin grupo', subgrupo: '' }
  const haySinGrupo = arbitros.value.some(a => perteneceAlGrupo(a, sinGrupo))
  return haySinGrupo ? [...tabs, sinGrupo] : tabs
})

const contarArbitros = (g) => arbitros.value.filter(a => perteneceAlGrupo(a, g)).length

const PALETA_GRUPOS = ['#0d6efd', '#6f42c1', '#d63384', '#fd7e14', '#198754', '#20c997', '#0dcaf0', '#dc3545', '#6610f2', '#795548', '#607d8b', '#9e9d24']
const colorDeGrupo = (indice) => PALETA_GRUPOS[indice % PALETA_GRUPOS.length]

const estiloTab = (g, indice) => {
  const color = colorDeGrupo(indice)
  const activa = g.clave === grupoActivo.value?.clave
  return {
    borderTop: `3px solid ${color}`,
    backgroundColor: activa ? '#fff' : color + '14',
    color: activa ? color : '#495057'
  }
}

const arbitrosDelGrupo = computed(() => {
  if (!grupoActivo.value) return []
  return arbitros.value
    .filter(a => perteneceAlGrupo(a, grupoActivo.value))
    .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'))
})

const arbitrosVisibles = computed(() => {
  const b = normalizar(busqueda.value)
  if (!b) return arbitrosDelGrupo.value
  return arbitrosDelGrupo.value.filter(a => normalizar(`${a.apellido} ${a.nombre}`).includes(b))
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
  return [...set].sort((a, b) => b.localeCompare(a))
})

const observacionesPorArbitro = computed(() => {
  const mapa = {}
  const anio = filtroAnio.value
  observaciones.value.forEach(o => {
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
const maxObservaciones = computed(() => {
  let max = 0
  arbitrosVisibles.value.forEach(a => {
    const lista = observacionesPorArbitro.value[a.id] || []
    if (lista.length > max) max = lista.length
  })
  return max
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

const verDetalle = async (obs) => {
  detalle.value = null
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
  }
}

const cerrarDetalle = () => {
  mostrarDetalle.value = false
  detalle.value = null
}

/* ====================================================
   EXPORTAR EXCEL (misma grilla que se ve en pantalla)
   ==================================================== */
const descargarExcel = async () => {
  const wb = new ExcelJS.Workbook()
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
  border: none; background: transparent; color: #adb5bd; cursor: pointer; padding: 0; line-height: 1;
}

/* ====================================================
   TABLA TIPO EXCEL
   ==================================================== */
.tabla-scroll { overflow-x: auto; }
.tabla-excel {
  border-collapse: separate; border-spacing: 0;
  width: max-content; min-width: 100%; font-size: 0.8rem; background: #fff;
}
.tabla-excel th, .tabla-excel td {
  border-right: 1px solid #d4d4d8; border-bottom: 1px solid #d4d4d8;
  padding: 4px 8px; white-space: nowrap;
}
.tabla-excel thead th {
  background-color: #f1f3f5; color: #343a40; position: sticky; top: 0; z-index: 5;
  text-align: center; vertical-align: middle; font-size: 0.72rem;
}
.th-obs { min-width: 64px; }

/* Primera columna fija (árbitro) */
.col-arbitro {
  position: sticky; left: 0; background-color: #fff; z-index: 6; min-width: 190px; text-align: left !important;
}
.tabla-excel thead .esquina { z-index: 8; background-color: #e9ecef; }
.celda-nombre { font-weight: 600; color: #212529; border-right: 2px solid #adb5bd !important; }

/* Celdas de datos */
.celda { text-align: center; min-width: 56px; color: #212529; }
.celda-obs { cursor: pointer; font-weight: 600; }
.celda-obs:hover { outline: 2px solid #0d6efd; outline-offset: -2px; }
.celda-vacia { background: #fff; }

/* Colores de estado en celda (mismos tonos que las píldoras) */
.celda-aprobada { background-color: #e3f5e6; color: #2f8a45; }
.celda-pendiente { background-color: #fdf3d3; color: #a6841f; }
.celda-rechazada { background-color: #fde7ea; color: #c0304a; }
.celda-anulada { background-color: #eef1f5; color: #5b6b7f; }

/* Leyenda (cuadraditos con los mismos colores) */
.cuadrito {
  display: inline-block; width: 12px; height: 12px; border: 1px solid #ced4da;
  border-radius: 2px; margin-right: 4px; vertical-align: -1px;
}
.cuadrito.estado-aprobada { background-color: #e3f5e6 !important; }
.cuadrito.estado-pendiente { background-color: #fdf3d3 !important; }
.cuadrito.estado-rechazada { background-color: #fde7ea !important; }
.cuadrito.estado-anulada { background-color: #eef1f5 !important; }

/* ====================================================
   SOLAPAS DE GRUPO
   ==================================================== */
.hojas-excel {
  display: flex; flex-wrap: nowrap; overflow-x: auto; background-color: #f1f3f5; padding: 8px 8px 0 8px; gap: 3px;
}
.hoja-tab {
  border: 1px solid #ced4da; border-bottom: none; border-radius: 8px 8px 0 0; font-size: 0.78rem; font-weight: 600;
  padding: 6px 14px; white-space: nowrap; cursor: pointer; transition: filter 0.15s; display: flex; align-items: center; gap: 6px;
}
.hoja-tab:hover { filter: brightness(0.96); }
.hoja-tab.activa { margin-bottom: -1px; box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.06); font-weight: 700; }
.punto-color { display: inline-block; width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.badge-cantidad { display: inline-block; background-color: rgba(0, 0, 0, 0.1); border-radius: 10px; font-size: 0.65rem; padding: 1px 6px; }

/* ====================================================
   PÍLDORAS DE ESTADO (mismo estilo que Solicitudes Institucionales)
   ==================================================== */
.estado-pill {
  border-radius: 999px; padding: 0.35em 0.85em; font-weight: 700; font-size: 0.7rem;
  letter-spacing: 0.02em; border: 1px solid transparent; display: inline-block; white-space: nowrap;
}
.estado-pendiente { background-color: #fdf3d3; color: #a6841f; border-color: #f2e2a5; }
.estado-aprobada { background-color: #e3f5e6; color: #2f8a45; border-color: #bfe6c8; }
.estado-rechazada { background-color: #fde7ea; color: #c0304a; border-color: #f5c2cb; }
.estado-anulada { background-color: #eef1f5; color: #5b6b7f; border-color: #d4dbe4; }
</style>
