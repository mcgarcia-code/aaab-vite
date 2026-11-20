<template>
  <div>
    <!-- Selector del video (fuera de los bloques: lo usan el modo video y la sincronización en vivo) -->
    <input ref="inputVideo" type="file" accept="video/*" class="d-none" aria-hidden="true" tabindex="-1" @change="elegirVideo">

    <!-- ============ DATOS DEL PARTIDO + MODO ============ -->
    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-5">
        <label for="tv-partido" class="form-label small fw-bold">Partido</label>
        <input id="tv-partido" v-model="sesion.partido" type="text" maxlength="80" class="form-control" placeholder="Ej: River vs. Ferro — Liga de Honor">
      </div>
      <div class="col-6 col-md-3">
        <label for="tv-fecha" class="form-label small fw-bold">Fecha</label>
        <input id="tv-fecha" v-model="sesion.fecha" type="date" class="form-control">
      </div>
      <div class="col-6 col-md-4">
        <span class="form-label small fw-bold d-block">Modo</span>
        <div class="selector-modo" role="tablist" aria-label="Modo de análisis">
          <button type="button" role="tab" :aria-selected="sesion.modo === 'video'" :class="{ activo: sesion.modo === 'video' }" @click="cambiarModo('video')">
            <i class="bi bi-film" aria-hidden="true"></i> Video
          </button>
          <button type="button" role="tab" :aria-selected="sesion.modo === 'vivo'" :class="{ activo: sesion.modo === 'vivo' }" @click="cambiarModo('vivo')">
            <i class="bi bi-stopwatch" aria-hidden="true"></i> En vivo
          </button>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <!-- ============ COLUMNA PRINCIPAL ============ -->
      <div class="col-12 col-xl-8">

        <!-- Video del partido (modo video, y en vivo para sincronizar) -->
        <section v-if="sesion.modo === 'video' || mostrarVideoEnVivo" class="bloque mb-3">
          <div v-if="!video.url" class="zona-video-vacia">
            <i class="bi bi-camera-video" aria-hidden="true"></i>
            <p class="fw-bold mb-1">Cargá el video completo del partido</p>
            <p class="small text-muted mb-3">Los dos tiempos en un solo archivo (MP4). Por ahora se reproduce desde tu computadora.</p>
            <button type="button" class="btn btn-danger fw-bold" @click="inputVideo?.click()">
              <i class="bi bi-upload" aria-hidden="true"></i> Elegir video
            </button>
          </div>

          <template v-else>
            <div class="marco-video">
              <video ref="videoRef" :src="video.url" controls playsinline preload="metadata"
                     @loadedmetadata="alCargarMetadatos" @timeupdate="alAvanzarVideo" @play="reproduciendo = true" @pause="reproduciendo = false"></video>
              <span v-if="ultimoTag" class="aviso-tag" :style="{ background: colorTag(ultimoTag.color).solido }">
                <i class="bi bi-bookmark-fill" aria-hidden="true"></i> {{ ultimoTag.nombre }} · {{ formatearTiempo(ultimoTag.segundo ?? ultimoTag.segundoReloj) }}
              </span>
              <span v-if="finPrevia !== null" class="aviso-previa">Viendo clip · termina en {{ formatearTiempo(finPrevia) }}</span>
            </div>

            <!-- Línea de tiempo con los clips marcados -->
            <div class="linea-tiempo mt-2" role="slider" tabindex="0" aria-label="Línea de tiempo del partido"
                 :aria-valuemin="0" :aria-valuemax="video.duracion" :aria-valuenow="Math.floor(tiempoActual)"
                 :aria-valuetext="formatearTiempo(tiempoActual)" @click="saltarConClick">
              <span v-for="m in marcasLinea" :key="m.id" class="marca-clip" :style="m.estilo" :title="m.titulo"></span>
              <span class="cabezal" :style="{ left: porcentaje(tiempoActual) + '%' }"></span>
            </div>

            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
              <div class="d-flex flex-wrap align-items-center gap-1">
                <button type="button" class="btn btn-sm btn-light border" title="Atrás 5 s (←)" @click="mover(-5)">-5s</button>
                <button type="button" class="btn btn-sm btn-dark fw-bold px-3" :aria-label="reproduciendo ? 'Pausar' : 'Reproducir'" @click="alternarReproduccion">
                  <i :class="['bi', reproduciendo ? 'bi-pause-fill' : 'bi-play-fill']" aria-hidden="true"></i>
                </button>
                <button type="button" class="btn btn-sm btn-light border" title="Adelante 5 s (→)" @click="mover(5)">+5s</button>
                <span class="tiempo">{{ formatearTiempo(tiempoActual) }} / {{ formatearTiempo(video.duracion) }}</span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <div class="btn-group btn-group-sm" role="group" aria-label="Velocidad">
                  <button v-for="v in VELOCIDADES" :key="v" type="button" class="btn" :class="velocidad === v ? 'btn-dark' : 'btn-light border'" @click="cambiarVelocidad(v)">{{ v }}x</button>
                </div>
                <button type="button" class="btn btn-sm btn-light border" title="Cambiar video" aria-label="Cambiar video" @click="inputVideo?.click()">
                  <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
                </button>
              </div>
            </div>
            <p class="small text-muted mt-1 mb-0 text-truncate"><i class="bi bi-file-earmark-play" aria-hidden="true"></i> {{ video.nombre }}</p>
          </template>
        </section>

        <!-- Cronómetro (modo en vivo) -->
        <section v-if="sesion.modo === 'vivo'" class="bloque bloque-oscuro mb-3">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span class="estado-vivo" :class="{ corriendo: sesion.reloj.corriendo }">
              <span class="punto" aria-hidden="true"></span>
              {{ sesion.reloj.corriendo ? 'Marcando en vivo' : (segundosReloj ? 'En pausa' : 'Listo para empezar') }}
            </span>
            <span v-if="sesion.sincronizacion !== null" class="badge bg-success">
              <i class="bi bi-link-45deg" aria-hidden="true"></i> Sincronizado: el cronómetro arranca en el {{ formatearTiempo(sesion.sincronizacion) }} del video
            </span>
          </div>

          <div class="reloj" aria-live="off">{{ formatearTiempo(segundosReloj) }}</div>

          <div class="d-flex flex-wrap justify-content-center gap-2">
            <button v-if="!sesion.reloj.corriendo" type="button" class="btn btn-danger fw-bold px-4" @click="iniciarReloj">
              <i class="bi bi-play-fill" aria-hidden="true"></i> {{ segundosReloj ? 'Seguir' : 'Iniciar con el pitazo' }}
            </button>
            <button v-else type="button" class="btn btn-light fw-bold px-4" @click="pausarReloj">
              <i class="bi bi-pause-fill" aria-hidden="true"></i> Pausar
            </button>
            <button type="button" class="btn btn-outline-light fw-bold" :disabled="sesion.reloj.corriendo || !segundosReloj" @click="confirmarReinicioReloj">
              <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Reiniciar
            </button>
          </div>
          <p class="nota-vivo">
            Iniciá el cronómetro con el pitazo inicial y dejalo correr todo el partido (también en el entretiempo):
            así coincide con el video completo y alcanza con sincronizar un solo punto.
            Lo que marques queda guardado en este dispositivo aunque se corte internet.
          </p>

          <!-- Sincronización con el video -->
          <div class="sincronizar">
            <h3 class="sincronizar-titulo"><i class="bi bi-link-45deg" aria-hidden="true"></i> Sincronizar con el video</h3>
            <ol class="small mb-2 ps-3">
              <li>Cargá el video completo del partido.</li>
              <li>Llevalo hasta el pitazo inicial (cuando iniciaste el cronómetro).</li>
              <li>Tocá <strong>“Sincronizar acá”</strong>, o escribí ese momento a mano.</li>
            </ol>
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <button v-if="!video.url" type="button" class="btn btn-light btn-sm fw-bold" @click="inputVideo?.click()">
                <i class="bi bi-upload" aria-hidden="true"></i> Cargar video
              </button>
              <template v-else>
                <button type="button" class="btn btn-light btn-sm fw-bold" @click="mostrarVideoEnVivo = !mostrarVideoEnVivo">
                  <i :class="['bi', mostrarVideoEnVivo ? 'bi-eye-slash' : 'bi-eye']" aria-hidden="true"></i> {{ mostrarVideoEnVivo ? 'Ocultar video' : 'Ver video' }}
                </button>
                <button type="button" class="btn btn-success btn-sm fw-bold" :disabled="!mostrarVideoEnVivo" @click="sincronizarAca">
                  Sincronizar acá ({{ formatearTiempo(tiempoActual) }})
                </button>
              </template>
              <div class="d-flex align-items-center gap-1">
                <label for="tv-sync-manual" class="small">o en</label>
                <input id="tv-sync-manual" v-model="syncManual" type="text" inputmode="numeric" class="form-control form-control-sm input-tiempo" placeholder="mm:ss">
                <button type="button" class="btn btn-outline-light btn-sm fw-bold" @click="sincronizarManual">Aplicar</button>
              </div>
            </div>
            <p v-if="errorSync" class="text-warning small fw-semibold mt-2 mb-0" role="alert">{{ errorSync }}</p>
          </div>
        </section>

        <!-- Pad de tags -->
        <section class="bloque">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <h3 class="titulo-bloque m-0">Marcar situación</h3>
            <span class="small text-muted">Clic o tecla · <kbd class="tecla">Espacio</kbd> play/pausa · <kbd class="tecla">←</kbd><kbd class="tecla">→</kbd> 5 s</span>
          </div>
          <p v-if="motivoPadDeshabilitado" class="small text-muted mb-2"><i class="bi bi-info-circle" aria-hidden="true"></i> {{ motivoPadDeshabilitado }}</p>
          <div v-for="cat in CATEGORIAS_TAG" :key="cat.clave" class="mb-2">
            <template v-if="botonesDe(cat.clave).length">
              <span class="etiqueta-categoria">{{ cat.titulo }}</span>
              <div class="pad">
                <button v-for="b in botonesDe(cat.clave)" :key="b.id" type="button" class="boton-tag"
                        :class="{ destello: destelloId === b.id }" :disabled="!!motivoPadDeshabilitado"
                        :style="{ background: colorTag(b.color).fondo, color: colorTag(b.color).texto, borderColor: colorTag(b.color).solido }"
                        @click="marcar(b)">
                  <span class="text-truncate">{{ b.nombre }}</span>
                  <kbd v-if="b.atajo" class="tecla">{{ b.atajo }}</kbd>
                </button>
              </div>
            </template>
          </div>
          <EstadoVacio v-if="!botones.length" icono="bi-ui-checks-grid" titulo="Tu panel no tiene botones" mensaje="Agregalos en el paso 1 · Mi panel." />
        </section>
      </div>

      <!-- ============ CLIPS MARCADOS ============ -->
      <aside class="col-12 col-xl-4">
        <section class="bloque lista-clips">
          <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
            <h3 class="titulo-bloque m-0">Clips <span class="badge bg-dark">{{ sesion.tags.length }}</span></h3>
            <button v-if="sesion.tags.length" type="button" class="btn btn-sm btn-link text-danger fw-bold p-0" @click="confirmarNuevaSesion">Nueva sesión</button>
          </div>

          <div v-if="tagsSinSincronizar.length" class="alert alert-warning small py-2 mb-2">
            {{ tagsSinSincronizar.length }} {{ tagsSinSincronizar.length === 1 ? 'tag marcado en vivo' : 'tags marcados en vivo' }} sin sincronizar con el video.
          </div>

          <EstadoVacio v-if="!sesion.tags.length" icono="bi-bookmark" titulo="Todavía no marcaste nada" :mensaje="`Cada tag genera un clip de ${VENTANA_SEGUNDOS * 2} segundos.`" />

          <ul v-else class="list-unstyled m-0 clips">
            <li v-for="t in tagsOrdenados" :key="t.id" class="clip" :class="{ publicado: t.publicado }" :style="{ borderLeftColor: colorTag(t.color).solido }">
              <div class="d-flex align-items-start gap-2">
                <input v-if="puedePublicar" :id="'sel-' + t.id" v-model="t.seleccionado" type="checkbox" class="form-check-input mt-1"
                       :disabled="t.publicado || t.segundo === null" :aria-label="`Seleccionar ${t.titulo}`">
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center gap-1 flex-wrap">
                    <span class="badge-tag" :style="{ background: colorTag(t.color).fondo, color: colorTag(t.color).texto }">{{ t.nombre }}</span>
                    <span v-if="t.publicado" class="badge bg-success">Publicado</span>
                  </div>
                  <div class="tiempo-clip">
                    <template v-if="t.segundo !== null">
                      {{ formatearTiempo(limitesClip(t.segundo, video.duracion).inicio) }} – {{ formatearTiempo(limitesClip(t.segundo, video.duracion).fin) }}
                    </template>
                    <template v-else>Cronómetro {{ formatearTiempo(t.segundoReloj) }} · sin sincronizar</template>
                  </div>
                  <input v-model="t.titulo" type="text" maxlength="100" class="form-control form-control-sm mt-1" :aria-label="`Título del clip ${t.nombre}`" placeholder="Título">
                </div>
              </div>
              <div class="d-flex align-items-center gap-1 mt-2">
                <button type="button" class="btn btn-sm btn-dark" :disabled="!video.url || t.segundo === null" :aria-label="`Ver clip ${t.titulo}`" title="Ver clip" @click="verClip(t)">
                  <i class="bi bi-play-fill" aria-hidden="true"></i>
                </button>
                <button type="button" class="btn btn-sm btn-light border" :disabled="t.segundo === null" aria-label="Mover 1 segundo antes" title="1 s antes" @click="moverTag(t.id, -1)">-1s</button>
                <button type="button" class="btn btn-sm btn-light border" :disabled="t.segundo === null" aria-label="Mover 1 segundo después" title="1 s después" @click="moverTag(t.id, 1)">+1s</button>
                <button type="button" class="btn btn-sm btn-light border ms-auto text-danger" :aria-label="`Borrar ${t.titulo}`" title="Borrar" @click="borrarTag(t.id)">
                  <i class="bi bi-trash3" aria-hidden="true"></i>
                </button>
              </div>
            </li>
          </ul>

          <div v-if="sesion.tags.length && puedePublicar" class="pie-clips">
            <span class="small text-muted">{{ seleccionados.length }} para publicar · quedan pendientes hasta que los revise Desarrollo Arbitral</span>
            <button type="button" class="btn btn-danger fw-bold w-100" :disabled="!seleccionados.length" @click="abrirPublicar">
              <i class="bi bi-broadcast" aria-hidden="true"></i> Publicar en AAAB TV
            </button>
          </div>
          <p v-else-if="sesion.tags.length" class="small text-muted border-top pt-2 mt-1 mb-0">
            <i class="bi bi-info-circle" aria-hidden="true"></i> Podés analizar y ver tus clips. Publicar en AAAB TV es solo para coordinadores y observadores.
          </p>
        </section>
      </aside>
    </div>

    <!-- ============ PUBLICAR ============ -->
    <ModalBase :show="mostrarPublicar" titulo="Publicar en AAAB TV" icono="bi-broadcast" color-icono="bg-danger-subtle text-danger"
               max-width="720px" :hay-cambios="!publicando" @close="mostrarPublicar = false">
      <form id="form-publicar" novalidate @submit.prevent="publicar">
        <div class="row g-2 mb-3">
          <div class="col-12 col-md-8">
            <label for="pub-partido" class="form-label small fw-bold">Partido *</label>
            <input id="pub-partido" v-model="formPublicar.partido" type="text" maxlength="80" class="form-control"
                   :class="{ 'is-invalid': intentoPublicar && !formPublicar.partido.trim() }">
            <div class="invalid-feedback">Indicá el partido.</div>
          </div>
          <div class="col-12 col-md-4">
            <label for="pub-fecha" class="form-label small fw-bold">Fecha *</label>
            <input id="pub-fecha" v-model="formPublicar.fecha" type="date" class="form-control"
                   :class="{ 'is-invalid': intentoPublicar && !formPublicar.fecha }">
            <div class="invalid-feedback">Indicá la fecha.</div>
          </div>
        </div>

        <div v-for="(c, i) in formPublicar.clips" :key="c.id" class="clip-publicar">
          <div class="d-flex align-items-center justify-content-between gap-2 mb-2 flex-wrap">
            <span class="badge-tag" :style="{ background: colorTag(c.color).fondo, color: colorTag(c.color).texto }">{{ i + 1 }}. {{ c.nombre }}</span>
            <span class="small text-muted">{{ formatearTiempo(limitesClip(c.segundo, video.duracion).inicio) }} – {{ formatearTiempo(limitesClip(c.segundo, video.duracion).fin) }}</span>
          </div>
          <label :for="'pub-titulo-' + c.id" class="form-label small fw-bold">Título *</label>
          <input :id="'pub-titulo-' + c.id" v-model="c.titulo" type="text" maxlength="100" class="form-control mb-2"
                 :class="{ 'is-invalid': intentoPublicar && !c.titulo.trim() }">
          <div class="invalid-feedback">El clip necesita un título.</div>
          <label :for="'pub-desc-' + c.id" class="form-label small fw-bold">Descripción</label>
          <textarea :id="'pub-desc-' + c.id" v-model="c.descripcion" rows="2" maxlength="600" class="form-control"
                    placeholder="Qué pasó y qué dice el reglamento"></textarea>
        </div>
      </form>

      <template #footer>
        <div class="d-flex gap-2 justify-content-end w-100">
          <button type="button" class="btn btn-light border fw-bold" :disabled="publicando" @click="mostrarPublicar = false">Cancelar</button>
          <button type="submit" form="form-publicar" class="btn btn-danger fw-bold" :disabled="publicando">
            <span v-if="publicando" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
            {{ publicando ? 'Publicando...' : `Publicar ${formPublicar.clips.length} ${formPublicar.clips.length === 1 ? 'clip' : 'clips'}` }}
          </button>
        </div>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import ModalBase from '@/components/ModalBase.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import {
  useAaabTv, CATEGORIAS_TAG, VENTANA_SEGUNDOS, colorTag, formatearTiempo, limitesClip
} from '@/composables/useAaabTv'

