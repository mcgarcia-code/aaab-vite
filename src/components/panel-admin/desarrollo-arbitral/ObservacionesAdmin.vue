<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-clipboard-data-fill me-1"></i> Gestión de Observaciones
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ observacionesFiltradas.length }} registros</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Recargar -->
            <button @click="obtenerObservaciones" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <!-- Botón Filtros (Solo Móvil) -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="abrirModalCarga" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_box</span>
              <span class="fw-bold d-none d-md-inline small">Nueva Obs.</span>
            </button>

            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Observaciones</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2 flex-md-nowrap">
            <div class="col-6 col-md-1">
              <input v-model="filtros.fecha" class="form-control form-control-sm shadow-none text-md-center" placeholder="DD/MM/AAAA">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.nombre_observador" class="form-control form-control-sm shadow-none" placeholder="Observador...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.arbitros" class="form-control form-control-sm shadow-none" placeholder="Árbitros observados...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.competencia" class="form-control form-control-sm shadow-none" placeholder="Competencia...">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.categoria" class="form-control form-control-sm shadow-none" placeholder="Categoría...">
            </div>
            <div class="col-6 col-md-1">
              <input v-model="filtros.partido" class="form-control form-control-sm shadow-none" placeholder="Partido...">
            </div>
            <div class="col-6 col-md-1">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none" :class="{ 'text-muted': !filtros.estado }">
                <option value="">ESTADO</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
                <option value="anulada">Anulada</option>
              </select>
            </div>
            <div class="col-6 col-md-1">
              <select v-model="filtros.anio" class="form-select form-select-sm shadow-none">
                <option value="">AÑO</option>
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">{{ anio }}</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando observaciones...</p>
          </div>

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem; table-layout: fixed;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-id" style="width: 50px;">ID</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones" style="width: 110px;">Acciones</th>
                    <th class="py-3 text-center text-uppercase text-muted col-fija col-fecha" style="width: 110px;">Fecha</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 180px;">Observador</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 220px;">Árbitros Observados</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 180px;">Competencia</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 130px;">Categoría</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 220px;">Partido</th>
                    <th class="py-3 text-center text-uppercase text-muted" style="width: 120px;">Estado</th>
                    <th class="py-3 text-center pe-3 text-uppercase text-muted" style="width: 140px;">Cargado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in observacionesPaginadas" :key="o.id">
                    <td class="text-center text-muted fw-bold font-monospace col-fija col-id">{{ o.id }}</td>
                    <td class="text-center col-fija col-acciones">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="abrirModalGestion(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Gestionar / Modificar">
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button @click="verDetalle(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-secondary" title="Ver detalle" :disabled="cargandoDetalleId === o.id">
                          <span v-if="cargandoDetalleId === o.id" class="spinner-border spinner-border-sm"></span>
                          <span v-else class="material-icons" style="font-size:16px;">visibility</span>
                        </button>
                        <button @click="verHistorial(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Historial de estos árbitros">
                          <span class="material-icons" style="font-size:16px;">manage_search</span>
                        </button>
                      </div>
                    </td>
                    <td class="text-center fw-bold col-fija col-fecha">{{ formatearFecha(o.fecha_partido) }}</td>
                    <td class="text-dark text-truncate" :title="o.nombre_observador" style="max-width: 180px;">{{ o.nombre_observador }}</td>
                    <td class="fw-bold text-uppercase text-dark text-truncate" :title="nombresArbitros(o)" style="max-width: 220px;">{{ nombresArbitros(o) }}</td>
                    <td class="text-dark text-truncate" :title="o.competencia" style="max-width: 180px;">{{ o.competencia }}</td>
                    <td class="text-dark text-truncate" :title="categoriaObs(o)" style="max-width: 130px;">{{ categoriaObs(o) }}</td>
                    <td class="text-dark text-truncate" :title="`${o.equipo_local} vs ${o.equipo_visitante}`" style="max-width: 220px;">
                      {{ o.equipo_local }} vs {{ o.equipo_visitante }}
                      <span v-if="o.numero_partido" class="text-muted">(Nº {{ o.numero_partido }})</span>
                    </td>
                    <td class="text-center">
                      <span :class="badgeEstado(o.estado)">{{ etiquetaEstado(o.estado) }}</span>
                    </td>
                    <td class="text-center pe-3 text-muted">{{ formatearFechaHora(o.creado_en) }}</td>
                  </tr>
                  <tr v-if="observacionesPaginadas.length === 0">
                    <td colspan="10" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">assignment_late</span>
                      <p class="m-0 fw-bold">No hay ninguna observación registrada.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="o in observacionesPaginadas" :key="'mob-'+o.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">

                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem; line-height: 1.2;">
                    {{ o.arb1 }} - {{ o.arb2 }}
                    <span v-if="!o.arb1">{{ o.arbitros }}</span>
                  </div>
                  <div class="small text-muted fw-bold text-end">
                    #{{ o.id }}<br>
                    {{ formatearFecha(o.fecha_partido) }}
                    <div class="mt-1">
                      <span :class="badgeEstado(o.estado)">{{ etiquetaEstado(o.estado) }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-body pt-0 px-3 pb-3">
                  <div class="bg-light p-2 rounded border mt-2 border-light-subtle">
                    <p class="m-0 text-dark small"><strong class="text-muted">Obs:</strong> {{ o.nombre_observador }}</p>
                    <p class="m-0 text-dark small mt-1"><strong class="text-muted">Competencia:</strong> {{ o.competencia }}</p>
                    <p class="m-0 text-dark small mt-1">
                      <strong class="text-muted">Partido:</strong> {{ o.equipo_local }} vs {{ o.equipo_visitante }}
                      <span class="badge bg-secondary ms-1">{{ categoriaObs(o) }}</span>
                    </p>
                    <div class="d-flex justify-content-between mt-2 border-top border-secondary-subtle pt-2">
                      <span class="text-dark small" v-if="o.numero_partido">Nº Partido: <strong>{{ o.numero_partido }}</strong></span>
                      <span class="text-muted small">Cargado: {{ formatearFechaHora(o.creado_en) }}</span>
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-3">
                    <button @click="abrirModalGestion(o)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                      <span class="material-icons" style="font-size: 18px;">edit</span> Gestionar
                    </button>
                    <button @click="verDetalle(o)" class="btn btn-sm btn-outline-secondary shadow-sm px-3 d-flex justify-content-center align-items-center" title="Ver detalle" :disabled="cargandoDetalleId === o.id">
                      <span v-if="cargandoDetalleId === o.id" class="spinner-border spinner-border-sm"></span>
                      <span v-else class="material-icons" style="font-size: 18px;">visibility</span>
                    </button>
                    <button @click="verHistorial(o)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center" title="Ver historial">
                      <span class="material-icons" style="font-size: 18px;">manage_search</span>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="observacionesPaginadas.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">assignment_late</span>
                <p class="text-muted m-0 fw-bold">No hay observaciones registradas.</p>
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
          </template>

        </div>
      </div>
    </div>

    <!-- ==========================================
         MODAL 1: GESTIONAR OBSERVACIÓN (APROBAR/ANULAR)
         ========================================== -->
    <ModalBase :show="mostrarModal" @close="cerrarModal" titulo="Gestionar Observación" icono="edit" colorIcono="bg-primary text-white" maxWidth="500px">
      <div class="text-center mb-3">
        <p class="text-muted small mt-1 mb-1">Observación #{{ observacionActual.id }} — {{ formatearFecha(observacionActual.fecha_partido) }}</p>
        <span :class="badgeEstado(observacionActual.estado)">Estado actual: {{ etiquetaEstado(observacionActual.estado) }}</span>
      </div>
      <div class="text-start bg-light p-3 rounded border mb-4 border-secondary-subtle">
        <p class="m-0 fw-bold small text-dark mb-1">Árbitros: <span class="text-danger">{{ nombresArbitros(observacionActual) }}</span></p>
        <p class="m-0 small text-dark"><strong class="text-muted">Observador:</strong> {{ observacionActual.nombre_observador }}</p>
        <p class="m-0 small text-dark mt-1">
          <strong class="text-muted">Partido:</strong> {{ observacionActual.equipo_local }} vs {{ observacionActual.equipo_visitante }} ({{ categoriaObs(observacionActual) }})
        </p>
        <div class="alert alert-info py-2 px-3 mt-3 mb-0 d-flex align-items-center gap-2" style="font-size: 0.8rem;">
          <span class="material-icons" style="font-size: 16px;">info</span>
          Cargada el <strong>{{ formatearFechaHora(observacionActual.creado_en) }}</strong>.
        </div>
      </div>
      <div class="text-start">
        <label class="small fw-bold mb-1 text-dark">Competencia</label>
        <input v-model="competenciaEditada" class="form-control shadow-none border-secondary-subtle mb-3" placeholder="Competencia (corregir si hay error de tipeo)">

        <label class="small fw-bold mb-1 text-dark">Actualizar Estado de la Observación</label>
        <select v-model="nuevoEstado" class="form-select shadow-none border-primary-subtle fw-bold">
          <option value="pendiente">Pendiente de Revisión</option>
          <option value="aprobada">Aprobar Observación</option>
          <option value="rechazada">Rechazar Observación</option>
          <!-- Anular sólo disponible mientras la observación esté pendiente -->
          <option value="anulada" :disabled="!gestionEsPendiente">Anular Observación{{ gestionEsPendiente ? '' : ' (no disponible: ya revisada)' }}</option>
        </select>
        <p v-if="!gestionEsPendiente" class="text-muted small mt-1 mb-0">
          <i class="bi bi-info-circle me-1"></i>Una observación aprobada o rechazada no puede anularse.
        </p>
        <div class="mt-3">
          <label class="small fw-bold mb-1 text-dark">Comentarios Adicionales (Opcional)</label>
          <textarea v-model="comentariosRevision" class="form-control shadow-none border-secondary-subtle" rows="2" placeholder="Motivo de anulación, correcciones, etc..."></textarea>
        </div>
      </div>
      <template #footer>
        <button @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1">CANCELAR</button>
        <button @click="guardarCambiosGestion" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span> GUARDAR
        </button>
      </template>
    </ModalBase>

    <!-- ==========================================
         MODAL 2: CARGAR NUEVA OBSERVACIÓN (FORMULARIO)
         ========================================== -->
    <ModalBase :show="mostrarModalCarga" @close="cerrarModalCarga" titulo="Cargar Observación Manual" icono="add_box" colorIcono="bg-danger text-white" maxWidth="900px">

      <form @submit.prevent="cargarObservacionExcel" class="text-start pb-2">
        <!-- SECCIÓN 2: PARTIDO -->
        <div class="p-3 p-md-4 border-bottom">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
            <i class="bi bi-clipboard-data text-danger me-2 fs-5"></i>
            <h6 class="fw-bold m-0 text-dark text-uppercase">Datos del Partido</h6>
          </div>
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label class="form-label fw-bold text-uppercase small text-dark">Género *</label>
              <div class="btn-group w-100" role="group">
                <template v-for="opt in ['Caballeros', 'Damas']" :key="opt">
                  <input type="radio" class="btn-check" :id="'gen-' + opt" :value="opt" v-model="formulario.partido_genero">
                  <label class="btn btn-outline-danger fw-bold" :for="'gen-' + opt">{{ opt }}</label>
                </template>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold text-uppercase small text-dark">Categoría *</label>
              <div class="btn-group w-100" role="group">
                <template v-for="opt in ['Mayores', 'Inferiores']" :key="opt">
                  <input type="radio" class="btn-check" :id="'cat-' + opt" :value="opt" v-model="formulario.partido_categoria">
                  <label class="btn btn-outline-danger fw-bold" :for="'cat-' + opt">{{ opt }}</label>
                </template>
              </div>
            </div>
          </div>

          <div v-if="formulario.partido_categoria === 'Mayores'" class="mb-3 animate__animated animate__fadeIn">
            <label class="form-label fw-bold text-uppercase small text-dark">Competencia Mayores *</label>
            <select @change='seleccionarCategoria()' v-model="formulario.inf_nivel" class="form-select shadow-sm border-secondary-subtle" required>
              <option value="" disabled>Seleccione competencia</option>
              <option v-for="(div, k) in divisionesMayores" :key="k" :value="div.idCategoria">{{ div.division }}</option>
            </select>
          </div>

          <div v-if="formulario.partido_categoria === 'Inferiores'" class="row g-3 mb-3 animate__animated animate__fadeIn">
            <div class="col-md-8">
              <label class="form-label fw-bold text-uppercase small text-dark">Categoría Específica *</label>
              <select @change='setDivisiones()' v-model="formulario.id_categoria_especifica" class="form-select shadow-sm border-secondary-subtle" required :disabled="cargandoCategorias">
                <option value="" disabled>{{ cargandoCategorias ? 'Cargando...' : 'Seleccione Categoría' }}</option>
                <option v-for="(cat, k) in listas.divisiones_categorias" :key="k" :value="k">{{ cat.categoria }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold text-uppercase small text-dark">Nivel *</label>
              <select @change='seleccionarCategoria()' v-model="formulario.inf_nivel" class="form-select shadow-sm border-secondary-subtle" required>
                <option value="" disabled>Nivel</option>
                <option v-for="opt in listas.divisiones" :key="opt.idCategoria" :value="opt.idCategoria">{{ opt.division }}</option>
              </select>
            </div>
          </div>

          <div v-if="idCategoria" class="mb-3 animate__animated animate__fadeIn">
            <label class="form-label fw-bold text-uppercase small text-dark">Fecha del Partido *</label>
            <input type="date" @change="obtenerPartidos()" v-model="fechaPartido" class="form-control shadow-sm border-secondary-subtle" required>
          </div>

          <div v-if="fechaPartido" class="mb-2 animate__animated animate__fadeIn">
            <label class="form-label fw-bold text-uppercase small text-dark">Partido *</label>
            <select v-model="idPartido" class="form-select shadow-sm border-secondary-subtle" required :disabled="cargandoPartidos">
              <option value="" disabled>{{ cargandoPartidos ? 'Cargando...' : (partidos.length ? 'Seleccione partido' : 'No hay partidos para esa fecha') }}</option>
              <option v-for="p in partidos" :key="p.id" :value="p.id">{{ p.local }} vs {{ p.visitante }}</option>
            </select>
          </div>
        </div>

        <!-- SECCIÓN 3: ARBITRAJE (solo lectura) -->
        <div class="p-3 p-md-4 bg-light border-bottom">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
            <i class="bi bi-person-badge text-danger me-2 fs-5"></i>
            <h6 class="fw-bold m-0 text-dark text-uppercase">Arbitraje Observado</h6>
          </div>

          <div v-if="!partidoSeleccionado" class="text-muted small fst-italic">
            Seleccioná un partido para ver los árbitros designados.
          </div>

          <div v-else class="row g-3">
            <div class="col-md-6">
              <div class="card shadow-sm border-light-subtle h-100">
                <div class="card-body p-3">
                  <label class="fw-bold mb-2 text-danger small text-uppercase">Árbitro 1</label>
                  <p class="form-control-plaintext fw-bold text-dark m-0">{{ partidoSeleccionado.arbitro_1 || 'Sin designar' }}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6" v-if="partidoSeleccionado.arbitro_2">
              <div class="card shadow-sm border-light-subtle h-100 animate__animated animate__fadeIn">
                <div class="card-body p-3">
                  <label class="fw-bold mb-2 text-danger small text-uppercase">Árbitro 2</label>
                  <p class="form-control-plaintext fw-bold text-dark m-0">{{ partidoSeleccionado.arbitro_2 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3.5: OBSERVADOR -->
        <div class="p-3 p-md-4 border-bottom">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
            <i class="bi bi-person-check text-danger me-2 fs-5"></i>
            <h6 class="fw-bold m-0 text-dark text-uppercase">Observador</h6>
          </div>
          <label class="form-label fw-bold text-uppercase small text-dark">Quién realizó la observación *</label>
          <select v-model="formulario.id_observador" class="form-select shadow-sm border-secondary-subtle" required :disabled="cargandoArbitros">
            <option value="" disabled>{{ cargandoArbitros ? 'Cargando árbitros...' : 'Seleccione observador' }}</option>
            <option v-for="a in listaArbitros" :key="a.id" :value="a.id">{{ a.apellido }}, {{ a.nombre }}</option>
          </select>
        </div>

        <!-- SECCIÓN 4: PLANILLA DE EVALUACIÓN (EXCEL) -->
        <div class="p-3 p-md-4">
          <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-danger">
            <i class="bi bi-file-earmark-spreadsheet text-danger me-2 fs-5"></i>
            <h6 class="fw-bold m-0 text-dark text-uppercase">Planilla de Evaluación</h6>
          </div>

          <div
            class="excel-dropzone"
            :class="{ 'is-dragover': arrastrandoArchivo, 'has-file': archivoObservacion }"
            @dragover.prevent="arrastrandoArchivo = true"
            @dragleave.prevent="arrastrandoArchivo = false"
            @drop.prevent="soltarArchivoObservacion"
            @click="$refs.inputArchivoObservacion.click()"
          >
            <input
              ref="inputArchivoObservacion"
              type="file"
              accept=".xlsx,.xls"
              class="d-none"
              @change="seleccionarArchivoObservacion"
            >

            <template v-if="!archivoObservacion">
              <i class="bi bi-cloud-arrow-up-fill excel-dropzone-icon"></i>
              <p class="m-0 fw-bold text-dark">Arrastrá aquí la planilla de Excel</p>
              <p class="m-0 small text-muted">o hacé clic para seleccionar un archivo (.xlsx, .xls)</p>
            </template>
            <template v-else>
              <i class="bi bi-check-circle-fill excel-dropzone-icon text-success"></i>
              <p class="m-0 fw-bold text-dark">{{ archivoObservacion.name }}</p>
              <p class="m-0 small text-muted">Archivo listo para cargar. Hacé clic para reemplazarlo.</p>
              <button type="button" class="btn btn-light btn-sm rounded-pill px-3 mt-2 border" @click.stop="quitarArchivoObservacion">
                Quitar archivo
              </button>
            </template>
          </div>
        </div>

        <!-- Botones de Acción Formulario -->
        <div class="d-flex gap-3 mt-2 px-3 px-md-4 pb-2">
          <button type="button" @click="cerrarModalCarga" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1 border">CANCELAR</button>
          <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="procesandoCarga || !archivoObservacion">
            <span v-if="procesandoCarga" class="spinner-border spinner-border-sm me-2"></span>
            {{ procesandoCarga ? 'GUARDANDO...' : 'GUARDAR OBSERVACIÓN' }}
          </button>
        </div>
      </form>
    </ModalBase>

    <!-- ==========================================
         MODAL 3: HISTORIAL DEL ÁRBITRO
         ========================================== -->
    <ModalBase :show="mostrarModalHistorial" @close="mostrarModalHistorial = false" icono="manage_search" colorIcono="bg-warning text-dark" maxWidth="700px">
      <template #header>
        <div class="d-flex align-items-center justify-content-center gap-2">
          Historial de {{ observadorHistorialNombre }}
          <span class="badge bg-dark rounded-pill fs-6 d-flex align-items-center justify-content-center" style="min-width: 28px; min-height: 28px;">
            {{ historialSeleccionado.length }}
          </span>
        </div>
      </template>

      <!-- Historial PC -->
      <div class="d-none d-md-block table-responsive border rounded shadow-sm m-0">
        <table class="table table-sm table-hover align-middle m-0" style="font-size: 0.75rem;">
          <thead class="table-light" style="border-bottom: 2px solid #e2e8f0;">
            <tr>
              <th class="py-2 ps-3 fw-bold text-uppercase" style="font-size: 0.75rem;">Fecha</th>
              <th class="py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Categoría</th>
              <th class="py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Partido</th>
              <th class="py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Competencia</th>
              <th class="py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Árbitros</th>
              <th class="py-2 pe-3 fw-bold text-uppercase text-center" style="font-size: 0.75rem;">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in historialSeleccionado" :key="'h-'+h.id" style="border-bottom: 1px solid #f1f5f9;">
              <td class="text-nowrap text-muted fw-bold ps-3 py-3">{{ formatearFecha(h.fecha_partido) }}</td>
              <td class="py-3"><span class="badge bg-secondary">{{ categoriaObs(h) }}</span></td>
              <td class="py-3 text-dark">
                {{ h.equipo_local }} vs {{ h.equipo_visitante }}
                <span v-if="h.numero_partido" class="text-muted">(Nº {{ h.numero_partido }})</span>
              </td>
              <td class="py-3 text-dark">{{ h.competencia }}</td>
              <td class="py-3 text-dark">{{ nombresArbitros(h) }}</td>
              <td class="py-3 pe-3 text-center"><span :class="badgeEstado(h.estado)">{{ etiquetaEstado(h.estado) }}</span></td>
            </tr>
            <tr v-if="historialSeleccionado.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">No hay registros previos en el historial.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Historial Móvil -->
      <div class="d-md-none">
        <div v-if="historialSeleccionado.length === 0" class="text-center py-4 text-muted">
          No hay registros en el historial.
        </div>
        <div v-for="h in historialSeleccionado" :key="'hmob-'+h.id" class="border border-light-subtle rounded-3 p-3 shadow-sm bg-light mb-3">
          <div class="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2">
            <div class="fw-bold lh-sm text-dark pe-2" style="font-size: 0.95rem;">
              {{ h.equipo_local }} vs {{ h.equipo_visitante }}
              <div class="text-danger mt-1" style="font-size: 0.75rem;">{{ categoriaObs(h) }} • {{ formatearFecha(h.fecha_partido) }}</div>
            </div>
          </div>
          <div class="d-flex justify-content-between border-bottom pb-2 mb-2 small">
            <span class="fw-bold text-dark">Árbitros:</span>
            <span class="text-muted text-end">{{ nombresArbitros(h) }}</span>
          </div>
          <div class="d-flex justify-content-between border-bottom pb-2 mb-2 small">
            <span class="fw-bold text-dark">Competencia:</span>
            <span class="text-muted">{{ h.competencia }}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center small">
            <span class="fw-bold text-dark">Estado:</span>
            <span :class="badgeEstado(h.estado)">{{ etiquetaEstado(h.estado) }}</span>
          </div>
        </div>
      </div>
    </ModalBase>

    <!-- ==========================================
         MODAL 4: DETALLE DE LA OBSERVACIÓN (notas + ítems)
         ========================================== -->
    <ModalBase :show="mostrarDetalle" @close="cerrarDetalle" titulo="Detalle de la Observación" icono="visibility" colorIcono="bg-secondary text-white" maxWidth="800px">
      <div v-if="detalle" class="text-start">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <p class="m-0 fw-bold small text-dark">Observación #{{ detalle.id }}</p>
            <p class="m-0 text-muted small">{{ formatearFecha(detalle.fecha_partido) }} — {{ detalle.competencia }}</p>
          </div>
          <span class="align-self-center" :class="badgeEstado(detalle.estado)">
            {{ etiquetaEstado(detalle.estado) }}
          </span>
        </div>

        <div class="bg-light p-3 rounded border mb-3 border-secondary-subtle">
          <p class="m-0 small text-dark"><strong class="text-muted">Árbitros:</strong> {{ nombresArbitros(detalle) }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Observador:</strong> {{ detalle.nombre_observador }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Categoría:</strong> {{ categoriaObs(detalle) }}</p>
          <p class="m-0 small text-dark mt-1"><strong class="text-muted">Partido:</strong> {{ detalle.equipo_local }} vs {{ detalle.equipo_visitante }}</p>
          <p class="m-0 small text-dark mt-1" v-if="detalle.numero_partido"><strong class="text-muted">Nº Partido:</strong> {{ detalle.numero_partido }}</p>
          <p class="m-0 small text-dark mt-1" v-if="detalle.puntaje_final != null"><strong class="text-muted">Puntaje final:</strong> <span class="fw-bold text-danger">{{ detalle.puntaje_final }}</span></p>
        </div>

        <div v-if="(detalle.estado === 'anulada' || detalle.estado === 'rechazada') && detalle.comentario_estado" class="alert alert-danger py-2 px-3 small mb-3">
          <i class="bi bi-info-circle me-1"></i><strong>{{ detalle.estado === 'anulada' ? 'Motivo de anulación' : 'Motivo de rechazo' }}:</strong> {{ detalle.comentario_estado }}
        </div>

        <!-- Tabs: Score sheet (puntajes) / Comment sheet (comentarios) -->
        <ul class="nav nav-tabs mb-0" role="tablist">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tabDetalle === 'puntajes' }" type="button" @click="tabDetalle = 'puntajes'">
              <i class="bi bi-list-ol me-1"></i> Puntajes
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: tabDetalle === 'comentarios' }" type="button" @click="tabDetalle = 'comentarios'">
              <i class="bi bi-chat-left-text me-1"></i> Comentarios
            </button>
          </li>
        </ul>

        <!-- TAB PUNTAJES (Score sheet) -->
        <div v-show="tabDetalle === 'puntajes'" class="border border-top-0 rounded-bottom overflow-hidden">
          <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.78rem;">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 text-uppercase text-muted">Categoría / Ítem</th>
                <th class="py-2 text-center text-uppercase text-muted" style="width: 150px;">Valoración</th>
                <th class="py-2 text-center text-uppercase text-muted" style="width: 90px;">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="it in (detalle.items || [])" :key="'it-' + it.id">
                <tr v-if="it.tipo === 'categoria'" class="table-light">
                  <td class="fw-bold text-dark ps-3">{{ it.categoria }}</td>
                  <td></td>
                  <td class="text-center fw-bold text-danger">{{ it.puntaje ?? '-' }}</td>
                </tr>
                <tr v-else>
                  <td class="text-dark ps-4">{{ it.item }}</td>
                  <td class="text-center text-muted">{{ it.valoracion || '-' }}</td>
                  <td class="text-center">{{ it.puntaje ?? '-' }}</td>
                </tr>
              </template>
              <tr v-if="!detalle.items || detalle.items.length === 0">
                <td colspan="3" class="text-center py-3 text-muted">Sin ítems cargados.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TAB COMENTARIOS (Comment sheet) -->
        <div v-show="tabDetalle === 'comentarios'" class="border border-top-0 rounded-bottom p-3">
          <!-- Comentario por categoría -->
          <div v-if="comentariosPorCategoria.length">
            <div v-for="(c, idx) in comentariosPorCategoria" :key="'com-' + idx" class="mb-3">
              <div class="fw-bold small text-dark">{{ c.categoria }}</div>
              <div class="small text-muted" style="white-space: pre-line;">{{ c.comentario }}</div>
            </div>
          </div>

          <!-- Prioridades de mejora -->
          <div v-if="detalle.prioridad_mejora_1 || detalle.prioridad_mejora_2 || detalle.prioridad_mejora_resto" class="mt-2 pt-2 border-top">
            <div class="fw-bold small text-dark mb-1">Prioridades de mejora</div>
            <div v-if="detalle.prioridad_mejora_1" class="small text-muted mb-1"><strong>1.</strong> {{ detalle.prioridad_mejora_1 }}</div>
            <div v-if="detalle.prioridad_mejora_2" class="small text-muted mb-1"><strong>2.</strong> {{ detalle.prioridad_mejora_2 }}</div>
            <div v-if="detalle.prioridad_mejora_resto" class="small text-muted mb-1" style="white-space: pre-line;">{{ detalle.prioridad_mejora_resto }}</div>
          </div>

          <!-- Influencia en el resultado -->
          <div v-if="detalle.influencia_resultado_comentarios" class="mt-2 pt-2 border-top">
            <div class="fw-bold small text-dark mb-1">Influencia en el resultado</div>
            <div class="small text-muted" style="white-space: pre-line;">{{ detalle.influencia_resultado_comentarios }}</div>
          </div>

          <div v-if="!tieneComentarios" class="text-center py-3 text-muted small">
            Esta observación no tiene comentarios cargados.
          </div>
        </div>

        <!-- Acciones (dentro del cuerpo para que se vean también en mobile) -->
        <div class="d-flex flex-column flex-sm-row gap-2 mt-4">
          <button @click="descargarObservacionExcel(detalle)" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm order-1 order-sm-2 flex-sm-grow-1 d-flex align-items-center justify-content-center gap-2" :disabled="descargandoId === detalle.id">
            <span v-if="descargandoId === detalle.id" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-file-earmark-excel"></i>
            DESCARGAR EXCEL
          </button>
          <button @click="cerrarDetalle" class="btn btn-light border rounded-pill px-4 fw-bold order-2 order-sm-1 flex-sm-grow-1">CERRAR</button>
        </div>
      </div>
      <div v-else class="text-center py-4">
        <span class="spinner-border text-danger"></span>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue';
import { api } from '@/api/api';
import ExcelJS from 'exceljs'
import { useHead } from '@vueuse/head';
import ModalBase from '@/components/ModalBase.vue';

useHead({
  title: 'Observaciones | AAAB',
  meta: [{ name: 'description', content: 'Administración y seguimiento de observaciones arbitrales.' }],
});

const toast = inject('toast', ({ mensaje }) => alert(mensaje));

/* ====================================================
   ESTADO GLOBAL DE LA TABLA
   ==================================================== */
const observaciones = ref([]);
const cargando = ref(false);

const filtros = reactive({ fecha: '', anio: '', estado: '', nombre_observador: '', arbitros: '', competencia: '', categoria: '', partido: '' });
const mostrarFiltrosMobile = ref(false);

const paginaActual = ref(1);
const registrosPorPagina = 10;

// Filtros y Paginación
const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const formatearFecha = (fechaIso) => {
  if (!fechaIso) return 'S/F';
  const [anio, mes, dia] = fechaIso.split(' ')[0].split('-');
  if (!anio || !mes || !dia) return fechaIso;
  return `${dia}/${mes}/${anio}`;
};

const formatearFechaHora = (fechaHora) => {
  if (!fechaHora) return '-';
  const [fecha, hora] = fechaHora.split(' ');
  return `${formatearFecha(fecha)}${hora ? ' ' + hora.slice(0, 5) : ''}`;
};

// Árbitros observados: prioriza los nombres reales (arb1/arb2, que salen de ref1_id/ref2_id);
// si no hay ids cargados, cae al texto libre del Excel (o.arbitros).
const nombresArbitros = (o) => {
  const partes = [o.arb1, o.arb2].filter(n => n && n.trim() && n !== ', ');
  if (partes.length) return partes.join(' - ');
  return o.arbitros || '-';
};

// Categoría del partido: usa la categoría del partido (o.categoria) y cae a la
// categoría de edad del Excel (categoria_edad) si aquella no está.
const categoriaObs = (o) => o.categoria || o.categoria_edad || '-';

const etiquetaEstado = (estado) => {
  const e = (estado || 'pendiente').toLowerCase();
  if (e === 'aprobada') return 'APROBADA';
  if (e === 'rechazada') return 'RECHAZADA';
  if (e === 'anulada') return 'ANULADA';
  return 'PENDIENTE';
};

const badgeEstado = (estado) => {
  const e = (estado || 'pendiente').toLowerCase();
  if (e === 'aprobada') return 'estado-pill estado-aprobada';
  if (e === 'rechazada') return 'estado-pill estado-rechazada';
  if (e === 'anulada') return 'estado-pill estado-anulada';
  return 'estado-pill estado-pendiente';
};

const aniosDisponibles = computed(() => {
  const anios = new Set()
  observaciones.value.forEach(o => {
    const anio = (o.fecha_partido || '').substring(0, 4)
    if (anio) anios.add(anio)
  })
  return [...anios].sort((a, b) => b.localeCompare(a))
});

const observacionesFiltradas = computed(() => {
  return observaciones.value.filter(o => {
    const matchFec = formatearFecha(o.fecha_partido).includes(filtros.fecha);
    const matchAnio = !filtros.anio || (o.fecha_partido || '').substring(0, 4) === filtros.anio;
    const matchEstado = !filtros.estado || (o.estado || 'pendiente').toLowerCase() === filtros.estado;
    const matchObs = normalizar(o.nombre_observador).includes(normalizar(filtros.nombre_observador));
    const matchArb = normalizar(nombresArbitros(o)).includes(normalizar(filtros.arbitros));
    const matchComp = normalizar(o.competencia).includes(normalizar(filtros.competencia));
    const matchCat = normalizar(categoriaObs(o)).includes(normalizar(filtros.categoria));
    const matchPar = normalizar(`${o.equipo_local} ${o.equipo_visitante} ${o.numero_partido}`).includes(normalizar(filtros.partido));

    return matchFec && matchAnio && matchEstado && matchObs && matchArb && matchComp && matchCat && matchPar;
  });
});

const totalPaginas = computed(() => Math.ceil(observacionesFiltradas.value.length / registrosPorPagina) || 1);
const observacionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return observacionesFiltradas.value.slice(inicio, inicio + registrosPorPagina);
});

const cambiarPagina = (delta) => {
  if (paginaActual.value + delta >= 1 && paginaActual.value + delta <= totalPaginas.value) {
    paginaActual.value += delta;
    setTimeout(() => { if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' }); }, 50);
  }
};

watch(filtros, () => { paginaActual.value = 1 }, { deep: true });
watch(totalPaginas, (nuevo) => { if(paginaActual.value > nuevo) paginaActual.value = nuevo });

const obtenerObservaciones = async () => {
  cargando.value = true;
  try {
    const res = await api.get({ entity: 'observaciones', action: 'obtenerEvaluaciones' });
    if (res && res.ok) {
      observaciones.value = res.payload.sort((a, b) => b.id - a.id);
    } else {
      observaciones.value = [];
      toast({ titulo: 'Sin datos', mensaje: 'No se pudieron cargar las observaciones.', tipo: 'warning' });
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Problema al cargar las observaciones.', tipo: 'danger' });
  } finally {
    cargando.value = false;
  }
};

/* ====================================================
   ESTADO MODAL 1: GESTIONAR (Aprobar/Anular)
   ==================================================== */
const mostrarModal = ref(false);
const observacionActual = ref({});
const nuevoEstado = ref('');
const comentariosRevision = ref('');
const competenciaEditada = ref('');

// La opción "anular" en el modal sólo se habilita si la observación sigue pendiente.
const gestionEsPendiente = computed(() => (observacionActual.value.estado || 'pendiente').toLowerCase() === 'pendiente');

const abrirModalGestion = (obs) => {
  observacionActual.value = { ...obs };
  nuevoEstado.value = (obs.estado || 'pendiente').toLowerCase();
  comentariosRevision.value = '';
  competenciaEditada.value = obs.competencia || '';
  mostrarModal.value = true;
};

const cerrarModal = () => { mostrarModal.value = false; };

const guardarCambiosGestion = async () => {
  cargando.value = true;
  try {
    // Recordatorio: NO enviar puntaje_final, se calcula dinámicamente.
    // Se envía la competencia por si el admin la corrigió (error de tipeo del observador).
    const payload = {
      id: observacionActual.value.id,
      estado: nuevoEstado.value,
      comentarios: comentariosRevision.value,
      competencia: competenciaEditada.value
    };
    const res = await api.post({ entity: 'observaciones', action: 'actualizarEstado', payload: payload });

    if (res && res.ok) {
      toast({ titulo: 'Actualizado', mensaje: 'Observación modificada con éxito.', tipo: 'success' });
      await obtenerObservaciones();
      cerrarModal();
    } else {
      toast({ titulo: 'No se pudo actualizar', mensaje: res?.message || 'El cambio de estado fue rechazado.', tipo: 'danger' });
    }
  } catch{
    toast({ titulo: 'Error', mensaje: 'Ocurrió un problema al guardar los cambios.', tipo: 'danger' });
  } finally {
    cargando.value = false;
  }
};

/* ====================================================
   ESTADO MODAL 2: CARGAR NUEVA OBSERVACIÓN MANUAL
   ==================================================== */
const mostrarModalCarga = ref(false);
const procesandoCarga = ref(false);
const cargandoCategorias = ref(false);
const cargandoArbitros = ref(false);

const divisionesMayores = ref([]);
const listaArbitros = ref([]);

const listas = reactive({
  divisiones_categorias: [], divisiones: []
});

const formulario = reactive({
  partido_genero: '', partido_categoria: '', inf_nivel: '',
  id_categoria_especifica: '', categoria: '', id_observador: ''
});

const idCategoria = ref(null);

const fechaPartido = ref('');
const cargandoPartidos = ref(false);
const partidos = ref([]);
const idPartido = ref(null);

// Partido completo seleccionado: de ahí se leen los árbitros designados (solo lectura)
const partidoSeleccionado = computed(() => partidos.value.find(p => p.id === idPartido.value) || null);

const archivoObservacion = ref(null);
const arrastrandoArchivo = ref(false);

const abrirModalCarga = () => { mostrarModalCarga.value = true; cargarArbitrosObservadores(); };
const cerrarModalCarga = () => { mostrarModalCarga.value = false; reiniciarFormularioCarga(); };

// Trae todos los árbitros para el select de observador.
const cargarArbitrosObservadores = async () => {
  if (listaArbitros.value.length) return; // ya cargados
  cargandoArbitros.value = true;
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitrosBasico', payload: { soloActivos: true } });
    if (res && res.ok && Array.isArray(res.payload)) {
      listaArbitros.value = res.payload
        .slice()
        .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, 'es'));
    }
  } catch (e) {
    console.error('cargarArbitrosObservadores:', e);
  } finally {
    cargandoArbitros.value = false;
  }
};

const pedirCategoriasEspecíficas = async () => {
  if (!formulario.partido_genero || !formulario.partido_categoria) return;
  cargandoCategorias.value = true;
  listas.divisiones = []; formulario.id_categoria_especifica = '';
  try {
    const res = await api.get({
      entity: 'observaciones', action: 'obtenerCategorias',
      payload: { genero: formulario.partido_genero, tipo: formulario.partido_categoria }
    });
    if (res.ok) {
      if (formulario.partido_categoria === 'Mayores') {
        divisionesMayores.value = res.payload[0]?.divisiones || [];
      } else {
        listas.divisiones_categorias = res.payload;
      }
    }
  } catch (error) { console.error(error); }
  finally { cargandoCategorias.value = false; }
};

const setDivisiones = () => { listas.divisiones = listas.divisiones_categorias[formulario.id_categoria_especifica].divisiones; };

const seleccionarCategoria = async () => {
  idCategoria.value = formulario.inf_nivel;
  fechaPartido.value = '';
  partidos.value = [];
  idPartido.value = null;
};

const obtenerPartidos = async () => {
  partidos.value = [];
  idPartido.value = null;
  if (!fechaPartido.value || !idCategoria.value) return;
  cargandoPartidos.value = true;
  try {
    const r = await api.get({
      entity: 'designaciones', action: 'obtenerPartidos',
      payload: { fecha: fechaPartido.value, idCategoria: idCategoria.value }
    });
    if (r.ok) partidos.value = r.payload;
  } catch (error) { console.error('Error pidiendo partidos:', error); }
  finally { cargandoPartidos.value = false; }
};

watch(() => [formulario.partido_genero, formulario.partido_categoria], pedirCategoriasEspecíficas);

const ACEPTA_EXCEL = /\.(xlsx|xls)$/i;

const asignarArchivoObservacion = (file) => {
  if (!file) return;
  if (!ACEPTA_EXCEL.test(file.name)) {
    toast({ titulo: 'Archivo inválido', mensaje: 'Seleccioná un archivo de Excel (.xlsx o .xls).', tipo: 'warning' });
    return;
  }
  archivoObservacion.value = file;
};

const seleccionarArchivoObservacion = (event) => {
  asignarArchivoObservacion(event.target.files[0] || null);
  event.target.value = '';
};

const soltarArchivoObservacion = (event) => {
  arrastrandoArchivo.value = false;
  asignarArchivoObservacion(event.dataTransfer.files[0] || null);
};

const quitarArchivoObservacion = () => { archivoObservacion.value = null; };

const armarDatosPartido = () => {
  const datos = { ...formulario };
  if (formulario.partido_categoria === 'Mayores') {
    datos.categoria = 'Mayores';
  } else if (formulario.id_categoria_especifica !== '') {
    datos.categoria = listas.divisiones_categorias[formulario.id_categoria_especifica].categoria;
  }
  datos.id_categoria = idCategoria.value;
  datos.fecha_partido = fechaPartido.value;
  datos.id_partido = idPartido.value;
  datos.id_arb1 = partidoSeleccionado.value?.id_arb1 ?? null;
  datos.id_arb2 = partidoSeleccionado.value?.id_arb2 ?? null;
  return datos;
};

const cargarObservacionExcel = async () => {
  if (!archivoObservacion.value) {
    toast({ titulo: 'Dato Faltante', mensaje: 'Seleccioná el archivo de Excel para continuar.', tipo: 'warning' });
    return;
  }
  if (!formulario.id_observador) {
    toast({ titulo: 'Dato Faltante', mensaje: 'Seleccioná el observador que realizó la observación.', tipo: 'warning' });
    return;
  }
  procesandoCarga.value = true;
  try {
    const formData = new FormData();
    formData.append('archivo', archivoObservacion.value);
    formData.append('datos', JSON.stringify(armarDatosPartido()));

    const res = await api.postFile({ entity: 'observaciones', action: 'cargarObservacionExcel', payload: formData });

    if (res && res.ok) {
      toast({ titulo: 'Guardado', mensaje: 'La observación se ha registrado.', tipo: 'success' });
      await obtenerObservaciones();
      cerrarModalCarga();
    } else {
      toast({ titulo: 'Error al guardar', mensaje: res?.message || 'No se pudo procesar el envío.', tipo: 'danger' });
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' });
  } finally {
    procesandoCarga.value = false;
  }
};

const reiniciarFormularioCarga = () => {
  Object.assign(formulario, {
    partido_genero: '', partido_categoria: '', inf_nivel: '', id_categoria_especifica: '', categoria: '', id_observador: ''
  });
  idCategoria.value = null;
  fechaPartido.value = '';
  partidos.value = [];
  idPartido.value = null;
  archivoObservacion.value = null;
  arrastrandoArchivo.value = false;
};

/* ====================================================
   ESTADO MODAL 4: DETALLE DE LA OBSERVACIÓN
   ==================================================== */
const mostrarDetalle = ref(false);
const detalle = ref(null);
const cargandoDetalleId = ref(null);
const tabDetalle = ref('puntajes');
const descargandoId = ref(null);

// Descarga el Excel de una observación puntual (solo observador/coordinador/admin en el back).
const descargarObservacionExcel = async (obs) => {
  if (!obs) return;
  descargandoId.value = obs.id;
  try {
    await api.getFile(
      { entity: 'observaciones', action: 'descargarEvaluacionExcel', payload: { id: obs.id } },
      `observacion_${obs.id}.xlsx`
    );
  } catch (e) {
    console.error('descargarObservacionExcel:', e);
    toast({ titulo: 'Error', mensaje: 'No se pudo descargar el Excel de la observación.', tipo: 'danger' });
  } finally {
    descargandoId.value = null;
  }
};

// Comentarios por categoría (Comment sheet): los ítems tipo categoría que tienen comentario.
const comentariosPorCategoria = computed(() => {
  if (!detalle.value || !Array.isArray(detalle.value.items)) return [];
  return detalle.value.items
    .filter(it => it.tipo === 'categoria' && it.comentario)
    .map(it => ({ categoria: it.categoria, comentario: it.comentario }));
});

const tieneComentarios = computed(() => {
  if (!detalle.value) return false;
  return comentariosPorCategoria.value.length > 0
    || !!detalle.value.prioridad_mejora_1
    || !!detalle.value.prioridad_mejora_2
    || !!detalle.value.prioridad_mejora_resto
    || !!detalle.value.influencia_resultado_comentarios;
});

const verDetalle = async (obs) => {
  cargandoDetalleId.value = obs.id;
  detalle.value = null;
  tabDetalle.value = 'puntajes';
  try {
    const res = await api.get({ entity: 'observaciones', action: 'obtenerEvaluacion', payload: { id: obs.id } });
    if (res && res.ok && res.payload) {
      detalle.value = { ...obs, ...res.payload };
      mostrarDetalle.value = true;
    } else {
      toast({ titulo: 'Error', mensaje: 'No se pudo cargar el detalle.', tipo: 'danger' });
    }
  } catch (error) {
    toast({ titulo: 'Error', mensaje: 'Fallo al cargar el detalle.', tipo: 'danger' });
  } finally {
    cargandoDetalleId.value = null;
  }
};

const cerrarDetalle = () => { mostrarDetalle.value = false; detalle.value = null; };

/* ====================================================
   ESTADO MODAL 3: HISTORIAL DEL ÁRBITRO
   ==================================================== */
const mostrarModalHistorial = ref(false);
const historialSeleccionado = ref([]);
const observadorHistorialNombre = ref('');

const verHistorial = (obs) => {
  // Agrupa el historial por observador: todas las observaciones que cargó
  // el mismo observador que la fila seleccionada.
  observadorHistorialNombre.value = obs.nombre_observador || 'Observador';
  historialSeleccionado.value = observaciones.value
    .filter(o => o.nombre_observador === obs.nombre_observador)
    .sort((a, b) => b.id - a.id);
  mostrarModalHistorial.value = true;
};

/* ====================================================
   UTILIDADES COMPARTIDAS
   ==================================================== */
const limpiarFiltros = () => { Object.keys(filtros).forEach(key => filtros[key] = ''); };

const exportarExcel = async () => {
  if (observacionesFiltradas.value.length === 0) {
    toast({ titulo: 'Tabla Vacía', mensaje: 'No hay datos para exportar.', tipo: 'warning' }); return;
  }
  const datosExportar = observacionesFiltradas.value.map(o => ({
    'ID': o.id, 'Fecha': formatearFecha(o.fecha_partido), 'Observador': o.nombre_observador, 'Árbitros': o.arbitros,
    'Competencia': o.competencia, 'Categoría': o.categoria_edad, 'Local': o.equipo_local, 'Visitante': o.equipo_visitante,
    'Nº Partido': o.numero_partido, 'Estado': etiquetaEstado(o.estado), 'Cargado': o.creado_en
  }));

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Observaciones');

  const claves = Object.keys(datosExportar[0] || {});
  ws.columns = claves.map(clave => ({ header: clave, key: clave, width: 18 }));
  datosExportar.forEach(fila => ws.addRow(fila));
  if (claves.length) ws.getRow(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Reporte_Observaciones.xlsx';
  link.click();
  URL.revokeObjectURL(url);
};

// Inicialización
onMounted(() => {
  obtenerObservaciones();
});
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
  .col-fija {
    position: sticky !important;
    background-color: inherit;
    z-index: 10;
  }

  .tabla-fija thead .col-fija {
    background-color: #f8f9fa !important;
    z-index: 12;
  }

  .tabla-fija tbody .col-fija {
    background-color: #ffffff !important;
  }

  .col-id       { left: 0; min-width: 50px !important; max-width: 50px !important; }
  .col-acciones { left: 50px; min-width: 110px !important; max-width: 110px !important; }
  .col-fecha    {
    left: 160px;
    min-width: 110px !important;
    max-width: 110px !important;
    box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1);
  }
}

/* ====================================================
   ESTILOS FORMULARIO (MODAL CARGA)
   ==================================================== */
.excel-dropzone {
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
  padding: 40px 20px; border: 2px dashed #cbd5e1; border-radius: 12px; background: #f8fafc;
  cursor: pointer; transition: 0.2s;
}
.excel-dropzone:hover { border-color: #dc3545; background: #fff8f8; }
.excel-dropzone.is-dragover { border-color: #dc3545; background: #fff8f8; transform: scale(1.01); }
.excel-dropzone.has-file { border-style: solid; border-color: #198754; background: #f0fdf4; }
.excel-dropzone-icon { font-size: 42px; color: #94a3b8; margin-bottom: 10px; }
.excel-dropzone.is-dragover .excel-dropzone-icon,
.excel-dropzone:hover .excel-dropzone-icon { color: #dc3545; }
.excel-dropzone.has-file .excel-dropzone-icon { color: #198754; }

/* ====================================================
   PÍLDORAS DE ESTADO (mismo estilo que Solicitudes Institucionales)
   ==================================================== */
.estado-pill {
  border-radius: 999px;
  padding: 0.35em 0.85em;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
  display: inline-block;
  white-space: nowrap;
}

/* PENDIENTE — amarillo */
.estado-pendiente {
  background-color: #fdf3d3;
  color: #a6841f;
  border-color: #f2e2a5;
}

/* APROBADA — verde */
.estado-aprobada {
  background-color: #e3f5e6;
  color: #2f8a45;
  border-color: #bfe6c8;
}

/* RECHAZADA — rojo/rosa */
.estado-rechazada {
  background-color: #fde7ea;
  color: #c0304a;
  border-color: #f5c2cb;
}

/* ANULADA — gris azulado */
.estado-anulada {
  background-color: #eef1f5;
  color: #5b6b7f;
  border-color: #d4dbe4;
}

</style>
