<template>
  <div>
    <!-- Ángulos: la cámara principal y las extra del mismo partido -->
    <div v-if="angulosTodos.length > 1" class="d-flex flex-wrap gap-1 mb-2" role="group" aria-label="Cámara">
      <button v-for="(a, i) in angulosTodos" :key="i" type="button" class="btn btn-sm"
              :class="anguloActivo === i ? 'btn-dark' : 'btn-outline-dark'" :aria-pressed="anguloActivo === i" @click="cambiarAngulo(i)">
        <i class="bi bi-camera-video" aria-hidden="true"></i> {{ a.nombre }}
      </button>
    </div>

    <div class="marco">
      <template v-if="fuente.url || fuente.urlHls">
        <video ref="videoRef" playsinline preload="metadata"
               @loadedmetadata="alCargar" @timeupdate="alAvanzar" @play="alReproducir" @pause="reproduciendo = false"
               @click="alternar"></video>
        <!-- Dibujo guardado que se muestra al llegar a su segundo, o el que se está haciendo -->
        <LienzoDibujo v-if="dibujando" v-model="formasEnEdicion" editable :herramienta="herramienta" :color="colorDibujo" />
        <LienzoDibujo v-else-if="anotacionVisible" :model-value="anotacionVisible.formas" />
      </template>
      <div v-else class="sin-video">
        <template v-if="procesando">
          <span class="spinner-border text-light" aria-hidden="true"></span>
          <span>Procesando el clip: en unos minutos se va a poder ver.</span>
        </template>
        <template v-else>
          <i class="bi bi-film" aria-hidden="true"></i>
          <span>El video de este clip no está disponible en este dispositivo.</span>
        </template>
      </div>
    </div>

    <div class="barra mt-2" role="slider" tabindex="0" aria-label="Posición dentro del clip"
         :aria-valuemin="0" :aria-valuemax="duracion" :aria-valuenow="Math.floor(posicion)"
         @click="saltar" @keydown.left.prevent="moverA(posicion - 1)" @keydown.right.prevent="moverA(posicion + 1)">
      <span class="relleno" :style="{ width: porcentaje(posicion) + '%' }"></span>
      <!-- Dibujos guardados: una marca en su segundo -->
      <span v-for="a in anotaciones" :key="a.id" class="marca-dibujo" :style="{ left: porcentaje(a.segundo) + '%' }" :title="`Dibujo en ${formatearTiempo(a.segundo)}`"></span>
      <!-- Comentarios sobre un momento del clip: un punto en su segundo -->
      <span v-for="m in marcasComentario" :key="m.id" class="marca-comentario" :style="{ left: porcentaje(m.segundo) + '%' }"
            :title="`${m.autor || 'Comentario'} en ${formatearTiempo(m.segundo)}: ${m.texto}`"></span>
    </div>
    <div v-if="marcasComentario.length || anotaciones.length" class="leyenda-marcas mt-1">
      <span v-if="anotaciones.length"><span class="muestra-marca dibujo"></span> Dibujos</span>
      <span v-if="marcasComentario.length"><span class="muestra-marca comentario"></span> Comentarios</span>
    </div>

    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
      <div class="d-flex flex-wrap align-items-center gap-1">
        <button type="button" class="btn btn-sm btn-light border" :disabled="!hayVideo" title="Cuadro anterior" aria-label="Cuadro anterior" @click="pasoCuadro(-1)">
          <i class="bi bi-skip-start-fill" aria-hidden="true"></i>
        </button>
        <button type="button" class="btn btn-sm btn-dark px-3" :disabled="!hayVideo" :aria-label="reproduciendo ? 'Pausar' : 'Reproducir'" @click="alternar">
          <i :class="['bi', reproduciendo ? 'bi-pause-fill' : 'bi-play-fill']" aria-hidden="true"></i>
        </button>
        <button type="button" class="btn btn-sm btn-light border" :disabled="!hayVideo" title="Cuadro siguiente" aria-label="Cuadro siguiente" @click="pasoCuadro(1)">
          <i class="bi bi-skip-end-fill" aria-hidden="true"></i>
        </button>
        <button type="button" class="btn btn-sm" :class="repetir ? 'btn-danger' : 'btn-light border'" :aria-pressed="repetir" :disabled="!hayVideo" @click="repetir = !repetir">
          <i class="bi bi-repeat" aria-hidden="true"></i><span class="d-none d-sm-inline"> Repetir</span>
        </button>
        <span class="tiempo">{{ formatearTiempo(posicion) }} / {{ formatearTiempo(duracion) }}</span>
      </div>
      <div class="d-flex flex-wrap align-items-center gap-1">
        <div class="btn-group btn-group-sm" role="group" aria-label="Velocidad">
          <button v-for="v in VELOCIDADES" :key="v" type="button" class="btn" :class="velocidad === v ? 'btn-danger' : 'btn-outline-danger'"
                  :disabled="!hayVideo" @click="cambiarVelocidad(v)">{{ v }}x</button>
        </div>
        <select v-if="calidades.length > 1" v-model.number="calidad" class="form-select form-select-sm selector-calidad" aria-label="Calidad" @change="cambiarCalidad">
          <option :value="-1">Auto</option>
          <option v-for="c in calidades" :key="c.indice" :value="c.indice">{{ c.alto }}p</option>
        </select>
        <button type="button" class="btn btn-sm" :class="dibujando ? 'btn-warning' : 'btn-light border'" :disabled="!hayVideo"
                :aria-pressed="dibujando" @click="alternarDibujo">
          <i class="bi bi-pencil" aria-hidden="true"></i> Dibujar
        </button>
      </div>
    </div>

    <!-- Herramientas de dibujo -->
    <div v-if="dibujando" class="card card-body shadow-sm border-light-subtle rounded-3 py-2 px-3 mt-2 d-flex flex-row flex-wrap align-items-center gap-2">
      <div class="btn-group btn-group-sm" role="group" aria-label="Herramienta">
        <button v-for="h in HERRAMIENTAS" :key="h.clave" type="button" class="btn" :class="herramienta === h.clave ? 'btn-dark' : 'btn-outline-dark'"
                :aria-pressed="herramienta === h.clave" :title="h.nombre" @click="herramienta = h.clave">
          <i :class="['bi', h.icono]" aria-hidden="true"></i><span class="visually-hidden">{{ h.nombre }}</span>
        </button>
      </div>
      <div class="d-flex gap-1" role="group" aria-label="Color">
        <button v-for="c in COLORES" :key="c.valor" type="button" class="muestra" :class="{ elegida: colorDibujo === c.valor }"
                :style="{ background: c.valor }" :aria-label="c.nombre" :aria-pressed="colorDibujo === c.valor" @click="colorDibujo = c.valor"></button>
      </div>
      <button type="button" class="btn btn-sm btn-light border" :disabled="!formasEnEdicion.length" @click="formasEnEdicion = formasEnEdicion.slice(0, -1)">
        <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Deshacer
      </button>
      <button type="button" class="btn btn-sm btn-light border" :disabled="!formasEnEdicion.length" @click="formasEnEdicion = []">Borrar</button>
      <button v-if="puedeAnotar" type="button" class="btn btn-sm btn-success fw-bold ms-auto" :disabled="!formasEnEdicion.length || guardando" @click="guardarDibujo">
        <i class="bi bi-floppy" aria-hidden="true"></i> Guardar en el clip ({{ formatearTiempo(posicion) }})
      </button>
      <span v-else class="small text-muted ms-auto">El dibujo no se guarda: es para explicar en el momento.</span>
    </div>

    <!-- Dibujo guardado en pantalla -->
    <div v-if="anotacionVisible && !dibujando" class="card card-body shadow-sm border-light-subtle rounded-3 py-2 px-3 mt-2 d-flex flex-row flex-wrap align-items-center gap-2 small fw-bold text-dark">
      <i class="bi bi-pencil-square" aria-hidden="true"></i> Dibujo en {{ formatearTiempo(anotacionVisible.segundo) }}
      <button type="button" class="btn btn-sm btn-dark fw-bold ms-auto" @click="seguir">Seguir</button>
      <button v-if="puedeAnotar" type="button" class="btn btn-sm btn-light border text-danger" :disabled="guardando" @click="borrarDibujo(anotacionVisible)">
        <i class="bi bi-trash3" aria-hidden="true"></i><span class="visually-hidden">Borrar dibujo</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { formatearTiempo } from '@/composables/useAaabTv'
