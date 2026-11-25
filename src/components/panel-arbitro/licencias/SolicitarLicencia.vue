<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="row g-4">
      <!-- COLUMNA IZQUIERDA: FORMULARIO -->
      <div class="col-12 col-lg-4">
        <div class="card shadow p-3 p-md-4 border-0 h-100 radio-15">
          <p class="seccion-descripcion mb-3">Avisá tus inasistencias</p>
          <p class="text-muted small mb-4">
            Las licencias particulares deben solicitarse con un mínimo de <strong>10 días</strong> de antelación. Las mismas son por día completo, no hay licencias parciales.
          </p>

          <div class="mb-3">
            <label class="form-label fw-bold small text-dark">Motivo de la Licencia</label>
            <select aria-label="Motivo de la Licencia" v-model="motivoSeleccionado" class="form-select form-select-lg shadow-none fs-6" :disabled="cargando">
              <option value="particular">Particular</option>
              <option value="lesion_enfermedad">Lesión / Enfermedad</option>
              <option v-if="!tiempoIndeterminado" value="designacion_torneo_nacional">Designación Torneo Nacional</option>
            </select>
          </div>

          <div v-if="motivoSeleccionado === 'lesion_enfermedad' && !tiempoIndeterminado" class="alert alert-warning small py-2 px-3 mb-3 border-0" style="border-radius: 8px;">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            Tu licencia quedará <strong>Pendiente</strong>. Tenés 72 hs para enviar el certificado médico a <strong>licencias@arbitroshandball.com.ar</strong>, sino será rechazada y enviada al Tribunal de Ética. Avisá a tu coordinador.
          </div>

          <div v-if="motivoSeleccionado === 'lesion_enfermedad' && tiempoIndeterminado" class="alert alert-warning small py-2 px-3 mb-3 border-0" style="border-radius: 8px;">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            La licencia por lesión/enfermedad por tiempo indeterminado es para <strong>lesiones de largo tratamiento</strong>. Tu licencia quedará <strong>Aprobada</strong>. Recordá enviar el certificado médico a <strong>licencias@arbitroshandball.com.ar</strong> y avisarle a tu coordinador.
          </div>

          <div v-if="motivoSeleccionado === 'designacion_torneo_nacional'" class="alert alert-warning small py-2 px-3 mb-3 border-0" style="border-radius: 8px;">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>
            Tu licencia quedará <strong>Pendiente</strong> hasta que sea autorizada por la Comisión Directiva.
          </div>

          <div class="row g-2 mb-3">
            <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
              <label class="form-label fw-bold small text-dark" for="licenciaDesde">Desde</label>
              <input
                id="licenciaDesde"
                type="date"
                v-model="fechaDesde"
                :min="hoyISO"
                class="form-control form-control-lg custom-input-date shadow-none"
                onkeydown="return false"
                :disabled="cargando || tiempoIndeterminado"
              >
            </div>
            <div class="col-12 col-sm-6 col-lg-12 col-xl-6">
              <label class="form-label fw-bold small text-dark" for="licenciaHasta">Hasta</label>
              <input
                id="licenciaHasta"
                type="date"
                v-model="fechaHasta"
                :min="fechaDesde || hoyISO"
                class="form-control form-control-lg custom-input-date shadow-none"
                onkeydown="return false"
                :disabled="cargando || tiempoIndeterminado || !fechaDesde"
              >
            </div>
            <div v-if="cantidadDias > 1" class="col-12">
              <small class="text-muted"><i class="bi bi-calendar-range me-1"></i>Licencia de {{ cantidadDias }} días.</small>
            </div>
          </div>

          <div class="mb-4">
            <div class="form-check">
              <input v-model="tiempoIndeterminado" @change="onToggleTiempoIndeterminado" class="form-check-input" type="checkbox" id="chkTiempoIndeterminadoArb" :disabled="cargando">
              <label class="form-check-label small fw-bold text-dark" for="chkTiempoIndeterminadoArb">
                Por tiempo indeterminado
              </label>
            </div>
            <div v-if="tiempoIndeterminado" class="form-text small text-muted mt-1">
              <i class="bi bi-info-circle me-1"></i>
              Las licencias indeterminadas solo pueden ser Particulares o por Lesión/Enfermedad.
            </div>
          </div>

          <div class="mt-auto">
            <button
              @click="solicitarLicencia"
              :disabled="!puedeEnviar || cargando"
              class="btn btn-danger w-100 fw-bold py-3 py-md-2 shadow-sm"
            >
              <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
              {{ cargando ? 'PROCESANDO...' : 'ENVIAR SOLICITUD' }}
            </button>
          </div>
        </div>
      </div>

      <!-- COLUMNA DERECHA: HISTORIAL -->
      <div class="col-12 col-lg-8">
        <div class="card shadow border-0 overflow-hidden h-100 d-flex flex-column radio-15">
          <div class="card-header bg-white py-3 border-bottom flex-shrink-0">
            <h6 class="m-0 fw-bold text-dark small text-uppercase espaciado-1">Mi Historial de Licencias</h6>
          </div>

          <div class="card-body p-0 bg-white flex-grow-1">

            <EstadoVacio v-if="licencias.length === 0" icono="bi-calendar"
                         titulo="No tenés licencias registradas" />

            <!-- LISTA RESPONSIVA (Reemplaza a la etiqueta table) -->
            <div v-else class="h-100 d-flex flex-column">

              <!-- Encabezado Escritorio -->
              <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 text-uppercase text-muted fw-bold" style="font-size: 0.70rem;">
                <div class="col-md-3 ps-3">Fecha</div>
                <div class="col-md-2">Solicitada</div>
                <div class="col-md-3">Motivo</div>
                <div class="col-md-2 text-center">Estado</div>
                <div class="col-md-2 text-center pe-3">Acción</div>
              </div>

              <!-- Filas de Datos -->
              <div class="overflow-auto" style="max-height: 60vh;">
                <div v-for="(lic, index) in licenciasPaginadas" :key="index" class="row g-0 align-items-center p-3 p-md-2 border-bottom bg-white item-licencia">

                  <!-- HEADER MOBILE: Datos (Se oculta en PC) -->
                  <div class="col-12 d-md-none mb-3 border-bottom pb-2">
                    <div class="fw-bold text-dark fs-6">{{ formatearFechaAusencia(lic) }}</div>
                    <div class="text-muted mt-1 texto-08">
                      <i class="bi bi-clock me-1"></i> Solicitada: {{ formatearFecha(lic.fecha_solicitud) }}
                    </div>
                    <div class="text-muted texto-08">
                      <i class="bi bi-tag me-1"></i> Motivo: {{ etiquetaMotivo(lic.motivo, true) }}
                    </div>
                  </div>

                  <!-- COLUMNAS ESCRITORIO -->
                  <div class="col-md-3 d-none d-md-block fw-bold text-dark ps-3 texto-085">
                    {{ formatearFechaAusencia(lic) }}
                  </div>
                  <div class="col-md-2 d-none d-md-block text-muted small">
                    {{ formatearFecha(lic.fecha_solicitud) }}
                  </div>
                  <div class="col-md-3 d-none d-md-block text-muted small text-truncate pe-2">
                    {{ etiquetaMotivo(lic.motivo) }}
                  </div>

                  <!-- ESTADO Y ACCIÓN (Ambos, en celular se parten mitad y mitad) -->
                  <div class="col-6 col-md-2 text-start text-md-center pe-2 pe-md-0">
                    <span class="estado-pill w-90 py-2 py-md-1 texto-07 espaciado-05" :class="'estado-' + lic.estado">
                      {{ lic.estado.toUpperCase() }}
                    </span>
                  </div>
                  <div class="col-6 col-md-2 text-start text-md-center pe-2 pe-md-0">
                    <button
                      v-if="puedeAnular(lic)"
                      @click="anularLicencia(lic)"
                      class="btn btn-sm btn-anular w-90 py-2 py-md-1 shadow-sm texto-07 espaciado-05"
                      :disabled="cargando"
                    >
                      <i class="bi bi-x-circle"></i> Anular
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>

          <!-- Paginación -->
          <BarraPaginacion v-model="paginaActual" :total="totalPaginas" class="py-4 bg-white border-top" />

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import { ref, onMounted, inject, computed, watch } from 'vue'
import BarraPaginacion from '@/components/comunes/BarraPaginacion.vue'
import { usePaginacion } from '@/composables/usePaginacion'
import { fechaArg } from '@/utils/fechas'
import { api } from '@/api/api'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Solicitar Licencia | AAAB',
  meta: [
    { name: 'description', content: 'Solicita tu licencia para ausentarte de tus compromisos arbitrales.' }
  ],
})

