<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <!-- CABECERA -->
      <div class="header-section shadow-sm">
        <div class="header-info">
          <h2 class="title d-flex align-items-center gap-2">
            Gestión de Pedidos
            <!-- GLOBO DE NOTIFICACIÓN DE PEDIDOS NUEVOS -->
            <span v-if="pedidosNuevos > 0" class="badge bg-danger rounded-pill px-2 py-1 fs-6 d-flex align-items-center animate__animated animate__pulse">
              <span class="material-icons me-1" style="font-size: 14px;">notifications_active</span>
              {{ pedidosNuevos }} Nuevo{{ pedidosNuevos > 1 ? 's' : '' }}
            </span>
          </h2>
          <span class="counter">Total: {{ pedidosFiltrados.length }} pedidos</span>
        </div>

        <div class="header-actions">
          <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn-action btn-blue mobile-only-flex" title="Mostrar Filtros">
            <span class="material-icons">filter_alt</span> <span class="btn-text">Filtros</span>
          </button>

          <button @click="limpiarFiltros" class="btn-action btn-clear" title="Limpiar Filtros">
            <span class="material-icons">filter_alt_off</span> <span class="btn-text">Limpiar</span>
          </button>

          <button @click="exportarExcel" class="btn-action btn-export" title="Exportar Reporte">
            <span class="material-icons">download</span> <span class="btn-text">Exportar Excel</span>
          </button>
        </div>
      </div>

      <!-- PANEL DE FILTROS DESPLEGABLE (SOLO MOBILE) -->
      <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster shadow-sm">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="small fw-bold text-muted text-uppercase">Filtrar Pedidos</span>
          <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
            <span class="material-icons" style="font-size: 20px;">close</span>
          </button>
        </div>

        <div class="filter-grid-mobile">
          <input v-model="filtros.arbitro" placeholder="Buscar árbitro...">
          <input v-model="filtros.prenda" placeholder="Buscar prenda...">
          <input v-model="filtros.fecha" placeholder="Fecha (DD/MM/YY)...">
          
          <select v-model="filtros.estado" class="full-width">
            <option value="">Estado (Todos)</option>
            <option value="creado">Creado</option>
            <option value="en proceso">En Proceso</option>
            <option value="aceptado">Aceptado</option>
            <option value="entregado">Entregado</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>

        <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0">Aplicar Filtros</button>
      </div>

      <!-- TABLA DESKTOP -->
      <div class="table-container shadow desktop-only">
        <table>
          <thead>
            <tr class="main-header">
              <th class="sticky-col col-id">ID</th>
              <th class="sticky-col col-acciones text-center">Acciones</th>
              <th class="sticky-col col-arbitro">Árbitro</th>
              <th>Prenda solicitada</th>
              <th class="text-center">Cant.</th>
              <th class="text-center">Total</th>
              <th class="text-center">Fecha</th>
              <th class="text-center">Estado</th>
            </tr>
            <tr class="filter-row">
              <td class="sticky-col col-id">
                <button @click="obtenerPedidos" class="btn-refresh w-100" title="Recargar"><span class="material-icons" style="font-size: 16px;">refresh</span></button>
              </td>
              <td class="sticky-col col-acciones"></td>
              <td class="sticky-col col-arbitro"><input v-model="filtros.arbitro" class="filter-input" placeholder="Filtrar.."></td>
              <td><input v-model="filtros.prenda" class="filter-input" placeholder="Filtrar prenda.."></td>
              <td></td>
              <td></td>
              <td><input v-model="filtros.fecha" class="filter-input text-center" placeholder="DD/MM/YY"></td>
              <td>
                <select v-model="filtros.estado" class="filter-input text-center">
                  <option value="">TODOS</option>
                  <option value="creado">CREADO</option>
                  <option value="en proceso">EN PROCESO</option>
                  <option value="aceptado">ACEPTADO</option>
                  <option value="entregado">ENTREGADO</option>
                  <option value="rechazado">RECHAZADO</option>
                </select>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pedidosPaginados" :key="p.id">
              <td class="sticky-col col-id cell-ro text-center text-muted fw-bold">{{ p.id }}</td>
              <td class="sticky-col col-acciones cell-ro text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button @click="abrirModalEstado(p)" class="btn-editar" title="Cambiar Estado">
                    <span class="material-icons" style="font-size:16px;">edit</span>
                  </button>
                  <button @click="verHistorial(p)" class="btn-historial" title="Ver pedidos de este árbitro">
                    <span class="material-icons" style="font-size:16px;">person_search</span>
                  </button>
                </div>
              </td>
              <td class="sticky-col col-arbitro cell-ro fw-bold text-uppercase">{{ p.apellido }}, {{ p.nombre }}</td>
              <td class="cell-ro">{{ p.descripcion }} <span class="fw-bold text-danger ms-1">({{ p.talle }})</span></td>
              <td class="text-center cell-ro fw-bold">{{ p.cantidad }}</td>
              <td class="text-center cell-ro fw-bold text-success">$ {{ p.cantidad * p.precioUnitario }}</td>
              <td class="text-center cell-ro text-muted fw-bold">{{ p.fecha_creacion || 'S/F' }}</td>
              <td class="text-center cell-ro">
                <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA MOBILE (CARDS) -->
      <div class="mobile-only">
        <div v-for="p in pedidosPaginados" :key="'mob-'+p.id" class="card-licencia">
          <div class="card-header">
            <div class="card-name text-uppercase">
              <strong>{{ p.apellido }}, {{ p.nombre }}</strong>
            </div>
            <div class="text-xs text-muted fw-bold">
              ID: #{{ p.id }} <span class="mx-1">•</span> {{ p.fecha_creacion || 'S/F' }}
            </div>
          </div>

          <div class="card-body">
            <div class="card-row">
              <span><strong>Estado:</strong> <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span></span>
            </div>

            <div class="card-info bg-light p-2 rounded border mt-2">
              <p class="fw-bold m-0 text-dark">{{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span></p>
              <div class="d-flex justify-content-between mt-1 border-top pt-1">
                <span>Cant: <strong>{{ p.cantidad }}</strong></span>
                <span class="text-success fw-bold">Total: ${{ p.cantidad * p.precioUnitario }}</span>
              </div>
            </div>

            <div class="d-flex gap-2 mt-3">
              <button @click="abrirModalEstado(p)" class="btn-editar-mobile flex-grow-1">
                <span class="material-icons" style="font-size: 18px;">edit</span> Estado
              </button>
              <button @click="verHistorial(p)" class="btn-historial-mobile" title="Ver sus pedidos">
                <span class="material-icons" style="font-size: 18px;">person_search</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="pedidosPaginados.length === 0" class="text-center p-4 bg-white rounded shadow-sm border">
          <span class="material-icons text-muted" style="font-size: 40px;">search_off</span>
          <p class="text-muted mt-2 mb-0">No se encontraron pedidos.</p>
        </div>
      </div>

      <!-- PAGINACIÓN -->
      <div class="paginacion" v-if="totalPaginas > 1">
        <button class="btn-paginacion" @click="paginaActual--" :disabled="paginaActual === 1">Anterior</button>
        <span class="paginacion-texto">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button class="btn-paginacion" @click="paginaActual++" :disabled="paginaActual === totalPaginas">Siguiente</button>
      </div>

    </div>

    <!-- MODAL CAMBIO DE ESTADO -->
    <Teleport to="body">
    <div v-if="mostrarModal" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 10001;">
      <div class="modal-content-exito animate__animated animate__zoomIn p-4" style="max-width: 450px; width: 95%;">

        <div class="icon-circle-exito bg-info-light mb-3">
          <span class="material-icons">local_shipping</span>
        </div>
        <h4 class="fw-bold m-0">Gestionar Pedido</h4>
        <p class="text-muted small mt-1 mb-4">Pedido #{{ pedidoActual.id }} — {{ pedidoActual.apellido }}, {{ pedidoActual.nombre }}</p>

        <div class="text-start bg-light p-3 rounded border mb-4">
          <p class="m-0 fw-bold small text-dark">{{ pedidoActual.descripcion }} ({{ pedidoActual.talle }})</p>
          <p class="m-0 small text-muted">Fecha: {{ pedidoActual.fecha_creacion || 'S/F' }} | Cant: {{ pedidoActual.cantidad }} | Total: ${{ pedidoActual.cantidad * pedidoActual.precioUnitario }}</p>
        </div>

        <div class="text-start">
          <label class="small fw-bold mb-1">Actualizar Estado</label>
          <select v-model="nuevoEstado" class="form-select shadow-none border-primary-subtle fw-bold">
            <option value="creado">Creado (A Pagar)</option>
            <option value="en proceso">En Proceso</option>
            <option value="aceptado">Aceptado (Preparando)</option>
            <option value="entregado">Entregado</option>
            <option value="rechazado">Rechazado / Cancelado</option>
          </select>
          <p class="extra-small text-muted mt-2 mb-0">
            * <b>Aceptado:</b> Bloquea el stock.<br>
            * <b>Entregado:</b> Descuenta el stock definitivamente.<br>
            * <b>Rechazado:</b> Devuelve el stock a la base.
          </p>
        </div>

        <div class="d-flex gap-2 justify-content-center mt-4">
          <button @click="cerrarModal" class="btn btn-light rounded-pill w-100 fw-bold border">CANCELAR</button>
          <button @click="guardarEstado" class="btn btn-dark rounded-pill w-100 fw-bold shadow-sm" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
            GUARDAR
          </button>
        </div>

      </div>
    </div>
    </Teleport>

    <!-- MODAL HISTORIAL DE PEDIDOS DEL ÁRBITRO -->
    <Teleport to="body">
    <div v-if="mostrarModalHistorial" class="modal-overlay-exito animate__animated animate__fadeIn" style="z-index: 10002;">
      <div class="modal-content-exito animate__animated animate__zoomIn p-4" style="max-width: 650px; width: 95%; text-align: left;">
        
        <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
          <h5 class="fw-bold m-0 d-flex align-items-center gap-2">
            <span class="material-icons text-warning">history</span>
            Historial de {{ arbitroHistorialNombre }}
            <span class="badge bg-dark rounded-pill fs-6 ms-2">{{ historialArbitro.length }}</span>
          </h5>
          <button @click="mostrarModalHistorial = false" class="btn btn-light rounded-circle" style="width: 35px; height: 35px; padding: 0;">
            <span class="material-icons" style="font-size: 18px; line-height: 1;">close</span>
          </button>
        </div>

        <div style="max-height: 60vh; overflow-y: auto; padding-right: 5px;">
          <div class="table-responsive">
            <table class="table table-sm table-hover align-middle" style="font-size: 0.85rem;">
              <thead class="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Prenda</th>
                  <th class="text-center">Cant</th>
                  <th class="text-end">Total</th>
                  <th class="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in historialArbitro" :key="h.id">
                  <td class="text-nowrap text-muted fw-bold">{{ h.fecha_creacion || 'S/F' }}</td>
                  <td>{{ h.descripcion }} <span class="text-danger fw-bold">({{ h.talle }})</span></td>
                  <td class="text-center fw-bold">{{ h.cantidad }}</td>
                  <td class="text-end fw-bold text-success">${{ h.cantidad * h.precioUnitario }}</td>
                  <td class="text-center">
                    <span :class="['badge-status-sm', obtenerClaseEstado(h.estado)]">{{ (h.estado || 'N/A').toUpperCase() }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue';
import { api } from '@/api/api';
import * as XLSX from 'xlsx';
import { useHead } from '@vueuse/head';

useHead({
  title: 'Gestión de Pedidos | AAAB',
  meta: [{ name: 'description', content: 'Administración de pedidos de indumentaria.' }],
});

const notificar = inject('notificar');

const pedidos = ref([]);
const cargando = ref(false);

const filtros = reactive({ arbitro: '', prenda: '', estado: '', fecha: '' });
const mostrarFiltrosMobile = ref(false);

// Paginación
const paginaActual = ref(1);
const registrosPorPagina = 10;

// Modal Variables Estado
const mostrarModal = ref(false);
const pedidoActual = ref({});
const nuevoEstado = ref('');

// Modal Variables Historial
const mostrarModalHistorial = ref(false);
const historialArbitro = ref([]);
const arbitroHistorialNombre = ref('');

// --- NUEVO: COMPUTED PARA CONTAR PEDIDOS EN ESTADO "CREADO" ---
const pedidosNuevos = computed(() => {
  return pedidos.value.filter(p => p.estado && p.estado.toLowerCase() === 'creado').length;
});

// Normalizar texto para búsqueda
const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

// Filtros y Paginación
const pedidosFiltrados = computed(() => {
  return pedidos.value.filter(p => {
    const nombreCompleto = `${p.apellido} ${p.nombre}`;
    const matchArb = normalizar(nombreCompleto).includes(normalizar(filtros.arbitro));
    const matchPrenda = normalizar(p.descripcion).includes(normalizar(filtros.prenda));
    const matchEst = filtros.estado === '' || (p.estado && p.estado.toLowerCase() === filtros.estado.toLowerCase());
    const matchFecha = p.fecha_creacion && p.fecha_creacion.includes(filtros.fecha);
    
    return matchArb && matchPrenda && matchEst && matchFecha;
  });
});

const totalPaginas = computed(() => Math.ceil(pedidosFiltrados.value.length / registrosPorPagina) || 1);
const pedidosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina;
  return pedidosFiltrados.value.slice(inicio, inicio + registrosPorPagina);
});

watch(filtros, () => { paginaActual.value = 1 }, { deep: true });
watch(totalPaginas, (nuevo) => { if(paginaActual.value > nuevo) paginaActual.value = nuevo });

// API Calls
const obtenerPedidos = async () => {
  cargando.value = true;
  try {
    const res = await api.get({ entity: 'indumentaria', action: 'obtenerPedidos' });
    if (res.ok) pedidos.value = res.payload;
  } catch (error) {
    notificar({ titulo: 'Error', mensaje: 'Problema al cargar los pedidos.', tipo: 'danger' });
  }
  cargando.value = false;
};

// Acciones Tabla (Estado)
const abrirModalEstado = (pedido) => {
  pedidoActual.value = { ...pedido };
  nuevoEstado.value = pedido.estado.toLowerCase();
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  cargando.value = false;
};

const guardarEstado = async () => {
  cargando.value = true;
  try {
    const res = await api.post({
      entity: 'indumentaria',
      action: 'actualizarPedido',
      payload: { id: pedidoActual.value.id, estado: nuevoEstado.value }
    });
    
    if (res.ok) {
      notificar({ titulo: 'Actualizado', mensaje: 'Estado del pedido modificado con éxito.', tipo: 'success' });
      await obtenerPedidos();
      cerrarModal();
    } else {
      notificar({ titulo: 'Error', mensaje: 'No se pudo actualizar el estado.', tipo: 'danger' });
    }
  } catch (error) {
    console.error(error);
  }
  cargando.value = false;
};

// Acciones Tabla (Historial en Modal)
const verHistorial = (pedido) => {
  arbitroHistorialNombre.value = `${pedido.apellido}, ${pedido.nombre}`;
  // Filtramos la lista completa (pedidos.value) para este árbitro y ordenamos por ID descendente
  historialArbitro.value = pedidos.value
    .filter(p => p.apellido === pedido.apellido && p.nombre === pedido.nombre)
    .sort((a, b) => b.id - a.id);
    
  mostrarModalHistorial.value = true;
};

const limpiarFiltros = () => {
  filtros.arbitro = '';
  filtros.prenda = '';
  filtros.estado = '';
  filtros.fecha = '';
};

// Estilos visuales
const obtenerClaseEstado = (estado) => {
  if (!estado) return 'estado-creado';
  switch (estado.toLowerCase()) {
    case 'creado': return 'estado-creado';
    case 'en proceso': return 'estado-proceso';
    case 'aceptado': return 'estado-aceptado';
    case 'entregado': return 'estado-entregado';
    case 'rechazado': return 'estado-rechazado';
    default: return 'estado-creado';
  }
};

// EXPORTACIÓN A EXCEL (DOBLE HOJA)
const exportarExcel = () => {
  if (pedidosFiltrados.value.length === 0) {
    notificar({ titulo: 'Tabla Vacía', mensaje: 'No hay datos para exportar.', tipo: 'warning' });
    return;
  }

  // HOJA 1: RESUMEN PARA COMPRA
  const pedidosActivos = pedidosFiltrados.value.filter(p => p.estado.toLowerCase() !== 'rechazado');
  const mapaAgrupado = {};
  
  pedidosActivos.forEach(p => {
    const key = `${p.descripcion}_${p.talle}`;
    if (!mapaAgrupado[key]) {
      mapaAgrupado[key] = { 
        'Prenda / Modelo': p.descripcion, 
        'Talle': p.talle, 
        'Cantidad Total a Pedir': 0 
      };
    }
    mapaAgrupado[key]['Cantidad Total a Pedir'] += Number(p.cantidad);
  });
  
  const datosHoja1 = Object.values(mapaAgrupado).sort((a, b) => a['Prenda / Modelo'].localeCompare(b['Prenda / Modelo']));
  const wsAgrupado = XLSX.utils.json_to_sheet(datosHoja1);

  // HOJA 2: DETALLE POR ÁRBITRO
  const mapaArbitros = {};
  
  pedidosFiltrados.value.forEach(p => {
    const nombreArbitro = `${p.apellido}, ${p.nombre}`;
    
    if (!mapaArbitros[nombreArbitro]) {
      mapaArbitros[nombreArbitro] = {
        'Árbitro': nombreArbitro,
        'IDs Pedidos': [],
        'Detalle de Prendas': [],
        'Total Prendas': 0,
        'Monto Total': 0,
        'Estados': new Set(),
        'Fecha (Último)': p.fecha_creacion || 'S/F'
      };
    }
    
    mapaArbitros[nombreArbitro]['IDs Pedidos'].push(`#${p.id}`);
    mapaArbitros[nombreArbitro]['Detalle de Prendas'].push(`${p.cantidad}x ${p.descripcion} (Talle: ${p.talle})`);
    mapaArbitros[nombreArbitro]['Total Prendas'] += Number(p.cantidad);
    mapaArbitros[nombreArbitro]['Monto Total'] += (p.cantidad * p.precioUnitario);
    mapaArbitros[nombreArbitro]['Estados'].add(p.estado.toUpperCase());
  });

  const datosHoja2 = Object.values(mapaArbitros).map(a => ({
    'Árbitro': a['Árbitro'],
    'Detalle del Pedido': a['Detalle de Prendas'].join('  |  '),
    'Prendas Totales': a['Total Prendas'],
    'Monto Total a Cobrar': `$${a['Monto Total']}`,
    'Estado(s)': Array.from(a['Estados']).join(', '),
    'Nro(s) de Pedido': a['IDs Pedidos'].join(', '),
    'Fecha de Registro': a['Fecha (Último)']
  }));
  
  datosHoja2.sort((a, b) => a['Árbitro'].localeCompare(b['Árbitro']));
  const wsDetallado = XLSX.utils.json_to_sheet(datosHoja2);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsAgrupado, "Resumen Proveedor (Compra)");
  XLSX.utils.book_append_sheet(wb, wsDetallado, "Detalle Individual");
  
  XLSX.writeFile(wb, "Reporte_Pedidos_AAAB.xlsx");
};

