<template>
  <div class="container-fluid py-4 animate__animated animate__fadeIn">
    <div class="row g-3 g-md-4">

      <!-- ============ MÓDULOS POR CATEGORÍA ============ -->
      <div class="col-12 col-lg-8 col-xl-9 order-2 order-lg-1">
        <div v-for="grupo in categorias" :key="grupo.categoria" class="mb-4">
          <div class="categoria-label">
            <i :class="grupo.icono"></i>
            <span>{{ grupo.categoria }}</span>
          </div>
          <div class="row g-3">
            <div v-for="item in grupo.items" :key="item.title" class="col-12 col-sm-6 col-md-4 d-flex">
              <RouterLink :to="item.to" class="text-decoration-none d-flex w-100 h-100">
                <div class="modern-menu-card shadow-sm w-100 h-100" :class="{ destacada: item.destacada }">
                  <div class="icon-box"><i :class="item.icon"></i></div>
                  <div class="card-text">
                    <h5 class="fw-bold mb-1">{{ item.title }}</h5>
                    <p class="extra-small m-0 text-muted">{{ item.desc }}</p>
                  </div>
                  <div class="card-arrow"><i class="bi bi-chevron-right"></i></div>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ BARRA LATERAL ============ -->
      <div class="col-12 col-lg-4 col-xl-3 order-1 order-lg-2">
        <aside class="sidebar-professional shadow-sm mb-3 mb-lg-0 sticky-lg-top" style="top: 20px; z-index: 10;">
          <div class="sidebar-header">
            <div class="d-flex align-items-center">
              <i class="bi bi-calendar3 me-2 text-danger fs-5"></i>
              <span class="fw-black text-uppercase">Avisos del Curso</span>
            </div>
            <div v-if="cargando" class="spinner-border spinner-border-sm text-danger"></div>
          </div>

          <div class="sidebar-scroll-container p-2 p-lg-3 overflow-auto" style="max-height: calc(100vh - 100px);">
            <!-- PRÓXIMAS CLASES -->
            <div class="notif-section mb-2 mb-lg-3 pb-2 pb-lg-3">
              <button type="button" class="section-label" @click="abiertas.clases = !abiertas.clases" :aria-expanded="abiertas.clases">
                <span class="d-flex align-items-center gap-2">
                  <span>PRÓXIMAS CLASES</span>
                  <span v-show="!abiertas.clases && proximasClases.length" class="badge-count">{{ proximasClases.length }}</span>
                </span>
                <i :class="['bi', abiertas.clases ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </button>
              <div v-show="abiertas.clases" class="collapse-content">
                <template v-if="proximasClases.length">
                  <RouterLink v-for="c in proximasClases" :key="c.id" to="/panel-curso/cronograma-curso" class="event-card-modern text-decoration-none">
                    <div class="cal-box">
                      <span class="day">{{ Number(c.fecha.substring(8, 10)) }}</span>
                      <span class="month text-danger">{{ MESES_CORTOS[Number(c.fecha.substring(5, 7)) - 1] }}</span>
                    </div>
                    <div class="event-info">
                      <strong>{{ c.titulo }}</strong>
                      <p>{{ horarioClase(c) || 'Horario a confirmar' }}<template v-if="c.lugar"> · {{ c.lugar }}</template></p>
                    </div>
                  </RouterLink>
                </template>
                <p v-else class="empty-msg">No hay clases próximas cargadas.</p>
              </div>
            </div>

            <!-- CUMPLEAÑOS -->
            <div class="notif-section border-0 mb-0 pb-0">
              <button type="button" class="section-label" @click="abiertas.cumpleanos = !abiertas.cumpleanos" :aria-expanded="abiertas.cumpleanos">
                <span class="d-flex align-items-center gap-2">
                  <span>CUMPLEAÑOS DEL MES 🎂</span>
                  <span v-show="!abiertas.cumpleanos && cumpleanos.length" class="badge-count">{{ cumpleanos.length }}</span>
                </span>
                <i :class="['bi', abiertas.cumpleanos ? 'bi-chevron-up' : 'bi-chevron-down']"></i>
              </button>
              <div v-show="abiertas.cumpleanos" class="collapse-content">
                <template v-if="cumpleanos.length">
                  <div v-for="c in cumpleanos" :key="c.nombre + c.dia" class="event-card-modern">
                    <div class="cal-box" :class="{ 'today-bg': c.esHoy }">
                      <span class="day">{{ c.dia }}</span>
                      <span class="month" :class="c.esHoy ? 'text-white' : 'text-danger'">{{ MESES_CORTOS[new Date().getMonth()] }}</span>
                    </div>
                    <div class="event-info d-flex align-items-center">
                      <div>
                        <strong>{{ c.nombre }}<template v-if="c.soyYo"> (vos)</template></strong>
                        <span v-if="c.esHoy" class="badge bg-danger text-white rounded px-1 mt-1" style="font-size: 0.6rem;">¡ES HOY!</span>
                      </div>
                    </div>
                  </div>
                </template>
                <p v-else class="empty-msg">No hay cumpleaños de alumnos regulares este mes.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { CLAVE_PRECARGA_REGISTRO, precargaRegistroArbitro } from '@/composables/useCursoArbitro'
import { horarioClase } from '@/composables/useCronogramaCurso'

