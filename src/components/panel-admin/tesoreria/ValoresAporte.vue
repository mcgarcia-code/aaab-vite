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
                        <button type="button" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" :title="estaExpandido(f) ? 'Contraer' : 'Desplegar'">
                          <span class="material-icons" style="font-size:16px;">{{ estaExpandido(f) ? 'expand_less' : 'expand_more' }}</span>
                        </button>
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
const definicionConceptosFijos = [
  {
    clave: 'valor_observador',
    etiqueta: 'Valor por Observación',
    icono: 'bi bi-eye',
    hijos: [
      { clave: 'valor_observacion_liga_honor', etiqueta: 'Observación Liga de Honor' },
      { clave: 'valor_observacion_coordinador', etiqueta: 'Observación Coordinador' },
      { clave: 'valor_observacion_ayudante', etiqueta: 'Observación Ayudante' },
    ]
  },
  {
    clave: 'valor_mesa_arbitral',
    etiqueta: 'Valor Mesa Arbitral',
    icono: 'bi bi-clipboard-data',
    hijos: [
      { clave: 'valor_mesa_arbitral', etiqueta: 'Planillero y Cronometrista' },
      { clave: 'valor_delegado', etiqueta: 'Delegado' },
    ]
  },
  { clave: 'porcentaje_aporte', etiqueta: 'Porcentaje de Aporte Global', icono: 'bi bi-percent' },
]

// Fila de un concepto editable (fijo, ítem de grupo o valor de partido)
const filaConcepto = ({ clave, etiqueta, icono, idCategoria = null, tipo = 'fijo', esHijo = false }) => {
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
    estado: calcularEstado(valor, exento),
  }
}

// Fila agrupadora que contiene ítems editables (ya construidos con filaConcepto)
const filaGrupo = ({ key, tipo, etiqueta, icono, hijos, subtipo, abiertoPorDefecto = false }) => {
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
    estado: definidos === hijos.length ? 'definido' : 'sin_definir',
  }
}

const grupoConceptoFijo = (c) => filaGrupo({
  key: 'grupo-' + c.clave,
  tipo: 'fijo',
  etiqueta: c.etiqueta,
  icono: c.icono,
  subtipo: c.etiqueta.replace(/^Valor (por )?/i, ''),
  hijos: c.hijos.map(h => filaConcepto({ clave: h.clave, etiqueta: h.etiqueta, icono: c.icono, esHijo: true })),
})

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

// Lista unificada: primero los conceptos fijos, después los valores de partido agrupados por división
const filas = computed(() => {
  const fijos = definicionConceptosFijos.map(c => (c.hijos ? grupoConceptoFijo(c) : filaConcepto(c)))

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

  return [...fijos, ...partidos]
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

const cargarTodo = async () => {
  cargando.value = true
  try {
    await Promise.all([cargarCategorias(), cargarValores()])
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
