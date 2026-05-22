<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- Header -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-clipboard2-check-fill me-1"></i> Gestión de Exámenes
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ totalFiltrados }} árbitros</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2" aria-label="Mostrar filtros">
              <span class="material-icons fs-6">filter_alt</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" aria-label="Limpiar filtros">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0" aria-label="Exportar a Excel">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel ({{ totalFiltrados }})</span>
            </button>
          </div>
        </div>

        <!-- Filtros Mobile -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Árbitros</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm" aria-label="Cerrar filtros"></button>
          </div>
          <div class="row g-2">
            <div class="col-6"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido..."></div>
            <div class="col-6"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre..."></div>
            <div class="col-6">
              <select v-model="filtros.grupo" class="form-select form-select-sm shadow-none">
                <option value="">Todos los grupos</option>
                <option v-for="g in GRUPOS" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.año" class="form-select form-select-sm shadow-none">
                <option value="">Todos los años</option>
                <option v-for="a in añosDisponibles" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.tieneTipo" class="form-select form-select-sm shadow-none">
                <option value="">Cualquier tipo</option>
                <option v-for="t in TIPOS_EXAMEN" :key="t" :value="t">{{ t.toUpperCase() }}</option>
              </select>
            </div>
            <div class="col-6">
              <select v-model="filtros.tieneEstado" class="form-select form-select-sm shadow-none">
                <option value="">Cualquier estado</option>
                <option v-for="[val, label] in OPCIONES_ESTADO_FILTRO" :key="val" :value="val">{{ label }}</option>
              </select>
            </div>
            <div class="col-12 mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- Tabla Desktop -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th @click="ordenarPor('id')" class="py-3 ps-3 text-uppercase text-muted col-fija col-id sortable">
                    ID <SortIcon :campo="'id'" :actual="ordenamiento" />
                  </th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones">Acciones</th>
                  <th @click="ordenarPor('apellido')" class="py-3 text-uppercase text-muted col-fija col-apellido sortable">
                    Apellido <SortIcon :campo="'apellido'" :actual="ordenamiento" />
                  </th>
                  <th @click="ordenarPor('nombre')" class="py-3 text-uppercase text-muted col-fija col-nombre sortable">
                    Nombre <SortIcon :campo="'nombre'" :actual="ordenamiento" />
                  </th>
                  <th @click="ordenarPor('grupo')" class="py-3 text-center text-uppercase text-muted sortable">
                    Grupo <SortIcon :campo="'grupo'" :actual="ordenamiento" />
                  </th>
                  <th @click="ordenarPor('cantidad')" class="py-3 text-center text-uppercase text-muted sortable">
                    Exámenes <SortIcon :campo="'cantidad'" :actual="ordenamiento" />
                  </th>
                  <th @click="ordenarPor('ultimo')" class="py-3 text-uppercase text-muted sortable">
                    Último Examen <SortIcon :campo="'ultimo'" :actual="ordenamiento" />
                  </th>
                  <th class="py-3 text-uppercase text-muted">Resumen evaluaciones</th>
                </tr>
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="cargarTodo" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1" aria-label="Recargar datos">
                      <i class="bi bi-arrow-clockwise"></i>
                    </button>
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-acciones"></td>
                  <td class="p-2 border-bottom border-2 col-fija col-apellido"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
                  <td class="p-2 border-bottom border-2 col-fija col-nombre"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.grupo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option v-for="g in GRUPOS" :key="g" :value="g">{{ g }}</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.año" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option v-for="a in añosDisponibles" :key="a" :value="a">{{ a }}</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.tieneTipo" class="form-select form-select-sm shadow-none">
                      <option value="">Cualquiera</option>
                      <option v-for="t in TIPOS_EXAMEN" :key="t" :value="t">{{ t.toUpperCase() }}</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.tieneEstado" class="form-select form-select-sm shadow-none">
                      <option value="">Cualquiera</option>
                      <option v-for="[val, label] in OPCIONES_ESTADO_FILTRO" :key="val" :value="val">{{ label }}</option>
                    </select>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr v-if="cargandoInicial">
                  <td colspan="8" class="text-center py-5">
                    <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
                    <span class="ms-2 fw-bold text-muted">Cargando datos...</span>
                  </td>
                </tr>
                <tr v-else-if="!arbitrosPaginados.length">
                  <td colspan="8" class="text-center py-4 text-muted">
                    <span class="material-icons opacity-50 d-block mb-2" style="font-size: 32px;">search_off</span>
                    <span class="fw-bold">No se encontraron árbitros.</span>
                  </td>
                </tr>
                <tr v-else v-for="a in arbitrosPaginados" :key="a.id" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                  <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ a.id }}</td>
                  <td class="text-center col-fija col-acciones">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="abrirGestionExamenes(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Gestionar exámenes" aria-label="Gestionar exámenes">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verDetalleArbitro(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver detalle" aria-label="Ver detalle del árbitro">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                    </div>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                  <td class="text-center text-dark">{{ a.grupo }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></td>
                  <td class="text-center">
                    <span class="badge bg-dark rounded-pill px-2 py-1">{{ (examenesPorArbitro[a.id] || []).length }}</span>
                  </td>
                  <td class="text-dark">
                    <template v-if="ultimoExamen(a.id)">
                      <span class="fw-bold">{{ formatFecha(ultimoExamen(a.id).fecha_examen) }}</span>
                      <span class="text-muted text-uppercase ms-1">— {{ ultimoExamen(a.id).tipo }}</span>
                    </template>
                    <span v-else class="text-muted fst-italic small">Sin exámenes</span>
                  </td>
                  <td><ResumenBadges :resumen="resumenEvaluaciones(a.id)" /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cards Mobile -->
          <div class="d-md-none p-3 bg-light">
            <div v-if="cargandoInicial" class="text-center p-4 bg-white rounded-3 shadow-sm border">
              <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
              <p class="m-0 mt-2 small fw-bold text-muted">Cargando datos...</p>
            </div>
            <template v-else>
              <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">{{ a.apellido }}, {{ a.nombre }}</div>
                  <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
                </div>
                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex justify-content-between text-dark mb-2 border-bottom border-secondary-subtle pb-2">
                    <span class="small"><strong>Grupo:</strong> {{ a.grupo || '-' }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></span>
                    <span class="small"><strong>Exámenes:</strong> {{ (examenesPorArbitro[a.id] || []).length }}</span>
                  </div>
                  <div class="bg-light p-2 rounded border small mb-3 border-light-subtle">
                    <p class="m-0 fw-bold text-uppercase text-muted mb-1" style="font-size: 0.7rem;">Último examen</p>
                    <p class="m-0 text-dark" v-if="ultimoExamen(a.id)">
                      <strong>{{ formatFecha(ultimoExamen(a.id).fecha_examen) }}</strong>
                      <span class="text-muted text-uppercase ms-1">— {{ ultimoExamen(a.id).tipo }}</span>
                    </p>
                    <p v-else class="m-0 text-muted fst-italic small">Sin exámenes cargados</p>
                    <div class="mt-2"><ResumenBadges :resumen="resumenEvaluaciones(a.id)" mobile /></div>
                  </div>
                  <div class="d-flex gap-2">
                    <button @click="abrirGestionExamenes(a)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold" aria-label="Gestionar exámenes">
                      <span class="material-icons" style="font-size: 16px;">edit_note</span> GESTIONAR
                    </button>
                    <button @click="verDetalleArbitro(a)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center" aria-label="Ver detalle del árbitro">
                      <span class="material-icons" style="font-size: 18px;">manage_search</span>
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="!arbitrosPaginados.length" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
                <p class="text-muted m-0 fw-bold">No se encontraron árbitros.</p>
              </div>
            </template>
          </div>

          <!-- Paginación -->
          <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1" aria-label="Página anterior">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas" aria-label="Página siguiente">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal Gestión -->
    <ModalBase :show="mostrarModal" @close="cerrarModal" icono="edit_note" colorIcono="bg-primary-subtle text-primary" maxWidth="850px">
      <template #header>
        <div class="d-flex flex-column align-items-center text-center w-100">
          <span class="fw-bold fs-5">Exámenes de {{ arbitroEnModal.apellido }}, {{ arbitroEnModal.nombre }}</span>
          <div class="text-muted small mt-1">
            <span v-if="vistaModal === 'lista'">Editá un examen existente o agregá uno nuevo</span>
            <span v-else>{{ modoFormulario === 'editar' ? 'Editando examen #' + formExamen.id : 'Nuevo examen' }}</span>
          </div>
        </div>
      </template>

      <!-- Vista lista -->
      <div v-if="vistaModal === 'lista'">
        <div class="d-flex justify-content-end mb-3 mt-2">
          <button @click="iniciarNuevoExamen" class="btn btn-danger shadow-sm fw-bold d-flex align-items-center gap-1">
            <span class="material-icons" style="font-size: 18px;">add_circle</span> Agregar Examen
          </button>
        </div>
        <div v-if="!examenesDelArbitro.length" class="text-center py-5 bg-light rounded shadow-sm border border-light-subtle">
          <span class="material-icons d-block mb-2" style="font-size: 48px; color: #cbd5e1;">assignment</span>
          <p class="text-muted fw-bold m-0">Este árbitro todavía no tiene exámenes cargados.</p>
          <p class="text-muted small m-0 mt-1">Hacé click en "Agregar Examen" para empezar.</p>
        </div>
        <div v-else class="d-flex flex-column gap-2 pb-2">
          <div v-for="ex in examenesDelArbitro" :key="ex.id" class="card border border-light-subtle shadow-sm">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start mb-2 border-bottom border-secondary-subtle pb-2">
                <div>
                  <span class="badge bg-dark text-white me-2 font-monospace">#{{ ex.id }}</span>
                  <span class="fw-bold text-dark">{{ formatFecha(ex.fecha_examen) }}</span>
                  <span class="badge ms-2 text-uppercase" :class="badgeTipo(ex.tipo)">{{ ex.tipo }}</span>
                </div>
                <button @click="iniciarEditarExamen(ex)" class="btn btn-sm btn-light border shadow-sm text-primary py-0 px-2" aria-label="Editar examen">
                  <span class="material-icons" style="font-size: 16px; top: 2px; position:relative;">edit</span>
                </button>
              </div>
              <DetallesExamen :detalles="ex.detalles" />
            </div>
          </div>
        </div>
      </div>

      <!-- Vista formulario -->
      <form v-else id="formExamen" @submit.prevent="modoFormulario === 'editar' ? confirmarEdicion() : confirmarAlta()" class="text-start">
        <div class="row g-3 pb-3">
          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-0">Datos del examen</div>
          <div class="col-md-4">
            <label class="small fw-bold text-dark mb-1">Fecha *</label>
            <input type="date" v-model="formExamen.fecha_examen" :max="fechaMaxima" class="form-control shadow-none border-secondary-subtle" required>
          </div>
          <div class="col-md-4">
            <label class="small fw-bold text-dark mb-1">Tipo *</label>
            <select v-model="formExamen.tipo" class="form-select shadow-none border-secondary-subtle" required>
              <option value="">Seleccionar...</option>
              <option v-for="t in TIPOS_EXAMEN" :key="t" :value="t">{{ t.toUpperCase() }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="small fw-bold text-dark mb-1">Asistencia *</label>
            <select v-model="formExamen.asistencia" class="form-select shadow-none border-secondary-subtle" required>
              <option value="presente">Presente</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>

          <div v-if="formExamen.asistencia === 'ausente' || formExamen.tipo === 'reunion'" class="col-12 mt-3 animate__animated animate__fadeIn">
            <div class="alert alert-secondary border-secondary-subtle text-center small fw-bold mb-0">
              <i class="bi bi-info-circle me-1"></i>
              <template v-if="formExamen.tipo === 'reunion'">Para reuniones solo se registra asistencia. Se guardará como "Presente" automáticamente.</template>
              <template v-else>Al marcar "Ausente", no se requieren evaluaciones y se guardará la ausencia.</template>
            </div>
          </div>

          <div v-if="formExamen.asistencia === 'presente' && formExamen.tipo !== 'reunion'" class="col-12 mt-3 animate__animated animate__fadeIn">
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom border-2 pb-1">
              <span class="small fw-bold text-muted text-uppercase">Evaluaciones</span>
              <button type="button" @click="agregarDetalle" class="btn btn-sm btn-danger py-0 d-flex align-items-center gap-1" aria-label="Agregar subtipo">
                <span class="material-icons" style="font-size: 16px;">add</span> Agregar Subtipo
              </button>
            </div>
            <div v-if="formExamen.tipo === 'asamblea'" class="alert alert-info py-2 px-3 small mb-3 border-info-subtle">
              <i class="bi bi-lightbulb me-1"></i>
              <strong>Tip:</strong> En asambleas se suele evaluar Teórico (75% o más para aprobar) y YoYo (con calificación y estado).
            </div>
            <div v-for="(detalle, index) in formExamen.detalles" :key="index" class="row g-2 mb-2 align-items-end bg-light p-2 rounded border border-light-subtle">
              <div class="col-md-4">
                <label class="small fw-bold text-dark mb-1">Subtipo *</label>
                <select v-model="detalle.subtipo" class="form-select form-select-sm shadow-none border-secondary-subtle" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="s in SUBTIPOS_EXAMEN" :key="s" :value="s">{{ s.toUpperCase() }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="small fw-bold text-dark mb-1">Estado *</label>
                <select v-model.number="detalle.estado" class="form-select form-select-sm shadow-none border-secondary-subtle" required>
                  <option :value="1">Aprobado</option>
                  <option :value="0">Desaprobado</option>
                  <option :value="3">No lo hizo</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="small fw-bold text-dark mb-1">Calificación</label>
                <input v-model="detalle.calificacion" maxlength="10" :disabled="detalle.estado == 3" class="form-control form-control-sm shadow-none border-secondary-subtle" placeholder="Ej: 8 / 75%">
              </div>
              <div class="col-md-1 text-end">
                <button v-if="formExamen.detalles.length > 1" type="button" @click="quitarDetalle(index)" class="btn btn-sm btn-danger shadow-sm px-2 w-100" aria-label="Quitar subtipo">
                  <span class="material-icons" style="font-size: 16px;">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer v-if="vistaModal !== 'lista'">
        <button @click="volverAListado" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0">
          <i class="bi bi-chevron-left me-1"></i> Volver al listado
        </button>
        <button type="submit" form="formExamen" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
          {{ modoFormulario === 'editar' ? 'GUARDAR CAMBIOS' : 'CREAR EXAMEN' }}
        </button>
      </template>
    </ModalBase>

    <!-- Modal Detalle del Árbitro -->
    <ModalBase :show="mostrarModalDetalle" @close="mostrarModalDetalle = false" icono="person_search" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="950px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Detalle de {{ arbitroSeleccionado.apellido }}, {{ arbitroSeleccionado.nombre }}</span>
          <div class="text-muted small mt-1">Vista general de exámenes y reuniones</div>
        </div>
      </template>

      <div v-if="!examenesDelArbitroDetalle.length" class="text-center py-5 text-muted bg-white rounded shadow-sm border border-light-subtle">
        <span class="material-icons d-block fs-1 mb-2 mx-auto" style="font-size: 48px; color: #cbd5e1;">history_toggle_off</span>
        <p class="mb-0 fw-bold">No hay exámenes registrados para este árbitro.</p>
      </div>

      <div v-else>
        <!-- Filtro año dentro del modal -->
        <div class="d-flex justify-content-end mb-3" v-if="añosDetalleArbitro.length">
          <div class="d-flex align-items-center gap-2">
            <label class="small fw-bold text-dark text-uppercase m-0">Año:</label>
            <select v-model="filtroAñoDetalle" class="form-select form-select-sm shadow-sm border-secondary-subtle" style="min-width: 140px;">
              <option value="">Todos los años</option>
              <option v-for="año in añosDetalleArbitro" :key="año" :value="año">{{ año }}</option>
            </select>
          </div>
        </div>

        <!-- Resumen stats -->
        <div class="row g-2 mb-4">
          <div v-for="stat in statsResumenDetalle" :key="stat.key" class="col-6 col-md">
            <div class="card border-0 shadow-sm h-100" :class="stat.bgClass">
              <div class="card-body p-2 text-center text-white">
                <i class="bi" :class="stat.icon" style="font-size: 1.2rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ stat.value }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección Eventos por Tipo -->
        <div class="mb-4">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-warning">
            <span class="material-icons text-warning-emphasis me-2">event_note</span>
            <h6 class="fw-bold m-0 text-dark text-uppercase">Eventos</h6>
          </div>

          <div v-for="tipo in tiposDelArbitro" :key="tipo" class="mb-3">
            <div class="d-flex align-items-center justify-content-between mb-2 bg-white p-2 ps-3 rounded shadow-sm border border-light-subtle">
              <div class="d-flex align-items-center gap-2">
                <span class="badge text-uppercase px-2 py-1" :class="badgeTipo(tipo)">{{ tipo }}</span>
                <span class="small text-muted fw-bold">
                  {{ examenesPorTipoDetalle[tipo].length }} {{ examenesPorTipoDetalle[tipo].length === 1 ? 'registro' : 'registros' }}
                </span>
              </div>
              <span class="d-none d-md-inline small text-muted fst-italic">
                Último: {{ formatFecha(examenesPorTipoDetalle[tipo][0].fecha_examen) }}
              </span>
            </div>

            <div class="row g-2">
              <div v-for="ex in examenesPorTipoDetalle[tipo]" :key="ex.id" class="col-12 col-md-6">
                <div class="card border border-light-subtle shadow-sm h-100 bg-white">
                  <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start mb-2 border-bottom border-secondary-subtle pb-1">
                      <div class="text-dark fw-bold small">
                        <i class="bi bi-calendar3 me-1 text-muted"></i>
                        {{ formatFecha(ex.fecha_examen) }}
                      </div>
                      <span class="badge bg-dark font-monospace" style="font-size: 0.65rem;">#{{ ex.id }}</span>
                    </div>
                    <DetallesExamen :detalles="ex.detalles" mobile />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección Rendimiento por subtipo -->
        <div v-if="subtiposDelArbitro.length">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-warning">
            <span class="material-icons text-warning-emphasis me-2">trending_up</span>
            <h6 class="fw-bold m-0 text-dark text-uppercase">Rendimiento por Evaluación</h6>
          </div>

          <div class="row g-3">
            <div v-for="sub in subtiposDelArbitro" :key="sub" class="col-12 col-md-6">
              <div class="card border border-light-subtle shadow-sm h-100 bg-white">
                <div class="card-header bg-light d-flex justify-content-between align-items-center border-bottom border-light-subtle py-2">
                  <h6 class="fw-bold text-uppercase m-0 text-dark small d-flex align-items-center gap-2">
                    <i class="bi bi-bar-chart-line text-warning-emphasis"></i>
                    {{ sub }}
                  </h6>
                  <span class="badge bg-dark rounded-pill px-2">{{ evaluacionesPorSubtipoDetalle[sub].length }}</span>
                </div>
                <div class="card-body p-2">
                  <div v-for="(item, idx) in evaluacionesPorSubtipoDetalle[sub]" :key="idx"
                    class="d-flex align-items-center py-1 border-bottom border-secondary-subtle"
                    style="font-size: 0.75rem;">
                    <span class="status-dot me-2 flex-shrink-0" :class="claseDot(item.estado)"></span>
                    <span class="text-dark fw-bold me-2 font-monospace" style="min-width: 75px;">
                      {{ formatFecha(item.fecha_examen) }}
                    </span>
                    <span class="badge bg-light text-dark border me-2 text-uppercase flex-shrink-0 d-none d-sm-inline" style="font-size: 0.6rem;">
                      {{ item.tipo }}
                    </span>
                    <span class="fw-bold flex-grow-1 text-end text-sm-start" :class="claseTextoEstado(item.estado)">
                      {{ textoEstado(item.estado) }}
                    </span>
                    <span v-if="item.calificacion && item.estado != 3" class="text-muted ms-2 fw-bold">
                      ({{ item.calificacion }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>

    <!-- Modal Excel -->
    <ModalBase :show="mostrarModalExcel" @close="mostrarModalExcel = false" icono="description" colorIcono="bg-success-subtle text-success" maxWidth="750px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Exportar Listado</span>
          <div class="text-muted small mt-1">Marcá las columnas que querés incluir en el Excel ({{ totalFiltrados }} árbitros)</div>
        </div>
      </template>
      <div class="row g-2 text-start my-2 mx-auto shadow-sm p-3 rounded-3 bg-light border border-light-subtle" style="max-height: 250px; overflow-y: auto;">
        <div v-for="col in columnasExcel" :key="col.id" class="col-12 col-sm-6">
          <div class="form-check form-switch bg-white border p-2 rounded shadow-sm m-0">
            <input class="form-check-input ms-1 shadow-none" type="checkbox" role="switch" v-model="col.visible" :id="'col-'+col.id" style="cursor:pointer;">
            <label class="form-check-label ms-2 small fw-bold text-dark cursor-pointer" :for="'col-'+col.id">{{ col.label }}</label>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="mostrarModalExcel = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button @click="ejecutarDescargaExcel" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100">DESCARGAR EXCEL</button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch, defineComponent, h } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Exámenes | AAAB',
  meta: [{ name: 'description', content: 'Gestión de exámenes de los árbitros de la AAAB.' }],
})

// ============== CONSTANTES ==============

const TIPOS_EXAMEN = ['reunion', 'asamblea', 'curso', 'recuperatorio', 'otro']
const SUBTIPOS_EXAMEN = ['yoyo', 'teorico', 'mini', 'practica', 'otro']
const GRUPOS = ['LH', 'Pre Liga', 'SR', '1', '2', '3', '4']
const MOBILE_BREAKPOINT = 768

const ESTADO_MAP = {
  0: { texto: 'DESAPROBADO', dot: 'bg-danger',    txt: 'text-danger' },
  1: { texto: 'APROBADO',    dot: 'bg-success',   txt: 'text-success' },
  2: { texto: 'AUSENTE',     dot: 'bg-secondary', txt: 'text-secondary' },
  3: { texto: 'NO LO HIZO',  dot: 'bg-info',      txt: 'text-info' },
  4: { texto: 'PRESENTE',    dot: 'bg-primary',   txt: 'text-primary' },
}

const TIPO_BADGE_MAP = {
  asamblea:     'bg-dark text-white',
  reunion:      'bg-dark text-white',
  curso:        'bg-success text-white',
  recuperatorio:'bg-warning text-dark',
  otro:         'bg-secondary text-white',
}

const OPCIONES_ESTADO_FILTRO = [
  [1,     'Tiene aprobado'],
  [0,     'Tiene desaprobado'],
  [2,     'Tiene ausente'],
  [4,     'Tiene presente (Reunión)'],
  ['sin', 'Sin exámenes'],
]

const RESUMEN_KEYS = [
  { key: 'aprobados',    estado: 1, badge: 'bg-success',   icon: 'bi-check-circle',  label: 'Aprobados',    labelShort: 'aprob.'   },
  { key: 'presentes',    estado: 4, badge: 'bg-primary',   icon: 'bi-person-check',  label: 'Presentes',    labelShort: 'pres.'    },
  { key: 'desaprobados', estado: 0, badge: 'bg-danger',    icon: 'bi-x-circle',      label: 'Desaprobados', labelShort: 'desap.'   },
  { key: 'ausentes',     estado: 2, badge: 'bg-secondary', icon: 'bi-person-dash',   label: 'Ausentes',     labelShort: 'aus.'     },
  { key: 'nohizo',       estado: 3, badge: 'bg-info',      icon: 'bi-dash-circle',   label: 'No lo hizo',   labelShort: 'no hizo'  },
]

const STATS_CONFIG = [
  { key: 'aprobados',    estado: 1, label: 'Aprob.',  bgClass: 'bg-success',   icon: 'bi-check-circle-fill' },
  { key: 'presentes',    estado: 4, label: 'Pres.',   bgClass: 'bg-primary',   icon: 'bi-person-check-fill' },
  { key: 'desaprobados', estado: 0, label: 'Desap.',  bgClass: 'bg-danger',    icon: 'bi-x-circle-fill' },
  { key: 'ausentes',     estado: 2, label: 'Aus.',    bgClass: 'bg-secondary', icon: 'bi-person-dash-fill' },
  { key: 'nohizo',       estado: 3, label: 'No hizo', bgClass: 'bg-info',      icon: 'bi-dash-circle-fill' },
]

// ============== HELPERS ==============

const textoEstado      = (e) => ESTADO_MAP[e]?.texto ?? 'OTRO'
const claseDot         = (e) => ESTADO_MAP[e]?.dot   ?? 'bg-dark'
const claseTextoEstado = (e) => ESTADO_MAP[e]?.txt   ?? 'text-dark'
const badgeTipo        = (t) => TIPO_BADGE_MAP[t]    ?? 'bg-dark text-white'

const normalizarTexto = (v) =>
  String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const formatFecha = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha  = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''

const parseFecha = (f) => {
  const [d, m, y] = (f?.split(' ')[0] ?? '').split('/')
  return new Date(`${y}-${m}-${d}`).getTime() || 0
}

const fechaParaInput = (f) => {
  const [d, m, y] = (f?.split(' ')[0] ?? '').split('/')
  return d && m && y ? `${y}-${m}-${d}` : ''
}

const fechaParaMySQL = (f) => f ? `${f} 00:00:00` : null

// Usa el timestamp cacheado en _ts (ver cargarDatos)
const sortPorFecha = (lista) =>
  [...lista].sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))

// Fecha máxima (hoy) para el input
const fechaMaxima = computed(() => new Date().toISOString().slice(0, 10))

// ============== COMPONENTES INTERNOS ==============

const SortIcon = defineComponent({
  props: { campo: String, actual: Object },
  setup(props) {
    return () => {
      const activo = props.actual.campo === props.campo
      const icon = !activo ? 'bi-arrow-down-up' : (props.actual.dir === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down')
      return h('i', {
        class: `bi ${icon} ms-1 ${activo ? 'text-dark' : 'text-muted opacity-50'}`,
        style: 'font-size: 0.7rem;',
      })
    }
  },
})

const DetallesExamen = defineComponent({
  props: { detalles: Array, mobile: Boolean },
  setup(props) {
    return () => {
      const dets = props.detalles || []
      if (dets.length === 1 && dets[0].estado == 2)
        return h('span', { class: 'badge bg-secondary text-white px-2 py-1' }, 'AUSENTE')
      if (dets.length === 1 && dets[0].estado == 4)
        return h('span', { class: 'badge bg-primary text-white px-2 py-1' }, 'PRESENTE')

      return h('div', { class: 'd-flex flex-wrap gap-1' }, dets.map(det =>
        h('span', {
          key: det.id,
          class: props.mobile
            ? 'badge border bg-white text-dark px-2 py-1 d-block mb-1 w-100 text-start'
            : 'badge border bg-light text-dark px-2 py-1 d-flex align-items-center gap-1',
        }, [
          h('span', { class: 'fw-bold text-uppercase' }, det.subtipo),
          props.mobile ? null : h('span', { class: `status-dot ms-1 ${claseDot(det.estado)}` }),
          h('span', { class: `fw-bold ms-1 ${claseTextoEstado(det.estado)}` }, textoEstado(det.estado)),
          (det.calificacion && det.estado != 3 && det.estado != 2 && det.estado != 4)
            ? h('span', { class: 'text-muted ms-1' }, `(${det.calificacion})`)
            : null,
        ])
      ))
    }
  },
})

const ResumenBadges = defineComponent({
  props: { resumen: Object, mobile: Boolean },
  setup(props) {
    return () => {
      const r = props.resumen
      const items = RESUMEN_KEYS.filter(k => r[k.key] > 0)
      if (!items.length) return h('span', { class: 'text-muted small fst-italic' }, '—')

      return h('div', { class: 'd-flex gap-1 flex-wrap' }, items.map(k =>
        h('span', {
          class: `badge ${k.badge} text-white px-2 py-1`,
          title: k.label,
        }, props.mobile
          ? `${r[k.key]} ${k.labelShort}`
          : [h('i', { class: `bi ${k.icon} me-1` }), String(r[k.key])]
        )
      ))
    }
  },
})

// ============== STATE ==============

const notificar = inject('notificar', (msg) => alert(msg.mensaje || msg))
const arbitros = ref([])
const examenes = ref([])
const cargando = ref(false)
const cargandoInicial = ref(true)
const paginaActual = ref(1)
const registrosPorPagina = 10
const mostrarFiltrosMobile = ref(false)
const mostrarModal = ref(false)
const mostrarModalDetalle = ref(false)
const mostrarModalExcel = ref(false)
const vistaModal = ref('lista')
const modoFormulario = ref('nuevo')
const arbitroEnModal = ref({})
const arbitroSeleccionado = ref({ id: null, apellido: '', nombre: '' })
const filtroAñoDetalle = ref('')

const filtros = reactive({ apellido: '', nombre: '', grupo: '', año: '', tieneTipo: '', tieneEstado: '' })
const ordenamiento = reactive({ campo: 'apellido', dir: 'asc' })

const detallePlantilla = () => ({ subtipo: '', calificacion: '', estado: 1 })
const formExamenVacio = () => ({
  id: null,
  id_arbitro: arbitroEnModal.value?.id ?? '',
  fecha_examen: '',
  tipo: '',
  asistencia: 'presente',
  detalles: [detallePlantilla()],
})
const formExamen = ref(formExamenVacio())
const formExamenSnapshot = ref('') // para detectar cambios sin guardar

const columnasExcel = ref([
  { id: 'id',           label: 'ID Árbitro',       visible: true },
  { id: 'apellido',     label: 'Apellido',          visible: true },
  { id: 'nombre',       label: 'Nombre',            visible: true },
  { id: 'grupo',        label: 'Grupo',             visible: true },
  { id: 'cantidad',     label: 'Cantidad Exámenes', visible: true },
  { id: 'ultimo',       label: 'Último Examen',     visible: true },
  { id: 'aprobados',    label: 'Aprobados',         visible: true },
  { id: 'presentes',    label: 'Presentes',         visible: true },
  { id: 'desaprobados', label: 'Desaprobados',      visible: true },
  { id: 'ausentes',     label: 'Ausentes',          visible: true },
  { id: 'nohizo',       label: 'No lo hizo',        visible: true },
])

// ============== COMPUTEDS GENERALES ==============

const examenesPorArbitro = computed(() =>
  examenes.value.reduce((map, ex) => {
    ;(map[ex.id_arbitro] ??= []).push(ex)
    return map
  }, {})
)

// Búsqueda directa del máximo (sin sort completo)
const ultimoPorArbitro = computed(() => {
  const map = {}
  for (const [id, lista] of Object.entries(examenesPorArbitro.value)) {
    if (!lista.length) { map[id] = null; continue }
    let max = lista[0]
    let maxTs = max._ts ?? 0
    for (let i = 1; i < lista.length; i++) {
      const ts = lista[i]._ts ?? 0
      if (ts > maxTs) { max = lista[i]; maxTs = ts }
    }
    map[id] = max
  }
  return map
})

const resumenPorArbitro = computed(() => {
  const map = {}
  for (const [id, lista] of Object.entries(examenesPorArbitro.value)) {
    const r = { aprobados: 0, desaprobados: 0, ausentes: 0, nohizo: 0, presentes: 0 }
    for (const ex of lista)
      for (const det of (ex.detalles || []))
        if      (det.estado == 1) r.aprobados++
        else if (det.estado == 0) r.desaprobados++
        else if (det.estado == 2) r.ausentes++
        else if (det.estado == 3) r.nohizo++
        else if (det.estado == 4) r.presentes++
    map[id] = { ...r, total: Object.values(r).reduce((a, b) => a + b, 0) }
  }
  return map
})

const ultimoExamen        = (id) => ultimoPorArbitro.value[id]  ?? null
const resumenEvaluaciones = (id) => resumenPorArbitro.value[id] ?? { aprobados: 0, desaprobados: 0, ausentes: 0, nohizo: 0, presentes: 0, total: 0 }

// Años disponibles a partir de todos los exámenes
const añosDisponibles = computed(() => {
  const set = new Set()
  for (const ex of examenes.value) {
    const año = añoDeFecha(ex.fecha_examen)
    if (año) set.add(año)
  }
  return [...set].sort((a, b) => Number(b) - Number(a))
})

const examenesDelArbitro = computed(() =>
  arbitroEnModal.value?.id
    ? sortPorFecha(examenesPorArbitro.value[arbitroEnModal.value.id] || [])
    : []
)

// ============== FILTROS, ORDENAMIENTO, PAGINACIÓN ==============

// Filtrado puro
const arbitrosFiltrados = computed(() => {
  const { apellido, nombre, grupo, año, tieneTipo, tieneEstado } = filtros
  return arbitros.value.filter(a => {
    if (apellido && !normalizarTexto(a.apellido).includes(normalizarTexto(apellido))) return false
    if (nombre   && !normalizarTexto(a.nombre).includes(normalizarTexto(nombre)))     return false
    if (grupo    && String(a.grupo) !== String(grupo))                                return false

    const lista = examenesPorArbitro.value[a.id] || []
    const listaEnAño = año ? lista.filter(ex => añoDeFecha(ex.fecha_examen) === año) : lista

    if (año && !listaEnAño.length)                                       return false
    if (tieneTipo && !listaEnAño.some(ex => ex.tipo === tieneTipo))      return false
    if (tieneEstado !== '') {
      if (tieneEstado === 'sin') { if (lista.length > 0) return false }
      else if (!listaEnAño.some(ex => (ex.detalles || []).some(d => d.estado == tieneEstado))) return false
    }
    return true
  })
})

// Ordenamiento separado del filtrado
const arbitrosOrdenados = computed(() => {
  const { campo, dir } = ordenamiento
  const mult = dir === 'asc' ? 1 : -1

  const getValor = (a) => {
    if (campo === 'apellido') return normalizarTexto(a.apellido)
    if (campo === 'nombre')   return normalizarTexto(a.nombre)
    if (campo === 'grupo')    return String(a.grupo || '')
    if (campo === 'id')       return Number(a.id) || 0
    if (campo === 'cantidad') return (examenesPorArbitro.value[a.id] || []).length
    if (campo === 'ultimo') {
      const u = ultimoExamen(a.id)
      return u?._ts ?? 0
    }
    return ''
  }

  return [...arbitrosFiltrados.value].sort((a, b) => {
    const va = getValor(a)
    const vb = getValor(b)
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * mult
    return String(va).localeCompare(String(vb), 'es') * mult
  })
})

const totalPaginas   = computed(() => Math.ceil(arbitrosOrdenados.value.length / registrosPorPagina) || 1)
const totalFiltrados = computed(() => arbitrosOrdenados.value.length)
const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return arbitrosOrdenados.value.slice(inicio, inicio + registrosPorPagina)
})

