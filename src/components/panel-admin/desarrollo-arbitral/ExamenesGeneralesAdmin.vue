<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-clipboard2-check-fill me-1"></i> Gestión de Exámenes
            </h4>
            <span class="text-muted small d-block mt-1">Asambleas y Recuperatorios — {{ totalFiltrados }} árbitros</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <div class="form-check form-switch d-flex align-items-center gap-2 m-0 border rounded px-3 py-2 shadow-sm bg-white">
              <input
                class="form-check-input"
                type="checkbox"
                id="toggleSoloActivos"
                v-model="soloActivos"
                role="switch"
                :disabled="cargandoInicial"
              >
              <label class="form-check-label small fw-bold text-dark m-0" for="toggleSoloActivos">
                Solo activos
              </label>
            </div>
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
          </div>
        </div>

        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Árbitros</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
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
              <select v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none">
                <option value="">Todos los subgrupos</option>
                <option v-for="sg in SUBGRUPOS" :key="sg" :value="sg">{{ sg }}</option>
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
            <div class="col-12 mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 90px;">Acciones</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                  <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Subgrupo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Exámenes</th>
                </tr>
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="cargarTodo" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1">
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
                    <select v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option>
                      <option v-for="sg in SUBGRUPOS" :key="sg" :value="sg">{{ sg }}</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <div class="d-flex gap-2">
                      <select v-model="filtros.año" class="form-select form-select-sm shadow-none w-50">
                        <option value="">Año</option>
                        <option v-for="a in añosDisponibles" :key="a" :value="a">{{ a }}</option>
                      </select>
                      <select v-model="filtros.tieneTipo" class="form-select form-select-sm shadow-none w-50">
                        <option value="">Tipo</option>
                        <option v-for="t in TIPOS_EXAMEN" :key="t" :value="t">{{ t.toUpperCase() }}</option>
                      </select>
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr v-if="cargandoInicial">
                  <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-danger spinner-border-sm"></div>
                    <span class="ms-2 fw-bold text-muted">Cargando datos...</span>
                  </td>
                </tr>
                <tr v-else-if="!arbitrosPaginados.length">
                  <td colspan="7" class="text-center py-4 text-muted">
                    <span class="material-icons opacity-50 d-block mb-2" style="font-size: 32px;">search_off</span>
                    <span class="fw-bold">No se encontraron árbitros.</span>
                  </td>
                </tr>
                <tr v-else v-for="a in arbitrosPaginados" :key="a.id" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                  <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ a.id }}</td>
                  <td class="text-center col-fija col-acciones">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="abrirGestionExamenes(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verDetalleArbitro(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                    </div>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                  <td class="text-center text-dark">{{ a.grupo || '-' }}</td>
                  <td class="text-center text-dark">{{ a.subgrupo || '-' }}</td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <span v-if="conteoTiposPorArbitro[a.id]?.asamblea" class="badge bg-dark text-white rounded-pill px-2 py-1">
                        {{ conteoTiposPorArbitro[a.id].asamblea }}
                      </span>
                      <span v-if="conteoTiposPorArbitro[a.id]?.recuperatorio" class="badge bg-warning text-dark rounded-pill px-2 py-1">
                        {{ conteoTiposPorArbitro[a.id].recuperatorio }}
                      </span>
                      <span v-if="!conteoTiposPorArbitro[a.id]?.asamblea && !conteoTiposPorArbitro[a.id]?.recuperatorio" class="text-muted">—</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-md-none p-3 bg-light">
            <div v-if="cargandoInicial" class="text-center p-4 bg-white rounded-3 shadow-sm border">
              <div class="spinner-border text-danger spinner-border-sm"></div>
              <p class="m-0 mt-2 small fw-bold text-muted">Cargando datos...</p>
            </div>
            <template v-else>
              <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">{{ a.apellido }}, {{ a.nombre }}</div>
                  <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
                </div>
                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex justify-content-between text-dark mb-3 border-bottom border-secondary-subtle pb-2">
                    <span class="small">
                      <strong>Grupo:</strong> {{ a.grupo || '-' }}
                      <template v-if="a.subgrupo"> (Sub: {{ a.subgrupo }})</template>
                    </span>
                    <span class="small d-flex align-items-center gap-1">
                    <strong>Exámenes:</strong>
                    <span v-if="conteoTiposPorArbitro[a.id]?.asamblea" class="badge bg-dark text-white rounded-pill px-2">{{ conteoTiposPorArbitro[a.id].asamblea }}</span>
                    <span v-if="conteoTiposPorArbitro[a.id]?.recuperatorio" class="badge bg-warning text-dark rounded-pill px-2">{{ conteoTiposPorArbitro[a.id].recuperatorio }}</span>
                    <span v-if="!conteoTiposPorArbitro[a.id]?.asamblea && !conteoTiposPorArbitro[a.id]?.recuperatorio">—</span>
                  </span>
                  </div>
                  <div class="d-flex gap-2">
                    <button @click="abrirGestionExamenes(a)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                      <span class="material-icons" style="font-size: 16px;">edit_note</span> GESTIONAR
                    </button>
                    <button @click="verDetalleArbitro(a)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center">
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

    <ModalBase :show="mostrarModal" @close="cerrarModal" icono="edit_note" colorIcono="bg-primary-subtle text-primary" maxWidth="850px">
      <template #header>
        <div class="d-flex flex-column align-items-center text-center w-100">
          <span class="fw-bold fs-5">Exámenes de {{ arbitroEnModal.apellido }}, {{ arbitroEnModal.nombre }}</span>
          <div class="text-muted small mt-1">
            <span v-if="vistaModal === 'lista'">Asambleas y recuperatorios — editá uno o agregá nuevo</span>
            <span v-else>{{ modoFormulario === 'editar' ? 'Editando examen' : 'Nuevo examen' }}</span>
          </div>
        </div>
      </template>

      <div v-if="vistaModal === 'lista'">
        <div class="d-flex justify-content-end mb-3 mt-2">
          <button @click="iniciarNuevoExamen" class="btn btn-danger shadow-sm fw-bold d-flex align-items-center gap-1">
            <span class="material-icons" style="font-size: 18px;">add_circle</span> Agregar Examen
          </button>
        </div>
        <div v-if="!examenesDelArbitro.length" class="text-center py-5 bg-light rounded shadow-sm border border-light-subtle">
          <span class="material-icons d-block mb-2" style="font-size: 48px; color: #cbd5e1;">assignment</span>
          <p class="text-muted fw-bold m-0">Este árbitro no tiene exámenes cargados.</p>
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
                  <span v-if="ex.titulo" class="text-muted small ms-2 fst-italic">{{ ex.titulo }}</span>
                </div>
                <div class="d-flex gap-1">
                  <button @click="iniciarEditarExamen(ex)" class="btn btn-sm btn-light border shadow-sm text-primary py-0 px-2">
                    <span class="material-icons" style="font-size: 16px; top: 2px; position:relative;">edit</span>
                  </button>
                  <button @click="confirmarBorrarExamen(ex)" class="btn btn-sm btn-light border shadow-sm text-danger py-0 px-2">
                    <span class="material-icons" style="font-size: 16px; top: 2px; position:relative;">delete</span>
                  </button>
                </div>
              </div>
              <DetallesExamen :detalles="ex.detalles" />
            </div>
          </div>
        </div>
      </div>

      <form v-else id="formExamen" @submit.prevent="modoFormulario === 'editar' ? confirmarEdicion() : confirmarAlta()" class="text-start">
        <div class="row g-3 pb-3">
          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-0">Datos del examen</div>

          <div class="col-md-8">
            <label class="small fw-bold text-dark mb-1">Evento (Asamblea / Recuperatorio) *</label>
            <select v-model="formExamen.id_evento" @change="onEventoSeleccionado" class="form-select shadow-none border-secondary-subtle">
              <option :value="null">Seleccionar evento...</option>
              <option v-for="ev in eventosParaArbitro" :key="claveEvento(ev)" :value="claveEvento(ev)">
                {{ ev.fecha_examen || formatFechaDisplay(ev.fecha_evento) }} — {{ ev.titulo }}
                <template v-if="ev.categoria"> · {{ ev.categoria.toUpperCase() }}</template>
              </option>
            </select>
            <div v-if="eventoEnForm" class="mt-2 d-flex align-items-center gap-2 flex-wrap">
              <span class="badge border bg-light text-dark"><i class="bi bi-calendar3 me-1"></i>{{ eventoEnForm.fecha_examen || formatFechaDisplay(eventoEnForm.fecha_evento) }}</span>
              <span class="badge text-uppercase" :class="badgeTipo(eventoEnForm.categoria)">{{ eventoEnForm.categoria }}</span>
              <span v-if="eventoEnForm.descripcion" class="text-muted small fst-italic text-truncate" style="max-width: 240px;">{{ eventoEnForm.descripcion }}</span>
            </div>
            <div v-if="!eventosParaArbitro.length" class="mt-2 alert alert-warning py-2 px-3 small mb-0 border-warning-subtle">
              <i class="bi bi-exclamation-triangle me-1"></i> No hay asambleas o recuperatorios disponibles para este árbitro.
            </div>
          </div>

          <div class="col-md-4">
            <label class="small fw-bold text-dark mb-1">Asistencia *</label>
            <select v-model="formExamen.asistencia" class="form-select shadow-none border-secondary-subtle" required>
              <option value="presente">Presente</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>

          <div v-if="formExamen.asistencia === 'ausente'" class="col-12 mt-3 animate__animated animate__fadeIn">
            <div class="alert alert-secondary border-secondary-subtle text-center small fw-bold mb-0">
              <i class="bi bi-info-circle me-1"></i> Al marcar "Ausente" no se requieren evaluaciones.
            </div>
          </div>

          <div v-if="formExamen.asistencia === 'presente'" class="col-12 mt-3 animate__animated animate__fadeIn">
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom border-2 pb-1">
              <span class="small fw-bold text-muted text-uppercase">Evaluaciones</span>
            </div>
            <div v-if="formExamen.tipo === 'asamblea'" class="alert alert-info py-2 px-3 small mb-3 border-info-subtle">
              <i class="bi bi-lightbulb me-1"></i>
              <strong>Tip:</strong> En asambleas se evalúa <strong>Físico</strong> y <strong>Teórico</strong> (75% o más para aprobar).
            </div>
            <div v-for="(detalle, index) in formExamen.detalles" :key="index"
              class="row g-2 mb-2 align-items-end bg-light p-2 rounded border border-light-subtle">

              <div class="col-md-4">
                <label class="small fw-bold text-dark mb-1">Tipo *</label>
                <select v-model="detalle.tipo"
                  class="form-select form-select-sm shadow-none border-secondary-subtle" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="s in TIPOS_EVALUACION" :key="s" :value="s">
                    {{ s.toUpperCase() }}
                  </option>
                </select>
              </div>

              <div class="col-md-3">
                <label class="small fw-bold text-dark mb-1">Estado *</label>
                <select v-model="detalle.estado"
                  class="form-select form-select-sm shadow-none border-secondary-subtle" required>
                  <option v-for="est in ESTADOS_DETALLE" :key="est" :value="est">
                    {{ est.charAt(0).toUpperCase() + est.slice(1) }}
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="small fw-bold text-dark mb-1">Calificación</label>
                <input v-model="detalle.calificacion"
                  maxlength="10"
                  :disabled="detalle.estado === 'no lo hizo'"
                  class="form-control form-control-sm shadow-none border-secondary-subtle"
                  placeholder="Ej: 8 / 75%">
              </div>

            </div>
            <div class="d-flex justify-content-end">
              <button type="button" @click="agregarDetalle" class="btn btn-sm btn-danger py-0 d-flex align-items-center gap-1">
                <span class="material-icons" style="font-size: 16px;">add</span> Agregar Tipo
              </button>
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

    <ModalBase :show="mostrarModalDetalle" @close="mostrarModalDetalle = false" icono="person_search" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="950px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Detalle de {{ arbitroSeleccionado.apellido }}, {{ arbitroSeleccionado.nombre }}</span>
          <div class="text-muted small mt-1">Historial de asambleas y recuperatorios</div>
        </div>
      </template>
      <div v-if="!examenesDelArbitroDetalle.length" class="text-center py-5 text-muted bg-white rounded shadow-sm border border-light-subtle">
        <span class="material-icons d-block mb-2" style="font-size: 48px; color: #cbd5e1;">history_toggle_off</span>
        <p class="mb-0 fw-bold">No hay exámenes registrados para este árbitro.</p>
      </div>
      <div v-else>
        <div class="d-flex justify-content-end mb-3" v-if="añosDetalleArbitro.length">
          <div class="d-flex align-items-center gap-2">
            <label class="small fw-bold text-dark text-uppercase m-0">Año:</label>
            <select v-model="filtroAñoDetalle" class="form-select form-select-sm shadow-sm border-secondary-subtle" style="min-width: 140px;">
              <option value="">Todos los años</option>
              <option v-for="año in añosDetalleArbitro" :key="año" :value="año">{{ año }}</option>
            </select>
          </div>
        </div>
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
        <div class="mb-4">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-warning">
            <span class="material-icons text-warning-emphasis me-2">event_note</span>
            <h6 class="fw-bold m-0 text-dark text-uppercase">Eventos</h6>
          </div>
          <div v-for="tipo in tipoDelArbitro" :key="tipo" class="mb-3">
            <div class="d-flex align-items-center justify-content-between mb-2 bg-white p-2 ps-3 rounded shadow-sm border border-light-subtle">
              <div class="d-flex align-items-center gap-2">
                <span class="badge text-uppercase px-2 py-1" :class="badgeTipo(tipo)">{{ tipo }}</span>
                <span class="small text-muted fw-bold">{{ examenesPorTipoDetalle[tipo].length }} {{ examenesPorTipoDetalle[tipo].length === 1 ? 'registro' : 'registros' }}</span>
              </div>
              <span class="d-none d-md-inline small text-muted fst-italic">Último: {{ formatFecha(examenesPorTipoDetalle[tipo][0].fecha_examen) }}</span>
            </div>
            <div class="row g-2">
              <div v-for="ex in examenesPorTipoDetalle[tipo]" :key="ex.id" class="col-12 col-md-6">
                <div class="card border border-light-subtle shadow-sm h-100 bg-white">
                  <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start mb-2 border-bottom border-secondary-subtle pb-1">
                      <div class="text-dark fw-bold small"><i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(ex.fecha_examen) }}</div>
                      <span class="badge bg-dark font-monospace" style="font-size: 0.65rem;">#{{ ex.id }}</span>
                    </div>
                    <DetallesExamen :detalles="ex.detalles" mobile />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="tiposConEvaluacion.length">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-warning">
            <span class="material-icons text-warning-emphasis me-2">trending_up</span>
            <h6 class="fw-bold m-0 text-dark text-uppercase">Rendimiento por Evaluación</h6>
          </div>
          <div class="row g-3">
            <div v-for="tipo in tiposConEvaluacion" :key="tipo" class="col-12 col-md-6">
              <div class="card border border-light-subtle shadow-sm h-100 bg-white">
                <div class="card-header bg-light d-flex justify-content-between align-items-center border-bottom border-light-subtle py-2">
                  <h6 class="fw-bold text-uppercase m-0 text-dark small d-flex align-items-center gap-2">
                    <i class="bi bi-bar-chart-line text-warning-emphasis"></i> {{ tipo }}
                  </h6>
                  <span class="badge bg-dark rounded-pill px-2">{{ rendimientoPorTipo[tipo].length }}</span>
                </div>
                <div class="card-body p-2">
                  <div v-for="(item, idx) in rendimientoPorTipo[tipo]" :key="idx"
                    class="d-flex align-items-center py-1 border-bottom border-secondary-subtle" style="font-size: 0.75rem;">
                    <span class="status-dot me-2 flex-shrink-0" :class="claseDot(item.estado)"></span>
                    <span class="text-dark fw-bold me-2 font-monospace" style="min-width: 75px;">{{ formatFecha(item.fecha_examen) }}</span>
                    <span class="badge me-2 text-uppercase flex-shrink-0 d-none d-sm-inline" :class="badgeTipo(item.tipo)" style="font-size: 0.6rem;">{{ item.tipo }}</span>
                    <span class="fw-bold flex-grow-1 text-end text-sm-start" :class="claseTextoEstado(item.estado)">{{ textoEstado(item.estado) }}</span>
                    <span v-if="item.calificacion && item.estado !== 'no lo hizo' && item.estado !== 'ausente'" class="text-muted ms-2 fw-bold">({{ item.calificacion }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch, defineComponent, h } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Exámenes | AAAB',
  meta: [{ name: 'description', content: 'Gestión de exámenes (asambleas y recuperatorios) de árbitros AAAB.' }],
})

