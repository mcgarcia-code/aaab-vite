<template>
  <div>
    <!-- Para qué sirve esta pestaña -->
    <div class="explicacion mb-3">
      <i class="bi bi-whatsapp" aria-hidden="true"></i>
      <div>
        <p class="fw-bold mb-1">Subir un video externo</p>
        <p class="small mb-0">
          Usá esta pestaña para publicar jugadas que no salen de un análisis: por ejemplo, un video que te mandaron por WhatsApp.
          El video se publica entero, como un solo clip, sin marcar tags ni sincronizar.
          <template v-if="publicaAutorizado">Como lo subís vos, sale autorizado en los canales que elijas.</template>
          <template v-else>Igual que los clips del análisis, queda pendiente hasta que el coordinador general lo autorice en cada canal.</template>
        </p>
      </div>
    </div>

    <input ref="inputArchivo" type="file" accept="video/*" class="d-none" aria-hidden="true" tabindex="-1" @change="elegirArchivo">

    <form novalidate @submit.prevent="publicar">
      <div class="row g-3">
        <!-- Video -->
        <div class="col-12 col-lg-6">
          <div v-if="!archivo" class="zona-vacia" :class="{ 'con-error': intento && !archivo }">
            <i class="bi bi-camera-video" aria-hidden="true"></i>
            <p class="fw-bold mb-1">Elegí el video</p>
            <p class="small text-muted mb-3">Un archivo de video del celular o la computadora (MP4).</p>
            <button type="button" class="btn btn-danger rounded-pill fw-bold px-4" @click="inputArchivo?.click()">
              <i class="bi bi-upload" aria-hidden="true"></i> Elegir video
            </button>
          </div>
          <template v-else>
            <div class="marco-video">
              <video :src="urlPrevia" controls playsinline preload="metadata" @loadedmetadata="alCargarMetadatos"></video>
            </div>
            <div class="d-flex align-items-center justify-content-between gap-2 mt-2">
              <span class="small text-muted text-truncate">
                <i class="bi bi-file-earmark-play" aria-hidden="true"></i> {{ archivo.name }}
                <template v-if="duracion"> · {{ formatearTiempo(duracion) }}</template>
              </span>
              <button type="button" class="btn btn-sm btn-light border fw-bold flex-shrink-0" :disabled="subiendo" @click="inputArchivo?.click()">
                <i class="bi bi-arrow-repeat" aria-hidden="true"></i> Cambiar
              </button>
            </div>
          </template>
          <p v-if="intento && !archivo" class="small text-danger mt-1 mb-0" role="alert">Elegí el video que querés subir.</p>
        </div>

        <!-- Datos -->
        <div class="col-12 col-lg-6">
          <label for="ext-titulo" class="form-label small fw-bold">Título *</label>
          <input id="ext-titulo" v-model="form.titulo" type="text" maxlength="100" class="form-control"
                 :class="{ 'is-invalid': intento && !form.titulo.trim() }" placeholder="Ej: Falta en ataque del pivote">
          <div class="invalid-feedback">El video necesita un título.</div>

          <label for="ext-desc" class="form-label small fw-bold mt-2">Descripción</label>
          <textarea id="ext-desc" v-model="form.descripcion" rows="2" maxlength="600" class="form-control"
                    placeholder="Qué pasó y qué dice el reglamento"></textarea>

          <div class="row g-2 mt-0">
            <div class="col-12 col-sm-7">
              <label for="ext-partido" class="form-label small fw-bold">Partido</label>
              <input id="ext-partido" v-model="form.partido" type="text" maxlength="80" class="form-control" placeholder="Si lo sabés">
            </div>
            <div class="col-12 col-sm-5">
              <label for="ext-fecha" class="form-label small fw-bold">Fecha *</label>
              <input id="ext-fecha" v-model="form.fecha" type="date" class="form-control" :class="{ 'is-invalid': intento && !form.fecha }">
              <div class="invalid-feedback">Indicá la fecha.</div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <SelectorCanales v-model="form.canales" :invalido="intento && !form.canales.length" />
        </div>

        <div class="col-12 d-flex justify-content-end">
          <button type="submit" class="btn btn-danger rounded-pill fw-bold px-4 boton-publicar" :disabled="subiendo">
            <span v-if="subiendo" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
            <i v-else class="bi bi-broadcast" aria-hidden="true"></i> {{ textoBoton }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onBeforeUnmount } from 'vue'
