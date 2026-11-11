<template>
  <ModalBase :show="mostrar" @close="mostrar = false" :icono="form.id ? 'edit' : 'add_box'" colorIcono="bg-danger-subtle text-danger" maxWidth="760px">
    <template #header>
      <span class="fw-bold fs-5">{{ form.id ? 'Editar observación' : 'Nueva observación' }}</span>
    </template>
    <form id="formObservacionCurso" class="text-start" novalidate @submit.prevent="guardar">
      <div class="row g-3">
        <!-- Tipo: el árbitro desde su panel solo carga encuentros de mini; los amistosos los carga la coordinación -->
        <div v-if="!esObservador" class="col-12">
          <div class="btn-group w-100" role="group" aria-label="Tipo de observación">
            <button v-for="(t, clave) in TIPOS_OBSERVACION_CURSO" :key="clave" type="button" class="btn fw-bold" :class="form.tipo === clave ? 'btn-danger' : 'btn-outline-danger'" :aria-pressed="form.tipo === clave" @click="cambiarTipo(clave)">
              <i :class="['bi', t.icono, 'me-1']"></i> {{ t.etiqueta }}
            </button>
          </div>
          <div class="form-text">{{ TIPOS_OBSERVACION_CURSO[form.tipo].ayuda }}</div>
        </div>

        <div class="col-12 col-md-4">
          <label for="obs-modalidad" class="form-label small fw-bold text-dark">Curso *</label>
          <select id="obs-modalidad" v-model="form.modalidad" class="form-select" :disabled="esMini" :class="{ 'is-invalid': intento && !form.modalidad }" @change="form.idAlumno = null; form.idEncuentro = null">
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

        <!-- ENCUENTRO DE MINI: solo los que el aspirante tiene presente (el observador, solo los suyos como profesor a cargo) -->
        <div v-if="esMini" class="col-12">
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
          <!-- Admin: con varios profesores a cargo se elige cuál hizo la observación (le aparece en su panel) -->
          <div v-if="!esObservador && encuentroElegido && encuentroElegido.docentes.length > 1" class="mt-2">
            <label for="obs-profesor" class="form-label small fw-bold text-dark">¿Qué profesor hizo la observación? *</label>
            <select id="obs-profesor" v-model="idProfesorMini" class="form-select" :class="{ 'is-invalid': intento && !idProfesorMini }">
              <option :value="null" disabled>Seleccionar profesor...</option>
              <option v-for="d in encuentroElegido.docentes" :key="d.id" :value="d.id">{{ d.nombre }}</option>
            </select>
          </div>
        </div>

        <!-- PARTIDO AMISTOSO: fecha, partido, categoría y árbitro observador -->
        <template v-else>
          <div class="col-12 col-md-4">
            <label for="obs-fecha" class="form-label small fw-bold text-dark">Fecha del partido *</label>
            <input id="obs-fecha" v-model="form.fechaPartido" type="date" class="form-control" :class="{ 'is-invalid': intento && !form.fechaPartido }">
          </div>
          <div class="col-12 col-md-8">
            <label for="obs-partido" class="form-label small fw-bold text-dark">Partido *</label>
            <input id="obs-partido" v-model.trim="form.encuentro" type="text" maxlength="200" class="form-control" placeholder="Ej: Club A vs Club B" :class="{ 'is-invalid': intento && !form.encuentro }">
          </div>
          <div class="col-12 col-md-5">
            <label for="obs-categoria" class="form-label small fw-bold text-dark">Categoría *</label>
            <input id="obs-categoria" v-model.trim="form.categoria" type="text" maxlength="150" class="form-control" placeholder="Ej: Primera B" :class="{ 'is-invalid': intento && !form.categoria }">
          </div>
          <div class="col-12 col-md-7">
            <label for="obs-observador" class="form-label small fw-bold text-dark">Árbitro observador *</label>
            <SelectorArbitros id="obs-observador" v-model="observadorElegido" unico />
            <div v-if="intento && !observadorElegido.length" class="text-danger small mt-1">Elegí el árbitro observador.</div>
          </div>
        </template>

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
import SelectorArbitros from '@/components/SelectorArbitros.vue'
import { MODALIDADES_CURSO } from '@/composables/useCursoArbitro'
import { CAMPOS_OBSERVACION_CURSO, TIPOS_OBSERVACION_CURSO, observacionCursoVacia, observacionCursoDesdeFila } from '@/composables/useObservacionesCurso'
import { fechaLargaClase } from '@/composables/useCronogramaCurso'
import { fechaDMA } from '@/utils/fechas'

