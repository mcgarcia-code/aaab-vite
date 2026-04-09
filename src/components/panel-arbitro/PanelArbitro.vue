<template>
  <div class="panel-layout">
    <nav class="navbar navbar-dark bg-dark px-3 shadow-sm mb-4">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <span class="navbar-brand fw-bold">Panel Árbitro AAAB</span>
        <button @click="cerrarSesion" class="btn btn-outline-danger btn-sm px-3 fw-bold rounded-pill">Cerrar Sesión</button>
      </div>
    </nav>
    
    <div class="container-fluid px-4 py-2">
      <div class="mx-auto"> 
        <!-- HEADER DEL ÁRBITRO CON NOTIFICACIONES INTEGRADAS -->
        <div class="user-header d-flex align-items-center justify-content-between mb-4 p-3 rounded-4 shadow">
          <div class="d-flex align-items-center">
            <img :src="urlFoto" @error="(e) => e.target.src = 'https://via.placeholder.com/150'" 
                 class="perfil-img me-3 shadow-sm">
            
            <div>
              <h2 class="text-white fw-bold m-0 saludo-texto">
                Hola, {{ nombreFormateado }} 👋
              </h2>
              <span class="badge bg-danger mt-1 px-2 py-1 shadow-sm">ID Árbitro: {{ arbitro.id }}</span>
            </div>
          </div>

          <!-- CAMPANA DE NOTIFICACIONES -->
          <div class="dropdown me-2">
            <button class="btn position-relative border-0 bg-transparent p-2 d-flex align-items-center notification-btn" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
              <i class="bi bi-bell-fill fs-3 text-white"></i>
              <!-- Puntito rojo de alerta -->
              <span v-if="notificacionesNoLeidas > 0" class="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle" style="transform: translate(-30%, 30%) !important;">
                <span class="visually-hidden">Notificaciones nuevas</span>
              </span>
            </button>
            
            <!-- Menú Desplegable -->
            <ul class="dropdown-menu dropdown-menu-end shadow-lg py-0 overflow-hidden dropdown-notificaciones">
              <!-- Cabecera del Dropdown -->
              <li class="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                <h6 class="m-0 fw-bold text-dark">Notificaciones</h6>
                <span v-if="notificacionesNoLeidas > 0" class="badge bg-danger rounded-pill">{{ notificacionesNoLeidas }} nuevas</span>
              </li>
              
              <!-- Lista de Notificaciones (Con Scroll) -->
              <div class="notification-list">
                <li v-for="notif in notificaciones" :key="notif.id" class="border-bottom" :class="{'bg-light bg-opacity-50': !notif.leida}">
                  <a class="dropdown-item py-3 px-3 cursor-pointer text-wrap" @click.stop="marcarLeida(notif)">
                    <div class="d-flex gap-3 align-items-start">
                      <div class="icon-circle flex-shrink-0 shadow-sm" :class="getIconoNotificacion(notif.tipo).bg">
                        <i :class="['bi', getIconoNotificacion(notif.tipo).icono, 'text-white']"></i>
                      </div>
                      <div class="flex-grow-1">
                        <p class="mb-1 text-dark small fw-bold" style="line-height: 1.2;">
                          {{ notif.titulo }}
                          <span v-if="!notif.leida" class="d-inline-block ms-1 bg-danger rounded-circle" style="width: 6px; height: 6px;"></span>
                        </p>
                        <p class="mb-1 text-muted" style="font-size: 0.75rem; line-height: 1.3;">{{ notif.mensaje }}</p>
                        <small class="text-muted fw-bold" style="font-size: 0.65rem;">{{ notif.fecha }}</small>
                      </div>
                    </div>
                  </a>
                </li>

                <!-- Mensaje si no hay notificaciones -->
                <li v-if="notificaciones.length === 0" class="p-4 text-center text-muted">
                  <i class="bi bi-bell-slash fs-3 d-block mb-2 opacity-50"></i>
                  <small>No tenés notificaciones</small>
                </li>
              </div>

              <!-- Pie del Dropdown -->
              <li v-if="notificacionesNoLeidas > 0" class="p-2 text-center border-top bg-light">
                <button @click.stop="marcarTodasLeidas" class="btn btn-link btn-sm text-decoration-none text-muted small fw-bold">Marcar todas como leídas</button>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="route.name !== 'PanelInicio'" class="mb-4">
          <button @click="handleVolver" class="btn-volver shadow-sm">
            <i class="bi bi-arrow-left me-2"></i> 
            {{ esRutaProfunda ? 'Volver atrás' : 'Volver al Menú' }}
          </button>
        </div>

        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { auth } from '@/api/auth'; 
import { useHead } from '@vueuse/head';
import { api } from '@/api/api';

const route = useRoute();
const router = useRouter();

// Datos del Árbitro
const arbitro = ref(auth.getUser() || {});
const urlFoto = `https://arbitroshandball.com.ar/resources/carnet-arbitros/${arbitro.value.dni}.webp`;

const nombreFormateado = computed(() => {
  const nombre = arbitro.value.nombre || '';
  return nombre.toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase());
});

const esRutaProfunda = computed(() => {
  const segmentos = route.path.split('/').filter(p => p !== '');
  return segmentos.length > 2;
});

const handleVolver = () => {
  if (esRutaProfunda.value) {
    router.back();
  } else {
    router.push('/panel-arbitro');
  }
};

const cerrarSesion = () => {
  auth.logout();
};

// =======================================================
// LÓGICA DE NOTIFICACIONES
// =======================================================