import LienzoDibujo from '@/components/panel-arbitro/aaab-tv/LienzoDibujo.vue'
import { useCuadrosPorSegundo } from '@/composables/useCuadrosPorSegundo'

// Reproduce el tramo [inicio, fin] de un video (o el clip ya cortado por el servidor, con inicio 0).
// - urlHls: video adaptativo (la calidad baja sola si la conexión es mala); si no hay, se usa url (MP4)
// - angulos: otras cámaras del mismo clip [{ nombre, url, urlHls, inicio, fin }]
// - anotaciones: dibujos guardados [{ id, segundo, formas }] (segundo desde el inicio del clip); al llegar
//   a cada uno, el video se pausa y lo muestra. puedeAnotar: el autor o el coordinador general los guardan
// - Cuadro a cuadro: avanza o retrocede un cuadro; los cuadros por segundo se detectan al reproducir (ver useCuadrosPorSegundo)
const props = defineProps({
  url: { type: String, default: '' },
  urlHls: { type: String, default: '' },
  inicio: { type: Number, default: 0 },
  fin: { type: Number, default: 0 },
  procesando: { type: Boolean, default: false },
  angulos: { type: Array, default: () => [] },
  anotaciones: { type: Array, default: () => [] },
  puedeAnotar: { type: Boolean, default: false },
  guardando: { type: Boolean, default: false },
  // Comentarios del clip: los que tienen momento (segundo) se marcan en la barra
  comentarios: { type: Array, default: () => [] }
})
// posicion: segundo actual dentro del clip (para comentar sobre ese momento)
// visto: el clip se reprodujo lo suficiente para contarlo como visto (una vez por clip)
const emit = defineEmits(['guardar-anotaciones', 'posicion', 'visto'])
let vistoAvisado = false

