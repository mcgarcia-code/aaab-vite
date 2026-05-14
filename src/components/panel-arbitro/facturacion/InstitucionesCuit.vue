<template>
  <div class="container-fluid py-0 animate__animated animate__fadeIn">

    <div class="card shadow border-0 w-100 mx-auto" style="border-radius: 15px; overflow: hidden; margin-bottom: 1.5rem;">

      <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
        <div>
          <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
            <i class="bi bi-building me-1"></i> Instituciones y CUITs
          </h4>
          <p class="text-muted small m-0 mt-1">Total: {{ filtrados.length }} instituciones encontradas</p>
        </div>

        <div class="header-actions d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
          <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex shadow-sm rounded border-0 p-2 align-items-center justify-content-center gap-1 text-white">
            <span class="material-icons" style="font-size: 20px;">filter_alt</span>
          </button>

          <button @click="limpiarFiltros" class="btn-clear bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center gap-2" title="Limpiar Filtros" style="background-color: #e2e8f0 !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
            <span class="material-icons" style="font-size: 22px; color: #000;">filter_alt_off</span>
            <span class="d-none d-md-inline fw-bold text-dark" style="font-size: 0.8rem;">Limpiar Filtros</span>
          </button>
        </div>
      </div>

      <!-- Panel Único de Filtros -->
      <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
        <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
          <span class="small fw-bold text-dark text-uppercase">Filtrar Instituciones</span>
          <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
        </div>

        <div class="row g-2">
          <div class="col-12 col-md-4">
            <input v-model="filtros.club" class="form-control form-control-sm shadow-none input-filtro-custom py-2" placeholder="Filtrar por club o institución...">
          </div>
          <div class="col-12 col-md-4">
            <input v-model="filtros.cuit" class="form-control form-control-sm shadow-none input-filtro-custom py-2" placeholder="Filtrar por CUIT...">
          </div>
          <div class="col-12 col-md-4">
            <input v-model="filtros.condicion" class="form-control form-control-sm shadow-none input-filtro-custom py-2" placeholder="Filtrar por Condición IVA...">
          </div>
          <div class="col-12 d-md-none mt-2">
            <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 fw-bold shadow-sm py-2">Aplicar Filtros</button>
          </div>
        </div>
      </div>

      <div class="card-body bg-white p-3 p-md-4">

        <!-- LISTA UNIFICADA -->
        <div class="border shadow-sm rounded overflow-hidden">

          <!-- Encabezado de Columnas (Solo Escritorio) -->
          <div class="row g-0 d-none d-md-flex bg-light border-bottom p-2 fw-bold text-uppercase" style="font-size: 0.75rem; color: #0f172a;">
            <div class="col-md-4 ps-3">Institución / Club</div>
            <div class="col-md-2">CUIT</div>
            <div class="col-md-3">Condición IVA</div>
            <div class="col-md-3 text-center pe-3">Acciones</div>
          </div>

          <div v-if="institucionesPaginadas.length === 0" class="text-center p-5 bg-light">
             <span class="material-icons text-muted opacity-50 d-block mb-3" style="font-size: 48px;">business</span>
             <h5 class="fw-bold text-dark mt-3">Sin resultados</h5>
             <p class="text-muted small m-0">No se encontraron instituciones con esos filtros.</p>
          </div>

          <div class="d-flex flex-column">
            <div v-for="i in institucionesPaginadas" :key="i.id" class="row g-0 align-items-center p-3 p-md-2 border-bottom bg-white item-institucion">

              <!-- HEADER MOBILE: Club + CUIT (Oculto en desktop) -->
              <div class="col-12 d-md-none mb-3 border-bottom pb-2">
                <div class="fw-bold text-dark fs-5 mb-1">{{ i.club }}</div>
                <div class="text-muted small"><b>CUIT:</b> {{ i.cuit || 'N/A' }}</div>
                <div class="text-muted small">{{ i.condicion || 'Sin condición' }}</div>
              </div>

              <!-- COL 1: CLUB (Escritorio) -->
              <div class="col-md-4 d-none d-md-block fw-bold text-dark ps-3 text-truncate" style="font-size: 0.85rem;">
                {{ i.club }}
              </div>

              <!-- COL 2: CUIT (Escritorio) -->
              <div class="col-md-2 d-none d-md-block text-muted" style="font-size: 0.85rem;">
                {{ i.cuit || '-' }}
              </div>

              <!-- COL 3: CONDICIÓN IVA (Escritorio) -->
              <div class="col-md-3 d-none d-md-block text-muted small text-truncate pe-2">
                {{ i.condicion || '-' }}
              </div>

              <!-- COL 4: ACCIONES (Ambos) -->
              <div class="col-12 col-md-3">
                <div class="row g-2 justify-content-md-center">

                  <div class="col-12 d-md-none" v-if="i.cuit && i.cuit !== 'NULL'">
                    <button @click="copiarAlPortapapeles(i.cuit, 'CUIT')" class="btn btn-sm btn-light border w-100 d-flex align-items-center justify-content-center gap-1 fw-bold text-dark py-2">
                      <span class="material-icons" style="font-size: 16px;">content_copy</span> Copiar CUIT
                    </button>
                  </div>

                  <template v-if="i.email && i.email !== 'NULL' && i.email.trim() !== ''">
                    <div class="col-6 col-md-auto">
                      <button @click="enviarFactura(i.email)" class="btn btn-sm btn-primary shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2 py-md-1 px-md-2">
                        <span class="material-icons" style="font-size: 16px;">send</span> <span class="d-md-none">Email</span>
                      </button>
                    </div>
                    <div class="col-6 col-md-auto">
                      <button @click="copiarAlPortapapeles(i.email, 'Email')" class="btn btn-sm btn-light border shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2 py-md-1 px-md-2">
                        <span class="material-icons" style="font-size: 16px;">content_copy</span> <span class="d-md-none">Email</span>
                      </button>
                    </div>
                  </template>

                  <template v-if="i.celular && i.celular !== 'NULL' && i.celular.trim() !== ''">
                    <div class="col-6 col-md-auto">
                      <button @click="enviarWhatsapp(i.celular)" class="btn btn-sm shadow-sm text-white w-100 d-flex align-items-center justify-content-center gap-1 py-2 py-md-1 px-md-2" style="background-color: #25D366; border-color: #25D366;">
                        <span class="material-icons" style="font-size: 16px;">chat</span> <span class="d-md-none">WhatsApp</span>
                      </button>
                    </div>
                    <div class="col-6 col-md-auto">
                      <button @click="copiarAlPortapapeles(i.celular, 'Celular')" class="btn btn-sm btn-light border shadow-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2 py-md-1 px-md-2">
                        <span class="material-icons" style="font-size: 16px;">phonelink_ring</span> <span class="d-md-none">Celular</span>
                      </button>
                    </div>
                  </template>

                  <div class="col-12 text-center" v-if="(!i.email || i.email === 'NULL') && (!i.celular || i.celular === 'NULL')">
                    <span class="text-muted small">Sin contacto</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div class="d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPaginas > 1">
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
            <i class="bi bi-chevron-left"></i> Ant
          </button>
          <span class="fw-bold text-dark small">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>
          <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
            Sig <i class="bi bi-chevron-right"></i>
          </button>
        </div>

      </div>
    </div>

    <!-- Alerta de contacto -->
    <div class="alert alert-secondary mt-4 border-0 shadow-sm mx-auto w-100" style="border-radius: 12px;">
      <div class="d-flex align-items-center">
        <i class="bi bi-info-square-fill me-3 fs-3 text-secondary opacity-75"></i>
        <div class="small text-dark lh-sm">
          Consultas a <a href="mailto:facturas@arbitroshandball.com.ar" class="text-danger fw-bold text-decoration-none">facturas@arbitroshandball.com.ar</a>
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

