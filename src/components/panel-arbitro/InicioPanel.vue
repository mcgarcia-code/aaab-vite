<template>
  <div class="container-fluid py-4 animate__animated animate__fadeIn">
    <div class="row g-3 g-md-4">
      <div class="col-12 col-lg-8 col-xl-9 order-2 order-lg-1">
    <!-- ============ CHIP CONTEXTUAL ============ -->
    <div v-if="proximaDesignacion" class="chips-contextuales mb-4">
      <RouterLink
        to="/panel-arbitro/designaciones"
        class="chip-contextual chip-designacion text-decoration-none"
      >
        <i class="bi bi-calendar4-week chip-icono"></i>
        <div class="chip-cuerpo">
          <span class="chip-label">Próxima designación</span>
          <span class="chip-valor">{{ textoProximaDesignacion }}</span>
          <span class="chip-cta">Entrá a Mis Designaciones para ver el detalle <i class="bi bi-arrow-right"></i></span>
        </div>
      </RouterLink>
    </div>
      <!-- ============ MODULOS CATEGORIZADOS ============ -->
        <div v-for="grupo in gruposConItems" :key="grupo.categoria" class="mb-4">
          <div class="categoria-label">
            <i :class="grupo.icono"></i>
            <span>{{ grupo.categoria }}</span>
          </div>

          <div class="row g-3">
            <div class="col-12 col-sm-6 col-md-4 d-flex" v-for="item in grupo.items" :key="item.title">
              <component
                :is="item.href ? 'a' : 'RouterLink'"
                :href="item.href"
                :to="item.to"
                :target="item.href ? '_blank' : null"
                rel="noopener noreferrer"
                class="text-decoration-none d-flex w-100 h-100"
              >
                <div class="modern-menu-card shadow-sm w-100 h-100">
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

      </div>

      <!-- ============ SIDEBAR CON TABS ============ -->
      <div class="col-12 col-lg-4 col-xl-3 order-1 order-lg-2">
        <aside class="sidebar-professional shadow-sm mb-3 mb-lg-0 sticky-lg-top" style="top: 20px; z-index: 10;">
          <div class="sidebar-header">
            <div class="d-flex align-items-center">
              <i class="bi bi-calendar3 me-2 text-danger fs-5"></i>
              <span class="fw-black ls-1 text-uppercase">Avisos y Eventos</span>
            </div>
            <div v-if="cargando" class="spinner-border spinner-border-sm text-danger"></div>
          </div>

          <!-- TABS -->
          <div class="tabs-avisos">
            <button
              v-for="tab in tabs"
              :key="tab.clave"
              @click="tabActiva = tab.clave"
              class="tab-btn"
              :class="{ activa: tabActiva === tab.clave }"
            >
              {{ tab.etiqueta }}
              <span v-if="tab.cantidad > 0" class="tab-badge">{{ tab.cantidad }}</span>
            </button>
          </div>

          <div class="sidebar-scroll-container p-2 p-lg-3 overflow-auto" style="max-height: calc(100vh - 160px);">

            <!-- REUNIONES -->
            <div v-show="tabActiva === 'reuniones'" class="animate__animated animate__fadeIn">
              <div v-if="proximasFechas.length > 0">
                <div class="event-card-modern" v-for="ev in proximasFechas" :key="ev.id">
                  <div class="cal-box">
                    <span class="day">{{ ev.fecha_evento.split('-')[2] }}</span>
                    <span class="month text-danger">{{ obtenerMesCorta(ev.fecha_evento) }}</span>
                  </div>
                  <div class="event-info">
                    <strong :class="{ 'text-danger': ev.categoria === 'urgente' }">{{ ev.titulo }}</strong>
                    <p class="mb-0">{{ ev.descripcion || 'Lugar a confirmar' }}</p>
                  </div>
                </div>
              </div>
              <p v-else class="empty-msg">No hay eventos próximos.</p>
            </div>

            <!-- CUMPLEAÑOS -->
            <div v-show="tabActiva === 'cumpleanos'" class="animate__animated animate__fadeIn">
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

            <!-- RECORDATORIOS -->
            <div v-show="tabActiva === 'recordatorios'" class="animate__animated animate__fadeIn">
              <div v-if="avisos.recordatorio && avisos.recordatorio.length > 0">
                <div v-for="rec in avisos.recordatorio" :key="rec.id" class="reminder-pill">
                  <i class="bi bi-info-circle-fill me-2"></i>
                  <span v-html="rec.descripcion"></span>
                </div>
              </div>
              <p v-else class="empty-msg">No hay recordatorios.</p>
            </div>

          </div>
        </aside>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { auth } from '../../api/auth'

