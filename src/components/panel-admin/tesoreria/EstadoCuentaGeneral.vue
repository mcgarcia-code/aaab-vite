<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">Saldo de todos los árbitros · Total: {{ arbitrosFiltrados.length }} árbitros con movimientos</p>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="obtenerEstadoGlobal" />
            <BotonHerramienta tipo="excel" @click="exportarExcel" />
          </div>
        </div>

        <div class="bg-light p-3 border-bottom">
          <input aria-label="Buscar árbitro" v-model="busqueda" class="form-control form-control-sm shadow-none" placeholder="BUSCAR ÁRBITRO...">
        </div>

        <div class="card-body p-0 p-md-3 bg-white">
          <EstadoCargando v-if="cargando" texto="Cargando estado de cuenta" />

          <div v-else class="table-responsive planilla-scroll border rounded shadow-sm">
            <table class="table table-hover align-middle mb-0 texto-085">
              <thead class="table-light">
                <tr>
                  <th class="py-3 text-uppercase text-muted">Árbitro</th>
                  <th class="py-3 text-end text-uppercase text-muted">Saldo Último Cierre</th>
                  <th class="py-3 text-end text-uppercase text-muted">Pendiente sin Cerrar</th>
                  <th class="py-3 text-end text-uppercase text-muted">Saldo Total</th>
                  <th class="py-3 text-center text-uppercase text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in arbitrosFiltrados" :key="a.id">
                  <td class="fw-bold text-dark text-uppercase">{{ a.apellido }}, {{ a.nombre }}</td>
                  <td class="text-end">{{ formatearMonto(a.saldo_ultimo_cierre) }}</td>
                  <td class="text-end">{{ formatearMonto(a.pendiente_sin_cerrar) }}</td>
                  <td class="text-end fw-bold" :class="saldoTotal(a) > 0 ? 'text-danger' : 'text-success'">{{ formatearMonto(saldoTotal(a)) }}</td>
                  <td class="text-center">
                    <RouterLink :to="{ path: '/panel-admin/tesoreria/aportes-pagos/movimientos', query: { id_arbitro: a.id } }" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" title="Ver movimientos">
                      <i class="bi bi-eye texto-16px"></i>
                    </RouterLink>
                  </td>
                </tr>
                <tr v-if="arbitrosFiltrados.length === 0">
                  <td colspan="5" class="py-5 text-center text-muted border-0 bg-white">
                    <i class="bi bi-search d-block fs-1 mb-2"></i>
                    <p class="m-0 fw-bold">No se encontraron árbitros.</p>
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
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import { ref, computed, onMounted } from 'vue'
import { cargarExcelJS } from '@/utils/librerias'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'

useHead({ title: 'Estado de Cuenta General | AAAB' })

const cargando = ref(false)
const arbitrosCuenta = ref([])
const busqueda = ref('')

const normalizar = (t) => t ? t.toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') : ''
const formatearMonto = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(Number(v) || 0)
const saldoTotal = (a) => (Number(a.saldo_ultimo_cierre) || 0) + (Number(a.pendiente_sin_cerrar) || 0)

const arbitrosFiltrados = computed(() => {
  return arbitrosCuenta.value.filter(a => normalizar(`${a.apellido} ${a.nombre}`).includes(normalizar(busqueda.value)))
    .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`))
})

const obtenerEstadoGlobal = async () => {
  cargando.value = true
  try {
    const res = await api.get({ entity: 'tesoreria', action: 'obtenerEstadoCuentaGlobal', payload: {} })
    if (res.ok) arbitrosCuenta.value = Array.isArray(res.payload) ? res.payload : []
  } finally {
    cargando.value = false
  }
}

const exportarExcel = async () => {
  const data = arbitrosFiltrados.value.map(a => ({
    Árbitro: `${a.apellido}, ${a.nombre}`,
    'Saldo Último Cierre': Number(a.saldo_ultimo_cierre) || 0,
    'Pendiente sin Cerrar': Number(a.pendiente_sin_cerrar) || 0,
    'Saldo Total': saldoTotal(a)
  }))

  const wb = new (await cargarExcelJS()).Workbook()
  const ws = wb.addWorksheet('EstadoCuenta')
  const claves = Object.keys(data[0] || {})
  ws.columns = claves.map(clave => ({ header: clave, key: clave, width: 22 }))
  data.forEach(fila => ws.addRow(fila))
  if (claves.length) ws.getRow(1).font = { bold: true }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'EstadoCuenta_Tesoreria_AAAB.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(obtenerEstadoGlobal)
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
