<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-people-fill me-1"></i> Encuentros de Mini
            </h4>
            <span class="text-muted small d-block mt-1">{{ encuentros.length }} encuentros en {{ anio }} · solo para aspirantes del curso anual</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <button @click="cargar" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="abrirNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_box</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo encuentro</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 bg-white">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando encuentros de mini...</p></div>
          <div v-else-if="!encuentros.length" class="text-center py-5 text-muted">
            <span class="material-icons d-block fs-1 mb-2 opacity-50">event_busy</span>
            <span class="fw-bold">Todavía no hay encuentros de mini en {{ anio }}.</span>
          </div>
          <div v-else class="row g-3">
            <div v-for="e in encuentros" :key="e.id" class="col-12 col-md-6 col-xl-4">
              <div class="tarjeta border rounded-3 p-3 h-100 d-flex flex-column">
                <div class="fw-bold text-dark small">{{ fechaLargaClase(e.fecha) }}<template v-if="e.hora"> · {{ e.hora }} hs</template></div>
                <div class="fw-bold text-dark mt-1">{{ e.titulo }}</div>
                <div class="small mt-2">
                  <span class="badge bg-light text-dark border me-1">{{ e.aspirantes.length }} convocados</span>
                  <span class="badge bg-success me-1">{{ contar(e, 'presente') }} presentes</span>
                  <span class="badge bg-secondary me-1">{{ contar(e, 'ausente') }} ausentes</span>
                  <span v-if="contar(e, null)" class="badge bg-light text-muted border">{{ contar(e, null) }} sin marcar</span>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-auto pt-3">
                  <button @click="abrirAsistencia(e)" class="btn btn-sm btn-outline-success flex-fill fw-bold"><i class="bi bi-person-check me-1"></i> Asistencia</button>
                  <button @click="abrirEditar(e)" class="btn btn-sm btn-outline-primary flex-fill fw-bold"><i class="bi bi-pencil me-1"></i> Editar</button>
                  <button @click="confirmarEliminar(e)" class="btn btn-sm btn-outline-danger fw-bold" aria-label="Borrar encuentro"><i class="bi bi-trash3"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ALTA / EDICIÓN -->
    <ModalBase :show="mostrarModal" @close="mostrarModal = false" :icono="form.id ? 'edit_calendar' : 'event'" colorIcono="bg-danger-subtle text-danger" maxWidth="680px">
      <template #header>
        <span class="fw-bold fs-5">{{ form.id ? 'Editar encuentro de mini' : 'Nuevo encuentro de mini' }}</span>
      </template>
      <form id="formEncuentroMini" class="text-start" novalidate @submit.prevent="guardar">
        <div class="row g-3">
          <div class="col-12">
            <label for="mini-titulo" class="form-label small fw-bold text-dark">Encuentro *</label>
            <input id="mini-titulo" v-model.trim="form.titulo" type="text" maxlength="150" class="form-control" :class="{ 'is-invalid': intento && !form.titulo }" placeholder="Ej: Club Atlético Ejemplo">
          </div>
          <div class="col-7">
            <label for="mini-fecha" class="form-label small fw-bold text-dark">Fecha *</label>
            <input id="mini-fecha" v-model="form.fecha" type="date" class="form-control" :class="{ 'is-invalid': intento && !form.fecha }">
          </div>
          <div class="col-5">
            <label for="mini-hora" class="form-label small fw-bold text-dark">Hora</label>
            <input id="mini-hora" v-model="form.hora" type="time" class="form-control">
          </div>
          <div class="col-12">
            <label for="mini-obs" class="form-label small fw-bold text-dark">Observaciones</label>
            <textarea id="mini-obs" v-model.trim="form.observaciones" rows="2" maxlength="2000" class="form-control"></textarea>
          </div>
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="form-label small fw-bold text-dark m-0">Aspirantes convocados * <span class="text-muted fw-normal">({{ form.aspirantes.length }} seleccionados)</span></span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-link btn-sm p-0 fw-bold" @click="form.aspirantes = aspirantesParaElegir.map(a => a.id)">Todos</button>
                <button type="button" class="btn btn-link btn-sm p-0 fw-bold text-secondary" @click="form.aspirantes = []">Ninguno</button>
              </div>
            </div>
            <div v-if="cargandoAspirantes" class="text-center py-3"><span class="spinner-border spinner-border-sm text-danger"></span></div>
            <div v-else-if="!aspirantesParaElegir.length" class="small text-muted fst-italic">No hay aspirantes regulares del curso anual en {{ anioFormulario }}.</div>
            <div v-else class="lista-aspirantes border rounded-3 p-2" :class="{ 'border-danger': intento && !form.aspirantes.length }">
              <div v-for="a in aspirantesParaElegir" :key="a.id" class="form-check m-0 py-1">
                <input :id="'mini-asp-' + a.id" v-model="form.aspirantes" class="form-check-input" type="checkbox" :value="a.id">
                <label class="form-check-label small text-uppercase" :for="'mini-asp-' + a.id">{{ a.apellido }}, {{ a.nombre }}</label>
              </div>
            </div>
            <div class="form-text">A los nuevos convocados les llega una notificación en su panel.</div>
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formEncuentroMini" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
          <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR
        </button>
      </template>
    </ModalBase>

    <!-- ASISTENCIA -->
    <ModalBase :show="!!encuentroAsistencia" @close="encuentroAsistencia = null" icono="how_to_reg" colorIcono="bg-success-subtle text-success" maxWidth="640px">
      <template #header>
        <div v-if="encuentroAsistencia" class="text-center w-100">
          <span class="fw-bold fs-5">Asistencia</span>
          <div class="text-muted small mt-1">{{ fechaLargaClase(encuentroAsistencia.fecha) }} · {{ encuentroAsistencia.titulo }}</div>
        </div>
      </template>
      <div v-if="encuentroAsistencia" class="text-start">
        <div class="d-flex justify-content-end mb-3">
          <button type="button" class="btn btn-sm btn-outline-success fw-bold" @click="filasAsistencia.forEach(a => { a.asistencia = 'presente' })">Todos presentes</button>
        </div>
        <div class="d-flex flex-column gap-2">
          <div v-for="a in filasAsistencia" :key="a.id" class="fila-asistencia d-flex justify-content-between align-items-center gap-2">
            <div class="min-w-0">
              <div class="fw-bold text-dark small text-uppercase text-break">{{ a.apellido }}, {{ a.nombre }}</div>
            </div>
            <div class="btn-group btn-group-sm flex-shrink-0" role="group" :aria-label="'Asistencia de ' + a.apellido">
              <button type="button" class="btn fw-bold" :class="a.asistencia === 'presente' ? 'btn-success' : 'btn-outline-success'" @click="a.asistencia = a.asistencia === 'presente' ? null : 'presente'">✓ Presente</button>
              <button type="button" class="btn fw-bold" :class="a.asistencia === 'ausente' ? 'btn-secondary' : 'btn-outline-secondary'" @click="a.asistencia = a.asistencia === 'ausente' ? null : 'ausente'">✗ Ausente</button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" @click="encuentroAsistencia = null" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="button" @click="guardarAsistencia" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoAsistencia">
          <span v-if="guardandoAsistencia" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR ASISTENCIA
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'