const marcasComentario = computed(() =>
  props.comentarios.filter(c => c.segundo !== null && c.segundo !== undefined))

const VELOCIDADES = [0.25, 0.5, 1]
// Cuadro a cuadro: se detectan los cuadros por segundo del video al reproducirlo (30 hasta saberlo)
const { duracionCuadro, observar: observarCuadros } = useCuadrosPorSegundo()
const HERRAMIENTAS = [
  { clave: 'flecha', nombre: 'Flecha', icono: 'bi-arrow-up-right' },
  { clave: 'linea', nombre: 'Línea', icono: 'bi-slash-lg' },
  { clave: 'circulo', nombre: 'Círculo', icono: 'bi-circle' },
  { clave: 'libre', nombre: 'A mano alzada', icono: 'bi-brush' }
]
const COLORES = [
  { nombre: 'Amarillo', valor: '#facc15' },
  { nombre: 'Rojo', valor: '#ef4444' },
  { nombre: 'Blanco', valor: '#ffffff' },
  { nombre: 'Celeste', valor: '#22d3ee' }
]

const videoRef = ref(null)
const reproduciendo = ref(false)
const repetir = ref(true)
const velocidad = ref(1)
const actual = ref(props.inicio)

// ─── Ángulos ──────────────────────────────────────────────
const anguloActivo = ref(0)
const angulosTodos = computed(() => [
  { nombre: 'Principal', url: props.url, urlHls: props.urlHls, inicio: props.inicio, fin: props.fin },
  ...props.angulos
])
const fuente = computed(() => angulosTodos.value.at(anguloActivo.value) || angulosTodos.value.at(0))
const hayVideo = computed(() => !!(fuente.value.url || fuente.value.urlHls))
const duracion = computed(() => Math.max(0, fuente.value.fin - fuente.value.inicio))
const posicion = computed(() => Math.min(duracion.value, Math.max(0, actual.value - fuente.value.inicio)))
const porcentaje = (segundo) => (duracion.value ? Math.min(100, (segundo / duracion.value) * 100) : 0)

// Posición a la que hay que volver después de cambiar de fuente (ángulo o archivo)
let posicionPendiente = 0

// ─── Video adaptativo (HLS) ───────────────────────────────
let hls = null
const calidades = ref([])   // [{ indice, alto }]
const calidad = ref(-1)     // -1 = automática

const soltarHls = () => {
  if (hls) {
    hls.destroy()
    hls = null
  }
  calidades.value = []
  calidad.value = -1
}

// HLS: se usa hls.js siempre que el navegador lo soporte (también Safari en Mac, iPad y los iPhone
// recientes), así hay selector de calidad en todos. Si no, el HLS propio del navegador (sin selector),
// y si tampoco, el MP4
const cargarFuente = async () => {
  soltarHls()
  await nextTick()
  const v = videoRef.value
  if (!v) return
  const { url, urlHls } = fuente.value
  if (urlHls) {
    const { default: Hls } = await import('hls.js')
    if (Hls.isSupported()) {
      hls = new Hls()
      hls.on(Hls.Events.MANIFEST_PARSED, (_, datos) => {
        calidades.value = datos.levels
          .map((l, indice) => ({ indice, alto: l.height }))
          .filter(c => c.alto)
          .sort((a, b) => b.alto - a.alto)
      })
      hls.loadSource(urlHls)
      hls.attachMedia(v)
      return
    }
    if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = urlHls
      return
    }
  }
  v.src = url
}

