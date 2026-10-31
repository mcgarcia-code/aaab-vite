<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-currency-dollar me-1"></i> Valores y Porcentaje de Aporte
            </h4>
            <span class="text-muted small d-block mt-1">
              Total: {{ filasFiltradas.length }} de {{ filas.length }} conceptos · Editar abre un nuevo período de vigencia
            </span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Actualizar -->
            <button @click="cargarTodo" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <!-- Botón Filtros (Solo Móvil) -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <!-- Botón Limpiar filtros -->
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Limpiar filtros">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <!-- Botón Nuevo Concepto -->
            <button @click="abrirModalNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_circle</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo Concepto</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Valores</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <!-- Concepto / Categoría -->
            <div class="col-12 col-md-4">
              <input v-model="filtros.texto" type="text" class="form-control form-control-sm shadow-none" placeholder="Concepto o categoría...">
            </div>

            <!-- Tipo -->
            <div class="col-6 col-md-3">
              <select v-model="filtros.tipo" class="form-select form-select-sm shadow-none">
                <option value="">TIPO (TODOS)</option>
                <option value="fijo">Otros conceptos</option>
                <option value="partido">Valor de partido</option>
              </select>
            </div>

            <!-- Estado -->
            <div class="col-6 col-md-3">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none">
                <option value="">ESTADO (TODOS)</option>
                <option value="definido">Definido</option>
                <option value="sin_definir">Sin definir</option>
                <option value="exenta">Exenta</option>
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
            <p class="text-muted mt-3 fw-bold">Cargando valores...</p>
          </div>

          <template v-else>

            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.75rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-center text-uppercase text-muted" style="font-size: 0.75rem; width: 1px;">Acciones</th>
                    <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Concepto</th>
                    <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Tipo</th>
                    <th class="py-3 text-end text-uppercase text-muted" style="font-size: 0.75rem;">Valor vigente</th>
                    <th class="py-3 text-center pe-3 text-uppercase text-muted" style="font-size: 0.75rem;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="f in filasPaginadas" :key="f.key">
                  <tr v-if="!f.esGrupo">
                    <td class="ps-3 text-center">
                      <div class="d-flex justify-content-center gap-1">
                        <button @click="abrirModalEditar(f.clave, f.idCategoria, f.etiqueta)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar">
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button @click="abrirModalHistorial(f.clave, f.idCategoria, f.etiqueta)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-secondary" title="Historial">
                          <span class="material-icons" style="font-size:16px;">history</span>
                        </button>
                        <button v-if="f.admiteSubconceptos" @click.stop="abrirModalSub(f)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-success" title="Agregar subconcepto">
                          <span class="material-icons" style="font-size:16px;">playlist_add</span>
                        </button>
                        <button v-if="f.editable" @click.stop="abrirModalRenombrar(f)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Renombrar">
                          <span class="material-icons" style="font-size:16px;">drive_file_rename_outline</span>
                        </button>
                        <button v-if="f.editable" @click.stop="confirmarEliminarConcepto(f)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Eliminar">
                          <span class="material-icons" style="font-size:16px;">delete</span>
                        </button>
                      </div>
                    </td>
                    <td class="text-dark fw-bold">
                      <div class="d-flex align-items-center gap-2">
                        <i :class="f.icono" class="text-danger"></i>
                        <span>{{ f.etiqueta }}</span>
                      </div>
                    </td>
                    <td class="text-muted">
                      <span v-if="f.tipo === 'partido'" class="badge bg-info-subtle text-primary border">Valor de partido</span>
                      <span v-else class="badge bg-danger-subtle text-danger border">Otro concepto</span>
                    </td>
                    <td class="text-end fw-bold" :class="f.estado === 'definido' ? 'text-dark' : 'text-muted'">
                      {{ textoValor(f) }}
                    </td>
                    <td class="text-center pe-3">
                      <span class="badge" :class="claseEstado(f.estado)">{{ etiquetaEstado(f.estado) }}</span>
                    </td>
                  </tr>

                  <!-- GRUPO (ej: Valor por Observación) -->
                  <template v-else>
                    <tr class="fila-grupo" @click="toggleGrupo(f)" style="cursor: pointer;">
                      <td class="ps-3 text-center">
                        <div class="d-flex justify-content-center gap-1">
                          <button type="button" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" :title="estaExpandido(f) ? 'Contraer' : 'Desplegar'">
                            <span class="material-icons" style="font-size:16px;">{{ estaExpandido(f) ? 'expand_less' : 'expand_more' }}</span>
                          </button>
                          <button v-if="f.admiteSubconceptos" @click.stop="abrirModalSub(f)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-success" title="Agregar subconcepto">
                          <span class="material-icons" style="font-size:16px;">playlist_add</span>
                        </button>
                        <button v-if="f.editable" @click.stop="abrirModalRenombrar(f)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Renombrar">
                          <span class="material-icons" style="font-size:16px;">drive_file_rename_outline</span>
                        </button>
                        <button v-if="f.editable" @click.stop="confirmarEliminarConcepto(f)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Eliminar">
                          <span class="material-icons" style="font-size:16px;">delete</span>
                        </button>
                        </div>
                      </td>
                      <td class="text-dark fw-bold">
                        <div class="d-flex align-items-center gap-2">
                          <i :class="f.icono" class="text-danger"></i>
                          <span>{{ f.etiqueta }}</span>
                        </div>
                      </td>
                      <td class="text-muted">
                        <span v-if="f.tipo === 'partido'" class="badge bg-info-subtle text-primary border">Valor de partido</span>
                        <span v-else class="badge bg-danger-subtle text-danger border">Otro concepto</span>
                      </td>
                      <td class="text-end text-muted fw-bold">{{ f.hijos.length }} {{ f.tipo === 'partido' ? 'categorías' : 'ítems' }}</td>
                      <td class="text-center pe-3">
                        <span class="badge" :class="claseEstado(f.estado)">{{ f.definidos }}/{{ f.hijos.length }} DEFINIDOS</span>
                      </td>
                    </tr>
                    <template v-if="estaExpandido(f)">
                      <tr v-for="h in f.hijosVisibles" :key="h.key" class="fila-hijo">
                        <td class="ps-3 text-center">
                          <div class="d-flex justify-content-center gap-1">
                            <button @click="abrirModalEditar(h.clave, h.idCategoria, h.etiqueta)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar">
                              <span class="material-icons" style="font-size:16px;">edit</span>
                            </button>
                            <button @click="abrirModalHistorial(h.clave, h.idCategoria, h.etiqueta)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-secondary" title="Historial">
                              <span class="material-icons" style="font-size:16px;">history</span>
                            </button>
                            <button v-if="h.editable" @click.stop="abrirModalRenombrar(h)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Renombrar">
                          <span class="material-icons" style="font-size:16px;">drive_file_rename_outline</span>
                        </button>
                        <button v-if="h.editable" @click.stop="confirmarEliminarConcepto(h)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Eliminar">
                          <span class="material-icons" style="font-size:16px;">delete</span>
                        </button>
                          </div>
                        </td>
                        <td class="text-dark">
                          <div class="d-flex align-items-center gap-2 ps-4">
                            <span class="material-icons text-muted" style="font-size:16px;">subdirectory_arrow_right</span>
                            <span>{{ h.etiqueta }}</span>
                          </div>
                        </td>
                        <td class="text-muted">
                          <span class="badge bg-light text-dark border">{{ f.subtipo }}</span>
                        </td>
                        <td class="text-end fw-bold" :class="h.estado === 'definido' ? 'text-dark' : 'text-muted'">
                          {{ textoValor(h) }}
                        </td>
                        <td class="text-center pe-3">
                          <span class="badge" :class="claseEstado(h.estado)">{{ etiquetaEstado(h.estado) }}</span>
                        </td>
                      </tr>
                    </template>
                  </template>
                  </template>
                  <tr v-if="filasPaginadas.length === 0">
                    <td colspan="5" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">inbox</span>
                      <p class="m-0 fw-bold">{{ hayFiltrosActivos ? 'No hay valores que coincidan con los filtros.' : 'No hay valores cargados.' }}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <template v-for="f in filasPaginadas" :key="'mob-'+f.key">
              <div v-if="!f.esGrupo" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-header bg-white border-bottom-0 pb-2 px-3 pt-3 rounded-top-3 d-flex justify-content-between align-items-start">
                  <div class="text-dark fw-bold d-flex align-items-center gap-2" style="font-size: 1rem;">
                    <i :class="f.icono" class="text-danger"></i>
                    <div>{{ f.etiqueta }}</div>
                  </div>
                  <span class="badge" :class="claseEstado(f.estado)">{{ etiquetaEstado(f.estado) }}</span>
                </div>
                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex flex-column gap-2 bg-light p-2 rounded border mb-2 border-light-subtle">
                    <span class="text-dark small">
                      <strong>Tipo:</strong> {{ f.tipo === 'partido' ? 'Valor de partido' : 'Otro concepto' }}
                    </span>
                    <span class="text-dark small">
                      <strong>Valor vigente:</strong> {{ textoValor(f) }}
                    </span>
                  </div>
                  <div class="d-flex gap-2">
                    <button @click="abrirModalEditar(f.clave, f.idCategoria, f.etiqueta)" class="btn btn-sm btn-outline-primary flex-fill fw-bold d-flex align-items-center justify-content-center gap-1">
                      <span class="material-icons" style="font-size:16px;">edit</span> Editar
                    </button>
                    <button @click="abrirModalHistorial(f.clave, f.idCategoria, f.etiqueta)" class="btn btn-sm btn-outline-secondary flex-fill fw-bold d-flex align-items-center justify-content-center gap-1">
                      <span class="material-icons" style="font-size:16px;">history</span> Historial
                    </button>
                    <button v-if="f.admiteSubconceptos" @click="abrirModalSub(f)" class="btn btn-sm btn-outline-success px-2" aria-label="Agregar subconcepto">
                      <span class="material-icons" style="font-size:16px;">playlist_add</span>
                    </button>
                    <button v-if="f.editable" @click="abrirModalRenombrar(f)" class="btn btn-sm btn-outline-primary px-2" aria-label="Renombrar">
                      <span class="material-icons" style="font-size:16px;">drive_file_rename_outline</span>
                    </button>
                    <button v-if="f.editable" @click="confirmarEliminarConcepto(f)" class="btn btn-sm btn-outline-danger px-2" aria-label="Eliminar">
                      <span class="material-icons" style="font-size:16px;">delete</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- GRUPO (Celular) -->
              <div v-else class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div @click="toggleGrupo(f)" style="cursor: pointer;" class="card-header bg-white border-bottom-0 pb-2 px-3 pt-3 rounded-top-3 d-flex justify-content-between align-items-start">
                  <div class="text-dark fw-bold d-flex align-items-center gap-2" style="font-size: 1rem;">
                    <i :class="f.icono" class="text-danger"></i>
                    <div>
                      <div>{{ f.etiqueta }}</div>
                      <div class="text-muted small fw-normal">{{ f.hijos.length }} {{ f.tipo === 'partido' ? 'categorías' : 'ítems' }}</div>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-1">
                    <button v-if="f.admiteSubconceptos" @click.stop="abrirModalSub(f)" class="btn btn-sm btn-light border p-1 text-success" aria-label="Agregar subconcepto">
                      <span class="material-icons" style="font-size:16px;">playlist_add</span>
                    </button>
                    <button v-if="f.editable" @click.stop="abrirModalRenombrar(f)" class="btn btn-sm btn-light border p-1 text-primary" aria-label="Renombrar">
                      <span class="material-icons" style="font-size:16px;">drive_file_rename_outline</span>
                    </button>
                    <button v-if="f.editable" @click.stop="confirmarEliminarConcepto(f)" class="btn btn-sm btn-light border p-1 text-danger" aria-label="Eliminar">
                      <span class="material-icons" style="font-size:16px;">delete</span>
                    </button>
                    <span class="badge" :class="claseEstado(f.estado)">{{ f.definidos }}/{{ f.hijos.length }}</span>
                    <span class="material-icons text-muted" style="font-size:20px;">{{ estaExpandido(f) ? 'expand_less' : 'expand_more' }}</span>
                  </div>
                </div>
                <div v-if="estaExpandido(f)" class="card-body pt-0 px-3 pb-3 d-flex flex-column gap-2">
                  <div v-for="h in f.hijosVisibles" :key="'mob-'+h.key" class="bg-light p-2 rounded border border-light-subtle">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div class="text-dark small fw-bold">{{ h.etiqueta }}</div>
                        <div class="small" :class="h.estado === 'definido' ? 'text-dark' : 'text-muted'">{{ textoValor(h) }}</div>
                      </div>
                      <span class="badge" :class="claseEstado(h.estado)">{{ etiquetaEstado(h.estado) }}</span>
                    </div>
                    <div class="d-flex gap-2">
                      <button @click="abrirModalEditar(h.clave, h.idCategoria, h.etiqueta)" class="btn btn-sm btn-outline-primary flex-fill fw-bold d-flex align-items-center justify-content-center gap-1">
                        <span class="material-icons" style="font-size:16px;">edit</span> Editar
                      </button>
                      <button @click="abrirModalHistorial(h.clave, h.idCategoria, h.etiqueta)" class="btn btn-sm btn-outline-secondary flex-fill fw-bold d-flex align-items-center justify-content-center gap-1">
                        <span class="material-icons" style="font-size:16px;">history</span> Historial
                      </button>
                      <button v-if="h.editable" @click="abrirModalRenombrar(h)" class="btn btn-sm btn-outline-primary px-2" aria-label="Renombrar">
                        <span class="material-icons" style="font-size:16px;">drive_file_rename_outline</span>
                      </button>
                      <button v-if="h.editable" @click="confirmarEliminarConcepto(h)" class="btn btn-sm btn-outline-danger px-2" aria-label="Eliminar">
                        <span class="material-icons" style="font-size:16px;">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </template>
              <div v-if="filasPaginadas.length === 0" class="text-center py-5 text-muted">
                <span class="material-icons d-block fs-1 mb-2">inbox</span>
                <p class="m-0 fw-bold">{{ hayFiltrosActivos ? 'No hay valores que coincidan con los filtros.' : 'No hay valores cargados.' }}</p>
              </div>
            </div>

            <!-- PAGINACIÓN -->
            <div v-if="totalPaginas > 1" class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3">
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

    <!-- MODAL EDITAR -->
    <ModalBase :show="mostrarModalEditar" @close="mostrarModalEditar = false" icono="edit" colorIcono="bg-info-subtle text-info" maxWidth="500px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Editar Valor</span>
        </div>
      </template>

      <form id="formValor" @submit.prevent="confirmarGuardado" class="d-flex flex-column gap-4 text-start">

        <!-- CONCEPTO -->
        <div>
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">Concepto</label>
          <div class="bg-light border rounded p-2 small fw-bold text-dark">{{ formEdicion.etiqueta }}</div>
        </div>

        <!-- EXENTA (solo valor de partido) -->
        <div v-if="formEdicion.concepto === 'valor_partido'">
          <div class="form-check border-bottom pb-2">
            <input class="form-check-input shadow-none" type="checkbox" v-model="formEdicion.exento" id="checkExento">
            <label class="form-check-label small fw-bold text-danger" for="checkExento" style="cursor: pointer;">
              Categoría EXENTA de aporte
            </label>
          </div>
          <span class="text-muted" style="font-size: 0.75rem;">No genera débito de arbitraje.</span>
        </div>

        <!-- VALOR -->
        <div v-if="!(formEdicion.concepto === 'valor_partido' && formEdicion.exento)">
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">
            {{ formEdicion.concepto === 'porcentaje_aporte' ? 'Porcentaje (%)' : 'Monto ($)' }} <span class="text-danger">*</span>
          </label>
          <input v-model.number="formEdicion.valor" type="number" step="0.01" min="0" class="form-control form-control-sm shadow-none" required>
          <span class="text-muted" style="font-size: 0.75rem;">El valor anterior queda registrado en el historial con fecha de fin hoy.</span>
        </div>
      </form>

      <template #footer>
        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center w-100">
          <button type="button" @click="mostrarModalEditar = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 w-sm-auto">CANCELAR</button>
          <button type="submit" form="formValor" :disabled="procesando" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100 w-sm-auto d-flex align-items-center justify-content-center gap-2">
            <span v-if="procesando" class="spinner-border spinner-border-sm"></span>
            {{ procesando ? 'GUARDANDO...' : 'GUARDAR VALOR' }}
          </button>
        </div>
      </template>
    </ModalBase>

    <!-- MODAL NUEVO CONCEPTO -->
    <ModalBase :show="mostrarModalNuevo" @close="mostrarModalNuevo = false" icono="add_circle" colorIcono="bg-success-subtle text-success" maxWidth="600px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Nuevo Concepto</span>
        </div>
      </template>

      <form id="formNuevoConcepto" @submit.prevent="confirmarNuevoConcepto" class="d-flex flex-column gap-4 text-start">

        <!-- CONCEPTO -->
        <div>
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">
            Concepto <span class="text-danger">*</span>
          </label>
          <input v-model="formNuevo.etiqueta" type="text" maxlength="120" class="form-control form-control-sm shadow-none" placeholder="Ej: Designaciones" required>
        </div>

        <!-- TIPO -->
        <div>
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">Tipo</label>
          <div class="d-flex flex-column flex-sm-row gap-2">
            <button type="button" class="btn btn-sm flex-fill"
                    :class="formNuevo.tipo === 'fijo' ? 'btn-danger text-white shadow-sm' : 'btn-light border'"
                    @click="formNuevo.tipo = 'fijo'">
              Otro concepto
            </button>
            <button type="button" class="btn btn-sm flex-fill"
                    :class="formNuevo.tipo === 'partido' ? 'btn-danger text-white shadow-sm' : 'btn-light border'"
                    @click="formNuevo.tipo = 'partido'">
              Valor de partido
            </button>
          </div>
        </div>

        <!-- ¿TIENE SUBCONCEPTOS? -->
        <div>
          <div class="form-check border-bottom pb-2">
            <input class="form-check-input shadow-none" type="checkbox" v-model="formNuevo.conSubconceptos" id="checkSubconceptos">
            <label class="form-check-label small fw-bold text-danger" for="checkSubconceptos" style="cursor: pointer;">
              Tiene subconceptos
            </label>
          </div>
          <span class="text-muted" style="font-size: 0.75rem;">
            Ej: "Designaciones" con "Designación Liga de Honor" y "Designadora General". Cada subconcepto lleva su propio valor.
          </span>
        </div>

        <!-- SIN SUBCONCEPTOS: VALOR DEL CONCEPTO -->
        <div v-if="!formNuevo.conSubconceptos">
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">Valor ($)</label>
          <input v-model.number="formNuevo.valor" type="number" step="0.01" min="0" class="form-control form-control-sm shadow-none" placeholder="Opcional">
          <span class="text-muted" style="font-size: 0.75rem;">Si lo dejás vacío, queda "Sin definir" y lo cargás después con Editar.</span>
        </div>

        <!-- CON SUBCONCEPTOS: LISTA -->
        <div v-else>
          <label class="form-label fw-bold small text-uppercase text-muted mb-2">
            Subconceptos <span class="text-danger">*</span>
          </label>

          <div class="d-flex flex-column gap-2">
            <div v-for="(sub, i) in formNuevo.subconceptos" :key="sub.uid" class="d-flex gap-2 align-items-start bg-light border rounded p-2">
              <span class="material-icons text-muted mt-1" style="font-size:16px;">subdirectory_arrow_right</span>
              <div class="flex-grow-1">
                <input v-model="sub.etiqueta" type="text" maxlength="120" class="form-control form-control-sm shadow-none mb-1" :placeholder="'Subconcepto ' + (i + 1)" required>
                <input v-model.number="sub.valor" type="number" step="0.01" min="0" class="form-control form-control-sm shadow-none" placeholder="Valor ($) — opcional">
              </div>
              <button type="button" @click="quitarSubconcepto(i)" :disabled="formNuevo.subconceptos.length === 1"
                      class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Quitar">
                <span class="material-icons" style="font-size:16px;">delete</span>
              </button>
            </div>
          </div>

          <button type="button" @click="agregarSubconcepto" class="btn btn-sm btn-outline-danger fw-bold mt-2 d-flex align-items-center gap-1">
            <span class="material-icons" style="font-size:16px;">add</span> Agregar subconcepto
          </button>
        </div>
      </form>

      <template #footer>
        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center w-100">
          <button type="button" @click="mostrarModalNuevo = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 w-sm-auto">CANCELAR</button>
          <button type="submit" form="formNuevoConcepto" :disabled="guardandoConcepto" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100 w-sm-auto d-flex align-items-center justify-content-center gap-2">
            <span v-if="guardandoConcepto" class="spinner-border spinner-border-sm"></span>
            {{ guardandoConcepto ? 'GUARDANDO...' : 'CREAR CONCEPTO' }}
          </button>
        </div>
      </template>
    </ModalBase>

    <!-- MODAL AGREGAR SUBCONCEPTOS -->
    <ModalBase :show="mostrarModalSub" @close="mostrarModalSub = false" icono="playlist_add" colorIcono="bg-success-subtle text-success" maxWidth="600px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Agregar Subconceptos</span>
          <div class="text-muted small">{{ formSub.etiqueta }}</div>
        </div>
      </template>

      <form id="formSubconceptos" @submit.prevent="confirmarAgregarSub" class="d-flex flex-column gap-2 text-start">
        <label class="form-label fw-bold small text-uppercase text-muted mb-0">
          Subconceptos <span class="text-danger">*</span>
        </label>
        <div v-if="formSub.cierraValor" class="alert alert-warning py-2 small mb-1">
          Este concepto tiene un valor definido. Al pasar a tener subconceptos, su valor vigente queda cerrado y cada subconcepto lleva el suyo.
        </div>

        <div class="d-flex flex-column gap-2">
          <div v-for="(sub, i) in formSub.subconceptos" :key="sub.uid" class="d-flex gap-2 align-items-start bg-light border rounded p-2">
            <span class="material-icons text-muted mt-1" style="font-size:16px;">subdirectory_arrow_right</span>
            <div class="flex-grow-1">
              <input v-model="sub.etiqueta" type="text" maxlength="120" class="form-control form-control-sm shadow-none mb-1" :placeholder="'Subconcepto ' + (i + 1)" required>
              <input v-model.number="sub.valor" type="number" step="0.01" min="0" class="form-control form-control-sm shadow-none" placeholder="Valor ($) — opcional">
            </div>
            <button type="button" @click="formSub.subconceptos.splice(i, 1)" :disabled="formSub.subconceptos.length === 1"
                    class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Quitar">
              <span class="material-icons" style="font-size:16px;">delete</span>
            </button>
          </div>
        </div>

        <button type="button" @click="formSub.subconceptos.push(subVacio())" class="btn btn-sm btn-outline-danger fw-bold mt-1 align-self-start d-flex align-items-center gap-1">
          <span class="material-icons" style="font-size:16px;">add</span> Agregar subconcepto
        </button>
      </form>

      <template #footer>
        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center w-100">
          <button type="button" @click="mostrarModalSub = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 w-sm-auto">CANCELAR</button>
          <button type="submit" form="formSubconceptos" :disabled="procesando" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100 w-sm-auto d-flex align-items-center justify-content-center gap-2">
            <span v-if="procesando" class="spinner-border spinner-border-sm"></span>
            {{ procesando ? 'GUARDANDO...' : 'AGREGAR' }}
          </button>
        </div>
      </template>
    </ModalBase>

    <!-- MODAL RENOMBRAR CONCEPTO -->
    <ModalBase :show="mostrarModalRenombrar" @close="mostrarModalRenombrar = false" icono="drive_file_rename_outline" colorIcono="bg-info-subtle text-info" maxWidth="500px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Renombrar Concepto</span>
        </div>
      </template>

      <form id="formRenombrar" @submit.prevent="guardarRenombrado" class="d-flex flex-column gap-2 text-start">
        <label class="form-label fw-bold small text-uppercase text-muted mb-0">
          Nombre <span class="text-danger">*</span>
        </label>
        <input v-model="formRenombrar.etiqueta" type="text" maxlength="120" class="form-control form-control-sm shadow-none" required>
      </form>

      <template #footer>
        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center w-100">
          <button type="button" @click="mostrarModalRenombrar = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 w-sm-auto">CANCELAR</button>
          <button type="submit" form="formRenombrar" :disabled="procesando" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100 w-sm-auto d-flex align-items-center justify-content-center gap-2">
            <span v-if="procesando" class="spinner-border spinner-border-sm"></span>
            {{ procesando ? 'GUARDANDO...' : 'GUARDAR NOMBRE' }}
          </button>
        </div>
      </template>
    </ModalBase>

    <!-- MODAL HISTORIAL -->
    <ModalBase :show="mostrarModalHistorial" @close="mostrarModalHistorial = false" icono="history" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="600px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Historial</span>
          <div class="text-muted small">{{ historialEtiqueta }}</div>
        </div>
      </template>

      <div v-if="cargandoHistorial" class="text-center py-4">
        <span class="spinner-border text-danger"></span>
        <p class="text-muted mt-2 small fw-bold mb-0">Cargando historial...</p>
      </div>
      <div v-else-if="historial.length === 0" class="text-center py-4 text-muted">
        <span class="material-icons d-block mb-2 fs-1">inbox</span>
        <p class="mb-0 fw-bold">Sin registros previos.</p>
      </div>
      <div v-else class="table-responsive border rounded shadow-sm tabla-sin-lineas">
        <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.75rem;">
          <thead class="table-light">
            <tr>
              <th class="py-3 ps-3 text-uppercase text-muted" style="font-size: 0.75rem;">Valor</th>
              <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Vigencia</th>
              <th class="py-3 pe-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in historial" :key="h.id">
              <td class="ps-3 fw-bold text-dark">
                <span v-if="h.concepto === 'valor_partido' && Number(h.exento) === 1" class="badge estado-pill estado-borrado">EXENTA</span>
                <span v-else>{{ h.concepto === 'porcentaje_aporte' ? h.valor + ' %' : formatearMonto(h.valor) }}</span>
              </td>
              <td class="text-muted small">
                <div>{{ formatearFecha(h.fecha_desde) }}</div>
                <div class="text-secondary">→ {{ h.fecha_hasta ? formatearFecha(h.fecha_hasta) : 'Actualidad' }}</div>
              </td>
              <td class="text-center pe-3">
                <span v-if="!h.fecha_hasta" class="badge estado-pill estado-vigente">VIGENTE</span>
                <span v-else class="badge estado-pill estado-cumplida">FINALIZADO</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <div class="d-flex justify-content-center w-100">
          <button @click="mostrarModalHistorial = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 w-sm-auto">CERRAR</button>
        </div>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject, watch } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Valores y Porcentaje de Aporte | AAAB',
  meta: [{ name: 'description', content: 'Gestión de valores y porcentaje de aporte de la AAAB.' }],
})

