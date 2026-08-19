<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-building me-1"></i> Gestión de Instituciones
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ totalFiltrados }} clubes</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Recargar (Agregado aquí respetando diseño) -->
            <button @click="cargarDatos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <!-- Botón Filtros (Solo Móvil) -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="crearNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">domain_add</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo Club</span>
            </button>

            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Instituciones</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-12 col-md-3">
              <input v-model="filtros.club" class="form-control form-control-sm shadow-none" placeholder="Buscar club...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.forma_de_pago" class="form-control form-control-sm shadow-none" placeholder="Forma de pago...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.cuit" class="form-control form-control-sm shadow-none" placeholder="CUIT...">
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.condicion" class="form-select form-select-sm shadow-none">
                <option value="">Condición IVA (Todas)</option>
                <option value="Consumidor Final">Consumidor Final</option>
                <option value="Exento">Exento</option>
                <option value="Responsable Inscripto">Resp. Inscripto</option>
                <option value="Inscripto">Inscripto</option>
                <option value="Monotributo">Monotributo</option>
              </select>
            </div>
            <div class="col-6 col-md-3">
              <input v-model="filtros.email" class="form-control form-control-sm shadow-none" placeholder="Email...">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando datos...</p>
          </div>

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem; table-layout: fixed;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 90px;">Acciones</th>
                    <th class="py-3 text-uppercase text-muted col-fija col-club" style="width: 220px;">Club / Institución</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 150px;">Forma de Pago</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 150px;">CUIT</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 200px;">Condición IVA</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 250px;">Email</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 150px;">Celular</th>
                  </tr>
                  <!-- NOTA: Filtros y botón dentro de la tabla ELIMINADOS según tu petición -->
                </thead>
                <tbody>
                  <tr v-for="inst in institucionesPaginadas" :key="inst.id">
                    <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ inst.id }}</td>
                    <td class="text-center col-fija col-acciones">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="editarInstitucion(inst)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar institución">
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button @click="confirmarEliminacion(inst.id)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Eliminar institución">
                          <span class="material-icons" style="font-size:16px;">delete</span>
                        </button>
                      </div>
                    </td>
                    <td class="text-dark fw-bold col-fija col-club text-truncate" :title="inst.club">{{ inst.club }}</td>
                    <td class="text-dark">
                      <span v-if="inst.forma_de_pago" class="badge bg-info-subtle text-primary border">{{ inst.forma_de_pago }}</span>
                      <span v-else>-</span>
                    </td>
                    <td class="text-dark">{{ inst.cuit || '-' }}</td>
                    <td>
                      <span class="badge bg-light text-dark border">{{ inst.condicion || 'No especificada' }}</span>
                    </td>
                    <td class="text-dark">{{ inst.email || '-' }}</td>
                    <td class="text-dark">{{ inst.celular || '-' }}</td>
                  </tr>
                  <tr v-if="institucionesPaginadas.length === 0">
                    <td colspan="8" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">domain_disabled</span>
                      <p class="m-0 fw-bold">No se encontraron instituciones.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="inst in institucionesPaginadas" :key="'mob-'+inst.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-header bg-white border-bottom-0 pb-2 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold d-flex align-items-center gap-2" style="font-size: 1.05rem;">
                    <span class="material-icons text-primary" style="font-size: 20px;">domain</span>
                    {{ inst.club }}
                  </div>
                  <div class="small text-muted fw-bold font-monospace mt-1">#{{ inst.id }}</div>
                </div>

                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex flex-column gap-2 bg-light p-2 rounded border mb-3 border-light-subtle">
                    <div class="d-flex justify-content-between">
                      <span class="text-dark small"><strong>CUIT:</strong> {{ inst.cuit || '-' }}</span>
                      <span class="text-dark small"><strong>IVA:</strong> {{ inst.condicion || '-' }}</span>
                    </div>
                    <div class="d-flex justify-content-between border-top pt-2 mt-1 border-light-subtle">
                      <span class="text-dark small"><strong>Pago:</strong> <span class="badge bg-info-subtle text-primary">{{ inst.forma_de_pago || '-' }}</span></span>
                    </div>
                  </div>

                  <div class="mb-3 border-bottom pb-2 border-secondary-subtle">
                    <p v-if="inst.email" class="mb-1 small text-truncate"><strong class="text-dark">Email:</strong> {{ inst.email }}</p>
                    <p v-if="inst.celular" class="mb-0 small"><strong class="text-dark">Celular:</strong> {{ inst.celular }}</p>
                  </div>

                  <div class="d-flex gap-2">
                    <button @click="editarInstitucion(inst)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                      <span class="material-icons" style="font-size: 16px;">edit</span> EDITAR
                    </button>
                    <button @click="confirmarEliminacion(inst.id)" class="btn btn-sm btn-outline-danger shadow-sm px-3 d-flex justify-content-center align-items-center">
                      <span class="material-icons" style="font-size: 18px;">delete</span>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="institucionesPaginadas.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border border-light-subtle mt-2">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">domain_disabled</span>
                <p class="text-muted mt-2 mb-0 fw-bold">Sin resultados</p>
              </div>
            </div>

            <!-- PAGINACIÓN -->
            <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
                <i class="bi bi-chevron-left"></i> Ant
              </button>
              <span class="fw-bold text-dark small">
                Página {{ paginaActual }} de {{ totalPaginas }}
              </span>
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
                Sig <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- ==============================================
         MODALES
         ============================================== -->

    <ModalBase
      :show="mostrarModal"
      @close="cerrarModal"
      :icono="modoModal === 'editar' ? 'domain' : 'domain_add'"
      :colorIcono="modoModal === 'editar' ? 'bg-info-subtle text-primary' : 'bg-success-subtle text-success'"
      maxWidth="600px"
    >
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">{{ modoModal === 'editar' ? 'Editar Institución' : 'Registrar Nueva Institución' }}</span>
          <div v-if="modoModal === 'editar'" class="text-muted small mt-1" style="font-size: 0.85rem;">
            {{ formModal.club }} (ID #{{ formModal.id }})
          </div>
        </div>
      </template>

      <form id="formInstitucion" @submit.prevent="guardarDatos" class="text-start mt-2">
        <div class="row g-3">
          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-0">Datos de la Institución</div>

          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Nombre del Club / Institución *</label>
            <input v-model="formModal.club" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: Club Atlético..." required>
          </div>

          <!-- SECCIÓN: FORMA DE PAGO -->
          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">Forma de Pago</label>
            <select v-model="tipoPagoSelect" class="form-select shadow-none border-secondary-subtle">
              <option value="">Seleccionar...</option>
              <option value="Cancha">Cancha</option>
              <option value="Contrafactura">Contrafactura</option>
              <option value="Otro">Otro (Especificar)</option>
            </select>
          </div>

          <div class="col-md-6" v-if="tipoPagoSelect === 'Otro'">
            <label class="small fw-bold text-dark mb-1">Especificar *</label>
            <input v-model="tipoPagoOtro" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: Consultar en cancha" required>
          </div>
          <!-- FIN SECCIÓN: FORMA DE PAGO -->

          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">CUIT *</label>
            <input v-model="formModal.cuit" class="form-control shadow-none border-secondary-subtle" placeholder="Sin guiones" required>
          </div>

          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">Condición frente al IVA</label>
            <select v-model="formModal.condicion" class="form-select shadow-none border-secondary-subtle">
              <option value="">Seleccionar...</option>
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="Exento">Exento</option>
              <option value="Responsable Inscripto">Responsable Inscripto</option>
              <option value="Inscripto">Inscripto</option>
              <option value="Monotributo">Monotributo</option>
            </select>
          </div>

          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-4">Contacto</div>

          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">Email Institucional</label>
            <input v-model="formModal.email" type="email" class="form-control shadow-none border-secondary-subtle" placeholder="correo@club.com">
          </div>

          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">Celular / Teléfono</label>
            <input v-model="formModal.celular" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: 11 1234-5678">
          </div>
        </div>
      </form>

      <template #footer>
        <div class="w-100 d-flex justify-content-center gap-3">
          <button type="button" @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold border w-50">CANCELAR</button>

          <button type="submit" form="formInstitucion" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-50" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
            {{ modoModal === 'editar' ? 'GUARDAR CAMBIOS' : 'CREAR INSTITUCIÓN' }}
          </button>
        </div>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import ExcelJS from 'exceljs'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Instituciones y Cuits | AAAB',
  meta: [{ name: 'description', content: 'Gestión de Instituciones y Clubes.' }],
})