// ============== CONSTANTES ==============
const TIPOS_EXAMEN     = ['asamblea', 'recuperatorio']
const TIPOS_EVALUACION = ['fisico', 'teorico']
const ESTADOS_DETALLE  = ['aprobado', 'desaprobado', 'no lo hizo']
const GRUPOS           = ['LH', 'Pre Liga', 'SR', '1', '2', '3', '4']
const SUBGRUPOS        = ['A', 'B', 'C']
const MOBILE_BREAKPOINT = 768

const ESTADO_MAP = {
  'aprobado':    { texto: 'APROBADO',    dot: 'bg-success',   txt: 'text-success'   },
  'desaprobado': { texto: 'DESAPROBADO', dot: 'bg-danger',    txt: 'text-danger'    },
  'no lo hizo':  { texto: 'NO LO HIZO',  dot: 'bg-info',      txt: 'text-info'      },
  'ausente':     { texto: 'AUSENTE',     dot: 'bg-secondary', txt: 'text-secondary' },
}

const TIPO_BADGE_MAP = {
  asamblea:      'bg-dark text-white',
  recuperatorio: 'bg-warning text-dark',
}

const STATS_CONFIG = [
  { key: 'aprobados',    label: 'Aprob.',  bgClass: 'bg-success',   icon: 'bi-check-circle-fill' },
  { key: 'desaprobados', label: 'Desap.',  bgClass: 'bg-danger',    icon: 'bi-x-circle-fill'     },
  { key: 'ausentes',     label: 'Aus.',    bgClass: 'bg-secondary', icon: 'bi-person-dash-fill'  },
  { key: 'nohizo',       label: 'No hizo', bgClass: 'bg-info',      icon: 'bi-dash-circle-fill'  },
]