const emit = defineEmits(['publicado'])
const toast = inject('toast')
const notificar = inject('notificar')

const {
  botones, sesion, video, segundosReloj, tagsOrdenados, tagsSinSincronizar,
  cargarVideo, marcarTag, borrarTag, moverTag, puedePublicar,
  iniciarReloj, pausarReloj, reiniciarReloj, sincronizar, nuevaSesion, publicarClips
} = useAaabTv()

const VELOCIDADES = [0.5, 1, 2]
const botonesDe = (categoria) => botones.value.filter(b => b.categoria === categoria)

// ─── Video ──────────────────────────────────────────────────
const videoRef = ref(null)
const inputVideo = ref(null)
const tiempoActual = ref(0)
const reproduciendo = ref(false)
const velocidad = ref(1)
const finPrevia = ref(null)
const mostrarVideoEnVivo = ref(false)

const elegirVideo = (e) => {
  const archivo = e.target.files?.[0]
  e.target.value = ''
  if (!archivo) return
  if (!archivo.type.startsWith('video/')) {
    toast({ tipo: 'warning', titulo: 'Archivo no válido', mensaje: 'Elegí un archivo de video (MP4).' })
    return
  }
  cargarVideo(archivo)
  tiempoActual.value = 0
  if (sesion.modo === 'vivo') mostrarVideoEnVivo.value = true
}

