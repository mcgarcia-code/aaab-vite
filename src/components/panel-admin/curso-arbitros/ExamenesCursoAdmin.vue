<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-journal-check me-1"></i> Exámenes del Curso
            </h4>
            <span class="text-muted small d-block mt-1">{{ examenesFiltrados.length }} exámenes en {{ anio }} · se aprueba con el porcentaje indicado en cada uno (por defecto 75%)</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="filtroCurso" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 150px;" aria-label="Curso">
              <option value="">CURSO</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
            </select>
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <button @click="cargarExamenes" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="abrirNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">post_add</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo examen</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 bg-white">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger"></span></div>
          <div v-else-if="!examenesFiltrados.length" class="text-center py-5 text-muted">
            <span class="material-icons d-block fs-1 mb-2 opacity-50">assignment</span>
            <span class="fw-bold">No hay exámenes cargados para {{ anio }}.</span>
          </div>
          <div v-else class="row g-3">
            <div v-for="e in examenesFiltrados" :key="e.id" class="col-12 col-md-6 col-xl-4">
              <div class="tarjeta-examen border rounded-3 p-3 h-100 d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div class="min-w-0">
                    <div class="fw-bold text-dark">{{ e.titulo }}</div>
                    <div class="small text-muted">{{ fechaDMA(e.fecha) }}<template v-if="e.clase"> · {{ e.clase }}</template></div>
                  </div>
                  <span class="badge flex-shrink-0" :class="e.tipo === 'teorico' ? 'bg-danger' : 'bg-dark'">{{ e.tipo === 'teorico' ? 'Teórico' : 'Práctico' }}</span>
                </div>
                <div class="d-flex flex-wrap gap-1 mt-2">
                  <span class="badge" :class="claseCurso(e.curso)">{{ etiquetaCurso(e.curso) }}</span>
                  <span class="badge bg-light text-dark border">Nota máx. {{ formatoNota(e.notaMaxima) }} · aprueba con {{ formatoNota(e.porcentajeAprobacion) }}%</span>
                </div>
                <div class="small mt-2">
                  <span class="text-dark fw-bold">{{ e.cargadas }}</span> notas cargadas ·
                  <span class="text-success fw-bold">{{ e.aprobados }}</span> aprobados ·
                  <span class="text-secondary fw-bold">{{ e.ausentes }}</span> ausentes
                </div>
                <div class="d-flex flex-wrap gap-2 mt-auto pt-3">
                  <button @click="abrirNotas(e)" class="btn btn-sm btn-success flex-fill fw-bold"><i class="bi bi-pencil-square me-1"></i> Cargar notas</button>
                  <button @click="abrirEditar(e)" class="btn btn-sm btn-outline-primary fw-bold" title="Editar examen" aria-label="Editar examen"><i class="bi bi-pencil"></i></button>
                  <button @click="confirmarEliminar(e)" class="btn btn-sm btn-outline-danger fw-bold" title="Borrar examen" aria-label="Borrar examen"><i class="bi bi-trash3"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL EXAMEN -->
    <ModalBase :show="mostrarModal" @close="mostrarModal = false" :icono="form.id ? 'edit_note' : 'post_add'" colorIcono="bg-danger-subtle text-danger" maxWidth="620px">
      <template #header>
        <span class="fw-bold fs-5">{{ form.id ? 'Editar examen' : 'Nuevo examen' }}</span>
      </template>
      <form id="formExamenCurso" class="text-start" novalidate @submit.prevent="guardarExamen">
        <div class="row g-3">
          <div class="col-12">
            <label for="ex-titulo" class="form-label small fw-bold text-dark">Título *</label>
            <input id="ex-titulo" v-model.trim="form.titulo" type="text" maxlength="150" class="form-control" :class="{ 'is-invalid': intento && !form.titulo }" placeholder="Ej: Teórico Reglas 1 a 8">
          </div>
          <div class="col-6 col-md-4">
            <label for="ex-tipo" class="form-label small fw-bold text-dark">Tipo</label>
            <select id="ex-tipo" v-model="form.tipo" class="form-select">
              <option value="teorico">Teórico</option>
              <option value="practico">Práctico</option>
            </select>
          </div>
          <div class="col-6 col-md-4">
            <label for="ex-fecha" class="form-label small fw-bold text-dark">Fecha *</label>
            <input id="ex-fecha" v-model="form.fecha" type="date" class="form-control" :class="{ 'is-invalid': intento && !form.fecha }">
          </div>
          <div class="col-12 col-md-4">
            <label for="ex-curso" class="form-label small fw-bold text-dark">Curso</label>
            <select id="ex-curso" v-model="form.curso" class="form-select">
              <option value="ambos">Ambos</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.etiqueta }}</option>
            </select>
          </div>
          <div class="col-12">
            <label for="ex-clase" class="form-label small fw-bold text-dark">Clase del cronograma (opcional)</label>
            <select id="ex-clase" v-model="form.idClase" class="form-select">
              <option :value="null">— Sin clase asociada —</option>
              <option v-for="c in clasesDelAnio" :key="c.id" :value="c.id">{{ fechaDMA(c.fecha) }} · {{ c.titulo }}</option>
            </select>
          </div>
          <div class="col-6">
            <label for="ex-maxima" class="form-label small fw-bold text-dark">Nota máxima *</label>
            <input id="ex-maxima" v-model.number="form.notaMaxima" type="number" min="1" step="0.01" class="form-control" :class="{ 'is-invalid': intento && !(form.notaMaxima > 0) }">
          </div>
          <div class="col-6">
            <label for="ex-porcentaje" class="form-label small fw-bold text-dark">Aprueba con (%) *</label>
            <input id="ex-porcentaje" v-model.number="form.porcentajeAprobacion" type="number" min="1" max="100" step="0.01" class="form-control" :class="{ 'is-invalid': intento && !(form.porcentajeAprobacion > 0 && form.porcentajeAprobacion <= 100) }">
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formExamenCurso" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
          <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR
        </button>
      </template>
    </ModalBase>

    <!-- MODAL NOTAS -->
    <ModalBase :show="mostrarNotas" @close="mostrarNotas = false" icono="grading" colorIcono="bg-success-subtle text-success" maxWidth="900px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Notas</span>
          <div v-if="examenNotas" class="text-muted small mt-1">
            {{ examenNotas.titulo }} · {{ fechaDMA(examenNotas.fecha) }} · nota máx. {{ formatoNota(examenNotas.notaMaxima) }} · aprueba con {{ formatoNota(examenNotas.porcentajeAprobacion) }}%
          </div>
        </div>
      </template>
      <div v-if="cargandoNotas" class="text-center py-4"><span class="spinner-border text-success"></span></div>
      <div v-else class="text-start">
        <div v-if="!notas.length" class="text-muted small fst-italic">No hay alumnos regulares de este curso para el año del examen.</div>
        <template v-else>
          <div class="small mb-3">
            <span class="badge bg-success me-1">{{ resumenNotas.aprobados }} aprobados</span>
            <span class="badge bg-danger me-1">{{ resumenNotas.desaprobados }} desaprobados</span>
            <span class="badge bg-secondary me-1">{{ resumenNotas.ausentes }} ausentes</span>
            <span class="badge bg-light text-muted border">{{ resumenNotas.sin }} sin nota</span>
          </div>
          <div class="d-flex flex-column gap-2">
            <div v-for="n in notas" :key="n.id" class="fila-nota">
              <div class="row g-2 align-items-center">
                <div class="col-12 col-md-4 min-w-0">
                  <div class="fw-bold text-dark small text-uppercase text-truncate">{{ n.apellido }}, {{ n.nombre }}</div>
                  <div class="text-muted" style="font-size: 0.72rem;">DNI {{ n.dni }} · {{ MODALIDADES_CURSO[n.modalidadCurso]?.corta }}</div>
                </div>
                <div class="col-5 col-md-2">
                  <label :for="`nota-${n.id}`" class="visually-hidden">Nota de {{ n.apellido }}</label>
                  <input :id="`nota-${n.id}`" v-model="n.nota" type="number" min="0" :max="examenNotas.notaMaxima" step="0.01" class="form-control form-control-sm" :class="{ 'is-invalid': notaInvalida(n) }" :disabled="n.ausente" placeholder="Nota">
                </div>
                <div class="col-7 col-md-2">
                  <div class="form-check mb-0">
                    <input :id="`aus-${n.id}`" v-model="n.ausente" class="form-check-input" type="checkbox" @change="limpiarSiAusente(n)">
                    <label :for="`aus-${n.id}`" class="form-check-label small">Ausente</label>
                  </div>
                </div>
                <div class="col-9 col-md-3">
                  <label :for="`com-${n.id}`" class="visually-hidden">Comentario</label>
                  <input :id="`com-${n.id}`" v-model.trim="n.comentarios" type="text" maxlength="1000" class="form-control form-control-sm" placeholder="Comentario (opcional)">
                </div>
                <div class="col-3 col-md-1 text-end">
                  <span v-if="resultado(n) === true" class="badge bg-success">✓</span>
                  <span v-else-if="resultado(n) === false" class="badge bg-danger">✗</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <button type="button" @click="mostrarNotas = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="button" @click="guardarNotas" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoNotas || !notas.length">
          <span v-if="guardandoNotas" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR NOTAS
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
import { fechaDMA } from '@/utils/fechas'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { formatoNota } from '@/composables/useExamenesCurso'
import { useCronogramaCurso } from '@/composables/useCronogramaCurso'

