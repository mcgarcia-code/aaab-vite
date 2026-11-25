<template>
  <ModalBase :show="show" icono="person_search" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="800px" @close="emit('close')">
    <template #header>
      <div class="text-center w-100">
        <span class="fw-bold fs-5">Detalle de {{ arbitro?.apellido }}, {{ arbitro?.nombre }}</span>
        <div class="text-muted small mt-1">Historial de reuniones</div>
      </div>
    </template>

    <EstadoCargando v-if="cargandoHistorial" texto="Cargando historial" />

    <EstadoVacio v-else-if="!reunionesDelArbitroDetalle.length" icono="bi-clock-history" titulo="No hay reuniones registradas para este árbitro" />

    <div v-else>
      <div class="d-flex justify-content-end mb-3" v-if="añosDetalleArbitro.length">
        <div class="d-flex align-items-center gap-2">
          <label class="small fw-bold text-dark text-uppercase m-0">Año:</label>
          <select aria-label="Año" v-model="filtroAñoDetalle" class="form-select form-select-sm shadow-sm border-secondary-subtle text-uppercase text-dark select-anio">
            <option value="">AÑO</option>
            <option v-for="año in añosDetalleArbitro" :key="año" :value="año">{{ año }}</option>
          </select>
        </div>
      </div>

      <div class="row g-2 mb-4">
        <div class="col-4">
          <div class="card border-0 shadow-sm h-100 bg-success">
            <div class="card-body p-2 text-center text-white">
              <i class="bi bi-person-check-fill icono-resumen"></i>
              <div class="fw-bold fs-5 mt-1 lh-1">{{ resumenDetalle.presentes }}</div>
              <div class="small text-uppercase fw-bold opacity-75 mt-1 texto-065">Presentes</div>
            </div>
          </div>
        </div>
        <div class="col-4">
          <div class="card border-0 shadow-sm h-100 bg-secondary">
            <div class="card-body p-2 text-center text-white">
              <i class="bi bi-person-dash-fill icono-resumen"></i>
              <div class="fw-bold fs-5 mt-1 lh-1">{{ resumenDetalle.ausentes }}</div>
              <div class="small text-uppercase fw-bold opacity-75 mt-1 texto-065">Ausentes</div>
            </div>
          </div>
        </div>
        <div class="col-4">
          <div class="card border-0 shadow-sm h-100 bg-light">
            <div class="card-body p-2 text-center text-muted">
              <i class="bi bi-question-circle-fill icono-resumen"></i>
              <div class="fw-bold fs-5 mt-1 lh-1">{{ resumenDetalle.sinInformacion }}</div>
              <div class="small text-uppercase fw-bold opacity-75 mt-1 texto-065">Sin info</div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-warning">
        <i class="bi bi-calendar-event text-warning-emphasis me-2"></i>
        <h6 class="fw-bold m-0 text-dark text-uppercase">Reuniones</h6>
      </div>
      <div class="row g-2">
        <div v-for="ex in reunionesFiltradosDetalle" :key="ex.id" class="col-12 col-md-6">
          <div class="card border border-light-subtle shadow-sm h-100 bg-white">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-dark fw-bold small mb-1">
                    <i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(ex.fecha_reunion) }}
                  </div>
                  <div v-if="ex.titulo" class="text-muted small fst-italic">{{ ex.titulo }}</div>
                </div>
                <div class="d-flex flex-column align-items-end gap-1">
                  <span class="badge bg-dark font-monospace texto-065">#{{ ex.id }}</span>
                  <span class="estado-pill" :class="claseAsistencia(ex.asistencia)">{{ textoAsistencia(ex.asistencia) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ModalBase>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ModalBase from '@/components/ModalBase.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import { api } from '@/api/api'
import { anioActual, conAnioActual } from '@/utils/anios'
import { normalizarAsistencia } from '@/composables/useAsistenciaReuniones'

// Historial de reuniones de un árbitro (presentes, ausentes y sin información, por año).
// Se carga solo al abrirse con un árbitro: { id, apellido, nombre }.
const props = defineProps({
  show: { type: Boolean, default: false },
  arbitro: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const CATEGORIA = 'reunion'
const formatFecha  = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha   = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const sortPorFecha = (lista) => [...lista].sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))

const cargandoHistorial            = ref(false)
const reunionesArbitroSeleccionado = ref([])
const filtroAñoDetalle             = ref(anioActual())

watch(() => [props.show, props.arbitro?.id], async ([abierto, id]) => {
  if (!abierto || !id) return
  filtroAñoDetalle.value = anioActual()
  reunionesArbitroSeleccionado.value = []
  cargandoHistorial.value = true
  try {
    const res = await api.get({
      entity: 'reuniones',
      action: 'obtenerAsistenciasArbitro',
      payload: { idArbitro: id }
    })
    if ((res.ok || res.success) && res.payload)
      reunionesArbitroSeleccionado.value = res.payload
  } catch (e) { console.error('Error al cargar historial del árbitro:', e) }
  finally { cargandoHistorial.value = false }
}, { immediate: true })

const reunionesDelArbitroDetalle = computed(() => {
  if (!reunionesArbitroSeleccionado.value.length) return []
  const map = {}
  reunionesArbitroSeleccionado.value.forEach(row => {
    if (row.tipo !== CATEGORIA) return
    const key = row.id_evento
    if (!map[key]) {
      map[key] = {
        id:            row.id,
        id_evento:     row.id_evento,
        id_arbitro:    row.id_arbitro,
        tipo:          row.tipo,
        asistencia:    row.asistencia,
        fecha_reunion: row.fecha_examen,
        titulo:        row.titulo,
        _ts:           row.ts,
        detalles:      [],
      }
    }
  })
  return sortPorFecha(Object.values(map))
})

const añosDetalleArbitro = computed(() => {
  const set = new Set()
  for (const ex of reunionesDelArbitroDetalle.value) {
    const año = añoDeFecha(ex.fecha_reunion)
    if (año) set.add(año)
  }
  return conAnioActual(set)
})

const reunionesFiltradosDetalle = computed(() =>
  !filtroAñoDetalle.value
    ? reunionesDelArbitroDetalle.value
    : reunionesDelArbitroDetalle.value.filter(ex => añoDeFecha(ex.fecha_reunion) === filtroAñoDetalle.value)
)

const resumenDetalle = computed(() => {
  const r = { presentes: 0, ausentes: 0, sinInformacion: 0 }
  for (const ex of reunionesFiltradosDetalle.value) {
    const estado = normalizarAsistencia(ex.asistencia)
    if      (estado === 'presente') r.presentes++
    else if (estado === 'ausente')  r.ausentes++
    else                            r.sinInformacion++
  }
  return r
})

// Asistencia de cada reunión como píldora de estado
const claseAsistencia = (asistencia) => {
  const estado = normalizarAsistencia(asistencia)
  return estado === 'presente' ? 'estado-verde' : estado === 'ausente' ? 'estado-naranja' : 'estado-gris'
}
const textoAsistencia = (asistencia) => {
  const estado = normalizarAsistencia(asistencia)
  return estado === 'presente' ? 'PRESENTE' : estado === 'ausente' ? 'AUSENTE' : 'SIN INFORMACION'
}
</script>

<style scoped>
.select-anio { min-width: 140px; }
.icono-resumen { font-size: 1.25rem; }
</style>
