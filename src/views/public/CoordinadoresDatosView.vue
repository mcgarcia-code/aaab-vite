<template>
  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">

        <div class="header-section border-bottom" style="margin-bottom: 0; box-shadow: none; border-radius: 0; padding: 20px;">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2 flex-wrap" style="font-size: 1.25rem;">
              <i class="bi bi-person-lines-fill me-1"></i> Coordinadores: Base de datos
            </h4>
            <span class="counter mt-1 d-block text-muted">Total: {{ arbitrosFiltrados.length }} árbitros</span>
          </div>

          <div class="header-actions">
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-filter-mobile mobile-only-flex">
              <span class="material-icons">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn-action btn-clear">
              <span class="material-icons">filter_alt_off</span>
              <span class="btn-text">Limpiar</span>
            </button>

            <button @click="exportarExcel" class="btn-action btn-export">
              <span class="material-icons">download</span>
              <span class="btn-text">Excel</span>
            </button>
          </div>
        </div>

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster shadow-sm" style="border-radius: 0; border-left: 0; border-right: 0; margin-bottom: 0; background-color: #e2e8f0; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; box-shadow: none;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px;">FILTRAR ÁRBITROS</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>

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
              <label>Apto Médico:</label>
              <select v-model="filtros.apto_medico">
                <option value="">Todos</option>
                <option value="1">Sólo Aptos</option>
                <option value="0">No Aptos</option>
              </select>
            </div>

            <div class="mobile-select-group col-span-2">
              <label>Licencia / Sanción:</label>
              <select v-model="filtros.licencia" class="full-width">
                <option value="">Todas</option>
                <option value="sin_licencia">Sin Licencia</option>
                <option value="aprobada">Licencias Aprobadas</option>
                <option value="rechazada">Licencias Rechazadas</option>
                <option value="pendiente">Licencias Pendientes</option>
                <option value="sancion_vigente">Sanción Vigente</option>
                <option value="sancion_proceso">Sanción en Proceso</option>
              </select>
            </div>

            <div class="filter-row-mobile col-span-2">
              <input v-model="filtros.grupo" placeholder="Grupo">
              <input v-model="filtros.subgrupo" placeholder="Sub-grupo">
            </div>

            <input v-model="filtros.zona" class="col-span-2" placeholder="Zona..">
          </div>

          <button @click="mostrarFiltrosMobile = false" class="btn-close-filters w-100 mt-2">Aplicar Filtros</button>
        </div>

        <div class="card-body p-3 p-md-4">

          <div class="table-container shadow-sm desktop-only border" style="border-radius: 8px;">
            <table>
              <thead>
                <tr>
                  <th class="sticky-col" style="left: 0; z-index: 40; width: 140px;">Apellido</th>
                  <th class="sticky-col" style="left: 140px; z-index: 40; width: 140px;">Nombre</th>
                  <th class="col-shrink">Edad</th>
                  <th class="sticky-col sticky-col-final text-center" style="left: 280px; z-index: 40; min-width: 160px;">Licencia / Sanción</th>
                  <th class="col-shrink">WS</th>
                  <th class="col-shrink">Activo</th>
                  <th class="col-shrink text-center">Apto</th>
                  <th class="col-shrink text-center">Grupo</th>
                  <th class="col-shrink text-center">Sub</th>
                  <th>Zona</th>
                  <th>Movilidad</th>
                  <th class="col-shrink text-center">Sáb Disp</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th class="col-shrink text-center">Dom Disp</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th class="col-shrink text-center">Juega</th>
                  <th>Club</th>
                  <th>Cat</th>
                  <th>Observaciones</th>
                </tr>
                <tr class="filter-row">
                  <td class="sticky-col" style="left:0; z-index: 35;"><input v-model="filtros.apellido" class="filter-input shadow-none"></td>
                  <td class="sticky-col" style="left:140px; z-index: 35;"><input v-model="filtros.nombre" class="filter-input shadow-none"></td>
                  <td></td>
                  <td class="sticky-col sticky-col-final" style="left:280px; z-index: 35;">
                    <select v-model="filtros.licencia" class="filter-input shadow-none">
                      <option value="">Todas</option>
                      <option value="sin_licencia">Sin Licencia</option>
                      <option value="aprobada">Aprobadas</option>
                      <option value="rechazada">Rechazadas</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="sancion_vigente">Sanción Vigente</option>
                      <option value="sancion_proceso">Sanción en Proceso</option>
                    </select>
                  </td>
                  <td></td>
                  <td class="bg-filter text-center">
                    <select v-model="filtros.es_activo" class="filter-input shadow-none text-center">
                      <option value="">Todos</option>
                      <option value="1">SÍ</option>
                      <option value="0">NO</option>
                    </select>
                  </td>
                  <td class="bg-filter text-center">
                    <select v-model="filtros.apto_medico" class="filter-input shadow-none text-center">
                      <option value="">Todos</option>
                      <option value="1">SÍ</option>
                      <option value="0">NO</option>
                    </select>
                  </td>
                  <td class="bg-filter col-shrink"><input v-model="filtros.grupo" class="filter-input-min shadow-none"></td>
                  <td class="bg-filter col-shrink"><input v-model="filtros.subgrupo" class="filter-input-min shadow-none"></td>
                  <td class="bg-filter"><input v-model="filtros.zona" class="filter-input shadow-none"></td>
                  <td class="bg-filter"><input v-model="filtros.movilidad" class="filter-input shadow-none"></td>
                  <td class="bg-filter col-shrink"><input v-model="filtros.disponibilidad_sabado" class="filter-input-min shadow-none"></td>
                  <td class="bg-filter"></td><td class="bg-filter"></td>
                  <td class="bg-filter col-shrink"><input v-model="filtros.disponibilidad_domingo" class="filter-input-min shadow-none"></td>
                  <td class="bg-filter"></td><td class="bg-filter"></td>
                  <td class="bg-filter col-shrink"><input v-model="filtros.juega_handball" class="filter-input-min shadow-none"></td>
                  <td class="bg-filter"><input v-model="filtros.donde_juega" class="filter-input shadow-none"></td>
                  <td class="bg-filter"><input v-model="filtros.categoria_handball" class="filter-input shadow-none"></td>
                  <td class="bg-filter"><input v-model="filtros.observaciones" class="filter-input shadow-none"></td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in arbitrosPaginados" :key="a.id" :class="obtenerClaseFila(a)">
                  <td class="sticky-col font-bold" style="left: 0;">{{ a.apellido }}</td>
                  <td class="sticky-col font-bold" style="left: 140px;">{{ a.nombre }}</td>
                  <td class="text-center">{{ a.edad }}</td>
                  <td class="sticky-col text-center text-xs sticky-col-final" style="left: 280px; white-space: nowrap;">{{ obtenerTextoLicencia(a) }}</td>

                  <td class="text-center col-shrink">
                    <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa shadow-sm" title="Enviar WhatsApp">
                      <span class="material-icons" style="font-size: 16px;">chat</span>
                    </button>
                    <span v-else class="text-muted">-</span>
                  </td>

                  <td class="text-center col-shrink">
                    <span v-if="a.es_activo" class="material-icons dot-active" title="Activo">check_circle</span>
                    <span v-else class="material-icons dot-inactive" title="Inactivo">cancel</span>
                  </td>
                  <td class="text-center col-shrink">
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

                <tr v-if="arbitrosPaginados.length === 0">
                  <td colspan="21" class="text-center py-5 text-muted bg-light italic border-0">
                    <span class="material-icons d-block mb-2" style="font-size: 40px;">search_off</span>
                    <p class="m-0 fw-bold">No se encontraron registros.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mt-3">
            <div v-for="a in arbitrosPaginados" :key="'mob-'+a.id" class="card-arbitro shadow-sm border border-light-subtle mb-3" :class="obtenerClaseFila(a)">

              <div class="card-header border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="card-name text-dark fw-bold text-uppercase" style="font-size: 1.05rem;">
                  <span :class="['dot-sm', a.es_activo == 1 ? 'bg-success' : 'bg-danger']" style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px;"></span>
                  {{ a.apellido }}, {{ a.nombre }} ({{ a.edad }} años)
                </div>
                <div class="text-xs fw-bold" style="color: #000;">{{ obtenerTextoLicencia(a) }}</div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="card-row text-dark mb-2">
                  <span style="font-size: 0.9rem;"><strong>Gr:</strong> {{ a.grupo }}-<strong>Zona:</strong> {{ a.zona }}</span>
                </div>

                <div class="mb-2">
                  <p class="text-dark m-0" style="font-size: 0.9rem;">
                    <strong>Apto Físico: </strong>
                    <span v-if="a.apto_medico" class="material-icons icon-apto align-middle" style="font-size: 18px;" title="Apto Físico">check_circle</span>
                    <span v-else class="material-icons icon-no-apto align-middle" style="font-size: 18px;" title="No Apto Físico">cancel</span>
                  </p>
                </div>

                <div class="mb-3">
                  <p class="text-dark mt-1 mb-0" style="font-size: 0.9rem;"><strong>Juega:</strong> {{ a.juega_handball }} <span v-if="a.juega_handball === 'SI'">en {{ a.donde_juega }}</span></p>
                </div>

                <div class="mb-3">
                  <p class="text-dark mb-1" style="font-size: 0.9rem;"><strong>Sáb:</strong> {{ a.disponibilidad_sabado }} <span v-if="a.disponibilidad_sabado === 'SI' || a.disponibilidad_sabado === 'OTROS'">({{ a.disponibilidad_sabado_desde }}-{{ a.disponibilidad_sabado_hasta }})</span><span v-else>(-)</span></p>
                  <p class="text-dark m-0" style="font-size: 0.9rem;"><strong>Dom:</strong> {{ a.disponibilidad_domingo }} <span v-if="a.disponibilidad_domingo === 'SI' || a.disponibilidad_domingo === 'OTROS'">({{ a.disponibilidad_domingo_desde }}-{{ a.disponibilidad_domingo_hasta }})</span><span v-else>(-)</span></p>
                </div>

                <button v-if="a.celular" @click="abrirWhatsApp(a.celular)" class="btn-wa-mobile shadow-sm mt-3" style="background: #25d366;">
                  <span class="material-icons">chat</span> Contactar por WhatsApp
                </button>
              </div>
            </div>

            <div v-if="arbitrosPaginados.length === 0" class="text-center p-4 bg-light rounded shadow-sm border mt-3">
              <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
              <p class="text-muted mt-2 mb-0 fw-bold">No se encontraron registros.</p>
            </div>
          </div>

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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch, inject } from 'vue';
import { api } from '@/api/api';
import * as XLSX from 'xlsx';
import { useHead } from '@vueuse/head'

