<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-list-check me-1"></i> Movimientos de Tesorería
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ movimientosFiltrados.length }} movimientos</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerMovimientos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>
            <button @click="abrirModalManual" class="btn btn-danger-subtle border-danger-subtle shadow-sm py-2 d-flex align-items-center gap-2 text-danger">
              <span class="material-icons fs-6">add_circle</span>
              <span class="fw-bold d-none d-md-inline small">Ajuste Manual</span>
            </button>
            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- GENERAR APORTES DEL PERIODO -->
        <div class="bg-light p-3 border-bottom">
          <div class="row g-2 align-items-end">
            <div class="col-6 col-md-3">
              <label class="small fw-bold text-dark mb-1 d-block">Período</label>
              <input type="month" v-model="periodoGenerar" class="form-control form-control-sm shadow-none">
            </div>
            <div class="col-6 col-md-3">
              <button @click="confirmarGenerar" :disabled="!periodoGenerar || generando" class="btn btn-dark btn-sm w-100 fw-bold shadow-sm">
                <span v-if="generando" class="spinner-border spinner-border-sm me-1"></span>
                Generar Aportes del Período
              </button>
            </div>
          </div>
        </div>

        <!-- FILTROS -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Movimientos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>
          <div class="row g-2">
            <div class="col-6 col-md-3">
              <input v-model="filtros.arbitro" class="form-control form-control-sm shadow-none" placeholder="BUSCAR ÁRBITRO...">
            </div>
            <div class="col-6 col-md-2">
              <input type="month" v-model="filtros.periodo" class="form-control form-control-sm shadow-none">
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.concepto" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">CONCEPTO</option>
                <option v-for="t in tiposMovimiento" :key="t.clave" :value="t.clave">{{ t.etiqueta }}</option>
              </select>
            </div>
            <div class="col-6 col-md-2">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none text-uppercase text-dark">
                <option value="">ESTADO</option>
                <option value="pendiente">PENDIENTE</option>
                <option value="cerrado">CERRADO</option>
                <option value="anulado">ANULADO</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando movimientos...</p>
          </div>

          <template v-else>
            <div class="d-none d-md-block table-responsive border rounded shadow-sm">
              <table class="table table-hover align-middle mb-0" style="font-size: 0.8rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 text-uppercase text-muted">Fecha</th>
                    <th class="py-3 text-uppercase text-muted">Árbitro</th>
                    <th class="py-3 text-uppercase text-muted">Concepto</th>
                    <th class="py-3 text-center text-uppercase text-muted">Tipo</th>
                    <th class="py-3 text-end text-uppercase text-muted">Monto</th>
                    <th class="py-3 text-center text-uppercase text-muted">Estado</th>
                    <th class="py-3 text-center text-uppercase text-muted">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in movimientosPaginados" :key="m.id">
                    <td>{{ m.fecha_generacion }}</td>
                    <td class="fw-bold text-dark text-uppercase">{{ m.arbitro }}</td>
                    <td>
                      <div>{{ m.concepto_etiqueta }}</div>
                      <span v-if="m.partido_categoria" class="badge bg-danger-subtle text-danger border border-danger-subtle text-wrap text-break text-start" style="font-size: 0.65rem;">{{ m.partido_categoria }}</span>
                      <div v-if="m.descripcion" class="text-muted small text-wrap" style="max-width: 260px;">{{ m.descripcion }}</div>
                    </td>
                    <td class="text-center">
                      <span :class="['badge-status-sm', m.tipo === 'debito' ? 'debito' : 'credito']">{{ m.tipo === 'debito' ? 'DÉBITO' : 'CRÉDITO' }}</span>
                    </td>
                    <td class="text-end fw-bold">{{ formatearMonto(m.monto) }}</td>
                    <td class="text-center">
                      <span :class="['badge-status-sm', m.estado]">{{ m.estado.toUpperCase() }}</span>
                    </td>
                    <td class="text-center">
                      <div v-if="m.concepto === 'ajuste_manual' && m.estado === 'pendiente'" class="d-flex justify-content-center gap-1">
                        <button @click="abrirModalEditarManual(m)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Editar">
                          <span class="material-icons" style="font-size:16px;">edit</span>
                        </button>
                        <button @click="confirmarAnular(m)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Anular">
                          <span class="material-icons" style="font-size:16px;">delete</span>
                        </button>
                      </div>
                      <span v-else class="text-muted small">—</span>
                    </td>
                  </tr>
                  <tr v-if="movimientosPaginados.length === 0">
                    <td colspan="7" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">search_off</span>
                      <p class="m-0 fw-bold">No se encontraron movimientos.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="d-md-none p-3 bg-light">
              <div v-for="m in movimientosPaginados" :key="'mob-'+m.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold text-uppercase" style="font-size: 0.95rem;">{{ m.arbitro }}</div>
                  <span :class="['badge-status-sm', m.estado]">{{ m.estado.toUpperCase() }}</span>
                </div>
                <div class="card-body pt-1 px-3 pb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="small text-muted">
                      {{ m.concepto_etiqueta }}
                      · {{ m.fecha_generacion }}
                    </span>
                    <span :class="['badge-status-sm', m.tipo === 'debito' ? 'debito' : 'credito']">{{ m.tipo === 'debito' ? 'DÉBITO' : 'CRÉDITO' }}</span>
                  </div>
                  <div v-if="m.partido_categoria" class="mb-2">
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle text-wrap text-break text-start" style="font-size: 0.65rem;">{{ m.partido_categoria }}</span>
                  </div>
                  <div class="fw-bold fs-6 mb-2">{{ formatearMonto(m.monto) }}</div>
                  <p v-if="m.descripcion" class="text-muted small mb-2">{{ m.descripcion }}</p>
                  <div v-if="m.concepto === 'ajuste_manual' && m.estado === 'pendiente'" class="d-flex gap-2">
                    <button @click="abrirModalEditarManual(m)" class="btn btn-sm btn-outline-primary flex-fill fw-bold">
                      Editar
                    </button>
                    <button @click="confirmarAnular(m)" class="btn btn-sm btn-outline-danger flex-fill fw-bold">
                      Anular
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="movimientosPaginados.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border mt-3">
                <p class="text-muted m-0 fw-bold">No se encontraron movimientos.</p>
              </div>
            </div>

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

    <ModalBase :show="mostrarModalEditar" @close="mostrarModalEditar = false" icono="edit" colorIcono="bg-info-subtle text-info" maxWidth="500px">
      <template #header>
        <div class="text-center">
          <span class="fw-bold fs-5">Editar Ajuste Manual</span>
          <div class="text-muted small text-uppercase">{{ formEditar.arbitro }}</div>
        </div>
      </template>

      <form id="formEditarManual" @submit.prevent="confirmarEditarManual" class="d-flex flex-column gap-3 text-start">
        <div>
          <label class="small fw-bold text-dark mb-1 d-block">Tipo de movimiento</label>
          <div class="btn-group btn-group-sm w-100" role="group" aria-label="Tipo de movimiento">
            <button type="button" class="btn fw-bold" :class="formEditar.opcion === 'debito' ? 'btn-danger' : 'btn-outline-secondary bg-white'" @click="elegirOpcionEditar('debito')">Débito</button>
            <button type="button" class="btn fw-bold" :class="formEditar.opcion === 'credito' ? 'btn-success' : 'btn-outline-secondary bg-white'" @click="elegirOpcionEditar('credito')">Crédito</button>
            <button type="button" class="btn fw-bold" :class="formEditar.opcion === 'item' ? 'btn-primary' : 'btn-outline-secondary bg-white'" @click="elegirOpcionEditar('item')">Ítem</button>
          </div>
          <span v-if="formEditar.opcion === 'item'" class="d-block text-muted small mt-1">Los ítems siempre van como <strong class="text-success">crédito</strong>.</span>
        </div>

        <div v-if="formEditar.opcion === 'item'">
          <select v-model="formEditar.item" @change="formEditar.monto = valorDeItem(formEditar.item)" class="form-select form-select-sm shadow-none border-secondary-subtle">
            <option value="" disabled>Seleccione un ítem...</option>
            <optgroup v-for="g in itemsAgrupados" :key="g.grupo" :label="g.grupo">
              <option v-for="i in g.items" :key="i.clave" :value="i.clave">
                {{ i.etiqueta }}{{ valorDeItem(i.clave) !== null ? ' — ' + formatearMonto(valorDeItem(i.clave)) : ' — sin definir' }}
              </option>
            </optgroup>
          </select>
        </div>

        <div class="row g-2">
          <div class="col-12 col-sm-6">
            <label class="small fw-bold text-dark mb-1">Monto ($)</label>
            <input v-model.number="formEditar.monto" type="number" step="0.01" min="0.01" inputmode="decimal" class="form-control form-control-sm shadow-none border-secondary-subtle" required>
          </div>
          <div class="col-12 col-sm-6">
            <label class="small fw-bold text-dark mb-1">Fecha</label>
            <input v-model="formEditar.fecha" type="date" class="form-control form-control-sm shadow-none border-secondary-subtle" required>
          </div>
        </div>

        <div>
          <label class="small fw-bold text-dark mb-1">Descripción</label>
          <input v-model="formEditar.descripcion" type="text" maxlength="255" class="form-control form-control-sm shadow-none border-secondary-subtle" placeholder="Opcional">
        </div>
      </form>

      <template #footer>
        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center w-100">
          <button type="button" @click="mostrarModalEditar = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 w-sm-auto">CANCELAR</button>
          <button type="submit" form="formEditarManual" :disabled="procesando" class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm w-100 w-sm-auto d-flex align-items-center justify-content-center gap-2">
            <span v-if="procesando" class="spinner-border spinner-border-sm"></span>
            {{ procesando ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
          </button>
        </div>
      </template>
    </ModalBase>

    <ModalBase :show="mostrarModalManual" @close="mostrarModalManual = false" icono="add_circle" colorIcono="bg-success-subtle text-success" maxWidth="600px">
      <template #header><span class="fw-bold fs-5">Nuevo Ajuste Manual</span></template>

      <form id="formManual" @submit.prevent="confirmarGuardarManual" class="text-start">
        <div class="row g-3">

          <!-- 1. ÁRBITRO Y FECHA (valen para todos los movimientos de la lista) -->
          <div class="col-12 col-sm-7">
            <label class="small fw-bold text-dark mb-1">Árbitro *</label>
            <select v-model="formManual.id_arbitro" class="form-select shadow-none border-secondary-subtle" required>
              <option value="" disabled>Seleccione un árbitro...</option>
              <option v-for="a in arbitros" :key="a.id" :value="a.id">{{ a.apellido }}, {{ a.nombre }}</option>
            </select>
          </div>
          <div class="col-12 col-sm-5">
            <label class="small fw-bold text-dark mb-1">Fecha</label>
            <input v-model="formManual.fecha" type="date" class="form-control shadow-none border-secondary-subtle">
          </div>

          <!-- 2. ARMAR UN MOVIMIENTO -->
          <div class="col-12">
            <div class="border rounded p-3 bg-light">
              <label class="small fw-bold text-dark mb-1 d-block">Tipo de movimiento</label>
              <div class="btn-group btn-group-sm w-100" role="group" aria-label="Tipo de movimiento">
                <button type="button" class="btn fw-bold"
                        :class="linea.opcion === 'debito' ? 'btn-danger' : 'btn-outline-secondary bg-white'"
                        @click="elegirOpcion('debito')">
                  Débito
                </button>
                <button type="button" class="btn fw-bold"
                        :class="linea.opcion === 'credito' ? 'btn-success' : 'btn-outline-secondary bg-white'"
                        @click="elegirOpcion('credito')">
                  Crédito
                </button>
                <button type="button" class="btn fw-bold"
                        :class="linea.opcion === 'item' ? 'btn-primary' : 'btn-outline-secondary bg-white'"
                        @click="elegirOpcion('item')">
                  Ítem
                </button>
              </div>
              <span class="d-block text-muted small mt-1 mb-2">
                <template v-if="linea.opcion === 'debito'">Genera deuda al árbitro.</template>
                <template v-else-if="linea.opcion === 'credito'">Queda a favor del árbitro.</template>
                <template v-else>Los ítems siempre van como <strong class="text-success">crédito</strong>.</template>
              </span>

              <div class="row g-2">
                <!-- Ítem -->
                <div v-if="linea.opcion === 'item'" class="col-12">
                  <select v-model="linea.item" @change="alElegirItem" class="form-select form-select-sm shadow-none border-secondary-subtle">
                    <option value="" disabled>Seleccione un ítem...</option>
                    <optgroup v-for="g in itemsAgrupados" :key="g.grupo" :label="g.grupo">
                      <option v-for="i in g.items" :key="i.clave" :value="i.clave">
                        {{ i.etiqueta }}{{ valorDeItem(i.clave) !== null ? ' — ' + formatearMonto(valorDeItem(i.clave)) : ' — sin definir' }}
                      </option>
                    </optgroup>
                  </select>
                  <span v-if="cargandoValores" class="d-block text-muted small mt-1">Cargando valores vigentes...</span>
                  <span v-else-if="linea.item && valorDeItem(linea.item) === null" class="d-block text-warning-emphasis small mt-1">
                    Este ítem no tiene valor definido. Ingresá el monto a mano.
                  </span>
                </div>

                <!-- Ítem: cantidad x valor unitario -->
                <template v-if="linea.opcion === 'item'">
                  <div class="col-4 col-sm-3">
                    <label class="small text-muted mb-1">Cantidad</label>
                    <input v-model.number="linea.cantidad" type="number" min="1" max="999" step="1" inputmode="numeric"
                           class="form-control form-control-sm shadow-none border-secondary-subtle text-center">
                  </div>
                  <div class="col-8 col-sm-4">
                    <label class="small text-muted mb-1">Valor unitario ($)</label>
                    <input v-model.number="linea.monto" type="number" step="0.01" min="0.01" inputmode="decimal"
                           class="form-control form-control-sm shadow-none border-secondary-subtle" placeholder="Valor ($)">
                  </div>
                  <div class="col-12 col-sm-5 d-flex align-items-end">
                    <div class="w-100 bg-white border rounded px-2 py-1 small d-flex justify-content-between align-items-center" style="min-height: 31px;">
                      <span class="text-muted">Total</span>
                      <strong class="text-success">{{ formatearMonto(totalLinea) }}</strong>
                    </div>
                  </div>
                </template>

                <!-- Débito / Crédito: monto libre -->
                <div v-else class="col-12 col-sm-5">
                  <input v-model.number="linea.monto" type="number" step="0.01" min="0.01" inputmode="decimal"
                         class="form-control form-control-sm shadow-none border-secondary-subtle" placeholder="Monto ($)">
                </div>

                <!-- Descripción -->
                <div class="col-12" :class="{ 'col-sm-7': linea.opcion !== 'item' }">
                  <input v-model="linea.descripcion" type="text" maxlength="255"
                         class="form-control form-control-sm shadow-none border-secondary-subtle" placeholder="Descripción (opcional)">
                </div>

                <div class="col-12">
                  <button type="button" @click="agregarLinea" class="btn btn-sm btn-outline-danger fw-bold w-100 d-flex align-items-center justify-content-center gap-1">
                    <span class="material-icons" style="font-size:16px;">add</span> Agregar a la lista
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. LISTA DE MOVIMIENTOS A GUARDAR -->
          <div class="col-12">
            <label class="small fw-bold text-dark mb-1 d-block">
              Movimientos a guardar <span class="badge bg-dark ms-1">{{ lineas.length }}</span>
            </label>

            <div v-if="!lineas.length" class="text-muted small border rounded p-3 text-center">
              Todavía no agregaste movimientos. Armá uno arriba y tocá <strong>Agregar a la lista</strong>.
            </div>

            <div v-else class="border rounded">
              <div v-for="(l, i) in lineas" :key="l.uid"
                   class="d-flex align-items-center gap-2 p-2" :class="{ 'border-bottom': i < lineas.length - 1 }">
                <span :class="['badge-status-sm', l.tipo === 'debito' ? 'debito' : 'credito']">{{ l.tipo === 'debito' ? 'DÉB' : 'CRÉD' }}</span>
                <div class="flex-grow-1 small text-truncate">
                  <span class="fw-bold text-dark">{{ l.item ? etiquetaItem(l.item) : (l.tipo === 'debito' ? 'Débito' : 'Crédito') }}</span>
                  <span v-if="l.cantidad > 1" class="text-muted"> × {{ l.cantidad }} ({{ formatearMonto(l.unitario) }} c/u)</span>
                  <span v-if="l.descripcion" class="text-muted"> · {{ l.descripcion }}</span>
                </div>
                <span class="fw-bold small text-nowrap" :class="l.tipo === 'debito' ? 'text-danger' : 'text-success'">
                  {{ l.tipo === 'debito' ? '-' : '+' }} {{ formatearMonto(l.monto) }}
                </span>
                <button type="button" @click="quitarLinea(i)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-danger" title="Quitar">
                  <span class="material-icons" style="font-size:16px;">delete</span>
                </button>
              </div>

              <!-- Totales -->
              <div class="bg-light border-top p-2 small d-flex flex-wrap justify-content-between gap-2">
                <span>Débitos: <strong class="text-danger">{{ formatearMonto(totales.debitos) }}</strong></span>
                <span>Créditos: <strong class="text-success">{{ formatearMonto(totales.creditos) }}</strong></span>
                <span>Neto: <strong :class="totales.neto > 0 ? 'text-danger' : 'text-success'">{{ formatearMonto(Math.abs(totales.neto)) }} {{ totales.neto > 0 ? 'a pagar' : 'a favor' }}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="mostrarModalManual = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button type="submit" form="formManual" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-1"></span>
          {{ procesando ? 'GUARDANDO...' : (lineas.length > 1 ? `GUARDAR ${lineas.length} MOVIMIENTOS` : 'CREAR AJUSTE') }}
        </button>
      </template>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject, watch } from 'vue'
import { api } from '@/api/api'
import ExcelJS from 'exceljs'
import { useHead } from '@vueuse/head'
import ModalBase from '@/components/ModalBase.vue'
import { useRoute } from 'vue-router'
useHead({ title: 'Movimientos de Tesorería | AAAB' })

const route = useRoute()
const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const cargando = ref(false)
const generando = ref(false)
const procesando = ref(false)
const movimientos = ref([])
const arbitros = ref([])

const periodoGenerar = ref(new Date().toISOString().slice(0, 7))

const mostrarFiltrosMobile = ref(false)
const filtros = reactive({ arbitro: '', periodo: '', concepto: '', estado: '' })
const paginaActual = ref(1)
const registrosPorPagina = 10

// ----------------------------------------------------
//  CONCEPTOS (tabla tesoreria_conceptos, vienen del back)
// ----------------------------------------------------
const conceptos = ref([])

// Ítems del Ajuste Manual: los "otros conceptos" que llevan valor
// (los que no tienen subconceptos), menos el Porcentaje de Aporte Global.
const itemsAjusteManual = computed(() => {
  const porOrden = (a, b) => (Number(a.orden) - Number(b.orden)) || (Number(a.id) - Number(b.id))
  const todos = conceptos.value
  const items = []
  todos
    .filter(c => !c.id_padre && c.tipo !== 'partido' && c.clave !== 'porcentaje_aporte')
    .sort(porOrden)
    .forEach(c => {
      const hijos = todos.filter(h => Number(h.id_padre) === Number(c.id)).sort(porOrden)
      if (hijos.length) hijos.forEach(h => items.push({ clave: h.clave, etiqueta: h.etiqueta, grupo: c.etiqueta }))
      else items.push({ clave: c.clave, etiqueta: c.etiqueta, grupo: 'Otros conceptos' })
    })
  return items
})

const etiquetaItem = (clave) => conceptos.value.find(c => c.clave === clave)?.etiqueta || clave

const tiposMovimiento = ref([])

const cargarTiposMovimiento = async () => {
  try {
    const res = await api.get({ entity: 'tesoreria', action: 'obtenerTiposMovimiento', payload: {} })
    if (res.ok) tiposMovimiento.value = Array.isArray(res.payload) ? res.payload : []
  } catch (err) {
    console.error('Error cargando tipos de movimiento:', err)
  }
}

const cargarConceptos = async () => {
  try {
    const res = await api.get({ entity: 'tesoreria', action: 'obtenerConceptos', payload: {} })
    if (res.ok) conceptos.value = Array.isArray(res.payload) ? res.payload : []
  } catch (err) {
    console.error('Error cargando conceptos:', err)
  }
}


const normalizar = (t) => t ? t.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : ''
const formatearMonto = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(v)

const movimientosFiltrados = computed(() => {
  return movimientos.value.filter(m => {
    const matchArbitro = normalizar(m.arbitro).includes(normalizar(filtros.arbitro))
    const matchPeriodo = !filtros.periodo || (m.fecha_generacion || '').startsWith(filtros.periodo)
    const matchConcepto = !filtros.concepto || m.concepto === filtros.concepto
    const matchEstado = !filtros.estado || m.estado === filtros.estado
    return matchArbitro && matchPeriodo && matchConcepto && matchEstado
  }).sort((a, b) => b.id - a.id)
})

const totalPaginas = computed(() => Math.ceil(movimientosFiltrados.value.length / registrosPorPagina) || 1)
const movimientosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina
  return movimientosFiltrados.value.slice(inicio, inicio + registrosPorPagina)
})

