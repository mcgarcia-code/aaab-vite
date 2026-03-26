<template>
  <div class="container py-4 animate__animated animate__fadeIn">
    <div class="mb-4">
      <h2 class="fw-bold text-white m-0">Pedidos Realizados</h2>
      <p class="small text-white opacity-75">Seguimiento de solicitudes de los árbitros</p>
    </div>

    <div class="card shadow-lg border-0 bg-white" style="border-radius: 20px; overflow: hidden;">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light text-secondary">
            <tr>
              <th class="ps-4">Árbitro</th>
              <th>Prenda</th>
              <th class="text-center">Cant.</th>
              <th class="text-center">Total</th>
              <th class="text-center">Estado</th>
              <th class="text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pedidos" :key="p.id">
              <td class="ps-4">
                <div class="fw-bold text-dark">{{ p.nombre }} {{ p.apellido }}</div>
                <div class="small text-muted">ID: #{{ p.id }}</div>
              </td>
              <td>{{ p.descripcion }}</td>
              <td class="text-center">{{ p.cantidad }}</td>
              <td class="text-center fw-bold">$ {{ p.cantidad * p.precioUnitario }}</td>
              <td class="text-center">
                <span :class="['badge rounded-pill px-3', getEstadoClass(p.estado)]">
                  {{ p.estado }}
                </span>
              </td>
              <td class="text-end pe-4">
                <div class="dropdown">
                  <button class="btn btn-light btn-sm rounded-circle border shadow-sm" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow border-0 p-2" style="border-radius: 12px;">
                    <li><h6 class="dropdown-header small">Cambiar Estado</h6></li>
                    <li><button @click="cambiarEstado(p.id, 'Pendiente')" class="dropdown-item rounded-2">Pendiente</button></li>
                    <li><button @click="cambiarEstado(p.id, 'Entregado')" class="dropdown-item rounded-2 text-success">Entregado</button></li>
                    <li><button @click="cambiarEstado(p.id, 'Cancelado')" class="dropdown-item rounded-2 text-danger">Cancelado</button></li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr v-if="pedidos.length === 0">
              <td colspan="6" class="text-center py-5 text-muted small">No hay pedidos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_URL_BE = 'https://arbitroshandball.com.ar/api/api.php';
const pedidos = ref([]);

// Cargar Pedidos (GET)
const fetchPedidos = async () => {
  try {
    const url = `${API_URL_BE}?entity=indumentaria&action=obtenerPedidos`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.ok) {
      pedidos.value = data.payload;
    }
  } catch (error) {
    console.error("Error cargando pedidos:", error);
  }
};

// Actualizar Estado (POST)
const cambiarEstado = async (idPedido, nuevoEstado) => {
  try {
    const response = await fetch(API_URL_BE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity: 'indumentaria',
        action: 'actualizarPedido',
        payload: {
          id: idPedido,
          estado: nuevoEstado
        }
      })
    });
    
    const data = await response.json();
    if (data.ok) {
      // Actualizamos solo el item en la lista local para no recargar todo el GET
      const index = pedidos.value.findIndex(p => p.id === idPedido);
      if (index !== -1) pedidos.value[index].estado = nuevoEstado;
    } else {
      alert("No se pudo actualizar el estado: " + data.message);
    }
  } catch (error) {
    console.error("Error en la conexión:", error);
  }
};

// Helper visual para los colores del estado
const getEstadoClass = (estado) => {
  switch (estado.toLowerCase()) {
    case 'pendiente': return 'bg-warning text-dark';
    case 'entregado': return 'bg-success text-white';
    case 'cancelado': return 'bg-danger text-white';
    default: return 'bg-secondary text-white';
  }
};

onMounted(fetchPedidos);
</script>

<style scoped>
.table-hover tbody tr:hover {
  background-color: #f8fafc;
}
.dropdown-item:active {
  background-color: #dc2626;
}
.badge {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
</style>