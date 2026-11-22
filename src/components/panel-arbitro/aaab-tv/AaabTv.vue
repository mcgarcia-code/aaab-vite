<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom">
          <p class="seccion-descripcion">Análisis de partidos y clips</p>
          <div class="pestanas" role="tablist" aria-label="AAAB TV">
            <button type="button" role="tab" :aria-selected="vista === 'tv'" :class="{ activa: vista === 'tv' }" @click="irA('tv')">
              <i class="bi bi-play-btn" aria-hidden="true"></i> AAAB TV
              <span class="badge rounded-pill">{{ clipsVisibles.length }}</span>
            </button>
            <button type="button" role="tab" :aria-selected="vista === 'estudio'" :class="{ activa: vista === 'estudio' }" @click="irA('estudio')">
              <i class="bi bi-camera-reels" aria-hidden="true"></i> Estudio
              <span v-if="sesion.tags.length" class="badge rounded-pill">{{ sesion.tags.length }}</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 p-md-4">

          <!-- ======================= AAAB TV ======================= -->
          <template v-if="vista === 'tv'">
            <div class="d-flex flex-column flex-md-row gap-2 mb-3">
              <div class="input-group buscador">
                <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true"></i></span>
                <input v-model="busqueda" type="search" class="form-control border-start-0" aria-label="Buscar clips" placeholder="Buscar por título, descripción o partido">
              </div>
              <BotonHerramienta tipo="nuevo" :texto="puedePublicar ? 'Analizar y publicar' : 'Analizar un partido'" icono="bi-camera-reels" :solo-icono-en-celular="false" @click="irA('estudio')" />
            </div>

            <div v-if="etiquetas.length > 1" class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Filtrar por situación">
              <button type="button" class="filtro" :class="{ activo: !etiquetaActiva }" :aria-pressed="!etiquetaActiva" @click="etiquetaActiva = ''">Todas</button>
              <button v-for="e in etiquetas" :key="e" type="button" class="filtro" :class="{ activo: etiquetaActiva === e }"
                      :aria-pressed="etiquetaActiva === e" @click="etiquetaActiva = etiquetaActiva === e ? '' : e">{{ e }}</button>
            </div>

            <EstadoVacio v-if="!clipsFiltrados.length" icono="bi-play-btn" titulo="No hay clips"
                         :mensaje="clipsVisibles.length ? 'Ningún clip coincide con la búsqueda.' : 'Todavía no hay clips publicados.'" />

            <div v-else class="grilla">
              <button v-for="c in clipsFiltrados" :key="c.id" type="button" class="tarjeta-clip" @click="clipAbierto = c">
                <div class="miniatura">
                  <span class="badge-tag" :style="{ background: colorTag(c.color).solido }">{{ c.etiqueta }}</span>
                  <span class="icono-play" aria-hidden="true"><i class="bi bi-play-fill"></i></span>
                  <span v-if="c.estado !== 'publico'" class="badge estado-miniatura" :class="ESTADOS_CLIP[c.estado].clase">
                    <i :class="['bi', ESTADOS_CLIP[c.estado].icono]" aria-hidden="true"></i> {{ ESTADOS_CLIP[c.estado].etiqueta }}
                  </span>
                  <span class="duracion">{{ formatearTiempo(c.fin - c.inicio) }}</span>
                </div>
                <div class="p-3 text-start">
                  <h3 class="titulo-clip">{{ c.titulo }}</h3>
                  <p class="descripcion-clip">{{ c.descripcion || 'Sin descripción' }}</p>
                  <div class="pie-tarjeta">
                    <span class="text-truncate">{{ c.partido }}</span>
                    <span class="flex-shrink-0">{{ fechaArg(c.fecha) }}</span>
                  </div>
                </div>
              </button>
            </div>
          </template>

          <!-- ======================= ESTUDIO ======================= -->
          <template v-else>
            <div class="pasos mb-3" role="tablist" aria-label="Pasos del estudio">
              <button type="button" role="tab" :aria-selected="paso === 'panel'" :class="{ activo: paso === 'panel' }" @click="paso = 'panel'">
                <span class="numero">1</span> Mi panel
              </button>
              <button type="button" role="tab" :aria-selected="paso === 'analizar'" :class="{ activo: paso === 'analizar' }" @click="paso = 'analizar'">
                <span class="numero">2</span> Analizar
              </button>
            </div>
            <MiPanelTags v-if="paso === 'panel'" />
            <AnalisisPartido v-else @publicado="irA('tv')" />
          </template>
        </div>
      </div>
    </div>

    <!-- ============ DETALLE DEL CLIP ============ -->
    <ModalBase :show="!!clipAbierto" :titulo="clipAbierto?.titulo" icono="bi-play-btn" color-icono="bg-danger-subtle text-danger"
               max-width="860px" @close="clipAbierto = null">
      <template v-if="clipAbierto">
        <ReproductorClip :url="urlVideoDe(clipAbierto)" :inicio="clipAbierto.inicio" :fin="clipAbierto.fin" />
        <div class="d-flex flex-wrap gap-2 align-items-center mt-3">
          <span class="badge-tag" :style="{ background: colorTag(clipAbierto.color).solido }">{{ clipAbierto.etiqueta }}</span>
          <span v-if="clipAbierto.estado !== 'publico'" class="badge" :class="ESTADOS_CLIP[clipAbierto.estado].clase">
            <i :class="['bi', ESTADOS_CLIP[clipAbierto.estado].icono]" aria-hidden="true"></i> {{ ESTADOS_CLIP[clipAbierto.estado].etiqueta }}
          </span>
          <span class="small text-muted"><i class="bi bi-calendar3" aria-hidden="true"></i> {{ fechaArg(clipAbierto.fecha) }}</span>
          <span class="small text-muted"><i class="bi bi-trophy" aria-hidden="true"></i> {{ clipAbierto.partido }}</span>
          <span class="small text-muted"><i class="bi bi-clock" aria-hidden="true"></i> Minuto {{ formatearTiempo(clipAbierto.inicio + (clipAbierto.fin - clipAbierto.inicio) / 2) }}</span>
        </div>
        <p class="mt-2 mb-0 texto-pre-line">{{ clipAbierto.descripcion || 'Sin descripción.' }}</p>
        <p v-if="clipAbierto.autor" class="small text-muted mt-2 mb-0">Publicado por {{ clipAbierto.autor }}</p>
        <p v-if="clipAbierto.estado === 'pendiente'" class="small text-muted mt-1 mb-0">
          <i class="bi bi-info-circle" aria-hidden="true"></i> Pendiente de revisión por Desarrollo Arbitral: por ahora solo lo ves vos.
        </p>
      </template>
      <template #footer>
        <div class="d-flex justify-content-between w-100 gap-2">
          <button v-if="esPropioPendiente(clipAbierto)" type="button" class="btn btn-light border text-danger fw-bold" @click="confirmarBorrado">
            <i class="bi bi-trash3" aria-hidden="true"></i> Borrar
          </button>
          <button type="button" class="btn btn-danger fw-bold ms-auto" @click="clipAbierto = null">Cerrar</button>
        </div>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import ModalBase from '@/components/ModalBase.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import MiPanelTags from './MiPanelTags.vue'
