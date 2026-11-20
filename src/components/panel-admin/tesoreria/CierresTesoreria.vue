<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Cerrar el período e historial · Total: {{ cierres.length }} cierres realizados</p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="obtenerCierres" />
          </div>
        </div>

        <div class="bg-light p-3 border-bottom">
          <div class="row g-2 align-items-end">
            <div class="col-8 col-md-3">
              <label class="small fw-bold text-dark mb-1 d-block">Período a cerrar</label>
              <input aria-label="Período a cerrar" type="month" v-model="periodoCerrar" class="form-control form-control-sm shadow-none">
            </div>
            <div class="col-12 col-md-3">
              <div class="form-check form-switch mb-1">
                <input id="notificarArbitros" type="checkbox" v-model="notificarArbitros" class="form-check-input">
                <label for="notificarArbitros" class="form-check-label small fw-bold text-dark">Notificar a los árbitros</label>
              </div>
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
          <EstadoCargando v-if="cargando" texto="Cargando cierres" />

          <EstadoVacio v-else-if="cierresOrdenados.length === 0" icono="bi-calendar3" titulo="Todavía no se realizó ningún cierre" />

          <div v-else class="table-responsive border rounded shadow-sm">
            <table class="table table-hover align-middle mb-0 texto-085">
              <thead class="table-light">
                <tr>
                  <th class="py-3 text-uppercase text-muted">Período</th>
                  <th class="py-3 text-uppercase text-muted">Fecha de Cierre</th>
                  <th class="py-3 text-uppercase text-muted">Cerrado por</th>
                  <th class="py-3 text-center text-uppercase text-muted">Detalle</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in cierresOrdenados" :key="c.id">
                  <td class="fw-bold text-dark">{{ c.periodo }}</td>
                  <td>{{ c.fecha_cierre }}</td>
                  <td>{{ c.cerrado_por || '-' }}</td>
                  <td class="text-center">
                    <div class="dropdown">
                      <button class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" :disabled="!!descargando[c.periodo]" title="Descargar detalle" aria-label="Descargar detalle">
                        <span v-if="descargando[c.periodo]" class="spinner-border spinner-border-sm"></span>
                        <i v-else class="bi bi-download align-middle texto-16px"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end shadow">
                        <li>
                          <button class="dropdown-item d-flex align-items-center gap-2" @click="descargar(c, 'pdf')">
                            <i class="bi bi-file-earmark-pdf fs-6 text-danger"></i>
                            <span class="small fw-bold">PDF</span>
                          </button>
                        </li>
                        <li>
                          <button class="dropdown-item d-flex align-items-center gap-2" @click="descargar(c, 'excel')">
                            <i class="bi bi-table fs-6 text-success"></i>
                            <span class="small fw-bold">Excel</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
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
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@vueuse/head'

useHead({ title: 'Cierre Mensual | AAAB' })

const notificar = inject('notificar')
const toast = inject('toast')

const cargando = ref(false)
const cerrando = ref(false)
const descargando = reactive({})
const cierres = ref([])
const notificarArbitros = ref(true)
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
    mensaje: 'Esta acción es irreversible: los movimientos pendientes del período se consolidarán en el saldo de cada árbitro y no podrán modificarse. ' +
      (notificarArbitros.value ? 'Se notificará a los árbitros por mail y en la web.' : 'No se notificará a los árbitros.'),
    tipo: 'danger',
    alConfirmar: cerrarPeriodo
  })
}

const cerrarPeriodo = async () => {
  cerrando.value = true
  try {
    const res = await api.post({ entity: 'tesoreria', action: 'cerrarPeriodo', payload: { periodo: periodoCerrar.value, notificar: notificarArbitros.value } })
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

const descargar = async (c, formato) => {
  const esExcel = formato === 'excel'
  descargando[c.periodo] = true
  try {
    await api.getFile({
      entity: 'tesoreria',
      action: 'descargarCierre',
      payload: { periodo: c.periodo, ...(esExcel ? { formato: 'excel' } : {}) }
    }, `cierre_${c.periodo}.${esExcel ? 'xlsx' : 'pdf'}`)
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e?.message || 'No se pudo descargar el archivo', tipo: 'danger' })
  } finally {
    delete descargando[c.periodo]
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
