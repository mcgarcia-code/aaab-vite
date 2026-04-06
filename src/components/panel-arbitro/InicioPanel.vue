<template>
  <div class="animate__animated animate__fadeIn container-fluid p-0">
    <div class="row g-4">
      
      <!-- COLUMNA PRINCIPAL (MÓDULOS) -->
      <div class="col-12 col-lg-8 col-xl-9 order-2 order-lg-1">
        <div class="row g-3 g-md-4">
          <div class="col-12 col-sm-6 col-md-4" v-for="item in menuItemsFiltrados" :key="item.title">
            <component 
              :is="item.href ? 'a' : 'RouterLink'"
              :href="item.href"
              :to="item.to"
              :target="item.href ? '_blank' : null"
              rel="noopener noreferrer"
              class="text-decoration-none h-100 d-block"
            >
              <div class="modern-menu-card">
                <div class="icon-box">
                  <i :class="item.icon"></i>
                </div>
                <div class="card-text">
                  <h5 class="fw-bold mb-1">{{ item.title }}</h5>
                  <p class="extra-small m-0 text-muted">{{ item.desc }}</p>
                </div>
                <div class="card-arrow">
                  <i class="bi bi-chevron-right"></i>
                </div>
              </div>
            </component>
          </div>
        </div>
      </div>

      <!-- SIDEBAR (PC) / TOP CARD (MOBILE) -->
      <div class="col-12 col-lg-4 col-xl-3 order-1 order-lg-2">
        <aside class="sidebar-professional shadow-sm">
          <div class="sidebar-header">
            <div class="d-flex align-items-center">
              <div class="bell-glow me-3">
                <i class="bi bi-bell-fill"></i>
              </div>
              <span class="fw-black ls-1">AVISOS Y EVENTOS</span>
            </div>
            <div v-if="cargando" class="spinner-border spinner-border-sm text-danger"></div>
          </div>
          
          <div class="sidebar-scroll-area">
            <!-- REUNIONES -->
            <div class="notif-section">
              <label class="section-label">PRÓXIMAS REUNIONES</label>
              <div v-if="proximasFechas.length > 0">
                <div class="event-card-modern" v-for="ev in proximasFechas" :key="ev.id">
                  <div class="cal-box">
                    <span class="day">{{ ev.fecha_evento.split('-')[2] }}</span>
                    <span class="month text-danger">{{ obtenerMesCorta(ev.fecha_evento) }}</span>
                  </div>
                  <div class="event-info">
                    <strong :class="{'text-danger': ev.categoria === 'urgente'}">{{ ev.titulo }}</strong>
                    <p class="text-truncate">{{ ev.descripcion || 'Lugar a confirmar' }}</p>
                  </div>
                </div>
              </div>
              <p v-else class="empty-msg">Sin eventos próximos.</p>
            </div>

            <!-- CUMPLEAÑOS -->
            <div class="notif-section">
              <label class="section-label">CUMPLEAÑOS 🎂</label>
              <div v-if="avisos.cumpleanos && avisos.cumpleanos.length > 0" class="cumple-container-mobile">
                <div v-for="cumple in avisos.cumpleanos" :key="cumple.nombre" class="event-card-modern">
                  <div :class="['cal-box', esHoy(cumple.fecha_nacimiento) ? 'today-bg' : '']">
                    <span class="day">{{ cumple.fecha_nacimiento.split('/')[0] }}</span>
                    <span :class="['month', esHoy(cumple.fecha_nacimiento) ? 'text-white' : 'text-danger']">
                      {{ obtenerMesNombre(cumple.fecha_nacimiento.split('/')[1]) }}
                    </span>
                  </div>
                  <div class="event-info">
                    <strong class="mb-0">{{ cumple.nombre }} {{ cumple.apellido }}</strong>
                    <span v-if="esHoy(cumple.fecha_nacimiento)" class="badge-hoy">CUMPLEAÑOS HOY</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RECORDATORIOS -->
            <div class="notif-section border-0">
              <label class="section-label">RECORDATORIOS</label>
              <div v-if="avisos.recordatorio && avisos.recordatorio.length > 0">
                <div v-for="rec in avisos.recordatorio" :key="rec.id" class="reminder-pill">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  <span v-html="rec.descripcion"></span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useHead } from '@vueuse/head';
import { api } from '@/api/api';
import { auth } from '@/api/auth';

useHead({ title: 'Panel de Inicio | AAAB' })

// ... (menuItems y menuItemsFiltrados iguales a los que tenías)
const menuItems = [
  { to: '/panel-arbitro/datos', title: 'Datos Personales', icon: 'bi bi-person-lines-fill', desc: 'Ver legajo y seguridad.' },
  { to: '/panel-arbitro/disponibilidad', title: 'Disponibilidad', icon: 'bi bi-clock-history', desc: 'Modificá tus horarios.' },
  { to: '/panel-arbitro/licencia', title: 'Solicitar Licencia', icon: 'bi bi-calendar-check', desc: 'Inasistencias con antelación.' },
  { to: '/panel-arbitro/credencial', title: 'Credencial Digital', icon: 'bi bi-person-badge', desc: 'Carnet oficial 2026.' },
  { to: '/panel-arbitro/sanciones', title: 'Tribunal de Ética', icon: 'bi bi-shield-exclamation', desc: 'Consultá tus sanciones.' },
  { to: '/panel-arbitro/rendimiento', title: 'Mi Rendimiento', icon: 'bi bi-graph-up-arrow', desc: 'Estadísticas y partidos.' },
  { to: '/panel-arbitro/aportes', title: 'Mis Aportes', icon: 'bi bi-cash-coin', desc: 'Consultá el estado de tus aportes.' },
  { href: 'https://refflix.com.ar', title: 'Ref-Flix', icon: 'bi bi-cast', desc: 'Plataforma de videos' },
  { to: '/panel-arbitro/observaciones', title: 'Observaciones', icon: 'bi bi-eye', desc: 'Cargar y visualizar observaciones', rolesPermitidos: [2,4] },
];

