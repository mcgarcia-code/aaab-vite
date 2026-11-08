<template>
  <div>
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
        <label :for="`${prefijo}-email`" class="form-label small fw-bold text-dark">Email *</label>
        <input :id="`${prefijo}-email`" v-model.trim="form.email" type="email" maxlength="100" class="form-control" :class="clase('email')" autocomplete="email">
        <div class="invalid-feedback">{{ errores.email }}</div>
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
        <select :id="`${prefijo}-es-dt`" v-model="form.esDt" @change="limpiarSiNo('esDt', 'idClubDt', 'categoriasDt')" class="form-select">
          <option value="no">No</option>
          <option value="si">Sí</option>
        </select>
      </div>
      <div v-if="form.esDt === 'si'" class="bloque-deportivo border rounded-3 p-3">
        <SelectorClubCategorias
          v-model:id-club="form.idClubDt"
          v-model:categorias="form.categoriasDt"
          modo="todas"
          :prefijo="`${prefijo}-dt`"
          :invalido="mostrarErrores && !!errores.dt"
          @error="m => emit('error', m)"
        />
        <div v-if="mostrarErrores && errores.dt" class="text-danger small mt-2">{{ errores.dt }}</div>
      </div>
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
import { GENEROS_CURSO } from '@/composables/useCursoArbitro'

// Campos del formulario del curso (inscripción pública y modal del admin).
// v-model = objeto del formulario (formularioCursoVacio en useCursoArbitro.js)
const form = defineModel({ type: Object, required: true })

const props = defineProps({
  errores: { type: Object, default: () => ({}) },
  mostrarErrores: { type: Boolean, default: false },
  provincias: { type: Array, default: () => [] },
  localidades: { type: Array, default: () => [] },
  prefijo: { type: String, default: 'curso' },
})

const emit = defineEmits(['error'])

const hoy = new Date().toISOString().substring(0, 10)

const localidadesFiltradas = computed(() =>
  props.localidades.filter(l => Number(l.provincia_id) === Number(form.value.provincia))
)

const clase = (campo) => (props.mostrarErrores && props.errores[campo] ? 'is-invalid' : '')

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