useHead({ title: 'Encuentros de Mini | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual([String(Number(anioActual()) + 1)]).map(Number))
const encuentros = ref([])
const cargando = ref(false)

const contar = (e, valor) => e.aspirantes.filter(a => a.asistencia === valor).length

const cargar = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'mini_curso_arbitro', action: 'obtenerEncuentrosMiniCurso', payload: { anio: anio.value } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los encuentros')
    encuentros.value = res.payload || []
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

watch(anio, cargar)

// ─── Alta / edición ──────────────────────────────────────────────
// Los encuentros de mini son a las 10:30 salvo que se indique otra hora
const HORA_MINI_DEFECTO = '10:30'
const encuentroVacio = () => ({ id: null, titulo: '', fecha: '', hora: HORA_MINI_DEFECTO, lugar: '', observaciones: '', aspirantes: [] })
const form = ref(encuentroVacio())
const mostrarModal = ref(false)
const intento = ref(false)
const guardando = ref(false)
const aspirantes = ref([])
const cargandoAspirantes = ref(false)
const convocadosOriginales = ref([])

const anioFormulario = computed(() => Number(String(form.value.fecha || '').substring(0, 4)) || anio.value)

// Al editar se mantienen los convocados aunque ya no sean regulares
const aspirantesParaElegir = computed(() => {
  const lista = [...aspirantes.value]
  convocadosOriginales.value.forEach(c => {
    if (!lista.some(a => a.id === c.id)) lista.push(c)
  })
  return lista.sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`))
})

const cargarAspirantes = async (anioAspirantes) => {
  cargandoAspirantes.value = true
  try {
    const res = await api.get({ entity: 'mini_curso_arbitro', action: 'obtenerAspirantesMiniCurso', payload: { anio: anioAspirantes } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los aspirantes')
    aspirantes.value = res.payload || []
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargandoAspirantes.value = false
  }
}

watch(anioFormulario, (a) => {
  if (mostrarModal.value) cargarAspirantes(a)
})

const abrirNuevo = () => {
  form.value = encuentroVacio()
  convocadosOriginales.value = []
  intento.value = false
  mostrarModal.value = true
  cargarAspirantes(anio.value)
}

const abrirEditar = (e) => {
  form.value = {
    id: e.id, titulo: e.titulo, fecha: e.fecha, hora: e.hora || '', lugar: e.lugar || '', observaciones: e.observaciones || '',
    aspirantes: e.aspirantes.map(a => a.id),
  }
  convocadosOriginales.value = e.aspirantes.map(({ id, apellido, nombre }) => ({ id, apellido, nombre }))
  intento.value = false
  mostrarModal.value = true
  cargarAspirantes(Number(e.fecha.substring(0, 4)))
}

const guardar = async () => {
  intento.value = true
  const f = form.value
  if (!f.titulo || !f.fecha || !f.aspirantes.length) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Completá el encuentro, la fecha y elegí al menos un aspirante.', tipo: 'danger' })
    return
  }
  guardando.value = true
  try {
    const res = await api.post({ entity: 'mini_curso_arbitro', action: 'guardarEncuentroMiniCurso', payload: f })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar el encuentro')
    toast({ titulo: 'Guardado', mensaje: 'El encuentro se guardó y se avisó a los convocados.', tipo: 'success' })
    mostrarModal.value = false
    const anioEncuentro = Number(f.fecha.substring(0, 4))
    if (anioEncuentro !== anio.value) anio.value = anioEncuentro
    else await cargar()
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (e) => {
  notificar({
    titulo: '¿Borrar encuentro?',
    mensaje: `${fechaLargaClase(e.fecha)} · ${e.titulo}. Se pierde la asistencia cargada.`,
    tipo: 'danger',
    alConfirmar: async () => {
      try {
        const res = await api.post({ entity: 'mini_curso_arbitro', action: 'eliminarEncuentroMiniCurso', payload: { id: e.id } })
        if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar el encuentro')
        toast({ titulo: 'Borrado', mensaje: 'El encuentro se borró.', tipo: 'success' })
        await cargar()
      } catch (err) {
        notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
      }
    },
  })
}

// ─── Asistencia ──────────────────────────────────────────────────
const encuentroAsistencia = ref(null)
const filasAsistencia = ref([])
const guardandoAsistencia = ref(false)

const abrirAsistencia = (e) => {
  encuentroAsistencia.value = e
  filasAsistencia.value = e.aspirantes.map(a => ({ ...a }))
}

const guardarAsistencia = async () => {
  guardandoAsistencia.value = true
  try {
    const res = await api.post({
      entity: 'mini_curso_arbitro',
      action: 'guardarAsistenciaMiniCurso',
      payload: {
        idEncuentro: encuentroAsistencia.value.id,
        asistencias: filasAsistencia.value.map(a => ({ idAlumno: a.id, asistencia: a.asistencia })),
      },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar la asistencia')
    toast({ titulo: 'Guardado', mensaje: 'La asistencia se guardó.', tipo: 'success' })
    encuentroAsistencia.value = null
    await cargar()
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardandoAsistencia.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }
.tarjeta { background: #fff; }
.texto-multilinea { white-space: pre-wrap; }
.lista-aspirantes { max-height: 280px; overflow-y: auto; }
.fila-asistencia { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }
</style>
