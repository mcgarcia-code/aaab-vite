<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom gap-3">
          <p class="seccion-descripcion">Nueva resolución disciplinaria</p>

          <div class="d-flex align-items-center">
            <BotonHerramienta tipo="enlace" texto="Ver listado" icono="bi-list-ul" @click="$router.push('/panel-admin/tribunal/sanciones')" />
          </div>
        </div>

        <div class="card-body p-3 p-md-4 bg-light">
          <div class="row g-4">

            <!-- FORMULARIO PRINCIPAL -->
            <div class="col-12 col-lg-8">
              <div class="card border-0 shadow-sm rounded-4 h-100" style="border-top: 4px solid #dc2626 !important;">
                <div class="card-body p-4">
                  <form @submit.prevent="guardarSancion">
                    <div class="row g-3">

                      <div class="col-12">
                        <label class="fw-bold text-dark small mb-1">Árbitro Involucrado *</label>
                        <select aria-label="Árbitro Involucrado" v-model="nuevaSancion.id_arbitro" class="form-select shadow-none border-secondary-subtle bg-light py-2" required :disabled="cargando">
                          <option value="" disabled>Seleccione un árbitro...</option>
                          <option v-for="a in arbitros" :key="a.id" :value="a.id">
                            {{ a.apellido }}, {{ a.nombre }}
                          </option>
                        </select>
                      </div>

                      <div class="col-12">
                        <label class="fw-bold text-dark small mb-1">Artículo (Reglamento) *</label>
                        <input aria-label="Artículo (Reglamento)" type="text" v-model="nuevaSancion.articulo" placeholder="Ej: Art. 42 inc B" class="form-control shadow-none border-secondary-subtle bg-light py-2" required :disabled="cargando">
                      </div>

                      <div class="col-12">
                        <label class="fw-bold text-dark small mb-1">Motivo / Descripción de los hechos *</label>
                        <textarea aria-label="Motivo / Descripción de los hechos" v-model="nuevaSancion.motivo" rows="5" class="form-control shadow-none border-secondary-subtle bg-light py-2" placeholder="Detalle los motivos por los cuales se inicia este proceso..." required :disabled="cargando"></textarea>
                      </div>

                      <div class="col-12 mt-4 pt-3 border-top border-light-subtle">
                        <button type="submit" :disabled="cargando" class="btn btn-danger w-100 fw-bold py-3 shadow-sm rounded-3">
                          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                          {{ cargando ? 'INICIANDO PROCESO...' : 'REGISTRAR SANCIÓN' }}
                        </button>
                      </div>

                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- BARRA LATERAL (HISTORIAL) -->
            <div class="col-12 col-lg-4">
              <div class="card border-0 shadow-sm rounded-4 h-100" style="border-top: 4px solid #64748b !important;">
                <div class="card-body p-4">
                  <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <i class="bi bi-clock-history"></i> Últimos Registros
                  </h6>

                  <EstadoCargando v-if="cargandoHistorial" texto="Cargando" />

                  <div v-else-if="ultimasSanciones.length === 0" class="text-muted text-center my-5">
                    <i class="bi bi-clock-history fs-1 opacity-50 d-block mb-2"></i>
                    <span class="small fw-bold">Sin registros recientes</span>
                  </div>

                  <div v-else class="d-flex flex-column gap-3">
                    <div v-for="s in ultimasSanciones" :key="s.id" class="border-bottom pb-3">
                      <div class="d-flex justify-content-between align-items-start mb-1">
                        <strong class="text-dark small text-uppercase">{{ s.arbitro || s.arbitro_nombre || s.id_arbitro }}</strong>
                        <span :class="obtenerClaseEstado(s.estado_dinamico)">
                          {{ obtenerTextoEstado(s.estado_dinamico) }}
                        </span>
                      </div>
                      <div class="small text-muted mt-2 lh-sm border-start border-3 ps-2">
                        <strong class="text-dark">Art. {{ s.articulo }}</strong> - {{ s.motivo }}
                      </div>
                      <div class="small mt-2 fw-bold" :class="obtenerClaseTextoSancion(s.estado_dinamico)">
                        {{ obtenerTextoSancion(s) }}
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
</template>

<script setup>
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import { ref, onMounted, inject } from 'vue'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Cargar Sanción | AAAB'
})

const toast = inject('toast')

const arbitros  = ref([])
const ultimasSanciones = ref([])
const cargando  = ref(false)
const cargandoHistorial = ref(true)

