<template>
  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white main-card">

        <div class="header-section border-bottom p-4">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-shield-exclamation me-1"></i> Historial de Sanciones
            </h4>
            <span class="counter mt-1 d-block">Total: {{ sancionesFiltradas.length }} sanciones</span>
          </div>

          <div class="header-actions">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue d-md-none">
              <span class="material-icons">filter_alt</span>
              <span class="btn-text">Filtros</span>
            </button>
            <button @click="limpiarFiltros" class="btn-action btn-clear">
              <span class="material-icons">filter_alt_off</span>
              <span class="btn-text">Limpiar</span>
            </button>
            <RouterLink to="/panel-admin/tribunal/cargar-sancion" class="text-decoration-none">
              <button class="btn-action btn-clear-checks">
                <span class="material-icons">add_circle</span>
                <span class="btn-text">Nuevo</span>
              </button>
            </RouterLink>
            <button @click="exportarExcel" class="btn-action btn-export">
              <span class="material-icons">download</span>
              <span class="btn-text">Excel</span>
            </button>
          </div>
        </div>

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel d-md-none animate__animated animate__fadeInDown animate__faster">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-muted text-uppercase">Filtrar Sanciones</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1 bg-transparent">
              <span class="material-icons">close</span>
            </button>
          </div>

          <div class="filter-grid-mobile">
            <input v-model="filtros.arbitro" placeholder="Árbitro..." class="filter-input-mobile">
            <input v-model="filtros.motivo" placeholder="Motivo / Art..." class="filter-input-mobile">

            <select v-model="filtros.estado" class="filter-input-mobile full-width">
              <option value="">Estado (Todos)</option>
              <option value="vigente">Vigente</option>
              <option value="cumplida">Cumplida</option>
              <option value="en_proceso">En Proceso</option>
              <option value="anulada">Anulada</option>
            </select>

            <input type="text" v-model="filtros.desde" placeholder="Desde (DD/MM/AAAA)" class="filter-input-mobile">
            <input type="text" v-model="filtros.hasta" placeholder="Hasta (DD/MM/AAAA)" class="filter-input-mobile">
          </div>

          <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0">Aplicar Filtros</button>
        </div>

        <div class="card-body p-3 p-md-4">

          <div class="table-container shadow d-none d-md-block">
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
                  <td class="sticky-col col-id text-center align-middle">
                    <button @click="fetchSanciones" class="btn-refresh mx-auto d-flex align-items-center justify-content-center" title="Recargar">
                      <span class="material-icons">refresh</span>
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

                      <button @click="gestionarDescargo(s)" class="btn-editar position-relative" :title="s.estado_dinamico == 3 ? 'Ver Descargos' : 'Historial Chat'" :style="s.estado_dinamico == 3 ? (s.tiene_nuevos ? 'background-color: #dc3545; color: white; border-color: #dc3545;' : 'background-color: #3b82f6; color: white; border-color: #3b82f6;') : 'background-color: #6c757d; color: white; border-color: #6c757d;'">
                        <span class="material-icons">{{ s.estado_dinamico == 3 ? 'chat' : 'history' }}</span>
                        <span v-if="s.tiene_nuevos && s.estado_dinamico == 3" class="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle"></span>
                      </button>

                      <button @click="editarSancion(s)" class="btn-editar" title="Editar"><span class="material-icons">edit</span></button>
                      <button @click="verHistorialArbitro(s)" class="btn-historial" title="Historial"><span class="material-icons">manage_search</span></button>
                      <button @click="eliminarSancionRegistro(s.id)" class="btn-eliminar" title="Eliminar"><span class="material-icons">delete</span></button>
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

          <div class="d-md-none mt-3">
            <div v-for="s in sancionesPaginadas" :key="'mob-'+s.id" class="card-licencia shadow-sm mb-3 bg-white rounded border">
              <div class="card-header border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start bg-transparent">
                <div class="fw-bold text-dark card-name">{{ s.arbitro }}</div>
                <span class="text-muted small fw-bold">#{{ s.id }}</span>
              </div>

              <div class="px-3 pt-1 pb-2">
                <div class="d-flex justify-content-start align-items-center gap-2">
                  <span :class="obtenerClaseTextoSancion(s.estado_dinamico)" class="fs-5">
                    {{ s.sancion }}
                  </span>
                  <span :class="obtenerClaseEstado(s.estado_dinamico, true)" class="badge-mobile-status">
                    {{ obtenerTextoEstado(s.estado_dinamico) }}
                  </span>
                </div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <p class="text-dark mb-3 mt-1 lh-sm small">
                  <span v-if="s.articulo" class="fw-bold">Art. {{ s.articulo }}</span>
                  <span v-if="s.articulo && s.motivo"> - </span>
                  <span class="text-muted">{{ s.motivo }}</span>
                </p>

                <div class="bg-light-custom p-2 rounded border d-flex justify-content-between align-items-center">
                  <span class="small">Desde: <strong>{{ s.desde_formateada || '-' }}</strong></span>
                  <span class="small">Hasta:
                    <strong class="text-danger" v-if="s.es_indefinido == 1">Indefinido</strong>
                    <strong class="text-danger" v-else-if="s.hasta_formateada">{{ s.hasta_formateada }}</strong>
                    <strong class="text-muted" v-else>-</strong>
                  </span>
                </div>

                <div class="d-flex gap-2 mt-3 flex-wrap">
                  <button @click="gestionarDescargo(s)" class="btn-editar-mobile flex-grow-1 position-relative" :style="s.estado_dinamico == 3 ? (s.tiene_nuevos ? 'background-color: #fee2e2; color: #dc2626; border-color: #fca5a5;' : 'background-color: #eff6ff; color: #3b82f6; border-color: #bfdbfe;') : 'background-color: #f8f9fa; color: #6c757d; border-color: #dee2e6;'">
                    <span class="material-icons">{{ s.estado_dinamico == 3 ? 'chat' : 'history' }}</span>
                    {{ s.estado_dinamico == 3 ? (s.tiene_nuevos ? 'Nuevos' : 'Descargos') : 'Historial' }}
                    <span v-if="s.tiene_nuevos && s.estado_dinamico == 3" class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style="margin-left: -15px;"></span>
                  </button>

                  <button @click="editarSancion(s)" class="btn-editar-mobile flex-grow-1"><span class="material-icons">edit</span> Editar</button>
                  <button @click="verHistorialArbitro(s)" class="btn-historial-mobile"><span class="material-icons">manage_search</span></button>
                  <button @click="eliminarSancionRegistro(s.id)" class="btn-eliminar-mobile"><span class="material-icons">delete</span></button>
                </div>
              </div>
            </div>

            <div v-if="sancionesPaginadas.length === 0" class="text-center p-4 bg-white rounded shadow-sm">
              <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
              <p class="text-muted mt-2 mb-0">No se encontraron sanciones.</p>
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

    <ModalBase :show="mostrarModalEditar" @close="mostrarModalEditar = false" icono="edit" maxWidth="500px">
      <template #header>
        <div class="text-center">
          <div>Editar Sanción</div>
          <div class="text-muted small" style="font-size: 0.85rem;">ID #{{ formModal.id }} — {{ formModal.arbitro }}</div>
        </div>
      </template>
      <div class="row g-3 text-start">
        <div class="col-12">
          <label class="small fw-bold text-dark mb-1">Artículo *</label>
          <input v-model="formModal.articulo" type="text" class="form-control shadow-none border-secondary-subtle">
        </div>
        <div class="col-12">
          <label class="small fw-bold text-dark mb-1">Motivo *</label>
          <textarea v-model="formModal.motivo" rows="2" class="form-control shadow-none border-secondary-subtle"></textarea>
        </div>
        <div class="col-12">
          <label class="small fw-bold text-dark mb-1">Tipo de Sanción</label>
          <select v-model="tipoSancion" class="form-select shadow-none border-secondary-subtle">
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
          <input type="number" min="1" v-model="cantidadSancion" class="form-control shadow-none border-secondary-subtle">
        </div>
        <div class="col-md-6" v-if="['amonestacion', 'dias', 'meses', 'anios'].includes(tipoSancion)">
          <label class="small fw-bold text-dark mb-1">Fecha de Inicio *</label>
          <input type="date" v-model="formModal.desde" class="form-control shadow-none border-secondary-subtle">
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
      <template #footer>
        <div class="w-100 d-flex justify-content-center gap-3">
          <button @click="mostrarModalEditar = false" class="btn btn-light rounded-pill px-4 fw-bold border">CANCELAR</button>
          <button @click="confirmarEdicion" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" :disabled="cargandoProceso">
            <span v-if="cargandoProceso" class="spinner-border spinner-border-sm me-1"></span>
            {{ cargandoProceso ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
          </button>
        </div>
      </template>
    </ModalBase>

    <ModalBase :show="mostrarModalHistorial" @close="mostrarModalHistorial = false" icono="manage_search" colorIcono="bg-warning text-dark" maxWidth="700px">
      <template #header>
        <div class="text-center">
          <div>Historial de {{ arbitroHistorial?.arbitro || 'Árbitro' }}</div>
          <div v-if="!cargandoHistorial" class="mt-1">
            <span class="badge bg-dark rounded-pill">{{ historialSanciones.length }}</span>
          </div>
        </div>
      </template>
      <div v-if="cargandoHistorial" class="text-center py-5">
        <span class="spinner-border text-warning"></span>
      </div>
      <div v-else-if="historialSanciones.length === 0" class="text-center py-5 text-muted bg-light rounded-4 shadow-sm border border-light-subtle">
        <span class="material-icons d-block mb-3" style="font-size: 50px; color: #cbd5e1;">history_toggle_off</span>
        <p class="mb-0 fw-bold fs-5 text-dark">Sin registros</p>
      </div>
      <div v-else>
        <div class="table-responsive d-none d-md-block">
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
        <div class="d-block d-md-none">
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
    </ModalBase>

    <ModalBase
      :show="mostrarModalDescargo"
      @close="mostrarModalDescargo = false; fetchSanciones()"
      icono="forum"
      maxWidth="600px"
    >
      <template #header>
        <div class="text-center">
          <div>Descargos: {{ sancionActiva?.arbitro }}</div>
          <div class="text-muted small">Sanción Art. {{ sancionActiva?.articulo }}</div>
        </div>
      </template>

      <div class="chat-container bg-light border rounded p-3 mb-3" style="height: 300px; overflow-y: auto;">
        <div v-if="cargandoDescargos" class="text-center mt-4"><span class="spinner-border text-primary"></span></div>
        <div v-else-if="historialDescargos.length === 0" class="text-center text-muted mt-4">
          {{ sancionActiva?.estado_dinamico == 3 ? 'Esperando descargo del árbitro.' : 'No se registraron descargos.' }}
        </div>

        <div v-for="d in historialDescargos" :key="d.id" class="mb-3 d-flex flex-column" :class="d.emisor_tipo === 'admin' ? 'align-items-end' : 'align-items-start'">
          <div :class="d.emisor_tipo === 'admin' ? 'bg-dark text-white' : 'bg-white border text-dark'" class="p-2 rounded shadow-sm" style="max-width: 85%;">
            <div class="small fw-bold mb-1">{{ d.emisor_tipo === 'admin' ? 'Tribunal de Ética' : sancionActiva?.arbitro }}</div>
            <div>{{ d.mensaje }}</div>

            <div v-if="d.archivos && d.archivos.length > 0" class="mt-2 border-top pt-2" :class="d.emisor_tipo === 'admin' ? 'border-secondary' : ''">
              <div v-for="arc in d.archivos" :key="arc.url_completa" class="small mb-1">
                <div v-if="arc.archivo_nombre.match(/\.(jpeg|jpg|gif|png)$/i)" class="mt-1">
                  <a :href="arc.url_completa" target="_blank" title="Ver imagen completa">
                    <img :src="arc.url_completa" class="img-thumbnail" style="max-height: 80px; max-width: 100%; object-fit: cover; cursor: pointer;" :alt="arc.archivo_nombre">
                  </a>
                </div>
                <div v-else>
                  <a :href="arc.url_completa" target="_blank" :class="d.emisor_tipo === 'admin' ? 'text-white text-decoration-underline' : 'text-primary'">
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
            <textarea v-model="nuevoMensaje" class="form-control shadow-none border-secondary-subtle" rows="3" placeholder="Escribir respuesta al árbitro..."></textarea>
          </div>
          <div class="col-12">
            <input type="file" ref="fileInput" multiple class="form-control form-control-sm shadow-none border-secondary-subtle" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
          </div>
        </div>
      </template>
      <template v-else>
        <div class="alert alert-secondary text-center small mb-0 border-0 shadow-sm rounded">
          <i class="bi bi-info-circle-fill me-1"></i> El proceso disciplinario se encuentra finalizado. El chat es de solo lectura.
        </div>
      </template>

      <template #footer>
        <div v-if="sancionActiva?.estado_dinamico == 3" class="w-100 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <button @click="cerrarSancionDesdeDescargo" class="btn btn-outline-danger fw-bold shadow-sm rounded-pill px-3">
             RESOLVER SANCIÓN
          </button>
          <button @click="enviarDescargoAdmin" class="btn btn-dark fw-bold rounded-pill px-4 shadow-sm" :disabled="enviandoDescargo || (!nuevoMensaje && !fileInput?.files?.length)">
            <span v-if="enviandoDescargo" class="spinner-border spinner-border-sm me-1"></span>
            RESPONDER
          </button>
        </div>
        <div v-else class="w-100 d-flex justify-content-center">
           <button @click="mostrarModalDescargo = false; fetchSanciones()" class="btn btn-light border rounded-pill px-4 fw-bold shadow-sm">CERRAR</button>
        </div>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import { auth } from '@/api/auth'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({ title: 'Gestión de Sanciones | AAAB' })

const notificar = inject('notificar', (msg) => alert(msg.mensaje || msg))

const adminLogueado = ref(auth.getUser() || { id: 1 })
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

// ---- Variables Descargos (Chat) ----
const mostrarModalDescargo = ref(false)
const sancionActiva = ref(null)
const historialDescargos = ref([])
const cargandoDescargos = ref(false)
const nuevoMensaje = ref('')
const enviandoDescargo = ref(false)
const fileInput = ref(null)

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

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
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
    es_indefinido: s.es_indefinido
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

// ----- MÉTODOS DE DESCARGO (CHAT) -----

const gestionarDescargo = async (sancion) => {
  sancionActiva.value = sancion;
  mostrarModalDescargo.value = true;
  await cargarDescargos(sancion.id);

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

const enviarDescargoAdmin = async () => {
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
    emisor_tipo: 'admin',
    emisor_id: adminLogueado.value.id,
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
  } catch {
    notificar({ titulo: 'Error', mensaje: 'No se pudo enviar la respuesta', tipo: 'danger' });
  } finally {
    enviandoDescargo.value = false;
  }
};

const cerrarSancionDesdeDescargo = () => {
  mostrarModalDescargo.value = false;
  editarSancion(sancionActiva.value);
};

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
/* ====================================================
   1. BASE (MOBILE FIRST - CELULARES POR DEFECTO)
   ==================================================== */

.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; }

/* Ajuste específico para celulares */
@media (max-width: 767px) {
  .full-screen-wrapper { padding: 0 15px 20px 15px !important; }
  .admin-panel { padding: 0 !important; border-radius: 0; }
}

.admin-panel {
  width: 100%; max-width: 100%; padding: 0;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000; background-color: #0f172a; min-height: 100vh;
  box-sizing: border-box;
}

.main-card { border-radius: 12px; overflow: hidden; }

/* Cabecera Móvil */
.header-section {
  background: white; padding: 15px; display: flex;
  flex-direction: column; align-items: flex-start;
  gap: 15px; border-left: 5px solid #dc2626;
}

.title { font-size: 1.25rem; font-weight: bold; margin: 0; }
.counter { font-size: 0.85rem; color: #000000; }

/* Botones Móvil (42x42 centrados) */
.header-actions { width: 100%; display: flex; justify-content: center; gap: 8px; }
.btn-action {
  border: none; border-radius: 4px; font-weight: bold; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  width: 42px; height: 42px; padding: 0; transition: opacity 0.2s;
}
.btn-text { display: none; }

.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; }
.btn-export { background: #10b981; color: white; }

/* Filtros Móvil */
.mobile-filter-panel { background: #e2e8f0; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.filter-input-mobile { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 100%; outline: none; background: #e2e8f0; }
.full-width { grid-column: span 2; }

/* Cards Móviles */
.card-licencia { background: white; padding: 15px; border: 1px solid #e2e8f0; }
.card-name { font-size: 1.05rem; }
.badge-mobile-status { padding: 3px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 700; }
.bg-light-custom { background-color: #e2e8f0 !important; }

.btn-editar-mobile { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; justify-content: center; gap: 8px; }
.btn-historial-mobile { background: #fef3c7; border: 1px solid #fde047; color: #d97706; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; }
.btn-eliminar-mobile { background: #fee2e2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; font-weight: bold; }

/* Estados (Comunes) */
.text-en-proceso { color: #d97706 !important; }
.text-anulada { color: #0f172a !important; }
.badge-status { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; display: inline-block; text-align: center; border: 1px solid; }
.badge-status.aprobada { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.badge-status.rechazada { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.badge-status.pendiente { background: #fef9c3; color: #a16207; border-color: #fef08a; }
.badge-status.anulada { background: #0f172a; color: #ffffff; border-color: #0f172a; }

/* Utilidades */
.btn-refresh { background: transparent; border: none; cursor: pointer; padding: 0; color: #64748b; }
.material-icons { font-size: 18px; }
.animate__animated { animation-duration: 0.5s; }
.custom-input { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; font-size: 0.95rem; background-color: #ffffff; transition: all 0.3s ease; }
.custom-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); outline: none; }

/* ====================================================
   2. TABLETS Y ESCRITORIO (Desde 768px)
   ==================================================== */
@media (min-width: 768px) {
  .admin-panel { padding: 20px; }

  .header-section { flex-direction: row; align-items: center; justify-content: space-between; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .title { font-size: 1.1rem; }

  .header-actions { width: auto; justify-content: flex-end; gap: 8px; }
  .btn-action { width: auto; height: auto; padding: 8px 12px; gap: 5px; font-size: 0.75rem; }
  .btn-text { display: inline; }

  /* Tabla Desktop */
  .table-container {
    width: 100%; overflow: auto; max-height: 85vh;
    background: white; border-radius: 8px; border: 1px solid #e2e8f0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }

  thead tr.main-header th {
    position: sticky; top: 0; z-index: 50; background: #e2e8f0 !important;
    padding: 12px 8px; border-bottom: 1px solid #cbd5e1; font-weight: 800; text-transform: uppercase; font-size: 0.75rem;
  }
  thead tr.filter-row td {
    position: sticky; top: 35px; z-index: 40; background: #f1f5f9 !important;
    padding: 6px 8px 12px 8px; border-bottom: 4px solid #e2e8f0;
  }

  /* Sticky Columns */
  .sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
  thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #e2e8f0 !important; }
  thead tr.filter-row td.sticky-col { z-index: 95 !important; background-color: #f1f5f9 !important; }

  .col-id { left: 0; width: 50px; text-align: center; }
  .col-acciones { left: 50px; width: 110px; }
  .col-arbitro { left: 160px; width: 180px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

  .cell-ro { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
  .filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; }

  .btn-editar, .btn-historial, .btn-eliminar { display: inline-flex; align-items: center; padding: 4px; border: none; border-radius: 6px; cursor: pointer; transition: 0.2s; }
  .btn-editar { background: #eff6ff; color: #1d4ed8; }
  .btn-historial { background: #fef3c7; color: #d97706; }
  .btn-eliminar { background: #fee2e2; color: #dc2626; }
}
</style>
