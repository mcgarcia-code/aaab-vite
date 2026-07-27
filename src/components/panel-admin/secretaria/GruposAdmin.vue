<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-diagram-3 me-1"></i> Gestion de Grupos
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ gruposFiltrados.length }} grupos</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerGrupos" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltrosTabla" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="abrirModalNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo</span>
            </button>
          </div>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Grupos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-12">
              <input v-model="filtros.busqueda" class="form-control form-control-sm shadow-none" placeholder="Buscar por nombre, grupo o subgrupo...">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-3 bg-white">

          <!-- GRID MOSAICO -->
          <div class="grupos-grid">
            <div v-for="grupo in gruposPaginados" :key="grupo.id" class="grupo-tile">
              <span class="tile-orden">{{ grupo.orden }}</span>

              <div class="tile-avatar" :style="{ background: colorAvatar(grupo).bg, color: colorAvatar(grupo).text }">
                {{ inicialesGrupo(grupo) }}
              </div>

              <div class="tile-nombre text-truncate" :title="nombreCompleto(grupo)" :style="{ color: colorAvatar(grupo).text }">
                {{ grupo.nombre }}
                <span v-if="grupo.subgrupo" class="tile-subgrupo">· {{ grupo.subgrupo }}</span>
              </div>

              <div class="tile-acciones">
                <button @click="cargarDatosEdicion(grupo)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary flex-grow-1 d-flex justify-content-center align-items-center gap-1" title="Editar Grupo">
                  <span class="material-icons" style="font-size:16px;">edit</span>
                  <span class="fw-bold small d-none d-sm-inline">Editar</span>
                </button>
                <button @click="confirmarEliminacion(grupo.id)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger flex-grow-1 d-flex justify-content-center align-items-center gap-1" title="Eliminar Grupo">
                  <span class="material-icons" style="font-size:16px;">delete</span>
                  <span class="fw-bold small d-none d-sm-inline">Borrar</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="gruposPaginados.length === 0" class="text-center p-4 p-md-5 bg-white rounded shadow-sm border m-1 mt-3">
            <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 48px;">group_off</span>
            <p class="text-muted m-0 fw-bold">No se encontraron grupos.</p>
          </div>

          <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Pagina {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ModalBase
      :show="mostrarModal"
      @close="mostrarModal = false"
      :icono="modoEdicion ? 'edit' : 'group_add'"
      :colorIcono="modoEdicion ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'"
      maxWidth="600px"
    >
      <template #header>
        <span class="fw-bold fs-5">{{ modoEdicion ? 'Editar Grupo' : 'Nuevo Grupo' }}</span>
      </template>

      <p class="text-muted small mb-4">Completa los datos del grupo del padron de arbitros.</p>

      <form id="formGrupo" @submit.prevent="confirmarGuardado" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Nombre del Grupo *</label>
            <input v-model="form.grupo" type="text" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: Pre Liga, LH, 3..." required>
          </div>

          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Subgrupo</label>
            <input v-model="form.subgrupo" type="text" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: A, B, C (opcional)">
          </div>

          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Orden *</label>
            <input v-model.number="form.orden" type="number" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: 1, 2, 3..." required>
            <span class="text-muted small">Define la posicion del grupo en los listados.</span>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formGrupo" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : (modoEdicion ? 'GUARDAR CAMBIOS' : 'CREAR GRUPO') }}
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed, watch } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Gestion de Grupos | AAAB',
  meta: [{ name: 'description', content: 'Administracion de grupos y subgrupos del padron.' }],
})

const notificar = inject('notificar')
const procesando = ref(false)
const listaGrupos = ref([])

const formBase = {
  id: null,
  grupo: '',
  subgrupo: '',
  orden: null
}

const form = reactive({ ...formBase })

const mostrarModal = ref(false)
const modoEdicion = ref(false)
const mostrarFiltrosMobile = ref(false)

const filtros = reactive({
  busqueda: ''
})

const paginaActual = ref(1)
const registrosPorPagina = 12

const paletaAvatar = [
  { bg: '#1a5319', text: '#a1e3a1' }, // Verde oscuro / Verde claro
  { bg: '#4a154b', text: '#e6b3e6' }, // Púrpura / Lila
  { bg: '#005f73', text: '#94d2bd' }, // Cian oscuro / Cian claro
  { bg: '#2f3e46', text: '#cad2c5' }, // Gris pizarra / Gris claro
  { bg: '#590d22', text: '#ffb3c6' }, // Cereza / Rosa pastel
  { bg: '#3e5021', text: '#d4e0b1' }, // Oliva / Verde amarillento claro
  { bg: '#6f4e37', text: '#e8d3c5' }, // Café / Café claro
  { bg: '#450920', text: '#f4acb7' }, // Vino tinto / Rosa viejo
  { bg: '#104547', text: '#a8d5e2' }, // Petróleo / Celeste agua
  { bg: '#5c3a21', text: '#edc4b3' }  // Cobre oscuro / Durazno
]

