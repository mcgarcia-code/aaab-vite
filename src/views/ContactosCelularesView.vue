<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import { useHead } from '@vueuse/head'

// Título y descripción específicos para la página de contactos celulares de árbitros AAAB
useHead({
  title: 'Contactos Celulares | AAAB',
  meta: [
    {
      name: 'description',
      content: 'Lista de contactos celulares de árbitros AAAB.',
    },
        // --- ESTO ES LO QUE LEE WHATSAPP ---
    {
      property: 'og:title',
      content: 'Contactos Celulares | AAAB',
    },
    {
      property: 'og:description',
      content: 'Lista de contactos celulares de árbitros AAAB.',
    },
    {
      property: 'og:image',
      content: 'https://arbitroshandball.com.ar/logo.png', // Asegúrate que esta URL sea real
    },
    {
      property: 'og:type',
      content: 'website',
    }
  ],
})

const arbitros = ref([]);
const API_URL = 'https://arbitroshandball.com.ar/api/acciones.php'; 
const mostrarFiltrosMobile = ref(false);

// Filtros específicos
const filtros = reactive({
  apellido: '', 
  nombre: '', 
  grupo: '', 
  subgrupo: ''
});

const limpiarFiltros = () => Object.keys(filtros).forEach(k => filtros[k] = '');

const cargarDatos = async () => {
  try {
    const res = await axios.get(API_URL);
    arbitros.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) { 
    console.error("Error al cargar contactos:", err); 
  }
};

// --- LÓGICA WHATSAPP ---
const abrirWhatsApp = (numero) => {
  if (!numero) return;
  const limpio = String(numero).replace(/\D/g, '');
  const prefijo = limpio.startsWith('54') ? limpio : `54${limpio}`;
  window.open(`https://wa.me/${prefijo}`, '_blank');
};

// --- LÓGICA COPIAR ---
const copiarAlPortapapeles = async (numero) => {
  if (!numero) return;
  try {
    await navigator.clipboard.writeText(numero);
    alert('Copiado al portapapeles: ' + numero);
  } catch (err) {
    console.error('Error al copiar:', err);
  }
};

const normalizarTexto = (valor) => {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const arbitrosFiltrados = computed(() => {
  return arbitros.value.filter(a => {
    return Object.keys(filtros).every(key => {
      if (!filtros[key]) return true;
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });
  });
});

onMounted(cargarDatos);
</script>

<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  
  <div class="admin-panel">
    <div class="header-section">
      <div class="header-title-box">
        <h2 class="title">Agenda de Contactos AAAB</h2>
        <span class="counter">{{ arbitrosFiltrados.length }} personas encontradas</span>
      </div>
      <div class="header-actions">
        <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-filter-mobile mobile-only">
          <span class="material-icons">filter_alt</span>
        </button>
        <button @click="limpiarFiltros" class="btn-action btn-clear">
          <span class="material-icons">filter_alt_off</span> 
          <span class="btn-text">Limpiar Filtros</span>
        </button>
      </div>
    </div>

    <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only shadow">
      <div class="filter-grid-mobile">
        <input v-model="filtros.apellido" placeholder="Apellido..">
        <input v-model="filtros.nombre" placeholder="Nombre..">
        <input v-model="filtros.grupo" placeholder="Grupo..">
        <input v-model="filtros.subgrupo" placeholder="Sub-grupo..">
      </div>
      <button @click="mostrarFiltrosMobile = false" class="btn-close-filters">Ver Contactos</button>
    </div>

    <div class="table-container shadow desktop-only">
      <table>
        <thead>
          <tr>
            <th>Apellido</th>
            <th>Nombre</th>
            <th class="text-center">Grupo</th>
            <th class="text-center">Sub-Grupo</th>
            <th class="text-center">Acciones</th>
          </tr>
          <tr class="filter-row">
            <td><input v-model="filtros.apellido" class="filter-input" placeholder="Filtrar..."></td>
            <td><input v-model="filtros.nombre" class="filter-input" placeholder="Filtrar..."></td>
            <td><input v-model="filtros.grupo" class="filter-input-min" placeholder="G..."></td>
            <td><input v-model="filtros.subgrupo" class="filter-input-min" placeholder="S..."></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in arbitrosFiltrados" :key="a.id" :class="{'fila-ina': a.es_activo == 0}">
            <td class="font-bold">{{ a.apellido }}</td>
            <td class="font-bold">{{ a.nombre }}</td>
            <td class="text-center">{{ a.grupo || '-' }}</td>
            <td class="text-center">{{ a.subgrupo || '-' }}</td>
            <td class="text-center">
              <div class="actions-wrapper">
                <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa" title="WhatsApp">
                  <span class="material-icons">chat</span>
                </button>
                <button v-if="a.celular" @click="copiarAlPortapapeles(a.celular)" class="btn-copy" title="Copiar Número">
                  <span class="material-icons">content_copy</span>
                </button>
                <span v-else class="no-phone">Sin número</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-only">
      <div v-for="a in arbitrosFiltrados" :key="'mob-'+a.id" class="card-contacto" :class="{'fila-ina': a.es_activo == 0}">
        <div class="card-main">
          <div class="card-info">
            <div class="card-name">{{ a.apellido }}, {{ a.nombre }}</div>
            <div class="card-subtext">Grupo: {{ a.grupo || '-' }} | Sub: {{ a.subgrupo || '-' }}</div>
            <button v-if="a.celular" @click="copiarAlPortapapeles(a.celular)" class="btn-copy-mobile">
              <span class="material-icons">content_copy</span> {{ a.celular }}
            </button>
          </div>
          <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa-circle">
            <span class="material-icons">chat</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-panel { padding: 15px; background: #f8fafc; font-family: sans-serif; color: #000; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #25d366; align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #1e293b; }
.counter { font-size: 0.85rem; color: #64748b; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.8rem; }
.btn-clear { background: #f1f5f9; color: #475569; }
.btn-filter-mobile { background: #3b82f6; color: white; }

/* TABLA DESKTOP */
.table-container { background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; }
td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.filter-row td { background: #f8fafc; padding: 8px; }
.filter-input { width: 90%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; }
.filter-input-min { width: 60px; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; text-align: center; }

/* ACCIONES Y BOTONES */
.actions-wrapper { display: flex; gap: 8px; justify-content: center; }
.btn-wa { background: #25d366; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.3s; }
.btn-wa:hover { transform: scale(1.1); background: #128c7e; }

.btn-copy { background: #e2e8f0; color: #475569; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s; }
.btn-copy:hover { background: #cbd5e1; color: #1e293b; }

.no-phone { color: #94a3b8; font-size: 0.75rem; font-style: italic; }

/* MOBILE CARDS */
.mobile-filter-panel { background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.filter-grid-mobile input { padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; }
.btn-close-filters { width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: bold; }

.card-contacto { background: white; padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.card-main { display: flex; justify-content: space-between; align-items: center; }
.card-name { font-weight: bold; font-size: 1rem; color: #1e293b; }
.card-subtext { font-size: 0.8rem; color: #64748b; margin-top: 4px; margin-bottom: 6px; }
.btn-wa-circle { background: #25d366; color: white; border: none; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3); flex-shrink: 0; }

.btn-copy-mobile { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 6px; font-size: 0.75rem; display: flex; align-items: center; gap: 6px; color: #475569; cursor: pointer; }
.btn-copy-mobile .material-icons { font-size: 16px; }

/* ESTADOS */
.fila-ina { opacity: 0.6; background-color: #f8fafc; }
.font-bold { font-weight: 600; }
.text-center { text-align: center; }
.shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }

.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .btn-text { display: none; }
}
</style>