const notificar = inject('notificar')
const toast = inject('toast')
const fechaDesde = ref('')
const fechaHasta = ref('')
const aISOlocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hoyISO = aISOlocal(new Date())
const cantidadDias = computed(() => {
  if (!fechaDesde.value || !fechaHasta.value || fechaHasta.value < fechaDesde.value) return 0
  const [y1, m1, d1] = fechaDesde.value.split('-').map(Number)
  const [y2, m2, d2] = fechaHasta.value.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000) + 1
})
const puedeEnviar = computed(() => tiempoIndeterminado.value || cantidadDias.value >= 1)
watch(fechaDesde, (desde) => {
  if (desde && (!fechaHasta.value || fechaHasta.value < desde)) fechaHasta.value = desde
})
const motivoSeleccionado = ref('particular')
const tiempoIndeterminado = ref(false)
const cargando = ref(false)
const licencias = ref([])

const onToggleTiempoIndeterminado = () => {
  if (tiempoIndeterminado.value) {
    fechaDesde.value = ''
    fechaHasta.value = ''
    // Las indeterminadas solo admiten particular o lesión/enfermedad.
    if (motivoSeleccionado.value === 'designacion_torneo_nacional') {
      motivoSeleccionado.value = 'particular'
    }
  }
}

// Variables de Paginación
const paginaActual = ref(1)
const registrosPorPagina = 4


