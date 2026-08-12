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
            <input v-model="filtros.fecha" class="filter-input-mobile" placeholder="Fecha (AAAA-MM-DD)...">
            <input v-model="filtros.observador" class="filter-input-mobile" placeholder="Observador...">
            <input v-model="filtros.arbitros" class="filter-input-mobile full-width" placeholder="Árbitros observados...">
            <input v-model="filtros.competencia" class="filter-input-mobile full-width" placeholder="Competencia...">
            <input v-model="filtros.categoria" class="filter-input-mobile" placeholder="Categoría...">
            <input v-model="filtros.partido" class="filter-input-mobile" placeholder="Partido...">
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
                  <th>Competencia</th>
                  <th>Categoría</th>
                  <th>Partido</th>
                  <th class="text-center">Cargado</th>
                </tr>
                <tr class="filter-row">
                  <td class="sticky-col col-id text-center">
                    <button @click="obtenerObservaciones" :disabled="cargando" class="btn-refresh mx-auto d-flex align-items-center justify-content-center" title="Recargar">
                      <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary" style="width: 16px; height: 16px; border-width: 2px;"></span>
                      <span v-else class="material-icons" style="font-size: 16px;">refresh</span>
                    </button>
                  </td>
                  <td class="sticky-col col-acciones"></td>
                  <td class="sticky-col col-fecha"><input v-model="filtros.fecha" class="filter-input shadow-none text-center" placeholder="AAAA-MM-DD"></td>
                  <td><input v-model="filtros.observador" class="filter-input shadow-none" placeholder="Filtrar observador.."></td>
                  <td><input v-model="filtros.arbitros" class="filter-input shadow-none" placeholder="Filtrar árbitros.."></td>
                  <td><input v-model="filtros.competencia" class="filter-input shadow-none" placeholder="Filtrar competencia.."></td>
                  <td><input v-model="filtros.categoria" class="filter-input shadow-none" placeholder="Filtrar.."></td>
                  <td><input v-model="filtros.partido" class="filter-input shadow-none" placeholder="Filtrar partido.."></td>
                  <td></td>
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
                  <td class="sticky-col col-fecha text-center cell-ro fw-bold">{{ formatearFecha(o.fecha_partido) }}</td>
                  <td class="cell-ro text-dark">{{ o.observador }}</td>
                  <td class="cell-ro fw-bold text-uppercase text-dark">{{ o.arbitros }}</td>
                  <td class="cell-ro text-dark">{{ o.competencia }}</td>
                  <td class="cell-ro text-dark">{{ o.categoria_edad }}</td>
                  <td class="cell-ro text-dark">
                    {{ o.equipo_local }} vs {{ o.equipo_visitante }}
                    <span v-if="o.numero_partido" class="text-muted">(Nº {{ o.numero_partido }})</span>
                  </td>
                  <td class="text-center cell-ro text-muted">{{ formatearFechaHora(o.creado_en) }}</td>
                </tr>
                <tr v-if="observacionesPaginadas.length === 0">
                  <td colspan="9" class="text-center py-5 text-muted bg-light italic border-0">
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
                  {{ formatearFecha(o.fecha_partido) }}
                </div>
              </div>
              <div class="card-body pt-0 px-3 pb-3">
                <div class="card-info bg-light p-2 rounded border mt-2">
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
        <p class="text-muted small mt-1 mb-0">Observación #{{ observacionActual.id }} — {{ formatearFecha(observacionActual.fecha_partido) }}</p>
      </div>
      <div class="text-start bg-light p-3 rounded border mb-4 border-secondary-subtle">
        <p class="m-0 fw-bold small text-dark mb-1">Árbitros: <span class="text-danger">{{ observacionActual.arbitros }}</span></p>
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

      <div class="desktop-only table-responsive border rounded shadow-sm m-0">
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

      <div class="mobile-only">
        <div v-if="historialSeleccionado.length === 0" class="text-center py-4 text-muted">
          No hay registros en el historial.
        </div>
        <div v-for="h in historialSeleccionado" :key="'hmob-'+h.id" class="card-licencia bg-light mb-3 border">
          <div class="card-header border-0 pb-2 mb-2 d-flex justify-content-between align-items-start">
            <div class="card-name fw-bold lh-sm text-dark pe-2" style="font-size: 0.95rem;">
              {{ h.equipo_local }} vs {{ h.equipo_visitante }}
              <div class="text-danger mt-1" style="font-size: 0.75rem;">{{ h.categoria_edad }} • {{ formatearFecha(h.fecha_partido) }}</div>
            </div>
          </div>
          <div class="px-1">
            <div class="card-row border-bottom pb-2 mb-2">
              <span class="fw-bold text-dark">Observador:</span>
              <span class="text-muted">{{ h.observador }}</span>
            </div>
            <div class="card-row mb-0">
              <span class="fw-bold text-dark">Competencia:</span>
              <span class="text-muted">{{ h.competencia }}</span>
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

const filtros = reactive({ fecha: '', observador: '', arbitros: '', competencia: '', categoria: '', partido: '' });
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

const observacionesFiltradas = computed(() => {
  return observaciones.value.filter(o => {
    const matchFec = (o.fecha_partido || '').includes(filtros.fecha);
    const matchObs = normalizar(o.observador).includes(normalizar(filtros.observador));
    const matchArb = normalizar(o.arbitros).includes(normalizar(filtros.arbitros));
    const matchComp = normalizar(o.competencia).includes(normalizar(filtros.competencia));
    const matchCat = normalizar(o.categoria_edad).includes(normalizar(filtros.categoria));
    const matchPar = normalizar(`${o.equipo_local} ${o.equipo_visitante} ${o.numero_partido}`).includes(normalizar(filtros.partido));

    return matchFec && matchObs && matchArb && matchComp && matchCat && matchPar;
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

  .col-id { left: 0; width: 50px; } .col-acciones { left: 50px; width: 90px; } .col-fecha { left: 140px; width: 110px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
  .cell-ro { padding: 12px 10px; font-size: 0.85rem; } .row-hover:hover td { background-color: #f8fafc !important; }

  .filter-input { font-size: 0.75rem; height: 30px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; box-sizing: border-box; background-color: #ffffff; }
  .btn-refresh { background: none; border: none; cursor: pointer; color: #64748b; } .btn-refresh:hover { color: #0f172a; }
}

@media (min-width: 1200px) { .full-screen-wrapper { width: 99vw; margin-left: 50%; transform: translateX(-50%); } }
</style>
