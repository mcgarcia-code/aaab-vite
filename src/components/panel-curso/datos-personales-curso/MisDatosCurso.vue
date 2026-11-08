<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div class="border-start border-danger border-5 ps-3">
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
            <i class="bi bi-person-lines-fill me-1"></i> Datos Personales
          </h4>
          <span class="text-muted small d-block mt-1">Tu legajo del curso de árbitros</span>
        </div>
        <button v-if="!editando && perfil" @click="empezarEdicion" class="btn btn-outline-primary btn-sm fw-bold px-3 align-self-start align-self-md-center">
          <i class="bi bi-pencil-square me-1"></i> Editar mis datos
        </button>
      </div>

      <div v-if="cargando" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span>
      </div>

      <div v-else-if="perfil" class="card-body p-3 p-md-4">
        <!-- FOTO -->
        <div class="d-flex flex-column flex-sm-row align-items-center gap-3 mb-4 pb-4 border-bottom">
          <img :src="urlFoto" @error="(e) => e.target.src = FOTO_POR_DEFECTO" class="foto-perfil shadow-sm" alt="Tu foto de perfil">
          <div class="text-center text-sm-start">
            <div class="fw-bold text-dark text-uppercase">{{ perfil.apellido }}, {{ perfil.nombre }}</div>
            <div class="small text-muted">{{ perfil.usuario }}</div>
            <span v-if="ESTADOS_CURSO[perfil.estado]" class="badge mt-1" :class="ESTADOS_CURSO[perfil.estado].clase">{{ ESTADOS_CURSO[perfil.estado].etiqueta }} · {{ perfil.anio_curso }}</span>
            <div class="mt-2">
              <label class="btn btn-sm btn-danger fw-bold mb-0" :class="{ disabled: subiendoFoto }">
                <span v-if="subiendoFoto" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-camera-fill me-1"></i>
                {{ subiendoFoto ? 'Subiendo...' : 'Cambiar foto' }}
                <input type="file" accept="image/jpeg,image/png,image/webp" class="d-none" @change="subirFoto" :disabled="subiendoFoto">
              </label>
              <div class="form-text">JPG, PNG o WEBP de hasta 5 MB. Se recorta cuadrada.</div>
            </div>
          </div>
        </div>

        <!-- DATOS QUE NO SE EDITAN -->
        <h6 class="titulo-seccion"><i class="bi bi-person-vcard me-1"></i> Datos personales</h6>
        <div class="row g-3 mb-4">
          <div v-for="d in datosFijos" :key="d.etiqueta" class="col-6 col-md-4">
            <span class="dato-etiqueta">{{ d.etiqueta }}</span>
            <div class="dato-valor">{{ d.valor || '-' }}</div>
          </div>
        </div>

        <!-- CONTACTO Y DOMICILIO -->
        <h6 class="titulo-seccion"><i class="bi bi-house-door me-1"></i> Contacto y domicilio</h6>
        <div v-if="!editando" class="row g-3 mb-4">
          <div v-for="d in datosContacto" :key="d.etiqueta" class="col-12 col-sm-6 col-md-4">
            <span class="dato-etiqueta">{{ d.etiqueta }}</span>
            <div class="dato-valor">{{ d.valor || '-' }}</div>
          </div>
        </div>
        <form v-else class="row g-3 mb-4" novalidate @submit.prevent="guardar">
          <div class="col-12 col-md-6">
            <label for="mdc-email" class="form-label small fw-bold text-dark">Email personal *</label>
            <input id="mdc-email" v-model.trim="form.email" type="email" maxlength="100" class="form-control" :class="clase('email')">
            <div class="invalid-feedback">{{ errores.email }}</div>
          </div>
          <div class="col-12 col-md-6">
            <label for="mdc-celular" class="form-label small fw-bold text-dark">Celular *</label>
            <input id="mdc-celular" v-model.trim="form.celular" type="tel" maxlength="30" class="form-control" :class="clase('celular')">
            <div class="invalid-feedback">{{ errores.celular }}</div>
          </div>
          <div class="col-12 col-md-6">
            <label for="mdc-provincia" class="form-label small fw-bold text-dark">Provincia *</label>
            <select id="mdc-provincia" v-model="form.provincia" @change="form.localidad = ''" class="form-select" :class="clase('provincia')">
              <option value="" disabled>Seleccionar...</option>
              <option v-for="p in provincias" :key="p.id" :value="Number(p.id)">{{ p.nombre }}</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label for="mdc-localidad" class="form-label small fw-bold text-dark">Localidad *</label>
            <select id="mdc-localidad" v-model="form.localidad" class="form-select" :class="clase('localidad')" :disabled="!form.provincia">
              <option value="" disabled>Seleccionar...</option>
              <option v-for="l in localidadesFiltradas" :key="l.id" :value="Number(l.id)">{{ l.nombre }}</option>
            </select>
          </div>
          <div class="col-12 col-md-8">
            <label for="mdc-direccion" class="form-label small fw-bold text-dark">Dirección *</label>
            <input id="mdc-direccion" v-model.trim="form.direccion" type="text" maxlength="255" class="form-control" :class="clase('direccion')">
          </div>
          <div class="col-12 col-md-4">
            <label for="mdc-zona" class="form-label small fw-bold text-dark">Zona / Barrio</label>
            <input id="mdc-zona" v-model.trim="form.zona" type="text" maxlength="100" class="form-control">
          </div>
          <div class="col-12 col-md-6">
            <label for="mdc-tel" class="form-label small fw-bold text-dark">Teléfono de emergencia *</label>
            <input id="mdc-tel" v-model.trim="form.telefonoContacto" type="tel" maxlength="50" class="form-control" :class="clase('telefonoContacto')">
          </div>
          <div class="col-12 col-md-6">
            <label for="mdc-parentesco" class="form-label small fw-bold text-dark">Parentesco del contacto *</label>
            <input id="mdc-parentesco" v-model.trim="form.parentescoContacto" type="text" maxlength="100" class="form-control" :class="clase('parentescoContacto')">
          </div>
          <div class="col-12 d-flex flex-column flex-sm-row gap-2 justify-content-end">
            <button type="button" @click="editando = false" class="btn btn-light border fw-bold px-4">CANCELAR</button>
            <button type="submit" class="btn btn-success fw-bold px-4" :disabled="guardando">
              <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
              GUARDAR CAMBIOS
            </button>
          </div>
        </form>

        <!-- ACTIVIDAD DEPORTIVA -->
        <h6 class="titulo-seccion"><i class="bi bi-dribbble me-1"></i> Actividad deportiva</h6>
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6">
            <span class="dato-etiqueta">Jugador/a</span>
            <div class="dato-valor">{{ textoJugador || 'No' }}</div>
          </div>
          <div class="col-12 col-md-6">
            <span class="dato-etiqueta">DT</span>
            <div class="dato-valor">{{ textoDtClubes(perfil.dt_clubes) || 'No' }}</div>
          </div>
          <div class="col-12">
            <div class="form-text mt-0">Si necesitás cambiar estos datos, pedíselo a la coordinación del curso.</div>
          </div>
        </div>

        <!-- CONTRASEÑA -->
        <h6 class="titulo-seccion"><i class="bi bi-key me-1"></i> Contraseña</h6>
        <form class="row g-3" novalidate @submit.prevent="cambiarPassword">
          <div class="col-12 col-md-4">
            <label for="mdc-pass-actual" class="form-label small fw-bold text-dark">Contraseña actual</label>
            <input id="mdc-pass-actual" v-model="pass.actual" type="password" autocomplete="current-password" class="form-control">
          </div>
          <div class="col-12 col-md-4">
            <label for="mdc-pass-nueva" class="form-label small fw-bold text-dark">Nueva contraseña</label>
            <input id="mdc-pass-nueva" v-model="pass.nueva" type="password" autocomplete="new-password" maxlength="72" class="form-control" placeholder="Mínimo 8 caracteres">
          </div>
          <div class="col-12 col-md-4">
            <label for="mdc-pass-confirmacion" class="form-label small fw-bold text-dark">Repetir nueva contraseña</label>
            <input id="mdc-pass-confirmacion" v-model="pass.confirmacion" type="password" autocomplete="new-password" maxlength="72" class="form-control">
          </div>
          <div class="col-12 d-flex justify-content-end">
            <button type="submit" class="btn btn-dark fw-bold px-4" :disabled="cambiandoPass || !pass.actual || !pass.nueva">
              <span v-if="cambiandoPass" class="spinner-border spinner-border-sm me-1"></span>
              CAMBIAR CONTRASEÑA
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'
import { ESTADOS_CURSO, GENEROS_CURSO, DOMINIO_USUARIO_CURSO, urlFotoCurso, FOTO_POR_DEFECTO, textoDtClubes } from '@/composables/useCursoArbitro'