const filtros = reactive({
  club: '', cuit: '', condicion: ''
});

const paginaActual = ref(1);
const registrosPorPagina = 7;

const limpiarFiltros = () => {
  filtros.club = '';
  filtros.cuit = '';
  filtros.condicion = '';
};

const cargarDatos = async () => {
  try {
    const res = await api.get({
      entity: 'facturacion',
      action: 'getInstitucionesCuit',
      payload: {}
    });
    instituciones.value = res.payload;
  } catch (err) {
    console.error("Error al cargar instituciones:", err);
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
    const matchCuit = normalizarTexto(i.cuit).includes(normalizarTexto(filtros.cuit));
    const matchCondicion = normalizarTexto(i.condicion).includes(normalizarTexto(filtros.condicion));
    return matchClub && matchCuit && matchCondicion;
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
   BOTONES E INPUTS
   ==================================================== */
.btn-clear {
  border: none;
  cursor: pointer;
}
.btn-clear:hover {
  background-color: #cbd5e1 !important;
}

.input-filtro-custom {
  font-size: 1rem !important;
  height: auto !important;
}
.input-filtro-custom:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.15);
}

/* ====================================================
   EFECTO HOVER DE LA LISTA
   ==================================================== */
.item-institucion {
  transition: background-color 0.2s ease;
}
.item-institucion:hover {
  background-color: #f8fafc !important;
}

.animate__animated { animation-duration: 0.5s; }


</style>
