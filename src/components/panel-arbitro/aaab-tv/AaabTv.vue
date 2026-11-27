<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom">
          <p class="seccion-descripcion">Análisis de partidos y clips</p>
          <PestanasSeccion :model-value="vista" :pestanas="pestanasTv" llenar aria-label="AAAB TV" @update:model-value="irA" />
        </div>

        <div class="card-body p-3 p-md-4">

          <!-- ======================= AAAB TV ======================= -->
          <template v-if="vista === 'tv'">
            <div class="d-flex flex-column flex-md-row gap-2 mb-3">
              <!-- Qué se mira: un canal, lo propio, una colección oficial, una de mis listas o mis montajes -->
              <select v-model="vistaActiva" class="form-select selector-vista" aria-label="Qué ver">
                <optgroup label="Canales">
                  <option v-for="c in canalesConPublico" :key="claveCanal(c.idGrupo)" :value="claveCanal(c.idGrupo)">{{ c.nombre }}</option>
                </optgroup>
                <optgroup label="Para mí">
                  <option value="mis-clips">Mis clips (donde aparezco)</option>
                  <option v-if="puedePublicar" value="publicados">Publicados por mí</option>
                  <option value="montajes">Mis montajes</option>
                </optgroup>
                <optgroup v-if="colecciones.length" label="Colecciones oficiales">
                  <option v-for="c in colecciones" :key="c.id" :value="`c-${c.id}`">{{ c.nombre }}</option>
                </optgroup>
                <optgroup v-if="listasReproduccion.length" label="Mis listas">
                  <option v-for="l in listasReproduccion" :key="l.id" :value="`l-${l.id}`">{{ l.nombre }} ({{ l.idsClips.length }})</option>
                </optgroup>
              </select>
              <div class="input-group buscador">
                <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true"></i></span>
                <input v-model="busqueda" type="search" class="form-control border-start-0" aria-label="Buscar clips" placeholder="Buscar por título, descripción o partido">
              </div>
              <BotonHerramienta tipo="nuevo" :texto="puedePublicar ? 'Analizar y publicar' : 'Analizar un partido'" icono="bi-camera-reels" :solo-icono-en-celular="false" @click="irA('estudio')" />
            </div>

            <!-- Qué es lo que se está mirando, y armar un montaje con esos clips -->
            <div v-if="vistaActiva !== 'montajes' && (listaActiva || coleccionActiva || vistaActiva === 'mis-clips' || vistaActiva === 'publicados')"
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
              <button v-if="clipsFiltrados.length > 1" type="button" class="btn btn-sm btn-light border fw-bold ms-auto" @click="abrirMontaje">
                <i class="bi bi-film" aria-hidden="true"></i> Armar montaje ({{ clipsFiltrados.length }})
              </button>
            </div>

            <!-- ============ MIS MONTAJES ============ -->
            <template v-if="vistaActiva === 'montajes'">
              <p class="small text-muted">
                <i class="bi bi-info-circle" aria-hidden="true"></i>
                Un montaje une varios clips en un solo video. Armalo desde una lista, una colección o "Mis clips" con "Armar montaje";
                el servidor lo prepara y te avisa cuando está listo para ver o descargar.
              </p>
              <EstadoVacio v-if="!montajes.length" icono="bi-film" titulo="Todavía no armaste montajes" mensaje="Elegí una lista o colección y tocá “Armar montaje”." />
              <ul v-else class="list-unstyled m-0 d-flex flex-column gap-2">
                <li v-for="m in montajes" :key="m.id" class="montaje">
                  <div class="flex-grow-1 min-w-0">
                    <div class="fw-bold text-truncate">{{ m.titulo }}</div>
                    <div class="small text-muted">{{ m.idsClips.length }} clips · {{ fechaHora(m.creadoEl) }}</div>
                    <div v-if="m.estado === 'error'" class="small text-danger">{{ m.error || 'No se pudo armar.' }}</div>
                  </div>
                  <span class="estado-pill" :class="ESTADOS_MONTAJE[m.estado]?.clase">
                    <i :class="['bi', ESTADOS_MONTAJE[m.estado]?.icono]" aria-hidden="true"></i> {{ ESTADOS_MONTAJE[m.estado]?.etiqueta }}
                  </span>
                  <a v-if="m.estado === 'listo' && m.urlVideo" :href="m.urlVideo" target="_blank" rel="noopener" class="btn btn-sm btn-dark fw-bold" download>
                    <i class="bi bi-download" aria-hidden="true"></i> Ver / descargar
                  </a>
                  <button type="button" class="btn btn-sm btn-light border text-danger" :aria-label="`Borrar montaje ${m.titulo}`" @click="borrarMontajeElegido(m)">
                    <i class="bi bi-trash3" aria-hidden="true"></i>
                  </button>
                </li>
              </ul>
            </template>

            <template v-else>
            <div v-if="etiquetas.length > 1" class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Filtrar por situación">
              <button type="button" class="filtro" :class="{ activo: !etiquetaActiva }" :aria-pressed="!etiquetaActiva" @click="etiquetaActiva = ''">Todas</button>
              <button v-for="e in etiquetas" :key="e" type="button" class="filtro" :class="{ activo: etiquetaActiva === e }"
                      :aria-pressed="etiquetaActiva === e" @click="etiquetaActiva = etiquetaActiva === e ? '' : e">{{ e }}</button>
            </div>

            <EstadoCargando v-if="cargandoClips && !clipsVisibles.length" texto="Cargando clips" />

            <EstadoVacio v-else-if="errorClips && !clipsVisibles.length" icono="bi-exclamation-circle" titulo="No se pudieron cargar los clips"
                         :mensaje="errorClips" />

            <EstadoVacio v-else-if="!clipsFiltrados.length" icono="bi-play-btn" titulo="No hay clips"
                         :mensaje="mensajeVacio" />

            <div v-else class="grilla">
              <button v-for="c in paginados" :key="c.id" type="button" class="tarjeta-clip" @click="clipAbierto = c">
                <div class="miniatura">
                  <img v-if="c.urlMiniatura" :src="c.urlMiniatura" alt="" loading="lazy" class="imagen-miniatura">
                  <span class="badge-tag" :style="{ background: colorTag(c.color).solido }">{{ c.etiqueta }}</span>
                  <span class="icono-play" aria-hidden="true"><i class="bi bi-play-fill"></i></span>
                  <span v-if="estadoEnVista(c) && estadoEnVista(c) !== 'autorizado'" class="estado-pill estado-miniatura"
                        :class="ESTADOS_DESTINO[estadoEnVista(c)].clase">
                    <i :class="['bi', ESTADOS_DESTINO[estadoEnVista(c)].icono]" aria-hidden="true"></i> {{ ESTADOS_DESTINO[estadoEnVista(c)].etiqueta }}
                  </span>
                  <span class="duracion">{{ formatearTiempo(c.fin - c.inicio) }}</span>
                </div>
                <div class="p-3 text-start">
                  <h3 class="titulo-clip">{{ c.titulo }}</h3>
                  <p class="descripcion-clip">{{ c.descripcion || 'Sin descripción' }}</p>
                  <div class="pie-tarjeta">
                    <span class="text-truncate">{{ c.partido || (c.origen === 'externo' ? 'Video externo' : '') }}</span>
                    <span class="flex-shrink-0">{{ fechaArg(c.fecha) }}</span>
                  </div>
                </div>
              </button>
            </div>
            <BarraPaginacion v-if="totalPaginas > 1" v-model="paginaActual" :total="totalPaginas" class="mt-3" />
            </template>
          </template>

          <!-- ======================= ESTUDIO ======================= -->
          <EstudioAaabTv v-else @publicado="irA('tv')" />
        </div>
      </div>
    </div>

    <!-- ============ DETALLE DEL CLIP ============ -->
    <ModalBase :show="!!clipAbierto" :titulo="clipAbierto?.titulo" icono="bi-play-btn" color-icono="bg-danger-subtle text-danger"
               max-width="860px" @close="clipAbierto = null">
      <template v-if="clipAbierto">
        <ReproductorClip v-bind="tramoDe(clipAbierto)" :anotaciones="clipAbierto.anotaciones || []" :puede-anotar="esPropio(clipAbierto)"
                         :guardando="guardandoDibujo" @guardar-anotaciones="guardarDibujos" />
        <div class="d-flex flex-wrap gap-2 align-items-center mt-3">
          <span class="badge-tag" :style="{ background: colorTag(clipAbierto.color).solido }">{{ clipAbierto.etiqueta }}</span>
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
          <span v-for="d in destinosVisibles(clipAbierto)" :key="claveCanal(d.idGrupo)" class="chip-canal">
            <i :class="['bi', d.idGrupo === null ? 'bi-globe2' : 'bi-people-fill']" aria-hidden="true"></i> {{ d.nombre }}
            <span v-if="d.estado !== 'autorizado'" class="estado-pill ms-1" :class="ESTADOS_DESTINO[d.estado].clase">
              {{ ESTADOS_DESTINO[d.estado].etiqueta }}
            </span>
          </span>
        </div>

        <p v-if="clipAbierto.arbitros?.length" class="small mt-2 mb-0">
          <i class="bi bi-person-badge" aria-hidden="true"></i> <strong>Árbitros:</strong> {{ clipAbierto.arbitros.map(a => a.nombre).join(' · ') }}
        </p>
        <p class="mt-2 mb-0 texto-pre-line">{{ clipAbierto.descripcion || 'Sin descripción.' }}</p>
        <p v-if="clipAbierto.autor" class="small text-muted mt-2 mb-0">Publicado por {{ clipAbierto.autor }}</p>
        <p v-if="esPropio(clipAbierto) && clipAbierto.destinos.some(d => d.estado === 'pendiente')" class="small text-muted mt-1 mb-0">
          <i class="bi bi-info-circle" aria-hidden="true"></i> Los canales pendientes los revisa el coordinador general: hasta entonces ahí solo lo ves vos.
        </p>

        <!-- Guardar en mis listas de reproducción -->
        <div class="mt-3">
          <button type="button" class="btn btn-sm btn-light border fw-bold" :aria-expanded="mostrarListas" @click="mostrarListas = !mostrarListas">
            <i class="bi bi-collection-play" aria-hidden="true"></i> Guardar en lista
          </button>
          <div v-if="mostrarListas" class="panel-listas mt-2">
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

        <ComentariosClip :id-clip="clipAbierto.id" />
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

    <!-- ============ ARMAR MONTAJE ============ -->
    <ModalBase :show="mostrarMontaje" titulo="Armar montaje" icono="bi-film" color-icono="bg-danger-subtle text-danger"
               max-width="520px" @close="mostrarMontaje = false">
      <form id="form-montaje" novalidate @submit.prevent="armarMontaje">
        <p class="small text-muted">
          Se unen los {{ clipsFiltrados.length }} clips que estás viendo, en este orden, en un solo video con el título de cada clip.
          El servidor lo prepara y te avisa cuando está listo (en "Mis montajes").
        </p>
        <label for="montaje-titulo" class="form-label small fw-bold">Título *</label>
        <input id="montaje-titulo" v-model="tituloMontaje" type="text" maxlength="80" class="form-control"
               :class="{ 'is-invalid': intentoMontaje && !tituloMontaje.trim() }">
        <div class="invalid-feedback">Poné un título al montaje.</div>
      </form>
      <template #footer>
        <div class="d-flex gap-2 justify-content-end w-100">
          <button type="button" class="btn btn-light border rounded-pill px-4 fw-bold" @click="mostrarMontaje = false">Cancelar</button>
          <button type="submit" form="form-montaje" class="btn btn-danger rounded-pill px-4 fw-bold" :disabled="armandoMontaje">
            <span v-if="armandoMontaje" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Armar
          </button>
        </div>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import ModalBase from '@/components/ModalBase.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import ReproductorClip from '@/components/panel-arbitro/aaab-tv/ReproductorClip.vue'