// Sistemas globales (mismos que usa toda la web)
const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const mostrarToast = (mensaje, tipo = 'success') => {
  toast({
    titulo: tipo === 'danger' ? 'Error' : 'Éxito',
    mensaje,
    tipo
  })
}

// ====================================================
//  ESTADO
// ====================================================
const cargando = ref(false)
const procesando = ref(false)
const cargandoHistorial = ref(false)

const categorias = ref([])
const valoresVigentes = ref([])
const conceptos = ref([]) // tabla tesoreria_conceptos (viene del back)

const mostrarFiltrosMobile = ref(false)
const paginaActual = ref(1)
const registrosPorPagina = 10

// ----------------------------------------------------
//  FILTROS
// ----------------------------------------------------
const filtros = reactive({
  texto: '',
  tipo: '',
  estado: '',
})

const limpiarFiltros = () => {
  filtros.texto = ''
  filtros.tipo = ''
  filtros.estado = ''
}

const hayFiltrosActivos = computed(() =>
  Object.values(filtros).some(v => String(v || '').trim() !== '')
)

// ====================================================
//  HELPERS
// ====================================================
const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function buscarRegistro(concepto, idCategoria) {
  return valoresVigentes.value.find(v => v.concepto === concepto && Number(v.id_categoria) === Number(idCategoria || 0)) || null
}

