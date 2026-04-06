<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <!-- CABECERA -->
      <div class="header-section shadow-sm">
        <div class="header-info">
          <h2 class="title">Control de Designaciones</h2>
          <span class="counter">Total: {{ arbitrosFiltrados.length }} árbitros</span>
        </div>

        <div class="header-actions">
          <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-filter-mobile mobile-only">
            <span class="material-icons">filter_alt</span>
          </button>
          
          <button @click="limpiarFiltros" class="btn-action btn-clear">
            <span class="material-icons">filter_alt_off</span>
            <span class="btn-text">Filtros</span>
          </button>

          <button @click="limpiarChecks" class="btn-action btn-clear-checks desktop-only">
            <span class="material-icons" style="font-size: 18px; line-height: 1;">check_box_outline_blank</span>
            <span class="btn-text" style="line-height: 1;">Tildes</span>
          </button>

          <button @click="exportarExcel" class="btn-action btn-export">
            <span class="material-icons">download</span>
            <span class="btn-text">Excel</span>
          </button>
        </div>
      </div>

      <!-- MODAL DE FILTROS MOBILE -->
      <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only">
        <div class="filter-grid-mobile">
          <input v-model="filtros.apellido" placeholder="Apellido..">
          <input v-model="filtros.nombre" placeholder="Nombre..">
          
          <div class="mobile-select-group">
            <label>Estado Activo:</label>
            <select v-model="filtros.es_activo">
              <option value="">Todos los estados</option>
              <option value="1">Sólo Activos</option>
              <option value="0">Sólo Inactivos</option>
            </select>
          </div>

          <div class="mobile-select-group">
            <label>Licencia:</label>
            <select v-model="filtros.licencia">
              <option value="">Todos los Árbitros</option>
              <option value="sin_licencia">Sin Licencia</option>
              <option value="aprobada">Licencias Aprobadas</option>
              <option value="rechazada">Licencias Rechazadas</option>
            </select>
          </div>

          <div class="mobile-select-group">
            <label>Apto Médico:</label>
            <select v-model="filtros.apto_medico">
              <option value="">Todos</option>
              <option value="1">Sólo Aptos</option>
              <option value="0">No Aptos</option>
            </select>
          </div>

          <div class="mobile-select-group">
            <label>Designado Sáb:</label>
            <select v-model="filtros.designado_sabado">
              <option value="">Todos</option>
              <option value="1">Designados</option>
              <option value="0">No Designados</option>
            </select>
          </div>

          <div class="mobile-select-group">
            <label>Designado Dom:</label>
            <select v-model="filtros.designado_domingo">
              <option value="">Todos</option>
              <option value="1">Designados</option>
              <option value="0">No Designados</option>
            </select>
          </div>

          <div class="filter-row-mobile">
            <input v-model="filtros.grupo" placeholder="Grupo">
            <input v-model="filtros.subgrupo" placeholder="Sub-grupo">
          </div>
          
          <input v-model="filtros.zona" placeholder="Zona..">
        </div>
        <button @click="mostrarFiltrosMobile = false" class="btn-close-filters">Ver Resultados</button>
      </div>

      <!-- CONTENEDOR DE LA TABLA -->
      <div class="table-container shadow desktop-only">
        <table>
          <thead>
            <tr>
              <th class="sticky-col" style="left: 0; z-index: 40; width: 140px;">Apellido</th>
              <th class="sticky-col" style="left: 140px; z-index: 40; width: 140px;">Nombre</th>
              <th class="sticky-col col-shrink sticky-col-final" style="left: 280px; z-index: 40;">SÁB</th>
              <th class="sticky-col col-shrink" style="left: 330px; z-index: 40;">DOM</th>
              <th class="sticky-col text-center" style="left: 380px; z-index: 40; min-width: 160px;">Licencia</th>
              <th class="col-shrink">WS</th>
              <th style="width: 80px;">Activo</th>
              <th class="text-center" style="width: 90px;">Apto</th>
              <th class="col-shrink">Grupo</th>
              <th class="col-shrink">Sub</th>
              <th class="text-center">Zona</th>
              <th class="text-center">Movilidad</th>
              <th class="col-shrink">Sab</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th class="col-shrink">Dom</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th class="col-shrink">Juega</th>
              <th class="text-center">Club</th>
              <th class="text-center">Cat</th>
              <th class="text-center">Observaciones</th>
            </tr>
            <tr class="filter-row">
              <td class="sticky-col" style="left:0; z-index: 35;"><input v-model="filtros.apellido" class="filter-input"></td>
              <td class="sticky-col" style="left:140px; z-index: 35;"><input v-model="filtros.nombre" class="filter-input"></td>
              
              <td class="sticky-col col-shrink" style="left:280px; z-index: 35;">
                <select v-model="filtros.designado_sabado" class="filter-input">
                  <option value=""></option>
                  <option value="1">SI</option>
                  <option value="0">NO</option>
                </select>
              </td>
              <td class="sticky-col col-shrink sticky-col-final" style="left:330px; z-index: 35;">
                <select v-model="filtros.designado_domingo" class="filter-input">
                  <option value=""></option>
                  <option value="1">SI</option>
                  <option value="0">NO</option>
                </select>
              </td>
              
              <td class="sticky-col" style="left:380px; z-index: 35;">
                <select v-model="filtros.licencia" class="filter-input">
                  <option value="">Todas</option>
                  <option value="sin_licencia">Sin Licencia</option>
                  <option value="aprobada">Licencias Aprobadas</option>
                  <option value="rechazada">Licencias Rechazadas</option>
                </select>
              </td>
              <td></td>
              <td class="bg-filter">
                <select v-model="filtros.es_activo" class="filter-input">
                  <option value="">Todos</option>
                  <option value="1">SÍ</option>
                  <option value="0">NO</option>
                </select>
              </td>
              <td class="bg-filter text-center">
                <select v-model="filtros.apto_medico" class="filter-input">
                  <option value="">Todos</option>
                  <option value="1">SÍ</option>
                  <option value="0">NO</option>
                </select>
              </td>
              <td class="bg-filter col-shrink"><input v-model="filtros.grupo" class="filter-input-min"></td>
              <td class="bg-filter col-shrink"><input v-model="filtros.subgrupo" class="filter-input-min"></td>
              <td class="bg-filter"><input v-model="filtros.zona" class="filter-input"></td>
              <td class="bg-filter"><input v-model="filtros.movilidad" class="filter-input"></td>
              <td class="bg-filter col-shrink"><input v-model="filtros.disponibilidad_sabado" class="filter-input-min"></td>
              <td class="bg-filter"></td><td class="bg-filter"></td>
              <td class="bg-filter col-shrink"><input v-model="filtros.disponibilidad_domingo" class="filter-input-min"></td>
              <td class="bg-filter"></td><td class="bg-filter"></td>
              <td class="bg-filter col-shrink"><input v-model="filtros.juega_handball" class="filter-input-min"></td>
              <td class="bg-filter"><input v-model="filtros.donde_juega" class="filter-input"></td>
              <td class="bg-filter"><input v-model="filtros.categoria_handball" class="filter-input"></td>
              <td class="bg-filter"><input v-model="filtros.observaciones" class="filter-input"></td>
            </tr>
          </thead>
          <tbody>
            <!-- USAMOS arbitrosPaginados EN LUGAR DE arbitrosFiltrados -->
            <tr v-for="a in arbitrosPaginados" :key="a.id" :class="obtenerClaseFila(a)">
              <td class="sticky-col font-bold" style="left: 0;">{{ a.apellido }}</td>
              <td class="sticky-col font-bold" style="left: 140px;">{{ a.nombre }}</td>
              
              <td class="sticky-col text-center col-shrink" style="left: 280px;">
                <input type="checkbox"
                  :checked="designadosSabado.has(a.id)"
                  :disabled="a.disponibilidad_sabado === 'NO'"
                  @change="toggleDesignacion(a.id, 'S')"
                  class="check">
              </td>
              <td class="sticky-col text-center col-shrink sticky-col-final" style="left: 330px;">
                <input type="checkbox"
                  :checked="designadosDomingo.has(a.id)"
                  :disabled="a.disponibilidad_domingo === 'NO'"
                  @change="toggleDesignacion(a.id, 'D')"
                  class="check">
              </td>

              <td class="sticky-col text-center text-xs" style="left: 380px; white-space: nowrap;">{{ obtenerTextoLicencia(a) }}</td>
              <td class="text-center col-shrink">
                <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa" title="Enviar WhatsApp">
                  <span class="material-icons">chat</span>
                </button>
                <span v-else>-</span>
              </td>
              <td class="text-center col-shrink"><span :class="['dot', a.es_activo == 1 ? 'dot-green' : 'dot-red']"></span></td>
              <td class="text-center">
                <span v-if="a.apto_medico" class="material-icons icon-apto" title="Apto Físico">check_circle</span>
                <span v-else class="material-icons icon-no-apto" title="No Apto Físico">cancel</span>
              </td>
              <td class="text-center col-shrink">{{ a.grupo }}</td>
              <td class="text-center col-shrink">{{ a.subgrupo }}</td>
              <td>{{ a.zona }}</td>
              <td>{{ a.movilidad }}</td>
              <td class="text-center col-shrink">{{ a.disponibilidad_sabado }}</td>
              <td>{{ a.disponibilidad_sabado_desde }}</td>
              <td>{{ a.disponibilidad_sabado_hasta }}</td>
              <td class="text-center col-shrink">{{ a.disponibilidad_domingo }}</td>
              <td>{{ a.disponibilidad_domingo_desde }}</td>
              <td>{{ a.disponibilidad_domingo_hasta }}</td>
              <td class="text-center col-shrink">{{ a.juega_handball }}</td>
              <td>{{ a.donde_juega }}</td>
              <td>{{ a.categoria_handball }}</td>
              <td class="col-obs-container"><div class="obs-wrapper" tabindex="0">{{ a.observaciones || '-' }}</div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA MOBILE -->
      <div class="mobile-only">
        <!-- USAMOS arbitrosPaginados EN LUGAR DE arbitrosFiltrados -->
        <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card-arbitro" :class="obtenerClaseFila(a)">
          <div class="card-header">
            <div class="card-name"><span :class="['dot-sm', a.es_activo == 1 ? 'dot-green' : 'dot-red']"></span> <strong>{{ a.apellido }}, {{ a.nombre }}</strong></div>
            <div class="card-lic text-xs">{{ obtenerTextoLicencia(a) }}</div>
          </div>
          <div class="card-body">
            <div class="card-row"><span><strong>Gr:</strong> {{ a.grupo }}-{{ a.subgrupo }}</span><span><strong>Zona:</strong> {{ a.zona }}</span></div>
            <div class="card-info">
              <p>
                <strong>Apto Físico: </strong>
                <span v-if="a.apto_medico" class="material-icons icon-apto" title="Apto Físico">check_circle</span>
                <span v-else class="material-icons icon-no-apto" title="No Apto Físico">cancel</span>
              </p>
              <p><strong>Juega:</strong> {{ a.juega_handball }} <span v-if="a.juega_handball === 'SI'">en {{ a.donde_juega }}</span></p>
              <p><strong>Sáb:</strong> {{ a.disponibilidad_sabado }} ({{ a.disponibilidad_sabado_desde }}-{{ a.disponibilidad_sabado_hasta }})</p>
              <p><strong>Dom:</strong> {{ a.disponibilidad_domingo }} ({{ a.disponibilidad_domingo_desde }}-{{ a.disponibilidad_domingo_hasta }})</p>
              <p v-if="a.observaciones"><strong>Obs:</strong> {{ a.observaciones }}</p>
            </div>
            <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa-mobile">
              <span class="material-icons">chat</span> Contactar por WhatsApp
            </button>
          </div>
        </div>
      </div>

      <!-- CONTROLES DE PAGINACIÓN -->
      <div class="paginacion">
        <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
        <span class="paginacion-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas">Siguiente</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'; // Importamos watch