useHead({ title: 'Datos Personales | Curso AAAB' })

const toast = inject('toast', (m) => alert(m.mensaje || m))

const perfil = ref(null)
const provincias = ref([])
const localidades = ref([])
const cargando = ref(true)
const versionFoto = ref(Date.now())

// ─── Helpers de vista ────────────────────────────────────────────
const fechaArg = (f) => (f ? String(f).substring(0, 10).split('-').reverse().join('/') : '')
const urlFoto = computed(() => urlFotoCurso(perfil.value?.dni, versionFoto.value))

const datosFijos = computed(() => [
  { etiqueta: 'Apellido', valor: perfil.value.apellido },
  { etiqueta: 'Nombre', valor: perfil.value.nombre },
  { etiqueta: 'DNI', valor: perfil.value.dni },
  { etiqueta: 'Fecha de nacimiento', valor: fechaArg(perfil.value.fecha_nacimiento) },
  { etiqueta: 'Género', valor: GENEROS_CURSO.find(g => g.valor === perfil.value.genero)?.etiqueta },
  { etiqueta: 'Inscripción', valor: fechaArg(perfil.value.fecha_registro) },
])

const datosContacto = computed(() => [
  { etiqueta: 'Email personal', valor: perfil.value.email },
  { etiqueta: 'Celular', valor: perfil.value.celular },
  { etiqueta: 'Provincia', valor: perfil.value.nombre_provincia },
  { etiqueta: 'Localidad', valor: perfil.value.nombre_localidad },
  { etiqueta: 'Dirección', valor: perfil.value.direccion },
  { etiqueta: 'Zona / Barrio', valor: perfil.value.zona },
  { etiqueta: 'Teléfono de emergencia', valor: perfil.value.telefonocontacto },
  { etiqueta: 'Parentesco', valor: perfil.value.parentescocontacto },
])

