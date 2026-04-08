<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="header-section shadow-sm">
        <div class="header-info">
          <h2 class="title">Gestión de Instituciones</h2>
          <span class="counter">Total: {{ totalFiltrados }} clubes</span>
        </div>

        <div class="header-actions">
          <!-- BOTÓN FILTRO (SOLO MOBILE) -->
          <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex" title="Mostrar Filtros">
            <span class="material-icons">filter_alt</span> <span class="btn-text">Filtros</span>
          </button>

          <button @click="limpiarFiltros" class="btn-action btn-clear" title="Limpiar Filtros">
            <span class="material-icons">filter_alt_off</span> <span class="btn-text">Limpiar</span>
          </button>
          <button @click="crearNuevo" class="btn-action btn-clear-checks" title="Nuevo Club">
            <span class="material-icons">domain_add</span> <span class="btn-text">Nuevo Club</span>
          </button>
          <button @click="exportarExcel" class="btn-action btn-export" title="Exportar Excel">
            <span class="material-icons">download</span> <span class="btn-text">Excel</span>
          </button>
        </div>
      </div>

      <!-- PANEL DE FILTROS DESPLEGABLE (SOLO MOBILE) -->
      <div v-if="mostrarFiltrosMobile" class="mobile-only mb-3 animate__animated animate__fadeInDown animate__faster">
        <div class="bg-white p-3 rounded shadow-sm border border-light-subtle">
          <label class="small fw-bold mb-2 d-block text-muted text-uppercase">Filtrar Instituciones</label>
          <input v-model="filtros.club" class="filter-input-mobile mb-2" placeholder="Buscar club...">
          <div class="row g-2">
            <div class="col-6"><input v-model="filtros.cuit" class="filter-input-mobile" placeholder="CUIT..."></div>
            <div class="col-6"><input v-model="filtros.condicion" class="filter-input-mobile" placeholder="IVA..."></div>
            <div class="col-6"><input v-model="filtros.email" class="filter-input-mobile" placeholder="Email..."></div>
            <div class="col-6"><input v-model="filtros.celular" class="filter-input-mobile" placeholder="Celular..."></div>
          </div>
        </div>
      </div>

      <!-- TABLA DESKTOP -->
      <div class="table-container shadow desktop-only">
        <table>
          <thead>
            <tr class="main-header">
              <th class="sticky-col col-id text-center">ID</th>
              <th class="sticky-col col-acciones text-center">Acciones</th>
              <th class="sticky-col col-club">Club / Institución</th>
              <th>CUIT</th>
              <th>Condición IVA</th>
              <th>Email</th>
              <th>Celular</th>
            </tr>
            <tr class="filter-row">
              <td class="sticky-col col-id"></td>
              <td class="sticky-col col-acciones"></td>
              <td class="sticky-col col-club"><input v-model="filtros.club" class="filter-input" placeholder="Buscar club..."></td>
              <td><input v-model="filtros.cuit" class="filter-input" placeholder="Filtrar CUIT..."></td>
              <td><input v-model="filtros.condicion" class="filter-input" placeholder="Filtrar condición..."></td>
              <td><input v-model="filtros.email" class="filter-input" placeholder="Filtrar email..."></td>
              <td><input v-model="filtros.celular" class="filter-input" placeholder="Filtrar celular..."></td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inst in institucionesPaginadas" :key="inst.id">
              <td class="sticky-col col-id cell-ro text-center text-muted fw-bold">{{ inst.id }}</td>
              <td class="sticky-col col-acciones cell-ro text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button @click="editarInstitucion(inst)" class="btn-editar" title="Editar institución">
                    <span class="material-icons" style="font-size:16px;">edit</span>
                  </button>
                  <button @click="confirmarEliminacion(inst.id)" class="btn-eliminar" title="Eliminar institución">
                    <span class="material-icons" style="font-size:16px;">delete</span>
                  </button>
                </div>
              </td>
              <td class="sticky-col col-club cell-ro fw-bold text-dark">{{ inst.club }}</td>
              <td class="cell-ro">{{ inst.cuit }}</td>
              <td class="cell-ro">
                <span class="badge bg-light text-dark border">{{ inst.condicion || 'No especificada' }}</span>
              </td>
              <td class="cell-ro">{{ inst.email }}</td>
              <td class="cell-ro">{{ inst.celular }}</td>
            </tr>
            <tr v-if="institucionesPaginadas.length === 0">
              <td colspan="7" class="py-5 text-center text-muted">
                <span class="material-icons d-block fs-1 mb-2">domain_disabled</span>
                No se encontraron instituciones con esos filtros.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA MOBILE (CARDS) -->
      <div class="mobile-only">
        <div v-for="inst in institucionesPaginadas" :key="'mob-'+inst.id" class="card-arbitro">
          <div class="card-header">
            <div class="card-name">
              <span class="material-icons text-primary" style="font-size: 18px; margin-right: 5px;">domain</span>
              <strong>{{ inst.club }}</strong>
            </div>
            <div class="text-xs" style="color: #64748b;">ID: {{ inst.id }}</div>
          </div>
          
          <div class="card-body">
            <div class="card-row">
              <span><strong>CUIT:</strong> {{ inst.cuit || '-' }}</span>
              <span><strong>IVA:</strong> {{ inst.condicion || '-' }}</span>
            </div>
            
            <div class="card-info">
              <p v-if="inst.email"><strong class="text-dark">Email:</strong> {{ inst.email }}</p>
              <p v-if="inst.celular"><strong class="text-dark">Celular:</strong> {{ inst.celular }}</p>
            </div>
            
            <div class="d-flex gap-2 mt-3">
              <button @click="editarInstitucion(inst)" class="btn-editar-mobile flex-grow-1">
                <span class="material-icons" style="font-size: 18px;">edit</span> Editar
              </button>
              <button @click="confirmarEliminacion(inst.id)" class="btn-eliminar-mobile">
                <span class="material-icons" style="font-size: 18px;">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGINACIÓN -->
      <div class="paginacion">
        <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
        <span class="paginacion-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas || totalPaginas === 0">Siguiente</button>
      </div>
    </div>

    <!-- MODAL ALTA / EDICIÓN -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="modal-overlay-exito animate__animated animate__fadeIn">
        <div class="modal-content-exito animate__animated animate__zoomIn" style="max-width: 600px; width: 95%;">

          <div class="icon-circle-exito" :class="modoModal === 'editar' ? 'bg-info-light' : 'bg-success-light'">
            <span class="material-icons">{{ modoModal === 'editar' ? 'domain' : 'domain_add' }}</span>
          </div>
          <h4 class="fw-bold mt-3">
            {{ modoModal === 'editar' ? 'Editar Institución' : 'Registrar Nueva Institución' }}
          </h4>
          <p v-if="modoModal === 'editar'" class="text-muted small mb-1">{{ formModal.club }} (ID #{{ formModal.id }})</p>

          <div class="row g-3 text-start mt-3" style="max-height: 60vh; overflow-y: auto; padding: 15px;">
            <div class="col-12 seccion-titulo">Datos de la Institución</div>
            
            <div class="col-12">
              <label class="small fw-bold">Nombre del Club / Institución *</label>
              <input v-model="formModal.club" class="filter-input" placeholder="Ej: Club Atlético...">
            </div>
            
            <div class="col-md-6">
              <label class="small fw-bold">CUIT *</label>
              <input v-model="formModal.cuit" class="filter-input" placeholder="Sin guiones">
            </div>
            
            <div class="col-md-6">
              <label class="small fw-bold">Condición frente al IVA</label>
              <select v-model="formModal.condicion" class="filter-input">
                <option value="">Seleccionar...</option>
                <option value="Consumidor Final">Consumidor Final</option>
                <option value="Exento">Exento</option>
                <option value="Responsable Inscripto">Responsable Inscripto</option>
                <option value="Inscripto">Inscripto</option>
                <option value="Monotributo">Monotributo</option>
              </select>
            </div>

            <div class="col-12 seccion-titulo">Contacto</div>
            
            <div class="col-md-6">
              <label class="small fw-bold">Email Institucional</label>
              <input v-model="formModal.email" type="email" class="filter-input" placeholder="correo@club.com">
            </div>
            
            <div class="col-md-6">
              <label class="small fw-bold">Celular / Teléfono</label>
              <input v-model="formModal.celular" class="filter-input" placeholder="Ej: 11 1234-5678">
            </div>
          </div>

          <div class="d-flex gap-2 justify-content-center mt-4">
            <button @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold">CANCELAR</button>
            <button @click="guardarDatos" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" :disabled="cargando">
              <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
              {{ modoModal === 'editar' ? 'GUARDAR CAMBIOS' : 'CREAR INSTITUCIÓN' }}
            </button>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Instituciones | AAAB',
  meta: [{ name: 'description', content: 'Gestión de Instituciones y Clubes.' }],
})