watch(filtros, () => { paginaActual.value = 1 }, { deep: true })
watch(totalPaginas, (nuevo) => { if (paginaActual.value > nuevo) paginaActual.value = nuevo })

const cambiarPagina = (delta) => {
  paginaActual.value += delta
  setTimeout(() => { if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' }) }, 50)
}

const limpiarFiltros = () => { filtros.arbitro = ''; filtros.periodo = ''; filtros.concepto = ''; filtros.estado = '' }

const obtenerMovimientos = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'tesoreria', action: 'obtenerMovimientos', payload: {} })
    if (res.ok) movimientos.value = Array.isArray(res.payload) ? res.payload : []
  } finally {
    cargando.value = false
  }
}

const cargarArbitros = async () => {
  try {
    const res = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    let lista = Array.isArray(res) ? res : (res.payload ?? [])
    lista.sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`))
    arbitros.value = lista

    // Preselección desde "Ver detalle" en Estado de Cuenta General.
    const idPreseleccionado = route.query.id_arbitro
    if (idPreseleccionado) {
      const arbitro = lista.find(a => String(a.id) === String(idPreseleccionado))
      if (arbitro) filtros.arbitro = `${arbitro.apellido} ${arbitro.nombre}`
    }
  } catch (err) {
    console.error('Error cargando árbitros:', err)
  }
}

const confirmarGenerar = () => {
  notificar({
    titulo: 'Generar aportes del período?',
    mensaje: `Se generarán los movimientos de las designaciones publicadas de ${periodoGenerar.value} y se recalcularán los que sigan pendientes (por ejemplo, si cambió el porcentaje de un árbitro). Los movimientos ya cerrados no se modifican. Puede ejecutarse varias veces sin duplicar.`,
    tipo: 'success',
    alConfirmar: generarAportes
  })
}

const generarAportes = async () => {
  generando.value = true
  try {
    const res = await api.post({ entity: 'tesoreria', action: 'generarAportesPeriodo', payload: { periodo: periodoGenerar.value } })
    if (res.ok) {
      await obtenerMovimientos()
      toast({ titulo: 'Aportes calculados', mensaje: `Generados: ${res.payload.generados} · Actualizados: ${res.payload.actualizados ?? 0} · Anulados por suspensión: ${res.payload.anulados ?? 0} · Exentos: ${res.payload.exentos ?? 0} · Sin cambios u omitidos: ${res.payload.omitidos}`, tipo: 'success' })
    } else {
      toast({ titulo: 'Error', mensaje: res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    generando.value = false
  }
}

const mostrarModalManual = ref(false)
// Árbitro y fecha: valen para todos los movimientos de la lista
const formManualBase = () => ({ id_arbitro: '', fecha: new Date().toISOString().slice(0, 10) })
const formManual = reactive(formManualBase())

// Movimiento que se está armando. opcion: 'debito' | 'credito' | 'item' (el ítem siempre va como crédito)
// En ítems, monto es el valor unitario y cantidad cuántas veces se carga (ej: 6 viáticos)
const lineaBase = () => ({ opcion: 'debito', item: '', cantidad: 1, monto: null, descripcion: '' })
const linea = reactive(lineaBase())

// Movimientos agregados a la lista, listos para guardar
const lineas = ref([])
let uidLinea = 0

const totales = computed(() => {
  const debitos = lineas.value.filter(l => l.tipo === 'debito').reduce((t, l) => t + Number(l.monto), 0)
  const creditos = lineas.value.filter(l => l.tipo === 'credito').reduce((t, l) => t + Number(l.monto), 0)
  return { debitos, creditos, neto: debitos - creditos }
})

// Cantidad válida (entero de 1 a 999); solo aplica a ítems
const cantidadLinea = computed(() => (linea.opcion === 'item' ? Number(linea.cantidad) : 1))
const totalLinea = computed(() => {
  const total = Number(linea.monto) * cantidadLinea.value
  return Number.isFinite(total) && total > 0 ? Math.round(total * 100) / 100 : 0
})

// Valida la línea en armado; devuelve un mensaje de error o null
const errorLinea = () => {
  if (linea.opcion === 'item' && !linea.item) return 'Seleccioná un ítem.'
  if (linea.opcion === 'item') {
    const cant = Number(linea.cantidad)
    if (!Number.isInteger(cant) || cant < 1 || cant > 999) return 'La cantidad tiene que ser un número entero entre 1 y 999.'
  }
  if (!(Number(linea.monto) > 0)) return 'Ingresá un monto mayor a 0.'
  return null
}
const lineaVacia = () => !linea.item && !linea.monto && !linea.descripcion.trim()

const agregarLinea = () => {
  const error = errorLinea()
  if (error) {
    toast({ titulo: 'Falta completar', mensaje: error, tipo: 'danger' })
    return false
  }
  const esItem = linea.opcion === 'item'
  const cantidad = esItem ? Number(linea.cantidad) : 1
  lineas.value.push({
    uid: ++uidLinea,
    tipo: esItem ? 'credito' : linea.opcion,
    item: esItem ? linea.item : null,
    cantidad,
    unitario: Number(linea.monto),
    monto: totalLinea.value,          // total = cantidad x valor unitario
    descripcion: linea.descripcion.trim(),
  })
  // Deja el mismo tipo elegido para cargar el siguiente más rápido
  Object.assign(linea, { ...lineaBase(), opcion: linea.opcion })
  return true
}

const quitarLinea = (i) => lineas.value.splice(i, 1)

// ----------------------------------------------------
//  ÍTEMS (otros conceptos, sin Porcentaje de Aporte)
// ----------------------------------------------------
const valoresVigentes = ref([])
const cargandoValores = ref(false)

const itemsAgrupados = computed(() => {
  const grupos = []
  itemsAjusteManual.value.forEach(i => {
    let g = grupos.find(x => x.grupo === i.grupo)
    if (!g) grupos.push(g = { grupo: i.grupo, items: [] })
    g.items.push(i)
  })
  return grupos
})

const valorDeItem = (clave) => {
  const registro = valoresVigentes.value.find(v => v.concepto === clave && Number(v.id_categoria || 0) === 0)
  return registro ? Number(registro.valor) : null
}

const cargarValoresVigentes = async () => {
  cargandoValores.value = true
  try {
    const res = await api.get({ entity: 'tesoreria', action: 'obtenerValoresVigentes', payload: {} })
    if (res.ok) valoresVigentes.value = Array.isArray(res.payload) ? res.payload : []
  } catch (err) {
    console.error('Error cargando valores vigentes:', err)
  } finally {
    cargandoValores.value = false
  }
}

const elegirOpcion = (opcion) => {
  if (linea.opcion === opcion) return
  const veniaDeItem = linea.opcion === 'item'
  linea.opcion = opcion
  // Al entrar o salir de Ítem se limpia el ítem, la cantidad y el monto; entre Débito y Crédito el monto se mantiene
  if (opcion === 'item' || veniaDeItem) {
    linea.item = ''
    linea.cantidad = 1
    linea.monto = null
  }
}

const alElegirItem = () => {
  linea.monto = valorDeItem(linea.item)
}

const abrirModalManual = () => {
  Object.assign(formManual, formManualBase())
  Object.assign(linea, lineaBase())
  lineas.value = []
  mostrarModalManual.value = true
  // siempre frescos, por si se creó un concepto o se editó algún valor
  cargarConceptos()
  cargarValoresVigentes()
}

const mostrarModalEditar = ref(false)
const formEditar = reactive({ id: null, arbitro: '', opcion: 'debito', item: '', monto: null, fecha: '', descripcion: '' })

const abrirModalEditarManual = (m) => {
  Object.assign(formEditar, {
    id: m.id,
    arbitro: m.arbitro,
    opcion: m.item ? 'item' : m.tipo,
    item: m.item || '',
    monto: Number(m.monto),
    fecha: String(m.fecha_generacion).slice(0, 10),
    descripcion: m.descripcion || '',
  })
  mostrarModalEditar.value = true
  cargarConceptos()
  cargarValoresVigentes()
}

const elegirOpcionEditar = (opcion) => {
  if (formEditar.opcion === opcion) return
  const veniaDeItem = formEditar.opcion === 'item'
  formEditar.opcion = opcion
  if (opcion === 'item' || veniaDeItem) formEditar.item = ''
}

const confirmarEditarManual = () => {
  if (formEditar.opcion === 'item' && !formEditar.item) {
    toast({ titulo: 'Falta completar', mensaje: 'Seleccioná un ítem.', tipo: 'danger' })
    return
  }
  if (!(Number(formEditar.monto) > 0)) {
    toast({ titulo: 'Falta completar', mensaje: 'Ingresá un monto mayor a 0.', tipo: 'danger' })
    return
  }
  notificar({
    titulo: '¿Guardar cambios?',
    mensaje: `Se actualizará el ajuste manual de ${formEditar.arbitro}.`,
    tipo: 'success',
    alConfirmar: guardarEdicionManual
  })
}

const guardarEdicionManual = async () => {
  procesando.value = true
  try {
    const esItem = formEditar.opcion === 'item'
    const res = await api.post({
      entity: 'tesoreria',
      action: 'editarMovimientoManual',
      payload: {
        id: formEditar.id,
        tipo: esItem ? 'credito' : formEditar.opcion,
        item: esItem ? formEditar.item : null,
        monto: Number(formEditar.monto),
        fecha: formEditar.fecha,
        descripcion: formEditar.descripcion.trim() || null,
      }
    })
    if (res.ok && res.payload?.success !== false) {
      mostrarModalEditar.value = false
      await obtenerMovimientos()
      toast({ titulo: 'Éxito', mensaje: 'El ajuste manual se actualizó correctamente.', tipo: 'success' })
    } else {
      toast({ titulo: 'Error', mensaje: res.payload?.message || res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

const confirmarGuardarManual = () => {
  if (!formManual.id_arbitro) {
    toast({ titulo: 'Falta completar', mensaje: 'Seleccioná un árbitro.', tipo: 'danger' })
    return
  }
  // Si quedó un movimiento armado sin agregar, se suma a la lista
  if (!lineaVacia() && !agregarLinea()) return
  if (!lineas.value.length) {
    toast({ titulo: 'Lista vacía', mensaje: 'Agregá al menos un movimiento.', tipo: 'danger' })
    return
  }
  const cant = lineas.value.length
  notificar({
    titulo: cant > 1 ? `¿Guardar ${cant} movimientos?` : '¿Crear ajuste manual?',
    mensaje: `Se registrará${cant > 1 ? 'n los movimientos' : ' el movimiento'} y se notificará al árbitro.`,
    tipo: 'success',
    alConfirmar: guardarManual
  })
}

// Si se cargó más de una unidad, el detalle queda en la descripción: "6 x $ 15.000,00 · texto"
const descripcionConCantidad = (l) => {
  const partes = []
  if (l.cantidad > 1) partes.push(`${l.cantidad} x ${formatearMonto(l.unitario)}`)
  if (l.descripcion) partes.push(l.descripcion)
  return partes.length ? partes.join(' · ').slice(0, 255) : null
}

const guardarManual = async () => {
  procesando.value = true
  try {
    const payload = {
      id_arbitro: formManual.id_arbitro,
      fecha: formManual.fecha,
      movimientos: lineas.value.map(l => ({
        tipo: l.tipo,
        monto: l.monto,
        descripcion: descripcionConCantidad(l),
        item: l.item,
      })),
    }
    const cant = lineas.value.length
    const res = await api.post({ entity: 'tesoreria', action: 'crearMovimientosManuales', payload })
    if (res.ok && res.payload?.success !== false) {
      mostrarModalManual.value = false
      await obtenerMovimientos()
      toast({
        titulo: 'Éxito',
        mensaje: cant > 1 ? `Se guardaron ${cant} movimientos.` : 'El ajuste manual se creó correctamente.',
        tipo: 'success'
      })
    } else {
      toast({ titulo: 'Error', mensaje: res.payload?.message || res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

const confirmarAnular = (m) => {
  notificar({
    titulo: 'Anular movimiento?',
    mensaje: `Se anulará el ajuste manual de ${m.arbitro} por ${formatearMonto(m.monto)}.`,
    tipo: 'danger',
    alConfirmar: () => anular(m.id)
  })
}

const anular = async (id) => {
  const res = await api.post({ entity: 'tesoreria', action: 'anularMovimientoManual', payload: { id } })
  if (res.ok && res.payload?.success !== false) {
    obtenerMovimientos()
    toast({ titulo: 'Anulado', mensaje: 'El movimiento fue anulado.', tipo: 'success' })
  } else {
    toast({ titulo: 'Error', mensaje: res.payload?.mensaje || 'No pudo anularse el movimiento.', tipo: 'danger' })
  }
}

const exportarExcel = async () => {
  const data = movimientosFiltrados.value.map(m => ({
    Fecha: m.fecha_generacion,
    Árbitro: m.arbitro,
    Concepto: m.concepto_etiqueta + (m.partido_categoria ? ` (${m.partido_categoria})` : ''),
    Tipo: m.tipo === 'debito' ? 'Débito' : 'Crédito',
    Monto: Number(m.monto),
    Estado: m.estado,
    Descripción: m.descripcion || ''
  }))

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Movimientos')
  const claves = Object.keys(data[0] || {})
  ws.columns = claves.map(clave => ({ header: clave, key: clave, width: 18 }))
  data.forEach(fila => ws.addRow(fila))
  if (claves.length) ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Movimientos_Tesoreria_AAAB.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  obtenerMovimientos()
  cargarArbitros()
  cargarConceptos() // para mostrar el nombre del ítem en la tabla
  cargarTiposMovimiento()
})
</script>

<style scoped>
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

.badge-status-sm {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-block;
  text-align: center;
  border: 1px solid;
}
.badge-status-sm.debito { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.badge-status-sm.credito { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
.badge-status-sm.pendiente { background: #fef9c3; color: #a16207; border-color: #fef08a; }
.badge-status-sm.cerrado { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
.badge-status-sm.anulado { background: #0f172a; color: #ffffff; border-color: #0f172a; }

.btn-danger-subtle { background: #fee2e2; color: #dc3545; border: 1px solid transparent; }
.btn-danger-subtle:hover { background: #fecaca; }

.animate__animated { animation-duration: 0.5s; }
</style>