const textoJugador = computed(() => {
  if (perfil.value?.es_jugador !== 'SI') return ''
  const categorias = String(perfil.value.categorias_jugador || '').split('|').map(c => c.trim()).filter(Boolean).join('; ')
  return `${perfil.value.club_jugador}: ${categorias}`
})

// ─── Carga ───────────────────────────────────────────────────────
const cargarPerfil = async () => {
  const res = await api.get({ entity: 'perfil_curso_arbitro', action: 'obtenerMiPerfilCurso', payload: {} })
  if (!res?.ok) throw new Error(res?.message || 'No se pudieron cargar tus datos')
  perfil.value = res.payload
}

onMounted(async () => {
  try {
    const [, resUbicacion] = await Promise.all([
      cargarPerfil(),
      api.get({ entity: 'localidades', action: 'obtenerProvinciasLocalidades', payload: {} }),
    ])
    provincias.value = resUbicacion?.payload?.provincias ?? []
    localidades.value = resUbicacion?.payload?.localidades ?? []
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cargando.value = false
  }
})

// ─── Edición de contacto ─────────────────────────────────────────
const editando = ref(false)
const guardando = ref(false)
const intento = ref(false)
const form = reactive({})
const errores = ref({})

const localidadesFiltradas = computed(() =>
  localidades.value.filter(l => Number(l.provincia_id) === Number(form.provincia))
)

const empezarEdicion = () => {
  Object.assign(form, {
    email: perfil.value.email || '',
    celular: perfil.value.celular || '',
    provincia: perfil.value.provincia ? Number(perfil.value.provincia) : '',
    localidad: perfil.value.localidad ? Number(perfil.value.localidad) : '',
    direccion: perfil.value.direccion || '',
    zona: perfil.value.zona || '',
    telefonoContacto: perfil.value.telefonocontacto || '',
    parentescoContacto: perfil.value.parentescocontacto || '',
  })
  intento.value = false
  errores.value = {}
  editando.value = true
}

const validar = () => {
  const e = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Ingresá un email válido.'
  else if (form.email.toLowerCase().endsWith(`@${DOMINIO_USUARIO_CURSO}`)) e.email = 'Usá tu email personal, no el del curso.'
  for (const campo of ['celular', 'provincia', 'localidad', 'direccion', 'telefonoContacto', 'parentescoContacto']) {
    if (!String(form[campo] ?? '').trim()) e[campo] = 'Obligatorio.'
  }
  return e
}

