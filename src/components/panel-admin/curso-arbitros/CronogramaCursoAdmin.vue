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
          <div v-else class="accordion">
            <div v-for="grupo in mesesAcordeon" :key="grupo.mes" class="accordion-item">
              <h2 class="accordion-header">
                <button
                  type="button"
                  class="accordion-button fw-bold"
                  :class="{ collapsed: !mesesAbiertos[grupo.mes] }"
                  :aria-expanded="Boolean(mesesAbiertos[grupo.mes])"
                  :aria-controls="'mes-admin-' + grupo.clave"
                  @click="mesesAbiertos[grupo.mes] = !mesesAbiertos[grupo.mes]"
                >
                  <span class="text-uppercase me-2">{{ grupo.mes }}</span>
                  <span class="badge rounded-pill me-1" :class="grupo.proximas ? 'bg-danger' : 'bg-secondary'">{{ grupo.clases.length }} {{ grupo.clases.length === 1 ? 'clase' : 'clases' }}</span>
                  <span v-if="grupo.dictadas" class="badge bg-light text-muted border">{{ grupo.proximas ? grupo.dictadas + ' dictadas' : 'Dictadas' }}</span>
                </button>
              </h2>
              <div v-show="mesesAbiertos[grupo.mes]" :id="'mes-admin-' + grupo.clave" class="accordion-collapse">
                <div class="accordion-body p-2 p-md-3">
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
              </div>
            </div>
          </div>
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
                <div class="text-muted" style="font-size: 0.72rem;">{{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}</div>
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
          <span class="fw-bold fs-5">Programar examen</span>
          <div v-if="claseExamen" class="text-muted small mt-1">{{ fechaLargaClase(claseExamen.fecha) }} · {{ claseExamen.titulo }}</div>
        </div>
      </template>
      <div v-if="cargandoExamen" class="text-center py-4"><span class="spinner-border text-dark"></span></div>
      <form v-else id="formExamenClase" class="text-start" novalidate @submit.prevent="guardarExamen">
        <div v-if="examenExistente" class="alert alert-light border small py-2">
          <i class="bi bi-info-circle me-1"></i> Ya hay un examen programado para esta clase. Tiene {{ examenExistente.rendidos }} resultado(s) cargado(s).
        </div>
        <div class="btn-group w-100 mb-3" role="group" aria-label="Tipo de examen">
          <button type="button" class="btn fw-bold" :class="formExamen.tipo === 'teorico' ? 'btn-danger' : 'btn-outline-danger'" @click="formExamen.tipo = 'teorico'">
            <i class="bi bi-journal-text me-1"></i> Teórico
          </button>
          <button type="button" class="btn fw-bold" :class="formExamen.tipo === 'fisico' ? 'btn-primary' : 'btn-outline-primary'" @click="formExamen.tipo = 'fisico'">
            <i class="bi bi-stopwatch me-1"></i> Físico
          </button>
        </div>
        <div class="d-flex flex-column gap-2 mb-3" role="radiogroup" :aria-label="esFisico ? 'Tipo de examen físico' : 'Tipo de examen teórico'">
          <label v-for="m in modosExamen" :key="m.valor" class="opcion-modo" :class="{ activa: formExamen.modo === m.valor }">
            <input v-model="formExamen.modo" class="form-check-input me-2" type="radio" :value="m.valor">
            <span class="fw-bold">{{ m.etiqueta }}</span>
            <span class="d-block small text-muted">{{ m.ayuda }}</span>
          </label>
        </div>
        <div v-if="esRecuperatorioFinal" class="mb-3">
          <div v-if="!finalesDisponibles.length" class="alert alert-danger small py-2 mb-0">
            <i class="bi bi-exclamation-triangle me-1"></i> Todavía no hay un {{ esFisico ? 'físico final' : 'teórico final' }} programado para recuperar.
          </div>
          <template v-else>
            <label for="ex-final-original" class="form-label small fw-bold text-dark">{{ esFisico ? 'Físico final' : 'Teórico final' }} que se recupera *</label>
            <select id="ex-final-original" v-model="formExamen.idExamenFinal" class="form-select" :class="{ 'is-invalid': intentoExamen && !formExamen.idExamenFinal }">
              <option :value="null" disabled>Seleccionar...</option>
              <option v-for="fin in finalesDisponibles" :key="fin.id" :value="fin.id">{{ fechaDMA(fin.fecha) }} · {{ fin.titulo }} · {{ fin.desaprobados }} para recuperar</option>
            </select>
          </template>
        </div>
        <div v-if="esFisico" class="alert alert-light border small py-2 mb-0">
          <i class="bi bi-info-circle me-1"></i>
          <template v-if="esRecuperatorioFinal">Lo rinden solo quienes desaprobaron o estuvieron ausentes en el físico final.</template>
          El nivel de cada aspirante se carga desde <strong>Exámenes → Físicos</strong>. {{ TEXTO_FISICO }}
        </div>
        <template v-else>
        <p class="small text-muted">
          <template v-if="esRecuperatorioFinal">Lo ven solo los aspirantes que desaprobaron o estuvieron ausentes en el teórico final, aunque no hayan venido a esta clase.</template>
          <template v-else-if="esRecuperatorioParcialitos">Lo ven solo los aspirantes que tienen parcialitos desaprobados o ausentes, aunque no hayan venido a esta clase.</template>
          <template v-else>Solo pueden rendirlo los aspirantes marcados como <strong>presentes</strong> en la clase.</template>
          La nota y el PDF quedan en <strong>Exámenes</strong>. Se aprueba con el {{ PORCENTAJE_APROBACION_DEFECTO }}%.
        </p>
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
          <div v-if="esRecuperatorioParcialitos" class="col-12">
            <div class="alert alert-warning small py-2 mb-0">
              <i class="bi bi-magic me-1"></i> Las reglas se toman <strong>automáticamente</strong> de los parcialitos que cada aspirante desaprobó o no rindió.
            </div>
          </div>
          <div v-else class="col-12">
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
        </template>
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
import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'
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

// Acordeón por mes: abiertos los meses con clases por dictar, contraídos los ya dictados
const mesesAcordeon = computed(() => clasesPorMes.value.map((g, i) => ({
  ...g,
  clave: i,
  dictadas: g.clases.filter(esClasePasada).length,
  proximas: g.clases.filter(c => !esClasePasada(c)).length,
})))
const mesesAbiertos = reactive({})
watch(mesesAcordeon, (lista) => {
  lista.forEach(g => {
    if (!(g.mes in mesesAbiertos)) mesesAbiertos[g.mes] = g.proximas > 0
  })
}, { immediate: true })
watch(anio, () => Object.keys(mesesAbiertos).forEach(k => delete mesesAbiertos[k]))
watch(error, (m) => { if (m) notificar({ titulo: 'Error', mensaje: m, tipo: 'danger' }) })

// ─── Nueva / Editar ──────────────────────────────────────────────
// Horario habitual de las clases del curso: 19:30 a 22:00
const HORA_INICIO_DEFECTO = '19:30'
const HORA_FIN_DEFECTO = '22:00'

const claseVacia = () => ({ id: null, fecha: '', horaInicio: HORA_INICIO_DEFECTO, horaFin: HORA_FIN_DEFECTO, titulo: '', curso: 'ambos', modalidad: 'presencial', lugar: '', enlace: '', descripcion: '' })
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
    mensaje: `${fechaLargaClase(c.fecha)} · ${c.titulo}. Los alumnos dejarán de verla y se borra el examen que tenga programado (con sus notas y recuperatorios).`,
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
const TEXTO_FISICO = 'Aprueba con 8.5 (femenino y masculino de 45 años o más) o 9.5 (masculino menor de 45).'
const MODOS_FISICO = [
  { valor: 'simulacro', etiqueta: 'Simulacro', ayuda: 'Para ver cómo están físicamente. No cuenta para el curso.' },
  { valor: 'final', etiqueta: 'Físico final', ayuda: 'Define el resultado del físico del curso.' },
  { valor: 'recuperatorio_final', etiqueta: 'Recuperatorio físico final', ayuda: 'Lo rinden quienes desaprobaron el físico final.' },
]
const MODOS_TEORICO = [
  { valor: 'parcialito', etiqueta: 'Parcialito', ayuda: 'Examen de la clase sobre las reglas que elijas.' },
  { valor: 'recuperatorio', etiqueta: 'Recuperatorio de parcialitos', ayuda: 'Cada aspirante rinde las reglas de los parcialitos que debe.' },
  { valor: 'final', etiqueta: 'Teórico final', ayuda: 'Define el teórico del curso.' },
  { valor: 'recuperatorio_final', etiqueta: 'Recuperatorio teórico final', ayuda: 'Lo rinden quienes desaprobaron el teórico final.' },
]
const formExamen = ref({ tipo: 'teorico', cantidadPreguntas: 20, tiempoLimiteMin: 25, reglas: [], habilitado: true, modo: 'parcialito', idExamenFinal: null })
const esFisico = computed(() => formExamen.value.tipo === 'fisico')
const modosExamen = computed(() => (esFisico.value ? MODOS_FISICO : MODOS_TEORICO))
const esRecuperatorioParcialitos = computed(() => formExamen.value.modo === 'recuperatorio')
const esRecuperatorioFinal = computed(() => formExamen.value.modo === 'recuperatorio_final')
const finales = ref({ teorico: [], fisico: [] })
const finalesDisponibles = computed(() => finales.value[formExamen.value.tipo] || [])

// Al elegir el recuperatorio del final se propone el final (si hay uno solo) y sus mismas reglas.
// Los watchers son síncronos para no pisar la configuración guardada al abrir un examen existente.
let aplicandoExamenGuardado = false
watch(() => formExamen.value.tipo, (tipo) => {
  if (aplicandoExamenGuardado) return
  formExamen.value.modo = tipo === 'fisico' ? 'simulacro' : 'parcialito'
  formExamen.value.idExamenFinal = null
}, { flush: 'sync' })
watch(() => formExamen.value.modo, (modo) => {
  if (aplicandoExamenGuardado || modo !== 'recuperatorio_final' || formExamen.value.idExamenFinal) return
  if (finalesDisponibles.value.length === 1) formExamen.value.idExamenFinal = finalesDisponibles.value[0].id
}, { flush: 'sync' })
watch(() => formExamen.value.idExamenFinal, (idFinal) => {
  if (aplicandoExamenGuardado || !idFinal || esFisico.value) return
  const final = finalesDisponibles.value.find(x => x.id === idFinal)
  if (final?.reglas.length) formExamen.value.reglas = [...final.reglas]
}, { flush: 'sync' })

const preguntasDisponibles = computed(() =>
  reglasDisponibles.value.filter(r => formExamen.value.reglas.includes(r.codigo)).reduce((t, r) => t + r.cantidad, 0)
)
const errorCantidad = computed(() => {
  const n = Number(formExamen.value.cantidadPreguntas)
  if (!Number.isInteger(n) || n < 1 || n > 100) return 'Entre 1 y 100.'
  if (!esRecuperatorioParcialitos.value && formExamen.value.reglas.length && n > preguntasDisponibles.value) return `Hay solo ${preguntasDisponibles.value} preguntas.`
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
    const [res, resTeorico, resFisico] = await Promise.all([
      api.get({ entity: 'examen_online_curso_arbitro', action: 'obtenerExamenOnlineClaseCurso', payload: { idClase: c.id } }),
      api.get({ entity: 'examen_online_curso_arbitro', action: 'obtenerFinalesParaRecuperatorioCurso', payload: { idClase: c.id, tipo: 'teorico' } }),
      api.get({ entity: 'examen_online_curso_arbitro', action: 'obtenerFinalesParaRecuperatorioCurso', payload: { idClase: c.id, tipo: 'fisico' } }),
    ])
    finales.value = {
      teorico: resTeorico?.ok ? resTeorico.payload || [] : [],
      fisico: resFisico?.ok ? resFisico.payload || [] : [],
    }
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar el examen de la clase')
    examenExistente.value = res.payload
    const codigos = reglasDisponibles.value.map(r => r.codigo)
    const base = res.payload || { ...configDefecto.value, habilitado: true }
    aplicandoExamenGuardado = true
    formExamen.value = {
      tipo: base.tipo === 'fisico' ? 'fisico' : 'teorico',
      cantidadPreguntas: base.cantidadPreguntas,
      tiempoLimiteMin: base.tiempoLimiteMin,
      reglas: (base.reglas || []).filter(r => codigos.includes(r)),
      habilitado: base.habilitado,
      modo: base.modo || (base.esFinal ? 'final' : 'parcialito'),
      idExamenFinal: base.idExamenFinal || null,
    }
    aplicandoExamenGuardado = false
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
    mostrarExamen.value = false
  } finally {
    cargandoExamen.value = false
  }
}

const guardarExamen = async () => {
  intentoExamen.value = true
  if (esRecuperatorioFinal.value && !formExamen.value.idExamenFinal) {
    notificar({ titulo: 'Faltan datos', mensaje: `Elegí el ${esFisico.value ? 'físico' : 'teórico'} final que se recupera.`, tipo: 'danger' })
    return
  }
  if (!esFisico.value && (errorCantidad.value || errorTiempo.value || (!esRecuperatorioParcialitos.value && !formExamen.value.reglas.length))) {
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
    if (esFisico.value) {
      toast({ titulo: 'Examen físico guardado', mensaje: 'El nivel de cada aspirante se carga desde Exámenes → Físicos.', tipo: 'success' })
      mostrarExamen.value = false
      return
    }
    toast({ titulo: 'Examen programado', mensaje: formExamen.value.habilitado ? (esRecuperatorioFinal.value ? 'Los que desaprobaron el teórico final ya pueden rendirlo desde Mis Exámenes.' : esRecuperatorioParcialitos.value ? 'Los aspirantes que deben parcialitos ya pueden rendirlo desde Mis Exámenes.' : 'Los presentes ya pueden rendirlo desde Mis Exámenes.') : 'El examen quedó guardado sin habilitar.', tipo: 'success' })
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
.accordion-item { border-radius: 10px !important; overflow: hidden; margin-bottom: 8px; border: 1px solid #e2e8f0; }
.accordion-button { font-size: 0.9rem; color: #0f172a; background: #fff; box-shadow: none; flex-wrap: wrap; row-gap: 4px; }
.accordion-button:not(.collapsed) { color: #dc2626; background: #fef2f2; }
.accordion-button:focus { box-shadow: 0 0 0 0.2rem rgba(220, 38, 38, 0.2); }
.tarjeta-clase { background-color: #fff; }
.tarjeta-clase.pasada { background-color: #f8fafc; opacity: 0.75; }
.tarjeta-clase.proxima { border-color: #dc3545 !important; box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15); }
.texto-multilinea { white-space: pre-wrap; }
.opcion-modo { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; cursor: pointer; }
.opcion-modo.activa { border-color: #dc3545; background: #fef2f2; }
.fila-asistencia { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }
</style>
