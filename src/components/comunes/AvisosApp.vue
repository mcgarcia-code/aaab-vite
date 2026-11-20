<template>
  <div class="avisos-app" aria-live="polite">
    <!-- Sin conexión -->
    <div v-if="sinConexion" class="aviso aviso-oscuro" role="status">
      <i class="bi bi-wifi-off" aria-hidden="true"></i>
      <span class="flex-grow-1">Sin conexión. Lo que ya tenías abierto sigue funcionando; los datos nuevos se cargan al volver la señal.</span>
    </div>

    <!-- Versión nueva -->
    <div v-if="needRefresh" class="aviso" role="status">
      <i class="bi bi-arrow-repeat text-danger" aria-hidden="true"></i>
      <span class="flex-grow-1">Hay una versión nueva del sitio.</span>
      <button type="button" class="btn btn-danger btn-sm fw-bold" @click="actualizar">Actualizar</button>
      <button type="button" class="btn-close" aria-label="Más tarde" title="Más tarde" @click="needRefresh = false"></button>
    </div>

    <!-- Instalar la app (solo dentro de los paneles) -->
    <div v-else-if="mostrarInstalar" class="aviso" role="status">
      <img src="/android-chrome-192x192.png" alt="" class="icono-app">
      <span class="flex-grow-1">
        <strong class="d-block">Instalá la app de la AAAB</strong>
        <template v-if="esIos">Tocá <i class="bi bi-box-arrow-up" aria-label="Compartir"></i> y después <strong>“Agregar a inicio”</strong>.</template>
        <template v-else>Abrila como una app y usala aunque se corte la señal.</template>
      </span>
      <button v-if="!esIos" type="button" class="btn btn-danger btn-sm fw-bold" @click="instalar">Instalar</button>
      <button type="button" class="btn-close" aria-label="No mostrar por ahora" title="No mostrar por ahora" @click="descartarInstalacion"></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { esAppInstalada } from '@/utils/app'

// Avisos de la app instalable (PWA): versión nueva, sin conexión e invitación a instalar.
const route = useRoute()

// ─── Service worker: actualizaciones ───────────────────────
const UNA_HORA = 60 * 60 * 1000
const { needRefresh, updateServiceWorker } = useRegisterSW({
  // Revisa cada hora si hay una versión nueva publicada (por si la app queda abierta mucho tiempo)
  onRegisteredSW(_url, registro) {
    if (registro) setInterval(() => { if (navigator.onLine) registro.update() }, UNA_HORA)
  }
})
const actualizar = () => updateServiceWorker(true)

// ─── Conexión ──────────────────────────────────────────────
const sinConexion = ref(typeof navigator !== 'undefined' && !navigator.onLine)
const alCambiarConexion = () => { sinConexion.value = !navigator.onLine }

// ─── Instalación ───────────────────────────────────────────
const CLAVE_DESCARTE = 'aaab.instalar.descartado'
const DIAS_SIN_INSISTIR = 30

const esIos = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const yaInstalada = esAppInstalada()
const eventoInstalacion = ref(null)

const descartadoReciente = () => {
  try {
    const fecha = Number(localStorage.getItem(CLAVE_DESCARTE) || 0)
    return Date.now() - fecha < DIAS_SIN_INSISTIR * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}
const descartado = ref(descartadoReciente())

const mostrarInstalar = computed(() =>
  !yaInstalada && !descartado.value && route.path.startsWith('/panel-') && (esIos || !!eventoInstalacion.value)
)

const alPoderInstalar = (e) => {
  e.preventDefault()
  eventoInstalacion.value = e
}

const instalar = async () => {
  const evento = eventoInstalacion.value
  if (!evento) return
  evento.prompt()
  await evento.userChoice.catch(() => null)
  eventoInstalacion.value = null
}

const descartarInstalacion = () => {
  descartado.value = true
  try {
    localStorage.setItem(CLAVE_DESCARTE, String(Date.now()))
  } catch {
    // Sin almacenamiento: se vuelve a ofrecer en la próxima visita
  }
}

onMounted(() => {
  window.addEventListener('online', alCambiarConexion)
  window.addEventListener('offline', alCambiarConexion)
  window.addEventListener('beforeinstallprompt', alPoderInstalar)
  window.addEventListener('appinstalled', descartarInstalacion)
})
onBeforeUnmount(() => {
  window.removeEventListener('online', alCambiarConexion)
  window.removeEventListener('offline', alCambiarConexion)
  window.removeEventListener('beforeinstallprompt', alPoderInstalar)
  window.removeEventListener('appinstalled', descartarInstalacion)
})
</script>

<style scoped>
/* Arriba de la barra inferior del celular; en escritorio, abajo a la izquierda */
.avisos-app {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(76px + env(safe-area-inset-bottom));
  z-index: 1080;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
@media (min-width: 992px) {
  .avisos-app { left: 24px; right: auto; bottom: 24px; width: 420px; }
}

.aviso {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.18);
  font-size: 0.85rem;
  color: #0f172a;
}
.aviso > .bi { font-size: 1.2rem; }
.aviso-oscuro { background: #0f172a; border-color: #0f172a; color: #e2e8f0; }
.icono-app { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; }
</style>
