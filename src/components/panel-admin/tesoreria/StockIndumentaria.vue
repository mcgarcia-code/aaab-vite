<template>
  <div class="container py-4 animate__animated animate__fadeIn">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-white m-0">Control de Stock</h2>
        <p class="small text-white opacity-75">Administración de indumentaria y precios</p>
      </div>
      <button @click="abrirModal()" class="btn btn-danger rounded-pill px-4 shadow">
        <i class="bi bi-plus-lg me-2"></i>Nuevo Item
      </button>
    </div>

    <div class="card shadow-lg border-0 bg-white" style="border-radius: 20px; overflow: hidden;">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="ps-4">Descripción</th>
              <th class="text-center">Cantidad</th>
              <th class="text-center">Precio Unitario</th>
              <th class="text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in stock" :key="item.id">
              <td class="ps-4 fw-bold text-dark">{{ item.descripcion }}</td>
              <td class="text-center">
                <span :class="['badge rounded-pill', item.cantidad < 5 ? 'bg-danger' : 'bg-secondary']">
                  {{ item.cantidad }} u.
                </span>
              </td>
              <td class="text-center text-muted">$ {{ item.precio_unitario }}</td>
              <td class="text-end pe-4">
                <button @click="abrirModal(item)" class="btn btn-outline-dark btn-sm rounded-circle border-0">
                  <i class="bi bi-pencil-square"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="modal-content animate__animated animate__zoomIn p-4 shadow-lg">
        <h4 class="fw-bold mb-4">{{ editando ? 'Editar Item' : 'Agregar Nuevo Item' }}</h4>
        
        <div class="mb-3">
          <label class="form-label small fw-bold">Descripción</label>
          <input v-model="form.descripcion" type="text" class="form-control rounded-3" placeholder="Ej: Remera Negra Talle L">
        </div>
        
        <div class="row">
          <div class="col-6 mb-3">
            <label class="form-label small fw-bold">Cantidad</label>
            <input v-model.number="form.cantidad" type="number" class="form-control rounded-3">
          </div>
          <div class="col-6 mb-3">
            <label class="form-label small fw-bold">Precio Unitario</label>
            <input v-model.number="form.precioUnitario" type="number" class="form-control rounded-3">
          </div>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button @click="cerrarModal" class="btn btn-light rounded-3 w-100 fw-bold">Cancelar</button>
          <button @click="guardarItem" class="btn btn-danger rounded-3 w-100 fw-bold">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// Configuración de la API
const API_URL_BE = 'https://arbitroshandball.com.ar/api/api.php';

const stock = ref([]);
const mostrarModal = ref(false);
const editando = ref(false);
const form = ref({ id: null, descripcion: '', cantidad: 0, precioUnitario: 0 });

// Obtener Stock (GET)
const fetchStock = async () => {
  try {
    // Armamos la URL con los parámetros para el GET
    const url = `${API_URL_BE}?entity=indumentaria&action=obtenerStock`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.ok) {
      stock.value = data.payload;
    }
  } catch (error) {
    console.error("Error cargando stock:", error);
  }
};

// Guardar o Actualizar (POST)
const guardarItem = async () => {
  const action = editando.value ? 'actualizarStock' : 'agregarItem';
  
  // Limpiamos el payload para cumplir con lo que espera indumentaria.php
  const payloadEnviar = { 
    descripcion: form.value.descripcion,
    cantidad: parseInt(form.value.cantidad),
    precioUnitario: parseInt(form.value.precioUnitario)
  };
  
  // Si es edición, agregamos el ID
  if (editando.value) {
    payloadEnviar.id = form.value.id;
  }

  try {
    const response = await fetch(API_URL_BE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity: 'indumentaria',
        action: action,
        payload: payloadEnviar
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      await fetchStock(); // Recargar la tabla
      cerrarModal();
      alert("¡Stock actualizado correctamente!");
    } else {
      alert("Error del servidor: " + data.message);
    }
  } catch (error) {
    console.error("Error en la conexión:", error);
    alert("No se pudo conectar con la API de arbitroshandball.com.ar");
  }
};

const abrirModal = (item = null) => {
  if (item) {
    editando.value = true;
    form.value = { 
      id: item.id, 
      descripcion: item.descripcion, 
      cantidad: item.cantidad, 
      precioUnitario: item.precio_unitario 
    };
  } else {
    editando.value = false;
    form.value = { id: null, descripcion: '', cantidad: 0, precioUnitario: 0 };
  }
  mostrarModal.value = true;
};

const cerrarModal = () => { mostrarModal.value = false; };

onMounted(fetchStock);
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1050;
}
.modal-content {
  background: white; border-radius: 25px; width: 100%; max-width: 450px;
}
.form-control:focus {
  border-color: #dc2626; box-shadow: 0 0 0 0.25rem rgba(220, 38, 38, 0.1);
}
.table-hover tbody tr:hover {
  background-color: #fffafa;
}
</style>