<template>
  <div>
    <!-- Para qué sirve esta pestaña -->
    <div class="card card-body shadow-sm border-light-subtle rounded-3 p-3 mb-3 d-flex flex-row gap-3">
      <i class="bi bi-whatsapp text-success fs-3 lh-1" aria-hidden="true"></i>
      <div>
        <h6 class="fw-bold text-dark text-uppercase mb-1">Subir un video externo</h6>
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
              <video :src="urlPrevia" controls playsinline preload="metadata" @loadedmetadata="alCargarMetadatos" @error="noSeVe = true"></video>
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
          <div v-if="archivo && noSeVe" class="alert alert-warning small py-2 mt-2 mb-0" role="alert">
            <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
            Este navegador no puede mostrar este video (pasa con algunos videos de iPhone o WhatsApp, en HEVC o .mov).
            <template v-if="conServidor">Igual podés subirlo: el servidor lo convierte para que se vea en cualquier dispositivo.</template>
            <template v-else>En la maqueta no se puede usar: convertilo a MP4 (H.264) o probá desde Chrome en el celular.</template>
          </div>
        </div>

        <!-- Datos -->
        <div class="col-12 col-lg-6">
          <label for="ext-situacion" class="form-label small fw-bold">Situación *</label>
          <select id="ext-situacion" v-model="form.idBoton" class="form-select" :class="{ 'is-invalid': intento && !botonElegido }">
            <option value="" disabled>Elegí la situación</option>
            <option v-for="b in botones" :key="b.id" :value="b.id">{{ b.nombre }}</option>
          </select>
          <div class="invalid-feedback">Elegí la situación (son los botones de "Mi panel").</div>

          <label for="ext-titulo" class="form-label small fw-bold mt-2">Título *</label>
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

          <label for="ext-decision" class="form-label small fw-bold mt-2">Decisión arbitral</label>
          <select id="ext-decision" v-model="form.decision" class="form-select">
            <option :value="null">Sin valorar</option>
            <option v-for="(d, clave) in DECISIONES" :key="clave" :value="clave">{{ d.etiqueta }}</option>
          </select>

          <span class="form-label small fw-bold d-block mt-2">Árbitros involucrados</span>
          <SelectorArbitros id="ext-arbitros" v-model="form.arbitros" />
          <span class="small text-muted">Lo ven en "Mis clips" cuando se autoriza.</span>

          <DatosJugada id="ext-jugada" v-model="form.jugada" />
        </div>

        <div class="col-12">
          <SelectorCanales v-model="form.canales" :invalido="intento && !form.canales.length" />
        </div>

        <div class="col-12 d-flex flex-wrap justify-content-end gap-2">
          <!-- Mientras sube el video se puede cancelar (lo subido queda: al volver a publicar sigue desde ahí) -->
          <button v-if="subiendoVideo" type="button" class="btn btn-outline-danger rounded-pill fw-bold px-4" @click="cancelarSubida">
            Cancelar subida
          </button>
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
import { useAaabTv, formatearTiempo, idGrupoDeClave, DECISIONES } from '@/composables/useAaabTv'
import SelectorCanales from '@/components/panel-arbitro/aaab-tv/SelectorCanales.vue'
import SelectorArbitros from '@/components/SelectorArbitros.vue'
import DatosJugada from '@/components/panel-arbitro/aaab-tv/DatosJugada.vue'
import { AAAB_TV_CON_SERVIDOR } from '@/api/aaabTvEventos'

// Pestaña "Subir video" del Estudio (solo observadores y coordinadores): publica un video que llegó
// por fuera del análisis (ej. por WhatsApp) entero, como un solo clip, con el mismo circuito de canales.
const emit = defineEmits(['publicado'])
const toast = inject('toast')
const { botones, publicarVideoExterno, progresoSubida, cancelarSubida, publicaAutorizado } = useAaabTv()

const hoy = () => new Date().toISOString().slice(0, 10)
// idBoton: la situación, uno de los botones de "Mi panel" (el clip toma su nombre y su color)
const formVacio = () => ({
  idBoton: '', titulo: '', descripcion: '', partido: '', fecha: hoy(), canales: ['publico'], decision: null, arbitros: [], jugada: null
})
const conServidor = AAAB_TV_CON_SERVIDOR
// El navegador no puede mostrar el video (HEVC, .mov): con servidor se sube igual y la VPS lo convierte
const noSeVe = ref(false)

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
  noSeVe.value = false
}

const alCargarMetadatos = (e) => {
  duracion.value = Math.floor(e.target.duration || 0)
  // Se abrió pero sin imagen o sin duración: el navegador no lo puede decodificar
  noSeVe.value = !duracion.value || !e.target.videoWidth
}

const botonElegido = computed(() => botones.value.find(b => b.id === form.idBoton) || null)

// Se puede cancelar mientras el video todavía se está subiendo
const subiendoVideo = computed(() => subiendo.value && progresoSubida.value !== null && progresoSubida.value < 1)

const textoBoton = computed(() => {
  if (!subiendo.value) return 'Subir y publicar'
  const p = progresoSubida.value
  return p !== null && p < 1 ? `Subiendo video ${Math.floor(p * 100)}%...` : 'Publicando...'
})

const publicar = async () => {
  intento.value = true
  const valido = archivo.value && botonElegido.value && form.titulo.trim() && form.fecha && form.canales.length
  if (!valido || subiendo.value) return
  // En la maqueta se necesita la duración que lee el navegador; con servidor la calcula la VPS
  if (noSeVe.value && !conServidor) {
    toast({ tipo: 'warning', titulo: 'Formato no compatible', mensaje: 'Convertí el video a MP4 (H.264) para usarlo en la maqueta.' })
    return
  }
  subiendo.value = true
  try {
    const res = await publicarVideoExterno({
      archivo: archivo.value,
      titulo: form.titulo,
      descripcion: form.descripcion,
      etiqueta: botonElegido.value.nombre,
      color: botonElegido.value.color,
      partido: form.partido,
      fecha: form.fecha,
      duracion: duracion.value,
      destinos: form.canales.map(idGrupoDeClave),
      decision: form.decision,
      arbitros: form.arbitros,
      jugada: form.jugada
    })
    if (res?.cancelado) {
      toast({ tipo: 'warning', titulo: 'Subida cancelada', mensaje: res.message })
      return
    }
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
    noSeVe.value = false
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
