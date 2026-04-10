<template>
  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <!-- CABECERA ESTÁNDAR -->
      <div class="header-section shadow-sm mb-4">
        <div class="header-info">
          <h2 class="title d-flex align-items-center gap-2">
            <span class="material-icons text-danger">history</span>
            Historial de Notificaciones
          </h2>
          <span class="counter">Revisá todos tus avisos y alertas pasadas.</span>
        </div>
      </div>

      <!-- ESTADO DE CARGA -->
      <div v-if="cargando" class="text-center p-5 bg-white rounded shadow-sm border">
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted mt-2 small">Cargando historial...</p>
      </div>

      <!-- MENSAJE VACÍO -->
      <div v-else-if="notificaciones.length === 0" class="text-center p-5 bg-white rounded shadow-sm border">
        <span class="material-icons text-muted opacity-50 d-block mb-3" style="font-size: 48px;">notifications_off</span>
        <h5 class="text-dark fw-bold">Historial limpio</h5>
        <p class="text-muted small m-0">No tenés ninguna notificación registrada.</p>
      </div>

      <!-- TABLA DE HISTORIAL RESPONSIVE -->
      <div v-else class="bg-white rounded shadow-sm border overflow-hidden mobile-transparent-bg">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 custom-table">
            <thead class="table-light text-muted small border-bottom">
              <tr>
                <th scope="col" class="ps-4 py-3" style="width: 15%;">Fecha</th>
                <th scope="col" class="py-3" style="width: 20%;">Tipo</th>
                <th scope="col" class="py-3" style="width: 50%;">Mensaje</th>
                <th scope="col" class="text-center pe-4 py-3" style="width: 15%;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="notif in notificacionesPaginadas" :key="notif.id" :class="{'fila-no-leida': Number(notif.leida) === 0}">
                
                <!-- FECHA -->
                <td class="ps-4 text-muted small fw-bold text-nowrap" data-label="Fecha">
                  {{ notif.fecha }}
                </td>

                <!-- TIPO (Badge) -->
                <td data-label="Asunto">
                  <span class="badge rounded-pill fw-bold d-inline-flex align-items-center gap-1" :class="getEstiloBadge(notif.tipo)">
                    <span class="material-icons" style="font-size: 14px;">{{ getIcono(notif.tipo) }}</span>
                    {{ notif.titulo }}
                  </span>
                </td>

                <!-- MENSAJE -->
                <td class="text-dark small td-mensaje" data-label="Mensaje">
                  {{ notif.mensaje }}
                </td>

                <!-- ESTADO -->
                <td class="text-center pe-4 text-mobile-left" data-label="Estado">
                  <span v-if="Number(notif.leida) === 1" class="badge bg-light text-muted border rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1">
                    <span class="material-icons text-primary" style="font-size: 14px;">done_all</span> Leída
                  </span>
                  <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1">
                    Nueva
                  </span>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAGINACIÓN -->
      <div class="paginacion mt-4" v-if="totalPaginas > 1">
        <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
        <span class="paginacion-texto text-dark">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas">Siguiente</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Historial de Notificaciones | AAAB',
  meta: [
    { name: 'description', content: 'Historial completo de notificaciones del árbitro.' }
  ],
});

const notificaciones = ref([]);
const cargando = ref(true);

// Lógica de Paginación
const paginaActual = ref(1);
const registrosPorPagina = ref(10); // Mostramos 10 por defecto

const totalPaginas = computed(() => Math.ceil(notificaciones.value.length / registrosPorPagina.value) || 1);

const notificacionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina.value;
  return notificaciones.value.slice(inicio, inicio + registrosPorPagina.value);
});