const ordenarPor = (campo) => {
  if (ordenamiento.campo === campo) {
    ordenamiento.dir = ordenamiento.dir === 'asc' ? 'desc' : 'asc'
  } else {
    ordenamiento.campo = campo
    ordenamiento.dir = 'asc'
  }
}

// ============== DETALLE DEL ÁRBITRO (modal) ==============

const examenesDelArbitroDetalle = computed(() => {
  if (!arbitroSeleccionado.value?.id) return []
  return sortPorFecha(examenesPorArbitro.value[arbitroSeleccionado.value.id] || [])
})

const añosDetalleArbitro = computed(() => {
  const set = new Set()
  for (const ex of examenesDelArbitroDetalle.value) {
    const año = añoDeFecha(ex.fecha_examen)
    if (año) set.add(año)
  }
  return [...set].sort((a, b) => Number(b) - Number(a))
})

const examenesFiltradosDetalle = computed(() => {
  if (!filtroAñoDetalle.value) return examenesDelArbitroDetalle.value
  return examenesDelArbitroDetalle.value.filter(
    ex => añoDeFecha(ex.fecha_examen) === filtroAñoDetalle.value
  )
})

const resumenGeneralDetalle = computed(() => {
  const r = { aprobados: 0, desaprobados: 0, ausentes: 0, nohizo: 0, presentes: 0 }
  for (const ex of examenesFiltradosDetalle.value)
    for (const det of (ex.detalles || []))
      if      (det.estado == 1) r.aprobados++
      else if (det.estado == 0) r.desaprobados++
      else if (det.estado == 2) r.ausentes++
      else if (det.estado == 3) r.nohizo++
      else if (det.estado == 4) r.presentes++
  return r
})

