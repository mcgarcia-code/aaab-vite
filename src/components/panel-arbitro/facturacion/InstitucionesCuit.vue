<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 12px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-building me-1"></i> Instituciones y CUITs
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ filtrados.length }} instituciones encontradas</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <!-- Botón Actualizar (con spinner) -->
            <button @click="cargarDatos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <!-- Botón Filtros (Solo Móvil) -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <!-- Botón Limpiar -->
            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar Filtros</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Instituciones</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-12 col-md-3">
              <input v-model="filtros.club" class="form-control form-control-sm shadow-none py-2" placeholder="Filtrar por club o institución...">
            </div>
            <div class="col-6 col-md-3">
              <input v-model="filtros.forma_de_pago" class="form-control form-control-sm shadow-none py-2" placeholder="Forma de pago...">
            </div>
            <div class="col-6 col-md-3">
              <input v-model="filtros.cuit" class="form-control form-control-sm shadow-none py-2" placeholder="Filtrar por CUIT...">
            </div>
            <div class="col-12 col-md-3">
              <input v-model="filtros.condicion" class="form-control form-control-sm shadow-none py-2" placeholder="Filtrar por Condición IVA...">
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- SPINNER DE CARGA -->
          <div v-if="cargando" class="text-center p-5 bg-white">
            <span class="spinner-border text-danger" style="width: 3rem; height: 3rem;"></span>
            <p class="text-muted mt-3 fw-bold">Cargando datos...</p>
          </div>

          <template v-else>
            <!-- TABLA (Solo Escritorio) -->
            <div class="d-none d-md-block table-responsive border rounded shadow-sm tabla-sin-lineas">
              <table class="table table-hover align-middle mb-0 text-nowrap" style="font-size: 0.85rem;">
                <thead class="table-light">
                  <tr>
                    <th class="py-3 ps-3 text-uppercase text-muted" style="width: 30%;">Institución / Club</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 15%;">Forma de Pago</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 15%;">CUIT</th>
                    <th class="py-3 text-uppercase text-muted" style="width: 20%;">Condición IVA</th>
                    <th class="py-3 text-center text-uppercase text-muted pe-3" style="width: 20%;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="i in institucionesPaginadas" :key="i.id">
                    <td class="ps-3 text-dark fw-bold text-truncate" :title="i.club">{{ i.club }}</td>
                    <td class="text-dark">
                      <span v-if="i.forma_de_pago" class="badge bg-info-subtle text-primary border">{{ i.forma_de_pago }}</span>
                      <span v-else>-</span>
                    </td>
                    <td class="text-muted">{{ i.cuit || '-' }}</td>
                    <td class="text-muted">{{ i.condicion || '-' }}</td>
                    <td class="text-center pe-3">

                      <!-- Acciones en Escritorio (Solo Iconos) -->
                      <div class="d-flex justify-content-center gap-1">
                        <button v-if="i.cuit && i.cuit !== 'NULL'" @click="copiarAlPortapapeles(i.cuit, 'CUIT')" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" title="Copiar CUIT">
                          <span class="material-icons" style="font-size:16px;">content_copy</span>
                        </button>

                        <template v-if="i.email && i.email !== 'NULL' && i.email.trim() !== ''">
                          <button @click="enviarFactura(i.email)" class="btn btn-primary btn-sm shadow-sm rounded p-1" title="Enviar Email">
                            <span class="material-icons" style="font-size:16px;">send</span>
                          </button>
                          <button @click="copiarAlPortapapeles(i.email, 'Email')" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" title="Copiar Email">
                            <span class="material-icons" style="font-size:16px;">content_copy</span>
                          </button>
                        </template>

                        <template v-if="i.celular && i.celular !== 'NULL' && i.celular.trim() !== ''">
                          <button @click="enviarWhatsapp(i.celular)" class="btn btn-sm shadow-sm text-white rounded p-1" style="background-color: #25D366;" title="WhatsApp">
                            <span class="material-icons" style="font-size:16px;">chat</span>
                          </button>
                          <button @click="copiarAlPortapapeles(i.celular, 'Celular')" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-dark" title="Copiar Celular">
                            <span class="material-icons" style="font-size:16px;">phonelink_ring</span>
                          </button>
                        </template>

                        <span v-if="(!i.email || i.email === 'NULL') && (!i.celular || i.celular === 'NULL') && (!i.cuit || i.cuit === 'NULL')" class="text-muted small fst-italic">
                          Sin contacto
                        </span>
                      </div>

                    </td>
                  </tr>
                  <tr v-if="institucionesPaginadas.length === 0">
                    <td colspan="5" class="py-5 text-center text-muted border-0 bg-white">
                      <span class="material-icons d-block fs-1 mb-2">business</span>
                      <p class="m-0 fw-bold">No se encontraron instituciones.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- CARDS (Solo Celular) -->
            <div class="d-md-none p-3 bg-light">
              <div v-for="i in institucionesPaginadas" :key="'mob-'+i.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
                <div class="card-header bg-white border-bottom-0 pb-2 px-3 pt-3 d-flex justify-content-between align-items-start rounded-top-3">
                  <div class="text-dark fw-bold d-flex align-items-center gap-2" style="font-size: 1.05rem;">
                    <span class="material-icons text-primary" style="font-size: 20px;">domain</span>
                    {{ i.club }}
                  </div>
                </div>

                <div class="card-body pt-0 px-3 pb-3">
                  <div class="d-flex flex-column gap-2 bg-light p-2 rounded border mb-3 border-light-subtle">
                    <div class="d-flex justify-content-between">
                      <span class="text-dark small"><strong>CUIT:</strong> {{ i.cuit || '-' }}</span>
                      <span class="text-dark small"><strong>IVA:</strong> {{ i.condicion || '-' }}</span>
                    </div>
                    <div class="d-flex justify-content-between border-top pt-2 mt-1 border-light-subtle">
                      <span class="text-dark small"><strong>Pago:</strong> <span class="badge bg-info-subtle text-primary">{{ i.forma_de_pago || '-' }}</span></span>
                    </div>
                  </div>

                  <!-- Botones Originales Móvil -->
                  <div class="row g-2 justify-content-center">

                    <div class="col-12" v-if="i.cuit && i.cuit !== 'NULL'">
                      <button @click="copiarAlPortapapeles(i.cuit, 'CUIT')" class="btn btn-sm btn-light border w-100 d-flex align-items-center justify-content-center gap-1 fw-bold text-dark py-2">
                        <span class="material-icons" style="font-size: 16px;">content_copy</span> Copiar CUIT
                      </button>
                    </div>

                    <template v-if="i.email && i.email !== 'NULL' && i.email.trim() !== ''">
                      <div class="col-6">
                        <button @click="enviarFactura(i.email)" class="btn btn-sm btn-primary shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2">
                          <span class="material-icons" style="font-size: 16px;">send</span> Email
                        </button>
                      </div>
                      <div class="col-6">
                        <button @click="copiarAlPortapapeles(i.email, 'Email')" class="btn btn-sm btn-light border shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2">
                          <span class="material-icons" style="font-size: 16px;">content_copy</span> Email
                        </button>
                      </div>
                    </template>

                    <template v-if="i.celular && i.celular !== 'NULL' && i.celular.trim() !== ''">
                      <div class="col-6">
                        <button @click="enviarWhatsapp(i.celular)" class="btn btn-sm text-white shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2" style="background-color: #25D366;">
                          <span class="material-icons" style="font-size: 16px;">chat</span> WhatsApp
                        </button>
                      </div>
                      <div class="col-6">
                        <button @click="copiarAlPortapapeles(i.celular, 'Celular')" class="btn btn-sm btn-light border shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2">
                          <span class="material-icons" style="font-size: 16px;">phonelink_ring</span> Celular
                        </button>
                      </div>
                    </template>

                    <div class="col-12 text-center mt-2" v-if="(!i.email || i.email === 'NULL') && (!i.celular || i.celular === 'NULL') && (!i.cuit || i.cuit === 'NULL')">
                      <span class="text-muted small fst-italic">Sin contacto</span>
                    </div>

                  </div>
                </div>
              </div>

              <div v-if="institucionesPaginadas.length === 0" class="text-center p-4 bg-white rounded-3 shadow-sm border border-light-subtle mt-2">
                <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 40px;">business</span>
                <p class="text-muted mt-2 mb-0 fw-bold">Sin resultados</p>
              </div>
            </div>

            <!-- PAGINACIÓN -->
            <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
                <i class="bi bi-chevron-left"></i> Ant
              </button>
              <span class="fw-bold text-dark small">
                Página {{ paginaActual }} de {{ totalPaginas }}
              </span>
              <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
                Sig <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </template>

        </div>
      </div>

      <!-- Alerta de contacto original restaurada -->
      <div class="alert alert-secondary mt-4 border-0 shadow-sm mx-auto w-100" style="border-radius: 12px;">
        <div class="d-flex align-items-center">
          <i class="bi bi-info-square-fill me-3 fs-3 text-secondary opacity-75"></i>
          <div class="small text-dark lh-sm">
            Consultas a <a href="mailto:facturas@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none">facturas@arbitroshandball.com.ar</a>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch, inject } from 'vue';