const { totalPaginas, paginados: licenciasPaginadas } = usePaginacion(licencias, registrosPorPagina, paginaActual)


// Formateadores de fecha
const formatearFecha = (fecha) => fechaArg(fecha)

const formatearFechaAusencia = (lic) => {
  if (lic.tiempo_indeterminado == 1) return 'Tiempo indeterminado'
  const desde = formatearFecha(lic.fecha_licencia)
  const hasta = formatearFecha(lic.fecha_hasta)
  return hasta && hasta !== desde ? `${desde} al ${hasta}` : desde
}

const etiquetaMotivo = (motivo, corto = false) => {
  if (motivo === 'lesion_enfermedad') return corto ? 'Lesión/Enf.' : 'Lesión/Enfermedad'
  if (motivo === 'designacion_torneo_nacional') return corto ? 'Desig. T. Nac.' : 'Designación Torneo Nacional'
  return 'Particular'
}

const parseFecha = (fechaStr) => {
  if (!fechaStr) return new Date(8640000000000000) // sin fecha (licencia por tiempo indeterminado): siempre "futura"
  const [dia, mes, anio] = fechaStr.split('/')
  return new Date(`20${anio}-${mes}-${dia}`)
}

const obtenerLicencias = async () => {
  try {
    const res = await api.get({
      entity: 'licencias',
      action: 'obtenerHistorial',
    })
    licencias.value = (res.payload || []).sort((a, b) => {
      return parseFecha(b.fecha_licencia) - parseFecha(a.fecha_licencia)
    })
    paginaActual.value = 1
  } catch (err) {
    console.error("Error al cargar historial:", err)
  }
}

