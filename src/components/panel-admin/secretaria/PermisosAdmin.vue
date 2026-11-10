<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-person-lock me-1"></i> Permisos
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ usuariosFiltrados.length }} usuarios · {{ cantidadActivos }} activos</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerUsuarios" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="abrirModalNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">person_add</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Usuarios</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-12 col-md-6">
              <input v-model="filtros.busqueda" class="form-control form-control-sm shadow-none" placeholder="NOMBRE O EMAIL...">
            </div>
            <div class="col-6 col-md-3">
              <select v-model="filtros.rol" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">CARGO</option>
                <option v-for="r in rolesEnLista" :key="r" :value="r">{{ etiquetaRol(r).toUpperCase() }}</option>
              </select>
            </div>
            <div class="col-6 col-md-3">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">ESTADO</option>
                <option value="1">ACTIVOS</option>
                <option value="0">DESACTIVADOS</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando usuarios...</p>
          </div>

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.75rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted" style="font-size: 0.75rem; width: 1px;">ID</th>
                    <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Acciones</th>
                    <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Nombre</th>
                    <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Usuario</th>
                    <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Cargo</th>
                    <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Estado</th>
                    <th class="py-3 pe-3 text-uppercase text-muted" style="font-size: 0.75rem;">Categorías que ve</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in usuariosPaginados" :key="u.id" :class="{ 'opacity-50': !esActivo(u) }">
                    <td class="ps-3 text-muted fw-bold font-monospace">{{ u.id }}</td>
                    <td class="text-center">
                      <div v-if="puedeGestionar(u)" class="d-flex justify-content-center gap-1">
                        <button @click="abrirModalEdicion(u)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar Usuario">
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button @click="abrirModalPassword(u)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Cambiar Contraseña">
                          <span class="material-icons" style="font-size:16px;">key</span>
                        </button>
                        <button v-if="!esUsuarioActual(u)" @click="confirmarCambioEstado(u)" :class="['btn btn-light btn-sm border shadow-sm rounded p-1', esActivo(u) ? 'text-danger' : 'text-success']" :title="esActivo(u) ? 'Desactivar' : 'Activar'">
                          <span class="material-icons" style="font-size:16px;">{{ esActivo(u) ? 'person_off' : 'person_add_alt' }}</span>
                        </button>
                      </div>
                      <span v-else class="text-muted small fw-bold">SOLO ADMIN</span>
                    </td>
                    <td class="fw-bold text-uppercase text-dark">
                      {{ u.nombre || 'Sin nombre' }}
                      <span v-if="esUsuarioActual(u)" class="badge-status-sm vos ms-1">VOS</span>
                    </td>
                    <td class="text-muted">{{ u.usuario }}</td>
                    <td class="text-center">
                      <span class="badge-status-sm rol">{{ etiquetaRol(u.rol).toUpperCase() }}</span>
                    </td>
                    <td class="text-center">
                      <span :class="['badge-status-sm', esActivo(u) ? 'activo' : 'inactivo']">{{ esActivo(u) ? 'ACTIVO' : 'INACTIVO' }}</span>
                    </td>
                    <td class="pe-3 text-muted">{{ categoriasDeUsuario(u).join(' · ') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="u in usuariosPaginados" :key="'mob-' + u.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="{ 'opacity-50': !esActivo(u) }">

                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start gap-2">
                  <div class="text-uppercase text-dark fw-bold text-break" style="font-size: 1.05rem;">
                    {{ u.nombre || 'Sin nombre' }}
                    <span v-if="esUsuarioActual(u)" class="badge-status-sm vos ms-1">VOS</span>
                  </div>
                  <div class="small text-muted fw-bold font-monospace">#{{ u.id }}</div>
                </div>

                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
                    <span class="text-muted small text-break">{{ u.usuario }}</span>
                    <span :class="['badge-status-sm', esActivo(u) ? 'activo' : 'inactivo']" style="font-size: 0.7rem; padding: 3px 10px;">{{ esActivo(u) ? 'ACTIVO' : 'INACTIVO' }}</span>
                  </div>

                  <div class="bg-light p-2 rounded border small mb-3">
                    <div class="d-flex justify-content-between gap-2 mb-1">
                      <span class="text-muted">Cargo:</span>
                      <span class="fw-bold text-dark text-end">{{ etiquetaRol(u.rol) }}</span>
                    </div>
                    <div class="d-flex justify-content-between gap-2">
                      <span class="text-muted">Ve:</span>
                      <span class="fw-bold text-dark text-end">{{ categoriasDeUsuario(u).join(' · ') }}</span>
                    </div>
                  </div>

                  <div v-if="puedeGestionar(u)" class="d-flex gap-2">
                    <button @click="abrirModalEdicion(u)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                      <span class="material-icons" style="font-size: 16px;">edit</span> EDITAR
                    </button>
                    <button @click="abrirModalPassword(u)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center" title="Cambiar Contraseña">
                      <span class="material-icons" style="font-size: 18px;">key</span>
                    </button>
                    <button v-if="!esUsuarioActual(u)" @click="confirmarCambioEstado(u)" :class="['btn btn-sm shadow-sm px-3 d-flex justify-content-center align-items-center', esActivo(u) ? 'btn-outline-danger' : 'btn-outline-success']" :title="esActivo(u) ? 'Desactivar' : 'Activar'">
                      <span class="material-icons" style="font-size: 18px;">{{ esActivo(u) ? 'person_off' : 'person_add_alt' }}</span>
                    </button>
                  </div>
                  <div v-else class="text-muted small fw-bold text-center">SOLO UN ADMIN PUEDE MODIFICARLO</div>
                </div>

              </div>
            </div>

            <!-- EMPTY STATE -->
            <div v-if="usuariosPaginados.length === 0" class="text-center p-4 p-md-5 bg-white rounded shadow-sm border m-3">
              <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 48px;">search_off</span>
              <p class="text-muted m-0 fw-bold">No se encontraron usuarios.</p>
            </div>

            <!-- PAGINACIÓN -->
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

    <!-- MODAL ALTA / EDICION -->
    <ModalBase
      :show="mostrarModal"
      @close="mostrarModal = false"
      :icono="modoEdicion ? 'edit' : 'person_add'"
      :colorIcono="modoEdicion ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'"
      maxWidth="600px"
    >
      <template #header>
        <span class="fw-bold fs-5">{{ modoEdicion ? 'Editar usuario' : 'Nuevo usuario' }}</span>
      </template>

      <form id="formUsuarioAdmin" @submit.prevent="confirmarGuardado" class="text-start" novalidate>
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Nombre *</label>
            <input v-model.trim="form.nombre" type="text" maxlength="100" class="form-control shadow-none border-secondary-subtle" :class="{ 'is-invalid': errores.nombre }" placeholder="Ej: Tesorería, Comisión de Ética...">
            <div class="invalid-feedback">{{ errores.nombre }}</div>
          </div>

          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Usuario (email) *</label>
            <input v-model.trim="form.usuario" type="email" maxlength="100" autocomplete="off" class="form-control shadow-none border-secondary-subtle" :class="{ 'is-invalid': errores.usuario }" placeholder="nombre@aaab.com.ar">
            <div class="invalid-feedback">{{ errores.usuario }}</div>
            <span class="text-muted small">Tiene que terminar en @aaab.com.ar para que entre al panel de gestión.</span>
          </div>

          <div v-if="soyAdmin" class="col-12">
            <div class="form-check form-switch">
              <input id="esAdminUsuario" v-model="form.esAdmin" @change="alCambiarAdmin" type="checkbox" class="form-check-input" :disabled="editandoseASiMismo">
              <label for="esAdminUsuario" class="form-check-label small fw-bold text-dark">Administrador (ve todo y gestiona a otros administradores)</label>
            </div>
          </div>

          <div v-if="!form.esAdmin" class="col-12">
            <label class="small fw-bold text-dark mb-1">Cargo *</label>
            <input v-model="form.rol" type="text" maxlength="40" list="cargosExistentes" autocomplete="off" class="form-control shadow-none border-secondary-subtle" :class="{ 'is-invalid': errores.rol }" :disabled="editandoseASiMismo" placeholder="Ej: Tesorero, Contador...">
            <datalist id="cargosExistentes">
              <option v-for="c in cargosExistentes" :key="c" :value="c">{{ etiquetaRol(c) }}</option>
            </datalist>
            <div class="invalid-feedback">{{ errores.rol }}</div>
            <span v-if="editandoseASiMismo" class="text-muted small">No podés cambiar tu propio cargo.</span>
            <span v-else class="text-muted small">Es solo el nombre que se muestra. Lo que puede hacer depende de los permisos de abajo.</span>
          </div>

          <div class="col-12">
            <div class="border rounded-3 p-2 p-sm-3" :class="errores.modulos ? 'border-danger' : ''">
              <span class="small fw-bold text-dark d-block mb-2">Permisos</span>

              <p v-if="form.esAdmin" class="small text-muted mb-2">El administrador ve todos los módulos.</p>
              <p v-else-if="editandoseASiMismo" class="small text-muted mb-2">No podés cambiar tus propios permisos.</p>

              <div v-if="!modulosBloqueados && usuariosParaCopiar.length" class="mb-3">
                <label class="small text-muted mb-1">Copiar permisos de otro usuario (después podés ajustarlos a mano)</label>
                <select v-model="copiarDe" @change="copiarPermisos" class="form-select form-select-sm shadow-none border-secondary-subtle">
                  <option value="">Elegí un usuario...</option>
                  <option v-for="u in usuariosParaCopiar" :key="u.id" :value="u.id">{{ u.nombre || u.usuario }} · {{ etiquetaRol(u.rol) }}</option>
                </select>
              </div>

              <div v-for="grupo in modulosPorCategoria" :key="grupo.categoria" class="mb-2">
                <span class="small text-uppercase text-muted fw-bold d-block mb-1" style="font-size: 0.7rem;">{{ grupo.categoria }}</span>
                <div v-for="m in grupo.modulos" :key="m.clave" class="form-check">
                  <input
                    :id="`modulo-${m.clave}`"
                    v-model="form.modulos"
                    :value="m.clave"
                    :disabled="moduloDeshabilitado(m.clave)"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label :for="`modulo-${m.clave}`" class="form-check-label small">{{ m.etiqueta }}</label>
                </div>
              </div>
              <div v-if="errores.modulos" class="small text-danger">{{ errores.modulos }}</div>
            </div>
          </div>

          <template v-if="!modoEdicion">
            <div class="col-12 col-sm-6">
              <label class="small fw-bold text-dark mb-1">Contraseña *</label>
              <input v-model="form.password" type="password" autocomplete="new-password" class="form-control shadow-none border-secondary-subtle" :class="{ 'is-invalid': errores.password }">
              <div class="invalid-feedback">{{ errores.password }}</div>
            </div>
            <div class="col-12 col-sm-6">
              <label class="small fw-bold text-dark mb-1">Repetir contraseña *</label>
              <input v-model="form.confirmacion" type="password" autocomplete="new-password" class="form-control shadow-none border-secondary-subtle" :class="{ 'is-invalid': errores.confirmacion }">
              <div class="invalid-feedback">{{ errores.confirmacion }}</div>
            </div>
          </template>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formUsuarioAdmin" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : (modoEdicion ? 'GUARDAR CAMBIOS' : 'CREAR USUARIO') }}
        </button>
      </template>
    </ModalBase>

    <!-- MODAL CONTRASEÑA -->
    <ModalBase
      :show="mostrarModalPassword"
      @close="mostrarModalPassword = false"
      icono="key"
      colorIcono="bg-warning-subtle text-warning"
      maxWidth="480px"
    >
      <template #header>
        <span class="fw-bold fs-5">Cambiar contraseña</span>
      </template>

      <p class="text-muted small mb-3">{{ formPassword.nombre }} · {{ formPassword.usuario }}</p>

      <form id="formPasswordAdmin" @submit.prevent="guardarPassword" class="text-start" novalidate>
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Nueva contraseña *</label>
            <input v-model="formPassword.password" type="password" autocomplete="new-password" class="form-control shadow-none border-secondary-subtle" :class="{ 'is-invalid': erroresPassword.password }">
            <div class="invalid-feedback">{{ erroresPassword.password }}</div>
          </div>
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Repetir contraseña *</label>
            <input v-model="formPassword.confirmacion" type="password" autocomplete="new-password" class="form-control shadow-none border-secondary-subtle" :class="{ 'is-invalid': erroresPassword.confirmacion }">
            <div class="invalid-feedback">{{ erroresPassword.confirmacion }}</div>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModalPassword = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formPasswordAdmin" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : 'CAMBIAR CONTRASEÑA' }}
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, watch } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import ModalBase from '@/components/ModalBase.vue'
import { MODULOS_ADMIN, ROL_ADMIN, etiquetaRol } from '@/config/modulosAdmin'

useHead({
  title: 'Permisos | AAAB',
  meta: [{ name: 'description', content: 'Usuarios del panel de gestión y sus roles.' }],
})

const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const usuarioActual = auth.getUser()
const soyAdmin = usuarioActual?.rol === ROL_ADMIN

const LARGO_MINIMO_PASSWORD = 6
const DOMINIO = '@aaab.com.ar'

const listaUsuarios = ref([])
const cargando = ref(false)
const procesando = ref(false)

const filtros = reactive({ busqueda: '', rol: '', estado: '1' })

const mostrarModal = ref(false)
const modoEdicion = ref(false)
const crearFormBase = () => ({ id: null, nombre: '', usuario: '', esAdmin: false, rol: '', password: '', confirmacion: '', modulos: [] })
const form = reactive(crearFormBase())
const copiarDe = ref('')
const tieneModuloPermisosOriginal = ref(false)
const errores = reactive({})

const mostrarModalPassword = ref(false)
const formPassword = reactive({ id: null, nombre: '', usuario: '', password: '', confirmacion: '' })
const erroresPassword = reactive({})

const cargosExistentes = computed(() => {
  const cargos = listaUsuarios.value.map(u => u.rol).filter(r => r && r !== ROL_ADMIN)
  return [...new Set(cargos)].sort((a, b) => etiquetaRol(a).localeCompare(etiquetaRol(b)))
})

const rolesEnLista = computed(() => {
  const roles = [...new Set(listaUsuarios.value.map(u => u.rol).filter(Boolean))]
  return roles.sort((a, b) => etiquetaRol(a).localeCompare(etiquetaRol(b)))
})

const usuariosParaCopiar = computed(() => listaUsuarios.value.filter(u =>
  Number(u.id) !== Number(form.id) && (u.modulos || []).length > 0
))

const editandoseASiMismo = computed(() => modoEdicion.value && Number(form.id) === Number(usuarioActual?.id))

const normalizarTexto = (texto) => String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const esActivo = (u) => Number(u.activo) === 1
const esUsuarioActual = (u) => Number(u.id) === Number(usuarioActual?.id)
const puedeGestionar = (u) => soyAdmin || u.rol !== ROL_ADMIN

const TODOS_LOS_MODULOS = MODULOS_ADMIN.map(m => m.clave)

const categoriasDeUsuario = (u) => {
  const modulos = u.rol === ROL_ADMIN ? TODOS_LOS_MODULOS : (u.modulos || [])
  return [...new Set(MODULOS_ADMIN.filter(m => modulos.includes(m.clave)).map(m => m.categoria))]
}

const modulosPorCategoria = computed(() => {
  const grupos = []
  for (const m of MODULOS_ADMIN) {
    let grupo = grupos.find(g => g.categoria === m.categoria)
    if (!grupo) {
      grupo = { categoria: m.categoria, modulos: [] }
      grupos.push(grupo)
    }
    grupo.modulos.push(m)
  }
  return grupos
})

const modulosBloqueados = computed(() => form.esAdmin || editandoseASiMismo.value)

const moduloDeshabilitado = (clave) => modulosBloqueados.value || (clave === 'permisos' && !soyAdmin)

const copiarPermisos = () => {
  const origen = listaUsuarios.value.find(u => Number(u.id) === Number(copiarDe.value))
  if (!origen) return
  let modulos = [...(origen.modulos || [])]
  if (!soyAdmin) {
    modulos = modulos.filter(m => m !== 'permisos')
    if (tieneModuloPermisosOriginal.value) modulos.push('permisos')
  }
  form.modulos = modulos
  if (!form.rol && origen.rol !== ROL_ADMIN) form.rol = origen.rol
  delete errores.modulos
  copiarDe.value = ''
  toast({ titulo: 'Permisos copiados', mensaje: `Se copiaron los permisos de ${origen.nombre || origen.usuario}. Podés ajustarlos marcando o desmarcando.`, tipo: 'success' })
}

const alCambiarAdmin = () => {
  form.modulos = form.esAdmin ? [...TODOS_LOS_MODULOS] : []
  delete errores.modulos
}

const cantidadActivos = computed(() => listaUsuarios.value.filter(esActivo).length)

const usuariosFiltrados = computed(() => {
  const busqueda = normalizarTexto(filtros.busqueda)
  return listaUsuarios.value.filter(u => {
    if (busqueda && !normalizarTexto(`${u.nombre} ${u.usuario}`).includes(busqueda)) return false
    if (filtros.rol && u.rol !== filtros.rol) return false
    if (filtros.estado !== '' && String(Number(u.activo)) !== filtros.estado) return false
    return true
  })
})

const mostrarFiltrosMobile = ref(false)
const paginaActual = ref(1)
const registrosPorPagina = 15

const totalPaginas = computed(() => Math.ceil(usuariosFiltrados.value.length / registrosPorPagina) || 1)

const usuariosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return usuariosFiltrados.value.slice(inicio, inicio + registrosPorPagina)
})