import { api } from '@/api/api';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Instituciones y CUITs | AAAB',
  meta: [
    { name: 'description', content: 'Accedé al listado de instituciones y CUITs para realizar la facturación.' },
    { property: 'og:title', content: 'Instituciones y CUITs | AAAB' },
    { property: 'og:description', content: 'Accedé al listado de instituciones y CUITs para realizar la facturación.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
});

const notificar = inject('notificar');

const instituciones = ref([]);
const mostrarFiltrosMobile = ref(false);
const cargando = ref(false);

const filtros = reactive({
  club: '', forma_de_pago: '', cuit: '', condicion: ''
});

const paginaActual = ref(1);
const registrosPorPagina = 7;

const limpiarFiltros = () => {
  filtros.club = '';
  filtros.forma_de_pago = '';
  filtros.cuit = '';
  filtros.condicion = '';
};

const cargarDatos = async () => {
  cargando.value = true;
  try {
    const res = await api.get({
      entity: 'facturacion',
      action: 'getInstitucionesCuit',
      payload: {}
    });
    instituciones.value = res.payload;
  } catch (err) {
    console.error("Error al cargar instituciones:", err);
  } finally {
    cargando.value = false;
  }
};

const copiarAlPortapapeles = async (texto, etiqueta) => {
  if (!texto || texto === 'NULL' || texto.trim() === '') return;
  try {
    await navigator.clipboard.writeText(texto.trim());
    notificar({ titulo: 'Copiado', mensaje: `${etiqueta} copiado: ${texto}`, tipo: 'success' });
  } catch (err) {
    console.error('Error al copiar:', err);
    notificar({ titulo: 'Error', mensaje: 'No se pudo copiar el texto', tipo: 'danger' });
  }
};

