<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-calendar3-week me-1"></i> Clases y Asistencia
            </h4>
            <span class="text-muted small d-block mt-1">{{ clasesVisibles.length }} clases en {{ anio }} · cada alumno ve las de su curso</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="filtroCurso" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 150px;" aria-label="Curso">
              <option value="">CURSO</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
            </select>
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <button @click="cargar(anio)" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="abrirNueva" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_box</span>
              <span class="fw-bold d-none d-md-inline small">Nueva clase</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 bg-white">
          <div v-if="cargando" class="text-center p-5">
            <span class="spinner-border text-danger"></span>
          </div>
          <div v-else-if="!clasesVisibles.length" class="text-center py-5 text-muted">
            <span class="material-icons d-block fs-1 mb-2 opacity-50">event_busy</span>
            <span class="fw-bold">Todavía no hay clases cargadas para {{ anio }}.</span>
          </div>
          <template v-else>
            <div v-for="grupo in clasesPorMes" :key="grupo.mes" class="mb-4">
              <h6 class="text-danger fw-bold text-uppercase small border-bottom pb-2 mb-3" style="letter-spacing: 1px;">{{ grupo.mes }}</h6>
              <div class="row g-3">
                <div v-for="c in grupo.clases" :key="c.id" class="col-12 col-md-6 col-xl-4">
                  <div class="tarjeta-clase border rounded-3 p-3 h-100" :class="{ pasada: esClasePasada(c), proxima: proximaClase?.id === c.id }">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <div>
                        <div class="fw-bold text-dark small">{{ fechaLargaClase(c.fecha) }}</div>
                        <div v-if="horarioClase(c)" class="text-muted small">{{ horarioClase(c) }}</div>
                      </div>
                      <span v-if="proximaClase?.id === c.id" class="badge bg-danger">Próxima</span>
                      <span v-else-if="esClasePasada(c)" class="badge bg-secondary">Dictada</span>
                    </div>
                    <span class="badge mt-2" :class="claseCurso(c.curso)">{{ etiquetaCurso(c.curso) }}</span>
                    <div class="fw-bold text-dark mt-2">{{ c.titulo }}</div>
                    <div class="small text-muted mt-1">
                      <i class="bi" :class="c.modalidad === 'virtual' ? 'bi-camera-video' : 'bi-geo-alt'"></i>
                      {{ c.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}<template v-if="c.lugar"> · {{ c.lugar }}</template>
                    </div>
                    <div v-if="c.descripcion" class="small text-dark mt-2 texto-multilinea">{{ c.descripcion }}</div>
                    <a v-if="c.enlace" :href="c.enlace" target="_blank" rel="noopener noreferrer" class="small d-inline-block mt-2">
                      <i class="bi bi-link-45deg"></i> Enlace
                    </a>
                    <div class="d-flex flex-wrap gap-2 mt-3">
                      <button @click="abrirAsistencia(c)" class="btn btn-sm btn-outline-success flex-fill fw-bold"><i class="bi bi-person-check me-1"></i> Asistencia</button>
                      <button @click="abrirExamen(c)" class="btn btn-sm btn-outline-dark flex-fill fw-bold"><i class="bi bi-journal-check me-1"></i> Examen</button>
                      <button @click="abrirEditar(c)" class="btn btn-sm btn-outline-primary flex-fill fw-bold"><i class="bi bi-pencil me-1"></i> Editar</button>
                      <button @click="confirmarEliminar(c)" class="btn btn-sm btn-outline-danger flex-fill fw-bold"><i class="bi bi-trash3 me-1"></i> Borrar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <ModalBase :show="mostrarModal" @close="mostrarModal = false" :icono="form.id ? 'edit_calendar' : 'event'" colorIcono="bg-danger-subtle text-danger" maxWidth="640px">
      <template #header>
        <span class="fw-bold fs-5">{{ form.id ? 'Editar clase' : 'Nueva clase' }}</span>
      </template>
      <form id="formClaseCurso" class="text-start" novalidate @submit.prevent="guardar">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label for="clase-fecha" class="form-label small fw-bold text-dark">Fecha *</label>
            <input id="clase-fecha" v-model="form.fecha" type="date" class="form-control" :class="{ 'is-invalid': intento && !form.fecha }">
          </div>
          <div class="col-6 col-md-4">
            <label for="clase-desde" class="form-label small fw-bold text-dark">Desde</label>
            <input id="clase-desde" v-model="form.horaInicio" type="time" class="form-control">
          </div>
          <div class="col-6 col-md-4">
            <label for="clase-hasta" class="form-label small fw-bold text-dark">Hasta</label>
            <input id="clase-hasta" v-model="form.horaFin" type="time" class="form-control" :class="{ 'is-invalid': intento && errorHorario }">
            <div class="invalid-feedback">{{ errorHorario }}</div>
          </div>
          <div class="col-12">
            <label for="clase-titulo" class="form-label small fw-bold text-dark">Tema de la clase *</label>
            <input id="clase-titulo" v-model.trim="form.titulo" type="text" maxlength="150" class="form-control" :class="{ 'is-invalid': intento && !form.titulo }" placeholder="Ej: Reglas 1 a 4 — El campo de juego">
          </div>
          <div class="col-12">
            <label for="clase-curso" class="form-label small fw-bold text-dark">Curso *</label>
            <select id="clase-curso" v-model="form.curso" class="form-select">
              <option value="ambos">Ambos cursos (anual e intensivo)</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">Solo {{ m.etiqueta.toLowerCase() }}</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <label for="clase-modalidad" class="form-label small fw-bold text-dark">Modalidad</label>
            <select id="clase-modalidad" v-model="form.modalidad" class="form-select">
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
          <div class="col-12 col-md-8">
            <label for="clase-lugar" class="form-label small fw-bold text-dark">Lugar</label>
            <input id="clase-lugar" v-model.trim="form.lugar" type="text" maxlength="255" class="form-control" :placeholder="form.modalidad === 'virtual' ? 'Ej: Zoom' : 'Ej: La Casa del Handball'">
          </div>
          <div class="col-12">
            <label for="clase-enlace" class="form-label small fw-bold text-dark">Enlace (opcional)</label>
            <input id="clase-enlace" v-model.trim="form.enlace" type="url" maxlength="500" class="form-control" :class="{ 'is-invalid': intento && errorEnlace }" placeholder="https://...">
            <div class="invalid-feedback">{{ errorEnlace }}</div>
          </div>
          <div class="col-12">
            <label for="clase-descripcion" class="form-label small fw-bold text-dark">Descripción (opcional)</label>
            <textarea id="clase-descripcion" v-model.trim="form.descripcion" rows="3" maxlength="2000" class="form-control" placeholder="Contenidos, material para traer, etc."></textarea>
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formClaseCurso" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
          <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
          {{ guardando ? 'GUARDANDO...' : 'GUARDAR' }}
        </button>
      </template>
    </ModalBase>
    <ModalBase :show="mostrarAsistencia" @close="mostrarAsistencia = false" icono="how_to_reg" colorIcono="bg-success-subtle text-success" maxWidth="640px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Asistencia</span>
          <div v-if="claseAsistencia" class="text-muted small mt-1">{{ fechaLargaClase(claseAsistencia.fecha) }} · {{ claseAsistencia.titulo }}</div>
        </div>
      </template>
      <div v-if="cargandoAsistencia" class="text-center py-4"><span class="spinner-border text-success"></span></div>
      <div v-else class="text-start">
        <div v-if="!alumnosAsistencia.length" class="text-muted small fst-italic">No hay alumnos regulares de este curso en {{ claseAsistencia?.fecha?.substring(0, 4) }}.</div>
        <template v-else>
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div class="small">
              <span class="badge bg-success me-1">{{ conteoAsistencia.presente }} presentes</span>
              <span class="badge bg-secondary me-1">{{ conteoAsistencia.ausente }} ausentes</span>
              <span class="badge bg-light text-muted border">{{ conteoAsistencia.sin }} sin marcar</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline-success fw-bold" @click="marcarTodos('presente')">Todos presentes</button>
          </div>
          <div class="d-flex flex-column gap-2">
            <div v-for="a in alumnosAsistencia" :key="a.id" class="fila-asistencia d-flex justify-content-between align-items-center gap-2">
              <div class="min-w-0">
                <div class="fw-bold text-dark small text-uppercase text-truncate">{{ a.apellido }}, {{ a.nombre }}</div>
                <div class="text-muted" style="font-size: 0.72rem;">DNI {{ a.dni }} · {{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</div>
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
        <button type="button" @click="mostrarAsistencia = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="button" @click="guardarAsistencia" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoAsistencia || !alumnosAsistencia.length">
          <span v-if="guardandoAsistencia" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR ASISTENCIA
        </button>
      </template>
    </ModalBase>
    <ModalBase :show="mostrarExamen" @close="mostrarExamen = false" icono="quiz" colorIcono="bg-dark-subtle text-dark" maxWidth="680px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Programar examen online</span>
          <div v-if="claseExamen" class="text-muted small mt-1">{{ fechaLargaClase(claseExamen.fecha) }} · {{ claseExamen.titulo }}</div>
        </div>
      </template>
      <div v-if="cargandoExamen" class="text-center py-4"><span class="spinner-border text-dark"></span></div>
      <form v-else id="formExamenClase" class="text-start" novalidate @submit.prevent="guardarExamen">
        <div v-if="examenExistente" class="alert alert-light border small py-2">
          <i class="bi bi-info-circle me-1"></i> Ya hay un examen programado para esta clase. Lo rindieron {{ examenExistente.rendidos }} aspirante(s).
        </div>
        <p class="small text-muted">Solo pueden rendirlo los aspirantes marcados como <strong>presentes</strong> en la clase. La nota y el PDF quedan en <strong>Exámenes</strong> con el nombre de la clase. Se aprueba con el {{ PORCENTAJE_APROBACION_DEFECTO }}%.</p>
        <div class="row g-3">
          <div class="col-6">
            <label for="ex-cantidad" class="form-label small fw-bold text-dark">Cantidad de preguntas *</label>
            <input id="ex-cantidad" v-model.number="formExamen.cantidadPreguntas" type="number" min="1" max="100" class="form-control" :class="{ 'is-invalid': intentoExamen && errorCantidad }">
            <div class="invalid-feedback">{{ errorCantidad }}</div>
          </div>
          <div class="col-6">
            <label for="ex-tiempo" class="form-label small fw-bold text-dark">Tiempo (minutos) *</label>
            <input id="ex-tiempo" v-model.number="formExamen.tiempoLimiteMin" type="number" min="1" max="180" class="form-control" :class="{ 'is-invalid': intentoExamen && errorTiempo }">
            <div class="invalid-feedback">{{ errorTiempo }}</div>
          </div>
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="form-label small fw-bold text-dark m-0">Reglas * <span class="text-muted fw-normal">({{ preguntasDisponibles }} preguntas disponibles)</span></span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-link btn-sm p-0 fw-bold" @click="formExamen.reglas = reglasDisponibles.map(r => r.codigo)">Todas</button>
                <button type="button" class="btn btn-link btn-sm p-0 fw-bold text-secondary" @click="formExamen.reglas = []">Ninguna</button>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-3 border rounded-3 p-3" :class="{ 'border-danger': intentoExamen && !formExamen.reglas.length }">
              <div v-for="r in reglasDisponibles" :key="r.codigo" class="form-check m-0" style="min-width: 110px;">
                <input :id="'ex-regla-' + r.codigo" v-model="formExamen.reglas" class="form-check-input" type="checkbox" :value="r.codigo">
                <label class="form-check-label small fw-bold" :for="'ex-regla-' + r.codigo">Regla {{ r.codigo }} <span class="text-muted fw-normal">({{ r.cantidad }})</span></label>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="form-check form-switch">
              <input id="ex-habilitado" v-model="formExamen.habilitado" class="form-check-input" type="checkbox" role="switch">
              <label class="form-check-label fw-bold small" for="ex-habilitado">Habilitado para rendir</label>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="mostrarExamen = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formExamenClase" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoExamen || cargandoExamen">
          <span v-if="guardandoExamen" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR EXAMEN
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
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { PORCENTAJE_APROBACION_DEFECTO } from '@/composables/useExamenesCurso'
import { useCronogramaCurso, fechaLargaClase, horarioClase, esClasePasada } from '@/composables/useCronogramaCurso'

useHead({ title: 'Clases y Asistencia | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const { clasesVisibles, filtroCurso, cargando, error, cargar, clasesPorMes, proximaClase } = useCronogramaCurso()

const etiquetaCurso = (curso) => (curso === 'ambos' ? 'Ambos cursos' : MODALIDADES_CURSO[curso]?.etiqueta || curso)
const claseCurso = (curso) => (curso === 'ambos' ? 'bg-light text-dark border' : MODALIDADES_CURSO[curso]?.clase || 'bg-secondary')

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual([String(Number(anioActual()) + 1)]).map(Number))

watch(anio, (a) => cargar(a))
watch(error, (m) => { if (m) notificar({ titulo: 'Error', mensaje: m, tipo: 'danger' }) })

// ─── Nueva / Editar ──────────────────────────────────────────────
const claseVacia = () => ({ id: null, fecha: '', horaInicio: '', horaFin: '', titulo: '', curso: 'ambos', modalidad: 'presencial', lugar: '', enlace: '', descripcion: '' })
const form = ref(claseVacia())
const mostrarModal = ref(false)
const intento = ref(false)
const guardando = ref(false)

const errorHorario = computed(() =>
  form.value.horaInicio && form.value.horaFin && form.value.horaFin <= form.value.horaInicio
    ? 'Tiene que ser posterior al inicio.'
    : ''
)
const errorEnlace = computed(() => {
  if (!form.value.enlace) return ''
  try {
    const url = new URL(form.value.enlace)
    return ['http:', 'https:'].includes(url.protocol) ? '' : 'Tiene que empezar con https://'
  } catch {
    return 'Ingresá un enlace válido (https://...).'
  }
})

const abrirNueva = () => {
  form.value = claseVacia()
  intento.value = false
  mostrarModal.value = true
}

const abrirEditar = (c) => {
  form.value = {
    id: c.id, fecha: c.fecha, horaInicio: c.hora_inicio || '', horaFin: c.hora_fin || '', titulo: c.titulo, curso: c.curso || 'ambos',
    modalidad: c.modalidad || 'presencial', lugar: c.lugar || '', enlace: c.enlace || '', descripcion: c.descripcion || '',
  }
  intento.value = false
  mostrarModal.value = true
}

const guardar = async () => {
  intento.value = true
  if (!form.value.fecha || !form.value.titulo || errorHorario.value || errorEnlace.value) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Revisá la fecha, el tema y los campos marcados.', tipo: 'danger' })
    return
  }
  guardando.value = true
  try {
    const res = await api.post({ entity: 'cronograma_curso_arbitro', action: 'guardarClaseCurso', payload: form.value })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar la clase')
    toast({ titulo: 'Guardado', mensaje: 'La clase se guardó en el cronograma.', tipo: 'success' })
    mostrarModal.value = false
    const anioClase = Number(form.value.fecha.substring(0, 4))
    if (anioClase !== anio.value) anio.value = anioClase
    else await cargar(anio.value)
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

// ─── Borrar ──────────────────────────────────────────────────────
const eliminar = async (c) => {
  try {
    const res = await api.post({ entity: 'cronograma_curso_arbitro', action: 'eliminarClaseCurso', payload: { id: c.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar la clase')
    toast({ titulo: 'Borrada', mensaje: 'La clase se quitó del cronograma.', tipo: 'success' })
    await cargar(anio.value)
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  }
}

const confirmarEliminar = (c) => {
  notificar({
    titulo: '¿Borrar clase?',
    mensaje: `${fechaLargaClase(c.fecha)} · ${c.titulo}. Los alumnos dejarán de verla.`,
    tipo: 'danger',
    alConfirmar: () => eliminar(c),
  })
}

// ─── Asistencia ──────────────────────────────────────────────────
const mostrarAsistencia = ref(false)
const claseAsistencia = ref(null)
const alumnosAsistencia = ref([])
const cargandoAsistencia = ref(false)
const guardandoAsistencia = ref(false)

const conteoAsistencia = computed(() => ({
  presente: alumnosAsistencia.value.filter(a => a.asistencia === 'presente').length,
  ausente: alumnosAsistencia.value.filter(a => a.asistencia === 'ausente').length,
  sin: alumnosAsistencia.value.filter(a => !a.asistencia).length,
}))

const marcarTodos = (valor) => alumnosAsistencia.value.forEach(a => { a.asistencia = valor })

const abrirAsistencia = async (c) => {
  claseAsistencia.value = c
  alumnosAsistencia.value = []
  mostrarAsistencia.value = true
  cargandoAsistencia.value = true
  try {
    const res = await api.get({ entity: 'cronograma_curso_arbitro', action: 'obtenerAsistenciaClaseCurso', payload: { idClase: c.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar la asistencia')
    alumnosAsistencia.value = res.payload.alumnos || []
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
    mostrarAsistencia.value = false
  } finally {
    cargandoAsistencia.value = false
  }
}

const guardarAsistencia = async () => {
  guardandoAsistencia.value = true
  try {
    const res = await api.post({
      entity: 'cronograma_curso_arbitro',
      action: 'guardarAsistenciaClaseCurso',
      payload: {
        idClase: claseAsistencia.value.id,
        asistencias: alumnosAsistencia.value.map(a => ({ idAlumno: a.id, asistencia: a.asistencia })),
      },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar la asistencia')
    toast({ titulo: 'Guardado', mensaje: 'La asistencia se guardó.', tipo: 'success' })
    mostrarAsistencia.value = false
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardandoAsistencia.value = false
  }
}

// ─── Examen online por clase ─────────────────────────────────────
const mostrarExamen = ref(false)
const claseExamen = ref(null)
const examenExistente = ref(null)
const cargandoExamen = ref(false)
const guardandoExamen = ref(false)
const intentoExamen = ref(false)
const reglasDisponibles = ref([])
const configDefecto = ref({ cantidadPreguntas: 20, tiempoLimiteMin: 25, reglas: [] })
const formExamen = ref({ cantidadPreguntas: 20, tiempoLimiteMin: 25, reglas: [], habilitado: true })

const preguntasDisponibles = computed(() =>
  reglasDisponibles.value.filter(r => formExamen.value.reglas.includes(r.codigo)).reduce((t, r) => t + r.cantidad, 0)
)
const errorCantidad = computed(() => {
  const n = Number(formExamen.value.cantidadPreguntas)
  if (!Number.isInteger(n) || n < 1 || n > 100) return 'Entre 1 y 100.'
  if (formExamen.value.reglas.length && n > preguntasDisponibles.value) return `Hay solo ${preguntasDisponibles.value} preguntas.`
  return ''
})
const errorTiempo = computed(() => {
  const n = Number(formExamen.value.tiempoLimiteMin)
  return Number.isInteger(n) && n >= 1 && n <= 180 ? '' : 'Entre 1 y 180.'
})

const cargarReglas = async () => {
  if (reglasDisponibles.value.length) return
  const res = await api.get({ entity: 'examenes_habilitaciones', action: 'obtenerReglasExamen', payload: {} })
  if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las reglas')
  reglasDisponibles.value = (res.payload?.reglas || []).map(r => ({ codigo: Number(r.codigo), cantidad: Number(r.cantidad) }))
  const d = res.payload?.defecto || {}
  configDefecto.value = { cantidadPreguntas: Number(d.cantidadPreguntas) || 20, tiempoLimiteMin: Number(d.tiempoLimiteMin) || 25, reglas: (d.reglas || []).map(Number) }
}

const abrirExamen = async (c) => {
  claseExamen.value = c
  examenExistente.value = null
  intentoExamen.value = false
  mostrarExamen.value = true
  cargandoExamen.value = true
  try {
    await cargarReglas()
    const res = await api.get({ entity: 'examen_online_curso_arbitro', action: 'obtenerExamenOnlineClaseCurso', payload: { idClase: c.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar el examen de la clase')
    examenExistente.value = res.payload
    const codigos = reglasDisponibles.value.map(r => r.codigo)
    const base = res.payload || { ...configDefecto.value, habilitado: true }
    formExamen.value = {
      cantidadPreguntas: base.cantidadPreguntas,
      tiempoLimiteMin: base.tiempoLimiteMin,
      reglas: (base.reglas || []).filter(r => codigos.includes(r)),
      habilitado: base.habilitado,
    }
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
    mostrarExamen.value = false
  } finally {
    cargandoExamen.value = false
  }
}

const guardarExamen = async () => {
  intentoExamen.value = true
  if (errorCantidad.value || errorTiempo.value || !formExamen.value.reglas.length) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Revisá la cantidad, el tiempo y elegí al menos una regla.', tipo: 'danger' })
    return
  }
  guardandoExamen.value = true
  try {
    const res = await api.post({
      entity: 'examen_online_curso_arbitro',
      action: 'programarExamenClaseCurso',
      payload: { idClase: claseExamen.value.id, ...formExamen.value },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo programar el examen')
    toast({ titulo: 'Examen programado', mensaje: formExamen.value.habilitado ? 'Los presentes ya pueden rendirlo desde Mis Exámenes.' : 'El examen quedó guardado sin habilitar.', tipo: 'success' })
    mostrarExamen.value = false
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardandoExamen.value = false
  }
}

onMounted(() => cargar(anio.value))
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }
.tarjeta-clase { background-color: #fff; }
.tarjeta-clase.pasada { background-color: #f8fafc; opacity: 0.75; }
.tarjeta-clase.proxima { border-color: #dc3545 !important; box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15); }
.texto-multilinea { white-space: pre-wrap; }
.fila-asistencia { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }
</style>
