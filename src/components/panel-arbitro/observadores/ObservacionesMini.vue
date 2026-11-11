<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 mb-4 w-100 mx-auto" style="border-radius: 12px; overflow: hidden;">

      <!-- ENCABEZADO -->
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom border-2 border-danger gap-3">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-mortarboard-fill me-1"></i> Observaciones del Curso
          </h4>
          <span class="text-muted small d-block mt-1">Observaciones que hiciste a aspirantes del curso de árbitros</span>
        </div>

        <div class="d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
          <select v-model="anio" class="form-select form-select-sm shadow-none text-uppercase text-dark py-2" style="width: 100px;" aria-label="Año">
            <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
          </select>

          <button @click="cargar" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Actualizar">
            <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
            <span v-else class="material-icons" style="font-size: 20px;">refresh</span>
            <span class="d-none d-md-inline fw-bold text-dark" style="font-size: 0.8rem;">Actualizar</span>
          </button>

          <button @click="busqueda = ''" :disabled="!busqueda" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Limpiar filtros">
            <span class="material-icons" style="font-size: 20px;">filter_alt_off</span>
            <span class="d-none d-md-inline fw-bold text-dark" style="font-size: 0.8rem;">Limpiar</span>
          </button>

          <button @click="abrirNueva" class="btn btn-danger shadow-sm py-2 d-flex align-items-center gap-2" title="Nueva observación">
            <span class="material-icons" style="font-size: 20px;">add</span>
            <span class="d-none d-md-inline fw-bold" style="font-size: 0.8rem;">Nueva Observación</span>
          </button>
        </div>
      </div>

      <div class="card-body bg-white p-0">

        <!-- SPINNER DE CARGA -->
        <div v-if="cargando" class="text-center p-5 bg-white">
          <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
          <p class="text-muted mt-3 fw-bold">Cargando observaciones...</p>
        </div>

        <template v-else>
          <!-- FILTRO DE BÚSQUEDA -->
          <div class="p-3 p-md-4 border-bottom bg-light">
            <div class="input-group shadow-sm rounded-pill overflow-hidden border border-secondary-subtle bg-white">
              <span class="input-group-text bg-white border-0 text-muted ps-3"><i class="bi bi-search"></i></span>
              <input
                v-model="busqueda"
                type="text"
                class="form-control border-0 py-2 shadow-none"
                placeholder="BUSCAR POR ASPIRANTE, CATEGORÍA O ENCUENTRO..."
                aria-label="Buscar"
              >
            </div>
          </div>

          <!-- TABLA (Escritorio) -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.8rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 text-uppercase text-muted ps-3" style="width: 110px;">Fecha</th>
                  <th class="py-3 text-uppercase text-muted">Aspirante</th>
                  <th class="py-3 text-uppercase text-muted">Categoría / Encuentro</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="width: 140px;">Estado</th>
                  <th class="py-3 text-center text-uppercase text-muted pe-3" style="width: 200px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="obs in observacionesPaginadas" :key="obs.id">
                  <td class="fw-bold text-muted ps-3">{{ fechaDMA(obs.fecha_partido) }}</td>
                  <td class="fw-bold text-uppercase text-dark">
                    <div>{{ obs.apellido }}, {{ obs.nombre }}</div>
                    <div class="text-muted fw-normal text-capitalize" style="font-size: 0.72rem;">{{ MODALIDADES_CURSO[obs.modalidad_curso]?.etiqueta }}</div>
                  </td>
                  <td class="text-dark">
                    <div class="fw-bold">{{ obs.categoria || '-' }}</div>
                    <div class="text-muted">{{ obs.encuentro }}</div>
                  </td>
                  <td class="text-center">
                    <span :class="estadoDe(obs).clase">{{ estadoDe(obs).etiqueta }}</span>
                    <i v-if="obs.motivo_revision" class="bi bi-chat-left-text-fill text-primary ms-1" title="Tiene comentarios de la revisión"></i>
                  </td>
                  <td class="text-center pe-3">
                    <div class="d-flex justify-content-center gap-1">
                      <button class="btn btn-sm btn-light border shadow-sm rounded-pill px-2 d-flex align-items-center gap-1 text-secondary" @click="detalle = obs" title="Ver detalle" aria-label="Ver detalle">
                        <span class="material-icons" style="font-size: 16px;">visibility</span>
                      </button>
                      <template v-if="esPendiente(obs)">
                        <button class="btn btn-sm btn-outline-primary shadow-sm rounded-pill px-2 d-flex align-items-center gap-1" @click="abrirEditar(obs)" title="Editar" aria-label="Editar">
                          <span class="material-icons" style="font-size: 16px;">edit</span>
                        </button>
                        <button class="btn btn-sm btn-outline-danger shadow-sm rounded-pill px-2 d-flex align-items-center gap-1" @click="confirmarEliminar(obs)" title="Borrar" aria-label="Borrar">
                          <span class="material-icons" style="font-size: 16px;">delete</span>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
                <tr v-if="observacionesPaginadas.length === 0">
                  <td colspan="5" class="py-5 text-center text-muted border-0 bg-white">
                    <span class="material-icons d-block fs-1 mb-2">search_off</span>
                    <p class="m-0 fw-bold">No cargaste observaciones del curso.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS (Celular) -->
          <div class="d-md-none p-3 bg-light">
            <div v-for="obs in observacionesPaginadas" :key="'mob-' + obs.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start mb-2 gap-2">
                  <div class="fw-bold text-uppercase text-dark" style="font-size: 1rem; line-height: 1.2;">{{ obs.apellido }}, {{ obs.nombre }}</div>
                  <div class="d-flex align-items-center gap-1 flex-shrink-0">
                    <i v-if="obs.motivo_revision" class="bi bi-chat-left-text-fill text-primary" title="Tiene comentarios de la revisión"></i>
                    <span :class="estadoDe(obs).clase">{{ estadoDe(obs).etiqueta }}</span>
                  </div>
                </div>
                <div class="text-muted fw-bold mb-2" style="font-size: 0.8rem;">
                  {{ fechaDMA(obs.fecha_partido) }} <span class="mx-1">•</span> {{ obs.categoria || '-' }}
                </div>
                <div class="text-dark small mb-2">{{ obs.encuentro }}</div>
                <div class="d-flex justify-content-end align-items-center border-top pt-2 gap-1">
                  <button class="btn btn-sm btn-light border rounded-pill px-3 fw-bold d-flex align-items-center gap-1 text-secondary" @click="detalle = obs" aria-label="Ver detalle">
                    <span class="material-icons" style="font-size: 16px;">visibility</span>
                  </button>
                  <template v-if="esPendiente(obs)">
                    <button class="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1" @click="abrirEditar(obs)" aria-label="Editar">
                      <span class="material-icons" style="font-size: 16px;">edit</span>
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold d-flex align-items-center gap-1" @click="confirmarEliminar(obs)" aria-label="Borrar">
                      <span class="material-icons" style="font-size: 16px;">delete</span>
                    </button>
                  </template>
                </div>
              </div>
            </div>

            <div v-if="observacionesPaginadas.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border">
              <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
              <p class="text-muted m-0 fw-bold">No cargaste observaciones del curso.</p>
            </div>
          </div>

          <!-- PAGINACIÓN -->
          <div class="d-flex justify-content-center align-items-center gap-3 my-4" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="paginaActual--" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="paginaActual++" :disabled="paginaActual >= totalPaginas">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- MODAL: VER DETALLE -->
    <ModalBase :show="!!detalle" @close="detalle = null" titulo="Detalle de la Observación" icono="visibility" colorIcono="bg-secondary text-white" maxWidth="800px">
      <div v-if="detalle" class="text-start">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <p class="m-0 fw-bold small text-dark">Observación #{{ detalle.id }}</p>
            <p class="m-0 text-muted small">{{ fechaDMA(detalle.fecha_partido) }} — Curso de Árbitros</p>
          </div>
          <span class="align-self-center" :class="estadoDe(detalle).clase">{{ estadoDe(detalle).etiqueta }}</span>
        </div>

        <div class="bg-light p-3 rounded border mb-3 border-secondary-subtle">
          <p class="m-0 small text-dark"><strong class="text-muted">Aspirante:</strong> {{ detalle.apellido }}, {{ detalle.nombre }} ({{ MODALIDADES_CURSO[detalle.modalidad_curso]?.etiqueta }})</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Observador:</strong> {{ detalle.observador || '-' }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Categoría:</strong> {{ detalle.categoria || '-' }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Encuentro:</strong> {{ detalle.encuentro }}</p>
        </div>

        <!-- Comentario de la revisión -->
        <div v-if="detalle.motivo_revision" class="alert py-2 px-3 small mb-3" :class="estadoDe(detalle).alerta">
          <div class="fw-bold mb-1"><i class="bi bi-chat-left-text me-1"></i>{{ detalle.estado_revision === 'rechazada' ? 'Motivo de rechazo' : 'Comentarios de la revisión' }}</div>
          <div style="white-space: pre-line;">{{ detalle.motivo_revision }}</div>
        </div>

        <!-- Comentarios -->
        <div class="border rounded p-3">
          <h6 class="fw-bold text-dark small text-uppercase mb-3 d-flex align-items-center gap-1">
            <i class="bi bi-chat-left-text"></i> Comentarios
          </h6>
          <template v-for="c in CAMPOS_OBSERVACION_CURSO" :key="c.clave">
            <div v-if="detalle[c.columna]" class="mb-3">
              <div class="fw-bold small" :class="c.clave === 'aspectosAMejorar' ? 'text-danger' : 'text-dark'">{{ c.etiqueta }}</div>
              <div class="small text-muted" style="white-space: pre-line;">{{ detalle[c.columna] }}</div>
            </div>
          </template>
          <div v-if="!CAMPOS_OBSERVACION_CURSO.some(c => detalle[c.columna])" class="text-center py-3 text-muted small">
            Esta observación no tiene comentarios cargados.
          </div>
        </div>

        <!-- Acciones (dentro del cuerpo para que se vean también en mobile) -->
        <div class="d-flex flex-column flex-sm-row gap-2 mt-4">
          <button v-if="esPendiente(detalle)" @click="editarDesdeDetalle" class="btn btn-outline-primary rounded-pill px-4 fw-bold order-1 order-sm-2 flex-sm-grow-1">EDITAR</button>
          <button @click="detalle = null" class="btn btn-light border rounded-pill px-4 fw-bold order-2 order-sm-1 flex-sm-grow-1">CERRAR</button>
        </div>
      </div>
    </ModalBase>

    <ModalObservacionCurso v-model:show="mostrarModal" :observacion="seleccionada" es-observador @guardado="alGuardar" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import ModalObservacionCurso from '@/components/ModalObservacionCurso.vue'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { CAMPOS_OBSERVACION_CURSO, ESTADOS_REVISION_OBSERVACION } from '@/composables/useObservacionesCurso'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'
import { normalizarTexto } from '@/utils/texto'

useHead({ title: 'Observaciones del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual().map(Number))
const observaciones = ref([])
const cargando = ref(false)
const busqueda = ref('')
const detalle = ref(null)
const mostrarModal = ref(false)
const seleccionada = ref(null)

// Solo se pueden editar o borrar mientras están pendientes de revisión
const estadoDe = (o) => ESTADOS_REVISION_OBSERVACION[o?.estado_revision] || ESTADOS_REVISION_OBSERVACION.pendiente
const esPendiente = (o) => (o?.estado_revision || 'pendiente') === 'pendiente'


const observacionesFiltradas = computed(() => {
  const texto = normalizarTexto(busqueda.value)
  if (!texto) return observaciones.value
  return observaciones.value.filter(o => normalizarTexto(`${o.apellido} ${o.nombre} ${o.categoria} ${o.encuentro}`).includes(texto))
})

// Paginación
const paginaActual = ref(1)
const registrosPorPagina = 10
const totalPaginas = computed(() => Math.ceil(observacionesFiltradas.value.length / registrosPorPagina) || 1)
const observacionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return observacionesFiltradas.value.slice(inicio, inicio + registrosPorPagina)
})
watch(busqueda, () => { paginaActual.value = 1 })

const cargar = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'observaciones_curso_arbitro', action: 'obtenerMisObservacionesRealizadasCurso', payload: { anio: anio.value } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar tus observaciones')
    observaciones.value = res.payload || []
    paginaActual.value = 1
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

watch(anio, cargar)

const abrirNueva = () => {
  seleccionada.value = null
  mostrarModal.value = true
}

const abrirEditar = (o) => {
  seleccionada.value = o
  mostrarModal.value = true
}

const editarDesdeDetalle = () => {
  const o = detalle.value
  detalle.value = null
  abrirEditar(o)
}

const alGuardar = async (f) => {
  const anioObs = Number(String(f.fechaPartido).substring(0, 4))
  if (anioObs !== anio.value) anio.value = anioObs
  else await cargar()
}

const confirmarEliminar = (o) => {
  notificar({
    titulo: '¿Borrar observación?',
    mensaje: `${o.apellido}, ${o.nombre} · ${o.encuentro} (${fechaDMA(o.fecha_partido)}).`,
    tipo: 'danger',
    alConfirmar: async () => {
      try {
        const res = await api.post({ entity: 'observaciones_curso_arbitro', action: 'eliminarObservacionCurso', payload: { id: o.id } })
        if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar la observación')
        toast({ titulo: 'Borrada', mensaje: 'La observación se borró.', tipo: 'success' })
        await cargar()
      } catch (e) {
        toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
      }
    },
  })
}

onMounted(cargar)
</script>

<style scoped>
.animate__animated { animation-duration: 0.5s; }

/* Píldoras de estado: mismo estilo que Mis Observaciones Realizadas */
.estado-pill { border-radius: 999px; padding: 0.35em 0.85em; font-weight: 700; font-size: 0.7rem; letter-spacing: 0.02em; border: 1px solid transparent; display: inline-block; white-space: nowrap; }
.estado-pendiente { background-color: #fdf3d3; color: #a6841f; border-color: #f2e2a5; }
.estado-aprobada { background-color: #e3f5e6; color: #2f8a45; border-color: #bfe6c8; }
.estado-rechazada { background-color: #fde7ea; color: #c0304a; border-color: #f5c2cb; }
</style>
