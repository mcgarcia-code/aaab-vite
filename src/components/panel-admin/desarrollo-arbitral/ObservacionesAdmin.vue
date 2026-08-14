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

          <div class="row g-2">
            <div class="col-6 col-md-1">
              <input v-model="filtros.fecha" class="form-control form-control-sm shadow-none text-md-center" placeholder="DD/MM/AAAA">
            </div>
            <div class="col-6 col-md-2">
              <input v-model="filtros.observador" class="form-control form-control-sm shadow-none" placeholder="Observador...">
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
            <div class="col-6 col-md-2">
              <input v-model="filtros.partido" class="form-control form-control-sm shadow-none" placeholder="Partido...">
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
                    <th class="py-3 text-center pe-3 text-uppercase text-muted" style="width: 140px;">Cargado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in observacionesPaginadas" :key="o.id">
                    <td class="text-center text-muted fw-bold font-monospace col-fija col-id">{{ o.id }}</td>
                    <td class="text-center col-fija col-acciones">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="abrirModalGestion(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Gestionar / Modificar">
                          <span class="material-icons" style="font-size:16px;">edit_document</span>
                        </button>
                        <button @click="verHistorial(o)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Historial de estos árbitros">
                          <span class="material-icons" style="font-size:16px;">history</span>
                        </button>
                      </div>
                    </td>
                    <td class="text-center fw-bold col-fija col-fecha">{{ formatearFecha(o.fecha_partido) }}</td>
                    <td class="text-dark">{{ o.observador }}</td>
                    <td class="fw-bold text-uppercase text-dark text-truncate" :title="o.arbitros">{{ o.arbitros }}</td>
                    <td class="text-dark text-truncate" :title="o.competencia">{{ o.competencia }}</td>
                    <td class="text-dark">{{ o.categoria_edad }}</td>
                    <td class="text-dark text-truncate" :title="`${o.equipo_local} vs ${o.equipo_visitante}`">
                      {{ o.equipo_local }} vs {{ o.equipo_visitante }}
                      <span v-if="o.numero_partido" class="text-muted">(Nº {{ o.numero_partido }})</span>
                    </td>
                    <td class="text-center pe-3 text-muted">{{ formatearFechaHora(o.creado_en) }}</td>
                  </tr>
                  <tr v-if="observacionesPaginadas.length === 0">
                    <td colspan="9" class="py-5 text-center text-muted border-0 bg-white">
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
                  </div>
                </div>

                <div class="card-body pt-0 px-3 pb-3">
                  <div class="bg-light p-2 rounded border mt-2 border-light-subtle">
                    <p class="m-0 text-dark small"><strong class="text-muted">Obs:</strong> {{ o.observador }}</p>
                    <p class="m-0 text-dark small mt-1"><strong class="text-muted">Competencia:</strong> {{ o.competencia }}</p>
                    <p class="m-0 text-dark small mt-1">
                      <strong class="text-muted">Partido:</strong> {{ o.equipo_local }} vs {{ o.equipo_visitante }}
                      <span class="badge bg-secondary ms-1">{{ o.categoria_edad }}</span>
                    </p>
                    <div class="d-flex justify-content-between mt-2 border-top border-secondary-subtle pt-2">
                      <span class="text-dark small" v-if="o.numero_partido">Nº Partido: <strong>{{ o.numero_partido }}</strong></span>
                      <span class="text-muted small">Cargado: {{ formatearFechaHora(o.creado_en) }}</span>
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-3">
                    <button @click="abrirModalGestion(o)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                      <span class="material-icons" style="font-size: 18px;">edit_document</span> Gestionar
                    </button>
                    <button @click="verHistorial(o)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center" title="Ver historial">
                      <span class="material-icons" style="font-size: 18px;">history</span>
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
    <ModalBase :show="mostrarModal" @close="cerrarModal" titulo="Gestionar Observación" icono="edit_document" colorIcono="bg-primary text-white" maxWidth="500px">
      <div class="text-center mb-3">
        <p class="text-muted small mt-1 mb-0">Observación #{{ observacionActual.id }} — {{ formatearFecha(observacionActual.fecha_partido) }}</p>
      </div>
      <div class="text-start bg-light p-3 rounded border mb-4 border-secondary-subtle">
        <p class="m-0 fw-bold small text-dark mb-1">Árbitros: <span class="text-danger">{{ observacionActual.arb1 }} - {{ observacionActual.arb2 }}</span></p>
        <p class="m-0 small text-dark"><strong class="text-muted">Observador:</strong> {{ observacionActual.observador }}</p>
        <p class="m-0 small text-dark mt-1"><strong class="text-muted">Competencia:</strong> {{ observacionActual.competencia }}</p>
        <p class="m-0 small text-dark mt-1">
          <strong class="text-muted">Partido:</strong> {{ observacionActual.equipo_local }} vs {{ observacionActual.equipo_visitante }} ({{ observacionActual.categoria_edad }})
        </p>
        <div class="alert alert-info py-2 px-3 mt-3 mb-0 d-flex align-items-center gap-2" style="font-size: 0.8rem;">
          <span class="material-icons" style="font-size: 16px;">info</span>
          Cargada el <strong>{{ formatearFechaHora(observacionActual.creado_en) }}</strong>.
        </div>
      </div>
      <div class="text-start">
        <label class="small fw-bold mb-1 text-dark">Actualizar Estado de la Observación</label>
        <select v-model="nuevoEstado" class="form-select shadow-none border-primary-subtle fw-bold">
          <option value="pendiente">Pendiente de Revisión</option>
          <option value="aprobada">Aprobar Observación</option>
          <option value="anulada">Anular Observación</option>
        </select>
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
        <div class="sacf-section">
          <h2 class="section-title">Datos del Partido</h2>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label-custom">Género *</label>
              <div class="custom-radio-group">
                <button type="button" v-for="opt in ['Caballeros', 'Damas']" :key="opt" :class="{ active: formulario.partido_genero === opt }" @click="formulario.partido_genero = opt">{{ opt }}</button>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label-custom">Categoría *</label>
              <div class="custom-radio-group">
                <button type="button" v-for="opt in ['Mayores', 'Inferiores']" :key="opt" :class="{ active: formulario.partido_categoria === opt }" @click="formulario.partido_categoria = opt">{{ opt }}</button>
              </div>
            </div>
          </div>

          <div v-if="formulario.partido_categoria === 'Mayores'" class="field-group anim-fade mb-3">
            <label class="form-label-custom">Competencia Mayores *</label>
            <select @change='obtenerEquipos()' v-model="formulario.inf_nivel" class="sacf-input" required>
              <option value="" disabled>Seleccione competencia</option>
              <template v-if="listas.divisiones_categorias.length > 0">
                <option v-for="(div, k) in listas.divisiones_categorias[0].divisiones" :key="k" :value="div">
                  {{ div }}
                </option>
              </template>
            </select>
          </div>

          <div v-if="formulario.partido_categoria === 'Inferiores'" class="row anim-fade mb-3">
            <div class="col-md-8 mb-3">
              <label class="form-label-custom">Categoría Específica *</label>
              <select @change='setDivisiones()' v-model="formulario.id_categoria_especifica" class="sacf-input" required :disabled="cargandoCategorias">
                <option value="" disabled>{{ cargandoCategorias ? 'Cargando...' : 'Seleccione Categoría' }}</option>
                <option v-for="(cat, k) in listas.divisiones_categorias" :key="k" :value="k">{{ cat.categoria }}</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label-custom">Nivel *</label>
              <select @change='obtenerEquipos()' v-model="formulario.inf_nivel" class="sacf-input" required>
                <option value="" disabled>Nivel</option>
                <option v-for="opt in listas.divisiones" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <div class="field-group mb-2">
            <label class="form-label-custom">Equipos *</label>
            <div class="grid-2">
              <select v-model="formulario.equipo_1" class="sacf-input" required>
                <option value="" disabled>Local</option>
                <option v-for="(eq, k) in listas.equipos" :key="k" :value="eq.eq_id">{{ eq.club }}</option>
              </select>
              <select v-model="formulario.equipo_2" class="sacf-input" required>
                <option value="" disabled>Visitante</option>
                <option v-for="(eq, k) in listas.equipos" :key="k" :value="eq.eq_id">{{ eq.club }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: ARBITRAJE -->
        <div class="sacf-section bg-light-soft border-bottom">
          <h2 class="section-title">Arbitraje Observado</h2>
          <div class="field-group mb-4">
            <label class="form-label-custom">Cantidad de Árbitros *</label>
            <div class="custom-radio-group mini" style="max-width: 200px;">
              <button type="button" :class="{ active: formulario.ref_count === '1' }" @click="formulario.ref_count = '1'">1</button>
              <button type="button" :class="{ active: formulario.ref_count === '2' }" @click="formulario.ref_count = '2'">2</button>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="referee-box shadow-sm bg-white">
                <label class="fw-bold mb-2 text-dark small">ÁRBITRO 1</label>
                <select v-model="formulario.ref1_id" class="sacf-input" required>
                  <option value="" disabled>Seleccione Árbitro</option>
                  <option v-for="arb in listas.arbitros" :key="arb.id" :value="arb.id">{{ arb.apellido }}, {{ arb.nombre }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6" v-if="formulario.ref_count === '2'">
              <div class="referee-box shadow-sm bg-white anim-fade">
                <label class="fw-bold mb-2 text-dark small">ÁRBITRO 2</label>
                <select v-model="formulario.ref2_id" class="sacf-input" required>
                  <option value="" disabled>Seleccione Árbitro</option>
                  <option v-for="arb in listas.arbitros" :key="arb.id" :value="arb.id">{{ arb.apellido }}, {{ arb.nombre }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 4: PLANILLA DE EVALUACIÓN (EXCEL) -->
        <div class="sacf-section">
          <h2 class="section-title">Planilla de Evaluación</h2>

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
              <span class="material-icons excel-dropzone-icon">upload_file</span>
              <p class="m-0 fw-bold text-dark">Arrastrá aquí la planilla de Excel</p>
              <p class="m-0 small text-muted">o hacé clic para seleccionar un archivo (.xlsx, .xls)</p>
            </template>
            <template v-else>
              <span class="material-icons excel-dropzone-icon text-success">check_circle</span>
              <p class="m-0 fw-bold text-dark">{{ archivoObservacion.name }}</p>
              <p class="m-0 small text-muted">Archivo listo para cargar. Hacé clic para reemplazarlo.</p>
              <button type="button" class="btn btn-light btn-sm rounded-pill px-3 mt-2 border" @click.stop="quitarArchivoObservacion">
                Quitar archivo
              </button>
            </template>
          </div>
        </div>

        <!-- Botones de Acción Formulario -->
        <div class="d-flex gap-3 mt-4 px-4 pb-2">
          <button type="button" @click="cerrarModalCarga" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1" style="border: 1px solid #cbd5e1;">CANCELAR</button>
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
    <ModalBase :show="mostrarModalHistorial" @close="mostrarModalHistorial = false" icono="history" colorIcono="bg-warning text-dark" maxWidth="700px">
      <template #header>
        <div class="d-flex align-items-center justify-content-center gap-2">
          Historial: {{ arbitrosHistorialNombre }}
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
              <th class="py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Categoría / Partido</th>
              <th class="py-2 pe-3 fw-bold text-uppercase" style="font-size: 0.75rem;">Observador</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in historialSeleccionado" :key="'h-'+h.id" style="border-bottom: 1px solid #f1f5f9;">
              <td class="text-nowrap text-muted fw-bold ps-3 py-3">{{ formatearFecha(h.fecha_partido) }}</td>
              <td class="py-3 text-dark">
                <span class="badge bg-secondary mb-1">{{ h.categoria_edad }}</span><br>
                {{ h.equipo_local }} vs {{ h.equipo_visitante }}
                <span class="text-muted"> — {{ h.competencia }}</span>
              </td>
              <td class="py-3 pe-3 text-dark">{{ h.observador }}</td>
            </tr>
            <tr v-if="historialSeleccionado.length === 0">
              <td colspan="3" class="text-center py-4 text-muted">No hay registros previos en el historial.</td>
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
              <div class="text-danger mt-1" style="font-size: 0.75rem;">{{ h.categoria_edad }} • {{ formatearFecha(h.fecha_partido) }}</div>
            </div>
          </div>
          <div class="d-flex justify-content-between border-bottom pb-2 mb-2 small">
            <span class="fw-bold text-dark">Observador:</span>
            <span class="text-muted">{{ h.observador }}</span>
          </div>
          <div class="d-flex justify-content-between small">
            <span class="fw-bold text-dark">Competencia:</span>
            <span class="text-muted">{{ h.competencia }}</span>
          </div>
        </div>
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

const notificar = inject('notificar', (msg) => console.log('Notificación:', msg));

/* ====================================================
   ESTADO GLOBAL DE LA TABLA
   ==================================================== */
const observaciones = ref([]);
const cargando = ref(false);

const filtros = reactive({ fecha: '', anio: '', observador: '', arbitros: '', competencia: '', categoria: '', partido: '' });
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
    const matchObs = normalizar(o.observador).includes(normalizar(filtros.observador));
    const matchArb = normalizar(o.arbitros).includes(normalizar(filtros.arbitros));
    const matchComp = normalizar(o.competencia).includes(normalizar(filtros.competencia));
    const matchCat = normalizar(o.categoria_edad).includes(normalizar(filtros.categoria));
    const matchPar = normalizar(`${o.equipo_local} ${o.equipo_visitante} ${o.numero_partido}`).includes(normalizar(filtros.partido));

    return matchFec && matchAnio && matchObs && matchArb && matchComp && matchCat && matchPar;
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
      // MOCKUPS TEMPORALES (Si el back no está listo)
      observaciones.value = [
        { id: 101, id_partido: null, competencia: 'Liga de Honor', categoria_edad: 'Mayores', equipo_local: 'VILO', equipo_visitante: 'SEDALO', fecha_partido: '2026-05-12', arbitros: 'García, Mariana / Gómez, Luis', observador: 'Ladelfa, Marcelo', numero_partido: '3', creado_en: '2026-05-12 10:00:00' },
        { id: 100, id_partido: null, competencia: 'Primera', categoria_edad: 'Mayores', equipo_local: 'Dorrego', equipo_visitante: 'River', fecha_partido: '2026-05-05', arbitros: 'García, Mariana / Gómez, Luis', observador: 'Pérez, Juan', numero_partido: '1', creado_en: '2026-05-05 09:30:00' },
        { id: 99, id_partido: null, competencia: 'Segunda', categoria_edad: 'Mayores', equipo_local: 'Ferro', equipo_visitante: 'SAG', fecha_partido: '2026-04-28', arbitros: 'Fernández, D. / Ruiz, M.', observador: 'Ladelfa, Marcelo', numero_partido: '5', creado_en: '2026-04-28 18:15:00' }
      ];
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Problema al cargar las observaciones.', tipo: 'danger' });
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

const abrirModalGestion = (obs) => {
  observacionActual.value = { ...obs };
  nuevoEstado.value = (obs.estado || 'pendiente').toLowerCase();
  comentariosRevision.value = '';
  mostrarModal.value = true;
};

const cerrarModal = () => { mostrarModal.value = false; };

const guardarCambiosGestion = async () => {
  cargando.value = true;
  try {
    // Recordatorio: NO enviar puntaje_final, se calcula dinámicamente
    const payload = { id: observacionActual.value.id, estado: nuevoEstado.value, comentarios: comentariosRevision.value };
    const res = await api.post({ entity: 'observaciones', action: 'actualizarEstado', payload: payload });

    if (res && res.ok) {
      notificar({ titulo: 'Actualizado', mensaje: 'Observación modificada con éxito.', tipo: 'success' });
      await obtenerObservaciones();
    } else {
      const index = observaciones.value.findIndex(o => o.id === payload.id);
      if (index !== -1) observaciones.value[index].estado = payload.estado;
      notificar({ titulo: 'Simulación', mensaje: 'Estado actualizado en memoria.', tipo: 'success' });
    }
    cerrarModal();
  } catch{
    notificar({ titulo: 'Error', mensaje: 'Ocurrió un problema al guardar los cambios.', tipo: 'danger' });
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

const listas = reactive({
  categorias_especificas: [], divisiones_categorias: [], divisiones: [], equipos: [], arbitros: []
});

const formulario = reactive({
  partido_genero: '', partido_categoria: '', inf_nivel: '',
  id_categoria_especifica: '', equipo_1: '', equipo_2: '',
  ref_count: '1', ref1_id: '', ref2_id: ''
});

const archivoObservacion = ref(null);
const arrastrandoArchivo = ref(false);

const abrirModalCarga = () => { mostrarModalCarga.value = true; };
const cerrarModalCarga = () => { mostrarModalCarga.value = false; reiniciarFormularioCarga(); };

// Padrón liviano solo para el selector (igual a como se usa en el resto del panel)
const cargarArbitros = async () => {
  try {
    const res = await api.get({
      entity: 'arbitros',
      action: 'getArbitrosBasico',
      payload: { soloActivos: false }
    });
    if ((res.ok || res.success) && res.payload) listas.arbitros = res.payload;
  } catch (e) { console.error(e); }
};

const pedirCategoriasEspecíficas = async () => {
  if (!formulario.partido_genero || !formulario.partido_categoria) return;
  cargandoCategorias.value = true;
  listas.divisiones = []; listas.categorias_especificas = []; formulario.id_categoria_especifica = '';
  try {
    const res = await api.get({
      entity: 'observaciones', action: 'obtenerCategorias',
      payload: { genero: formulario.partido_genero, tipo: formulario.partido_categoria }
    });
    if (res.ok) listas.divisiones_categorias = res.payload;
  } catch (error) { console.error(error); }
  finally { cargandoCategorias.value = false; }
};

const setDivisiones = () => { listas.divisiones = listas.divisiones_categorias[formulario.id_categoria_especifica].divisiones; };

const obtenerEquipos = async () => {
  let categoria = '';
  if (formulario.id_categoria_especifica != '') categoria = listas.divisiones_categorias[formulario.id_categoria_especifica].categoria;
  const r = await api.get({
    entity: 'observaciones', action: 'obtenerEquipos',
    payload: { genero: formulario.partido_genero, tipo: formulario.partido_categoria, categoria: categoria, division: formulario.inf_nivel }
  });
  listas.equipos = r.payload || [];
};

watch(() => [formulario.partido_genero, formulario.partido_categoria], pedirCategoriasEspecíficas);

const ACEPTA_EXCEL = /\.(xlsx|xls)$/i;

const asignarArchivoObservacion = (file) => {
  if (!file) return;
  if (!ACEPTA_EXCEL.test(file.name)) {
    notificar({ titulo: 'Archivo inválido', mensaje: 'Seleccioná un archivo de Excel (.xlsx o .xls).', tipo: 'warning' });
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

const cargarObservacionExcel = async () => {
  if (!archivoObservacion.value) {
    notificar({ titulo: 'Dato Faltante', mensaje: 'Seleccioná el archivo de Excel para continuar.', tipo: 'warning' });
    return;
  }
  procesandoCarga.value = true;
  try {
    const formData = new FormData();
    formData.append('archivo', archivoObservacion.value);
    formData.append('datos', JSON.stringify(formulario));

    const res = await api.postFile({ entity: 'observaciones', action: 'cargarObservacionExcel', payload: formData });

    if (res && res.ok) {
      notificar({ titulo: 'Guardado', mensaje: 'La observación se ha registrado.', tipo: 'success' });
      await obtenerObservaciones();
      cerrarModalCarga();
    } else {
      notificar({ titulo: 'Error al guardar', mensaje: res?.message || 'No se pudo procesar el envío.', tipo: 'danger' });
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' });
  } finally {
    procesandoCarga.value = false;
  }
};

const reiniciarFormularioCarga = () => {
  Object.assign(formulario, {
    partido_genero: '', partido_categoria: '', inf_nivel: '', id_categoria_especifica: '',
    equipo_1: '', equipo_2: '', ref_count: '1', ref1_id: '', ref2_id: ''
  });
  archivoObservacion.value = null;
  arrastrandoArchivo.value = false;
};

/* ====================================================
   ESTADO MODAL 3: HISTORIAL DEL ÁRBITRO
   ==================================================== */
const mostrarModalHistorial = ref(false);
const historialSeleccionado = ref([]);
const arbitrosHistorialNombre = ref('');

const verHistorial = (obs) => {
  arbitrosHistorialNombre.value = obs.arbitros;
  historialSeleccionado.value = observaciones.value.filter(o => o.arbitros === obs.arbitros).sort((a, b) => b.id - a.id);
  mostrarModalHistorial.value = true;
};

/* ====================================================
   UTILIDADES COMPARTIDAS
   ==================================================== */
const limpiarFiltros = () => { Object.keys(filtros).forEach(key => filtros[key] = ''); };

const exportarExcel = async () => {
  if (observacionesFiltradas.value.length === 0) {
    notificar({ titulo: 'Tabla Vacía', mensaje: 'No hay datos para exportar.', tipo: 'warning' }); return;
  }
  const datosExportar = observacionesFiltradas.value.map(o => ({
    'ID': o.id, 'Fecha': formatearFecha(o.fecha_partido), 'Observador': o.observador, 'Árbitros': o.arbitros,
    'Competencia': o.competencia, 'Categoría': o.categoria_edad, 'Local': o.equipo_local, 'Visitante': o.equipo_visitante,
    'Nº Partido': o.numero_partido, 'Cargado': o.creado_en
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
  cargarArbitros();
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
.sacf-section { padding: 25px 20px; }
.bg-light-soft { background-color: #fafbfc; }
.section-title {
  font-size: 0.85rem; color: #dc2626; text-transform: uppercase; border-left: 5px solid #dc2626;
  padding-left: 14px; margin-bottom: 20px; font-weight: 800; letter-spacing: 1.2px;
}
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.referee-box { background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }

.form-label-custom { display: block; font-weight: 700; margin-bottom: 8px; font-size: 0.75rem; color: #000; text-transform: uppercase; }
.sacf-input {
  width: 100%; padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem;
  transition: all 0.3s ease; background-color: #f8fafc; color: #1e293b;
}
.sacf-input:focus { border-color: #dc2626; background-color: #fff; box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.15); outline: none; }
.custom-radio-group { display: flex; gap: 4px; background: #f1f5f9; padding: 5px; border-radius: 12px; }
.custom-radio-group button {
  flex: 1; border: none; padding: 10px; cursor: pointer; background: transparent; font-weight: 700;
  color: #000; border-radius: 8px; transition: 0.2s;
}
.custom-radio-group button.active { background: #dc2626; color: white; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.2); }

.excel-dropzone {
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
  padding: 40px 20px; border: 2px dashed #cbd5e1; border-radius: 12px; background: #f8fafc;
  cursor: pointer; transition: 0.2s;
}
.excel-dropzone:hover { border-color: #dc2626; background: #fff8f8; }
.excel-dropzone.is-dragover { border-color: #dc2626; background: #fff8f8; transform: scale(1.01); }
.excel-dropzone.has-file { border-style: solid; border-color: #10b981; background: #f0fdf4; }
.excel-dropzone-icon { font-size: 42px; color: #94a3b8; margin-bottom: 10px; }
.excel-dropzone.is-dragover .excel-dropzone-icon,
.excel-dropzone:hover .excel-dropzone-icon { color: #dc2626; }
.excel-dropzone.has-file .excel-dropzone-icon { color: #10b981; }

.anim-fade { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
