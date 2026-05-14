<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-megaphone me-1"></i> Gestión de Eventos
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ eventosFiltrados.length }} eventos</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Recargar -->
            <button @click="obtenerEventos" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <!-- Botón Filtros (Solo Móvil) -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltrosTabla" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="abrirModalNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_alert</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Eventos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-12 col-md-3">
              <input v-model="filtros.busqueda" class="form-control form-control-sm shadow-none" placeholder="Buscar tema o descripción...">
            </div>
            <div class="col-6 col-md-3">
              <input type="date" v-model="filtros.fecha" class="form-control form-control-sm shadow-none text-md-center">
            </div>
            <div class="col-6 col-md-3">
              <select v-model="filtros.categoria" class="form-select form-select-sm shadow-none">
                <option value="">TODAS LAS CATEGORÍAS</option>
                <option value="reunion">REUNIÓN</option>
                <option value="recordatorio">RECORDATORIO</option>
                <option value="urgente">URGENTE</option>
              </select>
            </div>
            <div class="col-12 col-md-3">
              <input v-model="filtros.grupo" class="form-control form-control-sm shadow-none" placeholder="Grupo (Ej: Pre Liga, 3-A...)">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- TABLA (Solo Escritorio) -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.75rem; table-layout: fixed;">
              <thead class="table-light">
                <tr>
                  <!-- Modificá el width de cada columna directamente acá -->
                  <th class="py-3 ps-3 text-center text-uppercase text-muted" style="font-size: 0.75rem; width: 110px;">Fecha</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem; width: 100px;">Acciones</th>
                  <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem; width: 25%;">Tema del Evento</th>
                  <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem; width: 35%;">Lugar / Descripción</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem; width: 130px;">Categoría</th>
                  <th class="py-3 text-center pe-3 text-uppercase text-muted" style="font-size: 0.75rem; width: 150px;">Alcance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="evento in eventosPaginados" :key="evento.id">
                  <td class="ps-3 text-center text-muted fw-bold">{{ formatearFecha(evento.fecha_evento) }}</td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="cargarDatosEdicion(evento)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar Evento">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="confirmarEliminacion(evento.id)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Eliminar Evento">
                        <span class="material-icons" style="font-size:16px;">delete</span>
                      </button>
                    </div>
                  </td>
                  <td class="fw-bold text-dark text-truncate" :title="evento.titulo">{{ evento.titulo }}</td>
                  <td class="text-muted small text-truncate" :title="evento.descripcion">
                    {{ evento.descripcion || '-' }}
                    <div v-if="esLink(evento.descripcion)" class="mt-1">
                      <a :href="evento.descripcion" target="_blank" class="text-primary fw-bold text-decoration-none" style="font-size: 0.75rem;">
                        <i class="bi bi-link-45deg"></i> ABRIR ENLACE
                      </a>
                    </div>
                  </td>
                  <td class="text-center">
                    <span :class="['badge-category', `cat-${evento.categoria}`]">{{ evento.categoria.toUpperCase() }}</span>
                  </td>
                  <td class="text-center pe-3">
                    <span class="badge-status-sm bg-dark text-white">
                      {{ !evento.grupo ? 'TODOS' : (evento.subgrupo ? `${evento.grupo}-${evento.subgrupo}` : evento.grupo) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS (Solo Celular) -->
          <div class="d-md-none p-3 bg-light">
            <div v-for="evento in eventosPaginados" :key="'mob-'+evento.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">

              <div class="card-header bg-white border-bottom-0 pb-2 px-3 pt-3 d-flex flex-column gap-1">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small text-primary fw-bold font-monospace">{{ formatearFecha(evento.fecha_evento) }}</span>
                  <span :class="['badge-category', `cat-${evento.categoria}`]">{{ evento.categoria.toUpperCase() }}</span>
                </div>
                <div class="fw-bold text-dark fs-6 mt-1 lh-sm">
                  {{ evento.titulo }}
                </div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="bg-light p-2 rounded border small mb-3">
                  <p class="text-muted m-0" style="white-space: pre-line;">{{ evento.descripcion || 'Sin descripción' }}</p>
                  <div v-if="esLink(evento.descripcion)" class="mt-2">
                    <a :href="evento.descripcion" target="_blank" class="text-primary fw-bold text-decoration-none">
                      <span class="material-icons align-middle" style="font-size: 16px;">link</span> Abrir Enlace
                    </a>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="text-muted small">Alcance:</span>
                  <span class="badge-status-sm bg-dark text-white">
                    {{ !evento.grupo ? 'TODOS' : (evento.subgrupo ? `${evento.grupo}-${evento.subgrupo}` : evento.grupo) }}
                  </span>
                </div>

                <!-- Botones Acciones -->
                <div class="d-flex gap-2">
                  <button @click="cargarDatosEdicion(evento)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                    <span class="material-icons" style="font-size: 16px;">edit</span> EDITAR
                  </button>
                  <button @click="confirmarEliminacion(evento.id)" class="btn btn-sm btn-outline-danger flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                    <span class="material-icons" style="font-size: 16px;">delete</span> ELIMINAR
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- EMPTY STATE -->
          <div v-if="eventosPaginados.length === 0" class="text-center p-4 p-md-5 bg-white rounded shadow-sm border m-3">
            <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 48px;">event_busy</span>
            <p class="text-muted m-0 fw-bold">No se encontraron eventos.</p>
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

        </div>
      </div>
    </div>

    <!-- ==============================================
         MODAL FORMULARIO
         ============================================== -->
    <ModalBase
      :show="mostrarModal"
      @close="mostrarModal = false"
      :icono="modoEdicion ? 'edit' : 'notification_add'"
      :colorIcono="modoEdicion ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'"
      maxWidth="600px"
    >
      <template #header>
        <span class="fw-bold fs-5">{{ modoEdicion ? 'Editar Evento' : 'Nuevo Evento' }}</span>
      </template>

      <p class="text-muted small mb-4">Completá los datos para enviar el aviso a los árbitros.</p>

      <form id="formEvento" @submit.prevent="confirmarGuardado" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Tema del Evento *</label>
            <input v-model="form.titulo" type="text" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: Reunión general..." required>
          </div>

          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Lugar o Descripción *</label>
            <textarea v-model="form.descripcion" class="form-control shadow-none border-secondary-subtle" rows="3" placeholder="Ej: Link de Zoom..." required></textarea>
          </div>

          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">Fecha del Evento *</label>
            <input v-model="form.fecha_evento" type="date" class="form-control shadow-none border-secondary-subtle" required>
          </div>

          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">Categoría *</label>
            <select v-model="form.categoria" class="form-select shadow-none border-secondary-subtle">
              <option value="reunion">Reunión</option>
              <option value="recordatorio">Recordatorio</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div class="col-12">
            <hr class="my-2 border-secondary-subtle opacity-25">
          </div>

          <div class="col-12">
            <label class="small fw-bold text-danger mb-1">Alcance de Visibilidad</label>
            <select v-model="form.alcance" class="form-select shadow-none border-danger-subtle text-danger fw-bold" @change="limpiarAlcance">
              <option value="general">Para Todos los Árbitros</option>
              <option value="grupo">Solo a un Grupo / Subgrupo específico</option>
            </select>
          </div>

          <div v-if="form.alcance === 'grupo'" class="col-md-6 animate__animated animate__fadeIn">
            <label class="small fw-bold text-dark mb-1">Grupo *</label>
            <select v-model="form.grupo" class="form-select shadow-none border-secondary-subtle" required @change="form.subgrupo = ''">
              <option value="" disabled>Elegir grupo...</option>
              <option v-for="g in gruposOficiales" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <div v-if="form.alcance === 'grupo' && form.grupo === '3'" class="col-md-6 animate__animated animate__fadeIn">
            <label class="small fw-bold text-dark mb-1">Subgrupo (Opcional)</label>
            <select v-model="form.subgrupo" class="form-select shadow-none border-secondary-subtle">
              <option value="">Todo el Grupo 3</option>
              <option value="A">A</option><option value="B">B</option><option value="C">C</option>
            </select>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formEvento" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : (modoEdicion ? 'GUARDAR CAMBIOS' : 'PUBLICAR EVENTO') }}
        </button>
      </template>

    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed, watch } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Gestión de Eventos | AAAB',
  meta: [{ name: 'description', content: 'Administración de eventos y avisos.' }],
})

