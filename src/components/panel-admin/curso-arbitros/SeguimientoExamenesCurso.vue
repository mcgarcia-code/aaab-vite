<template>
  <div>
    <TablaIntentosExamen
      :intentos="filasTabla"
      :cargando="cargando"
      :filtrar="filtrarModalidad"
      texto-vacio="Todavía no hay exámenes online rendidos este año"
      @ver="seleccionado = $event"
    />
    <ModalSeguimientoExamen tipo="curso" :intento="seleccionado" @close="seleccionado = null" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import TablaIntentosExamen from '@/components/comunes/seguimiento-examenes/TablaIntentosExamen.vue'
import ModalSeguimientoExamen from '@/components/comunes/seguimiento-examenes/ModalSeguimientoExamen.vue'
import { useSeguimientoExamenes } from '@/composables/useSeguimientoExamenes'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { fechaDMA } from '@/utils/fechas'

// Seguimiento de los exámenes online de los aspirantes (pestaña de "Práctica del catálogo" del curso).
// El año y el curso (anual / intensivo) los elige la pantalla de arriba.
const props = defineProps({
  anio: { type: Number, required: true },
  modalidad: { type: String, default: '' }
})

const notificar = inject('notificar')
const { cargarIntentosCurso } = useSeguimientoExamenes()

const intentos = ref([])
const cargando = ref(false)
const seleccionado = ref(null)

const cargar = async () => {
  cargando.value = true
  try {
    intentos.value = await cargarIntentosCurso(props.anio)
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

const filasTabla = computed(() => intentos.value.map(i => ({
  ...i,
  clave: `${i.idExamen}-${i.idPersona}`,
  persona: `${i.apellido}, ${i.nombre}`,
  personaDetalle: MODALIDADES_CURSO[i.modalidadCurso]?.corta || '',
  personaDetalleClase: MODALIDADES_CURSO[i.modalidadCurso]?.clase,
  examenDetalle: fechaDMA(i.fecha)
})))

// Es un computed para que, al cambiar el curso, la tabla vuelva a la primera página
const filtrarModalidad = computed(() => {
  const modalidad = props.modalidad
  return (i) => !modalidad || i.modalidadCurso === modalidad
})
</script>
