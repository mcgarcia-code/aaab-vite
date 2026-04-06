<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  
  <!-- ENVOLTORIO PARA CENTRADO Y PANTALLA COMPLETA (Igual que Gestión de Árbitros) -->
  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">
      
      <!-- CABECERA UNIFICADA -->
      <div class="header-section shadow-sm">
        <div class="header-info">
          <h2 class="title">Instituciones y CUITs</h2>
          <span class="counter">Total: {{ filtrados.length }} instituciones encontradas</span>
        </div>

        <div class="header-actions">
          <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex">
            <span class="material-icons">filter_alt</span>
          </button>
          <button @click="limpiarFiltros" class="btn-action btn-clear">
            <span class="material-icons">filter_alt_off</span>
            <span class="btn-text desktop-only">Limpiar Filtros</span>
          </button>
        </div>
      </div>

      <!-- PANEL MÓVIL -->
      <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only shadow-sm">
        <div class="filter-container-mobile">
          <label class="filter-label">Filtrar por Club</label>
          <input v-model="filtros.club" placeholder="Nombre de la institución..." class="mobile-input">
        </div>
        <button @click="mostrarFiltrosMobile = false" class="btn-close-filters">Ver Resultados</button>
      </div>

      <!-- TABLA DESKTOP -->
      <div class="table-container shadow desktop-only">
        <table>
          <thead>
            <tr>
              <th class="col-institucion">INSTITUCIÓN / CLUB</th>
              <th>CUIT</th>
              <th>CONDICIÓN IVA</th>
              <th class="text-center">ACCIONES</th>
            </tr>
            <tr class="filter-row">
              <td><input v-model="filtros.club" class="filter-input" placeholder="Filtrar club..."></td>
              <td><input v-model="filtros.cuit" class="filter-input" placeholder="Filtrar CUIT..."></td>
              <td><input v-model="filtros.condicion" class="filter-input" placeholder="Filtrar condición..."></td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            <!-- USAMOS institucionesPaginadas EN LUGAR DE filtrados -->
            <tr v-for="i in institucionesPaginadas" :key="i.id" class="row-hover">
              <td class="font-bold col-institucion">{{ i.club }}</td>
              <td>{{ i.cuit || '-' }}</td> 
              <td><small>{{ i.condicion || '-' }}</small></td>
              <td class="text-center">
                <div class="actions-wrapper">
                  <template v-if="i.email && i.email !== 'NULL' && i.email.trim() !== ''">
                    <button @click="enviarFactura(i.email)" class="btn-email" title="Enviar E-mail">
                      <span class="material-icons">send</span>
                    </button>
                    <button @click="copiarAlPortapapeles(i.email, 'Email')" class="btn-copy" title="Copiar Email">
                      <span class="material-icons">content_copy</span>
                    </button>
                  </template>

                  <template v-if="i.celular && i.celular !== 'NULL' && i.celular.trim() !== ''">
                    <button @click="enviarWhatsapp(i.celular)" class="btn-whatsapp" title="Enviar WhatsApp">
                      <span class="material-icons">chat</span>
                    </button>
                    <button @click="copiarAlPortapapeles(i.celular, 'Celular')" class="btn-copy" title="Copiar Celular">
                      <span class="material-icons">phonelink_ring</span>
                    </button>
                  </template>

                  <span v-if="(!i.email || i.email === 'NULL') && (!i.celular || i.celular === 'NULL')" class="no-data">
                    Sin contacto
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA MOBILE -->
      <div class="mobile-only">
        <!-- USAMOS institucionesPaginadas EN LUGAR DE filtrados -->
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
                    <span class="material-icons">content_copy</span> Copiar CUIT
                  </button>

                  <template v-if="i.email && i.email !== 'NULL' && i.email.trim() !== ''">
                    <button @click="copiarAlPortapapeles(i.email, 'Email')" class="btn-copy-mobile">
                      <span class="material-icons">content_copy</span> Copiar Email
                    </button>
                    <button @click="enviarFactura(i.email)" class="btn-copy-mobile btn-send-mobile">
                      <span class="material-icons">send</span> Enviar Email
                    </button>
                  </template>

                  <template v-if="i.celular && i.celular !== 'NULL' && i.celular.trim() !== ''">
                    <button @click="copiarAlPortapapeles(i.celular, 'Celular')" class="btn-copy-mobile">
                      <span class="material-icons">content_copy</span> Copiar Celular
                    </button>
                    <button @click="enviarWhatsapp(i.celular)" class="btn-copy-mobile btn-whatsapp-mobile">
                      <span class="material-icons">chat</span> WhatsApp
                    </button>
                  </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTROLES DE PAGINACIÓN -->
      <div class="paginacion" v-if="totalPaginas > 1">
        <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
        <span class="paginacion-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas">Siguiente</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'; // Agregamos watch
import { api } from '@/api/api'; 
import { useHead } from '@vueuse/head'

