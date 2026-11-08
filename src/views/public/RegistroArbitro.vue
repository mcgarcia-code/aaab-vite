<template>
  <div class="registro-container px-3 py-4 py-md-5">
    <div class="card shadow-lg border-0 rounded-4 bg-white mx-auto registro-card animate__animated animate__fadeIn">

      <!-- ENCABEZADO -->
      <div class="card-header bg-white border-bottom p-3 p-md-4">
        <div class="d-flex align-items-center gap-3">
          <img src="@/assets/fotos/logo.png" alt="Logo AAAB" class="logo-img flex-shrink-0">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5">
              <i class="bi bi-person-plus-fill me-1"></i> Registro de Árbitros
            </h4>
            <span class="text-muted small d-block mt-1">Completá tus datos para darte de alta en la asociación</span>
          </div>
        </div>
      </div>

      <!-- REGISTRO EXITOSO -->
      <div v-if="registrado" class="card-body p-4 p-md-5 text-center">
        <i class="bi bi-check-circle-fill text-success d-block mb-3" style="font-size: 3.5rem;"></i>
        <h5 class="fw-bold text-dark mb-2">¡Registro enviado!</h5>
        <p class="text-muted mb-4">
          Ya podés iniciar sesión con tu email <strong class="text-dark">{{ form.email }}</strong>
          y tu <strong class="text-dark">DNI</strong> como contraseña. Te recomendamos cambiarla desde tu panel.
        </p>
        <router-link to="/login-arbitro" class="btn btn-danger fw-bold px-4 py-2 rounded-3">
          <i class="bi bi-box-arrow-in-right me-1"></i> IR A INICIAR SESIÓN
        </router-link>
      </div>

      <!-- CARGANDO DATOS -->
      <div v-else-if="cargandoDatos" class="card-body text-center py-5">
        <span class="spinner-border text-danger"></span>
        <p class="text-muted fw-bold small mt-3 mb-0">Cargando formulario...</p>
      </div>

      <!-- FORMULARIO -->
      <form v-else class="card-body p-3 p-md-4" novalidate @submit.prevent="enviarRegistro">

        <!-- Campo trampa anti-spam: invisible para personas -->
        <input v-model="form.sitioWeb" type="text" class="campo-trampa" tabindex="-1" autocomplete="off" aria-hidden="true">

        <!-- DATOS PERSONALES -->
        <h6 class="titulo-seccion"><i class="bi bi-person-vcard me-1"></i> Datos personales</h6>
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6">
            <label for="reg-apellido" class="form-label small fw-bold text-dark">Apellido *</label>
            <input id="reg-apellido" v-model.trim="form.apellido" type="text" maxlength="100" class="form-control" :class="claseCampo('apellido')" autocomplete="family-name">
            <div class="invalid-feedback">{{ errores.apellido }}</div>
          </div>
          <div class="col-12 col-md-6">
            <label for="reg-nombre" class="form-label small fw-bold text-dark">Nombre *</label>
            <input id="reg-nombre" v-model.trim="form.nombre" type="text" maxlength="100" class="form-control" :class="claseCampo('nombre')" autocomplete="given-name">
            <div class="invalid-feedback">{{ errores.nombre }}</div>
          </div>
          <div class="col-12 col-md-4">
            <label for="reg-dni" class="form-label small fw-bold text-dark">DNI *</label>
            <input id="reg-dni" v-model.trim="form.dni" type="text" inputmode="numeric" maxlength="10" placeholder="Sin puntos" class="form-control" :class="claseCampo('dni')">
            <div class="invalid-feedback">{{ errores.dni }}</div>
          </div>
          <div class="col-6 col-md-4">
            <label for="reg-nacimiento" class="form-label small fw-bold text-dark">Fecha de nacimiento *</label>
            <input id="reg-nacimiento" v-model="form.fechaNacimiento" type="date" :max="hoy" class="form-control" :class="claseCampo('fechaNacimiento')">
            <div class="invalid-feedback">{{ errores.fechaNacimiento }}</div>
          </div>
          <div class="col-6 col-md-4">
            <label for="reg-genero" class="form-label small fw-bold text-dark">Género *</label>
            <select id="reg-genero" v-model="form.genero" class="form-select" :class="claseCampo('genero')">
              <option value="" disabled>Seleccionar...</option>
              <option v-for="g in GENEROS" :key="g.valor" :value="g.valor">{{ g.etiqueta }}</option>
            </select>
            <div class="invalid-feedback">{{ errores.genero }}</div>
          </div>
          <div class="col-12 col-md-6">
            <label for="reg-email" class="form-label small fw-bold text-dark">Email *</label>
            <input id="reg-email" v-model.trim="form.email" type="email" maxlength="100" class="form-control" :class="claseCampo('email')" autocomplete="email">
            <div class="invalid-feedback">{{ errores.email }}</div>
            <div class="form-text">Lo vas a usar para iniciar sesión.</div>
          </div>
          <div class="col-12 col-md-6">
            <label for="reg-celular" class="form-label small fw-bold text-dark">Celular *</label>
            <input id="reg-celular" v-model.trim="form.celular" type="tel" maxlength="30" placeholder="Ej: 11 2345 6789" class="form-control" :class="claseCampo('celular')" autocomplete="tel">
            <div class="invalid-feedback">{{ errores.celular }}</div>
          </div>
        </div>

        <!-- DOMICILIO -->
        <h6 class="titulo-seccion"><i class="bi bi-house-door me-1"></i> Domicilio</h6>
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6">
            <label for="reg-provincia" class="form-label small fw-bold text-dark">Provincia *</label>
            <select id="reg-provincia" v-model="form.provincia" class="form-select" :class="claseCampo('provincia')">
              <option value="" disabled>Seleccionar...</option>
              <option v-for="p in provincias" :key="p.id" :value="Number(p.id)">{{ p.nombre }}</option>
            </select>
            <div class="invalid-feedback">{{ errores.provincia }}</div>
          </div>
          <div class="col-12 col-md-6">
            <label for="reg-localidad" class="form-label small fw-bold text-dark">Localidad *</label>
            <select id="reg-localidad" v-model="form.localidad" class="form-select" :class="claseCampo('localidad')" :disabled="!form.provincia">
              <option value="" disabled>{{ form.provincia ? 'Seleccionar...' : 'Elegí primero la provincia' }}</option>
              <option v-for="l in localidadesFiltradas" :key="l.id" :value="Number(l.id)">{{ l.nombre }}</option>
            </select>
            <div class="invalid-feedback">{{ errores.localidad }}</div>
          </div>
          <div class="col-12 col-md-8">
            <label for="reg-direccion" class="form-label small fw-bold text-dark">Dirección *</label>
            <input id="reg-direccion" v-model.trim="form.direccion" type="text" maxlength="255" placeholder="Calle, número, piso y depto." class="form-control" :class="claseCampo('direccion')" autocomplete="street-address">
            <div class="invalid-feedback">{{ errores.direccion }}</div>
          </div>
          <div class="col-12 col-md-4">
            <label for="reg-zona" class="form-label small fw-bold text-dark">Zona / Barrio</label>
            <input id="reg-zona" v-model.trim="form.zona" type="text" maxlength="100" class="form-control">
          </div>
        </div>

        <!-- CONTACTO DE EMERGENCIA -->
        <h6 class="titulo-seccion"><i class="bi bi-telephone-plus me-1"></i> Contacto de emergencia</h6>
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6">
            <label for="reg-tel-contacto" class="form-label small fw-bold text-dark">Teléfono *</label>
            <input id="reg-tel-contacto" v-model.trim="form.telefonoContacto" type="tel" maxlength="50" class="form-control" :class="claseCampo('telefonoContacto')">
            <div class="invalid-feedback">{{ errores.telefonoContacto }}</div>
          </div>
          <div class="col-12 col-md-6">
            <label for="reg-parentesco" class="form-label small fw-bold text-dark">Parentesco *</label>
            <input id="reg-parentesco" v-model.trim="form.parentescoContacto" type="text" maxlength="100" placeholder="Ej: Madre, pareja, hermano" class="form-control" :class="claseCampo('parentescoContacto')">
            <div class="invalid-feedback">{{ errores.parentescoContacto }}</div>
          </div>
        </div>

        <!-- DISPONIBILIDAD Y MOVILIDAD -->
        <h6 class="titulo-seccion"><i class="bi bi-clock me-1"></i> Disponibilidad y movilidad</h6>
        <div class="row g-3 mb-4">
          <div class="col-12">
            <span class="form-label small fw-bold text-dark d-block">Movilidad</span>
            <div class="d-flex flex-wrap gap-3">
              <div v-for="m in MOVILIDADES" :key="m.valor" class="form-check m-0">
                <input :id="`reg-mov-${m.valor}`" v-model="form.movilidad" class="form-check-input" type="checkbox" :value="m.valor">
                <label class="form-check-label small" :for="`reg-mov-${m.valor}`">{{ m.etiqueta }}</label>
              </div>
            </div>
          </div>

          <template v-for="dia in DIAS" :key="dia.campo">
            <div class="col-12 col-md-4">
              <label :for="`reg-disp-${dia.campo}`" class="form-label small fw-bold text-dark">{{ dia.etiqueta }}</label>
              <select :id="`reg-disp-${dia.campo}`" v-model="form[dia.campo]" class="form-select">
                <option v-for="d in DISPONIBILIDADES" :key="d.valor" :value="d.valor">{{ d.etiqueta }}</option>
              </select>
            </div>
            <template v-if="form[dia.campo] === 'OTROS'">
              <div class="col-6 col-md-4">
                <label :for="`reg-${dia.desde}`" class="form-label small fw-bold text-dark">Desde *</label>
                <input :id="`reg-${dia.desde}`" v-model="form[dia.desde]" type="time" class="form-control" :class="claseCampo(dia.desde)">
                <div class="invalid-feedback">{{ errores[dia.desde] }}</div>
              </div>
              <div class="col-6 col-md-4">
                <label :for="`reg-${dia.hasta}`" class="form-label small fw-bold text-dark">Hasta *</label>
                <input :id="`reg-${dia.hasta}`" v-model="form[dia.hasta]" type="time" class="form-control" :class="claseCampo(dia.hasta)">
                <div class="invalid-feedback">{{ errores[dia.hasta] }}</div>
              </div>
            </template>
            <div v-else class="d-none d-md-block col-md-8"></div>
          </template>
        </div>

        <!-- HANDBALL -->
        <h6 class="titulo-seccion"><i class="bi bi-dribbble me-1"></i> Actividad deportiva</h6>
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-4">
            <label for="reg-juega" class="form-label small fw-bold text-dark">¿Jugás al handball? *</label>
            <select id="reg-juega" v-model="form.juegaHandball" class="form-select">
              <option value="no">No</option>
              <option value="si">Sí</option>
            </select>
          </div>
          <template v-if="form.juegaHandball === 'si'">
            <div class="col-12 col-md-4">
              <label for="reg-club" class="form-label small fw-bold text-dark">Club *</label>
              <select id="reg-club" v-model="form.idClub" class="form-select" :class="claseCampo('idClub')">
                <option value="" disabled>Seleccionar club...</option>
                <option v-for="c in clubes" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
              <div class="invalid-feedback">{{ errores.idClub }}</div>
            </div>
            <div class="col-12 col-md-4">
              <label for="reg-categoria" class="form-label small fw-bold text-dark">Categoría *</label>
              <select id="reg-categoria" v-model="form.idCategoria" class="form-select" :class="claseCampo('idCategoria')">
                <option value="" disabled>Seleccionar categoría...</option>
                <optgroup v-for="grupo in categoriasPorRama" :key="grupo.rama" :label="grupo.etiqueta">
                  <option v-for="c in grupo.categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                </optgroup>
              </select>
              <div class="invalid-feedback">{{ errores.idCategoria }}</div>
            </div>
          </template>
        </div>

        <!-- OBSERVACIONES -->
        <h6 class="titulo-seccion"><i class="bi bi-chat-left-text me-1"></i> Observaciones</h6>
        <div class="mb-4">
          <label for="reg-observaciones" class="visually-hidden">Observaciones</label>
          <textarea id="reg-observaciones" v-model.trim="form.observaciones" rows="3" maxlength="2000" class="form-control" placeholder="Algo que quieras contarnos (opcional)"></textarea>
        </div>

        <div class="d-flex flex-column flex-md-row gap-2 justify-content-md-end border-top pt-3">
          <router-link to="/" class="btn btn-light border fw-bold px-4 py-2 rounded-3 order-2 order-md-1">CANCELAR</router-link>
          <button type="submit" class="btn btn-danger fw-bold px-4 py-2 rounded-3 order-1 order-md-2" :disabled="enviando">
            <span v-if="enviando" class="spinner-border spinner-border-sm me-1"></span>
            {{ enviando ? 'ENVIANDO...' : 'ENVIAR REGISTRO' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject } from 'vue'
import { useHead } from '@vueuse/head'
import { api } from '@/api/api'

useHead({
  title: 'Registro de Árbitros | AAAB',
  meta: [{ name: 'description', content: 'Formulario de alta para árbitros recibidos de la AAAB.' }],
})

const notificar = inject('notificar', null)
const toast = inject('toast', (msg) => alert(msg.mensaje || msg))

// ─── Opciones fijas (mismos valores que usa el panel del árbitro) ──
const GENEROS = [
  { valor: 'masculino', etiqueta: 'Masculino' },
  { valor: 'femenino', etiqueta: 'Femenino' },
  { valor: 'x', etiqueta: 'X' },
  { valor: 'otro', etiqueta: 'Otro' },
]
const MOVILIDADES = [
  { valor: 'auto', etiqueta: 'Auto' },
  { valor: 'moto', etiqueta: 'Moto' },
  { valor: 'transporte publico', etiqueta: 'Transporte público' },
  { valor: 'bici', etiqueta: 'Bicicleta' },
]
const DISPONIBILIDADES = [
  { valor: 'NO', etiqueta: 'NO' },
  { valor: 'FT', etiqueta: 'FT (Full Time)' },
  { valor: 'OTROS', etiqueta: 'OTROS (indicar horario)' },
]
const DIAS = [
  { campo: 'disponibilidadSabado', desde: 'sabadoDesde', hasta: 'sabadoHasta', etiqueta: 'Disponibilidad sábados' },
  { campo: 'disponibilidadDomingo', desde: 'domingoDesde', hasta: 'domingoHasta', etiqueta: 'Disponibilidad domingos' },
]
const RAMAS = { M: 'Masculino', F: 'Femenino' }

const hoy = new Date().toISOString().substring(0, 10)

// ─── Estado ──────────────────────────────────────────────────────
const formularioVacio = () => ({
  apellido: '', nombre: '', dni: '', fechaNacimiento: '', genero: '', email: '', celular: '',
  provincia: '', localidad: '', direccion: '', zona: '',
  telefonoContacto: '', parentescoContacto: '',
  movilidad: [],
  disponibilidadSabado: 'NO', sabadoDesde: '', sabadoHasta: '',
  disponibilidadDomingo: 'NO', domingoDesde: '', domingoHasta: '',
  juegaHandball: 'no', idClub: '', idCategoria: '',
  observaciones: '',
  sitioWeb: '',
})

const form = reactive(formularioVacio())
const errores = reactive({})
const intentoEnviar = ref(false)

const provincias = ref([])
const localidades = ref([])
const clubes = ref([])
const categorias = ref([])

const cargandoDatos = ref(true)
const enviando = ref(false)
const registrado = ref(false)

// ─── Computeds ───────────────────────────────────────────────────
const localidadesFiltradas = computed(() =>
  localidades.value.filter(l => Number(l.provincia_id) === Number(form.provincia))
)

const categoriasPorRama = computed(() => {
  const grupos = {}
  for (const c of categorias.value) {
    const rama = c.rama || 'otras'
    if (!grupos[rama]) grupos[rama] = { rama, etiqueta: RAMAS[rama] || 'Otras', categorias: [] }
    grupos[rama].categorias.push(c)
  }
  return Object.values(grupos)
})

// ─── Validación en el cliente ────────────────────────────────────
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const HORA_VALIDA = /^([01]\d|2[0-3]):[0-5]\d$/

const calcularEdad = (fechaIso) => {
  const nacimiento = new Date(`${fechaIso}T00:00:00`)
  if (isNaN(nacimiento)) return null
  const ahora = new Date()
  let edad = ahora.getFullYear() - nacimiento.getFullYear()
  const mes = ahora.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && ahora.getDate() < nacimiento.getDate())) edad--
  return edad
}