const solicitarLicencia = async () => {
  if (!puedeEnviar.value) return

  cargando.value = true

  try {
    const res = await api.post({
      entity: 'licencias',
      action: 'crearLicencia',
      payload: {
        fecha_desde: tiempoIndeterminado.value ? null : fechaDesde.value,
        fecha_hasta: tiempoIndeterminado.value ? null : fechaHasta.value,
        motivo: motivoSeleccionado.value,
        tiempo_indeterminado: tiempoIndeterminado.value
      }
    })

    if (res && res.ok && res.payload && res.payload.estado) {
      const estadoServidor = res.payload.estado


      let tituloNotificacion = ''
      let mensajeNotificacion = ''
      let tipoNotificacion = ''

      if (estadoServidor === 'aprobada') {
        tituloNotificacion = '¡Licencia Aprobada!'
        mensajeNotificacion = 'Tu solicitud ha sido procesada y aprobada correctamente.'
        tipoNotificacion = 'success'
      } else if (estadoServidor === 'rechazada') {
        tituloNotificacion = 'Licencia rechazada'
        mensajeNotificacion = 'Tu solicitud ha sido rechazada.'
        tipoNotificacion = 'danger'
      } else if (estadoServidor === 'pendiente') {
        tituloNotificacion = 'Licencia Pendiente'
        if (motivoSeleccionado.value === 'designacion_torneo_nacional') {
          mensajeNotificacion = 'Tu licencia quedará Pendiente hasta que sea autorizada por la Comisión Directiva.'
        } else if (tiempoIndeterminado.value) {
          mensajeNotificacion = 'Recordá enviar el certificado médico a licencias@arbitroshandball.com.ar.'
        } else {
          mensajeNotificacion = 'Recordá enviar el certificado médico dentro de las 72 hs.'
        }
        tipoNotificacion = 'warning'
      }

      // Disparamos la notificación con los textos exactos
      toast({
        titulo: tituloNotificacion,
        mensaje: mensajeNotificacion,
        tipo: tipoNotificacion
      })

      // Limpiamos el formulario y recargamos la tabla
      fechaDesde.value = ''
      fechaHasta.value = ''
      motivoSeleccionado.value = 'particular'
      tiempoIndeterminado.value = false
      await obtenerLicencias()

    } else {
      toast({
        titulo: 'Error',
        mensaje: res?.message || "No se pudo procesar la solicitud.",
        tipo: 'danger'
      })
    }
  } catch (error) {
    console.error("Detalle del error JS:", error)
    toast({
      titulo: 'Error de Red',
      mensaje: 'No se pudo conectar con el servidor o hubo un error de procesamiento.',
      tipo: 'danger'
    })
  } finally {
    cargando.value = false
  }
}

const esFechaFutura = (fechaStr) => {
  if (!fechaStr) return false
  const fechaLicencia = parseFecha(fechaStr)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return fechaLicencia >= hoy
}

// ¿Se puede mostrar el botón Anular para esta licencia?
// - Indeterminada aprobada: sí (la anulación la evalúa la comisión).
// - Resto: pendiente o aprobada, y con fecha futura (como antes).
const esIndeterminada = (lic) => lic.tiempo_indeterminado == 1

const puedeAnular = (lic) => {
  if (esIndeterminada(lic)) {
    return lic.estado === 'aprobada'
  }
  return (lic.estado === 'pendiente' || lic.estado === 'aprobada') && esFechaFutura(lic.fecha_licencia)
}

