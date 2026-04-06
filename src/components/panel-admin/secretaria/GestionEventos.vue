<template>
  <div class="container-fluid py-2 py-md-3 animate__animated animate__fadeIn">
    <div class="row g-2 g-md-3">
      
      <!-- FORMULARIO DE NUEVO/EDITAR EVENTO -->
      <div class="col-12 col-lg-3 order-1">
        <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
          <div class="card-header bg-danger text-white py-2 border-0 d-flex justify-content-between align-items-center">
            <h6 class="mb-0 fw-bold text-uppercase" style="letter-spacing: 0.5px; font-size: 0.9rem;">
              <i :class="modoEdicion ? 'bi-pencil-fill' : 'bi-plus-circle-fill'" class="bi me-1"></i>
              {{ modoEdicion ? 'Editar Evento' : 'Nuevo Evento' }}
            </h6>
            <button v-if="modoEdicion" @click="cancelarEdicion" class="btn btn-sm btn-link text-white p-0 text-decoration-none" title="Cancelar edición">
                <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="card-body p-2 p-md-3">
            <form @submit.prevent="confirmarGuardado">
              <div class="mb-2">
                <label class="form-label small fw-bold text-dark mb-1" style="font-size: 0.75rem;">Tema del Evento</label>
                <input v-model="form.titulo" type="text" class="form-control form-control-sm rounded-2 border-light-subtle shadow-none custom-input" placeholder="Ej: Sanciones..." required>
              </div>
              
              <div class="mb-2">
                <label class="form-label small fw-bold text-dark mb-1" style="font-size: 0.75rem;">Lugar / Descripción</label>
                <textarea v-model="form.descripcion" class="form-control form-control-sm rounded-2 border-light-subtle shadow-none" rows="2" placeholder="Ej: Lugar de la reunión..."></textarea>
              </div>

              <div class="row g-1">
                <div class="col-12 col-sm-6 mb-2">
                  <label class="form-label small fw-bold text-dark mb-1" style="font-size: 0.75rem;">Fecha</label>
                  <input v-model="form.fecha_evento" type="date" class="form-control form-control-sm rounded-2 border-light-subtle shadow-none" required>
                </div>
                <div class="col-12 col-sm-6 mb-2">
                  <label class="form-label small fw-bold text-dark mb-1" style="font-size: 0.75rem;">Categoría</label>
                  <select v-model="form.categoria" class="form-select form-select-sm rounded-2 border-light-subtle shadow-none">
                    <option value="reunion">Reunión</option>
                    <option value="recordatorio">Recordatorio</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <hr class="my-2 opacity-25">

              <div class="mb-2">
                <label class="form-label fw-bold text-danger text-uppercase mb-1" style="font-size: 0.65rem;">Alcance de Visibilidad</label>
                <select v-model="form.alcance" class="form-select form-select-sm rounded-2 border-light-subtle shadow-none" @change="limpiarFiltros">
                  <option value="general">Todos los Árbitros</option>
                  <option value="grupo">Por Grupo / Subgrupo</option>
                </select>
              </div>

              <div v-if="form.alcance === 'grupo'" class="animate__animated animate__fadeInUp animate__faster">
                <div class="mb-2">
                  <label class="form-label small fw-bold text-dark mb-1" style="font-size: 0.75rem;">Grupo Destinatario</label>
                  <select v-model="form.grupo" class="form-select form-select-sm rounded-2 border-light-subtle shadow-none" required @change="form.subgrupo = ''">
                    <option value="" disabled>Elegir grupo...</option>
                    <option v-for="g in gruposOficiales" :key="g" :value="g">{{ g }}</option>
                  </select>
                </div>
                <div v-if="form.grupo === '3'" class="mb-2 animate__animated animate__fadeIn">
                  <label class="form-label small fw-bold text-dark mb-1" style="font-size: 0.75rem;">Subgrupo (Opcional)</label>
                  <select v-model="form.subgrupo" class="form-select form-select-sm rounded-2 border-light-subtle shadow-none">
                    <option value="">Todo el Grupo 3</option>
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option>
                  </select>
                </div>
              </div>

              <button type="submit" class="btn btn-danger btn-sm w-100 rounded-pill fw-bold py-2 mt-1 shadow-sm border-0 btn-publish" :disabled="procesando" style="font-size: 0.8rem;">
                <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
                {{ procesando ? 'GUARDANDO...' : (modoEdicion ? 'ACTUALIZAR EVENTO' : 'PUBLICAR EVENTO') }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- HISTORIAL DE EVENTOS -->
      <div class="col-12 col-lg-9 order-2">
        <div class="card shadow-sm border-0 rounded-3 h-100 d-flex flex-column overflow-hidden">
          <div class="card-header bg-white py-2">
            <div class="row align-items-center g-2">
              <div class="col-12 col-md-3 text-center text-md-start">
                <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-calendar-event me-2"></i>Historial</h6>
              </div>
              <div class="col-12 col-md-9 d-flex gap-2">
                <div class="input-group input-group-sm flex-grow-1">
                  <span class="input-group-text bg-light border-0 rounded-start-pill ps-3"><i class="bi bi-search"></i></span>
                  <input v-model="filtroBusqueda" type="text" class="form-control bg-light border-0 rounded-end-pill shadow-none py-1 text-sm" placeholder="Buscar evento o grupo...">
                </div>
                <button @click="obtenerEventos" class="btn btn-light btn-sm rounded-circle shadow-sm px-2"><i class="bi bi-arrow-clockwise"></i></button>
              </div>
            </div>
          </div>
          
          <div class="card-body p-0 flex-grow-1 bg-white">
            <div class="table-responsive">
  <table class="table table-hover table-sm align-middle mb-0">
    <thead>
      <tr class="bg-light text-dark">
        <th class="py-2 small text-uppercase text-center" style="width: 80px; font-size: 0.75rem;">Fecha</th>
        <!-- AMPLIAMOS TEMA (ej: 40%) -->
        <th class="py-2 small text-uppercase text-start ps-3" style="width: 40%; font-size: 0.75rem;">Tema</th>
        <!-- ACHICAMOS DESCRIPCIÓN (ej: 20%) -->
        <th class="py-2 small text-uppercase text-start" style="width: 20%; font-size: 0.75rem;">Lugar / Descripción</th>
        <th class="py-2 small text-uppercase text-center" style="width: 120px; font-size: 0.75rem;">Grupo</th>
        <th class="py-2 small text-uppercase text-center" style="width: 90px; font-size: 0.75rem;">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="evento in eventosPaginados" :key="evento.id" class="border-bottom border-light" style="font-size: 0.85rem;">
        <td class="fw-bold text-dark text-center">{{ formatearFecha(evento.fecha_evento) }}</td>
        
        <td class="text-start ps-3">
          <!-- Aumentamos el max-width del tema para que use el nuevo espacio -->
          <div class="fw-bold mb-1 text-dark text-truncate" style="max-width: 400px;">{{ evento.titulo }}</div>
          <span :class="['badge-category', `cat-${evento.categoria}`]">
            {{ evento.categoria }}
          </span>
        </td>

        <td class="text-start text-muted">
            <!-- Achicamos el max-width de la descripción -->
            <div class="text-truncate" style="max-width: 180px; font-size: 0.8rem;" :title="evento.descripcion">
                 {{ evento.descripcion || '-' }}
            </div>
            <div v-if="esLink(evento.descripcion)" class="mt-1">
            <a :href="evento.descripcion" target="_blank" class="text-danger extra-small fw-bold text-decoration-none">
              <i class="bi bi-link-45deg"></i> ENLACE
            </a>
          </div>
        </td>

        <td class="text-center">
          <span :class="['badge rounded-pill badge-responsive', !evento.grupo ? 'bg-dark' : 'bg-danger-subtle text-danger border border-danger-subtle']">
            {{ !evento.grupo ? 'TODOS' : (evento.subgrupo ? `${evento.grupo}-${evento.subgrupo}` : evento.grupo) }}
          </span>
        </td>

        <td class="text-center">
          <div class="d-flex justify-content-center gap-1">
              <button @click="cargarDatosEdicion(evento)" class="btn btn-outline-primary btn-sm border-0 rounded-circle p-1" title="Editar">
                <i class="bi bi-pencil-fill" style="font-size: 0.8rem;"></i>
              </button>
              <button @click="confirmarEliminacion(evento.id)" class="btn btn-outline-danger btn-sm border-0 rounded-circle p-1" title="Eliminar">
                <i class="bi bi-trash3-fill" style="font-size: 0.8rem;"></i>
              </button>
          </div>
        </td>
      </tr>
      <tr v-if="eventosPaginados.length === 0">
        <td colspan="5" class="py-4 text-muted text-center">
          <i class="bi bi-info-circle d-block fs-3 mb-2"></i>
          <span style="font-size: 0.85rem;">No se encontraron eventos.</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
          </div>
        </div>

        <!-- PAGINACIÓN POR FUERA DE LA TARJETA BLANCA (Mismo estilo) -->
        <div class="paginacion">
          <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
          <span class="paginacion-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
          <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas || totalPaginas === 0">Siguiente</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, inject, computed, watch } from 'vue';
import { api } from '@/api/api';

const notificar = inject('notificar');
const procesando = ref(false);
const filtroBusqueda = ref('');
const gruposOficiales = ['Pre Liga', 'LH', '1', '2', '3', '4', 'SR'];

const formBase = { id: null, titulo: '', descripcion: '', fecha_evento: '', alcance: 'general', grupo: '', subgrupo: '', categoria: 'reunion' };
const form = reactive({ ...formBase });
const listaEventos = ref([]);
const modoEdicion = ref(false);

// VARIABLES PARA PAGINACIÓN
const paginaActual = ref(1);
const registrosPorPagina = 10; // Aumentado al achicar filas

// --- FUNCIÓN DE NORMALIZACIÓN ---
const normalizarTexto = (texto) => {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const eventosFiltrados = computed(() => {
  let resultado = listaEventos.value;

  // 1. Aplicamos el filtro de búsqueda normalizado
  if (filtroBusqueda.value) {
    const search = normalizarTexto(filtroBusqueda.value);
    
    resultado = resultado.filter(e => {
      const titulo = normalizarTexto(e.titulo);
      const descripcion = normalizarTexto(e.descripcion); // Agregamos busqueda en descripcion
      const grupo = normalizarTexto(e.grupo);
      const subgrupo = normalizarTexto(e.subgrupo);
      
      const grupoCompleto = grupo + subgrupo; // "3a"
      const grupoConGuion = grupo + "-" + subgrupo; // "3-a"
      
      return titulo.includes(search) || 
             descripcion.includes(search) ||
             grupo.includes(search) || 
             subgrupo.includes(search) || 
             grupoCompleto.includes(search) || 
             grupoConGuion.includes(search);
    });
  }

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

// COMPUTADOS DE PAGINACIÓN
const totalPaginas = computed(() => Math.ceil(eventosFiltrados.value.length / registrosPorPagina) || 1);

const eventosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return eventosFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

// WATCHERS DE PAGINACIÓN
watch(filtroBusqueda, () => {
  paginaActual.value = 1;
});

watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) {
    paginaActual.value = nuevoTotal;
  }
});

const esLink = (texto) => {
  return texto && (texto.startsWith('http') || texto.includes('zoom.us') || texto.includes('meet.google'));
};

const limpiarFiltros = () => { form.grupo = ''; form.subgrupo = ''; };

const obtenerEventos = async () => {
  const res = await api.get({ entity: 'eventos', action: 'obtenerTodosLosEventos' });
  if (res.ok) listaEventos.value = res.payload;
};

// --- LOGICA DE EDICION ---
const cargarDatosEdicion = (evento) => {
    modoEdicion.value = true;
    Object.assign(form, {
        id: evento.id,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        fecha_evento: (evento.fecha_evento || '').substring(0, 10), // Asegurar formato input date
        alcance: evento.grupo ? 'grupo' : 'general',
        grupo: evento.grupo || '',
        subgrupo: evento.subgrupo || '',
        categoria: evento.categoria || 'reunion'
    });
    // Scroll al top para moviles
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicion = () => {
    modoEdicion.value = false;
    Object.assign(form, { ...formBase });
};

const guardarEvento = async () => {
  procesando.value = true;
  try {
    const action = modoEdicion.value ? 'editarEvento' : 'guardarEvento'; // Asume que crearas editarEvento en el back
    const res = await api.post({ entity: 'eventos', action: action, payload: { ...form } });
    if (res.ok) {
        Object.assign(form, { ...formBase });
        modoEdicion.value = false;
        await obtenerEventos();
        notificar({ titulo: '¡Éxito!', mensaje: `El evento se ${modoEdicion.value ? 'actualizó' : 'publicó'} correctamente.`, tipo: 'success' });
    } else {
         notificar({ titulo: 'Error', mensaje: res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' });
    }
  } catch(error) {
     notificar({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' });
  } finally { procesando.value = false; }
};

const confirmarGuardado = () => {
  const tituloStr = modoEdicion.value ? '¿Actualizar?' : '¿Publicar?';
  const mensajeStr = modoEdicion.value ? 'Se modificarán los datos del evento.' : 'Se enviará el aviso a los árbitros.';
  notificar({ titulo: tituloStr, mensaje: mensajeStr, tipo: 'success', alConfirmar: guardarEvento });
};

const confirmarEliminacion = (id) => {
  notificar({ titulo: '¿Eliminar?', mensaje: 'Esta acción es irreversible.', tipo: 'danger', alConfirmar: () => eliminar(id) });
};

const eliminar = async (id) => {
  const res = await api.post({ entity: 'eventos', action: 'eliminarEvento', payload: { id } });
  if (res.ok) {
      obtenerEventos();
      // Si estaba editando el mismo que eliminó, reseteo
      if(form.id === id) cancelarEdicion();
  }
};

const formatearFecha = (f) => f ? f.substring(0, 10).split('-').reverse().join('/') : '';
onMounted(obtenerEventos);
</script>

<style scoped>
/* MOBILE FIRST BASE */
.custom-input { font-size: 14px !important; }
.text-sm { font-size: 0.85rem !important; }
.badge-responsive { font-size: 0.65rem; padding: 4px 8px; }
.extra-small { font-size: 0.6rem; }
.badge-category {
  font-size: 0.55rem;
  padding: 2px 5px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 800;
  display: inline-block;
}

/* MEDIA QUERIES */
@media (min-width: 768px) {
  .badge-responsive { font-size: 0.7rem; padding: 5px 10px; }
  .badge-category { font-size: 0.6rem; padding: 2px 6px; }
}

/* ESTILOS DE COLORES Y BOTONES */
.custom-input:focus, .form-control:focus, .form-select:focus {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.15) !important;
}

.btn-publish { background-color: #dc3545; transition: all 0.2s; }
.btn-publish:active { transform: scale(0.98); }

.cat-reunion { background: #e0f2fe; color: #0369a1; }
.cat-recordatorio { background: #fef9c3; color: #a16207; }
.cat-urgente { background: #fee2e2; color: #b91c1c; }

.bg-danger-subtle { background-color: #fce8e8 !important; }

.table-responsive::-webkit-scrollbar { display: none; }
.table-responsive { -ms-overflow-style: none; scrollbar-width: none; }

/* =========================================
   ESTILOS DE PAGINACIÓN EXACTOS AL OTRO ARCHIVO
   ========================================= */
.paginacion { 
  display: flex; 
  justify-content: flex-end; 
  align-items: center; 
  gap: 8px; 
  margin-top: 10px; 
  flex-wrap: wrap;
}

.btn-paginacion { 
  border: none; 
  background: #f8fafc; 
  color: #0f172a; 
  padding: 6px 12px; 
  border-radius: 6px; 
  font-weight: 700; 
  font-size: 0.8rem;
  cursor: pointer; 
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paginacion-texto { 
  color: white; 
  font-size: 0.8rem; 
}
</style>