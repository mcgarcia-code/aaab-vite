<template>
  <Teleport to="body">
    <!-- Contenedor fijo arriba a la derecha; los toasts se apilan hacia abajo -->
    <div class="toast-contenedor" :style="{ zIndex: zIndex }">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast-item shadow-lg d-flex align-items-start gap-2 bg-white"
          :class="'toast-' + t.tipo"
          role="alert"
          @mouseenter="pausar(t)"
          @mouseleave="reanudar(t)"
        >
          <!-- Ícono según tipo -->
          <span
            class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 toast-icono"
            :class="claseIcono(t.tipo)"
          >
            <span class="material-icons" style="font-size: 20px;">{{ icono(t.tipo) }}</span>
          </span>

          <!-- Texto -->
          <div class="flex-grow-1 overflow-hidden">
            <div v-if="t.titulo" class="fw-bold text-dark small lh-sm">{{ t.titulo }}</div>
            <div class="fw-bold text-dark small lh-sm">{{ t.mensaje }}</div>
          </div>

          <!-- Cerrar -->
          <button
            type="button"
            class="btn-close btn-sm flex-shrink-0 mt-1"
            aria-label="Cerrar"
            @click="quitar(t.id)"
          ></button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  zIndex: { type: [Number, String], default: 1080 }
})

const toasts = ref([])
let contador = 0

const icono = (tipo) => {
  if (tipo === 'danger') return 'error'
  if (tipo === 'warning') return 'warning'
  return 'check_circle'
}

const claseIcono = (tipo) => {
  if (tipo === 'danger') return 'bg-danger-subtle text-danger'
  if (tipo === 'warning') return 'bg-warning-subtle text-warning-emphasis'
  return 'bg-success-subtle text-success'
}

const quitar = (id) => {
  const i = toasts.value.findIndex(t => t.id === id)
  if (i !== -1) {
    const t = toasts.value[i]
    if (t._timer) clearTimeout(t._timer)
    toasts.value.splice(i, 1)
  }
}

const programarCierre = (t) => {
  t._timer = setTimeout(() => quitar(t.id), t.duracion)
}

// Al pasar el mouse por encima, pausamos el auto-cierre para poder leer
const pausar = (t) => {
  if (t._timer) {
    clearTimeout(t._timer)
    t._timer = null
  }
}

const reanudar = (t) => {
  if (!t._timer) programarCierre(t)
}

// API pública: agrega un toast. Devuelve el id por si se quiere cerrar a mano.
const mostrar = ({ titulo = '', mensaje = '', tipo = 'success', duracion = 4000 } = {}) => {
  const id = ++contador
  const t = { id, titulo, mensaje, tipo, duracion, _timer: null }
  toasts.value.push(t)
  programarCierre(t)
  return id
}

defineExpose({ mostrar, quitar })
</script>

<style scoped>
.toast-contenedor {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  max-width: 360px;
  width: calc(100% - 2rem);
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  border-radius: 12px;
  padding: 12px 14px;
  border-left: 4px solid #adb5bd;
}

.toast-success { border-left-color: #198754; }
.toast-danger  { border-left-color: #dc3545; }
.toast-warning { border-left-color: #ffc107; }

.toast-icono {
  width: 34px;
  height: 34px;
}

/* Animaciones de entrada/salida y reacomodo de la pila */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
