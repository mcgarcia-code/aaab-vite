<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

     <div class="card shadow border-0 w-100 mx-auto" style="border-radius: 15px; overflow: hidden; margin-bottom: 1.5rem;">
        
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div>
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2">
              <i class="bi bi-building me-1"></i> Instituciones y CUITs
            </h4>
            <p class="text-muted small m-0 mt-1">Total: {{ filtrados.length }} instituciones encontradas</p>
          </div>
          
          <div class="header-actions d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex shadow-sm rounded border-0 p-2 align-items-center justify-content-center text-white" style="background-color: #3b82f6;">
              <span class="material-icons" style="font-size: 20px;">filter_alt</span>
            </button>
            
            <button @click="limpiarFiltros" class="btn-clear bg-light rounded shadow-sm border p-2 d-flex align-items-center justify-content-center gap-2" title="Limpiar Filtros" style="background-color: #f8fafc !important; border-color: #e2e8f0 !important; transition: all 0.2s;">
              <span class="material-icons" style="font-size: 22px; color: #64748b;">filter_alt_off</span>
              <span class="btn-text desktop-only fw-bold text-secondary" style="font-size: 0.8rem;">Limpiar Filtros</span>
            </button>
          </div>
        </div>

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster shadow-sm border-bottom p-3" style="background-color: #f8fafc; margin-bottom: 0; border-radius: 0;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-muted text-uppercase">Filtrar por Club</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1 shadow-sm" style="line-height: 1; background: white;">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>
          <div class="filter-container-mobile mb-3">
            <input v-model="filtros.club" placeholder="Nombre de la institución..." class="mobile-input w-100 p-2 border rounded shadow-sm">
          </div>
          <div>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 fw-bold border-0 py-2 shadow-sm" style="background-color: #3b82f6;">Aplicar Filtros</button>
          </div>
        </div>

        <div class="card-body bg-white p-3 p-md-4">
          
          <div class="table-container shadow-sm desktop-only border" style="border-radius: 8px;">
            <table>
              <thead>
                <tr>
                  <th class="col-institucion">INSTITUCIÓN / CLUB</th>
                  <th>CUIT</th>
                  <th>CONDICIÓN IVA</th>
                  <th class="text-center">ACCIONES</th>
                </tr>
                <tr class="filter-row">
                  <td><input v-model="filtros.club" class="filter-input shadow-none" placeholder="Filtrar club..."></td>
                  <td><input v-model="filtros.cuit" class="filter-input shadow-none" placeholder="Filtrar CUIT..."></td>
                  <td><input v-model="filtros.condicion" class="filter-input shadow-none" placeholder="Filtrar condición..."></td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="i in institucionesPaginadas" :key="i.id" class="row-hover">
                  <td class="font-bold col-institucion fw-bold text-dark">{{ i.club }}</td>
                  <td>{{ i.cuit || '-' }}</td> 
                  <td><small>{{ i.condicion || '-' }}</small></td>
                  <td class="text-center">
                    <div class="actions-wrapper">
                      <template v-if="i.email && i.email !== 'NULL' && i.email.trim() !== ''">
                        <button @click="enviarFactura(i.email)" class="btn-email shadow-sm" title="Enviar E-mail">
                          <span class="material-icons" style="font-size: 18px;">send</span>
                        </button>
                        <button @click="copiarAlPortapapeles(i.email, 'Email')" class="btn-copy shadow-sm" title="Copiar Email">
                          <span class="material-icons" style="font-size: 18px;">content_copy</span>
                        </button>
                      </template>

                      <template v-if="i.celular && i.celular !== 'NULL' && i.celular.trim() !== ''">
                        <button @click="enviarWhatsapp(i.celular)" class="btn-whatsapp shadow-sm" title="Enviar WhatsApp">
                          <span class="material-icons" style="font-size: 18px;">chat</span>
                        </button>
                        <button @click="copiarAlPortapapeles(i.celular, 'Celular')" class="btn-copy shadow-sm" title="Copiar Celular">
                          <span class="material-icons" style="font-size: 18px;">phonelink_ring</span>
                        </button>
                      </template>

                      <span v-if="(!i.email || i.email === 'NULL') && (!i.celular || i.celular === 'NULL')" class="no-data">
                        Sin contacto
                      </span>
                    </div>
                  </td>
                </tr>
                <tr v-if="institucionesPaginadas.length === 0">
                  <td colspan="4" class="text-center py-5 text-muted">No se encontraron instituciones con esos filtros.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mt-3">
            <div v-for="i in institucionesPaginadas" :key="'mob-'+i.id" class="card-contacto">
              <div class="card-main">
                <div class="card-info">
                  <div class="card-name">{{ i.club }}</div>
                  <div class="card-subtext">
                    <b>CUIT:</b> {{ i.cuit || 'N/A' }}<br>
                    <small>{{ i.condicion || 'Sin condición' }}</small>
                  </div>
                  <div class="card-actions-mobile">
                      <button v-if="i.cuit && i.cuit !== 'NULL'" @click="copiarAlPortapapeles(i.cuit, 'CUIT')" class="btn-copy-mobile">
                        <span class="material-icons" style="font-size: 18px;">content_copy</span> Copiar CUIT
                      </button>

                      <template v-if="i.email && i.email !== 'NULL' && i.email.trim() !== ''">
                        <button @click="copiarAlPortapapeles(i.email, 'Email')" class="btn-copy-mobile">
                          <span class="material-icons" style="font-size: 18px;">content_copy</span> Copiar Email
                        </button>
                        <button @click="enviarFactura(i.email)" class="btn-copy-mobile btn-send-mobile">
                          <span class="material-icons" style="font-size: 18px;">send</span> Enviar Email
                        </button>
                      </template>

                      <template v-if="i.celular && i.celular !== 'NULL' && i.celular.trim() !== ''">
                        <button @click="copiarAlPortapapeles(i.celular, 'Celular')" class="btn-copy-mobile">
                          <span class="material-icons" style="font-size: 18px;">content_copy</span> Copiar Celular
                        </button>
                        <button @click="enviarWhatsapp(i.celular)" class="btn-copy-mobile btn-whatsapp-mobile">
                          <span class="material-icons" style="font-size: 18px;">chat</span> WhatsApp
                        </button>
                      </template>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="institucionesPaginadas.length === 0" class="text-center py-4 text-muted small border rounded bg-light">
              No se encontraron instituciones.
            </div>
          </div>