useHead({ title: 'Panel de Inicio | AAAB' })

// ====================================================
// MENU: cada item con su categoría
// ====================================================
const CATEGORIAS = [
  { categoria: 'Mi Perfil', icono: 'bi bi-person-circle' },
  { categoria: 'Actividad Arbitral', icono: 'bi bi-person-raised-hand' },
  { categoria: 'Administración', icono: 'bi bi-folder2' },
  { categoria: 'Tesorería', icono: 'bi bi-cash-stack' },
  { categoria: 'Herramientas', icono: 'bi bi-tools' }
]

const menuItems = [
  { to: '/panel-arbitro/datos', title: 'Datos Personales', icon: 'bi bi-person-lines-fill', desc: 'Ver legajo y seguridad.', categoria: 'Mi Perfil' },
  { to: '/panel-arbitro/disponibilidad', title: 'Disponibilidad', icon: 'bi bi-clock-history', desc: 'Modificá tus horarios.', categoria: 'Mi Perfil' },
  { to: '/panel-arbitro/credencial', title: 'Credencial Digital', icon: 'bi bi-person-badge', desc: 'Carnet oficial 2026.', categoria: 'Mi Perfil' },

  { to: '/panel-arbitro/rendimiento', title: 'Mi Rendimiento', icon: 'bi bi-graph-up-arrow', desc: 'Exámenes y asistencia a reuniones', categoria: 'Actividad Arbitral' },
  { to: '/panel-arbitro/mis-observaciones', title: 'Mis Observaciones', icon: 'bi bi-eye', desc: 'Visualizar observaciones de tus partidos', categoria: 'Actividad Arbitral' },

  { to: '/panel-arbitro/designaciones', title: 'Mis Designaciones', icon: 'bi bi-calendar4-week', desc: 'Mis Designaciones', categoria: 'Actividad Arbitral' },
  { to: '/panel-arbitro/coordinadores', title: 'Coordinadores', icon: 'bi bi-check', desc: 'Cargar y visualizar exámenes', rolesPermitidos: [4], categoria: 'Actividad Arbitral' },
  { to: '/panel-arbitro/observaciones', title: 'Observaciones', icon: 'bi bi-eye', desc: 'Cargar y visualizar observaciones realizadas por vos', rolesPermitidos: [2, 4], categoria: 'Actividad Arbitral' },
  { to: '/panel-arbitro/examen-asamblea', title: 'Examen Asamblea General - Reunión Mensual', icon: 'bi bi-journal-check', desc: 'Rendí el examen teórico online', categoria: 'Actividad Arbitral' },

  { to: '/panel-arbitro/licencia', title: 'Solicitar Licencias', icon: 'bi bi-calendar-check', desc: 'Inasistencias con antelación.', categoria: 'Administración' },
  { to: '/panel-arbitro/sanciones', title: 'Tribunal de Ética', icon: 'bi bi-shield-exclamation', desc: 'Consultá tus sanciones.', categoria: 'Administración' },

  { to: '/panel-arbitro/indumentaria', title: 'Indumentaria', icon: 'bi bi-bag-fill', desc: 'Pedidos de indumentaria.', categoria: 'Tesorería' },
  { to: '/panel-arbitro/aportes', title: 'Mis Aportes', icon: 'bi bi-cash-coin', desc: 'Consultá el estado de tus aportes.', categoria: 'Tesorería' },

  { to: '/panel-arbitro/facturacion', title: 'Facturación', icon: 'bi bi-receipt', desc: 'Consultá los datos fiscales de los Clubes', categoria: 'Herramientas' },
  { href: 'https://refflix.com.ar', title: 'Ref-Flix', icon: 'bi bi-cast', desc: 'Plataforma de videos', categoria: 'Herramientas' },
  { to: '/panel-arbitro/delegado-tecnico', title: 'Delegado Técnico', icon: 'bi bi-person-bounding-box', desc: 'Planilla Digital para Delegados Técnicos', categoria: 'Herramientas' }
]

