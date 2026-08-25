<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-clipboard-check me-1"></i> Solicitudes Institucionales
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ solicitudes.length }} solicitudes</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Actualizar -->
            <button @click="cargarSolicitudes" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <!-- Botón Agregar Solicitud -->
            <button @click="abrirModalNueva" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_circle</span>
              <span class="fw-bold d-none d-md-inline small">Agregar Solicitud</span>
            </button>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando solicitudes...</p>
          </div>

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.75rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted" style="font-size: 0.75rem; width: 1px;">ID</th>
                    <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Acciones</th>
                    <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Árbitro/s</th>
                    <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Solicitud</th>
                    <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Club</th>
                    <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Rama</th>
                    <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Categorías</th>
                    <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Vigencia</th>
                    <th class="py-3 text-center pe-3 text-uppercase text-muted" style="font-size: 0.75rem;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in solicitudesPaginadas" :key="s.id">
                    <td class="ps-3 text-muted fw-bold font-monospace">{{ s.id }}</td>
                    <td class="text-center">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="abrirModalEditar(s)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar">
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button @click="confirmarEliminar(s)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Eliminar">
                          <span class="material-icons" style="font-size:16px;">delete</span>
                        </button>
                      </div>
                    </td>
                    <td class="text-dark fw-bold">
                      <div class="d-block">{{ s.apellido }}, {{ s.nombre }}</div>
                    </td>
                    <td class="text-muted">
                      <span v-if="esSolicitudPar(s)" class="badge bg-warning-subtle text-warning-emphasis border">No ser designado con árbitro</span>
                      <span v-else class="badge bg-danger-subtle text-danger border">No ser designado a club</span>
                    </td>
                    <td class="text-dark">
                      <template v-if="esSolicitudPar(s)">
                        <span class="text-muted">Junto a: </span>{{ s.arbitro_par_apellido }}, {{ s.arbitro_par_nombre }}
                      </template>
                      <template v-else>{{ s.club || '-' }}</template>
                    </td>
                    <td class="text-center text-muted">{{ esSolicitudPar(s) ? '-' : etiquetaRama(s.rama) }}</td>
                    <td class="text-muted" style="white-space: normal;">
                      <span v-if="esSolicitudPar(s)" class="text-muted">-</span>
                      <span v-else-if="s.todas_categorias" class="badge bg-info-subtle text-primary border">TODAS</span>
                      <template v-else>
                        <span class="badge bg-light text-dark border me-1 mb-1">{{ s.categoria }}</span>
                      </template>
                    </td>
                    <td class="text-muted small">
                      <div>{{ formatearFecha(s.fecha_desde) }}</div>
                      <div class="text-secondary">→ {{ formatearFecha(s.fecha_hasta) }}</div>
                    </td>
                    <td class="text-center pe-3">
                      <span class="badge" :class="claseEstado(s.estado)">{{ (s.estado || '').toUpperCase() }}</span>
                    </td>
                  </tr>
                  <tr v-if="solicitudesPaginadas.length === 0">
                    <td colspan="9" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">inbox</span>
                      <p class="m-0 fw-bold">No hay solicitudes cargadas.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="s in solicitudesPaginadas" :key="'mob-'+s.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-header bg-white border-bottom-0 pb-2 px-3 pt-3 rounded-top-3 d-flex justify-content-between align-items-start">
                  <div class="text-dark fw-bold d-flex align-items-center gap-2" style="font-size: 1rem;">
                    <span class="material-icons text-primary" style="font-size: 20px;">person</span>
                    <div>
                      <div>{{ s.apellido }}, {{ s.nombre }}</div>
                    </div>
                  </div>
                  <div class="d-flex flex-column align-items-end gap-1">
                    <span class="small text-muted fw-bold font-monospace">#{{ s.id }}</span>
                    <span class="badge" :class="claseEstado(s.estado)">{{ (s.estado || '').toUpperCase() }}</span>
                  </div>
                </div>
                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex flex-column gap-2 bg-light p-2 rounded border mb-2 border-light-subtle">
                    <template v-if="esSolicitudPar(s)">
                      <span class="text-dark small"><strong>Solicitud:</strong> No ser designado con árbitro</span>
                      <span class="text-dark small"><strong>Junto a:</strong> {{ s.arbitro_par_apellido }}, {{ s.arbitro_par_nombre }}</span>
                    </template>
                    <template v-else>
                      <span class="text-dark small"><strong>Solicitud:</strong> No ser designado a club</span>
                      <span class="text-dark small"><strong>Club:</strong> {{ s.club || '-' }}</span>
                      <span class="text-dark small"><strong>Rama:</strong> {{ etiquetaRama(s.rama) }}</span>
                      <div class="text-dark small">
                        <strong>Categorías:</strong>
                        <span v-if="s.todas_categorias" class="badge bg-info-subtle text-primary ms-1">TODAS</span>
                        <template v-else>
                          <span class="badge bg-white text-dark border ms-1">{{ s.categoria }}</span>
                        </template>
                      </div>
                    </template>
                    <span class="text-dark small"><strong>Vigencia:</strong> {{ formatearFecha(s.fecha_desde) }} → {{ formatearFecha(s.fecha_hasta) }}</span>
                  </div>
                  <div class="d-flex gap-2">
                    <button @click="abrirModalEditar(s)" class="btn btn-sm btn-outline-primary flex-fill fw-bold d-flex align-items-center justify-content-center gap-1">
                      <span class="material-icons" style="font-size:16px;">edit</span> Editar
                    </button>
                    <button @click="confirmarEliminar(s)" class="btn btn-sm btn-outline-danger flex-fill fw-bold d-flex align-items-center justify-content-center gap-1">
                      <span class="material-icons" style="font-size:16px;">delete</span> Eliminar
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="solicitudesPaginadas.length === 0" class="text-center py-5 text-muted">
                <span class="material-icons d-block fs-1 mb-2">inbox</span>
                <p class="m-0 fw-bold">No hay solicitudes cargadas.</p>
              </div>
            </div>

            <!-- PAGINACIÓN -->
            <div v-if="totalPaginas > 1" class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3">
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
                <i class="bi bi-chevron-left"></i> Ant
              </button>
              <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
                Sig <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </template>
        </div>
      </div>

    </div>

    <!-- MODAL AGREGAR / EDITAR SOLICITUD -->
    <ModalBase :show="mostrarModal" @close="cerrarModal" :icono="modoModal === 'editar' ? 'edit' : 'add_circle'" :colorIcono="modoModal === 'editar' ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'" maxWidth="700px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">{{ modoModal === 'editar' ? 'Editar Solicitud' : 'Nueva Solicitud Institucional' }}</span>
        </div>
      </template>

      <div class="d-flex flex-column gap-4">

        <!-- ÁRBITRO/S -->
        <div>
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">
            Árbitro/s <span class="text-danger">*</span>
          </label>
          <input v-model="filtroArbitro" class="form-control form-control-sm shadow-none mb-2" placeholder="Buscar árbitro por apellido o nombre...">
          <div class="border rounded p-2 bg-light" style="max-height: 200px; overflow-y: auto;">
            <div v-for="a in arbitrosFiltrados" :key="a.id" class="form-check">
              <input class="form-check-input shadow-none" type="checkbox" :id="'arb-'+a.id" :value="a.id" v-model="form.arbitros">
              <label class="form-check-label small" :for="'arb-'+a.id">{{ a.apellido }}, {{ a.nombre }}</label>
            </div>
            <p v-if="arbitrosFiltrados.length === 0" class="text-muted small m-0 text-center py-2">Sin resultados.</p>
          </div>
          <span class="text-muted" style="font-size: 0.75rem;">Podés marcar más de uno (por ejemplo, una pareja arbitral).</span>
        </div>

        <!-- TIPO DE SOLICITUD -->
        <div>
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">Solicitud</label>
          <div class="d-flex flex-column flex-sm-row gap-2">
            <button type="button" class="btn btn-sm flex-fill text-start"
                    :class="form.tipo === 'no_designar' ? 'btn-danger text-white shadow-sm' : 'btn-light border'"
                    @click="form.tipo = 'no_designar'">
              No ser designado a un club
            </button>
            <button type="button" class="btn btn-sm flex-fill text-start"
                    :class="form.tipo === 'no_designar_arbitro' ? 'btn-danger text-white shadow-sm' : 'btn-light border'"
                    @click="form.tipo = 'no_designar_arbitro'">
              No ser designado con un árbitro
            </button>
          </div>
        </div>

        <!-- ÁRBITRO A EVITAR (solo tipo no_designar_arbitro) -->
        <div v-if="form.tipo === 'no_designar_arbitro'">
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">
            Árbitro con el que no ser designado <span class="text-danger">*</span>
          </label>
          <input v-model="filtroArbitroPar" class="form-control form-control-sm shadow-none mb-2" placeholder="Buscar árbitro por apellido o nombre...">
          <div class="border rounded p-2 bg-light" style="max-height: 200px; overflow-y: auto;">
            <div v-for="a in arbitrosParFiltrados" :key="'par-'+a.id" class="form-check">
              <input class="form-check-input shadow-none" type="radio" :id="'arbpar-'+a.id" :value="a.id" v-model="form.id_arbitro_par">
              <label class="form-check-label small" :for="'arbpar-'+a.id">{{ a.apellido }}, {{ a.nombre }}</label>
            </div>
            <p v-if="arbitrosParFiltrados.length === 0" class="text-muted small m-0 text-center py-2">Sin resultados.</p>
          </div>
          <span class="text-muted" style="font-size: 0.75rem;">No aplican club, rama ni categorías para este tipo de solicitud.</span>
        </div>

        <!-- CLUB (solo tipo no_designar) -->
        <div v-if="form.tipo === 'no_designar'">
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">
            Club <span class="text-danger">*</span>
          </label>
          <select v-model="form.club_id" class="form-select form-select-sm shadow-none">
            <option value="">Seleccionar club...</option>
            <option v-for="c in clubes" :key="c.club_id" :value="c.club_id">{{ c.club_nombre }}</option>
          </select>
        </div>

        <!-- RAMA (solo tipo no_designar) -->
        <div v-if="form.tipo === 'no_designar'">
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">
            Rama <span class="text-danger">*</span>
          </label>
          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-sm flex-fill"
                    :class="form.rama === 'F' ? 'btn-primary text-white shadow-sm' : 'btn-light border'"
                    @click="form.rama = 'F'">Femenina</button>
            <button type="button" class="btn btn-sm flex-fill"
                    :class="form.rama === 'M' ? 'btn-primary text-white shadow-sm' : 'btn-light border'"
                    @click="form.rama = 'M'">Masculina</button>
          </div>
        </div>

        <!-- CATEGORÍAS (solo tipo no_designar) -->
        <div v-if="form.tipo === 'no_designar'">
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">Categorías</label>

          <div v-if="cargandoCategorias" class="text-center py-3">
            <span class="spinner-border spinner-border-sm text-primary"></span>
            <span class="text-muted small ms-2">Cargando categorías...</span>
          </div>

          <div v-else-if="!form.club_id || !form.rama" class="text-muted small bg-light border rounded p-2 text-center">
            Seleccioná primero un club y una rama.
          </div>

          <div v-else-if="categorias.length === 0" class="text-muted small bg-light border rounded p-2 text-center">
            No hay categorías para este club y rama.
          </div>

          <template v-else>
            <div class="form-check mb-2 border-bottom pb-2">
              <input class="form-check-input shadow-none" type="checkbox" id="cat-todas" v-model="form.todas_categorias">
              <label class="form-check-label small fw-bold text-danger" for="cat-todas">TODAS las categorías</label>
            </div>
            <div class="border rounded p-2 bg-light" style="max-height: 180px; overflow-y: auto;" :class="{ 'opacity-50': form.todas_categorias }">
              <div v-for="c in categorias" :key="c.id" class="form-check">
                <input class="form-check-input shadow-none" type="checkbox" :id="'cat-'+c.id" :value="c.id" v-model="form.categorias" :disabled="form.todas_categorias">
                <label class="form-check-label small" :for="'cat-'+c.id">
                  {{ c.categoria }}<span v-if="c.div_nombre" class="text-muted"> — {{ c.div_nombre }}</span>
                </label>
              </div>
            </div>
          </template>
        </div>

        <!-- VIGENCIA -->
        <div>
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">
            Vigencia de la solicitud <span class="text-danger">*</span>
          </label>
          <div class="row g-2">
            <div class="col-6">
              <label class="form-label small text-muted mb-1">Desde</label>
              <input v-model="form.fecha_desde" type="date" class="form-control form-control-sm shadow-none">
            </div>
            <div class="col-6">
              <label class="form-label small text-muted mb-1">Hasta</label>
              <input v-model="form.fecha_hasta" type="date" class="form-control form-control-sm shadow-none">
            </div>
          </div>
          <span class="text-muted" style="font-size: 0.75rem;">Cuando se cumple la fecha "Hasta", la solicitud pasa a estado CUMPLIDA automáticamente.</span>
        </div>
      </div>

      <template #footer>
        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center w-100">
          <button @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold border w-100 w-sm-auto">CANCELAR</button>
          <button @click="guardarSolicitud" :disabled="guardando" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100 w-sm-auto d-flex align-items-center justify-content-center gap-2">
            <span v-if="guardando" class="spinner-border spinner-border-sm"></span>
            {{ modoModal === 'editar' ? 'GUARDAR CAMBIOS' : 'GUARDAR SOLICITUD' }}
          </button>
        </div>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Solicitudes Institucionales | AAAB',
  meta: [{ name: 'description', content: 'Gestión de solicitudes institucionales de la AAAB.' }],
})