const notificar = inject('notificar');
const procesando = ref(false);
const gruposOficiales = ['Pre Liga', 'LH', '1', '2', '3', '4', 'SR'];

const formBase = { id: null, titulo: '', descripcion: '', fecha_evento: '', alcance: 'general', grupo: '', subgrupo: '', categoria: 'reunion' };
const form = reactive({ ...formBase });
const listaEventos = ref([]);

// MODAL CONTROLS
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const mostrarFiltrosMobile = ref(false);

// FILTROS TIPO COLUMNA
const filtros = reactive({
  busqueda: '',
  fecha: '',
  categoria: '',
  grupo: ''
});

// VARIABLES PARA PAGINACIÓN
const paginaActual = ref(1);
const registrosPorPagina = 8; // Vuelto a dejar en 8 fijos

// --- FUNCIÓN DE NORMALIZACIÓN ---
const normalizarTexto = (texto) => {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const eventosFiltrados = computed(() => {
  let resultado = listaEventos.value;

  resultado = resultado.filter(e => {
    // 1. Filtro general (Tema / Descripción)
    let matchBusqueda = true;
    if (filtros.busqueda) {
      const search = normalizarTexto(filtros.busqueda);
      matchBusqueda = normalizarTexto(e.titulo).includes(search) || normalizarTexto(e.descripcion).includes(search);
    }

    // 2. Filtro Fecha
    let matchFecha = true;
    if (filtros.fecha) {
      matchFecha = (e.fecha_evento || '').startsWith(filtros.fecha);
    }

    // 3. Filtro Categoría
    let matchCategoria = true;
    if (filtros.categoria) {
      matchCategoria = e.categoria === filtros.categoria;
    }

    // 4. Filtro Grupo
    let matchGrupo = true;
    if (filtros.grupo) {
      const searchG = normalizarTexto(filtros.grupo);
      const gr = normalizarTexto(e.grupo);
      const sub = normalizarTexto(e.subgrupo);
      matchGrupo = gr.includes(searchG) || sub.includes(searchG) || (gr+sub).includes(searchG) || (gr+"-"+sub).includes(searchG);
    }

    return matchBusqueda && matchFecha && matchCategoria && matchGrupo;
  });

  // 2. Obtenemos la fecha de HOY exacta en formato YYYY-MM-DD
  const fechaActual = new Date();
  const año = fechaActual.getFullYear();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  const hoyStr = `${año}-${mes}-${dia}`;

  // 3. Ordenamos el resultado
  return [...resultado].sort((a, b) => {
    const fechaA = (a.fecha_evento || '').substring(0, 10);
    const fechaB = (b.fecha_evento || '').substring(0, 10);

    const esPasadoA = fechaA < hoyStr;
    const esPasadoB = fechaB < hoyStr;

    if (esPasadoA && !esPasadoB) return 1;
    if (!esPasadoA && esPasadoB) return -1;

    if (!esPasadoA && !esPasadoB) {
      return fechaA.localeCompare(fechaB);
    }
    return fechaB.localeCompare(fechaA);
  });
});

const totalPaginas = computed(() => Math.ceil(eventosFiltrados.value.length / registrosPorPagina) || 1);

const eventosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return eventosFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

watch(filtros, () => {
  paginaActual.value = 1;
}, { deep: true });

watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) {
    paginaActual.value = nuevoTotal;
  }
});