useHead({
  title: 'Coordinadores: Base de datos | AAAB',
  meta: [
    { name: 'description', content: 'Base de datos de árbitros para los coordinadores.' },
    { property: 'og:title', content: 'Coordinadores: Base de datos | AAAB' },
    { property: 'og:description', content: 'Base de datos de árbitros para los coordinadores.' },
    { property: 'og:image', content: 'https://arbitroshandball.com.ar/logo.png' },
    { property: 'og:type', content: 'website' }
  ],
})

const notificar = inject('notificar');

const arbitros = ref([]);
const mostrarFiltrosMobile = ref(false);

const filtros = reactive({
  apellido: '', nombre: '', licencia: '', es_activo: '',
  apto_medico: '', grupo: '', subgrupo: '', zona: '', movilidad: '',
  disponibilidad_sabado: '', disponibilidad_domingo: '',
  juega_handball: '', donde_juega: '', categoria_handball: '', observaciones: ''
});

// --- VARIABLES DE PAGINACIÓN ---
const paginaActual = ref(1);
const registrosPorPagina = 8;


const cargarDatos = async () => {
  try {
    const {payload} = await api.get({
      entity: "arbitros",
      action:"getArbitros"
    });


    let sancionesPayload = [];
    try {
      const resSanciones = await api.get({ entity: "sanciones", action: "obtenerSanciones" });
      sancionesPayload = resSanciones.payload || [];
    } catch(e) {
      console.error("Error al cargar sanciones:", e);
    }

    // Mapeo rápido para asignar a los árbitros
    const sancionesMap = {};
    sancionesPayload.forEach(s => {
      // Tomamos solo las Vigentes (1) o En Proceso (3)
      if (s.estado_dinamico === 1 || s.estado_dinamico === 3) {
        if (!sancionesMap[s.id_arbitro]) {
          sancionesMap[s.id_arbitro] = s;
        } else {
          // Si ya existe otra, priorizamos la vigente (1) por sobre el proceso (3)
          if (s.estado_dinamico === 1 && sancionesMap[s.id_arbitro].estado_dinamico === 3) {
            sancionesMap[s.id_arbitro] = s;
          }
        }
      }
    });

    arbitros.value = payload
      ? payload.map(a => {
          const sancion = sancionesMap[a.id];
          return {
            ...a,
            apto_medico: a.apto_medico == 1,
            // Guardamos el estado de sanción como booleano
            sancion_vigente: sancion && sancion.estado_dinamico === 1,
            sancion_proceso: sancion && sancion.estado_dinamico === 3,
            sancion_hasta: sancion ? sancion.hasta_formateada : null,
            sancion_indefinida: sancion ? sancion.es_indefinido == 1 : false
          };
        })
      : [];
  } catch (err) {
    console.error("Error al cargar datos:", err);
    notificar({ titulo: 'Error', mensaje: 'No se pudieron cargar los datos de la tabla.', tipo: 'danger' });
  }
};