const alCargarMetadatos = () => {
  video.duracion = Math.floor(videoRef.value?.duration || 0)
  if (videoRef.value) videoRef.value.playbackRate = velocidad.value
}

const alAvanzarVideo = () => {
  const v = videoRef.value
  if (!v) return
  tiempoActual.value = v.currentTime
  // Al ver un clip, se corta solo al llegar al final de la ventana
  if (finPrevia.value !== null && v.currentTime >= finPrevia.value) {
    v.pause()
    finPrevia.value = null
  }
}

const alternarReproduccion = () => {
  const v = videoRef.value
  if (!v) return
  if (v.paused) v.play().catch(() => {})
  else { v.pause(); finPrevia.value = null }
}

const mover = (segundos) => {
  const v = videoRef.value
  if (!v) return
  finPrevia.value = null
  v.currentTime = Math.min(Math.max(0, v.currentTime + segundos), v.duration || 0)
}

const cambiarVelocidad = (v) => {
  velocidad.value = v
  if (videoRef.value) videoRef.value.playbackRate = v
}

const porcentaje = (segundo) => (video.duracion ? Math.min(100, Math.max(0, (segundo / video.duracion) * 100)) : 0)

const saltarConClick = (e) => {
  const v = videoRef.value
  if (!v || !video.duracion) return
  const caja = e.currentTarget.getBoundingClientRect()
  finPrevia.value = null
  v.currentTime = ((e.clientX - caja.left) / caja.width) * video.duracion
}

