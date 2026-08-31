<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <!-- CABECERA -->
    <div class="dashboard-header mb-4 mb-md-5 mt-4 text-center text-md-start">
      <h3 class="text-white fw-bold mb-1 fs-4 fs-md-3" style="letter-spacing: -0.5px;">¡Bienvenido al Panel de Gestión!</h3>
      <p class="text-white opacity-75 m-0 small">Seleccioná un módulo para gestionar la AAAB</p>
    </div>

    <!-- CATEGORIAS -->
    <div v-for="grupo in gruposConItems" :key="grupo.categoria" class="mb-4 mb-md-5">
      <div class="categoria-label">
        <i :class="grupo.icono"></i>
        <span>{{ grupo.categoria }}</span>
      </div>

      <div class="row g-3 g-md-4">
        <div class="col-12 col-sm-6 col-lg-4" v-for="item in grupo.items" :key="item.title">
          <RouterLink :to="item.to" class="text-decoration-none h-100 d-block">
            <div class="modern-card d-flex align-items-center gap-3 p-4 p-md-3 w-100 h-100 bg-white shadow-sm position-relative">

            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center position-relative">
              <!-- Dot rojo de notificación (solo Designaciones Rechazadas con pendientes) -->
              <span v-if="item.badgeRechazos && rechazosPendientes > 0" class="dot-notif"></span>
              <i :class="item.icon"></i>
            </div>

              <div class="flex-grow-1">
                <h5 class="m-0 fw-bold text-dark fs-6 d-flex align-items-center gap-2 flex-wrap">
                  {{ item.title }}
                  <span v-if="item.badgeRechazos && rechazosPendientes > 0" class="badge-nuevos rounded-pill">
                    {{ rechazosPendientes }} {{ rechazosPendientes === 1 ? 'NUEVO' : 'NUEVOS' }}
                  </span>
                </h5>
                <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.85rem;">{{ item.desc }}</p>
              </div>

              <div class="card-arrow text-secondary fs-5">
                <i class="bi bi-chevron-right"></i>
              </div>

            </div>
          </RouterLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { auth } from '../../api/auth'
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'

const user = auth.getUser()
const userRole = user ? user.rol : null

useHead({
  title: 'Panel de Gestión | AAAB',
})

// Conteo de designaciones rechazadas sin resolver (estado = 'creado')
const rechazosPendientes = ref(0)

const cargarRechazosPendientes = async () => {
  try {
    const res = await api.get({
      entity: 'designaciones',
      action: 'contarRechazosPendientes'
    })
    if (res.ok || res.success) {
      rechazosPendientes.value = res.payload || 0
    }
  } catch (err) {
    console.error('Error al contar rechazos pendientes:', err)
  }
}

