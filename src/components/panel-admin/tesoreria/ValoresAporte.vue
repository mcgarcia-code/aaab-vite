<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-currency-dollar me-1"></i> Valores y Porcentaje de Aporte
            </h4>
            <span class="text-muted small d-block mt-1">Valores vigentes hoy. Editar abre un nuevo período de vigencia.</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="cargarTodo" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 bg-white">

          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando valores...</p>
          </div>

          <template v-else>
            <h6 class="fw-bold text-dark text-uppercase small mb-3">Otros conceptos</h6>
            <div class="valores-grid mb-4">
              <div v-for="c in conceptosFijos" :key="c.clave" class="valor-tile">
                <div class="tile-icono"><i :class="c.icono"></i></div>
                <div class="tile-nombre">{{ c.etiqueta }}</div>
                <div class="tile-valor" :class="{ 'text-muted': c.valor === null }">
                  {{ c.valor !== null ? formatearValor(c) : 'Sin definir' }}
                </div>
                <div class="tile-acciones">
                  <button @click="abrirModalEditar(c.clave, null, c.etiqueta)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary flex-grow-1 d-flex justify-content-center align-items-center gap-1">
                    <span class="material-icons" style="font-size:16px;">edit</span>
                    <span class="fw-bold small d-none d-sm-inline">Editar</span>
                  </button>
                  <button @click="abrirModalHistorial(c.clave, null, c.etiqueta)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-secondary flex-grow-1 d-flex justify-content-center align-items-center gap-1">
                    <span class="material-icons" style="font-size:16px;">history</span>
                    <span class="fw-bold small d-none d-sm-inline">Historial</span>
                  </button>
                </div>
              </div>
            </div>

            <h6 class="fw-bold text-dark text-uppercase small mb-3">Valor de partido por categoría</h6>
            <div v-if="valoresPartido.length === 0" class="text-center p-4 bg-light rounded shadow-sm border">
              <p class="text-muted m-0 fw-bold">No hay categorías activas cargadas.</p>
            </div>
            <div v-else class="valores-grid">
              <div v-for="cat in valoresPartido" :key="cat.id" class="valor-tile">
                <div class="tile-icono"><i class="bi bi-tag"></i></div>
                <div class="tile-nombre text-truncate" :title="cat.nombre_completo">{{ cat.nombre_completo }}</div>
                <div class="tile-valor" :class="{ 'text-muted': cat.valor === null && !cat.exento }">
                  <span v-if="cat.exento" class="badge bg-secondary fw-bold">EXENTA</span>
                  <span v-else>{{ cat.valor !== null ? formatearMonto(cat.valor) : 'Sin definir' }}</span>
                </div>
                <div class="tile-acciones">
                  <button @click="abrirModalEditar('valor_partido', cat.id, cat.nombre_completo)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary flex-grow-1 d-flex justify-content-center align-items-center gap-1">
                    <span class="material-icons" style="font-size:16px;">edit</span>
                    <span class="fw-bold small d-none d-sm-inline">Editar</span>
                  </button>
                  <button @click="abrirModalHistorial('valor_partido', cat.id, cat.nombre_completo)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-secondary flex-grow-1 d-flex justify-content-center align-items-center gap-1">
                    <span class="material-icons" style="font-size:16px;">history</span>
                    <span class="fw-bold small d-none d-sm-inline">Historial</span>
                  </button>
                </div>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- MODAL EDITAR -->
    <ModalBase :show="mostrarModalEditar" @close="mostrarModalEditar = false" icono="edit" colorIcono="bg-info-subtle text-info" maxWidth="500px">
      <template #header>
        <span class="fw-bold fs-5">Editar Valor</span>
      </template>

      <p class="text-muted small mb-3">{{ formEdicion.etiqueta }}</p>

      <form id="formValor" @submit.prevent="confirmarGuardado" class="text-start">
        <div v-if="formEdicion.concepto === 'valor_partido'" class="form-check bg-light p-2 rounded border d-flex align-items-center gap-2 mb-3">
          <input class="form-check-input m-0 shadow-none" type="checkbox" v-model="formEdicion.exento" id="checkExento">
          <label class="form-check-label small fw-bold text-dark m-0" for="checkExento" style="cursor: pointer;">
            Categoría exenta de aporte (no genera débito de arbitraje)
          </label>
        </div>

        <template v-if="!(formEdicion.concepto === 'valor_partido' && formEdicion.exento)">
          <label class="small fw-bold text-dark mb-1">{{ formEdicion.concepto === 'porcentaje_aporte' ? 'Porcentaje (%) *' : 'Monto ($) *' }}</label>
          <input v-model.number="formEdicion.valor" type="number" step="0.01" min="0" class="form-control shadow-none border-secondary-subtle" required>
        </template>

        <span class="text-muted small d-block mt-2">El valor anterior queda registrado en el historial con fecha de fin hoy.</span>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModalEditar = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formValor" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : 'GUARDAR' }}
        </button>
      </template>
    </ModalBase>

    <!-- MODAL HISTORIAL -->
    <ModalBase :show="mostrarModalHistorial" @close="mostrarModalHistorial = false" icono="history" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="600px">
      <template #header>
        <span class="fw-bold fs-5">Historial: {{ historialEtiqueta }}</span>
      </template>

      <div v-if="cargandoHistorial" class="text-center py-4">
        <span class="spinner-border text-warning"></span>
      </div>
      <div v-else-if="historial.length === 0" class="text-center py-4 text-muted">
        <span class="material-icons d-block mb-2 fs-1 opacity-50">history_toggle_off</span>
        <p class="mb-0 fw-bold">Sin registros previos.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table table-sm table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th class="text-uppercase text-muted small">Valor</th>
              <th class="text-uppercase text-muted small">Desde</th>
              <th class="text-uppercase text-muted small">Hasta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in historial" :key="h.id">
              <td class="fw-bold">
                <span v-if="h.concepto === 'valor_partido' && Number(h.exento) === 1" class="badge bg-secondary">EXENTA</span>
                <span v-else>{{ h.concepto === 'porcentaje_aporte' ? h.valor + ' %' : formatearMonto(h.valor) }}</span>
              </td>
              <td>{{ h.fecha_desde }}</td>
              <td>{{ h.fecha_hasta || 'Vigente' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <button @click="mostrarModalHistorial = false" class="btn btn-light border rounded-pill px-4 fw-bold shadow-sm w-100">CERRAR</button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({ title: 'Valores y Porcentaje de Aporte | AAAB' })

const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const cargando = ref(false)
const procesando = ref(false)
const cargandoHistorial = ref(false)

const categorias = ref([])
const valoresVigentes = ref([])

const conceptosFijos = computed(() => ([
  { clave: 'valor_observador', etiqueta: 'Valor por Observación', icono: 'bi bi-eye', valor: buscarValor('valor_observador', null) },
  { clave: 'valor_mesa_arbitral', etiqueta: 'Valor Mesa Arbitral', icono: 'bi bi-clipboard-data', valor: buscarValor('valor_mesa_arbitral', null) },
  { clave: 'valor_delegado', etiqueta: 'Valor Delegado', icono: 'bi bi-person-badge', valor: buscarValor('valor_delegado', null) },
  { clave: 'porcentaje_aporte', etiqueta: 'Porcentaje de Aporte Global', icono: 'bi bi-percent', valor: buscarValor('porcentaje_aporte', null) },
]))

const valoresPartido = computed(() => {
  return categorias.value.map(cat => {
    const registro = buscarRegistro('valor_partido', cat.id)
    return {
      ...cat,
      valor: registro ? Number(registro.valor) : null,
      exento: registro ? Number(registro.exento) === 1 : false
    }
  })
})

function buscarRegistro(concepto, idCategoria) {
  return valoresVigentes.value.find(v => v.concepto === concepto && Number(v.id_categoria) === Number(idCategoria || 0)) || null
}

function buscarValor(concepto, idCategoria) {
  const encontrado = buscarRegistro(concepto, idCategoria)
  return encontrado ? Number(encontrado.valor) : null
}

const formatearMonto = (valor) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(valor)
}

const formatearValor = (c) => {
  return c.clave === 'porcentaje_aporte' ? `${c.valor} %` : formatearMonto(c.valor)
}

const cargarCategorias = async () => {
  const res = await api.get({ entity: 'tesoreria', action: 'obtenerCategoriasEquipos', payload: {} })
  if (res.ok) categorias.value = Array.isArray(res.payload) ? res.payload : []
}

const cargarValores = async () => {
  const res = await api.get({ entity: 'tesoreria', action: 'obtenerValoresVigentes', payload: {} })
  if (res.ok) valoresVigentes.value = Array.isArray(res.payload) ? res.payload : []
}

const cargarTodo = async () => {
  cargando.value = true
  try {
    await Promise.all([cargarCategorias(), cargarValores()])
  } finally {
    cargando.value = false
  }
}

// --- Modal Editar ---
const mostrarModalEditar = ref(false)
const formEdicion = reactive({ concepto: '', id_categoria: null, etiqueta: '', valor: null, exento: false })

const abrirModalEditar = (concepto, idCategoria, etiqueta) => {
  const registro = buscarRegistro(concepto, idCategoria)
  formEdicion.concepto = concepto
  formEdicion.id_categoria = idCategoria
  formEdicion.etiqueta = etiqueta
  formEdicion.valor = registro ? Number(registro.valor) : null
  formEdicion.exento = concepto === 'valor_partido' && registro ? Number(registro.exento) === 1 : false
  mostrarModalEditar.value = true
}

const confirmarGuardado = () => {
  notificar({
    titulo: 'Guardar nuevo valor?',
    mensaje: 'El valor vigente actual quedará cerrado y se aplicará el nuevo a partir de hoy.',
    tipo: 'success',
    alConfirmar: guardarValor
  })
}

const guardarValor = async () => {
  procesando.value = true
  try {
    const esExenta = formEdicion.concepto === 'valor_partido' && formEdicion.exento
    const res = await api.post({
      entity: 'tesoreria',
      action: 'actualizarValor',
      payload: {
        concepto: formEdicion.concepto,
        id_categoria: formEdicion.id_categoria,
        valor: esExenta ? 0 : formEdicion.valor,
        exento: esExenta ? 1 : 0
      }
    })
    if (res.ok && res.payload !== false) {
      mostrarModalEditar.value = false
      await cargarValores()
      toast({ titulo: 'Éxito', mensaje: 'El valor se actualizó correctamente.', tipo: 'success' })
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'No pudo guardarse el valor.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

// --- Modal Historial ---
const mostrarModalHistorial = ref(false)
const historial = ref([])
const historialEtiqueta = ref('')

const abrirModalHistorial = async (concepto, idCategoria, etiqueta) => {
  historialEtiqueta.value = etiqueta
  mostrarModalHistorial.value = true
  cargandoHistorial.value = true
  historial.value = []
  try {
    const res = await api.get({
      entity: 'tesoreria',
      action: 'obtenerHistorialValores',
      payload: { concepto, id_categoria: idCategoria }
    })
    if (res.ok) historial.value = Array.isArray(res.payload) ? res.payload : []
  } finally {
    cargandoHistorial.value = false
  }
}

onMounted(cargarTodo)
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

.valores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.valor-tile {
  position: relative;
  background: #1e293b;
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.15s ease, border-color 0.15s ease;
  color: #f1f5f9;
}

.valor-tile:hover {
  transform: translateY(-2px);
  border-color: rgba(220, 53, 69, 0.5);
}

.tile-icono {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #dc2626;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.tile-nombre {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.85;
  margin-bottom: 6px;
}

.tile-valor {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 14px;
}

.tile-acciones {
  display: flex;
  gap: 6px;
  border-top: 0.5px solid rgba(255, 255, 255, 0.08);
  padding-top: 12px;
}

.animate__animated { animation-duration: 0.5s; }
</style>
