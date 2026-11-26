<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">
      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4 radio-12 overflow-hidden">

        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <p class="seccion-descripcion">
            Exámenes online de los árbitros en reuniones, asambleas y recuperatorios: qué marcó en cada momento, desde qué dispositivo y si lo retomó · {{ intentos.length }} exámenes
          </p>
          <div class="d-flex flex-nowrap flex-shrink-0 gap-2 align-items-center justify-content-center">
            <select v-model="anio" class="form-select shadow-sm border-secondary-subtle fw-semibold text-dark control-barra" style="width: 110px;" aria-label="Año">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
            <BotonHerramienta tipo="actualizar" :cargando="cargando" @click="cargar" />
          </div>
        </div>

        <TablaIntentosExamen :intentos="filasTabla" :cargando="cargando" :filtrar="filtrarCategoria" texto-vacio="Todavía no hay exámenes online con seguimiento este año" @ver="seleccionado = $event">
          <template #filtros>
            <select v-model="categoria" class="form-select form-select-sm shadow-none w-auto" aria-label="Tipo de evento">
              <option value="">Todos los eventos</option>
              <option v-for="c in categoriasPresentes" :key="c" :value="c">{{ CATEGORIAS_EVENTO[c] || c }}</option>
            </select>
          </template>
        </TablaIntentosExamen>

      </div>
    </div>

    <ModalSeguimientoExamen tipo="reunion" :intento="seleccionado" @close="seleccionado = null" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@unhead/vue'
import BotonHerramienta from '@/components/comunes/BotonHerramienta.vue'
import TablaIntentosExamen from '@/components/comunes/seguimiento-examenes/TablaIntentosExamen.vue'
import ModalSeguimientoExamen from '@/components/comunes/seguimiento-examenes/ModalSeguimientoExamen.vue'
import { useSeguimientoExamenes, CATEGORIAS_EVENTO } from '@/composables/useSeguimientoExamenes'
import { conAnioActual, anioActual } from '@/utils/anios'
import { fechaDMA } from '@/utils/fechas'

useHead({ title: 'Seguimiento de exámenes | AAAB' })

const notificar = inject('notificar')
const { cargarIntentosReunion } = useSeguimientoExamenes()

const anio = ref(Number(anioActual()))
const anios = computed(() => conAnioActual().map(Number))
const intentos = ref([])
const cargando = ref(false)
const categoria = ref('')
const seleccionado = ref(null)

const cargar = async () => {
  cargando.value = true
  try {
    intentos.value = await cargarIntentosReunion(anio.value)
  } catch (e) {
    intentos.value = []
    notificar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
}

watch(anio, cargar)
onMounted(cargar)

// Formato común de la tabla (también la usa la pestaña de exámenes del curso)
const filasTabla = computed(() => intentos.value.map(i => ({
  ...i,
  clave: `${i.idExamen}-${i.idPersona}`,
  persona: `${i.apellido}, ${i.nombre}`,
  personaDetalle: i.grupo || '',
  examenDetalle: `${CATEGORIAS_EVENTO[i.categoria] || 'Evento'} · ${fechaDMA(i.fecha)}`
})))

const categoriasPresentes = computed(() => [...new Set(intentos.value.map(i => i.categoria).filter(Boolean))])
// Es un computed para que, al cambiar la categoría, la tabla vuelva a la primera página
const filtrarCategoria = computed(() => {
  const elegida = categoria.value
  return (i) => !elegida || i.categoria === elegida
})
</script>