const enviarFactura = (emailClub) => {
  if (!emailClub || String(emailClub).toUpperCase() === 'NULL' || emailClub.trim() === '') return;
  const destinatario = emailClub.trim();
  const cc = "aaabfacturas@gmail.com";
  const subject = "Envío de Factura - Arbitraje AAAB";
  const body = "Estimados,\n\nAdjuntamos la factura correspondiente.\n\nSaludos cordiales.";
  const mailtoLink = `mailto:${destinatario}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.open(mailtoLink, '_self');
};

const enviarWhatsapp = (celular) => {
  if (!celular || celular === 'NULL' || celular.trim() === '') return;
  const numeroLimpio = String(celular).replace(/\D/g, '');
  const mensaje = encodeURIComponent("Hola, ¿Cómo estás? Me comunico por el envío de facturación de arbitraje de Handball.");
  const prefijo = numeroLimpio.startsWith('54') ? numeroLimpio : `54${numeroLimpio}`;
  window.open(`https://wa.me/${prefijo}?text=${mensaje}`, '_blank');
};

const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const filtrados = computed(() => {
  const listaFiltrada = instituciones.value.filter(i => {
    const matchClub = normalizarTexto(i.club).includes(normalizarTexto(filtros.club));
    const matchPago = normalizarTexto(i.forma_de_pago).includes(normalizarTexto(filtros.forma_de_pago));
    const matchCuit = normalizarTexto(i.cuit).includes(normalizarTexto(filtros.cuit));
    const matchCondicion = normalizarTexto(i.condicion).includes(normalizarTexto(filtros.condicion));
    return matchClub && matchPago && matchCuit && matchCondicion;
  });

  return listaFiltrada.sort((a, b) => {
    return (a.club || '').localeCompare(b.club || '');
  });
});

const totalPaginas = computed(() => Math.ceil(filtrados.value.length / registrosPorPagina) || 1);

const institucionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return filtrados.value.slice(inicio, inicio + registrosPorPagina);
});

const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

watch(filtros, () => { paginaActual.value = 1; }, { deep: true });

watch(totalPaginas, (nuevoTotal) => {
  if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal;
});

onMounted(cargarDatos);
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  margin-left: 50%;
  transform: translateX(-50%);
  padding-bottom: 120px;
}

.admin-panel {
  width: 100%;
  background-color: #0f172a;
  min-height: 100vh;
  border-radius: 12px;
}

.animate__animated { animation-duration: 0.5s; }

/* ====================================================
   TABLA SIN LÍNEAS
   ==================================================== */
.tabla-sin-lineas th,
.tabla-sin-lineas td {
  border-left: none !important;
  border-right: none !important;
}
</style>
