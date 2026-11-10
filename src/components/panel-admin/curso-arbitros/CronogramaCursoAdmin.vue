<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-calendar3-week me-1"></i> Clases y Asistencia
            </h4>
            <span class="text-muted small d-block mt-1">{{ clasesVisibles.length }} clases en {{ anio }} · cada alumno ve las de su curso</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center">
            <select v-model="filtroCurso" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 150px;" aria-label="Curso">
              <option value="">CURSO</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.corta.toUpperCase() }}</option>
            </select>
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-uppercase text-dark" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <button @click="cargar(anio)" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="abrirNueva" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_box</span>
              <span class="fw-bold d-none d-md-inline small">Nueva clase</span>
            </button>
          </div>
        </div>

        <div class="card-body p-3 bg-white">
          <div v-if="cargando" class="text-center p-5">
            <span class="spinner-border text-danger"></span><p class="text-muted mt-3 mb-0 fw-bold">Cargando clases...</p>
          </div>
          <div v-else-if="!clasesVisibles.length" class="text-center py-5 text-muted">
            <span class="material-icons d-block fs-1 mb-2 opacity-50">event_busy</span>
            <span class="fw-bold">Todavía no hay clases cargadas para {{ anio }}.</span>
          </div>
          <div v-else class="accordion">
            <div v-for="grupo in mesesAcordeon" :key="grupo.mes" class="accordion-item">
              <h2 class="accordion-header">
                <button
                  type="button"
                  class="accordion-button fw-bold"
                  :class="{ collapsed: !mesesAbiertos[grupo.mes] }"
                  :aria-expanded="Boolean(mesesAbiertos[grupo.mes])"
                  :aria-controls="'mes-admin-' + grupo.clave"
                  @click="mesesAbiertos[grupo.mes] = !mesesAbiertos[grupo.mes]"
                >
                  <span class="text-uppercase me-2">{{ grupo.mes }}</span>
                  <span class="badge rounded-pill me-1" :class="grupo.proximas ? 'bg-danger' : 'bg-secondary'">{{ grupo.clases.length }} {{ grupo.clases.length === 1 ? 'clase' : 'clases' }}</span>
                  <span v-if="grupo.dictadas" class="badge bg-light text-muted border">{{ grupo.proximas ? grupo.dictadas + ' dictadas' : 'Dictadas' }}</span>
                </button>
              </h2>
              <div v-show="mesesAbiertos[grupo.mes]" :id="'mes-admin-' + grupo.clave" class="accordion-collapse">
                <div class="accordion-body p-2 p-md-3">
              <div class="row g-3">
                <div v-for="c in grupo.clases" :key="c.id" class="col-12 col-md-6 col-xl-4">
                  <div class="tarjeta-clase border rounded-3 p-3 h-100" :class="{ pasada: esClasePasada(c), proxima: proximaClase?.id === c.id }">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
                      <div>
                        <div class="fw-bold text-dark small">{{ fechaLargaClase(c.fecha) }}</div>
                        <div v-if="horarioClase(c)" class="text-muted small">{{ horarioClase(c) }}</div>
                      </div>
                      <span v-if="proximaClase?.id === c.id" class="badge bg-danger">Próxima</span>
                      <span v-else-if="esClasePasada(c)" class="badge bg-secondary">Dictada</span>
                    </div>
                    <span class="badge mt-2" :class="claseCurso(c.curso)">{{ etiquetaCurso(c.curso) }}</span>
                    <div class="fw-bold text-dark mt-2">{{ c.titulo }}</div>
                    <div class="small text-muted mt-1">
                      <i class="bi" :class="c.modalidad === 'virtual' ? 'bi-camera-video' : 'bi-geo-alt'"></i>
                      {{ c.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}<template v-if="c.lugar"> · {{ c.lugar }}</template>
                    </div>
                    <div v-if="c.docentes?.length" class="small text-dark mt-1"><i class="bi bi-person-video3 me-1"></i><strong>Dictada por:</strong> {{ c.docentes.map(d => d.nombre).join(' · ') }}</div>
                    <div v-if="c.descripcion" class="small text-dark mt-2 texto-multilinea">{{ c.descripcion }}</div>
                    <a v-if="c.enlace" :href="c.enlace" target="_blank" rel="noopener noreferrer" class="small d-inline-block mt-2">
                      <i class="bi bi-link-45deg"></i> Enlace
                    </a>
                    <div class="d-flex flex-wrap gap-2 mt-3">
                      <button @click="abrirAsistencia(c)" class="btn btn-sm btn-outline-success flex-fill fw-bold"><i class="bi bi-person-check me-1"></i> Asistencia</button>
                      <button @click="abrirExamen(c)" class="btn btn-sm btn-outline-dark flex-fill fw-bold"><i class="bi bi-journal-check me-1"></i> Examen</button>
                      <button @click="abrirEditar(c)" class="btn btn-sm btn-outline-primary flex-fill fw-bold"><i class="bi bi-pencil me-1"></i> Editar</button>
                      <button @click="confirmarEliminar(c)" class="btn btn-sm btn-outline-danger flex-fill fw-bold"><i class="bi bi-trash3 me-1"></i> Borrar</button>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalBase :show="mostrarModal" @close="mostrarModal = false" :icono="form.id ? 'edit_calendar' : 'event'" colorIcono="bg-danger-subtle text-danger" maxWidth="640px">
      <template #header>
        <span class="fw-bold fs-5">{{ form.id ? 'Editar clase' : 'Nueva clase' }}</span>
      </template>
      <form id="formClaseCurso" class="text-start" novalidate @submit.prevent="guardar">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <label for="clase-fecha" class="form-label small fw-bold text-dark">Fecha *</label>
            <input id="clase-fecha" v-model="form.fecha" type="date" class="form-control" :class="{ 'is-invalid': intento && !form.fecha }">
          </div>
          <div class="col-6 col-md-4">
            <label for="clase-desde" class="form-label small fw-bold text-dark">Desde</label>
            <input id="clase-desde" v-model="form.horaInicio" type="time" class="form-control">
          </div>
          <div class="col-6 col-md-4">
            <label for="clase-hasta" class="form-label small fw-bold text-dark">Hasta</label>
            <input id="clase-hasta" v-model="form.horaFin" type="time" class="form-control" :class="{ 'is-invalid': intento && errorHorario }">
            <div class="invalid-feedback">{{ errorHorario }}</div>
          </div>
          <div class="col-12">
            <label for="clase-titulo" class="form-label small fw-bold text-dark">Tema de la clase *</label>
            <input id="clase-titulo" v-model.trim="form.titulo" type="text" maxlength="150" class="form-control" :class="{ 'is-invalid': intento && !form.titulo }" placeholder="Ej: Reglas 1 a 4 — El campo de juego">
          </div>
          <div class="col-12">
            <label for="clase-docentes" class="form-label small fw-bold text-dark">Dictada por</label>
            <SelectorArbitros id="clase-docentes" v-model="form.docentes" />
          </div>
          <div class="col-12">
            <label for="clase-curso" class="form-label small fw-bold text-dark">Curso *</label>
            <select id="clase-curso" v-model="form.curso" class="form-select">
              <option value="ambos">Ambos cursos (anual e intensivo)</option>
              <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">Solo {{ m.etiqueta.toLowerCase() }}</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <label for="clase-modalidad" class="form-label small fw-bold text-dark">Modalidad</label>
            <select id="clase-modalidad" v-model="form.modalidad" class="form-select">
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
          <div class="col-12 col-md-8">
            <label for="clase-lugar" class="form-label small fw-bold text-dark">Lugar</label>
            <input id="clase-lugar" v-model.trim="form.lugar" type="text" maxlength="255" class="form-control" :placeholder="form.modalidad === 'virtual' ? 'Ej: Zoom' : 'Ej: La Casa del Handball'">
          </div>
          <div class="col-12">
            <label for="clase-enlace" class="form-label small fw-bold text-dark">Enlace (opcional)</label>
            <input id="clase-enlace" v-model.trim="form.enlace" type="url" maxlength="500" class="form-control" :class="{ 'is-invalid': intento && errorEnlace }" placeholder="https://...">
            <div class="invalid-feedback">{{ errorEnlace }}</div>
          </div>
          <div class="col-12">
            <label for="clase-descripcion" class="form-label small fw-bold text-dark">Descripción (opcional)</label>
            <textarea id="clase-descripcion" v-model.trim="form.descripcion" rows="3" maxlength="2000" class="form-control" placeholder="Contenidos, material para traer, etc."></textarea>
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="mostrarModal = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formClaseCurso" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
          <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
          {{ guardando ? 'GUARDANDO...' : 'GUARDAR' }}
        </button>
      </template>
    </ModalBase>
    <ModalBase :show="mostrarAsistencia" @close="mostrarAsistencia = false" icono="how_to_reg" colorIcono="bg-success-subtle text-success" maxWidth="640px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Asistencia</span>
          <div v-if="claseAsistencia" class="text-muted small mt-1">{{ fechaLargaClase(claseAsistencia.fecha) }} · {{ claseAsistencia.titulo }}</div>
        </div>
      </template>
      <div v-if="cargandoAsistencia" class="text-center py-4"><span class="spinner-border text-success"></span><p class="text-muted mt-2 mb-0 fw-bold small">Cargando asistencia...</p></div>
      <div v-else class="text-start">
        <div v-if="!alumnosAsistencia.length" class="text-muted small fst-italic">No hay alumnos regulares de este curso en {{ claseAsistencia?.fecha?.substring(0, 4) }}.</div>
        <template v-else>
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div class="d-flex flex-wrap gap-1 small">
              <button type="button" class="badge border-0 filtro-badge bg-success" :class="{ activo: filtroAsistencia === 'presente', apagado: filtroAsistencia && filtroAsistencia !== 'presente' }" :aria-pressed="filtroAsistencia === 'presente'" @click="alternarFiltroAsistencia('presente')">{{ conteoAsistencia.presente }} presentes</button>
              <button type="button" class="badge border-0 filtro-badge bg-secondary" :class="{ activo: filtroAsistencia === 'ausente', apagado: filtroAsistencia && filtroAsistencia !== 'ausente' }" :aria-pressed="filtroAsistencia === 'ausente'" @click="alternarFiltroAsistencia('ausente')">{{ conteoAsistencia.ausente }} ausentes</button>
              <button type="button" class="badge filtro-badge bg-light text-muted border" :class="{ activo: filtroAsistencia === 'sin', apagado: filtroAsistencia && filtroAsistencia !== 'sin' }" :aria-pressed="filtroAsistencia === 'sin'" @click="alternarFiltroAsistencia('sin')">{{ conteoAsistencia.sin }} sin marcar</button>
              <button v-if="filtroAsistencia" type="button" class="btn btn-link btn-sm p-0 ms-1 text-decoration-none small" @click="filtroAsistencia = null">Ver todos</button>
            </div>
            <button type="button" class="btn btn-sm btn-outline-success fw-bold" @click="marcarTodos('presente')">Todos presentes</button>
          </div>
          <div class="d-flex flex-column gap-2">
            <div v-if="!alumnosAsistenciaVisibles.length" class="text-muted small fst-italic">No hay alumnos en este filtro.</div>
            <div v-for="a in alumnosAsistenciaVisibles" :key="a.id" class="fila-asistencia d-flex justify-content-between align-items-center gap-2">
              <div class="min-w-0">
                <div class="fw-bold text-dark small text-uppercase text-truncate">{{ a.apellido }}, {{ a.nombre }}</div>
                <div class="text-muted" style="font-size: 0.72rem;">
                  {{ MODALIDADES_CURSO[a.modalidadCurso]?.corta }}
                  <span v-if="a.tieneExamen" class="badge bg-info-subtle text-info-emphasis ms-1" title="Ya rindió o tiene nota en el examen de esta clase">
                    <i class="bi bi-journal-check"></i> Rindió
                  </span>
                </div>
              </div>
              <div class="btn-group btn-group-sm flex-shrink-0" role="group" :aria-label="`Asistencia de ${a.apellido}`">
                <button type="button" class="btn fw-bold" :class="a.asistencia === 'presente' ? 'btn-success' : 'btn-outline-success'" @click="a.asistencia = a.asistencia === 'presente' ? null : 'presente'">✓ Presente</button>
                <button type="button" class="btn fw-bold" :class="a.asistencia === 'ausente' ? 'btn-secondary' : 'btn-outline-secondary'" @click="a.asistencia = a.asistencia === 'ausente' ? null : 'ausente'">✗ Ausente</button>
              </div>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <button type="button" @click="mostrarAsistencia = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="button" @click="guardarAsistencia" class="btn btn-success rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoAsistencia || !alumnosAsistencia.length">
          <span v-if="guardandoAsistencia" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR ASISTENCIA
        </button>
      </template>
    </ModalBase>
    <ModalBase :show="mostrarExamen" @close="mostrarExamen = false" icono="quiz" colorIcono="bg-dark-subtle text-dark" maxWidth="680px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Programar examen</span>
          <div v-if="claseExamen" class="text-muted small mt-1">{{ fechaLargaClase(claseExamen.fecha) }} · {{ claseExamen.titulo }}</div>
        </div>
      </template>
      <div v-if="cargandoExamen" class="text-center py-4"><span class="spinner-border text-dark"></span><p class="text-muted mt-2 mb-0 fw-bold small">Cargando examen...</p></div>
      <form v-else id="formExamenClase" class="text-start" novalidate @submit.prevent="guardarExamen">
        <div v-if="otrosExamenesClase.length" class="small text-muted mb-2">
          <i class="bi bi-collection me-1"></i> La clase también tiene:
          <span v-for="o in otrosExamenesClase" :key="o.id" class="badge bg-light text-dark border fw-normal ms-1">{{ o.titulo }}</span>
        </div>
        <div v-if="examenExistente" class="alert alert-light border small py-2">
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <span><i class="bi bi-info-circle me-1"></i> Estás editando <strong>{{ examenExistente.titulo }}</strong> de esta clase ({{ examenExistente.rendidos }} resultado(s) cargado(s)).</span>
            <button type="button" class="btn btn-outline-danger btn-sm fw-bold flex-shrink-0" :disabled="borrandoExamen" @click="confirmarBorrarExamen">
              <span v-if="borrandoExamen" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-trash3 me-1"></i> Borrar examen
            </button>
          </div>
        </div>
        <div class="btn-group w-100 mb-3" role="group" aria-label="Tipo de examen">
          <button type="button" class="btn fw-bold" :class="formExamen.tipo === 'teorico' ? 'btn-danger' : 'btn-outline-danger'" @click="formExamen.tipo = 'teorico'">
            <i class="bi bi-journal-text me-1"></i> Teórico
          </button>
          <button type="button" class="btn fw-bold" :class="formExamen.tipo === 'fisico' ? 'btn-primary' : 'btn-outline-primary'" @click="formExamen.tipo = 'fisico'">
            <i class="bi bi-stopwatch me-1"></i> Físico
          </button>
        </div>
        <div class="d-flex flex-column gap-2 mb-3" role="radiogroup" :aria-label="esFisico ? 'Tipo de examen físico' : 'Tipo de examen teórico'">
          <label v-for="m in modosExamen" :key="m.valor" class="opcion-modo" :class="{ activa: formExamen.modo === m.valor }">
            <input v-model="formExamen.modo" class="form-check-input me-2" type="radio" :value="m.valor">
            <span class="fw-bold">{{ m.etiqueta }}</span>
            <span class="d-block small text-muted">{{ m.ayuda }}</span>
          </label>
        </div>
        <div v-if="esRecuperatorioFinal" class="mb-3">
          <div v-if="!finalesDisponibles.length" class="alert alert-danger small py-2 mb-0">
            <i class="bi bi-exclamation-triangle me-1"></i> Todavía no hay un {{ esFisico ? 'físico final' : 'teórico final' }} programado para recuperar.
          </div>
          <template v-else>
            <label for="ex-final-original" class="form-label small fw-bold text-dark">{{ esFisico ? 'Físico final' : 'Teórico final' }} que se recupera *</label>
            <select id="ex-final-original" v-model="formExamen.idExamenFinal" class="form-select" :class="{ 'is-invalid': intentoExamen && !formExamen.idExamenFinal }">
              <option :value="null" disabled>Seleccionar...</option>
              <option v-for="fin in finalesDisponibles" :key="fin.id" :value="fin.id">{{ fechaDMA(fin.fecha) }} · {{ fin.titulo }} · {{ fin.desaprobados }} para recuperar</option>
            </select>
          </template>
        </div>
        <div v-if="esRecuperatorioParcialitos" class="mb-3">
          <label for="ex-recup-anterior" class="form-label small fw-bold text-dark">¿Quiénes lo rinden?</label>
          <select id="ex-recup-anterior" v-model="formExamen.idRecuperatorioAnterior" class="form-select">
            <option :value="null">Todos los presentes que deben parcialitos</option>
            <option v-for="r in recuperatoriosAnteriores" :key="r.id" :value="r.id">
              Los que desaprobaron o faltaron al de {{ fechaDMA(r.fecha) }}{{ r.clase ? ' · ' + r.clase : '' }} ({{ r.desaprobados }})
            </option>
          </select>
          <div class="form-text">
            <template v-if="formExamen.idRecuperatorioAnterior">No hace falta que estén presentes en esta clase. Cada uno rinde las reglas de los parcialitos que todavía debe.</template>
            <template v-else-if="recuperatoriosAnteriores.length">Elegí un recuperatorio anterior para que lo rindan solo quienes lo desaprobaron o faltaron.</template>
            <template v-else>No hay recuperatorios de parcialitos en otras clases para vincular.</template>
          </div>
        </div>
        <div v-if="esFisico" class="alert alert-light border small py-2 mb-0">
          <i class="bi bi-info-circle me-1"></i>
          <template v-if="esRecuperatorioFinal">Lo rinden solo quienes desaprobaron o estuvieron ausentes en el físico final.</template>
          El nivel de cada aspirante se carga desde <strong>Exámenes → Físicos</strong>. {{ TEXTO_FISICO }}
        </div>
        <template v-else>
        <p class="small text-muted">
          <template v-if="esRecuperatorioFinal">Lo ven solo los aspirantes que desaprobaron o estuvieron ausentes en el teórico final, aunque no hayan venido a esta clase.</template>
          <template v-else-if="esRecuperatorioParcialitos && formExamen.idRecuperatorioAnterior">Lo ven solo quienes desaprobaron o estuvieron ausentes en el recuperatorio elegido.</template>
          <template v-else-if="esRecuperatorioParcialitos">Lo rinden solo los aspirantes <strong>presentes</strong> en esta clase que tienen parcialitos desaprobados o ausentes.</template>
          <template v-else>Solo pueden rendirlo los aspirantes marcados como <strong>presentes</strong> en la clase.</template>
          La nota y el PDF quedan en <strong>Exámenes</strong>. Se aprueba con el {{ PORCENTAJE_APROBACION_DEFECTO }}%.
        </p>
        <div class="row g-3">
          <div class="col-6">
            <label for="ex-cantidad" class="form-label small fw-bold text-dark">Cantidad de preguntas *</label>
            <input id="ex-cantidad" v-model.number="formExamen.cantidadPreguntas" type="number" min="1" max="100" class="form-control" :class="{ 'is-invalid': intentoExamen && errorCantidad }">
            <div class="invalid-feedback">{{ errorCantidad }}</div>
          </div>
          <div class="col-6">
            <label for="ex-tiempo" class="form-label small fw-bold text-dark">Tiempo (minutos) *</label>
            <input id="ex-tiempo" v-model.number="formExamen.tiempoLimiteMin" type="number" min="1" max="180" class="form-control" :class="{ 'is-invalid': intentoExamen && errorTiempo }">
            <div class="invalid-feedback">{{ errorTiempo }}</div>
          </div>
          <div v-if="esRecuperatorioParcialitos" class="col-12">
            <div class="alert alert-warning small py-2 mb-0">
              <i class="bi bi-magic me-1"></i> Las reglas se toman <strong>automáticamente</strong> de los parcialitos que cada aspirante desaprobó o no rindió.
            </div>
          </div>
          <div v-else class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="form-label small fw-bold text-dark m-0">Reglas * <span class="text-muted fw-normal">({{ preguntasDisponibles }} preguntas disponibles)</span></span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-link btn-sm p-0 fw-bold" @click="formExamen.reglas = reglasDisponibles.map(r => r.codigo)">Todas</button>
                <button type="button" class="btn btn-link btn-sm p-0 fw-bold text-secondary" @click="formExamen.reglas = []">Ninguna</button>
              </div>
            </div>
            <div class="d-flex flex-wrap gap-3 border rounded-3 p-3" :class="{ 'border-danger': intentoExamen && !formExamen.reglas.length }">
              <div v-for="r in reglasDisponibles" :key="r.codigo" class="form-check m-0" style="min-width: 110px;">
                <input :id="'ex-regla-' + r.codigo" v-model="formExamen.reglas" class="form-check-input" type="checkbox" :value="r.codigo">
                <label class="form-check-label small fw-bold" :for="'ex-regla-' + r.codigo">Regla {{ r.codigo }} <span class="text-muted fw-normal">({{ r.cantidad }})</span></label>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="form-check form-switch">
              <input id="ex-habilitado" v-model="formExamen.habilitado" class="form-check-input" type="checkbox" role="switch">
              <label class="form-check-label fw-bold small" for="ex-habilitado">Habilitado para rendir</label>
            </div>
          </div>
        </div>
        </template>
      </form>
      <template #footer>
        <button type="button" @click="mostrarExamen = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formExamenClase" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardandoExamen || cargandoExamen">
          <span v-if="guardandoExamen" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR EXAMEN
        </button>
      </template>
    </ModalBase>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import SelectorArbitros from '@/components/SelectorArbitros.vue'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { PORCENTAJE_APROBACION_DEFECTO } from '@/composables/useExamenesCurso'
import { useCronogramaCurso, fechaLargaClase, horarioClase, esClasePasada } from '@/composables/useCronogramaCurso'

useHead({ title: 'Clases y Asistencia | AAAB' })

const notificar = inject('notificar', (m) => alert(m.mensaje || m))
const toast = inject('toast', (m) => notificar(m))

const { clasesVisibles, filtroCurso, cargando, error, cargar, clasesPorMes, proximaClase } = useCronogramaCurso()

const etiquetaCurso = (curso) => (curso === 'ambos' ? 'Ambos cursos' : MODALIDADES_CURSO[curso]?.etiqueta || curso)
const claseCurso = (curso) => (curso === 'ambos' ? 'bg-light text-dark border' : MODALIDADES_CURSO[curso]?.clase || 'bg-secondary')

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual([String(Number(anioActual()) + 1)]).map(Number))

