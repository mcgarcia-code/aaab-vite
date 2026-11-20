<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom">
          <p class="seccion-descripcion">Clips pendientes y visibilidad · {{ pendientes }} {{ pendientes === 1 ? 'pendiente' : 'pendientes' }} de revisión</p>
          <div class="input-group buscador">
            <span class="input-group-text bg-white"><i class="bi bi-search" aria-hidden="true"></i></span>
            <input v-model="busqueda" type="search" class="form-control border-start-0" aria-label="Buscar clips" placeholder="Título, partido o autor">
          </div>
        </div>

        <div class="card-body p-3 p-md-4">
          <!-- Filtro por estado -->
          <div class="estados mb-3" role="tablist" aria-label="Filtrar por estado">
            <button v-for="f in FILTROS" :key="f.clave" type="button" role="tab" :aria-selected="filtro === f.clave"
                    :class="{ activo: filtro === f.clave }" @click="filtro = f.clave">
              {{ f.etiqueta }} <span class="badge rounded-pill">{{ cantidadPor(f.clave) }}</span>
            </button>
          </div>

          <p class="small text-muted mb-3">
            <i class="bi bi-info-circle" aria-hidden="true"></i>
            <strong>Público:</strong> lo ve todo el que entra a AAAB TV. <strong>No público:</strong> solo coordinadores y observadores.
          </p>

          <EstadoVacio v-if="!clipsFiltrados.length" icono="bi-camera-reels"
                       :titulo="filtro === 'pendiente' ? 'No hay clips pendientes' : 'No hay clips'"
                       mensaje="Los clips que publiquen coordinadores y observadores aparecen acá." />

          <ul v-else class="list-unstyled m-0 lista">
            <li v-for="c in clipsFiltrados" :key="c.id" class="fila" :style="{ borderLeftColor: colorTag(c.color).solido }">
              <div class="flex-grow-1 min-w-0">
                <div class="d-flex flex-wrap align-items-center gap-1 mb-1">
                  <span class="badge-tag" :style="{ background: colorTag(c.color).solido }">{{ c.etiqueta }}</span>
                  <span class="badge" :class="ESTADOS_CLIP[c.estado].clase">
                    <i :class="['bi', ESTADOS_CLIP[c.estado].icono]" aria-hidden="true"></i> {{ ESTADOS_CLIP[c.estado].etiqueta }}
                  </span>
                </div>
                <h3 class="titulo-clip text-truncate">{{ c.titulo }}</h3>
                <p class="datos-clip">
                  {{ c.partido }} · {{ fechaArg(c.fecha) }} · min. {{ formatearTiempo(c.inicio + (c.fin - c.inicio) / 2) }}
                  <template v-if="c.autor"> · Publicó {{ c.autor }}</template>
                </p>
              </div>
              <div class="acciones">
                <button v-if="c.estado !== 'publico'" type="button" class="btn btn-sm btn-success fw-bold" @click="cambiar(c, 'publico')">
                  <i class="bi bi-globe2" aria-hidden="true"></i> Público
                </button>
                <button v-if="c.estado !== 'no_publico'" type="button" class="btn btn-sm btn-dark fw-bold" @click="cambiar(c, 'no_publico')">
                  <i class="bi bi-lock-fill" aria-hidden="true"></i> No público
                </button>
                <button type="button" class="btn btn-sm btn-light border fw-bold" @click="abrir(c)">
                  <i class="bi bi-pencil-square" aria-hidden="true"></i> Revisar
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ============ REVISAR / EDITAR ============ -->
    <ModalBase :show="!!editando" titulo="Revisar clip" icono="bi-camera-reels" color-icono="bg-danger-subtle text-danger"
               max-width="820px" :hay-cambios="hayCambios" @close="editando = null">
      <form v-if="editando" id="form-clip-admin" novalidate @submit.prevent="guardar">
        <ReproductorClip :url="urlVideoDe(editando)" :inicio="editando.inicio" :fin="editando.fin" />

        <div class="d-flex flex-wrap gap-2 align-items-center small text-muted mt-3">
          <span class="badge-tag" :style="{ background: colorTag(editando.color).solido }">{{ editando.etiqueta }}</span>
          <span>{{ editando.partido }} · {{ fechaArg(editando.fecha) }}</span>
          <span v-if="editando.autor">· Publicó {{ editando.autor }}</span>
        </div>

        <label for="clip-admin-titulo" class="form-label small fw-bold mt-3">Título *</label>
        <input id="clip-admin-titulo" v-model="form.titulo" type="text" maxlength="100" class="form-control"
               :class="{ 'is-invalid': intento && !form.titulo.trim() }">
        <div class="invalid-feedback">El clip necesita un título.</div>

        <label for="clip-admin-desc" class="form-label small fw-bold mt-2">Descripción</label>
        <textarea id="clip-admin-desc" v-model="form.descripcion" rows="3" maxlength="600" class="form-control"></textarea>

        <span class="form-label small fw-bold d-block mt-3">Visibilidad</span>
        <div class="opciones-estado" role="radiogroup" aria-label="Visibilidad del clip">
          <label v-for="(e, clave) in ESTADOS_CLIP" :key="clave" class="opcion" :class="{ elegida: form.estado === clave }">
            <input v-model="form.estado" type="radio" name="estado-clip" :value="clave" class="visually-hidden">
            <i :class="['bi', e.icono]" aria-hidden="true"></i>
            <span>
              <strong class="d-block">{{ e.etiqueta }}</strong>
              <span class="small text-muted">{{ DESCRIPCION_ESTADO[clave] }}</span>
            </span>
          </label>
        </div>
      </form>

      <template #footer>
        <div class="d-flex gap-2 justify-content-end w-100">
          <button type="button" class="btn btn-light border fw-bold" @click="editando = null">Cancelar</button>
          <button type="submit" form="form-clip-admin" class="btn btn-danger fw-bold">Guardar</button>
        </div>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import ReproductorClip from '@/components/panel-arbitro/aaab-tv/ReproductorClip.vue'
