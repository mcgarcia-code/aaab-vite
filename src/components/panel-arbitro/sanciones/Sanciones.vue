<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 w-100 mx-auto" style="border-radius: 15px; overflow: hidden; margin-bottom: 1.5rem;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <span class="material-icons" style="transform: rotate(-15deg);">gavel</span> Mis Sanciones
          </h4>
          <p class="text-muted small m-0 mt-1">Total: {{ sancionesFiltradas.length }} resoluciones en tu legajo</p>
        </div>

        <div class="d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
          <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action d-flex d-md-none shadow-sm rounded border-0 p-2 align-items-center justify-content-center text-white" style="background-color: #3b82f6;">
            <span class="material-icons" style="font-size: 20px;">filter_alt</span>
          </button>
          <button @click="limpiarFiltros" class="btn-clear d-none d-md-flex bg-light rounded shadow-sm border p-2 align-items-center justify-content-center gap-2" title="Limpiar Filtros" style="background-color: #f8fafc !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
            <span class="material-icons" style="font-size: 22px; color: #64748b;">filter_alt_off</span>
            <span class="fw-bold text-secondary" style="font-size: 0.8rem;">Limpiar Filtros</span>
          </button>
          <button @click="obtenerSancionesLocales" class="btn-refresh bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center" title="Actualizar" style="background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
            <span class="material-icons" style="font-size: 22px; color: #0f172a;">refresh</span>
          </button>
        </div>
      </div>

      <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel d-md-none animate__animated animate__fadeInDown animate__faster shadow-sm border-bottom p-3" style="background-color: #f8fafc; margin-bottom: 0; border-radius: 0;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="small fw-bold text-muted text-uppercase">Filtrar Sanciones</span>
          <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1 shadow-sm" style="line-height: 1; background: white;">
            <span class="material-icons" style="font-size: 20px;">close</span>
          </button>
        </div>
        <div class="filter-grid-mobile">
          <select v-model="filtros.estado" class="full-width">
            <option value="">Estado (Todos)</option>
            <option value="vigente">Vigente</option>
            <option value="cumplida">Cumplida</option>
            <option value="en_proceso">En Proceso</option>
            <option value="anulada">Anulada</option>
          </select>
          <input v-model="filtros.sancion" placeholder="Buscar Sanción...">
          <input v-model="filtros.motivo_articulo" placeholder="Motivo / Art...">
          <input type="text" v-model="filtros.desde" placeholder="Desde (DD/MM/AAAA)">
          <input type="text" v-model="filtros.hasta" placeholder="Hasta (DD/MM/AAAA)">
        </div>
        <div class="mt-3">
          <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 fw-bold border-0 py-2 shadow-sm" style="background-color: #3b82f6;">Aplicar Filtros</button>
        </div>
      </div>

      <div class="card-body bg-white p-3 p-md-4">
        <div v-if="cargando" class="text-center text-white my-5">
          <div class="spinner-border text-danger" role="status"></div>
          <p class="mt-2 text-muted">Buscando en legajo...</p>
        </div>
        <div v-else-if="sancionesFiltradas.length === 0" class="text-center p-5 rounded border bg-light shadow-sm">
          <span class="material-icons text-success" style="font-size: 60px;">verified</span>
          <h5 class="fw-bold text-dark mt-3">Sin resultados</h5>
          <p class="text-muted small m-0">No se encontraron medidas disciplinarias con los filtros aplicados.</p>
        </div>
        <div v-else>
          <div class="table-container shadow-sm d-none d-md-block border" style="border-radius: 8px;">
            <table>
              <thead>
                <tr class="main-header">
                  <th class="sticky-col col-id text-center" style="width: 130px;">Estado</th>
                  <th class="text-center" style="width: 160px;">Acción</th>
                  <th style="width: 160px;">Sanción</th>
                  <th>Motivo / Art.</th>
                  <th class="text-center" style="width: 140px;">Desde</th>
                  <th class="text-center" style="width: 140px;">Hasta</th>
                </tr>
                <tr class="filter-row">
                  <td class="sticky-col col-id text-center">
                    <select v-model="filtros.estado" class="filter-input text-center shadow-none w-100">
                      <option value="">TODOS</option>
                      <option value="vigente">VIGENTE</option>
                      <option value="cumplida">CUMPLIDA</option>
                      <option value="en_proceso">EN PROCESO</option>
                      <option value="anulada">ANULADA</option>
                    </select>
                  </td>
                  <td></td>
                  <td><input v-model="filtros.sancion" class="filter-input shadow-none w-100" placeholder="Filtrar.."></td>
                  <td><input v-model="filtros.motivo_articulo" class="filter-input shadow-none w-100" placeholder="Filtrar.."></td>
                  <td><input v-model="filtros.desde" class="filter-input text-center shadow-none w-100" placeholder="DD/MM/AAAA"></td>
                  <td><input v-model="filtros.hasta" class="filter-input text-center shadow-none w-100" placeholder="DD/MM/AAAA"></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sancionesPaginadas" :key="s.id">
                  <td class="sticky-col col-id text-center cell-ro">
                    <span :class="obtenerClaseEstado(s.estado_dinamico)">
                      {{ obtenerTextoEstado(s.estado_dinamico) }}
                    </span>
                  </td>
                  <td class="text-center cell-ro">
                    <div class="d-flex flex-column gap-2 align-items-center">
                      <button @click="abrirDescargo(s)" class="btn btn-sm fw-bold position-relative w-100" :class="s.estado_dinamico == 3 ? (s.tiene_nuevos ? 'btn-primary text-white' : 'btn-outline-primary') : 'btn-outline-secondary'">
                        <i class="bi" :class="s.estado_dinamico == 3 ? 'bi-chat-text' : 'bi-clock-history'"></i>
                        {{ s.estado_dinamico == 3 ? 'Descargo' : 'Historial' }}
                        <span v-if="s.tiene_nuevos && s.estado_dinamico == 3" class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                          <span class="visually-hidden">Mensajes nuevos</span>
                        </span>
                      </button>

                      <button v-if="s.estado_dinamico == 1" @click="abrirApelar(s)" class="btn btn-sm btn-danger fw-bold w-100 text-white">
                        APELAR A CD
                      </button>
                    </div>
                  </td>
                  <td class="cell-ro">
                    <span :class="obtenerClaseTextoSancion(s.estado_dinamico)">{{ s.sancion }}</span>
                  </td>
                  <td class="cell-ro text-wrap" style="min-width: 250px;">
                    <span class="fw-bold text-dark" v-if="s.articulo">Art. {{ s.articulo }} - </span>
                    <span class="text-muted">{{ s.motivo }}</span>
                  </td>
                  <td class="text-center cell-ro fw-bold text-dark">{{ s.desde_formateada || '-' }}</td>
                  <td class="text-center cell-ro fw-bold" :class="s.estado_dinamico == 3 ? 'text-muted' : 'text-danger'">
                    <span v-if="s.es_indefinido == 1">Indefinido</span>
                    <span v-else>{{ s.hasta_formateada || '-' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-md-none mt-3">
            <div v-for="s in sancionesPaginadas" :key="'mob-'+s.id" class="card-licencia shadow-sm border mb-3">
              <div class="card-header border-bottom-0 pb-2 px-3 pt-3 bg-white">
                <div class="d-flex justify-content-between align-items-center gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <span :class="obtenerClaseTextoSancion(s.estado_dinamico)" style="font-size: 1.1rem;">
                      {{ s.sancion }}
                    </span>
                    <span :class="obtenerClaseEstado(s.estado_dinamico, true)" style="font-size: 0.7rem; padding: 3px 10px;">
                      {{ obtenerTextoEstado(s.estado_dinamico) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="card-body bg-white pt-0 px-3 pb-3">
                <p class="text-dark mb-3 mt-2 lh-sm" style="font-size: 0.9rem;">
                  <span v-if="s.articulo" class="fw-bold text-dark">Art. {{ s.articulo }}</span>
                  <span v-if="s.articulo && s.motivo"> - </span>
                  <span class="text-muted">{{ s.motivo }}</span>
                </p>

                <div class="bg-light p-2 rounded border d-flex justify-content-between align-items-center mb-3" style="background-color: #f8fafc !important;">
                  <span class="text-dark" style="font-size: 0.85rem;">Desde: <strong class="text-dark">{{ s.desde_formateada || '-' }}</strong></span>
                  <span class="text-dark" style="font-size: 0.85rem;">Hasta:
                    <strong class="text-danger" v-if="s.es_indefinido == 1">Indefinido</strong>
                    <strong class="text-danger" v-else-if="s.hasta_formateada">{{ s.hasta_formateada }}</strong>
                    <strong class="text-muted" v-else>-</strong>
                  </span>
                </div>

                <div class="d-flex flex-column gap-2">
                  <button @click="abrirDescargo(s)" class="btn w-100 fw-bold position-relative" :class="s.estado_dinamico == 3 ? (s.tiene_nuevos ? 'btn-primary text-white' : 'btn-outline-primary') : 'btn-outline-secondary'">
                    <i class="bi" :class="s.estado_dinamico == 3 ? 'bi-chat-text' : 'bi-clock-history'"></i>
                    {{ s.estado_dinamico == 3 ? (s.tiene_nuevos ? 'Nuevo Mensaje' : 'Realizar Descargo') : 'Historial de Descargos' }}
                    <span v-if="s.tiene_nuevos && s.estado_dinamico == 3" class="position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle" style="margin-left:-15px;"></span>
                  </button>

                  <button v-if="s.estado_dinamico == 1" @click="abrirApelar(s)" class="btn btn-danger text-white w-100 fw-bold">
                    <i class="bi bi-envelope"></i> APELAR A COMISIÓN DIRECTIVA
                  </button>
                </div>
              </div>
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
      :show="mostrarModalDescargo"
      @close="mostrarModalDescargo = false; obtenerSancionesLocales()"
      icono="forum"
      maxWidth="600px"
    >
      <template #header>
        <div class="text-center">
          <div>Proceso de Descargo</div>
          <div class="text-muted small">Sanción Art. {{ sancionActiva?.articulo }}</div>
        </div>
      </template>

      <div class="chat-container bg-light border rounded p-3 mb-3" style="height: 300px; overflow-y: auto;">
        <div v-if="cargandoDescargos" class="text-center mt-4"><span class="spinner-border text-primary"></span></div>
        <div v-else-if="historialDescargos.length === 0" class="text-center text-muted mt-4">
          {{ sancionActiva?.estado_dinamico == 3 ? 'No hay mensajes aún. Enviá tu descargo inicial.' : 'No se registraron descargos durante el proceso.' }}
        </div>

        <div v-for="d in historialDescargos" :key="d.id" class="mb-3 d-flex flex-column" :class="d.emisor_tipo === 'arbitro' ? 'align-items-end' : 'align-items-start'">
          <div :class="d.emisor_tipo === 'arbitro' ? 'bg-primary text-white' : 'bg-white border text-dark'" class="p-2 rounded shadow-sm" style="max-width: 85%;">
            <div class="small fw-bold mb-1">{{ d.emisor_tipo === 'arbitro' ? 'Yo' : 'Tribunal de Ética' }}</div>
            <div>{{ d.mensaje }}</div>

            <div v-if="d.archivos && d.archivos.length > 0" class="mt-2 border-top pt-2" :class="d.emisor_tipo === 'arbitro' ? 'border-light' : 'border-secondary'">
              <div v-for="arc in d.archivos" :key="arc.url_completa" class="small mb-1">
                <div v-if="arc.archivo_nombre.match(/\.(jpeg|jpg|gif|png)$/i)" class="mt-1">
                   <a :href="arc.url_completa" target="_blank" title="Ver imagen completa">
                     <img :src="arc.url_completa" class="img-thumbnail" style="max-height: 80px; max-width: 100%; object-fit: cover; cursor: pointer;" :alt="arc.archivo_nombre">
                   </a>
                </div>
                <div v-else>
                  <a :href="arc.url_completa" target="_blank" :class="d.emisor_tipo === 'arbitro' ? 'text-white text-decoration-underline' : 'text-primary'">
                    <i class="bi bi-paperclip"></i> {{ arc.archivo_nombre }}
                  </a>
                </div>
              </div>
            </div>
            <div class="text-end" style="font-size: 0.7rem; opacity: 0.8; margin-top: 4px;">{{ d.fecha_formateada }}</div>
          </div>
        </div>
      </div>

      <template v-if="sancionActiva?.estado_dinamico == 3">
        <div class="row g-2">
          <div class="col-12">
            <textarea v-model="nuevoMensaje" class="form-control" rows="3" placeholder="Escribí tu descargo o respuesta aquí..."></textarea>
          </div>
          <div class="col-12">
            <input type="file" ref="fileInput" multiple class="form-control form-control-sm" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
            <small class="text-muted">Podés adjuntar múltiples archivos.</small>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="alert alert-secondary text-center small mb-0 border-0 shadow-sm rounded">
          <i class="bi bi-info-circle-fill me-1"></i> El proceso disciplinario se encuentra finalizado. El chat es de solo lectura.
        </div>
      </template>

      <template #footer>
        <div v-if="sancionActiva?.estado_dinamico == 3" class="w-100 d-flex justify-content-end gap-2">
          <button @click="enviarDescargo" class="btn btn-primary fw-bold" :disabled="enviandoDescargo || (!nuevoMensaje && !fileInput?.files?.length)">
            <span v-if="enviandoDescargo" class="spinner-border spinner-border-sm me-1"></span>
            ENVIAR DESCARGO
          </button>
        </div>
        <div v-else class="w-100 d-flex justify-content-center">
           <button @click="mostrarModalDescargo = false; obtenerSancionesLocales()" class="btn btn-light border rounded-pill px-4 fw-bold shadow-sm">CERRAR</button>
        </div>
      </template>
    </ModalBase>

    <ModalBase
      :show="mostrarModalApelar"
      @close="mostrarModalApelar = false"
      icono="gavel"
      maxWidth="550px"
      colorIcono="bg-danger text-white"
    >
      <template #header>
        <div class="text-center">
          <div>Apelar a Comisión Directiva</div>
        </div>
      </template>

      <div class="text-center p-3">
        <div class="mb-4">
          <span class="material-icons text-danger" style="font-size: 50px;">forward_to_inbox</span>
        </div>
        <p class="fs-6 text-dark">
          Para apelar esta sanción ante la Comisión Directiva, debés enviar un e-mail formal detallando los motivos de tu apelación.
        </p>
        <div class="bg-light p-3 rounded border shadow-sm my-3">
          <span class="d-block small text-muted text-uppercase fw-bold mb-1">Enviar correo electrónico a:</span>
          <a href="mailto:secretaria@arbitroshandball.com.ar" class="fs-5 fw-bold text-primary text-decoration-none">
            secretaria@arbitroshandball.com.ar
          </a>
        </div>
        <p class="small text-muted m-0">No olvides incluir tu nombre completo y el número de sanción (ID #{{ sancionActiva?.id }}).</p>
      </div>

      <template #footer>
        <div class="w-100 d-flex justify-content-center">
          <button @click="mostrarModalApelar = false" class="btn btn-dark rounded-pill px-5 fw-bold shadow-sm">
            ENTENDIDO
          </button>
        </div>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { auth } from '@/api/auth';
import { api }  from '@/api/api';
import ModalBase from '@/components/ModalBase.vue';

const arbitro = ref(auth.getUser() || {});
const sanciones = ref([]);
const cargando = ref(false);

const filtros = reactive({ motivo_articulo: '', sancion: '', desde: '', hasta: '', estado: '' });
const mostrarFiltrosMobile = ref(false);
const paginaActual = ref(1);
const registrosPorPagina = 10;

// Chat / Descargos
const mostrarModalDescargo = ref(false);
const sancionActiva = ref(null);
const historialDescargos = ref([]);
const cargandoDescargos = ref(false);
const nuevoMensaje = ref('');
const enviandoDescargo = ref(false);
const fileInput = ref(null);

// Modal Apelar
const mostrarModalApelar = ref(false);

const limpiarFiltros = () => { filtros.motivo_articulo = ''; filtros.sancion = ''; filtros.desde = ''; filtros.hasta = ''; filtros.estado = ''; };
const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const obtenerTextoEstado = (estado_dinamico) => {
  if (estado_dinamico == 1) return 'VIGENTE';
  if (estado_dinamico == 2) return 'CUMPLIDA';
  if (estado_dinamico == 3) return 'EN PROCESO';
  if (estado_dinamico == 4) return 'ANULADA';
  return 'DESCONOCIDO';
}

const obtenerClaseEstado = (estado_dinamico, es_sm = false) => {
  const prefijo = es_sm ? 'badge-status-sm' : 'badge-status';
  if (estado_dinamico == 1) return `${prefijo} rechazada`;
  if (estado_dinamico == 2) return `${prefijo} aprobada`;
  if (estado_dinamico == 3) return `${prefijo} pendiente text-dark`;
  if (estado_dinamico == 4) return `${prefijo} anulada`;
  return `${prefijo}`;
}

const obtenerClaseTextoSancion = (estado_dinamico) => {
  if (estado_dinamico == 4) return 'text-anulada fw-bold';
  if (estado_dinamico == 3) return 'text-en-proceso fw-bold';
  return 'text-danger fw-bold';
}

const sancionesFiltradas = computed(() => {
  return sanciones.value.filter(s => {
    const matchMotArt = normalizar((s.motivo || '') + ' ' + (s.articulo || '')).includes(normalizar(filtros.motivo_articulo));
    const matchSan = normalizar(s.sancion || '').includes(normalizar(filtros.sancion));
    const matchDes = (s.desde_formateada || '').includes(filtros.desde);
    const matchHas = (s.hasta_formateada || '').includes(filtros.hasta);

    let matchEst = true;
    if (filtros.estado === 'vigente') matchEst = (s.estado_dinamico == 1);
    if (filtros.estado === 'cumplida') matchEst = (s.estado_dinamico == 2);
    if (filtros.estado === 'en_proceso') matchEst = (s.estado_dinamico == 3);
    if (filtros.estado === 'anulada') matchEst = (s.estado_dinamico == 4);

    return matchMotArt && matchSan && matchDes && matchHas && matchEst;
  });
});

const totalPaginas = computed(() => Math.ceil(sancionesFiltradas.value.length / registrosPorPagina) || 1);
const sancionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return sancionesFiltradas.value.slice(inicio, inicio + registrosPorPagina);
});

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => { if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' }); }, 50);
};

watch(filtros, () => { paginaActual.value = 1 }, { deep: true });
watch(totalPaginas, (nuevo) => { if (paginaActual.value > nuevo) paginaActual.value = nuevo });

const obtenerSancionesLocales = async () => {
  cargando.value = true;
  try {
    const idEmisor = arbitro.value.id || arbitro.value.id_arbitro;
    const res = await api.get({ entity: 'sanciones', action: 'obtenerSancionesArbitro', payload: { id_arbitro: idEmisor } });
    sanciones.value = res.payload || [];
  } catch (err) {
    console.error(err);
  } finally {
    cargando.value = false;
  }
};

// --- Funciones Apelar ---
const abrirApelar = (sancion) => {
  sancionActiva.value = sancion;
  mostrarModalApelar.value = true;
}

// --- Funciones de Descargo ---
const abrirDescargo = async (sancion) => {
  sancionActiva.value = sancion;
  mostrarModalDescargo.value = true;
  await cargarDescargos(sancion.id);

  // Limpiamos globo rojo al abrir
  if (sancion.tiene_nuevos) {
      sancion.tiene_nuevos = false;
  }
};

const cargarDescargos = async (id_sancion) => {
  cargandoDescargos.value = true;
  try {
    const res = await api.get({ entity: 'sanciones', action: 'obtenerDescargos', payload: { id_sancion } });
    historialDescargos.value = res.payload || res || [];
  } catch (error) {
    console.error(error);
  } finally {
    cargandoDescargos.value = false;
  }
};

const convertirABase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ nombre: file.name, base64: reader.result });
    reader.onerror = error => reject(error);
  });
};

