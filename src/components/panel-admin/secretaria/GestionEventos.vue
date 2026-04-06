<template>
  <div class="container-fluid py-3 py-md-4 animate__animated animate__fadeIn">
    <div class="row g-3 g-md-4">
      
      <!-- FORMULARIO DE NUEVO EVENTO -->
      <div class="col-12 col-lg-4 order-1">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div class="card-header bg-danger text-white py-3 border-0">
            <h5 class="mb-0 fw-bold text-uppercase text-center text-lg-start" style="letter-spacing: 1px;">
              <i class="bi bi-plus-circle-fill me-2"></i>Nuevo Evento
            </h5>
          </div>
          <div class="card-body p-3 p-md-4">
            <form @submit.prevent="confirmarGuardado">
              <div class="mb-3">
                <label class="form-label small fw-bold text-dark">Tema del Evento</label>
                <input v-model="form.titulo" type="text" class="form-control form-control-lg rounded-3 border-light-subtle shadow-none custom-input fs-6" placeholder="Ej: Sanciones Disciplinarias.." required>
              </div>
              
              <div class="mb-3">
                <label class="form-label small fw-bold text-dark">Lugar / Descripción</label>
                <textarea v-model="form.descripcion" class="form-control rounded-3 border-light-subtle shadow-none fs-6" rows="2" placeholder="Ej: Lugar de la reunión.."></textarea>
              </div>

              <div class="row g-2">
                <div class="col-12 col-sm-6 mb-3">
                  <label class="form-label small fw-bold text-dark">Fecha</label>
                  <input v-model="form.fecha_evento" type="date" class="form-control rounded-3 border-light-subtle shadow-none" required>
                </div>
                <div class="col-12 col-sm-6 mb-3">
                  <label class="form-label small fw-bold text-dark">Categoría</label>
                  <select v-model="form.categoria" class="form-select rounded-3 border-light-subtle shadow-none">
                    <option value="reunion">Reunión</option>
                    <option value="recordatorio">Recordatorio</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <hr class="my-3 my-md-4 opacity-25">

              <div class="mb-3">
                <label class="form-label small fw-bold text-danger text-uppercase" style="font-size: 0.7rem;">Alcance de Visibilidad</label>
                <select v-model="form.alcance" class="form-select rounded-3 border-light-subtle shadow-none" @change="limpiarFiltros">
                  <option value="general">Todos los Árbitros</option>
                  <option value="grupo">Por Grupo / Subgrupo</option>
                </select>
              </div>

              <div v-if="form.alcance === 'grupo'" class="animate__animated animate__fadeInUp animate__faster">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-dark">Grupo Destinatario</label>
                  <select v-model="form.grupo" class="form-select rounded-3 border-light-subtle shadow-none" required @change="form.subgrupo = ''">
                    <option value="" disabled>Elegir grupo...</option>
                    <option v-for="g in gruposOficiales" :key="g" :value="g">{{ g }}</option>
                  </select>
                </div>
                <div v-if="form.grupo === '3'" class="mb-3 animate__animated animate__fadeIn">
                  <label class="form-label small fw-bold text-dark">Subgrupo (Opcional)</label>
                  <select v-model="form.subgrupo" class="form-select rounded-3 border-light-subtle shadow-none">
                    <option value="">Todo el Grupo 3</option>
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option>
                  </select>
                </div>
              </div>

              <button type="submit" class="btn btn-danger w-100 rounded-pill fw-bold py-3 mt-2 shadow-sm border-0 btn-publish" :disabled="procesando">
                <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
                {{ procesando ? 'PUBLICANDO...' : 'PUBLICAR EVENTO' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- HISTORIAL DE EVENTOS -->
      <div class="col-12 col-lg-8 order-2">
        <div class="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column overflow-hidden">
          <div class="card-header bg-white py-3">
            <div class="row align-items-center g-3">
              <div class="col-12 col-md-4 text-center text-md-start">
                <h5 class="mb-0 fw-bold text-dark"><i class="bi bi-calendar-event me-2"></i>Historial</h5>
              </div>
              <div class="col-12 col-md-8 d-flex gap-2">
                <div class="input-group input-group-sm flex-grow-1">
                  <span class="input-group-text bg-light border-0 rounded-start-pill ps-3"><i class="bi bi-search"></i></span>
                  <input v-model="filtroBusqueda" type="text" class="form-control bg-light border-0 rounded-end-pill shadow-none py-2" placeholder="Buscar evento o grupo...">
                </div>
                <button @click="obtenerEventos" class="btn btn-light btn-sm rounded-circle shadow-sm p-2"><i class="bi bi-arrow-clockwise fs-5"></i></button>
              </div>
            </div>
          </div>
          
          <div class="card-body p-0 flex-grow-1 bg-white">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 text-center">
                <thead>
                  <tr class="bg-light text-dark">
                    <th class="py-3 small text-uppercase d-none d-md-table-cell">Fecha</th>
                    <th class="py-3 small text-uppercase text-start ps-4">Detalle</th>
                    <th class="py-3 small text-uppercase">Alcance</th>
                    <th class="py-3 small text-uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="evento in eventosPaginados" :key="evento.id" class="border-bottom border-light">
                    <td class="fw-bold text-dark d-none d-md-table-cell">{{ formatearFecha(evento.fecha_evento) }}</td>
                    
                    <td class="text-start ps-3 ps-md-4">
                      <div class="d-md-none text-muted extra-small fw-bold mb-1">{{ formatearFecha(evento.fecha_evento) }}</div>
                      <div class="fw-bold mb-1 text-dark text-truncate" style="max-width: 200px;">{{ evento.titulo }}</div>
                      
                      <div v-if="esLink(evento.descripcion)" class="mb-1">
                        <a :href="evento.descripcion" target="_blank" class="text-danger extra-small fw-bold text-decoration-none">
                          <i class="bi bi-link-45deg"></i> VER ENLACE
                        </a>
                      </div>

                      <span :class="['badge-category', `cat-${evento.categoria}`]">
                        {{ evento.categoria }}
                      </span>
                    </td>

                    <td>
                      <span :class="['badge rounded-pill badge-responsive', !evento.grupo ? 'bg-dark' : 'bg-danger-subtle text-danger border border-danger-subtle']">
                        {{ !evento.grupo ? 'TODOS' : (evento.subgrupo ? `${evento.grupo}-${evento.subgrupo}` : evento.grupo) }}
                      </span>
                    </td>

                    <td>
                      <button @click="confirmarEliminacion(evento.id)" class="btn btn-outline-danger btn-sm border-0 rounded-pill btn-delete p-2">
                        <i class="bi bi-trash3-fill fs-6"></i>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="eventosPaginados.length === 0">
                    <td colspan="4" class="py-5 text-muted">
                      <i class="bi bi-info-circle d-block fs-2 mb-2"></i>
                      No se encontraron eventos.
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

const form = reactive({ titulo: '', descripcion: '', fecha_evento: '', alcance: 'general', grupo: '', subgrupo: '', categoria: 'reunion' });
const listaEventos = ref([]);

// VARIABLES PARA PAGINACIÓN
const paginaActual = ref(1);
const registrosPorPagina = 8;

// --- FUNCIÓN DE NORMALIZACIÓN ---
// Elimina tildes y convierte a minúsculas
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
      const grupo = normalizarTexto(e.grupo);
      const subgrupo = normalizarTexto(e.subgrupo);
      
      // Creamos una cadena combinada "3a" o "3-a" para que coincida con lo que escribas
      const grupoCompleto = grupo + subgrupo; // Ejemplo: "3a"
      const grupoConGuion = grupo + "-" + subgrupo; // Ejemplo: "3-a"
      
      return titulo.includes(search) || 
             grupo.includes(search) || 
             subgrupo.includes(search) || 
             grupoCompleto.includes(search) || 
             grupoConGuion.includes(search);
    });
  }

  // 2. Ordenamos el resultado por fecha (descendente)
  return [...resultado].sort((a, b) => {
    const fechaA = new Date(a.fecha_evento).getTime();
    const fechaB = new Date(b.fecha_evento).getTime();
    return fechaB - fechaA;
  });
});

