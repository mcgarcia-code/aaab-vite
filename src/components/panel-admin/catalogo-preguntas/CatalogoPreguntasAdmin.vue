<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">
            Preguntas y respuestas que usan los exámenes online, la práctica y el catálogo público · {{ totalPreguntas }} preguntas
          </p>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <BotonHerramienta tipo="actualizar" :cargando="cargandoReglas || cargandoPreguntas" @click="recargar" />
            <BotonHerramienta tipo="nuevo" texto="Nueva pregunta" @click="abrirModal(null)" />
          </div>
        </div>

        <!-- ============ REGLAS ============ -->
        <div v-if="!reglaAbierta" class="card-body bg-white p-3">
          <EstadoCargando v-if="cargandoReglas && !reglas.length" texto="Cargando reglas" />
          <EstadoVacio v-else-if="!reglas.length" icono="bi-ui-checks-grid" titulo="Todavía no hay preguntas cargadas" />
          <template v-else>
            <div v-if="totalSinCorrecta" class="alert alert-warning py-2 px-3 small fw-semibold mb-3">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>
              {{ totalSinCorrecta === 1 ? 'Hay 1 pregunta' : `Hay ${totalSinCorrecta} preguntas` }} sin respuesta correcta: no aparecen en los exámenes, la práctica ni el catálogo público.
            </div>
            <div class="row g-2 g-md-3">
              <div v-for="r in reglas" :key="r.codigo" class="col-6 col-md-4 col-lg-3 col-xl-2">
                <button type="button" class="tarjeta-regla btn w-100 h-100 border rounded-3 p-3 text-center" @click="abrirRegla(r.codigo)">
                  <i class="bi bi-bookmark-fill text-danger fs-3 d-block mb-1" aria-hidden="true"></i>
                  <span class="fw-bold text-dark d-block">Regla {{ r.codigo }}</span>
                  <span class="small text-muted d-block">{{ r.preguntas }} {{ r.preguntas === 1 ? 'pregunta' : 'preguntas' }}</span>
                  <span v-if="r.sinCorrecta" class="badge rounded-pill bg-warning-subtle text-warning-emphasis mt-2">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ r.sinCorrecta }} sin correcta
                  </span>
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- ============ PREGUNTAS DE UNA REGLA ============ -->
        <template v-else>
          <div class="d-flex flex-wrap gap-2 align-items-center px-3 py-2 border-bottom bg-light small">
            <button type="button" class="btn btn-light border btn-sm rounded-pill fw-bold" @click="volverAReglas">
              <i class="bi bi-arrow-left me-1"></i>Reglas
            </button>
            <span class="fw-bold text-dark fs-6 me-2"><i class="bi bi-bookmark-fill text-danger me-1"></i>Regla {{ reglaAbierta }}</span>
            <div class="busqueda-wrap">
              <input v-model="filtros.texto" class="form-control form-control-sm shadow-none" placeholder="Buscar en la regla..." aria-label="Buscar pregunta">
              <button v-if="filtros.texto" class="btn-limpiar-busqueda" type="button" title="Limpiar búsqueda" aria-label="Limpiar búsqueda" @click="filtros.texto = ''">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <select v-model="filtros.estado" class="form-select form-select-sm shadow-none w-auto" aria-label="Filtrar preguntas">
              <option value="">Todas</option>
              <option value="sinCorrecta">Sin respuesta correcta</option>
              <option value="sinIngles">Sin traducción al inglés</option>
              <option value="excluidas">Excluidas de exámenes</option>
            </select>
            <span class="text-muted text-nowrap ms-auto">{{ filas.length }} de {{ preguntas.length }}</span>
          </div>

          <EstadoCargando v-if="cargandoPreguntas && !preguntas.length" texto="Cargando preguntas" />
          <EstadoVacio v-else-if="!filas.length" icono="bi-search" :titulo="preguntas.length ? 'Ninguna pregunta coincide con el filtro' : 'Esta regla no tiene preguntas'" />

          <template v-else>
            <!-- ESCRITORIO -->
            <div class="d-none d-lg-block table-responsive">
              <table class="table table-hover align-middle mb-0 small">
                <thead class="table-light">
                  <tr>
                    <th class="ps-3 col-numero">N°</th>
                    <th>Pregunta</th>
                    <th class="text-center col-dato">Inglés</th>
                    <th class="text-center col-dato">Respuestas</th>
                    <th class="text-end pe-3 col-acciones">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in filas" :key="p.id">
                    <td class="ps-3 fw-bold text-dark text-nowrap">{{ numeroPregunta(p) }}</td>
                    <td>
                      <div class="texto-recortado text-dark">{{ p.texto }}</div>
                      <span v-if="p.excluidaExamenes" class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis mt-1">Excluida de exámenes</span>
                    </td>
                    <td class="text-center">
                      <i class="bi fs-6" :class="p.textoEn ? 'bi-check-circle-fill text-success' : 'bi-dash-circle text-muted'" :title="p.textoEn ? 'Traducida' : 'Sin traducción'"></i>
                    </td>
                    <td class="text-center text-nowrap">
                      <span class="badge bg-light text-dark border">{{ p.respuestas }}</span>
                      <span class="badge ms-1" :class="p.correctas ? 'bg-success-subtle text-success-emphasis border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'"
                            :title="p.correctas ? 'Respuestas correctas' : 'Sin respuesta correcta'">
                        <i class="bi me-1" :class="p.correctas ? 'bi-check-lg' : 'bi-exclamation-triangle-fill'"></i>{{ p.correctas }}
                      </span>
                    </td>
                    <td class="text-end pe-3 text-nowrap">
                      <button type="button" class="btn btn-sm btn-light border me-1" title="Editar pregunta y respuestas" :aria-label="'Editar pregunta ' + numeroPregunta(p)" @click="abrirModal(p.id)">
                        <i class="bi bi-pencil-square"></i>
                      </button>
                      <button type="button" class="btn btn-sm btn-light border text-danger" title="Borrar pregunta" :aria-label="'Borrar pregunta ' + numeroPregunta(p)" @click="confirmarBorrar(p)">
                        <i class="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CELULAR Y TABLET -->
            <div class="d-lg-none p-3">
              <div v-for="p in filas" :key="'m-' + p.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-body p-3 small">
                  <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <span class="fw-bold text-danger">{{ numeroPregunta(p) }}</span>
                    <div class="d-flex flex-wrap justify-content-end gap-1">
                      <span v-if="p.excluidaExamenes" class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">Excluida</span>
                      <span v-if="!p.textoEn" class="badge rounded-pill bg-light text-muted border">Sin inglés</span>
                      <span class="badge rounded-pill" :class="p.correctas ? 'bg-success-subtle text-success-emphasis' : 'bg-warning-subtle text-warning-emphasis'">
                        {{ p.respuestas }} resp. · {{ p.correctas }} {{ p.correctas === 1 ? 'correcta' : 'correctas' }}
                      </span>
                    </div>
                  </div>
                  <div class="texto-recortado text-dark mb-3">{{ p.texto }}</div>
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-light border rounded-pill fw-bold flex-fill" @click="abrirModal(p.id)">
                      <i class="bi bi-pencil-square me-1"></i>Editar
                    </button>
                    <button type="button" class="btn btn-sm btn-light border rounded-pill text-danger" title="Borrar pregunta" :aria-label="'Borrar pregunta ' + numeroPregunta(p)" @click="confirmarBorrar(p)">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>

      </div>
    </div>

    <ModalPreguntaCatalogo
      :show="modal.abierto"
      :id-pregunta="modal.idPregunta"
      :regla-inicial="reglaAbierta || ''"
      @cambio="modal.huboCambios = true"
      @close="cerrarModal"
    />
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import ModalPreguntaCatalogo from '@/components/panel-admin/catalogo-preguntas/ModalPreguntaCatalogo.vue'
import { useCatalogoAdmin } from '@/composables/useCatalogoAdmin'
import { numeroPregunta } from '@/utils/cuestionarios'
import { normalizarTexto } from '@/utils/texto'