import axios from 'axios';
import { api } from '@/api/api';
import * as XLSX from 'xlsx';
import { useHead } from '@vueuse/head'

useHead({
  title: 'Designaciones de Árbitros| AAAB',
  meta: [
    { name: 'description', content: 'Administra y controla las designaciones de árbitros para los partidos del fin de semana.' },
    { property: 'og:title', content: 'Designaciones de Árbitros | AAAB' },
    { property: 'og:description', content: 'Administra y controla las designaciones de árbitros para los partidos del fin de semana.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const API_URL = 'https://arbitroshandball.com.ar/api/acciones.php'; 
const API_URL_BE = 'https://arbitroshandball.com.ar/api/api.php'; 

const arbitros = ref([]);
const mostrarFiltrosMobile = ref(false);

const filtros = reactive({
  apellido: '', nombre: '', licencia: '', es_activo: '', 
  apto_medico: '', 
  grupo: '', subgrupo: '', zona: '', movilidad: '', 
  disponibilidad_sabado: '', disponibilidad_domingo: '',
  juega_handball: '', donde_juega: '', categoria_handball: '', observaciones: '',
  designado_sabado: '',
  designado_domingo: ''
});

const designadosSabado = ref(new Set());
const designadosDomingo = ref(new Set());

// --- VARIABLES DE PAGINACIÓN ---
const paginaActual = ref(1);
const registrosPorPagina = 8;

const cargarDatos = async () => {
  try {
    const res = await axios.get(API_URL);
    arbitros.value = Array.isArray(res.data)
      ? res.data.map(a => ({
          ...a,
          apto_medico: a.apto_medico == 1,
        }))
      : [];

    const resChecks = await api.get({
      entity: 'designaciones',
      action: 'obtener_tildes',
    })
    const listaTildes = resChecks.payload;

    if (listaTildes && Array.isArray(listaTildes)) {
      designadosSabado.value.clear();
      designadosDomingo.value.clear();

      listaTildes.forEach(item => {
        if (item.dia === 'S') designadosSabado.value.add(item.idarbitro);
        if (item.dia === 'D') designadosDomingo.value.add(item.idarbitro);
      });
    }
  } catch (err) { 
    console.error("Error al cargar datos:", err); 
  }
};

const toggleDesignacion = async (id, dia) => {
  const set = dia === 'S' ? designadosSabado.value : designadosDomingo.value;
  const nuevoValor = !set.has(id);
  
  if (nuevoValor) set.add(id); else set.delete(id);
  
  try {
    await axios.post(API_URL_BE, {
      entity: 'designaciones',
      action: 'actualizar_tilde',
      payload: { id_arbitro: id, dia: dia, checked: nuevoValor } 
    });
  } catch (err) {
    console.error("Error al guardar tilde:", err);
  }
};

const limpiarChecks = async () => {
  if (confirm("¿Limpiar tildes de designación?")) {
    designadosSabado.value.clear();
    designadosDomingo.value.clear();
    try {
      await axios.post(API_URL_BE, {
        entity: 'designaciones',
        action: 'limpiarTildesDesignaciones',
        payload: {}
      });
    } catch (err) {
      console.error("Error al limpiar tildes en BE:", err);
    }
  }
};

const obtenerClaseFila = (a) => {
  const tieneAprobada = Number(a.tiene_aprobada) > 0;
  const tieneRechazada = Number(a.tiene_rechazada) > 0;
  const esInactivo = a.es_activo == 0;
  const tildadoSabado = designadosSabado.value.has(a.id);
  const tildadoDomingo = designadosDomingo.value.has(a.id);
  if ((tildadoSabado && tildadoDomingo) || esInactivo || tieneAprobada) {
    return 'fila-roja';
  }
  if (tieneRechazada) return 'fila-amarilla';
  if (tildadoSabado || tildadoDomingo) return 'fila-des';
  return '';
};

const limpiarFiltros = () => Object.keys(filtros).forEach(k => filtros[k] = '');

const mostrarFechaArg = (fecha) => {
  if (!fecha) return '';
  const partes = fecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
};

const abrirWhatsApp = (numero) => {
  if (!numero) return;
  const limpio = String(numero).replace(/\D/g, '');
  const prefijo = limpio.startsWith('54') ? limpio : `54${limpio}`;
  window.open(`https://wa.me/${prefijo}`, '_blank');
};

const obtenerTextoLicencia = (a) => {
  let textos = [];
  const formatearVariasFechas = (cadenaFechas) => {
    if (!cadenaFechas) return '';
    return cadenaFechas.split(',').map(f => mostrarFechaArg(f.trim())).join(', ');
  };
  if (Number(a.tiene_aprobada) > 0 && a.fecha_licencia_aprobada) {
    textos.push(`APR: ${formatearVariasFechas(a.fecha_licencia_aprobada)}`);
  }
  if (Number(a.tiene_rechazada) > 0 && a.fecha_licencia_rechazada) {
    textos.push(`REC: ${formatearVariasFechas(a.fecha_licencia_rechazada)}`);
  }
  return textos.length > 0 ? textos.join(' | ') : '-';
};

const normalizarTexto = (valor) => {
  return String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

const arbitrosFiltrados = computed(() => {
  const filtrados = arbitros.value.filter(a => {
    const cumpleTexto = Object.keys(filtros).every(key => {
      if (!filtros[key] || key === 'licencia' || key === 'apto_medico' || key === 'designado_sabado' || key === 'designado_domingo') return true;
      if (key === 'es_activo') return String(a[key]) === filtros[key];
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });

    let cumpleLicencia = true;
    if (filtros.licencia === 'aprobada') cumpleLicencia = Number(a.tiene_aprobada) > 0;
    else if (filtros.licencia === 'rechazada') cumpleLicencia = Number(a.tiene_rechazada) > 0;
    else if (filtros.licencia === 'sin_licencia') cumpleLicencia = Number(a.tiene_aprobada) === 0 && Number(a.tiene_rechazada) === 0;

    let cumpleApto = true;
    if (filtros.apto_medico !== '') {
      const valorFiltro = filtros.apto_medico === '1';
      cumpleApto = a.apto_medico === valorFiltro;
    }

    let cumpleDesignadoSab = true;
    if (filtros.designado_sabado !== '') {
      cumpleDesignadoSab = (filtros.designado_sabado === '1') === designadosSabado.value.has(a.id);
    }

    let cumpleDesignadoDom = true;
    if (filtros.designado_domingo !== '') {
      cumpleDesignadoDom = (filtros.designado_domingo === '1') === designadosDomingo.value.has(a.id);
    }

    return cumpleTexto && cumpleLicencia && cumpleApto && cumpleDesignadoSab && cumpleDesignadoDom;
  });

  return filtrados.sort((a, b) => {
    const compApellido = (a.apellido || '').localeCompare(b.apellido || '');
    if (compApellido === 0) return (a.nombre || '').localeCompare(b.nombre || '');
    return compApellido;
  });
});

// --- CÁLCULOS DE PAGINACIÓN ---
const totalPaginas = computed(() => Math.ceil(arbitrosFiltrados.value.length / registrosPorPagina) || 1);

const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return arbitrosFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

// Reseteamos a la página 1 si el usuario escribe en un filtro
watch(filtros, () => { paginaActual.value = 1; }, { deep: true });

// Si al borrar se reducen las páginas y quedamos fuera de rango, ajustamos.
watch(totalPaginas, (nuevoTotal) => { 
  if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal;
});


const exportarExcel = () => {
  // Nota: Usamos arbitrosFiltrados para que Excel exporte TODO lo buscado, no solo 10 registros.
  const datos = arbitrosFiltrados.value.map(a => ({
    APELLIDO: a.apellido, NOMBRE: a.nombre,
    CELULAR: a.celular,
    SAB_DESIGNADO: designadosSabado.value.has(a.id) ? 'SI' : 'NO',
    DOM_DESIGNADO: designadosDomingo.value.has(a.id) ? 'SI' : 'NO',
    LICENCIA: obtenerTextoLicencia(a),
    ACTIVO: a.es_activo == 1 ? 'SI' : 'NO',
    ZONA: a.zona, MOVILIDAD: a.movilidad,
    SAB_DISP: a.disponibilidad_sabado, SAB_HORA: `${a.disponibilidad_sabado_desde} a ${a.disponibilidad_sabado_hasta}`,
    DOM_DISP: a.disponibilidad_domingo, DOM_HORA: `${a.disponibilidad_domingo_desde} a ${a.disponibilidad_domingo_hasta}`,
    JUEGA: a.juega_handball, CLUB: a.donde_juega, OBS: a.observaciones
  }));
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Designaciones");
  XLSX.writeFile(wb, "Planilla_Designaciones_AAAB.xlsx");
};

onMounted(cargarDatos);
</script>

<style scoped>
.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh; /* Cambiamos height fijo por min-height */
  height: auto;      /* Permitimos que crezca hacia abajo en móvil */
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 80px; /* Espacio extra para que no toque el footer */
}

.admin-panel { 
  width: 100%;
  max-width: 100%; 
  padding: 20px; 
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;  
  background-color: #0f172a; 
  min-height: 100vh;
  height: 100%; /* Asegura que el fondo oscuro cubra todo el alto */
}

.header-section { 
  background: white; 
  padding: 15px; 
  border-radius: 8px; 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 15px; 
  border-left: 5px solid #ef4444; 
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

/* Botones idénticos a Gestión de Árbitros */
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-clear-checks { background: #fee2e2; color: #ef4444; } 
.btn-export { background: #10b981; color: white; }
.btn-filter-mobile { background: #3b82f6; color: white; }

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


td.text-center { display: table-cell; text-align: center; vertical-align: middle; }
.btn-wa { background: #25d366; color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto; transition: 0.2s; }
.btn-wa:hover { transform: scale(1.1); }
.btn-wa-mobile { width: 100%; margin-top: 10px; background: #25d366; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.85rem; }

.table-container { 
  width: 100%;
  overflow: auto; 
  max-height: 75vh;  /* Reducido un poquito para dar lugar a la paginación */
  background: white; 
  border-radius: 8px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
}

table { 
  width: 100%;
  min-width: max-content; 
  border-collapse: collapse !important; 
  border-spacing: 0; 
  font-size: 0.85rem; 
}

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
}

.filter-row td { 
  position: sticky; 
  top: 37px; 
  z-index: 40; 
  background: #f1F5F9 !important; 
  padding: 4px; 
  border-bottom: 2px solid #cbd5e1; 
}

.sticky-col { 
  position: sticky !important; 
  z-index: 10; 
  background-color: white !important; 
  box-shadow: inset -1px 0 0 #e2e8f0; 
  background-clip: padding-box; 
}

th.sticky-col { 
  z-index: 100 !important; 
  background-color: #f1F5F9 !important; 
}

.filter-row .sticky-col { 
  z-index: 90 !important; 
  background-color: #f8fafc !important; 
}

.sticky-col-final { border-right: 3px solid #cbd5e1 !important; }

.col-shrink { 
  width: 50px !important; 
  min-width: 50px !important; 
  max-width: 50px !important;
  white-space: nowrap !important; 
  padding: 8px 0 !important; 
  text-align: center; 
}

.filter-input { width: 100%; padding: 2px; border: 1px solid #cbd5e1; font-size: 0.7rem; border-radius: 4px; }
.filter-input-min { width: 35px; text-align: center; border: 1px solid #cbd5e1; font-size: 0.7rem; border-radius: 4px; }

td { padding: 8px; border-bottom: 1px solid #f1f5f9; }

.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.dot-green { background-color: #22c55e; }
.dot-red { background-color: #ef4444; }

.check { transform: scale(1.1); cursor: pointer; }
.check:disabled { cursor: not-allowed; opacity: 0.5; }
.check-readonly { cursor: default; }

.icon-apto { color: #22c55e; vertical-align: middle; font-size: 1.5rem; }
.icon-no-apto { color: #ef4444; vertical-align: middle; font-size: 1.5rem; }
.font-bold { font-weight: bold; }

.col-obs-container { width: 150px; position: relative; }
.obs-wrapper { width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; padding: 4px; border-radius: 4px; }
.obs-wrapper:focus { position: absolute; width: 300px; white-space: normal; background: #fff; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #3b82f6; padding: 10px; left: -150px; top: 0; }

.mobile-only { display: none; }

@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: space-between; flex-wrap: wrap; }
  .btn-action { flex: 1; justify-content: center; min-width: 45%; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; }
  .title { font-size: 1rem; }
  .btn-action { font-size: 0.7rem; padding: 6px 8px; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }

  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .header-actions .btn-text { display: none !important; }

  .mobile-filter-panel { background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
  .filter-grid-mobile { display: flex; flex-direction: column; gap: 12px; margin-bottom: 15px; }
  .filter-grid-mobile input, .filter-grid-mobile select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; background-color: #f8fafc; color: #000000; }
  .mobile-select-group { display: flex; flex-direction: column; gap: 4px; }
  .mobile-select-group label { font-size: 0.75rem; color: #000000; font-weight: bold; margin-bottom: 2px; }
  .filter-row-mobile { display: flex; gap: 10px; }
  .filter-row-mobile input { flex: 1; }
  .btn-close-filters { width: 100%; background: #1e293b; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; }

  .card-arbitro { background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; }
  .card-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 8px; }
}

@media (min-width: 768px) {
  .header-actions .btn-text { display: inline; }
}

.fila-roja, .fila-roja .sticky-col { background-color: #fca5a5 !important; color: #000 !important; }
.fila-amarilla, .fila-amarilla .sticky-col { background-color: #fef08a !important; color: #000 !important; }
.fila-des, .fila-des .sticky-col { background-color: #93e2ab !important; }

</style>