const menuItemsFiltrados = computed(() => {
  const sesion = auth.getUser()
  if (!sesion) return []
  return menuItems.filter((item) => !item.rolesPermitidos || item.rolesPermitidos.includes(sesion.rol))
})

const gruposConItems = computed(() => {
  return CATEGORIAS
    .map(cat => ({
      ...cat,
      items: menuItemsFiltrados.value.filter(item => item.categoria === cat.categoria)
    }))
    .filter(grupo => grupo.items.length > 0)
})

// ====================================================
// AVISOS Y TABS
// ====================================================
const avisos = ref({ reunion: [], urgente: [], cumpleanos: [], recordatorio: [], recuperatorio: [], asamblea: [] })
const cargando = ref(true)

const tabActiva = ref('reuniones')

const proximasFechas = computed(() => {
  const combinados = [...(avisos.value.reunion || []), ...(avisos.value.urgente || []), ...(avisos.value.recuperatorio || []), ...(avisos.value.asamblea || [])]
  return combinados.sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento))
})

const tabs = computed(() => [
  { clave: 'reuniones', etiqueta: 'Reuniones', cantidad: proximasFechas.value.length },
  { clave: 'cumpleanos', etiqueta: 'Cumples', cantidad: (avisos.value.cumpleanos || []).length },
  { clave: 'recordatorios', etiqueta: 'Notas', cantidad: (avisos.value.recordatorio || []).length }
])

const cargarAvisos = async () => {
  try {
    const res = await api.get({ entity: 'eventos', action: 'obtenerDashboardAvisos' })
    if (res.ok || res.success) avisos.value = res.payload
  } catch (e) { console.error(e) } finally { cargando.value = false }
}

// ====================================================
// PROXIMA DESIGNACION (para el header)
// ====================================================
const proximaDesignacion = ref(null)

const parsearFechaDesignacion = (fecha) => {
  if (!fecha) return 0
  const texto = String(fecha).trim().slice(0, 10)

  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()

  m = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (m) {
    const anio = m[3].length === 2 ? '20' + m[3] : m[3]
    return new Date(Number(anio), Number(m[2]) - 1, Number(m[1])).getTime()
  }

  return 0
}

const fechaLimpiaDesignacion = (fecha) => {
  const f = String(fecha || '').trim().slice(0, 10)
  return (!f || f.startsWith('0000')) ? '' : f
}

const cargarProximaDesignacion = async () => {
  try {
    const res = await api.get({ entity: 'designaciones', action: 'obtenerDesignacionesArbitro' })
    if ((res.ok || res.success) && res.payload) {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const futuras = res.payload
        .filter(p => {
          const t = parsearFechaDesignacion(fechaLimpiaDesignacion(p.fecha))
          return !t || t >= hoy.getTime()
        })
        .sort((a, b) => {
          const diff = parsearFechaDesignacion(fechaLimpiaDesignacion(a.fecha)) - parsearFechaDesignacion(fechaLimpiaDesignacion(b.fecha))
          if (diff !== 0) return diff
          return String(a.horario || '').localeCompare(String(b.horario || ''))
        })
      proximaDesignacion.value = futuras[0] || null
    }
  } catch (e) { console.error(e) }
}

