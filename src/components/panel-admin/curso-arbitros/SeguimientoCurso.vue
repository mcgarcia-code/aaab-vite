<template>
  <div>
    <TablaIntentosExamen
      :intentos="filasTabla"
      :cargando="cargando"
      :filtrar="filtrarModalidad"
      :texto-vacio="tipo === 'practica' ? 'Todavía no hay prácticas con seguimiento este año' : 'Todavía no hay exámenes online con seguimiento este año'"
      @ver="seleccionado = $event"
    />
    <ModalSeguimientoExamen :tipo="tipo" :intento="seleccionado" @close="seleccionado = null" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import TablaIntentosExamen from '@/components/comunes/seguimiento-examenes/TablaIntentosExamen.vue'
import ModalSeguimientoExamen from '@/components/comunes/seguimiento-examenes/ModalSeguimientoExamen.vue'
import { useSeguimientoExamenes } from '@/composables/useSeguimientoExamenes'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { textoReglas } from '@/utils/cuestionarios'
import { fechaDMA } from '@/utils/fechas'

// Seguimiento paso a paso de los aspirantes del curso:
// tipo 'curso' → exámenes online (pestaña de Exámenes del curso, tabla examenes_online_seguimiento)
// tipo 'practica' → práctica del catálogo (pestaña de Práctica del catálogo, tabla catalogo_practicas_seguimiento)
// El año y el curso (anual / intensivo) los elige la pantalla de arriba.
const props = defineProps({
  tipo: { type: String, default: 'curso' },
  anio: { type: Number, required: true },
  modalidad: { type: String, default: '' }
})

const notificar = inject('notificar')
const { cargarIntentosCurso, cargarPracticasCurso } = useSeguimientoExamenes()

const intentos = ref([])
const cargando = ref(false)
const seleccionado = ref(null)

const cargar = async () => {
  cargando.value = true
  try {
    intentos.value = props.tipo === 'practica' ? await cargarPracticasCurso(props.anio) : await cargarIntentosCurso(props.anio)
  } catch (e) {
    intentos.value = []
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

watch(() => props.anio, cargar)
onMounted(cargar)

// La pantalla de arriba usa cargar() en su botón Actualizar y cargando para el giro del botón
defineExpose({ cargar, cargando })

const nombreExamen = (i) => (props.tipo === 'practica'
  ? `Práctica · ${i.cantidad} preguntas · ${i.idioma === 'en' ? 'Inglés' : 'Español'}`
  : i.examen)
const detalleExamen = (i) => (props.tipo === 'practica'
  ? `${textoReglas(i.reglas || [])} · ${fechaDMA(i.fecha)}`
  : fechaDMA(i.fecha))

const filasTabla = computed(() => intentos.value.map(i => ({
  ...i,
  clave: `${i.idExamen}-${i.idPersona}`,
  persona: `${i.apellido}, ${i.nombre}`,
  personaDetalle: MODALIDADES_CURSO[i.modalidadCurso]?.corta || '',
  personaDetalleClase: MODALIDADES_CURSO[i.modalidadCurso]?.clase,
  examen: nombreExamen(i),
  examenDetalle: detalleExamen(i)
})))

// Es un computed para que, al cambiar el curso, la tabla vuelva a la primera página
const filtrarModalidad = computed(() => {
  const modalidad = props.modalidad
  return (i) => !modalidad || i.modalidadCurso === modalidad
})
</script>
