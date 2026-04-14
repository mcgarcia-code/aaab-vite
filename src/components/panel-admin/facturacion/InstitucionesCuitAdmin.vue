<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">
      
      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">
        
        <div class="header-section border-bottom" style="margin-bottom: 0; box-shadow: none; border-radius: 0; padding: 20px;">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2 flex-wrap" style="font-size: 1.25rem;">
              <i class="bi bi-building me-1"></i> Gestión de Instituciones
            </h4>
            <span class="counter mt-1 d-block text-muted">Total: {{ totalFiltrados }} clubes</span>
          </div>

          <div class="header-actions">
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

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster" style="border-radius: 0; border-left: 0; border-right: 0; margin-bottom: 0; background-color: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-muted text-uppercase" style="letter-spacing: 0.5px;">FILTRAR INSTITUCIONES</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>

          <div class="filter-grid-mobile">
            <input v-model="filtros.club" class="filter-input-mobile full-width" placeholder="Buscar club...">
            <input v-model="filtros.cuit" class="filter-input-mobile" placeholder="CUIT...">
            <select v-model="filtros.condicion" class="filter-input-mobile">
              <option value="">Todos</option>
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="Exento">Exento</option>
              <option value="Responsable Inscripto">Resp. Inscripto</option>
              <option value="Inscripto">Inscripto</option>
              <option value="Monotributo">Monotributo</option>
            </select>
            <input v-model="filtros.email" class="filter-input-mobile" placeholder="Email...">
            <input v-model="filtros.celular" class="filter-input-mobile" placeholder="Celular...">
          </div>

          <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0 shadow-sm" style="font-size: 0.95rem;">
            Aplicar Filtros
          </button>
        </div>

        <div class="card-body p-3 p-md-4">
          
          <div class="table-container shadow-sm desktop-only border" style="border-radius: 8px;">
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
                  <td class="sticky-col col-club"><input v-model="filtros.club" class="filter-input shadow-none" placeholder="Buscar club..."></td>
                  <td><input v-model="filtros.cuit" class="filter-input shadow-none" placeholder="Filtrar CUIT..."></td>
                  <td><input v-model="filtros.condicion" class="filter-input shadow-none" placeholder="Filtrar condición..."></td>
                  <td><input v-model="filtros.email" class="filter-input shadow-none" placeholder="Filtrar email..."></td>
                  <td><input v-model="filtros.celular" class="filter-input shadow-none" placeholder="Filtrar celular..."></td>
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
                  <td class="cell-ro text-dark">{{ inst.cuit }}</td>
                  <td class="cell-ro">
                    <span class="badge bg-light text-dark border">{{ inst.condicion || 'No especificada' }}</span>
                  </td>
                  <td class="cell-ro text-dark">{{ inst.email }}</td>
                  <td class="cell-ro text-dark">{{ inst.celular }}</td>
                </tr>
                <tr v-if="institucionesPaginadas.length === 0">
                  <td colspan="7" class="py-5 text-center text-muted border-0 bg-light">
                    <span class="material-icons d-block fs-1 mb-2">domain_disabled</span>
                    <p class="m-0 fw-bold">No se encontraron instituciones con esos filtros.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mt-3">
            <div v-for="inst in institucionesPaginadas" :key="'mob-'+inst.id" class="card-arbitro shadow-sm border border-light-subtle rounded-4 mb-3 bg-white">
              
              <div class="card-header border-bottom pb-2 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="card-name d-flex align-items-center gap-2">
                  <span class="material-icons text-primary" style="font-size: 20px;">domain</span>
                  <strong style="font-size: 1.05rem;" class="text-dark">{{ inst.club }}</strong>
                </div>
                <span class="text-muted small fw-bold mt-1">#{{ inst.id }}</span>
              </div>
              
              <div class="card-body px-3 py-3">
                <div class="d-flex justify-content-between bg-light p-2 rounded border mb-3">
                  <span class="text-dark small"><strong>CUIT:</strong> {{ inst.cuit || '-' }}</span>
                  <span class="text-dark small"><strong>IVA:</strong> {{ inst.condicion || '-' }}</span>
                </div>
                
                <div class="mb-3">
                  <p v-if="inst.email" class="mb-1 small"><strong class="text-dark">Email:</strong> {{ inst.email }}</p>
                  <p v-if="inst.celular" class="mb-0 small"><strong class="text-dark">Celular:</strong> {{ inst.celular }}</p>
                </div>
                
                <div class="d-flex gap-2 border-top pt-3">
                  <button @click="editarInstitucion(inst)" class="btn-editar-mobile flex-grow-1">
                    <span class="material-icons" style="font-size: 18px;">edit</span> Editar
                  </button>
                  <button @click="confirmarEliminacion(inst.id)" class="btn-eliminar-mobile">
                    <span class="material-icons" style="font-size: 18px;">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="institucionesPaginadas.length === 0" class="text-center p-4 bg-white rounded shadow-sm border border-light-subtle">
              <span class="material-icons text-muted" style="font-size: 40px;">domain_disabled</span>
              <p class="text-muted mt-2 mb-0 fw-bold">Sin resultados</p>
              <p class="text-muted small">No se encontraron instituciones.</p>
            </div>
          </div>

          <div class="d-flex justify-content-end w-100 mt-3" v-if="institucionesFiltradas.length > 0">
            <div class="paginacion" v-if="totalPaginas > 1">
              <button class="btn-paginacion border shadow-sm" @click="cambiarPagina(-1)" :disabled="paginaActual === 1">Anterior</button>
              <span class="paginacion-texto text-dark fw-bold">Página {{ paginaActual }} de {{ totalPaginas }}</span>
              <button class="btn-paginacion border shadow-sm" @click="cambiarPagina(1)" :disabled="paginaActual === totalPaginas || totalPaginas === 0">Siguiente</button>
            </div>
          </div>

        </div> </div> </div>

    <Teleport to="body">
      <div v-if="mostrarModal" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 10001;">
        <div class="modal-content-exito animate__animated animate__zoomIn shadow-lg p-4 p-md-5" style="max-width: 600px; width: 95%; border-radius: 20px;">

          <div class="flex-shrink-0 text-center mb-4">
            <div class="icon-circle-exito bg-info-subtle mb-3" :class="modoModal === 'editar' ? 'text-primary' : 'text-success'">
              <span class="material-icons" style="font-size: 32px;">{{ modoModal === 'editar' ? 'domain' : 'domain_add' }}</span>
            </div>
            <h4 class="fw-bold m-0 text-dark">
              {{ modoModal === 'editar' ? 'Editar Institución' : 'Registrar Nueva Institución' }}
            </h4>
            <p v-if="modoModal === 'editar'" class="text-muted small mt-1 mb-0">{{ formModal.club }} (ID #{{ formModal.id }})</p>
          </div>

          <div class="row g-3 text-start mt-2" style="max-height: 60vh; overflow-y: auto; padding: 5px;">
            <div class="col-12 seccion-titulo border-secondary-subtle">Datos de la Institución</div>
            
            <div class="col-12">
              <label class="small fw-bold text-dark">Nombre del Club / Institución *</label>
              <input v-model="formModal.club" class="form-control custom-input shadow-none" placeholder="Ej: Club Atlético...">
            </div>
            
            <div class="col-md-6">
              <label class="small fw-bold text-dark">CUIT *</label>
              <input v-model="formModal.cuit" class="form-control custom-input shadow-none" placeholder="Sin guiones">
            </div>
            
            <div class="col-md-6">
              <label class="small fw-bold text-dark">Condición frente al IVA</label>
              <select v-model="formModal.condicion" class="form-select custom-input shadow-none">
                <option value="">Seleccionar...</option>
                <option value="Consumidor Final">Consumidor Final</option>
                <option value="Exento">Exento</option>
                <option value="Responsable Inscripto">Responsable Inscripto</option>
                <option value="Inscripto">Inscripto</option>
                <option value="Monotributo">Monotributo</option>
              </select>
            </div>

            <div class="col-12 seccion-titulo border-secondary-subtle mt-4">Contacto</div>
            
            <div class="col-md-6">
              <label class="small fw-bold text-dark">Email Institucional</label>
              <input v-model="formModal.email" type="email" class="form-control custom-input shadow-none" placeholder="correo@club.com">
            </div>
            
            <div class="col-md-6">
              <label class="small fw-bold text-dark">Celular / Teléfono</label>
              <input v-model="formModal.celular" class="form-control custom-input shadow-none" placeholder="Ej: 11 1234-5678">
            </div>
          </div>

          <div class="d-flex gap-3 justify-content-center mt-4 pt-4 border-top">
            <button @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold" style="background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; width: 100%;">CANCELAR</button>
            <button @click="guardarDatos" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" :disabled="cargando" style="background: #1e293b; width: 100%;">
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
  title: 'Instituciones y Cuits | AAAB',
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

// FUNCIÓN: Cambiar página y scrollear arriba SOLO EN MOBILE
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
   1. BASE Y ESTRUCTURA GENERAL
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 120px; 
}

