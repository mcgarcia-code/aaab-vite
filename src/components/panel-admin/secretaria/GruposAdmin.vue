<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Grupos de árbitros · Total: {{ gruposFiltrados.length }} grupos</p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="obtenerGrupos" />

            <BotonHerramienta tipo="filtros" class="d-md-none" :solo-icono-en-celular="false" @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" />

            <BotonHerramienta tipo="limpiar" @click="limpiarFiltrosTabla" />

            <BotonHerramienta tipo="nuevo" texto="Nuevo grupo" icono="bi-person-plus" @click="abrirModalNuevo" />
          </div>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Grupos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-12">
              <input v-model="filtros.busqueda" class="form-control form-control-sm shadow-none" placeholder="BUSCAR POR NOMBRE, GRUPO O SUBGRUPO...">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-danger w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <EstadoCargando v-if="cargando" texto="Cargando grupos" />

          <template v-else>
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
                    <i class="bi bi-pencil" style="font-size:16px;"></i>
                    <span class="fw-bold small d-none d-sm-inline">Editar</span>
                  </button>
                  <button @click="confirmarEliminacion(grupo.id)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger flex-grow-1 d-flex justify-content-center align-items-center gap-1" title="Eliminar Grupo">
                    <i class="bi bi-trash" style="font-size:16px;"></i>
                    <span class="fw-bold small d-none d-sm-inline">Borrar</span>
                  </button>
                </div>
              </div>
            </div>

            <EstadoVacio v-if="gruposPaginados.length === 0" icono="bi-person-x" titulo="No se encontraron grupos" />

            <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
                <i class="bi bi-chevron-left"></i> Ant
              </button>
              <span class="fw-bold text-dark small">Pagina {{ paginaActual }} de {{ totalPaginas }}</span>
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
                Sig <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </template>

        </div>
      </div>
    </div>

    <ModalBase
      :show="mostrarModal"
      :hay-cambios="hayCambios"
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

      <template #footer="{ cerrar }">
        <button type="button" @click="cerrar" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formGrupo" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : (modoEdicion ? 'GUARDAR CAMBIOS' : 'CREAR GRUPO') }}
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { ref, reactive, onMounted, inject, computed, watch } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'
import { useCambiosSinGuardar } from '@/composables/useCambiosSinGuardar'

useHead({
  title: 'Gestion de Grupos | AAAB',
  meta: [{ name: 'description', content: 'Administracion de grupos y subgrupos del padron.' }],
})

const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))
const procesando = ref(false)
const listaGrupos = ref([])

const formBase = {
  id: null,
  grupo: '',
  subgrupo: '',
  orden: null
}

const cargando = ref(false)

const form = reactive({ ...formBase })

const mostrarModal = ref(false)
const modoEdicion = ref(false)
const { hayCambios } = useCambiosSinGuardar(form, mostrarModal)
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
  cargando.value = true
  try {
    const res = await api.get({ entity: 'grupos', action: 'obtenerGrupos', payload: {} })
    if (res.ok) {
      listaGrupos.value = Array.isArray(res.payload) ? res.payload : []
    }
  } finally {
    cargando.value = false
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
      toast({
        titulo: 'Exito',
        mensaje: `El grupo se ${modoEdicion.value ? 'actualizo' : 'creo'} correctamente.`,
        tipo: 'success'
      })
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'El servidor rechazo la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexion.', tipo: 'danger' })
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
    toast({ titulo: 'Eliminado', mensaje: 'El grupo fue desactivado.', tipo: 'success' })
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
