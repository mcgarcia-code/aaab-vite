<template>
  <div>
            <p v-if="modoAdmin" class="small text-muted mb-3">
              <i class="bi bi-info-circle" aria-hidden="true"></i>
              Ves todos los clips de todos los canales, también los pendientes y los no autorizados (con su estado).
            </p>
            <div class="d-flex flex-column flex-md-row gap-2 mb-3">
              <!-- Qué se mira: un canal, lo propio, una colección oficial o una de mis listas -->
              <select v-model="vistaActiva" class="form-select shadow-sm border-secondary-subtle fw-semibold control-barra selector-vista" aria-label="Qué ver">
                <optgroup label="Canales">
                  <option v-for="c in canalesConPublico" :key="claveCanal(c.idGrupo)" :value="claveCanal(c.idGrupo)">{{ c.nombre }}</option>
                </optgroup>
                <optgroup v-if="!modoAdmin || puedePublicar" label="Para mí">
                  <option v-if="!modoAdmin" value="mis-clips">Mis clips (donde aparezco)</option>
                  <option v-if="puedePublicar" value="publicados">Publicados por mí</option>
                </optgroup>
                <optgroup v-if="partidos.length" label="Partidos">
                  <option v-for="p in partidos" :key="p.clave" :value="p.clave">{{ p.nombre }} ({{ fechaArg(p.fecha) }})</option>
                </optgroup>
                <optgroup v-if="coleccionesBase.length" label="Colecciones oficiales">
                  <option v-for="c in coleccionesBase" :key="c.id" :value="`c-${c.id}`">{{ c.nombre }}</option>
                </optgroup>
                <optgroup v-if="listasReproduccion.length" label="Mis listas">
                  <option v-for="l in listasReproduccion" :key="l.id" :value="`l-${l.id}`">{{ l.nombre }} ({{ l.idsClips.length }})</option>
                </optgroup>
              </select>
              <div class="input-group shadow-sm buscador">
                <span class="input-group-text bg-white control-barra"><i class="bi bi-search" aria-hidden="true"></i></span>
                <input v-model="busqueda" type="search" class="form-control border-start-0 control-barra" aria-label="Buscar clips" placeholder="Buscar por título, descripción o partido">
              </div>
              <BotonHerramienta tipo="nuevo" :texto="puedePublicar ? 'Analizar y publicar' : 'Analizar un partido'" icono="bi-camera-reels" :solo-icono-en-celular="false" @click="emit('ir-estudio')" />
            </div>

            <!-- ============ VISTA PARTIDO: todos los clips del partido sobre su línea de tiempo ============ -->
            <section v-if="partidoActivo && clipsFiltrados.length" class="card card-body shadow-sm border-light-subtle rounded-3 p-3 mb-3 linea-partido" aria-label="Clips del partido en el tiempo">
              <div class="d-flex flex-wrap align-items-center gap-2 mb-2 small text-muted">
                <i class="bi bi-trophy" aria-hidden="true"></i>
                <strong class="text-body">{{ partidoActivo.nombre }}</strong> · {{ fechaArg(partidoActivo.fecha) }}
                · {{ clipsFiltrados.length }} {{ clipsFiltrados.length === 1 ? 'clip' : 'clips' }}
                <span v-if="hayVariosVideos" class="w-100">
                  <i class="bi bi-info-circle" aria-hidden="true"></i> Hay clips de más de un video (por ejemplo, cada tiempo por separado): sus minutos son de su propio video.
                </span>
              </div>
              <div class="pista-partido">
                <span v-for="m in marcasPartido" :key="m" class="marca-partido" :style="{ left: porcentajePartido(m) + '%' }">{{ formatearTiempo(m) }}</span>
                <button v-for="c in clipsFiltrados" :key="c.id" type="button" class="punto-partido"
                        :style="{ left: porcentajePartido((c.inicio + c.fin) / 2) + '%', background: colorTag(c.color).solido }"
                        :title="`${formatearTiempo((c.inicio + c.fin) / 2)} · ${c.titulo}`"
                        :aria-label="`Ver ${c.titulo}, minuto ${formatearTiempo((c.inicio + c.fin) / 2)}`" @click="clipAbierto = c"></button>
              </div>
            </section>

            <!-- Qué es lo que se está mirando -->
            <div v-if="listaActiva || coleccionActiva || vistaActiva === 'mis-clips' || vistaActiva === 'publicados'"
                 class="d-flex flex-wrap align-items-center gap-2 mb-3 small text-muted">
              <template v-if="listaActiva">
                <i class="bi bi-collection-play" aria-hidden="true"></i> Lista de reproducción: solo la ves vos.
                <button type="button" class="btn btn-link btn-sm text-danger p-0 fw-bold" @click="confirmarBorrarLista">
                  <i class="bi bi-trash3" aria-hidden="true"></i> Borrar lista
                </button>
              </template>
              <template v-else-if="coleccionActiva">
                <i class="bi bi-bookmark-star" aria-hidden="true"></i>
                <span>Colección oficial de {{ coleccionActiva.nombreCanal }}<template v-if="coleccionActiva.descripcion"> · {{ coleccionActiva.descripcion }}</template></span>
              </template>
              <template v-else-if="vistaActiva === 'mis-clips'">
                <i class="bi bi-person-video" aria-hidden="true"></i> Clips autorizados donde te marcaron como árbitro involucrado.
              </template>
              <template v-else>
                <i class="bi bi-person-check" aria-hidden="true"></i> Todo lo que publicaste, con el estado de cada canal.
              </template>
            </div>

            <PestanasSeccion v-if="etiquetas.length > 1" v-model="etiquetaActiva" :pestanas="pestanasEtiquetas" class="mb-3" aria-label="Filtrar por situación" />

            <EstadoCargando v-if="cargando && !clipsBase.length" texto="Cargando clips" />

            <EstadoVacio v-else-if="errorClips && !clipsBase.length" icono="bi-exclamation-circle" titulo="No se pudieron cargar los clips"
                         :mensaje="errorClips" />

            <EstadoVacio v-else-if="!clipsFiltrados.length" icono="bi-play-btn" titulo="No hay clips"
                         :mensaje="mensajeVacio" />

            <div v-else class="row g-3">
              <div v-for="c in paginados" :key="c.id" class="col-12 col-sm-6 col-lg-4 col-xxl-3">
              <button type="button" class="card shadow-sm border-light-subtle rounded-3 overflow-hidden h-100 w-100 p-0 text-start tarjeta-clip" @click="clipAbierto = c">
                <div class="miniatura">
                  <img v-if="c.urlMiniatura" :src="c.urlMiniatura" alt="" loading="lazy" class="imagen-miniatura">
                  <span class="estado-pill text-white etiqueta-miniatura" :style="{ background: colorTag(c.color).solido }">{{ c.etiqueta }}</span>
                  <span class="icono-play" aria-hidden="true"><i class="bi bi-play-fill"></i></span>
                  <span v-if="estadoEnVista(c) && estadoEnVista(c) !== 'autorizado'" class="estado-pill estado-miniatura"
                        :class="ESTADOS_DESTINO[estadoEnVista(c)].clase">
                    <i :class="['bi', ESTADOS_DESTINO[estadoEnVista(c)].icono]" aria-hidden="true"></i> {{ ESTADOS_DESTINO[estadoEnVista(c)].etiqueta }}
                  </span>
                  <span v-if="c.vistoPorMi" class="estado-pill estado-verde visto"><i class="bi bi-check2" aria-hidden="true"></i> Visto</span>
                  <span class="duracion">{{ formatearTiempo(c.fin - c.inicio) }}</span>
                </div>
                <div class="p-3 text-start">
                  <h6 class="fw-bold text-dark mb-1 lh-12">{{ c.titulo }}</h6>
                  <p class="small text-muted mb-2 descripcion-clip">{{ c.descripcion || 'Sin descripción' }}</p>
                  <div class="d-flex justify-content-between gap-2 pt-2 border-top texto-075 text-secondary fw-semibold">
                    <span class="text-truncate">{{ c.partido || (c.origen === 'externo' ? 'Video externo' : '') }}</span>
                    <span class="flex-shrink-0">{{ fechaArg(c.fecha) }}</span>
                  </div>
                </div>
              </button>
              </div>
            </div>
            <BarraPaginacion v-if="totalPaginas > 1" v-model="paginaActual" :total="totalPaginas" class="mt-3" />

    <!-- ============ DETALLE DEL CLIP ============ -->
    <ModalBase :show="!!clipAbierto" :titulo="clipAbierto?.titulo" icono="bi-play-btn" color-icono="bg-danger-subtle text-danger"
               max-width="860px" @close="clipAbierto = null">
      <template v-if="clipAbierto">
        <ReproductorClip ref="reproductor" v-bind="tramoDe(clipAbierto)" :comentarios="comentariosClip" :anotaciones="clipAbierto.anotaciones || []"
                         :puede-anotar="modoAdmin || esPropio(clipAbierto)" :guardando="guardandoDibujo"
                         @posicion="p => posicionClip = p" @guardar-anotaciones="guardarDibujos" @visto="registrarVista(clipAbierto.id)" />
        <div class="d-flex flex-wrap gap-2 align-items-center mt-3">
          <span class="estado-pill text-white" :style="{ background: colorTag(clipAbierto.color).solido }">{{ clipAbierto.etiqueta }}</span>
          <span v-if="DECISIONES[clipAbierto.decision]" class="estado-pill" :class="DECISIONES[clipAbierto.decision].clase">
            <i :class="['bi', DECISIONES[clipAbierto.decision].icono]" aria-hidden="true"></i> Decisión {{ DECISIONES[clipAbierto.decision].etiqueta.toLowerCase() }}
          </span>
          <span class="small text-muted"><i class="bi bi-calendar3" aria-hidden="true"></i> {{ fechaArg(clipAbierto.fecha) }}</span>
          <span v-if="clipAbierto.partido" class="small text-muted"><i class="bi bi-trophy" aria-hidden="true"></i> {{ clipAbierto.partido }}</span>
          <span v-if="clipAbierto.origen === 'externo'" class="small text-muted"><i class="bi bi-cloud-arrow-up" aria-hidden="true"></i> Video externo</span>
          <span v-else class="small text-muted"><i class="bi bi-clock" aria-hidden="true"></i> Minuto {{ formatearTiempo(clipAbierto.inicio + (clipAbierto.fin - clipAbierto.inicio) / 2) }}</span>
        </div>

        <!-- Canales donde se ve (el autor ve también los pendientes y los no autorizados) -->
        <div class="d-flex flex-wrap gap-1 align-items-center mt-2">
          <span class="small fw-bold text-muted me-1">Canales:</span>
          <span v-for="d in destinosVisibles(clipAbierto)" :key="claveCanal(d.idGrupo)" class="estado-pill estado-gris">
            <i :class="['bi', d.idGrupo === null ? 'bi-globe2' : 'bi-people-fill']" aria-hidden="true"></i> {{ d.nombre }}
            <span v-if="d.estado !== 'autorizado'" class="estado-pill ms-1" :class="ESTADOS_DESTINO[d.estado].clase">
              {{ ESTADOS_DESTINO[d.estado].etiqueta }}
            </span>
          </span>
        </div>

        <p v-if="clipAbierto.arbitros?.length" class="small mt-2 mb-0">
          <i class="bi bi-person-badge" aria-hidden="true"></i> <strong>Árbitros:</strong> {{ clipAbierto.arbitros.map(a => a.nombre).join(' · ') }}
        </p>
        <p v-if="resumenJugada(clipAbierto.jugada)" class="small mt-1 mb-0">
          <i class="bi bi-geo-alt" aria-hidden="true"></i> <strong>Jugada:</strong> {{ resumenJugada(clipAbierto.jugada) }}
        </p>
        <p class="mt-2 mb-0 texto-pre-line">{{ clipAbierto.descripcion || 'Sin descripción.' }}</p>
        <p v-if="clipAbierto.autor" class="small text-muted mt-2 mb-0">Publicado por {{ clipAbierto.autor }}</p>
        <p v-if="esPropio(clipAbierto) && clipAbierto.destinos.some(d => d.estado === 'pendiente')" class="small text-muted mt-1 mb-0">
          <i class="bi bi-info-circle" aria-hidden="true"></i> Los canales pendientes los revisa el coordinador general: hasta entonces ahí solo lo ves vos.
        </p>

        <!-- Compartir, ver el partido completo y (coordinador general) quién lo vio -->
        <div class="d-flex flex-wrap gap-2 mt-3">
          <button type="button" class="btn btn-sm btn-light border fw-bold" @click="compartirClip(clipAbierto)">
            <i class="bi bi-link-45deg" aria-hidden="true"></i> Copiar enlace
          </button>
          <button v-if="clipAbierto.partido && claveDePartido(clipAbierto) !== vistaActiva" type="button" class="btn btn-sm btn-light border fw-bold"
                  @click="verPartido(clipAbierto)">
            <i class="bi bi-trophy" aria-hidden="true"></i> Ver todos los clips del partido
          </button>
          <VistasClip v-if="modoAdmin" :id-clip="clipAbierto.id" :cantidad="clipAbierto.cantidadVistas || 0" />
        </div>

        <!-- Guardar en mis listas de reproducción -->
        <div class="mt-3">
          <button type="button" class="btn btn-sm btn-light border fw-bold" :aria-expanded="mostrarListas" @click="mostrarListas = !mostrarListas">
            <i class="bi bi-collection-play" aria-hidden="true"></i> Guardar en lista
          </button>
          <div v-if="mostrarListas" class="card card-body shadow-sm border-light-subtle rounded-3 p-3 mt-2 panel-listas">
            <p v-if="!listasReproduccion.length" class="small text-muted mb-2">Todavía no tenés listas: creá la primera.</p>
            <div v-for="l in listasReproduccion" :key="l.id" class="form-check">
              <input :id="`lista-${l.id}`" type="checkbox" class="form-check-input" :checked="estaEnLista(l, clipAbierto)"
                     :disabled="listaOcupada === l.id" @change="alternarEnLista(l, $event.target.checked)">
              <label :for="`lista-${l.id}`" class="form-check-label small">{{ l.nombre }}</label>
            </div>
            <form class="d-flex gap-2 mt-2" novalidate @submit.prevent="crearListaConClip">
              <label for="nueva-lista" class="visually-hidden">Nombre de la nueva lista</label>
              <input id="nueva-lista" v-model="nombreListaNueva" type="text" maxlength="60" class="form-control form-control-sm"
                     :class="{ 'is-invalid': intentoLista && !nombreListaNueva.trim() }" placeholder="Nueva lista, ej: Faltas de ataque">
              <button type="submit" class="btn btn-sm btn-dark fw-bold flex-shrink-0" :disabled="creandoLista">Crear</button>
            </form>
          </div>
        </div>

        <ComentariosClip :id-clip="clipAbierto.id" :moderar="modoAdmin" :posicion-actual="posicionClip"
                         @ir-a="s => reproductor?.irA(s)" @cambiaron="l => comentariosClip = l" />
      </template>
      <template #footer>
        <div class="d-flex justify-content-between w-100 gap-2">
          <button v-if="esPropioPendiente(clipAbierto)" type="button" class="btn btn-light border text-danger fw-bold" @click="confirmarBorrado">
            <i class="bi bi-trash3" aria-hidden="true"></i> Borrar
          </button>
          <button type="button" class="btn btn-danger rounded-pill fw-bold ms-auto" @click="clipAbierto = null">Cerrar</button>
        </div>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModalBase from '@/components/ModalBase.vue'