import ComentariosClip from '@/components/panel-arbitro/aaab-tv/ComentariosClip.vue'
import EstudioAaabTv from '@/components/panel-arbitro/aaab-tv/EstudioAaabTv.vue'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { useAaabTv, colorTag, formatearTiempo, ESTADOS_DESTINO, DECISIONES, claveCanal } from '@/composables/useAaabTv'
import { usePaginacion } from '@/composables/usePaginacion'
import { NOMBRE_CANAL_PUBLICO, esUsuarioActual, estaInvolucrado } from '@/api/aaabTvClips'
import { normalizarTexto } from '@/utils/texto'
import { fechaArg } from '@/utils/fechas'

// Estado de un montaje (lo arma la VPS)
const ESTADOS_MONTAJE = {
  procesando: { etiqueta: 'Preparando', icono: 'bi-hourglass-split', clase: 'estado-pendiente' },
  listo: { etiqueta: 'Listo', icono: 'bi-check-circle-fill', clase: 'estado-verde' },
  error: { etiqueta: 'No se armó', icono: 'bi-x-circle-fill', clase: 'estado-rojo' }
}
const CLIPS_POR_PAGINA = 12

useHead({ title: 'AAAB TV | AAAB' })

const route = useRoute()
const router = useRouter()
const notificar = inject('notificar')
const toast = inject('toast')
const {
  clipsVisibles, cargandoClips, cargarClips, canales, cargarCanales, sesion,
  borrarClipPublicado, puedePublicar, tramoDe, guardarAnotaciones,
  listasReproduccion, cargarListasReproduccion, crearListaReproduccion, borrarListaReproduccion, cambiarClipEnLista,
  colecciones, cargarColecciones, montajes, cargarMontajes, crearMontaje, borrarMontaje
} = useAaabTv()