const notificaciones = ref([
  { id: 1, tipo: 'indumentaria', titulo: 'Pedido en Proceso', mensaje: 'Tu pedido de indumentaria #15 ahora está EN PROCESO.', fecha: 'Hoy, 10:30 hs', leida: false },
  { id: 2, tipo: 'licencia', titulo: 'Licencia Aprobada', mensaje: 'Tu solicitud de ausencia para el 15/10 fue aprobada por la administración.', fecha: 'Ayer, 18:45 hs', leida: false },
  { id: 3, tipo: 'datos', titulo: 'Datos Actualizados', mensaje: 'Tus datos personales fueron verificados y actualizados en el padrón.', fecha: 'Hace 2 días', leida: true }
]);

const notificacionesNoLeidas = computed(() => notificaciones.value.filter(n => !n.leida).length);

const getIconoNotificacion = (tipo) => {
  switch (tipo) {
    case 'indumentaria': return { icono: 'bi-bag-check', bg: 'bg-primary' };
    case 'licencia': return { icono: 'bi-calendar2-check', bg: 'bg-success' };
    case 'disponibilidad': return { icono: 'bi-clock-history', bg: 'bg-warning text-dark' };
    case 'datos': return { icono: 'bi-person-check', bg: 'bg-info' };
    default: return { icono: 'bi-info-circle', bg: 'bg-secondary' };
  }
};

const marcarLeida = async (notif) => {
  if (notif.leida) return;
  
  notif.leida = true;
  /* 
  try {
    await api.post({ entity: 'notificaciones', action: 'marcarLeida', payload: { id: notif.id } });
  } catch (error) {
    console.error(error);
  }
  */
};

const marcarTodasLeidas = async () => {
  notificaciones.value.forEach(n => n.leida = true);
  /* 
  try {
    await api.post({ entity: 'notificaciones', action: 'marcarTodasLeidas', payload: { id_arbitro: arbitro.value.id } });
  } catch (error) {
    console.error(error);
  }
  */
};

const obtenerNotificaciones = async () => {
  /*
  try {
    const res = await api.get({ entity: 'notificaciones', action: 'obtenerDelArbitro', payload: { id_arbitro: arbitro.value.id } });
    if (res.ok) {
      notificaciones.value = res.payload;
    }
  } catch (error) {
    console.error('Error cargando notificaciones', error);
  }
  */
};

onMounted(() => {
  if (auth.isLoggedIn()) {
    auth.startInactivityTimer();
    obtenerNotificaciones();
  }
});

useHead({
  title: 'Panel de Árbitro | AAAB',
  meta: [
    { name: 'description', content: 'Panel de control oficial para árbitros de la AAAB.' },
    { property: 'og:title', content: 'Panel de Árbitro | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
})
</script>

<style scoped>
.panel-layout { 
  min-height: 100vh; 
  background-color: #0f172a; 
  padding-bottom: 40px;
}

.max-800 { 
  max-width: 900px; 
  margin: 0 auto; 
}

/* =========================================
   LA MAGIA ESTÁ ACÁ: z-index y position
   ========================================= */
.user-header {
  background: rgba(255, 255, 255, 0.05); 
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative; /* Asegura que el header actúe como ancla */
  z-index: 90; /* Coloca el header y su menú por encima de todo (router-view) */
}

.perfil-img { 
  width: 70px; 
  height: 70px; 
  border-radius: 50%; 
  object-fit: cover; 
  border: 2px solid #dc2626; 
}

.navbar {
  border-bottom: 2px solid #dc2626;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 20px;
  border-radius: 50px;
  transition: 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.05); 
  cursor: pointer;
  font-size: 1rem; 
}

.btn-volver:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.saludo-texto {
  line-height: 1.2;
}

/* =========================================
   ESTILOS DEL DROPDOWN DE NOTIFICACIONES
   ========================================= */
.notification-btn {
  border-radius: 50%;
  width: 48px;
  height: 48px;
  justify-content: center;
  transition: background 0.3s;
}
.notification-btn:hover, .notification-btn:focus {
  background: rgba(255, 255, 255, 0.1) !important;
}

.dropdown-notificaciones {
  width: 350px; 
  border-radius: 12px; 
  margin-top: 15px; /* Un poco más de margen para que no toque el botón */
}

.cursor-pointer {
  cursor: pointer;
}

.dropdown-item {
  transition: background-color 0.2s;
  white-space: normal; 
}

.dropdown-item:active {
  background-color: #f1f5f9 !important;
  color: inherit;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.notification-list {
  max-height: 350px; 
  overflow-y: auto;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}
.notification-list::-webkit-scrollbar-track {
  background: #f1f1f1; 
}
.notification-list::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 10px;
}
.notification-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}

/* =========================================
   AJUSTES RESPONSIVE (CELULAR)
   ========================================= */
@media (max-width: 576px) {
  .perfil-img { width: 55px; height: 55px; }
  .saludo-texto { font-size: 1.1rem; margin-bottom: 2px !important; }
  
  .notification-btn { width: 40px; height: 40px; }
  .notification-btn i { font-size: 1.25rem !important; }

  /* Ajuste de la tabla de notificaciones para celular */
  .dropdown-notificaciones {
    position: absolute !important;
    top: 110% !important; /* Desplazamos hacia abajo */
    right: -10px !important; /* Ajuste para alinear con el borde derecho */
    left: auto !important;
    width: calc(100vw - 40px) !important; /* Ocupa el ancho ajustado sin salirse */
    max-width: 400px !important;
    margin-top: 10px !important;
    z-index: 1060 !important; /* Aseguramos que nada lo tape en mobile */
  }
  
  .notification-list {
    max-height: 50vh; /* Para que en teléfonos chicos no se rompa */
  }
}
</style>