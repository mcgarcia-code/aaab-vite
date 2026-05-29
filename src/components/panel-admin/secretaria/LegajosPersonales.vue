<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-people-fill me-1"></i> Gestión de Árbitros
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ totalFiltrados }} árbitros</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Filtros (Solo Móvil) -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <!-- Botón Solicitudes -->
            <button @click="abrirModalSolicitudes" class="btn btn-primary position-relative shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons fs-6">notifications</span>
              <span class="fw-bold d-none d-md-inline small">Solicitudes</span>
              <span v-if="solicitudesPendientes.length > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style="font-size: 0.65rem;">
                {{ solicitudesPendientes.length }}
              </span>
            </button>

            <!-- Botón Edición Global -->
            <button @click="toggleEdicionGlobal" class="btn shadow-sm py-2 d-flex align-items-center gap-2 text-white" :class="edicionAbierta ? 'btn-danger' : 'btn-success'" :title="edicionAbierta ? 'Bloquear Edición' : 'Permitir Edición'">
              <span class="material-icons fs-6">{{ edicionAbierta ? 'lock_open' : 'lock' }}</span>
              <span class="fw-bold d-none d-md-inline small">{{ edicionAbierta ? 'Cerrar Edición' : 'Abrir Edición' }}</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="crearNuevo" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">person_add</span>
              <span class="fw-bold d-none d-md-inline small">Nuevo</span>
            </button>

            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS (Solo Móvil) -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Árbitros</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6">
              <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido...">
            </div>
            <div class="col-6">
              <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Nombre...">
            </div>
            <div class="col-6">
              <input v-model="filtros.dni" class="form-control form-control-sm shadow-none" placeholder="DNI...">
            </div>
            <div class="col-6">
              <select v-model="filtros.rol" class="form-select form-select-sm shadow-none">
                <option value="">Rol (Todos)</option>
                <option :value="1">Árbitro</option>
                <option :value="2">Observador</option>
                <option :value="4">Coordinador</option>
              </select>
            </div>
            <div class="col-12 mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- TABLA (Solo Escritorio) -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
              <thead class="table-light">
                <!-- Títulos -->
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones">Acciones</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                  <th class="py-3 text-center text-uppercase text-muted">Activo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Rol</th>
                  <th class="py-3 text-center text-uppercase text-muted">Apto</th>
                  <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Subg.</th>
                  <th class="py-3 text-center text-uppercase text-muted">DNI</th>
                  <th class="py-3 text-uppercase text-muted">Email</th>
                  <th class="py-3 text-uppercase text-muted">Dirección</th>
                  <th class="py-3 text-uppercase text-muted">Provincia</th>
                  <th class="py-3 text-uppercase text-muted">Localidad</th>
                  <th class="py-3 text-uppercase text-muted">Zona</th>
                  <th class="py-3 text-uppercase text-muted">Celular</th>
                  <th class="py-3 text-uppercase text-muted">F. Nacimiento</th>
                  <th class="py-3 text-uppercase text-muted">Tel. Contacto</th>
                  <th class="py-3 text-uppercase text-muted">Parentesco</th>
                  <th class="py-3 text-uppercase text-muted">Movilidad</th>
                  <th class="py-3 text-center text-uppercase text-muted">Sáb. Disp</th>
                  <th class="py-3 text-uppercase text-muted">Sáb. Desde</th>
                  <th class="py-3 text-uppercase text-muted">Sáb. Hasta</th>
                  <th class="py-3 text-center text-uppercase text-muted">Dom. Disp</th>
                  <th class="py-3 text-uppercase text-muted">Dom. Desde</th>
                  <th class="py-3 text-uppercase text-muted">Dom. Hasta</th>
                  <th class="py-3 text-center text-uppercase text-muted">Juega</th>
                  <th class="py-3 text-uppercase text-muted">Club</th>
                  <th class="py-3 text-uppercase text-muted">Cat. Juega</th>
                  <th class="py-3 text-uppercase text-muted">Observaciones</th>
                </tr>
                <!-- Filtros Desktop -->
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="obtenerArbitros" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1"><i class="bi bi-arrow-clockwise"></i></button>
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-acciones"></td>
                  <td class="p-2 border-bottom border-2 col-fija col-apellido"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
                  <td class="p-2 border-bottom border-2 col-fija col-nombre"><input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Filtrar.."></td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.es_activo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option><option value="NO">No</option><option value="SI">Sí</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.rol" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option><option :value="0">Ninguno</option><option :value="1">Árbitro</option><option :value="2">Observador</option><option :value="4">Coordinador</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.apto_medico" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option><option value="SI">Sí</option><option value="NO">No</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.grupo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option><option value="LH">LH</option><option value="Pre Liga">Pre Liga</option><option value="SR">SR</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2">
                    <select v-model="filtros.subgrupo" class="form-select form-select-sm shadow-none">
                      <option value="">Todos</option><option value="A">A</option><option value="B">B</option><option value="C">C</option>
                    </select>
                  </td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.dni" class="form-control form-control-sm shadow-none text-center"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.email" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.direccion" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><selProvincia v-model="filtros.provincia" :provincias="provincias" class="form-select form-select-sm shadow-none" /></td>
                  <td class="p-2 border-bottom border-2"><selLocalidad v-model="filtros.localidad" :localidades="localidadesFiltradas" class="form-select form-select-sm shadow-none" /></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.zona" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.celular" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.fecha_nacimiento" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.telefonocontacto" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.parentescocontacto" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.movilidad" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.disponibilidad_sabado" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.disponibilidad_sabado_desde" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.disponibilidad_sabado_hasta" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.disponibilidad_domingo" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.disponibilidad_domingo_desde" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.disponibilidad_domingo_hasta" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.juega_handball" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.donde_juega" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.categoria_handball" class="form-control form-control-sm shadow-none"></td>
                  <td class="p-2 border-bottom border-2"><input v-model="filtros.observaciones" class="form-control form-control-sm shadow-none"></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in arbitrosPaginados" :key="a.id" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">
                  <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ a.id }}</td>
                  <td class="text-center col-fija col-acciones">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="editarArbitro(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar árbitro">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verHistorialArbitro(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver historial de cambios">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                    </div>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                  <td class="text-center">
                    <div class="d-flex align-items-center justify-content-center gap-1">
                      <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'"></span>
                      <span class="small text-dark fw-bold">{{ a.es_activo == 1 ? 'SI' : 'NO' }}</span>
                    </div>
                  </td>
                  <td class="text-center text-dark fw-bold">{{ obtenerNombreRol(a.rol) }}</td>
                  <td class="text-center">
                    <div class="d-flex align-items-center justify-content-center gap-1">
                      <span class="status-dot" :class="a.apto_medico == 1 ? 'bg-success' : 'bg-danger'"></span>
                      <span class="small text-dark fw-bold">{{ a.apto_medico == 1 ? 'SI' : 'NO' }}</span>
                    </div>
                  </td>
                  <td class="text-center text-dark">{{ a.grupo }}</td>
                  <td class="text-center text-dark">{{ a.subgrupo }}</td>
                  <td class="text-center text-dark">{{ a.dni }}</td>
                  <td class="text-dark">{{ a.email }}</td>
                  <td class="text-dark">{{ a.direccion }}</td>
                  <td class="text-dark">{{ a.nombre_provincia }}</td>
                  <td class="text-dark">{{ a.nombre_localidad }}</td>
                  <td class="text-dark">{{ a.zona }}</td>
                  <td class="text-dark">{{ a.celular }}</td>
                  <td class="text-dark">{{ a.fecha_nacimiento ? mostrarFechaArg(a.fecha_nacimiento) : '' }}</td>
                  <td class="text-dark">{{ a.telefonocontacto }}</td>
                  <td class="text-dark">{{ a.parentescocontacto }}</td>
                  <td class="text-dark">{{ a.movilidad }}</td>
                  <td class="text-center text-dark">{{ a.disponibilidad_sabado }}</td>
                  <td class="text-dark">{{ a.disponibilidad_sabado_desde }}</td>
                  <td class="text-dark">{{ a.disponibilidad_sabado_hasta }}</td>
                  <td class="text-center text-dark">{{ a.disponibilidad_domingo }}</td>
                  <td class="text-dark">{{ a.disponibilidad_domingo_desde }}</td>
                  <td class="text-dark">{{ a.disponibilidad_domingo_hasta }}</td>
                  <td class="text-center text-dark">{{ a.juega_handball }}</td>
                  <td class="text-dark">{{ a.donde_juega }}</td>
                  <td class="text-dark">{{ a.categoria_handball }}</td>
                  <td class="text-dark">
                      <span
                        class="d-inline-block text-truncate"
                        style="max-width: 180px; cursor: help;"
                        :title="a.observaciones"
                      >
                        {{ a.observaciones }}
                      </span>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS (Solo Celular) -->
          <div class="d-md-none p-3 bg-light">
            <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card shadow-sm mb-3 border-light-subtle rounded-3" :class="{ 'bg-danger-subtle': a.es_activo == 0 }">

              <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                <div class="text-dark fw-bold text-uppercase d-flex align-items-center gap-2" style="font-size: 1.05rem;">
                  <span class="status-dot" :class="a.es_activo == 1 ? 'bg-success' : 'bg-danger'"></span>
                  {{ a.apellido }}, {{ a.nombre }}
                </div>
                <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="d-flex justify-content-between text-dark mb-2 border-bottom border-secondary-subtle pb-2">
                  <span class="small"><strong>Rol:</strong> {{ obtenerNombreRol(a.rol) }}</span>
                  <span class="small"><strong>Grupo:</strong> {{ a.grupo || '-' }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></span>
                </div>

                <div class="bg-light p-2 rounded border small mb-3 border-light-subtle">
                  <p class="m-0 text-dark"><strong>Apto:</strong> <span :class="a.apto_medico ? 'text-success fw-bold' : 'text-danger fw-bold'">{{ a.apto_medico ? 'SÍ' : 'NO' }}</span></p>
                  <p v-if="a.celular" class="m-0 text-dark mt-1"><strong>Celular:</strong> {{ a.celular }}</p>
                  <p v-if="a.email" class="m-0 text-dark mt-1 text-truncate"><strong>Email:</strong> {{ a.email }}</p>
                  <p v-if="a.zona" class="m-0 text-dark mt-1"><strong>Zona:</strong> {{ a.zona }}</p>
                </div>

                <div class="d-flex gap-2">
                  <button @click="editarArbitro(a)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                    <span class="material-icons" style="font-size: 16px;">edit</span> EDITAR
                  </button>
                  <button @click="verHistorialArbitro(a)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center">
                    <span class="material-icons" style="font-size: 18px;">manage_search</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="arbitrosPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
              <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
              <p class="text-muted m-0 fw-bold">No se encontraron registros.</p>
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

    <!-- 1. Modal Excel -->
    <ModalBase :show="mostrarModalExcel" @close="mostrarModalExcel = false" icono="description" colorIcono="bg-success-subtle text-success" maxWidth="750px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Exportar Listado</span>
          <div class="text-muted small mt-1">Marcá las columnas que querés incluir en el Excel</div>
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

    <!-- 2. Modal Alta / Edición -->
    <ModalBase :show="mostrarModal" @close="cerrarModal" :icono="modoModal === 'editar' ? 'edit' : 'person_add'" :colorIcono="modoModal === 'editar' ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'" maxWidth="900px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">{{ modoModal === 'editar' ? `Editar árbitro` : 'Registrar Nuevo Árbitro' }}</span>
          <div v-if="modoModal === 'editar'" class="text-muted small">ID #{{ formModal.id }} — {{ formModal.apellido }}, {{ formModal.nombre }}</div>
        </div>
      </template>

      <div v-if="mensajeSolicitudActiva" class="alert alert-warning border-warning-subtle text-start shadow-sm d-flex align-items-start gap-3 p-3 mb-4 rounded-3" style="background-color: #fffbeb;">
        <span class="material-icons text-warning mt-1">assignment_late</span>
        <div class="w-100">
          <strong class="d-block text-dark mb-1 text-uppercase small">Solicitud del árbitro:</strong>
          <div class="text-dark text-break small" style="white-space: pre-line; line-height: 1.5; text-align: justify;">{{ mensajeSolicitudActiva }}</div>
        </div>
      </div>

      <form id="formArbitro" @submit.prevent="modoModal === 'editar' ? confirmarEdicion() : confirmarAlta()" class="text-start">
        <div class="row g-3 pb-3">

          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-0">Datos básicos</div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Apellido *</label><input v-model="formModal.apellido" class="form-control shadow-none border-secondary-subtle" required></div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Nombre *</label><input v-model="formModal.nombre" class="form-control shadow-none border-secondary-subtle" required></div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">DNI</label><input v-model="formModal.dni" class="form-control shadow-none border-secondary-subtle"></div>
          <div class="col-md-6"><label class="small fw-bold text-dark mb-1">Email (Usuario) *</label><input v-model="formModal.email" type="email" class="form-control shadow-none border-secondary-subtle" required></div>
          <div class="col-md-6">
            <label class="small fw-bold text-dark mb-1">{{ modoModal === 'nuevo' ? 'Password *' : 'Password (vacío no cambia)' }}</label>
            <input v-model="formModal.password" type="text" class="form-control shadow-none border-secondary-subtle" :placeholder="modoModal === 'editar' ? '••••••••' : ''" :required="modoModal === 'nuevo'">
          </div>

          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-4">Clasificación</div>
          <div class="col-md-3">
            <label class="small fw-bold text-dark mb-1">Rol</label>
            <select v-model="formModal.rol" class="form-select shadow-none border-secondary-subtle">
              <option :value="1">Árbitro</option><option :value="2">Observador</option><option :value="4">Coordinador</option><option :value="0">Ninguno</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="small fw-bold text-dark mb-1">Estado</label>
            <select v-model="formModal.es_activo" class="form-select shadow-none border-secondary-subtle">
              <option :value="1">Activo</option><option :value="0">Inactivo</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="small fw-bold text-dark mb-1">Grupo</label>
            <select v-model="formModal.grupo" class="form-select shadow-none border-secondary-subtle">
              <option value="LH">LH</option><option value="Pre Liga">Pre Liga</option><option value="SR">SR</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
            </select>
          </div>
          <div class="col-md-2" v-if="formModal.grupo == '3'">
            <label class="small fw-bold text-dark mb-1">Subgrupo</label>
            <select v-model="formModal.subgrupo" class="form-select shadow-none border-secondary-subtle">
              <option value="A">A</option><option value="B">B</option><option value="C">C</option>
            </select>
          </div>
          <div class="col-md-2" v-else></div>
          <div class="col-md-2">
            <label class="small fw-bold text-dark mb-1">Apto Médico</label>
            <select v-model="formModal.apto_medico" class="form-select shadow-none border-secondary-subtle">
              <option :value="true">SI</option><option :value="false">NO</option>
            </select>
          </div>
          <!-- Coordinador de grupo -->
          <div class="col-12" v-if="formModal.rol == 4">
            <label class="small fw-bold text-dark mb-1">¿Qué grupo coordina?</label>
            <div class="bg-light p-2 rounded border shadow-sm d-flex flex-wrap align-items-center gap-3 border-light-subtle">
              <div class="form-check m-0">
                <input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" v-model="formModal.lh" id="grpLH">
                <label class="form-check-label small fw-bold mt-1" for="grpLH">LH</label>
              </div>
              <div class="form-check m-0">
                <input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" v-model="formModal.sr" id="grpSR">
                <label class="form-check-label small fw-bold mt-1" for="grpSR">SR</label>
              </div>
              <div class="form-check m-0">
                <input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" v-model="formModal.preLiga" id="grpPreLiga">
                <label class="form-check-label small fw-bold mt-1" for="grpPreLiga">Pre Liga</label>
              </div>
              <div class="form-check m-0">
                <input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" v-model="formModal.uno" id="grpUno">
                <label class="form-check-label small fw-bold mt-1" for="grpUno">1</label>
              </div>
              <div class="form-check m-0">
                <input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" v-model="formModal.dos" id="grpDos">
                <label class="form-check-label small fw-bold mt-1" for="grpDos">2</label>
              </div>
              <div class="form-check m-0">
                <input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" v-model="formModal.tresA" id="grpTresA">
                <label class="form-check-label small fw-bold mt-1" for="grpTresA">3A</label>
              </div>
              <div class="form-check m-0">
                <input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" v-model="formModal.tresB" id="grpTresB">
                <label class="form-check-label small fw-bold mt-1" for="grpTresB">3B</label>
              </div>
              <div class="form-check m-0">
                <input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" v-model="formModal.tresC" id="grpTresC">
                <label class="form-check-label small fw-bold mt-1" for="grpTresC">3C</label>
              </div>
              <div class="form-check m-0">
                <input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" v-model="formModal.cuatro" id="grpCuatro">
                <label class="form-check-label small fw-bold mt-1" for="grpCuatro">4</label>
              </div>
            </div>
          </div>

          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-4">Ubicación</div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Provincia</label><selProvincia v-model="formModal.provincia" :provincias="provincias" class="form-select shadow-none border-secondary-subtle" /></div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Localidad</label><selLocalidad v-model="formModal.localidad" :localidades="localidades.filter(l => l.provincia_id == formModal.provincia)" class="form-select shadow-none border-secondary-subtle" /></div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Zona</label><input v-model="formModal.zona" class="form-control shadow-none border-secondary-subtle"></div>
          <div class="col-12"><label class="small fw-bold text-dark mb-1">Dirección</label><input v-model="formModal.direccion" class="form-control shadow-none border-secondary-subtle"></div>

          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-4">Contacto y Movilidad</div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Celular</label><input v-model="formModal.celular" class="form-control shadow-none border-secondary-subtle"></div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Tel. Contacto</label><input v-model="formModal.telefonocontacto" class="form-control shadow-none border-secondary-subtle"></div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Parentesco</label><input v-model="formModal.parentescocontacto" class="form-control shadow-none border-secondary-subtle"></div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">F. Nacimiento</label><input type="date" v-model="formModal.fecha_nacimiento" class="form-control shadow-none border-secondary-subtle"></div>
          <div class="col-md-8">
            <label class="small fw-bold text-dark mb-1">Movilidad</label>
            <div class="bg-light p-2 rounded border shadow-sm d-flex flex-wrap align-items-center gap-3 border-light-subtle">
              <div class="form-check m-0"><input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" value="moto" v-model="movilidadArray" id="movMoto"><label class="form-check-label small fw-bold mt-1" for="movMoto">Moto</label></div>
              <div class="form-check m-0"><input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" value="transporte publico" v-model="movilidadArray" id="movTrans"><label class="form-check-label small fw-bold mt-1" for="movTrans">Transporte</label></div>
              <div class="form-check m-0"><input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" value="auto" v-model="movilidadArray" id="movAuto"><label class="form-check-label small fw-bold mt-1" for="movAuto">Auto</label></div>
              <div class="form-check m-0"><input class="form-check-input shadow-none border-secondary-subtle" type="checkbox" value="bici" v-model="movilidadArray" id="movBici"><label class="form-check-label small fw-bold mt-1" for="movBici">Bici</label></div>
            </div>
          </div>

          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-4">Disponibilidad</div>
          <div class="col-md-2">
            <label class="small fw-bold text-dark mb-1">Sáb. Disp.</label>
            <select v-model="formModal.disponibilidad_sabado" class="form-select shadow-none border-secondary-subtle">
              <option value="FT">FT</option><option value="NO">NO</option><option value="OTROS">OTROS</option>
            </select>
          </div>
          <div class="col-md-2"><label class="small fw-bold text-dark mb-1">Sáb. Desde</label><input type="time" v-model="formModal.disponibilidad_sabado_desde" class="form-control shadow-none border-secondary-subtle"></div>
          <div class="col-md-2"><label class="small fw-bold text-dark mb-1">Sáb. Hasta</label><input type="time" v-model="formModal.disponibilidad_sabado_hasta" class="form-control shadow-none border-secondary-subtle"></div>
          <div class="col-md-2">
            <label class="small fw-bold text-dark mb-1">Dom. Disp.</label>
            <select v-model="formModal.disponibilidad_domingo" class="form-select shadow-none border-secondary-subtle">
              <option value="FT">FT</option><option value="NO">NO</option><option value="OTROS">OTROS</option>
            </select>
          </div>
          <div class="col-md-2"><label class="small fw-bold text-dark mb-1">Dom. Desde</label><input type="time" v-model="formModal.disponibilidad_domingo_desde" class="form-control shadow-none border-secondary-subtle"></div>
          <div class="col-md-2"><label class="small fw-bold text-dark mb-1">Dom. Hasta</label><input type="time" v-model="formModal.disponibilidad_domingo_hasta" class="form-control shadow-none border-secondary-subtle"></div>

          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-4">Handball</div>
          <div class="col-md-4">
            <label class="small fw-bold text-dark mb-1">Juega handball</label>
            <select v-model="formModal.juega_handball" class="form-select shadow-none border-secondary-subtle">
              <option value="SI">SI</option><option value="NO">NO</option>
            </select>
          </div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Club</label><input v-model="formModal.donde_juega" class="form-control shadow-none border-secondary-subtle" :disabled="formModal.juega_handball !== 'SI'"></div>
          <div class="col-md-4"><label class="small fw-bold text-dark mb-1">Categoría</label><input v-model="formModal.categoria_handball" class="form-control shadow-none border-secondary-subtle" :disabled="formModal.juega_handball !== 'SI'"></div>

          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-4">Observaciones</div>
          <div class="col-12">
            <textarea v-model="formModal.observaciones" class="form-control shadow-none border-secondary-subtle" rows="3"></textarea>
          </div>

        </div>
      </form>

      <template #footer>
        <button @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0">CANCELAR</button>
        <button type="submit" form="formArbitro" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
          {{ modoModal === 'editar' ? 'GUARDAR CAMBIOS' : 'CREAR ÁRBITRO' }}
        </button>
      </template>
    </ModalBase>

    <!-- 3. Modal Solicitudes de Cambios -->
    <ModalBase :show="mostrarModalSolicitudes" @close="mostrarModalSolicitudes = false" icono="history" colorIcono="bg-primary-subtle text-primary" maxWidth="800px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Solicitudes de Cambios</span>
        </div>
      </template>

      <div class="d-flex flex-wrap flex-sm-nowrap justify-content-between gap-2 w-100 bg-light p-2 rounded-3 border border-light-subtle mb-4">
        <button class="btn fw-bold rounded px-2 py-1 flex-fill d-flex align-items-center justify-content-center gap-1"
                :class="tabActivo === 'enviado' ? 'btn-primary shadow-sm text-white' : 'btn-transparent text-muted'" style="font-size: 0.8rem;" @click="tabActivo = 'enviado'">
          PENDIENTES
          <span v-if="solicitudesPendientes.length > 0" class="badge bg-white text-primary rounded-pill p-1 d-flex align-items-center justify-content-center" style="font-size: 0.7rem; min-width: 20px;">
            {{ solicitudesPendientes.length }}
          </span>
        </button>
        <button class="btn fw-bold rounded px-2 py-1 flex-fill"
                :class="tabActivo === 'aprobado' ? 'btn-success shadow-sm text-white' : 'btn-transparent text-muted'" style="font-size: 0.8rem;" @click="tabActivo = 'aprobado'">
          APROBADAS
        </button>
        <button class="btn fw-bold rounded px-2 py-1 flex-fill"
                :class="tabActivo === 'rechazado' ? 'btn-danger shadow-sm text-white' : 'btn-transparent text-muted'" style="font-size: 0.8rem;" @click="tabActivo = 'rechazado'">
          RECHAZADAS
        </button>
      </div>

      <div v-if="cargandoSolicitudes" class="text-center py-5">
        <span class="spinner-border text-primary"></span>
        <p class="text-muted mt-2 small fw-bold">Cargando solicitudes...</p>
      </div>

      <div v-else-if="solicitudesMostradas.length === 0" class="text-center py-5 text-muted bg-white rounded shadow-sm border border-light-subtle">
        <span class="material-icons mb-2 d-block mx-auto" style="font-size: 48px; color: #cbd5e1;">
          {{ tabActivo === 'enviado' ? 'inbox' : (tabActivo === 'aprobado' ? 'check_circle_outline' : 'highlight_off') }}
        </span>
        <p class="mb-0 fw-bold">No hay solicitudes {{ tabActivo === 'enviado' ? 'pendientes' : tabActivo + 's' }}.</p>
      </div>

      <div v-else v-for="sol in solicitudesMostradas" :key="sol.id"
           class="shadow-sm mb-3 bg-white p-3 rounded-3 border"
           :class="{'border-success-subtle': sol.estado === 'aprobado', 'border-danger-subtle': sol.estado === 'rechazado'}">

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div style="flex: 1 1 0%; min-width: 0;">
            <div class="text-xs fw-bold text-muted mb-1">{{ sol.fecha }}</div>
            <strong class="d-block text-dark mb-1 fs-6 text-uppercase">{{ sol.arbitro_nombre }}</strong>
            <p class="m-0 small text-secondary bg-light p-2 rounded border border-light-subtle" style="white-space: pre-line; line-height: 1.4; text-align: justify; word-break: break-word;">
              {{ sol.mensaje }}
            </p>
          </div>

          <div class="d-flex flex-column align-items-start align-items-md-end gap-2" style="flex: 0 0 auto;">
            <span class="badge align-self-start align-self-md-end"
                  :class="sol.estado === 'aprobado' ? 'bg-success' : (sol.estado === 'rechazado' ? 'bg-danger' : 'bg-warning text-dark')">
              {{ sol.estado ? sol.estado.toUpperCase() : 'ENVIADO' }}
            </span>

            <div class="d-flex flex-wrap flex-md-nowrap gap-2 mt-2 w-100 justify-content-start justify-content-md-end" v-if="sol.estado === 'enviado'">
              <button @click="abrirEdicionDesdeSolicitud(sol)" class="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center gap-1 fw-bold flex-fill" title="Abrir legajo para editar">
                <span class="material-icons" style="font-size: 16px;">edit</span> LEGAJO
              </button>
              <button @click="rechazarSolicitud(sol)" class="btn btn-sm btn-danger fw-bold flex-fill">RECHAZAR</button>
              <button @click="aprobarSolicitud(sol)" class="btn btn-sm btn-success fw-bold flex-fill">APROBAR</button>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>

    <!-- 4. Modal Historial Árbitro -->
    <ModalBase :show="mostrarModalHistorialArbitro" @close="mostrarModalHistorialArbitro = false" icono="manage_search" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="850px">
      <template #header>
        <div class="text-center">
          <div class="fw-bold fs-5">Historial de {{ arbitroSeleccionado.apellido }}, {{ arbitroSeleccionado.nombre }}</div>
          <span v-if="!cargandoHistorialArbitro" class="badge bg-dark rounded-pill fs-6 mt-1" title="Total de solicitudes">{{ historialArbitro.length }}</span>
        </div>
      </template>

      <div v-if="cargandoHistorialArbitro" class="text-center py-5">
        <span class="spinner-border text-warning"></span>
        <p class="text-muted mt-2 small fw-bold">Cargando historial...</p>
      </div>

      <div v-else-if="historialArbitro.length === 0" class="text-center py-5 text-muted bg-white rounded shadow-sm border border-light-subtle">
        <span class="material-icons d-block fs-1 mb-2 mx-auto" style="font-size: 48px; color: #cbd5e1;">history_toggle_off</span>
        <p class="mb-0 fw-bold">Este árbitro nunca solicitó cambios.</p>
      </div>

      <div v-else>
        <!-- Tabla (Escritorio) -->
        <div class="table-responsive d-none d-md-block bg-white rounded shadow-sm border border-light-subtle">
          <table class="table table-sm table-hover align-middle m-0" style="font-size: 0.75rem; table-layout: fixed; width: 100%;">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 fw-bold text-uppercase text-muted" style="width: 120px; font-size: 0.75rem;">Fecha</th>
                <th class="py-2 fw-bold text-uppercase text-muted" style="width: 140px; font-size: 0.75rem;">Tipo</th>
                <th class="py-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Mensaje</th>
                <th class="text-center py-2 pe-3 fw-bold text-uppercase text-muted" style="width: 100px; font-size: 0.75rem;">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historialArbitro" :key="h.id">
                <td class="text-muted fw-bold ps-3 py-3">{{ h.fecha }}</td>
                <td class="text-uppercase text-dark py-3" style="font-size: 0.75rem;">{{ h.tipo_solicitud || 'general' }}</td>
                <td class="text-dark py-3" style="white-space: pre-wrap; word-wrap: break-word;">{{ h.mensaje }}</td>
                <td class="text-center pe-3 py-3">
                  <span class="badge" :class="h.estado === 'aprobado' ? 'bg-success' : (h.estado === 'rechazado' ? 'bg-danger' : 'bg-warning text-dark')">
                    {{ h.estado ? h.estado.toUpperCase() : 'ENVIADO' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tarjetas (Móvil) -->
        <div class="d-md-none d-flex flex-column gap-2">
          <div v-for="h in historialArbitro" :key="'mob-hist-'+h.id" class="border border-light-subtle rounded p-3 shadow-sm bg-white">
            <div class="d-flex justify-content-between align-items-start mb-2 border-bottom border-secondary-subtle pb-2">
              <div>
                <span class="d-block fw-bold text-dark" style="font-size: 0.75rem;">{{ h.fecha }}</span>
                <span class="text-uppercase text-muted fw-bold" style="font-size: 0.75rem;">TIPO: {{ h.tipo_solicitud || 'GENERAL' }}</span>
              </div>
              <span class="badge" :class="h.estado === 'aprobado' ? 'bg-success' : (h.estado === 'rechazado' ? 'bg-danger' : 'bg-warning text-dark')">
                {{ h.estado ? h.estado.toUpperCase() : 'ENVIADO' }}
              </span>
            </div>
            <div class="text-dark mt-2 bg-light p-2 rounded border border-light-subtle" style="font-size: 0.85rem; white-space: pre-wrap; word-wrap: break-word;">
              {{ h.mensaje }}
            </div>
          </div>
        </div>
      </div>
    </ModalBase>

  </div>
</template>


<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'
import selLocalidad from '@/components/select/selLocalidad.vue'
import selProvincia from '@/components/select/selProvincia.vue'
import ModalBase from '@/components/ModalBase.vue'

useHead({
  title: 'Legajos | AAAB',
  meta: [{ name: 'description', content: 'Gestión de árbitros registrados en la AAAB.' }],
})

const notificar = inject('notificar', (msg) => alert(msg.mensaje || msg))

const arbitros = ref([])

const filtros = reactive({
  rol: '',
  es_activo: '',
  grupo: '',
  apto_medico: '',
  subgrupo: '',
})

const cargando = ref(false)
const provincias = ref([])
const localidades = ref([])
const paginaActual = ref(1)
const registrosPorPagina = 8

const mostrarModal = ref(false)
const modoModal = ref('nuevo')
const movilidadArray = ref([])

const mensajeSolicitudActiva = ref('')

const mostrarFiltrosMobile = ref(false)

const solicitudes = ref([])
const mostrarModalSolicitudes = ref(false)
const cargandoSolicitudes = ref(false)

const tabActivo = ref('enviado')

const mostrarModalHistorialArbitro = ref(false)
const historialArbitro = ref([])
const arbitroSeleccionado = ref({})
const cargandoHistorialArbitro = ref(false)

const edicionAbierta = ref(false);

const formModalVacio = () => ({
  id: null,
  apellido: '', nombre: '', dni: '', email: '', password: '',
  rol: 1, es_activo: 1, apto_medico: false,
  provincia: '', localidad: '', zona: '', direccion: '',
  grupo: '', subgrupo: '', celular: '',
  telefonocontacto: '', parentescocontacto: '',
  fecha_nacimiento: '', movilidad: '',
  disponibilidad_sabado: 'FT', disponibilidad_sabado_desde: '', disponibilidad_sabado_hasta: '',
  disponibilidad_domingo: 'FT', disponibilidad_domingo_desde: '', disponibilidad_domingo_hasta: '',
  juega_handball: 'NO', donde_juega: '', categoria_handball: '',
  observaciones: '',
  lh: false, sr: false, preLiga: false,
  uno: false, dos: false,
  tresA: false, tresB: false, tresC: false,
  cuatro: false,
})

const formModal = ref(formModalVacio())

const solicitudesPendientes = computed(() =>
  solicitudes.value.filter(s => s.estado === 'enviado')
)

const solicitudesMostradas = computed(() => {
  return solicitudes.value
    .filter(s => s.estado === tabActivo.value)
    .slice(0, 30); // a futuro si queremos lo cambiamos, depende de flor y flor
})
// FUNCIÓN DE SCROLL MÓVIL AL CAMBIAR PÁGINA
const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

const cargarSolicitudes = async () => {
  cargandoSolicitudes.value = true
  try {
    const res = await api.get({ entity: 'datos_personales', action: 'getTodasLasSolicitudes' })
    if (res.payload) {
      solicitudes.value = res.payload
    }
  } catch (error) {
    console.error('Error cargando solicitudes', error)
  } finally {
    cargandoSolicitudes.value = false
  }
}

const abrirModalSolicitudes = () => {
  cargarSolicitudes()
  tabActivo.value = 'enviado'
  mostrarModalSolicitudes.value = true
}

const aprobarSolicitud = async (solicitud) => {
  try {
    const res = await api.post({
      entity: 'datos_personales',
      action: 'cambiarEstadoSolicitud',
      payload: { id_historial: solicitud.id, nuevo_estado: 'aprobado' }
    })

    if (res.ok || res.success) {
      mostrarModalSolicitudes.value = false;

      notificar({ titulo: 'Aprobado', mensaje: 'Se aprobó la solicitud de cambios.', tipo: 'success' })
      solicitud.estado = 'aprobado'
    } else {
      notificar({ titulo: 'Error', mensaje: 'No se pudo aprobar.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  }
}

const rechazarSolicitud = async (solicitud) => {
  notificar({
    titulo: '¿Rechazar solicitud?',
    mensaje: '¿Estás seguro de que querés rechazar este pedido del árbitro?',
    tipo: 'warning',
    tieneAccion: true,
    alConfirmar: async () => {
      try {
        const res = await api.post({
          entity: 'datos_personales',
          action: 'cambiarEstadoSolicitud',
          payload: { id_historial: solicitud.id, nuevo_estado: 'rechazado' }
        })

        if (res.ok || res.success) {
          mostrarModalSolicitudes.value = false;
          notificar({ titulo: 'Rechazado', mensaje: 'Se rechazó la solicitud correctamente.', tipo: 'success' })
          solicitud.estado = 'rechazado'
        } else {
          notificar({ titulo: 'Error', mensaje: 'No se pudo rechazar.', tipo: 'danger' })
        }
      } catch {
        notificar({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
      }
    }
  })
}

const abrirEdicionDesdeSolicitud = (sol) => {
  const arbitroEncontrado = arbitros.value.find(a => a.id == sol.id_arbitro)

  if (arbitroEncontrado) {
    mostrarModalSolicitudes.value = false
    mensajeSolicitudActiva.value = sol.mensaje
    editarArbitro(arbitroEncontrado)
  } else {
    notificar({ titulo: 'No encontrado', mensaje: 'No se encontraron los datos de este árbitro en la lista actual.', tipo: 'danger' })
  }
}

const verHistorialArbitro = async (arbitro) => {
  arbitroSeleccionado.value = arbitro
  mostrarModalHistorialArbitro.value = true
  cargandoHistorialArbitro.value = true
  historialArbitro.value = []

  try {
    const res = await api.get({
      entity: 'datos_personales',
      action: 'obtenerHistorialAdmin',
      payload: { id_arbitro: arbitro.id }
    })
    if (res.payload) {
      historialArbitro.value = res.payload
    }
  } catch{
    notificar({ titulo: 'Error', mensaje: 'No se pudo cargar el historial', tipo: 'danger' })
  } finally {
    cargandoHistorialArbitro.value = false
  }
}

const crearNuevo = () => {
  formModal.value = formModalVacio()
  movilidadArray.value = []
  mensajeSolicitudActiva.value = ''
  modoModal.value = 'nuevo'
  mostrarModal.value = true
}

const editarArbitro = (arbitro) => {
  formModal.value = { ...arbitro }
  movilidadArray.value = []
  let movilidades = arbitro.movilidad ? arbitro.movilidad.split(',') : []
  movilidades.forEach(v => {
    movilidadArray.value.push(v.trim())
  })
  modoModal.value = 'editar'
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  mensajeSolicitudActiva.value = ''
}

const confirmarAlta = async () => {
  if (!formModal.value.apellido || !formModal.value.nombre || !formModal.value.email || !formModal.value.password) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Apellido, Nombre, Email y Password son requeridos.', tipo: 'danger' })
    return
  }
  cargando.value = true
  try {
    const res = await api.post({
      entity: 'arbitros',
      action: 'guardarDatosArbitros',
      payload: { listaArbitros: [prepararPayload(formModal.value)] },
    })
    if (res.ok || res.success) {
      notificar({ titulo: 'Éxito', mensaje: 'Árbitro creado correctamente.', tipo: 'success' })
      cerrarModal()
      await cargarDatos()
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'No se pudo crear el árbitro.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const confirmarEdicion = async () => {
  if (!formModal.value.apellido || !formModal.value.nombre || !formModal.value.email) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Apellido, Nombre y Email son requeridos.', tipo: 'danger' })
    return
  }
  cargando.value = true
  try {
    const res = await api.post({
      entity: 'arbitros',
      action: 'guardarDatosArbitros',
      payload: { listaArbitros: [prepararPayload(formModal.value)] },
    })
    if (res.ok || res.success) {
      notificar({ titulo: '¡Guardado!', mensaje: 'Árbitro actualizado correctamente.', tipo: 'success' })
      cerrarModal()
      await cargarDatos()
    } else {
      notificar({ titulo: 'Error', mensaje: res.message || 'Error al guardar.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error Fatal', mensaje: 'Error al conectar con el servidor.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const prepararPayload = (a) => {
  const clon = { ...a }
  clon.movilidad = movilidadArray.value.join(', ')
  if (clon.grupo != '3') clon.subgrupo = null

  ;['disponibilidad_sabado_desde', 'disponibilidad_sabado_hasta',
    'disponibilidad_domingo_desde', 'disponibilidad_domingo_hasta',
    'fecha_nacimiento'].forEach(campo => {
    if (clon[campo] === '' || clon[campo] === undefined) clon[campo] = null
  })
  if (!clon.password) delete clon.password
  clon.apto_medico = clon.apto_medico ? 1 : 0
  clon.rol = parseInt(clon.rol)
  return clon
}

const obtenerNombreRol = (bitRol) => {
  const roles = { 0: 'Ninguno', 1: 'Árbitro', 2: 'Observador', 4: 'Coordinador' }
  return roles[bitRol] || 'Desconocido'
}

const limpiarFiltros = () => { Object.keys(filtros).forEach(key => (filtros[key] = '')) }
const mostrarFechaArg = (fecha) => {
  if (!fecha) return ''
  const partes = fecha.split('-')
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha
}
const normalizarTexto = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const exportarExcel = () => { mostrarModalExcel.value = true }
const mostrarModalExcel = ref(false)
const columnasExcel = ref([
  { id: 'id', label: 'ID', visible: true },
  { id: 'apellido', label: 'Apellido', visible: true }, { id: 'nombre', label: 'Nombre', visible: true }, { id: 'dni', label: 'DNI', visible: true },
  { id: 'rol', label: 'Rol', visible: true }, { id: 'grupo', label: 'Grupo', visible: true }, { id: 'subgrupo', label: 'Subgrupo', visible: true },
  { id: 'es_activo', label: 'Estado', visible: false }, { id: 'apto_medico', label: 'Apto Médico', visible: false }, { id: 'email', label: 'Email', visible: false },
  { id: 'direccion', label: 'Dirección', visible: false }, { id: 'nombre_provincia', label: 'Provincia', visible: false }, { id: 'nombre_localidad', label: 'Localidad', visible: false },
  { id: 'zona', label: 'Zona', visible: false }, { id: 'celular', label: 'Celular', visible: false }, { id: 'fecha_nacimiento', label: 'F. Nacimiento', visible: false },
  { id: 'telefonocontacto', label: 'Tel. Contacto', visible: false }, { id: 'parentescocontacto', label: 'Parentesco', visible: false }, { id: 'movilidad', label: 'Movilidad', visible: false },
  { id: 'disponibilidad_sabado', label: 'Sáb. Disp.', visible: false }, { id: 'disponibilidad_sabado_desde', label: 'Sáb. Desde', visible: false }, { id: 'disponibilidad_sabado_hasta', label: 'Sáb. Hasta.', visible: false },
  { id: 'disponibilidad_domingo', label: 'Dom. Disp.', visible: false }, { id: 'disponibilidad_domingo_desde', label: 'Dom. Desde', visible: false }, { id: 'disponibilidad_domingo_hasta', label: 'Dom. Hasta', visible: false },
  { id: 'juega_handball', label: 'Juega', visible: false }, { id: 'donde_juega', label: 'Club', visible: false }, { id: 'categoria_handball', label: 'Cat. Juega', visible: false }, { id: 'observaciones', label: 'Observaciones', visible: false },
])

const ejecutarDescargaExcel = () => {
  const cols = columnasExcel.value.filter(c => c.visible)
  const datos = arbitrosFiltrados.value.map(a => {
    const fila = {}
    cols.forEach(col => {
      let valor = a[col.id]
      if (col.id === 'rol') valor = obtenerNombreRol(a.rol)
      else if (col.id === 'es_activo') valor = valor == 1 ? 'SI' : 'NO'
      else if (col.id === 'apto_medico') valor = valor ? 'SI' : 'NO'
      else if (col.id === 'fecha_nacimiento') valor = mostrarFechaArg(valor)
      fila[col.label] = valor || ''
    })
    return fila
  })
  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Arbitros')
  XLSX.writeFile(wb, 'Reporte_AAAB.xlsx')
  mostrarModalExcel.value = false
}

const cargarDatos = async () => {
  try {
    const { payload } = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    if (payload) {
      arbitros.value = payload.map(a => ({
        ...a,
        apto_medico: a.apto_medico == 1,
        rol: a.rol !== null ? parseInt(a.rol) : 0,
      }))
    }
  } catch (err) { console.error('Error al cargar:', err) }
}

const obtenerProvinciasLocalidades = async () => {
  const { payload } = await api.get({ entity: 'localidades', action: 'obtenerProvinciasLocalidades' })
  provincias.value = payload.provincias
  localidades.value = payload.localidades
}

const localidadesFiltradas = computed(() => {
  if (!filtros.provincia) return localidades.value
  return localidades.value.filter(l => Number(l.provincia_id) === Number(filtros.provincia))
})

const arbitrosFiltrados = computed(() => {
  const filtrados = arbitros.value.filter(a =>
    Object.keys(filtros).every(key => {
      if (!filtros[key]) return true
      if (key === 'rol') return a.rol == filtros.rol
      const busqueda = String(filtros[key]).toLowerCase()
      if (key === 'es_activo') return busqueda === 'si' ? a.es_activo == 1 : a.es_activo == 0
      if (key === 'apto_medico') return busqueda === 'si' ? a.apto_medico : !a.apto_medico
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]))
    })
  )

  return filtrados.sort((a, b) => {
    const comparacionApellido = String(a.apellido || '').localeCompare(String(b.apellido || ''), 'es')
    if (comparacionApellido !== 0) return comparacionApellido
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es')
  })
})

const totalPaginas = computed(() => Math.ceil(arbitrosFiltrados.value.length / registrosPorPagina) || 1)
const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return arbitrosFiltrados.value.slice(inicio, inicio + registrosPorPagina)
})
const totalFiltrados = computed(() => arbitrosFiltrados.value.length)

watch([() => filtros.provincia, localidadesFiltradas], () => {
  if (!filtros.localidad) return
  const existe = localidadesFiltradas.value.some(l => String(l.id) === String(filtros.localidad))
  if (!existe) filtros.localidad = ''
})
watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevoTotal) => { if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal })

const cargarEstadoEdicion = async () => {
  try {
    const res = await api.get({
      entity: 'arbitros',
      action: 'obtenerEstadoEdicionGlobal'
    });
    if (res?.ok && res.payload) {
      edicionAbierta.value = res.payload.estado === 1;
    }
  } catch (error) {
    console.error("Error al cargar estado de edición:", error);
  }
};

const toggleEdicionGlobal = async () => {
  const nuevoEstado = edicionAbierta.value ? 0 : 1;
  const textoAccion = nuevoEstado === 1 ? 'HABILITAR' : 'CERRAR';

  notificar({
    titulo: '¿Estás seguro?',
    mensaje: `Esto va a ${textoAccion} la edición de legajos para TODOS los árbitros del panel.`,
    tipo: 'warning',
    tieneAccion: true,
    alConfirmar: async () => {
      try {
        const res = await api.post({
          entity: 'arbitros',
          action: 'actualizarEdicionGlobal',
          payload: { estado: nuevoEstado }
        });

        if (res?.ok) {
          edicionAbierta.value = nuevoEstado === 1;
          notificar({
            titulo: '¡Actualizado!',
            mensaje: `La edición ha sido ${nuevoEstado === 1 ? 'habilitada' : 'cerrada'} correctamente.`,
            tipo: 'success'
          });
        }
      } catch{
        notificar({ titulo: 'Error', mensaje: 'Hubo un problema al actualizar el estado.', tipo: 'danger' });
      }
    }
  });
};

onMounted(() => {
  cargarDatos()
  obtenerProvinciasLocalidades()
  cargarSolicitudes()
  cargarEstadoEdicion()
})
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
   PUNTOS DE ESTADO (Activo/Inactivo)
   ==================================================== */
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

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

.animate__animated {
  animation-duration: 0.5s;
}

/* ====================================================
   TABLA CON COLUMNAS FIJAS
   ==================================================== */
.tabla-container {
  overflow-x: auto;
}

.tabla-fija {
  border-collapse: separate;
  border-spacing: 0;
}

/* Eliminar bordes verticales de las celdas */
.tabla-fija th,
.tabla-fija td {
  border-left: none !important;
  border-right: none !important;
}

/* Columnas fijas con position: sticky base (para los datos) */
.col-fija {
  position: sticky;
  background-color: inherit;
  z-index: 10;
}

/* Fondo para thead y Z-INDEX ALTO para que tape los datos al scrollear hacia abajo */
.tabla-fija thead .col-fija {
  background-color: #f8f9fa;
  z-index: 12;
}

/* Fondo para tbody */
.tabla-fija tbody .col-fija {
  background-color: #ffffff;
}

/* Fondo especial para filas con bg-danger-subtle */
.tabla-fija tbody tr.bg-danger-subtle .col-fija {
  background-color: #f8d7da;
}

/* Posiciones de las columnas fijas */
.col-id {
  left: 0;
  min-width: 60px;
}

.col-acciones {
  left: 60px;
  min-width: 100px;
}

.col-apellido {
  left: 160px;
  min-width: 150px;
}

.col-nombre {
  left: 310px;
  min-width: 150px;
}

/* Sombra sutil en el borde derecho de la última columna fija */
.col-nombre::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.1), transparent);
}
</style>