const notificar = inject('notificar')

const instituciones = ref([])
const filtros = reactive({ club: '', forma_de_pago: '', cuit: '', condicion: '', email: '', celular: '' })
const cargando = ref(false)
const paginaActual = ref(1)
const registrosPorPagina = 10

const mostrarModal = ref(false)
const modoModal = ref('nuevo')

const mostrarFiltrosMobile = ref(false)

const tipoPagoSelect = ref('')
const tipoPagoOtro = ref('')

const formModalVacio = () => ({
  id: null,
  club: '',
  forma_de_pago: '',
  cuit: '',
  condicion: '',
  email: '',
  celular: ''
})

const formModal = ref(formModalVacio())

const cargarDatos = async () => {
  cargando.value = true // Habilita el spinner al iniciar
  try {
    const res = await api.get({ entity: 'facturacion', action: 'getInstitucionesCuit' })
    if (res.payload) {
      instituciones.value = res.payload
    }
  } catch (err) { console.error('Error al cargar instituciones:', err) }
  finally {
    cargando.value = false // Detiene el spinner al finalizar
  }
}

const crearNuevo = () => {
  formModal.value = formModalVacio()
  tipoPagoSelect.value = ''
  tipoPagoOtro.value = ''
  modoModal.value = 'nuevo'
  mostrarModal.value = true
}

