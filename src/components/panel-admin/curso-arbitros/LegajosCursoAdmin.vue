<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-mortarboard-fill me-1"></i> Legajos del Curso
            </h4>
            <span class="text-muted small d-block mt-1">
              Total: {{ legajosFiltrados.length }} inscriptos
              <template v-for="(cantidad, estado) in resumenEstados" :key="estado">
                <span v-if="cantidad" class="badge rounded-pill ms-1" :class="ESTADOS_CURSO[estado].clase">{{ cantidad }} {{ ESTADOS_CURSO[estado].etiqueta.toLowerCase() }}</span>
              </template>
            </span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2" aria-label="Mostrar filtros">
              <span class="material-icons fs-6">filter_alt</span>
            </button>
            <button @click="cargarDatos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="abrirNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">person_add</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo</span>
            </button>
            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0" :disabled="!legajosFiltrados.length">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- FILTROS (Solo Móvil) -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Inscriptos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm" aria-label="Cerrar filtros"></button>
          </div>
          <div class="row g-2">
            <div class="col-6"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="APELLIDO..."></div>
            <div class="col-6"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="NOMBRE..."></div>
            <div class="col-6"><input v-model="filtros.dni" class="form-control form-control-sm shadow-none" placeholder="DNI..."></div>
            <div class="col-6">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">ESTADO</option>
                <option v-for="(e, clave) in ESTADOS_CURSO" :key="clave" :value="clave">{{ e.etiqueta.toUpperCase() }}</option>
              </select>
            </div>
            <div class="col-12 mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando inscriptos...</p>
          </div>

          <template v-else>
            <!-- TABLA (Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
              <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id">ID</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones">Acciones</th>
                    <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                    <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                    <th v-for="c in COLUMNAS" :key="c.id" class="py-3 text-uppercase text-muted" :class="{ 'text-center': c.centro }">{{ c.label }}</th>
                  </tr>
                  <tr class="bg-light">
                    <td class="p-2 border-bottom border-2 col-fija col-id"></td>
                    <td class="p-2 border-bottom border-2 col-fija col-acciones"></td>
                    <td class="p-2 border-bottom border-2 col-fija col-apellido"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="FILTRAR.."></td>
                    <td class="p-2 border-bottom border-2 col-fija col-nombre"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="FILTRAR.."></td>
                    <td v-for="c in COLUMNAS" :key="'f-' + c.id" class="p-2 border-bottom border-2">
                      <select v-if="c.opciones" v-model="filtros[c.id]" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                        <option value="">TODOS</option>
                        <option v-for="o in c.opciones" :key="o.valor" :value="o.valor">{{ o.etiqueta }}</option>
                      </select>
                      <input v-else-if="c.filtro !== false" v-model="filtros[c.id]" class="form-control form-control-sm shadow-none">
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="l in legajosPaginados" :key="l.id" :class="{ 'fila-baja': l.estado === 'baja' }">
                    <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ l.id }}</td>
                    <td class="text-center col-fija col-acciones">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="abrirEditar(l)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar" aria-label="Editar">
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button @click="abrirEstado(l)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Cambiar estado" aria-label="Cambiar estado">
                          <span class="material-icons" style="font-size:16px;">swap_horiz</span>
                        </button>
                      </div>
                    </td>
                    <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ l.apellido }}</td>
                    <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ l.nombre }}</td>
                    <td v-for="c in COLUMNAS" :key="c.id" class="text-dark" :class="{ 'text-center': c.centro }">
                      <span v-if="c.id === 'estado'" class="badge" :class="ESTADOS_CURSO[l.estado]?.clase || 'bg-secondary'">{{ ESTADOS_CURSO[l.estado]?.etiqueta || l.estado }}</span>
                      <span v-else-if="c.largo" class="d-inline-block text-truncate" style="max-width: 220px; cursor: help;" :title="valorColumna(l, c.id)">{{ valorColumna(l, c.id) }}</span>
                      <template v-else>{{ valorColumna(l, c.id) }}</template>
                    </td>
                  </tr>
                  <tr v-if="!legajosPaginados.length">
                    <td :colspan="COLUMNAS.length + 4" class="text-center py-5 text-muted bg-white border-0">
                      <span class="material-icons d-block fs-1 mb-2 opacity-50">search_off</span>
                      <span class="fw-bold">No se encontraron inscriptos.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- TARJETAS (Móvil) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="l in legajosPaginados" :key="'m-' + l.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="{ 'border-danger border-2': l.estado === 'baja' }">
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">{{ l.apellido }}, {{ l.nombre }}</div>
                  <span class="badge" :class="ESTADOS_CURSO[l.estado]?.clase || 'bg-secondary'">{{ ESTADOS_CURSO[l.estado]?.etiqueta || l.estado }}</span>
                </div>
                <div class="card-body pt-0 px-3 pb-3 small text-dark">
                  <div><strong>DNI:</strong> {{ l.dni }} · <strong>Cel:</strong> {{ l.celular }}</div>
                  <div class="text-truncate"><strong>Email:</strong> {{ l.email }}</div>
                  <div v-if="l.es_jugador === 'SI'"><strong>Juega:</strong> {{ l.club_jugador }} ({{ textoCategorias(l.categorias_jugador) }})</div>
                  <div v-if="l.es_dt === 'SI'"><strong>DT:</strong> {{ textoDtClubes(l.dt_clubes) }}</div>
                  <div class="text-truncate"><strong>Usuario:</strong> {{ l.usuario }}</div>
                  <div v-if="l.motivo_estado" :class="{ 'text-danger': l.estado === 'baja' }"><strong>Motivo:</strong> {{ l.motivo_estado }}</div>
                  <div class="d-flex gap-2 mt-3">
                    <button @click="abrirEditar(l)" class="btn btn-sm btn-outline-primary flex-fill fw-bold"><i class="bi bi-pencil me-1"></i> Editar</button>
                    <button @click="abrirEstado(l)" class="btn btn-sm btn-outline-danger flex-fill fw-bold">
                      <i class="bi bi-arrow-left-right me-1"></i> Estado
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="!legajosPaginados.length" class="text-center p-4 bg-white rounded-3 shadow-sm border">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
                <p class="text-muted m-0 fw-bold">No se encontraron inscriptos.</p>
              </div>
            </div>

            <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
                <i class="bi bi-chevron-left"></i> Ant
              </button>
              <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
                Sig <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- MODAL NUEVO / EDITAR -->
    <ModalBase
      :show="mostrarModal"
      @close="mostrarModal = false"
      :icono="form.id ? 'edit' : 'person_add'"
      :colorIcono="form.id ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'"
      maxWidth="900px"
    >
      <template #header>
        <span class="fw-bold fs-5">{{ form.id ? 'Editar inscripto' : 'Nuevo inscripto' }}</span>
      </template>
      <form id="formLegajoCurso" class="text-start" novalidate @submit.prevent="guardar">
        <FormularioCursoArbitro
          v-model="form"
          :errores="errores"
          :mostrar-errores="intentoGuardar"
          :provincias="provincias"
          :localidades="localidades"
          prefijo="leg-curso"
          :password-obligatoria="false"
          :ayuda-password="form.id ? 'Dejala vacía para mantener la contraseña actual.' : 'Si la dejás vacía, la contraseña inicial es el DNI.'"
          @error="mensaje => notificar({ titulo: 'Error', mensaje, tipo: 'danger' })"
        />
      </form>
      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formLegajoCurso" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
          <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
          {{ guardando ? 'GUARDANDO...' : 'GUARDAR' }}
        </button>
      </template>
    </ModalBase>

    <!-- MODAL CAMBIO DE ESTADO -->
    <ModalBase
      :show="mostrarModalEstado"
      @close="mostrarModalEstado = false"
      icono="swap_horiz"
      colorIcono="bg-danger-subtle text-danger"
      maxWidth="540px"
    >
      <template #header>
        <span class="fw-bold fs-5">Cambiar estado</span>
      </template>
      <div v-if="legajoEstado" class="text-start">
        <p class="mb-3 text-dark">
          <strong class="text-uppercase">{{ legajoEstado.apellido }}, {{ legajoEstado.nombre }}</strong>
          <span class="text-muted"> · DNI {{ legajoEstado.dni }}</span>
        </p>
        <p class="small mb-3">
          Estado actual:
          <span class="badge" :class="ESTADOS_CURSO[legajoEstado.estado]?.clase || 'bg-secondary'">{{ ESTADOS_CURSO[legajoEstado.estado]?.etiqueta || legajoEstado.estado }}</span>
          <span v-if="legajoEstado.motivo_estado" class="text-muted"> · {{ legajoEstado.motivo_estado }}</span>
        </p>
        <label for="nuevo-estado" class="form-label small fw-bold text-dark">Nuevo estado *</label>
        <select id="nuevo-estado" v-model="nuevoEstado" class="form-select mb-3">
          <option v-for="(e, clave) in ESTADOS_CURSO" :key="clave" :value="clave">{{ e.etiqueta }}</option>
        </select>
        <div v-if="nuevoEstado === 'aprobado'" class="alert alert-info small py-2">
          Al pasar a <strong>árbitro aprobado</strong> va a ver en su panel el acceso para completar el registro de árbitros con su email personal.
        </div>
        <div v-if="nuevoEstado === 'reinscripcion'" class="alert alert-info small py-2">
          La reinscripción lo pasa al curso de este año ({{ anioActual }}).
        </div>
        <div v-if="nuevoEstado !== legajoEstado.estado" class="small text-muted mb-2">
          <i class="bi bi-envelope me-1"></i> Se le va a avisar por email a {{ legajoEstado.email }}.
        </div>
        <label for="motivo-estado" class="form-label small fw-bold text-dark">Motivo {{ nuevoEstado === 'baja' ? '*' : '(opcional)' }}</label>
        <textarea id="motivo-estado" v-model.trim="motivoEstado" rows="3" maxlength="500" class="form-control" :class="{ 'is-invalid': intentoEstado && nuevoEstado === 'baja' && motivoEstado.length < 3 }" :placeholder="nuevoEstado === 'baja' ? 'Ej: dejó de asistir, motivos personales...' : ''"></textarea>
        <div class="invalid-feedback">Indicá el motivo de la baja.</div>
      </div>
      <template #footer>
        <button type="button" @click="mostrarModalEstado = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="button" @click="confirmarEstado" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoEstado">
          <span v-if="guardandoEstado" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR ESTADO
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import ExcelJS from 'exceljs'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import FormularioCursoArbitro from '@/components/FormularioCursoArbitro.vue'
import {
  ESTADOS_CURSO, GENEROS_CURSO, formularioCursoVacio, formularioDesdeLegajo, validarFormularioCurso, payloadCurso, textoDtClubes,
} from '@/composables/useCursoArbitro'

