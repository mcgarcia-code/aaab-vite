<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-graph-up-arrow me-1"></i> Recargos de Porcentaje
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ recargosFiltrados.length }} recargos</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerRecargos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="abrirModalNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_circle</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo</span>
            </button>
          </div>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Recargos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>
          <div class="row g-2">
            <div class="col-6 col-md-4">
              <input v-model="filtros.busqueda" class="form-control form-control-sm shadow-none" placeholder="Buscar árbitro o motivo...">
            </div>
            <div class="col-6 col-md-3">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none">
                <option value="">Estado (Todos)</option>
                <option value="activo">Activo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando recargos...</p>
          </div>

          <template v-else>
            <!-- TABLA ESCRITORIO -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.8rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 text-uppercase text-muted">Árbitro</th>
                    <th class="py-3 text-center text-uppercase text-muted">Porcentaje</th>
                    <th class="py-3 text-uppercase text-muted">Motivo</th>
                    <th class="py-3 text-center text-uppercase text-muted">Desde</th>
                    <th class="py-3 text-center text-uppercase text-muted">Hasta</th>
                    <th class="py-3 text-center text-uppercase text-muted">Estado</th>
                    <th class="py-3 text-center text-uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in recargosPaginados" :key="r.id">
                    <td class="fw-bold text-dark text-uppercase">{{ r.arbitro }}</td>
                    <td class="text-center fw-bold text-danger">{{ r.porcentaje }} %</td>
                    <td class="text-muted"><div class="text-truncate" style="max-width: 320px;" :title="r.motivo">{{ r.motivo }}</div></td>
                    <td class="text-center">{{ r.fecha_desde }}</td>
                    <td class="text-center">{{ r.fecha_hasta || '-' }}</td>
                    <td class="text-center">
                      <span :class="['badge-status-sm', estaActivo(r) ? 'activo' : 'finalizado']">{{ estaActivo(r) ? 'ACTIVO' : 'FINALIZADO' }}</span>
                    </td>
                    <td class="text-center">
                      <button v-if="estaActivo(r)" @click="confirmarFinalizar(r)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Finalizar">
                        <span class="material-icons" style="font-size:16px;">block</span>
                      </button>
                      <span v-else class="text-muted small">—</span>
                    </td>
                  </tr>
                  <tr v-if="recargosPaginados.length === 0">
                    <td colspan="7" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">search_off</span>
                      <p class="m-0 fw-bold">No se encontraron recargos.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS MOBILE -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="r in recargosPaginados" :key="'mob-'+r.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1rem;">{{ r.arbitro }}</div>
                  <span :class="['badge-status-sm', estaActivo(r) ? 'activo' : 'finalizado']">{{ estaActivo(r) ? 'ACTIVO' : 'FINALIZADO' }}</span>
                </div>
                <div class="card-body pt-1 px-3 pb-3">
                  <div class="fw-bold text-danger fs-6 mb-2">{{ r.porcentaje }} %</div>
                  <p class="text-muted small mb-3">{{ r.motivo }}</p>
                  <div class="bg-light p-2 rounded border d-flex justify-content-between align-items-center mb-3">
                    <span class="small text-muted">Desde: <strong class="text-dark">{{ r.fecha_desde }}</strong></span>
                    <span class="small text-muted">Hasta: <strong class="text-dark">{{ r.fecha_hasta || '-' }}</strong></span>
                  </div>
                  <button v-if="estaActivo(r)" @click="confirmarFinalizar(r)" class="btn btn-sm btn-outline-danger w-100 fw-bold">
                    <span class="material-icons" style="font-size: 16px;">block</span> Finalizar
                  </button>
                </div>
              </div>
              <div v-if="recargosPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <p class="text-muted m-0 fw-bold">No se encontraron recargos.</p>
              </div>
            </div>

            <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
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

    <ModalBase :show="mostrarModal" @close="mostrarModal = false" icono="graph_up_arrow" colorIcono="bg-success-subtle text-success" maxWidth="550px">
      <template #header>
        <span class="fw-bold fs-5">Nuevo Recargo de Porcentaje</span>
      </template>

      <form id="formRecargo" @submit.prevent="confirmarGuardado" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Árbitro *</label>
            <select v-model="form.id_arbitro" class="form-select shadow-none border-secondary-subtle" required>
              <option value="" disabled>Seleccione un árbitro...</option>
              <option v-for="a in arbitros" :key="a.id" :value="a.id">{{ a.apellido }}, {{ a.nombre }}</option>
            </select>
          </div>
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Porcentaje (%) *</label>
            <input v-model.number="form.porcentaje" type="number" step="0.01" min="0" class="form-control shadow-none border-secondary-subtle" required>
          </div>
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Motivo *</label>
            <textarea v-model="form.motivo" rows="2" class="form-control shadow-none border-secondary-subtle" placeholder="Deuda acumulada, decisión administrativa, etc." required></textarea>
          </div>
          <div class="col-6">
            <label class="small fw-bold text-dark mb-1">Desde</label>
            <input v-model="form.fecha_desde" type="date" class="form-control shadow-none border-secondary-subtle">
          </div>
          <div class="col-6">
            <label class="small fw-bold text-dark mb-1">Hasta (opcional)</label>
            <input v-model="form.fecha_hasta" type="date" class="form-control shadow-none border-secondary-subtle">
            <span class="text-muted small">Vacío = indefinido</span>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formRecargo" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : 'CREAR RECARGO' }}
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject, watch } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({ title: 'Recargos de Porcentaje | AAAB' })