// ====================================================
// CATEGORIAS (cada una con sus roles y sub-tarjetas)
// ====================================================
const categorias = [
  {
    categoria: 'Secretaría General',
    icono: 'bi bi-pc-display-horizontal',
    rolesPermitidos: ['admin', 'etica', 'secretario', 'designador', 'coordinador general'],
    items: [
      { to: '/panel-admin/secretaria/modificacion-datos', title: 'Legajos', icon: 'bi bi-people', desc: 'Actualizar información personal y disponibilidad de los árbitros.' },
      { to: '/panel-admin/secretaria/licencias', title: 'Licencias', icon: 'bi bi-calendar-date-fill', desc: 'Gestionar las licencias y permisos de inasistencia.' },
      { to: '/panel-admin/secretaria/eventos-notificaciones', title: 'Eventos', icon: 'bi bi-bell', desc: 'Gestionar avisos, reuniones y noticias para los árbitros.' },
      { to: '/panel-admin/secretaria/grupos', title: 'Grupos', icon: 'bi bi-people-fill', desc: 'Administrar grupos de árbitros' },
      { to: '/panel-admin/secretaria/solicitudes-institucionales', title: 'Solicitudes Institucionales', icon: 'bi bi-envelope-paper', desc: 'Gestionar solicitudes de coordinadores.' },
    ]
  },
  {
    categoria: 'Tribunal de Ética',
    icono: 'bi bi-shield-exclamation',
    rolesPermitidos: ['admin', 'etica', 'secretario', 'designador'],
    items: [
      { to: '/panel-admin/tribunal/sanciones', title: 'Listado de Sanciones', icon: 'bi bi-journal-text', desc: 'Consultar, editar o dar de baja sanciones vigentes e históricas.' },
      { to: '/panel-admin/tribunal/cargar-sancion', title: 'Cargar Sanción', icon: 'bi bi-shield-plus', desc: 'Registrar una nueva resolución disciplinaria en el legajo del árbitro.' }
    ]
  },
  {
    categoria: 'Designaciones Arbitrales',
    icono: 'bi bi-calendar4-week',
    rolesPermitidos: ['admin', 'designador', 'secretario','coordinador general', 'etica'],
    items: [
      { to: '/panel-admin/designaciones/disponibilidad-licencias', title: 'Disponibilidad y Licencias', icon: 'bi bi-calendar-date-fill', desc: 'Chequear disponibilidad y licencias de árbitros.' },
      { to: '/panel-admin/designaciones/partidos', title: 'Carga y visualización de partidos', icon: 'bi bi-clipboard2-data-fill', desc: 'Visualizar partidos asignados y pendientes.' },
      { to: '/panel-admin/designaciones/designaciones-rechazadas', title: 'Designaciones Rechazadas', icon: 'bi bi-graph-up-arrow', desc: 'Visualizar designaciones rechazadas.', badgeRechazos: true }
    ]
  },
  {
    categoria: 'Tesorería',
    icono: 'bi bi-cash-stack',
    rolesPermitidos: ['admin', 'tesorero', 'secretario', 'designador', 'indumentaria'],
    items: [
      { to: '/panel-admin/tesoreria/datos-personales', title: 'Datos Personales', icon: 'bi bi-person-lines-fill', desc: 'Consultar y gestionar información de los miembros.' },
      { to: '/panel-admin/tesoreria/aportes-pagos', title: 'Aportes y Pagos', icon: 'bi bi-cash-coin', desc: 'Registrar cobros de cuotas y aportes mensuales.' },
      { to: '/panel-admin/tesoreria/indumentaria', title: 'Indumentaria', icon: 'bi bi-bag-check', desc: 'Control de inventario, talles y entrega de pedidos.' }
    ]
  },
  {
    categoria: 'Coordinador de Desarrollo Arbitral',
    icono: 'bi bi-person-workspace',
    rolesPermitidos: ['admin', 'coordinador general', 'secretario', 'designador'],
    items: [
      { to: '/panel-admin/desarrollo-arbitral/observaciones', title: 'Observaciones realizadas', icon: 'bi bi-clipboard-data-fill', desc: 'Registro y seguimiento de las observaciones arbitrales.' },
      { to: '/panel-admin/desarrollo-arbitral/reuniones-mensuales', title: 'Reuniones Mensuales', icon: 'bi bi-calendar-event', desc: 'Registro de presentes y ausentes en reuniones mensuales.' },
      { to: '/panel-admin/desarrollo-arbitral/resumen-arbitros', title: 'Planilla General de Árbitros', icon: 'bi bi-graph-up-arrow', desc: 'Administración de exámenes teóricos/físicos.' },
      { to: '/panel-admin/desarrollo-arbitral/habilitacion-examenes-asamblea', title: 'Habilitación de Exámenes Asamblea - Reuniones Mensuales', icon: 'bi bi-shield-check', desc: 'Elegí qué grupos quedan habilitados para rendir el examen teórico.' },
      { to: '/panel-admin/desarrollo-arbitral/planilla-general-observaciones', title: 'Planilla General de Observaciones', icon: 'bi bi-clipboard2-data-fill', desc: 'Visualizar todas las observaciones realizadas a los árbitros.' }
    ]
  },
  {
    categoria: 'Curso de Árbitros',
    icono: 'bi bi-file-person-fill',
    rolesPermitidos: ['admin', 'secretario', 'curso'],
    items: [
      { to: '/panel-admin/curso-arbitros/legajos-curso', title: 'Legajos', icon: 'bi bi-person-lines-fill', desc: 'Consultar y gestionar información de los miembros.' },
      { to: '/panel-admin/curso-arbitros/observaciones-curso', title: 'Observaciones Realizadas', icon: 'bi bi-clipboard-data-fill', desc: 'Registro y seguimiento de las observaciones arbitrales.' },
      { to: '/panel-admin/curso-arbitros/examenes-curso', title: 'Exámenes', icon: 'bi bi-journal-check', desc: 'Gestionar exámenes y resultados del curso.' }
    ]
  },
  {
    categoria: 'Herramientas',
    icono: 'bi bi-tools',
    rolesPermitidos: ['admin', 'secretario', 'facturacion', 'tesorero'],
    items: [
      { to: '/panel-admin/facturacion', title: 'Facturación', icon: 'bi bi-receipt', desc: 'Administrar datos fiscales y entidades vinculadas.' }
    ]
  }
]

const gruposConItems = computed(() => {
  return categorias.filter(cat => {
    if (userRole === 'admin') return true
    return cat.rolesPermitidos && cat.rolesPermitidos.includes(userRole)
  })
})

onMounted(cargarRechazosPendientes)
</script>

<style scoped>
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
.categoria-label i { font-size: 1rem; color: #f87171; }

/* ============ TARJETA MODERNA HORIZONTAL ============ */
.modern-card {
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.icon-box {
  width: clamp(48px, 10vw, 56px);
  height: clamp(48px, 10vw, 56px);
  background: #fef2f2;
  color: #dc2626;
  border-radius: 16px;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  transition: all 0.3s ease;
}

.card-arrow {
  transition: all 0.3s ease;
}

.modern-card:hover {
  border-color: #f87171;
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.06) !important;
}

.modern-card:hover .icon-box {
  background: #dc2626;
  color: #ffffff;
}

.modern-card:hover .card-arrow {
  color: #dc2626;
  transform: translateX(5px);
}

.animate__animated { animation-duration: 0.5s; }

/* ============ BADGE "NUEVOS" + DOT ============ */
.badge-nuevos {
  background: #dc3545;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  text-transform: uppercase;
  line-height: 1;
}

.dot-notif {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  background: #dc3545;
  border: 2px solid #fff;
  border-radius: 50%;
  animation: pulso 1.5s infinite;
  z-index: 2;
}

@keyframes pulso {
  0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(220, 53, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
}
</style>