// Scroll al cambiar de página
watch(paginaActual, () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Mapeo de estilos para los badges
const getEstiloBadge = (tipo) => {
  switch (tipo) {
    case 'success': return 'bg-success-subtle text-success border border-success-subtle';
    case 'danger': return 'bg-danger-subtle text-danger border border-danger-subtle';
    case 'warning': return 'bg-warning-subtle text-dark border border-warning';
    case 'info': return 'bg-primary-subtle text-primary border border-primary-subtle';
    default: return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
  }
};

// Mapeo de iconos (Usando Google Material Icons para mantener consistencia)
const getIcono = (tipo) => {
  switch (tipo) {
    case 'success': return 'check_circle';
    case 'danger': return 'error';
    case 'warning': return 'warning';
    case 'info': return 'info';
    default: return 'notifications';
  }
};

const cargarHistorial = async () => {
  cargando.value = true;
  try {
    const res = await api.get({ entity: 'notificaciones', action: 'obtenerNotificaciones' });
    if (res.ok) {
      notificaciones.value = res.payload;
    }
  } catch (error) {
    console.error('Error obteniendo historial de notificaciones', error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarHistorial();
});
</script>

<style scoped>
/* ESTILOS WRAPPER ESTÁNDAR */
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
}

.header-section { 
  background: white; 
  padding: 15px; 
  border-radius: 8px; 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 15px; 
  border-left: 5px solid #ef4444; 
  align-items: center; 
}

.title { 
  font-size: 1.1rem; 
  font-weight: bold; 
  margin: 0; 
}

.counter { 
  font-size: 0.85rem; 
  color: #000000; 
}

/* PAGINACIÓN */
.paginacion { 
  display: flex; 
  justify-content: flex-end; 
  align-items: center; 
  gap: 12px; 
  margin-top: 12px; 
}
.btn-paginacion { 
  border: none; 
  background: #f8fafc; 
  color: #0f172a; 
  padding: 8px 14px; 
  border-radius: 6px; 
  font-size: 0.8rem; 
  font-weight: 700; 
  cursor: pointer; 
}
.btn-paginacion:disabled { 
  opacity: 0.5; 
  cursor: not-allowed; 
}
.paginacion-texto { 
  color: white !important; 
  font-size: 0.85rem; 
  font-weight: 600; 
}

/* TABLA PERSONALIZADA */
.custom-table th {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
}

.custom-table td {
  vertical-align: middle;
}

.fila-no-leida {
  background-color: rgba(220, 38, 38, 0.03) !important;
}

/* ========================================================
   ESTILOS MOBILE (Diseño tipo Tarjeta)
   ======================================================== */
@media (max-width: 768px) {
  .mobile-transparent-bg {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .table-responsive {
    border: none;
    overflow-x: visible; /* Evita que las sombras se corten */
  }
  
  .custom-table thead {
    display: none; 
  }

  .custom-table, .custom-table tbody, .custom-table tr, .custom-table td {
    display: block;
    width: 100%;
  }

  /* LA FILA SE CONVIERTE EN TARJETA */
  .custom-table tr {
    background-color: #ffffff !important;
    border-radius: 12px;
    margin-bottom: 16px;
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    position: relative; /* Para posicionar el estado si quisieras */
  }

  /* RESET DE CELDAS PARA MODO TARJETA */
  .custom-table td {
    text-align: left;
    padding: 6px 0 !important;
    border: none;
    font-size: 0.9rem;
  }

  .text-mobile-left {
    text-align: left !important;
  }

  .td-mensaje {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    border-top: 1px dashed #e2e8f0 !important;
    margin-top: 8px;
    font-size: 0.85rem;
    color: #475569 !important;
  }

  /* ETIQUETAS GENERADAS AUTOMÁTICAMENTE (Negrita a la izquierda) */
  .custom-table td::before {
    content: attr(data-label) ": ";
    font-weight: 700;
    color: #1e293b;
    margin-right: 5px;
    font-size: 0.85rem;
  }

  /* Ajustes específicos para que los badges no rompan el diseño en línea */
  .custom-table td .badge {
    vertical-align: middle;
  }
}

/* Ajustes Extra para móviles pequeños */
@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
}
</style>