const marcasLinea = computed(() =>
  sesion.tags.filter(t => t.segundo !== null && video.duracion).map(t => {
    const { inicio, fin } = limitesClip(t.segundo, video.duracion)
    return {
      id: t.id,
      titulo: `${t.titulo} · ${formatearTiempo(inicio)} – ${formatearTiempo(fin)}`,
      estilo: { left: porcentaje(inicio) + '%', width: Math.max(0.6, porcentaje(fin) - porcentaje(inicio)) + '%', background: colorTag(t.color).solido }
    }
  })
)

const verClip = (t) => {
  const v = videoRef.value
  if (!v) {
    if (sesion.modo === 'vivo') mostrarVideoEnVivo.value = true
    return
  }
  const { inicio, fin } = limitesClip(t.segundo, video.duracion)
  v.currentTime = inicio
  finPrevia.value = fin
  v.play().catch(() => {})
}

// ─── Modo ───────────────────────────────────────────────────
const cambiarModo = (modo) => {
  if (modo === sesion.modo) return
  videoRef.value?.pause()
  sesion.modo = modo
  mostrarVideoEnVivo.value = false
}

// ─── Tags ───────────────────────────────────────────────────
const ultimoTag = ref(null)
const destelloId = ref(null)
let temporizadorAviso = null