// NUEVA FUNCIÓN: Cambiar página y scrollear arriba SOLO EN MOBILE
const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

const esLink = (texto) => {
  return texto && (texto.startsWith('http') || texto.includes('zoom.us') || texto.includes('meet.google'));
};

const limpiarAlcance = () => { form.grupo = ''; form.subgrupo = ''; };
const limpiarFiltrosTabla = () => {
  filtros.busqueda = ''; filtros.fecha = ''; filtros.categoria = ''; filtros.grupo = '';
};

const obtenerEventos = async () => {
  const res = await api.get({ entity: 'eventos', action: 'obtenerTodosLosEventos' });
  if (res.ok) listaEventos.value = res.payload;
};

// --- LOGICA DE MODAL ---
const abrirModalNuevo = () => {
  Object.assign(form, { ...formBase });
  modoEdicion.value = false;
  mostrarModal.value = true;
};

const cargarDatosEdicion = (evento) => {
    modoEdicion.value = true;
    Object.assign(form, {
        id: evento.id,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        fecha_evento: (evento.fecha_evento || '').substring(0, 10),
        alcance: evento.grupo ? 'grupo' : 'general',
        grupo: evento.grupo || '',
        subgrupo: evento.subgrupo || '',
        categoria: evento.categoria || 'reunion'
    });
    mostrarModal.value = true;
};

