 <template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">
      
      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">
        
        <div class="header-section" style="margin-bottom: 0; box-shadow: none; border-radius: 0; border-bottom: 1px solid #e2e8f0; padding: 20px;">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2" style="font-size: 1.25rem;">
              <i class="bi bi-shield-exclamation me-1"></i> Historial de Sanciones
            </h4>
            <span class="counter mt-1 d-block">Total: {{ sancionesFiltradas.length }} sanciones</span>
          </div>

          <div class="header-actions">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex"><span class="material-icons">filter_alt</span> <span class="btn-text">Filtros</span></button>
            <button @click="limpiarFiltros" class="btn-action btn-clear"><span class="material-icons">filter_alt_off</span> <span class="btn-text">Limpiar</span></button>
            <RouterLink to="/panel-admin/tribunal/cargar-sancion" class="text-decoration-none">
              <button class="btn-action btn-clear-checks"><span class="material-icons">add_circle</span> <span class="btn-text">Nuevo</span></button>
            </RouterLink>
            <button @click="exportarExcel" class="btn-action btn-export"><span class="material-icons">download</span> <span class="btn-text">Excel</span></button>
          </div>
        </div>

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster" style="border-radius: 0; border-left: 0; border-right: 0; margin-bottom: 0; background-color: #f8fafc; padding: 15px 20px;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-muted text-uppercase">Filtrar Sanciones</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>

          <div class="filter-grid-mobile">
            <input v-model="filtros.arbitro" placeholder="Árbitro...">
            <input v-model="filtros.motivo" placeholder="Motivo / Art...">

            <select v-model="filtros.estado" class="full-width">
              <option value="">Estado (Todos)</option>
              <option value="vigente">Vigente</option>
              <option value="cumplida">Cumplida</option>
              <option value="en_proceso">En Proceso</option>
              <option value="anulada">Anulada</option>
            </select>

            <input type="text" v-model="filtros.desde" placeholder="Desde (DD/MM/AAAA)">
            <input type="text" v-model="filtros.hasta" placeholder="Hasta (DD/MM/AAAA)">
          </div>

          <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0">Aplicar Filtros</button>
        </div>

        <div class="card-body p-3 p-md-4">

          <div class="table-container shadow desktop-only">
            <table>
              <thead>
                <tr class="main-header">
                  <th class="sticky-col col-id text-center">ID</th>
                  <th class="sticky-col col-acciones text-center">Acciones</th>
                  <th class="sticky-col col-arbitro">Árbitro</th>
                  <th>Motivo / Art.</th>
                  <th class="text-center">Sanción</th>
                  <th class="text-center">Desde</th>
                  <th class="text-center">Hasta</th>
                  <th class="text-center">Estado</th>
                </tr>
                <tr class="filter-row">
                  <td class="sticky-col col-id text-center" style="vertical-align: middle;">
                    <button @click="fetchSanciones" class="btn-refresh mx-auto d-flex align-items-center justify-content-center" title="Recargar">
                      <span class="material-icons" style="font-size: 20px; color: #64748b;">refresh</span>
                    </button>
                  </td>
                  <td class="sticky-col col-acciones"></td>
                  <td class="sticky-col col-arbitro"><input v-model="filtros.arbitro" class="filter-input" placeholder="Filtrar.."></td>
                  <td><input v-model="filtros.motivo" class="filter-input" placeholder="Filtrar.."></td>
                  <td><input v-model="filtros.sancion" class="filter-input text-center" placeholder="Filtrar.."></td>
                  <td><input v-model="filtros.desde" class="filter-input text-center" placeholder="DD/MM/AAAA"></td>
                  <td><input v-model="filtros.hasta" class="filter-input text-center" placeholder="DD/MM/AAAA"></td>
                  <td>
                    <select v-model="filtros.estado" class="filter-input text-center">
                      <option value="">TODOS</option>
                      <option value="vigente">VIGENTE</option>
                      <option value="cumplida">CUMPLIDA</option>
                      <option value="en_proceso">EN PROCESO</option>
                      <option value="anulada">ANULADA</option>
                    </select>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sancionesPaginadas" :key="s.id">
                  <td class="sticky-col col-id cell-ro text-center text-muted fw-bold">{{ s.id }}</td>
                  <td class="sticky-col col-acciones cell-ro text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="editarSancion(s)" class="btn-editar" title="Editar"><span class="material-icons" style="font-size:16px;">edit</span></button>
                      <button @click="verHistorialArbitro(s)" class="btn-historial" title="Historial"><span class="material-icons" style="font-size:16px;">manage_search</span></button>
                      <button @click="eliminarSancionRegistro(s.id)" class="btn-eliminar" title="Eliminar"><span class="material-icons" style="font-size:16px;">delete</span></button>
                    </div>
                  </td>
                  <td class="sticky-col col-arbitro cell-ro fw-bold">{{ s.arbitro }}</td>
                  <td class="cell-ro">{{ s.motivo }} <br> <small class="text-muted">Art. {{ s.articulo }}</small></td>
                  <td class="cell-ro text-center">
                    <span :class="obtenerClaseTextoSancion(s.estado_dinamico)">{{ s.sancion }}</span>
                  </td>
                  <td class="cell-ro text-center">{{ s.desde_formateada || '-' }}</td>
                  <td class="cell-ro text-center">
                    <span v-if="s.es_indefinido == 1" class="text-muted">Indefinido</span>
                    <span v-else>{{ s.hasta_formateada || '-' }}</span>
                  </td>
                  <td class="cell-ro text-center">
                    <span :class="obtenerClaseEstado(s.estado_dinamico)">
                      {{ obtenerTextoEstado(s.estado_dinamico) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mt-3">
            <div v-for="s in sancionesPaginadas" :key="'mob-'+s.id" class="card-licencia border-light-subtle shadow-sm mb-3 bg-white rounded">
              
              <div class="card-header border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="fw-bold text-dark" style="font-size: 1.05rem;">{{ s.arbitro }}</div>
                <span class="text-muted small fw-bold">#{{ s.id }}</span>
              </div>

              <div class="px-3 pt-1 pb-2">
                <div class="d-flex justify-content-start align-items-center gap-2">
                  <span :class="obtenerClaseTextoSancion(s.estado_dinamico)" style="font-size: 1.1rem;">
                    {{ s.sancion }}
                  </span>
                  <span :class="obtenerClaseEstado(s.estado_dinamico, true)" style="font-size: 0.7rem; padding: 3px 10px;">
                    {{ obtenerTextoEstado(s.estado_dinamico) }}
                  </span>
                </div>
              </div>
              
              <div class="card-body pt-0 px-3 pb-3">
                <p class="text-dark mb-3 mt-1 lh-sm" style="font-size: 0.9rem;">
                  <span v-if="s.articulo" class="fw-bold text-dark">Art. {{ s.articulo }}</span>
                  <span v-if="s.articulo && s.motivo"> - </span>
                  <span class="text-muted">{{ s.motivo }}</span>
                </p>
                
                <div class="bg-light p-2 rounded border d-flex justify-content-between align-items-center" style="background-color: #f8fafc !important;">
                  <span class="text-dark" style="font-size: 0.85rem;">Desde: <strong class="text-dark">{{ s.desde_formateada || '-' }}</strong></span>
                  <span class="text-dark" style="font-size: 0.85rem;">Hasta: 
                    <strong class="text-danger" v-if="s.es_indefinido == 1">Indefinido</strong>
                    <strong class="text-danger" v-else-if="s.hasta_formateada">{{ s.hasta_formateada }}</strong>
                    <strong class="text-muted" v-else>-</strong>
                  </span>
                </div>
                
                <div class="d-flex gap-2 mt-3">
                  <button @click="editarSancion(s)" class="btn-editar-mobile flex-grow-1"><span class="material-icons" style="font-size: 18px;">edit</span> Editar</button>
                  <button @click="verHistorialArbitro(s)" class="btn-historial-mobile"><span class="material-icons" style="font-size: 18px;">manage_search</span></button>
                  <button @click="eliminarSancionRegistro(s.id)" class="btn-eliminar-mobile"><span class="material-icons" style="font-size: 18px;">delete</span></button>
                </div>
              </div>
            </div>
            
            <div v-if="sancionesPaginadas.length === 0" class="text-center p-4 bg-white rounded shadow-sm">
              <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
              <p class="text-muted mt-2 mb-0">No se encontraron sanciones.</p>
            </div>
          </div>

            <div 
                class="d-flex justify-content-center align-items-center gap-3 mt-4"
                v-if="totalPaginas > 1"
              >

                <!-- ANTERIOR -->
                <button
                  class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
                  @click="cambiarPagina(-1)"
                  :disabled="paginaActual <= 1"
                >
                  <i class="bi bi-chevron-left"></i> Ant
                </button>

                <!-- TEXTO -->
                <span class="fw-bold text-dark small">
                  Página {{ paginaActual }} de {{ totalPaginas }}
                </span>

                <!-- SIGUIENTE -->
                <button
                  class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
                  @click="cambiarPagina(1)"
                  :disabled="paginaActual >= totalPaginas"
                >
                  Sig <i class="bi bi-chevron-right"></i>
                </button>

              </div>

        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="mostrarModalEditar" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 1040;">
        <div class="modal-content-exito animate__animated animate__zoomIn p-4" style="max-width: 500px; width: 95%; border-radius: 20px;">
          
          <div class="text-center mb-4">
            <div class="icon-circle-exito bg-info-light mx-auto mb-3" style="width: 70px; height: 70px;">
              <span class="material-icons" style="font-size: 28px; color: #0284c7;">edit</span>
            </div>
            <h3 class="fw-bold m-0" style="color: #0f172a;">Editar Sanción</h3>
            <p class="text-muted small mt-1">ID #{{ formModal.id }} — {{ formModal.arbitro }}</p>
          </div>

          <div class="row g-3 text-start">
            <div class="col-12">
              <label class="small fw-bold text-dark mb-1">Artículo *</label>
              <input v-model="formModal.articulo" type="text" class="form-control custom-input shadow-none">
            </div>

            <div class="col-12">
              <label class="small fw-bold text-dark mb-1">Motivo *</label>
              <textarea v-model="formModal.motivo" rows="2" class="form-control custom-input shadow-none"></textarea>
            </div>

            <div class="col-12">
              <label class="small fw-bold text-dark mb-1">Tipo de Sanción</label>
              <select v-model="tipoSancion" class="form-select custom-input shadow-none">
                <option value="">En proceso</option>
                <option value="anulada">Anulada (Sin sanción)</option>
                <option value="amonestacion">Amonestación</option>
                <option value="dias">Por Días</option>
                <option value="meses">Por Meses</option>
                <option value="anios">Por Años</option>
              </select>
            </div>

            <div class="col-md-6" v-if="['dias','meses','anios'].includes(tipoSancion)">
              <label class="small fw-bold text-dark mb-1">Cantidad *</label>
              <input type="number" min="1" v-model="cantidadSancion" class="form-control custom-input shadow-none">
            </div>

            <div class="col-md-6" v-if="['amonestacion', 'dias', 'meses', 'anios'].includes(tipoSancion)">
              <label class="small fw-bold text-dark mb-1">Fecha de Inicio *</label>
              <input type="date" v-model="formModal.desde" class="form-control custom-input shadow-none">
            </div>
            
            <div class="col-12" v-if="['dias','meses','anios'].includes(tipoSancion)">
              <div class="form-check mt-1">
                <input class="form-check-input" type="checkbox" v-model="formModal.es_indefinido" :true-value="1" :false-value="0" id="checkIndefinido">
                <label class="form-check-label small text-muted" for="checkIndefinido">
                  Sanción Indefinida (Hasta nuevo aviso)
                </label>
              </div>
            </div>
          </div>
          
          <div class="d-flex gap-3 justify-content-center mt-5">
            <button @click="mostrarModalEditar = false" class="btn btn-light rounded-pill px-4 fw-bold" style="background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0;">CANCELAR</button>
            <button @click="confirmarEdicion" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" :disabled="cargandoProceso" style="background: #1e293b;">
              <span v-if="cargandoProceso" class="spinner-border spinner-border-sm me-1"></span>
              {{ cargandoProceso ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="mostrarModalHistorial" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 1040;">
        
        <div class="modal-content-exito d-flex flex-column animate__animated animate__zoomIn p-0 mx-auto" style="max-width: 700px; width: 95%; max-height: 90vh; text-align: left; border-radius: 20px; background: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden;">
          
          <div class="flex-shrink-0 p-3 p-md-4 border-bottom bg-white" style="position: relative; z-index: 10;">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="fw-bold m-0 d-flex align-items-center gap-2" style="color: #0f172a; font-size: 1.15rem;">
                <span class="material-icons text-warning" style="font-size: 24px;">manage_search</span>
                Historial de {{ arbitroHistorial?.arbitro || 'Árbitro' }}
                <span v-if="!cargandoHistorial" class="badge bg-dark rounded-pill fs-6 ms-2 d-flex align-items-center justify-content-center" style="min-width: 28px; min-height: 28px;">{{ historialSanciones.length }}</span>
              </h5>
              <button @click="mostrarModalHistorial = false" class="btn btn-light rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 35px; height: 35px; background: #f8fafc; border: 1px solid #f1f5f9; padding: 0;">
                <span class="material-icons" style="font-size: 18px; color: #000;">close</span>
              </button>
            </div>
          </div>

          <div class="flex-grow-1 p-3 p-md-4 bg-white" style="overflow-y: auto;">
            <div v-if="cargandoHistorial" class="text-center py-5">
              <span class="spinner-border text-warning"></span>
            </div>

            <div v-else-if="historialSanciones.length === 0" class="text-center py-5 text-muted bg-light rounded-4 shadow-sm border border-light-subtle">
              <span class="material-icons d-block mb-3" style="font-size: 50px; color: #cbd5e1;">history_toggle_off</span>
              <p class="mb-0 fw-bold fs-5 text-dark">Sin registros</p>
              <p class="small">No hay sanciones previas en el historial.</p>
            </div>

            <div v-else>
              <div class="table-responsive desktop-only">
                <table class="table table-sm table-borderless align-middle m-0" style="font-size: 0.85rem;">
                  <thead style="border-bottom: 2px solid #e2e8f0;">
                    <tr class="text-dark">
                      <th class="pb-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Art. / Motivo</th>
                      <th class="pb-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Sanción</th>
                      <th class="pb-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Fechas</th>
                      <th class="text-center pb-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="h in historialSanciones" :key="h.id" style="border-bottom: 1px solid #f1f5f9;">
                      <td class="py-3 pe-2">
                        <span class="fw-bold" style="color: #0f172a; font-size: 0.9rem;">Art. {{ h.articulo }}</span><br>
                        <span class="text-muted" style="font-size: 0.8rem;">{{ h.motivo }}</span>
                      </td>
                      <td class="py-3 pe-2">
                        <span :class="obtenerClaseTextoSancion(h.estado_dinamico)" style="font-size: 0.9rem;">{{ h.sancion }}</span>
                      </td>
                      <td class="text-nowrap py-3 pe-2" style="color: #475569; font-size: 0.8rem;">
                        <strong class="text-dark">D:</strong> {{ h.desde_formateada || h.desde || '-' }}<br>
                        <strong class="text-dark">H:</strong> 
                        <span :class="h.es_indefinido == 1 ? 'text-primary fw-bold' : ''">
                          {{ h.es_indefinido == 1 ? 'Indefinido' : (h.hasta_formateada || h.hasta || '-') }}
                        </span>
                      </td>
                      <td class="text-center py-3">
                        <span :class="obtenerClaseEstado(h.estado_dinamico, true)" style="padding: 4px 8px; font-size: 0.7rem;">
                          {{ obtenerTextoEstado(h.estado_dinamico) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mobile-only">
                <div v-for="h in historialSanciones" :key="'mob-hist-'+h.id" class="border border-light-subtle rounded-4 p-3 mb-3 shadow-sm bg-light">
                  <div class="d-flex justify-content-between align-items-start mb-2 border-bottom pb-2">
                    <div>
                      <span class="d-block fw-bold text-dark" style="font-size: 0.95rem;">Art. {{ h.articulo }}</span>
                      <span class="text-muted" style="font-size: 0.8rem;">{{ h.motivo }}</span>
                    </div>
                    <span :class="obtenerClaseEstado(h.estado_dinamico, true)" style="padding: 4px 8px; font-size: 0.65rem; text-align: center;">
                      {{ obtenerTextoEstado(h.estado_dinamico) }}
                    </span>
                  </div>
                  <div class="mt-2 mb-3">
                    <span :class="obtenerClaseTextoSancion(h.estado_dinamico)" style="font-size: 0.95rem;">{{ h.sancion }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center text-muted small bg-white p-2 rounded border border-light-subtle">
                    <span><strong>Desde:</strong> {{ h.desde_formateada || h.desde || '-' }}</span>
                    <span><strong>Hasta:</strong> <span :class="h.es_indefinido == 1 ? 'text-primary fw-bold' : ''">{{ h.es_indefinido == 1 ? 'Indefinido' : (h.hasta_formateada || h.hasta || '-') }}</span></span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'

useHead({ title: 'Gestión de Sanciones | AAAB' })

const notificar = inject('notificar', (msg) => alert(msg.mensaje || msg))

const sanciones = ref([])
const cargando = ref(false)
const cargandoProceso = ref(false)

const filtros = reactive({
  arbitro: '', motivo: '', sancion: '', desde: '', hasta: '', estado: ''
})

const mostrarFiltrosMobile = ref(false)
const paginaActual = ref(1)
const registrosPorPagina = 7

const mostrarModalEditar = ref(false)
const tipoSancion = ref('')
const cantidadSancion = ref('')

const formModal = ref({
  id: null, arbitro: '', motivo: '', articulo: '', sancion_dias: 0, desde: '', es_amonestacion: 0, es_indefinido: 0
})

const mostrarModalHistorial = ref(false)
const cargandoHistorial = ref(false)
const arbitroHistorial = ref(null)
const historialSanciones = ref([])

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : ''
const revertirFechaParaInput = (fecha) => {
  if (!fecha) return '';
  if (fecha.includes('-')) return fecha;
  const partes = fecha.split('/');
  if (partes.length !== 3) return '';
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

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
    const matchArb = normalizar(s.arbitro).includes(normalizar(filtros.arbitro))
    const matchMot = normalizar((s.motivo || '') + ' ' + (s.articulo || '')).includes(normalizar(filtros.motivo))
    const matchSan = normalizar(s.sancion || '').includes(normalizar(filtros.sancion))
    const matchDes = (s.desde || '').includes(filtros.desde)
    const textoHasta = s.es_indefinido == 1 ? 'indefinido' : (s.hasta || '')
    const matchHas = normalizar(textoHasta).includes(normalizar(filtros.hasta))

    let matchEst = true
    if (filtros.estado === 'vigente') matchEst = (s.estado_dinamico == 1);
    if (filtros.estado === 'cumplida') matchEst = (s.estado_dinamico == 2);
    if (filtros.estado === 'en_proceso') matchEst = (s.estado_dinamico == 3);
    if (filtros.estado === 'anulada') matchEst = (s.estado_dinamico == 4);

    return matchArb && matchMot && matchSan && matchDes && matchHas && matchEst
  }).sort((a, b) => b.id - a.id);
})

const totalPaginas = computed(() => Math.ceil(sancionesFiltradas.value.length / registrosPorPagina) || 1)
const sancionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return sancionesFiltradas.value.slice(inicio, inicio + registrosPorPagina)
})

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevo) => { if (paginaActual.value > nuevo) paginaActual.value = nuevo })