import { useAaabTv, formatearTiempo, idGrupoDeClave } from '@/composables/useAaabTv'
import SelectorCanales from '@/components/panel-arbitro/aaab-tv/SelectorCanales.vue'

// Pestaña "Subir video" del Estudio (solo observadores y coordinadores): publica un video que llegó
// por fuera del análisis (ej. por WhatsApp) entero, como un solo clip, con el mismo circuito de canales.
const emit = defineEmits(['publicado'])
const toast = inject('toast')
const { publicarVideoExterno, progresoSubida, publicaAutorizado } = useAaabTv()

// No se elige situación: todos los videos externos llevan esta etiqueta en el portal
const ETIQUETA_EXTERNO = { nombre: 'Video externo', color: 'gris' }

const hoy = () => new Date().toISOString().slice(0, 10)
const formVacio = () => ({ titulo: '', descripcion: '', partido: '', fecha: hoy(), canales: ['publico'] })

const inputArchivo = ref(null)
const archivo = ref(null)
const urlPrevia = ref('')
const duracion = ref(0)
const form = reactive(formVacio())
const intento = ref(false)
const subiendo = ref(false)

const liberarPrevia = () => {
  if (urlPrevia.value) URL.revokeObjectURL(urlPrevia.value)
  urlPrevia.value = ''
}

const elegirArchivo = (e) => {
  const elegido = e.target.files?.[0]
  e.target.value = ''
  if (!elegido) return
  if (!elegido.type.startsWith('video/')) {
    toast({ tipo: 'warning', titulo: 'Archivo no válido', mensaje: 'Elegí un archivo de video (MP4).' })
    return
  }
  liberarPrevia()
  archivo.value = elegido
  urlPrevia.value = URL.createObjectURL(elegido)
  duracion.value = 0
}

const alCargarMetadatos = (e) => {
  duracion.value = Math.floor(e.target.duration || 0)
}

const textoBoton = computed(() => {
  if (!subiendo.value) return 'Subir y publicar'
  const p = progresoSubida.value
  return p !== null && p < 1 ? `Subiendo video ${Math.floor(p * 100)}%...` : 'Publicando...'
})

const publicar = async () => {
  intento.value = true
  const valido = archivo.value && form.titulo.trim() && form.fecha && form.canales.length
  if (!valido || subiendo.value) return
  subiendo.value = true
  try {
    const res = await publicarVideoExterno({
      archivo: archivo.value,
      titulo: form.titulo,
      descripcion: form.descripcion,
      etiqueta: ETIQUETA_EXTERNO.nombre,
      color: ETIQUETA_EXTERNO.color,
      partido: form.partido,
      fecha: form.fecha,
      duracion: duracion.value,
      destinos: form.canales.map(idGrupoDeClave)
    })
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo subir', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    toast(publicaAutorizado.value
      ? { tipo: 'success', titulo: 'Publicado en AAAB TV', mensaje: 'El video ya está autorizado en los canales elegidos.' }
      : { tipo: 'success', titulo: 'Enviado a AAAB TV', mensaje: 'El video quedó pendiente hasta que el coordinador general autorice cada canal.' })
    // La vista previa local deja de usarse (en la maqueta el portal usa su propia copia)
    liberarPrevia()
    archivo.value = null
    duracion.value = 0
    Object.assign(form, formVacio())
    intento.value = false
    emit('publicado')
  } finally {
    subiendo.value = false
  }
}

onBeforeUnmount(liberarPrevia)
</script>

<style scoped>
.explicacion {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--o-borde, #e2e8f0);
  background: var(--o-fondo-suave, #f8fafc);
  color: var(--o-texto, #0f172a);
}
.explicacion > .bi { font-size: 1.5rem; color: #16a34a; line-height: 1; }
.zona-vacia {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 220px;
  padding: 24px 16px;
  border: 2px dashed var(--o-borde, #cbd5e1);
  border-radius: 16px;
}
.zona-vacia.con-error { border-color: #dc3545; }
.zona-vacia > .bi { font-size: 2.5rem; color: var(--o-rojo-texto, #dc2626); margin-bottom: 8px; }
.marco-video {
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.marco-video video { width: 100%; height: 100%; object-fit: contain; display: block; }
@media (max-width: 575px) {
  .boton-publicar { width: 100%; }
}
</style>
