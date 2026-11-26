<template>
  <ModalBase :show="!!intento" :titulo="intento?.persona" icono="bi-clock-history" max-width="860px" @close="emit('close')">
    <template v-if="intento">
      <!-- ============ RESUMEN ============ -->
      <div class="mb-3">
        <div class="fw-bold text-dark">{{ intento.examen }}</div>
        <small class="text-muted">{{ intento.examenDetalle }}</small>
      </div>

      <EstadoCargando v-if="cargando" texto="Cargando el seguimiento" />

      <div v-else-if="error" class="text-center py-4">
        <i class="bi bi-exclamation-triangle-fill fs-1 text-warning d-block mb-2"></i>
        <p class="fw-bold text-dark mb-3">{{ error }}</p>
        <button type="button" class="btn btn-danger rounded-pill px-4 fw-bold" @click="cargar">
          <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
        </button>
      </div>

      <template v-else-if="detalle">
        <div class="row g-2 mb-3">
          <div class="col-6 col-md-3">
            <div class="dato-resumen rounded-3 border p-2 h-100">
              <div class="dato-etiqueta">Estado</div>
              <span class="badge" :class="ESTADOS_INTENTO[detalle.estado]?.clase || 'bg-light text-dark border'">{{ ESTADOS_INTENTO[detalle.estado]?.etiqueta || detalle.estado }}</span>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="dato-resumen rounded-3 border p-2 h-100">
              <div class="dato-etiqueta">Nota</div>
              <span class="fw-bold" :class="detalle.estado === 'finalizado' ? (detalle.aprobado ? 'text-success' : 'text-danger') : 'text-muted'">
                {{ detalle.estado === 'finalizado' && detalle.calificacion !== null ? `${detalle.calificacion}%` : '—' }}
              </span>
              <small class="text-muted ms-1">({{ detalle.puntaje }}/{{ detalle.posible }})</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="dato-resumen rounded-3 border p-2 h-100">
              <div class="dato-etiqueta">Duración</div>
              <span class="fw-bold text-dark">{{ formatoDuracion(duracion) }}</span>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="dato-resumen rounded-3 border p-2 h-100" title="Tiempo con la pestaña del examen a la vista">
              <div class="dato-etiqueta">Pestaña visible</div>
              <span class="fw-bold text-dark">{{ formatoDuracion(detalle.tiempoVisibleSeg) }}</span>
            </div>
          </div>
        </div>

        <div v-if="dispositivos.length" class="small text-muted mb-3">
          <i class="bi bi-phone me-1"></i>
          <span v-for="(d, i) in dispositivos" :key="d">{{ i ? ' · ' : '' }}{{ d }}</span>
          <span v-if="sesiones > 1" class="badge rounded-pill bg-warning-subtle text-warning-emphasis ms-2">{{ sesiones }} sesiones</span>
        </div>

        <PestanasSeccion v-model="pestana" class="mb-3" :pestanas="[
          { clave: 'pasos', etiqueta: 'Paso a paso', icono: 'bi-clock-history', cantidad: detalle.pasos.length },
          { clave: 'respuestas', etiqueta: 'Respuestas finales', icono: 'bi-check2-square' }
        ]" />

        <!-- ============ PASO A PASO ============ -->
        <div v-if="pestana === 'pasos'">
          <EstadoVacio v-if="!detalle.pasos.length" icono="bi-clock-history" titulo="No hay pasos registrados"
                       mensaje="El examen se rindió antes de que existiera el seguimiento, o no se pudo guardar." />
          <ol v-else class="linea-tiempo list-unstyled m-0">
            <li v-for="p in detalle.pasos" :key="p.id" class="paso position-relative ps-4 pb-3">
              <i class="bi icono-paso" :class="[EVENTOS_SEGUIMIENTO[p.evento]?.icono, EVENTOS_SEGUIMIENTO[p.evento]?.clase]" aria-hidden="true"></i>
              <div class="d-flex flex-wrap align-items-center gap-2 small">
                <span class="fw-bold text-dark font-monospace">{{ horaDe(p.fecha) }}</span>
                <span class="fw-semibold text-dark">{{ textoPaso(p) }}</span>
                <span v-if="p.sesionNueva" class="badge rounded-pill bg-primary-subtle text-primary-emphasis" :title="'Sesión ' + p.sesion">Sesión nueva</span>
                <span v-if="p.dispositivoNuevo" class="badge rounded-pill bg-danger-subtle text-danger-emphasis" :title="p.dispositivo">Otro dispositivo: {{ resumirDispositivo(p.dispositivo) }}</span>
                <span v-if="p.ipNueva" class="badge rounded-pill bg-info-subtle text-info-emphasis">Otra IP: {{ p.ip }}</span>
                <span v-if="p.tiempoVisibleSeg !== null" class="text-muted ms-auto" title="Tiempo acumulado con la pestaña visible">
                  <i class="bi bi-eye me-1"></i>{{ formatoDuracion(p.tiempoVisibleSeg) }}
                </span>
              </div>
              <ul v-if="p.cambios.length" class="list-unstyled small mt-1 mb-0">
                <li v-for="c in p.cambios" :key="c.pregunta" class="text-muted">
                  Pregunta {{ c.pregunta }}:
                  <span v-if="c.agregadas.length" class="text-success fw-semibold">marcó {{ c.agregadas.join(', ') }}</span>
                  <span v-if="c.agregadas.length && c.quitadas.length"> · </span>
                  <span v-if="c.quitadas.length" class="text-danger fw-semibold">desmarcó {{ c.quitadas.join(', ') }}</span>
                </li>
              </ul>
            </li>
          </ol>
          <p class="small text-muted mt-2 mb-0">
            <i class="bi bi-info-circle me-1"></i>Las letras son las que vio la persona (las opciones se mezclan en cada examen o práctica).
          </p>
        </div>

        <!-- ============ RESPUESTAS FINALES ============ -->
        <RevisionPractica v-else :revision="detalle.revision" />
      </template>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ModalBase from '@/components/ModalBase.vue'