useHead({ title: 'Legajos del Curso | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

// ─── Columnas (después de ID / Acciones / Apellido / Nombre, que son fijas) ──
const SI_NO = [{ valor: 'SI', etiqueta: 'SÍ' }, { valor: 'NO', etiqueta: 'NO' }]
const COLUMNAS = [
  { id: 'estado', label: 'Estado', centro: true, opciones: Object.entries(ESTADOS_CURSO).map(([valor, e]) => ({ valor, etiqueta: e.etiqueta.toUpperCase() })) },
  { id: 'anio_curso', label: 'Año', centro: true },
  { id: 'dni', label: 'DNI', centro: true },
  { id: 'usuario', label: 'Usuario' },
  { id: 'genero', label: 'Género', centro: true, opciones: GENEROS_CURSO.map(g => ({ valor: g.valor, etiqueta: g.etiqueta.toUpperCase() })) },
  { id: 'email', label: 'Email' },
  { id: 'celular', label: 'Celular' },
  { id: 'fecha_nacimiento', label: 'F. Nacimiento' },
  { id: 'nombre_provincia', label: 'Provincia' },
  { id: 'nombre_localidad', label: 'Localidad' },
  { id: 'zona', label: 'Zona' },
  { id: 'direccion', label: 'Dirección', largo: true },
  { id: 'telefonocontacto', label: 'Tel. Contacto' },
  { id: 'parentescocontacto', label: 'Parentesco' },
  { id: 'es_jugador', label: 'Jugador', centro: true, opciones: SI_NO },
  { id: 'club_jugador', label: 'Club Jugador' },
  { id: 'categorias_jugador', label: 'Cat. Jugador', largo: true },
  { id: 'es_dt', label: 'DT', centro: true, opciones: SI_NO },
  { id: 'dt_detalle', label: 'Clubes y Cat. DT', largo: true },
  { id: 'motivo_estado', label: 'Motivo Estado', largo: true },
  { id: 'fecha_estado', label: 'F. Estado' },
  { id: 'fecha_registro', label: 'F. Inscripción' },
  { id: 'observaciones', label: 'Observaciones', largo: true },
]
const CAMPOS_EXACTOS = ['estado', 'genero', 'es_jugador', 'es_dt', 'anio_curso']
const anioActual = new Date().getFullYear()

// ─── Estado ──────────────────────────────────────────────────────
const legajos = ref([])
const provincias = ref([])
const localidades = ref([])
const cargando = ref(false)
const mostrarFiltrosMobile = ref(false)
const paginaActual = ref(1)
const registrosPorPagina = 10

const filtrosVacios = () => Object.fromEntries(['apellido', 'nombre', ...COLUMNAS.map(c => c.id)].map(k => [k, '']))
const filtros = reactive(filtrosVacios())

// ─── Helpers ─────────────────────────────────────────────────────
const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const mostrarFechaArg = (fecha) => {
  if (!fecha) return ''
  const [soloFecha, hora] = String(fecha).split(' ')
  const partes = soloFecha.split('-')
  const f = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : soloFecha
  return hora ? `${f} ${hora}` : f
}
const textoCategorias = (texto) => String(texto || '').split('|').map(c => c.trim()).filter(Boolean).join('; ')
const etiquetaGenero = (g) => GENEROS_CURSO.find(x => x.valor === g)?.etiqueta || ''

const valorColumna = (l, id) => {
  if (id === 'fecha_nacimiento' || id === 'fecha_estado' || id === 'fecha_registro') return mostrarFechaArg(l[id])
  if (id === 'dt_detalle') return textoDtClubes(l.dt_clubes)
  if (id === 'genero') return etiquetaGenero(l.genero)
  if (id === 'categorias_jugador') return textoCategorias(l[id])
  return l[id] ?? ''
}

// ─── Filtrado y paginación ───────────────────────────────────────
const legajosFiltrados = computed(() => {
  const activos = Object.entries(filtros).filter(([, v]) => v !== '' && v !== null)
  return legajos.value.filter(l => activos.every(([campo, valor]) => {
    if (CAMPOS_EXACTOS.includes(campo)) return String(l[campo] ?? '') === String(valor)
    return normalizar(valorColumna(l, campo)).includes(normalizar(valor))
  }))
})

const resumenEstados = computed(() => {
  const r = Object.fromEntries(Object.keys(ESTADOS_CURSO).map(e => [e, 0]))
  for (const l of legajosFiltrados.value) if (r[l.estado] !== undefined) r[l.estado]++
  return r
})

const totalPaginas = computed(() => Math.ceil(legajosFiltrados.value.length / registrosPorPagina) || 1)
const legajosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return legajosFiltrados.value.slice(inicio, inicio + registrosPorPagina)
})

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (n) => { if (paginaActual.value > n) paginaActual.value = n })

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= 768) setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
}