const motivoPadDeshabilitado = computed(() => {
  if (sesion.modo === 'video' && !video.url) return 'Cargá el video para empezar a marcar.'
  if (sesion.modo === 'vivo' && !sesion.reloj.corriendo) return 'Iniciá el cronómetro para marcar en vivo.'
  return ''
})

const marcar = (boton) => {
  if (motivoPadDeshabilitado.value) return
  const tag = marcarTag(boton, videoRef.value?.currentTime ?? 0)
  ultimoTag.value = tag
  destelloId.value = boton.id
  clearTimeout(temporizadorAviso)
  temporizadorAviso = setTimeout(() => { ultimoTag.value = null; destelloId.value = null }, 1500)
}

// ─── Cronómetro y sincronización ───────────────────────────
const syncManual = ref('')
const errorSync = ref('')

const aplicarSincronizacion = (segundo) => {
  sincronizar(segundo)
  errorSync.value = ''
  toast({ tipo: 'success', titulo: 'Tags sincronizados', mensaje: `El cronómetro arranca en el ${formatearTiempo(segundo)} del video.` })
}

const sincronizarAca = () => aplicarSincronizacion(tiempoActual.value)

const sincronizarManual = () => {
  const m = String(syncManual.value).trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/)
  if (!m) {
    errorSync.value = 'Escribilo como minutos:segundos, por ejemplo 02:35.'
    return
  }
  const segundos = Number(m[1] || 0) * 3600 + Number(m[2]) * 60 + Number(m[3])
  if (video.duracion && segundos > video.duracion) {
    errorSync.value = 'Ese momento es posterior al final del video.'
    return
  }
  aplicarSincronizacion(segundos)
}