watch(anio, (a) => cargar(a))

// Acordeón por mes: abiertos los meses con clases por dictar, contraídos los ya dictados
const mesesAcordeon = computed(() => clasesPorMes.value.map((g, i) => ({
  ...g,
  clave: i,
  dictadas: g.clases.filter(esClasePasada).length,
  proximas: g.clases.filter(c => !esClasePasada(c)).length,
})))
const mesesAbiertos = reactive({})
watch(mesesAcordeon, (lista) => {
  lista.forEach(g => {
    if (!(g.mes in mesesAbiertos)) mesesAbiertos[g.mes] = g.proximas > 0
  })
}, { immediate: true })
watch(anio, () => Object.keys(mesesAbiertos).forEach(k => delete mesesAbiertos[k]))
watch(error, (m) => { if (m) notificar({ titulo: 'Error', mensaje: m, tipo: 'danger' }) })

// ─── Nueva / Editar ──────────────────────────────────────────────
// Horario habitual de las clases del curso: 19:30 a 22:00
const HORA_INICIO_DEFECTO = '19:30'
const HORA_FIN_DEFECTO = '22:00'

const claseVacia = () => ({ id: null, fecha: '', horaInicio: HORA_INICIO_DEFECTO, horaFin: HORA_FIN_DEFECTO, titulo: '', curso: 'ambos', modalidad: 'presencial', lugar: '', enlace: '', descripcion: '', docentes: [] })
const form = ref(claseVacia())
const mostrarModal = ref(false)
const intento = ref(false)
const guardando = ref(false)

