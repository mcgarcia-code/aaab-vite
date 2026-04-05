<template>
  <div class="animate__animated animate__fadeIn container py-4">
    
    <div class="card shadow border-0 overflow-hidden mx-auto mb-4" style="border-radius: 15px; max-width: 1000px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-2">
        <h4 class="text-danger fw-bold m-0">Legajo Personal</h4>
        
        <div class="d-flex flex-wrap gap-2 justify-content-md-end">
            <span v-if="arbitro.apto_medico == 1" class="badge bg-success px-3 py-2 shadow-sm d-flex align-items-center gap-2">
                <i class="bi bi-heart-pulse-fill"></i> APTO MÉDICO: SÍ
            </span>
            <span v-else class="badge bg-danger px-3 py-2 shadow-sm d-flex align-items-center gap-2 animate__animated animate__pulse animate__infinite">
                <i class="bi bi-exclamation-triangle-fill"></i> APTO MÉDICO: NO
            </span>

            <span v-if="edicionAbierta" class="badge bg-primary px-3 py-2 shadow-sm w-fit-mobile">
                <i class="bi bi-pencil-square me-1"></i> Edición Abierta
            </span>
            <span v-else class="badge bg-secondary px-3 py-2 shadow-sm w-fit-mobile">
                <i class="bi bi-lock-fill me-1"></i> Edición Cerrada
            </span>
        </div>
      </div>

      <div class="card-body p-3 p-md-4">
        <div class="row g-4 mb-4 border-bottom pb-4">
            <div class="col-12 col-md-4">
                <label class="d-block small text-muted mb-1 text-uppercase fw-bold">Nombre y Apellido</label>
                <span class="fs-5 fw-bold text-dark">{{ arbitro.nombre }} {{ arbitro.apellido }}</span>
            </div>
            <div class="col-12 col-md-2">
                <label class="d-block small text-muted mb-1 text-uppercase fw-bold">DNI</label>
                <span class="fs-5 fw-bold text-dark">{{ arbitro.dni }}</span>
            </div>
            <div class="col-12 col-md-6 text-md-end">
                <label class="d-block small text-muted mb-1 text-uppercase fw-bold text-md-end">Grupo Arbitral y Estado</label>
                <div class="d-flex flex-wrap justify-content-md-end gap-2 align-items-center mt-1">
                    <span class="badge bg-dark fs-6">
                        {{ arbitro.grupo }} {{ arbitro.subgrupo ? '- ' + arbitro.subgrupo : '' }}
                    </span>
                    <span v-if="arbitro.es_activo == 1" class="status-pill status-active">
                        <i class="bi bi-check-circle-fill"></i> En actividad
                    </span>
                    <span v-else class="status-pill status-inactive">
                        <i class="bi bi-x-circle-fill"></i> Inactivo
                    </span>
                </div>
            </div>
        </div>

        <h6 class="text-danger fw-bold text-uppercase mb-3" style="font-size: 0.8rem; letter-spacing: 1px;">Información de contacto</h6>
        <div class="row g-3 mb-5">
            <div class="col-12 col-md-3">
                <label class="small text-muted mb-1 d-block">Fecha de Nacimiento</label>
                <div v-if="edicionAbierta" class="date-custom-wrapper" :data-date="arbitro.fecha_nacimiento ? mostrarFechaArg(arbitro.fecha_nacimiento) : 'Seleccionar fecha'">
                    <input type="date" v-model="arbitro.fecha_nacimiento" class="form-control form-control-sm input-fecha-nativa">
                </div>
                <span v-else class="fw-bold text-dark d-block p-2 bg-light rounded">
                    {{ mostrarFechaArg(arbitro.fecha_nacimiento) }}
                </span>
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
                    <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                    ACTUALIZAR CLAVE
                </button>
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

    <div class="card border-0 shadow mx-auto mb-4 overflow-hidden" style="border-radius: 15px; max-width: 1000px;">
        <div class="card-header bg-white py-2 ps-3 border-bottom">
            <h6 class="m-0 fw-bold text-dark small">Historial de Rectificaciones</h6>
        </div>
        <div class="card-body p-0 bg-white">
            <div v-if="historialRectificaciones.length > 0" class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                        <tr class="x-small text-uppercase text-muted" style="font-size: 0.7rem;">
                            <th class="ps-3" style="width: 130px;">Fecha</th>
                            <th>Mensaje de Solicitud</th>
                            <th class="text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(h, i) in historialRectificaciones" :key="i">
                            <td class="ps-3 small fw-bold text-dark">{{ h.fecha }}</td>
                            <td class="small text-dark">{{ h.mensaje }}</td>
                            <td class="text-center">
                                <span class="badge bg-secondary x-small" style="font-size: 0.65rem;">ENVIADO</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else class="text-center py-4 text-muted small">
                Sin solicitudes de rectificación previas.
            </div>
        </div>
    </div>

    <div v-if="!edicionAbierta" class="manual-section p-0 mx-auto mt-4" style="max-width: 1000px; background: transparent; box-shadow: none;">
        <div class="text-center text-white-50 mb-3 small">
            <i class="bi bi-info-circle-fill me-1"></i>
            La edición directa está cerrada. Podés enviar una solicitud formal aquí.
        </div>

        <div class="p-3 p-md-4 rounded-4 shadow-lg" style="background: #0c1624; border: 1px dashed rgba(255,255,255,0.2);">
            <h6 class="text-white fw-bold small mb-2 text-uppercase">Solicitar Rectificación</h6>
            <p class="x-small text-white-50 mb-3">
                Si necesitás corregir datos personales (DNI, Fecha de Nac., etc.), detallalo a continuación.
            </p>
            
            <textarea 
                v-model="solicitudCambio" 
                class="form-control mb-3 custom-textarea" 
                rows="3" 
                placeholder="Ej: Hola, necesito corregir mi DNI, el correcto es..."
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