const guardarEvento = async () => {
  procesando.value = true;
  try {
    const action = modoEdicion.value ? 'editarEvento' : 'guardarEvento';
    const res = await api.post({ entity: 'eventos', action: action, payload: { ...form } });
    if (res.ok) {
        mostrarModal.value = false;
        await obtenerEventos();
        notificar({ titulo: '¡Éxito!', mensaje: `El evento se ${modoEdicion.value ? 'actualizó' : 'publicó'} correctamente.`, tipo: 'success' });
    } else {
         notificar({ titulo: 'Error', mensaje: res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' });
    }
  } catch{
     notificar({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' });
  } finally { procesando.value = false; }
};

const confirmarGuardado = () => {
  const tituloStr = modoEdicion.value ? '¿Actualizar?' : '¿Publicar?';
  const mensajeStr = modoEdicion.value ? 'Se modificarán los datos del evento.' : 'Se enviará el aviso a los árbitros.';
  notificar({ titulo: tituloStr, mensaje: mensajeStr, tipo: 'success', alConfirmar: guardarEvento });
};

const confirmarEliminacion = (id) => {
  notificar({ titulo: '¿Eliminar Evento?', mensaje: 'Esta acción es irreversible y los árbitros dejarán de verlo.', tipo: 'danger', alConfirmar: () => eliminar(id) });
};

const eliminar = async (id) => {
  const res = await api.post({ entity: 'eventos', action: 'eliminarEvento', payload: { id } });
  if (res.ok) {
      obtenerEventos();
      notificar({ titulo: 'Eliminado', mensaje: 'El evento fue borrado.', tipo: 'success' });
  }
};

const formatearFecha = (f) => f ? f.substring(0, 10).split('-').reverse().join('/') : '';

onMounted(obtenerEventos);
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES
   ==================================================== */
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

/* ====================================================
   BADGES Y ETIQUETAS
   ==================================================== */
.badge-category {
  font-size: 0.65rem;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: 800;
  display: inline-block;
}
.cat-reunion { background: #e0f2fe; color: #0369a1; }
.cat-recordatorio { background: #fef9c3; color: #a16207; }
.cat-urgente { background: #fee2e2; color: #b91c1c; }

.badge-status-sm {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
}

/* ====================================================
   UTILIDADES
   ==================================================== */
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.animate__animated { animation-duration: 0.5s; }

</style>
