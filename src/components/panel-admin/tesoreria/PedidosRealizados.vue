<template>
  <div class="full-screen-wrapper px-3 px-md-4">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white mb-4" style="border-radius: 15px; overflow: hidden;">

        <!-- HEADER RESPONSIVO -->
        <div class="card-header bg-white py-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom gap-3">
          <div class="border-start border-danger border-5 ps-3">
            <h4 class="text-danger fw-bold m-0 d-flex align-items-center gap-2 fs-5 fs-md-4">
              <i class="bi bi-cart-fill me-1"></i> Gestión de Pedidos
              <span v-if="pedidosNuevos > 0" class="badge bg-danger rounded-pill px-2 py-1 shadow-sm d-flex align-items-center animate__animated animate__pulse animate__infinite" style="font-size: 0.75rem;">
                <span class="material-icons me-1" style="font-size: 14px;">notifications_active</span>
                {{ pedidosNuevos }} Nuevo{{ pedidosNuevos > 1 ? 's' : '' }}
              </span>
            </h4>
            <span class="text-muted small d-block mt-1">Total: {{ pedidosFiltrados.length }} pedidos</span>
          </div>

          <div class="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-2 mt-md-0">
            <button @click="obtenerPedidos" :disabled="cargando" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2" title="Recargar">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary"></span>
              <span v-else class="material-icons text-dark fs-6">refresh</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Actualizar</span>
            </button>

            <!-- Botón Filtros (Solo Móvil) -->
            <button @click="mostrarFiltrosMobile = !mostrarFiltrosMobile" class="btn btn-primary d-md-none d-flex align-items-center gap-1 shadow-sm py-2">
              <span class="material-icons fs-6">filter_alt</span>
            </button>

            <button @click="limpiarFiltros" class="btn btn-light border shadow-sm py-2 d-flex align-items-center gap-2">
              <span class="material-icons text-dark fs-6">filter_alt_off</span>
              <span class="fw-bold text-dark d-none d-md-inline small">Limpiar</span>
            </button>

            <button @click="exportarExcel" class="btn btn-success shadow-sm py-2 d-flex align-items-center gap-2 text-white border-0">
              <span class="material-icons fs-6">download</span>
              <span class="fw-bold d-none d-md-inline small">Excel</span>
            </button>
          </div>
        </div>

        <!-- PANEL DE FILTROS UNIFICADO -->
        <div :class="['bg-light p-3 border-bottom', mostrarFiltrosMobile ? 'd-block' : 'd-none d-md-block']">
          <div class="d-flex justify-content-between align-items-center d-md-none mb-3">
            <span class="small fw-bold text-dark text-uppercase">Filtrar Pedidos</span>
            <button @click="mostrarFiltrosMobile = false" class="btn-close btn-sm"></button>
          </div>

          <div class="row g-2">
            <div class="col-6 col-md-3">
              <input v-model="filtros.arbitro" class="form-control form-control-sm shadow-none" placeholder="Buscar árbitro...">
            </div>
            <div class="col-6 col-md-3">
              <input v-model="filtros.prenda" class="form-control form-control-sm shadow-none" placeholder="Buscar prenda...">
            </div>
            <div class="col-6 col-md-3">
              <input v-model="filtros.fecha" class="form-control form-control-sm shadow-none text-md-center" placeholder="Fecha (DD/MM/YY)">
            </div>
            <div class="col-6 col-md-3">
              <select v-model="filtros.estado" class="form-select form-select-sm shadow-none font-monospace">
                <option value="">ESTADO (TODOS)</option>
                <option value="creado">CREADO</option>
                <option value="en proceso">EN PROCESO</option>
                <option value="aceptado">ACEPTADO</option>
                <option value="entregado">ENTREGADO</option>
                <option value="rechazado">RECHAZADO</option>
                <option value="cancelado">CANCELADO</option>
              </select>
            </div>
            <div class="col-12 d-md-none mt-2">
              <button @click="mostrarFiltrosMobile = false" class="btn btn-primary w-100 btn-sm fw-bold shadow-sm py-2">Aplicar Filtros</button>
            </div>
          </div>
        </div>

        <div class="card-body p-0 p-md-3 bg-white">

          <!-- TABLA (Solo Escritorio) -->
          <div class="d-none d-md-block table-responsive border rounded shadow-sm">
            <table class="table table-hover align-middle mb-0" style="font-size: 0.75rem;">
              <thead class="table-light">
                <tr>
                  <th class="py-3 ps-3 text-uppercase text-muted" style="font-size: 0.75rem; width: 1px;">ID</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Acciones</th>
                  <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Árbitro</th>
                  <th class="py-3 text-uppercase text-muted" style="font-size: 0.75rem;">Prenda Solicitada</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Cant.</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Total</th>
                  <th class="py-3 text-center text-uppercase text-muted" style="font-size: 0.75rem;">Fecha</th>
                  <th class="py-3 text-center pe-3 text-uppercase text-muted" style="font-size: 0.75rem;">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in pedidosPaginados" :key="p.id">
                  <td class="ps-3 text-muted fw-bold font-monospace">{{ p.id }}</td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="abrirModalEstado(p)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-primary" title="Cambiar Estado">
                        <span class="material-icons" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verHistorial(p)" class="btn btn-light btn-sm border shadow-sm rounded p-1 text-warning" title="Ver pedidos de este árbitro">
                        <span class="material-icons" style="font-size:16px;">person_search</span>
                      </button>
                    </div>
                  </td>
                  <td class="fw-bold text-uppercase text-dark">{{ p.apellido }}, {{ p.nombre }}</td>
                  <td class="text-dark">{{ p.descripcion }} <span class="fw-bold text-danger ms-1">({{ p.talle }})</span></td>
                  <td class="text-center fw-bold">{{ p.cantidad }}/{{ p.cantidad_encargada }}</td>
                  <td class="text-center fw-bold text-success">${{ (p.cantidad+p.cantidad_encargada) * p.precioUnitario }}</td>
                  <td class="text-center text-muted fw-bold">{{ p.fecha_creacion || 'S/F' }}</td>
                  <td class="text-center pe-3">
                    <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- CARDS (Solo Celular) -->
          <div class="d-md-none p-3 bg-light">
            <div v-for="p in pedidosPaginados" :key="'mob-'+p.id" class="card shadow-sm mb-3 border-light-subtle rounded-3">
              <div class="card-header bg-white border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="text-uppercase text-dark fw-bold" style="font-size: 1.05rem;">
                  {{ p.apellido }}, {{ p.nombre }}
                </div>
                <div class="small text-muted fw-bold font-monospace">
                  #{{ p.id }}
                </div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="mb-2">
                  <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]" style="font-size: 0.7rem; padding: 3px 10px;">{{ (p.estado || 'N/A').toUpperCase() }}</span>
                  <span class="ms-2 text-muted small fw-bold">{{ p.fecha_creacion || 'S/F' }}</span>
                </div>

                <div class="bg-light p-2 rounded border mt-2">
                  <p class="fw-bold m-0 text-dark">{{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span></p>
                  <div class="d-flex justify-content-between mt-1 border-top border-secondary-subtle pt-1">
                    <span class="text-dark small">Cant: <strong>{{ p.cantidad }}/{{ p.cantidad_encargada }}</strong></span>
                    <span class="text-success fw-bold small">Total: ${{ (p.cantidad+p.cantidad_encargada) * p.precioUnitario }}</span>
                  </div>
                </div>

                <div class="d-flex gap-2 mt-3">
                  <button @click="abrirModalEstado(p)" class="btn btn-sm btn-outline-primary flex-grow-1 shadow-sm d-flex justify-content-center align-items-center gap-1 fw-bold">
                    <span class="material-icons" style="font-size: 16px;">edit</span> ESTADO
                  </button>
                  <button @click="verHistorial(p)" class="btn btn-sm btn-outline-warning px-3 shadow-sm d-flex justify-content-center align-items-center" title="Ver sus pedidos">
                    <span class="material-icons" style="font-size: 18px;">person_search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- EMPTY STATE -->
          <div v-if="pedidosPaginados.length === 0" class="text-center p-4 p-md-5 bg-white rounded shadow-sm border m-3">
            <span class="material-icons text-muted opacity-50 d-block mb-2" style="font-size: 48px;">remove_shopping_cart</span>
            <p class="text-muted m-0 fw-bold">No hay ningún pedido registrado.</p>
          </div>

          <!-- PAGINACIÓN -->
          <div class="d-flex justify-content-center align-items-center gap-3 mt-4 mb-3" v-if="totalPaginas > 1">
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(-1)" :disabled="paginaActual <= 1">
              <i class="bi bi-chevron-left"></i> Ant
            </button>
            <span class="fw-bold text-dark small">Página {{ paginaActual }} de {{ totalPaginas }}</span>
            <button class="btn btn-light rounded-pill px-3 fw-bold shadow-sm border" @click="cambiarPagina(1)" :disabled="paginaActual >= totalPaginas">
              Sig <i class="bi bi-chevron-right"></i>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- ==============================================
         MODALES
         ============================================== -->

    <!-- MODAL GESTIONAR ESTADO -->
    <ModalBase
      :show="mostrarModal"
      @close="cerrarModal"
      titulo="Gestionar Pedido"
      icono="local_shipping"
      colorIcono="bg-info-subtle text-info"
      maxWidth="450px"
    >
      <div class="text-center mb-4">
        <p class="text-muted small mt-1 mb-0">Pedido #{{ pedidoActual?.id }} — {{ pedidoActual?.apellido }}, {{ pedidoActual?.nombre }}</p>
      </div>

      <div class="text-start bg-light p-3 rounded border mb-4 border-secondary-subtle shadow-sm">
        <p class="m-0 fw-bold small text-dark">{{ pedidoActual?.descripcion }} <span class="text-danger">({{ pedidoActual?.talle }})</span></p>
        <div class="d-flex justify-content-between mt-2 pt-2 border-top border-secondary-subtle">
          <span class="small text-muted">Fecha: <strong class="text-dark">{{ pedidoActual?.fecha_creacion || 'S/F' }}</strong></span>
          <span class="small text-muted">Cant: <strong class="text-dark">{{ (pedidoActual?.cantidad || 0) + (pedidoActual?.cantidad_encargada || 0) }}</strong></span>
          <span class="small text-muted">Total: <strong class="text-success">${{ ((pedidoActual?.cantidad || 0) + (pedidoActual?.cantidad_encargada || 0)) * (pedidoActual?.precioUnitario || 0) }}</strong></span>
        </div>
      </div>

      <div class="text-start">
        <label class="small fw-bold mb-2 text-dark text-uppercase">Actualizar Estado</label>
        <select v-model="nuevoEstado" class="form-select shadow-sm border-secondary-subtle fw-bold py-2">
          <option value="creado">CREADO (A PAGAR)</option>
          <option value="en proceso">EN PROCESO</option>
          <option value="aceptado">ACEPTADO (PREPARANDO)</option>
          <option value="entregado">ENTREGADO</option>
          <option value="rechazado">RECHAZADO (ADMIN)</option>
          <option value="cancelado">CANCELADO (ÁRBITRO)</option>
        </select>

        <div class="bg-light p-3 rounded mt-3 border shadow-sm">
          <p class="small text-muted m-0 lh-sm">
            * <strong class="text-dark">En Proceso:</strong> Verificas si hay stock.<br>
            * <strong class="text-dark">Aceptado:</strong> Hay stock disponible y recibís el pago.<br>
            * <strong class="text-dark">Entregado:</strong> Se descuenta el stock definitivamente.<br>
            * <strong class="text-dark">Rechazado/Cancelado:</strong> Se devuelve el stock a la base.
          </p>
        </div>
      </div>

      <template #footer>
        <button @click="cerrarModal" class="btn btn-light border px-4 fw-bold rounded-pill w-100 mb-2 mb-sm-0">CANCELAR</button>
        <button @click="guardarEstado" class="btn btn-dark px-4 fw-bold shadow-sm rounded-pill w-100" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR ESTADO
        </button>
      </template>
    </ModalBase>

    <!-- MODAL HISTORIAL -->
    <ModalBase
      :show="mostrarModalHistorial"
      @close="mostrarModalHistorial = false"
      icono="history"
      colorIcono="bg-warning-subtle text-warning"
      maxWidth="650px"
    >
      <template #header>
        <div class="d-flex align-items-center justify-content-center gap-2">
          Historial de {{ arbitroHistorialNombre }}
          <span class="badge bg-dark rounded-pill fs-6 d-flex align-items-center justify-content-center" style="min-width: 28px; min-height: 28px;">
            {{ historialArbitro.length }}
          </span>
        </div>
      </template>

      <!-- Tabla (Solo Escritorio) -->
      <div class="d-none d-md-block table-responsive border rounded shadow-sm m-0">
        <table class="table table-sm table-hover align-middle m-0" style="font-size: 0.75rem;">
          <thead class="table-light">
            <tr>
              <th class="py-2 ps-3 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Fecha</th>
              <th class="py-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Prenda</th>
              <th class="text-center py-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Cant</th>
              <th class="text-end py-2 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Total</th>
              <th class="text-center py-2 pe-3 fw-bold text-uppercase text-muted" style="font-size: 0.75rem;">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in historialArbitro" :key="h.id">
              <td class="text-nowrap text-muted fw-bold ps-3 py-3">{{ h.fecha_creacion || 'S/F' }}</td>
              <td class="py-3 text-dark">{{ h.descripcion }} <span class="text-danger fw-bold">({{ h.talle }})</span></td>
              <td class="text-center fw-bold py-3 text-dark">{{ h.cantidad }}/{{ h.cantidad_encargada }}</td>
              <td class="text-end fw-bold text-success py-3">${{ (h.cantidad + h.cantidad_encargada )* h.precioUnitario }}</td>
              <td class="text-center pe-3 py-3">
                <span :class="['badge-status-sm', obtenerClaseEstado(h.estado)]">{{ (h.estado || 'N/A').toUpperCase() }}</span>
              </td>
            </tr>
            <tr v-if="historialArbitro.length === 0">
              <td colspan="5" class="text-center py-4 text-muted fw-bold">No hay registros en el historial.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tarjetas (Solo Móvil) -->
      <div class="d-md-none d-flex flex-column gap-2">
        <div v-if="historialArbitro.length === 0" class="text-center py-4 text-muted bg-light border rounded">
          No hay registros en el historial.
        </div>

        <div v-for="h in historialArbitro" :key="h.id" class="bg-white border rounded shadow-sm p-3">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h6 class="fw-bold text-dark m-0 lh-sm pe-2" style="font-size: 0.75rem;">
              {{ h.descripcion }} <span class="text-danger">({{ h.talle }})</span>
            </h6>
            <span :class="['badge-status-sm', obtenerClaseEstado(h.estado)]">
              {{ (h.estado || 'N/A').toUpperCase() }}
            </span>
          </div>
          <div class="d-flex justify-content-between text-muted small border-top border-secondary-subtle pt-2">
            <span>{{ h.fecha_creacion || 'S/F' }}</span>
            <span>Cant: <strong class="text-dark">{{ h.cantidad }}/{{ h.cantidad_encargada }}</strong></span>
            <span class="text-success fw-bold">${{ (h.cantidad + h.cantidad_encargada )* h.precioUnitario }}</span>
          </div>
        </div>
      </div>
    </ModalBase>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, inject, watch } from 'vue';
import { api } from '@/api/api';
import * as XLSX from 'xlsx';
import { useHead } from '@vueuse/head';
import ModalBase from '@/components/ModalBase.vue';

useHead({
  title: 'Pedidos Realizados | AAAB',
  meta: [{ name: 'description', content: 'Administración de pedidos de indumentaria.' }],
});

const notificar = inject('notificar');

const pedidos = ref([]);
const cargando = ref(false);

const filtros = reactive({ arbitro: '', prenda: '', estado: '', fecha: '' });
const mostrarFiltrosMobile = ref(false);

const paginaActual = ref(1);
const registrosPorPagina = 10;

const mostrarModal = ref(false);
const pedidoActual = ref({});
const nuevoEstado = ref('');

const mostrarModalHistorial = ref(false);
const historialArbitro = ref([]);
const arbitroHistorialNombre = ref('');

const pedidosNuevos = computed(() => {
  return pedidos.value.filter(p => p.estado && p.estado.toLowerCase() === 'creado').length;
});

const normalizar = (t) => t ? t.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

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

const cambiarPagina = (delta) => {
  if (paginaActual.value + delta >= 1 && paginaActual.value + delta <= totalPaginas.value) {
    paginaActual.value += delta;
    setTimeout(() => {
      if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  }
};

watch(filtros, () => { paginaActual.value = 1 }, { deep: true });
watch(totalPaginas, (nuevo) => { if(paginaActual.value > nuevo) paginaActual.value = nuevo });

const obtenerPedidos = async () => {
  cargando.value = true;
  try {
    const res = await api.get({ entity: 'indumentaria', action: 'obtenerPedidos' });
    if (res.ok) {
      pedidos.value = res.payload.sort((a, b) => b.id - a.id);
    }
  } catch {
    notificar({ titulo: 'Error', mensaje: 'Problema al cargar los pedidos.', tipo: 'danger' });
  }
  cargando.value = false;
};

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
    // ACÁ ESTÁ EL CAMBIO DE LA NOTIFICACIÓN DE ERROR
    notificar({ titulo: 'Error de conexión', mensaje: 'Ocurrió un problema al intentar guardar los cambios.', tipo: 'danger' });
  }
  cargando.value = false;
};

const verHistorial = (pedido) => {
  arbitroHistorialNombre.value = `${pedido.apellido}, ${pedido.nombre}`;
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

const obtenerClaseEstado = (estado) => {
  if (!estado) return 'estado-creado';
  switch (estado.toLowerCase()) {
    case 'creado': return 'estado-creado';
    case 'en proceso': return 'estado-proceso';
    case 'aceptado': return 'estado-aceptado';
    case 'entregado': return 'estado-entregado';
    case 'rechazado': return 'estado-rechazado';
    case 'cancelado': return 'estado-cancelado';
    default: return 'estado-creado';
  }
};

const exportarExcel = () => {
  if (pedidosFiltrados.value.length === 0) {
    notificar({ titulo: 'Tabla Vacía', mensaje: 'No hay datos para exportar.', tipo: 'warning' });
    return;
  }

  // --- HOJA 1: RESUMEN PROVEEDOR (FABRICAR) - SE MANTIENE AGRUPADO ---
  const pedidosAProducir = pedidosFiltrados.value.filter(p =>
    p.estado.toLowerCase() !== 'rechazado' &&
    p.estado.toLowerCase() !== 'cancelado' &&
    Number(p.cantidad_encargada) > 0
  );

  const mapaAgrupado = {};

  pedidosAProducir.forEach(p => {
    const key = `${p.descripcion}_${p.talle}`;
    if (!mapaAgrupado[key]) {
      mapaAgrupado[key] = {
        'Prenda / Modelo': p.descripcion,
        'Talle': p.talle,
        'Cantidad a Fabricar': 0
      };
    }
    mapaAgrupado[key]['Cantidad a Fabricar'] += Number(p.cantidad_encargada);
  });

  const datosHoja1 = Object.values(mapaAgrupado).sort((a, b) => a['Prenda / Modelo'].localeCompare(b['Prenda / Modelo']));
  const wsAgrupado = XLSX.utils.json_to_sheet(datosHoja1);



  const pedidosActivosDetalle = pedidosFiltrados.value.filter(p =>
    p.estado.toLowerCase() !== 'rechazado' &&
    p.estado.toLowerCase() !== 'cancelado'
  );


  const datosHoja2 = pedidosActivosDetalle.map(p => {
    const nombreArbitro = `${p.apellido}, ${p.nombre}`;
    const cantidadTotal = Number(p.cantidad) + Number(p.cantidad_encargada);
    const montoCalculado = cantidadTotal * p.precioUnitario;

    return {
      'Árbitro': nombreArbitro,
      'Detalle del Pedido': `${cantidadTotal}x ${p.descripcion} (Talle: ${p.talle})`,
      'Prendas Totales': cantidadTotal,
      'Monto Total a Cobrar': `$${montoCalculado}`, // Aquí agregamos el signo pesos solicitado
      'Estado(s)': p.estado.toUpperCase(),
      'Nro(s) de Pedido': `#${p.id}`,
      'Fecha de Registro': p.fecha_creacion || 'S/F'
    };
  });

  // Ordenamos para que los pedidos del mismo árbitro aparezcan uno debajo del otro
  datosHoja2.sort((a, b) => a['Árbitro'].localeCompare(b['Árbitro']));
  const wsDetallado = XLSX.utils.json_to_sheet(datosHoja2);

  // --- GENERACIÓN DEL ARCHIVO ---
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsAgrupado, "Resumen Proveedor (Fabricar)");
  XLSX.utils.book_append_sheet(wb, wsDetallado, "Detalle Individual a Cobrar");

  XLSX.writeFile(wb, "Reporte_Pedidos_AAAB.xlsx");
};

onMounted(obtenerPedidos);
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

/* ====================================================
   BADGES DE ESTADOS CUSTOMIZADOS
   ==================================================== */
.badge-status-sm {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
}
.estado-creado { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
.estado-proceso { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
.estado-aceptado { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
.estado-entregado { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.estado-rechazado { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

/* ====================================================
   UTILIDADES
   ==================================================== */
.animate__animated { animation-duration: 0.5s; }

</style>