const formatearMonto = (valor) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(valor)
}

const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  const partes = String(fecha).slice(0, 10).split('-')
  if (partes.length !== 3) return fecha
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

const textoValor = (f) => {
  if (f.estado === 'exenta') return 'Exenta'
  if (f.estado === 'sin_definir') return 'Sin definir'
  return f.clave === 'porcentaje_aporte' ? `${f.valor} %` : formatearMonto(f.valor)
}

const etiquetaEstado = (estado) => {
  if (estado === 'definido') return 'DEFINIDO'
  if (estado === 'exenta') return 'EXENTA'
  return 'SIN DEFINIR'
}

const claseEstado = (estado) => {
  if (estado === 'definido') return 'estado-pill estado-cumplida'
  if (estado === 'exenta') return 'estado-pill estado-borrado'
  if (estado === 'sin_definir') return 'estado-pill estado-creado'
  return 'estado-pill estado-default'
}

const calcularEstado = (valor, exento) => {
  if (exento) return 'exenta'
  if (valor === null) return 'sin_definir'
  return 'definido'
}

// ====================================================
//  COMPUTED
// ====================================================
// La tabla no guarda íconos: se eligen acá.
// Concepto con subconceptos (grupo) -> carpeta; concepto suelto -> etiqueta; porcentaje -> %.
const iconoConcepto = (c, tieneHijos) => {
  if (c.clave === 'porcentaje_aporte') return 'bi bi-percent'
  return tieneHijos ? 'bi bi-collection' : 'bi bi-tag'
}

