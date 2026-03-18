<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { api } from '@/api/api'; 

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
    instituciones.value = res.payload;
  } catch (err) { 
    console.error("Error al cargar instituciones:", err); 
  }
};

const copiarAlPortapapeles = async (texto, etiqueta) => {
  if (!texto || texto === 'NULL' || texto.trim() === '') return;
  try {
    await navigator.clipboard.writeText(texto.trim());
    alert(`${etiqueta} copiado: ${texto}`);
  } catch (err) {
    console.error('Error al copiar:', err);
  }
};

const enviarFactura = (emailClub) => {
  if (!emailClub || emailClub === 'NULL' || emailClub.trim() === '') {
    alert("Esta institución no tiene un email válido registrado.");
    return;
  }
  
  const destinatario = emailClub.trim();
  const cc = "facturas@arbitroshandball.com.ar";
  const subject = "Envío de Factura - Arbitraje AAAB";
  const body = "Estimados,\n\nAdjuntamos la factura correspondiente.\n\nSaludos cordiales.";
  
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
        <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-filter-icon btn-blue mobile-only-flex">
          <span class="material-icons">filter_alt</span>
        </button>
        <button @click="limpiarFiltros" class="btn-filter-icon btn-gray">
          <span class="material-icons">filter_alt_off</span>
        </button>
      </div>
    </div>

    <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only shadow">
      <div class="filter-container-mobile">
        <label class="filter-label">Filtrar por Club</label>
        <input v-model="filtros.club" placeholder="Nombre de la institución..." class="mobile-input">
      </div>
      <button @click="mostrarFiltrosMobile = false" class="btn-close-filters">Ver Resultados</button>
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
          <tr v-for="i in filtrados" :key="i.id" class="row-hover">
            <td class="font-bold">{{ i.club }}</td>
            <td>{{ i.cuit || '-' }}</td> 
            <td><small>{{ i.condicion || '-' }}</small></td>
            <td class="text-center">
              <div class="actions-wrapper">
                <button v-if="i.email && i.email !== 'NULL'" @click="enviarFactura(i.email)" class="btn-email" title="Enviar E-mail">
                  <span class="material-icons">send</span>
                </button>
                <button v-if="i.email && i.email !== 'NULL'" @click="copiarAlPortapapeles(i.email, 'Email')" class="btn-copy" title="Copiar Email">
                  <span class="material-icons">content_copy</span>
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
              <b>CUIT:</b> {{ i.cuit || 'N/A' }}<br>
              <small>{{ i.condicion || 'Sin condición' }}</small>
            </div>
            <div class="card-actions-mobile">
                <button v-if="i.cuit && i.cuit !== 'NULL'" @click="copiarAlPortapapeles(i.cuit, 'CUIT')" class="btn-copy-mobile">
                  <span class="material-icons">content_copy</span> Copiar CUIT
                </button>
                <button v-if="i.email && i.email !== 'NULL'" @click="copiarAlPortapapeles(i.email, 'Email')" class="btn-copy-mobile">
                  <span class="material-icons">content_copy</span> Copiar E.mail
                </button>
                <button v-if="i.email && i.email !== 'NULL'" @click="enviarFactura(i.email)" class="btn-copy-mobile btn-send-mobile">
                  <span class="material-icons">send</span> Enviar E-mail
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-panel { padding: 15px; background: #f8fafc; font-family: sans-serif; color: #334155; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #3b82f6; align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #1e293b; }
.counter { font-size: 0.85rem; color: #64748b; }

.header-actions { display: flex; gap: 10px; }

.btn-filter-icon {
  border: none;
  width: 42px;
  height: 52px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-blue {
  background-color: #3b82f6;
  color: white;
}

.btn-gray {
  background-color: #e9ecef;
  color: #000;
}

.btn-filter-icon .material-icons {
  font-size: 24px;
}

.btn-filter-icon:hover {
  opacity: 0.8;
}

/* Mobile Filters Panel */
.mobile-filter-panel { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e2e8f0; }
.filter-container-mobile { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
.filter-label { font-size: 0.8rem; font-weight: bold; color: #64748b; }
.mobile-input { padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; background-color: #fbfcfd; outline: none; }
.btn-close-filters { width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; }

/* Table styling */
.table-container { background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; }
td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.row-hover:hover { background-color: #f1f5f9; transition: background 0.2s ease; }

.filter-row td { background: #f8fafc; padding: 8px; }
.filter-input { width: 90%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; }

/* Desktop Actions */
.actions-wrapper { display: flex; gap: 8px; justify-content: center; }
.btn-email { background: #10b981; color: white; border: none; width: 35px; height: 35px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-copy { background: #e2e8f0; color: #475569; border: none; width: 35px; height: 35px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* Mobile Cards View */
.card-contacto { background: white; padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0; }
.card-name { font-weight: bold; font-size: 1rem; color: #1e293b; }
.card-subtext { font-size: 0.8rem; color: #64748b; margin: 8px 0 12px 0; }
.card-actions-mobile { display: flex; flex-wrap: wrap; gap: 6px; }
.btn-copy-mobile { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 8px 10px; border-radius: 6px; font-size: 0.7rem; display: flex; align-items: center; gap: 4px; color: #475569; font-weight: bold; }
.btn-send-mobile { background: #10B981; color: white; border: none; }

/* Visibility Classes */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .mobile-only-flex { display: flex !important; }
}
</style>