// Sistemas globales (mismos que usa toda la web)
const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

// Wrapper para conservar la firma (mensaje, tipo) usada en este componente
const mostrarToast = (mensaje, tipo = 'success') => {
  toast({
    titulo: tipo === 'danger' ? 'Error' : 'Éxito',
    mensaje,
    tipo
  })
}

// ====================================================
//  ESTADO
// ====================================================
const cargando = ref(false)
const guardando = ref(false)
const solicitudes = ref([])
const arbitros = ref([])
const clubes = ref([])
const categorias = ref([])
const cargandoCategorias = ref(false)

const mostrarModal = ref(false)
const modoModal = ref('nuevo')
const filtroArbitro = ref('')
const filtroArbitroPar = ref('')
const solicitudEnEdicion = ref(null)

const paginaActual = ref(1)
const registrosPorPagina = 8

const formVacio = () => ({
  tipo: 'no_designar',
  arbitros: [],
  id_arbitro_par: null,
  club_id: '',
  rama: '',
  categorias: [],
  todas_categorias: false,
  fecha_desde: '',
  fecha_hasta: '',
})
const form = reactive(formVacio())

// Cuando editamos, el watch de club/rama no debe pisar las categorías ya cargadas
const cargandoDesdeEdicion = ref(false)

// ====================================================
//  HELPERS
// ====================================================
const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const esSolicitudPar = (s) => s.tipo === 'no_designar_arbitro'