const statsResumenDetalle = computed(() =>
  STATS_CONFIG.map(s => ({ ...s, value: resumenGeneralDetalle.value[s.key] }))
)

const examenesPorTipoDetalle = computed(() => {
  const map = {}
  for (const ex of examenesFiltradosDetalle.value) {
    (map[ex.tipo] ??= []).push(ex)
  }
  return map
})

const tiposDelArbitro = computed(() => {
  const conDatos = Object.keys(examenesPorTipoDetalle.value)
  return conDatos.sort((a, b) => {
    const fA = examenesPorTipoDetalle.value[a][0]._ts ?? 0
    const fB = examenesPorTipoDetalle.value[b][0]._ts ?? 0
    return fB - fA
  })
})

const evaluacionesPorSubtipoDetalle = computed(() => {
  const map = {}
  for (const ex of examenesFiltradosDetalle.value) {
    for (const det of (ex.detalles || [])) {
      if (det.estado == 2 || det.estado == 4) continue
      if (!SUBTIPOS_EXAMEN.includes(det.subtipo)) continue
      ;(map[det.subtipo] ??= []).push({
        ...det,
        fecha_examen: ex.fecha_examen,
        tipo: ex.tipo,
      })
    }
  }
  return map
})

const subtiposDelArbitro = computed(() =>
  SUBTIPOS_EXAMEN.filter(s => evaluacionesPorSubtipoDetalle.value[s]?.length)
)

