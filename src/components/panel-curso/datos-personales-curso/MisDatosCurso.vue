<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

   <div class="card shadow border-0 overflow-hidden mx-auto mb-4 w-100" style="border-radius: 15px;">
      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-person me-2"></i> Legajo Personal
          </h4>
          <p class="text-muted small m-0 mt-1">Modificá tus datos personales</p>
        </div>

        <div class="d-flex flex-wrap gap-2 justify-content-md-end">
            <span v-if="arbitro.apto_medico == 1" class="badge bg-success px-3 py-2 shadow-sm d-inline-flex align-items-center gap-2">
                <i class="bi bi-heart-pulse-fill"></i> APTO MÉDICO: SÍ
            </span>
            <span v-else class="badge bg-danger px-3 py-2 shadow-sm d-inline-flex align-items-center gap-2 animate__animated animate__pulse animate__infinite">
                <i class="bi bi-exclamation-triangle-fill"></i> APTO MÉDICO: NO
            </span>

            <span v-if="edicionAbierta" class="badge bg-primary px-3 py-2 shadow-sm d-inline-flex align-items-center w-auto">
                <i class="bi bi-pencil-square me-1"></i> Edición Abierta
            </span>
            <span v-else class="badge bg-secondary px-3 py-2 shadow-sm d-inline-flex align-items-center w-auto">
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
                    <span class="badge bg-dark fs-6 rounded-pill px-3 py-2 shadow-sm">
                        {{ arbitro.grupo }} {{ arbitro.subgrupo ? '- ' + arbitro.subgrupo : '' }}
                    </span>
                    <!-- Reemplazamos status-pill custom por utilidades de Bootstrap -->
                    <span v-if="arbitro.es_activo == 1" class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 shadow-sm d-flex align-items-center gap-1" style="font-size: 0.85rem;">
                        <i class="bi bi-check-circle-fill"></i> En actividad
                    </span>
                    <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-2 shadow-sm d-flex align-items-center gap-1" style="font-size: 0.85rem;">
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
                <input v-model="nuevaPassword" type="password" class="form-control form-control-sm py-2" placeholder="Escribí tu nueva clave aquí">
            </div>
            <div class="col-12 col-md-4">
                <button @click="cambiarPassword" class="btn btn-dark btn-sm w-100 fw-bold py-2 shadow-sm" :disabled="cargando || !nuevaPassword">
                    <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                    ACTUALIZAR CLAVE
                </button>
            </div>
        </div>

        <div v-if="edicionAbierta" class="mt-4 pt-4 border-top">
            <button @click="guardarCambios" class="btn btn-success w-100 fw-bold shadow-sm py-3 py-md-2" :disabled="cargando">
                <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                GUARDAR CAMBIOS EN LEGAJO
            </button>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow mx-auto mb-4 overflow-hidden w-100" style="border-radius: 15px;">
        <div class="card-header bg-white py-3 ps-3 border-bottom">
            <h6 class="m-0 fw-bold text-dark small text-uppercase">Historial de Rectificaciones</h6>
        </div>
        <div class="card-body p-0 bg-white">
            <!-- LISTA UNIFICADA (Reemplaza la tabla rígida) -->
            <div v-if="historialRectificaciones.length > 0" class="d-flex flex-column">

                <!-- Encabezado de Columnas (Solo Escritorio) -->
                <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 fw-bold text-uppercase text-muted" style="font-size: 0.70rem;">
                    <div class="col-md-2 ps-3">Fecha</div>
                    <div class="col-md-7">Mensaje de Solicitud</div>
                    <div class="col-md-3 text-center pe-3">Estado</div>
                </div>

                <!-- Filas de Datos -->
                <div v-for="(h, i) in historialRectificaciones" :key="i" class="row g-0 align-items-center p-3 p-md-2 border-bottom bg-white item-historial">

                    <!-- HEADER MOBILE: Fecha y Estado -->
                    <div class="col-12 d-md-none mb-2 pb-2 border-bottom d-flex justify-content-between align-items-center">
                        <span class="small fw-bold text-dark">{{ h.fecha }}</span>
                        <span :class="['badge', h.estado === 'aprobado' ? 'bg-success' : (h.estado === 'rechazado' ? 'bg-danger' : 'bg-warning text-dark')]" style="font-size: 0.65rem;">
                            {{ h.estado ? h.estado.toUpperCase() : 'ENVIADO' }}
                        </span>
                    </div>

                    <!-- COL 1: FECHA (Escritorio) -->
                    <div class="col-md-2 d-none d-md-block ps-3 small fw-bold text-dark">
                        {{ h.fecha }}
                    </div>

                    <!-- COL 2: MENSAJE (Ambos) -->
                    <div class="col-12 col-md-7 small text-dark lh-sm">
                        {{ h.mensaje }}
                    </div>

                    <!-- COL 3: ESTADO (Escritorio) -->
                    <div class="col-md-3 d-none d-md-flex justify-content-center pe-3">
                        <span :class="['badge', h.estado === 'aprobado' ? 'bg-success' : (h.estado === 'rechazado' ? 'bg-danger' : 'bg-warning text-dark')]" style="font-size: 0.65rem; letter-spacing: 0.5px;">
                            {{ h.estado ? h.estado.toUpperCase() : 'ENVIADO' }}
                        </span>
                    </div>

                </div>
            </div>

            <div v-else class="text-center py-5 text-muted small bg-light">
                <span class="material-icons opacity-50 d-block mb-2" style="font-size: 32px;">history_toggle_off</span>
                Sin solicitudes de rectificación previas.
            </div>
        </div>
    </div>

    <div v-if="!edicionAbierta" class="manual-section p-0 mx-auto mt-4 w-100" style="background: transparent; box-shadow: none;">
        <div class="text-center text-white-50 mb-3 small">
            <i class="bi bi-info-circle-fill me-1"></i>
            La edición directa está cerrada. Podés enviar una solicitud formal aquí.
        </div>

        <div class="p-3 p-md-4 rounded-4 shadow-lg" style="background: #0c1624; border: 1px dashed rgba(255,255,255,0.2);">
            <h6 class="text-white fw-bold small mb-2 text-uppercase">Solicitar Rectificación</h6>
            <p class="small text-white-50 mb-3" style="font-size: 0.8rem;">
                Si necesitás corregir datos personales (DNI, Fecha de Nac., etc.), detallalo a continuación.
            </p>

            <textarea
                v-model="solicitudCambio"
                class="form-control mb-3 custom-textarea p-3"
                rows="3"
                placeholder="Ej: Hola, necesito corregir mi DNI, el correcto es..."
            ></textarea>

            <button
                @click="enviarSolicitudRectificacion"
                class="btn btn-danger w-100 fw-bold py-3 py-md-2 shadow"
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
            action: 'obtenerHistorial',
            payload: { tipo: "datos_personales" }
        });
        historialRectificaciones.value = res.payload || [];
    } catch (error) {
        console.error("Error al cargar el historial de rectificaciones", error);
    }
};