const cambiarCalidad = () => {
  if (hls) hls.currentLevel = calidad.value
}

const cambiarAngulo = (i) => {
  posicionPendiente = posicion.value
  const seguia = reproduciendo.value
  anguloActivo.value = i
  cargarFuente().then(() => { if (seguia) videoRef.value?.play().catch(() => {}) })
}

// ─── Reproducción ─────────────────────────────────────────
const moverA = (segundoRelativo) => {
  if (!videoRef.value) return
  videoRef.value.currentTime = fuente.value.inicio + Math.min(duracion.value, Math.max(0, segundoRelativo))
}

const alCargar = () => {
  videoRef.value.playbackRate = velocidad.value
  observarCuadros(videoRef.value)
  moverA(posicionPendiente)
  if (posicionPendiente === 0) videoRef.value.play().catch(() => {})
  posicionPendiente = 0
}

// Al llegar al segundo de un dibujo guardado, pausa y lo muestra
const anotacionVisible = ref(null)
let ultimaPosicion = 0

// Si el video pasó por el segundo de un dibujo guardado, lo pausa ahí y lo muestra
const revisarDibujos = (pos) => {
  const v = videoRef.value
  if (!v || v.paused || dibujando.value) return false
  const alcanzada = props.anotaciones.find(a => a.segundo > ultimaPosicion && a.segundo <= pos + 0.02)
  if (!alcanzada) return false
  v.pause()
  moverA(alcanzada.segundo)
  anotacionVisible.value = alcanzada
  ultimaPosicion = alcanzada.segundo
  return true
}

// Revisión cuadro por cuadro (requestVideoFrameCallback): frena justo en el dibujo. Sin ese soporte
// del navegador, alcanza con el aviso de avance del video (unas 4 veces por segundo)
let idVigilancia = null
const dejarDeVigilar = () => {
  if (idVigilancia !== null) videoRef.value?.cancelVideoFrameCallback?.(idVigilancia)
  idVigilancia = null
}
const vigilarDibujos = () => {
  const v = videoRef.value
  dejarDeVigilar()
  if (!v?.requestVideoFrameCallback || !props.anotaciones.length) return
  idVigilancia = v.requestVideoFrameCallback((_ahora, datos) => {
    idVigilancia = null
    const pos = Math.max(0, datos.mediaTime - fuente.value.inicio)
    if (revisarDibujos(pos)) return
    ultimaPosicion = pos
    if (!v.paused) vigilarDibujos()
  })
}

const alAvanzar = () => {
  const v = videoRef.value
  actual.value = v.currentTime
  const pos = posicion.value
  if (!revisarDibujos(pos)) ultimaPosicion = pos
  // Se cuenta como visto con 3 segundos reproducidos (o la mitad, si el clip es más corto)
  if (!vistoAvisado && !v.paused && pos >= Math.min(3, duracion.value / 2)) {
    vistoAvisado = true
    emit('visto')
  }
  if (v.currentTime >= fuente.value.fin) {
    if (repetir.value) {
      v.currentTime = fuente.value.inicio
      ultimaPosicion = -1
    } else {
      v.pause()
    }
  }
}

const alReproducir = () => {
  reproduciendo.value = true
  anotacionVisible.value = null
  vigilarDibujos()
}

const alternar = () => {
  const v = videoRef.value
  if (!v || dibujando.value) return
  if (v.paused) {
    if (v.currentTime >= fuente.value.fin) { moverA(0); ultimaPosicion = -1 }
    v.play().catch(() => {})
  } else {
    v.pause()
  }
}

// Sigue después de un dibujo (sin volver a frenar en el mismo)
const seguir = () => {
  ultimaPosicion = anotacionVisible.value?.segundo ?? ultimaPosicion
  anotacionVisible.value = null
  videoRef.value?.play().catch(() => {})
}

const pasoCuadro = (sentido) => {
  const v = videoRef.value
  if (!v) return
  v.pause()
  anotacionVisible.value = null
  moverA(posicion.value + sentido * duracionCuadro.value)
  ultimaPosicion = posicion.value
}

