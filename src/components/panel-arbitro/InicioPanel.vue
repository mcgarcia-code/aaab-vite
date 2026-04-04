<template>
  <div class="animate__animated animate__fadeIn">
    <div class="row g-4">
      <div class="col-12 col-lg-8 col-xl-9">
        <div class="row g-3 g-md-4">
          <div class="col-12 col-sm-6 col-md-4" v-for="item in menuItems" :key="item.title">
            <a v-if="item.href" :href="item.href" target="_blank" rel="noopener noreferrer" class="text-decoration-none h-100 d-block">
              <div class="menu-card shadow-sm">
                <div class="icon-circle">
                  <i :class="[item.icon, 'text-danger']"></i>
                </div>
                <h5 class="mt-3 fw-bold text-dark">{{ item.title }}</h5>
                <p class="small text-muted m-0">{{ item.desc }}</p>
              </div>
            </a>

            <RouterLink v-else :to="item.to" class="text-decoration-none h-100 d-block">
              <div class="menu-card shadow-sm">
                <div class="icon-circle">
                  <i :class="[item.icon, 'text-danger']"></i>
                </div>
                <h5 class="mt-3 fw-bold text-dark">{{ item.title }}</h5>
                <p class="small text-muted m-0">{{ item.desc }}</p>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4 col-xl-3">
        <aside class="sidebar-notificaciones shadow-sm animate__animated animate__fadeInRight">
          <div class="sidebar-header d-flex align-items-center justify-content-between">
            <div>
              <i class="bi bi-bell-fill me-2 text-danger"></i>
              <span class="fw-bold">AVISOS Y EVENTOS</span>
            </div>
            <div v-if="cargando" class="spinner-border spinner-border-sm text-danger" role="status"></div>
          </div>
          
          <div class="sidebar-body p-3">
            <div class="notif-group mb-4">
              <label class="notif-label">PRÓXIMAS FECHAS</label>
              
              <div v-if="avisos.eventos.length > 0">
                <div class="notif-item" v-for="ev in avisos.eventos" :key="ev.id">
                  <div class="notif-date text-uppercase">
                    {{ formatearFechaCorta(ev.fecha_evento) }}
                  </div>
                  <div class="notif-content">
                    <strong :class="{'text-danger': ev.categoria === 'urgente'}">{{ ev.titulo }}</strong>
                    <span class="text-muted small d-block">{{ ev.descripcion }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted small ps-2">No hay eventos próximos.</p>
            </div>

            <div class="notif-group mb-4">
              <label class="notif-label">CUMPLEAÑOS 🎂</label>
              <div v-if="avisos.cumpleanos.length > 0">
                <div v-for="cumple in avisos.cumpleanos" :key="cumple.nombre" class="d-flex align-items-center mb-3">
                  <div :class="['badge-cumple me-3', esHoy(cumple.dia_mes) ? 'hoy' : '']">
                    {{ cumple.dia_mes }}
                  </div>
                  <div class="notif-content">
                    <strong class="small">{{ cumple.nombre }} {{ cumple.apellido }}</strong>
                    <span v-if="esHoy(cumple.dia_mes)" class="badge bg-danger extra-mini animate__animated animate__pulse animate__infinite">¡HOY!</span>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted small ps-2">Sin cumpleaños cercanos.</p>
            </div>

            <div class="notif-group">
              <label class="notif-label">RECORDATORIOS</label>
              <div class="alert alert-warning py-2 px-3 border-0 rounded-4 mb-2">
                <i class="bi bi-shield-check me-2"></i>
                <span class="extra-small">Entrada en calor <strong>OBLIGATORIA</strong> para todos</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';
import { api } from '@/api/api';
import { auth } from '@/api/auth';

useHead({
  title: 'Panel de Inicio | AAAB',
  meta: [{ name: 'description', content: 'Panel de control para árbitros AAAB.' }],
})

const menuItems = [
  { to: '/panel-arbitro/datos', title: 'Datos Personales', icon: 'bi bi-person-lines-fill', desc: 'Ver legajo y seguridad.' },
  { to: '/panel-arbitro/disponibilidad', title: 'Disponibilidad', icon: 'bi bi-clock-history', desc: 'Modificá tus horarios.' },
  { to: '/panel-arbitro/licencia', title: 'Solicitar Licencia', icon: 'bi bi-calendar-check', desc: 'Inasistencias con antelación.' },
  { to: '/panel-arbitro/credencial', title: 'Credencial Digital', icon: 'bi bi-person-badge', desc: 'Carnet oficial 2026.' },
  { to: '/panel-arbitro/sanciones', title: 'Tribunal de Ética', icon: 'bi bi-shield-exclamation', desc: 'Consultá tus sanciones.' },
  { to: '/panel-arbitro/rendimiento', title: 'Mi Rendimiento', icon: 'bi bi-graph-up-arrow', desc: 'Estadísticas y partidos.' },
  { to: '/panel-arbitro/indumentaria', title: 'Indumentaria', icon: 'bi bi-bag-fill', desc: 'Realizá pedidos de indumentaria.' },
  { to: '/panel-arbitro/aportes', title: 'Mis Aportes', icon: 'bi bi-cash-coin', desc: 'Consultá el estado de tus aportes.' },
  { href: 'https://refflix.com.ar', title: 'Ref-Flix', icon: 'bi bi-cast', desc: 'Plataforma de videos' },
];

// --- LÓGICA DE NOTIFICACIONES ---
const avisos = ref({ eventos: [], cumpleanos: [] });
const cargando = ref(true);

// Dentro de tu script de InicioPanel.vue
const cargarAvisos = async () => {
  const sesion = auth.getUser();
  
  // IMPORTANTE: Buscamos el ID dentro de 'arbitro' según tu login_arbitro.php
  const idReal = sesion?.arbitro?.id || sesion?.id;

  console.log("Cargando avisos para ID:", idReal);

  try {
    const res = await api.get({
      entity: 'eventos',
      action: 'obtenerDashboardAvisos',
    });
    
    if (res.ok) {
      avisos.value = res.payload;
    }
  } catch (e) {
    console.error("Falla de conexión con eventos.php", e);
  } finally {
    cargando.value = false;
  }
};

const formatearFechaCorta = (f) => {
  const date = new Date(f + 'T00:00:00'); // Forzamos hora local
  const dia = date.getDate();
  const mes = date.toLocaleString('es-AR', { month: 'short' }).replace('.', '');
  return `${dia} ${mes}`;
};

const esHoy = (diaMes) => {
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  return diaMes === hoy;
};

onMounted(cargarAvisos);
</script>

<style scoped>
/* (Mantenemos tus estilos de menu-card anteriores...) */
.menu-card { background: #ffffff; border-radius: 20px; padding: 35px 15px; text-align: center; transition: all 0.3s ease; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #f1f5f9; cursor: pointer; }
.icon-circle { width: 75px; height: 75px; background: #fff5f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 5px; transition: all 0.3s ease; }
.menu-card i { font-size: 2.2rem; }
.menu-card:hover { transform: translateY(-8px); box-shadow: 0 12px 25px rgba(0,0,0,0.2) !important; border-bottom: 5px solid #dc2626; }
.menu-card:hover .icon-circle { background: #dc2626; }
.menu-card:hover i { color: white !important; transform: scale(1.1); }

/* SIDEBAR STYLES */
.sidebar-notificaciones { background: white; border-radius: 25px; overflow: hidden; height: 100%; min-height: 500px; }
.sidebar-header { background: #f8fafc; padding: 20px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; letter-spacing: 1px; }
.notif-label { font-size: 0.7rem; font-weight: 800; color: #adb5bd; margin-bottom: 15px; display: block; letter-spacing: 0.5px; text-transform: uppercase; }
.notif-item { display: flex; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f8fafc; }
.notif-date { background: #fff5f5; color: #dc2626; font-weight: 800; font-size: 0.75rem; padding: 8px; border-radius: 12px; text-align: center; min-width: 55px; line-height: 1.2; }
.notif-content strong { display: block; font-size: 0.85rem; color: #334155; }

.badge-cumple { 
  background: #f1f5f9; color: #475569; font-weight: 700; font-size: 0.75rem; 
  padding: 5px 10px; border-radius: 10px; min-width: 50px; text-align: center;
}
.badge-cumple.hoy { background: #dc2626; color: white; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.3); }

.extra-small { font-size: 0.75rem; font-weight: 600; }
.extra-mini { font-size: 0.6rem; padding: 2px 5px; }

@media (max-width: 991px) {
  .sidebar-notificaciones { margin-top: 20px; min-height: auto; }
}
</style>