<script setup>
import { ref, onMounted, watch, inject } from 'vue';
import { api } from '@/api/api'; 
import { auth } from '@/api/auth';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Mis Datos | AAAB',
  meta: [
    { name: 'description', content: 'Mis datos personales y de contacto.' },
    { property: 'og:title', content: 'Mis Datos | AAAB' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' }
  ],
});

// Inyectamos el notificador global
const notificar = inject('notificar');

const arbitro = ref(auth.getUser() || {});
const opciones = ref({ provincias: [], localidades: [] });
const localidadesFiltradas = ref([]);
const cargando = ref(false);
const solicitudCambio = ref('');
const historialRectificaciones = ref([]);
const nuevaPassword = ref('');

const edicionAbierta = ref(arbitro.value.permitir_edicion == 1);

const mostrarFechaArg = (fecha) => {
    if (!fecha) return '';
    const partes = fecha.split('-');
    if (partes.length !== 3) return fecha;
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
};

const obtenerHistorialRectificaciones = async () => {
    try {
        const res = await api.get({
            entity: 'datos_personales',
            action: 'obtenerHistorial'
        })
        historialRectificaciones.value = res.payload;
    } catch {
        console.error("Error al cargar el historial de rectificaciones");
    }
};

onMounted(async () => {
    obtenerHistorialRectificaciones();
    try {
        const {payload} = await api.get ({
            entity: 'localidades',
            action: 'obtenerProvinciasLocalidades'
        })
        opciones.value = payload;
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
        const res = await api.post({
            entity: 'arbitros',
            action: 'actualizarDatos',
            payload: {
                arbitro: arbitro.value
            }
        })
        if (res.success) {
            notificar({
              titulo: '¡Perfil Actualizado!',
              mensaje: 'Tus datos se guardaron correctamente en el legajo.',
              tipo: 'success'
            });
            auth.setUser(arbitro.value);
        } else {
            notificar({
              titulo: 'Error',
              mensaje: res.data.message || 'No se pudieron actualizar los datos.',
              tipo: 'danger'
            });
        }
    } catch {
        notificar({
          titulo: 'Error de Conexión',
          mensaje: 'No pudimos conectar con el servidor para guardar los cambios.',
          tipo: 'danger'
        });
    } finally {
        cargando.value = false;
    }
};

const cambiarPassword = async () => {
    if (nuevaPassword.value.length < 6) {
        notificar({
          titulo: 'Clave demasiado corta',
          mensaje: 'La contraseña debe tener al menos 6 caracteres.',
          tipo: 'danger'
        });
        return;
    }
    
    cargando.value = true;
    try {
        const res = await api.post({
            entity: 'arbitros',
            action: 'actualizarPassword',
            payload: {
                password: nuevaPassword.value
            }
        });
        if (res.ok) {
            notificar({
              titulo: '¡Clave Actualizada!',
              mensaje: 'Tu nueva contraseña ha sido guardada con éxito.',
              tipo: 'success'
            });
            nuevaPassword.value = '';
        } else {
            notificar({
              titulo: 'Error',
              mensaje: res.data.message || 'No se pudo cambiar la contraseña.',
              tipo: 'danger'
            });
        }
    } catch {
        notificar({
          titulo: 'Error',
          mensaje: 'Hubo un problema al intentar actualizar tu contraseña.',
          tipo: 'danger'
        });
    } finally {
        cargando.value = false;
    }
};

const enviarSolicitudRectificacion = async () => {
    if (!solicitudCambio.value.trim()) return;
    cargando.value = true;
    try {
        const res = await axios.post('https://arbitroshandball.com.ar/api/solicitar_cambios.php', {
            id_arbitro: arbitro.value.id,
            nombre: arbitro.value.nombre,
            apellido: arbitro.value.apellido,
            grupo: arbitro.value.grupo,
            mensaje: "RECTIFICACIÓN: " + solicitudCambio.value
          });
        if (res.data.success) {
            notificar({
              titulo: 'Solicitud Enviada',
              mensaje: 'Tu pedido de rectificación fue enviado a la asociación.',
              tipo: 'success'
            });
            solicitudCambio.value = '';
            obtenerHistorialRectificaciones();
        } else {
          notificar({
            titulo: 'Error',
            mensaje: 'No se pudo enviar la solicitud.',
            tipo: 'danger'
          });
        }
    } catch {
        notificar({
          titulo: 'Error',
          mensaje: 'Problema al conectar con el servidor para enviar la solicitud.',
          tipo: 'danger'
        });
    } finally {
        cargando.value = false;
    }
};
</script>

<style scoped>
.form-control-sm, .form-select-sm { border-radius: 8px; padding: 0.5rem; }
.x-small { font-size: 0.75rem; }
.badge { letter-spacing: 1px; }

.manual-section { 
    border-radius: 1rem;
}

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

.status-pill {
    font-size: 0.85rem;
    font-weight: bold;
    padding: 6px 12px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.status-active {
    background-color: #dcfce7;
    color: #166534;
    border: 1px solid #bbf7d0;
}
.status-active i { color: #22c55e; }

.status-inactive {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
}
.status-inactive i { color: #ef4444; }

.animate__fadeInUp {
    animation-duration: 0.5s;
}

@media (max-width: 768px) {
    .w-fit-mobile { 
        width: fit-content !important; 
        margin-top: 5px; 
    }
    
    .w-100-mobile { 
        width: 100% !important; 
        display: block;
    }

    .fs-5 {
        font-size: 1.1rem !important;
    }
    
    label {
        margin-top: 5px;
    }
}
</style>