import { useAaabTv, ESTADOS_CLIP, colorTag, formatearTiempo } from '@/composables/useAaabTv'
import { normalizarTexto } from '@/utils/texto'
import { fechaArg } from '@/utils/fechas'

useHead({ title: 'AAAB TV · Desarrollo Arbitral | AAAB' })

const toast = inject('toast')
const { clipsPublicados, cambiarEstadoClip, editarClip, urlVideoDe } = useAaabTv()

const FILTROS = [
  { clave: 'pendiente', etiqueta: 'Pendientes' },
  { clave: 'publico', etiqueta: 'Públicos' },
  { clave: 'no_publico', etiqueta: 'No públicos' },
  { clave: 'todos', etiqueta: 'Todos' }
]
const DESCRIPCION_ESTADO = {
  pendiente: 'Solo lo ve quien lo publicó',
  publico: 'Lo ve todo el que entra a AAAB TV',
  no_publico: 'Solo coordinadores y observadores'
}

const filtro = ref('pendiente')
const busqueda = ref('')

const cantidadPor = (clave) => (clave === 'todos' ? clipsPublicados.value.length : clipsPublicados.value.filter(c => c.estado === clave).length)
const pendientes = computed(() => cantidadPor('pendiente'))

// Los más recientes primero
const clipsFiltrados = computed(() => {
  const q = normalizarTexto(busqueda.value)
  return clipsPublicados.value
    .filter(c => (filtro.value === 'todos' || c.estado === filtro.value) &&
      (!q || normalizarTexto(`${c.titulo} ${c.partido} ${c.autor} ${c.etiqueta}`).includes(q)))
    .sort((a, b) => String(b.publicadoEl || '').localeCompare(String(a.publicadoEl || '')))
})

const cambiar = (clip, estado) => {
  cambiarEstadoClip(clip.id, estado)
  toast({ tipo: 'success', titulo: ESTADOS_CLIP[estado].etiqueta, mensaje: `"${clip.titulo}" ahora es ${ESTADOS_CLIP[estado].etiqueta.toLowerCase()}.` })
}

// ─── Revisar / editar ──────────────────────────────────────
const editando = ref(null)
const intento = ref(false)
const form = reactive({ titulo: '', descripcion: '', estado: 'pendiente' })

const abrir = (clip) => {
  editando.value = clip
  Object.assign(form, { titulo: clip.titulo, descripcion: clip.descripcion || '', estado: clip.estado })
  intento.value = false
}

const hayCambios = computed(() => !!editando.value && (
  form.titulo !== editando.value.titulo ||
  form.descripcion !== (editando.value.descripcion || '') ||
  form.estado !== editando.value.estado
))

const guardar = () => {
  intento.value = true
  if (!form.titulo.trim()) return
  editarClip(editando.value.id, form)
  cambiarEstadoClip(editando.value.id, form.estado)
  toast({ tipo: 'success', titulo: 'Clip actualizado', mensaje: `Quedó como ${ESTADOS_CLIP[form.estado].etiqueta.toLowerCase()}.` })
  editando.value = null
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
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
}
.estados .badge { background: #e2e8f0; color: #0f172a; }
.estados button.activo { background: #0f172a; border-color: #0f172a; color: #fff; }
.estados button.activo .badge { background: #dc2626; color: #fff; }

.fila {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  border-left: 4px solid;
  border-radius: 12px;
}
.titulo-clip { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 2px; }
.datos-clip { font-size: 0.8rem; color: #64748b; margin: 0; }
.acciones { display: flex; flex-wrap: wrap; gap: 6px; }
@media (max-width: 767px) {
  .acciones { width: 100%; }
  .acciones .btn { flex: 1; }
}

.badge-tag {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 6px;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
}

.opciones-estado {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}
.opcion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
}
.opcion > .bi { font-size: 1.2rem; color: #64748b; }
.opcion.elegida { border-color: #dc2626; background: #fef2f2; }
.opcion.elegida > .bi { color: #dc2626; }
.opcion:focus-within { outline: 2px solid #0f172a; outline-offset: 2px; }

.min-w-0 { min-width: 0; }
</style>