const etiquetaRama = (rama) => {
  if (rama === 'F') return 'Femenina'
  if (rama === 'M') return 'Masculina'
  if (rama === 'ambas') return 'Ambas'
  return '-'
}

const claseEstado = (estado) => {
  if (estado === 'creado') return 'bg-warning text-dark'
  if (estado === 'vigente') return 'bg-danger'
  if (estado === 'cumplida') return 'bg-success'
  if (estado === 'borrado') return 'bg-secondary'
  return 'bg-light text-dark border'
}

const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  const partes = String(fecha).split('-')
  if (partes.length !== 3) return fecha
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

// ====================================================
//  COMPUTED
// ====================================================
const arbitrosFiltrados = computed(() => {
  const q = normalizarTexto(filtroArbitro.value)
  if (!q) return arbitros.value
  return arbitros.value.filter(a =>
    normalizarTexto(a.apellido).includes(q) || normalizarTexto(a.nombre).includes(q)
  )
})

// Para el par: mismo listado pero excluyendo a los árbitros solicitantes ya elegidos.
const arbitrosParFiltrados = computed(() => {
  const q = normalizarTexto(filtroArbitroPar.value)
  return arbitros.value.filter(a => {
    if (form.arbitros.includes(a.id)) return false
    if (!q) return true
    return normalizarTexto(a.apellido).includes(q) || normalizarTexto(a.nombre).includes(q)
  })
})