// Conceptos de primer nivel (sin padre), cada uno con sus subconceptos, ordenados
const arbolConceptos = computed(() => {
  const porOrden = (a, b) => (Number(a.orden) - Number(b.orden)) || (Number(a.id) - Number(b.id))
  const todos = conceptos.value
  return todos
    .filter(c => !c.id_padre)
    .sort(porOrden)
    .map(c => {
      const hijos = todos.filter(h => Number(h.id_padre) === Number(c.id)).sort(porOrden)
      return { ...c, hijos, icono: iconoConcepto(c, hijos.length > 0) }
    })
})

// Fila de un concepto editable (fijo, ítem de grupo o valor de partido)
const filaConcepto = ({ clave, etiqueta, icono, idCategoria = null, tipo = 'fijo', esHijo = false, idConcepto = null, sistema = false }) => {
  const registro = buscarRegistro(clave, idCategoria)
  const valor = registro ? Number(registro.valor) : null
  const exento = clave === 'valor_partido' && registro ? Number(registro.exento) === 1 : false
  return {
    key: `${tipo}-${clave}-${idCategoria ?? ''}`,
    tipo,
    clave,
    idCategoria,
    etiqueta,
    icono,
    valor,
    exento,
    esHijo,
    esGrupo: false,
    idConcepto,
    editable: !!idConcepto && !sistema,
    admiteSubconceptos: !!idConcepto && !sistema && !esHijo,
    estado: calcularEstado(valor, exento),
  }
}