// ============== ACCIONES MODAL ==============

const tomarSnapshotForm = () => { formExamenSnapshot.value = JSON.stringify(formExamen.value) }
const hayCambiosEnForm  = () => JSON.stringify(formExamen.value) !== formExamenSnapshot.value

const abrirGestionExamenes = (a) => {
  arbitroEnModal.value = a
  vistaModal.value = 'lista'
  mostrarModal.value = true
}

const accionPendiente = ref(null)

const cerrarModal = () => {
  if (vistaModal.value === 'form' && hayCambiosEnForm()) {
    accionPendiente.value = ejecutarCerrarModal

    notificar({
      titulo: 'Cambios sin guardar',
      mensaje: 'Tenés cambios sin guardar. ¿Querés continuar igualmente?',
      tipo: 'danger',
      alConfirmar: confirmarAccion
    })

    return
  }

  ejecutarCerrarModal()
}

const ejecutarCerrarModal = () => {
  mostrarModal.value = false
  vistaModal.value = 'lista'
  formExamen.value = formExamenVacio()
  arbitroEnModal.value = {}
  formExamenSnapshot.value = ''
}

const volverAListado = () => {
  if (vistaModal.value === 'form' && hayCambiosEnForm()) {
    accionPendiente.value = ejecutarVolverAListado

    notificar({
      titulo: 'Cambios sin guardar',
      mensaje: 'Tenés cambios sin guardar. ¿Querés continuar igualmente?',
      tipo: 'danger',
      alConfirmar: confirmarAccion
    })

    return
  }

  ejecutarVolverAListado()
}

