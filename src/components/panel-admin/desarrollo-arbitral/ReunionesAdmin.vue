<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- ══════ HEADER (igual a ExamenesGenerales) ══════ -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">

          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-people-fill me-1"></i> Gestión de Reuniones
            </h4>
            <span class="text-muted small d-block mt-1">
              <template v-if="modoReunion && !cargandoArbitros">
                {{ reunionActual?.titulo }} — {{ arbitrosReunion.length }} árbitros
                <span v-if="resumenReunionActual.presentes"   class="ms-1 badge rounded-pill bg-success">✓ {{ resumenReunionActual.presentes }}</span>
                <span v-if="resumenReunionActual.ausentes"    class="ms-1 badge rounded-pill bg-secondary">✗ {{ resumenReunionActual.ausentes }}</span>
                <span v-if="resumenReunionActual.sinRegistro" class="ms-1 badge rounded-pill bg-light text-muted border">— {{ resumenReunionActual.sinRegistro }}</span>
              </template>
              <template v-else>Reuniones Mensuales — {{ totalFiltrados }} árbitros</template>
            </span>
          </div>

          <!-- Selector reunión (centro) -->
          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <select
              v-model="reunionSeleccionada"
              @change="onReunionSeleccionada"
              class="form-select shadow-sm border-secondary-subtle fw-semibold"
              style="min-width: 260px; max-width: 420px;"
              :disabled="cargandoInicial || cargandoArbitros"
            >
              <option value="">— Ver listado general —</option>
              <option v-for="r in arrReuniones" :key="r.id" :value="r.id">
                {{ opcionReunion(r) }}
              </option>
            </select>
          </div>

          <!-- Botones (derecha) -->
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

        <!-- ══════ FILTROS MOBILE ══════ -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none']">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Árbitros</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm" aria-label="Cerrar filtros"></button>
          </div>
          <div class="row g-2">
            <div class="col-6"><input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Apellido..."></div>
            <div class="col-6"><input v-model="filtros.nombre"   class="form-control form-control-sm shadow-none" placeholder="Nombre..."></div>
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
            <div class="col-12 mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <!-- ══════ CARD BODY ══════ -->
        <div class="card-body p-0 p-md-3 bg-white">

          <!-- ── TABLA DESKTOP ── -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-container">
            <table class="table table-hover align-middle mb-0 text-nowrap tabla-fija" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted col-fija col-id">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted col-fija col-acciones">Acciones</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-apellido">Apellido</th>
                  <th class="py-3 text-uppercase text-muted col-fija col-nombre">Nombre</th>
                  <th class="py-3 text-center text-uppercase text-muted">Grupo</th>
                  <th class="py-3 text-center text-uppercase text-muted">Subgrupo</th>
                  <!-- Modo general -->
                  <th v-if="!modoReunion" class="py-3 text-center text-uppercase text-muted">Reuniones</th>
                  <!-- Modo reunión -->
                  <th v-else class="py-3 text-uppercase text-muted" style="min-width: 270px;">
                    Asistencia
                    <span class="fw-normal fst-italic text-muted ms-1" style="font-size: 0.7rem;">(guardado automático)</span>
                  </th>
                </tr>

                <!-- Fila de filtros -->
                <tr class="bg-light">
                  <td class="p-2 align-middle text-center border-bottom border-2 col-fija col-id">
                    <button @click="recargar" class="btn btn-sm btn-light border rounded text-secondary shadow-sm px-2 py-1" aria-label="Recargar">
                      <i class="bi bi-arrow-clockwise"></i>
                    </button>
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-acciones"></td>
                  <td class="p-2 border-bottom border-2 col-fija col-apellido">
                    <input v-model="filtros.apellido" class="form-control form-control-sm shadow-none" placeholder="Filtrar..">
                  </td>
                  <td class="p-2 border-bottom border-2 col-fija col-nombre">
                    <input v-model="filtros.nombre" class="form-control form-control-sm shadow-none" placeholder="Filtrar..">
                  </td>
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
                  <!-- Mensaje contextual en la última celda -->
                  <td class="p-2 border-bottom border-2 text-muted small fst-italic ps-2">
                    <template v-if="!modoReunion">← Seleccioná una reunión para registrar asistencia</template>
                    <template v-else>Clic en el radio para guardar automáticamente</template>
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr v-if="cargandoInicial || cargandoArbitros">
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
                <tr
                  v-else
                  v-for="a in arbitrosPaginados"
                  :key="a.id"
                  :class="{
                    'fila-presente': modoReunion && asistencias[a.id] === 'presente',
                    'fila-ausente':  modoReunion && asistencias[a.id] === 'ausente',
                  }"
                >
                  <td class="ps-3 text-muted fw-bold font-monospace col-fija col-id">{{ a.id }}</td>
                  <td class="text-center col-fija col-acciones">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="verDetalleArbitro(a)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver historial" aria-label="Ver historial">
                        <span class="material-icons" style="font-size:16px;">manage_search</span>
                      </button>
                    </div>
                  </td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-apellido">{{ a.apellido }}</td>
                  <td class="text-dark fw-bold text-uppercase col-fija col-nombre">{{ a.nombre }}</td>
                  <td class="text-center text-dark">{{ a.nombre_grupo || a.grupo || '-' }}</td>
                  <td class="text-center text-dark">{{ a.subgrupo || '-' }}</td>

                  <!-- Modo general: historial -->
                  <td v-if="!modoReunion" class="text-center">
                    <div class="d-flex align-items-center justify-content-center gap-2">
                      <span class="badge bg-dark rounded-pill px-2 py-1">{{ (reunionesPorArbitro[a.id] || []).length }}</span>
                      <ResumenAsistencia :resumen="resumenAsistencia(a.id)" />
                    </div>
                  </td>

                  <!-- Modo reunión: radios -->
                  <td v-else>
                    <div class="d-flex align-items-center gap-3">
                      <div class="form-check form-check-inline mb-0">
                        <input
                          type="radio"
                          :id="`pres-${a.id}`"
                          :name="`asist-${a.id}`"
                          value="presente"
                          v-model="asistencias[a.id]"
                          @change="guardarAsistencia(a)"
                          :disabled="!!guardando[a.id]"
                          class="form-check-input radio-presente"
                        >
                        <label :for="`pres-${a.id}`" class="form-check-label fw-bold text-success">✓ Presente</label>
                      </div>
                      <div class="form-check form-check-inline mb-0">
                        <input
                          type="radio"
                          :id="`aus-${a.id}`"
                          :name="`asist-${a.id}`"
                          value="ausente"
                          v-model="asistencias[a.id]"
                          @change="guardarAsistencia(a)"
                          :disabled="!!guardando[a.id]"
                          class="form-check-input radio-ausente"
                        >
                        <label :for="`aus-${a.id}`" class="form-check-label fw-bold text-secondary">✗ Ausente</label>
                      </div>
                      <span class="estado-indicator">
                        <span v-if="guardando[a.id]"       class="spinner-border spinner-border-sm text-danger" role="status"></span>
                        <i    v-else-if="guardadoOk[a.id]" class="bi bi-check-circle-fill text-success"></i>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ── CARDS MOBILE ── -->
          <div class="d-md-none p-3 bg-light">
            <div v-if="cargandoInicial || cargandoArbitros" class="text-center p-4 bg-white rounded-3 shadow-sm border">
              <div class="spinner-border text-danger spinner-border-sm" role="status"></div>
              <p class="m-0 mt-2 small fw-bold text-muted">Cargando datos...</p>
            </div>
            <template v-else>
              <div
                v-for="a in arbitrosPaginados"
                :key="'mob-'+a.id"
                class="card shadow-sm mb-3 border-light-subtle rounded-3"
                :class="{
                  'border-success border-2':   modoReunion && asistencias[a.id] === 'presente',
                  'border-secondary border-2': modoReunion && asistencias[a.id] === 'ausente',
                }"
              >
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">{{ a.apellido }}, {{ a.nombre }}</div>
                  <div class="d-flex align-items-center gap-2">
                    <div class="small text-muted fw-bold font-monospace">#{{ a.id }}</div>
                    <span v-if="modoReunion && guardando[a.id]"       class="spinner-border spinner-border-sm text-danger"></span>
                    <i    v-else-if="modoReunion && guardadoOk[a.id]" class="bi bi-check-circle-fill text-success fs-6"></i>
                  </div>
                </div>
                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex justify-content-between text-dark mb-2 border-bottom border-secondary-subtle pb-2">
                    <span class="small">
                      <strong>Grupo:</strong> {{ a.nombre_grupo || a.grupo || '-' }}
                      <template v-if="a.subgrupo"> / {{ a.subgrupo }}</template>
                    </span>
                    <span class="small"><strong>Reuniones:</strong> {{ (reunionesPorArbitro[a.id] || []).length }}</span>
                  </div>

                  <!-- General: historial + botón detalle -->
                  <div v-if="!modoReunion" class="d-flex gap-2">
                    <div class="flex-grow-1 bg-light p-2 rounded border border-light-subtle">
                      <ResumenAsistencia :resumen="resumenAsistencia(a.id)" :mobile="true" />
                    </div>
                    <button @click="verDetalleArbitro(a)" class="btn btn-sm btn-outline-warning shadow-sm px-3 d-flex justify-content-center align-items-center" aria-label="Ver historial">
                      <span class="material-icons" style="font-size: 18px;">manage_search</span>
                    </button>
                  </div>

                  <!-- Reunión: toggle buttons -->
                  <div v-else class="d-flex gap-2">
                    <label
                      :for="`presm-${a.id}`"
                      class="toggle-asist flex-grow-1 d-flex align-items-center justify-content-center py-2 rounded-2 fw-bold small"
                      :class="asistencias[a.id] === 'presente'
                        ? 'bg-success text-white border border-success'
                        : 'bg-white text-success border border-success'"
                    >
                      <input type="radio" :id="`presm-${a.id}`" :name="`asistm-${a.id}`" value="presente"
                        v-model="asistencias[a.id]" @change="guardarAsistencia(a)" :disabled="!!guardando[a.id]" class="visually-hidden">
                      ✓ Presente
                    </label>
                    <label
                      :for="`ausm-${a.id}`"
                      class="toggle-asist flex-grow-1 d-flex align-items-center justify-content-center py-2 rounded-2 fw-bold small"
                      :class="asistencias[a.id] === 'ausente'
                        ? 'bg-secondary text-white border border-secondary'
                        : 'bg-white text-secondary border border-secondary'"
                    >
                      <input type="radio" :id="`ausm-${a.id}`" :name="`asistm-${a.id}`" value="ausente"
                        v-model="asistencias[a.id]" @change="guardarAsistencia(a)" :disabled="!!guardando[a.id]" class="visually-hidden">
                      ✗ Ausente
                    </label>
                  </div>
                </div>
              </div>

              <div v-if="!arbitrosPaginados.length" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">search_off</span>
                <p class="text-muted m-0 fw-bold">No se encontraron árbitros.</p>
              </div>
            </template>
          </div>

          <!-- ── PAGINACIÓN ── -->
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

    <!-- ══════ MODAL HISTORIAL ══════ -->
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
        <!-- Filtro año -->
        <div class="d-flex justify-content-end mb-3" v-if="añosDetalleArbitro.length">
          <div class="d-flex align-items-center gap-2">
            <label class="small fw-bold text-dark text-uppercase m-0">Año:</label>
            <select v-model="filtroAñoDetalle" class="form-select form-select-sm shadow-sm border-secondary-subtle" style="min-width: 140px;">
              <option value="">Todos los años</option>
              <option v-for="año in añosDetalleArbitro" :key="año" :value="año">{{ año }}</option>
            </select>
          </div>
        </div>

        <!-- Resumen -->
        <div class="row g-2 mb-4">
          <div class="col-6">
            <div class="card border-0 shadow-sm h-100 bg-success">
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

        <!-- Listado de reuniones -->
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

