<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <!-- RESUMEN DE SALDO -->
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-cash-coin me-2"></i> Mis Aportes
          </h4>
          <p class="text-muted small m-0 mt-1">Consultá el estado de tus aportes a la asociación</p>
        </div>
        <button @click="cargarTodo" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2 align-self-start align-self-md-center">
          <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
          <span v-else class="material-icons text-dark fs-6">refresh</span>
          <span class="fw-bold text-dark small">Actualizar</span>
        </button>
      </div>

      <div class="card-body p-4" v-if="cargando">
        <div class="text-center py-4">
          <span class="spinner-border text-danger"></span>
        </div>
      </div>

      <div class="card-body p-4" v-else-if="estadoCuenta">
        <div class="text-center mb-4">
          <span class="text-muted small text-uppercase fw-bold d-block mb-1">Saldo Estimado Actual</span>
          <span class="fw-bold" :class="esDeuda ? 'text-danger' : 'text-success'" style="font-size: 2.2rem;">
            {{ formatearMonto(Math.abs(estadoCuenta.saldo_estimado_actual)) }}
          </span>
          <span class="d-block small fw-bold" :class="esDeuda ? 'text-danger' : 'text-success'">
            {{ esDeuda ? 'A PAGAR A LA ASOCIACIÓN' : 'AL DÍA / A FAVOR' }}
          </span>
        </div>

        <div class="row g-2 text-center">
          <div class="col-4">
            <div class="bg-light rounded p-2 border">
              <span class="d-block small text-muted">Saldo Último Cierre</span>
              <span class="fw-bold text-dark">{{ formatearMonto(estadoCuenta.saldo_ultimo_cierre) }}</span>
            </div>
          </div>
          <div class="col-4">
            <div class="bg-light rounded p-2 border">
              <span class="d-block small text-muted">Débitos Pendientes</span>
              <span class="fw-bold text-danger">{{ formatearMonto(estadoCuenta.debitos_pendientes) }}</span>
            </div>
          </div>
          <div class="col-4">
            <div class="bg-light rounded p-2 border">
              <span class="d-block small text-muted">Créditos Pendientes</span>
              <span class="fw-bold text-success">{{ formatearMonto(estadoCuenta.creditos_pendientes) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RECARGOS VIGENTES -->
    <div v-if="recargosActivos.length > 0" class="alert alert-warning border-0 shadow-sm mb-4" style="border-radius: 12px;">
      <div class="d-flex align-items-start gap-2">
        <i class="bi bi-exclamation-triangle-fill fs-5 mt-1"></i>
        <div>
          <strong class="d-block mb-1">Tenés un recargo aplicado sobre tu porcentaje de aporte</strong>
          <div v-for="r in recargosActivos" :key="r.id" class="small">
            <strong>{{ r.porcentaje }}%</strong> desde el {{ r.fecha_desde }}{{ r.fecha_hasta ? ` hasta el ${r.fecha_hasta}` : '' }} — {{ r.motivo }}
          </div>
        </div>
      </div>
    </div>

    <!-- MOVIMIENTOS PENDIENTES -->
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <h5 class="fw-bold m-0 text-dark d-flex align-items-center gap-2">
          <i class="bi bi-list-check"></i> Movimientos del Período Actual
        </h5>
      </div>
      <div class="card-body p-0">
        <div v-if="!cargando && movimientosPendientes.length === 0" class="text-center p-4 bg-light">
          <p class="text-muted m-0 small">No tenés movimientos pendientes en este momento.</p>
        </div>

        <div v-else class="d-flex flex-column">
          <div v-for="m in movimientosPendientes" :key="m.id" class="border-bottom item-movimiento bg-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span class="fw-bold text-dark d-block">{{ etiquetaConcepto(m.concepto) }}</span>
              <span class="text-muted small">{{ m.fecha_generacion }}{{ m.descripcion ? ' · ' + m.descripcion : '' }}</span>
            </div>
            <span class="fw-bold" :class="m.tipo === 'debito' ? 'text-danger' : 'text-success'">
              {{ m.tipo === 'debito' ? '-' : '+' }} {{ formatearMonto(m.monto) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- HISTORIAL DE CIERRES -->
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 border-bottom">
        <h5 class="fw-bold m-0 text-dark d-flex align-items-center gap-2">
          <i class="bi bi-calendar-check"></i> Historial de Cierres
        </h5>
      </div>
      <div class="card-body p-0">
        <div v-if="!cargando && historialCierres.length === 0" class="text-center p-4 bg-light">
          <p class="text-muted m-0 small">Todavía no tenés cierres registrados.</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table align-middle mb-0" style="font-size: 0.85rem;">
            <thead class="table-light">
              <tr>
                <th class="py-2 ps-3 text-uppercase text-muted">Período</th>
                <th class="py-2 text-end text-uppercase text-muted">Saldo del Mes</th>
                <th class="py-2 text-end pe-3 text-uppercase text-muted">Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historialCierres" :key="h.periodo">
                <td class="ps-3 fw-bold text-dark">{{ h.periodo }}</td>
                <td class="text-end" :class="Number(h.saldo_mes) > 0 ? 'text-danger' : 'text-success'">{{ formatearMonto(h.saldo_mes) }}</td>
                <td class="text-end pe-3 fw-bold" :class="Number(h.saldo_acumulado) > 0 ? 'text-danger' : 'text-success'">{{ formatearMonto(h.saldo_acumulado) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="alert alert-secondary mt-4 border-0 shadow-sm mx-auto w-100" style="border-radius: 12px;">
      <div class="d-flex align-items-center">
        <i class="bi bi-info-square-fill me-3 fs-3 text-secondary opacity-75"></i>
        <div class="small text-dark lh-sm">
          Los aportes se calculan a partir de tus designaciones publicadas. Si tenés dudas sobre tus registros, contactate con tesorería.
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useHead } from '@vueuse/head';
import { api } from '@/api/api';

useHead({
  title: 'Mis Aportes | AAAB',
  meta: [
    { name: 'description', content: 'Consultá el estado de tus aportes a la Asociación Argentina de Árbitros de Balonmano.' },
    { property: 'og:title', content: 'Mis Aportes | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const cargando = ref(false);
const estadoCuenta = ref(null);
const recargos = ref([]);

const CONCEPTOS = {
  arbitraje: 'Arbitraje',
  observador: 'Observador',
  mesa_arbitral: 'Mesa Arbitral',
  delegado: 'Delegado',
  ajuste_manual: 'Ajuste Manual'
};
const etiquetaConcepto = (c) => CONCEPTOS[c] || c;

const formatearMonto = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(Number(v) || 0);

const esDeuda = computed(() => estadoCuenta.value && Number(estadoCuenta.value.saldo_estimado_actual) > 0);
const movimientosPendientes = computed(() => estadoCuenta.value?.movimientos_pendientes || []);
const historialCierres = computed(() => estadoCuenta.value?.historial_cierres || []);

const recargosActivos = computed(() => {
  const hoy = new Date().toISOString().slice(0, 10);
  return recargos.value.filter(r => Number(r.activo) !== 0 && (!r.fecha_hasta || r.fecha_hasta >= hoy));
});

const cargarEstadoCuenta = async () => {
  const res = await api.get({ entity: 'tesoreria', action: 'obtenerEstadoCuenta', payload: {} });
  if (res.ok) estadoCuenta.value = res.payload;
};

const cargarRecargos = async () => {
  const res = await api.get({ entity: 'tesoreria', action: 'obtenerOverridesPorcentaje', payload: {} });
  if (res.ok) recargos.value = Array.isArray(res.payload) ? res.payload : [];
};

const cargarTodo = async () => {
  cargando.value = true;
  try {
    await Promise.all([cargarEstadoCuenta(), cargarRecargos()]);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarTodo);
</script>

<style scoped>
.item-movimiento { transition: background-color 0.2s; }
.item-movimiento:hover { background-color: #f8fafc; }

.animate__animated { animation-duration: 0.5s; }
</style>
