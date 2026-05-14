<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 mb-4 w-100 mx-auto" style="border-radius: 12px; overflow: hidden;">

      <div class="card-header bg-white py-3 border-bottom">
        <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
          <span class="material-icons">history</span>
          Historial de Notificaciones
        </h4>
        <p class="text-muted small m-0 mt-1">Revisá todos tus avisos y alertas pasadas.</p>
      </div>

      <div class="card-body bg-white p-3 p-md-4">

        <div v-if="cargando" class="text-center my-5">
          <div class="spinner-border text-danger" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="text-muted mt-2 small">Cargando historial...</p>
        </div>

        <div v-else-if="notificaciones.length === 0" class="text-center p-5 rounded border bg-light shadow-sm">
          <span class="material-icons text-muted opacity-50 d-block mb-3" style="font-size: 48px;">notifications_off</span>
          <h5 class="fw-bold text-dark mt-3">Historial limpio</h5>
          <p class="text-muted small m-0">No tenés ninguna notificación registrada.</p>
        </div>

        <!-- LISTA UNIFICADA (Reemplaza a la tabla hackeada por CSS) -->
        <div v-else class="border rounded shadow-sm overflow-hidden">

          <!-- Encabezado de Columnas (Solo visible en Escritorio) -->
          <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">
            <div class="col-md-2 ps-3">Fecha</div>
            <div class="col-md-3">Tipo</div>
            <div class="col-md-5">Mensaje</div>
            <div class="col-md-2 text-center pe-3">Estado</div>
          </div>

          <!-- Filas de Datos -->
          <div class="d-flex flex-column">
            <div v-for="notif in notificacionesPaginadas" :key="notif.id"
                 class="row g-0 align-items-center p-3 p-md-2 border-bottom notif-item"
                 :class="Number(notif.leida) === 0 ? 'bg-unread' : 'bg-white'">

              <!-- HEADER MOBILE: Fecha y Estado (Se oculta en PC) -->
              <div class="col-12 d-md-none d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <span class="text-muted small fw-bold">{{ notif.fecha }}</span>
                <span v-if="Number(notif.leida) === 1" class="badge bg-light text-muted border rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1">
                  <span class="material-icons text-primary" style="font-size: 14px;">done_all</span> Leída
                </span>
                <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1">
                  Nueva
                </span>
              </div>

              <!-- COL 1: FECHA (Escritorio) -->
              <div class="col-md-2 d-none d-md-block text-muted small fw-bold ps-3">
                {{ notif.fecha }}
              </div>

              <!-- COL 2: TIPO DE AVISO (Ambos) -->
              <div class="col-12 col-md-3 mb-2 mb-md-0 px-0 px-md-2">
                <span class="badge rounded-pill fw-bold d-inline-flex align-items-center gap-1 py-1 px-2" :class="getEstiloBadge(notif.tipo)">
                  <span class="material-icons" style="font-size: 14px;">{{ getIcono(notif.tipo) }}</span>
                  {{ notif.titulo }}
                </span>
              </div>

              <!-- COL 3: MENSAJE (Ambos) -->
              <div class="col-12 col-md-5 mb-0 mb-md-0 px-0 px-md-2 text-dark small lh-sm">
                {{ notif.mensaje }}
              </div>

              <!-- COL 4: ESTADO (Escritorio) -->
              <div class="col-md-2 d-none d-md-flex justify-content-center pe-3">
                <span v-if="Number(notif.leida) === 1" class="badge bg-light text-muted border rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1">
                  <span class="material-icons text-primary" style="font-size: 14px;">done_all</span> Leída
                </span>
                <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1">
                  Nueva
                </span>
              </div>

            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div class="d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPaginas > 1">
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
            <i class="bi bi-chevron-left"></i> Ant
          </button>
          <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
            Sig <i class="bi bi-chevron-right"></i>
          </button>
        </div>

      </div>
    </div>

    <!-- Alerta de contacto -->
    <div class="alert alert-secondary mt-4 border-0 shadow-sm mx-auto w-100" style="border-radius: 12px;">
      <div class="d-flex align-items-center">
        <i class="bi bi-info-square-fill me-3 fs-3 text-secondary opacity-75"></i>
        <div class="small text-dark lh-sm">
          Cualquier duda o consulta realizar a <a href="mailto:secretaria@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none">secretaria@arbitroshandball.com.ar</a>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed} from 'vue';
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

const paginaActual = ref(1);
const registrosPorPagina = ref(10);

const totalPaginas = computed(() => Math.ceil(notificaciones.value.length / registrosPorPagina.value) || 1);

const notificacionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina.value;
  return notificaciones.value.slice(inicio, inicio + registrosPorPagina.value);
});

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  if (window.innerWidth <= 768) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const getEstiloBadge = (tipo) => {
  switch (tipo) {
    case 'success': return 'bg-success-subtle text-success border border-success-subtle';
    case 'danger': return 'bg-danger-subtle text-danger border border-danger-subtle';
    case 'warning': return 'bg-warning-subtle text-dark border border-warning';
    case 'info': return 'bg-primary-subtle text-primary border border-primary-subtle';
    default: return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
  }
};

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
/* ====================================================
   1. ESTILOS DE LA LISTA Y ESTADOS
   ==================================================== */
.notif-item {
  transition: background-color 0.2s ease;
}

.notif-item:hover {
  background-color: #f8fafc !important;
}

.bg-unread {
  background-color: rgba(220, 38, 38, 0.03) !important;
}

.animate__animated { animation-duration: 0.5s; }

</style>
