<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-people-fill me-1"></i> Gestión de Reuniones
            </h4>
            <span class="text-muted small d-block mt-1">Reuniones Mensuales — {{ totalFiltrados }} árbitros</span>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <select 
              v-model="reunionSeleccionada"
              @change="obtenerListadoArbitros"
            >
              <option 
                v-for="(i, k) in arrReuniones"
                :value = i.id
                :key="k"
              >
                {{ i.fecha_formateada }} - {{ i.descripcion }}
              </option>
            </select>
          </div>
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2" aria-label="Mostrar filtros">
              <span class="material-icons fs-6">filter_alt</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" aria-label="Limpiar filtros">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
          </div>
        </div>

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
            <div class="col-12">
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
          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones">Acciones</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                  <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Reuniones</th>
                  <th class="py-3 text-uppercase text-muted">Asistencia</th>
                </tr>
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="cargarTodo" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1" aria-label="Recargar">
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
                      <option value="">Todos los años</option>
                      <option v-for="a in añosDisponibles" :key="a" :value="a">{{ a }}</option>
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
                  <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
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
                      <button @click="abrirGestionReuniones(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Gestionar reuniones" aria-label="Gestionar reuniones">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verDetalleArbitro(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver detalle" aria-label="Ver detalle">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                    </div>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                  <td class="text-center text-dark">{{ a.grupo }}<template v-if="a.subgrupo">/{{ a.subgrupo }}</template></td>
                  <td class="text-center">
                    <span class="badge bg-dark rounded-pill px-2 py-1">{{ (reunionesPorArbitro[a.id] || []).length }}</span>
                  </td>
                  <td><ResumenAsistencia :resumen="resumenAsistencia(a.id)" /></td>
                </tr>
              </tbody>
            </table>
          </div>

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
                    <span class="small"><strong>Reuniones:</strong> {{ (reunionesPorArbitro[a.id] || []).length }}</span>
                  </div>
                  <div class="bg-light p-2 rounded border small mb-3 border-light-subtle">
                    <div class="mt-1"><ResumenAsistencia :resumen="resumenAsistencia(a.id)" mobile /></div>
                  </div>
                  <div class="d-flex gap-2">
                    <button @click="abrirGestionReuniones(a)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold" aria-label="Gestionar">
                      <span class="material-icons" style="font-size: 16px;">edit_note</span> GESTIONAR
                    </button>
                    <button @click="verDetalleArbitro(a)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center" aria-label="Ver detalle">
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
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1" aria-label="Anterior">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas" aria-label="Siguiente">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <ModalBase :show="mostrarModal" @close="cerrarModal" icono="people" colorIcono="bg-danger-subtle text-danger" maxWidth="750px">
      <template #header>
        <div class="d-flex flex-column align-items-center text-center w-100">
          <span class="fw-bold fs-5">Reuniones de {{ arbitroEnModal.apellido }}, {{ arbitroEnModal.nombre }}</span>
          <div class="text-muted small mt-1">
            <span v-if="vistaModal === 'lista'">Registrá asistencia o editá una reunión existente</span>
            <span v-else>{{ modoFormulario === 'editar' ? 'Editando reunión #' + formReunion.id : 'Nueva reunión' }}</span>
          </div>
        </div>
      </template>

      <div v-if="vistaModal === 'lista'">
        <div class="d-flex justify-content-end mb-3 mt-2">
          <button @click="iniciarNuevaReunion" class="btn btn-danger shadow-sm fw-bold d-flex align-items-center gap-1">
            <span class="material-icons" style="font-size: 18px;">add_circle</span> Agregar Reunión
          </button>
        </div>
        <div v-if="!reunionesDelArbitro.length" class="text-center py-5 bg-light rounded shadow-sm border border-light-subtle">
          <span class="material-icons d-block mb-2" style="font-size: 48px; color: #cbd5e1;">event_busy</span>
          <p class="text-muted fw-bold m-0">Este árbitro no tiene reuniones registradas.</p>
          <p class="text-muted small m-0 mt-1">Hacé click en "Agregar Reunión" para empezar.</p>
        </div>
        <div v-else class="d-flex flex-column gap-2 pb-2">
          <div v-for="ex in reunionesDelArbitro" :key="ex.id" class="card border border-light-subtle shadow-sm">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span class="badge bg-dark text-white font-monospace">#{{ ex.id }}</span>
                  <span class="fw-bold text-dark">{{ formatFecha(ex.fecha_examen) }}</span>
                  <span v-if="ex.titulo" class="text-muted small fst-italic">{{ ex.titulo }}</span>
                  <AsistenciaBadge :detalles="ex.detalles" />
                </div>
                <button @click="iniciarEditarReunion(ex)" class="btn btn-sm btn-light border shadow-sm text-danger py-0 px-2" aria-label="Editar reunión">
                  <span class="material-icons" style="font-size: 16px; top: 2px; position:relative;">edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form v-else id="formReunion" @submit.prevent="modoFormulario === 'editar' ? confirmarEdicion() : confirmarAlta()" class="text-start">
        <div class="row g-3 pb-3">
          <div class="col-12 border-bottom border-2 pb-1 text-uppercase fw-bold text-muted small mt-0">Datos de la reunión</div>

          <div class="col-12">
            <label class="small fw-bold text-dark mb-1">Reunión *</label>
            <select v-model="formReunion.id_evento" @change="onEventoSeleccionado" class="form-select shadow-none border-secondary-subtle">
              <option :value="null">Seleccionar reunión...</option>
              <option v-for="ev in eventosParaArbitro" :key="String(ev.id)" :value="String(ev.id)">
                {{ ev.fecha_examen || formatFechaDisplay(ev.fecha_evento) }} — {{ ev.titulo }}
              </option>
            </select>
            <div v-if="eventoEnForm" class="mt-2 d-flex align-items-center gap-2 flex-wrap">
              <span class="badge border bg-light text-dark"><i class="bi bi-calendar3 me-1"></i>{{ eventoEnForm.fecha_examen || formatFechaDisplay(eventoEnForm.fecha_evento) }}</span>
              <span v-if="eventoEnForm.descripcion" class="text-muted small fst-italic">{{ eventoEnForm.descripcion }}</span>
            </div>
            <div v-if="!eventosParaArbitro.length" class="mt-2 alert alert-warning py-2 px-3 small mb-0 border-warning-subtle">
              <i class="bi bi-exclamation-triangle me-1"></i> No hay reuniones disponibles para el grupo de este árbitro.
            </div>
          </div>

          <div class="col-12 col-md-6">
            <label class="small fw-bold text-dark mb-1">Asistencia *</label>
            <select v-model="formReunion.asistencia" class="form-select shadow-none border-secondary-subtle" required>
              <option value="presente">Presente</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>

          <div class="col-12 mt-2">
            <div class="alert py-2 px-3 small mb-0 fw-bold text-center"
              :class="formReunion.asistencia === 'presente' ? 'alert-primary border-primary-subtle' : 'alert-secondary border-secondary-subtle'">
              <i class="bi me-1" :class="formReunion.asistencia === 'presente' ? 'bi-person-check-fill' : 'bi-person-dash-fill'"></i>
              {{ formReunion.asistencia === 'presente' ? 'Se registrará como PRESENTE en la reunión.' : 'Se registrará como AUSENTE en la reunión.' }}
            </div>
          </div>
        </div>
      </form>

      <template #footer v-if="vistaModal !== 'lista'">
        <button @click="volverAListado" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-md-0">
          <i class="bi bi-chevron-left me-1"></i> Volver al listado
        </button>
        <button type="submit" form="formReunion" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
          {{ modoFormulario === 'editar' ? 'GUARDAR CAMBIOS' : 'REGISTRAR REUNIÓN' }}
        </button>
      </template>
    </ModalBase>

    <ModalBase :show="mostrarModalDetalle" @close="mostrarModalDetalle = false" icono="person_search" colorIcono="bg-warning-subtle text-warning-emphasis" maxWidth="800px">
      <template #header>
        <div class="text-center w-100">
          <span class="fw-bold fs-5">Detalle de {{ arbitroSeleccionado.apellido }}, {{ arbitroSeleccionado.nombre }}</span>
          <div class="text-muted small mt-1">Historial de reuniones</div>
        </div>
      </template>

      <div v-if="!reunionesDelArbitroDetalle.length" class="text-center py-5 text-muted bg-white rounded shadow-sm border border-light-subtle">
        <span class="material-icons d-block mb-2" style="font-size: 48px; color: #cbd5e1;">history_toggle_off</span>
        <p class="mb-0 fw-bold">No hay reuniones registradas para este árbitro.</p>
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
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100 bg-primary">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-person-check-fill" style="font-size: 1.2rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ resumenDetalle.presentes }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Presentes</div>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100 bg-secondary">
              <div class="card-body p-2 text-center text-white">
                <i class="bi bi-person-dash-fill" style="font-size: 1.2rem;"></i>
                <div class="fw-bold fs-5 mt-1 lh-1">{{ resumenDetalle.ausentes }}</div>
                <div class="small text-uppercase fw-bold opacity-75 mt-1" style="font-size: 0.65rem;">Ausentes</div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-2 border-warning">
          <span class="material-icons text-warning-emphasis me-2">event_note</span>
          <h6 class="fw-bold m-0 text-dark text-uppercase">Reuniones</h6>
        </div>
        <div class="row g-2">
          <div v-for="ex in reunionesFiltradosDetalle" :key="ex.id" class="col-12 col-md-6">
            <div class="card border border-light-subtle shadow-sm h-100 bg-white">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <div class="text-dark fw-bold small mb-1">
                      <i class="bi bi-calendar3 me-1 text-muted"></i>{{ formatFecha(ex.fecha_examen) }}
                    </div>
                    <div v-if="ex.titulo" class="text-muted small fst-italic">{{ ex.titulo }}</div>
                  </div>
                  <div class="d-flex flex-column align-items-end gap-1">
                    <span class="badge bg-dark font-monospace" style="font-size: 0.65rem;">#{{ ex.id }}</span>
                    <AsistenciaBadge :detalles="ex.detalles" />
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
  title: 'Reuniones | AAAB',
  meta: [{ name: 'description', content: 'Gestión de asistencia a reuniones de árbitros AAAB.' }],
})

