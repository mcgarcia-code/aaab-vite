<template>
  <section class="bloque mb-3">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
      <h3 class="titulo-bloque m-0"><i class="bi bi-camera-video" aria-hidden="true"></i> Otras cámaras</h3>
      <button type="button" class="btn btn-sm btn-light border fw-bold" @click="inputCamara?.click()">
        <i class="bi bi-plus-lg" aria-hidden="true"></i> Agregar cámara
      </button>
    </div>
    <input ref="inputCamara" type="file" accept="video/*" class="d-none" aria-hidden="true" tabindex="-1" @change="elegir">

    <p v-if="!camaras.length" class="small text-muted m-0">
      Si filmaron el partido desde otro ángulo, agregalo acá. Sincronizalo una vez y sigue solo a la cámara principal;
      al publicar, cada clip lleva también ese ángulo.
    </p>

    <div v-else class="grilla-camaras">
      <article v-for="c in camaras" :key="c.id" class="camara">
        <div class="marco-camara">
          <video :ref="el => registrar(c.id, el)" :src="c.url" playsinline muted preload="metadata" controls></video>
        </div>
        <div class="d-flex align-items-center gap-2 mt-2">
          <input v-model="c.nombre" type="text" maxlength="30" class="form-control form-control-sm" :aria-label="`Nombre de ${c.nombre}`">
          <button type="button" class="btn btn-sm btn-light border text-danger flex-shrink-0" :aria-label="`Quitar ${c.nombre}`" @click="quitarCamara(c.id)">
            <i class="bi bi-trash3" aria-hidden="true"></i>
          </button>
        </div>
        <p v-if="c.desfase !== null" class="small text-success fw-semibold mt-1 mb-1">
          <i class="bi bi-link-45deg" aria-hidden="true"></i> Sincronizada ({{ c.desfase > 0 ? '+' : '' }}{{ c.desfase }} s)
        </p>
        <p v-else class="small text-muted mt-1 mb-1">
          Pausá las dos cámaras en el mismo momento (por ejemplo, un pitazo) y tocá "Sincronizar acá".
        </p>
        <button type="button" class="btn btn-sm w-100 fw-bold" :class="c.desfase === null ? 'btn-success' : 'btn-outline-success'"
                :disabled="!principal" @click="sincronizarAca(c)">
          Sincronizar acá
        </button>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAaabTv } from '@/composables/useAaabTv'

// Cámaras extra del análisis. Antes de sincronizar se mueven solas (para encontrar el mismo momento);
// después siguen a la cámara principal: play, pausa, saltos y velocidad.
// principal: el <video> de la cámara principal; reproduciendo, tiempo y velocidad: su estado
const props = defineProps({
  principal: { type: Object, default: null },
  reproduciendo: { type: Boolean, default: false },
  tiempo: { type: Number, default: 0 },
  velocidad: { type: Number, default: 1 }
})

const { camaras, agregarCamara, quitarCamara, sincronizarCamara } = useAaabTv()
const inputCamara = ref(null)
const videos = new Map()

const registrar = (id, el) => {
  if (el) videos.set(id, el)
  else videos.delete(id)
}

const elegir = (e) => {
  const archivo = e.target.files?.[0]
  e.target.value = ''
  if (archivo && archivo.type.startsWith('video/')) agregarCamara(archivo)
}

const sincronizarAca = (camara) => {
  const v = videos.get(camara.id)
  if (!v || !props.principal) return
  v.pause()
  props.principal.pause()
  sincronizarCamara(camara.id, v.currentTime, props.principal.currentTime)
}

const sincronizadas = () => camaras.value
  .filter(c => c.desfase !== null && videos.has(c.id))
  .map(c => ({ camara: c, v: videos.get(c.id) }))

// Play y pausa junto con la principal
watch(() => props.reproduciendo, (sigue) => {
  sincronizadas().forEach(({ v }) => { if (sigue) v.play().catch(() => {}); else v.pause() })
})
// Si se desfasan más de 0,3 s (un salto, o el navegador que se atrasó), se corrige
watch(() => props.tiempo, (t) => {
  sincronizadas().forEach(({ camara, v }) => {
    const objetivo = t + camara.desfase
    if (Math.abs(v.currentTime - objetivo) > 0.3) v.currentTime = Math.max(0, objetivo)
  })
})
watch(() => props.velocidad, (vel) => {
  sincronizadas().forEach(({ v }) => { v.playbackRate = vel })
})
</script>

<style scoped>
.grilla-camaras {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.camara {
  padding: 8px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 12px;
}
.marco-camara {
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
.marco-camara video { width: 100%; height: 100%; object-fit: contain; display: block; }
.titulo-bloque { font-size: 0.95rem; font-weight: 800; color: var(--o-texto, #0f172a); }
</style>