import VistasClip from '@/components/panel-arbitro/aaab-tv/VistasClip.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import ReproductorClip from '@/components/panel-arbitro/aaab-tv/ReproductorClip.vue'
import ComentariosClip from '@/components/panel-arbitro/aaab-tv/ComentariosClip.vue'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { useAaabTv, colorTag, formatearTiempo, ESTADOS_DESTINO, DECISIONES, claveCanal, resumenJugada } from '@/composables/useAaabTv'
import { usePaginacion } from '@/composables/usePaginacion'
import { NOMBRE_CANAL_PUBLICO, esUsuarioActual, estaInvolucrado } from '@/api/aaabTvClips'
import { normalizarTexto } from '@/utils/texto'
import { fechaArg } from '@/utils/fechas'

const CLIPS_POR_PAGINA = 12

// Portal de AAAB TV: canales, Mis clips, colecciones oficiales y listas.
// Lo usan el panel árbitro (AaabTv.vue) y el coordinador general (AaabTvAdmin.vue, con modoAdmin):
// el coordinador general ve todos los clips de todos los canales, con el estado de cada canal.
const props = defineProps({
  modoAdmin: { type: Boolean, default: false }
})
const emit = defineEmits(['ir-estudio'])

const notificar = inject('notificar')
const toast = inject('toast')
const route = useRoute()
const router = useRouter()
const {
  clipsVisibles, cargandoClips, cargarClips, canales, cargarCanales,
  clipsModeracion, cargandoModeracion, cargarClipsModeracion, gruposPublicacion, cargarGruposPublicacion,
  borrarClipPublicado, puedePublicar, tramoDe, guardarAnotaciones, registrarVista,
  listasReproduccion, cargarListasReproduccion, crearListaReproduccion, borrarListaReproduccion, cambiarClipEnLista,
  colecciones, cargarColecciones, coleccionesAdmin, cargarColeccionesAdmin
} = useAaabTv()