useHead({ title: 'Exámenes del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const PORCENTAJE_DEFECTO = 75

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual([String(Number(anioActual()) + 1)]).map(Number))
const filtroCurso = ref('')
const examenes = ref([])
const cargando = ref(false)

const { clases: clasesDelAnio, cargar: cargarClases } = useCronogramaCurso()

const etiquetaCurso = (curso) => (curso === 'ambos' ? 'Ambos cursos' : MODALIDADES_CURSO[curso]?.etiqueta || curso)
const claseCurso = (curso) => (curso === 'ambos' ? 'bg-light text-dark border' : MODALIDADES_CURSO[curso]?.clase || 'bg-secondary')

const examenesFiltrados = computed(() =>
  filtroCurso.value ? examenes.value.filter(e => e.curso === filtroCurso.value || e.curso === 'ambos') : examenes.value
)

const cargarExamenes = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'examenes_curso_arbitro', action: 'obtenerExamenesCurso', payload: { anio: anio.value } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los exámenes')
    examenes.value = res.payload || []
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

watch(anio, () => {
  cargarExamenes()
  cargarClases(anio.value)
})

// ─── Alta / edición del examen ───────────────────────────────────
const examenVacio = () => ({ id: null, titulo: '', tipo: 'teorico', fecha: '', curso: 'ambos', idClase: null, notaMaxima: 100, porcentajeAprobacion: PORCENTAJE_DEFECTO })
const form = ref(examenVacio())
const mostrarModal = ref(false)
const intento = ref(false)
const guardando = ref(false)

const abrirNuevo = () => {
  form.value = examenVacio()
  intento.value = false
  mostrarModal.value = true
}

const abrirEditar = (e) => {
  form.value = { id: e.id, titulo: e.titulo, tipo: e.tipo, fecha: e.fecha, curso: e.curso, idClase: e.idClase, notaMaxima: e.notaMaxima, porcentajeAprobacion: e.porcentajeAprobacion }
  intento.value = false
  mostrarModal.value = true
}

const guardarExamen = async () => {
  intento.value = true
  const f = form.value
  if (!f.titulo || !f.fecha || !(f.notaMaxima > 0) || !(f.porcentajeAprobacion > 0 && f.porcentajeAprobacion <= 100)) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Revisá los campos marcados.', tipo: 'danger' })
    return
  }
  guardando.value = true
  try {
    const res = await api.post({ entity: 'examenes_curso_arbitro', action: 'guardarExamenCurso', payload: f })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar el examen')
    toast({ titulo: 'Guardado', mensaje: 'El examen se guardó.', tipo: 'success' })
    mostrarModal.value = false
    const anioExamen = Number(f.fecha.substring(0, 4))
    if (anioExamen !== anio.value) anio.value = anioExamen
    else await cargarExamenes()
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (e) => {
  notificar({
    titulo: '¿Borrar examen?',
    mensaje: `${e.titulo} (${fechaDMA(e.fecha)}). Los alumnos dejarán de ver esta nota.`,
    tipo: 'danger',
    alConfirmar: async () => {
      try {
        const res = await api.post({ entity: 'examenes_curso_arbitro', action: 'eliminarExamenCurso', payload: { id: e.id } })
        if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar el examen')
        toast({ titulo: 'Borrado', mensaje: 'El examen se borró.', tipo: 'success' })
        await cargarExamenes()
      } catch (err) {
        notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
      }
    },
  })
}

// ─── Carga de notas ──────────────────────────────────────────────
const mostrarNotas = ref(false)
const examenNotas = ref(null)
const notas = ref([])
const cargandoNotas = ref(false)
const guardandoNotas = ref(false)

const limpiarSiAusente = (n) => {
  if (n.ausente) n.nota = ''
}
const notaNumero = (n) => (n.nota === '' || n.nota === null || n.nota === undefined ? null : Number(n.nota))
const notaInvalida = (n) => {
  const v = notaNumero(n)
  return v !== null && (isNaN(v) || v < 0 || v > examenNotas.value.notaMaxima)
}
const resultado = (n) => {
  const v = notaNumero(n)
  if (n.ausente || v === null || notaInvalida(n)) return null
  return (v / examenNotas.value.notaMaxima) * 100 >= examenNotas.value.porcentajeAprobacion
}
const resumenNotas = computed(() => ({
  aprobados: notas.value.filter(n => resultado(n) === true).length,
  desaprobados: notas.value.filter(n => resultado(n) === false).length,
  ausentes: notas.value.filter(n => n.ausente).length,
  sin: notas.value.filter(n => !n.ausente && notaNumero(n) === null).length,
}))

const abrirNotas = async (e) => {
  examenNotas.value = { ...e }
  notas.value = []
  mostrarNotas.value = true
  cargandoNotas.value = true
  try {
    const res = await api.get({ entity: 'examenes_curso_arbitro', action: 'obtenerNotasExamenCurso', payload: { idExamen: e.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las notas')
    examenNotas.value = res.payload.examen
    notas.value = (res.payload.alumnos || []).map(a => ({ ...a, nota: a.nota ?? '', comentarios: a.comentarios || '' }))
  } catch (err) {
    notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
    mostrarNotas.value = false
  } finally {
    cargandoNotas.value = false
  }
}

const guardarNotas = async () => {
  if (notas.value.some(notaInvalida)) {
    notificar({ titulo: 'Notas inválidas', mensaje: `Las notas tienen que estar entre 0 y ${formatoNota(examenNotas.value.notaMaxima)}.`, tipo: 'danger' })
    return
  }
  guardandoNotas.value = true
  try {
    const res = await api.post({
      entity: 'examenes_curso_arbitro',
      action: 'guardarNotasExamenCurso',
      payload: {
        idExamen: examenNotas.value.id,
        notas: notas.value.map(n => ({ idAlumno: n.id, nota: n.ausente ? '' : String(n.nota ?? ''), ausente: n.ausente, comentarios: n.comentarios })),
      },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron guardar las notas')
    toast({ titulo: 'Guardado', mensaje: 'Las notas se guardaron. Los alumnos ya pueden verlas.', tipo: 'success' })
    mostrarNotas.value = false
    await cargarExamenes()
  } catch (err) {
    notificar({ titulo: 'Error', mensaje: err.message, tipo: 'danger' })
  } finally {
    guardandoNotas.value = false
  }
}

onMounted(() => {
  cargarExamenes()
  cargarClases(anio.value)
})
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }
.tarjeta-examen { background: #fff; }
.fila-nota { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }
</style>
