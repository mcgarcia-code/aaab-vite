<template>
  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white rounded-4 overflow-hidden">

        <div class="header-section border-bottom p-3 p-md-4 shadow-none rounded-0 mb-0">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-megaphone me-1"></i> Gestión de Eventos
            </h4>
            <span class="counter mt-1 d-block">Total: {{ eventosFiltrados.length }} eventos</span>
          </div>

          <div class="header-actions">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue d-flex d-md-none" title="Mostrar Filtros">
              <span class="material-icons">filter_alt</span> <span class="btn-text">Filtros</span>
            </button>

            <button @click="limpiarFiltrosTabla" class="btn-action btn-clear" title="Limpiar Filtros">
              <span class="material-icons">filter_alt_off</span> <span class="btn-text">Limpiar</span>
            </button>

            <button @click="abrirModalNuevo" class="btn-action btn-clear-checks" title="Nuevo Evento">
              <span class="material-icons">add_alert</span> <span class="btn-text">Nuevo</span>
            </button>
          </div>
        </div>

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel d-block d-md-none animate__animated animate__fadeInDown animate__faster border-bottom bg-light p-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Eventos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-white border shadow-sm p-1">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>

          <div class="filter-grid-mobile">
            <div class="form-group-mobile full-width">
              <label>Tema o Descripción</label>
              <input v-model="filtros.busqueda" placeholder="Buscar palabra clave...">
            </div>
            <div class="form-group-mobile">
              <label>Fecha</label>
              <input type="date" v-model="filtros.fecha">
            </div>
            <div class="form-group-mobile">
              <label>Categoría</label>
              <select v-model="filtros.categoria">
                <option value="">Todas</option>
                <option value="reunion">Reunión</option>
                <option value="recordatorio">Recordatorio</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div class="form-group-mobile full-width">
              <label>Grupo</label>
              <input v-model="filtros.grupo" placeholder="Ej: Pre Liga, 3-A...">
            </div>
          </div>

          <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded-2 fw-bold border-0 shadow-sm">Aplicar Filtros</button>
        </div>

        <div class="card-body p-3 p-md-4">

          <div class="table-container shadow-sm d-none d-md-block">
            <table>
              <thead>
                <tr class="main-header">
                  <th class="sticky-col col-id text-center">Fecha</th>
                  <th class="sticky-col col-acciones text-center">Acciones</th>
                  <th class="col-tema">Tema del Evento</th>
                  <th class="col-desc">Lugar / Descripción</th>
                  <th class="text-center" style="width: 130px;">Categoría</th>
                  <th class="text-center" style="width: 150px;">Alcance / Grupo</th>
                </tr>
                <tr class="filter-row">
                  <td class="sticky-col col-id text-center">
                    <input type="date" v-model="filtros.fecha" class="filter-input text-center">
                  </td>
                  <td class="sticky-col col-acciones text-center">
                    <button @click="obtenerEventos" class="btn-refresh w-100" title="Recargar"><span class="material-icons" style="font-size: 16px;">refresh</span></button>
                  </td>
                  <td class="col-tema"><input v-model="filtros.busqueda" class="filter-input" placeholder="Buscar tema o lugar..."></td>
                  <td class="col-desc"></td>
                  <td>
                    <select v-model="filtros.categoria" class="filter-input text-center">
                      <option value="">TODAS</option>
                      <option value="reunion">REUNIÓN</option>
                      <option value="recordatorio">RECORDATORIO</option>
                      <option value="urgente">URGENTE</option>
                    </select>
                  </td>
                  <td><input v-model="filtros.grupo" class="filter-input text-center" placeholder="Buscar grupo.."></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="evento in eventosPaginados" :key="evento.id">
                  <td class="sticky-col col-id cell-ro text-center fw-bold">{{ formatearFecha(evento.fecha_evento) }}</td>
                  <td class="sticky-col col-acciones cell-ro text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="cargarDatosEdicion(evento)" class="btn-editar" title="Editar Evento">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="confirmarEliminacion(evento.id)" class="btn-eliminar" title="Eliminar Evento">
                        <span class="material-icons" style="font-size:16px;">delete</span>
                      </button>
                    </div>
                  </td>
                  <td class="cell-ro col-tema fw-bold">{{ evento.titulo }}</td>
                  <td class="cell-ro col-desc text-muted">
                    {{ evento.descripcion || '-' }}
                    <div v-if="esLink(evento.descripcion)" class="mt-1">
                      <a :href="evento.descripcion" target="_blank" class="text-primary fw-bold text-decoration-none small">
                        <i class="bi bi-link-45deg"></i> ABRIR ENLACE
                      </a>
                    </div>
                  </td>
                  <td class="text-center cell-ro">
                    <span :class="['badge-category', `cat-${evento.categoria}`]">{{ evento.categoria }}</span>
                  </td>
                  <td class="text-center cell-ro">
                    <span class="badge-status-sm bg-dark text-white">
                      {{ !evento.grupo ? 'TODOS' : (evento.subgrupo ? `${evento.grupo}-${evento.subgrupo}` : evento.grupo) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="eventosPaginados.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted bg-light italic">No se encontraron eventos.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-block d-md-none mt-3">
            <div v-for="evento in eventosPaginados" :key="'mob-'+evento.id" class="card-arbitro">
              <div class="card-header border-bottom mb-2 pb-2">
                <div class="card-name fw-bold text-dark">
                  {{ evento.titulo }}
                </div>
                <div class="small text-primary fw-bold">{{ formatearFecha(evento.fecha_evento) }}</div>
              </div>

              <div class="card-body p-0">
                <div class="mb-2 d-flex align-items-center flex-wrap gap-2">
                  <span :class="['badge-category', `cat-${evento.categoria}`]">{{ evento.categoria }}</span>
                  <span class="badge-status-sm bg-dark text-white">
                    Alcance: {{ !evento.grupo ? 'TODOS' : (evento.subgrupo ? `${evento.grupo}-${evento.subgrupo}` : evento.grupo) }}
                  </span>
                </div>

                <div class="card-info mt-2">
                  <p class="text-muted small mb-0" style="white-space: pre-line;">{{ evento.descripcion || 'Sin descripción' }}</p>
                  <div v-if="esLink(evento.descripcion)" class="mt-2">
                    <a :href="evento.descripcion" target="_blank" class="text-primary fw-bold text-decoration-none small">
                      <span class="material-icons align-middle" style="font-size: 16px;">link</span> Abrir Enlace
                    </a>
                  </div>
                </div>

                <div class="d-flex gap-2 mt-3 pt-2 border-top">
                  <button @click="cargarDatosEdicion(evento)" class="btn-editar-mobile flex-grow-1">
                    <span class="material-icons" style="font-size: 18px;">edit</span> Editar
                  </button>
                  <button @click="confirmarEliminacion(evento.id)" class="btn-eliminar-mobile flex-grow-1">
                    <span class="material-icons" style="font-size: 18px;">delete</span> Eliminar
                  </button>
                </div>
              </div>
            </div>

            <div v-if="eventosPaginados.length === 0" class="text-center p-4 bg-white rounded-3 border mt-2 shadow-sm">
              <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
              <p class="text-muted mt-2 mb-0 fw-bold">No se encontraron eventos.</p>
            </div>
          </div>

          <div class="d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>

        </div>
      </div>
    </div>

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

      <p class="text-small mb-4">Completá los datos para enviar el aviso a los árbitros.</p>

      <form id="formEvento" @submit.prevent="confirmarGuardado" class="text-start">
        <div class="row g-3">
          <div class="col-12">
            <label class="small fw-bold text-dark">Tema del Evento *</label>
            <input v-model="form.titulo" type="text" class="form-control shadow-none border-secondary-subtle" placeholder="Ej: Reunión general..." required>
          </div>

          <div class="col-12">
            <label class="small fw-bold text-dark">Lugar o Descripción *</label>
            <textarea v-model="form.descripcion" class="form-control shadow-none border-secondary-subtle" rows="3" placeholder="Ej: Link de Zoom..." required></textarea>
          </div>

          <div class="col-md-6">
            <label class="small fw-bold text-dark">Fecha del Evento *</label>
            <input v-model="form.fecha_evento" type="date" class="form-control shadow-none border-secondary-subtle" required>
          </div>

          <div class="col-md-6">
            <label class="small fw-bold text-dark">Categoría *</label>
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
            <label class="small fw-bold text-danger">Alcance de Visibilidad</label>
            <select v-model="form.alcance" class="form-select shadow-none border-danger-subtle" @change="limpiarAlcance">
              <option value="general">Para Todos los Árbitros</option>
              <option value="grupo">Solo a un Grupo / Subgrupo específico</option>
            </select>
          </div>

          <div v-if="form.alcance === 'grupo'" class="col-md-6 animate__animated animate__fadeIn">
            <label class="small fw-bold text-dark">Grupo *</label>
            <select v-model="form.grupo" class="form-select shadow-none border-secondary-subtle" required @change="form.subgrupo = ''">
              <option value="" disabled>Elegir grupo...</option>
              <option v-for="g in gruposOficiales" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <div v-if="form.alcance === 'grupo' && form.grupo === '3'" class="col-md-6 animate__animated animate__fadeIn">
            <label class="small fw-bold text-dark">Subgrupo (Opcional)</label>
            <select v-model="form.subgrupo" class="form-select shadow-none border-secondary-subtle">
              <option value="">Todo el Grupo 3</option>
              <option value="A">A</option><option value="B">B</option><option value="C">C</option>
            </select>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="w-100 d-flex justify-content-center gap-3">
          <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border">CANCELAR</button>

          <button type="submit" form="formEvento" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" :disabled="procesando">
            <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
            {{ procesando ? 'GUARDANDO...' : (modoEdicion ? 'GUARDAR CAMBIOS' : 'PUBLICAR EVENTO') }}
          </button>
        </div>
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
   1. BASE (MOBILE FIRST - CELULARES POR DEFECTO)
   ==================================================== */

/* Contenedor principal exacto como lo solicitaste */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 120px;
}

/* Ajuste de padding exclusivo para celulares */
@media (max-width: 767px) {
  .full-screen-wrapper { padding: 0 15px 20px 15px !important; box-sizing: border-box !important; }
}

/* Estilos de estructura base (Celulares) */
.admin-panel {
  width: 100%;
  max-width: 100%;
  padding: 0;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 0;
  box-sizing: border-box;
}

/* Cabecera Móvil */
.header-section {
  background: white;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 15px;
  border-left: 5px solid #ef4444;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.header-info { display: flex; flex-direction: column; align-items: flex-start; width: 100%; }
.title { font-size: 1.25rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #000000; }

/* Botones Móvil (42x42 centrados) */
.header-actions { width: 100%; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.btn-action {
  border: none; border-radius: 6px; font-weight: bold; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s, transform 0.1s;
  flex: none; width: 42px; height: 42px; padding: 0;
}
.btn-action:hover { opacity: 0.85; }
.btn-action:active { transform: scale(0.95); }
.btn-text { display: none; } /* Oculto en móvil */

.btn-clear { background: #e2e8f0; color: #000; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; }
.btn-blue { background: #3b82f6; color: white; }

/* Visibilidad de Capas Base */
.desktop-only { display: none; }
.mobile-only { display: block; }
.mobile-only-flex { display: flex; }

/* Filtros Móvil */
.mobile-filter-panel { background: #e2e8f0; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 0; }
.form-group-mobile { display: flex; flex-direction: column; gap: 4px; }
.form-group-mobile.full-width { grid-column: span 1; }
.form-group-mobile label { font-size: 0.75rem; font-weight: 700; color: #000000; }
.form-group-mobile input, .form-group-mobile select {
  padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px;
  font-size: 12px; width: 100%; outline: none; background: #ffffff; color: #334155;
}
.form-group-mobile input:focus, .form-group-mobile select:focus { border-color: #3b82f6; background: white; }


/* Tarjetas Móviles (Listado) */
.card-arbitro { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px; }
.card-name { font-size: 1.05rem; color: #0f172a; }
.btn-editar-mobile { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; }
.btn-eliminar-mobile { background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; font-weight: bold;}

/* Badges */
.badge-category { font-size: 0.65rem; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; font-weight: 800; display: inline-block; }
.cat-reunion { background: #e0f2fe; color: #0369a1; }
.cat-recordatorio { background: #fef9c3; color: #a16207; }
.cat-urgente { background: #fee2e2; color: #b91c1c; }
.badge-status-sm { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 700; }

/* Modal Móvil (Colores de icono delegados desde el template) */
.bg-success-light { background: #dcfce7; color: #166534; }
.bg-info-light { background: #e0f2fe; color: #0369a1; }

/* Utilitarios compartidos */
.btn-editar, .btn-eliminar { display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; padding: 4px 8px; cursor: pointer; transition: 0.2s; border: none; }
.btn-editar { background: #eff6ff; color: #1d4ed8; }
.btn-editar:hover { background: #dbeafe; }
.btn-eliminar { background: #fee2e2; color: #dc2626; }
.btn-eliminar:hover { background: #fecaca; }
.btn-refresh { background: none; border: none; color: #64748b; cursor: pointer; }
.animate__animated { animation-duration: 0.5s; }


/* ====================================================
   2. TABLETS Y ESCRITORIO (Desde 768px hacia arriba)
   ==================================================== */
@media (min-width: 768px) {

  /* Expansión del contenedor principal */
  .admin-panel { padding: 20px; border-radius: 12px; }

  /* Cambio de visibilidad */
  .desktop-only { display: block; }
  .mobile-only { display: none; }
  .mobile-only-flex { display: none; }

  /* Reestructuración Cabecera */
  .header-section { flex-direction: row; align-items: center; justify-content: space-between; border-radius: 8px; padding: 15px 25px; }
  .header-info { width: auto; align-items: flex-start; }
  .title { font-size: 1.1rem; }

  /* Reestructuración Botones */
  .header-actions { width: auto; justify-content: flex-end; flex-wrap: nowrap; gap: 8px; }
  .btn-action { width: auto; height: auto; padding: 8px 12px; gap: 5px; font-size: 0.75rem; }
  .btn-text { display: inline; }

  /* Filtros a 2 columnas */
  .filter-grid-mobile { grid-template-columns: 1fr 1fr; }
  .form-group-mobile.full-width { grid-column: span 2; }

  /* TABLA DESKTOP (Aparece en vez de las tarjetas) */
  .table-container {
    width: 100%; overflow: auto; max-height: calc(100vh - 220px);
    background: white; border-radius: 8px; border: 1px solid #e2e8f0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }

  thead tr.main-header th {
    position: sticky; top: 0; z-index: 50; background: #e2e8f0 !important;
    padding: 12px 8px; border-bottom: 1px solid #cbd5e1;
    font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0;
  }
  thead tr.filter-row td {
    position: sticky; top: 41px; z-index: 40; background: #f1F5F9 !important;
    padding: 6px 8px 10px 8px; border-bottom: 2px solid #cbd5e1; margin: 0;
  }

  .col-id { left: 0; width: 100px; text-align: center; }
  .col-acciones { left: 100px; width: 90px; }
  .col-tema { min-width: 180px; max-width: 250px; white-space: normal !important; word-wrap: break-word; }
  .col-desc { min-width: 180px; max-width: 300px; white-space: normal !important; word-wrap: break-word; }

  .sticky-col { position: sticky !important; background: white !important; border-right: 1px solid #e2e8f0; }
  thead tr.main-header th.sticky-col { z-index: 60 !important; background-color: #e2e8f0 !important; }
  thead tr.filter-row td.sticky-col { z-index: 55 !important; background-color: #f1f5f9 !important; }
  tbody td.sticky-col { z-index: 30 !important; }

  .cell-ro { padding: 10px 8px; font-size: 0.85rem; color: inherit; border-bottom: 1px solid #f1f5f9; }
  .filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; outline: none;}
}

/* ====================================================
   3. PANTALLAS GRANDES (Desde 1024px hacia arriba)
   ==================================================== */
@media (min-width: 1024px) {
  /* Si en el futuro querés darle más aire o restringir anchos en monitores muy grandes, va acá */
}
</style>