const confirmarAccion = () => {
  if (accionPendiente.value) {
    accionPendiente.value()
    accionPendiente.value = null
  }
}

const ejecutarVolverAListado = () => {
  vistaModal.value = 'lista'
  formExamen.value = formExamenVacio()
  formExamenSnapshot.value = ''
}


const agregarDetalle = () => formExamen.value.detalles.push(detallePlantilla())
const quitarDetalle  = (i) => formExamen.value.detalles.splice(i, 1)

const iniciarNuevoExamen = () => {
  formExamen.value = { ...formExamenVacio(), id_arbitro: arbitroEnModal.value.id }
  modoFormulario.value = 'nuevo'
  vistaModal.value = 'form'
  tomarSnapshotForm()
}

const iniciarEditarExamen = (ex) => {
  const esAusente = ex.detalles?.length === 1 && ex.detalles[0].estado == 2
  const esPresenteReunion = ex.detalles?.length === 1 && ex.detalles[0].estado == 4
  formExamen.value = {
    id: ex.id,
    id_arbitro: ex.id_arbitro,
    fecha_examen: fechaParaInput(ex.fecha_examen),
    tipo: ex.tipo,
    asistencia: esAusente ? 'ausente' : 'presente',
    detalles: (esAusente || esPresenteReunion)
      ? [detallePlantilla()]
      : JSON.parse(JSON.stringify(ex.detalles)),
  }
  if (!formExamen.value.detalles.length) formExamen.value.detalles.push(detallePlantilla())
  modoFormulario.value = 'editar'
  vistaModal.value = 'form'
  tomarSnapshotForm()
}

