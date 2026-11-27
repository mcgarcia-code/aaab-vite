<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom">
          <p class="seccion-descripcion">
            {{ DESCRIPCION_VISTA[vista] }}
            <template v-if="vista === 'autorizar'"> · {{ pendientes }} {{ pendientes === 1 ? 'pendiente' : 'pendientes' }} de revisión</template>
          </p>
          <PestanasSeccion :model-value="vista" :pestanas="pestanas" llenar aria-label="AAAB TV" @update:model-value="irA" />
        </div>

        <div class="card-body p-3 p-md-4">
          <!-- ======================= ESTUDIO ======================= -->
          <EstudioAaabTv v-if="vista === 'estudio'" @publicado="alPublicar" />

          <!-- ======================= COLECCIONES OFICIALES ======================= -->
          <ColeccionesAaabTv v-else-if="vista === 'colecciones'" />

          <!-- ======================= ESTADÍSTICAS ======================= -->
          <template v-else-if="vista === 'estadisticas'">
            <EstadoCargando v-if="cargandoModeracion && !clipsModeracion.length" texto="Cargando estadísticas" />
            <EstadisticasAaabTv v-else :clips="clipsModeracion" />
          </template>

          <!-- ======================= AUTORIZAR ======================= -->
          <template v-else>
          <div class="input-group buscador mb-3">
            <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true"></i></span>
            <input v-model="busqueda" type="search" class="form-control border-start-0" aria-label="Buscar clips" placeholder="Título, partido, autor o canal">
          </div>

          <!-- Filtro por estado -->
          <div class="estados mb-3" role="tablist" aria-label="Filtrar por estado">
            <button v-for="f in FILTROS" :key="f.clave" type="button" role="tab" :aria-selected="filtro === f.clave"
                    :class="{ activo: filtro === f.clave }" @click="filtro = f.clave">
              {{ f.etiqueta }} <span class="badge rounded-pill">{{ cantidadPor(f.clave) }}</span>
            </button>
          </div>

          <p class="small text-muted mb-3">
            <i class="bi bi-info-circle" aria-hidden="true"></i>
            Cada canal se autoriza por separado. <strong>Autorizado:</strong> se ve en ese canal (el público lo ven todos; el de un grupo, sus integrantes).
            <strong>No autorizado:</strong> no se ve en ese canal.
          </p>

          <EstadoCargando v-if="cargandoModeracion && !clipsModeracion.length" texto="Cargando clips" />

          <EstadoVacio v-else-if="errorCarga && !clipsModeracion.length" icono="bi-exclamation-circle" titulo="No se pudieron cargar los clips"
                       :mensaje="errorCarga" />

          <EstadoVacio v-else-if="!clipsFiltrados.length" icono="bi-camera-reels"
                       :titulo="filtro === 'pendiente' ? 'No hay clips pendientes' : 'No hay clips'"
                       mensaje="Los clips que publiquen coordinadores y observadores aparecen acá." />

          <ul v-else class="list-unstyled m-0 lista">
            <li v-for="c in paginados" :key="c.id" class="fila" :style="{ borderLeftColor: colorTag(c.color).solido }">
              <div class="flex-grow-1 min-w-0">
                <div class="d-flex flex-wrap align-items-center gap-1 mb-1">
                  <span class="badge-tag" :style="{ background: colorTag(c.color).solido }">{{ c.etiqueta }}</span>
                  <span v-if="DECISIONES[c.decision]" class="estado-pill" :class="DECISIONES[c.decision].clase">
                    <i :class="['bi', DECISIONES[c.decision].icono]" aria-hidden="true"></i> {{ DECISIONES[c.decision].etiqueta }}
                  </span>
                </div>
                <h3 class="titulo-clip text-truncate">{{ c.titulo }}</h3>
                <p class="datos-clip">
                  <template v-if="c.origen === 'externo'">Video externo<template v-if="c.partido"> · {{ c.partido }}</template> · {{ fechaArg(c.fecha) }}</template>
                  <template v-else>{{ c.partido }} · {{ fechaArg(c.fecha) }} · min. {{ formatearTiempo(c.inicio + (c.fin - c.inicio) / 2) }}</template>
                  <template v-if="c.autor"> · Publicó {{ c.autor }}</template>
                </p>

                <!-- Un renglón por canal: su estado y los botones para autorizar o no -->
                <ul class="list-unstyled m-0 mt-2 destinos">
                  <li v-for="d in c.destinos" :key="claveCanal(d.idGrupo)" class="destino">
                    <span class="nombre-canal">
                      <i :class="['bi', d.idGrupo === null ? 'bi-globe2' : 'bi-people-fill']" aria-hidden="true"></i> {{ d.nombre }}
                    </span>
                    <span class="estado-pill" :class="ESTADOS_DESTINO[d.estado].clase">
                      <i :class="['bi', ESTADOS_DESTINO[d.estado].icono]" aria-hidden="true"></i> {{ ESTADOS_DESTINO[d.estado].etiqueta }}
                    </span>
                    <span class="acciones-destino">
                      <button v-if="d.estado !== 'autorizado'" type="button" class="btn btn-sm btn-success fw-bold"
                              :disabled="ocupado === claveOcupado(c, d)" @click="cambiar(c, d, 'autorizado')">
                        <i class="bi bi-check-lg" aria-hidden="true"></i> Autorizar
                      </button>
                      <button v-if="d.estado !== 'no_autorizado'" type="button" class="btn btn-sm btn-dark fw-bold"
                              :disabled="ocupado === claveOcupado(c, d)" @click="cambiar(c, d, 'no_autorizado')">
                        <i class="bi bi-x-lg" aria-hidden="true"></i> No autorizar
                      </button>
                    </span>
                  </li>
                </ul>
              </div>
              <div class="acciones">
                <button type="button" class="btn btn-sm btn-light border fw-bold" @click="abrir(c)">
                  <i class="bi bi-pencil-square" aria-hidden="true"></i> Revisar y comentar
                </button>
              </div>
            </li>
          </ul>
          <BarraPaginacion v-if="totalPaginas > 1" v-model="paginaActual" :total="totalPaginas" class="mt-3" />
          </template>
        </div>
      </div>
    </div>

    <!-- ============ REVISAR / EDITAR / COMENTAR ============ -->
    <ModalBase :show="!!editando" titulo="Revisar clip" icono="bi-camera-reels" color-icono="bg-danger-subtle text-danger"
               max-width="820px" :hay-cambios="hayCambios" @close="editando = null">
      <template v-if="editando">
        <form id="form-clip-admin" novalidate @submit.prevent="guardar">
          <ReproductorClip v-bind="tramoDe(editando)" :anotaciones="editando.anotaciones || []" puede-anotar
                           :guardando="guardandoDibujo" @guardar-anotaciones="guardarDibujos" />

          <div class="d-flex flex-wrap gap-2 align-items-center small text-muted mt-3">
            <span class="badge-tag" :style="{ background: colorTag(editando.color).solido }">{{ editando.etiqueta }}</span>
            <span v-if="editando.origen === 'externo'">Video externo</span>
            <span>{{ editando.partido ? `${editando.partido} · ` : '' }}{{ fechaArg(editando.fecha) }}</span>
            <span v-if="editando.autor">· Publicó {{ editando.autor }}</span>
          </div>

          <label for="clip-admin-titulo" class="form-label small fw-bold mt-3">Título *</label>
          <input id="clip-admin-titulo" v-model="form.titulo" type="text" maxlength="100" class="form-control"
                 :class="{ 'is-invalid': intento && !form.titulo.trim() }">
          <div class="invalid-feedback">El clip necesita un título.</div>

          <label for="clip-admin-desc" class="form-label small fw-bold mt-2">Descripción</label>
          <textarea id="clip-admin-desc" v-model="form.descripcion" rows="3" maxlength="600" class="form-control"></textarea>

          <div class="row g-2 mt-1">
            <div class="col-12 col-md-5">
              <label for="clip-admin-decision" class="form-label small fw-bold">Decisión arbitral</label>
              <select id="clip-admin-decision" v-model="form.decision" class="form-select">
                <option :value="null">Sin valorar</option>
                <option v-for="(d, clave) in DECISIONES" :key="clave" :value="clave">{{ d.etiqueta }}</option>
              </select>
            </div>
            <div class="col-12 col-md-7">
              <span class="form-label small fw-bold d-block">Árbitros involucrados</span>
              <SelectorArbitros id="clip-admin-arbitros" v-model="form.arbitros" />
            </div>
          </div>

          <span class="form-label small fw-bold d-block mt-3">Autorización por canal</span>
          <div v-for="d in form.destinos" :key="claveCanal(d.idGrupo)" class="destino-form">
            <span class="nombre-canal">
              <i :class="['bi', d.idGrupo === null ? 'bi-globe2' : 'bi-people-fill']" aria-hidden="true"></i> {{ d.nombre }}
            </span>
            <div class="btn-group btn-group-sm" role="radiogroup" :aria-label="`Autorización en ${d.nombre}`">
              <button v-for="(e, clave) in ESTADOS_DESTINO" :key="clave" type="button" role="radio" :aria-checked="d.estado === clave"
                      class="btn" :class="d.estado === clave ? CLASE_BOTON[clave] : 'btn-outline-secondary'" @click="d.estado = clave">
                {{ e.etiqueta }}
              </button>
            </div>
          </div>
        </form>

        <ComentariosClip :id-clip="editando.id" moderar />
      </template>

      <template #footer>
        <div class="d-flex gap-2 justify-content-end w-100">
          <button type="button" class="btn btn-light border rounded-pill px-4 fw-bold" @click="editando = null">Cancelar</button>
          <button type="submit" form="form-clip-admin" class="btn btn-danger rounded-pill px-4 fw-bold" :disabled="guardando">
            <span v-if="guardando" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
            {{ guardando ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, watch } from 'vue'
import { useHead } from '@unhead/vue'
import ModalBase from '@/components/ModalBase.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import ReproductorClip from '@/components/panel-arbitro/aaab-tv/ReproductorClip.vue'
import ComentariosClip from '@/components/panel-arbitro/aaab-tv/ComentariosClip.vue'
import EstudioAaabTv from '@/components/panel-arbitro/aaab-tv/EstudioAaabTv.vue'
import ColeccionesAaabTv from '@/components/panel-admin/desarrollo-arbitral/ColeccionesAaabTv.vue'
import EstadisticasAaabTv from '@/components/panel-admin/desarrollo-arbitral/EstadisticasAaabTv.vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import SelectorArbitros from '@/components/SelectorArbitros.vue'
import { useRoute, useRouter } from 'vue-router'
import {
  useAaabTv, ESTADOS_DESTINO, DECISIONES, claveCanal, estadoGeneral, colorTag, formatearTiempo
} from '@/composables/useAaabTv'
import { usePaginacion } from '@/composables/usePaginacion'
import { normalizarTexto } from '@/utils/texto'
import { fechaArg } from '@/utils/fechas'

useHead({ title: 'AAAB TV · Desarrollo Arbitral | AAAB' })

const toast = inject('toast')
const {
  clipsModeracion, cargandoModeracion, cargarClipsModeracion, cambiarEstadoDestino, editarClip, tramoDe, guardarAnotaciones
} = useAaabTv()

const CLIPS_POR_PAGINA = 15
const DESCRIPCION_VISTA = {
  autorizar: 'Clips por autorizar',
  colecciones: 'Colecciones oficiales de cada canal',
  estadisticas: 'Estadísticas de AAAB TV',
  estudio: 'Analizá partidos y subí videos a AAAB TV'
}

const errorCarga = ref('')
const recargar = async () => {
  const res = await cargarClipsModeracion()
  errorCarga.value = res?.ok ? '' : (res?.message || 'Intentá de nuevo en un rato.')
}
onMounted(recargar)

// ─── Pestañas: Autorizar / Colecciones / Estadísticas / Estudio (quedan en la URL: ?vista=...) ───
// El coordinador general también analiza, arma su panel y sube videos, igual que en el panel árbitro
const route = useRoute()
const router = useRouter()
const VISTAS = ['autorizar', 'colecciones', 'estadisticas', 'estudio']
const vista = computed(() => (VISTAS.includes(route.query.vista) ? route.query.vista : 'autorizar'))
const irA = (destino) => router.replace({ query: destino === 'autorizar' ? {} : { vista: destino } })
const pestanas = computed(() => [
  { clave: 'autorizar', etiqueta: 'Autorizar', icono: 'bi-check2-square', cantidad: pendientes.value || null },
  { clave: 'colecciones', etiqueta: 'Colecciones', icono: 'bi-bookmark-star' },
  { clave: 'estadisticas', etiqueta: 'Estadísticas', icono: 'bi-bar-chart' },
  { clave: 'estudio', etiqueta: 'Estudio', icono: 'bi-camera-reels' }
])

// Lo que publica el coordinador general sale autorizado: se ve en Autorizar, filtro "Autorizados"
const alPublicar = () => {
  filtro.value = 'autorizado'
  irA('autorizar')
  recargar()
}

// Estado de conjunto: pendiente si algún canal espera revisión; si no, autorizado si se ve en algún canal
const FILTROS = [
  { clave: 'pendiente', etiqueta: 'Pendientes' },
  { clave: 'autorizado', etiqueta: 'Autorizados' },
  { clave: 'no_autorizado', etiqueta: 'No autorizados' },
  { clave: 'todos', etiqueta: 'Todos' }
]
// Color del botón elegido en la autorización por canal
const CLASE_BOTON = { pendiente: 'btn-warning', autorizado: 'btn-success', no_autorizado: 'btn-dark' }

const filtro = ref('pendiente')
const busqueda = ref('')

const cantidadPor = (clave) => (clave === 'todos'
  ? clipsModeracion.value.length
  : clipsModeracion.value.filter(c => estadoGeneral(c) === clave).length)
const pendientes = computed(() => cantidadPor('pendiente'))

// Los más recientes primero
const clipsFiltrados = computed(() => {
  const q = normalizarTexto(busqueda.value)
  return clipsModeracion.value
    .filter(c => (filtro.value === 'todos' || estadoGeneral(c) === filtro.value) &&
      (!q || normalizarTexto(`${c.titulo} ${c.partido} ${c.autor} ${c.etiqueta} ${c.destinos.map(d => d.nombre).join(' ')}`).includes(q)))
    .sort((a, b) => String(b.publicadoEl || '').localeCompare(String(a.publicadoEl || '')))
})

// Paginación (vuelve a la primera página al cambiar de filtro o de búsqueda)
const { paginaActual, totalPaginas, paginados } = usePaginacion(clipsFiltrados, CLIPS_POR_PAGINA)
watch([filtro, busqueda], () => { paginaActual.value = 1 })

// Canal que se está cambiando (para no mandar dos pedidos seguidos del mismo)
const ocupado = ref(null)
const claveOcupado = (clip, destino) => `${clip.id}|${claveCanal(destino.idGrupo)}`

const cambiar = async (clip, destino, estado) => {
  ocupado.value = claveOcupado(clip, destino)
  try {
    const res = await cambiarEstadoDestino(clip.id, destino.idGrupo, estado)
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo cambiar', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    toast({ tipo: 'success', titulo: ESTADOS_DESTINO[estado].etiqueta, mensaje: `"${clip.titulo}" en ${destino.nombre}.` })
  } finally {
    ocupado.value = null
  }
}

// ─── Revisar / editar ──────────────────────────────────────
const editando = ref(null)
const intento = ref(false)
const guardando = ref(false)
const form = reactive({ titulo: '', descripcion: '', decision: null, arbitros: [], destinos: [] })

const abrir = (clip) => {
  editando.value = clip
  Object.assign(form, {
    titulo: clip.titulo,
    descripcion: clip.descripcion || '',
    decision: clip.decision ?? null,
    arbitros: [...(clip.arbitros || [])],
    destinos: clip.destinos.map(d => ({ ...d }))
  })
  intento.value = false
}

const idsArbitros = (lista) => (lista || []).map(a => a.id).sort().join(',')
const hayCambios = computed(() => !!editando.value && (
  form.titulo !== editando.value.titulo ||
  form.descripcion !== (editando.value.descripcion || '') ||
  form.decision !== (editando.value.decision ?? null) ||
  idsArbitros(form.arbitros) !== idsArbitros(editando.value.arbitros) ||
  form.destinos.some((d, i) => d.estado !== editando.value.destinos[i]?.estado)
))

// Dibujos sobre el video: el coordinador general los guarda en cualquier clip
const guardandoDibujo = ref(false)
const guardarDibujos = async (anotaciones) => {
  const clip = editando.value
  guardandoDibujo.value = true
  try {
    const res = await guardarAnotaciones(clip.id, anotaciones)
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo guardar el dibujo', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    editando.value = { ...clip, ...res.payload }
  } finally {
    guardandoDibujo.value = false
  }
}

const guardar = async () => {
  intento.value = true
  if (!form.titulo.trim() || guardando.value) return
  guardando.value = true
  try {
    const res = await editarClip(editando.value.id, {
      titulo: form.titulo,
      descripcion: form.descripcion,
      decision: form.decision,
      arbitros: form.arbitros,
      destinos: form.destinos.map(d => ({ idGrupo: d.idGrupo, estado: d.estado }))
    })
    if (!res?.ok) {
      toast({ tipo: 'danger', titulo: 'No se pudo guardar', mensaje: res?.message || 'Intentá de nuevo.' })
      return
    }
    toast({ tipo: 'success', titulo: 'Clip actualizado', mensaje: `Se guardaron los cambios de "${form.titulo.trim()}".` })
    editando.value = null
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.buscador { max-width: 340px; }
.estados {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.estados button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 50rem;
  border: 1px solid var(--o-borde, #e2e8f0);
  background: var(--o-tarjeta, #fff);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--o-texto-medio, #475569);
}
.estados .badge { background: var(--o-chip, #e2e8f0); color: var(--o-texto, #0f172a); }
.estados button.activo { background: #0f172a; border-color: var(--o-texto, #0f172a); color: #fff; }
.estados button.activo .badge { background: #dc2626; color: #fff; }
.fila {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 8px;
  border: 1px solid var(--o-borde, #e2e8f0);
  border-left: 4px solid;
  border-radius: 12px;
}
.titulo-clip { font-size: 0.9rem; font-weight: 800; color: var(--o-texto, #0f172a); margin: 0 0 2px; }
.datos-clip { font-size: 0.8rem; color: var(--o-texto-suave, #64748b); margin: 0; }
.acciones { display: flex; flex-wrap: wrap; gap: 6px; }
.destinos { display: flex; flex-direction: column; gap: 6px; }
.destino {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  padding-top: 6px;
  border-top: 1px dashed var(--o-borde, #e2e8f0);
}
.nombre-canal { font-size: 0.8rem; font-weight: 700; color: var(--o-texto-medio, #475569); min-width: 120px; }
.acciones-destino { display: flex; flex-wrap: wrap; gap: 6px; margin-left: auto; }
.destino-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--o-borde, #e2e8f0);
}
@media (max-width: 767px) {
  .acciones { width: 100%; }
  .acciones .btn { flex: 1; }
  .acciones-destino { width: 100%; margin-left: 0; }
  .acciones-destino .btn { flex: 1; }
}
.badge-tag {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 8px;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
}
.min-w-0 { min-width: 0; }
</style>