// ─── Constantes (iguales a ExamenesGenerales) ─────────────────────
const GRUPOS         = ['LH', 'Pre Liga', 'SR', '1', '2', '3', '4']
const SUBGRUPOS      = ['A', 'B', 'C']
const CATEGORIA      = 'reunion'
const MOBILE_BREAKPOINT = 768

// ─── Helpers ─────────────────────────────────────────────────────
const normalizarTexto = (v) =>
  String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const formatFecha = (f) => f?.split(' ')[0] ?? ''
const añoDeFecha  = (f) => (f?.split(' ')[0] ?? '').split('/')[2] ?? ''
const parseFecha  = (f) => {
  if (!f) return 0
  const s = f.split(' ')[0]
  if (s.includes('/')) { const [d, m, y] = s.split('/'); return new Date(`${y}-${m}-${d}`).getTime() || 0 }
  return new Date(s).getTime() || 0
}
const sortPorFecha = (lista) => [...lista].sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0))

// ─── Componentes internos ─────────────────────────────────────────
// Badges presentes/ausentes para historial general
const ResumenAsistencia = defineComponent({
  props: { resumen: Object, mobile: Boolean },
  setup(props) {
    return () => {
      const r = props.resumen ?? { presentes: 0, ausentes: 0 }
      const items = []
      if (r.presentes > 0) items.push({ label: 'Presentes', short: 'pres.', badge: 'bg-success',   icon: 'bi-person-check-fill', count: r.presentes })
      if (r.ausentes  > 0) items.push({ label: 'Ausentes',  short: 'aus.',  badge: 'bg-secondary', icon: 'bi-person-dash-fill',  count: r.ausentes  })
      if (!items.length) return h('span', { class: 'text-muted small fst-italic' }, '—')
      return h('div', { class: 'd-flex gap-1 flex-wrap' }, items.map(k =>
        h('span', { class: `badge ${k.badge} text-white px-2 py-1`, title: k.label },
          props.mobile ? `${k.count} ${k.short}` : [h('i', { class: `bi ${k.icon} me-1` }), String(k.count)]
        )
      ))
    }
  },
})