const verDetalleArbitro = (a) => {
  arbitroSeleccionado.value = { id: a.id, apellido: a.apellido, nombre: a.nombre }
  filtroAñoDetalle.value = ''
  mostrarModalDetalle.value = true
}

// ============== VALIDACIÓN Y PAYLOAD ==============

const validarFormulario = () => {
  const f = formExamen.value
  if (!f.fecha_examen) return notificar({ titulo: 'Faltan datos', mensaje: 'La fecha del examen es requerida.', tipo: 'danger' }), false
  if (!f.tipo)         return notificar({ titulo: 'Faltan datos', mensaje: 'El tipo de examen es requerido.',  tipo: 'danger' }), false

  // Validación de fecha
  const hoy = new Date(); hoy.setHours(23, 59, 59, 999)
  const fechaInput = new Date(f.fecha_examen)
  if (fechaInput > hoy)
    return notificar({ titulo: 'Fecha inválida', mensaje: 'La fecha no puede ser futura.', tipo: 'danger' }), false
  const año = fechaInput.getFullYear()
  if (año < 2000 || año > 2100)
    return notificar({ titulo: 'Fecha inválida', mensaje: 'El año debe estar entre 2000 y 2100.', tipo: 'danger' }), false

  if (f.asistencia === 'presente' && f.tipo !== 'reunion') {
    if (!f.detalles.length) return notificar({ titulo: 'Faltan datos', mensaje: 'Cargá al menos una evaluación.', tipo: 'danger' }), false
    for (let i = 0; i < f.detalles.length; i++)
      if (!f.detalles[i].subtipo)
        return notificar({ titulo: 'Faltan datos', mensaje: `Seleccioná el subtipo en la fila ${i + 1}.`, tipo: 'danger' }), false

    // Filter Boolean para evitar falso positivo de '' duplicado
    const subs = f.detalles.map(d => d.subtipo).filter(Boolean)
    const dup = subs.find((s, i) => subs.indexOf(s) !== i)
    if (dup) return notificar({ titulo: 'Subtipo duplicado', mensaje: `No podés cargar "${dup}" dos veces.`, tipo: 'danger' }), false
  }
  return true
}

