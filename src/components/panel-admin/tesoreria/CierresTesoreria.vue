<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-calendar-check me-1"></i> Cierre Mensual
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ cierres.length }} cierres realizados</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerCierres" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>
          </div>
        </div>

        <div class="bg-light p-3 border-bottom">
          <div class="row g-2 align-items-end">
            <div class="col-8 col-md-3">
              <label class="small fw-bold text-dark mb-1 d-block">Período a cerrar</label>
              <input type="month" v-model="periodoCerrar" class="form-control form-control-sm shadow-none">
            </div>
            <div class="col-4 col-md-3">
              <button @click="confirmarCierre" :disabled="!periodoCerrar || cerrando" class="btn btn-danger btn-sm w-100 fw-bold shadow-sm">
                <span v-if="cerrando" class="spinner-border spinner-border-sm me-1"></span>
                Cerrar Período
              </button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando cierres...</p>
          </div>

          <div v-else-if="cierresOrdenados.length === 0" class="text-center p-5 bg-white">
            <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 48px;">calendar_month</span>
            <p class="text-muted m-0 fw-bold">Todavía no se realizó ningún cierre.</p>
          </div>

          <div v-else class="table-responsive border rounded shadow-sm">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.85rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 text-uppercase text-muted">Período</th>
                  <th class="py-3 text-uppercase text-muted">Fecha de Cierre</th>
                  <th class="py-3 text-uppercase text-muted">Cerrado por</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in cierresOrdenados" :key="c.id">
                  <td class="fw-bold text-dark">{{ c.periodo }}</td>
                  <td>{{ c.fecha_cierre }}</td>
                  <td>{{ c.cerrado_por || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'

useHead({ title: 'Cierre Mensual | AAAB' })

const notificar = inject('notificar')
const toast = inject('toast', ({ mensaje }) => alert(mensaje))

const cargando = ref(false)
const cerrando = ref(false)
const cierres = ref([])
const periodoCerrar = ref(new Date().toISOString().slice(0, 7))

const cierresOrdenados = computed(() => [...cierres.value].sort((a, b) => b.periodo.localeCompare(a.periodo)))

const obtenerCierres = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'tesoreria', action: 'obtenerCierres', payload: {} })
    if (res.ok) cierres.value = Array.isArray(res.payload) ? res.payload : []
  } finally {
    cargando.value = false
  }
}

const confirmarCierre = () => {
  notificar({
    titulo: `Cerrar el período ${periodoCerrar.value}?`,
    mensaje: 'Esta acción es irreversible: los movimientos pendientes del período se consolidarán en el saldo de cada árbitro y no podrán modificarse.',
    tipo: 'danger',
    alConfirmar: cerrarPeriodo
  })
}

const cerrarPeriodo = async () => {
  cerrando.value = true
  try {
    const res = await api.post({ entity: 'tesoreria', action: 'cerrarPeriodo', payload: { periodo: periodoCerrar.value } })
    if (res.ok && res.payload?.success !== false) {
      await obtenerCierres()
      toast({ titulo: 'Período cerrado', mensaje: `Árbitros procesados: ${res.payload.arbitros_procesados}`, tipo: 'success' })
    } else {
      toast({ titulo: 'Error', mensaje: res.payload?.mensaje || res.message || 'El servidor rechazó la solicitud.', tipo: 'danger' })
    }
  } catch {
    toast({ titulo: 'Error', mensaje: 'Fallo de conexión.', tipo: 'danger' })
  } finally {
    cerrando.value = false
  }
}

onMounted(obtenerCierres)
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

.animate__animated { animation-duration: 0.5s; }
</style>
