<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const arbitro = ref(JSON.parse(localStorage.getItem('user_aaab') || '{}'));
const opciones = ref({ provincias: [], localidades: [] });
const localidadesFiltradas = ref([]);
const mensaje = ref({ texto: '', tipo: '' });
const cargando = ref(false);
const solicitudCambio = ref('');

// --- LÓGICA DE SEGURIDAD (PASSWORD) ---
const nuevaPassword = ref('');
const passwordMensaje = ref({ texto: '', tipo: '' });

// Control de edición (0 = Cerrado / 1 = Abierto)
const edicionAbierta = ref(arbitro.value.permitir_edicion == 1);

onMounted(async () => {
    try {
        const res = await axios.get('https://arbitroshandball.com.ar/api/get_opciones.php');
        opciones.value = res.data;
        if (arbitro.value.provincia) {
            filtrarLocalidades(arbitro.value.provincia);
        }
    } catch {
        console.error("Error al cargar provincias/localidades");
    }
});

const filtrarLocalidades = (provId) => {
    if (!opciones.value.localidades) return;
    localidadesFiltradas.value = opciones.value.localidades.filter(l => l.provincia_id == provId);
};

watch(() => arbitro.value.provincia, (nuevoId) => {
    filtrarLocalidades(nuevoId);
});

const guardarCambios = async () => {
    cargando.value = true;
    try {
        const res = await axios.post('https://arbitroshandball.com.ar/api/actualizar_perfil.php', arbitro.value);
        if (res.data.success) {
            mensaje.value = { texto: "Datos actualizados correctamente.", tipo: 'success' };
            localStorage.setItem('user_aaab', JSON.stringify(arbitro.value));
        } else {
            mensaje.value = { texto: res.data.message, tipo: 'danger' };
        }
    } catch {
        mensaje.value = { texto: "Error al conectar con el servidor.", tipo: 'danger' };
    } finally {
        cargando.value = false;
    }
};

const cambiarPassword = async () => {
    if (nuevaPassword.value.length < 6) {
        passwordMensaje.value = { texto: "La contraseña debe tener al menos 6 caracteres.", tipo: 'danger' };
        return;
    }
    cargando.value = true;
    try {
        const res = await axios.post('https://arbitroshandball.com.ar/api/actualizar_password.php', {
            id_arbitro: arbitro.value.id,
            password: nuevaPassword.value
        });
        if (res.data.success) {
            passwordMensaje.value = { texto: "Contraseña actualizada con éxito.", tipo: 'success' };
            nuevaPassword.value = '';
        } else {
            passwordMensaje.value = { texto: res.data.message, tipo: 'danger' };
        }
    } catch {
        passwordMensaje.value = { texto: "Error al actualizar la contraseña.", tipo: 'danger' };
    } finally {
        cargando.value = false;
    }
};

const enviarSolicitudRectificacion = async () => {
    if (!solicitudCambio.value.trim()) return;
    cargando.value = true;
    try {
        const res = await axios.post('https://arbitroshandball.com.ar/api/solicitar_disponibilidad.php', {
            id_arbitro: arbitro.value.id,
            nombre: arbitro.value.nombre,
            apellido: arbitro.value.apellido,
            grupo: arbitro.value.grupo,
            mensaje: "SOLICITUD RECTIFICACIÓN: " + solicitudCambio.value
        });
        if (res.data.success) {
            mensaje.value = { texto: "Solicitud enviada con éxito.", tipo: 'success' };
            solicitudCambio.value = '';
        }
    } catch {
        mensaje.value = { texto: "Error al enviar solicitud.", tipo: 'danger' };
    } finally {
        cargando.value = false;
    }
};
</script>

