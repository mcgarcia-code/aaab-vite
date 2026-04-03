<template>
  <div class="container py-4 animate__animated animate__fadeIn">
    <div class="mb-4">
      <h2 class="fw-bold text-white m-0">Mis Pedidos</h2>
      <p class="small text-white opacity-75">Seguimiento de tus solicitudes de indumentaria</p>
    </div>

    <div v-if="misPedidos.length > 0" class="row g-3"> 
      <div v-for="pedido in misPedidos" :key="pedido.id" class="col-12">
        <div class="card border-0 shadow-sm tarjeta-pedido-historial overflow-hidden">
          <div class="card-body p-0">
            <div class="d-flex align-items-center bg-white p-3">
              <div class="flex-grow-1">
                <div class="text-muted extra-small text-uppercase fw-bold">Pedido #{{ pedido.id }} - {{ formatearFecha(pedido.fecha_creacion) }}</div>
                <div class="fw-bold text-dark fs-5">{{ pedido.descripcion }}</div>
              </div>
              <div class="text-end">
                <span :class="['badge rounded-pill px-3 py-2', claseEstado(pedido.estado)]">
                  {{ pedido.estado }}
                </span>
              </div>
            </div>
            
            <div class="cuerpo-gris-pedido p-3 d-flex justify-content-between align-items-center">
              <div class="small text-muted">
                Cantidad: <strong>{{ pedido.cantidad }}</strong> | 
                Precio Unit.: <strong>${{ pedido.precio_unitario }}</strong>
              </div>
              <div class="fw-bold text-danger fs-5">
                Total: ${{ pedido.cantidad * pedido.precio_unitario }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <i class="bi bi-box-seam text-white opacity-25 display-1"></i>
      <p class="text-white mt-3">Todavía no realizaste ningún pedido.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api/api';

// Título y descripción específicos
import { useHead } from '@vueuse/head';

useHead({
  title: 'Mis Pedidos| AAAB',
  meta: [
    {
      name: 'description',
      content: 'Seguimiento de tus solicitudes de indumentaria.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Mis Pedidos | AAAB',
    },
    {
      property: 'og:description',
      content: 'Seguimiento de tus solicitudes de indumentaria.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png', // Asegúrate que esta URL sea real
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})

const misPedidos = ref([]);

const cargarMisPedidos = async () => {
  const respuesta = await api.get({ entity: 'indumentaria', action: 'obtenerMisPedidos' });
  if (respuesta.ok) {
    misPedidos.value = respuesta.payload;
  }
};

const claseEstado = (estado) => {
  const colores = {
    'Creado': 'bg-secondary',
    'En proceso': 'bg-info text-dark',
    'Aceptado': 'bg-primary',
    'Rechazado': 'bg-danger',
    'Entregado': 'bg-success',
  };
  return colores[estado] || 'bg-dark';
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

onMounted(cargarMisPedidos);
</script>

<style scoped>
.tarjeta-pedido-historial { border-radius: 20px; }
.extra-small { font-size: 0.7rem; }
.cuerpo-gris-pedido { background-color: #f1f5f9; }

.badge { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }

@media (max-width: 576px) {
  .fs-5 { font-size: 1rem !important; }
  .cuerpo-gris-pedido { flex-direction: column; align-items: flex-start !important; gap: 10px; }
}
</style>