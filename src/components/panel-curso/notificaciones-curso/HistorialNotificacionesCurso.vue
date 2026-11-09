<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-bell-fill me-1"></i> Notificaciones
          </h4>
          <span class="text-muted small d-block mt-1">Avisos del curso: cambios de estado, notas y observaciones</span>
        </div>
        <button v-if="noLeidas.length" @click="marcarLeidas" class="btn btn-outline-secondary btn-sm fw-bold align-self-start align-self-md-center">
          <i class="bi bi-check2-all me-1"></i> Marcar todas como leídas
        </button>
      </div>

      <div v-if="cargando" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando notificaciones...</p>
      </div>
      <div v-else-if="!notificaciones.length" class="card-body text-center py-5 text-muted">
        <i class="bi bi-bell-slash fs-1 d-block mb-2 opacity-50"></i>
        <span class="fw-bold">No tenés notificaciones.</span>
      </div>
      <div v-else class="card-body p-3 p-md-4 d-flex flex-column gap-2">
        <div v-for="n in notificaciones" :key="n.id" class="notif-item d-flex gap-3 align-items-start" :class="{ nueva: !n.leida }">
          <div class="icono-notif flex-shrink-0" :class="ICONOS_NOTIFICACION[n.tipo]?.bg || 'bg-secondary'">
            <i :class="['bi', ICONOS_NOTIFICACION[n.tipo]?.icono || 'bi-bell', 'text-white']"></i>
          </div>
          <div class="min-w-0 flex-grow-1">
            <div class="d-flex flex-wrap justify-content-between gap-2">
              <span class="fw-bold text-dark">{{ n.titulo }}</span>
              <span class="small text-muted fw-bold">{{ fechaHoraDMA(n.fecha) }}</span>
            </div>
            <div class="small text-dark texto-notif mt-1">{{ n.mensaje }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { useNotificacionesCurso, ICONOS_NOTIFICACION } from '@/composables/useNotificacionesCurso'
import { fechaHoraDMA } from '@/utils/fechas'

useHead({ title: 'Notificaciones | Curso AAAB' })

const { notificaciones, noLeidas, cargando, cargar, marcarLeidas } = useNotificacionesCurso()

onMounted(cargar)
</script>

<style scoped>
.notif-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}
.notif-item.nueva { border-left: 4px solid #dc2626; background: #fef2f2; }
.icono-notif {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.texto-notif { white-space: pre-line; }
.min-w-0 { min-width: 0; }
</style>
