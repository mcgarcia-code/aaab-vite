<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-clipboard-data-fill me-1"></i> Observaciones del Curso
            </h4>
            <span class="text-muted small d-block mt-1">{{ observacionesFiltradas.length }} observaciones de partidos en {{ anio }}</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <button @click="cargarObservaciones" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="abrirNueva" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_box</span>
              <span class="fw-bold d-none d-md-inline small">Nueva observación</span>
            </button>
          </div>
        </div>

        <div class="bg-light p-3 border-bottom">
          <div class="row g-2">
            <div class="col-12 col-md-4"><input v-model="filtros.texto" class="form-control form-control-sm shadow-none" placeholder="BUSCAR ASPIRANTE, EQUIPO U OBSERVADOR..."></div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.modalidad" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">CURSO</option>
                <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5"><span class="spinner-border text-danger"></span></div>
          <template v-else>
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.78rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-center text-uppercase text-muted">Acciones</th>
                    <th class="py-3 text-uppercase text-muted">Fecha</th>
                    <th class="py-3 text-uppercase text-muted">Aspirante</th>
                    <th class="py-3 text-center text-uppercase text-muted">Curso</th>
                    <th class="py-3 text-uppercase text-muted">Partido</th>
                    <th class="py-3 text-uppercase text-muted">Categoría</th>
                    <th class="py-3 text-uppercase text-muted">Observador</th>
                    <th class="py-3 text-center text-uppercase text-muted">Calificación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in observacionesFiltradas" :key="o.id">
                    <td class="ps-3 text-center">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="abrirEditar(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Ver / editar" aria-label="Ver o editar">
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button @click="confirmarEliminar(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Borrar" aria-label="Borrar">
                          <span class="material-icons" style="font-size:16px;">delete</span>
                        </button>
                      </div>
                    </td>
                    <td class="fw-bold text-dark">{{ fechaDMA(o.fecha_partido) }}</td>
                    <td class="fw-bold text-dark text-uppercase">{{ o.apellido }}, {{ o.nombre }}</td>
                    <td class="text-center"><span class="badge" :class="MODALIDADES_CURSO[o.modalidad_curso]?.clase">{{ MODALIDADES_CURSO[o.modalidad_curso]?.corta }}</span></td>
                    <td class="text-dark">{{ o.local }} vs {{ o.visitante }}</td>
                    <td class="text-dark">{{ o.categoria || '-' }}</td>
                    <td class="text-dark">{{ o.observador || '-' }}</td>
                    <td class="text-center fw-bold text-dark">{{ o.calificacion !== null ? formatoNota(o.calificacion) : '-' }}</td>
                  </tr>
                  <tr v-if="!observacionesFiltradas.length">
                    <td colspan="8" class="text-center py-5 text-muted border-0">
                      <span class="material-icons d-block fs-1 mb-2 opacity-50">search_off</span>
                      <span class="fw-bold">No hay observaciones para mostrar.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-md-none p-3 bg-light">
              <div v-for="o in observacionesFiltradas" :key="'m-' + o.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-body p-3 small text-dark">
                  <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                    <span class="fw-bold text-uppercase">{{ o.apellido }}, {{ o.nombre }}</span>
                    <span v-if="o.calificacion !== null" class="badge bg-danger">{{ formatoNota(o.calificacion) }}</span>
                  </div>
                  <div>{{ fechaDMA(o.fecha_partido) }} · {{ o.local }} vs {{ o.visitante }}</div>
                  <div v-if="o.categoria" class="text-muted">{{ o.categoria }}</div>
                  <div class="d-flex gap-2 mt-3">
                    <button @click="abrirEditar(o)" class="btn btn-sm btn-outline-primary flex-fill fw-bold"><i class="bi bi-pencil me-1"></i> Ver / editar</button>
                    <button @click="confirmarEliminar(o)" class="btn btn-sm btn-outline-danger fw-bold" aria-label="Borrar"><i class="bi bi-trash3"></i></button>
                  </div>
                </div>
              </div>
              <div v-if="!observacionesFiltradas.length" class="text-center p-4 bg-white rounded-3 shadow-sm border text-muted fw-bold">
                No hay observaciones para mostrar.
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <ModalBase :show="mostrarModal" @close="mostrarModal = false" :icono="form.id ? 'edit' : 'add_box'" colorIcono="bg-danger-subtle text-danger" maxWidth="760px">
      <template #header>
        <span class="fw-bold fs-5">{{ form.id ? 'Editar observación' : 'Nueva observación' }}</span>
      </template>
      <form id="formObservacionCurso" class="text-start" novalidate @submit.prevent="guardar">
        <div class="row g-3">
          <div class="col-12 col-md-8">
            <label for="obs-alumno" class="form-label small fw-bold text-dark">Aspirante *</label>
            <select id="obs-alumno" v-model="form.idAlumno" class="form-select" :class="{ 'is-invalid': intento && !form.idAlumno }">
              <option :value="null" disabled>Seleccionar aspirante...</option>
              <option v-for="a in alumnosParaSelect" :key="a.id" :value="a.id">
                {{ a.apellido }}, {{ a.nombre }} · {{ MODALIDADES_CURSO[a.modalidad_curso]?.corta }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <label for="obs-fecha" class="form-label small fw-bold text-dark">Fecha del partido *</label>
            <input id="obs-fecha" v-model="form.fechaPartido" type="date" class="form-control" :class="{ 'is-invalid': intento && !form.fechaPartido }">
          </div>
          <div class="col-12 col-md-6">
            <label for="obs-local" class="form-label small fw-bold text-dark">Local *</label>
            <input id="obs-local" v-model.trim="form.local" type="text" maxlength="150" class="form-control" :class="{ 'is-invalid': intento && !form.local }">
          </div>
          <div class="col-12 col-md-6">
            <label for="obs-visitante" class="form-label small fw-bold text-dark">Visitante *</label>
            <input id="obs-visitante" v-model.trim="form.visitante" type="text" maxlength="150" class="form-control" :class="{ 'is-invalid': intento && !form.visitante }">
          </div>
          <div class="col-12 col-md-5">
            <label for="obs-categoria" class="form-label small fw-bold text-dark">Categoría</label>
            <input id="obs-categoria" v-model.trim="form.categoria" type="text" maxlength="150" class="form-control">
          </div>
          <div class="col-8 col-md-5">
            <label for="obs-observador" class="form-label small fw-bold text-dark">Observador/a</label>
            <input id="obs-observador" v-model.trim="form.observador" type="text" maxlength="150" class="form-control">
          </div>
          <div class="col-4 col-md-2">
            <label for="obs-calificacion" class="form-label small fw-bold text-dark">Nota (0-10)</label>
            <input id="obs-calificacion" v-model="form.calificacion" type="number" min="0" max="10" step="0.01" class="form-control" :class="{ 'is-invalid': intento && calificacionInvalida }">
          </div>
          <div class="col-12">
            <label for="obs-fortalezas" class="form-label small fw-bold text-dark">Fortalezas</label>
            <textarea id="obs-fortalezas" v-model.trim="form.fortalezas" rows="3" maxlength="3000" class="form-control"></textarea>
          </div>
          <div class="col-12">
            <label for="obs-mejorar" class="form-label small fw-bold text-dark">Aspectos a mejorar</label>
            <textarea id="obs-mejorar" v-model.trim="form.aspectosAMejorar" rows="3" maxlength="3000" class="form-control"></textarea>
          </div>
          <div class="col-12">
            <label for="obs-comentarios" class="form-label small fw-bold text-dark">Comentarios</label>
            <textarea id="obs-comentarios" v-model.trim="form.comentarios" rows="2" maxlength="3000" class="form-control"></textarea>
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formObservacionCurso" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
          <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR
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
import { formatoNota } from '@/composables/useExamenesCurso'

useHead({ title: 'Observaciones del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual().map(Number))
const observaciones = ref([])
const alumnos = ref([])
const cargando = ref(false)
const filtros = reactive({ texto: '', modalidad: '' })

const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const observacionesFiltradas = computed(() => {
  const texto = normalizar(filtros.texto)
  return observaciones.value.filter(o =>
    (!filtros.modalidad || o.modalidad_curso === filtros.modalidad) &&
    (!texto || normalizar(`${o.apellido} ${o.nombre} ${o.local} ${o.visitante} ${o.observador}`).includes(texto))
  )
})

const limpiarFiltros = () => Object.assign(filtros, { texto: '', modalidad: '' })

const cargarObservaciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'observaciones_curso_arbitro', action: 'obtenerObservacionesCursoAdmin', payload: { anio: anio.value } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las observaciones')
    observaciones.value = res.payload || []
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const cargarAlumnos = async () => {
  try {
    const res = await api.get({ entity: 'legajos_curso_arbitro', action: 'obtenerAlumnosRegularesCurso', payload: {} })
    if (res?.ok) alumnos.value = res.payload || []
  } catch (e) {
    console.error('cargarAlumnos:', e)
  }
}

watch(anio, cargarObservaciones)

// ─── Alta / edición ──────────────────────────────────────────────
const observacionVacia = () => ({
  id: null, idAlumno: null, fechaPartido: '', local: '', visitante: '', categoria: '', observador: '',
  calificacion: '', fortalezas: '', aspectosAMejorar: '', comentarios: '',
})
const form = ref(observacionVacia())
const mostrarModal = ref(false)
const intento = ref(false)
const guardando = ref(false)

// Al editar, el aspirante puede no estar entre los regulares de este año: se agrega igual
const alumnosParaSelect = computed(() => {
  const lista = [...alumnos.value]
  const actual = observaciones.value.find(o => o.id === form.value.id)
  if (actual && !lista.some(a => a.id === actual.id_alumno)) {
    lista.unshift({ id: actual.id_alumno, apellido: actual.apellido, nombre: actual.nombre, modalidad_curso: actual.modalidad_curso })
  }
  return lista
})

const calificacionInvalida = computed(() => {
  const c = form.value.calificacion
  if (c === '' || c === null) return false
  const n = Number(c)
  return isNaN(n) || n < 0 || n > 10
})

const abrirNueva = () => {
  form.value = observacionVacia()
  intento.value = false
  mostrarModal.value = true
}

const abrirEditar = (o) => {
  form.value = {
    id: o.id, idAlumno: o.id_alumno, fechaPartido: o.fecha_partido, local: o.local || '', visitante: o.visitante || '',
    categoria: o.categoria || '', observador: o.observador || '', calificacion: o.calificacion ?? '',
    fortalezas: o.fortalezas || '', aspectosAMejorar: o.aspectos_a_mejorar || '', comentarios: o.comentarios || '',
  }
  intento.value = false
  mostrarModal.value = true
}

const guardar = async () => {
  intento.value = true
  const f = form.value
  if (!f.idAlumno || !f.fechaPartido || !f.local || !f.visitante || calificacionInvalida.value) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Revisá los campos marcados.', tipo: 'danger' })
    return
  }
  guardando.value = true
  try {
    const res = await api.post({ entity: 'observaciones_curso_arbitro', action: 'guardarObservacionCurso', payload: { ...f, calificacion: String(f.calificacion ?? '') } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar la observación')
    toast({ titulo: 'Guardado', mensaje: f.id ? 'La observación se actualizó.' : 'La observación se cargó y se avisó al aspirante.', tipo: 'success' })
    mostrarModal.value = false
    const anioObs = Number(f.fechaPartido.substring(0, 4))
    if (anioObs !== anio.value) anio.value = anioObs
    else await cargarObservaciones()
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

const confirmarEliminar = (o) => {
  notificar({
    titulo: '¿Borrar observación?',
    mensaje: `${o.apellido}, ${o.nombre} · ${o.local} vs ${o.visitante} (${fechaDMA(o.fecha_partido)}).`,
    tipo: 'danger',
    alConfirmar: async () => {
      try {
        const res = await api.post({ entity: 'observaciones_curso_arbitro', action: 'eliminarObservacionCurso', payload: { id: o.id } })
        if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar la observación')
        toast({ titulo: 'Borrada', mensaje: 'La observación se borró.', tipo: 'success' })
        await cargarObservaciones()
      } catch (e) {
        notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
      }
    },
  })
}

onMounted(() => {
  cargarObservaciones()
  cargarAlumnos()
})
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }
</style>
