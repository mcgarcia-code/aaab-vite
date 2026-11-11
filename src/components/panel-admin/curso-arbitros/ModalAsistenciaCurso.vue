<template>
  <!-- Toma de asistencia del curso: la usan Clases y Asistencia y Encuentros de Mini -->
  <ModalBase :show="show" @close="intentarCerrar" icono="how_to_reg" colorIcono="bg-success-subtle text-success" maxWidth="640px">
    <template #header>
      <div class="text-center w-100">
        <span class="fw-bold fs-5">Asistencia</span>
        <div v-if="subtitulo" class="text-muted small mt-1">{{ subtitulo }}</div>
      </div>
    </template>

    <div v-if="cargando" class="text-center py-4"><span class="spinner-border text-success"></span><p class="text-muted mt-2 mb-0 fw-bold small">Cargando asistencia...</p></div>
    <div v-else class="text-start">
      <div v-if="!filas.length" class="text-muted small fst-italic">{{ mensajeVacio }}</div>
      <template v-else>
        <!-- Contadores que filtran la lista -->
        <div class="d-flex flex-wrap align-items-center gap-1 small mb-2">
          <button type="button" class="badge border-0 filtro-badge bg-success" :class="claseFiltro('presente')" :aria-pressed="filtro === 'presente'" @click="alternarFiltro('presente')">{{ conteo.presente }} presentes</button>
          <button type="button" class="badge border-0 filtro-badge bg-secondary" :class="claseFiltro('ausente')" :aria-pressed="filtro === 'ausente'" @click="alternarFiltro('ausente')">{{ conteo.ausente }} ausentes</button>
          <button type="button" class="badge filtro-badge bg-light text-muted border" :class="claseFiltro('sin')" :aria-pressed="filtro === 'sin'" @click="alternarFiltro('sin')">{{ conteo.sin }} sin marcar</button>
          <button v-if="filtro" type="button" class="btn btn-link btn-sm p-0 ms-1 text-decoration-none small" @click="filtro = null">Ver todos</button>
        </div>

        <!-- Buscador y marcado masivo -->
        <div class="d-flex flex-column flex-sm-row gap-2 mb-3">
          <div class="busqueda-asistencia flex-grow-1">
            <input v-model="busqueda" class="form-control form-control-sm shadow-none" placeholder="BUSCAR APELLIDO O NOMBRE..." aria-label="Buscar aspirante">
            <button v-if="busqueda" class="btn-limpiar" @click="busqueda = ''" title="Limpiar búsqueda" type="button"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="d-flex gap-2 flex-shrink-0">
            <button type="button" class="btn btn-sm btn-success fw-bold flex-fill" :disabled="!conteo.sin" title="Marca presentes solo a los que todavía no tienen marca" @click="marcarSinMarcar">
              Sin marcar → presentes
            </button>
            <button type="button" class="btn btn-sm btn-outline-success fw-bold flex-fill" title="Marca presentes a todos, también a los que estaban ausentes" @click="marcarTodos">
              Todos presentes
            </button>
          </div>
        </div>

        <div class="d-flex flex-column gap-2">
          <div v-if="!visibles.length" class="text-muted small fst-italic">No hay aspirantes con este filtro.</div>
          <div v-for="a in visibles" :key="a.id" class="fila-asistencia d-flex justify-content-between align-items-center gap-2">
            <div class="min-w-0">
              <div class="fw-bold text-dark small text-uppercase text-break">{{ a.apellido }}, {{ a.nombre }}</div>
              <div v-if="a.modalidadCurso || a.tieneExamen || a.aviso" class="text-muted" style="font-size: 0.72rem;">
                <template v-if="a.modalidadCurso">{{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</template>
                <span v-if="a.tieneExamen" class="badge bg-info-subtle text-info-emphasis ms-1" title="Ya rindió o tiene nota en el examen de esta clase">
                  <i class="bi bi-journal-check"></i> Rindió
                </span>
                <span v-if="a.aviso" class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle ms-1">
                  <i class="bi bi-exclamation-triangle-fill"></i> {{ a.aviso }}
                </span>
              </div>
            </div>
            <div class="btn-group btn-group-sm flex-shrink-0" role="group" :aria-label="`Asistencia de ${a.apellido}`">
              <button type="button" class="btn fw-bold" :class="a.asistencia === 'presente' ? 'btn-success' : 'btn-outline-success'" @click="a.asistencia = a.asistencia === 'presente' ? null : 'presente'">✓ Presente</button>
              <button type="button" class="btn fw-bold" :class="a.asistencia === 'ausente' ? 'btn-secondary' : 'btn-outline-secondary'" @click="a.asistencia = a.asistencia === 'ausente' ? null : 'ausente'">✗ Ausente</button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <button type="button" @click="intentarCerrar" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
      <button type="button" @click="emit('guardar', filas)" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando || cargando || !filas.length">
        <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
        GUARDAR ASISTENCIA
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import ModalBase from '@/components/ModalBase.vue'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { normalizarTexto } from '@/utils/texto'

const props = defineProps({
  show: { type: Boolean, default: false },
  subtitulo: { type: String, default: '' },
  // [{ id, apellido, nombre, asistencia: 'presente' | 'ausente' | null, modalidadCurso?, tieneExamen?, aviso? }]
  alumnos: { type: Array, default: () => [] },
  cargando: { type: Boolean, default: false },
  guardando: { type: Boolean, default: false },
  mensajeVacio: { type: String, default: 'No hay aspirantes para tomar asistencia.' },
})
// guardar: recibe las filas con la asistencia marcada (y asistenciaOriginal para comparar)
const emit = defineEmits(['close', 'guardar'])

const notificar = inject('notificar', (m) => alert(m.mensaje || m))

const filas = ref([])
const filtro = ref(null)
const busqueda = ref('')

// Cada vez que llegan los alumnos se arma una copia editable y se guarda la marca original
watch(() => props.alumnos, (lista) => {
  filas.value = lista.map(a => ({ ...a, asistenciaOriginal: a.asistencia ?? null }))
}, { immediate: true })
watch(() => props.show, (abierto) => {
  if (abierto) {
    filtro.value = null
    busqueda.value = ''
  }
})

const conteo = computed(() => ({
  presente: filas.value.filter(a => a.asistencia === 'presente').length,
  ausente: filas.value.filter(a => a.asistencia === 'ausente').length,
  sin: filas.value.filter(a => !a.asistencia).length,
}))

const alternarFiltro = (valor) => { filtro.value = filtro.value === valor ? null : valor }
const claseFiltro = (valor) => ({ activo: filtro.value === valor, apagado: filtro.value && filtro.value !== valor })

const visibles = computed(() => {
  const texto = normalizarTexto(busqueda.value)
  return filas.value.filter(a =>
    (!filtro.value || (filtro.value === 'sin' ? !a.asistencia : a.asistencia === filtro.value)) &&
    (!texto || normalizarTexto(`${a.apellido} ${a.nombre}`).includes(texto))
  )
})

// Solo los que no tienen marca: no pisa los ausentes ya cargados
const marcarSinMarcar = () => filas.value.forEach(a => { if (!a.asistencia) a.asistencia = 'presente' })
const marcarTodos = () => filas.value.forEach(a => { a.asistencia = 'presente' })

const hayCambios = computed(() => filas.value.some(a => (a.asistencia ?? null) !== a.asistenciaOriginal))

// Si hay marcas sin guardar se pide confirmación antes de cerrar
const intentarCerrar = () => {
  if (props.guardando) return
  if (!hayCambios.value) {
    emit('close')
    return
  }
  notificar({
    titulo: '¿Salir sin guardar?',
    mensaje: 'Marcaste asistencia que todavía no guardaste. Si salís se pierden esos cambios.',
    tipo: 'danger',
    alConfirmar: () => emit('close'),
  })
}
</script>

<style scoped>
.filtro-badge { cursor: pointer; font-size: 0.75rem; padding: 0.35em 0.65em; transition: opacity 0.15s ease, box-shadow 0.15s ease; }
.filtro-badge.activo { box-shadow: 0 0 0 2px #0f172a; }
.filtro-badge.apagado { opacity: 0.45; }
.fila-asistencia { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.busqueda-asistencia { position: relative; }
.busqueda-asistencia input { padding-right: 30px; }
.btn-limpiar { position: absolute; top: 50%; right: 6px; transform: translateY(-50%); border: none; background: transparent; color: #adb5bd; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem; line-height: 1; }
.btn-limpiar:hover { color: #dc3545; }
.min-w-0 { min-width: 0; }
</style>