<template>
  <div class="animate__animated animate__fadeIn container py-4">
    
    <div class="card shadow border-0 overflow-hidden mx-auto" style="border-radius: 15px; max-width: 1000px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
        <h4 class="text-danger fw-bold m-0">Legajo Personal</h4>
        <span v-if="edicionAbierta" class="badge bg-success px-3 py-2 shadow-sm w-fit-mobile">Edición Abierta</span>
        <span v-else class="badge bg-secondary px-3 py-2 shadow-sm w-fit-mobile">Edición Cerrada</span>
      </div>

      <div class="card-body p-3 p-md-4">
        
        <div v-if="mensaje.texto" :class="`alert alert-${mensaje.tipo} mb-4 border-0 shadow-sm`" role="alert">
          {{ mensaje.texto }}
        </div>

        <div class="row g-4 mb-4 border-bottom pb-4">
            <div class="col-12 col-md-5">
                <label class="d-block small text-muted mb-1 text-uppercase fw-bold">Nombre y Apellido</label>
                <span class="fs-5 fw-bold text-dark">{{ arbitro.nombre }} {{ arbitro.apellido }}</span>
            </div>
            <div class="col-12 col-md-3">
                <label class="d-block small text-muted mb-1 text-uppercase fw-bold">DNI</label>
                <span class="fs-5 fw-bold text-dark">{{ arbitro.dni }}</span>
            </div>
            <div class="col-12 col-md-4 text-md-end">
                <label class="d-block small text-muted mb-1 text-uppercase fw-bold text-md-end">Grupo Arbitral</label>
                <span class="badge bg-dark fs-6 d-inline-block mt-1">
                    {{ arbitro.grupo }} {{ arbitro.subgrupo ? '- ' + arbitro.subgrupo : '' }}
                </span>
            </div>
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3" style="font-size: 0.8rem; letter-spacing: 1px;">Información de contacto</h6>
        <div class="row g-3 mb-5">
            <div class="col-12 col-md-3">
                <label class="small text-muted mb-1 d-block">Fecha de Nacimiento</label>
                <span class="fw-bold text-dark d-block p-2 bg-light rounded">{{ arbitro.fecha_nacimiento }}</span>
            </div>
            <div class="col-12 col-md-5">
                <label class="small text-muted mb-1 d-block">Email</label>
                <input v-if="edicionAbierta" v-model="arbitro.email" type="email" class="form-control form-control-sm">
                <span v-else class="fw-bold text-dark d-block p-2 bg-light rounded text-break">{{ arbitro.email }}</span>
            </div>
            <div class="col-12 col-md-4">
                <label class="small text-muted mb-1 d-block">Celular</label>
                <input v-if="edicionAbierta" v-model="arbitro.celular" type="text" class="form-control form-control-sm">
                <span v-else class="fw-bold text-dark d-block p-2 bg-light rounded">{{ arbitro.celular }}</span>
            </div>
            <div class="col-12">
                <label class="small text-muted mb-1 d-block">Dirección Residencial</label>
                <input v-if="edicionAbierta" v-model="arbitro.direccion" type="text" class="form-control form-control-sm">
                <span v-else class="fw-bold text-dark d-block p-2 bg-light rounded">{{ arbitro.direccion }}</span>
            </div>
            <div class="col-12 col-md-6">
                <label class="small text-muted mb-1 d-block">Provincia</label>
                <select v-if="edicionAbierta" v-model="arbitro.provincia" class="form-select form-select-sm">
                    <option v-for="p in opciones.provincias" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
                <span v-else class="fw-bold text-dark d-block p-2 bg-light rounded">{{ arbitro.nombre_provincia }}</span>
            </div>
            <div class="col-12 col-md-6">
                <label class="small text-muted mb-1 d-block">Localidad</label>
                <select v-if="edicionAbierta" v-model="arbitro.localidad" class="form-select form-select-sm">
                    <option v-for="l in localidadesFiltradas" :key="l.id" :value="l.id">{{ l.nombre }}</option>
                </select>
                <span v-else class="fw-bold text-dark d-block p-2 bg-light rounded">{{ arbitro.nombre_localidad }}</span>
            </div>
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3" style="font-size: 0.8rem; letter-spacing: 1px;">Contacto de Emergencia</h6>
        <div class="row g-3 border-bottom pb-5">
            <div class="col-12 col-md-6">
                <label class="small text-muted mb-1 d-block">Tel. de Emergencia</label>
                <input v-if="edicionAbierta" v-model="arbitro.telefonocontacto" type="text" class="form-control form-control-sm">
                <span v-else class="fw-bold text-dark d-block p-2 bg-light rounded">{{ arbitro.telefonocontacto }}</span>
            </div>
            <div class="col-12 col-md-6">
                <label class="small text-muted mb-1 d-block">Parentesco</label>
                <input v-if="edicionAbierta" v-model="arbitro.parentescocontacto" type="text" class="form-control form-control-sm">
                <span v-else class="fw-bold text-dark d-block p-2 bg-light rounded">{{ arbitro.parentescocontacto }}</span>
            </div>
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3 mt-4" style="font-size: 0.8rem; letter-spacing: 1px;">Seguridad</h6>
        <div class="row g-3 align-items-end">
            <div class="col-12 col-md-8">
                <label class="small text-muted mb-1 d-block">Nueva Contraseña</label>
                <input v-model="nuevaPassword" type="password" class="form-control form-control-sm" placeholder="Escribí tu nueva clave aquí">
            </div>
            <div class="col-12 col-md-4">
                <button @click="cambiarPassword" class="btn btn-dark btn-sm w-100 fw-bold py-2 shadow-sm" :disabled="cargando || !nuevaPassword">
                    ACTUALIZAR CLAVE
                </button>
            </div>
            <div v-if="passwordMensaje.texto" class="col-12 mt-2">
                <div :class="`alert alert-${passwordMensaje.tipo} py-2 small border-0 mb-0 shadow-sm`" role="alert">
                    {{ passwordMensaje.texto }}
                </div>
            </div>
        </div>

        <div v-if="edicionAbierta" class="mt-5 pt-3 border-top text-end">
            <button @click="guardarCambios" class="btn btn-success fw-bold px-5 shadow-sm w-100-mobile" :disabled="cargando">
                <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                GUARDAR CAMBIOS EN LEGAJO
            </button>
        </div>
      </div>
    </div>

    <div v-if="!edicionAbierta" class="manual-section p-3 p-md-4 rounded-4 shadow-lg mt-4 mx-auto" style="max-width: 1000px;">
        <div class="text-center text-white-50 mb-3 small">
            <i class="bi bi-info-circle-fill me-1"></i>
            La edición directa está cerrada. Podés enviar una solicitud formal aquí.
        </div>

        <div class="p-3 p-md-4 rounded-4" style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2);">
            <h6 class="text-white fw-bold small mb-2 text-uppercase">Solicitar Rectificación</h6>
            <p class="x-small text-white-50 mb-3">
                Si necesitás corregir datos personales, detallalo a continuación para secretaría.
            </p>
            
            <textarea 
                v-model="solicitudCambio" 
                class="form-control mb-3 custom-textarea" 
                rows="3" 
                placeholder="Detallá el cambio necesario..."
            ></textarea>
            
            <button 
                @click="enviarSolicitudRectificacion" 
                class="btn btn-danger w-100 fw-bold py-2 shadow" 
                :disabled="cargando || !solicitudCambio"
            >
                ENVIAR SOLICITUD DE CAMBIO
            </button>
        </div>
    </div>

  </div>
</template>

<style scoped>
.form-control-sm, .form-select-sm { border-radius: 8px; padding: 0.5rem; }
.x-small { font-size: 0.75rem; }
.badge { letter-spacing: 1px; }

.manual-section { 
    background-color: #0c1624; 
    border-radius: 1rem;
}

/* REGLA SOLICITADA: Fondo blanco, letra negra */
.custom-textarea {
    background-color: #ffffff !important;
    color: #000000 !important;
    border: none;
    border-radius: 8px;
}
.custom-textarea::placeholder {
    color: #6c757d;
}

.btn-danger { 
    background-color: #dc2626 !important; 
    border: none; 
}

.text-white-50 { 
    color: rgba(255, 255, 255, 0.5) !important; 
}

/* Ajustes Responsive */
@media (max-width: 768px) {
    .w-fit-mobile {
        width: fit-content;
    }
    .w-100-mobile {
        width: 100% !important;
    }
}
</style>