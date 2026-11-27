<template>
  <section class="bloque mb-3">
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
      <h3 class="titulo-bloque m-0"><i class="bi bi-camera-video" aria-hidden="true"></i> Otras cámaras</h3>
      <button type="button" class="btn btn-sm btn-light border fw-bold" @click="elegirPara(null)">
        <i class="bi bi-plus-lg" aria-hidden="true"></i> Agregar cámara
      </button>
    </div>
    <input ref="inputCamara" type="file" accept="video/*" class="d-none" aria-hidden="true" tabindex="-1" @change="elegir">

    <p v-if="!sesion.camaras.length" class="small text-muted m-0">
      Si filmaron el partido desde otro ángulo, agregalo acá. Sincronizalo una vez y sigue solo a la cámara principal;
      la sincronización se guarda con el evento y, al publicar, cada clip lleva también ese ángulo.
    </p>

    <div v-else class="grilla-camaras">
      <article v-for="c in sesion.camaras" :key="c.id" class="camara">
        <div class="marco-camara">
          <video v-if="archivoCamara(c.id)" :ref="el => registrar(c.id, el)" :src="archivoCamara(c.id).url" playsinline muted preload="metadata" controls></video>
          <!-- Cámara guardada en el evento: el archivo es local y hay que volver a elegirlo -->
          <button v-else type="button" class="falta-archivo" @click="elegirPara(c.id)">
            <i class="bi bi-folder2-open" aria-hidden="true"></i>
            <span>Elegí el archivo de esta cámara</span>
            <span v-if="c.nombreArchivo" class="small">{{ c.nombreArchivo }}</span>
          </button>
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
                :disabled="!principal || !archivoCamara(c.id)" @click="sincronizarAca(c)">
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
// Se guardan con el evento (nombre y sincronización); el archivo se vuelve a elegir al reabrirlo.
// principal: el <video> de la cámara principal; reproduciendo, tiempo y velocidad: su estado
const props = defineProps({
  principal: { type: Object, default: null },
  reproduciendo: { type: Boolean, default: false },
  tiempo: { type: Number, default: 0 },
  velocidad: { type: Number, default: 1 }
})

const { sesion, agregarCamara, cargarArchivoCamara, archivoCamara, quitarCamara, sincronizarCamara } = useAaabTv()
const inputCamara = ref(null)
const videos = new Map()
// Cámara a la que se le elige el archivo (null = agregar una nueva)
let camaraElegida = null

const registrar = (id, el) => {
  if (el) videos.set(id, el)
  else videos.delete(id)
}

const elegirPara = (id) => {
  camaraElegida = id
  inputCamara.value?.click()
}

const elegir = (e) => {
  const archivo = e.target.files?.[0]
  e.target.value = ''
  if (!archivo || !archivo.type.startsWith('video/')) return
  if (camaraElegida) cargarArchivoCamara(camaraElegida, archivo)
  else agregarCamara(archivo)
  camaraElegida = null
}

const sincronizarAca = (camara) => {
  const v = videos.get(camara.id)
  if (!v || !props.principal) return
  v.pause()
  props.principal.pause()
  sincronizarCamara(camara.id, v.currentTime, props.principal.currentTime)
}

const sincronizadas = () => sesion.camaras
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
.falta-archivo {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  border: 0;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 700;
}
.falta-archivo .bi { font-size: 1.6rem; }
.titulo-bloque { font-size: 0.95rem; font-weight: 800; color: var(--o-texto, #0f172a); }
</style>