const confirmarReinicioReloj = () => {
  notificar({
    tipo: 'danger',
    titulo: 'Reiniciar cronómetro',
    mensaje: 'El cronómetro vuelve a cero. Los tags que ya marcaste se conservan.',
    alConfirmar: reiniciarReloj
  })
}

const confirmarNuevaSesion = () => {
  notificar({
    tipo: 'danger',
    titulo: 'Nueva sesión',
    mensaje: 'Se borran los tags de este partido (los clips ya publicados no se tocan).',
    alConfirmar: nuevaSesion
  })
}

// ─── Publicar ───────────────────────────────────────────────
const seleccionados = computed(() => tagsOrdenados.value.filter(t => t.seleccionado && !t.publicado && t.segundo !== null))
const mostrarPublicar = ref(false)
const publicando = ref(false)
const intentoPublicar = ref(false)
const formPublicar = reactive({ partido: '', fecha: '', clips: [] })

const abrirPublicar = () => {
  if (!video.url) {
    toast({ tipo: 'warning', titulo: 'Falta el video', mensaje: 'Cargá el video del partido para poder publicar los clips.' })
    return
  }
  formPublicar.partido = sesion.partido
  formPublicar.fecha = sesion.fecha
  formPublicar.clips = seleccionados.value.map(t => ({ ...t }))
  intentoPublicar.value = false
  mostrarPublicar.value = true
}