useHead({
  title: 'Instituciones y CUITs | AAAB',
  meta: [
    { name: 'description', content: 'Accedé al listado de instituciones y CUITs para realizar la facturación.' },
    { property: 'og:title', content: 'Instituciones y CUITs | AAAB' },
    { property: 'og:description', content: 'Accedé al listado de instituciones y CUITs para realizar la facturación.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const instituciones = ref([]);
const mostrarFiltrosMobile = ref(false);

const filtros = reactive({
  club: '', cuit: '', condicion: ''
});

// --- VARIABLES DE PAGINACIÓN ---
const paginaActual = ref(1);
const registrosPorPagina = 10;

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
  if (!emailClub || emailClub === 'NULL' || emailClub.trim() === '') return;
  const destinatario = emailClub.trim();
  const cc = "aaabfacturas@gmail.com";
  const subject = "Envío de Factura - Arbitraje AAAB";
  const body = "Estimados,\n\nAdjuntamos la factura correspondiente.\n\nSaludos cordiales.";
  const mailtoLink = `mailto:${destinatario}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
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

// Reseteamos a la página 1 si el usuario escribe en un filtro
watch(filtros, () => { paginaActual.value = 1; }, { deep: true });

// Si al borrar se reducen las páginas y quedamos fuera de rango, ajustamos.
watch(totalPaginas, (nuevoTotal) => { 
  if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal;
});

onMounted(cargarDatos);
</script>

<style scoped>
/* 1. ESTILOS BASE COPIADOS EXACTAMENTE DE "GESTIÓN DE ÁRBITROS" */
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh; /* Cambiamos height por min-height */
  height: auto;      /* Permitimos que crezca con el contenido */
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 80px; /* Damos un margen extra al final para separar bien del footer */
}

.admin-panel { 
  width: 100%;
  max-width: 100%; 
  padding: 20px; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;  
  background-color: #0f172a; 
  min-height: 100vh;
  height: 100%; /* Asegura que el panel cubra todo el wrapper */
}

.header-section { 
  background: white; 
  padding: 15px; 
  border-radius: 8px; 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 15px; 
  border-left: 5px solid #3b82f6; /* Color azul para esta vista */
  box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
  align-items: center; 
}

.header-info {
  display: flex;
  flex-direction: column;
}

.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #000000; }

.header-actions { display: flex; gap: 8px; }

/* Botones idénticos a Gestión de Árbitros adaptados para esta vista */
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }

/* CLASES DE PAGINACIÓN */
.paginacion {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.btn-paginacion {
  border: none;
  background: #f8fafc;
  color: #0f172a;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-paginacion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.paginacion-texto {
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}

/* 2. ESTILOS PROPIOS DE LA TABLA "INSTITUCIONES" */
.table-container { 
  width: 100%;
  overflow: auto; 
  max-height: 75vh; 
  background: white; 
  border-radius: 8px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
}

table { width: 100%; border-collapse: collapse; font-size: 0.85rem; table-layout: fixed; }

th { 
  background: #f8fafc !important; 
  padding: 10px; 
  position: sticky; 
  top: 0; 
  z-index: 50; 
  border-bottom: 2px solid #e2e8f0; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  font-size: 0.75rem; 
  color: #000000; 
  text-transform: uppercase; 
  font-weight: 800; 
  text-align: left;
}

td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; overflow: hidden; text-overflow: ellipsis; color: #000;}

/* Columna institución achicada */
.col-institucion { width: 25%; } 

.row-hover:hover { background-color: #f1f5f9; transition: background 0.2s ease; }

.filter-row td { 
  position: sticky; 
  top: 36px; /* Ajuste para el sticky del header */
  z-index: 40; 
  background: #f1F5F9 !important; 
  padding: 4px; 
  border-bottom: 2px solid #cbd5e1; 
}
.filter-input { width: 90%; padding: 4px; border: 1px solid #cbd5e1; font-size: 0.7rem; border-radius: 4px; }

/* Botones de Acciones en Tabla */
.actions-wrapper { display: flex; gap: 5px; justify-content: center; flex-wrap: wrap; }
.btn-email { background: #3b82f6; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-whatsapp { background: #25D366; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-copy { background: #e2e8f0; color: #000000; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* Mobile Cards View */
.mobile-filter-panel { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e2e8f0; }
.filter-container-mobile { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
.filter-label { font-size: 0.8rem; font-weight: bold; color: #64748b; }
.mobile-input { padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; background-color: #fbfcfd; outline: none; }
.btn-close-filters { width: 100%; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; }

/* --- TARJETAS MOBILE --- */
.card-contacto { 
  background: #ffffff; 
  padding: 16px; 
  border-radius: 12px; 
  margin-bottom: 15px; 
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); /* Sombreado suave */
  
  /* ESTO EVITA QUE EL LOGO DE FONDO SE SUPERPONGA */
  position: relative; 
  z-index: 20; 
}

.card-name { font-weight: 800; font-size: 1.1rem; color: #1e293b; }
.card-subtext { font-size: 0.85rem; color: #64748b; margin: 8px 0 15px 0; line-height: 1.4; }

/* --- GRILLA DE BOTONES MOBILE --- */
.card-actions-mobile { 
  display: grid; 
  grid-template-columns: 1fr 1fr; /* Fuerza a que haya exactamente 2 botones por fila */
  gap: 10px; 
}

.btn-copy-mobile { 
  background: #f8fafc; 
  border: 1px solid #cbd5e1; 
  padding: 10px 5px; 
  border-radius: 8px; 
  font-size: 0.75rem; 
  display: flex; 
  align-items: center; 
  justify-content: center; /* Centra el ícono y el texto */
  gap: 6px; 
  color: #0f172a; 
  font-weight: 700; 
  width: 100%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-send-mobile { 
  background: #3b82f6; 
  color: white; 
  border: none; 
}

.btn-whatsapp-mobile { 
  background: #25D366; 
  color: white; 
  border: none; 
}

/* Opcional: Hacer que los botones principales destaquen más si quedan impares */
.btn-whatsapp-mobile, .btn-send-mobile {
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.no-data { font-size: 0.75rem; color: #94a3b8; font-style: italic; }

/* Visibility Classes */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }

@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: space-between; flex-wrap: wrap; }
  .btn-action { flex: 1; justify-content: center; min-width: 45%; }
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .mobile-only-flex { display: flex !important; }
  .admin-panel { padding: 10px; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
}

@media (min-width: 768px) {
  .header-actions .btn-text { display: inline; }
}
</style>