const totalPaginas = computed(() => Math.ceil(solicitudes.value.length / registrosPorPagina) || 1)

const solicitudesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return solicitudes.value.slice(inicio, inicio + registrosPorPagina)
})

// ====================================================
//  CARGA DE DATOS
// ====================================================
const cargarSolicitudes = async () => {
  cargando.value = true
  try {
    const { payload } = await api.get({
      entity: 'solicitudes',
      action: 'obtenerSolicitudes'
    })
    solicitudes.value = payload || []
  } catch (err) {
    console.error('Error al cargar solicitudes:', err)
    mostrarToast('No se pudieron cargar las solicitudes', 'danger')
  } finally {
    cargando.value = false
  }
}

const cargarArbitros = async () => {
  try {
    const { payload } = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    arbitros.value = payload || []
  } catch (err) {
    console.error('Error al cargar árbitros:', err)
  }
}

const cargarClubes = async () => {
  try {
    const { payload } = await api.get({ entity: 'clubes', action: 'obtenerClubes' })
    clubes.value = payload || []
  } catch (err) {
    console.error('Error al cargar clubes:', err)
  }
}

// Categorías linkeadas al club_id (+ rama). El back devuelve [{ id, categoria, division }]
const cargarCategorias = async () => {
  if (!form.club_id || !form.rama) {
    categorias.value = []
    return
  }
  cargandoCategorias.value = true
  try {
    const { payload } = await api.get({
      entity: 'equipos',
      action: 'obtenerCategoriasPorClub',
      payload: { idClub: form.club_id, rama: form.rama }
    })
    categorias.value = payload || []
  } catch (err) {
    console.error('Error al cargar categorías:', err)
    categorias.value = []
    mostrarToast('No se pudieron cargar las categorías', 'danger')
  } finally {
    cargandoCategorias.value = false
  }
}