const anularLicencia = (lic) => {
  // Anulación de licencia por tiempo indeterminado: no se borra al instante,
  // queda a la espera de que la comisión directiva la evalúe (estado pendiente).
  if (esIndeterminada(lic)) {
    notificar({
      titulo: '¿Solicitar anulación?',
      mensaje: 'Tu solicitud de anulación de licencia indeterminada será evaluada por la Comisión Directiva.',
      tipo: 'warning',
      alConfirmar: async () => {
        cargando.value = true
        try {
          const res = await api.post({
            entity: 'licencias',
            action: 'actualizarLicencia',
            payload: {
              id: lic.id,
              estado: 'pendiente'
            }
          })

          if (res.ok && res.payload.success) {
            toast({
              titulo: 'Solicitud enviada',
              mensaje: 'Tu solicitud de anulación de licencia indeterminada será evaluada por la Comisión Directiva.',
              tipo: 'success'
            })
            await obtenerLicencias()
          } else {
            toast({
              titulo: 'Error',
              mensaje: res?.message || 'No se pudo enviar la solicitud de anulación.',
              tipo: 'danger'
            })
          }
        } catch (err) {
          console.error('Detalle del error anular indeterminada:', err)
          toast({
            titulo: 'Error de Red',
            mensaje: 'No se pudo conectar con el servidor.',
            tipo: 'danger'
          })
        } finally {
          cargando.value = false
        }
      }
    })
    return
  }

  if (!lic.puede_anular) {
    toast({
      titulo: 'No se puede anular',
      mensaje: 'Faltan menos de 6 días para la fecha. Por favor, enviá un e-mail a licencias@arbitroshandball.com.ar',
      tipo: 'danger'
    })
    return
  }

  notificar({
    titulo: '¿Anular Licencia?',
    mensaje: 'Esta acción es irreversible. El registro será borrado permanentemente.',
    tipo: 'danger',
    alConfirmar: async () => {
      cargando.value = true
      try {
        const res = await api.post({
          entity: 'licencias',
          action: 'actualizarLicencia',
          payload: {
            id: lic.id,
            estado: 'anulada'
          }
        })

        if (res.ok && res.payload.success) {
          toast({
            titulo: 'Licencia Anulada',
            mensaje: 'La licencia fue anulada correctamente.',
            tipo: 'success'
          })
          await obtenerLicencias()
        } else {
          toast({
            titulo: 'Error',
            mensaje: res?.message || "No se pudo anular la licencia.",
            tipo: 'danger'
          })
        }
      } catch(err){
        console.error("Detalle del error anular:", err)
        toast({
          titulo: 'Error de Red',
          mensaje: 'No se pudo conectar con el servidor.',
          tipo: 'danger'
        })
      } finally {
        cargando.value = false
      }
    }
  })
}

onMounted(() => {
  obtenerLicencias()
})
</script>

<style scoped>
/* ====================================================
   LISTA DE LICENCIAS
   ==================================================== */
.item-licencia {
  transition: background-color 0.2s ease;
}
.item-licencia:hover {
  background-color: var(--o-superficie, #f8fafc) !important;
}

/* Botón Anular con color personalizado y animación */
.btn-anular {
  background-color: #ef4444;
  color: #ffffff;
  font-size: 0.65rem;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;
}
.btn-anular:hover:not(:disabled) {
  background-color: #b91c1c;
  color: #ffffff;
}
.btn-anular:disabled {
  background-color: #fca5a5;
  color: #fef2f2;
  cursor: not-allowed;
}

/* ====================================================
   HACKS VISUALES PARA INPUT DATE (Nativo)
   ==================================================== */
.custom-input-date {
  color: var(--o-texto, #000000) !important;
  background-color: var(--o-tarjeta, #ffffff) !important;
  border: 1px solid var(--o-borde, #ced4da) !important;
  font-size: 1rem;
}

input[type="date"]:in-range::-webkit-datetime-edit-year-field,
input[type="date"]:in-range::-webkit-datetime-edit-month-field,
input[type="date"]:in-range::-webkit-datetime-edit-day-field,
input[type="date"]:in-range::-webkit-datetime-edit-text {
  color: transparent;
}

input[type="date"]:focus::-webkit-datetime-edit-year-field,
input[type="date"]:focus::-webkit-datetime-edit-month-field,
input[type="date"]:focus::-webkit-datetime-edit-day-field,
input[type="date"]:focus::-webkit-datetime-edit-text,
input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-year-field,
input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-month-field,
input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-day-field,
input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-text {
  color: var(--o-texto, #000) !important;
}

.animate__animated { animation-duration: 0.5s; }
</style>