const enviarDescargo = async () => {
  const idEmisor = arbitro.value.id || arbitro.value.id_arbitro;
  if (!idEmisor) {
    alert("Error: No se pudo identificar tu usuario.");
    return;
  }

  enviandoDescargo.value = true;

  let archivosConvertidos = [];
  if (fileInput.value && fileInput.value.files.length > 0) {
    for (let i = 0; i < fileInput.value.files.length; i++) {
      const base64Data = await convertirABase64(fileInput.value.files[i]);
      archivosConvertidos.push(base64Data);
    }
  }

  const payload = {
    id_sancion: sancionActiva.value.id,
    emisor_tipo: 'arbitro',
    emisor_id: idEmisor,
    mensaje: nuevoMensaje.value,
    archivos: archivosConvertidos
  };

  try {
    const res = await api.post({ entity: 'sanciones', action: 'enviarDescargo', payload });
    if (res?.success !== false) {
      nuevoMensaje.value = '';
      if (fileInput.value) fileInput.value.value = '';
      await cargarDescargos(sancionActiva.value.id);
    }
  } catch (error) {
    console.error("Error al enviar", error);
  } finally {
    enviandoDescargo.value = false;
  }
};

onMounted(obtenerSancionesLocales);
</script>

<style scoped>
/* ====================================================
   1. BOTONES Y ESTADOS (Mantenemos tu diseño)
   ==================================================== */