.admin-panel {
  width: 100%;
  max-width: 100%;
  padding: 20px;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

.header-section {
  background: white;
  padding: 15px 25px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  border-left: 5px solid #ef4444;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  align-items: center;
}

.header-info { display: flex; flex-direction: column; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #000000; }

.header-actions { display: flex; gap: 8px; }
.btn-action { 
  border: none; padding: 8px 12px; border-radius: 4px; 
  font-weight: bold; cursor: pointer; display: flex; 
  align-items: center; justify-content: center; gap: 5px; 
  font-size: 0.75rem; transition: opacity 0.2s; 
}

.btn-blue { background: #3b82f6; color: white; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; } 
.btn-export { background: #10b981; color: white; }
.btn-text { display: inline; }

/* ====================================================
   2. PAGINACIÓN
   ==================================================== */
.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
.btn-paginacion { 
  border: none; background: #f8fafc; color: #0f172a; 
  padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; 
  font-weight: 700; cursor: pointer; transition: background 0.2s; 
}
.btn-paginacion:hover:not(:disabled) { background: #e2e8f0; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: #000; font-size: 0.85rem; font-weight: 600; }

/* ====================================================
   3. TABLA DESKTOP ESTRUCTURA
   ==================================================== */
.table-container { 
  width: 100%; overflow: auto; max-height: 85vh; 
  background: white; border-radius: 8px; border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
}
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }

thead tr.main-header th { 
  position: sticky; top: 0; z-index: 50; background: #f8fafc !important; 
  padding: 12px 8px; border-bottom: 1px solid #cbd5e1; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif; 
  font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0;
}
thead tr.filter-row td { 
  position: sticky; top: 35px; z-index: 40; background: #f1F5F9 !important; 
  padding: 6px 8px 12px 8px; border-bottom: 4px solid #e2e8f0; margin: 0; 
}

.sticky-col { 
  position: sticky !important; z-index: 60 !important; 
  background: white !important; border-right: 1px solid #e2e8f0; 
  box-shadow: inset -1px 0 0 #e2e8f0; background-clip: padding-box; 
}
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }
thead tr.filter-row td.sticky-col { z-index: 95 !important; background-color: #f1f5f9 !important; }

.col-id { left: 0; width: 60px; text-align: center; }
.col-acciones { left: 60px; width: 90px; }
.col-club { left: 150px; width: 220px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

.cell-ro { padding: 10px 8px; font-size: 0.85rem; color: #000; border-bottom: 1px solid #f1f5f9; }
.filter-input { font-size: 16px; height: 32px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; outline: none;}

@media (min-width: 769px) { 
  .filter-input { font-size: 0.75rem; height: 28px; } 
}

/* Componentes de Tabla */
.seccion-titulo { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; margin-top: 15px; width: 100%; }

.btn-editar, .btn-eliminar { 
  display: inline-flex; align-items: center; justify-content: center; 
  border-radius: 6px; padding: 4px 8px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; 
}
.btn-editar { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.btn-editar:hover { background: #dbeafe; }
.btn-eliminar { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
.btn-eliminar:hover { background: #fee2e2; }

/* ====================================================
   4. MODALES
   ==================================================== */
.modal-overlay-exito { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); 
  display: flex; align-items: center; justify-content: center; z-index: 10000; 
}

/* Modales ajustados con más padding */
.modal-content-exito { 
  background: white; border-radius: 20px; border: none; text-align: center; 
  padding: 40px !important; /* Padding base generoso */
}

.icon-circle-exito { 
  width: 70px; height: 70px; border-radius: 50%; display: flex; 
  align-items: center; justify-content: center; margin: 0 auto; 
}
.bg-info-light { background: #e0f2fe; color: #0369a1; }
.bg-success-light { background: #dcfce7; color: #166534; }

.custom-input { 
  border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; 
  font-size: 0.95rem; background-color: #ffffff; transition: all 0.3s ease; 
}
.custom-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); outline: none; }

/* ====================================================
   5. 📱 RESPONSIVE DESIGN (Tiered Layout)
   ==================================================== */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }

/* Laptops y Tablets (Hasta 1024px) */
@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

/* Tablets y Móviles (Hasta 768px) */
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .mobile-only-flex { display: flex !important; }

  /* PANEL DE FILTROS MÓVIL */
  .mobile-filter-panel { background: white; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px;}
  .filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .filter-input-mobile { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 16px; width: 100%; outline: none; background: #f8fafc; color: #334155;}
  .filter-grid-mobile input.full-width { grid-column: span 2; }
  .filter-input-mobile:focus { border-color: #3b82f6; background: white;}
  .filter-input-mobile::placeholder { color: #94a3b8;}

  /* Botones en Cards móviles */
  .btn-editar-mobile { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 8px; border-radius: 6px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; }
  .btn-eliminar-mobile { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 8px 12px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; }
}

/* Smartphones (Hasta 600px) */
@media (max-width: 600px) {
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto;
  margin-left: 50%;
  transform: translateX(-50%);
      /* Top en 0, pero conservando los 15px laterales originales para celulares */
  padding: 0 15px 20px 15px !important; 
  box-sizing: border-box !important;
}
    
.admin-panel { 
      padding: 0 !important; 
      border-radius: 0; 
      box-sizing: border-box !important;
}
  
  /* ESTRUCTURA CABECERA: Título Izquierda, Botones Centro */
  .header-section { 
    padding: 15px !important; 
    flex-direction: column; 
    align-items: flex-start; /* Mantiene la barra roja a la izq */
    text-align: left; 
    gap: 15px; 
  }
  
  .header-info { display: flex; flex-direction: column; align-items: flex-start; width: 100%;}
  .header-info h4 { font-size: 1.25rem !important; justify-content: flex-start; }
  .header-info span.counter { font-size: 0.85rem !important; }
  
  /* Centrado de botones de acción */
  .header-actions { 
    width: 100%; display: flex; flex-direction: row; 
    flex-wrap: wrap; justify-content: center; gap: 10px; 
  }
  .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
  .btn-action span.material-icons { margin: 0; }
  .btn-text { display: none !important; }
  .mobile-only-flex { display: flex !important; }
  
  /* AJUSTE DE PADDING EN MODALES MÓVILES (Agregar/Editar Eventos) */
  .modal-content-exito {
    padding: 30px 20px !important; /* Libera los costados pero mantiene aire arriba y abajo */
    max-height: 90vh; /* Evita que el modal sea más alto que la pantalla */
    overflow-y: auto; /* Scroll interno si el formulario de evento es largo */
  }
}

.animate__animated { animation-duration: 0.5s; }
</style>