import AnalisisPartido from './AnalisisPartido.vue'
import ReproductorClip from './ReproductorClip.vue'
import { useAaabTv, colorTag, formatearTiempo, ESTADOS_CLIP } from '@/composables/useAaabTv'
import { auth } from '@/api/auth'
import { normalizarTexto } from '@/utils/texto'
import { fechaArg } from '@/utils/fechas'

useHead({ title: 'AAAB TV | AAAB' })

const route = useRoute()
const router = useRouter()
const notificar = inject('notificar')
const { clipsVisibles, sesion, borrarClipPublicado, puedePublicar, urlVideoDe } = useAaabTv()
const usuario = auth.getUser() || {}

// El autor puede borrar su clip mientras está pendiente; después lo maneja Desarrollo Arbitral
const esPropioPendiente = (clip) => !!clip && clip.estado === 'pendiente' && clip.idAutor !== null && String(clip.idAutor) === String(usuario.id)

// La pestaña queda en la URL (?vista=estudio) para volver al mismo lugar
const vista = computed(() => (route.query.vista === 'estudio' ? 'estudio' : 'tv'))
const irA = (destino) => router.replace({ query: destino === 'estudio' ? { vista: 'estudio' } : {} })

// Si todavía no hay botones o tags, se arranca por "Mi panel"; si ya hay tags, por "Analizar"
const paso = ref(sesion.tags.length ? 'analizar' : 'panel')

// ─── Portal ─────────────────────────────────────────────────
const busqueda = ref('')
const etiquetaActiva = ref('')
const clipAbierto = ref(null)

const etiquetas = computed(() => [...new Set(clipsVisibles.value.map(c => c.etiqueta))])

const clipsFiltrados = computed(() => {
  const q = normalizarTexto(busqueda.value)
  return clipsVisibles.value.filter(c =>
    (!etiquetaActiva.value || c.etiqueta === etiquetaActiva.value) &&
    (!q || normalizarTexto(`${c.titulo} ${c.descripcion} ${c.partido} ${c.etiqueta}`).includes(q))
  )
})

const confirmarBorrado = () => {
  const clip = clipAbierto.value
  notificar({
    tipo: 'danger',
    titulo: 'Borrar clip',
    mensaje: `Se quita "${clip.titulo}" de AAAB TV.`,
    alConfirmar: () => {
      borrarClipPublicado(clip.id)
      clipAbierto.value = null
    }
  })
}
</script>

<style scoped>
/* Pestañas AAAB TV / Estudio */
.pestanas {
  display: flex;
  background: var(--o-chip, #f1f5f9);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}
.pestanas button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  font-weight: 800;
  font-size: 0.875rem;
  color: var(--o-texto-medio, #475569);
  white-space: nowrap;
}
.pestanas button .badge { background: var(--o-chip, #e2e8f0); color: var(--o-texto, #0f172a); }
.pestanas button.activa { background: #0f172a; color: #fff; }
.pestanas button.activa .badge { background: #dc2626; color: #fff; }

/* Pasos del estudio */
.pasos {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--o-borde, #e2e8f0);
}
.pasos button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px 10px;
  margin-bottom: -1px;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  font-weight: 800;
  color: var(--o-texto-suave, #64748b);
}
.pasos button + button { margin-left: 12px; }
.pasos button.activo { color: var(--o-texto, #0f172a); border-bottom-color: #dc2626; }
.numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--o-chip, #e2e8f0);
  color: var(--o-texto, #0f172a);
  font-size: 0.75rem;
}
.pasos button.activo .numero { background: #dc2626; color: #fff; }

/* Portal */
.buscador { max-width: 460px; }
.filtro {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
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
  border-radius: 14px;
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
  font-size: 1.6rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
}
.duracion {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.badge-tag {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 6px;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
}
.miniatura .badge-tag { position: absolute; top: 10px; left: 10px; }
.estado-miniatura { position: absolute; top: 10px; right: 10px; }

.titulo-clip { font-size: 0.95rem; font-weight: 800; color: var(--o-texto, #0f172a); margin-bottom: 4px; line-height: 1.3; }
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

@media (max-width: 575px) {
  .pestanas { width: 100%; }
}
</style>