const validarFormulario = () => {
  const e = {}
  const obligatorio = (campo, mensaje) => { if (!String(form[campo] ?? '').trim()) e[campo] = mensaje }

  obligatorio('apellido', 'Ingresá tu apellido.')
  obligatorio('nombre', 'Ingresá tu nombre.')

  const dni = String(form.dni).replace(/\D/g, '')
  if (dni.length < 7 || dni.length > 9) e.dni = 'Ingresá un DNI válido, sin puntos.'

  if (!form.fechaNacimiento) e.fechaNacimiento = 'Ingresá tu fecha de nacimiento.'
  else {
    const edad = calcularEdad(form.fechaNacimiento)
    if (edad === null || edad < 14 || edad > 90) e.fechaNacimiento = 'Revisá la fecha de nacimiento.'
  }

  obligatorio('genero', 'Seleccioná un género.')
  if (!EMAIL_VALIDO.test(form.email)) e.email = 'Ingresá un email válido.'
  obligatorio('celular', 'Ingresá tu celular.')
  obligatorio('provincia', 'Seleccioná la provincia.')
  obligatorio('localidad', 'Seleccioná la localidad.')
  obligatorio('direccion', 'Ingresá tu dirección.')
  obligatorio('telefonoContacto', 'Ingresá un teléfono de emergencia.')
  obligatorio('parentescoContacto', 'Indicá el parentesco.')

  for (const dia of DIAS) {
    if (form[dia.campo] !== 'OTROS') continue
    const desde = form[dia.desde]
    const hasta = form[dia.hasta]
    if (!HORA_VALIDA.test(desde)) e[dia.desde] = 'Indicá desde qué hora.'
    if (!HORA_VALIDA.test(hasta)) e[dia.hasta] = 'Indicá hasta qué hora.'
    else if (HORA_VALIDA.test(desde) && desde >= hasta) e[dia.hasta] = 'Tiene que ser posterior al inicio.'
  }

  if (form.juegaHandball === 'si') {
    if (!form.idClub) e.idClub = 'Seleccioná tu club.'
    if (!form.idCategoria) e.idCategoria = 'Seleccioná tu categoría.'
  }

  Object.keys(errores).forEach(k => delete errores[k])
  Object.assign(errores, e)
  return Object.keys(e).length === 0
}

