<template>
  <ModalBase :show="mostrar" @close="mostrar = false" :icono="form.id ? 'edit' : 'add_box'" colorIcono="bg-danger-subtle text-danger" maxWidth="760px">
    <template #header>
      <span class="fw-bold fs-5">{{ form.id ? 'Editar observación' : 'Nueva observación' }}</span>
    </template>
    <form id="formObservacionCurso" class="text-start" novalidate @submit.prevent="guardar">
      <div class="row g-3">
        <div class="col-12 col-md-4">
          <label for="obs-modalidad" class="form-label small fw-bold text-dark">Curso *</label>
          <select id="obs-modalidad" v-model="form.modalidad" class="form-select" :class="{ 'is-invalid': intento && !form.modalidad }" @change="form.idAlumno = null; form.idEncuentro = null">
            <option value="" disabled>Seleccionar curso...</option>
            <option v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" :value="clave">{{ m.etiqueta }}</option>
          </select>
        </div>
        <div class="col-12 col-md-8">
          <label for="obs-alumno" class="form-label small fw-bold text-dark">Aspirante *</label>
          <select id="obs-alumno" v-model="form.idAlumno" class="form-select" :disabled="!form.modalidad || cargandoAspirantes" :class="{ 'is-invalid': intento && !form.idAlumno }" @change="form.idEncuentro = null">
            <option :value="null" disabled>{{ cargandoAspirantes ? 'Cargando...' : (form.modalidad ? 'Seleccionar aspirante...' : 'Elegí primero el curso') }}</option>
            <option v-for="a in aspirantesParaSelect" :key="a.id" :value="a.id">{{ a.apellido }}, {{ a.nombre }}</option>
          </select>
          <div v-if="form.modalidad && !cargandoAspirantes && !aspirantesParaSelect.length" class="form-text">
            {{ esObservador ? 'No hay aspirantes de este curso presentes en encuentros de mini en los que fuiste profesor a cargo.' : 'No hay aspirantes regulares en este curso.' }}
          </div>
        </div>

        <!-- Encuentro de mini: solo los que el aspirante tiene presente (el observador, solo los suyos como profesor a cargo) -->
        <div class="col-12">
          <label for="obs-encuentro" class="form-label small fw-bold text-dark">Encuentro de mini *</label>
          <select id="obs-encuentro" v-model="form.idEncuentro" class="form-select" :disabled="!form.idAlumno || cargandoEncuentros" :class="{ 'is-invalid': intento && !form.idEncuentro }">
            <option :value="null" disabled>{{ cargandoEncuentros ? 'Cargando...' : (form.idAlumno ? 'Seleccionar encuentro...' : 'Elegí primero el aspirante') }}</option>
            <option v-for="e in encuentros" :key="e.id" :value="e.id">{{ textoEncuentro(e) }}</option>
          </select>
          <div v-if="form.idAlumno && !cargandoEncuentros && !encuentros.length" class="form-text text-danger">
            {{ esObservador ? 'El aspirante no tiene presente en encuentros de mini en los que fuiste profesor a cargo.' : 'El aspirante no tiene presente en ningún encuentro de mini.' }}
          </div>
          <div v-if="encuentroElegido" class="encuentro-elegido small mt-2">
            <div class="fw-bold text-dark">{{ fechaLargaClase(encuentroElegido.fecha) }}<template v-if="encuentroElegido.hora"> · {{ encuentroElegido.hora }} hs</template></div>
            <div class="text-muted">{{ encuentroElegido.titulo }}<template v-if="encuentroElegido.lugar"> · {{ encuentroElegido.lugar }}</template></div>
            <div class="text-dark mt-1">
              <i class="bi bi-person-video3 me-1"></i><strong>Profesor a cargo:</strong>
              {{ encuentroElegido.docentes.length ? encuentroElegido.docentes.map(d => d.nombre).join(' · ') : 'Sin asignar' }}
            </div>
          </div>
        </div>
        <div v-for="c in CAMPOS_OBSERVACION_CURSO" :key="c.clave" class="col-12">
          <label :for="'obs-' + c.clave" class="form-label small fw-bold text-dark">{{ c.etiqueta }}</label>
          <textarea :id="'obs-' + c.clave" v-model.trim="form[c.clave]" rows="2" maxlength="3000" class="form-control"></textarea>
        </div>
        <div v-if="intento && !hayTexto" class="col-12">
          <div class="text-danger small fw-bold">Completá al menos uno de los aspectos observados.</div>
        </div>
      </div>
    </form>
    <template #footer>
      <button type="button" @click="mostrar = false" class="btn btn-light rounded-pill px-4 fw-bold border w-100 mb-2 mb-sm-0">CANCELAR</button>
      <button type="submit" form="formObservacionCurso" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm w-100" :disabled="guardando">
        <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
        GUARDAR
      </button>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { api } from '@/api/api'
