<template>
  <div class="container py-4 animate__animated animate__fadeIn">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-white m-0">Control de Stock</h2>
        <p class="small text-white opacity-75 m-0">Administración de indumentaria de árbitros</p>
      </div>
      <button @click="abrirModal()" class="btn btn-danger rounded-pill px-4 shadow-sm">
        <i class="bi bi-plus-lg me-2"></i>
      </button>
    </div>

    <div class="input-group shadow-sm mb-3">
      <span class="input-group-text bg-white border-end-0 rounded-pill-start">
        <i class="bi bi-search text-muted"></i>
      </span>
      <input 
        v-model="filtroTexto" 
        type="text" 
        class="form-control border-start-0 rounded-pill-end" 
        placeholder="Buscar por descripción..."
      >
      <button v-if="filtroTexto" @click="filtroTexto = ''" class="btn btn-light border-start-0 rounded-pill-end text-muted">
        <i class="bi bi-x-circle"></i>
      </button>
    </div>

    <div class="card shadow-lg border-0 bg-white" style="border-radius: 20px; overflow: hidden;">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light d-none d-md-table-header-group">
            <tr>
              <th class="ps-4">Descripción</th>
              <th class="text-center">Stock</th>
              <th class="text-center">Precio Unitario</th>
              <th class="text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in stockFiltrado" :key="item.id" class="stock-row">
              <td class="ps-4 fw-bold text-dark td-descripcion">
                {{ item.descripcion }}
              </td>

              <td class="text-center td-info td-cantidad" data-label="Cant.">
                <span :class="['badge rounded-pill shadow-sm', item.cantidad < 5 ? 'bg-danger' : 'bg-secondary']">
                  {{ item.cantidad }} u.
                </span>
              </td>
              <td class="text-center text-muted td-info td-precio" data-label="Precio">
                $ {{ item.precio_unitario }}
              </td>
              <td class="text-end pe-4 td-acciones">
                <button @click="abrirModal(item)" class="btn btn-outline-dark btn-sm rounded-circle border-0">
                  <i class="bi bi-pencil-square"></i>
                </button>
              </td>
            </tr>
            <tr v-if="stockFiltrado.length === 0">
              <td colspan="4" class="text-center py-5 text-muted small">No hay coincidencias.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="modal-content animate__animated animate__zoomIn p-4 shadow-lg">
        <h4 class="fw-bold mb-4 text-center">{{ editando ? 'Editar Item' : 'Agregar Nuevo' }}</h4>
        <div class="mb-3">
          <label class="form-label small fw-bold text-muted">Descripción</label>
          <input v-model="formulario.descripcion" type="text" class="form-control rounded-pill px-3" placeholder="Ej: Buzo Hummel XS">
        </div>
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label small fw-bold text-muted">Stock</label>
            <input v-model.number="formulario.cantidad" type="number" class="form-control rounded-pill px-3 text-center">
          </div>
          <div class="col-6">
            <label class="form-label small fw-bold text-muted">Precio Unitario</label>
            <input v-model.number="formulario.precioUnitario" type="number" class="form-control rounded-pill px-3 text-center">
          </div>
        </div>
        <div class="d-flex gap-2 mt-4 pt-2">
          <button @click="cerrarModal" class="btn btn-light rounded-pill w-100 fw-bold">Cancelar</button>
          <button @click="guardarItem" class="btn btn-danger rounded-pill w-100 fw-bold shadow">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { api } from '@/api/api';

const listaStock = ref([]);
const filtroTexto = ref('');
const mostrarModal = ref(false);
const editando = ref(false);
const formulario = ref({ id: null, descripcion: '', cantidad: 0, precioUnitario: 0 });

const stockFiltrado = computed(() => {
  let resultado = listaStock.value.filter(item => item.descripcion.toLowerCase().includes(filtroTexto.value.toLowerCase()));
  return resultado.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
});

const obtenerStock = async () => {
  const respuesta = await api.get({ entity: 'indumentaria', action: 'obtenerStock' });
  if (respuesta.ok) listaStock.value = respuesta.payload;
};

const guardarItem = async () => {
  if (!formulario.value.descripcion || formulario.value.cantidad < 0) { alert("Complete los datos."); return; }
  const accion = editando.value ? 'actualizarStock' : 'agregarItem';
  const datosEnviar = { descripcion: formulario.value.descripcion, cantidad: parseInt(formulario.value.cantidad), precioUnitario: parseInt(formulario.value.precioUnitario) };
  if (editando.value) datosEnviar.id = formulario.value.id;
  const respuesta = await api.post({ entity: 'indumentaria', action: accion, payload: datosEnviar });
  if (respuesta.ok) { await obtenerStock(); cerrarModal(); } else { alert("Error."); }
};

const abrirModal = (item = null) => {
  if (item) { editando.value = true; formulario.value = { id: item.id, descripcion: item.descripcion, cantidad: item.cantidad, precioUnitario: item.precio_unitario }; }
  else { editando.value = false; formulario.value = { id: null, descripcion: '', cantidad: 0, precioUnitario: 0 }; }
  mostrarModal.value = true;
};

const cerrarModal = () => { mostrarModal.value = false; };
onMounted(obtenerStock);
</script>

<style scoped>
/* GENERAL Y DESKTOP */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1050; }
.modal-content { background: white; border-radius: 25px; width: 92%; max-width: 420px; }
.form-control:focus { border-color: #dc2626; box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.1); }
.rounded-pill-start { border-radius: 50rem 0 0 50rem !important; }
.rounded-pill-end { border-radius: 0 50rem 50rem 0 !important; }
.btn-outline-dark:hover i { color: white; }

/* --- RESPONSIVE MOBILE --- */
@media (max-width: 767.98px) {
  /* Título más chico */
  h2 { font-size: 1.4rem; }
  
  /* Botón "Nuevo" comprimido */
  .btn-danger { padding: 8px 15px !important; font-size: 0.9rem; }

  /* Re-estructuramos la fila */
  .stock-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #f1f5f9;
    margin: 0;
  }

  .table-responsive .table tbody tr:last-child {
    border-bottom: none;
  }

  /* La descripción ocupa el 100% de la línea 1 */
  .td-descripcion {
    width: 100%;
    font-size: 1rem;
    padding: 0 0 8px 0 !important;
    border: none !important;
  }

  /* EL CAMBIO CLAVE: Comprimimos cantidad, precio y editar en una línea horizontal */
  .td-info, .td-acciones {
    display: flex !important;
    align-items: center !important;
    padding: 0 !important;
    border: none !important;
    margin-right: 15px; /* Espacio entre los 3 elementos */
  }

  /* Cantidad */
  .td-cantidad { order: 1; margin-right: 10px; }
  .td-cantidad .badge { font-size: 0.8rem; padding: 6px 10px; }

  /* Precio */
  .td-precio { order: 2; font-size: 0.95rem; font-weight: 600; }

  /* Acciones (Botón Editar) */
  .td-acciones { order: 3; margin-right: 0; margin-left: auto; /* Lo empuja a la derecha */ }
  .td-acciones button { 
    padding: 0 !important; 
    font-size: 1.2rem; /* Icono más grande */
    color: #64748b; /* Color neutro */
  }
}
</style>