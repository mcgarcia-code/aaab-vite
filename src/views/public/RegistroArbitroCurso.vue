<template>
  <div class="registro-container px-3 py-4 py-md-5">
    <div class="card shadow-lg border-0 rounded-4 bg-white mx-auto registro-card animate__animated animate__fadeIn">

      <!-- ENCABEZADO -->
      <div class="card-header bg-white border-bottom p-3 p-md-4">
        <div class="d-flex align-items-center gap-3">
          <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img flex-shrink-0">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-mortarboard-fill me-1"></i> Inscripción al Curso de Árbitros
            </h4>
            <span class="text-muted small d-block mt-1">Completá tus datos para anotarte en el curso</span>
          </div>
        </div>
      </div>

      <!-- INSCRIPCIÓN EXITOSA -->
      <div v-if="inscripto" class="card-body p-4 p-md-5 text-center">
        <i class="bi bi-check-circle-fill text-success d-block mb-3" style="font-size: 3.5rem;"></i>
        <h5 class="fw-bold text-dark mb-2">¡Inscripción enviada!</h5>
        <p class="text-muted mb-4">
          Recibimos tus datos. La coordinación del curso se va a comunicar con vos al email
          <strong class="text-dark">{{ form.email }}</strong> o al celular que cargaste.
        </p>
        <router-link to="/" class="btn btn-danger fw-bold px-4 py-2 rounded-3">
          <i class="bi bi-house-door me-1"></i> VOLVER AL INICIO
        </router-link>
      </div>

      <!-- CARGANDO -->
      <div v-else-if="cargandoDatos" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span>
        <p class="text-muted fw-bold small mt-3 mb-0">Cargando formulario...</p>
      </div>

      <!-- FORMULARIO -->
      <form v-else class="card-body p-3 p-md-4" novalidate @submit.prevent="enviarInscripcion">
        <!-- Campo trampa anti-spam: invisible para personas -->
        <input v-model="form.sitioWeb" type="text" class="campo-trampa" tabindex="-1" autocomplete="off" aria-hidden="true">

        <FormularioCursoArbitro
          v-model="form"
          :errores="errores"
          :mostrar-errores="intentoEnviar"
          :provincias="provincias"
          :localidades="localidades"
          prefijo="ins"
          @error="mensaje => toast({ titulo: 'Error', mensaje, tipo: 'danger' })"
        />

        <div class="d-flex flex-column flex-md-row gap-2 justify-content-md-end border-top pt-3 mt-4">
          <router-link to="/" class="btn btn-light border fw-bold px-4 py-2 rounded-3 order-2 order-md-1">CANCELAR</router-link>
          <button type="submit" class="btn btn-danger fw-bold px-4 py-2 rounded-3 order-1 order-md-2" :disabled="enviando">
            <span v-if="enviando" class="spinner-border spinner-border-sm me-1"></span>
            {{ enviando ? 'ENVIANDO...' : 'ENVIAR INSCRIPCIÓN' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, inject, nextTick } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import FormularioCursoArbitro from '@/components/FormularioCursoArbitro.vue'
import { formularioCursoVacio, validarFormularioCurso, payloadCurso } from '@/composables/useCursoArbitro'

useHead({
  title: 'Inscripción al Curso de Árbitros | AAAB',
  meta: [{ name: 'description', content: 'Formulario de inscripción al curso de árbitros de la AAAB.' }],
})

const notificar = inject('notificar', null)
const toast = inject('toast', (msg) => alert(msg.mensaje || msg))

const form = ref(formularioCursoVacio())
const errores = ref({})
const intentoEnviar = ref(false)
const provincias = ref([])
const localidades = ref([])
const cargandoDatos = ref(true)
const enviando = ref(false)
const inscripto = ref(false)

// Después del primer intento, se revalida en vivo
watch(form, () => { if (intentoEnviar.value) errores.value = validarFormularioCurso(form.value) }, { deep: true })

const cargarDatos = async () => {
  try {
    const res = await api.get({ entity: 'localidades', action: 'obtenerProvinciasLocalidades', payload: {} })
    if (!res?.ok) throw new Error(res?.message)
    provincias.value = res.payload?.provincias ?? []
    localidades.value = res.payload?.localidades ?? []
  } catch (e) {
    console.error('cargarDatos:', e)
    toast({ titulo: 'Error', mensaje: 'No se pudo cargar el formulario. Recargá la página.', tipo: 'danger' })
  } finally {
    cargandoDatos.value = false
  }
}

const enviarInscripcion = async () => {
  intentoEnviar.value = true
  errores.value = validarFormularioCurso(form.value)
  if (Object.keys(errores.value).length) {
    toast({ titulo: 'Revisá el formulario', mensaje: 'Hay campos incompletos o con errores.', tipo: 'danger' })
    await nextTick()
    document.querySelector('.is-invalid, .border-danger')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  enviando.value = true
  try {
    const res = await api.post({
      entity: 'registro_curso_arbitro',
      action: 'registrarAlumnoCurso',
      payload: payloadCurso(form.value),
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo completar la inscripción')
    inscripto.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    const mensaje = e?.message || 'No se pudo completar la inscripción'
    if (notificar) notificar({ titulo: 'No se pudo inscribir', mensaje, tipo: 'danger' })
    else toast({ titulo: 'Error', mensaje, tipo: 'danger' })
  } finally {
    enviando.value = false
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.registro-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}
.registro-card {
  width: 100%;
  max-width: 860px;
  overflow: hidden;
}
.logo-img {
  width: 56px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}
.campo-trampa {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}
</style>