// Clips, canales, listas, colecciones y montajes del portal (el panel de botones lo carga el Estudio)
const errorClips = ref('')
onMounted(async () => {
  cargarCanales()
  cargarListasReproduccion()
  cargarColecciones()
  cargarMontajes()
  const res = await cargarClips()
  errorClips.value = res?.ok ? '' : (res?.message || 'Intentá de nuevo en un rato.')
})

const fechaHora = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

// Autor = mismo id y mismo tipo de usuario (un árbitro y una autoridad pueden compartir id)
const esPropio = (clip) => !!clip && esUsuarioActual(clip.idAutor, clip.tipoAutor)
// El autor puede borrar su clip mientras ningún canal lo revisó; después lo maneja el coordinador general
const esPropioPendiente = (clip) => esPropio(clip) && clip.destinos.every(d => d.estado === 'pendiente')
// El autor ve todos sus canales con su estado; los demás, solo los canales donde está autorizado
// y a los que pueden entrar (el público y el de su grupo)
const destinosVisibles = (clip) => (esPropio(clip)
  ? clip.destinos
  : clip.destinos.filter(d => d.estado === 'autorizado' &&
      canalesConPublico.value.some(c => claveCanal(c.idGrupo) === claveCanal(d.idGrupo))))

// La pestaña queda en la URL (?vista=estudio) para volver al mismo lugar
const vista = computed(() => (route.query.vista === 'estudio' ? 'estudio' : 'tv'))
const irA = (destino) => router.replace({ query: destino === 'estudio' ? { vista: 'estudio' } : {} })