const obtenerClaseFila = (a) => {
  const tieneAprobada = Number(a.tiene_aprobada) > 0;
  const tieneRechazada = Number(a.tiene_rechazada) > 0;
  const tienePendiente = Number(a.tiene_pendiente) > 0;
  const esInactivo = a.es_activo == 0;

  // Inactivo, Aprobada o Sanción Vigente = Rojo
  if (esInactivo || tieneAprobada || a.sancion_vigente) return 'fila-roja';

  // Sanción en proceso, Rechazada o Pendiente = Amarillo
  if (tieneRechazada || tienePendiente || a.sancion_proceso) return 'fila-amarilla';

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
    return cadenaFechas
      .split(',')
      .map(f => f.trim())
      .sort((fechaA, fechaB) => new Date(fechaA) - new Date(fechaB))
      .map(f => mostrarFechaArg(f))
      .join(', ');
  };

  if (a.sancion_vigente) {
    const textoHasta = a.sancion_indefinida ? 'Indefinida' : a.sancion_hasta;
    textos.push(`SANCIONADO (Hasta: ${textoHasta || '-'})`);
  } else if (a.sancion_proceso) {
    textos.push(`SANC. EN PROCESO`);
  }

  if (Number(a.tiene_aprobada) > 0 && a.fecha_licencia_aprobada) {
    textos.push(`APR: ${formatearVariasFechas(a.fecha_licencia_aprobada)}`);
  }
  if (Number(a.tiene_pendiente) > 0 && a.fecha_licencia_pendiente) {
    textos.push(`PEN: ${formatearVariasFechas(a.fecha_licencia_pendiente)}`);
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
      if (!filtros[key] || key === 'licencia' || key === 'apto_medico') return true;
      if (key === 'es_activo') return String(a[key]) === filtros[key];
      return normalizarTexto(a[key]).includes(normalizarTexto(filtros[key]));
    });

    let cumpleLicencia = true;
    if (filtros.licencia === 'aprobada') cumpleLicencia = Number(a.tiene_aprobada || 0) > 0;
    else if (filtros.licencia === 'rechazada') cumpleLicencia = Number(a.tiene_rechazada || 0) > 0;
    else if (filtros.licencia === 'pendiente') cumpleLicencia = Number(a.tiene_pendiente || 0) > 0;

    // Ahora sí funciona porque la variable existe en los datos
    else if (filtros.licencia === 'sancion_vigente') cumpleLicencia = a.sancion_vigente === true;
    else if (filtros.licencia === 'sancion_proceso') cumpleLicencia = a.sancion_proceso === true;

    else if (filtros.licencia === 'sin_licencia') {
      cumpleLicencia = Number(a.tiene_aprobada || 0) === 0 &&
                       Number(a.tiene_rechazada || 0) === 0 &&
                       Number(a.tiene_pendiente || 0) === 0;
    }

    let cumpleApto = true;
    if (filtros.apto_medico !== '') {
      const valorFiltro = filtros.apto_medico === '1';
      cumpleApto = a.apto_medico === valorFiltro;
    }

    return cumpleTexto && cumpleLicencia && cumpleApto;
  });

  return filtrados.sort((a, b) => {
    const compApellido = (a.apellido || '').localeCompare(b.apellido || '');
    if (compApellido === 0) return (a.nombre || '').localeCompare(b.nombre || '');
    return compApellido;
  });
});