const editarInstitucion = (inst) => {
  formModal.value = { ...inst }

  if (inst.forma_de_pago === 'Cancha' || inst.forma_de_pago === 'Contrafactura') {
    tipoPagoSelect.value = inst.forma_de_pago;
    tipoPagoOtro.value = '';
  } else if (inst.forma_de_pago) {
    tipoPagoSelect.value = 'Otro';
    tipoPagoOtro.value = inst.forma_de_pago;
  } else {
    tipoPagoSelect.value = '';
    tipoPagoOtro.value = '';
  }

  modoModal.value = 'editar'
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
}

const guardarDatos = async () => {
  if (!formModal.value.club || !formModal.value.cuit) {
    notificar({ titulo: 'Faltan datos', mensaje: 'El Nombre del Club y el CUIT son obligatorios.', tipo: 'danger' })
    return
  }

  formModal.value.forma_de_pago = tipoPagoSelect.value === 'Otro' ? tipoPagoOtro.value : tipoPagoSelect.value;

  cargando.value = true
  try {
    const action = modoModal.value === 'nuevo' ? 'guardarInstitucion' : 'editarInstitucion'
    const res = await api.post({
      entity: 'facturacion',
      action: action,
      payload: formModal.value
    })

    if (res.ok || res.success) {
      notificar({ titulo: '¡Éxito!', mensaje: `Institución ${modoModal.value === 'nuevo' ? 'creada' : 'actualizada'} correctamente.`, tipo: 'success' })
      mostrarModal.value = false
      await cargarDatos()
    } else {
      notificar({ titulo: 'Error', mensaje: res.message || 'Error al guardar la institución.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error Fatal', mensaje: 'Error al conectar con el servidor.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const confirmarEliminacion = (id) => {
  notificar({
    titulo: '¿Eliminar Institución?',
    mensaje: 'Esta acción ocultará el club del sistema.',
    tipo: 'danger',
    alConfirmar: () => eliminarInstitucion(id)
  })
}

const eliminarInstitucion = async (id) => {
  try {
    const res = await api.post({ entity: 'facturacion', action: 'eliminarInstitucion', payload: { id } })
    if (res.ok || res.success) {
      notificar({ titulo: 'Eliminado', mensaje: 'La institución fue eliminada.', tipo: 'success' })
      await cargarDatos()
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'No se pudo eliminar.', tipo: 'danger' })
  }
}

const limpiarFiltros = () => {
  Object.keys(filtros).forEach(key => (filtros[key] = ''))
}

const normalizarTexto = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const exportarExcel = async () => {
  const datos = institucionesFiltradas.value.map(i => ({
    ID: i.id,
    Club: i.club,
    FormaPago: i.forma_de_pago,
    CUIT: i.cuit,
    Condicion: i.condicion,
    Email: i.email,
    Celular: i.celular
  }))

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Instituciones')

  const claves = Object.keys(datos[0] || {})
  ws.columns = claves.map(clave => ({ header: clave, key: clave, width: 18 }))
  datos.forEach(fila => ws.addRow(fila))
  if (claves.length) ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Listado_Instituciones_AAAB.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

const institucionesFiltradas = computed(() => {
  const filtrados = instituciones.value.filter(inst =>
    Object.keys(filtros).every(key => {
      if (!filtros[key]) return true
      return normalizarTexto(inst[key]).includes(normalizarTexto(filtros[key]))
    })
  )

  return filtrados.sort((a, b) => String(a.club || '').localeCompare(String(b.club || ''), 'es'))
})

const totalPaginas = computed(() => Math.ceil(institucionesFiltradas.value.length / registrosPorPagina) || 1)
const institucionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return institucionesFiltradas.value.slice(inicio, inicio + registrosPorPagina)
})
const totalFiltrados = computed(() => institucionesFiltradas.value.length)

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevoTotal) => { if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal })

onMounted(() => {
  cargarDatos()
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

/* ====================================================
   UTILIDADES
   ==================================================== */
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.animate__animated { animation-duration: 0.5s; }

/* ====================================================
   TABLA CON COLUMNAS FIJAS Y SIN LÍNEAS
   ==================================================== */
.tabla-sin-lineas th,
.tabla-sin-lineas td {
  border-left: none !important;
  border-right: none !important;
}

.tabla-fija {
  border-collapse: separate;
  border-spacing: 0;
}

@media (min-width: 768px) {
  /* Columnas fijas base */
  .col-fija {
    position: sticky !important;
    background-color: inherit;
    z-index: 10;
  }

  /* Fondo thead y Z-INDEX 12 (Tapa el scroll vertical) */
  .tabla-fija thead .col-fija {
    background-color: #f8f9fa !important;
    z-index: 12;
  }

  /* Fondo tbody */
  .tabla-fija tbody .col-fija {
    background-color: #ffffff !important;
  }

/* Posiciones exactas corregidas para evitar la línea blanca */
  .col-id       { left: 0; min-width: 50px; max-width: 50px; }
  .col-acciones { left: 50px; min-width: 90px; max-width: 90px; }
  .col-club     {
    left: 140px; /* 50 + 90 = 140 */
    min-width: 220px;
    max-width: 220px;
    box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); /* Sombra para separar del resto de la tabla */
  }
}
</style>