onMounted(async () => {
    obtenerHistorialRectificaciones();

    if (edicionAbierta.value) {
        try {
            const { payload } = await api.get({
                entity: 'localidades',
                action: 'obtenerProvinciasLocalidades'
            });

            opciones.value = payload;

            if (arbitro.value.provincia) {
                filtrarLocalidades(arbitro.value.provincia);
            }
        } catch (error) {
            console.error("Error al cargar provincias/localidades", error);
        }
    }
});

const filtrarLocalidades = (provId) => {
    if (!opciones.value.localidades || !edicionAbierta.value) return;

    localidadesFiltradas.value = opciones.value.localidades.filter(
        l => l.provincia_id == provId
    );
};

watch(() => arbitro.value.provincia, (nuevoId) => {
    if (edicionAbierta.value) {
        filtrarLocalidades(nuevoId);
    }
});

const guardarCambios = async () => {
    cargando.value = true;
    try {
        const res = await api.post({
            entity: 'datos_personales',
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
        const res = await api.post({
            entity: 'datos_personales',
            action: 'rectificarDatos',
            payload: {
                tipo: "datos_personales",
                mensaje: "RECTIFICACIÓN: " + solicitudCambio.value
            }
        });

        if (res.ok || res.success) {
            notificar({
                titulo: 'Solicitud Enviada',
                mensaje: 'Tu pedido de rectificación fue enviado a la asociación.',
                tipo: 'success'
            });
            solicitudCambio.value = '';
            await obtenerHistorialRectificaciones();
        } else {
            throw new Error();
        }
    } catch {
        notificar({
            titulo: 'Error',
            mensaje: 'No se pudo enviar la solicitud.',
            tipo: 'danger'
        });
    } finally {
        cargando.value = false;
    }
};
</script>

<style scoped>
/* ====================================================
   ESTILOS BASE Y COMPONENTES
   ==================================================== */
.form-control-sm, .form-select-sm {
  border-radius: 8px;
  padding: 0.5rem;
}

.manual-section {
  background-color: #0c1624;
  border-radius: 1rem;
}

.btn-danger {
  background-color: #dc2626 !important;
  border: none;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.5) !important;
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

.badge {
  letter-spacing: 1px;
}

/* ====================================================
   EFECTO HOVER DE LA LISTA HISTORIAL
   ==================================================== */
.item-historial {
  transition: background-color 0.2s ease;
}

.item-historial:hover {
  background-color: #f8fafc !important;
}

.animate__animated { animation-duration: 0.5s; }

</style>