const prepararPayload = () => {
  const f = formExamen.value
  const detalles =
    f.asistencia === 'ausente'  ? [{ subtipo: 'ausente',    calificacion: '', estado: 2 }] :
    f.tipo === 'reunion'        ? [{ subtipo: 'asistencia', calificacion: '', estado: 4 }] :
    f.detalles.map(d => ({
      subtipo:      String(d.subtipo).trim(),
      calificacion: d.estado == 3 ? '' : String(d.calificacion || '').trim(),
      estado:       Number(d.estado),
    }))

  return {
    id:           f.id,
    id_arbitro:   f.id_arbitro || arbitroEnModal.value.id,
    fecha_examen: fechaParaMySQL(f.fecha_examen),
    tipo:         String(f.tipo).trim(),
    detalles,
  }
}

const llamarAPI = async (action, successMsg) => {
  if (!validarFormulario()) return
  cargando.value = true
  try {
    const res = await api.post({ entity: 'examenes', action, payload: prepararPayload() })
    if (res.ok || res.success) {
      notificar({ titulo: '¡Éxito!', mensaje: successMsg, tipo: 'success' })
      await cargarDatos()
      // Volvemos al listado sin chequear cambios (ya guardamos)
      vistaModal.value = 'lista'
      formExamen.value = formExamenVacio()
      formExamenSnapshot.value = ''
    } else {
      notificar({ titulo: 'Error', mensaje: res.message || 'Ocurrió un error.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error Fatal', mensaje: 'Fallo de conexión con el servidor.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const confirmarAlta    = () => llamarAPI('guardarExamen', 'Examen creado correctamente.')
const confirmarEdicion = () => llamarAPI('editarExamen',  'Examen actualizado correctamente.')

// ============== EXCEL ==============

const exportarExcel = () => { mostrarModalExcel.value = true }

const ejecutarDescargaExcel = () => {
  const cols = columnasExcel.value.filter(c => c.visible)
  const datos = arbitrosOrdenados.value.map(a => {
    const lista = examenesPorArbitro.value[a.id] || []
    const ult   = ultimoExamen(a.id)
    const r     = resumenEvaluaciones(a.id)
    const overrides = {
      cantidad:     lista.length,
      ultimo:       ult ? `${formatFecha(ult.fecha_examen)} - ${ult.tipo}` : '',
      aprobados:    r.aprobados,
      presentes:    r.presentes,
      desaprobados: r.desaprobados,
      ausentes:     r.ausentes,
      nohizo:       r.nohizo,
    }
    return Object.fromEntries(
      cols.map(col => [col.label, overrides[col.id] ?? a[col.id] ?? ''])
    )
  })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(datos), 'Examenes_Arbitros')
  XLSX.writeFile(wb, 'Reporte_Examenes_AAAB.xlsx')
  mostrarModalExcel.value = false
}

// ============== CARGAS ==============

const cargarDatos = async () => {
  try {
    const res = await api.get({ entity: 'examenes', action: 'obtenerExamenes', payload: {} })
    if ((res.ok || res.success) && res.payload) {
      // Cacheamos _ts al cargar para evitar reparsear fechas constantemente
      examenes.value = res.payload.map(ex => ({ ...ex, _ts: parseFecha(ex.fecha_examen) }))
    } else {
      notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar los exámenes.', tipo: 'danger' })
    }
  } catch (err) {
    console.error('Error al cargar exámenes:', err)
    notificar({ titulo: 'Error de conexión', mensaje: 'No se pudo conectar con el servidor al cargar los exámenes.', tipo: 'danger' })
  }
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    if ((res.ok || res.success) && res.payload) {
      arbitros.value = res.payload
    } else {
      notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar los árbitros.', tipo: 'danger' })
    }
  } catch (err) {
    console.error('Error al cargar árbitros:', err)
    notificar({ titulo: 'Error de conexión', mensaje: 'No se pudo conectar con el servidor al cargar los árbitros.', tipo: 'danger' })
  }
}

const cargarTodo = async () => {
  cargandoInicial.value = true
  await Promise.all([cargarArbitros(), cargarDatos()])
  cargandoInicial.value = false
}

// ============== MISC ==============

const limpiarFiltros = () => Object.keys(filtros).forEach(k => (filtros[k] = ''))

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= MOBILE_BREAKPOINT)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
}

watch(filtros,      () => { paginaActual.value = 1 }, { deep: true })
watch(ordenamiento, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (n) => { if (paginaActual.value > n) paginaActual.value = n })
onMounted(cargarTodo)
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
.status-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.animate__animated { animation-duration: 0.4s; }
.tabla-container { overflow-x: auto; }
.tabla-fija { border-collapse: separate; border-spacing: 0; }
.tabla-fija th, .tabla-fija td { border-left: none !important; border-right: none !important; }
.col-fija { position: sticky; background-color: inherit; z-index: 10; }
.tabla-fija thead .col-fija { background-color: #f8f9fa; z-index: 12; }
.tabla-fija tbody .col-fija { background-color: #ffffff; }
.tabla-fija tbody tr.bg-danger-subtle .col-fija { background-color: #f8d7da; }
.col-id       { left: 0;    min-width: 60px;  }
.col-acciones { left: 60px; min-width: 90px;  }
.col-apellido { left: 150px; min-width: 150px; }
.col-nombre   { left: 300px; min-width: 150px; }
.col-nombre::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 1px;
  background: linear-gradient(to right, rgba(0,0,0,0.1), transparent);
}
.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s;
}
.sortable:hover {
  background-color: #e9ecef !important;
}
</style>