// ============== HELPERS ==============
const textoEstado      = (e) => ESTADO_MAP[e]?.texto ?? 'OTRO'
const claseDot         = (e) => ESTADO_MAP[e]?.dot   ?? 'bg-dark'
const claseTextoEstado = (e) => ESTADO_MAP[e]?.txt   ?? 'text-dark'
const badgeTipo        = (t) => TIPO_BADGE_MAP[t]    ?? 'bg-dark text-white'
const claveEvento      = (ev) => String(ev.id)

const formatFechaDisplay = (f) => {
  if (!f) return ''
  const partes = f.split(' ')[0].split('-')
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : f
}
const normalizarTexto = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const formatFecha     = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha      = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const parseFecha      = (f) => {
  const [d, m, y] = (f?.split(' ')[0] ?? '').split('/')
  return new Date(`${y}-${m}-${d}`).getTime() || 0
}
const fechaParaInput = (f) => {
  const [d, m, y] = (f?.split(' ')[0] ?? '').split('/')
  return d && m && y ? `${y}-${m}-${d}` : ''
}

const sortPorFecha   = (lista) => [...lista].sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))

// ============== COMPONENTES INTERNOS ==============
const DetallesExamen = defineComponent({
  props: { detalles: Array, mobile: Boolean },
  setup(props) {
    return () => {
      const dets = props.detalles || []
      if (dets.length === 1 && (dets[0].estado === 'ausente' || dets[0].tipo === 'ausente'))
        return h('span', { class: 'badge bg-secondary text-white px-2 py-1' }, 'AUSENTE')
      return h('div', { class: 'd-flex flex-wrap gap-1' }, dets.map(det =>
        h('span', {
          key: det.id,
          class: props.mobile
            ? 'badge border bg-white text-dark px-2 py-1 d-block mb-1 w-100 text-start'
            : 'badge border bg-light text-dark px-2 py-1 d-flex align-items-center gap-1',
        }, [
          h('span', { class: 'fw-bold text-uppercase' }, det.tipo),
          props.mobile ? null : h('span', { class: `status-dot ms-1 ${claseDot(det.estado)}` }),
          h('span', { class: `fw-bold ms-1 ${claseTextoEstado(det.estado)}` }, textoEstado(det.estado)),
          (det.calificacion && det.estado !== 'no lo hizo' && det.estado !== 'ausente')
            ? h('span', { class: 'text-muted ms-1' }, `(${det.calificacion})`)
            : null,
        ])
      ))
    }
  },
})

