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
            <div class="modern-card d-flex align-items-center gap-3 px-4 py-3 p-md-3 w-100 h-100 bg-white shadow-sm position-relative">

            <div class="icon-box flex-shrink-0 d-flex align-items-center justify-content-center position-relative">
              <!-- Dot rojo de notificación (solo Designaciones Rechazadas con pendientes) -->
              <span v-if="item.badgeRechazos && rechazosPendientes > 0" class="dot-notif"></span>
              <span v-if="item.badgeReuniones && reunionesPendientes > 0" class="dot-notif"></span>
              <i :class="item.icon"></i>
            </div>

              <div class="flex-grow-1">
                <h5 class="m-0 fw-bold text-dark d-flex align-items-center gap-2 flex-wrap" style="font-size: 0.90rem;">
                  {{ item.title }}
                  <span v-if="item.badgeRechazos && rechazosPendientes > 0" class="badge-nuevos rounded-pill">
                    {{ rechazosPendientes }} {{ rechazosPendientes === 1 ? 'NUEVO' : 'NUEVOS' }}
                  </span>
                  <span v-if="item.badgeReuniones && reunionesPendientes > 0" class="badge-nuevos rounded-pill">
                    {{ reunionesPendientes }} {{ reunionesPendientes === 1 ? 'reunión para aprobar' : 'reuniones para aprobar' }}
                  </span>
                </h5>
                <p class="m-0 text-muted lh-sm mt-1" style="font-size: 0.75rem;">{{ item.desc }}</p>
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
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import { CATEGORIAS_ADMIN } from '@/config/modulosAdmin'
import { usePermisos } from '@/composables/usePermisos'

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

const reunionesPendientes = ref(0)

const cargarReunionesPendientes = async () => {
  if (!tienePermiso('gestion_reuniones')) return
  try {
    const res = await api.get({ entity: 'eventos', action: 'contarReunionesPendientes' })
    if (res?.ok) reunionesPendientes.value = Number(res.payload) || 0
  } catch (err) {
    console.error('Error al contar reuniones pendientes:', err)
  }
}

const { cargarPermisos, tienePermiso } = usePermisos()

const gruposConItems = computed(() => {
  return CATEGORIAS_ADMIN
    .map(cat => ({ ...cat, items: cat.items.filter(item => tienePermiso(item.modulo)) }))
    .filter(cat => cat.items.length > 0)
})

onMounted(async () => {
  cargarRechazosPendientes()
  await cargarPermisos(true)
  cargarReunionesPendientes()
})
</script>

<style scoped>
/* ============ CATEGORIAS ============ */
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
  width: 56px;
  height: 56px;
  min-width: 56px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 16px;
  font-size: 1.5rem;
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