// --- LÓGICA DE PAGINACIÓN ---
const totalPaginas = computed(() => Math.ceil(arbitrosFiltrados.value.length / registrosPorPagina) || 1);

const arbitrosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return arbitrosFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

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

const exportarExcel = () => {
  const datos = arbitrosFiltrados.value.map(a => ({
    APELLIDO: a.apellido, NOMBRE: a.nombre,
    CELULAR: a.celular,
    LICENCIA_O_SANCION: obtenerTextoLicencia(a),
    ACTIVO: a.es_activo == 1 ? 'SI' : 'NO',
    ZONA: a.zona, MOVILIDAD: a.movilidad,
    SAB_DISP: a.disponibilidad_sabado, SAB_HORA: `${a.disponibilidad_sabado_desde} a ${a.disponibilidad_sabado_hasta}`,
    DOM_DISP: a.disponibilidad_domingo, DOM_HORA: `${a.disponibilidad_domingo_desde} a ${a.disponibilidad_domingo_hasta}`,
    JUEGA: a.juega_handball, CLUB: a.donde_juega, OBS: a.observaciones
  }));
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Arbitros");
  XLSX.writeFile(wb, "Base_Datos_Coordinadores.xlsx");
};

onMounted(cargarDatos);
</script>

<style scoped>
/* ====================================================
   1. BASE (MOBILE FIRST - CELULARES POR DEFECTO)
   ==================================================== */