// Badge presente/ausente para el modal historial
const AsistenciaBadge = defineComponent({
  props: { detalles: Array },
  setup(props) {
    return () => {
      const esAusente = (props.detalles || []).some(d => d.estado == 2)
      return h('span', {
        class: esAusente
          ? 'badge bg-secondary text-white px-2 py-1'
          : 'badge bg-success text-white px-2 py-1',
      }, esAusente ? 'AUSENTE' : 'PRESENTE')
    }
  },
})

// ─── Inyectado ───────────────────────────────────────────────────
const notificar = inject('notificar', (msg) => alert(msg.mensaje || msg))

// ─── Estado ──────────────────────────────────────────────────────
const arrReuniones        = ref([])
const arbitros            = ref([])       // todos (vista general)
const arbitrosReunion     = ref([])       // grupo de la reunión seleccionada
const examenesRaw         = ref([])       // rows planas de obtenerExamenes

const reunionSeleccionada = ref('')

const registrosExistentes = ref({})       // { [id_arbitro]: { id: panel.id, estado } }
const asistencias         = reactive({})  // { [id_arbitro]: 'presente'|'ausente' }
const guardando           = reactive({})
const guardadoOk          = reactive({})

const cargandoInicial      = ref(true)
const cargandoArbitros     = ref(false)
const paginaActual         = ref(1)
const registrosPorPagina   = 10
const mostrarFiltrosMobile = ref(false)
const mostrarModalDetalle  = ref(false)
const arbitroSeleccionado  = ref({ id: null, apellido: '', nombre: '' })
const filtroAñoDetalle     = ref('')