watch(filtros, () => {
  paginaActual.value = 1
}, { deep: true })

watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal
})

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const limpiarFiltros = () => {
  Object.assign(filtros, { busqueda: '', rol: '', estado: '' })
}

const limpiarErrores = (obj) => Object.keys(obj).forEach(k => delete obj[k])

const validarPassword = (password, confirmacion, destino) => {
  if (!password || password.length < LARGO_MINIMO_PASSWORD) {
    destino.password = `Mínimo ${LARGO_MINIMO_PASSWORD} caracteres.`
  } else if (password.length > 72) {
    destino.password = 'Máximo 72 caracteres.'
  }
  if (password !== confirmacion) destino.confirmacion = 'Las contraseñas no coinciden.'
}

const validarFormulario = () => {
  limpiarErrores(errores)
  const usuario = form.usuario.toLowerCase()
  if (!form.nombre) errores.nombre = 'Ingresá un nombre.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario) || !usuario.endsWith(DOMINIO)) {
    errores.usuario = `Ingresá un email que termine en ${DOMINIO}.`
  } else if (listaUsuarios.value.some(u => u.usuario.toLowerCase() === usuario && Number(u.id) !== Number(form.id))) {
    errores.usuario = 'Ya existe un usuario con ese email.'
  }
  if (!form.esAdmin) {
    const cargo = cargoNormalizado()
    if (cargo.length < 2 || cargo.length > 40) errores.rol = 'Ingresá un cargo de entre 2 y 40 caracteres.'
    else if (cargo === ROL_ADMIN) errores.rol = soyAdmin ? 'Para un administrador usá la opción "Administrador".' : 'No podés asignar el cargo admin.'
  }
  if (!modulosBloqueados.value && form.modulos.length === 0) errores.modulos = 'Marcá al menos un módulo.'
  if (!modoEdicion.value) validarPassword(form.password, form.confirmacion, errores)
  return Object.keys(errores).length === 0
}