// NUEVA FUNCIÓN: Cambiar página y scrollear arriba SOLO EN MOBILE
const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    // Detectamos si es pantalla móvil
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

const fetchSanciones = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'sanciones', action: 'obtenerSanciones' })
    sanciones.value = res.payload ?? res ?? []
  } catch (err) {
    console.error("Error:", err)
  } finally {
    cargando.value = false
  }
}

const editarSancion = (s) => {
  formModal.value = {
    id: s.id,
    arbitro: s.arbitro,
    motivo: s.motivo,
    articulo: s.articulo,
    desde: revertirFechaParaInput(s.desde),
    es_indefinido: 0 
  }

  tipoSancion.value = ''
  cantidadSancion.value = ''

  if (s.estado_dinamico == 4) {
    tipoSancion.value = 'anulada'
  } else if (s.es_amonestacion == 1) {
    tipoSancion.value = 'amonestacion'
  } else if (s.sancion_dias > 0) {
    tipoSancion.value = 'dias'
    cantidadSancion.value = s.sancion_dias
  }

  mostrarModalEditar.value = true
}

const confirmarEdicion = async () => {
  if (['amonestacion', 'dias', 'meses', 'anios'].includes(tipoSancion.value) && !formModal.value.desde) {
    return notificar({ titulo: 'Dato Faltante', mensaje: 'Debe ingresar la fecha de inicio.', tipo: 'warning' })
  }

  if (['dias','meses','anios'].includes(tipoSancion.value) && (!cantidadSancion.value || cantidadSancion.value <= 0)) {
    return notificar({ titulo: 'Dato Faltante', mensaje: 'Debe ingresar una cantidad válida.', tipo: 'warning' })
  }

  cargandoProceso.value = true

  let diasCalculados = 0
  let amonestacion = 0
  let es_anulada = 0

  if (tipoSancion.value === 'anulada') {
    es_anulada = 1 
  } else if (tipoSancion.value === 'amonestacion') {
    amonestacion = 1
  } else if (tipoSancion.value === 'dias') {
    diasCalculados = parseInt(cantidadSancion.value)
  } else if (tipoSancion.value === 'meses') {
    diasCalculados = parseInt(cantidadSancion.value) * 30
  } else if (tipoSancion.value === 'anios') {
    diasCalculados = parseInt(cantidadSancion.value) * 365
  }

  const payloadLimpio = {
    id: formModal.value.id,
    motivo: formModal.value.motivo,
    articulo: formModal.value.articulo,
    sancion_dias: diasCalculados,
    desde: formModal.value.desde || null,
    es_amonestacion: amonestacion,
    es_anulada: es_anulada, 
    es_indefinido: formModal.value.es_indefinido ? 1 : 0
  }

  try {
    const res = await api.post({
      entity: 'sanciones',
      action: 'actualizarSancion',
      payload: payloadLimpio
    })

    if (res?.ok !== false) {
      mostrarModalEditar.value = false
      fetchSanciones()
      notificar({ titulo: 'Guardado', mensaje: 'Sanción actualizada correctamente.', tipo: 'success' })
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Error de conexión con el servidor.', tipo: 'danger' })
  } finally {
    cargandoProceso.value = false
  }
}

const eliminarSancionRegistro = (id) => {
  notificar({
    titulo: '¿Eliminar Sanción?',
    mensaje: 'Esta acción ocultará el registro del historial.',
    tipo: 'danger',
    tieneAccion: true,
    alConfirmar: async () => {
      await api.post({ entity: 'sanciones', action: 'eliminarSancion', payload: { id } })
      fetchSanciones()
    }
  })
}

const verHistorialArbitro = async (sancion) => {
  arbitroHistorial.value = sancion
  mostrarModalHistorial.value = true
  cargandoHistorial.value = true
  historialSanciones.value = []

  try {
    const { payload } = await api.get({
      entity: 'sanciones',
      action: 'obtenerSancionesArbitro',
      payload: { id_arbitro: sancion.id_arbitro }
    })
    historialSanciones.value = payload || []
  } catch (error) {
    console.error("Error al cargar historial", error)
  } finally {
    cargandoHistorial.value = false
  }
}

const exportarExcel = () => {
  const data = sancionesFiltradas.value.map(s => ({
    ID: s.id,
    Árbitro: s.arbitro,
    Motivo: s.motivo,
    Sanción: s.sancion,
    Desde: s.desde_formateada || s.desde,
    Hasta: s.es_indefinido == 1 ? 'Indefinido' : (s.hasta_formateada || s.hasta),
    Estado: obtenerTextoEstado(s.estado_dinamico)
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Sanciones")
  XLSX.writeFile(wb, "Sanciones_AAAB.xlsx")
}

const limpiarFiltros = () => {
  filtros.arbitro = ''; filtros.motivo = ''; filtros.sancion = ''; filtros.desde = ''; filtros.hasta = ''; filtros.estado = '';
}

onMounted(fetchSanciones)
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; }
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #dc2626; box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; }
.counter { font-size: 0.85rem; color: #000000; }
.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; }
.btn-export { background: #10b981; color: white; }

.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }
thead tr.main-header th { position: sticky; top: 0; z-index: 50; background: #f8fafc !important; padding: 12px 8px; border-bottom: 1px solid #cbd5e1; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0; }
thead tr.filter-row td { position: sticky; top: 35px; z-index: 40; background: #f1f5f9 !important; padding: 6px 8px 12px 8px; border-bottom: 4px solid #e2e8f0; margin: 0; }

.col-id { left: 0; width: 50px; text-align: center; }
.col-acciones { left: 50px; width: 110px; }
.col-arbitro { left: 160px; width: 180px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }
thead tr.filter-row td.sticky-col { z-index: 95 !important; background-color: #f1f5f9 !important; }

.cell-ro { padding: 10px 8px; font-size: 0.85rem; color: #000; white-space: nowrap; border-bottom: 1px solid #f1f5f9; }
.filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; }

.btn-editar, .btn-historial, .btn-eliminar { display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; padding: 4px; cursor: pointer; transition: 0.2s; border: none; }
.btn-editar { background: #eff6ff; color: #1d4ed8; }
.btn-editar:hover { background: #dbeafe; }
.btn-historial { background: #fef3c7; color: #d97706; }
.btn-historial:hover { background: #fde047; }
.btn-eliminar { background: #fee2e2; color: #dc2626; }
.btn-eliminar:hover { background: #fecaca; }

.btn-refresh { background: transparent; border: none; cursor: pointer; transition: transform 0.2s ease; padding: 0; }
.btn-refresh:hover { transform: rotate(45deg); }

/* ====================================================
   NUEVOS ESTILOS PARA ESTADOS (Amarillo En Proceso, Negro Anulada)
   ==================================================== */
.text-en-proceso { color: #d97706 !important; } /* Amarillo Oscuro / Dorado */
.text-anulada { color: #0f172a !important; }    /* Azul Marino Oscuro / Negro */

.badge-status { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; display: inline-block; text-align: center;}
.badge-status.aprobada { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.badge-status.rechazada { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.badge-status.pendiente { background: #fef9c3; color: #a16207; border: 1px solid #fef08a; } /* EN PROCESO (Amarillo) */
.badge-status.anulada { background: #0f172a; color: #ffffff; border: 1px solid #0f172a; }   /* ANULADA (Negro/Blanco) */

.badge-status-sm { padding: 2px 8px; border-radius: 12px; font-size: 0.65rem; font-weight: 700; display: inline-block; text-align: center;}
.badge-status-sm.aprobada { background: #dcfce7; color: #15803d; }
.badge-status-sm.rechazada { background: #fee2e2; color: #b91c1c; }
.badge-status-sm.pendiente { background: #fef9c3; color: #a16207; }
.badge-status-sm.anulada { background: #0f172a; color: #ffffff; }

.modal-overlay-exito { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1040; }
.modal-content-exito { background: white; border-radius: 30px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
.icon-circle-exito { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.bg-info-light { background: #e0f2fe; color: #0284c7; }

.custom-input { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; font-size: 0.95rem; background-color: #ffffff; transition: all 0.3s ease; }
.custom-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); outline: none; }

.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }
.btn-text { display: inline; }

.mobile-filter-panel { background: white; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.filter-grid-mobile input, .filter-grid-mobile select { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 100%; outline: none; background: #f8fafc; }
.filter-grid-mobile select.full-width { grid-column: span 2; }

@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .card-licencia { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px; }
  .card-name { font-size: 1.05rem; color: #0f172a; }
  .btn-editar-mobile { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; }
  .btn-historial-mobile { background: #fef3c7; border: 1px solid #fde047; color: #d97706; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; }
  .btn-eliminar-mobile { background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; font-weight: bold; }
}
@media (max-width: 600px) {
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto;
  margin-left: 50%;
  transform: translateX(-50%);
      /* Top en 0, pero conservando los 15px laterales originales para celulares */
  padding: 0 15px 20px 15px !important; 
  box-sizing: border-box !important;
}
    
.admin-panel { 
      padding: 0 !important; 
      border-radius: 0; 
      box-sizing: border-box !important;
}
  .title { font-size: 1rem; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
  .header-actions { width: 100%; display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: center; gap: 8px; }
  .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
  .btn-text { display: none !important; }
  .mobile-only-flex { display: flex !important; }

    /* AJUSTE DE PADDING EN MODALES MÓVILES (Agregar/Editar Eventos) */
  .modal-content-exito {
    padding: 30px 20px !important; /* Libera los costados pero mantiene aire arriba y abajo */
    max-height: 90vh; /* Evita que el modal sea más alto que la pantalla */
    overflow-y: auto; /* Scroll interno si el formulario de evento es largo */
  }
}
</style>