const filtros = reactive({ apellido: '', nombre: '', grupo: '', subgrupo: '' })

// ─── Computeds: modo ─────────────────────────────────────────────
const modoReunion = computed(() => !!reunionSeleccionada.value)
const reunionActual = computed(() =>
  arrReuniones.value.find(r => String(r.id) === String(reunionSeleccionada.value)) ?? null
)

// ─── Computeds: examenes agrupados ───────────────────────────────
const examenes = computed(() => {
  const map = {}
  examenesRaw.value.forEach(row => {
    const key = `${row.id_evento}_${row.id_arbitro}`
    if (!map[key]) {
      map[key] = {
        id: row.id, id_evento: row.id_evento, id_arbitro: row.id_arbitro,
        tipo: row.tipo, fecha_examen: row.fecha_examen, titulo: row.titulo,
        _ts: parseFecha(row.fecha_examen), detalles: [],
      }
    }
    map[key].detalles.push({
      id: row.id_detalle ?? row.id,
      subtipo: row.subtipo, calificacion: row.calificacion, estado: row.estado,
    })
  })
  return Object.values(map)
})

const reunionesCategoria = computed(() =>
  examenes.value.filter(ex => ex.tipo === CATEGORIA)
)

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
        if      (det.estado == 4) r.presentes++
        else if (det.estado == 2) r.ausentes++
    map[id] = { ...r, total: r.presentes + r.ausentes }
  }
  return map
})

