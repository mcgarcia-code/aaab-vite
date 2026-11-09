<template>
  <div class="container-fluid py-4 d-flex justify-content-center animate__animated animate__fadeIn">
    <div v-if="cargando" class="text-center mt-5">
      <div class="spinner-border text-danger"></div>
      <p class="text-white mt-2 fw-bold">Generando credencial...</p>
    </div>

    <div v-else-if="perfil" class="w-100 d-flex flex-column gap-4" style="max-width: 750px;">
      <div ref="credencialRef" class="card border-0 shadow-lg position-relative overflow-hidden mx-auto w-100" style="border-radius: 20px;">
        <div class="watermark-center">{{ anioCredencial }}</div>

        <div class="row g-0 h-100 position-relative z-1">
          <div class="col-12 col-md-4 d-flex flex-column align-items-center justify-content-center p-4 p-md-5" style="background-color: #1a1a1a;">
            <div class="foto-wrap shadow-lg">
              <img class="w-100 h-100 object-fit-cover" style="border-radius: 10px;" :src="urlFoto" alt="Foto del aspirante" @error="(e) => e.target.src = FOTO_POR_DEFECTO">
            </div>
            <div class="badge rounded-pill px-3 py-2 mt-4 d-inline-flex align-items-center gap-2 shadow-sm" :class="activo ? 'bg-success' : 'bg-danger'" style="font-size: 0.75rem; letter-spacing: 0.5px;">
              <i :class="activo ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
              {{ activo ? 'REGULAR' : (ESTADOS_CURSO[perfil.estado]?.etiqueta || perfil.estado || '').toUpperCase() }}
            </div>
          </div>

          <div class="col-12 col-md-8 bg-white d-flex flex-column p-4 p-md-5 text-center text-md-start">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-3 text-secondary fw-bold small">
              <img :src="logo" alt="Logo AAAB" style="height: 80px; width: auto; object-fit: contain;">
              <span>CREDENCIAL DIGITAL</span>
            </div>

            <div class="cinta-aspirante mb-4">
              <i class="bi bi-mortarboard-fill me-1"></i> ASPIRANTE · CURSO DE ÁRBITROS
            </div>

            <div class="d-flex flex-column gap-3 flex-grow-1">
              <div>
                <span class="text-secondary fw-bold d-block mb-1" style="font-size: 0.75rem;">APELLIDO Y NOMBRE</span>
                <h1 class="fw-black text-dark m-0" style="font-size: clamp(1.5rem, 5vw, 2rem); line-height: 1.1;">
                  {{ String(perfil.apellido || '').toUpperCase() }}, {{ perfil.nombre }}
                </h1>
              </div>

              <div class="d-flex flex-column flex-md-row align-items-center align-items-md-start mt-2">
                <div class="text-center text-md-start">
                  <span class="text-secondary fw-bold d-block mb-1" style="font-size: 0.75rem;">CURSO</span>
                  <span class="fw-bolder text-danger" style="font-size: 1.4rem;">{{ textoCurso }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex flex-column flex-md-row align-items-center justify-content-md-between gap-3 mt-4 mt-md-auto pt-4">
              <div class="bg-white p-1 border rounded shadow-sm">
                <qrcode-vue :value="textoQr" :size="70" level="H" />
              </div>
              <div class="text-center text-md-start fw-bold" style="font-size: 0.65rem; color: #444; line-height: 1.2;">
                ASOCIACIÓN ARGENTINA<br>DE ÁRBITROS DE HANDBALL
              </div>
              <div class="text-center text-md-end fw-bold text-muted" style="font-size: 0.75rem;">
                VENCE: 31/12/{{ anioCredencial }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-center w-100 mt-2">
        <button class="btn btn-danger rounded-pill fw-bold shadow py-3 w-100 d-flex justify-content-center align-items-center btn-download" @click="descargar" :disabled="procesando">
          <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-download me-2"></i>
          {{ procesando ? 'PROCESANDO...' : 'DESCARGAR IMAGEN' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue'
import { useHead } from '@vueuse/head'
import html2canvas from 'html2canvas'
import QrcodeVue from 'qrcode.vue'
import { api } from '@/api/api'
import logo from '@/assets/fotos/logo.png'
import { ESTADOS_CURSO, MODALIDADES_CURSO, urlFotoCurso, FOTO_POR_DEFECTO } from '@/composables/useCursoArbitro'

useHead({ title: 'Credencial Digital | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const credencialRef = ref(null)
const perfil = ref(null)
const cargando = ref(true)
const procesando = ref(false)
const versionFoto = ref(Date.now())

const urlFoto = computed(() => urlFotoCurso(perfil.value?.dni, versionFoto.value))
const activo = computed(() => ['regular', 'reinscripcion', 'alta'].includes(perfil.value?.estado))
const anioCredencial = computed(() => perfil.value?.anio_curso || new Date().getFullYear())
const textoCurso = computed(() => `${MODALIDADES_CURSO[perfil.value?.modalidad_curso]?.corta || ''} ${anioCredencial.value}`.trim())
const textoQr = computed(() => `AAAB - Aspirante del Curso de Árbitros ${textoCurso.value} - ${perfil.value?.apellido}, ${perfil.value?.nombre}`)

const refrescarFoto = () => { versionFoto.value = Date.now() }

const descargar = async () => {
  if (procesando.value || !credencialRef.value) return
  procesando.value = true
  try {
    const canvas = await html2canvas(credencialRef.value, { useCORS: true, scale: 3, backgroundColor: '#ffffff' })
    const link = document.createElement('a')
    link.download = `Credencial-Curso-${perfil.value.apellido}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  } catch {
    toast({ titulo: 'Error', mensaje: 'No se pudo generar la imagen.', tipo: 'danger' })
  } finally {
    procesando.value = false
  }
}

onMounted(async () => {
  window.addEventListener('foto-curso-actualizada', refrescarFoto)
  try {
    const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMiPerfilCurso', payload: {} })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cargar tu credencial')
    perfil.value = res.payload
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
})

onBeforeUnmount(() => window.removeEventListener('foto-curso-actualizada', refrescarFoto))
</script>

<style scoped>
.watermark-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 900;
  color: rgba(0, 0, 0, 0.03);
  z-index: 0;
  pointer-events: none;
}
.foto-wrap {
  width: clamp(140px, 30vw, 160px);
  height: clamp(140px, 30vw, 160px);
  background: white;
  padding: 8px;
  border-radius: 15px;
}
.cinta-aspirante {
  display: inline-block;
  align-self: center;
  background: #dc2626;
  color: #fff;
  font-weight: 800;
  letter-spacing: 1px;
  font-size: 0.8rem;
  padding: 6px 14px;
  border-radius: 50px;
}
@media (min-width: 768px) {
  .cinta-aspirante { align-self: flex-start; }
}
.fw-black { font-weight: 900; }
.btn-download { max-width: 400px; font-size: 1.1rem; transition: all 0.3s ease; }
.btn-download:hover:not(:disabled) { background: #a71d2a; transform: translateY(-2px); }
.animate__animated { animation-duration: 0.5s; }
</style>