const obtenerUsuarios = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'usuarios_admin', action: 'listarUsuariosAdmin', payload: {} })
    if (res.ok) {
      const usuarios = Array.isArray(res.payload) ? res.payload : res.payload?.usuarios
      listaUsuarios.value = Array.isArray(usuarios) ? usuarios : []
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'No se pudieron cargar los usuarios.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const cargoNormalizado = () => form.rol.trim().replace(/\s+/g, ' ').toLowerCase()

const abrirModalNuevo = () => {
  Object.assign(form, crearFormBase())
  copiarDe.value = ''
  tieneModuloPermisosOriginal.value = false
  limpiarErrores(errores)
  modoEdicion.value = false
  mostrarModal.value = true
}

const abrirModalEdicion = (u) => {
  const esAdmin = u.rol === ROL_ADMIN
  const modulos = esAdmin ? [...TODOS_LOS_MODULOS] : [...(u.modulos || [])]
  Object.assign(form, { ...crearFormBase(), id: u.id, nombre: u.nombre || '', usuario: u.usuario, esAdmin, rol: esAdmin ? '' : (u.rol || ''), modulos })
  copiarDe.value = ''
  tieneModuloPermisosOriginal.value = modulos.includes('permisos')
  limpiarErrores(errores)
  modoEdicion.value = true
  mostrarModal.value = true
}

const confirmarGuardado = () => {
  if (!validarFormulario()) return
  notificar({
    titulo: modoEdicion.value ? '¿Guardar cambios?' : '¿Crear usuario?',
    mensaje: form.esAdmin
      ? `${form.nombre} quedará como administrador.`
      : `${form.nombre} quedará con el cargo ${etiquetaRol(cargoNormalizado())} y ${form.modulos.length} ${form.modulos.length === 1 ? 'módulo' : 'módulos'}.`,
    tipo: 'success',
    alConfirmar: guardarUsuario
  })
}

const guardarUsuario = async () => {
  procesando.value = true
  try {
    const payload = { nombre: form.nombre, usuario: form.usuario.toLowerCase(), rol: form.esAdmin ? ROL_ADMIN : cargoNormalizado() }
    if (modoEdicion.value) payload.id = form.id
    else payload.password = form.password
    if (!editandoseASiMismo.value) payload.modulos = [...form.modulos]

    const res = await api.post({
      entity: 'usuarios_admin',
      action: modoEdicion.value ? 'editarUsuarioAdmin' : 'crearUsuarioAdmin',
      payload
    })
    if (res.ok) {
      mostrarModal.value = false
      toast({ titulo: 'Listo', mensaje: `Usuario ${modoEdicion.value ? 'actualizado' : 'creado'}.`, tipo: 'success' })
      await obtenerUsuarios()
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

const abrirModalPassword = (u) => {
  Object.assign(formPassword, { id: u.id, nombre: u.nombre, usuario: u.usuario, password: '', confirmacion: '' })
  limpiarErrores(erroresPassword)
  mostrarModalPassword.value = true
}

const guardarPassword = async () => {
  limpiarErrores(erroresPassword)
  validarPassword(formPassword.password, formPassword.confirmacion, erroresPassword)
  if (Object.keys(erroresPassword).length > 0) return

  procesando.value = true
  try {
    const res = await api.post({
      entity: 'usuarios_admin',
      action: 'cambiarPasswordUsuarioAdmin',
      payload: { id: formPassword.id, password: formPassword.password }
    })
    if (res.ok) {
      mostrarModalPassword.value = false
      toast({ titulo: 'Listo', mensaje: 'Contraseña actualizada.', tipo: 'success' })
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'No se pudo cambiar la contraseña.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

const confirmarCambioEstado = (u) => {
  const activar = !esActivo(u)
  notificar({
    titulo: activar ? '¿Activar usuario?' : '¿Desactivar usuario?',
    mensaje: activar
      ? `${u.nombre} va a poder volver a ingresar al panel.`
      : `${u.nombre} no va a poder ingresar al panel. Sus registros históricos se mantienen.`,
    tipo: activar ? 'success' : 'danger',
    alConfirmar: () => cambiarEstado(u, activar)
  })
}

const cambiarEstado = async (u, activar) => {
  try {
    const res = await api.post({
      entity: 'usuarios_admin',
      action: 'cambiarEstadoUsuarioAdmin',
      payload: { id: u.id, activo: activar ? 1 : 0 }
    })
    if (res.ok) {
      toast({ titulo: 'Listo', mensaje: `Usuario ${activar ? 'activado' : 'desactivado'}.`, tipo: 'success' })
      await obtenerUsuarios()
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'No se pudo cambiar el estado.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  }
}

onMounted(() => {
  obtenerUsuarios()
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

.badge-status-sm {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
  display: inline-block;
}
.activo { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.inactivo { background: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; }
.rol { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.vos { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }

.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.animate__animated { animation-duration: 0.5s; }
</style>