.full-screen-wrapper {
  position: relative;
  width: 99vw;
  min-height: 100vh;
  height: auto !important;
  margin-left: 50%;
  transform: translateX(-50%);
  padding: 20px;
  padding-bottom: 120px;
  box-sizing: border-box;
}

@media (max-width: 767px) {
  .full-screen-wrapper { padding: 0 15px 20px 15px !important; }
}

.admin-panel {
  width: 100%;
  max-width: 100%;
  padding: 0;
  font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
  color: #000;
  background-color: #ffffff;
  min-height: 100vh;
  border-radius: 0;
}

/* Cabecera Móvil */
.header-section {
  background: white;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 15px;
  border-left: 5px solid #ef4444;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-info { display: flex; flex-direction: column; align-items: flex-start; width: 100%; }
.title { font-size: 1.25rem; font-weight: bold; margin: 0; color: #000; }
.counter { font-size: 0.85rem; color: #64748b; }

/* Botones Móvil */
.header-actions {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 8px;
  overflow-x: auto;
}

.btn-action {
  border: none; border-radius: 6px; font-weight: bold; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s, transform 0.1s;
  flex: none; width: 42px; height: 42px; padding: 0;
}
.btn-action:hover { opacity: 0.85; }
.btn-action:active { transform: scale(0.95); }
.btn-text { display: none; }

.btn-clear { background: #e2e8f0; color: #0f172a; border: 1px solid #e2e8f0; }
.btn-export { background: #10b981; color: white; }
.btn-filter-mobile { background: #3b82f6; color: white; }

/* Visibilidad de Capas Base */
.desktop-only { display: none !important; }
.mobile-only { display: block !important; }
.mobile-only-flex { display: flex !important; }

/* Filtros Móvil */
.mobile-filter-panel {
  background: #e2e8f0;
  padding: 15px 20px;
  border-bottom: 1px solid #cbd5e1;
}

.filter-grid-mobile {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: end;
}

.filter-grid-mobile input,
.filter-grid-mobile select {
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  height: 42px;
  outline: none;
  background: #ffffff;
  color: #334155;
  box-sizing: border-box;
}

.filter-grid-mobile input:focus,
.filter-grid-mobile select:focus {
  border-color: #3b82f6;
  background: white;
}

.filter-grid-mobile input::placeholder { color: #94a3b8; }

.mobile-select-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.mobile-select-group label {
  font-size: 0.75rem;
  color: #000;
  font-weight: bold;
  margin-bottom: 2px;
  min-height: 1rem;
}

.filter-row-mobile {
  display: flex;
  gap: 10px;
  width: 100%;
}

.filter-row-mobile input { flex: 1; min-width: 0; }
.col-span-2 { grid-column: span 2; }

/* Botón celeste aplicar filtros */
.btn-close-filters {
  background: #3b82f6; color: white; border: none; padding: 14px; border-radius: 8px;
  font-weight: bold; cursor: pointer; font-size: 1rem; width: 100%; margin-top: 15px;
  transition: background 0.2s, transform 0.1s; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}
.btn-close-filters:active { background: #2563eb; transform: scale(0.98); }

/* Tarjetas Móviles (Listado) */
.card-arbitro { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px; }
.card-name { font-size: 1.05rem; color: #0f172a; }
.card-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 8px; }
.text-xs { font-size: 0.75rem; }

.btn-wa-mobile { width: 100%; margin-top: 10px; background: #25d366; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.85rem; }

/* Componentes Visuales */
.dot-active { color: #22c55e; vertical-align: middle; font-size: 1.5rem; }
.dot-inactive { color: #ef4444; vertical-align: middle; font-size: 1.5rem; }
.icon-apto { color: #22c55e; vertical-align: middle; font-size: 1.5rem; }
.icon-no-apto { color: #ef4444; vertical-align: middle; font-size: 1.5rem; }

/* Colores Filas Especiales */
.fila-roja { background-color: #fca5a5 !important; border-color: #ef4444 !important; }
.fila-amarilla { background-color: #fef08a !important; border-color: #eab308 !important; }
.fila-des { background-color: #93e2ab !important; border-color: #22c55e !important; }
.fila-roja .card-name, .fila-roja .text-dark, .fila-roja .small, .fila-roja .text-xs,
.fila-amarilla .card-name, .fila-amarilla .text-dark, .fila-amarilla .small, .fila-amarilla .text-xs { color: #000 !important; }

.animate__animated { animation-duration: 0.5s; }


/* ====================================================
   2. TABLETS Y ESCRITORIO (Desde 768px hacia arriba)
   ==================================================== */
@media (min-width: 768px) {

  .admin-panel { padding: 20px; border-radius: 12px; }

  .desktop-only { display: block !important; }
  .mobile-only { display: none !important; }
  .mobile-only-flex { display: none !important; }

  .header-section { flex-direction: row; align-items: center; justify-content: space-between; border-radius: 8px; padding: 15px 25px; }
  .header-info { width: auto; align-items: flex-start; }
  .title { font-size: 1.1rem; }

  .header-actions { width: auto; justify-content: flex-end; flex-wrap: nowrap; gap: 8px; overflow-x: visible; }
  .btn-action { width: auto; height: auto; padding: 8px 12px; gap: 5px; font-size: 0.85rem; justify-content: flex-start; }
  .btn-text { display: inline !important; }

  /* TABLA DESKTOP */
  .table-container {
    width: 100%; overflow: auto; max-height: 75vh;
    background: white; border-radius: 8px; border: 1px solid #e2e8f0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }
  table { width: 100%; min-width: max-content; border-collapse: collapse !important; border-spacing: 0; font-size: 0.85rem; }

  /* CABECERA PRINCIPAL */
  th {
    position: sticky; top: 0; z-index: 50;
    background-color: #e2e8f0 !important;
    padding: 14px 10px;
    border-bottom: 2px solid #cbd5e1;
    font-family: 'segoe ui', Tahoma, Verdana, sans-serif;
    font-size: 0.75rem; color: #000000; text-transform: uppercase; font-weight: 800;
  }

  /* FILA DE FILTROS */
  .filter-row td {
    position: sticky; top: 46px; z-index: 40;
    background-color: #f1f5f9 !important;
    padding: 10px 8px;
    border-bottom: 2px solid #cbd5e1;
  }

  td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
  td.text-center { display: table-cell; text-align: center; vertical-align: middle; }

  .sticky-col { position: sticky !important; z-index: 10; background: white !important; box-shadow: inset -1px 0 0 #e2e8f0; background-clip: padding-box; }
  th.sticky-col { z-index: 100 !important; background-color: #e2e8f0 !important; }
  .filter-row .sticky-col { z-index: 90 !important; background-color: #f1f5f9 !important; }
  .sticky-col-final { border-right: 3px solid #cbd5e1 !important; }

  .col-shrink { width: 50px !important; min-width: 50px !important; max-width: 50px !important; white-space: nowrap !important; padding: 8px 0 !important; text-align: center; }

  /* Inputs Filtro Desktop */
  .filter-input { width: 100%; height: 30px; padding: 4px 8px; border: 1px solid #cbd5e1; font-size: 0.75rem; border-radius: 4px; outline: none; background-color: #ffffff; box-sizing: border-box; }
  .filter-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
  .filter-input-min { width: 35px; text-align: center; height: 30px; border: 1px solid #cbd5e1; font-size: 0.75rem; border-radius: 4px; outline: none; background-color: #ffffff;}
  .filter-input-min:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }

  .btn-wa { background: #25d366; color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto; transition: 0.2s; }
  .btn-wa:hover { transform: scale(1.1); }

  .col-obs-container { width: 150px; position: relative; }
  .obs-wrapper { width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; padding: 4px; border-radius: 4px; }
  .obs-wrapper:focus { position: absolute; width: 300px; white-space: normal; background: #fff; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #3b82f6; padding: 10px; left: -150px; top: 0; outline: none;}

  .font-bold { font-weight: bold; }

  .fila-roja td, .fila-roja .sticky-col { background-color: #fca5a5 !important; color: #000 !important; }
  .fila-amarilla td, .fila-amarilla .sticky-col { background-color: #fef08a !important; color: #000 !important; }
  .fila-des td, .fila-des .sticky-col { background-color: #93e2ab !important; color: #000 !important;}
}
</style>