const menuItemsFiltrados = computed(() => {
  const sesion = auth.getUser();
  if (!sesion) return [];
  let itemsDinamicos = [...menuItems]; 
  if ([1,2].includes(sesion.id)) itemsDinamicos.push({ to: '/panel-arbitro/indumentaria', title: 'Indumentaria', icon: 'bi bi-bag-fill', desc: 'Pedidos de indumentaria.' });
  return itemsDinamicos.filter((item) => !item.rolesPermitidos || item.rolesPermitidos.includes(sesion.rol));
});

const avisos = ref({ reunion: [], urgente: [], cumpleanos: [], recordatorio: [] });
const cargando = ref(true);

const proximasFechas = computed(() => {
  const combinados = [...(avisos.value.reunion || []), ...(avisos.value.urgente || [])];
  return combinados.sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento));
});

const cargarAvisos = async () => {
  try {
    const res = await api.get({ entity: 'eventos', action: 'obtenerDashboardAvisos' });
    if (res.ok) avisos.value = res.payload;
  } catch (e) { console.error(e); } finally { cargando.value = false; }
};

const obtenerMesNombre = (n) => {
  const meses = ['', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return meses[parseInt(n)];
};

const obtenerMesCorta = (f) => {
  const date = new Date(f + 'T00:00:00');
  return date.toLocaleString('es-AR', { month: 'short' }).replace('.', '').toUpperCase();
};

const esHoy = (diaMes) => {
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  return diaMes === hoy;
};

onMounted(cargarAvisos);
</script>

<style scoped>
/* --- ESTILO DE TARJETAS (BENTO) --- */
.modern-menu-card {
  background: white;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.icon-box {
  width: 48px; height: 48px; min-width: 48px;
  background: #f8fafc; color: #dc2626;
  border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
  transition: 0.3s;
}
.card-text h5 { font-size: 0.95rem; color: #0f172a; margin-bottom: 2px; }
.extra-small { font-size: 0.75rem; color: #64748b; }
.card-arrow { margin-left: auto; color: #cbd5e1; font-size: 1rem; }

.modern-menu-card:hover { 
  transform: translateY(-4px); 
  border-color: #fca5a5; 
  box-shadow: 0 10px 20px rgba(0,0,0,0.04) !important;
}
.modern-menu-card:hover .icon-box { background: #dc2626; color: white; transform: rotate(-5deg); }

/* --- SIDEBAR PROFESIONAL --- */
.sidebar-professional {
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 18px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 22px 22px 0 0;
  display: flex; justify-content: space-between; align-items: center;
}
.bell-glow {
  color: #dc2626;
  font-size: 1.2rem;
  animation: pulse-red 2s infinite;
}
.fw-black { font-weight: 900; font-size: 0.8rem; color: #1e293b; }
.ls-1 { letter-spacing: 1px; }

/* SECCIONES SIDEBAR */
.notif-section { padding: 20px; border-bottom: 1px solid #f1f5f9; }
.section-label { font-size: 0.65rem; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 12px; }

/* CALBOX UNIFICADO */
.cal-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #f1f5f9; border-radius: 10px; min-width: 45px; height: 45px;
}
.cal-box .day { font-weight: 900; font-size: 1.1rem; line-height: 1; color: #1e293b; }
.cal-box .month { font-size: 0.6rem; font-weight: 800; }
.today-bg { background: #dc2626 !important; color: white !important; }
.today-bg .day { color: white !important; }

/* EVENT CARDS */
.event-card-modern {
  display: flex; gap: 12px; margin-bottom: 10px;
  background: #ffffff; padding: 10px; border-radius: 14px; border: 1px solid #f8fafc;
  transition: 0.2s;
}
.event-info { flex: 1; min-width: 0; }
.event-info strong { font-size: 0.8rem; color: #1e293b; display: block; }
.event-info p { font-size: 0.72rem; color: #64748b; margin: 0; }
.badge-hoy { color: #dc2626; font-size: 0.6rem; font-weight: 800; }

.reminder-pill { background: #fffbeb; color: #92400e; padding: 10px; border-radius: 12px; font-size: 0.72rem; border-left: 4px solid #f59e0b; margin-bottom: 8px; }

/* --- RESPONSIVE (MAGIA UX) --- */
@media (min-width: 992px) {
  .sidebar-professional {
    position: sticky;
    top: 20px;
    height: calc(100vh - 40px);
  }
  .sidebar-scroll-area {
    overflow-y: auto;
    flex: 1;
  }
}

@media (max-width: 991px) {
  .sidebar-professional {
    border-radius: 20px;
    margin-bottom: 20px;
  }
  .sidebar-scroll-area {
    display: flex;
    overflow-x: auto;
    padding: 10px;
    gap: 15px;
    -webkit-overflow-scrolling: touch;
  }
  .notif-section {
    min-width: 280px;
    padding: 10px;
    border-bottom: 0;
    border-right: 1px solid #f1f5f9;
  }
  .sidebar-header {
    padding: 12px 20px;
  }
}

@keyframes pulse-red {
  0% { transform: scale(1); text-shadow: 0 0 0 rgba(220, 38, 38, 0); }
  50% { transform: scale(1.1); text-shadow: 0 0 10px rgba(220, 38, 38, 0.5); }
  100% { transform: scale(1); text-shadow: 0 0 0 rgba(220, 38, 38, 0); }
}
</style>