// ─── Portal ─────────────────────────────────────────────────
const busqueda = ref('')
const etiquetaActiva = ref('')
const clipAbierto = ref(null)

// Qué se mira: 'publico' o 'g-<idGrupo>' (un canal), 'mis-clips', 'publicados', 'montajes',
// 'c-<idColeccion>' (colección oficial) o 'l-<idLista>' (una de mis listas)
const vistaActiva = ref('publico')
const canalesConPublico = computed(() =>
  (canales.value.length ? canales.value : [{ idGrupo: null, nombre: NOMBRE_CANAL_PUBLICO }]))
const listaActiva = computed(() =>
  listasReproduccion.value.find(l => `l-${l.id}` === vistaActiva.value) || null)
const coleccionActiva = computed(() =>
  colecciones.value.find(c => `c-${c.id}` === vistaActiva.value) || null)
const esVistaDeCanal = computed(() => vistaActiva.value === 'publico' || vistaActiva.value.startsWith('g-'))

const estaEnLista = (lista, clip) => lista.idsClips.some(id => String(id) === String(clip.id))
const destinoEnVista = (clip) => clip.destinos.find(d => claveCanal(d.idGrupo) === vistaActiva.value)
// Estado del clip en el canal que se mira (fuera de un canal no se muestra)
const estadoEnVista = (clip) => (esVistaDeCanal.value ? destinoEnVista(clip)?.estado ?? null : null)
const autorizadoEnAlguno = (clip) => clip.destinos.some(d => d.estado === 'autorizado')
// Los clips de una lista o colección, en su orden
const enOrden = (ids) => ids.map(id => clipsVisibles.value.find(c => String(c.id) === String(id))).filter(Boolean)

// En un canal: los autorizados, y los propios aunque estén pendientes. En el resto, lo que corresponde a cada vista
const clipsDeVista = computed(() => {
  if (listaActiva.value) return enOrden(listaActiva.value.idsClips)
  // En una colección solo se ven los clips que siguen autorizados en su canal
  if (coleccionActiva.value) {
    const canal = claveCanal(coleccionActiva.value.idGrupo)
    return enOrden(coleccionActiva.value.idsClips).filter(c =>
      c.destinos.some(d => claveCanal(d.idGrupo) === canal && d.estado === 'autorizado'))
  }
  if (vistaActiva.value === 'mis-clips') return clipsVisibles.value.filter(c => estaInvolucrado(c) && autorizadoEnAlguno(c))
  if (vistaActiva.value === 'publicados') return clipsVisibles.value.filter(esPropio)
  if (vistaActiva.value === 'montajes') return []
  return clipsVisibles.value.filter(c => {
    const destino = destinoEnVista(c)
    return !!destino && (destino.estado === 'autorizado' || esPropio(c))
  })
})