const sancionVacia = () => ({
  id_arbitro: '',
  articulo: '',
  motivo: ''
})

const nuevaSancion = ref(sancionVacia())

// LÓGICA VISUAL
const obtenerTextoEstado = (estado_dinamico) => {
  if (estado_dinamico == 1) return 'VIGENTE'
  if (estado_dinamico == 2) return 'CUMPLIDA'
  if (estado_dinamico == 3) return 'EN PROCESO'
  if (estado_dinamico == 4) return 'ANULADA'
  return 'DESCONOCIDO'
}

const obtenerClaseEstado = (estado_dinamico) => {
  if (estado_dinamico == 1) return 'estado-pill estado-vigente'
  if (estado_dinamico == 2) return 'estado-pill estado-cumplida'
  if (estado_dinamico == 3) return 'estado-pill estado-en-proceso'
  if (estado_dinamico == 4) return 'estado-pill estado-anulada'
  return 'estado-pill estado-default'
}

const obtenerTextoSancion = (s) => {
  if (s.estado_dinamico == 4) return 'Anulada'
  if (s.estado_dinamico == 3) return 'En proceso'
  return s.sancion || 'En proceso'
}

const obtenerClaseTextoSancion = (estado_dinamico) => {
  if (estado_dinamico == 4) return 'text-anulada fw-bold'
  if (estado_dinamico == 3) return 'text-en-proceso fw-bold'
  return 'text-danger fw-bold'
}

const cargarArbitros = async () => {
  try {
    const data = await api.get({ entity: 'arbitros', action: 'getArbitros' })
    let lista = Array.isArray(data) ? data : (data.payload ?? [])

    lista.sort((a, b) => {
      const nombreA = `${a.apellido} ${a.nombre}`.toUpperCase()
      const nombreB = `${b.apellido} ${b.nombre}`.toUpperCase()
      return nombreA.localeCompare(nombreB)
    })

    arbitros.value = lista
  } catch (err) {
    console.error('Error cargando árbitros:', err)
  }
}

const cargarUltimasSanciones = async () => {
  cargandoHistorial.value = true
  try {
    const data = await api.get({ entity: 'sanciones', action: 'obtenerSanciones' })
    let lista = Array.isArray(data) ? data : (data.payload ?? [])

    // ORDENAR DE MÁS RECIENTE A MÁS ANTIGUA (MAYOR ID PRIMERO)
    lista.sort((a, b) => b.id - a.id)

    ultimasSanciones.value = lista.slice(0, 5)
  } catch (err) {
    console.error('Error cargando historial:', err)
  } finally {
    cargandoHistorial.value = false
  }
}

const guardarSancion = async () => {
  if (!nuevaSancion.value.id_arbitro || !nuevaSancion.value.articulo.trim() || !nuevaSancion.value.motivo.trim()) {
    toast({ titulo: 'Datos incompletos', mensaje: 'Por favor completá todos los campos obligatorios.', tipo: 'warning' })
    return
  }

  cargando.value = true

  try {
    const res = await api.post({
      entity:  'sanciones',
      action:  'crearSancion',
      payload: nuevaSancion.value,
    })

    if (res?.ok !== false) {
      toast({ titulo: '¡Proceso Iniciado!', mensaje: 'La sanción se registró y se notificó al árbitro.', tipo: 'success' })
      nuevaSancion.value = sancionVacia()
      await cargarUltimasSanciones()
    } else {
      toast({ titulo: 'Error al registrar', mensaje: res?.message || 'Hubo un problema en el servidor al intentar guardar.', tipo: 'danger' })
    }
  } catch (error) {
    console.error("Error en guardarSancion:", error)
    toast({ titulo: 'Error de Conexión', mensaje: 'No se pudo contactar con el servidor. Revisá tu conexión.', tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarArbitros()
  cargarUltimasSanciones()
})
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES
   ==================================================== */

/* ====================================================
   UTILIDADES PARA INPUTS
   ==================================================== */
.form-control:focus, .form-select:focus {
  background-color: var(--o-tarjeta, #fff) !important;
  border-color: #dc2626 !important;
}

/* ====================================================
   ESTADOS DE SANCIONES (Badges y Textos)
   ==================================================== */
.text-en-proceso { color: var(--o-ambar-texto, #d97706) !important; }
.text-anulada { color: var(--o-texto, #0f172a) !important; }

/* Cero media queries. Totalmente manejado por las grillas col-12 col-lg-8/4 de Bootstrap */
</style>