import ModalBase from '@/components/ModalBase.vue'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { CAMPOS_OBSERVACION_CURSO, observacionCursoVacia, observacionCursoDesdeFila } from '@/composables/useObservacionesCurso'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { fechaDMA } from '@/utils/fechas'

const props = defineProps({
  observacion: { type: Object, default: null },
  esObservador: { type: Boolean, default: false },
})
const emit = defineEmits(['guardado'])
const mostrar = defineModel('show', { type: Boolean, default: false })

const notificar = inject('notificar', null)
const toast = inject('toast', null)
const avisar = (m) => (toast || notificar || ((x) => alert(x.mensaje)))(m)

const form = ref(observacionCursoVacia())
const intento = ref(false)
const guardando = ref(false)
const aspirantes = ref([])
const cargandoAspirantes = ref(false)

const hayTexto = computed(() => CAMPOS_OBSERVACION_CURSO.some(c => String(form.value[c.clave] || '').trim()))

// Al editar, el aspirante puede ya no ser regular: se agrega igual a la lista
const aspirantesParaSelect = computed(() => {
  const lista = [...aspirantes.value]
  const o = props.observacion
  if (o && o.modalidad_curso === form.value.modalidad && !lista.some(a => a.id === o.id_alumno)) {
    lista.unshift({ id: o.id_alumno, apellido: o.apellido, nombre: o.nombre })
  }
  return lista
})

const cargarAspirantes = async (modalidad) => {
  aspirantes.value = []
  if (!modalidad) return
  cargandoAspirantes.value = true
  try {
    const res = await api.get({ entity: 'observaciones_curso_arbitro', action: 'obtenerAspirantesObservacionCurso', payload: { modalidad } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los aspirantes')
    if (form.value.modalidad === modalidad) aspirantes.value = res.payload || []
  } catch (e) {
    avisar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargandoAspirantes.value = false
  }
}

watch(() => form.value.modalidad, cargarAspirantes)

// ─── Encuentros de mini del aspirante (con presente) ─────────────
const encuentros = ref([])
const cargandoEncuentros = ref(false)

const encuentroElegido = computed(() => encuentros.value.find(e => e.id === form.value.idEncuentro) || null)

const textoEncuentro = (e) => {
  const profesores = e.docentes.length ? ` · Prof. ${e.docentes.map(d => d.nombre).join(', ')}` : ''
  return `${fechaDMA(e.fecha)}${e.hora ? ' ' + e.hora : ''} · ${e.titulo}${e.lugar ? ' (' + e.lugar + ')' : ''}${profesores}`
}

const cargarEncuentros = async (idAlumno) => {
  encuentros.value = []
  if (!idAlumno) return
  cargandoEncuentros.value = true
  try {
    const res = await api.get({ entity: 'observaciones_curso_arbitro', action: 'obtenerEncuentrosObservacionCurso', payload: { idAlumno } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar los encuentros de mini')
    if (form.value.idAlumno !== idAlumno) return
    encuentros.value = res.payload || []
    // Si hay uno solo, queda elegido
    if (!form.value.idEncuentro && encuentros.value.length === 1) form.value.idEncuentro = encuentros.value[0].id
  } catch (e) {
    avisar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargandoEncuentros.value = false
  }
}

watch(() => form.value.idAlumno, cargarEncuentros)

watch(mostrar, (abierto) => {
  if (!abierto) return
  form.value = props.observacion ? observacionCursoDesdeFila(props.observacion) : observacionCursoVacia()
  intento.value = false
})

const guardar = async () => {
  intento.value = true
  const f = form.value
  if (!f.modalidad || !f.idAlumno || !encuentroElegido.value || !hayTexto.value) {
    avisar({ titulo: 'Faltan datos', mensaje: 'Revisá los campos marcados.', tipo: 'danger' })
    return
  }
  // La fecha y el texto del encuentro salen del encuentro de mini elegido
  f.fechaPartido = encuentroElegido.value.fecha
  f.encuentro = encuentroElegido.value.titulo
  guardando.value = true
  try {
    const res = await api.post({ entity: 'observaciones_curso_arbitro', action: 'guardarObservacionCurso', payload: { ...f } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo guardar la observación')
    avisar({ titulo: 'Guardado', mensaje: f.id ? 'La observación se actualizó.' : 'La observación se cargó y queda pendiente de aprobación.', tipo: 'success' })
    mostrar.value = false
    emit('guardado', { ...f })
  } catch (e) {
    avisar({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
.encuentro-elegido { border: 1px solid #e2e8f0; border-left: 4px solid #dc3545; border-radius: 8px; padding: 8px 12px; background: #f8fafc; }
</style>