// --- EL RESTO DEL CÓDIGO SE MANTIENE IGUAL ---

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

const guardarEvento = async () => {
  procesando.value = true;
  try {
    const res = await api.post({ entity: 'eventos', action: 'guardarEvento', payload: { ...form } });
    if (res.ok) {
        Object.assign(form, { titulo: '', descripcion: '', fecha_evento: '', alcance: 'general', grupo: '', subgrupo: '', categoria: 'reunion' });
        await obtenerEventos();
    }
  } finally { procesando.value = false; }
};

const confirmarGuardado = () => {
  notificar({ titulo: '¿Publicar?', mensaje: 'Se enviará el aviso a los árbitros.', tipo: 'success', alConfirmar: guardarEvento });
};

const confirmarEliminacion = (id) => {
  notificar({ titulo: '¿Eliminar?', mensaje: 'Esta acción es irreversible.', tipo: 'danger', alConfirmar: () => eliminar(id) });
};

const eliminar = async (id) => {
  const res = await api.post({ entity: 'eventos', action: 'eliminarEvento', payload: { id } });
  if (res.ok) obtenerEventos();
};

const formatearFecha = (f) => f.split('-').reverse().join('/');
onMounted(obtenerEventos);
</script>

<style scoped>
/* MOBILE FIRST BASE */
.custom-input { font-size: 16px !important; }
.badge-responsive { font-size: 0.65rem; padding: 5px 10px; }
.extra-small { font-size: 0.6rem; }
.badge-category {
  font-size: 0.55rem;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 800;
  display: inline-block;
}

/* MEDIA QUERIES */
@media (min-width: 768px) {
  .badge-responsive { font-size: 0.75rem; padding: 8px 15px; }
  .badge-category { font-size: 0.65rem; padding: 2px 8px; }
}

/* ESTILOS DE COLORES Y BOTONES */
.custom-input:focus {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.1) !important;
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
  gap: 12px; 
  margin-top: 15px; 
  flex-wrap: wrap;
}

.btn-paginacion { 
  border: none; 
  background: #f8fafc; 
  color: #0f172a; 
  padding: 8px 14px; 
  border-radius: 6px; 
  font-weight: 700; 
  cursor: pointer; 
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paginacion-texto { 
  color: white; 
  font-size: 0.85rem; 
}
</style>