const claseCampo = (campo) => (intentoEnviar.value && errores[campo] ? 'is-invalid' : '')

// Revalida en vivo después del primer intento de envío
watch(form, () => { if (intentoEnviar.value) validarFormulario() }, { deep: true })

// Limpiezas dependientes
watch(() => form.provincia, () => { form.localidad = '' })
watch(() => form.juegaHandball, (valor) => {
  if (valor !== 'si') {
    form.idClub = ''
    form.idCategoria = ''
  }
})
for (const dia of DIAS) {
  watch(() => form[dia.campo], (valor) => {
    if (valor !== 'OTROS') {
      form[dia.desde] = ''
      form[dia.hasta] = ''
    }
  })
}

// ─── Cargas ──────────────────────────────────────────────────────
const cargarDatos = async () => {
  cargandoDatos.value = true
  try {
    const [resUbicacion, resRegistro] = await Promise.all([
      api.get({ entity: 'localidades', action: 'obtenerProvinciasLocalidades', payload: {} }),
      api.get({ entity: 'registro', action: 'obtenerDatosRegistro', payload: {} }),
    ])
    if (!resUbicacion?.ok || !resRegistro?.ok) throw new Error(resRegistro?.message || resUbicacion?.message || 'No se pudo cargar el formulario')
    provincias.value = resUbicacion.payload?.provincias ?? []
    localidades.value = resUbicacion.payload?.localidades ?? []
    clubes.value = resRegistro.payload?.clubes ?? []
    categorias.value = resRegistro.payload?.categorias ?? []
  } catch (e) {
    console.error('cargarDatos:', e)
    toast({ titulo: 'Error', mensaje: 'No se pudo cargar el formulario. Recargá la página.', tipo: 'danger' })
  } finally {
    cargandoDatos.value = false
  }
}

// ─── Envío ───────────────────────────────────────────────────────
const enviarRegistro = async () => {
  intentoEnviar.value = true
  if (!validarFormulario()) {
    toast({ titulo: 'Revisá el formulario', mensaje: 'Hay campos incompletos o con errores.', tipo: 'danger' })
    const primero = document.querySelector('.is-invalid')
    if (primero) primero.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  enviando.value = true
  try {
    const res = await api.post({
      entity: 'registro',
      action: 'registrarArbitro',
      payload: { ...form, dni: String(form.dni).replace(/\D/g, '') },
    })
    if (!res?.ok) throw new Error(res?.message || 'No se pudo completar el registro')
    registrado.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    const mensaje = e?.message || 'No se pudo completar el registro'
    if (notificar) notificar({ titulo: 'No se pudo registrar', mensaje, tipo: 'danger' })
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
.form-control,
.form-select {
  font-size: 1rem;
  background-color: #f8fafc;
  border-color: #e2e8f0;
}
.form-control:focus,
.form-select:focus {
  background-color: #ffffff;
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
}
.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
}
.campo-trampa {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}
@media (min-width: 768px) {
  .form-control,
  .form-select {
    font-size: 0.9rem;
  }
}
</style>