useHead({ title: 'Catálogo de preguntas | AAAB' })

const notificar = inject('notificar')
const route = useRoute()
const router = useRouter()

const {
  reglas, preguntas, cargandoReglas, cargandoPreguntas,
  cargarReglas, cargarPreguntas, borrarPregunta
} = useCatalogoAdmin()

const avisarError = (e) => notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })

// La regla abierta va en la URL (?regla=8): el botón atrás del celular vuelve a la grilla de reglas
const reglaAbierta = computed(() => (route.query.regla ? String(route.query.regla) : ''))

const abrirRegla = (codigo) => router.push({ query: { ...route.query, regla: codigo } })
const volverAReglas = () => router.push({ query: { ...route.query, regla: undefined } })

const totalPreguntas = computed(() => reglas.value.reduce((suma, r) => suma + r.preguntas, 0))
const totalSinCorrecta = computed(() => reglas.value.reduce((suma, r) => suma + r.sinCorrecta, 0))

// ============ FILTROS ============
const filtros = reactive({ texto: '', estado: '' })

const filas = computed(() => {
  const texto = normalizarTexto(filtros.texto)
  return preguntas.value.filter(p =>
    (!texto || normalizarTexto(`${numeroPregunta(p)} ${p.texto} ${p.textoEn}`).includes(texto)) &&
    (filtros.estado !== 'sinCorrecta' || !p.correctas) &&
    (filtros.estado !== 'sinIngles' || !p.textoEn) &&
    (filtros.estado !== 'excluidas' || p.excluidaExamenes)
  )
})