const textoProximaDesignacion = computed(() => {
  const p = proximaDesignacion.value
  if (!p) return ''
  const local = p.local || ''
  const visitante = p.visitante || ''
  const partido = (local && visitante) ? `${local} vs ${visitante}` : (local || visitante || 'Partido a confirmar')

  const t = parsearFechaDesignacion(p.fecha)
  let fechaTexto = ''
  if (t) {
    const d = new Date(t)
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    fechaTexto = `${dias[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  const hora = p.horario ? String(p.horario).slice(0, 5) : ''
  const cuando = [fechaTexto, hora].filter(Boolean).join(' · ')

  return cuando ? `${partido} — ${cuando}` : partido
})

// ====================================================
// HELPERS DE FECHA
// ====================================================
const obtenerMesNombre = (n) => {
  const meses = ['', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  return meses[parseInt(n)]
}

const obtenerMesCorta = (f) => {
  const date = new Date(f + 'T00:00:00')
  return date.toLocaleString('es-AR', { month: 'short' }).replace('.', '').toUpperCase()
}

const esHoy = (diaMes) => {
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
  return diaMes === hoy
}

onMounted(() => {
  cargarAvisos()
  cargarProximaDesignacion()
})
</script>

<style scoped>
/* ============ CHIP CONTEXTUAL ============ */
.chips-contextuales {
  display: block;
}

.chip-contextual {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  border-radius: 14px;
  transition: all 0.2s ease;
  width: 100%;
}

.chip-designacion {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.chip-designacion:hover {
  background: #fee2e2;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.08);
}

.chip-icono {
  font-size: 1.6rem;
  color: #dc2626;
}

.chip-cuerpo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
}
.chip-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.75; font-weight: 700; }
.chip-valor { font-weight: 800; font-size: 0.88rem; }
.chip-cta {
  font-size: 0.68rem;
  font-weight: 600;
  color: #dc2626;
  opacity: 0.85;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 1px;
}
.chip-cta i { transition: transform 0.2s ease; }
.chip-designacion:hover .chip-cta i { transform: translateX(3px); }

/* ============ CATEGORIAS ============ */
.categoria-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e2e8f0;
}
.categoria-label i { font-size: 0.95rem; color: #dc2626; }

/* ============ TARJETAS MODULOS ============ */
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

.icon-box {
  width: 52px;
  height: 52px;
  min-width: 52px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  transition: all 0.3s ease;
}

.card-text { flex: 1; min-width: 0; }
.card-text h5 { font-size: 0.92rem; color: #1e293b; }
.extra-small { font-size: 0.72rem; }
.card-arrow { margin-left: auto; color: #cbd5e1; font-size: 1rem; align-self: center; }

.modern-menu-card:hover {
  border-color: #f87171;
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06);
}
.modern-menu-card:hover .icon-box { background: #dc2626; color: white; }

/* ============ SIDEBAR ============ */
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fw-black { font-weight: 800; font-size: 0.85rem; color: #1e293b; }

/* ============ TABS ============ */
.tabs-avisos {
  display: flex;
  gap: 4px;
  padding: 10px 12px 0;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.tab-btn:hover { color: #dc2626; }
.tab-btn.activa {
  color: #dc2626;
  border-bottom-color: #dc2626;
  background: white;
}

.tab-badge {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.62rem;
  font-weight: 800;
}
.tab-btn.activa .tab-badge { background: #dc2626; color: white; }

/* ============ SCROLL ============ */
.sidebar-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.sidebar-scroll-container::-webkit-scrollbar { width: 5px; }
.sidebar-scroll-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

/* ============ CALENDARIO ============ */
.cal-box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #f1f5f9; border-radius: 10px; min-width: 44px; height: 44px;
}
.cal-box .day { font-weight: 800; font-size: 1rem; line-height: 1; color: #1e293b; }
.cal-box .month { font-size: 0.6rem; font-weight: 700; }
.today-bg { background: #dc2626 !important; color: white !important; }
.today-bg .day { color: white !important; }

/* ============ EVENT CARDS ============ */
.event-card-modern {
  display: flex; gap: 12px; margin-bottom: 6px; background: #fdfdfd; padding: 8px; border-radius: 12px; border: 1px solid #e2e8f0;
}
.event-info { flex: 1; min-width: 0; }
.event-info strong {
  font-size: 0.8rem; color: #1e293b; display: block; line-height: 1.2; white-space: normal;
}
.event-info p {
  font-size: 0.72rem; color: #64748b; margin: 0; white-space: normal;
}

.reminder-pill { background: #fffbeb; color: #92400e; padding: 8px 12px; border-radius: 10px; font-size: 0.72rem; border-left: 3px solid #f59e0b; margin-bottom: 5px; }
.empty-msg { font-size: 0.7rem; color: #94a3b8; font-style: italic; padding: 8px 0; }

.animate__animated { animation-duration: 0.4s; }
</style>