const etiquetas = computed(() => [...new Set(clipsDeVista.value.map(c => c.etiqueta))])

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
  return 'Todavía no hay clips en este canal.'
})

// Paginación de la grilla (vuelve a la primera página al cambiar de vista o de filtro)
const { paginaActual, totalPaginas, paginados } = usePaginacion(clipsFiltrados, CLIPS_POR_PAGINA)
watch([vistaActiva, busqueda, etiquetaActiva], () => { paginaActual.value = 1 })

watch(vistaActiva, () => { etiquetaActiva.value = '' })

// ─── Dibujos sobre el video (los guarda el autor del clip) ───
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

// ─── Montajes ─────────────────────────────────────────────
const mostrarMontaje = ref(false)
const tituloMontaje = ref('')
const intentoMontaje = ref(false)
const armandoMontaje = ref(false)

const abrirMontaje = () => {
  tituloMontaje.value = listaActiva.value?.nombre || coleccionActiva.value?.nombre ||
    (vistaActiva.value === 'mis-clips' ? 'Mis clips' : 'Mis publicaciones')
  intentoMontaje.value = false
  mostrarMontaje.value = true
}

const armarMontaje = async () => {
  intentoMontaje.value = true
  if (!tituloMontaje.value.trim() || armandoMontaje.value) return
  armandoMontaje.value = true
  try {
    const res = await crearMontaje(tituloMontaje.value, clipsFiltrados.value.map(c => c.id))
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo armar', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    mostrarMontaje.value = false
    vistaActiva.value = 'montajes'
    toast({ tipo: 'success', titulo: 'Montaje en preparación', mensaje: 'Te avisamos cuando esté listo.' })
  } finally {
    armandoMontaje.value = false
  }
}

const borrarMontajeElegido = (montaje) => {
  notificar({
    tipo: 'danger',
    titulo: 'Borrar montaje',
    mensaje: `Se borra "${montaje.titulo}". Los clips siguen en AAAB TV.`,
    alConfirmar: async () => {
      const res = await borrarMontaje(montaje.id)
      if (!res?.ok) toast({ tipo: 'danger', titulo: 'No se pudo borrar', mensaje: res?.message || 'Intentá de nuevo.' })
    }
  })
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

// Pestañas: AAAB TV con la cantidad de clips; Estudio con los clips marcados (si hay)
const pestanasTv = computed(() => [
  { clave: 'tv', etiqueta: 'AAAB TV', icono: 'bi-play-btn', cantidad: clipsVisibles.value.length },
  { clave: 'estudio', etiqueta: 'Estudio', icono: 'bi-camera-reels', cantidad: sesion.tags.length || null }
])
</script>

<style scoped>
/* Portal */
.buscador { max-width: 460px; }
.selector-vista { font-weight: 700; }
@media (min-width: 768px) {
  .selector-vista { max-width: 240px; }
}
.chip-canal {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 50rem;
  border: 1px solid var(--o-borde, #e2e8f0);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--o-texto-medio, #475569);
}
.panel-listas {
  padding: 10px 12px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 12px;
  max-width: 420px;
}
.filtro {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 50rem;
  border: 1px solid var(--o-borde, #e2e8f0);
  background: var(--o-tarjeta, #fff);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--o-texto-medio, #475569);
}
.filtro.activo { background: #0f172a; border-color: var(--o-texto, #0f172a); color: #fff; }

.grilla {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.tarjeta-clip {
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 16px;
  background: var(--o-tarjeta, #fff);
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.tarjeta-clip:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12); }
.tarjeta-clip:focus-visible { outline: 2px solid var(--o-texto, #0f172a); outline-offset: 2px; }

.miniatura {
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #7f1d1d 140%);
}
.imagen-miniatura { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.montaje {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-radius: 12px;
}
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
.badge-tag {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 8px;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
}
.miniatura .badge-tag { position: absolute; top: 10px; left: 10px; }
.estado-miniatura { position: absolute; top: 10px; right: 10px; }

.titulo-clip { font-size: 0.9rem; font-weight: 800; color: var(--o-texto, #0f172a); margin-bottom: 4px; line-height: 1.3; }
.descripcion-clip {
  font-size: 0.8rem;
  color: var(--o-texto-suave, #64748b);
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pie-tarjeta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--o-borde, #f1f5f9);
  font-size: 0.75rem;
  color: var(--o-texto-medio, #475569);
  font-weight: 600;
}
</style>