// Al cambiar club o rama, recargamos categorías y reseteamos la selección previa.
// Si venimos de "editar", no reseteamos (la selección viene de la solicitud).
watch(() => [form.club_id, form.rama], () => {
  if (cargandoDesdeEdicion.value) return
  if (form.tipo !== 'no_designar') return
  form.categorias = []
  form.todas_categorias = false
  cargarCategorias()
})

// ====================================================
//  MODAL ALTA / EDICIÓN
// ====================================================
const abrirModalNueva = () => {
  modoModal.value = 'nuevo'
  solicitudEnEdicion.value = null
  Object.assign(form, formVacio())
  filtroArbitro.value = ''
  categorias.value = []
  mostrarModal.value = true
}

const abrirModalEditar = async (solicitud) => {
  modoModal.value = 'editar'
  solicitudEnEdicion.value = solicitud
  filtroArbitro.value = ''

  filtroArbitroPar.value = ''
  cargandoDesdeEdicion.value = true
  Object.assign(form, {
    tipo: solicitud.tipo || 'no_designar',
    arbitros: (solicitud.arbitros || []).map(a => a.id),
    id_arbitro_par: solicitud.id_arbitro_par ?? null,
    club_id: solicitud.club_id || '',
    rama: solicitud.rama || '',
    categorias: (solicitud.categorias || []).map(c => c.id),
    todas_categorias: !!solicitud.todas_categorias,
    fecha_desde: solicitud.fecha_desde || '',
    fecha_hasta: solicitud.fecha_hasta || '',
  })

  mostrarModal.value = true
  // Solo cargamos categorías si es una solicitud por club/rama
  if (form.tipo === 'no_designar') {
    await cargarCategorias()
  }
  cargandoDesdeEdicion.value = false
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const validarForm = () => {
  if (form.arbitros.length === 0) {
    mostrarToast('Seleccioná al menos un árbitro', 'danger')
    return false
  }
  if (form.tipo === 'no_designar_arbitro') {
    if (!form.id_arbitro_par) {
      mostrarToast('Seleccioná el árbitro con el que no ser designado', 'danger')
      return false
    }
    if (form.arbitros.includes(form.id_arbitro_par)) {
      mostrarToast('El árbitro a evitar no puede ser uno de los solicitantes', 'danger')
      return false
    }
  } else {
    if (!form.club_id) {
      mostrarToast('Seleccioná un club', 'danger')
      return false
    }
    if (!form.rama) {
      mostrarToast('Seleccioná una rama', 'danger')
      return false
    }
    if (!form.todas_categorias && form.categorias.length === 0) {
      mostrarToast('Seleccioná al menos una categoría o marcá TODAS', 'danger')
      return false
    }
  }
  if (!form.fecha_desde || !form.fecha_hasta) {
    mostrarToast('Completá el período de vigencia', 'danger')
    return false
  }
  if (form.fecha_hasta < form.fecha_desde) {
    mostrarToast('La fecha "Hasta" no puede ser anterior a "Desde"', 'danger')
    return false
  }
  return true
}

const guardarSolicitud = async () => {
  if (!validarForm()) return

  guardando.value = true
  const esEdicion = modoModal.value === 'editar'
  const esPar = form.tipo === 'no_designar_arbitro'
  const payload = {
    arbitros: form.arbitros,
    tipo: form.tipo,
    id_arbitro_par: esPar ? form.id_arbitro_par : null,
    club_id: esPar ? null : form.club_id,
    rama: esPar ? null : form.rama,
    todas_categorias: esPar ? false : form.todas_categorias,
    categorias: esPar ? [] : (form.todas_categorias ? [] : form.categorias),
    fecha_desde: form.fecha_desde,
    fecha_hasta: form.fecha_hasta,
  }
  if (esEdicion) payload.id = solicitudEnEdicion.value.id

  try {
    const res = await api.post({
      entity: 'solicitudes',
      action: esEdicion ? 'editarSolicitud' : 'crearSolicitud',
      payload
    })

    if (res?.ok) {
      mostrarToast(esEdicion ? 'Solicitud actualizada correctamente' : 'Solicitud guardada correctamente')
      cerrarModal()
      cargarSolicitudes()
    } else {
      mostrarToast(res?.payload?.mensaje || 'No se pudo guardar la solicitud', 'danger')
    }
  } catch (err) {
    console.error('Error al guardar solicitud:', err)
    mostrarToast('Error al conectar con el servidor', 'danger')
  } finally {
    guardando.value = false
  }
}

// ====================================================
//  ELIMINAR
// ====================================================
const confirmarEliminar = (solicitud) => {
  notificar({
    titulo: '¿Eliminar Solicitud?',
    mensaje: 'Esta acción es irreversible. El registro será borrado permanentemente.',
    tipo: 'danger',
    alConfirmar: async () => {
      const res = await api.post({
        entity: 'solicitudes',
        action: 'eliminarSolicitud',
        payload: { id: solicitud.id }
      })

      if (res?.ok) {
        cargarSolicitudes()
        mostrarToast('Solicitud eliminada correctamente')
      } else {
        mostrarToast(res?.payload?.mensaje || 'No se pudo eliminar la solicitud', 'danger')
      }
    }
  })
}

// ====================================================
//  PAGINACIÓN
// ====================================================
const cambiarPagina = (delta) => {
  paginaActual.value += delta
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, 50)
}

watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal
})

// ====================================================
//  INIT
// ====================================================
onMounted(() => {
  cargarSolicitudes()
  cargarArbitros()
  cargarClubes()
})
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  margin-left: 50%;
  transform: translateX(-50%);
  padding-bottom: 120px;
}

.admin-panel {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

.animate__animated { animation-duration: 0.5s; }

/* ====================================================
   UTILIDADES
   ==================================================== */
.btn-danger-subtle {
  background: #fee2e2;
  color: #dc3545;
  border: 1px solid transparent;
}
.btn-danger-subtle:hover {
  background: #fecaca;
}

/* ====================================================
   TABLA SIN LÍNEAS
   ==================================================== */
.tabla-sin-lineas th,
.tabla-sin-lineas td {
  border-left: none !important;
  border-right: none !important;
}
</style>