// De dónde salen los datos: el árbitro ve lo suyo; el coordinador general, todo
const clipsBase = computed(() => (props.modoAdmin ? clipsModeracion.value : clipsVisibles.value))
const cargando = computed(() => (props.modoAdmin ? cargandoModeracion.value : cargandoClips.value))
const coleccionesBase = computed(() => (props.modoAdmin ? coleccionesAdmin.value : colecciones.value))

// Clips, canales, listas y colecciones del portal (el panel de botones lo carga el Estudio)
const errorClips = ref('')
onMounted(async () => {
  cargarListasReproduccion()
  if (props.modoAdmin) {
    cargarGruposPublicacion()
    cargarColeccionesAdmin()
  } else {
    cargarCanales()
    cargarColecciones()
  }
  const res = await (props.modoAdmin ? cargarClipsModeracion() : cargarClips())
  errorClips.value = res?.ok ? '' : (res?.message || 'Intentá de nuevo en un rato.')
  abrirClipDelEnlace()
})

// ─── Enlace directo a un clip (?clip=<id>) ───────────────────
// Al entrar con el enlace se abre ese clip; mientras está abierto, el enlace queda en la URL
const RUTA_PORTAL = '/panel-arbitro/aaab-tv'
const abrirClipDelEnlace = () => {
  const id = route.query.clip
  if (!id) return
  const clip = clipsBase.value.find(c => String(c.id) === String(id))
  if (clip) clipAbierto.value = clip
  else toast({ tipo: 'warning', titulo: 'Clip no disponible', mensaje: 'El clip del enlace no existe o no está en tus canales.' })
}