// ============== CONSTANTES ==============
const CATEGORIA_REUNION = 'reunion'
const GRUPOS            = ['LH', 'Pre Liga', 'SR', '1', '2', '3', '4']
const MOBILE_BREAKPOINT = 768

const OPCIONES_ESTADO_FILTRO = [
  [4,     'Presente'],
  [2,     'Ausente'],
  ['sin', 'Sin reuniones'],
]

// ============== HELPERS ==============
const formatFechaDisplay = (f) => {
  if (!f) return ''
  const partes = f.split(' ')[0].split('-')
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : f
}
const normalizarTexto = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const formatFecha    = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha     = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const parseFecha     = (f) => {
  if (!f) return 0
  const soloFecha = f.split(' ')[0]
  if (soloFecha.includes('/')) {
    const [d, m, y] = soloFecha.split('/')
    return new Date(`${y}-${m}-${d}`).getTime() || 0
  }
  return new Date(soloFecha).getTime() || 0
}
const fechaParaInput = (f) => {
  if (!f) return ''
  const soloFecha = f.split(' ')[0]
  if (soloFecha.includes('/')) {
    const [d, m, y] = soloFecha.split('/')
    return `${y}-${m}-${d}`
  }
  return soloFecha // Ya está en formato YYYY-MM-DD
}