const resumenAsistencia = (id) =>
  resumenPorArbitro.value[id] ?? { presentes: 0, ausentes: 0, total: 0 }

// ─── Computeds: resumen reunión activa (header) ───────────────────
const resumenReunionActual = computed(() => {
  const r = { presentes: 0, ausentes: 0, sinRegistro: 0 }
  for (const a of arbitrosReunion.value) {
    const v = asistencias[a.id]
    if      (v === 'presente') r.presentes++
    else if (v === 'ausente')  r.ausentes++
    else                       r.sinRegistro++
  }
  return r
})

// ─── Computeds: modal historial ───────────────────────────────────
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
      if      (det.estado == 4) r.presentes++
      else if (det.estado == 2) r.ausentes++
  return r
})

const opcionReunion = (r) => {
  let texto = `${r.fecha_evento}  —  ${r.titulo}`

  if (r.todos_grupos == 1) {
    texto += ' (Todos los grupos)'
  } else {
    if (r.nombre_grupo) {
      texto += ` · ${r.nombre_grupo}`
    }

    if (r.nombre_subgrupo) {
      texto += ` (${r.nombre_subgrupo})`
    }
  }

  return texto
}

// ─── Computeds: filtrado y paginación ────────────────────────────
const arbitrosMostrados = computed(() =>
  modoReunion.value ? arbitrosReunion.value : arbitros.value
)

const arbitrosFiltrados = computed(() => {
  const { apellido, nombre, grupo, subgrupo } = filtros
  return arbitrosMostrados.value.filter(a => {
    if (apellido && !normalizarTexto(a.apellido).includes(normalizarTexto(apellido))) return false
    if (nombre   && !normalizarTexto(a.nombre).includes(normalizarTexto(nombre)))     return false
    if (grupo    && (a.nombre_grupo || a.grupo) !== grupo)                            return false
    if (subgrupo && (a.subgrupo ?? '') !== subgrupo)                                  return false
    return true
  })
})

const arbitrosOrdenados = computed(() =>
  [...arbitrosFiltrados.value].sort((a, b) =>
    normalizarTexto(a.apellido).localeCompare(normalizarTexto(b.apellido), 'es')
  )
)

const totalFiltrados    = computed(() => arbitrosOrdenados.value.length)
const totalPaginas      = computed(() => Math.ceil(arbitrosOrdenados.value.length / registrosPorPagina) || 1)
const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return arbitrosOrdenados.value.slice(inicio, inicio + registrosPorPagina)
})