const errorHorario = computed(() =>
  form.value.horaInicio && form.value.horaFin && form.value.horaFin <= form.value.horaInicio
    ? 'Tiene que ser posterior al inicio.'
    : ''
)
const errorEnlace = computed(() => {
  if (!form.value.enlace) return ''
  try {
    const url = new URL(form.value.enlace)
    return ['http:', 'https:'].includes(url.protocol) ? '' : 'Tiene que empezar con https://'
  } catch {
    return 'Ingresá un enlace válido (https://...).'
  }
})

const abrirNueva = () => {
  form.value = claseVacia()
  intento.value = false
  mostrarModal.value = true
}

const abrirEditar = (c) => {
  form.value = {
    id: c.id, fecha: c.fecha, horaInicio: c.hora_inicio || '', horaFin: c.hora_fin || '', titulo: c.titulo, curso: c.curso || 'ambos',
    modalidad: c.modalidad || 'presencial', lugar: c.lugar || '', enlace: c.enlace || '', descripcion: c.descripcion || '',
    docentes: [...(c.docentes || [])],
  }
  intento.value = false
  mostrarModal.value = true
}

const guardar = async () => {
  intento.value = true
  if (!form.value.fecha || !form.value.titulo || errorHorario.value || errorEnlace.value) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Revisá la fecha, el tema y los campos marcados.', tipo: 'danger' })
    return
  }
  guardando.value = true
  try {
    const res = await api.post({ entity: 'cronograma_curso_arbitro', action: 'guardarClaseCurso', payload: { ...form.value, docentes: form.value.docentes.map(d => d.id) } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar la clase')
    toast({ titulo: 'Guardado', mensaje: 'La clase se guardó en el cronograma.', tipo: 'success' })
    mostrarModal.value = false
    const anioClase = Number(form.value.fecha.substring(0, 4))
    if (anioClase !== anio.value) anio.value = anioClase
    else await cargar(anio.value)
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

// ─── Borrar ──────────────────────────────────────────────────────
const eliminar = async (c) => {
  try {
    const res = await api.post({ entity: 'cronograma_curso_arbitro', action: 'eliminarClaseCurso', payload: { id: c.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar la clase')
    toast({ titulo: 'Borrada', mensaje: 'La clase se quitó del cronograma.', tipo: 'success' })
    await cargar(anio.value)
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  }
}

const confirmarEliminar = (c) => {
  notificar({
    titulo: '¿Borrar clase?',
    mensaje: `${fechaLargaClase(c.fecha)} · ${c.titulo}. Los alumnos dejarán de verla y se borra el examen que tenga programado (con sus notas y recuperatorios).`,
    tipo: 'danger',
    alConfirmar: () => eliminar(c),
  })
}

// ─── Asistencia ──────────────────────────────────────────────────
const mostrarAsistencia = ref(false)
const claseAsistencia = ref(null)
const alumnosAsistencia = ref([])
const cargandoAsistencia = ref(false)
const guardandoAsistencia = ref(false)

const conteoAsistencia = computed(() => ({
  presente: alumnosAsistencia.value.filter(a => a.asistencia === 'presente').length,
  ausente: alumnosAsistencia.value.filter(a => a.asistencia === 'ausente').length,
  sin: alumnosAsistencia.value.filter(a => !a.asistencia).length,
}))

const filtroAsistencia = ref(null)

const alternarFiltroAsistencia = (valor) => {
  filtroAsistencia.value = filtroAsistencia.value === valor ? null : valor
}

const alumnosAsistenciaVisibles = computed(() => {
  if (!filtroAsistencia.value) return alumnosAsistencia.value
  if (filtroAsistencia.value === 'sin') return alumnosAsistencia.value.filter(a => !a.asistencia)
  return alumnosAsistencia.value.filter(a => a.asistencia === filtroAsistencia.value)
})

const marcarTodos = (valor) => alumnosAsistencia.value.forEach(a => { a.asistencia = valor })

const abrirAsistencia = async (c) => {
  claseAsistencia.value = c
  alumnosAsistencia.value = []
  filtroAsistencia.value = null
  mostrarAsistencia.value = true
  cargandoAsistencia.value = true
  try {
    const res = await api.get({ entity: 'cronograma_curso_arbitro', action: 'obtenerAsistenciaClaseCurso', payload: { idClase: c.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar la asistencia')
    // Se guarda la asistencia original para detectar quién pasa a ausente al guardar
    alumnosAsistencia.value = (res.payload.alumnos || []).map(a => ({ ...a, asistenciaOriginal: a.asistencia }))
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
    mostrarAsistencia.value = false
  } finally {
    cargandoAsistencia.value = false
  }
}

// Alumnos que ya rindieron o tienen nota en el examen de la clase y ahora se marcan ausentes:
// al guardar se borra su resultado, por eso se pide confirmación antes.
const alumnosQuePierdenExamen = computed(() =>
  alumnosAsistencia.value.filter(a => a.tieneExamen && a.asistencia === 'ausente' && a.asistenciaOriginal !== 'ausente')
)

const guardarAsistencia = () => {
  const afectados = alumnosQuePierdenExamen.value
  if (afectados.length === 0) {
    enviarAsistencia()
    return
  }
  const nombres = afectados.map(a => `${a.apellido}, ${a.nombre}`).join(' · ')
  notificar({
    titulo: '¿Marcar como ausente?',
    mensaje: afectados.length === 1
      ? `${nombres} ya rindió el examen de esta clase. Si lo marcás ausente se borra su resultado y deja de verlo en su panel. No se puede deshacer.`
      : `Estos alumnos ya rindieron el examen de esta clase: ${nombres}. Si los marcás ausentes se borran sus resultados y dejan de verlos en su panel. No se puede deshacer.`,
    tipo: 'danger',
    alConfirmar: enviarAsistencia,
  })
}

const enviarAsistencia = async () => {
  guardandoAsistencia.value = true
  try {
    const res = await api.post({
      entity: 'cronograma_curso_arbitro',
      action: 'guardarAsistenciaClaseCurso',
      payload: {
        idClase: claseAsistencia.value.id,
        asistencias: alumnosAsistencia.value.map(a => ({ idAlumno: a.id, asistencia: a.asistencia })),
      },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar la asistencia')
    toast({ titulo: 'Guardado', mensaje: 'La asistencia se guardó.', tipo: 'success' })
    mostrarAsistencia.value = false
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardandoAsistencia.value = false
  }
}

// ─── Examen online por clase ─────────────────────────────────────
const mostrarExamen = ref(false)
const claseExamen = ref(null)
const cargandoExamen = ref(false)
const guardandoExamen = ref(false)
const intentoExamen = ref(false)
const reglasDisponibles = ref([])
const configDefecto = ref({ cantidadPreguntas: 20, tiempoLimiteMin: 25, reglas: [] })
const TEXTO_FISICO = 'Aprueba con 8.5 (femenino y masculino de 45 años o más) o 9.5 (masculino menor de 45).'
const MODOS_FISICO = [
  { valor: 'simulacro', etiqueta: 'Simulacro', ayuda: 'Para ver cómo están físicamente. No cuenta para el curso.' },
  { valor: 'final', etiqueta: 'Físico final', ayuda: 'Define el resultado del físico del curso.' },
  { valor: 'recuperatorio_final', etiqueta: 'Recuperatorio físico final', ayuda: 'Lo rinden quienes desaprobaron el físico final.' },
]
const MODOS_TEORICO = [
  { valor: 'parcialito', etiqueta: 'Parcialito', ayuda: 'Examen de la clase sobre las reglas que elijas.' },
  { valor: 'recuperatorio', etiqueta: 'Recuperatorio de parcialitos', ayuda: 'Los presentes rinden las reglas de los parcialitos que deben, incluidos quienes desaprobaron o faltaron a un recuperatorio anterior. Se suma al parcialito de la clase, no lo reemplaza.' },
  { valor: 'final', etiqueta: 'Teórico final', ayuda: 'Define el teórico del curso.' },
  { valor: 'recuperatorio_final', etiqueta: 'Recuperatorio teórico final', ayuda: 'Lo rinden quienes desaprobaron el teórico final.' },
]
const formExamen = ref({ tipo: 'teorico', cantidadPreguntas: 20, tiempoLimiteMin: 25, reglas: [], habilitado: true, modo: 'parcialito', idExamenFinal: null, idRecuperatorioAnterior: null })
const recuperatoriosAnteriores = ref([])
const esFisico = computed(() => formExamen.value.tipo === 'fisico')
const modosExamen = computed(() => (esFisico.value ? MODOS_FISICO : MODOS_TEORICO))
const esRecuperatorioParcialitos = computed(() => formExamen.value.modo === 'recuperatorio')
const esRecuperatorioFinal = computed(() => formExamen.value.modo === 'recuperatorio_final')
const REGLAS_FINAL = Array.from({ length: 18 }, (_, i) => i + 1)
// La clase puede tener a la vez un teórico, un recuperatorio de parcialitos y un físico
// (por ejemplo, el parcialito de la clase y un segundo recuperatorio para quienes desaprobaron o faltaron al primero)
const examenesClase = ref({ teorico: null, recuperatorio: null, fisico: null })
const lugarDelExamen = (tipo, modo) => (tipo === 'fisico' ? 'fisico' : modo === 'recuperatorio' ? 'recuperatorio' : 'teorico')
const lugarActual = computed(() => lugarDelExamen(formExamen.value.tipo, formExamen.value.modo))
const examenExistente = computed(() => examenesClase.value[lugarActual.value] || null)
const otrosExamenesClase = computed(() =>
  ['teorico', 'recuperatorio', 'fisico']
    .filter(l => l !== lugarActual.value && examenesClase.value[l])
    .map(l => examenesClase.value[l])
)

const formularioDesde = (tipo, guardado) => {
  const codigos = reglasDisponibles.value.map(r => r.codigo)
  const base = guardado || { ...configDefecto.value, habilitado: true }
  return {
    tipo,
    cantidadPreguntas: base.cantidadPreguntas,
    tiempoLimiteMin: base.tiempoLimiteMin,
    reglas: (base.reglas || []).filter(r => codigos.includes(r)),
    habilitado: base.habilitado,
    modo: base.modo || (tipo === 'fisico' ? 'simulacro' : 'parcialito'),
    // En el recuperatorio de parcialitos, el examen vinculado es el recuperatorio anterior
    idExamenFinal: base.modo === 'recuperatorio' ? null : base.idExamenFinal || null,
    idRecuperatorioAnterior: base.modo === 'recuperatorio' ? base.idExamenFinal || null : null,
  }
}

const finales = ref({ teorico: [], fisico: [] })
const finalesDisponibles = computed(() => finales.value[formExamen.value.tipo] || [])

// Al elegir el recuperatorio del final se propone el final (si hay uno solo) y sus mismas reglas.
// Los watchers son síncronos para no pisar la configuración guardada al abrir un examen existente.
let aplicandoExamenGuardado = false
watch(() => formExamen.value.tipo, (tipo) => {
  if (aplicandoExamenGuardado) return
  aplicandoExamenGuardado = true
  formExamen.value = formularioDesde(tipo, examenesClase.value[tipo])
  aplicandoExamenGuardado = false
}, { flush: 'sync' })
// Pasar a (o salir de) "Recuperatorio de parcialitos" cambia de examen: se carga el que corresponde a ese lugar
watch(() => formExamen.value.modo, (modo, modoAnterior) => {
  if (aplicandoExamenGuardado || esFisico.value) return
  const lugar = lugarDelExamen('teorico', modo)
  if (lugar === lugarDelExamen('teorico', modoAnterior)) return
  aplicandoExamenGuardado = true
  const guardado = examenesClase.value[lugar]
  formExamen.value = { ...formularioDesde('teorico', guardado), modo }
  aplicandoExamenGuardado = false
}, { flush: 'sync' })
watch(() => formExamen.value.modo, (modo) => {
  if (aplicandoExamenGuardado || modo !== 'recuperatorio_final' || formExamen.value.idExamenFinal) return
  if (finalesDisponibles.value.length === 1) formExamen.value.idExamenFinal = finalesDisponibles.value[0].id
}, { flush: 'sync' })
const reglasEnUso = computed(() => formExamen.value.reglas)

// Al elegir el teórico final (o su recuperatorio) se tildan las reglas 1 a 18
watch(() => formExamen.value.modo, (modo) => {
  if (aplicandoExamenGuardado || esFisico.value || !['final', 'recuperatorio_final'].includes(modo)) return
  const conPreguntas = reglasDisponibles.value.map(r => r.codigo)
  formExamen.value.reglas = REGLAS_FINAL.filter(r => conPreguntas.includes(r))
}, { flush: 'sync' })
const preguntasDisponibles = computed(() =>
  reglasDisponibles.value.filter(r => reglasEnUso.value.includes(r.codigo)).reduce((t, r) => t + r.cantidad, 0)
)
const errorCantidad = computed(() => {
  const n = Number(formExamen.value.cantidadPreguntas)
  if (!Number.isInteger(n) || n < 1 || n > 100) return 'Entre 1 y 100.'
  if (!esRecuperatorioParcialitos.value && reglasEnUso.value.length && n > preguntasDisponibles.value) return `Hay solo ${preguntasDisponibles.value} preguntas.`
  return ''
})
const errorTiempo = computed(() => {
  const n = Number(formExamen.value.tiempoLimiteMin)
  return Number.isInteger(n) && n >= 1 && n <= 180 ? '' : 'Entre 1 y 180.'
})

const cargarReglas = async () => {
  if (reglasDisponibles.value.length) return
  const res = await api.get({ entity: 'examenes_habilitaciones', action: 'obtenerReglasExamen', payload: {} })
  if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar las reglas')
  reglasDisponibles.value = (res.payload?.reglas || []).map(r => ({ codigo: Number(r.codigo), cantidad: Number(r.cantidad) }))
  const d = res.payload?.defecto || {}
  configDefecto.value = { cantidadPreguntas: Number(d.cantidadPreguntas) || 20, tiempoLimiteMin: Number(d.tiempoLimiteMin) || 25, reglas: (d.reglas || []).map(Number) }
}

const abrirExamen = async (c) => {
  claseExamen.value = c
  examenesClase.value = { teorico: null, recuperatorio: null, fisico: null }
  intentoExamen.value = false
  mostrarExamen.value = true
  cargandoExamen.value = true
  try {
    await cargarReglas()
    const [res, resTeorico, resFisico, resRecuperatorios] = await Promise.all([
      api.get({ entity: 'examen_online_curso_arbitro', action: 'obtenerExamenOnlineClaseCurso', payload: { idClase: c.id } }),
      api.get({ entity: 'examen_online_curso_arbitro', action: 'obtenerFinalesParaRecuperatorioCurso', payload: { idClase: c.id, tipo: 'teorico' } }),
      api.get({ entity: 'examen_online_curso_arbitro', action: 'obtenerFinalesParaRecuperatorioCurso', payload: { idClase: c.id, tipo: 'fisico' } }),
      api.get({ entity: 'examen_online_curso_arbitro', action: 'obtenerRecuperatoriosParcialitosAnterioresCurso', payload: { idClase: c.id } }),
    ])
    recuperatoriosAnteriores.value = resRecuperatorios?.ok ? resRecuperatorios.payload || [] : []
    finales.value = {
      teorico: resTeorico?.ok ? resTeorico.payload || [] : [],
      fisico: resFisico?.ok ? resFisico.payload || [] : [],
    }
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar el examen de la clase')
    examenesClase.value = {
      teorico: res.payload?.teorico || null,
      recuperatorio: res.payload?.recuperatorio || null,
      fisico: res.payload?.fisico || null,
    }
    // Arranca en el teórico; si no hay, en el recuperatorio de parcialitos; si solo hay físico, en el físico
    const { teorico, recuperatorio, fisico } = examenesClase.value
    const lugarInicial = teorico ? 'teorico' : recuperatorio ? 'recuperatorio' : fisico ? 'fisico' : 'teorico'
    aplicandoExamenGuardado = true
    formExamen.value = formularioDesde(lugarInicial === 'fisico' ? 'fisico' : 'teorico', examenesClase.value[lugarInicial])
    aplicandoExamenGuardado = false
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
    mostrarExamen.value = false
  } finally {
    cargandoExamen.value = false
  }
}

// Borra solo el examen (y sus recuperatorios); la clase queda
const borrandoExamen = ref(false)

const borrarExamen = async () => {
  const examen = examenExistente.value
  if (!examen) return
  borrandoExamen.value = true
  try {
    const res = await api.post({ entity: 'examenes_curso_arbitro', action: 'eliminarExamenCurso', payload: { id: examen.id } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo borrar el examen')
    const { tipo, modo } = formExamen.value
    const lugar = lugarActual.value
    examenesClase.value = { ...examenesClase.value, [lugar]: null }
    aplicandoExamenGuardado = true
    formExamen.value = { ...formularioDesde(tipo, null), ...(lugar === 'recuperatorio' ? { modo } : {}) }
    aplicandoExamenGuardado = false
    toast({ titulo: 'Examen borrado', mensaje: 'Se borró el examen de la clase. La clase sigue en el cronograma.', tipo: 'success' })
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    borrandoExamen.value = false
  }
}

const confirmarBorrarExamen = () => {
  const examen = examenExistente.value
  if (!examen) return
  notificar({
    titulo: '¿Borrar examen?',
    mensaje: `${examen.titulo}. Se borran también sus notas y recuperatorios. La clase no se borra.`,
    tipo: 'danger',
    alConfirmar: borrarExamen,
  })
}

const guardarExamen = async () => {
  intentoExamen.value = true
  if (esRecuperatorioFinal.value && !formExamen.value.idExamenFinal) {
    notificar({ titulo: 'Faltan datos', mensaje: `Elegí el ${esFisico.value ? 'físico' : 'teórico'} final que se recupera.`, tipo: 'danger' })
    return
  }
  if (!esFisico.value && (errorCantidad.value || errorTiempo.value || (!esRecuperatorioParcialitos.value && !formExamen.value.reglas.length))) {
    notificar({ titulo: 'Faltan datos', mensaje: 'Revisá la cantidad, el tiempo y elegí al menos una regla.', tipo: 'danger' })
    return
  }
  guardandoExamen.value = true
  try {
    const res = await api.post({
      entity: 'examen_online_curso_arbitro',
      action: 'programarExamenClaseCurso',
      payload: { idClase: claseExamen.value.id, ...formExamen.value },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo programar el examen')
    if (esFisico.value) {
      toast({ titulo: 'Examen físico guardado', mensaje: 'El nivel de cada aspirante se carga desde Exámenes → Físicos.', tipo: 'success' })
      mostrarExamen.value = false
      return
    }
    toast({ titulo: 'Examen programado', mensaje: formExamen.value.habilitado ? (esRecuperatorioFinal.value ? 'Los que desaprobaron el teórico final ya pueden rendirlo desde Mis Exámenes.' : esRecuperatorioParcialitos.value ? (formExamen.value.idRecuperatorioAnterior ? 'Los que desaprobaron o faltaron al recuperatorio anterior ya pueden rendirlo desde Mis Exámenes.' : 'Los presentes que deben parcialitos ya pueden rendirlo desde Mis Exámenes.') : 'Los presentes ya pueden rendirlo desde Mis Exámenes.') : 'El examen quedó guardado sin habilitar.', tipo: 'success' })
    mostrarExamen.value = false
  } catch (e) {
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardandoExamen.value = false
  }
}

onMounted(() => cargar(anio.value))
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.5s; }
.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }
.filtro-badge { cursor: pointer; font-size: 0.75rem; padding: 0.35em 0.65em; transition: opacity 0.15s ease, box-shadow 0.15s ease; }
.filtro-badge.activo { box-shadow: 0 0 0 2px #0f172a; }
.filtro-badge.apagado { opacity: 0.45; }
.accordion-item { border-radius: 10px !important; overflow: hidden; margin-bottom: 8px; border: 1px solid #e2e8f0; }
.accordion-button { font-size: 0.9rem; color: #0f172a; background: #fff; box-shadow: none; flex-wrap: wrap; row-gap: 4px; }
.accordion-button:not(.collapsed) { color: #dc2626; background: #fef2f2; }
.accordion-button:focus { box-shadow: 0 0 0 0.2rem rgba(220, 38, 38, 0.2); }
.tarjeta-clase { background-color: #fff; }
.tarjeta-clase.pasada { background-color: #f8fafc; opacity: 0.75; }
.tarjeta-clase.proxima { border-color: #dc3545 !important; box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.15); }
.texto-multilinea { white-space: pre-wrap; }
.opcion-modo { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 12px; cursor: pointer; }
.opcion-modo.activa { border-color: #dc3545; background: #fef2f2; }
.fila-asistencia { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; }
.min-w-0 { min-width: 0; }
</style>