// ============== STATE ==============
const notificar = inject('notificar', (msg) => alert(msg.mensaje || msg))
const arbitros  = ref([])
const examenes  = ref([])
const eventos   = ref([])
const grupos    = ref([])

const soloActivos          = ref(false)
const cargando             = ref(false)
const cargandoInicial      = ref(true)
const paginaActual         = ref(1)
const registrosPorPagina   = 10
const mostrarFiltrosMobile = ref(false)
const mostrarModal         = ref(false)
const mostrarModalDetalle  = ref(false)
const vistaModal           = ref('lista')
const modoFormulario       = ref('nuevo')
const arbitroEnModal       = ref({})
const arbitroSeleccionado  = ref({ id: null, apellido: '', nombre: '' })
const filtroAñoDetalle     = ref('')
const accionPendiente      = ref(null)

const filtros = reactive({ apellido: '', nombre: '', grupo: '', subgrupo: '', año: '', tieneTipo: '' })

const detallePlantilla = () => ({ tipo: '', calificacion: '', estado: 'aprobado' })
const formExamenVacio  = () => ({
  id:           null,
  id_arbitro:   arbitroEnModal.value?.id ?? '',
  id_evento:    null,
  fecha_examen: '',
  tipo:         '',
  asistencia:   'presente',
  detalles:     [detallePlantilla()],
})