// ─── Helpers de datos ────────────────────────────────────────────
const buildRegistrosMap = (flatRows) => {
  const map = {}
  flatRows.forEach(row => {
    if (String(row.id_evento) !== String(reunionSeleccionada.value)) return
    if (!map[row.id_arbitro]) map[row.id_arbitro] = { id: row.id, estado: row.estado }
    if      (row.estado == 4)                                     map[row.id_arbitro].estado = 4
    else if (row.estado == 2 && map[row.id_arbitro].estado != 4) map[row.id_arbitro].estado = 2
  })
  return map
}

const sincronizarAsistencias = (map) => {
  for (const [id, rec] of Object.entries(map))
    asistencias[id] = rec.estado == 2 ? 'ausente' : 'presente'
}

// ─── Cargas ──────────────────────────────────────────────────────
const obtenerReuniones = async () => {
  try {
    const res = await api.get({ entity: 'reuniones', action: 'obtenerReuniones' })
    if ((res.ok || res.success) && res.payload) arrReuniones.value = res.payload
  } catch (e) { console.error('obtenerReuniones:', e) }
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    if ((res.ok || res.success) && res.payload) arbitros.value = res.payload
  } catch (e) { console.error('cargarArbitros:', e) }
}

const cargarExamenes = async () => {
  try {
    const res = await api.get({ entity: 'examenes', action: 'obtenerExamenes', payload: {} })
    if ((res.ok || res.success) && res.payload) {
      examenesRaw.value = res.payload
      if (reunionSeleccionada.value) {
        const map = buildRegistrosMap(res.payload)
        registrosExistentes.value = map
        sincronizarAsistencias(map)
      }
    }
  } catch (e) { console.error('cargarExamenes:', e) }
}

// ─── Cambio de reunión ────────────────────────────────────────────
const limpiarEstadoReunion = () => {
  Object.keys(asistencias).forEach(k => delete asistencias[k])
  Object.keys(guardando).forEach(k => delete guardando[k])
  Object.keys(guardadoOk).forEach(k => delete guardadoOk[k])
  registrosExistentes.value = {}
  arbitrosReunion.value = []
}

const onReunionSeleccionada = async () => {
  limpiarEstadoReunion()
  paginaActual.value = 1
  limpiarFiltros()
  mostrarFiltrosMobile.value = false

  if (!reunionSeleccionada.value) return

  cargandoArbitros.value = true
  try {
    const reunion = reunionActual.value
    const [resArb, resEx] = await Promise.all([
      api.get({
        entity: 'reuniones',
        action: 'obtenerArbitrosReunion',
        payload: { idEvento: Number(reunionSeleccionada.value), todosLosGrupos: reunion?.todos_grupos == 1 }
      }),
      api.get({ entity: 'examenes', action: 'obtenerExamenes', payload: {} }),
    ])
    if ((resArb.ok || resArb.success) && resArb.payload) arbitrosReunion.value = resArb.payload
    if ((resEx.ok  || resEx.success)  && resEx.payload) {
      examenesRaw.value = resEx.payload
      const map = buildRegistrosMap(resEx.payload)
      registrosExistentes.value = map
      sincronizarAsistencias(map)
    }
  } catch (e) {
    console.error('onReunionSeleccionada:', e)
    notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos de la reunión.', tipo: 'danger' })
  } finally {
    cargandoArbitros.value = false
  }
}

