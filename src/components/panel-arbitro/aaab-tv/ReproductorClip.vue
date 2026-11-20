<template>
  <div>
    <div class="marco">
      <video v-if="url" ref="videoRef" :src="url" playsinline preload="metadata"
             @loadedmetadata="alCargar" @timeupdate="alAvanzar" @play="reproduciendo = true" @pause="reproduciendo = false"
             @click="alternar"></video>
      <div v-else class="sin-video">
        <i class="bi bi-film" aria-hidden="true"></i>
        <span>Clip de ejemplo: el video llegará desde el servidor de AAAB TV.</span>
      </div>
    </div>

    <div class="barra mt-2" role="slider" tabindex="0" aria-label="Posición dentro del clip"
         :aria-valuemin="0" :aria-valuemax="duracion" :aria-valuenow="Math.floor(posicion)"
         @click="saltar" @keydown.left.prevent="moverA(posicion - 1)" @keydown.right.prevent="moverA(posicion + 1)">
      <span class="relleno" :style="{ width: (duracion ? (posicion / duracion) * 100 : 0) + '%' }"></span>
      <span class="centro" title="Momento marcado"></span>
    </div>

    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
      <div class="d-flex align-items-center gap-1">
        <button type="button" class="btn btn-sm btn-dark px-3" :disabled="!url" :aria-label="reproduciendo ? 'Pausar' : 'Reproducir'" @click="alternar">
          <i :class="['bi', reproduciendo ? 'bi-pause-fill' : 'bi-play-fill']" aria-hidden="true"></i>
        </button>
        <button type="button" class="btn btn-sm" :class="repetir ? 'btn-danger' : 'btn-light border'" :aria-pressed="repetir" :disabled="!url" @click="repetir = !repetir">
          <i class="bi bi-repeat" aria-hidden="true"></i> Repetir
        </button>
        <span class="tiempo">{{ formatearTiempo(posicion) }} / {{ formatearTiempo(duracion) }}</span>
      </div>
      <div class="btn-group btn-group-sm" role="group" aria-label="Velocidad">
        <button v-for="v in VELOCIDADES" :key="v" type="button" class="btn" :class="velocidad === v ? 'btn-dark' : 'btn-light border'"
                :disabled="!url" @click="cambiarVelocidad(v)">{{ v }}x</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { formatearTiempo } from '@/composables/useAaabTv'

// Reproduce solo el tramo [inicio, fin] de un video (los clips son ventanas del partido completo).
// Cuando el VPS corte los clips, `url` va a ser el clip ya recortado con inicio 0.
const props = defineProps({
  url: { type: String, default: '' },
  inicio: { type: Number, default: 0 },
  fin: { type: Number, default: 0 }
})

const VELOCIDADES = [0.25, 0.5, 1]
const videoRef = ref(null)
const reproduciendo = ref(false)
const repetir = ref(true)
const velocidad = ref(1)
const actual = ref(props.inicio)

const duracion = computed(() => Math.max(0, props.fin - props.inicio))
const posicion = computed(() => Math.min(duracion.value, Math.max(0, actual.value - props.inicio)))

const moverA = (segundoRelativo) => {
  if (!videoRef.value) return
  videoRef.value.currentTime = props.inicio + Math.min(duracion.value, Math.max(0, segundoRelativo))
}

const alCargar = () => {
  videoRef.value.playbackRate = velocidad.value
  moverA(0)
  videoRef.value.play().catch(() => {})
}

const alAvanzar = () => {
  const v = videoRef.value
  actual.value = v.currentTime
  if (v.currentTime >= props.fin) {
    if (repetir.value) v.currentTime = props.inicio
    else v.pause()
  }
}

const alternar = () => {
  const v = videoRef.value
  if (!v) return
  if (v.paused) {
    if (v.currentTime >= props.fin) moverA(0)
    v.play().catch(() => {})
  } else {
    v.pause()
  }
}

const saltar = (e) => {
  const caja = e.currentTarget.getBoundingClientRect()
  moverA(((e.clientX - caja.left) / caja.width) * duracion.value)
}

const cambiarVelocidad = (v) => {
  velocidad.value = v
  if (videoRef.value) videoRef.value.playbackRate = v
}

watch(() => [props.url, props.inicio], () => { actual.value = props.inicio })
onBeforeUnmount(() => videoRef.value?.pause())
</script>

<style scoped>
.marco {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.marco video { width: 100%; height: 100%; object-fit: contain; display: block; cursor: pointer; }
.sin-video {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
  color: #94a3b8;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  font-size: 0.875rem;
}
.sin-video .bi { font-size: 2.5rem; color: #dc2626; }

.barra {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: #e2e8f0;
  cursor: pointer;
}
.barra:focus-visible { outline: 2px solid #0f172a; outline-offset: 2px; }
.relleno { position: absolute; inset: 0 auto 0 0; background: #dc2626; border-radius: 999px; }
.centro { position: absolute; top: -3px; bottom: -3px; left: 50%; width: 2px; background: #0f172a; }

.tiempo { font-variant-numeric: tabular-nums; font-size: 0.85rem; font-weight: 700; color: #0f172a; padding: 0 6px; }
</style>
