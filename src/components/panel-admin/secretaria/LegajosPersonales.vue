<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="header-section shadow-sm">
        <div class="header-info">
          <h2 class="title">Gestión de Árbitros</h2>
          <span class="counter">Total: {{ totalFiltrados }} árbitros</span>
        </div>

        <div class="header-actions">
          <!-- BOTÓN FILTROS (SOLO MOBILE) -->
          <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex" title="Mostrar Filtros">
            <span class="material-icons">filter_alt</span> <span class="btn-text">Filtros</span>
          </button>

          <!-- BOTÓN DE SOLICITUDES GENERALES -->
          <button @click="abrirModalSolicitudes" class="btn-action btn-blue position-relative" title="Solicitudes pendientes">
            <span class="material-icons">notifications</span> <span class="btn-text">Solicitudes</span>
            <span v-if="solicitudesPendientes.length > 0" class="badge-notif">
              {{ solicitudesPendientes.length }}
            </span>
          </button>

          <button @click="limpiarFiltros" class="btn-action btn-clear" title="Limpiar Filtros">
            <span class="material-icons">filter_alt_off</span> <span class="btn-text">Limpiar</span>
          </button>
          <button @click="crearNuevo" class="btn-action btn-clear-checks" title="Nuevo Árbitro">
            <span class="material-icons">person_add</span> <span class="btn-text">Nuevo</span>
          </button>
          <button @click="exportarExcel" class="btn-action btn-export" title="Exportar a Excel">
            <span class="material-icons">download</span> <span class="btn-text">Excel</span>
          </button>
        </div>
      </div>

      <!-- PANEL DE FILTROS DESPLEGABLE (SOLO MOBILE) -->
      <div v-if="mostrarFiltrosMobile" class="mobile-only mb-3 animate__animated animate__fadeInDown animate__faster">
        <div class="bg-white p-3 rounded shadow-sm border border-light-subtle">
          <label class="small fw-bold mb-2 d-block text-muted text-uppercase">Filtrar Árbitros</label>
          <div class="row g-2">
            <div class="col-6"><input v-model="filtros.apellido" class="filter-input-mobile" placeholder="Apellido..."></div>
            <div class="col-6"><input v-model="filtros.nombre" class="filter-input-mobile" placeholder="Nombre..."></div>
            <div class="col-6"><input v-model="filtros.dni" class="filter-input-mobile" placeholder="DNI..."></div>
            <div class="col-6">
              <select v-model="filtros.rol" class="filter-input-mobile">
                <option value="">Rol (Todos)</option>
                <option :value="1">Árbitro</option>
                <option :value="2">Observador</option>
                <option :value="4">Coordinador</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLA DESKTOP -->
      <div class="table-container shadow desktop-only">
        <table>
          <thead>
            <tr class="main-header">
              <th class="sticky-col col-id">ID</th>
              <th class="sticky-col col-acciones text-center">Acciones</th>
              <th class="sticky-col col-apellido">Apellido</th>
              <th class="sticky-col col-nombre">Nombre</th>
              <th class="col-xs-compact">Activo</th>
              <th class="col-xs-compact">Rol</th>
              <th class="col-xs-compact">Apto Med.</th>
              <th class="col-xs-compact">Grupo</th>
              <th class="col-xs-compact">Subg.</th>
              <th class="col-dni-compact">DNI</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Provincia</th>
              <th>Localidad</th>
              <th>Zona</th>
              <th>Celular</th>
              <th>F. Nacimiento</th>
              <th>Tel. Contacto</th>
              <th>Parentesco</th>
              <th>Movilidad</th>
              <th class="col-dni-compact">Sáb. Disp</th>
              <th>Sáb. Desde</th>
              <th>Sáb. Hasta</th>
              <th class="col-dni-compact">Dom. Disp</th>
              <th>Dom. Desde</th>
              <th>Dom. Hasta</th>
              <th class="col-dni-compact">Juega</th>
              <th>Club</th>
              <th>Cat. Juega</th>
              <th>Observaciones</th>
            </tr>
            <tr class="filter-row">
              <td class="sticky-col col-id"></td>
              <td class="sticky-col col-acciones"></td>
              <td class="sticky-col col-apellido"><input v-model="filtros.apellido" class="filter-input" placeholder="Filtrar.."></td>
              <td class="sticky-col col-nombre"><input v-model="filtros.nombre" class="filter-input" placeholder="Filtrar.."></td>
              <td class="col-xs-compact"><input v-model="filtros.es_activo" class="filter-input text-center" placeholder="SI/NO"></td>
              <td class="col-xs-compact">
                <select v-model="filtros.rol" class="filter-input">
                  <option value="">Todos</option>
                  <option :value="0">Ninguno</option>
                  <option :value="1">Árbitro</option>
                  <option :value="2">Observador</option>
                  <option :value="4">Coordinador</option>
                </select>
              </td>
              <td class="col-xs-compact"><input v-model="filtros.apto_medico" class="filter-input text-center" placeholder="SI/NO"></td>
              <td class="col-xs-compact"><input v-model="filtros.grupo" class="filter-input text-center"></td>
              <td class="col-xs-compact"><input v-model="filtros.subgrupo" class="filter-input text-center"></td>
              <td class="col-dni-compact"><input v-model="filtros.dni" class="filter-input text-center"></td>
              <td><input v-model="filtros.email" class="filter-input"></td>
              <td><input v-model="filtros.direccion" class="filter-input"></td>
              <td><selProvincia v-model="filtros.provincia" :provincias="provincias" class="filter-input" /></td>
              <td><selLocalidad v-model="filtros.localidad" :localidades="localidadesFiltradas" class="filter-input" /></td>
              <td><input v-model="filtros.zona" class="filter-input"></td>
              <td><input v-model="filtros.celular" class="filter-input"></td>
              <td><input v-model="filtros.fecha_nacimiento" class="filter-input"></td>
              <td><input v-model="filtros.telefonocontacto" class="filter-input"></td>
              <td><input v-model="filtros.parentescocontacto" class="filter-input"></td>
              <td><input v-model="filtros.movilidad" class="filter-input"></td>
              <td class="col-dni-compact"><input v-model="filtros.disponibilidad_sabado" class="filter-input"></td>
              <td><input v-model="filtros.disponibilidad_sabado_desde" class="filter-input"></td>
              <td><input v-model="filtros.disponibilidad_sabado_hasta" class="filter-input"></td>
              <td class="col-dni-compact"><input v-model="filtros.disponibilidad_domingo" class="filter-input"></td>
              <td><input v-model="filtros.disponibilidad_domingo_desde" class="filter-input"></td>
              <td><input v-model="filtros.disponibilidad_domingo_hasta" class="filter-input"></td>
              <td class="col-dni-compact"><input v-model="filtros.juega_handball" class="filter-input"></td>
              <td><input v-model="filtros.donde_juega" class="filter-input"></td>
              <td><input v-model="filtros.categoria_handball" class="filter-input"></td>
              <td><input v-model="filtros.observaciones" class="filter-input"></td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in arbitrosPaginados" :key="a.id" :class="{ 'fila-inactiva': a.es_activo == 0 }">
              <td class="sticky-col col-id cell-ro text-center">{{ a.id }}</td>
              <td class="sticky-col col-acciones cell-ro text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button @click="editarArbitro(a)" class="btn-editar" title="Editar árbitro">
                    <span class="material-icons" style="font-size:16px;">edit</span>
                  </button>
                  <!-- NUEVO: Botón historial -->
                  <button @click="verHistorialArbitro(a)" class="btn-historial" title="Ver historial de cambios">
                    <span class="material-icons" style="font-size:16px;">manage_search</span>
                  </button>
                </div>
              </td>
              <td class="sticky-col col-apellido cell-ro">{{ a.apellido }}</td>
              <td class="sticky-col col-nombre cell-ro">{{ a.nombre }}</td>
              <td class="col-xs-compact cell-ro">
                <div class="status-wrapper">
                  <span :class="['status-dot', a.es_activo == 1 ? 'dot-active' : 'dot-inactive']"></span>
                  <span style="font-size:0.78rem;">{{ a.es_activo == 1 ? 'SI' : 'NO' }}</span>
                </div>
              </td>
              <td class="col-xs-compact cell-ro fw-bold">{{ obtenerNombreRol(a.rol) }}</td>
              <td class="text-center cell-ro" :class="{ 'inactivo': !a.apto_medico }">{{ a.apto_medico ? 'SI' : 'NO' }}</td>
              <td class="col-xs-compact cell-ro text-center">{{ a.grupo }}</td>
              <td class="col-xs-compact cell-ro text-center">{{ a.subgrupo }}</td>
              <td class="col-dni-compact cell-ro text-center">{{ a.dni }}</td>
              <td class="cell-ro">{{ a.email }}</td>
              <td class="cell-ro">{{ a.direccion }}</td>
              <td class="cell-ro">{{ a.nombre_provincia }}</td>
              <td class="cell-ro">{{ a.nombre_localidad }}</td>
              <td class="cell-ro">{{ a.zona }}</td>
              <td class="cell-ro">{{ a.celular }}</td>
              <td class="cell-ro">{{ a.fecha_nacimiento ? mostrarFechaArg(a.fecha_nacimiento) : '' }}</td>
              <td class="cell-ro">{{ a.telefonocontacto }}</td>
              <td class="cell-ro">{{ a.parentescocontacto }}</td>
              <td class="cell-ro">{{ a.movilidad }}</td>
              <td class="cell-ro text-center">{{ a.disponibilidad_sabado }}</td>
              <td class="cell-ro">{{ a.disponibilidad_sabado_desde }}</td>
              <td class="cell-ro">{{ a.disponibilidad_sabado_hasta }}</td>
              <td class="cell-ro text-center">{{ a.disponibilidad_domingo }}</td>
              <td class="cell-ro">{{ a.disponibilidad_domingo_desde }}</td>
              <td class="cell-ro">{{ a.disponibilidad_domingo_hasta }}</td>
              <td class="cell-ro text-center">{{ a.juega_handball }}</td>
              <td class="cell-ro">{{ a.donde_juega }}</td>
              <td class="cell-ro">{{ a.categoria_handball }}</td>
              <td class="cell-ro obs-cell">{{ a.observaciones }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA MOBILE (CARDS) -->
      <div class="mobile-only">
        <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card-arbitro" :class="{ 'fila-inactiva': a.es_activo == 0 }">
          <div class="card-header">
            <div class="card-name">
              <span :class="['status-dot', a.es_activo == 1 ? 'dot-active' : 'dot-inactive']" style="margin-right: 5px;"></span>
              <strong>{{ a.apellido }}, {{ a.nombre }}</strong>
            </div>
            <div class="text-xs" style="color: #64748b;">ID: {{ a.id }}</div>
          </div>
          
          <div class="card-body">
            <div class="card-row">
              <span><strong>Rol:</strong> {{ obtenerNombreRol(a.rol) }}</span>
              <span><strong>Grupo:</strong> {{ a.grupo || '-' }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></span>
            </div>
            
            <div class="card-info">
              <p><strong>Apto Médico:</strong> {{ a.apto_medico ? 'SÍ' : 'NO' }}</p>
              <p v-if="a.celular"><strong>Celular:</strong> {{ a.celular }}</p>
              <p v-if="a.email"><strong>Email:</strong> {{ a.email }}</p>
              <p v-if="a.zona"><strong>Zona:</strong> {{ a.zona }}</p>
            </div>
            
            <div class="d-flex gap-2 mt-3">
              <button @click="editarArbitro(a)" class="btn-editar-mobile flex-grow-1">
                <span class="material-icons" style="font-size: 18px;">edit</span> Editar
              </button>
              <button @click="verHistorialArbitro(a)" class="btn-historial-mobile">
                <span class="material-icons" style="font-size: 18px;">manage_search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PAGINACIÓN -->
      <div class="paginacion">
        <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
        <span class="paginacion-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas">Siguiente</button>
      </div>
    </div>

    <!-- MODAL EXCEL -->
    <Teleport to="body">
    <div v-if="mostrarModalExcel" class="modal-overlay-exito animate__animated animate__fadeIn">
      <div class="modal-content-exito animate__animated animate__zoomIn" style="max-width: 750px;">
        <div class="icon-circle-exito bg-success-light">
          <span class="material-icons">description</span>
        </div>
        <h4 class="fw-bold mt-3">Exportar Listado</h4>
        <p class="text-muted small mb-3">Marcá las columnas que querés incluir en el Excel</p>
        <div class="row g-2 text-start my-3" style="max-height: 250px; overflow-y: auto; background: #f8fafc; padding: 15px; border-radius: 20px;">
          <div v-for="col in columnasExcel" :key="col.id" class="col-6">
            <div class="d-flex align-items-center gap-2 p-1">
              <input type="checkbox" v-model="col.visible" :id="'col-'+col.id" style="width:18px; height:18px; cursor:pointer;">
              <label :for="'col-'+col.id" class="mb-0 small cursor-pointer" style="color: #1e293b;">{{ col.label }}</label>
            </div>
          </div>
        </div>
        <div class="d-flex gap-2 justify-content-center mt-4">
          <button @click="mostrarModalExcel = false" class="btn btn-light rounded-pill px-4 fw-bold">CANCELAR</button>
          <button @click="ejecutarDescargaExcel" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm">DESCARGAR</button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- MODAL ALTA / EDICIÓN -->
    <Teleport to="body">
    <div v-if="mostrarModal" class="modal-overlay-exito animate__animated animate__fadeIn">
      <div class="modal-content-exito animate__animated animate__zoomIn" style="max-width: 900px; width: 95%;">

        <div class="icon-circle-exito" :class="modoModal === 'editar' ? 'bg-info-light' : 'bg-success-light'">
          <span class="material-icons">{{ modoModal === 'editar' ? 'edit' : 'person_add' }}</span>
        </div>
        <h4 class="fw-bold mt-3">
          {{ modoModal === 'editar' ? `Editar árbitro — ${formModal.apellido} ${formModal.nombre}` : 'Registrar Nuevo Árbitro' }}
        </h4>
        <p v-if="modoModal === 'editar'" class="text-muted small mb-1">ID #{{ formModal.id }}</p>

        <div class="row g-3 text-start mt-3" style="max-height: 60vh; overflow-y: auto; padding: 15px;">

          <div class="col-12 seccion-titulo">Datos básicos</div>
          <div class="col-md-4"><label class="small fw-bold">Apellido *</label><input v-model="formModal.apellido" class="filter-input"></div>
          <div class="col-md-4"><label class="small fw-bold">Nombre *</label><input v-model="formModal.nombre" class="filter-input"></div>
          <div class="col-md-4"><label class="small fw-bold">DNI</label><input v-model="formModal.dni" class="filter-input"></div>
          <div class="col-md-6"><label class="small fw-bold">Email (Usuario) *</label><input v-model="formModal.email" class="filter-input"></div>
          <div class="col-md-6">
            <label class="small fw-bold">
              {{ modoModal === 'nuevo' ? 'Password *' : 'Password (dejar vacío para no cambiar)' }}
            </label>
            <input v-model="formModal.password" type="text" class="filter-input" :placeholder="modoModal === 'editar' ? '••••••••' : ''">
          </div>

          <div class="col-12 seccion-titulo">Clasificación</div>
          <div class="col-md-3">
            <label class="small fw-bold">Rol</label>
            <select v-model="formModal.rol" class="filter-input">
              <option :value="1">Árbitro</option>
              <option :value="2">Observador</option>
              <option :value="4">Coordinador</option>
              <option :value="0">Ninguno</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="small fw-bold">Estado</label>
            <select v-model="formModal.es_activo" class="filter-input">
              <option :value="1">Activo</option>
              <option :value="0">Inactivo</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="small fw-bold">Grupo</label>
            <select v-model="formModal.grupo" class="filter-input">
              <option value="LH">LH</option>
              <option value="Pre Liga">Pre Liga</option>
              <option value="SR">SR</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div class="col-md-2" v-if="formModal.grupo == '3'">
            <label class="small fw-bold">Subgrupo</label>
            <select v-model="formModal.subgrupo" class="filter-input">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div class="col-md-2" v-else></div>
          <div class="col-md-2">
            <label class="small fw-bold">Apto Médico</label>
            <select v-model="formModal.apto_medico" class="filter-input">
              <option :value="true">SI</option>
              <option :value="false">NO</option>
            </select>
          </div>

          <div class="col-12 seccion-titulo">Ubicación</div>
          <div class="col-md-4"><label class="small fw-bold">Provincia</label><selProvincia v-model="formModal.provincia" :provincias="provincias" class="filter-input" /></div>
          <div class="col-md-4"><label class="small fw-bold">Localidad</label><selLocalidad v-model="formModal.localidad" :localidades="localidades.filter(l => l.provincia_id == formModal.provincia)" class="filter-input" /></div>
          <div class="col-md-4"><label class="small fw-bold">Zona</label><input v-model="formModal.zona" class="filter-input"></div>
          <div class="col-12"><label class="small fw-bold">Dirección</label><input v-model="formModal.direccion" class="filter-input"></div>

          <div class="col-12 seccion-titulo">Contacto y Movilidad</div>
          <div class="col-md-4"><label class="small fw-bold">Celular</label><input v-model="formModal.celular" class="filter-input"></div>
          <div class="col-md-4"><label class="small fw-bold">Tel. Contacto</label><input v-model="formModal.telefonocontacto" class="filter-input"></div>
          <div class="col-md-4"><label class="small fw-bold">Parentesco</label><input v-model="formModal.parentescocontacto" class="filter-input"></div>
          <div class="col-md-4"><label class="small fw-bold">F. Nacimiento</label><input type="date" v-model="formModal.fecha_nacimiento" class="filter-input"></div>
          <div class="col-md-8">
            <label class="small fw-bold">Movilidad</label>
            <div class="checkbox-group">
              <label class="checkbox-item"><input type="checkbox" value="moto" v-model="movilidadArray"> Moto</label>
              <label class="checkbox-item"><input type="checkbox" value="transporte publico" v-model="movilidadArray"> Transporte Público</label>
              <label class="checkbox-item"><input type="checkbox" value="auto" v-model="movilidadArray"> Auto</label>
              <label class="checkbox-item"><input type="checkbox" value="bici" v-model="movilidadArray"> Bici</label>
            </div>
          </div>

          <div class="col-12 seccion-titulo">Disponibilidad</div>
          <div class="col-md-2">
            <label class="small fw-bold">Sáb. Disp.</label>
            <select v-model="formModal.disponibilidad_sabado" class="filter-input">
              <option value="FT">FT</option><option value="NO">NO</option><option value="OTROS">OTROS</option>
            </select>
          </div>
          <div class="col-md-2"><label class="small fw-bold">Sáb. Desde</label><input type="time" v-model="formModal.disponibilidad_sabado_desde" class="filter-input"></div>
          <div class="col-md-2"><label class="small fw-bold">Sáb. Hasta</label><input type="time" v-model="formModal.disponibilidad_sabado_hasta" class="filter-input"></div>
          <div class="col-md-2">
            <label class="small fw-bold">Dom. Disp.</label>
            <select v-model="formModal.disponibilidad_domingo" class="filter-input">
              <option value="FT">FT</option><option value="NO">NO</option><option value="OTROS">OTROS</option>
            </select>
          </div>
          <div class="col-md-2"><label class="small fw-bold">Dom. Desde</label><input type="time" v-model="formModal.disponibilidad_domingo_desde" class="filter-input"></div>
          <div class="col-md-2"><label class="small fw-bold">Dom. Hasta</label><input type="time" v-model="formModal.disponibilidad_domingo_hasta" class="filter-input"></div>

          <div class="col-12 seccion-titulo">Handball</div>
          <div class="col-md-4">
            <label class="small fw-bold">Juega handball</label>
            <select v-model="formModal.juega_handball" class="filter-input">
              <option value="SI">SI</option>
              <option value="NO">NO</option>
            </select>
          </div>
          <div class="col-md-4"><label class="small fw-bold">Club</label><input v-model="formModal.donde_juega" class="filter-input" :disabled="formModal.juega_handball !== 'SI'"></div>
          <div class="col-md-4"><label class="small fw-bold">Categoría</label><input v-model="formModal.categoria_handball" class="filter-input" :disabled="formModal.juega_handball !== 'SI'"></div>

          <div class="col-12 seccion-titulo">Observaciones</div>
          <div class="col-12">
            <textarea v-model="formModal.observaciones" class="filter-input" rows="3" style="height:auto; resize:vertical;"></textarea>
          </div>

        </div>

        <div class="d-flex gap-2 justify-content-center mt-4">
          <button @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold">CANCELAR</button>
          <button @click="modoModal === 'editar' ? confirmarEdicion() : confirmarAlta()" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
            {{ modoModal === 'editar' ? 'GUARDAR CAMBIOS' : 'CREAR ÁRBITRO' }}
          </button>
        </div>

      </div>
    </div>
    </Teleport>

    <!-- MODAL SOLICITUDES / HISTORIAL -->
    <Teleport to="body">
    <div v-if="mostrarModalSolicitudes" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 10001;">
      <div class="modal-content-exito animate__animated animate__zoomIn" style="max-width: 800px; width: 95%; text-align: left;">
        <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
          <h4 class="fw-bold m-0 d-flex align-items-center gap-2">
            <span class="material-icons text-primary">history</span> 
            Solicitudes de Cambios
          </h4>
          <button @click="mostrarModalSolicitudes = false" class="btn btn-light rounded-circle" style="width: 35px; height: 35px; padding: 0;">
            <span class="material-icons" style="font-size: 18px; line-height: 1;">close</span>
          </button>
        </div>

        <div style="max-height: 60vh; overflow-y: auto; padding-right: 5px;">
          <div v-if="cargandoSolicitudes" class="text-center py-4">
            <span class="spinner-border text-primary"></span>
            <p class="text-muted mt-2 small">Cargando solicitudes...</p>
          </div>
          
          <div v-else-if="solicitudes.length === 0" class="text-center py-4 text-muted">
            <span class="material-icons" style="font-size: 40px; color: #cbd5e1;">inbox</span>
            <p class="mt-2">No hay solicitudes recientes.</p>
          </div>

          <div v-else v-for="sol in solicitudes" :key="sol.id" class="solicitud-card shadow-sm mb-3" :class="{'bg-light': sol.estado === 'aprobado'}">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="text-xs fw-bold text-muted mb-1">{{ sol.fecha }}</div>
                <strong class="d-block text-dark mb-1">{{ sol.arbitro_nombre }}</strong>
                <p class="m-0 small text-secondary" style="white-space: pre-line;">{{ sol.mensaje }}</p>
              </div>
              <div class="d-flex flex-column align-items-end gap-2">
                <span class="badge" :class="sol.estado === 'enviado' ? 'bg-warning text-dark' : 'bg-success'">
                  {{ sol.estado.toUpperCase() }}
                </span>
                
                <div class="d-flex gap-1" v-if="sol.estado === 'enviado'">
                  <!-- Botón que abre el modal de edición del árbitro -->
                  <button @click="abrirEdicionDesdeSolicitud(sol.id_arbitro)" 
                          class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 fw-bold" 
                          style="font-size: 0.7rem; padding: 4px 8px;"
                          title="Abrir legajo para editar">
                    <span class="material-icons" style="font-size: 14px;">edit</span> LEGAJO
                  </button>
                  
                  <!-- Botón para aprobar -->
                  <button @click="aprobarSolicitud(sol)" 
                          class="btn btn-sm btn-dark fw-bold" 
                          style="font-size: 0.7rem; padding: 4px 8px;">
                    APROBAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- MODAL HISTORIAL INDIVIDUAL DEL ÁRBITRO -->
    <Teleport to="body">
    <div v-if="mostrarModalHistorialArbitro" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 10002;">
      <div class="modal-content-exito animate__animated animate__zoomIn" style="max-width: 700px; width: 95%; text-align: left;">
        <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
          <h5 class="fw-bold m-0 d-flex align-items-center gap-2">
            <span class="material-icons text-warning">manage_search</span> 
            Historial de {{ arbitroSeleccionado.apellido }}, {{ arbitroSeleccionado.nombre }}
          </h5>
          <button @click="mostrarModalHistorialArbitro = false" class="btn btn-light rounded-circle" style="width: 35px; height: 35px; padding: 0;">
            <span class="material-icons" style="font-size: 18px; line-height: 1;">close</span>
          </button>
        </div>

        <div style="max-height: 60vh; overflow-y: auto; padding-right: 5px;">
          <div v-if="cargandoHistorialArbitro" class="text-center py-4">
            <span class="spinner-border text-warning"></span>
          </div>
          
          <div v-else-if="historialArbitro.length === 0" class="text-center py-4 text-muted">
            <span class="material-icons d-block fs-1 mb-2">history_toggle_off</span>
            Este árbitro nunca solicitó cambios.
          </div>

          <div v-else class="table-responsive">
            <table class="table table-sm table-hover align-middle" style="font-size: 0.85rem;">
              <thead class="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Mensaje</th>
                  <th class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in historialArbitro" :key="h.id">
                  <td class="text-nowrap text-muted fw-bold">{{ h.fecha }}</td>
                  <td class="text-uppercase" style="font-size: 0.75rem;">{{ h.tipo_solicitud || 'general' }}</td>
                  <td style="white-space: pre-line;">{{ h.mensaje }}</td>
                  <td class="text-center">
                    <span class="badge" :class="h.estado === 'aprobado' ? 'bg-success' : 'bg-warning text-dark'">
                      {{ h.estado.toUpperCase() }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue'
import { api } from '@/api/api'
import * as XLSX from 'xlsx'
import { useHead } from '@vueuse/head'
import selLocalidad from '@/components/select/selLocalidad.vue'
import selProvincia from '@/components/select/selProvincia.vue'

useHead({
  title: 'Legajos | AAAB',
  meta: [{ name: 'description', content: 'Gestión de árbitros registrados en la AAAB.' }],
})

const notificar = inject('notificar')

const arbitros = ref([])
const filtros = reactive({ rol: '' })
const cargando = ref(false)
const provincias = ref([])
const localidades = ref([])
const paginaActual = ref(1)
const registrosPorPagina = 10

const mostrarModal = ref(false)
const modoModal = ref('nuevo')
const movilidadArray = ref([])

// Variable para controlar la visibilidad de los filtros en mobile
const mostrarFiltrosMobile = ref(false)

// --- VARIABLES PARA SOLICITUDES ---
const solicitudes = ref([])
const mostrarModalSolicitudes = ref(false)
const cargandoSolicitudes = ref(false)

// --- VARIABLES PARA HISTORIAL INDIVIDUAL ---
const mostrarModalHistorialArbitro = ref(false)
const historialArbitro = ref([])
const arbitroSeleccionado = ref({})
const cargandoHistorialArbitro = ref(false)

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
})

const formModal = ref(formModalVacio())


const solicitudesPendientes = computed(() => 
  solicitudes.value.filter(s => s.estado === 'enviado')
)

// --- FUNCIONES PARA SOLICITUDES GENERALES ---
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
      notificar({ titulo: 'Aprobado', mensaje: 'Se aprobó la solicitud de cambios.', tipo: 'success' })
      solicitud.estado = 'aprobado'
      await cargarDatos() 
    } else {
      notificar({ titulo: 'Error', mensaje: 'No se pudo aprobar.', tipo: 'danger' })
    }
  } catch{
    notificar({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  }
}

const abrirEdicionDesdeSolicitud = (id_arbitro) => {
  const arbitroEncontrado = arbitros.value.find(a => a.id == id_arbitro)
  
  if (arbitroEncontrado) {
    mostrarModalSolicitudes.value = false
    editarArbitro(arbitroEncontrado)
  } else {
    notificar({ titulo: 'No encontrado', mensaje: 'No se encontraron los datos de este árbitro en la lista actual.', tipo: 'danger' })
  }
}

// --- FUNCIONES PARA HISTORIAL INDIVIDUAL ---
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

// ----------------------------------

const crearNuevo = () => {
  formModal.value = formModalVacio()
  movilidadArray.value = []
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
      mostrarModal.value = false
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
      notificar({ titulo: '¡Guardado!', mensaje: 'Árbitro actualizado correctamente.' })
      mostrarModal.value = false
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
  if (clon.grupo != '3') clon.subgrupo = null;

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
  return localidades.value.filter(l => String(l.provincia_id) === String(filtros.provincia))
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

onMounted(() => { 
  cargarDatos()
  obtenerProvinciasLocalidades()
  cargarSolicitudes() // Inicializamos las solicitudes
})
</script>

<style scoped>
/* ESTILOS EXACTOS DE TU CÓDIGO ORIGINAL */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh; 
  height: auto;      
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 80px; 
}

.admin-panel { 
  width: 100%;
  max-width: 100%; 
  padding: 20px; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;  
  background-color: #0f172a; 
  min-height: 100vh;
  height: 100%; 
}

.header-section { 
  background: white; 
  padding: 15px; 
  border-radius: 8px; 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 15px; 
  border-left: 5px solid #ef4444; 
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
  align-items: center; 
}

.header-info {
  display: flex;
  flex-direction: column;
}

.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #000000; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; } 
.btn-export { background: #10b981; color: white; }

.paginacion {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.btn-paginacion {
  border: none;
  background: #f8fafc;
  color: #0f172a;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paginacion-texto {
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}

.table-container { 
  width: 100%;
  overflow: auto; 
  max-height: 85vh; 
  background: white; 
  border-radius: 8px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
}

table { 
  width: 100%;
  min-width: max-content; 
  border-collapse: collapse !important; 
  border-spacing: 0; 
  font-size: 0.85rem; 
}
thead tr.main-header th { 
  position: sticky; 
  top: 0; 
  z-index: 50; 
  background: #f8fafc; 
  border-bottom: 2px solid #e2e8f0; 
}

thead tr.filter-row td { 
  position: sticky;
  top: 36px; 
  z-index: 40; 
  background: #f1F5F9 !important; 
  border-bottom: 2px solid #cbd5e1; 
}

.sticky-col { 
  position: sticky !important; 
  z-index: 60 !important; 
  background: white !important; 
  box-shadow: inset -1px 0 0 #e2e8f0; 
  background-clip: padding-box; 
}
thead th.sticky-col { 
  z-index: 100 !important; 
  background-color: #f1F5F9 !important; 
}

thead td.sticky-col { 
  z-index: 95 !important; 
  background-color: #f8fafc !important; 
}

th { font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000000; text-transform: uppercase; font-weight: 800; }
.filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; }

.fila-inactiva td, .fila-inactiva .sticky-col { 
  background-color: #ef4444 !important; 
  font-weight: bold; 
  color: #fff !important; 
}

.edit-input { width: 100%; padding: 4px; border: 1px solid transparent; background: transparent; font-size: 0.85rem; color: inherit; }
.edit-input:focus { background: white; border-color: #3b82f6; outline: none; color: #000; }
.edit-textarea { width: 250px; height: 30px; border: 1px solid transparent; background: transparent; font-size: 0.85rem; font-family: inherit; resize: none; padding: 4px; transition: all 0.2s; }
.edit-textarea:focus { height: 80px; background: white; border-color: #3b82f6; outline: none; color: #000; }

.status-wrapper { display: flex; align-items: center; gap: 5px; justify-content: center; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-active { background: #10b981; }
.dot-inactive { background: #fff; border: 1px solid #fff; }
.select-compact { border: 1px solid transparent; background: transparent; cursor: pointer; font-size: 0.8rem; width: 100%; padding: 2px; }
.select-compact:hover { border-color: #cbd5e1; background: #f8fafc; }
select.select-compact { color: #1e293b; text-align-last: center; }

.col-xs-compact { width: 70px; text-align: center; }
.inactivo { background-color: #fee2e2 !important; color: #000 !important; }
.col-dni-compact { width: 90px; text-align: center; }

.date-custom-wrapper { position: relative; display: flex; align-items: center; width: 110px; }
.date-custom-wrapper::before { content: attr(data-date); position: absolute; left: 4px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.85rem; }
.input-fecha-nativa { color: transparent !important; cursor: pointer; }
.input-fecha-nativa::-webkit-calendar-picker-indicator { position: absolute; right: 0; cursor: pointer; }

.modal-overlay-exito { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.modal-content-exito { background: white; border-radius: 30px; padding: 40px; width: 90%; max-width: 750px; text-align: center; color: #000; }
.icon-circle-exito { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.small-select { width: 100%; font-size: 0.8rem; padding: 2px; border: 1px solid transparent; background: transparent; cursor: pointer; }
.small-select:hover { background: #f8fafc; border-color: #cbd5e1; }
.bg-success-light { background: #dcfce7; color: #166534; }

/* SPAN DEL TEXTO PARA OCULTAR EN MOBILE Y CLASE PARA EL BOTÓN EXTRA */
.btn-text { display: inline; }
.btn-blue { background: #3b82f6; color: white; }
.mobile-only-flex { display: none; }
.filter-input-mobile { width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 0.85rem; }

/* VISTA MOBILE CARDS */
.mobile-only { display: none; }
.desktop-only { display: block; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  
  .card-arbitro {
    background: white;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
  .card-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.05rem;
    color: #0f172a;
  }
  .card-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #475569;
    margin-bottom: 8px;
  }
  .card-info p {
    font-size: 0.85rem;
    color: #475569;
    margin: 4px 0;
  }
  .btn-editar-mobile {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
    padding: 10px;
    border-radius: 6px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  
  /* ESTILOS DEL NUEVO BOTÓN HISTORIAL EN MOBILE */
  .btn-historial-mobile {
    background: #fef3c7; 
    border: 1px solid #fde047; 
    color: #d97706; 
    padding: 10px 14px; 
    border-radius: 6px; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    cursor: pointer;
  }

  .card-arbitro.fila-inactiva {
    background-color: #ef4444 !important;
    border-color: #dc2626;
  }
  .card-arbitro.fila-inactiva .card-name,
  .card-arbitro.fila-inactiva .card-row,
  .card-arbitro.fila-inactiva .card-info p,
  .card-arbitro.fila-inactiva .card-header .text-xs {
    color: #fff !important;
  }
  .card-arbitro.fila-inactiva .btn-editar-mobile {
    background: #fff;
    border-color: #fff;
    color: #ef4444; 
  }
  .card-arbitro.fila-inactiva .btn-historial-mobile {
    background: #fff;
    border-color: #fff;
    color: #d97706; 
  }
}

@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

/* =======================================
   AQUÍ ESTÁ LA MAGIA DEL RESPONSIVE MÓVIL 
   ======================================= */
@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .title { font-size: 1rem; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
  
  /* Botones en una sola fila, ocultando el texto */
  .header-actions { 
    width: 100%; 
    display: flex; 
    flex-direction: row; 
    flex-wrap: nowrap; 
    justify-content: space-between; 
    gap: 8px; 
  }
  .btn-action { 
    flex: 1 1 auto; 
    padding: 10px 0; 
    justify-content: center; 
  }
  
  /* Desaparece el texto en móvil, queda solo el ícono */
  .btn-text { 
    display: none !important; 
  }
  
  /* Aparece el botón extra para ver los filtros en móvil */
  .mobile-only-flex { 
    display: flex !important; 
  }
}

/* ─── CLASES NUEVAS PARA SOLO LECTURA Y MODAL ─── */
.cell-ro {
  padding: 4px;
  font-size: 0.85rem;
  color: inherit; 
  white-space: nowrap;
  border-bottom: 1px solid #e2e8f0;
}
.obs-cell { white-space: normal; min-width: 200px; }

.btn-editar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-editar:hover { background: #dbeafe; }

/* BOTÓN DE HISTORIAL (ESCRITORIO) */
.btn-historial { 
  display: inline-flex; align-items: center; justify-content: center; 
  background: #fef3c7; border: 1px solid #fde047; color: #d97706; 
  border-radius: 6px; padding: 4px 8px; cursor: pointer; transition: 0.2s; 
}
.btn-historial:hover { background: #fde047; }

.seccion-titulo {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 4px;
  margin-top: 15px;
  width: 100%;
}

.checkbox-group { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 5px; }
.checkbox-item { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; cursor: pointer; color: #000; }
.bg-info-light { background: #e0f2fe; color: #0369a1; }

.col-id { left: 0; width: 50px; text-align: center; }
.col-acciones { left: 50px; width: 80px; }
.col-apellido { left: 130px; width: 140px; }
.col-nombre { left: 270px; width: 140px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }

/* --- ESTILOS AGREGADOS PARA SOLICITUDES --- */
.badge-notif {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.solicitud-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 12px 15px;
  transition: all 0.2s;
}

.solicitud-card.bg-light {
  border-left: 4px solid #10b981; 
  opacity: 0.8;
}

.text-xs { font-size: 0.75rem; }
</style>