const publicar = async () => {
  intentoPublicar.value = true
  const valido = formPublicar.partido.trim() && formPublicar.fecha && formPublicar.clips.every(c => c.titulo.trim())
  if (!valido) return
  publicando.value = true
  try {
    const res = await publicarClips({ partido: formPublicar.partido.trim(), fecha: formPublicar.fecha, clips: formPublicar.clips })
    if (!res.ok) throw new Error(res.message)
    sesion.partido = formPublicar.partido.trim()
    mostrarPublicar.value = false
    toast({ tipo: 'success', titulo: 'Enviado a AAAB TV', mensaje: `${res.payload === 1 ? 'El clip quedó pendiente' : `Los ${res.payload} clips quedaron pendientes`} hasta que Desarrollo Arbitral lo revise.` })
    emit('publicado')
  } catch (e) {
    toast({ tipo: 'danger', titulo: 'No se pudo publicar', mensaje: e.message || 'Intentá de nuevo.' })
  } finally {
    publicando.value = false
  }
}

// ─── Atajos de teclado ─────────────────────────────────────
const alPresionarTecla = (e) => {
  const destino = e.target
  if (mostrarPublicar.value || e.ctrlKey || e.metaKey || e.altKey) return
  if (destino.closest?.('input, textarea, select, [contenteditable="true"]')) return

  if (e.code === 'Space' && videoRef.value) {
    if (destino === videoRef.value) return
    e.preventDefault()
    alternarReproduccion()
    return
  }
  if (e.key === 'ArrowLeft' && videoRef.value) { e.preventDefault(); mover(-5); return }
  if (e.key === 'ArrowRight' && videoRef.value) { e.preventDefault(); mover(5); return }

  const boton = botones.value.find(b => b.atajo && b.atajo === e.key.toUpperCase())
  if (boton) {
    e.preventDefault()
    marcar(boton)
  }
}

onMounted(() => window.addEventListener('keydown', alPresionarTecla))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', alPresionarTecla)
  clearTimeout(temporizadorAviso)
})
</script>

