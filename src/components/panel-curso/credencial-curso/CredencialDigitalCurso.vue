<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div v-if="cargando" class="text-center py-5"><span class="spinner-border text-danger"></span></div>

    <div v-else-if="perfil" class="d-flex flex-column align-items-center">
      <div class="credencial shadow-lg">
        <div class="credencial-cabecera">
          <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo">
          <div class="text-white">
            <div class="fw-bold lh-sm">Asociación Argentina de Árbitros de Balonmano</div>
            <div class="small opacity-75">Credencial digital</div>
          </div>
        </div>

        <div class="cinta-aspirante">
          <i class="bi bi-mortarboard-fill me-1"></i> ASPIRANTE · CURSO DE ÁRBITROS
        </div>

        <div class="credencial-cuerpo">
          <img :src="urlFoto" @error="(e) => e.target.src = FOTO_POR_DEFECTO" class="foto" alt="Foto del aspirante">
          <div class="text-center mt-3">
            <span class="etiqueta">Apellido y nombre</span>
            <h1 class="nombre m-0">{{ String(perfil.apellido || '').toUpperCase() }}, {{ perfil.nombre }}</h1>
          </div>

          <div class="row g-2 mt-3 w-100">
            <div class="col-6">
              <span class="etiqueta">DNI</span>
              <div class="valor">{{ perfil.dni }}</div>
            </div>
            <div class="col-6">
              <span class="etiqueta">Curso</span>
              <div class="valor">{{ MODALIDADES_CURSO[perfil.modalidad_curso]?.corta || '-' }} {{ perfil.anio_curso }}</div>
            </div>
            <div class="col-6">
              <span class="etiqueta">Usuario</span>
              <div class="valor text-truncate">{{ perfil.usuario }}</div>
            </div>
            <div class="col-6">
              <span class="etiqueta">Estado</span>
              <div class="valor">
                <span class="badge" :class="ESTADOS_CURSO[perfil.estado]?.clase || 'bg-secondary'">{{ ESTADOS_CURSO[perfil.estado]?.etiqueta || perfil.estado }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="credencial-pie">
          Esta credencial identifica a un/a <strong>aspirante</strong> del curso de árbitros. No habilita a dirigir partidos oficiales.
        </div>
      </div>

      <p class="text-white-50 small mt-3 text-center">
        <i class="bi bi-camera me-1"></i> Para cambiar la foto entrá a <RouterLink to="/panel-curso/datos-curso" class="text-white">Datos Personales</RouterLink>.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { ESTADOS_CURSO, MODALIDADES_CURSO, urlFotoCurso, FOTO_POR_DEFECTO } from '@/composables/useCursoArbitro'

useHead({ title: 'Credencial Digital | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const perfil = ref(null)
const cargando = ref(true)
const urlFoto = computed(() => urlFotoCurso(perfil.value?.dni, Date.now()))

onMounted(async () => {
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
</script>

<style scoped>
.credencial {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
}
.credencial-cabecera {
  background: #0f172a;
  border-bottom: 4px solid #dc2626;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
}
.logo { width: 48px; height: auto; flex-shrink: 0; }
.cinta-aspirante {
  background: #dc2626;
  color: #fff;
  font-weight: 800;
  letter-spacing: 1px;
  text-align: center;
  padding: 8px;
  font-size: 0.85rem;
}
.credencial-cuerpo {
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.foto {
  width: 140px;
  height: 140px;
  border-radius: 16px;
  object-fit: cover;
  border: 3px solid #dc2626;
}
.etiqueta {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.nombre {
  font-size: clamp(1.2rem, 5vw, 1.5rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.15;
}
.valor { font-weight: 700; color: #1e293b; }
.credencial-pie {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 10px 16px;
  font-size: 0.72rem;
  color: #475569;
  text-align: center;
}
</style>