useHead({ title: 'Inicio Curso | AAAB' })

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

const abiertas = reactive({ clases: true, cumpleanos: true })
const cargando = ref(true)
const estado = ref('')
const proximasClases = ref([])
const cumpleanos = ref([])

// ─── Menú por categoría ──────────────────────────────────────────
const ITEM_REGISTRO_ARBITRO = {
  to: { path: '/registro-arbitro', query: { desdeCurso: 1 } },
  title: 'Registrarme como árbitro',
  icon: 'bi bi-patch-check-fill',
  desc: '¡Aprobaste el curso! Completá tu registro con tu email personal.',
  destacada: true,
}

const categorias = computed(() => [
  {
    categoria: 'Mi Perfil',
    icono: 'bi bi-person-circle',
    items: [
      ...(estado.value === 'aprobado' ? [ITEM_REGISTRO_ARBITRO] : []),
      { to: '/panel-curso/datos-curso', title: 'Datos Personales', icon: 'bi bi-person-lines-fill', desc: 'Tus datos, foto y contraseña.' },
      { to: '/panel-curso/credencial-curso', title: 'Credencial Digital', icon: 'bi bi-person-badge', desc: 'Tu credencial de aspirante.' },
      { to: '/panel-curso/cronograma-curso', title: 'Cronograma', icon: 'bi bi-calendar3-week', desc: 'Clases de tu curso.' },
    ],
  },
  {
    categoria: 'Actividad Arbitral',
    icono: 'bi bi-person-raised-hand',
    items: [
      { to: '/panel-curso/rendimiento-curso', title: 'Mi Rendimiento', icon: 'bi bi-graph-up-arrow', desc: 'Asistencia a clases y notas de exámenes.' },
      { to: '/panel-curso/observaciones-curso', title: 'Mis Observaciones', icon: 'bi bi-eye', desc: 'Observaciones de los partidos que dirigiste.' },
    ],
  },
  {
    categoria: 'Tesorería',
    icono: 'bi bi-cash-stack',
    items: [
      { to: '/panel-curso/cuota-curso', title: 'Cuota del Curso', icon: 'bi bi-cash-coin', desc: 'Estado de tus pagos.' },
    ],
  },
  {
    categoria: 'Exámenes',
    icono: 'bi bi-journal-check',
    items: [
      { to: '/panel-curso/examenes-curso', title: 'Mis Exámenes', icon: 'bi bi-journal-text', desc: 'Notas de los exámenes del curso.' },
    ],
  },
])

// ─── Datos del inicio ────────────────────────────────────────────
const cargarInicio = async () => {
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerInicioCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message)
    estado.value = res.payload.estado
    proximasClases.value = res.payload.proximasClases || []
    cumpleanos.value = res.payload.cumpleanos || []
    // Alumno aprobado: deja listos sus datos para precargar el registro de árbitros
    if (res.payload.precargaArbitro) {
      sessionStorage.setItem(CLAVE_PRECARGA_REGISTRO, JSON.stringify(precargaRegistroArbitro(res.payload.precargaArbitro)))
    }
  } catch (e) {
    console.error('cargarInicio:', e)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarInicio)
</script>

<style scoped>
.categoria-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #334155;
}
.categoria-label i { font-size: 0.95rem; color: #dc2626; }

.modern-menu-card {
  background: white;
  border-radius: 16px;
  padding: clamp(15px, 3vw, 18px);
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.modern-menu-card.destacada { border: 2px solid #16a34a; }
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
.card-text { flex: 1; min-width: 0; }
.card-text h5 { font-size: 0.95rem; color: #1e293b; }
.extra-small { font-size: 0.75rem; }
.card-arrow { margin-left: auto; color: #cbd5e1; font-size: 1rem; align-self: center; }
.modern-menu-card:hover {
  border-color: #f87171;
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06);
}
.modern-menu-card:hover .icon-box { background: #dc2626; color: white; }

.sidebar-professional {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  background: #e2e8f0;
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fw-black { font-weight: 800; font-size: 0.85rem; color: #1e293b; }
.sidebar-scroll-container { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
.notif-section { border-bottom: 1px dashed #e2e8f0; }
.section-label {
  width: 100%;
  background: none;
  border: 0;
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
}
.section-label:hover { opacity: 0.7; }
.section-label i { font-size: 0.9rem; color: #dc2626; }
.badge-count {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 800;
}
.collapse-content { margin-top: 8px; }
.cal-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #f1f5f9; border-radius: 10px; min-width: 44px; height: 44px;
}
.cal-box .day { font-weight: 800; font-size: 1rem; line-height: 1; color: #1e293b; }
.cal-box .month { font-size: 0.6rem; font-weight: 700; }
.today-bg { background: #dc2626 !important; }
.today-bg .day { color: white !important; }
.event-card-modern {
  display: flex; gap: 12px; margin-bottom: 6px; background: #fdfdfd; padding: 8px; border-radius: 12px; border: 1px solid #e2e8f0;
}
.event-info { flex: 1; min-width: 0; }
.event-info strong { font-size: 0.8rem; color: #1e293b; display: block; line-height: 1.2; }
.event-info p { font-size: 0.72rem; color: #64748b; margin: 0; }
.empty-msg { font-size: 0.7rem; color: #94a3b8; font-style: italic; }
.animate__animated { animation-duration: 0.5s; }
</style>