const notificar = inject('notificar')

const instituciones = ref([])
const filtros = reactive({ club: '', cuit: '', condicion: '', email: '', celular: '' })
const cargando = ref(false)
const paginaActual = ref(1)
const registrosPorPagina = 10

const mostrarModal = ref(false)
const modoModal = ref('nuevo')

// Variable para controlar la visibilidad de los filtros en mobile
const mostrarFiltrosMobile = ref(false)

const formModalVacio = () => ({
  id: null,
  club: '',
  cuit: '',
  condicion: '',
  email: '',
  celular: ''
})

const formModal = ref(formModalVacio())

const cargarDatos = async () => {
  try {
    const res = await api.get({ entity: 'instituciones', action: 'getInstitucionesCuit' })
    if (res.payload) {
      instituciones.value = res.payload
    }
  } catch (err) { console.error('Error al cargar instituciones:', err) }
}

const crearNuevo = () => {
  formModal.value = formModalVacio()
  modoModal.value = 'nuevo'
  mostrarModal.value = true
}

const editarInstitucion = (inst) => {
  formModal.value = { ...inst }
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
  
  cargando.value = true
  try {
    const action = modoModal.value === 'nuevo' ? 'guardarInstitucion' : 'editarInstitucion'
    const res = await api.post({
      entity: 'instituciones',
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
    const res = await api.post({ entity: 'instituciones', action: 'eliminarInstitucion', payload: { id } })
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

const exportarExcel = () => {
  const datos = institucionesFiltradas.value.map(i => ({
    ID: i.id,
    Club: i.club,
    CUIT: i.cuit,
    Condicion: i.condicion,
    Email: i.email,
    Celular: i.celular
  }))
  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Instituciones')
  XLSX.writeFile(wb, 'Listado_Instituciones_AAAB.xlsx')
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

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevoTotal) => { if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal })

onMounted(() => { 
  cargarDatos()
})
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 80px; }
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; height: 100%; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center; }
.header-info { display: flex; flex-direction: column; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #000000; }
.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-blue { background: #3b82f6; color: white; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; } 
.btn-export { background: #10b981; color: white; }

/* SPAN DEL TEXTO PARA OCULTAR EN MOBILE Y CLASE PARA EL BOTÓN EXTRA */
.btn-text { display: inline; }
.mobile-only-flex { display: none; }
.filter-input-mobile { width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 0.85rem; }

.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
table { width: 100%; min-width: max-content; border-collapse: collapse !important; border-spacing: 0; font-size: 0.85rem; }
thead tr.main-header th { position: sticky; top: 0; z-index: 50; background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
thead tr.filter-row td { position: sticky; top: 36px; z-index: 40; background: #f1F5F9 !important; border-bottom: 2px solid #cbd5e1; }
.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; box-shadow: inset -1px 0 0 #e2e8f0; background-clip: padding-box; }
thead th.sticky-col { z-index: 100 !important; background-color: #f1F5F9 !important; }
thead td.sticky-col { z-index: 95 !important; background-color: #f8fafc !important; }
th { font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000000; text-transform: uppercase; font-weight: 800; padding: 8px; }
.filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; }

.cell-ro { padding: 8px 4px; font-size: 0.85rem; color: inherit; white-space: nowrap; border-bottom: 1px solid #e2e8f0; }
.seccion-titulo { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-top: 15px; width: 100%; }

.col-id { left: 0; width: 50px; }
.col-acciones { left: 50px; width: 80px; }
.col-club { left: 130px; width: 220px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

.btn-editar, .btn-eliminar { display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; padding: 4px 8px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
.btn-editar { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.btn-editar:hover { background: #dbeafe; }
.btn-eliminar { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
.btn-eliminar:hover { background: #fee2e2; }

.modal-overlay-exito { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.modal-content-exito { background: white; border-radius: 30px; padding: 40px; width: 90%; max-width: 750px; text-align: center; color: #000; }
.icon-circle-exito { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.bg-success-light { background: #dcfce7; color: #166534; }
.bg-info-light { background: #e0f2fe; color: #0369a1; }

.mobile-only { display: none; }
.desktop-only { display: block; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .card-arbitro { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px; }
  .card-name { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; color: #0f172a; }
  .card-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 8px; }
  .card-info p { font-size: 0.85rem; color: #475569; margin: 4px 0; }
  .btn-editar-mobile { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 8px; border-radius: 6px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; }
  .btn-eliminar-mobile { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 8px 12px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; }
}

/* =======================================
   AQUÍ ESTÁ LA MAGIA DEL RESPONSIVE MÓVIL 
   ======================================= */
@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .title { font-size: 1rem; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
  
  /* Botones en una sola fila, cuadrados y centrados */
  .header-actions { 
    width: 100%; 
    display: flex; 
    flex-direction: row; 
    flex-wrap: nowrap; 
    justify-content: center; 
    gap: 8px; 
  }
  .btn-action { 
    flex: none; 
    width: 42px; 
    height: 42px; 
    padding: 0; 
    justify-content: center; 
  }
  
  /* Desaparece el texto en móvil, queda solo el ícono */
  .btn-text { 
    display: none !important; 
  }
  
  /* Aparece el botón extra para ver los filtros en móvil */
  .mobile-only-flex { 
    display: flex !important; 
  }
}
</style>