// ─── Guardar asistencia (auto-save) ──────────────────────────────
const guardarAsistencia = async (a) => {
  const valor = asistencias[a.id]
  if (!valor) return

  guardando[a.id]  = true
  delete guardadoOk[a.id]

  const existente = registrosExistentes.value[a.id]
  const payload = {
    idEvento:  Number(reunionSeleccionada.value),
    idArbitro: a.id,
    tipo:      CATEGORIA,
    detalles:  valor === 'ausente'
      ? [{ subtipo: 'ausente',    calificacion: '', estado: 2 }]
      : [{ subtipo: 'asistencia', calificacion: '', estado: 4 }],
  }

  try {
    const res = existente
      ? await api.post({ entity: 'examenes', action: 'editarExamen',  payload: { ...payload, id: existente.id } })
      : await api.post({ entity: 'examenes', action: 'guardarExamen', payload })

    if (res.ok || res.success) {
      await cargarExamenes()
      guardadoOk[a.id] = true
      setTimeout(() => { delete guardadoOk[a.id] }, 2500)
    } else {
      const prev = registrosExistentes.value[a.id]
      if (prev) asistencias[a.id] = prev.estado == 2 ? 'ausente' : 'presente'
      else       delete asistencias[a.id]
      notificar({ titulo: 'Error', mensaje: res.message || 'No se pudo guardar la asistencia.', tipo: 'danger' })
    }
  } catch {
    notificar({ titulo: 'Error fatal', mensaje: 'Error de conexión con el servidor.', tipo: 'danger' })
  } finally {
    guardando[a.id] = false
  }
}

// ─── Acciones ────────────────────────────────────────────────────
const verDetalleArbitro = (a) => {
  arbitroSeleccionado.value = { id: a.id, apellido: a.apellido, nombre: a.nombre }
  filtroAñoDetalle.value = ''
  mostrarModalDetalle.value = true
}

const recargar = async () => {
  if (modoReunion.value) {
    await onReunionSeleccionada()
  } else {
    cargandoInicial.value = true
    await Promise.all([cargarArbitros(), cargarExamenes()])
    cargandoInicial.value = false
  }
}

// ─── Misc ────────────────────────────────────────────────────────
const limpiarFiltros = () => Object.keys(filtros).forEach(k => (filtros[k] = ''))

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  if (window.innerWidth <= MOBILE_BREAKPOINT)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
}

watch(filtros,      () => { paginaActual.value = 1 }, { deep: true })
watch(modoReunion,  () => { paginaActual.value = 1 })
watch(totalPaginas, (n) => { if (paginaActual.value > n) paginaActual.value = n })

onMounted(async () => {
  await Promise.all([obtenerReuniones(), cargarArbitros(), cargarExamenes()])
  cargandoInicial.value = false
})
</script>

<style scoped>
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; margin-left: 50%; transform: translateX(-50%); padding-bottom: 120px; }
.admin-panel { width: 100%; background-color: #0f172a; min-height: 100vh; border-radius: 12px; }
.animate__animated { animation-duration: 0.4s; }

/* ── Tabla (igual a ExamenesGenerales) ── */
.tabla-container { overflow-x: auto; }
.tabla-fija { border-collapse: separate; border-spacing: 0; }
.tabla-fija th, .tabla-fija td { border-left: none !important; border-right: none !important; }

/* Sticky columns - mismas posiciones que ExamenesGenerales */
.col-fija              { position: sticky; background-color: inherit; z-index: 10; }
.tabla-fija thead .col-fija { background-color: #f8f9fa; z-index: 12; }
.tabla-fija tbody .col-fija { background-color: #ffffff; }
.col-id       { left: 0;     min-width: 60px;  }
.col-acciones { left: 60px;  min-width: 90px;  }
.col-apellido { left: 150px; min-width: 150px; }
.col-nombre   { left: 300px; min-width: 150px; }
.col-nombre::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to right, rgba(0,0,0,0.1), transparent); }

/* Colores de fila modo reunión */
.fila-presente              { background-color: #f0fdf4 !important; }
.fila-presente .col-fija    { background-color: #f0fdf4 !important; }
.fila-ausente               { background-color: #f9fafb !important; }
.fila-ausente  .col-fija    { background-color: #f9fafb !important; }

/* Radios */
.radio-presente { accent-color: #198754; }
.radio-ausente  { accent-color: #6c757d; }

/* Indicador guardado */
.estado-indicator { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; }

/* Toggle buttons mobile */
.toggle-asist { cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease; user-select: none; font-size: 0.85rem; }
.toggle-asist:active { opacity: 0.82; }
</style>