const clase = (campo) => (intento.value && errores.value[campo] ? 'is-invalid' : '')

const guardar = async () => {
  intento.value = true
  errores.value = validar()
  if (Object.keys(errores.value).length) {
    toast({ titulo: 'Revisá los datos', mensaje: 'Hay campos incompletos o con errores.', tipo: 'danger' })
    return
  }
  guardando.value = true
  try {
    const res = await api.post({ entity: 'perfil_curso_arbitro', action: 'actualizarMiPerfilCurso', payload: { ...form } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudieron guardar los cambios')
    await cargarPerfil()
    editando.value = false
    toast({ titulo: 'Datos actualizados', mensaje: 'Tus datos se guardaron correctamente.', tipo: 'success' })
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    guardando.value = false
  }
}

// ─── Foto (recorte cuadrado y achicado antes de subir) ────────────
const subiendoFoto = ref(false)
const LADO_FOTO = 600

const recortarCuadrado = (archivo) => new Promise((resolve, reject) => {
  const img = new Image()
  const url = URL.createObjectURL(archivo)
  img.onload = () => {
    const lado = Math.min(img.width, img.height)
    const canvas = document.createElement('canvas')
    canvas.width = Math.min(lado, LADO_FOTO)
    canvas.height = canvas.width
    canvas.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen'))), 'image/jpeg', 0.9)
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    reject(new Error('El archivo no es una imagen válida'))
  }
  img.src = url
})

const subirFoto = async (evento) => {
  const archivo = evento.target.files?.[0]
  evento.target.value = ''
  if (!archivo) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
    toast({ titulo: 'Formato no permitido', mensaje: 'Usá una imagen JPG, PNG o WEBP.', tipo: 'danger' })
    return
  }
  if (archivo.size > 5 * 1024 * 1024) {
    toast({ titulo: 'Imagen muy pesada', mensaje: 'La imagen no puede superar los 5 MB.', tipo: 'danger' })
    return
  }
  subiendoFoto.value = true
  try {
    const blob = await recortarCuadrado(archivo)
    const formData = new FormData()
    formData.append('fotos', new File([blob], 'perfil.jpg', { type: 'image/jpeg' }))
    const res = await api.postFile({ entity: 'perfil_curso_arbitro', action: 'actualizarFotoCurso', payload: formData })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo subir la foto')
    versionFoto.value = Date.now()
    window.dispatchEvent(new Event('foto-curso-actualizada'))
    toast({ titulo: 'Foto actualizada', mensaje: 'Tu foto de perfil se guardó correctamente.', tipo: 'success' })
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    subiendoFoto.value = false
  }
}

// ─── Contraseña ──────────────────────────────────────────────────
const pass = reactive({ actual: '', nueva: '', confirmacion: '' })
const cambiandoPass = ref(false)

const cambiarPassword = async () => {
  if (pass.nueva.length < 8) {
    toast({ titulo: 'Contraseña corta', mensaje: 'La nueva contraseña tiene que tener al menos 8 caracteres.', tipo: 'danger' })
    return
  }
  if (pass.nueva !== pass.confirmacion) {
    toast({ titulo: 'No coinciden', mensaje: 'Las contraseñas nuevas no coinciden.', tipo: 'danger' })
    return
  }
  cambiandoPass.value = true
  try {
    const res = await api.post({ entity: 'perfil_curso_arbitro', action: 'cambiarMiPasswordCurso', payload: { ...pass } })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo cambiar la contraseña')
    Object.assign(pass, { actual: '', nueva: '', confirmacion: '' })
    toast({ titulo: 'Contraseña actualizada', mensaje: 'Usala la próxima vez que inicies sesión.', tipo: 'success' })
  } catch (e) {
    toast({ titulo: 'Error', mensaje: e.message, tipo: 'danger' })
  } finally {
    cambiandoPass.value = false
  }
}
</script>

<style scoped>
.foto-perfil {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #dc2626;
  flex-shrink: 0;
}
.titulo-seccion {
  color: #dc3545;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.dato-etiqueta {
  display: block;
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 2px;
}
.dato-valor {
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 10px;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
  word-break: break-word;
}
.form-control, .form-select { font-size: 1rem; }
@media (min-width: 768px) {
  .form-control, .form-select { font-size: 0.9rem; }
}
</style>
