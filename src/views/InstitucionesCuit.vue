
<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import api from '@api/api'; 

const instituciones = ref([]);
const mostrarFiltrosMobile = ref(false);

const filtros = reactive({
  club: '', 
  cuit: '', 
  condicion: ''
});

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
    
   
    if (Array.isArray(res)) {
      instituciones.value = res;
    } else if (res && Array.isArray(res.data)) {
      instituciones.value = res.data;
    } else {
      instituciones.value = [];
    }
  } catch (err) { 
    console.error("Error al cargar instituciones:", err); 
  }
};

// --- LÓGICA COPIAR ---
const copiarAlPortapapeles = async (texto, etiqueta) => {
  if (!texto || texto === 'NULL' || texto.trim() === '') return;
  try {
    await navigator.clipboard.writeText(texto.trim());
    alert(`${etiqueta} copiado: ${texto}`);
  } catch (err) {
    console.error('Error al copiar:', err);
  }
};

// --- LÓGICA EMAIL FACTURA ---
const enviarFactura = (emailClub) => {
  if (!emailClub || emailClub === 'NULL' || emailClub.trim() === '') {
    alert("Esta institución no tiene un email válido registrado.");
    return;
  }
  
  const destinatario = emailClub.trim();
  const cc = "facturas@arbitroshandball.com.ar";
  const subject = "Envío de Factura - Árbitraje AAAB";
  const body = "Estimados,\n\nAdjuntamos la factura correspondiente.\n\nSaludos cordiales.";
  
  // Construcción del enlace mailto
  const mailtoLink = `mailto:${destinatario}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.location.href = mailtoLink;
};

const normalizarTexto = (valor) => {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const filtrados = computed(() => {
  return instituciones.value.filter(i => {
    // Filtramos por Club, Cuit y Condicion
    const matchClub = normalizarTexto(i.club).includes(normalizarTexto(filtros.club));
    const matchCuit = normalizarTexto(i.cuit).includes(normalizarTexto(filtros.cuit));
    const matchCondicion = normalizarTexto(i.condicion).includes(normalizarTexto(filtros.condicion));
    
    return matchClub && matchCuit && matchCondicion;
  });
});

onMounted(cargarDatos);
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  
  <div class="admin-panel">
    <div class="header-section">
      <div class="header-title-box">
        <h2 class="title">Instituciones y CUITs</h2>
        <span class="counter">{{ filtrados.length }} encontradas</span>
      </div>
      <div class="header-actions">
        <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-filter-mobile mobile-only">
          <span class="material-icons">filter_alt</span>
        </button>
        <button @click="limpiarFiltros" class="btn-action btn-clear">
          <span class="material-icons">filter_alt_off</span> 
          <span class="btn-text">Limpiar</span>
        </button>
      </div>
    </div>

    <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only shadow">
      <div class="filter-grid-mobile">
        <input v-model="filtros.club" placeholder="Club..">
        <input v-model="filtros.cuit" placeholder="CUIT..">
        <input v-model="filtros.condicion" placeholder="Condición..">
      </div>
      <button @click="mostrarFiltrosMobile = false" class="btn-close-filters">Ver Lista</button>
    </div>

    <div class="table-container shadow desktop-only">
      <table>
        <thead>
          <tr>
            <th>Institución / Club</th>
            <th>CUIT</th>
            <th>Condición IVA</th>
            <th class="text-center">Acciones</th>
          </tr>
          <tr class="filter-row">
            <td><input v-model="filtros.club" class="filter-input" placeholder="Filtrar club..."></td>
            <td><input v-model="filtros.cuit" class="filter-input" placeholder="Filtrar CUIT..."></td>
            <td><input v-model="filtros.condicion" class="filter-input" placeholder="Filtrar condición..."></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in filtrados" :key="i.id">
            <td class="font-bold">{{ i.club }}</td>
            <td>
              <div class="cell-with-copy">
                {{ i.cuit }}
                <button v-if="i.cuit && i.cuit !== 'NULL'" @click="copiarAlPortapapeles(i.cuit, 'CUIT')" class="btn-mini-copy">
                  <span class="material-icons">content_copy</span>
                </button>
              </div>
            </td>
            <td><small>{{ i.condicion || '-' }}</small></td>
            <td class="text-center">
              <div class="actions-wrapper">
                <button v-if="i.email && i.email !== 'NULL'" @click="enviarFactura(i.email)" class="btn-email" title="Enviar Factura">
                  <span class="material-icons">picture_as_pdf</span>
                </button>
                <button v-if="i.email && i.email !== 'NULL'" @click="copiarAlPortapapeles(i.email, 'Email')" class="btn-copy" title="Copiar Email">
                  <span class="material-icons">mail_outline</span>
                </button>
                <span v-else class="no-data">Sin email</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-only">
      <div v-for="i in filtrados" :key="'mob-'+i.id" class="card-contacto">
        <div class="card-main">
          <div class="card-info">
            <div class="card-name">{{ i.club }}</div>
            <div class="card-subtext">
              <b>CUIT:</b> {{ i.cuit }}<br>
              <small>{{ i.condicion }}</small>
            </div>
            <div class="card-actions-mobile">
                <button v-if="i.cuit && i.cuit !== 'NULL'" @click="copiarAlPortapapeles(i.cuit, 'CUIT')" class="btn-copy-mobile">
                  <span class="material-icons">fingerprint</span> CUIT
                </button>
                <button v-if="i.email && i.email !== 'NULL'" @click="copiarAlPortapapeles(i.email, 'Email')" class="btn-copy-mobile">
                  <span class="material-icons">content_copy</span> Email
                </button>
            </div>
          </div>
          <button v-if="i.email && i.email !== 'NULL'" @click="enviarFactura(i.email)" class="btn-email-circle">
            <span class="material-icons">send</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Se mantienen tus estilos base que son excelentes para el dashboard */
.admin-panel { padding: 15px; background: #f8fafc; font-family: sans-serif; color: #000; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #3b82f6; align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #1e293b; }
.counter { font-size: 0.85rem; color: #64748b; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.8rem; }
.btn-clear { background: #f1f5f9; color: #475569; }
.btn-filter-mobile { background: #3b82f6; color: white; }

.table-container { background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; }
td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.filter-row td { background: #f8fafc; padding: 8px; }
.filter-input { width: 90%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; }

.actions-wrapper { display: flex; gap: 8px; justify-content: center; }
.cell-with-copy { display: flex; align-items: center; gap: 5px; }
.btn-mini-copy { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 0; display: flex; }
.btn-mini-copy .material-icons { font-size: 16px; }

.btn-email { background: #ef4444; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-copy { background: #e2e8f0; color: #475569; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.card-contacto { background: white; padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0; }
.card-main { display: flex; justify-content: space-between; align-items: center; }
.card-name { font-weight: bold; font-size: 0.95rem; color: #1e293b; }
.card-subtext { font-size: 0.75rem; color: #64748b; margin: 5px 0; }
.card-actions-mobile { display: flex; gap: 5px; margin-top: 8px; }
.btn-email-circle { background: #ef4444; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.btn-copy-mobile { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 5px 8px; border-radius: 6px; font-size: 0.7rem; display: flex; align-items: center; gap: 4px; color: #475569; }

.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
}
</style>