const compartirClip = async (clip) => {
  const enlace = `${window.location.origin}${RUTA_PORTAL}?clip=${encodeURIComponent(clip.id)}`
  // En el celular se abre el menú de compartir (WhatsApp, etc.); si no, se copia
  if (navigator.share) {
    try {
      await navigator.share({ title: clip.titulo, text: `AAAB TV: ${clip.titulo}`, url: enlace })
      return
    } catch (e) {
      if (e?.name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(enlace)
    toast({ tipo: 'success', titulo: 'Enlace copiado', mensaje: 'Lo puede abrir quien tenga acceso a ese clip.' })
  } catch {
    toast({ tipo: 'warning', titulo: 'No se pudo copiar', mensaje: enlace })
  }
}

// Autor = mismo id y mismo tipo de usuario (un árbitro y una autoridad pueden compartir id)
const esPropio = (clip) => !!clip && esUsuarioActual(clip.idAutor, clip.tipoAutor)
// El autor puede borrar su clip mientras ningún canal lo revisó; después lo maneja el coordinador general
const esPropioPendiente = (clip) => esPropio(clip) && clip.destinos.every(d => d.estado === 'pendiente')
// El autor y el coordinador general ven todos los canales del clip con su estado; los demás, solo los
// canales donde está autorizado y a los que pueden entrar (el público y el de su grupo)
const destinosVisibles = (clip) => ((props.modoAdmin || esPropio(clip))
  ? clip.destinos
  : clip.destinos.filter(d => d.estado === 'autorizado' &&
      canalesConPublico.value.some(c => claveCanal(c.idGrupo) === claveCanal(d.idGrupo))))

// ─── Portal ─────────────────────────────────────────────────
const busqueda = ref('')
const etiquetaActiva = ref('')
const clipAbierto = ref(null)

// Qué se mira: 'publico' o 'g-<idGrupo>' (un canal), 'mis-clips', 'publicados',
// 'c-<idColeccion>' (colección oficial) o 'l-<idLista>' (una de mis listas)
const vistaActiva = ref('publico')
const PUBLICO = { idGrupo: null, nombre: NOMBRE_CANAL_PUBLICO }
// El coordinador general entra a todos los canales: el público y el de cada grupo
const canalesConPublico = computed(() => {
  if (props.modoAdmin) return [PUBLICO, ...gruposPublicacion.value]
  return canales.value.length ? canales.value : [PUBLICO]
})
const listaActiva = computed(() =>
  listasReproduccion.value.find(l => `l-${l.id}` === vistaActiva.value) || null)
const coleccionActiva = computed(() =>
  coleccionesBase.value.find(c => `c-${c.id}` === vistaActiva.value) || null)
const esVistaDeCanal = computed(() => vistaActiva.value === 'publico' || vistaActiva.value.startsWith('g-'))

// ─── Partidos: todos los clips de un partido (los del análisis), ordenados en el tiempo ───
const MAXIMO_PARTIDOS = 40
const claveDePartido = (clip) => `p-${clip.fecha}|${clip.partido}`
// Lo que se puede ver del partido: el coordinador general, todo; el resto, lo autorizado y lo propio
const visibleEnPartido = (c) => props.modoAdmin || esPropio(c) || autorizadoEnAlguno(c)
const partidos = computed(() => {
  const mapa = new Map()
  clipsBase.value
    .filter(c => c.partido && c.origen !== 'externo' && visibleEnPartido(c))
    .forEach(c => {
      const clave = claveDePartido(c)
      if (!mapa.has(clave)) mapa.set(clave, { clave, nombre: c.partido, fecha: c.fecha })
    })
  return [...mapa.values()].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).slice(0, MAXIMO_PARTIDOS)
})
const partidoActivo = computed(() => partidos.value.find(p => p.clave === vistaActiva.value) || null)
const verPartido = (clip) => {
  vistaActiva.value = claveDePartido(clip)
  clipAbierto.value = null
}

// Línea de tiempo del partido: de 0 al último clip, con una marca cada tanto
const finPartido = computed(() => Math.max(60, ...clipsFiltrados.value.map(c => c.fin)))
const porcentajePartido = (segundo) => Math.min(100, Math.max(0, (segundo / finPartido.value) * 100))
const marcasPartido = computed(() => {
  const paso = [300, 600, 900, 1200].find(p => finPartido.value / p <= 8) || 1800
  const marcas = []
  for (let s = 0; s <= finPartido.value; s += paso) marcas.push(s)
  return marcas
})
// Si los clips vienen de videos distintos (por ejemplo, cada tiempo cargado aparte), se avisa
const hayVariosVideos = computed(() => new Set(clipsFiltrados.value.map(c => c.idEvento || c.idVideo).filter(Boolean)).size > 1)

const estaEnLista = (lista, clip) => lista.idsClips.some(id => String(id) === String(clip.id))
const destinoEnVista = (clip) => clip.destinos.find(d => claveCanal(d.idGrupo) === vistaActiva.value)
// Estado del clip en el canal que se mira (fuera de un canal no se muestra)
const estadoEnVista = (clip) => (esVistaDeCanal.value ? destinoEnVista(clip)?.estado ?? null : null)
const autorizadoEnAlguno = (clip) => clip.destinos.some(d => d.estado === 'autorizado')
// Los clips de una lista o colección, en su orden
const enOrden = (ids) => ids.map(id => clipsBase.value.find(c => String(c.id) === String(id))).filter(Boolean)

// En un canal: los autorizados, y los propios aunque estén pendientes (el coordinador general ve todos,
// con su estado). En el resto, lo que corresponde a cada vista
const clipsDeVista = computed(() => {
  if (listaActiva.value) return enOrden(listaActiva.value.idsClips)
  // En una colección solo se ven los clips que siguen autorizados en su canal
  if (coleccionActiva.value) {
    const canal = claveCanal(coleccionActiva.value.idGrupo)
    return enOrden(coleccionActiva.value.idsClips).filter(c =>
      c.destinos.some(d => claveCanal(d.idGrupo) === canal && d.estado === 'autorizado'))
  }
  // En un partido: sus clips del análisis, en el orden en que pasaron
  if (partidoActivo.value) {
    return clipsBase.value
      .filter(c => claveDePartido(c) === partidoActivo.value.clave && c.origen !== 'externo' && visibleEnPartido(c))
      .sort((a, b) => a.inicio - b.inicio)
  }
  if (vistaActiva.value === 'mis-clips') return clipsBase.value.filter(c => estaInvolucrado(c) && autorizadoEnAlguno(c))
  if (vistaActiva.value === 'publicados') return clipsBase.value.filter(esPropio)
  return clipsBase.value
    .filter(c => {
      const destino = destinoEnVista(c)
      return !!destino && (props.modoAdmin || destino.estado === 'autorizado' || esPropio(c))
    })
    .sort((a, b) => String(b.publicadoEl || '').localeCompare(String(a.publicadoEl || '')))
})

const etiquetas = computed(() => [...new Set(clipsDeVista.value.map(c => c.etiqueta))])
// Filtro por situación: "Todas" más una pestaña por etiqueta
const pestanasEtiquetas = computed(() => [{ clave: '', etiqueta: 'Todas' }, ...etiquetas.value.map(e => ({ clave: e, etiqueta: e }))])

const clipsFiltrados = computed(() => {
  const q = normalizarTexto(busqueda.value)
  return clipsDeVista.value.filter(c =>
    (!etiquetaActiva.value || c.etiqueta === etiquetaActiva.value) &&
    (!q || normalizarTexto(`${c.titulo} ${c.descripcion} ${c.partido} ${c.etiqueta}`).includes(q))
  )
})

const mensajeVacio = computed(() => {
  if (clipsDeVista.value.length) return 'Ningún clip coincide con la búsqueda.'
  if (listaActiva.value) return 'Esta lista no tiene clips. Abrí un clip y tocá "Guardar en lista".'
  if (coleccionActiva.value) return 'Esta colección todavía no tiene clips.'
  if (vistaActiva.value === 'mis-clips') return 'Todavía no hay clips autorizados donde te hayan marcado como árbitro involucrado.'
  if (vistaActiva.value === 'publicados') return 'Todavía no publicaste clips.'
  if (partidoActivo.value) return 'No hay clips de este partido para ver.'
  return 'Todavía no hay clips en este canal.'
})

// Mientras un clip está abierto, su enlace queda en la URL (?clip=<id>); al cerrarlo se saca
watch(clipAbierto, (clip) => {
  const { clip: actual, ...resto } = route.query
  if (clip && String(actual) !== String(clip.id)) router.replace({ query: { ...route.query, clip: clip.id } })
  else if (!clip && actual) router.replace({ query: resto })
})

// Paginación de la grilla (vuelve a la primera página al cambiar de vista o de filtro)
const { paginaActual, totalPaginas, paginados } = usePaginacion(clipsFiltrados, CLIPS_POR_PAGINA)
watch([vistaActiva, busqueda, etiquetaActiva], () => { paginaActual.value = 1 })

watch(vistaActiva, () => { etiquetaActiva.value = '' })

// ─── Dibujos sobre el video (los guarda el autor del clip) ───
// Reproductor y comentarios del clip abierto: posición actual y comentarios con momento
const reproductor = ref(null)
const posicionClip = ref(null)
const comentariosClip = ref([])
watch(clipAbierto, (nuevo, anterior) => {
  if (nuevo?.id === anterior?.id) return
  posicionClip.value = null
  comentariosClip.value = []
})

const guardandoDibujo = ref(false)
const guardarDibujos = async (anotaciones) => {
  const clip = clipAbierto.value
  guardandoDibujo.value = true
  try {
    const res = await guardarAnotaciones(clip.id, anotaciones)
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo guardar el dibujo', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    clipAbierto.value = { ...clip, ...res.payload }
  } finally {
    guardandoDibujo.value = false
  }
}

// ─── Listas de reproducción ────────────────────────────────
const mostrarListas = ref(false)
const listaOcupada = ref(null)
const nombreListaNueva = ref('')
const intentoLista = ref(false)
const creandoLista = ref(false)

watch(clipAbierto, () => {
  mostrarListas.value = false
  nombreListaNueva.value = ''
  intentoLista.value = false
})

const alternarEnLista = async (lista, incluir) => {
  listaOcupada.value = lista.id
  try {
    const res = await cambiarClipEnLista(lista.id, clipAbierto.value.id, incluir)
    if (!res?.ok) toast({ tipo: 'danger', titulo: 'No se pudo guardar', mensaje: res?.message || 'Intentá de nuevo.' })
  } finally {
    listaOcupada.value = null
  }
}

// Crea la lista y le agrega el clip abierto
const crearListaConClip = async () => {
  intentoLista.value = true
  if (!nombreListaNueva.value.trim() || creandoLista.value) return
  creandoLista.value = true
  try {
    const res = await crearListaReproduccion(nombreListaNueva.value)
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo crear la lista', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    await alternarEnLista(res.payload, true)
    nombreListaNueva.value = ''
    intentoLista.value = false
  } finally {
    creandoLista.value = false
  }
}

const confirmarBorrarLista = () => {
  const lista = listaActiva.value
  notificar({
    tipo: 'danger',
    titulo: 'Borrar lista',
    mensaje: `Se borra la lista "${lista.nombre}". Los clips siguen en AAAB TV.`,
    alConfirmar: async () => {
      const res = await borrarListaReproduccion(lista.id)
      if (!res?.ok) {
        toast({ tipo: 'danger', titulo: 'No se pudo borrar', mensaje: res?.message || 'Intentá de nuevo.' })
        return
      }
      vistaActiva.value = 'publico'
    }
  })
}

const confirmarBorrado = () => {
  const clip = clipAbierto.value
  notificar({
    tipo: 'danger',
    titulo: 'Borrar clip',
    mensaje: `Se quita "${clip.titulo}" de AAAB TV.`,
    alConfirmar: async () => {
      const res = await borrarClipPublicado(clip.id)
      if (!res?.ok) {
        toast({ tipo: 'danger', titulo: 'No se pudo borrar', mensaje: res?.message || 'Intentá de nuevo.' })
        return
      }
      clipAbierto.value = null
    }
  })
}
</script>

<style scoped>
/* Portal */
.buscador { max-width: 460px; }
.selector-vista { font-weight: 700; }
@media (min-width: 768px) {
  .selector-vista { max-width: 240px; }
}
.panel-listas { max-width: 420px; }
.tarjeta-clip { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.tarjeta-clip:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12); }
.tarjeta-clip:focus-visible { outline: 2px solid var(--o-texto, #0f172a); outline-offset: 2px; }

.miniatura {
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #7f1d1d 140%);
}
.imagen-miniatura { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.visto { position: absolute; left: 10px; bottom: 10px; }
/* Vista Partido: los clips como puntos sobre el tiempo del partido */
.pista-partido {
  position: relative;
  height: 44px;
  margin: 0 8px;
  border-bottom: 2px solid var(--o-borde, #cbd5e1);
}
.marca-partido {
  position: absolute;
  bottom: -18px;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--o-texto-suave, #64748b);
  font-variant-numeric: tabular-nums;
}
.punto-partido {
  position: absolute;
  bottom: 8px;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  padding: 0;
  border: 2px solid var(--o-tarjeta, #fff);
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.3);
}
.punto-partido:hover, .punto-partido:focus-visible { transform: scale(1.25); outline: 2px solid var(--o-texto, #0f172a); outline-offset: 1px; }
.linea-partido + * { margin-top: 26px; }
.icono-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #dc2626;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}
.duracion {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.etiqueta-miniatura { position: absolute; top: 10px; left: 10px; }
.estado-miniatura { position: absolute; top: 10px; right: 10px; }

.descripcion-clip {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