<div 
  class="d-flex justify-content-center align-items-center gap-3 mt-4"
  v-if="totalPaginas > 1"
>

  <!-- ANTERIOR -->
  <button
    class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
    @click="cambiarPagina(-1)"
    :disabled="paginaActual <= 1"
  >
    <i class="bi bi-chevron-left"></i> Ant
  </button>

  <!-- TEXTO -->
  <span class="fw-bold text-dark small">
    Página {{ paginaActual }} de {{ totalPaginas }}
  </span>

  <!-- SIGUIENTE -->
  <button
    class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
    @click="cambiarPagina(1)"
    :disabled="paginaActual >= totalPaginas"
  >
    Sig <i class="bi bi-chevron-right"></i>
  </button>

</div>

        </div>
      </div> 
      
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

const filtros = reactive({
  club: '', cuit: '', condicion: ''
});

// --- VARIABLES DE PAGINACIÓN ---
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

// --- CÁLCULOS DE PAGINACIÓN ---
const totalPaginas = computed(() => Math.ceil(filtrados.value.length / registrosPorPagina) || 1);

const institucionesPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return filtrados.value.slice(inicio, inicio + registrosPorPagina);
});

// --- NUEVA FUNCIÓN DE PAGINACIÓN CON SCROLL MÓVIL ---
const cambiarPagina = (delta) => {
  paginaActual.value += delta;
  
  setTimeout(() => {
    if (window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, 50);
};

// Reseteamos a la página 1 si el usuario escribe en un filtro
watch(filtros, () => { paginaActual.value = 1; }, { deep: true });

// Si al borrar se reducen las páginas y quedamos fuera de rango, ajustamos.
watch(totalPaginas, (nuevoTotal) => { 
  if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal;
});

onMounted(cargarDatos);
</script>

<style scoped>
/* ====================================================
   1. ESTRUCTURA BASE MAESTRA
   ==================================================== */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 0 20px 20px 20px; 
  padding-bottom: 120px;
}

.admin-panel { 
  width: 100%;
  max-width: 100%; 
  padding: 0 20px 20px 20px; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;  
  background-color: #0f172a; 
  min-height: 100vh;
  border-radius: 12px;
}

/* Cabecera Estándar (Por si el componente la usa) */
.header-section { 
    background: white; padding: 15px 25px; border-radius: 8px; 
    display: flex; justify-content: space-between; margin-bottom: 15px; 
    border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
    align-items: center; 
}
.header-info { display: flex; flex-direction: column; }
.header-actions { display: flex; gap: 8px; }
.btn-action, .btn-clear { border: none; cursor: pointer; }
.btn-clear:hover { background-color: #e2e8f0 !important; }
.btn-text { display: inline; }

.no-data { font-size: 0.75rem; color: #94a3b8; font-style: italic; }

/* ====================================================
   2. PAGINACIÓN
   ==================================================== */
.paginacion {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}
.btn-paginacion {
  border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a;
  padding: 8px 16px; border-radius: 6px; font-size: 0.8rem;
  font-weight: 700; cursor: pointer; transition: background 0.2s;
}
.btn-paginacion:hover:not(:disabled) { background: #e2e8f0; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: #0f172a; font-size: 0.85rem; font-weight: 600; }

/* ====================================================
   3. TABLA DESKTOP Y FILTROS
   ==================================================== */
.table-container { 
  width: 100%; overflow: auto; max-height: 75vh; background: white; 
}
table { width: 100%; border-collapse: collapse; font-size: 0.85rem; table-layout: fixed; min-width: 800px; }

th { 
  background: #f8fafc !important; padding: 12px 10px; position: sticky; 
  top: 0; z-index: 50; border-bottom: 2px solid #e2e8f0; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  font-size: 0.75rem; color: #000000; text-transform: uppercase; 
  font-weight: 800; text-align: left;
}
td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; color: #000;}

.col-institucion { width: 35%; } 
.row-hover:hover { background-color: #f1f5f9; transition: background 0.2s ease; }

.filter-row td { 
  position: sticky; top: 40px; z-index: 40; background: #f1F5F9 !important; 
  padding: 6px 10px 12px 10px; border-bottom: 4px solid #e2e8f0; 
}

.filter-input { 
  width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; 
  font-size: 0.8rem; border-radius: 4px; box-sizing: border-box;
}
.filter-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }

/* Botones Tabla Desktop */
.actions-wrapper { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.btn-email, .btn-whatsapp, .btn-copy { 
  border: none; width: 32px; height: 32px; border-radius: 6px; 
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s;
}
.btn-email { background: #3b82f6; color: white; }
.btn-whatsapp { background: #25D366; color: white; }
.btn-copy { background: #e2e8f0; color: #000000; }
.btn-email:hover, .btn-whatsapp:hover, .btn-copy:hover { opacity: 0.85; }

/* ====================================================
   4. CARDS MÓVILES (Estilos base)
   ==================================================== */
.card-contacto { 
  background: #ffffff; padding: 16px; border-radius: 12px; margin-bottom: 15px; 
  border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.card-name { font-weight: 800; font-size: 1.1rem; color: #1e293b; }
.card-subtext { font-size: 0.85rem; color: #64748b; margin: 8px 0 15px 0; line-height: 1.4; }

.card-actions-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-copy-mobile { 
  background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 5px; border-radius: 8px; 
  font-size: 0.75rem; display: flex; align-items: center; justify-content: center;
  gap: 6px; color: #0f172a; font-weight: 700; width: 100%;
}
.btn-send-mobile { background: #3b82f6; color: white; border: none; }
.btn-whatsapp-mobile { background: #25D366; color: white; border: none; }

/* ====================================================
   5. 📱 RESPONSIVE DESIGN (Tiered Layout)
   ==================================================== */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none !important; } 

/* Desktop */
@media (min-width: 769px) {
  .btn-text { display: inline; }
}

/* --- Laptops y Tablets Grandes (Hasta 1024px) --- */
@media (max-width: 1024px) {
    .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
    .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

/* --- Tablets y Móviles (Hasta 768px) --- */
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .mobile-only-flex { display: flex !important; }
  
  .admin-panel { padding: 10px; border-radius: 0; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
}

/* --- Smartphones (Hasta 600px - Estandarizado) --- */
@media (max-width: 600px) {
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto;
  margin-left: 50%;
  transform: translateX(-50%);
      /* Top en 0, pero conservando los 15px laterales originales para celulares */
  padding: 0 15px 20px 15px !important; 
  box-sizing: border-box !important;
}
    
    .admin-panel { 
      padding: 0 !important; 
      border-radius: 0; 
      box-sizing: border-box !important;
    }
    .header-section { 
        padding: 15px !important; flex-direction: column; 
        align-items: flex-start; text-align: left; gap: 15px; 
    }
    .header-info { width: 100%; display: flex; flex-direction: column; align-items: flex-start; }
    .header-info h4, h4 { font-size: 1.2rem !important; margin: 0; text-align: left; }
    
    .header-actions { 
        width: 100%; display: flex; flex-direction: row; 
        flex-wrap: wrap; justify-content: center; gap: 8px; 
    }
    .btn-action { 
        flex: none; width: 42px; height: 42px; padding: 0; 
        justify-content: center; align-items: center; border-radius: 6px; 
    }
    .btn-text { display: none !important; }
}
</style>