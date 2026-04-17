<template>
  <div class="container-fluid p-0 animate__animated animate__fadeIn">
    <div class="row g-3 g-md-4">

      <div class="col-12 col-lg-8 col-xl-9 order-2 order-lg-1">
        <div class="row g-3 align-items-stretch">
          <div class="col-12 col-sm-6 col-md-4 d-flex" v-for="item in menuItemsFiltrados" :key="item.title">
            <component
              :is="item.href ? 'a' : 'RouterLink'"
              :href="item.href"
              :to="item.to"
              :target="item.href ? '_blank' : null"
              rel="noopener noreferrer"
              class="text-decoration-none d-flex w-100 h-100"
            >
              <div class="modern-menu-card shadow-sm">
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

      <div class="col-12 col-lg-4 col-xl-3 order-1 order-lg-2">
        <aside class="sidebar-professional shadow-sm">
          <div class="sidebar-header">
            <div class="d-flex align-items-center">
              <i class="bi bi-calendar3 me-2 text-danger fs-5"></i>
              <span class="fw-black ls-1 text-uppercase">Avisos y Eventos</span>
            </div>
            <div v-if="cargando" class="spinner-border spinner-border-sm text-danger"></div>
          </div>

          <div class="sidebar-scroll-container p-3">

            <div class="notif-section">
              <label class="section-label" @click="toggleSeccion('reuniones')">
                <div class="d-flex align-items-center gap-2">
                  <span>PRÓXIMAS REUNIONES</span>
                  <span v-show="!seccionesAbiertas.reuniones && proximasFechas.length > 0" class="badge-count">
                    {{ proximasFechas.length }}
                  </span>
                </div>
                <i :class="['bi', seccionesAbiertas.reuniones ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </label>

              <div v-show="seccionesAbiertas.reuniones" class="collapse-content animate__animated animate__fadeIn">
                <div v-if="proximasFechas.length > 0">
                  <div class="event-card-modern" v-for="ev in proximasFechas" :key="ev.id">
                    <div class="cal-box">
                      <span class="day">{{ ev.fecha_evento.split('-')[2] }}</span>
                      <span class="month text-danger">{{ obtenerMesCorta(ev.fecha_evento) }}</span>
                    </div>
                    <div class="event-info">
                      <strong :class="{'text-danger': ev.categoria === 'urgente'}">{{ ev.titulo }}</strong>
                      <p class="mb-0">{{ ev.descripcion || 'Lugar a confirmar' }}</p>
                    </div>
                  </div>
                </div>
                <p v-else class="empty-msg">No hay eventos próximos.</p>
              </div>
            </div>

            <div class="notif-section">
              <label class="section-label" @click="toggleSeccion('cumpleanos')">
                <div class="d-flex align-items-center gap-2">
                  <span>CUMPLEAÑOS 🎂</span>
                  <span v-show="!seccionesAbiertas.cumpleanos && avisos.cumpleanos && avisos.cumpleanos.length > 0" class="badge-count">
                    {{ avisos.cumpleanos.length }}
                  </span>
                </div>
                <i :class="['bi', seccionesAbiertas.cumpleanos ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </label>

              <div v-show="seccionesAbiertas.cumpleanos" class="collapse-content animate__animated animate__fadeIn">
                <div v-if="avisos.cumpleanos && avisos.cumpleanos.length > 0">
                  <div v-for="cumple in avisos.cumpleanos" :key="cumple.nombre" class="event-card-modern">
                    <div :class="['cal-box', esHoy(cumple.fecha_nacimiento) ? 'today-bg' : '']">
                      <span class="day">{{ cumple.fecha_nacimiento.split('/')[0] }}</span>
                      <span :class="['month', esHoy(cumple.fecha_nacimiento) ? 'text-white' : 'text-danger']">
                        {{ obtenerMesNombre(cumple.fecha_nacimiento.split('/')[1]) }}
                      </span>
                    </div>
                    <div class="event-info d-flex align-items-center">
                      <div>
                        <strong class="mb-0">{{ cumple.nombre }} {{ cumple.apellido }}</strong>
                        <span v-if="esHoy(cumple.fecha_nacimiento)" class="badge-hoy ms-2 bg-danger text-white rounded px-1" style="font-size: 0.6rem;">¡ES HOY!</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-else class="empty-msg">Sin cumpleaños cercanos.</p>
              </div>
            </div>

            <div class="notif-section border-0 mb-0 pb-0">
              <label class="section-label" @click="toggleSeccion('recordatorios')">
                <div class="d-flex align-items-center gap-2">
                  <span>RECORDATORIOS</span>
                  <span v-show="!seccionesAbiertas.recordatorios && avisos.recordatorio && avisos.recordatorio.length > 0" class="badge-count">
                    {{ avisos.recordatorio.length }}
                  </span>
                </div>
                <i :class="['bi', seccionesAbiertas.recordatorios ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </label>

              <div v-show="seccionesAbiertas.recordatorios" class="collapse-content animate__animated animate__fadeIn">
                <div v-if="avisos.recordatorio && avisos.recordatorio.length > 0">
                  <div v-for="rec in avisos.recordatorio" :key="rec.id" class="reminder-pill">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    <span v-html="rec.descripcion"></span>
                  </div>
                </div>
                <p v-else class="empty-msg">No hay recordatorios.</p>
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useHead } from '@vueuse/head';
import { api } from '@/api/api';
import { auth } from '@/api/auth';