// Fila agrupadora que contiene ítems editables (ya construidos con filaConcepto)
const filaGrupo = ({ key, tipo, etiqueta, icono, hijos, subtipo, abiertoPorDefecto = false, idConcepto = null, sistema = false }) => {
  const definidos = hijos.filter(h => h.estado !== 'sin_definir').length
  return {
    key,
    tipo,
    esGrupo: true,
    etiqueta,
    icono,
    hijos,
    subtipo,
    definidos,
    abiertoPorDefecto,
    idConcepto,
    editable: !!idConcepto && !sistema,
    admiteSubconceptos: !!idConcepto && !sistema,
    estado: definidos === hijos.length ? 'definido' : 'sin_definir',
  }
}

// Concepto de la base -> fila suelta o grupo (si tiene subconceptos)
const filaDesdeConcepto = (c) => {
  const tipo = c.tipo === 'partido' ? 'partido' : 'fijo'
  const sistema = Number(c.sistema) === 1
  if (!c.hijos.length) return filaConcepto({ clave: c.clave, etiqueta: c.etiqueta, icono: c.icono, tipo, idConcepto: c.id, sistema })
  return filaGrupo({
    key: 'grupo-' + c.clave,
    tipo,
    etiqueta: c.etiqueta,
    icono: c.icono,
    subtipo: c.etiqueta.replace(/^Valor (por )?/i, ''),
    idConcepto: c.id,
    sistema,
    hijos: c.hijos.map(h => filaConcepto({ clave: h.clave, etiqueta: h.etiqueta, icono: c.icono, tipo, esHijo: true, idConcepto: h.id, sistema: Number(h.sistema) === 1 })),
  })
}