.btn-action {
    border: none; padding: 8px 12px; border-radius: 4px;
    font-weight: bold; cursor: pointer; display: flex;
    align-items: center; justify-content: center; gap: 5px;
    font-size: 0.75rem; transition: opacity 0.2s;
}
.btn-refresh:hover { transform: rotate(45deg); }

.text-en-proceso { color: #d97706 !important; }
.text-anulada { color: #0f172a !important; }

.badge-status { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; display: inline-block; text-align: center;}
.badge-status.aprobada { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.badge-status.rechazada { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.badge-status.pendiente { background: #fef9c3; color: #a16207; border: 1px solid #fef08a; }
.badge-status.anulada { background: #0f172a; color: #ffffff; border: 1px solid #0f172a; }

.badge-status-sm { padding: 2px 8px; border-radius: 12px; font-size: 0.65rem; font-weight: 700; display: inline-block; text-align: center;}
.badge-status-sm.aprobada { background: #dcfce7; color: #15803d; }
.badge-status-sm.rechazada { background: #fee2e2; color: #b91c1c; }
.badge-status-sm.pendiente { background: #fef9c3; color: #a16207; }
.badge-status-sm.anulada { background: #0f172a; color: #ffffff; }

/* ====================================================
   2. TABLA DESKTOP Y FILTROS
   ==================================================== */
.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; }
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }

thead tr.main-header th { position: sticky; top: 0; z-index: 50; background: #f8fafc !important; padding: 12px 10px; border-bottom: 1px solid #cbd5e1; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0; }

thead tr.filter-row td { position: sticky; top: 35px; z-index: 40; background: #f1f5f9 !important; padding: 6px 10px 12px 10px; border-bottom: 4px solid #e2e8f0; margin: 0; }
.filter-input { font-size: 0.75rem; height: 32px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; box-sizing: border-box; }
.filter-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }

.col-id { left: 0; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }
thead tr.filter-row td.sticky-col { z-index: 95 !important; background-color: #f1f5f9 !important; }

.cell-ro { padding: 14px 10px; font-size: 0.85rem; color: #000; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

/* ====================================================
   3. 📱 RESPONSIVE DESIGN (Solo lo necesario)
   ==================================================== */
.card-licencia { border-radius: 8px; margin-bottom: 15px; }

@media (max-width: 768px) {
    .mobile-filter-panel { padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
    .filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .filter-grid-mobile input, .filter-grid-mobile select {
        padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;
        font-size: 16px; width: 100%; outline: none; background: #f8fafc;
    }
    .filter-grid-mobile select.full-width { grid-column: span 2; }
}

@media (max-width: 600px) {
    .filter-grid-mobile { grid-template-columns: 1fr; }
    .filter-grid-mobile select.full-width { grid-column: span 1; }
}

.animate__animated { animation-duration: 0.5s; }
</style>