const fechaParaMySQL = (f) => {
  if (!f) return null;
  const soloFecha = f.split(' ')[0];
  if (soloFecha.includes('/')) {
    let [d, m, y] = soloFecha.split('/');
    if (y.length === 2) y = '20' + y; // Convierte '26' a '2026'
    return `${y}-${m}-${d} 00:00:00`;
  }
  return `${soloFecha} 00:00:00`;
}
const sortPorFecha   = (lista) => [...lista].sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))

// ============== COMPONENTES INTERNOS ==============

// Badge de asistencia para la lista y el historial
const AsistenciaBadge = defineComponent({
  props: { detalles: Array },
  setup(props) {
    return () => {
      const dets = props.detalles || []
      const esAusente = dets.some(d => d.estado == 2)
      return h('span', {
        class: esAusente ? 'badge bg-secondary text-white px-2 py-1' : 'badge bg-primary text-white px-2 py-1',
      }, esAusente ? 'AUSENTE' : 'PRESENTE')
    }
  },
})

// Badges de resumen de asistencia en la tabla principal
const ResumenAsistencia = defineComponent({
  props: { resumen: Object, mobile: Boolean },
  setup(props) {
    return () => {
      const r = props.resumen
      const items = []
      if (r.presentes > 0) items.push({ label: 'Presentes', labelShort: 'pres.', badge: 'bg-primary', icon: 'bi-person-check', count: r.presentes })
      if (r.ausentes  > 0) items.push({ label: 'Ausentes',  labelShort: 'aus.',  badge: 'bg-secondary', icon: 'bi-person-dash', count: r.ausentes })
      if (!items.length) return h('span', { class: 'text-muted small fst-italic' }, '—')
      return h('div', { class: 'd-flex gap-1 flex-wrap' }, items.map(k =>
        h('span', { class: `badge ${k.badge} text-white px-2 py-1`, title: k.label },
          props.mobile ? `${k.count} ${k.labelShort}` : [h('i', { class: `bi ${k.icon} me-1` }), String(k.count)]
        )
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

const filtros = reactive({ apellido: '', nombre: '', grupo: '', año: '', tieneEstado: '' })

const formReunionVacio = () => ({
  id:           null,
  id_arbitro:   arbitroEnModal.value?.id ?? '',
  id_evento:    null,
  fecha_examen: '',
  asistencia:   'presente',
})

const formReunion         = ref(formReunionVacio())
const formReunionSnapshot = ref('')

// -------------------- Aplicación del BE ------------------

const reunionSeleccionada = ref(null)
const arrReuniones = ref([])
const obtenerReuniones = async () => {
  const { payload } = await api.get({
    entity: 'reuniones',
    action: 'obtenerReuniones'
  })
  arrReuniones.value = payload
}
const obtenerListadoArbitros = async () => {
  cargandoInicial.value = true
  const { payload } = await api.get({
    entity: 'reuniones',
    action: 'obtenerArbitrosReunion',
    payload: {
      idEvento: reunionSeleccionada.value
    }
  })
  arbitros.value = payload
  cargandoInicial.value = false

}

// ---------------------------------------------------------

// ============== COMPUTEDS ==============

// Solo filtramos las que son de categoría reunion
const reunionesCategoria = computed(() => examenes.value.filter(ex => ex.tipo === CATEGORIA_REUNION))

const reunionesPorArbitro = computed(() =>
  reunionesCategoria.value.reduce((map, ex) => {
    ;(map[ex.id_arbitro] ??= []).push(ex)
    return map
  }, {})
)

const resumenPorArbitro = computed(() => {
  const map = {}
  for (const [id, lista] of Object.entries(reunionesPorArbitro.value)) {
    const r = { presentes: 0, ausentes: 0 }
    for (const ex of lista)
      for (const det of (ex.detalles || []))
        if (det.estado == 4) r.presentes++
        else if (det.estado == 2) r.ausentes++
    map[id] = { ...r, total: r.presentes + r.ausentes }
  }
  return map
})

const resumenAsistencia = (id) => resumenPorArbitro.value[id] ?? { presentes: 0, ausentes: 0, total: 0 }

const añosDisponibles = computed(() => {
  const set = new Set()
  for (const ex of reunionesCategoria.value) {
    const año = añoDeFecha(ex.fecha_examen)
    if (año) set.add(año)
  }
  return [...set].sort((a, b) => Number(b) - Number(a))
})

const reunionesDelArbitro = computed(() =>
  arbitroEnModal.value?.id
    ? sortPorFecha(reunionesPorArbitro.value[arbitroEnModal.value.id] || [])
    : []
)

// Eventos filtrados: grupo del árbitro
const eventosParaArbitro = computed(() => {
  if (!arbitroEnModal.value?.id) return []
  const grupoObj = grupos.value.find(g =>
    g.nombre === arbitroEnModal.value.grupo &&
    (!arbitroEnModal.value.subgrupo || g.subgrupo === arbitroEnModal.value.subgrupo)
  )
  const idGrupo = grupoObj ? String(grupoObj.id) : null

  const idsDeApi = new Set(eventos.value.map(ev => String(ev.id)))
  const deExamenes = [...new Map(
    reunionesCategoria.value
      .filter(ex => ex.id_evento)
      .map(ex => [String(ex.id_evento), {
        id: ex.id_evento, titulo: ex.titulo ?? '', descripcion: ex.descripcion ?? '',
        fecha_evento: ex.fecha_evento ?? '', fecha_examen: ex.fecha_examen ?? '',
        id_grupos: ex.id_grupos ?? '', todos_grupos: ex.todos_grupos ?? 0,
        categoria: CATEGORIA_REUNION,
      }])
  ).values()]

  const todos = [...eventos.value]
  for (const ev of deExamenes) {
    if (!idsDeApi.has(String(ev.id))) todos.push(ev)
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
  formReunion.value.id_evento
    ? eventosParaArbitro.value.find(ev => String(ev.id) === String(formReunion.value.id_evento)) ?? null
    : null
)

// ============== FILTROS Y ORDENAMIENTO (SIN FLECHAS) ==============
const arbitrosFiltrados = computed(() => {
  const { apellido, nombre, grupo, año, tieneEstado } = filtros
  return arbitros.value.filter(a => {
    if (apellido && !normalizarTexto(a.apellido).includes(normalizarTexto(apellido))) return false
    if (nombre   && !normalizarTexto(a.nombre).includes(normalizarTexto(nombre)))     return false
    if (grupo    && String(a.grupo) !== String(grupo))                                return false

    const lista      = reunionesPorArbitro.value[a.id] || []
    const listaEnAño = año ? lista.filter(ex => añoDeFecha(ex.fecha_examen) === año) : lista

    if (año && !listaEnAño.length) return false
    if (tieneEstado !== '') {
      if (tieneEstado === 'sin') { if (lista.length > 0) return false }
      else if (!listaEnAño.some(ex => (ex.detalles || []).some(d => d.estado == tieneEstado))) return false
    }
    return true
  })
})

const arbitrosOrdenados = computed(() => {
  // Ordenamiento base por Apellido por defecto
  return [...arbitrosFiltrados.value].sort((a, b) => {
    return String(normalizarTexto(a.apellido)).localeCompare(String(normalizarTexto(b.apellido)), 'es')
  })
})

const totalPaginas      = computed(() => Math.ceil(arbitrosOrdenados.value.length / registrosPorPagina) || 1)
const totalFiltrados    = computed(() => arbitrosOrdenados.value.length)
const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return arbitrosOrdenados.value.slice(inicio, inicio + registrosPorPagina)
})

// ============== DETALLE ÁRBITRO ==============
const reunionesDelArbitroDetalle = computed(() => {
  if (!arbitroSeleccionado.value?.id) return []
  return sortPorFecha(reunionesPorArbitro.value[arbitroSeleccionado.value.id] || [])
})

const añosDetalleArbitro = computed(() => {
  const set = new Set()
  for (const ex of reunionesDelArbitroDetalle.value) {
    const año = añoDeFecha(ex.fecha_examen)
    if (año) set.add(año)
  }
  return [...set].sort((a, b) => Number(b) - Number(a))
})

const reunionesFiltradosDetalle = computed(() =>
  !filtroAñoDetalle.value
    ? reunionesDelArbitroDetalle.value
    : reunionesDelArbitroDetalle.value.filter(ex => añoDeFecha(ex.fecha_examen) === filtroAñoDetalle.value)
)

const resumenDetalle = computed(() => {
  const r = { presentes: 0, ausentes: 0 }
  for (const ex of reunionesFiltradosDetalle.value)
    for (const det of (ex.detalles || []))
      if (det.estado == 4) r.presentes++
      else if (det.estado == 2) r.ausentes++
  return r
})

// ============== ACCIONES MODAL ==============
const tomarSnapshotForm = () => { formReunionSnapshot.value = JSON.stringify(formReunion.value) }
const hayCambiosEnForm  = () => JSON.stringify(formReunion.value) !== formReunionSnapshot.value

const abrirGestionReuniones = (a) => {
  arbitroEnModal.value = a; vistaModal.value = 'lista'; mostrarModal.value = true
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
  formReunion.value = formReunionVacio(); arbitroEnModal.value = {}; formReunionSnapshot.value = ''
}

const volverAListado = () => {
  if (vistaModal.value === 'form' && hayCambiosEnForm()) {
    accionPendiente.value = ejecutarVolverAListado
    notificar({ titulo: 'Cambios sin guardar', mensaje: '¿Querés continuar igualmente?', tipo: 'danger', alConfirmar: confirmarAccion })
    return
  }
  ejecutarVolverAListado()
}

const confirmarAccion      = () => { accionPendiente.value?.(); accionPendiente.value = null }
const ejecutarVolverAListado = () => {
  vistaModal.value = 'lista'; formReunion.value = formReunionVacio(); formReunionSnapshot.value = ''
}

const iniciarNuevaReunion = () => {
  formReunion.value = { ...formReunionVacio(), id_arbitro: arbitroEnModal.value.id }
  modoFormulario.value = 'nuevo'; vistaModal.value = 'form'; tomarSnapshotForm()
}

const iniciarEditarReunion = (ex) => {
  const esAusente = ex.detalles?.some(d => d.estado == 2)
  const match = eventosParaArbitro.value.find(ev => ev.id && String(ev.id) === String(ex.id_evento)) ?? null
  formReunion.value = {
    id: ex.id, id_arbitro: ex.id_arbitro,
    id_evento: match ? String(match.id) : null,
    fecha_examen: fechaParaInput(ex.fecha_examen),
    asistencia: esAusente ? 'ausente' : 'presente',
  }
  modoFormulario.value = 'editar'; vistaModal.value = 'form'; tomarSnapshotForm()
}

const onEventoSeleccionado = () => {
  const ev = eventoEnForm.value
  if (!ev) { formReunion.value.fecha_examen = ''; return }
  formReunion.value.fecha_examen = ev.fecha_evento
    ? ev.fecha_evento.split(' ')[0]
    : fechaParaInput(ev.fecha_examen)
}

const verDetalleArbitro = (a) => {
  arbitroSeleccionado.value = { id: a.id, apellido: a.apellido, nombre: a.nombre }
  filtroAñoDetalle.value = ''; mostrarModalDetalle.value = true
}

// ============== VALIDACIÓN Y PAYLOAD ==============
const validarFormulario = () => {
  if (!eventoEnForm.value)
    return notificar({ titulo: 'Faltan datos', mensaje: 'Seleccioná la reunión.', tipo: 'danger' }), false
  return true
}

const prepararPayload = () => {
  const f = formReunion.value
  return {
    id: f.id,
    idEvento: eventoEnForm.value?.id ?? null,
    idArbitro: f.id_arbitro || arbitroEnModal.value.id,
    fecha_examen: fechaParaMySQL(f.fecha_examen),
    tipo: CATEGORIA_REUNION,
    detalles: f.asistencia === 'ausente'
      ? [{ subtipo: 'ausente',    calificacion: '', estado: 2 }]
      : [{ subtipo: 'asistencia', calificacion: '', estado: 4 }],
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
      vistaModal.value = 'lista'; formReunion.value = formReunionVacio(); formReunionSnapshot.value = ''
    } else {
      notificar({ titulo: 'Error', mensaje: res.message || 'Ocurrió un error.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error Fatal', mensaje: 'Fallo de conexión con el servidor.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

const confirmarAlta    = () => llamarAPI('guardarExamen', 'Reunión registrada correctamente.')
const confirmarEdicion = () => llamarAPI('editarExamen',  'Reunión actualizada correctamente.')

// ============== CARGAS ==============

// ACA ESTA EL ARREGLO: Agrupamos las filas del servidor en el array 'detalles'
const cargarDatos = async () => {
  try {
    const res = await api.get({ entity: 'examenes', action: 'obtenerExamenes', payload: {} })
    if ((res.ok || res.success) && res.payload) {
      const map = {}
      res.payload.forEach(row => {
        const key = `${row.id_evento}_${row.id_arbitro}`
        if (!map[key]) {
          map[key] = {
            id: row.id,
            id_evento: row.id_evento,
            id_arbitro: row.id_arbitro,
            tipo: row.tipo,
            fecha_examen: row.fecha_examen,
            titulo: row.titulo,
            descripcion: row.descripcion,
            categoria: row.categoria,
            _ts: parseFecha(row.fecha_examen),
            detalles: []
          }
        }
        map[key].detalles.push({
          id: row.id,
          subtipo: row.subtipo,
          calificacion: row.calificacion,
          estado: row.estado
        })
      })
      examenes.value = Object.values(map)
    }
  } catch (err) { console.error(err) }
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (err) { console.error(err) }
}

// Actualizado para buscar desde la entidad reuniones
const cargarEventos = async () => {
  try {
    const res = await api.get({ entity: 'reuniones', action: 'obtenerReuniones' })
    if ((res.ok || res.success) && res.payload) eventos.value = res.payload
  } catch (err) { console.error(err) }
}

const cargarGrupos = async () => {
  try {
    const res = await api.get({ entity: 'grupos', action: 'obtenerGrupos' })
    if ((res.ok || res.success) && res.payload) grupos.value = res.payload
  } catch (err) { console.error(err) }
}

const cargarTodo = async () => {
  cargandoInicial.value = true
  //await Promise.all([cargarArbitros(), cargarDatos(), cargarEventos(), cargarGrupos()])
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
onMounted(() => {
  obtenerReuniones()
}
  //cargarTodo
)
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
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