// Divisiones para agrupar los valores de partido (en orden de edad).
// Se detectan por el nombre de la categoría; lo que no coincide va a "Otras".
const divisionesPartido = [
  { clave: 'mini', etiqueta: 'Mini', patron: /\bmini/ },
  { clave: 'infantiles', etiqueta: 'Infantiles', patron: /\binfantil/ },
  { clave: 'menores', etiqueta: 'Menores', patron: /\bmenor/ },
  { clave: 'cadetes', etiqueta: 'Cadetes', patron: /\bcadete/ },
  { clave: 'juveniles', etiqueta: 'Juveniles', patron: /\bjuvenil/ },
  { clave: 'juniors', etiqueta: 'Juniors', patron: /\bjunior/ },
  { clave: 'mayores', etiqueta: 'Mayores', patron: /\bmayor/ },
]

const divisionDeCategoria = (cat) => {
  const nombre = normalizarTexto(cat.nombre_completo || cat.categoria)
  const div = divisionesPartido.find(d => d.patron.test(nombre))
  return div ? div.clave : 'otras'
}

// Lista unificada: primero los otros conceptos, después los valores de partido agrupados
// por división y al final los conceptos nuevos de tipo partido
const filas = computed(() => {
  const fijos = arbolConceptos.value.filter(c => c.tipo !== 'partido').map(filaDesdeConcepto)
  const conceptosPartido = arbolConceptos.value.filter(c => c.tipo === 'partido').map(filaDesdeConcepto)

  const porDivision = {}
  categorias.value.forEach(cat => {
    const div = divisionDeCategoria(cat)
    if (!porDivision[div]) porDivision[div] = []
    porDivision[div].push(filaConcepto({
      clave: 'valor_partido',
      etiqueta: cat.nombre_completo,
      icono: 'bi bi-tag',
      idCategoria: cat.id,
      tipo: 'partido',
      esHijo: true,
    }))
  })

  const partidos = [...divisionesPartido, { clave: 'otras', etiqueta: 'Otras categorías' }]
    .filter(d => porDivision[d.clave]?.length)
    .map(d => filaGrupo({
      key: 'division-' + d.clave,
      tipo: 'partido',
      etiqueta: d.etiqueta,
      icono: 'bi bi-tags',
      subtipo: d.etiqueta,
      hijos: porDivision[d.clave],
      abiertoPorDefecto: false,
    }))

  return [...fijos, ...partidos, ...conceptosPartido]
})

const cumpleFiltros = (f, fTexto, ignorarTexto = false) => {
  if (!ignorarTexto && fTexto && !normalizarTexto(f.etiqueta).includes(fTexto)) return false
  if (filtros.tipo && f.tipo !== filtros.tipo) return false
  if (filtros.estado && f.estado !== filtros.estado) return false
  return true
}

// Los grupos se muestran si alguno de sus ítems cumple los filtros
// (si el texto coincide con el nombre del grupo, se muestran todos sus ítems)
const filasFiltradas = computed(() => {
  const fTexto = normalizarTexto(filtros.texto)
  const resultado = []
  filas.value.forEach(f => {
    if (!f.esGrupo) {
      if (cumpleFiltros(f, fTexto)) resultado.push(f)
      return
    }
    const grupoCoincide = !fTexto || normalizarTexto(f.etiqueta).includes(fTexto)
    const hijosVisibles = f.hijos.filter(h => cumpleFiltros(h, fTexto, grupoCoincide))
    if (hijosVisibles.length) resultado.push({ ...f, hijosVisibles })
  })
  return resultado
})

// Grupos desplegables: todos cerrados por defecto.
// Se abren solos solo al buscar por texto o filtrar por estado (el filtro de tipo los deja cerrados).
const expandidos = ref({})
const filtroAbreGrupos = computed(() => filtros.texto.trim() !== '' || filtros.estado !== '')
const estaExpandido = (f) => filtroAbreGrupos.value || (expandidos.value[f.key] ?? f.abiertoPorDefecto)
const toggleGrupo = (f) => {
  expandidos.value[f.key] = !estaExpandido(f)
}

const totalPaginas = computed(() => Math.ceil(filasFiltradas.value.length / registrosPorPagina) || 1)

const filasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return filasFiltradas.value.slice(inicio, inicio + registrosPorPagina)
})

watch(filtros, () => {
  paginaActual.value = 1
})

watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal
})

// ====================================================
//  CARGA DE DATOS
// ====================================================
const cargarCategorias = async () => {
  const res = await api.get({ entity: 'tesoreria', action: 'obtenerCategoriasEquipos', payload: {} })
  if (res.ok) categorias.value = Array.isArray(res.payload) ? res.payload : []
}

const cargarValores = async () => {
  const res = await api.get({ entity: 'tesoreria', action: 'obtenerValoresVigentes', payload: {} })
  if (res.ok) valoresVigentes.value = Array.isArray(res.payload) ? res.payload : []
}

const cargarConceptos = async () => {
  const res = await api.get({ entity: 'tesoreria', action: 'obtenerConceptos', payload: {} })
  if (res.ok) conceptos.value = Array.isArray(res.payload) ? res.payload : []
  else mostrarToast(res.message || 'No se pudieron cargar los conceptos', 'danger')
}

const cargarTodo = async () => {
  cargando.value = true
  try {
    await Promise.all([cargarConceptos(), cargarCategorias(), cargarValores()])
  } catch (err) {
    console.error('Error al cargar valores:', err)
    mostrarToast('No se pudieron cargar los valores', 'danger')
  } finally {
    cargando.value = false
  }
}

// ====================================================
//  MODAL EDITAR
// ====================================================
const mostrarModalEditar = ref(false)
const formEdicion = reactive({ concepto: '', id_categoria: null, etiqueta: '', valor: null, exento: false })

const abrirModalEditar = (concepto, idCategoria, etiqueta) => {
  const registro = buscarRegistro(concepto, idCategoria)
  formEdicion.concepto = concepto
  formEdicion.id_categoria = idCategoria
  formEdicion.etiqueta = etiqueta
  formEdicion.valor = registro ? Number(registro.valor) : null
  formEdicion.exento = concepto === 'valor_partido' && registro ? Number(registro.exento) === 1 : false
  mostrarModalEditar.value = true
}

const confirmarGuardado = () => {
  notificar({
    titulo: '¿Guardar nuevo valor?',
    mensaje: 'El valor vigente actual quedará cerrado y se aplicará el nuevo a partir de hoy.',
    tipo: 'success',
    alConfirmar: guardarValor
  })
}