useHead({ title: 'Panel de Inicio | AAAB' })

// --- CONTROL DE COLAPSABLES ---
const seccionesAbiertas = reactive({
  reuniones: true,
  cumpleanos: false,
  recordatorios: true
});

const toggleSeccion = (seccion) => {
  seccionesAbiertas[seccion] = !seccionesAbiertas[seccion];
};

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
  { to: '/panel-arbitro/facturacion', title: 'Facturación', icon: 'bi bi-receipt', desc: 'Consultá los datos fiscales de los Clubes'},
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
/* --- TARJETAS MÓDULOS --- */
.modern-menu-card {
  background: white;
  border-radius: 16px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  height: 100%;
  cursor: pointer; 
}

.icon-box {
  width: 56px;
  height: 56px;
  min-width: 56px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.card-text {
  flex: 1;
  min-width: 0;
}
.card-text h5 { font-size: 0.95rem; color: #1e293b; }
.extra-small { font-size: 0.75rem; }
.card-arrow { margin-left: auto; color: #cbd5e1; font-size: 1rem; align-self: center; }

.modern-menu-card:hover {
  border-color: #f87171; 
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06);
}

.modern-menu-card:hover .icon-box { background: #dc2626; color: white; }

/* --- SIDEBAR PROFESIONAL --- */
.sidebar-professional {
  background: #ffffff; 
  border-radius: 20px; 
  border: 1px solid #e2e8f0; 
  overflow: hidden;
  display: flex; 
  flex-direction: column;
}

.sidebar-header {
  background: #f8fafc; 
  padding: 15px 20px; 
  border-bottom: 1px solid #e2e8f0; 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
}
.fw-black { font-weight: 800; font-size: 0.85rem; color: #1e293b; }

/* SECCIONES COLAPSABLES */
.notif-section { margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px dashed #e2e8f0; }

.section-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #000000;
  display: flex;
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  cursor: pointer; 
  padding: 5px 0;
  user-select: none;
}
.section-label:hover { opacity: 0.7; }
.section-label i { font-size: 0.9rem; color: #dc2626; transition: transform 0.2s ease; }

.badge-count {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.collapse-content {
  margin-top: 8px;
  animation-duration: 0.3s; 
}

/* BLOQUE CALENDARIO */
.cal-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #f1f5f9; border-radius: 10px; min-width: 44px; height: 44px;
}
.cal-box .day { font-weight: 800; font-size: 1rem; line-height: 1; color: #1e293b; }
.cal-box .month { font-size: 0.6rem; font-weight: 700; }
.today-bg { background: #dc2626 !important; color: white !important; }
.today-bg .day { color: white !important; }

/* EVENT CARDS */
.event-card-modern {
  display: flex; gap: 12px; margin-bottom: 6px; background: #fdfdfd; padding: 8px; border-radius: 12px; border: 1px solid #f8fafc;
}
.event-info { flex: 1; min-width: 0; }
.event-info strong {
  font-size: 0.8rem;
  color: #1e293b;
  display: block;
  line-height: 1.2;
  white-space: normal;
}
.event-info p {
  font-size: 0.72rem;
  color: #64748b;
  margin: 0;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
}

.reminder-pill { background: #fffbeb; color: #92400e; padding: 8px 12px; border-radius: 10px; font-size: 0.72rem; border-left: 3px solid #f59e0b; margin-bottom: 5px; }
.empty-msg { font-size: 0.7rem; color: #94a3b8; font-style: italic; }

/* ====================================================
   📱 RESPONSIVE DESIGN & SIDEBAR SCROLL
   ==================================================== */

/* --- PANTALLAS GRANDES Y LAPTOPS (Desde 992px) --- */
@media (min-width: 992px) {
  .sidebar-professional {
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 100px);
  }
  .sidebar-scroll-container {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
  .sidebar-scroll-container::-webkit-scrollbar { width: 5px; }
  .sidebar-scroll-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
}

/* --- DISPOSITIVOS MEDIANOS (Hasta 991px) --- */
@media (max-width: 991px) {
  .sidebar-professional { margin-bottom: 10px; }
  .sidebar-scroll-container { overflow-y: visible; padding: 12px !important; }
  .notif-section { margin-bottom: 8px; padding-bottom: 8px; }
}

/* --- MÓVILES --- */
@media (max-width: 768px) {
  .modern-menu-card { padding: 18px; }
}

.animate__animated { animation-duration: 0.5s; }
</style>