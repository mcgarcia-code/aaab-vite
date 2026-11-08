<template>
  <div>
    <!-- CURSO AL QUE SE ANOTA -->
    <h6 class="titulo-seccion"><i class="bi bi-mortarboard me-1"></i> Curso al que te anotás *</h6>
    <div class="row g-2 mb-1">
      <div v-for="(m, clave) in MODALIDADES_CURSO" :key="clave" class="col-12 col-sm-6">
        <input :id="`${prefijo}-modalidad-${clave}`" v-model="form.modalidadCurso" type="radio" class="btn-check" :value="clave" autocomplete="off">
        <label :for="`${prefijo}-modalidad-${clave}`" class="btn w-100 fw-bold py-3 opcion-curso" :class="mostrarErrores && errores.modalidadCurso ? 'btn-outline-danger' : 'btn-outline-dark'">
          <i class="bi me-1" :class="clave === 'anual' ? 'bi-calendar3' : 'bi-lightning-charge-fill'"></i> {{ m.etiqueta }}
        </label>
      </div>
    </div>
    <div v-if="mostrarErrores && errores.modalidadCurso" class="text-danger small mb-3">{{ errores.modalidadCurso }}</div>
    <div v-else class="mb-4"></div>

    <!-- USUARIO DEL CURSO -->
    <h6 class="titulo-seccion"><i class="bi bi-person-lock me-1"></i> Usuario para iniciar sesión</h6>
    <div class="row g-3 mb-4">
      <div class="col-12">
        <label :for="`${prefijo}-usuario`" class="form-label small fw-bold text-dark">Nombre de usuario *</label>
        <div class="input-group" :class="{ 'has-validation': mostrarErrores && errores.usuario }">
          <input
            :id="`${prefijo}-usuario`"
            :value="form.usuario"
            @input="form.usuario = $event.target.value.toLowerCase().replace(/\s/g, '')"
            type="text"
            maxlength="40"
            autocomplete="username"
            placeholder="ej: juan.perez"
            class="form-control"
            :class="clase('usuario')"
          >
          <span class="input-group-text fw-bold text-muted">@{{ DOMINIO_USUARIO_CURSO }}</span>
          <div class="invalid-feedback">{{ errores.usuario }}</div>
        </div>
        <div class="form-text">Con este usuario vas a iniciar sesión en el panel del curso.</div>
      </div>
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-password`" class="form-label small fw-bold text-dark">Contraseña {{ passwordObligatoria ? '*' : '' }}</label>
        <input :id="`${prefijo}-password`" v-model="form.password" type="password" maxlength="72" autocomplete="new-password" class="form-control" :class="clase('password')" :placeholder="passwordObligatoria ? 'Mínimo 8 caracteres' : 'Dejar vacío para no cambiarla'">
        <div class="invalid-feedback">{{ errores.password }}</div>
      </div>
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-password2`" class="form-label small fw-bold text-dark">Repetir contraseña {{ passwordObligatoria ? '*' : '' }}</label>
        <input :id="`${prefijo}-password2`" v-model="form.passwordConfirmacion" type="password" maxlength="72" autocomplete="new-password" class="form-control" :class="clase('passwordConfirmacion')">
        <div class="invalid-feedback">{{ errores.passwordConfirmacion }}</div>
      </div>
      <div v-if="ayudaPassword" class="col-12"><div class="form-text mt-0">{{ ayudaPassword }}</div></div>
    </div>

    <!-- DATOS PERSONALES -->
    <h6 class="titulo-seccion"><i class="bi bi-person-vcard me-1"></i> Datos personales</h6>
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-apellido`" class="form-label small fw-bold text-dark">Apellido *</label>
        <input :id="`${prefijo}-apellido`" v-model.trim="form.apellido" type="text" maxlength="100" class="form-control" :class="clase('apellido')" autocomplete="family-name">
        <div class="invalid-feedback">{{ errores.apellido }}</div>
      </div>
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-nombre`" class="form-label small fw-bold text-dark">Nombre *</label>
        <input :id="`${prefijo}-nombre`" v-model.trim="form.nombre" type="text" maxlength="100" class="form-control" :class="clase('nombre')" autocomplete="given-name">
        <div class="invalid-feedback">{{ errores.nombre }}</div>
      </div>
      <div class="col-12 col-md-4">
        <label :for="`${prefijo}-dni`" class="form-label small fw-bold text-dark">DNI *</label>
        <input :id="`${prefijo}-dni`" v-model.trim="form.dni" type="text" inputmode="numeric" maxlength="10" placeholder="Sin puntos" class="form-control" :class="clase('dni')">
        <div class="invalid-feedback">{{ errores.dni }}</div>
      </div>
      <div class="col-6 col-md-4">
        <label :for="`${prefijo}-nacimiento`" class="form-label small fw-bold text-dark">Fecha de nacimiento *</label>
        <input :id="`${prefijo}-nacimiento`" v-model="form.fechaNacimiento" type="date" :max="hoy" class="form-control" :class="clase('fechaNacimiento')">
        <div class="invalid-feedback">{{ errores.fechaNacimiento }}</div>
      </div>
      <div class="col-6 col-md-4">
        <label :for="`${prefijo}-genero`" class="form-label small fw-bold text-dark">Género *</label>
        <select :id="`${prefijo}-genero`" v-model="form.genero" class="form-select" :class="clase('genero')">
          <option value="" disabled>Seleccionar...</option>
          <option v-for="g in GENEROS_CURSO" :key="g.valor" :value="g.valor">{{ g.etiqueta }}</option>
        </select>
        <div class="invalid-feedback">{{ errores.genero }}</div>
      </div>
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-email`" class="form-label small fw-bold text-dark">Email personal *</label>
        <input :id="`${prefijo}-email`" v-model.trim="form.email" type="email" maxlength="100" class="form-control" :class="clase('email')" autocomplete="email">
        <div class="invalid-feedback">{{ errores.email }}</div>
        <div class="form-text">Para recuperar la contraseña y recibir las notificaciones del curso.</div>
      </div>
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-celular`" class="form-label small fw-bold text-dark">Celular *</label>
        <input :id="`${prefijo}-celular`" v-model.trim="form.celular" type="tel" maxlength="30" placeholder="Ej: 11 2345 6789" class="form-control" :class="clase('celular')" autocomplete="tel">
        <div class="invalid-feedback">{{ errores.celular }}</div>
      </div>
    </div>

    <!-- DOMICILIO -->
    <h6 class="titulo-seccion"><i class="bi bi-house-door me-1"></i> Domicilio</h6>
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-provincia`" class="form-label small fw-bold text-dark">Provincia *</label>
        <select :id="`${prefijo}-provincia`" v-model="form.provincia" @change="form.localidad = ''" class="form-select" :class="clase('provincia')">
          <option value="" disabled>Seleccionar...</option>
          <option v-for="p in provincias" :key="p.id" :value="Number(p.id)">{{ p.nombre }}</option>
        </select>
        <div class="invalid-feedback">{{ errores.provincia }}</div>
      </div>
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-localidad`" class="form-label small fw-bold text-dark">Localidad *</label>
        <select :id="`${prefijo}-localidad`" v-model="form.localidad" class="form-select" :class="clase('localidad')" :disabled="!form.provincia">
          <option value="" disabled>{{ form.provincia ? 'Seleccionar...' : 'Elegí primero la provincia' }}</option>
          <option v-for="l in localidadesFiltradas" :key="l.id" :value="Number(l.id)">{{ l.nombre }}</option>
        </select>
        <div class="invalid-feedback">{{ errores.localidad }}</div>
      </div>
      <div class="col-12 col-md-8">
        <label :for="`${prefijo}-direccion`" class="form-label small fw-bold text-dark">Dirección *</label>
        <input :id="`${prefijo}-direccion`" v-model.trim="form.direccion" type="text" maxlength="255" placeholder="Calle, número, piso y depto." class="form-control" :class="clase('direccion')" autocomplete="street-address">
        <div class="invalid-feedback">{{ errores.direccion }}</div>
      </div>
      <div class="col-12 col-md-4">
        <label :for="`${prefijo}-zona`" class="form-label small fw-bold text-dark">Zona / Barrio</label>
        <input :id="`${prefijo}-zona`" v-model.trim="form.zona" type="text" maxlength="100" class="form-control">
      </div>
    </div>

    <!-- CONTACTO DE EMERGENCIA -->
    <h6 class="titulo-seccion"><i class="bi bi-telephone-plus me-1"></i> Contacto de emergencia</h6>
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-tel-contacto`" class="form-label small fw-bold text-dark">Teléfono *</label>
        <input :id="`${prefijo}-tel-contacto`" v-model.trim="form.telefonoContacto" type="tel" maxlength="50" class="form-control" :class="clase('telefonoContacto')">
        <div class="invalid-feedback">{{ errores.telefonoContacto }}</div>
      </div>
      <div class="col-12 col-md-6">
        <label :for="`${prefijo}-parentesco`" class="form-label small fw-bold text-dark">Parentesco *</label>
        <input :id="`${prefijo}-parentesco`" v-model.trim="form.parentescoContacto" type="text" maxlength="100" placeholder="Ej: Madre, pareja, hermano" class="form-control" :class="clase('parentescoContacto')">
        <div class="invalid-feedback">{{ errores.parentescoContacto }}</div>
      </div>
    </div>

    <!-- ACTIVIDAD DEPORTIVA -->
    <h6 class="titulo-seccion"><i class="bi bi-dribbble me-1"></i> Actividad deportiva</h6>
    <div class="mb-3">
      <div class="col-12 col-md-4 mb-3">
        <label :for="`${prefijo}-es-jugador`" class="form-label small fw-bold text-dark">¿Sos jugador/a de handball? *</label>
        <select :id="`${prefijo}-es-jugador`" v-model="form.esJugador" @change="limpiarSiNo('esJugador', 'idClubJugador', 'categoriasJugador')" class="form-select">
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select>
      </div>
      <div v-if="form.esJugador === 'si'" class="bloque-deportivo border rounded-3 p-3">
        <SelectorClubCategorias
          v-model:id-club="form.idClubJugador"
          v-model:categorias="form.categoriasJugador"
          modo="juego"
          :genero="form.genero"
          :prefijo="`${prefijo}-jug`"
          :invalido="mostrarErrores && !!errores.jugador"
          @error="m => emit('error', m)"
        />
        <div v-if="mostrarErrores && errores.jugador" class="text-danger small mt-2">{{ errores.jugador }}</div>
      </div>
    </div>
    <div class="mb-4">
      <div class="col-12 col-md-4 mb-3">
        <label :for="`${prefijo}-es-dt`" class="form-label small fw-bold text-dark">¿Sos DT (director/a técnico/a)? *</label>
        <select :id="`${prefijo}-es-dt`" v-model="form.esDt" @change="cambiarEsDt" class="form-select">
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select>
      </div>
      <template v-if="form.esDt === 'si'">
        <div v-for="(d, i) in form.dtClubes" :key="i" class="bloque-deportivo border rounded-3 p-3 mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small fw-bold text-danger text-uppercase">Club {{ i + 1 }} como DT</span>
            <button v-if="form.dtClubes.length > 1" type="button" class="btn btn-sm btn-outline-danger py-0 px-2" @click="form.dtClubes.splice(i, 1)" :aria-label="`Quitar club ${i + 1}`">
              <i class="bi bi-trash3"></i> Quitar
            </button>
          </div>
          <SelectorClubCategorias
            v-model:id-club="d.idClub"
            v-model:categorias="d.categorias"
            modo="todas"
            :prefijo="`${prefijo}-dt-${i}`"
            :invalido="mostrarErrores && !!errores.dt && (!d.idClub || !d.categorias.length)"
            @error="m => emit('error', m)"
          />
        </div>
        <button v-if="form.dtClubes.length < MAX_CLUBES_DT" type="button" class="btn btn-outline-secondary btn-sm fw-bold" @click="form.dtClubes.push(filaDtVacia())">
          <i class="bi bi-plus-circle me-1"></i> Agregar otro club
        </button>
        <div v-if="mostrarErrores && errores.dt" class="text-danger small mt-2">{{ errores.dt }}</div>
      </template>
    </div>

    <!-- OBSERVACIONES -->
    <h6 class="titulo-seccion"><i class="bi bi-chat-left-text me-1"></i> Observaciones</h6>
    <div>
      <label :for="`${prefijo}-observaciones`" class="visually-hidden">Observaciones</label>
      <textarea :id="`${prefijo}-observaciones`" v-model.trim="form.observaciones" rows="3" maxlength="2000" class="form-control" placeholder="Algo que quieras contarnos (opcional)"></textarea>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SelectorClubCategorias from '@/components/SelectorClubCategorias.vue'
import { GENEROS_CURSO, DOMINIO_USUARIO_CURSO, MAX_CLUBES_DT, MODALIDADES_CURSO, filaDtVacia } from '@/composables/useCursoArbitro'

// Campos del formulario del curso (inscripción pública y modal del admin).
// v-model = objeto del formulario (formularioCursoVacio en useCursoArbitro.js)
const form = defineModel({ type: Object, required: true })

const props = defineProps({
  errores: { type: Object, default: () => ({}) },
  mostrarErrores: { type: Boolean, default: false },
  provincias: { type: Array, default: () => [] },
  localidades: { type: Array, default: () => [] },
  prefijo: { type: String, default: 'curso' },
  passwordObligatoria: { type: Boolean, default: true },
  ayudaPassword: { type: String, default: '' },
})

const emit = defineEmits(['error'])

const hoy = new Date().toISOString().substring(0, 10)

const localidadesFiltradas = computed(() =>
  props.localidades.filter(l => Number(l.provincia_id) === Number(form.value.provincia))
)

const clase = (campo) => (props.mostrarErrores && props.errores[campo] ? 'is-invalid' : '')

const cambiarEsDt = () => {
  form.value.dtClubes = form.value.esDt === 'si' ? [filaDtVacia()] : []
}

const limpiarSiNo = (campoSiNo, campoClub, campoCategorias) => {
  if (form.value[campoSiNo] === 'si') return
  form.value[campoClub] = ''
  form.value[campoCategorias] = []
}
</script>

<style scoped>
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
.bloque-deportivo {
  background-color: #fcfcfd;
}
.form-control,
.form-select {
  font-size: 1rem;
}
@media (min-width: 768px) {
  .form-control,
  .form-select {
    font-size: 0.9rem;
  }
}
</style>