const props = defineProps({
  observacion: { type: Object, default: null },
  // Árbitro desde su panel: solo carga observaciones de encuentros de mini en los que fue profesor a cargo
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
// Árbitro observador del partido amistoso: [{ id, nombre }] (SelectorArbitros en modo único)
const observadorElegido = ref([])
// Encuentro de mini cargado por el admin: profesor a cargo que hizo la observación (si hay más de uno)
const idProfesorMini = ref(null)

const esMini = computed(() => form.value.tipo === 'mini')
const hayTexto = computed(() => CAMPOS_OBSERVACION_CURSO.some(c => String(form.value[c.clave] || '').trim()))

// Los encuentros de mini son solo del curso anual
const cambiarTipo = (tipo) => {
  if (form.value.tipo === tipo) return
  form.value.tipo = tipo
  form.value.idEncuentro = null
  if (tipo === 'mini') {
    if (form.value.modalidad !== 'anual') {
      form.value.modalidad = 'anual'
      form.value.idAlumno = null
    }
    cargarEncuentros(form.value.idAlumno)
  } else {
    form.value.fechaPartido = ''
    form.value.encuentro = ''
  }
}

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

watch(() => form.value.idAlumno, (idAlumno) => { if (esMini.value) cargarEncuentros(idAlumno) })

// Si el profesor elegido no está en el nuevo encuentro, se vuelve a elegir
watch(encuentroElegido, (e) => {
  if (e && idProfesorMini.value && !e.docentes.some(d => d.id === idProfesorMini.value)) idProfesorMini.value = null
})

watch(mostrar, (abierto) => {
  if (!abierto) return
  const o = props.observacion
  form.value = o ? observacionCursoDesdeFila(o) : observacionCursoVacia()
  if (props.esObservador) form.value.tipo = 'mini'
  if (form.value.tipo === 'mini' && !form.value.modalidad) form.value.modalidad = 'anual'
  observadorElegido.value = o && o.tipo === 'amistoso' && o.id_observador ? [{ id: o.id_observador, nombre: o.observador }] : []
  idProfesorMini.value = o && o.tipo !== 'amistoso' ? o.id_observador ?? null : null
  intento.value = false
})

const faltanDatos = () => {
  const f = form.value
  if (!f.modalidad || !f.idAlumno || !hayTexto.value) return true
  if (esMini.value) return !encuentroElegido.value || (!props.esObservador && encuentroElegido.value.docentes.length > 1 && !idProfesorMini.value)
  return !f.fechaPartido || !f.encuentro || !f.categoria || !observadorElegido.value.length
}

const guardar = async () => {
  intento.value = true
  if (faltanDatos()) {
    avisar({ titulo: 'Faltan datos', mensaje: 'Revisá los campos marcados.', tipo: 'danger' })
    return
  }
  const f = form.value
  if (esMini.value) {
    // La fecha y el texto del encuentro salen del encuentro de mini elegido
    f.fechaPartido = encuentroElegido.value.fecha
    f.encuentro = encuentroElegido.value.titulo
  }
  // Mini: el profesor a cargo (con uno solo lo completa el backend); amistoso: el árbitro elegido
  const payload = { ...f, idObservador: esMini.value ? idProfesorMini.value : observadorElegido.value[0].id }
  guardando.value = true
  try {
    const res = await api.post({ entity: 'observaciones_curso_arbitro', action: 'guardarObservacionCurso', payload })
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