const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const cargando = ref(false)
const procesando = ref(false)
const recargos = ref([])
const arbitros = ref([])

const mostrarFiltrosMobile = ref(false)
const filtros = reactive({ busqueda: '', estado: '' })
const paginaActual = ref(1)
const registrosPorPagina = 10

const mostrarModal = ref(false)
const formBase = () => ({ id_arbitro: '', porcentaje: null, motivo: '', fecha_desde: new Date().toISOString().slice(0, 10), fecha_hasta: '' })
const form = reactive(formBase())

const normalizar = (t) => t ? t.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : ''

const estaActivo = (r) => {
  if (!r.activo || Number(r.activo) === 0) return false
  if (!r.fecha_hasta) return true
  return new Date(r.fecha_hasta) >= new Date(new Date().toISOString().slice(0, 10))
}

const recargosFiltrados = computed(() => {
  return recargos.value.filter(r => {
    const matchBusqueda = normalizar(`${r.arbitro} ${r.motivo}`).includes(normalizar(filtros.busqueda))
    let matchEstado = true
    if (filtros.estado === 'activo') matchEstado = estaActivo(r)
    if (filtros.estado === 'finalizado') matchEstado = !estaActivo(r)
    return matchBusqueda && matchEstado
  }).sort((a, b) => b.id - a.id)
})

const totalPaginas = computed(() => Math.ceil(recargosFiltrados.value.length / registrosPorPagina) || 1)
const recargosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return recargosFiltrados.value.slice(inicio, inicio + registrosPorPagina)
})

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevo) => { if (paginaActual.value > nuevo) paginaActual.value = nuevo })

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  setTimeout(() => { if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' }) }, 50)
}

const limpiarFiltros = () => { filtros.busqueda = ''; filtros.estado = '' }

const obtenerRecargos = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'tesoreria', action: 'obtenerOverridesPorcentaje', payload: {} })
    if (res.ok) recargos.value = Array.isArray(res.payload) ? res.payload : []
  } finally {
    cargando.value = false
  }
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    let lista = Array.isArray(res) ? res : (res.payload ?? [])
    lista.sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`))
    arbitros.value = lista
  } catch (err) {
    console.error('Error cargando árbitros:', err)
  }
}

const abrirModalNuevo = () => {
  Object.assign(form, formBase())
  mostrarModal.value = true
}

const confirmarGuardado = () => {
  notificar({
    titulo: 'Crear recargo?',
    mensaje: 'Se aplicará un recargo de porcentaje sobre el aporte de este árbitro y se le notificará.',
    tipo: 'success',
    alConfirmar: guardarRecargo
  })
}

const guardarRecargo = async () => {
  procesando.value = true
  try {
    const res = await api.post({
      entity: 'tesoreria',
      action: 'crearOverridePorcentaje',
      payload: {
        id_arbitro: form.id_arbitro,
        porcentaje: form.porcentaje,
        motivo: form.motivo,
        fecha_desde: form.fecha_desde || undefined,
        fecha_hasta: form.fecha_hasta || undefined
      }
    })
    if (res.ok && res.payload?.success !== false) {
      mostrarModal.value = false
      await obtenerRecargos()
      toast({ titulo: 'Éxito', mensaje: 'El recargo se creó y se notificó al árbitro.', tipo: 'success' })
    } else {
      toast({ titulo: 'Error', mensaje: res.payload?.message || res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

const confirmarFinalizar = (r) => {
  notificar({
    titulo: 'Finalizar recargo?',
    mensaje: `Se dará por finalizado el recargo de ${r.arbitro} a partir de hoy.`,
    tipo: 'danger',
    alConfirmar: () => finalizar(r.id)
  })
}

const finalizar = async (id) => {
  const res = await api.post({ entity: 'tesoreria', action: 'finalizarOverridePorcentaje', payload: { id } })
  if (res.ok) {
    obtenerRecargos()
    toast({ titulo: 'Finalizado', mensaje: 'El recargo fue dado de baja.', tipo: 'success' })
  }
}

onMounted(() => {
  obtenerRecargos()
  cargarArbitros()
})
</script>

<style scoped>
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

.badge-status-sm {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-block;
  text-align: center;
  border: 1px solid;
}
.badge-status-sm.activo { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.badge-status-sm.finalizado { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }

.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.animate__animated { animation-duration: 0.5s; }
</style>