const guardarValor = async () => {
  procesando.value = true
  try {
    const esExenta = formEdicion.concepto === 'valor_partido' && formEdicion.exento
    const res = await api.post({
      entity: 'tesoreria',
      action: 'actualizarValor',
      payload: {
        concepto: formEdicion.concepto,
        id_categoria: formEdicion.id_categoria,
        valor: esExenta ? 0 : formEdicion.valor,
        exento: esExenta ? 1 : 0
      }
    })
    if (res.ok && res.payload !== false) {
      mostrarModalEditar.value = false
      await cargarValores()
      mostrarToast('El valor se actualizó correctamente')
    } else {
      mostrarToast(res.message || 'No pudo guardarse el valor', 'danger')
    }
  } catch {
    mostrarToast('Error al conectar con el servidor', 'danger')
  } finally {
    procesando.value = false
  }
}

// ====================================================
//  MODAL NUEVO CONCEPTO
//  Crea un concepto, solo o con sus subconceptos (cada uno con su valor)
// ====================================================
const mostrarModalNuevo = ref(false)
const guardandoConcepto = ref(false)

let uidSub = 0
const subVacio = () => ({ uid: ++uidSub, etiqueta: '', valor: null })
const formNuevoBase = () => ({ etiqueta: '', tipo: 'fijo', conSubconceptos: false, valor: null, subconceptos: [subVacio()] })
const formNuevo = reactive(formNuevoBase())

const agregarSubconcepto = () => formNuevo.subconceptos.push(subVacio())
const quitarSubconcepto = (i) => formNuevo.subconceptos.splice(i, 1)

const abrirModalNuevo = () => {
  Object.assign(formNuevo, formNuevoBase())
  mostrarModalNuevo.value = true
}

const tieneValor = (v) => v !== null && v !== '' && !Number.isNaN(Number(v))

const confirmarNuevoConcepto = () => {
  const nombre = formNuevo.etiqueta.trim()
  if (!nombre) return mostrarToast('Ingresá el nombre del concepto', 'danger')

  const subs = formNuevo.conSubconceptos ? formNuevo.subconceptos.map(x => x.etiqueta.trim()) : []
  if (formNuevo.conSubconceptos) {
    if (subs.some(x => !x)) return mostrarToast('Completá el nombre de todos los subconceptos', 'danger')
    const normalizados = subs.map(normalizarTexto)
    if (new Set(normalizados).size !== normalizados.length) return mostrarToast('Hay subconceptos con el mismo nombre', 'danger')
  }

  const existentes = conceptos.value.map(c => normalizarTexto(c.etiqueta))
  const repetido = [nombre, ...subs].find(n => existentes.includes(normalizarTexto(n)))
  if (repetido) return mostrarToast(`Ya existe un concepto llamado "${repetido}"`, 'danger')

  notificar({
    titulo: '¿Crear concepto?',
    mensaje: formNuevo.conSubconceptos
      ? `Se creará "${nombre}" con ${subs.length} subconcepto${subs.length > 1 ? 's' : ''}: ${subs.join(', ')}.`
      : `Se creará el concepto "${nombre}".`,
    tipo: 'success',
    alConfirmar: guardarNuevoConcepto
  })
}

const guardarNuevoConcepto = async () => {
  guardandoConcepto.value = true
  try {
    const conSubs = formNuevo.conSubconceptos
    const res = await api.post({
      entity: 'tesoreria',
      action: 'crearConcepto',
      payload: {
        etiqueta: formNuevo.etiqueta.trim(),
        tipo: formNuevo.tipo,
        subconceptos: conSubs ? formNuevo.subconceptos.map(x => x.etiqueta.trim()) : [],
      }
    })
    if (!res.ok || res.payload?.success === false || !res.payload?.clave) {
      mostrarToast(res.payload?.message || res.message || 'No se pudo crear el concepto', 'danger')
      return
    }

    // Valores: el back devuelve las claves creadas (los subconceptos en el mismo orden en que se mandaron)
    const aGuardar = []
    if (conSubs) {
      const clavesSubs = Array.isArray(res.payload.subconceptos) ? res.payload.subconceptos : []
      formNuevo.subconceptos.forEach((sub, i) => {
        if (tieneValor(sub.valor) && clavesSubs[i]?.clave) aGuardar.push({ clave: clavesSubs[i].clave, valor: sub.valor })
      })
    } else if (tieneValor(formNuevo.valor)) {
      aGuardar.push({ clave: res.payload.clave, valor: formNuevo.valor })
    }

    const resultados = await Promise.all(aGuardar.map(v => api.post({
      entity: 'tesoreria',
      action: 'actualizarValor',
      payload: { concepto: v.clave, id_categoria: null, valor: v.valor, exento: 0 }
    }).catch(() => ({ ok: false }))))
    const fallaron = resultados.filter(r => !(r.ok && r.payload !== false)).length

    mostrarModalNuevo.value = false
    await Promise.all([cargarConceptos(), cargarValores()])
    if (fallaron) mostrarToast(`El concepto se creó, pero no se pudieron guardar ${fallaron} valor(es). Cargalos con Editar.`, 'danger')
    else mostrarToast('El concepto se creó correctamente')
  } catch {
    mostrarToast('Error al conectar con el servidor', 'danger')
  } finally {
    guardandoConcepto.value = false
  }
}

// ====================================================
//  RENOMBRAR Y ELIMINAR CONCEPTO
// ====================================================
const mostrarModalRenombrar = ref(false)
const formRenombrar = reactive({ id: null, etiqueta: '' })

const abrirModalRenombrar = (f) => {
  formRenombrar.id = f.idConcepto
  formRenombrar.etiqueta = f.etiqueta
  mostrarModalRenombrar.value = true
}

const guardarRenombrado = async () => {
  const nombre = formRenombrar.etiqueta.trim()
  if (!nombre) return mostrarToast('Ingresá el nombre del concepto', 'danger')
  const repetido = conceptos.value.some(c => Number(c.id) !== Number(formRenombrar.id) && normalizarTexto(c.etiqueta) === normalizarTexto(nombre))
  if (repetido) return mostrarToast(`Ya existe un concepto llamado "${nombre}"`, 'danger')

  procesando.value = true
  try {
    const res = await api.post({
      entity: 'tesoreria',
      action: 'editarConcepto',
      payload: { id: formRenombrar.id, etiqueta: nombre }
    })
    if (res.ok && res.payload?.success !== false) {
      mostrarModalRenombrar.value = false
      await cargarConceptos()
      mostrarToast('El concepto se renombró correctamente')
    } else {
      mostrarToast(res.message || 'No se pudo renombrar el concepto', 'danger')
    }
  } catch {
    mostrarToast('Error al conectar con el servidor', 'danger')
  } finally {
    procesando.value = false
  }
}

const mostrarModalSub = ref(false)
const formSub = reactive({ idPadre: null, etiqueta: '', cierraValor: false, subconceptos: [] })

const abrirModalSub = (f) => {
  formSub.idPadre = f.idConcepto
  formSub.etiqueta = f.etiqueta
  formSub.cierraValor = !f.esGrupo && f.estado === 'definido'
  formSub.subconceptos = [subVacio()]
  mostrarModalSub.value = true
}