const saltar = (e) => {
  const caja = e.currentTarget.getBoundingClientRect()
  anotacionVisible.value = null
  moverA(((e.clientX - caja.left) / caja.width) * duracion.value)
  ultimaPosicion = posicion.value
}

const cambiarVelocidad = (v) => {
  velocidad.value = v
  if (videoRef.value) videoRef.value.playbackRate = v
}

// ─── Dibujo ───────────────────────────────────────────────
const dibujando = ref(false)
const herramienta = ref('flecha')
const colorDibujo = ref(COLORES.at(0).valor)
const formasEnEdicion = ref([])

const alternarDibujo = () => {
  dibujando.value = !dibujando.value
  formasEnEdicion.value = []
  if (dibujando.value) {
    videoRef.value?.pause()
    anotacionVisible.value = null
  }
}

const nuevoId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

const guardarDibujo = () => {
  const segundo = Math.round(posicion.value * 100) / 100
  const nueva = { id: nuevoId(), segundo, formas: formasEnEdicion.value }
  // Un dibujo por segundo: si ya había uno en el mismo momento, se reemplaza
  const resto = props.anotaciones.filter(a => Math.abs(a.segundo - segundo) > 0.05)
  emit('guardar-anotaciones', [...resto, nueva].sort((a, b) => a.segundo - b.segundo))
  dibujando.value = false
  formasEnEdicion.value = []
  anotacionVisible.value = nueva
  ultimaPosicion = segundo
}

const borrarDibujo = (anotacion) => {
  emit('guardar-anotaciones', props.anotaciones.filter(a => a.id !== anotacion.id))
  anotacionVisible.value = null
}

// Al cambiar de clip, vuelve a la cámara principal y al principio
watch(() => [props.url, props.urlHls, props.inicio], () => {
  anguloActivo.value = 0
  vistoAvisado = false
  actual.value = props.inicio
  posicionPendiente = 0
  ultimaPosicion = 0
  anotacionVisible.value = null
  dibujando.value = false
  formasEnEdicion.value = []
  cargarFuente()
}, { immediate: true })

// Se avisa la posición dentro del clip (para comentar sobre ese momento)
watch(posicion, (p) => emit('posicion', p), { immediate: true })

// Desde afuera (un comentario con momento): pausa y lleva el video a ese segundo del clip
const irA = (segundo) => {
  if (!videoRef.value) return
  videoRef.value.pause()
  anotacionVisible.value = null
  moverA(segundo)
  ultimaPosicion = segundo
}
defineExpose({ irA })

onBeforeUnmount(() => {
  dejarDeVigilar()
  videoRef.value?.pause()
  soltarHls()
})
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
  color: var(--o-texto-suave, #94a3b8);
  background: linear-gradient(135deg, #0f172a, #1e293b);
  font-size: 0.85rem;
}
.sin-video .bi { font-size: 2.5rem; color: var(--o-rojo-texto, #dc2626); }
.barra {
  position: relative;
  height: 10px;
  border-radius: 50rem;
  background: var(--o-chip, #e2e8f0);
  cursor: pointer;
}
.barra:focus-visible { outline: 2px solid var(--o-texto, #0f172a); outline-offset: 2px; }
.relleno { position: absolute; inset: 0 auto 0 0; background: #dc2626; border-radius: 50rem; }
.marca-dibujo {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 4px;
  margin-left: -2px;
  border-radius: 2px;
  background: #ca8a04;
}
.marca-comentario {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: #0891b2;
  border: 2px solid var(--o-tarjeta, #fff);
}
.leyenda-marcas { display: flex; gap: 12px; font-size: 0.7rem; font-weight: 600; color: var(--o-texto-suave, #64748b); }
.muestra-marca { display: inline-block; width: 8px; height: 8px; margin-right: 3px; border-radius: 2px; }
.muestra-marca.dibujo { background: #ca8a04; }
.muestra-marca.comentario { background: #0891b2; border-radius: 50%; }
.tiempo { font-variant-numeric: tabular-nums; font-size: 0.85rem; font-weight: 700; color: var(--o-texto, #0f172a); padding: 0 6px; }
.selector-calidad { width: auto; }
.muestra {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--o-borde, #cbd5e1);
}
.muestra.elegida { outline: 2px solid var(--o-texto, #0f172a); outline-offset: 2px; }
</style>