onMounted(obtenerPedidos);
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES Y CABECERA
   ==================================================== */
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; }
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; }
.header-section { background: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; }
.counter { font-size: 0.85rem; color: #000000; }
.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.75rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }
.btn-export { background: #10b981; color: white; }

.paginacion { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 12px; }
.btn-paginacion { border: none; background: #f8fafc; color: #0f172a; padding: 8px 14px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.btn-paginacion:disabled { opacity: 0.5; cursor: not-allowed; }
.paginacion-texto { color: white; font-size: 0.85rem; font-weight: 600; }

/* ====================================================
   TABLA DESKTOP ESTRUCTURA
   ==================================================== */
.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }
thead tr.main-header th { position: sticky; top: 0; z-index: 50; background: #f8fafc !important; padding: 12px 8px; border-bottom: 1px solid #cbd5e1; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0; }
thead tr.filter-row td { position: sticky; top: 35px; z-index: 40; background: #f1f5f9 !important; padding: 6px 8px 12px 8px; border-bottom: 4px solid #e2e8f0; margin: 0; }

/* COLUMNAS CONGELADAS */
.col-id { left: 0; width: 60px; text-align: center; }
.col-acciones { left: 60px; width: 90px; }
.col-arbitro { left: 150px; width: 220px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #f8fafc !important; }
thead tr.filter-row td.sticky-col { z-index: 95 !important; background-color: #f1f5f9 !important; }

.cell-ro { padding: 10px 8px; font-size: 0.85rem; color: #000; border-bottom: 1px solid #f1f5f9; }
.filter-input { font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; }

/* BOTONES TABLA */
.btn-editar { display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; padding: 4px; cursor: pointer; transition: 0.2s; border: none; background: #eff6ff; color: #1d4ed8; }
.btn-editar:hover { background: #dbeafe; }
.btn-historial { display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; padding: 4px; cursor: pointer; transition: 0.2s; border: none; background: #fef3c7; color: #d97706; }
.btn-historial:hover { background: #fde047; }
.btn-refresh { background: none; border: none; color: #64748b; cursor: pointer; }

/* BADGES DE ESTADOS CUSTOMIZADOS */
.badge-status-sm { padding: 4px 10px; border-radius: 12px; font-size: 0.65rem; font-weight: 700; white-space: nowrap; }
.estado-creado { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.estado-proceso { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
.estado-aceptado { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.estado-entregado { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.estado-rechazado { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

/* MODAL */
.modal-overlay-exito { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.modal-content-exito { background: white; border-radius: 20px; border: none; text-align: center; }
.icon-circle-exito { width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.bg-info-light { background: #e0f2fe; color: #0369a1; }

/* MOBILE / RESPONSIVE */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }
.btn-text { display: inline; }

.mobile-filter-panel { background: white; padding: 15px 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.filter-grid-mobile input, .filter-grid-mobile select { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 100%; outline: none; background: #f8fafc; }
.filter-grid-mobile select.full-width { grid-column: span 2; }

@media (max-width: 1024px) {
  .header-section { flex-direction: column; align-items: flex-start; gap: 15px; }
  .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; gap: 10px; }
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }

  .card-licencia { background: white; border-radius: 8px; padding: 15px; margin-bottom: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px; }
  .card-name { font-size: 1.05rem; color: #0f172a; }
  .card-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #475569; margin-bottom: 8px; }
  
  .btn-editar-mobile { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 10px; border-radius: 6px; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; }
  .btn-historial-mobile { background: #fef3c7; border: 1px solid #fde047; color: #d97706; padding: 10px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; width: 45px; }
}

@media (max-width: 600px) {
  .admin-panel { padding: 10px; }
  .header-section { padding: 10px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .title { font-size: 1rem; }
  .full-screen-wrapper { padding: 0 10px; width: 100vw; }
  .header-actions { width: 100%; display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: center; gap: 8px; }
  .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
  .btn-text { display: none !important; }
  .mobile-only-flex { display: flex !important; }
  .filter-grid-mobile { grid-template-columns: 1fr; }
  .filter-grid-mobile select.full-width { grid-column: span 1; }
}
</style>