<style scoped>
.bloque {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
}
.bloque-oscuro {
  background: #0f172a;
  border-color: #0f172a;
  color: #e2e8f0;
}
.titulo-bloque { font-size: 0.95rem; font-weight: 800; color: #0f172a; }

/* Selector de modo */
.selector-modo {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
}
.selector-modo button {
  flex: 1;
  min-height: 38px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-weight: 700;
  font-size: 0.875rem;
  color: #475569;
}
.selector-modo button.activo { background: #0f172a; color: #fff; }

/* Video */
.zona-video-vacia {
  text-align: center;
  padding: 36px 16px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}
.zona-video-vacia > .bi { font-size: 2.5rem; color: #dc2626; }

.marco-video {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.marco-video video { display: block; width: 100%; max-height: 62vh; background: #000; }

.aviso-tag,
.aviso-previa {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 14px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  pointer-events: none;
}
.aviso-tag { top: 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35); }
.aviso-previa { top: 12px; background: rgba(15, 23, 42, 0.85); }
.aviso-tag + .aviso-previa { top: 48px; }

.linea-tiempo {
  position: relative;
  height: 26px;
  border-radius: 8px;
  background: #e2e8f0;
  cursor: pointer;
  overflow: hidden;
}
.linea-tiempo:focus-visible { outline: 2px solid #0f172a; outline-offset: 2px; }
.marca-clip {
  position: absolute;
  top: 5px;
  bottom: 5px;
  border-radius: 3px;
  opacity: 0.85;
}
.cabezal {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #0f172a;
  transform: translateX(-1px);
}
.tiempo {
  font-variant-numeric: tabular-nums;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  padding: 0 6px;
}

/* En vivo */
.estado-vivo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}
.estado-vivo .punto { width: 10px; height: 10px; border-radius: 50%; background: #64748b; }
.estado-vivo.corriendo { color: #fca5a5; }
.estado-vivo.corriendo .punto { background: #ef4444; animation: latido 1.2s infinite; }
@keyframes latido { 50% { opacity: 0.3; } }
@media (prefers-reduced-motion: reduce) { .estado-vivo.corriendo .punto { animation: none; } }

.reloj {
  text-align: center;
  font-size: clamp(3rem, 12vw, 5rem);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  color: #fff;
  line-height: 1.1;
  margin: 10px 0 14px;
}
.nota-vivo { font-size: 0.78rem; color: #94a3b8; text-align: center; margin: 12px 0 0; }

.sincronizar {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #334155;
}
.sincronizar-titulo { font-size: 0.9rem; font-weight: 800; color: #fff; margin-bottom: 6px; }
.input-tiempo { width: 80px; text-align: center; }

/* Pad */
.etiqueta-categoria {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 6px;
}
.pad {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}
.boton-tag {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 52px;
  padding: 8px 12px;
  border: 2px solid;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.875rem;
  text-align: left;
  transition: transform 0.1s ease, filter 0.15s ease;
}
.boton-tag:hover:not(:disabled) { filter: brightness(0.96); }
.boton-tag:active:not(:disabled) { transform: scale(0.97); }
.boton-tag:disabled { opacity: 0.45; cursor: not-allowed; }
.boton-tag.destello { animation: destello 0.4s ease; }
@keyframes destello { from { transform: scale(0.94); filter: brightness(1.15); } to { transform: scale(1); } }

.tecla {
  background: #0f172a;
  color: #fff;
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 6px;
  margin-left: 2px;
}

/* Clips */
.lista-clips { position: sticky; top: 12px; }
.clips { max-height: 60vh; overflow-y: auto; padding-right: 2px; }
.clip {
  border: 1px solid #e2e8f0;
  border-left: 4px solid;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 8px;
}
.clip.publicado { background: #f8fafc; opacity: 0.8; }
.badge-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 800;
}
.tiempo-clip { font-size: 0.78rem; font-weight: 700; color: #475569; margin-top: 4px; font-variant-numeric: tabular-nums; }
.pie-clips {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
  margin-top: 4px;
}
.clip-publicar {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
}

.min-w-0 { min-width: 0; }

@media (max-width: 1199px) {
  .lista-clips { position: static; }
}
</style>