// ============ CARGA ============
const cargarPreguntasRegla = async () => {
  if (!reglaAbierta.value) return
  try {
    await cargarPreguntas(reglaAbierta.value)
  } catch (e) {
    avisarError(e)
  }
}

const recargar = async () => {
  try {
    await Promise.all([cargarReglas(), cargarPreguntasRegla()])
  } catch (e) {
    avisarError(e)
  }
}

watch(reglaAbierta, () => {
  preguntas.value = []
  Object.assign(filtros, { texto: '', estado: '' })
  cargarPreguntasRegla()
})

onMounted(recargar)

// ============ MODAL ============
const modal = reactive({ abierto: false, idPregunta: null, huboCambios: false })

const abrirModal = (idPregunta) => Object.assign(modal, { abierto: true, idPregunta, huboCambios: false })

// Si en el modal se guardó o borró algo, se actualizan los contadores y la lista
const cerrarModal = () => {
  const recargarDespues = modal.huboCambios
  Object.assign(modal, { abierto: false, idPregunta: null, huboCambios: false })
  if (recargarDespues) recargar()
}

// ============ BORRAR ============
const confirmarBorrar = (pregunta) => {
  notificar({
    titulo: `¿Borrar la pregunta ${numeroPregunta(pregunta)}?`,
    mensaje: 'Se borran la pregunta y todas sus respuestas, y deja de salir en los exámenes, la práctica y el catálogo público. Los exámenes y prácticas ya rendidos no cambian.',
    tipo: 'danger',
    alConfirmar: async () => {
      try {
        await borrarPregunta(pregunta.id)
        await recargar()
      } catch (e) {
        avisarError(e)
      }
    }
  })
}
</script>

<style scoped>
.tarjeta-regla {
  background: var(--o-chip, #f8fafc);
  transition: border-color .12s ease, background .12s ease;
}
@media (hover: hover) {
  .tarjeta-regla:hover {
    background: var(--o-rojo-fondo, #fff5f5);
    border-color: var(--o-rojo-borde, #fca5a5) !important;
  }
}

.busqueda-wrap { position: relative; flex: 1 1 180px; max-width: 280px; }
.busqueda-wrap input { padding-right: 30px; }
.btn-limpiar-busqueda {
  position: absolute; top: 50%; right: 6px; transform: translateY(-50%);
  border: none; background: transparent; padding: 0; width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  color: var(--o-texto-suave, #adb5bd); font-size: 0.75rem;
}

.texto-recortado {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.col-numero { width: 80px; }
.col-dato { width: 110px; }
.col-acciones { width: 110px; }
</style>
