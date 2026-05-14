<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-shield-exclamation me-1"></i> Historial de Sanciones
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ sancionesFiltradas.length }} sanciones</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Filtros (Solo Móvil) -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <RouterLink to="/panel-admin/tribunal/cargar-sancion" class="text-decoration-none">
              <button class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger h-100">
                <span class="material-icons fs-6">add_circle</span>
                <span class="fw-bold d-none d-md-inline small">Nuevo</span>
              </button>
            </RouterLink>

            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Sanciones</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2 align-items-center">
            <div class="col-6 col-md-3">
              <input v-model="filtros.arbitro" class="form-control form-control-sm shadow-none" placeholder="Buscar árbitro...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.motivo" class="form-control form-control-sm shadow-none" placeholder="Motivo / Art...">
            </div>
            <div class="col-12 col-md-2">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none">
                <option value="">ESTADO (TODOS)</option>
                <option value="vigente">VIGENTE</option>
                <option value="cumplida">CUMPLIDA</option>
                <option value="en_proceso">EN PROCESO</option>
                <option value="anulada">ANULADA</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <input type="text" v-model="filtros.desde" class="form-control form-control-sm shadow-none text-center" placeholder="Desde (DD/MM/AA)">
            </div>
            <div class="col-6 col-md-2">
              <input type="text" v-model="filtros.hasta" class="form-control form-control-sm shadow-none text-center" placeholder="Hasta (DD/MM/AA)">
            </div>

            <!-- Checkbox de Respuestas Pendientes -->
            <div class="col-12 mt-2 mt-md-0 d-md-none">
              <div class="form-check form-switch bg-white border p-2 rounded shadow-sm">
                <input class="form-check-input ms-1 shadow-none" type="checkbox" role="switch" v-model="filtros.conNuevos" id="conNuevosMob" style="cursor:pointer;">
                <label class="form-check-label ms-2 small fw-bold text-danger cursor-pointer" for="conNuevosMob">Solo pendientes de respuesta</label>
              </div>
            </div>

            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- TABLA (Solo Escritorio) -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem; table-layout: fixed;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 140px;">Acciones</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-arbitro" style="width: 200px;">Árbitro</th>
                  <th class="py-3 text-uppercase text-muted" style="width: 300px;">Motivo / Art.</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="width: 150px;">Sanción</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="width: 100px;">Desde</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="width: 100px;">Hasta</th>
                  <th class="py-3 text-center pe-3 text-uppercase text-muted" style="width: 120px;">Estado</th>
                </tr>
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="fetchSanciones" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1"><i class="bi bi-arrow-clockwise"></i></button>
                  </td>
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-acciones">
                    <div class="form-check form-switch d-flex justify-content-center m-0" title="Ver solo pendientes de respuesta">
                      <input class="form-check-input shadow-none" type="checkbox" v-model="filtros.conNuevos" style="cursor: pointer;">
                    </div>
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-arbitro"><input v-model="filtros.arbitro" class="form-control form-control-sm shadow-none" placeholder="Buscar árbitro..."></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.motivo" class="form-control form-control-sm shadow-none" placeholder="Filtrar motivo..."></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.sancion" class="form-control form-control-sm shadow-none text-center" placeholder="Filtrar..."></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.desde" class="form-control form-control-sm shadow-none text-center" placeholder="DD/MM/AA"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.hasta" class="form-control form-control-sm shadow-none text-center" placeholder="DD/MM/AA"></td>
                  <td class="p-2 border-bottom border-2 pe-3">
                    <select v-model="filtros.estado" class="form-select form-select-sm shadow-none text-center font-monospace">
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
                  <td class="text-center text-muted fw-bold font-monospace col-fija col-id">{{ s.id }}</td>
                  <td class="text-center col-fija col-acciones">
                    <div class="d-flex justify-content-center gap-1">

                      <!-- Botón de Chat Dinámico (Refactorizado a clases de Bootstrap) -->
                      <button @click="gestionarDescargo(s)" class="btn btn-sm shadow-sm rounded p-1 position-relative d-flex align-items-center justify-content-center"
                              :class="s.estado_dinamico == 3 ? (s.tiene_nuevos ? 'btn-danger text-white border-danger' : 'btn-primary text-white border-primary') : 'btn-secondary text-white border-secondary'"
                              :title="s.estado_dinamico == 3 ? 'Ver Descargos' : 'Historial Chat'">
                        <span class="material-icons" style="font-size:16px;">{{ s.estado_dinamico == 3 ? 'chat' : 'history' }}</span>
                        <span v-if="s.tiene_nuevos && s.estado_dinamico == 3" class="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle"></span>
                      </button>

                      <button @click="editarSancion(s)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar"><span class="material-icons" style="font-size:16px;">edit</span></button>
                      <button @click="verHistorialArbitro(s)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Historial"><span class="material-icons" style="font-size:16px;">manage_search</span></button>
                      <button @click="eliminarSancionRegistro(s.id)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Eliminar"><span class="material-icons" style="font-size:16px;">delete</span></button>
                    </div>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-arbitro text-truncate" :title="s.arbitro">{{ s.arbitro }}</td>
                  <td class="text-muted">
                    <div class="text-truncate" style="max-width: 280px;" :title="s.motivo">
                      <strong class="text-dark">Art. {{ s.articulo }}</strong> - {{ s.motivo }}
                    </div>
                  </td>
                  <td class="text-center fw-bold">
                    <span :class="obtenerClaseTextoSancion(s.estado_dinamico)">{{ s.sancion }}</span>
                  </td>
                  <td class="text-center fw-bold">{{ s.desde_formateada || '-' }}</td>
                  <td class="text-center fw-bold">
                    <span v-if="s.es_indefinido == 1" class="text-danger">Indefinido</span>
                    <span v-else>{{ s.hasta_formateada || '-' }}</span>
                  </td>
                  <td class="text-center pe-3">
                    <span :class="['badge-status-sm', obtenerClaseEstado(s.estado_dinamico)]">
                      {{ obtenerTextoEstado(s.estado_dinamico) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="sancionesPaginadas.length === 0">
                  <td colspan="8" class="py-5 text-center text-muted border-0 bg-white">
                    <span class="material-icons d-block fs-1 mb-2">search_off</span>
                    <p class="m-0 fw-bold">No se encontraron sanciones.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS (Solo Celular) -->
          <div class="d-md-none p-3 bg-light">
            <div v-for="s in sancionesPaginadas" :key="'mob-'+s.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">

              <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">
                  {{ s.arbitro }}
                </div>
                <div class="small text-muted fw-bold font-monospace">#{{ s.id }}</div>
              </div>

              <div class="px-3 pt-1 pb-2">
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2">
                  <span :class="obtenerClaseTextoSancion(s.estado_dinamico)" class="fs-6 fw-bold">{{ s.sancion }}</span>
                  <span :class="['badge-status-sm', obtenerClaseEstado(s.estado_dinamico, true)]">
                    {{ obtenerTextoEstado(s.estado_dinamico) }}
                  </span>
                </div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <p class="text-muted small mb-3 mt-1 lh-sm">
                  <strong class="text-dark" v-if="s.articulo">Art. {{ s.articulo }} -</strong> {{ s.motivo }}
                </p>

                <div class="bg-light p-2 rounded border d-flex justify-content-between align-items-center mb-3 border-light-subtle">
                  <span class="small text-muted">Desde: <strong class="text-dark">{{ s.desde_formateada || '-' }}</strong></span>
                  <span class="small text-muted">Hasta:
                    <strong class="text-danger" v-if="s.es_indefinido == 1">Indefinido</strong>
                    <strong class="text-dark" v-else-if="s.hasta_formateada">{{ s.hasta_formateada }}</strong>
                    <strong class="text-dark" v-else>-</strong>
                  </span>
                </div>

                <div class="d-flex gap-2 flex-wrap">
                  <!-- Botón Chat Móvil -->
                  <button @click="gestionarDescargo(s)" class="btn btn-sm flex-grow-1 shadow-sm position-relative d-flex justify-content-center align-items-center gap-1 fw-bold"
                          :class="s.estado_dinamico == 3 ? (s.tiene_nuevos ? 'btn-outline-danger' : 'btn-outline-primary') : 'btn-outline-secondary'">
                    <span class="material-icons" style="font-size: 16px;">{{ s.estado_dinamico == 3 ? 'chat' : 'history' }}</span>
                    {{ s.estado_dinamico == 3 ? (s.tiene_nuevos ? 'NUEVOS' : 'DESCARGOS') : 'HISTORIAL' }}
                    <span v-if="s.tiene_nuevos && s.estado_dinamico == 3" class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style="margin-left: -15px;"></span>
                  </button>
                  <button @click="editarSancion(s)" class="btn btn-sm btn-outline-primary shadow-sm px-3"><span class="material-icons" style="font-size: 18px;">edit</span></button>
                  <button @click="verHistorialArbitro(s)" class="btn btn-sm btn-outline-warning shadow-sm px-3"><span class="material-icons" style="font-size: 18px;">manage_search</span></button>
                  <button @click="eliminarSancionRegistro(s.id)" class="btn btn-sm btn-outline-danger shadow-sm px-3"><span class="material-icons" style="font-size: 18px;">delete</span></button>
                </div>
              </div>
            </div>

            <div v-if="sancionesPaginadas.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
              <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
              <p class="text-muted m-0 fw-bold">No se encontraron sanciones.</p>
            </div>
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
         MODALES
         ============================================== -->

    <!-- Modal Editar -->
    <ModalBase :show="mostrarModalEditar" @close="mostrarModalEditar = false" icono="edit" colorIcono="bg-info-subtle text-primary" maxWidth="500px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Editar Sanción</span>
          <div class="text-muted small">ID #{{ formModal.id }} — {{ formModal.arbitro }}</div>
        </div>
      </template>
      <div class="row g-3 text-start mt-1">
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
          <div class="form-check bg-light p-2 rounded border border-light-subtle d-flex align-items-center gap-2">
            <input class="form-check-input m-0 shadow-none" type="checkbox" v-model="formModal.es_indefinido" :true-value="1" :false-value="0" id="checkIndefinido">
            <label class="form-check-label small fw-bold text-dark m-0 mt-1" for="checkIndefinido" style="cursor: pointer;">
              Sanción Indefinida (Hasta nuevo aviso)
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="mostrarModalEditar = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0">CANCELAR</button>
        <button @click="confirmarEdicion" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="cargandoProceso">
          <span v-if="cargandoProceso" class="spinner-border spinner-border-sm me-1"></span>
          {{ cargandoProceso ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
        </button>
      </template>
    </ModalBase>

    <!-- Modal Historial del Árbitro -->
    <ModalBase :show="mostrarModalHistorial" @close="mostrarModalHistorial = false" icono="manage_search" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="750px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Historial de {{ arbitroHistorial?.arbitro || 'Árbitro' }}</span>
          <div v-if="!cargandoHistorial" class="mt-1">
            <span class="badge bg-dark rounded-pill fs-6">{{ historialSanciones.length }} Sanciones</span>
          </div>
        </div>
      </template>

      <div v-if="cargandoHistorial" class="text-center py-5">
        <span class="spinner-border text-warning"></span>
      </div>

      <div v-else-if="historialSanciones.length === 0" class="text-center py-5 text-muted bg-light rounded-4 shadow-sm border border-light-subtle">
        <span class="material-icons d-block mb-2 fs-1 text-muted opacity-50">history_toggle_off</span>
        <p class="mb-0 fw-bold">Sin registros previos.</p>
      </div>

      <div v-else>
        <!-- Historial PC -->
        <div class="table-responsive d-none d-md-block bg-white rounded shadow-sm border border-light-subtle">
          <table class="table table-hover align-middle m-0" style="font-size: 0.85rem;">
            <thead class="table-light">
              <tr>
                <th class="py-3 ps-3 fw-bold text-uppercase text-muted" style="width: 250px;">Art. / Motivo</th>
                <th class="py-3 fw-bold text-uppercase text-muted" style="width: 120px;">Sanción</th>
                <th class="py-3 fw-bold text-uppercase text-muted" style="width: 150px;">Fechas</th>
                <th class="text-center py-3 pe-3 fw-bold text-uppercase text-muted" style="width: 120px;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historialSanciones" :key="h.id">
                <td class="py-3 ps-3 pe-2 text-wrap">
                  <span class="fw-bold text-dark">Art. {{ h.articulo }}</span><br>
                  <span class="text-muted small">{{ h.motivo }}</span>
                </td>
                <td class="py-3 pe-2">
                  <span :class="obtenerClaseTextoSancion(h.estado_dinamico)" class="fw-bold">{{ h.sancion }}</span>
                </td>
                <td class="py-3 pe-2 small text-muted">
                  <strong class="text-dark">D: </strong> {{ h.desde_formateada || h.desde || '-' }}<br>
                  <strong class="text-dark">H: </strong>
                  <span :class="h.es_indefinido == 1 ? 'text-danger fw-bold' : 'text-dark'">
                    {{ h.es_indefinido == 1 ? 'Indefinido' : (h.hasta_formateada || h.hasta || '-') }}
                  </span>
                </td>
                <td class="text-center py-3 pe-3">
                  <span :class="['badge-status-sm', obtenerClaseEstado(h.estado_dinamico, true)]">
                    {{ obtenerTextoEstado(h.estado_dinamico) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Historial Móvil -->
        <div class="d-md-none d-flex flex-column gap-2">
          <div v-for="h in historialSanciones" :key="'mob-hist-'+h.id" class="border border-light-subtle rounded-3 p-3 shadow-sm bg-white">
            <div class="d-flex justify-content-between align-items-start mb-2 border-bottom border-secondary-subtle pb-2">
              <div>
                <span class="d-block fw-bold text-dark">Art. {{ h.articulo }}</span>
                <span class="text-muted small lh-sm">{{ h.motivo }}</span>
              </div>
              <span :class="['badge-status-sm', obtenerClaseEstado(h.estado_dinamico, true)]" class="text-center">
                {{ obtenerTextoEstado(h.estado_dinamico) }}
              </span>
            </div>
            <div class="mt-2 mb-3">
              <span :class="obtenerClaseTextoSancion(h.estado_dinamico)" class="fw-bold">{{ h.sancion }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center text-muted small bg-light p-2 rounded border border-light-subtle">
              <span><strong>Desde:</strong> {{ h.desde_formateada || h.desde || '-' }}</span>
              <span><strong>Hasta:</strong>
                <span :class="h.es_indefinido == 1 ? 'text-danger fw-bold' : 'text-dark'">
                  {{ h.es_indefinido == 1 ? 'Indefinido' : (h.hasta_formateada || h.hasta || '-') }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>

    <!-- Modal Descargo (CHAT) -->
    <ModalBase :show="mostrarModalDescargo" @close="mostrarModalDescargo = false; fetchSanciones()" icono="forum" colorIcono="bg-primary-subtle text-primary" maxWidth="900px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Descargos: {{ sancionActiva?.arbitro }}</span>
          <div class="text-muted small mt-1">Sanción Art. {{ sancionActiva?.articulo }}</div>
        </div>
      </template>

      <!-- Caja de Chat -->
      <div class="chat-container bg-light border border-light-subtle rounded-3 p-3 p-md-4 mb-3" style="height: 50vh; overflow-y: auto;">
        <div v-if="cargandoDescargos" class="text-center mt-4"><span class="spinner-border text-primary"></span></div>

        <div v-else-if="historialDescargos.length === 0" class="text-center text-muted mt-5">
          <span class="material-icons fs-1 opacity-50 mb-2">forum</span><br>
          {{ sancionActiva?.estado_dinamico == 3 ? 'Esperando descargo del árbitro.' : 'No se registraron descargos para esta sanción.' }}
        </div>

        <div v-else v-for="d in historialDescargos" :key="d.id" class="mb-3 d-flex flex-column" :class="d.emisor_tipo === 'admin' ? 'align-items-end' : 'align-items-start'">
          <!-- Burbuja de mensaje -->
          <div :class="d.emisor_tipo === 'admin' ? 'bg-dark text-white' : 'bg-white border text-dark'" class="p-3 rounded-4 shadow-sm" style="max-width: 85%;">
            <div class="small fw-bold mb-1" :class="d.emisor_tipo === 'admin' ? 'text-light' : 'text-primary'">
              {{ d.emisor_tipo === 'admin' ? 'Tribunal de Ética' : sancionActiva?.arbitro }}
            </div>
            <div style="white-space: pre-line;">{{ d.mensaje }}</div>

            <!-- Archivos Adjuntos -->
            <div v-if="d.archivos && d.archivos.length > 0" class="mt-2 border-top pt-2" :class="d.emisor_tipo === 'admin' ? 'border-secondary' : 'border-light-subtle'">
              <div v-for="arc in d.archivos" :key="arc.url_completa" class="small mb-1">
                <!-- Imagen -->
                <div v-if="arc.archivo_nombre.match(/\.(jpeg|jpg|gif|png)$/i)" class="mt-1">
                  <a :href="arc.url_completa" target="_blank" title="Ver imagen completa">
                    <img :src="arc.url_completa" class="img-thumbnail border-0 shadow-sm rounded" style="max-height: 100px; max-width: 100%; object-fit: cover; cursor: pointer;" :alt="arc.archivo_nombre">
                  </a>
                </div>
                <!-- Documento -->
                <div v-else>
                  <a :href="arc.url_completa" target="_blank" class="fw-bold" :class="d.emisor_tipo === 'admin' ? 'text-white text-decoration-underline' : 'text-primary text-decoration-none'">
                    <i class="bi bi-paperclip"></i> {{ arc.archivo_nombre }}
                  </a>
                </div>
              </div>
            </div>
            <div class="text-end mt-2 font-monospace" style="font-size: 0.65rem; opacity: 0.7;">{{ d.fecha_formateada }}</div>
          </div>
        </div>
      </div>

      <!-- Formulario de Respuesta (Solo si está en proceso) -->
      <template v-if="sancionActiva?.estado_dinamico == 3">
        <div class="row g-2">
          <div class="col-12">
            <textarea v-model="nuevoMensaje" class="form-control shadow-sm border-secondary-subtle" rows="3" placeholder="Escribir respuesta al árbitro..."></textarea>
          </div>
          <div class="col-12">
            <input type="file" ref="fileInput" multiple class="form-control form-control-sm shadow-sm border-secondary-subtle bg-light" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
          </div>
        </div>
      </template>
      <!-- Aviso de Chat Cerrado -->
      <template v-else>
        <div class="alert alert-secondary text-center small mb-0 border-0 shadow-sm rounded-3">
          <i class="bi bi-info-circle-fill me-1"></i> El proceso disciplinario se encuentra finalizado. El chat es de solo lectura.
        </div>
      </template>

      <template #footer>
        <div v-if="sancionActiva?.estado_dinamico == 3" class="w-100 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <button @click="cerrarSancionDesdeDescargo" class="btn btn-outline-danger fw-bold shadow-sm rounded-pill px-3 w-100 w-md-auto mb-2 mb-md-0">
             RESOLVER SANCIÓN
          </button>
          <button @click="enviarDescargoAdmin" class="btn btn-dark fw-bold rounded-pill px-5 shadow-sm w-100 w-md-auto" :disabled="enviandoDescargo || (!nuevoMensaje && !fileInput?.files?.length)">
            <span v-if="enviandoDescargo" class="spinner-border spinner-border-sm me-1"></span>
            RESPONDER AL ÁRBITRO
          </button>
        </div>
        <div v-else class="w-100 d-flex justify-content-center">
           <button @click="mostrarModalDescargo = false; fetchSanciones()" class="btn btn-light border rounded-pill px-5 fw-bold shadow-sm">CERRAR CHAT</button>
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
  arbitro: '', motivo: '', sancion: '', desde: '', hasta: '', estado: '', conNuevos: false
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

  if (estado_dinamico == 1) return `${prefijo} vigente`;
  if (estado_dinamico == 2) return `${prefijo} cumplida`;
  if (estado_dinamico == 3) return `${prefijo} en-proceso`;
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

    let matchNuevos = true
    if (filtros.conNuevos) matchNuevos = (s.tiene_nuevos && s.estado_dinamico == 3);

    return matchArb && matchMot && matchSan && matchDes && matchHas && matchEst && matchNuevos
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
  filtros.arbitro = ''; filtros.motivo = ''; filtros.sancion = ''; filtros.desde = ''; filtros.hasta = ''; filtros.estado = ''; filtros.conNuevos = false;
}

onMounted(fetchSanciones)
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
   ESTADOS DE SANCIONES (Badges y Textos)
   ==================================================== */
.text-en-proceso { color: #d97706 !important; }
.text-anulada { color: #0f172a !important; }

/* Base para los badges de estado */
.badge-status-sm {
  border-radius: 20px;
  font-weight: 700;
  display: inline-block;
  text-align: center;
  border: 1px solid;
  padding: 4px 10px;
  font-size: 0.65rem;
  white-space: nowrap;
}

.vigente { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.cumplida { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.en-proceso { background: #fef9c3; color: #a16207; border-color: #fef08a; }
.anulada { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }

/* ====================================================
   UTILIDADES
   ==================================================== */
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.animate__animated { animation-duration: 0.5s; }

/* ====================================================
   TABLA CON COLUMNAS FIJAS Y SIN LÍNEAS
   ==================================================== */
.tabla-sin-lineas th,
.tabla-sin-lineas td {
  border-left: none !important;
  border-right: none !important;
}

.tabla-fija {
  border-collapse: separate;
  border-spacing: 0;
}

@media (min-width: 768px) {
  /* Columnas fijas base */
  .col-fija {
    position: sticky !important;
    background-color: inherit;
    z-index: 10;
  }

  /* Fondo thead y Z-INDEX 12 (Tapa el scroll vertical) */
  .tabla-fija thead .col-fija {
    background-color: #f8f9fa !important;
    z-index: 12;
  }

  /* Fondo tbody */
  .tabla-fija tbody .col-fija {
    background-color: #ffffff !important;
  }

  /* Posiciones y anchos calculados */
  .col-id       { left: 0; min-width: 50px !important; max-width: 50px !important; }
  .col-acciones { left: 50px; min-width: 140px !important; max-width: 140px !important; }
  .col-arbitro  {
    left: 190px;
    min-width: 200px !important;
    max-width: 200px !important;
    box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1);
  }
}
</style>