const limpiarFiltros = () => Object.assign(filtros, filtrosVacios())

// ─── Cargas ──────────────────────────────────────────────────────
const cargarDatos = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'legajos_curso_arbitro', action: 'obtenerLegajosCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los legajos')
    legajos.value = res.payload || []
  } catch (e) {
    console.error('cargarDatos:', e)
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const cargarUbicaciones = async () => {
  try {
    const res = await api.get({ entity: 'localidades', action: 'obtenerProvinciasLocalidades', payload: {} })
    provincias.value = res?.payload?.provincias ?? []
    localidades.value = res?.payload?.localidades ?? []
  } catch (e) {
    console.error('cargarUbicaciones:', e)
  }
}

// ─── Nuevo / Editar ──────────────────────────────────────────────
const mostrarModal = ref(false)
const form = ref(formularioCursoVacio())
const errores = ref({})
const intentoGuardar = ref(false)
const guardando = ref(false)

const validar = () => validarFormularioCurso(form.value, { passwordObligatoria: false })
watch(form, () => { if (intentoGuardar.value) errores.value = validar() }, { deep: true })

const abrirModalCon = (datos) => {
  form.value = datos
  errores.value = {}
  intentoGuardar.value = false
  mostrarModal.value = true
}
const abrirNuevo = () => abrirModalCon(formularioCursoVacio())
const abrirEditar = (l) => abrirModalCon(formularioDesdeLegajo(l))

const guardar = async () => {
  intentoGuardar.value = true
  errores.value = validar()
  if (Object.keys(errores.value).length) {
    notificar({ titulo: 'Faltan datos', mensaje: Object.values(errores.value)[0], tipo: 'danger' })
    return
  }
  guardando.value = true
  try {
    const res = await api.post({ entity: 'legajos_curso_arbitro', action: 'guardarLegajoCurso', payload: payloadCurso(form.value) })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar el legajo')
    toast({ titulo: 'Guardado', mensaje: form.value.id ? 'El legajo se actualizó.' : 'El inscripto se creó.', tipo: 'success' })
    mostrarModal.value = false
    await cargarDatos()
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

// ─── Cambio de estado ────────────────────────────────────────────
const mostrarModalEstado = ref(false)
const legajoEstado = ref(null)
const nuevoEstado = ref('regular')
const motivoEstado = ref('')
const intentoEstado = ref(false)
const guardandoEstado = ref(false)

const abrirEstado = (l) => {
  legajoEstado.value = l
  nuevoEstado.value = l.estado
  motivoEstado.value = l.motivo_estado || ''
  intentoEstado.value = false
  mostrarModalEstado.value = true
}

const confirmarEstado = async () => {
  const l = legajoEstado.value
  if (!l) return
  intentoEstado.value = true
  if (nuevoEstado.value === 'baja' && motivoEstado.value.length < 3) return
  guardandoEstado.value = true
  try {
    const res = await api.post({
      entity: 'legajos_curso_arbitro',
      action: 'cambiarEstadoCurso',
      payload: { id: l.id, estado: nuevoEstado.value, motivo: motivoEstado.value },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cambiar el estado')
    toast({ titulo: 'Listo', mensaje: `Estado actualizado: ${ESTADOS_CURSO[nuevoEstado.value].etiqueta}.`, tipo: 'success' })
    mostrarModalEstado.value = false
    await cargarDatos()
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardandoEstado.value = false
  }
}

// ─── Excel ───────────────────────────────────────────────────────
const exportarExcel = async () => {
  const columnas = [
    { id: 'id', label: 'ID' }, { id: 'apellido', label: 'Apellido' }, { id: 'nombre', label: 'Nombre' },
    ...COLUMNAS,
  ]
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Legajos Curso')
  ws.columns = columnas.map(c => ({ header: c.label, key: c.id, width: 18 }))
  legajosFiltrados.value.forEach(l => {
    const fila = {}
    for (const c of columnas) fila[c.id] = c.id === 'estado' ? (ESTADOS_CURSO[l.estado]?.etiqueta || l.estado) : valorColumna(l, c.id)
    ws.addRow(fila)
  })
  ws.getRow(1).font = { bold: true }
  const buffer = await wb.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'Legajos_Curso_AAAB.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  cargarDatos()
  cargarUbicaciones()
})
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.tabla-container { overflow-x: auto; }
.tabla-fija { border-collapse: separate; border-spacing: 0; }
.tabla-fija th, .tabla-fija td { border-left: none !important; border-right: none !important; }
.col-fija { position: sticky; background-color: inherit; z-index: 10; }
.tabla-fija thead .col-fija { background-color: #f8f9fa; z-index: 12; }
.tabla-fija tbody .col-fija { background-color: #ffffff; }
.col-id { left: 0; min-width: 60px; }
.col-acciones { left: 60px; min-width: 100px; }
.col-apellido { left: 160px; min-width: 150px; }
.col-nombre { left: 310px; min-width: 150px; }
.col-nombre::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to right, rgba(0,0,0,0.1), transparent); }

.fila-baja td, .tabla-fija tbody .fila-baja .col-fija { background-color: #fef2f2 !important; }
</style>