const confirmarAgregarSub = () => {
  const subs = formSub.subconceptos.map(x => x.etiqueta.trim())
  if (subs.some(x => !x)) return mostrarToast('Completá el nombre de todos los subconceptos', 'danger')
  const normalizados = subs.map(normalizarTexto)
  if (new Set(normalizados).size !== normalizados.length) return mostrarToast('Hay subconceptos con el mismo nombre', 'danger')
  const existentes = conceptos.value.map(c => normalizarTexto(c.etiqueta))
  const repetido = subs.find(n => existentes.includes(normalizarTexto(n)))
  if (repetido) return mostrarToast(`Ya existe un concepto llamado "${repetido}"`, 'danger')

  notificar({
    titulo: '¿Agregar subconceptos?',
    mensaje: `Se agregarán a "${formSub.etiqueta}": ${subs.join(', ')}.`,
    tipo: 'success',
    alConfirmar: guardarSubconceptos
  })
}

const guardarSubconceptos = async () => {
  procesando.value = true
  try {
    const res = await api.post({
      entity: 'tesoreria',
      action: 'agregarSubconceptos',
      payload: { idPadre: formSub.idPadre, subconceptos: formSub.subconceptos.map(x => x.etiqueta.trim()) }
    })
    if (!res.ok || res.payload?.success === false || !Array.isArray(res.payload?.subconceptos)) {
      mostrarToast(res.message || 'No se pudieron agregar los subconceptos', 'danger')
      return
    }

    const claves = res.payload.subconceptos
    const aGuardar = []
    formSub.subconceptos.forEach((sub, i) => {
      if (tieneValor(sub.valor) && claves[i]?.clave) aGuardar.push({ clave: claves[i].clave, valor: sub.valor })
    })
    const resultados = await Promise.all(aGuardar.map(v => api.post({
      entity: 'tesoreria',
      action: 'actualizarValor',
      payload: { concepto: v.clave, id_categoria: null, valor: v.valor, exento: 0 }
    }).catch(() => ({ ok: false }))))
    const fallaron = resultados.filter(r => !(r.ok && r.payload !== false)).length

    mostrarModalSub.value = false
    await Promise.all([cargarConceptos(), cargarValores()])
    if (fallaron) mostrarToast(`Los subconceptos se agregaron, pero no se pudieron guardar ${fallaron} valor(es). Cargalos con Editar.`, 'danger')
    else mostrarToast('Los subconceptos se agregaron correctamente')
  } catch {
    mostrarToast('Error al conectar con el servidor', 'danger')
  } finally {
    procesando.value = false
  }
}

const confirmarEliminarConcepto = (f) => {
  const cantHijos = f.esGrupo ? f.hijos.length : 0
  notificar({
    titulo: '¿Eliminar concepto?',
    mensaje: cantHijos
      ? `Se eliminará "${f.etiqueta}" junto con sus ${cantHijos} subconcepto${cantHijos > 1 ? 's' : ''}. Sus valores vigentes quedarán cerrados.`
      : `Se eliminará "${f.etiqueta}". Su valor vigente quedará cerrado.`,
    tipo: 'danger',
    alConfirmar: () => eliminarConcepto(f)
  })
}

const eliminarConcepto = async (f) => {
  procesando.value = true
  try {
    const res = await api.post({
      entity: 'tesoreria',
      action: 'eliminarConcepto',
      payload: { id: f.idConcepto }
    })
    if (res.ok && res.payload?.success !== false) {
      await Promise.all([cargarConceptos(), cargarValores()])
      mostrarToast('El concepto se eliminó correctamente')
    } else {
      mostrarToast(res.message || 'No se pudo eliminar el concepto', 'danger')
    }
  } catch {
    mostrarToast('Error al conectar con el servidor', 'danger')
  } finally {
    procesando.value = false
  }
}

// ====================================================
//  MODAL HISTORIAL
// ====================================================
const mostrarModalHistorial = ref(false)
const historial = ref([])
const historialEtiqueta = ref('')

const abrirModalHistorial = async (concepto, idCategoria, etiqueta) => {
  historialEtiqueta.value = etiqueta
  mostrarModalHistorial.value = true
  cargandoHistorial.value = true
  historial.value = []
  try {
    const res = await api.get({
      entity: 'tesoreria',
      action: 'obtenerHistorialValores',
      payload: { concepto, id_categoria: idCategoria }
    })
    if (res.ok) historial.value = Array.isArray(res.payload) ? res.payload : []
  } catch (err) {
    console.error('Error al cargar historial:', err)
    mostrarToast('No se pudo cargar el historial', 'danger')
  } finally {
    cargandoHistorial.value = false
  }
}

// ====================================================
//  PAGINACIÓN
// ====================================================
const cambiarPagina = (delta) => {
  paginaActual.value += delta
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, 50)
}

// ====================================================
//  INIT
// ====================================================
onMounted(cargarTodo)
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

.animate__animated { animation-duration: 0.5s; }

/* ====================================================
   UTILIDADES
   ==================================================== */
.btn-danger-subtle {
  background: #fee2e2;
  color: #dc3545;
  border: 1px solid transparent;
}
.btn-danger-subtle:hover {
  background: #fecaca;
}

/* ====================================================
   TABLA SIN LÍNEAS
   ==================================================== */
.tabla-sin-lineas th,
.tabla-sin-lineas td {
  border-left: none !important;
  border-right: none !important;
}

/* ====================================================
   FILAS DE GRUPO
   ==================================================== */
.fila-grupo td {
  background-color: #f8f9fb;
}
.fila-hijo td:first-child {
  border-left: 3px solid #f5c2cb !important;
}

/* ====================================================
   PÍLDORAS DE ESTADO
   ==================================================== */
.estado-pill {
  border-radius: 999px;
  padding: 0.35em 0.85em;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  border: 1px solid transparent;
}

/* VIGENTE — rojo/rosa */
.estado-vigente {
  background-color: #fde7ea;
  color: #c0304a;
  border-color: #f5c2cb;
}

/* DEFINIDO / FINALIZADO — verde */
.estado-cumplida {
  background-color: #e3f5e6;
  color: #2f8a45;
  border-color: #bfe6c8;
}

/* SIN DEFINIR — amarillo */
.estado-creado {
  background-color: #fdf3d3;
  color: #a6841f;
  border-color: #f2e2a5;
}

/* EXENTA — gris azulado */
.estado-borrado {
  background-color: #eef1f5;
  color: #5b6b7f;
  border-color: #d4dbe4;
}

.estado-default {
  background-color: #f1f3f5;
  color: #495057;
  border-color: #dee2e6;
}
</style>