const formExamen         = ref(formExamenVacio())
const formExamenSnapshot = ref('')

// ============== COMPUTEDS ==============
const examenesCategoria = computed(() => examenes.value.filter(ex => TIPOS_EXAMEN.includes(ex.tipo)))
const examenesPorArbitro = computed(() =>
  examenesCategoria.value.reduce((map, ex) => {
    ;(map[ex.id_arbitro] ??= []).push(ex)
    return map
  }, {})
)

const conteoTiposPorArbitro = computed(() => {
  const map = {}
  for (const [id, lista] of Object.entries(examenesPorArbitro.value)) {
    map[id] = {
      asamblea:      lista.filter(e => e.tipo === 'asamblea').length,
      recuperatorio: lista.filter(e => e.tipo === 'recuperatorio').length,
    }
  }
  return map
})

const añosDisponibles = computed(() => {
  const set = new Set()
  for (const ex of examenesCategoria.value) {
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

const eventosParaArbitro = computed(() => {
  if (!arbitroEnModal.value?.id) return []
  const grupoObj = grupos.value.find(g =>
    g.nombre === arbitroEnModal.value.grupo &&
    (!arbitroEnModal.value.subgrupo || g.subgrupo === arbitroEnModal.value.subgrupo)
  )
  const idGrupo = grupoObj ? String(grupoObj.id) : null

  const idsDeApi = new Set(eventos.value.map(ev => String(ev.id)))
  const deExamenes = [...new Map(
    examenesCategoria.value
      .filter(ex => ex.id_evento)
      .map(ex => [String(ex.id_evento), {
        id: ex.id_evento, titulo: ex.titulo ?? '', descripcion: ex.descripcion ?? '',
        fecha_evento: ex.fecha_evento ?? '', fecha_examen: ex.fecha_examen ?? '',
        id_grupos: ex.id_grupos ?? '', todos_grupos: ex.todos_grupos ?? 0, categoria: ex.categoria ?? ex.tipo,
      }])
  ).values()]

  const todos = [...eventos.value.filter(ev => TIPOS_EXAMEN.includes(ev.categoria))]
  for (const ev of deExamenes) {
    if (!idsDeApi.has(String(ev.id)) && TIPOS_EXAMEN.includes(ev.categoria)) todos.push(ev)
  }

  return todos
    .filter(ev => {
      if (ev.todos_grupos == 1) return true
      if (!idGrupo) return true
      return String(ev.id_grupos ?? '').split(',').map(s => s.trim()).includes(idGrupo)
    })
    .sort((a, b) => {
      const tsA = parseFecha(a.fecha_examen) || new Date(a.fecha_evento?.split(' ')[0]).getTime() || 0
      const tsB = parseFecha(b.fecha_examen) || new Date(b.fecha_evento?.split(' ')[0]).getTime() || 0
      return tsB - tsA
    })
})

const eventoEnForm = computed(() =>
  formExamen.value.id_evento
    ? eventosParaArbitro.value.find(ev => String(ev.id) === String(formExamen.value.id_evento)) ?? null
    : null
)

// ============== FILTROS Y ORDENAMIENTO ==============
const arbitrosFiltrados = computed(() => {
  const { apellido, nombre, grupo, subgrupo, año, tieneTipo } = filtros
  return arbitros.value.filter(a => {
    if (apellido && !normalizarTexto(a.apellido).includes(normalizarTexto(apellido))) return false
    if (nombre   && !normalizarTexto(a.nombre).includes(normalizarTexto(nombre)))     return false
    if (grupo    && String(a.grupo) !== String(grupo))                                 return false
    if (subgrupo && String(a.subgrupo) !== String(subgrupo))                           return false
    const lista      = examenesPorArbitro.value[a.id] || []
    const listaEnAño = año ? lista.filter(ex => añoDeFecha(ex.fecha_examen) === año) : lista
    if (año && !listaEnAño.length)                                                     return false
    if (tieneTipo && !listaEnAño.some(ex => ex.tipo === tieneTipo))                    return false
    return true
  })
})

const arbitrosOrdenados = computed(() =>
  [...arbitrosFiltrados.value].sort((a, b) =>
    normalizarTexto(a.apellido).localeCompare(normalizarTexto(b.apellido), 'es')
  )
)

const totalPaginas      = computed(() => Math.ceil(arbitrosOrdenados.value.length / registrosPorPagina) || 1)
const totalFiltrados    = computed(() => arbitrosOrdenados.value.length)
const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return arbitrosOrdenados.value.slice(inicio, inicio + registrosPorPagina)
})

// ============== DETALLE ÁRBITRO ==============
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

const examenesFiltradosDetalle = computed(() =>
  !filtroAñoDetalle.value
    ? examenesDelArbitroDetalle.value
    : examenesDelArbitroDetalle.value.filter(ex => añoDeFecha(ex.fecha_examen) === filtroAñoDetalle.value)
)

const resumenGeneralDetalle = computed(() => {
  const r = { aprobados: 0, desaprobados: 0, ausentes: 0, nohizo: 0 }
  for (const ex of examenesFiltradosDetalle.value)
    for (const det of (ex.detalles || []))
      if      (det.estado === 'aprobado')    r.aprobados++
      else if (det.estado === 'desaprobado') r.desaprobados++
      else if (det.estado === 'ausente')     r.ausentes++
      else if (det.estado === 'no lo hizo')  r.nohizo++
  return r
})

const statsResumenDetalle = computed(() => STATS_CONFIG.map(s => ({ ...s, value: resumenGeneralDetalle.value[s.key] })))

const examenesPorTipoDetalle = computed(() => {
  const map = {}
  for (const ex of examenesFiltradosDetalle.value) (map[ex.tipo] ??= []).push(ex)
  return map
})

// Tipos de evento (asamblea/recuperatorio) presentes en el detalle — para la sección "Eventos"
const tipoDelArbitro = computed(() =>
  Object.keys(examenesPorTipoDetalle.value).sort((a, b) =>
    (examenesPorTipoDetalle.value[b][0]._ts ?? 0) - (examenesPorTipoDetalle.value[a][0]._ts ?? 0)
  )
)

// Evaluaciones agrupadas por tipo (fisico/teorico) — para la sección "Rendimiento"
const rendimientoPorTipo = computed(() => {
  const map = {}
  for (const ex of examenesFiltradosDetalle.value)
    for (const det of (ex.detalles || [])) {
      if (det.estado === 'ausente') continue
      if (!TIPOS_EVALUACION.includes(det.tipo)) continue
      ;(map[det.tipo] ??= []).push({ ...det, fecha_examen: ex.fecha_examen, tipo: ex.tipo })
    }
  return map
})

// Tipos de evaluación que tienen al menos un registro — para la sección "Rendimiento"
const tiposConEvaluacion = computed(() => TIPOS_EVALUACION.filter(s => rendimientoPorTipo.value[s]?.length))

// ============== MODAL GESTIÓN ==============
const tomarSnapshotForm = () => { formExamenSnapshot.value = JSON.stringify(formExamen.value) }
const hayCambiosEnForm  = () => JSON.stringify(formExamen.value) !== formExamenSnapshot.value

const abrirGestionExamenes = async (a) => {
  arbitroEnModal.value = a; vistaModal.value = 'lista'; mostrarModal.value = true
  await cargarExamenesArbitro(a.id)
}

const cerrarModal = () => {
  if (vistaModal.value === 'form' && hayCambiosEnForm()) {
    accionPendiente.value = ejecutarCerrarModal
    notificar({ titulo: 'Cambios sin guardar', mensaje: '¿Querés continuar igualmente?', tipo: 'danger', alConfirmar: confirmarAccion })
    return
  }
  ejecutarCerrarModal()
}

const ejecutarCerrarModal = () => {
  mostrarModal.value = false; vistaModal.value = 'lista'
  formExamen.value = formExamenVacio(); arbitroEnModal.value = {}; formExamenSnapshot.value = ''
}

const volverAListado = () => {
  if (vistaModal.value === 'form' && hayCambiosEnForm()) {
    accionPendiente.value = ejecutarVolverAListado
    notificar({ titulo: 'Cambios sin guardar', mensaje: '¿Querés continuar igualmente?', tipo: 'danger', alConfirmar: confirmarAccion })
    return
  }
  ejecutarVolverAListado()
}

const confirmarAccion = () => { accionPendiente.value?.(); accionPendiente.value = null }

const ejecutarVolverAListado = () => {
  vistaModal.value = 'lista'; formExamen.value = formExamenVacio(); formExamenSnapshot.value = ''
}

const agregarDetalle = () => formExamen.value.detalles.push(detallePlantilla())

const iniciarNuevoExamen = () => {
  formExamen.value = { ...formExamenVacio(), id_arbitro: arbitroEnModal.value.id }
  modoFormulario.value = 'nuevo'; vistaModal.value = 'form'; tomarSnapshotForm()
}

const iniciarEditarExamen = (ex) => {
  const match    = eventosParaArbitro.value.find(ev => ev.id && String(ev.id) === String(ex.id_evento)) ?? null
  const isAusente = ex.detalles.length === 1 && ex.detalles[0].estado === 'ausente'  // ← nuevo
  formExamen.value = {
    id_arbitro:   ex.id_arbitro,
    id_evento:    match ? String(match.id) : null,
    fecha_examen: fechaParaInput(ex.fecha_examen),
    tipo:         ex.tipo ?? '',
    asistencia:   isAusente ? 'ausente' : 'presente',                                // ← nuevo
    detalles:     isAusente ? [detallePlantilla()] : JSON.parse(JSON.stringify(ex.detalles)),
  }
  if (!formExamen.value.detalles.length) formExamen.value.detalles.push(detallePlantilla())
  modoFormulario.value = 'editar'; vistaModal.value = 'form'; tomarSnapshotForm()
}

const onEventoSeleccionado = () => {
  const ev = eventoEnForm.value
  if (!ev) { formExamen.value.tipo = ''; formExamen.value.fecha_examen = ''; return }
  formExamen.value.tipo = ev.categoria ?? ''
  formExamen.value.fecha_examen = ev.fecha_evento
    ? ev.fecha_evento.split(' ')[0]
    : fechaParaInput(ev.fecha_examen)
}

const verDetalleArbitro = async (a) => {
  arbitroSeleccionado.value = { id: a.id, apellido: a.apellido, nombre: a.nombre }
  filtroAñoDetalle.value = ''; mostrarModalDetalle.value = true
  await cargarExamenesArbitro(a.id)
}

// ============== VALIDACIÓN Y PAYLOAD ==============
const validarFormulario = () => {
  const f = formExamen.value
  if (!eventoEnForm.value)
    return notificar({ titulo: 'Faltan datos', mensaje: 'Seleccioná el evento.', tipo: 'danger' }), false
  if (f.asistencia === 'presente') {
    if (!f.detalles.length)
      return notificar({ titulo: 'Faltan datos', mensaje: 'Cargá al menos una evaluación.', tipo: 'danger' }), false
    for (let i = 0; i < f.detalles.length; i++)
      if (!f.detalles[i].tipo)
        return notificar({ titulo: 'Faltan datos', mensaje: `Seleccioná el tipo en la fila ${i + 1}.`, tipo: 'danger' }), false
    const tipos = f.detalles.map(d => d.tipo).filter(Boolean)
    const dup   = tipos.find((s, i) => tipos.indexOf(s) !== i)
    if (dup) return notificar({ titulo: 'Tipo duplicado', mensaje: `No podés cargar "${dup}" dos veces.`, tipo: 'danger' }), false
  }
  return true
}

const prepararPayload = () => {
  const f = formExamen.value
  return {
    idEvento:  eventoEnForm.value?.id ?? null,
    idArbitro: f.id_arbitro || arbitroEnModal.value.id,
    detalles:  f.detalles.map(d => ({
      tipo:         String(d.tipo).trim(),
      calificacion: d.estado === 'no lo hizo' ? '' : String(d.calificacion || '').trim(),
      estado:       d.estado,
    }))
  }
}

// ============== GUARDADO EN DOS PASOS ==============
const llamarAPI = async (action, successMsg) => {
  if (!validarFormulario()) return
  cargando.value = true
  try {
    // Paso 1: asistencia — siempre
    const resAsistencia = await api.post({
      entity: 'reuniones',
      action: 'registrarAsistenciaArbitro',
      payload: {
        idArbitro: formExamen.value.id_arbitro || arbitroEnModal.value.id,
        idEvento:  eventoEnForm.value?.id ?? null,
        tipo:      formExamen.value.asistencia,
      },
    })
    if (!resAsistencia.ok && !resAsistencia.success) {
      notificar({ titulo: 'Error', mensaje: resAsistencia.message || 'No se pudo registrar la asistencia.', tipo: 'danger' })
      return
    }

    // Paso 2: evaluaciones — siempre; si ausente, detalle sintético
    const payload = formExamen.value.asistencia === 'ausente'
      ? {
          idEvento:  eventoEnForm.value?.id ?? null,
          idArbitro: formExamen.value.id_arbitro || arbitroEnModal.value.id,
          detalles:  [{ tipo: 'ausente', calificacion: '', estado: 'ausente' }],
        }
      : prepararPayload()

    const res = await api.post({ entity: 'examenes', action, payload })
    if (!res.ok && !res.success) {
      notificar({ titulo: 'Error', mensaje: res.message || 'Ocurrió un error.', tipo: 'danger' })
      return
    }

    notificar({ titulo: '¡Éxito!', mensaje: successMsg, tipo: 'success' })
    await cargarExamenesArbitro(formExamen.value.id_arbitro || arbitroEnModal.value.id)
    vistaModal.value = 'lista'
    formExamen.value = formExamenVacio()
    formExamenSnapshot.value = ''
  } catch {
    notificar({ titulo: 'Error Fatal', mensaje: 'Fallo de conexión con el servidor.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const confirmarAlta    = () => llamarAPI('guardarExamen', 'Examen creado correctamente.')
const confirmarEdicion = () => llamarAPI('guardarExamen', 'Examen actualizado correctamente.')

const borrarExamen = async (idEvento, idArbitro) => {
  cargando.value = true
  try {
    const res = await api.post({
      entity: 'examenes',
      action: 'borrarExamen',
      payload: { idEvento, idArbitro },
    })
    if (!res.ok && !res.success) {
      notificar({ titulo: 'Error', mensaje: res.message || 'No se pudo borrar el examen.', tipo: 'danger' })
      return
    }
    notificar({ titulo: '¡Éxito!', mensaje: 'Examen borrado correctamente.', tipo: 'success' })
    await Promise.all([cargarExamenesArbitro(idArbitro), cargarResumenExamenes()])  // ← ambos en paralelo
    vistaModal.value  = 'lista'
    formExamen.value  = formExamenVacio()
    formExamenSnapshot.value = ''
  } catch {
    notificar({ titulo: 'Error Fatal', mensaje: 'Fallo de conexión con el servidor.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}


const confirmarBorrarExamen = (ex) => {
  const idEvento  = ex ? ex.id_evento  : (eventoEnForm.value?.id ?? null)
  const idArbitro = ex ? ex.id_arbitro : (formExamen.value.id_arbitro || arbitroEnModal.value.id)
  notificar({
    titulo:      'Confirmar borrado',
    mensaje:     '¿Estás seguro de que querés borrar este examen?',
    tipo:        'danger',
    alConfirmar: () => borrarExamen(idEvento, idArbitro),
  })
}

// ============== CARGAS ==============
const mapearFilasExamenes = (filas) => {
  const map = {}
  filas.forEach(row => {
    const key = `${row.id_evento}_${row.id_arbitro}`
    if (!map[key]) {
      map[key] = {
        id:           row.id,
        id_evento:    row.id_evento,
        id_arbitro:   row.id_arbitro,
        tipo:         row.categoria,
        fecha_examen: row.fecha_examen,
        titulo:       row.titulo,
        descripcion:  row.descripcion,
        categoria:    row.categoria,
        _ts:          parseFecha(row.fecha_examen),
        detalles:     []
      }
    }
    map[key].detalles.push({
      id:           row.id,
      tipo:         row.tipo,
      calificacion: row.calificacion,
      estado:       row.estado
    })
  })
  return Object.values(map)
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({
      entity: 'arbitros',
      action: 'getArbitrosBasico',
      payload: { soloActivos: soloActivos.value }
    })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (err) { console.error(err) }
}

const cargarEventos = async () => {
  try {
    const res = await api.get({ entity: 'eventos', action: 'obtenerEventosParaExamen' })
    if ((res.ok || res.success) && res.payload) eventos.value = res.payload
  } catch (err) { console.error(err) }
}

const cargarGrupos = async () => {
  try {
    const res = await api.get({ entity: 'grupos', action: 'obtenerGrupos' })
    if ((res.ok || res.success) && res.payload) grupos.value = res.payload
  } catch (err) { console.error(err) }
}

const cargarExamenesArbitro = async (idArbitro) => {
  try {
    const res = await api.get({
      entity: 'examenes',
      action: 'obtenerExamenesArbitro',
      payload: { idArbitro }
    })
    if ((res.ok || res.success) && res.payload) {
      examenes.value = [
        ...examenes.value.filter(ex => String(ex.id_arbitro) !== String(idArbitro)),
        ...mapearFilasExamenes(res.payload)
      ]
    }
  } catch (err) { console.error(err) }
}

const cargarResumenExamenes = async () => {
  try {
    const res = await api.get({ entity: 'examenes', action: 'obtenerResumenExamenes' })
    if ((res.ok || res.success) && res.payload) {
      // Solo poblar lo necesario para los conteos, sin pisar datos ya cargados de modales
      const yaLoadedIds = new Set(examenes.value.map(ex => `${ex.id_evento}_${ex.id_arbitro}`))
      const nuevos = res.payload
        .filter(row => !yaLoadedIds.has(`${row.id_evento}_${row.id_arbitro}`))
        .map(row => ({
          id:        `${row.id_evento}_${row.id_arbitro}`,
          id_evento:  row.id_evento,
          id_arbitro: row.id_arbitro,
          tipo:       row.categoria,
          categoria:  row.categoria,
          _ts:        0,
          detalles:   [],
        }))
      examenes.value = [...examenes.value, ...nuevos]
    }
  } catch (err) { console.error(err) }
}

const cargarTodo = async () => {
  cargandoInicial.value = true
  await Promise.all([cargarArbitros(), cargarEventos(), cargarGrupos(), cargarResumenExamenes()])
  cargandoInicial.value = false
}

// ============== MISC ==============
const limpiarFiltros = () => Object.keys(filtros).forEach(k => (filtros[k] = ''))
const cambiarPagina  = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= MOBILE_BREAKPOINT)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
}

watch(filtros,      () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (n) => { if (paginaActual.value > n) paginaActual.value = n })

watch(soloActivos, async () => {
  cargandoInicial.value = true
  await cargarArbitros()
  cargandoInicial.value = false
})

onMounted(cargarTodo)
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.animate__animated { animation-duration: 0.4s; }
.tabla-container { overflow-x: auto; }
.tabla-fija { border-collapse: separate; border-spacing: 0; }
.tabla-fija th, .tabla-fija td { border-left: none !important; border-right: none !important; }
.col-fija { position: sticky; background-color: inherit; z-index: 10; }
.tabla-fija thead .col-fija { background-color: #f8f9fa; z-index: 12; }
.tabla-fija tbody .col-fija { background-color: #ffffff; }
.tabla-fija tbody tr.bg-danger-subtle .col-fija { background-color: #f8d7da; }
.col-id       { left: 0;     min-width: 60px;  }
.col-acciones { left: 60px;  min-width: 90px;  }
.col-apellido { left: 150px; min-width: 150px; }
.col-nombre   { left: 300px; min-width: 150px; }
.col-nombre::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to right, rgba(0,0,0,0.1), transparent); }
</style>
