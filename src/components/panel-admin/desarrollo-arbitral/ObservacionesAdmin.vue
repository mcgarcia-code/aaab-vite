<template>
  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">

<!-- Cabecera y Botones Generales -->
        <div class="header-section border-bottom" style="margin-bottom: 0; box-shadow: none; border-radius: 0; padding: 20px;">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-clipboard-data-fill me-1"></i> Gestión de Observaciones
            </h4>
            <span class="counter mt-1 d-block text-muted">Total: {{ observacionesFiltradas.length }} registros</span>
          </div>

          <div class="header-actions">
            <!-- Filtros Mobile -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex" title="Mostrar Filtros">
              <span class="material-icons" style="font-size: 16px; line-height: 1;">filter_alt</span>
            </button>

            <!-- Limpiar -->
            <button @click="limpiarFiltros" class="btn-action btn-clear" style="padding-left: 8px; padding-right: 10px;" title="Limpiar Filtros">
              <span class="material-icons" style="font-size: 16px; line-height: 1;">filter_alt_off</span>
              <span class="btn-text" style="line-height: 1;">Limpiar</span>
            </button>

            <!-- Botón Cargar Observación -->
            <button @click="abrirModalCarga" class="btn-action btn-danger-custom" style="padding-left: 8px; padding-right: 10px;" title="Cargar Nueva Observación">
              <span class="material-icons" style="font-size: 16px; line-height: 1;">add_box</span>
              <span class="btn-text fw-bold" style="line-height: 1;">Nueva Obs.</span>
            </button>

            <!-- Excel -->
            <button @click="exportarExcel" class="btn-action btn-export" style="padding-left: 8px; padding-right: 10px;" title="Exportar Reporte">
              <span class="material-icons" style="font-size: 16px; line-height: 1;">download</span>
              <span class="btn-text" style="line-height: 1;">Excel</span>
            </button>
          </div>
        </div>

        <!-- Panel Filtros Mobile -->
        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster shadow-sm" style="border-radius: 0; border-left: 0; border-right: 0; margin-bottom: 0; background-color: #e2e8f0; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; box-shadow: none;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px;">FILTRAR OBSERVACIONES</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>

          <div class="filter-grid-mobile">
            <input v-model="filtros.fecha" class="filter-input-mobile" placeholder="Fecha (DD/MM/YY)...">
            <input v-model="filtros.observador" class="filter-input-mobile" placeholder="Observador...">
            <input v-model="filtros.arbitros" class="filter-input-mobile full-width" placeholder="Árbitros observados...">
            <input v-model="filtros.categoria" class="filter-input-mobile" placeholder="Categoría...">

            <select v-model="filtros.estado" class="filter-input-mobile">
              <option value="">Estado (Todos)</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>

          <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0 shadow-sm" style="font-size: 0.95rem;">Aplicar Filtros</button>
        </div>

        <div class="card-body p-3 p-md-4">

          <!-- TABLA DESKTOP -->
          <div class="table-container shadow-sm desktop-only border" style="border-radius: 8px;">
            <table>
              <thead>
                <tr class="main-header">
                  <th class="sticky-col col-id">ID</th>
                  <th class="sticky-col col-acciones text-center">Acciones</th>
                  <th class="sticky-col col-fecha text-center">Fecha</th>
                  <th>Observador</th>
                  <th>Árbitros Observados</th>
                  <th class="text-center">Grupo/Sub.</th>
                  <th>Categoría</th>
                  <th>Partido</th>
                  <th class="text-center">Puntaje</th>
                  <th class="text-center">Estado</th>
                </tr>
                <tr class="filter-row">
                  <td class="sticky-col col-id text-center">
                    <button @click="obtenerObservaciones" :disabled="cargando" class="btn-refresh mx-auto d-flex align-items-center justify-content-center" title="Recargar">
                      <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary" style="width: 16px; height: 16px; border-width: 2px;"></span>
                      <span v-else class="material-icons" style="font-size: 16px;">refresh</span>
                    </button>
                  </td>
                  <td class="sticky-col col-acciones"></td>
                  <td class="sticky-col col-fecha"><input v-model="filtros.fecha" class="filter-input shadow-none text-center" placeholder="DD/MM/YY"></td>
                  <td><input v-model="filtros.observador" class="filter-input shadow-none" placeholder="Filtrar observador.."></td>
                  <td><input v-model="filtros.arbitros" class="filter-input shadow-none" placeholder="Filtrar árbitros.."></td>
                  <td><input v-model="filtros.grupo" class="filter-input shadow-none text-center" placeholder="Filtrar.."></td>
                  <td><input v-model="filtros.categoria" class="filter-input shadow-none" placeholder="Filtrar.."></td>
                  <td><input v-model="filtros.partido" class="filter-input shadow-none" placeholder="Filtrar partido.."></td>
                  <td></td>
                  <td>
                    <select v-model="filtros.estado" class="filter-input shadow-none text-center">
                      <option value="">TODOS</option>
                      <option value="pendiente">PENDIENTE</option>
                      <option value="aprobada">APROBADA</option>
                      <option value="anulada">ANULADA</option>
                    </select>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in observacionesPaginadas" :key="o.id" class="row-hover">
                  <td class="sticky-col col-id cell-ro text-center text-muted fw-bold">{{ o.id }}</td>
                  <td class="sticky-col col-acciones cell-ro text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="abrirModalGestion(o)" class="btn-editar border shadow-sm rounded p-1" title="Gestionar / Modificar">
                        <span class="material-icons text-primary" style="font-size:16px;">edit_document</span>
                      </button>
                      <button @click="verHistorial(o)" class="btn-historial border shadow-sm rounded p-1" title="Historial de estos árbitros">
                        <span class="material-icons text-warning" style="font-size:16px;">history</span>
                      </button>
                    </div>
                  </td>
                  <td class="sticky-col col-fecha text-center cell-ro fw-bold">{{ o.fecha || 'S/F' }}</td>
                  <td class="cell-ro text-dark">{{ o.observador }}</td>
                  <td class="cell-ro fw-bold text-uppercase text-dark">{{ o.arbitros }}</td>
                  <td class="text-center cell-ro text-muted">{{ o.grupo }} <span v-if="o.subgrupo">/ {{ o.subgrupo }}</span></td>
                  <td class="cell-ro text-dark">{{ o.categoria }}</td>
                  <td class="cell-ro text-dark">{{ o.partido }}</td>
                  <td class="text-center cell-ro fw-bold text-primary">{{ o.puntaje_calculado || '-' }}</td>
                  <td class="text-center cell-ro">
                    <span :class="['badge-status-sm', obtenerClaseEstado(o.estado)]">{{ (o.estado || 'N/A').toUpperCase() }}</span>
                  </td>
                </tr>
                <tr v-if="observacionesPaginadas.length === 0">
                  <td colspan="10" class="text-center py-5 text-muted bg-light italic border-0">
                    <span class="material-icons d-block mb-2" style="font-size: 40px;">assignment_late</span>
                    <p class="m-0 fw-bold">No hay ninguna observación registrada.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- TARJETAS MOBILE -->
          <div class="mobile-only mt-3">
            <div v-for="o in observacionesPaginadas" :key="'mob-'+o.id" class="card-licencia border-light-subtle shadow-sm mb-3 bg-white rounded">
              <div class="card-header border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="card-name text-uppercase text-dark fw-bold" style="font-size: 1.05rem; line-height: 1.2;">
                  {{ o.arbitros }}
                </div>
                <div class="text-xs text-muted fw-bold text-end">
                  #{{ o.id }}<br>
                  {{ o.fecha || 'S/F' }}
                </div>
              </div>
              <div class="card-body pt-0 px-3 pb-3">
                <div class="card-row mb-2">
                  <span :class="['badge-status-sm', obtenerClaseEstado(o.estado)]" style="font-size: 0.7rem; padding: 3px 10px;">{{ (o.estado || 'N/A').toUpperCase() }}</span>
                </div>
                <div class="card-info bg-light p-2 rounded border mt-2">
                  <p class="m-0 text-dark small"><strong class="text-muted">Obs:</strong> {{ o.observador }}</p>
                  <p class="m-0 text-dark small mt-1"><strong class="text-muted">Partido:</strong> {{ o.partido }} <span class="badge bg-secondary ms-1">{{ o.categoria }}</span></p>
                  <div class="d-flex justify-content-between mt-2 border-top border-secondary-subtle pt-2">
                    <span class="text-dark small">G/S: <strong>{{ o.grupo }}<template v-if="o.subgrupo">/{{ o.subgrupo }}</template></strong></span>
                    <span class="text-primary fw-bold small">Puntaje: {{ o.puntaje_calculado || '-' }}</span>
                  </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                  <button @click="abrirModalGestion(o)" class="btn-editar-mobile flex-grow-1 border shadow-sm">
                    <span class="material-icons" style="font-size: 18px;">edit_document</span> Gestionar
                  </button>
                  <button @click="verHistorial(o)" class="btn-historial-mobile border shadow-sm px-3" title="Ver historial">
                    <span class="material-icons" style="font-size: 18px;">history</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="observacionesPaginadas.length === 0" class="text-center p-4 bg-light rounded shadow-sm border mt-3">
              <span class="material-icons text-muted" style="font-size: 40px;">assignment_late</span>
              <p class="text-muted mt-2 mb-0 fw-bold">No hay observaciones registradas.</p>
            </div>
          </div>

          <!-- PAGINACIÓN -->
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

    <!-- ==========================================
         MODAL 1: GESTIONAR OBSERVACIÓN (APROBAR/ANULAR)
         ========================================== -->
    <ModalBase :show="mostrarModal" @close="cerrarModal" titulo="Gestionar Observación" icono="edit_document" colorIcono="bg-primary text-white" maxWidth="500px">
      <div class="text-center mb-3">
        <p class="text-muted small mt-1 mb-0">Observación #{{ observacionActual.id }} — {{ observacionActual.fecha }}</p>
      </div>
      <div class="text-start bg-light p-3 rounded border mb-4 border-secondary-subtle">
        <p class="m-0 fw-bold small text-dark mb-1">Árbitros: <span class="text-danger">{{ observacionActual.arbitros }}</span></p>
        <p class="m-0 small text-dark"><strong class="text-muted">Observador:</strong> {{ observacionActual.observador }}</p>
        <p class="m-0 small text-dark mt-1"><strong class="text-muted">Partido:</strong> {{ observacionActual.partido }} ({{ observacionActual.categoria }})</p>
        <div class="alert alert-info py-2 px-3 mt-3 mb-0 d-flex align-items-center gap-2" style="font-size: 0.8rem;">
          <span class="material-icons" style="font-size: 16px;">info</span>
          El puntaje actual calculado es <strong>{{ observacionActual.puntaje_calculado || '-' }}</strong>.
        </div>
      </div>
      <div class="text-start">
        <label class="small fw-bold mb-1 text-dark">Actualizar Estado de la Observación</label>
        <select v-model="nuevoEstado" class="form-select shadow-none border-primary-subtle fw-bold custom-input">
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

      <form @submit.prevent="enviarFormularioCarga" class="text-start pb-2">
        <!-- SECCIÓN 1: OBSERVADOR -->
        <div class="sacf-section bg-light-soft border-bottom">
          <h2 class="section-title">Datos del Observador</h2>
          <label class="form-label-custom">Observador a cargo *</label>
          <select v-model="formulario.observador_id" class="sacf-input" required>
            <option value="" disabled>Seleccione el observador...</option>
            <option v-for="arb in listas.arbitros" :key="'obs-'+arb.id" :value="arb.id">
              {{ arb.apellido }}, {{ arb.nombre }}
            </option>
          </select>
        </div>

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

              <!-- Solución aplicada aquí -->
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
                <select v-model="formulario.ref1_nombre" class="sacf-input mb-2" required>
                  <option value="" disabled>Seleccione Árbitro</option>
                  <option v-for="arb in listas.arbitros" :key="arb.id" :value="arb.nombre">{{arb.apellido}}, {{ arb.nombre }}</option>
                </select>
                <select v-model="formulario.ref1_group" class="sacf-input" required>
                  <option value="" disabled>Grupo</option>
                  <option v-for="g in listas.grupos" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
            </div>
            <div class="col-md-6" v-if="formulario.ref_count === '2'">
              <div class="referee-box shadow-sm bg-white anim-fade">
                <label class="fw-bold mb-2 text-dark small">ÁRBITRO 2</label>
                <select v-model="formulario.ref2_nombre" class="sacf-input mb-2" required>
                  <option value="" disabled>Seleccione Árbitro</option>
                  <option v-for="arb in listas.arbitros" :key="arb.id" :value="arb.nombre">{{arb.apellido}}, {{ arb.nombre }}</option>
                </select>
                <select v-model="formulario.ref2_group" class="sacf-input" required>
                  <option value="" disabled>Grupo</option>
                  <option v-for="g in listas.grupos" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 4: EVALUACIÓN -->
        <div class="sacf-section">
          <h2 class="section-title">Evaluación Final</h2>
          <div class="field-group mb-4">
            <label class="form-label-custom">Comentarios / Observaciones *</label>
            <textarea v-model="formulario.comentarios" rows="3" class="sacf-input" placeholder="Detalle la actuación..." required></textarea>
          </div>

          <div class="field-group mb-4">
            <label class="form-label-custom">Puntaje Performance (Base) *</label>
            <div class="perf-scale-container">
              <div v-for="opcion in perfScoreOptions" :key="opcion.value"
                class="perf-opt-item" :class="[{ 'is-active': formulario.perf_score == opcion.value }, 'tone-' + opcion.tone]"
                @click="formulario.perf_score = opcion.value">
                <div class="perf-num">{{ opcion.value }}</div>
                <div class="perf-desc">{{ opcion.label }}</div>
              </div>
            </div>
          </div>

          <div class="field-group mb-4">
            <label class="form-label-custom">Dificultad del Encuentro *</label>
            <select v-model="formulario.diff_mult" class="sacf-input" required>
              <option value="" disabled>Seleccione dificultad</option>
              <option v-for="d in listas.dificultades" :key="d.valor" :value="d.valor">
                x {{ d.valor }} - {{ d.nombre }}
              </option>
            </select>
          </div>

          <div class="total-score-card anim-fade" v-if="formulario.perf_score">
            <div class="d-flex flex-column">
              <span class="text-uppercase small opacity-75">Puntaje Dinámico</span>
              <span class="fw-light small">Se calculará automáticamente (sin guardarse estático)</span>
            </div>
            <strong>{{ puntajeCalculado }}</strong>
          </div>
        </div>

        <!-- Botones de Acción Formulario -->
        <div class="d-flex gap-3 mt-4 px-4 pb-2">
          <button type="button" @click="cerrarModalCarga" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1" style="border: 1px solid #cbd5e1;">CANCELAR</button>
          <button type="submit" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="procesandoCarga">
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

      <div class="desktop-only table-responsive border rounded shadow-sm m-0">
        <table class="table table-sm table-hover align-middle m-0" style="font-size: 0.85rem;">
          <thead class="table-light" style="border-bottom: 2px solid #e2e8f0;">
            <tr>
              <th class="py-2 ps-3 fw-bold text-uppercase" style="font-size: 0.75rem;">Fecha</th>
              <th class="py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Categoría / Partido</th>
              <th class="py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Observador</th>
              <th class="text-center py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Puntaje</th>
              <th class="text-center py-2 pe-3 fw-bold text-uppercase" style="font-size: 0.75rem;">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in historialSeleccionado" :key="'h-'+h.id" style="border-bottom: 1px solid #f1f5f9;">
              <td class="text-nowrap text-muted fw-bold ps-3 py-3">{{ h.fecha || 'S/F' }}</td>
              <td class="py-3 text-dark">
                <span class="badge bg-secondary mb-1">{{ h.categoria }}</span><br>
                {{ h.partido }}
              </td>
              <td class="py-3 text-dark">{{ h.observador }}</td>
              <td class="text-center fw-bold text-primary py-3">{{ h.puntaje_calculado || '-' }}</td>
              <td class="text-center pe-3 py-3">
                <span :class="['badge-status-sm', obtenerClaseEstado(h.estado)]">{{ (h.estado || 'N/A').toUpperCase() }}</span>
              </td>
            </tr>
            <tr v-if="historialSeleccionado.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">No hay registros previos en el historial.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mobile-only">
        <div v-if="historialSeleccionado.length === 0" class="text-center py-4 text-muted">
          No hay registros en el historial.
        </div>
        <div v-for="h in historialSeleccionado" :key="'hmob-'+h.id" class="card-licencia bg-light mb-3 border">
          <div class="card-header border-0 pb-2 mb-2 d-flex justify-content-between align-items-start">
            <div class="card-name fw-bold lh-sm text-dark pe-2" style="font-size: 0.95rem;">
              {{ h.partido }}
              <div class="text-danger mt-1" style="font-size: 0.75rem;">{{ h.categoria }} • {{ h.fecha }}</div>
            </div>
            <div>
              <span :class="['badge-status-sm', obtenerClaseEstado(h.estado)]">{{ (h.estado || 'N/A').toUpperCase() }}</span>
            </div>
          </div>
          <div class="px-1">
            <div class="card-row border-bottom pb-2 mb-2">
              <span class="fw-bold text-dark">Observador:</span>
              <span class="text-muted">{{ h.observador }}</span>
            </div>
            <div class="card-row mb-0">
              <span class="fw-bold text-dark">Puntaje Dinámico:</span>
              <span class="text-primary fw-bold fs-6">{{ h.puntaje_calculado || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue';
import { api } from '@/api/api';
import * as XLSX from 'xlsx';
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

const filtros = reactive({ fecha: '', observador: '', arbitros: '', grupo: '', categoria: '', partido: '', estado: '' });
const mostrarFiltrosMobile = ref(false);

const paginaActual = ref(1);
const registrosPorPagina = 10;

// Filtros y Paginación
const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

const observacionesFiltradas = computed(() => {
  return observaciones.value.filter(o => {
    const matchFec = o.fecha && o.fecha.includes(filtros.fecha);
    const matchObs = normalizar(o.observador).includes(normalizar(filtros.observador));
    const matchArb = normalizar(o.arbitros).includes(normalizar(filtros.arbitros));
    const matchCat = normalizar(o.categoria).includes(normalizar(filtros.categoria));
    const matchPar = normalizar(o.partido).includes(normalizar(filtros.partido));
    const matchGru = normalizar(o.grupo).includes(normalizar(filtros.grupo)) || normalizar(o.subgrupo).includes(normalizar(filtros.grupo));
    const matchEst = filtros.estado === '' || (o.estado && o.estado.toLowerCase() === filtros.estado.toLowerCase());

    return matchFec && matchObs && matchArb && matchCat && matchPar && matchGru && matchEst;
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
    const res = await api.get({ entity: 'observaciones', action: 'obtenerTodas' });
    if (res && res.ok) {
      observaciones.value = res.payload.sort((a, b) => b.id - a.id);
    } else {
      // MOCKUPS TEMPORALES (Si el back no está listo)
      observaciones.value = [
        { id: 101, fecha: '12/05/26', observador: 'Ladelfa, Marcelo', arbitros: 'García, Mariana / Gómez, Luis', grupo: 'A', subgrupo: 'A1', categoria: 'Liga de Honor', partido: 'VILO vs SEDALO', puntaje_calculado: '8.5', estado: 'pendiente' },
        { id: 100, fecha: '05/05/26', observador: 'Pérez, Juan', arbitros: 'García, Mariana / Gómez, Luis', grupo: 'A', subgrupo: 'A1', categoria: 'Primera', partido: 'Dorrego vs River', puntaje_calculado: '9.0', estado: 'aprobada' },
        { id: 99, fecha: '28/04/26', observador: 'Ladelfa, Marcelo', arbitros: 'Fernández, D. / Ruiz, M.', grupo: 'B', subgrupo: 'B2', categoria: 'Segunda', partido: 'Ferro vs SAG', puntaje_calculado: '6.5', estado: 'anulada' }
      ];
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Problema al cargar las observaciones.', tipo: 'danger' });
  }
  cargando.value = false;
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
  }
  cargando.value = false;
};

/* ====================================================
   ESTADO MODAL 2: CARGAR NUEVA OBSERVACIÓN MANUAL
   ==================================================== */
const mostrarModalCarga = ref(false);
const procesandoCarga = ref(false);
const cargandoCategorias = ref(false);

const listas = reactive({
  categorias_especificas: [], divisiones_categorias: [], divisiones: [],
  dificultades: [], arbitros: [], grupos: [], equipos: []
});

const formulario = reactive({
  observador_id: '', partido_genero: '', partido_categoria: '', inf_nivel: '',
  id_categoria_especifica: '', equipo_1: '', equipo_2: '', ref_count: '1',
  ref1_nombre: '', ref1_group: '', ref2_nombre: '', ref2_group: '',
  comentarios: '', perf_score: null, diff_mult: ''
});

const perfScoreOptions = [
  { value: '7', label: 'Muy bien', tone: 'green' }, { value: '6', label: 'Bien', tone: 'green' },
  { value: '5', label: 'Adecuado - Bien', tone: 'lgreen' }, { value: '4', label: 'Adecuado', tone: 'yellow' },
  { value: '3', label: 'Debajo de adecuado', tone: 'yellow' }, { value: '2', label: 'Insuficiente', tone: 'red' },
  { value: '1', label: 'Mal', tone: 'red' }
];

const abrirModalCarga = () => { mostrarModalCarga.value = true; };
const cerrarModalCarga = () => { mostrarModalCarga.value = false; reiniciarFormularioCarga(); };

const cargarCatalogosBase = async () => {
  try {
    const [resD, resA, resG] = await Promise.all([
      api.get({ entity: 'observaciones', action: 'obtenerDificultades' }),
      api.get({ entity: 'arbitros', action: 'getArbitros' }),
      api.get({ entity: 'arbitros', action: 'obtenerGrupos' })
    ]);
    if (resD && resD.ok) listas.dificultades = resD.payload;
    if (resA && resA.ok) listas.arbitros = resA.payload;
    if (resG && resG.ok) listas.grupos = resG.payload;
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

const puntajeCalculado = computed(() => {
  const perf = parseFloat(formulario.perf_score) || 0;
  const mult = parseFloat(formulario.diff_mult) || 0;
  return (perf * mult).toFixed(2);
});

const enviarFormularioCarga = async () => {
  if (!formulario.observador_id || !formulario.perf_score) {
    notificar({ titulo: 'Dato Faltante', mensaje: 'Faltan datos obligatorios (Observador o Puntaje).', tipo: 'warning' });
    return;
  }
  procesandoCarga.value = true;
  try {
    // Recordatorio: NO enviar puntaje_final, se calcula dinámicamente
    const res = await api.post({ entity: 'observaciones', action: 'guardarObservacion', payload: { ...formulario } });

    if (res && res.ok) {
      notificar({ titulo: 'Guardado', mensaje: 'La evaluación se ha registrado.', tipo: 'success' });
      await obtenerObservaciones();
      cerrarModalCarga();
    } else {
      notificar({ titulo: 'Simulación Exitosa', mensaje: 'Observación simulada (falta backend real).', tipo: 'success' });
      cerrarModalCarga();
    }
  } catch{
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' });
  } finally {
    procesandoCarga.value = false;
  }
};

const reiniciarFormularioCarga = () => {
  Object.assign(formulario, {
    observador_id: '', partido_genero: '', partido_categoria: '', inf_nivel: '', id_categoria_especifica: '',
    equipo_1: '', equipo_2: '', ref_count: '1', ref1_nombre: '', ref1_group: '', ref2_nombre: '', ref2_group: '',
    comentarios: '', perf_score: null, diff_mult: ''
  });
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

const obtenerClaseEstado = (estado) => {
  if (!estado) return 'estado-creado';
  switch (estado.toLowerCase()) {
    case 'pendiente': return 'estado-proceso';
    case 'aprobada': return 'estado-aceptado';
    case 'anulada': return 'estado-rechazado';
    default: return 'estado-creado';
  }
};

const exportarExcel = () => {
  if (observacionesFiltradas.value.length === 0) {
    notificar({ titulo: 'Tabla Vacía', mensaje: 'No hay datos para exportar.', tipo: 'warning' }); return;
  }
  const datosExportar = observacionesFiltradas.value.map(o => ({
    'ID': o.id, 'Fecha': o.fecha, 'Observador': o.observador, 'Árbitros': o.arbitros, 'Grupo': o.grupo,
    'Subgrupo': o.subgrupo, 'Categoría': o.categoria, 'Partido': o.partido, 'Puntaje (Calc)': o.puntaje_calculado, 'Estado': o.estado.toUpperCase()
  }));
  const ws = XLSX.utils.json_to_sheet(datosExportar);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Observaciones");
  XLSX.writeFile(wb, "Reporte_Observaciones.xlsx");
};

// Inicialización
onMounted(() => {
  obtenerObservaciones();
  cargarCatalogosBase();
});
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES Y DE TABLA
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 120px;
  box-sizing: border-box;
}

.admin-panel {
  width: 100%;
  max-width: 100%;
  padding: 0;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 0;
}

.header-section {
  background: white;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 15px;
  border-left: 5px solid #ef4444;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-info { display: flex; flex-direction: column; align-items: flex-start; width: 100%; }
.header-actions {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 8px;
  overflow-x: auto;
}

.btn-action {
  border: none; border-radius: 6px; font-weight: bold; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s, transform 0.1s;
  flex: none; width: 42px; height: 42px; padding: 0;
}
.btn-action:hover { opacity: 0.85; }
.btn-action:active { transform: scale(0.95); }

.btn-clear { background: #e2e8f0; color: #000; }
.btn-export { background: #10b981; color: white; }
.btn-blue { background: #3b82f6; color: white; }
.btn-danger-custom { background: #dc2626; color: white; } /* BOTÓN NUEVO ROJO */
.btn-text { display: none; }

.mobile-filter-panel { background: #e2e8f0; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.filter-grid-mobile .full-width { grid-column: 1 / -1; }
.filter-input-mobile {
  padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; width: 100%;
  outline: none; background: #ffffff; color: #334155;
}

/* Tarjetas Mobile */
.card-licencia { border-radius: 8px; overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; }
.card-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #000; }
.card-info p { margin: 4px 0; }
.btn-editar-mobile, .btn-historial-mobile {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px; border-radius: 6px; font-weight: bold; font-size: 0.85rem; cursor: pointer;
}
.btn-editar-mobile { background: #fff; color: #3b82f6; border-color: #bfdbfe !important; }
.btn-historial-mobile { background: #fff; color: #d97706; border-color: #fde68a !important; }

/* Estados */
.badge-status-sm { font-size: 0.7rem; font-weight: bold; padding: 4px 8px; border-radius: 4px; color: white; display: inline-block; }
.estado-creado { background-color: #64748b; }
.estado-proceso { background-color: #f59e0b; color: #000; }
.estado-aceptado { background-color: #10b981; }
.estado-entregado { background-color: #3b82f6; }
.estado-rechazado { background-color: #ef4444; }

.desktop-only { display: none; }
.mobile-only { display: block; }
.mobile-only-flex { display: flex; }

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
.total-score-card {
  margin-top: 20px; padding: 25px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #fff; display: flex; justify-content: space-between; align-items: center; border-radius: 12px;
}
.total-score-card strong { font-size: 2.2rem; color: #ff4d4d; text-shadow: 0 0 15px rgba(255, 77, 77, 0.4); }

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

.perf-scale-container { display: flex; flex-direction: column; gap: 10px; }
.perf-opt-item {
  display: flex; align-items: center; padding: 15px; border: 2px solid #f1f5f9; border-radius: 10px;
  cursor: pointer; background: #fff; transition: 0.3s; border-left: 6px solid #cbd5e1;
}
.perf-opt-item:hover { transform: translateX(6px); border-color: #cbd5e1; }
.perf-opt-item.is-active { border-color: #dc2626; background: #fff8f8; transform: scale(1.02); box-shadow: 0 8px 20px rgba(220, 38, 38, 0.1); }
.perf-num { font-size: 1.5rem; font-weight: 900; min-width: 45px; color: #0f172a; }
.perf-desc { font-size: 0.85rem; font-weight: 700; color: #475569; margin-left: 10px; }

.tone-green { border-left-color: #10b981; } .tone-lgreen { border-left-color: #84cc16; }
.tone-yellow { border-left-color: #f59e0b; } .tone-red { border-left-color: #ef4444; }

.anim-fade { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* ====================================================
   MEDIA QUERIES (DESKTOP)
   ==================================================== */
@media (min-width: 768px) {
  .desktop-only { display: block; }
  .mobile-only, .mobile-only-flex { display: none !important; }

  .full-screen-wrapper { padding: 20px; }
  .admin-panel { padding: 20px; border-radius: 8px; }

  .header-section {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px;
    padding: 15px 25px !important;
    margin-bottom: 15px !important;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
  }

  .title { font-size: 1.1rem; }

  .header-info { width: auto; }
  .header-actions { width: auto; justify-content: flex-end; flex-wrap: nowrap; gap: 8px; }


  .btn-action { width: auto; height: auto; padding: 8px 12px; font-size: 0.75rem; justify-content: flex-start; gap: 5px; }
  .btn-text { display: inline; }

  .table-container { width: 100%; overflow: auto; max-height: 75vh; background: white; }
  table { width: 100%; min-width: max-content; border-collapse: collapse; }
  thead tr.main-header th { position: sticky; top: 0; z-index: 100; background-color: #e2e8f0 !important; border-bottom: 2px solid #cbd5e1; font-size: 0.75rem; color: #1e293b; text-transform: uppercase; font-weight: 800; padding: 14px 10px; }
  thead tr.filter-row td { position: sticky; top: 46px; z-index: 90; background-color: #f1f5f9 !important; border-bottom: 2px solid #cbd5e1; padding: 10px 8px; }

  .sticky-col { position: sticky !important; background: white !important; box-shadow: inset -1px 0 0 #e2e8f0; }
  thead tr.main-header th.sticky-col { background-color: #e2e8f0 !important; z-index: 110 !important; }
  thead tr.filter-row td.sticky-col { background-color: #f1f5f9 !important; z-index: 95 !important; }

  .col-id { left: 0; width: 50px; } .col-acciones { left: 50px; width: 90px; } .col-fecha { left: 140px; width: 100px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
  .cell-ro { padding: 12px 10px; font-size: 0.85rem; } .row-hover:hover td { background-color: #f8fafc !important; }

  .filter-input { font-size: 0.75rem; height: 30px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; box-sizing: border-box; background-color: #ffffff; }
  .btn-refresh { background: none; border: none; cursor: pointer; color: #64748b; } .btn-refresh:hover { color: #0f172a; }

  /* Estilos Formulario Desktop */
  .perf-scale-container { flex-direction: row; gap: 8px; }
  .perf-opt-item { flex: 1; flex-direction: column; padding: 20px 5px; text-align: center; border-left: 2px solid #f1f5f9; border-bottom: 6px solid #cbd5e1; }
  .perf-opt-item:hover { transform: translateY(-6px); }
  .perf-desc { margin-left: 0; margin-top: 10px; font-size: 0.7rem; }
  .tone-green { border-bottom-color: #10b981; } .tone-lgreen { border-bottom-color: #84cc16; }
  .tone-yellow { border-bottom-color: #f59e0b; } .tone-red { border-bottom-color: #ef4444; }
  .perf-opt-item.is-active { border-bottom-color: #dc2626; transform: translateY(-8px); }
}

@media (min-width: 1200px) { .full-screen-wrapper { width: 99vw; margin-left: 50%; transform: translateX(-50%); } }
</style>