import EstadoCargando from '@/components/comunes/EstadoCargando.vue'
import EstadoVacio from '@/components/comunes/EstadoVacio.vue'
import PestanasSeccion from '@/components/comunes/PestanasSeccion.vue'
import RevisionPractica from '@/components/comunes/practica-catalogo/RevisionPractica.vue'
import {
  useSeguimientoExamenes, ESTADOS_INTENTO, EVENTOS_SEGUIMIENTO,
  resumirDispositivo, formatoDuracion, horaDe, segundosEntre
} from '@/composables/useSeguimientoExamenes'

// Detalle del seguimiento de un intento: paso a paso (qué marcó y desmarcó en cada momento,
// sesiones, dispositivos e IP) y las respuestas finales.
const props = defineProps({
  tipo: { type: String, required: true },          // 'reunion' | 'curso'
  intento: { type: Object, default: null }          // fila de TablaIntentosExamen (null = cerrado)
})
const emit = defineEmits(['close'])

const { obtenerDetalle } = useSeguimientoExamenes()

const detalle = ref(null)
const cargando = ref(false)
const error = ref('')
const pestana = ref('pasos')

const cargar = async () => {
  if (!props.intento) return
  const pedido = props.intento
  cargando.value = true
  error.value = ''
  try {
    const datos = await obtenerDetalle({ tipo: props.tipo, idExamen: pedido.idExamen, idPersona: pedido.idPersona })
    // Si mientras cargaba se abrió otro intento, se descarta esta respuesta
    if (props.intento === pedido) detalle.value = datos
  } catch (e) {
    if (props.intento === pedido) error.value = e.message
  } finally {
    if (props.intento === pedido) cargando.value = false
  }
}

watch(() => props.intento, (intento) => {
  detalle.value = null
  pestana.value = 'pasos'
  if (intento) cargar()
})

const duracion = computed(() => {
  const pasos = detalle.value?.pasos || []
  return pasos.length ? segundosEntre(pasos[0].fecha, pasos[pasos.length - 1].fecha) : null
})
const dispositivos = computed(() => [...new Set((detalle.value?.pasos || []).map(p => resumirDispositivo(p.dispositivo)))])
const sesiones = computed(() => new Set((detalle.value?.pasos || []).map(p => p.sesion).filter(Boolean)).size)

const textoPaso = (p) => {
  const cosa = props.tipo === 'practica' ? 'la práctica' : 'el examen'
  if (p.evento === 'iniciar') {
    if (p.estadoIntento === 'nuevo') return `Empezó ${cosa}`
    if (p.estadoIntento === 'en_curso') return `Retomó ${cosa}`
    return `Intentó abrir ${cosa} ya finalizado`
  }
  if (p.evento === 'finalizar') return p.estadoIntento === 'en_curso' ? `Finalizó ${cosa}` : 'Intentó finalizar de nuevo'
  if (p.estadoIntento !== 'en_curso') return 'Guardado después de terminar (no se tuvo en cuenta)'
  return p.pregunta ? `Pasó a la pregunta ${p.pregunta}` : EVENTOS_SEGUIMIENTO.guardar.etiqueta
}
</script>

<style scoped>
.dato-resumen { background: var(--o-chip, #f8fafc); }
.dato-etiqueta { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; color: var(--o-texto-medio, #64748b); }

/* Línea de tiempo: una raya vertical con el ícono de cada paso */
.paso::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 18px;
  bottom: 0;
  border-left: 2px solid var(--o-borde, #e5e7eb);
}
.paso:last-child::before { display: none; }
.icono-paso {
  position: absolute;
  left: 0;
  top: 1px;
  font-size: 1rem;
  line-height: 1;
}
</style>