const normalizarTexto = (texto) => {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const nombreCompleto = (grupo) => {
  return grupo.subgrupo ? `${grupo.nombre} ${grupo.subgrupo}` : grupo.nombre
}

const inicialesGrupo = (grupo) => {
  const nombre = String(grupo.nombre || '').trim()
  const sub = String(grupo.subgrupo || '').trim()
  const palabras = nombre.split(/\s+/).filter(Boolean)
  let base = ''
  if (palabras.length >= 2) {
    base = palabras[0][0] + palabras[1][0]
  } else {
    base = nombre.substring(0, 2)
  }
  const inicial = (base + sub).substring(0, 3)
  return inicial.toUpperCase()
}

const nombresUnicos = computed(() => {
  const vistos = []
  for (const g of listaGrupos.value) {
    const n = normalizarTexto(g.nombre)
    if (!vistos.includes(n)) {
      vistos.push(n)
    }
  }
  return vistos
})

const colorAvatar = (grupo) => {
  const clave = normalizarTexto(grupo.nombre)
  const indice = nombresUnicos.value.indexOf(clave)
  return paletaAvatar[(indice < 0 ? 0 : indice) % paletaAvatar.length]
}

const gruposFiltrados = computed(() => {
  let resultado = listaGrupos.value

  resultado = resultado.filter(g => {
    let matchBusqueda = true
    if (filtros.busqueda) {
      const search = normalizarTexto(filtros.busqueda)
      const texto = normalizarTexto(`${g.nombre} ${g.subgrupo}`)
      matchBusqueda = texto.includes(search)
    }
    return matchBusqueda
  })

  return [...resultado].sort((a, b) => {
    const ordenA = Number(a.orden) || 0
    const ordenB = Number(b.orden) || 0
    return ordenA - ordenB
  })
})

const totalPaginas = computed(() => Math.ceil(gruposFiltrados.value.length / registrosPorPagina) || 1)

const gruposPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return gruposFiltrados.value.slice(inicio, inicio + registrosPorPagina)
})

watch(filtros, () => {
  paginaActual.value = 1
}, { deep: true })

watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) {
    paginaActual.value = nuevoTotal
  }
})

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, 50)
}

const limpiarFiltrosTabla = () => {
  filtros.busqueda = ''
}

const obtenerGrupos = async () => {
  const res = await api.get({ entity: 'grupos', action: 'obtenerGrupos', payload: {} })
  if (res.ok) {
    listaGrupos.value = Array.isArray(res.payload) ? res.payload : []
  }
}

const abrirModalNuevo = () => {
  Object.assign(form, { ...formBase })
  modoEdicion.value = false
  mostrarModal.value = true
}

const cargarDatosEdicion = (grupo) => {
  modoEdicion.value = true
  Object.assign(form, {
    id: grupo.id,
    grupo: grupo.nombre,
    subgrupo: grupo.subgrupo,
    orden: grupo.orden
  })
  mostrarModal.value = true
}

const guardarGrupo = async () => {
  procesando.value = true
  try {
    const action = modoEdicion.value ? 'editarGrupo' : 'crearGrupo'
    const res = await api.post({
      entity: 'grupos',
      action,
      payload: {
        id: form.id,
        grupo: form.grupo,
        subgrupo: form.subgrupo,
        orden: form.orden
      }
    })
    if (res.ok) {
      mostrarModal.value = false
      await obtenerGrupos()
      notificar({
        titulo: 'Exito',
        mensaje: `El grupo se ${modoEdicion.value ? 'actualizo' : 'creo'} correctamente.`,
        tipo: 'success'
      })
    } else {
      notificar({ titulo: 'Error', mensaje: res.message || 'El servidor rechazo la solicitud.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexion.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

const confirmarGuardado = () => {
  const tituloStr = modoEdicion.value ? 'Actualizar?' : 'Crear grupo?'
  const mensajeStr = modoEdicion.value ? 'Se modificaran los datos del grupo.' : 'Se agregara un nuevo grupo al padron.'
  notificar({ titulo: tituloStr, mensaje: mensajeStr, tipo: 'success', alConfirmar: guardarGrupo })
}

const confirmarEliminacion = (id) => {
  notificar({
    titulo: 'Eliminar Grupo?',
    mensaje: 'El grupo se desactivara del padron. Revisa que no tenga arbitros asignados.',
    tipo: 'danger',
    alConfirmar: () => eliminar(id)
  })
}

const eliminar = async (id) => {
  const res = await api.post({ entity: 'grupos', action: 'borrarGrupo', payload: { id } })
  if (res.ok) {
    obtenerGrupos()
    notificar({ titulo: 'Eliminado', mensaje: 'El grupo fue desactivado.', tipo: 'success' })
  }
}

onMounted(() => {
  obtenerGrupos()
})
</script>

<style scoped>
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  margin-left: 50%;
  transform: translateX(-50%);
  padding-bottom: 120px;
}

.admin-panel {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

.grupos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.grupo-tile {
  position: relative;
  background: #1e293b;
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.grupo-tile:hover {
  transform: translateY(-2px);
  border-color: rgba(220, 53, 69, 0.5);
}

.tile-orden {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 6px;
  background: rgb(255, 255, 255);
  color: #000000;
  font-size: 0.7rem;
  font-weight: 700;
}

.tile-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.tile-nombre {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 14px;
}

.tile-subgrupo {
  font-weight: 500;
  opacity: 0.85;
}

.tile-acciones {
  display: flex;
  gap: 6px;
  border-top: 0.5px solid rgba(255, 255, 255, 0.08);
  padding-top: 12px;
}

.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.animate__animated { animation-duration: 0.5s; }
</style>
