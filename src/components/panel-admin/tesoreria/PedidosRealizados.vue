<template>
  <div class="full-screen-wrapper">
    <div class="admin-panel animate__animated animate__fadeIn">

      <div class="card shadow border-0 w-100 mx-auto bg-white" style="border-radius: 12px; overflow: hidden;">

        <div class="header-section border-bottom" style="margin-bottom: 0; box-shadow: none; border-radius: 0; padding: 20px;">
          <div class="header-info">
            <h4 class="title text-danger fw-bold m-0 d-flex align-items-center gap-2 flex-wrap" style="font-size: 1.25rem;">
              <i class="bi bi-cart-fill me-1"></i> Gestión de Pedidos
              <span v-if="pedidosNuevos > 0" class="badge bg-danger rounded-pill px-2 py-1 fs-6 d-flex align-items-center animate__animated animate__pulse">
                <span class="material-icons me-1" style="font-size: 14px;">notifications_active</span>
                {{ pedidosNuevos }} Nuevo{{ pedidosNuevos > 1 ? 's' : '' }}
              </span>
            </h4>
            <span class="counter mt-1 d-block text-muted">Total: {{ pedidosFiltrados.length }} pedidos</span>
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

        <div v-if="mostrarFiltrosMobile" class="mobile-filter-panel mobile-only animate__animated animate__fadeInDown animate__faster shadow-sm" style="border-radius: 0; border-left: 0; border-right: 0; margin-bottom: 0; background-color: #e2e8f0; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; box-shadow: none;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="small fw-bold text-dark text-uppercase" style="letter-spacing: 0.5px;">FILTRAR PEDIDOS</span>
            <button @click="mostrarFiltrosMobile = false" class="btn btn-sm btn-light border-0 p-1" style="line-height: 1; background: transparent;">
              <span class="material-icons" style="font-size: 20px;">close</span>
            </button>
          </div>

          <div class="filter-grid-mobile">
            <input v-model="filtros.arbitro" class="filter-input-mobile" placeholder="Buscar árbitro...">
            <input v-model="filtros.prenda" class="filter-input-mobile" placeholder="Buscar prenda...">
            <input v-model="filtros.fecha" class="filter-input-mobile" placeholder="Fecha (DD/MM/YY)...">

            <select v-model="filtros.estado" class="filter-input-mobile full-width">
              <option value="">Estado (Todos)</option>
              <option value="creado">Creado</option>
              <option value="en proceso">En Proceso</option>
              <option value="aceptado">Aceptado</option>
              <option value="entregado">Entregado</option>
              <option value="rechazado">Rechazado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <button @click="mostrarFiltrosMobile = false" class="btn-blue w-100 mt-3 py-2 rounded fw-bold border-0 shadow-sm" style="font-size: 0.95rem;">Aplicar Filtros</button>
        </div>

        <div class="card-body p-3 p-md-4">

          <div class="table-container shadow-sm desktop-only border" style="border-radius: 8px;">
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
                  <td class="sticky-col col-id text-center">
                    <button @click="obtenerPedidos" :disabled="cargando" class="btn-refresh mx-auto d-flex align-items-center justify-content-center" title="Recargar">
                      <span v-if="cargando" class="spinner-border spinner-border-sm text-secondary" style="width: 16px; height: 16px; border-width: 2px;"></span>
                      <span v-else class="material-icons" style="font-size: 16px;">refresh</span>
                    </button>
                  </td>
                  <td class="sticky-col col-acciones"></td>
                  <td class="sticky-col col-arbitro"><input v-model="filtros.arbitro" class="filter-input shadow-none" placeholder="Filtrar.."></td>
                  <td><input v-model="filtros.prenda" class="filter-input shadow-none" placeholder="Filtrar prenda.."></td>
                  <td></td>
                  <td></td>
                  <td><input v-model="filtros.fecha" class="filter-input shadow-none text-center" placeholder="DD/MM/YY"></td>
                  <td>
                    <select v-model="filtros.estado" class="filter-input shadow-none text-center">
                      <option value="">TODOS</option>
                      <option value="creado">CREADO</option>
                      <option value="en proceso">EN PROCESO</option>
                      <option value="aceptado">ACEPTADO</option>
                      <option value="entregado">ENTREGADO</option>
                      <option value="rechazado">RECHAZADO</option>
                      <option value="cancelado">CANCELADO</option>
                    </select>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in pedidosPaginados" :key="p.id" class="row-hover">
                  <td class="sticky-col col-id cell-ro text-center text-muted fw-bold">{{ p.id }}</td>
                  <td class="sticky-col col-acciones cell-ro text-center">
                    <div class="d-flex justify-content-center gap-1">
                      <button @click="abrirModalEstado(p)" class="btn-editar border shadow-sm rounded p-1" title="Cambiar Estado">
                        <span class="material-icons text-primary" style="font-size:16px;">edit</span>
                      </button>
                      <button @click="verHistorial(p)" class="btn-historial border shadow-sm rounded p-1" title="Ver pedidos de este árbitro">
                        <span class="material-icons text-warning" style="font-size:16px;">person_search</span>
                      </button>
                    </div>
                  </td>
                  <td class="sticky-col col-arbitro cell-ro fw-bold text-uppercase text-dark">{{ p.apellido }}, {{ p.nombre }}</td>
                  <td class="cell-ro text-dark">{{ p.descripcion }} <span class="fw-bold text-danger ms-1">({{ p.talle }})</span></td>
                  <td class="text-center cell-ro fw-bold">{{ p.cantidad }}/{{ p.cantidad_encargada }}</td>
                  <td class="text-center cell-ro fw-bold text-success">$ {{ (p.cantidad+p.cantidad_encargada) * p.precioUnitario }}</td>
                  <td class="text-center cell-ro text-muted fw-bold">{{ p.fecha_creacion || 'S/F' }}</td>
                  <td class="text-center cell-ro">
                    <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]">{{ (p.estado || 'N/A').toUpperCase() }}</span>
                  </td>
                </tr>

                <tr v-if="pedidosPaginados.length === 0">
                  <td colspan="8" class="text-center py-5 text-muted bg-light italic border-0">
                    <span class="material-icons d-block mb-2" style="font-size: 40px;">remove_shopping_cart</span>
                    <p class="m-0 fw-bold">No hay ningún pedido registrado.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-only mt-3">
            <div v-for="p in pedidosPaginados" :key="'mob-'+p.id" class="card-licencia border-light-subtle shadow-sm mb-3 bg-white rounded">
              <div class="card-header border-bottom-0 pb-1 px-3 pt-3 d-flex justify-content-between align-items-start">
                <div class="card-name text-uppercase text-dark fw-bold" style="font-size: 1.05rem;">
                  {{ p.apellido }}, {{ p.nombre }}
                </div>
                <div class="text-xs text-muted fw-bold">
                  #{{ p.id }} <span class="mx-1">•</span> {{ p.fecha_creacion || 'S/F' }}
                </div>
              </div>

              <div class="card-body pt-0 px-3 pb-3">
                <div class="card-row mb-2">
                  <span :class="['badge-status-sm', obtenerClaseEstado(p.estado)]" style="font-size: 0.7rem; padding: 3px 10px;">{{ (p.estado || 'N/A').toUpperCase() }}</span>
                </div>

                <div class="card-info bg-light p-2 rounded border mt-2">
                  <p class="fw-bold m-0 text-dark">{{ p.descripcion }} <span class="text-danger">({{ p.talle }})</span></p>
                  <div class="d-flex justify-content-between mt-1 border-top border-secondary-subtle pt-1">
                    <span class="text-dark small">Cant: <strong>{{ p.cantidad }}</strong></span>
                    <span class="text-success fw-bold small">Total: ${{ p.cantidad * p.precioUnitario }}</span>
                  </div>
                </div>

                <div class="d-flex gap-2 mt-3">
                  <button @click="abrirModalEstado(p)" class="btn-editar-mobile flex-grow-1 border shadow-sm">
                    <span class="material-icons" style="font-size: 18px;">edit</span> Estado
                  </button>
                  <button @click="verHistorial(p)" class="btn-historial-mobile border shadow-sm px-3" title="Ver sus pedidos">
                    <span class="material-icons" style="font-size: 18px;">person_search</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="pedidosPaginados.length === 0" class="text-center p-4 bg-light rounded shadow-sm border mt-3">
              <span class="material-icons text-muted" style="font-size: 40px;">remove_shopping_cart</span>
              <p class="text-muted mt-2 mb-0 fw-bold">No hay ningún pedido registrado.</p>
            </div>
          </div>

          <div
            class="d-flex justify-content-center align-items-center gap-3 mt-4"
            v-if="totalPaginas > 1"
          >
            <button
              class="btn btn-light rounded-pill px-3 fw-bold shadow-sm"
              @click="cambiarPagina(-1)"
              :disabled="paginaActual <= 1"
            >
              <i class="bi bi-chevron-left"></i> Ant
            </button>

            <span class="fw-bold text-dark small">
              Página {{ paginaActual }} de {{ totalPaginas }}
            </span>

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
    </div>

    <ModalBase
      :show="mostrarModal"
      @close="cerrarModal"
      titulo="Gestionar Pedido"
      icono="local_shipping"
      colorIcono="bg-info text-white"
      maxWidth="450px"
    >
      <div class="text-center mb-4">
        <p class="text-muted small mt-1 mb-0">Pedido #{{ pedidoActual.id }} — {{ pedidoActual.apellido }}, {{ pedidoActual.nombre }}</p>
      </div>

      <div class="text-start bg-light p-3 rounded border mb-4 border-secondary-subtle">
        <p class="m-0 fw-bold small text-dark">{{ pedidoActual.descripcion }} ({{ pedidoActual.talle }})</p>
        <p class="m-0 small text-muted mt-1">
          Fecha: <strong class="text-dark">{{ pedidoActual.fecha_creacion || 'S/F' }}</strong> |
          Cant: <strong class="text-dark">{{ pedidoActual.cantidad + pedidoActual.cantidad_encargada}}</strong> |
          Total: <strong class="text-success">${{ (pedidoActual.cantidad+pedidoActual.cantidad_encargada) * pedidoActual.precioUnitario }}</strong>
        </p>
      </div>

      <div class="text-start">
        <label class="small fw-bold mb-1 text-dark">Actualizar Estado</label>
        <select v-model="nuevoEstado" class="form-select shadow-none border-primary-subtle fw-bold custom-input">
          <option value="creado">Creado (A Pagar)</option>
          <option value="en proceso">En Proceso</option>
          <option value="aceptado">Aceptado (Preparando)</option>
          <option value="entregado">Entregado</option>
          <option value="rechazado">Rechazado (Admin)</option>
          <option value="cancelado">Cancelado (Árbitro)</option>
        </select>
        <p class="extra-small text-muted mt-2 mb-0" style="font-size: 0.75rem;">
          * <b>En Proceso:</b> Verificas si hay stock.<br>
          * <b>Aceptado:</b> Hay stock disponible y recibís el pago<br>
          * <b>Entregado:</b> Una vez entregado se descuenta el stock definitivamente.<br>
          * <b>Rechazado/Cancelado:</b> No hay stock o se anula. Se devuelve el stock a la base.
        </p>
      </div>

      <template #footer>
        <button @click="cerrarModal" class="btn btn-light rounded-pill px-4 fw-bold flex-grow-1" style="background: #e2e8f0; border: 1px solid #e2e8f0;">CANCELAR</button>
        <button @click="guardarEstado" class="btn btn-dark rounded-pill px-4 fw-bold shadow-sm flex-grow-1" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
          GUARDAR
        </button>
      </template>
    </ModalBase>

    <ModalBase
  :show="mostrarModalHistorial"
  @close="mostrarModalHistorial = false"
  icono="history"
  colorIcono="bg-warning text-dark"
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

  <div class="desktop-only table-responsive border rounded shadow-sm m-0">
    <table class="table table-sm table-hover align-middle m-0" style="font-size: 0.85rem;">
      <thead class="table-light" style="border-bottom: 2px solid #e2e8f0;">
        <tr>
          <th class="py-2 ps-3 fw-bold text-uppercase" style="font-size: 0.75rem;">Fecha</th>
          <th class="py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Prenda</th>
          <th class="text-center py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Cant</th>
          <th class="text-end py-2 fw-bold text-uppercase" style="font-size: 0.75rem;">Total</th>
          <th class="text-center py-2 pe-3 fw-bold text-uppercase" style="font-size: 0.75rem;">Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in historialArbitro" :key="h.id" style="border-bottom: 1px solid #f1f5f9;">
          <td class="text-nowrap text-muted fw-bold ps-3 py-3">{{ h.fecha_creacion || 'S/F' }}</td>
          <td class="py-3 text-dark">{{ h.descripcion }} <span class="text-danger fw-bold">({{ h.talle }})</span></td>
          <td class="text-center fw-bold py-3 text-dark">{{ h.cantidad }}/{{ h.cantidad_encargada }}</td>
          <td class="text-end fw-bold text-success py-3">${{ (h.cantidad + h.cantidad_encargada )* h.precioUnitario }}</td>
          <td class="text-center pe-3 py-3">
            <span :class="['badge-status-sm', obtenerClaseEstado(h.estado)]">{{ (h.estado || 'N/A').toUpperCase() }}</span>
          </td>
        </tr>
        <tr v-if="historialArbitro.length === 0">
          <td colspan="5" class="text-center py-4 text-muted">No hay registros en el historial.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="mobile-only">
    <div v-if="historialArbitro.length === 0" class="text-center py-4 text-muted">
      No hay registros en el historial.
    </div>

    <div
      v-for="h in historialArbitro"
      :key="h.id"
      class="card-licencia"
    >
      <div class="card-header border-0 pb-2 mb-2 d-flex justify-content-between align-items-start">
        <div class="card-name fw-bold lh-sm text-dark pe-2">
          {{ h.descripcion }}
          <span class="text-danger">({{ h.talle }})</span>
        </div>
        <div>
          <span :class="['badge-status-sm', obtenerClaseEstado(h.estado)]">
            {{ (h.estado || 'N/A').toUpperCase() }}
          </span>
        </div>
      </div>

      <div class="px-1">
        <div class="card-row border-bottom pb-2 mb-2">
          <span class="fw-bold text-dark">Fecha:</span>
          <span>{{ h.fecha_creacion || 'S/F' }}</span>
        </div>
        <div class="card-row border-bottom pb-2 mb-2">
          <span class="fw-bold text-dark">Cantidad:</span>
          <span class="fw-bold">{{ h.cantidad }}/{{ h.cantidad_encargada }}</span>
        </div>
        <div class="card-row mb-0">
          <span class="fw-bold text-dark">Total:</span>
          <span class="text-success fw-bold fs-6">${{ (h.cantidad+h.cantidad_encargada) * h.precioUnitario }}</span>
        </div>
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

  // Filtramos los rechazados/cancelados y además los que no tienen cantidad encargada
  const pedidosAProducir = pedidosFiltrados.value.filter(p =>
    p.estado.toLowerCase() !== 'rechazado' &&
    p.estado.toLowerCase() !== 'cancelado' &&
    Number(p.cantidad_encargada) > 0
  );

  const mapaAgrupado = {};

  // ACÁ ESTÁ EL CAMBIO PARA SUMAR SOLO LO QUE SE ENCARGA (Hoja Proveedor)
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

  // La hoja 2 (Detalle) la dejamos con los totales porque entiendo que eso es lo que el árbitro termina pagando (stock + encargo)
  const mapaArbitros = {};
  const pedidosActivosDetalle = pedidosFiltrados.value.filter(p => p.estado.toLowerCase() !== 'rechazado' && p.estado.toLowerCase() !== 'cancelado');

  pedidosActivosDetalle.forEach(p => {
    const nombreArbitro = `${p.apellido}, ${p.nombre}`;

    if (!mapaArbitros[nombreArbitro]) {
      mapaArbitros[nombreArbitro] = {
        'Árbitro': nombreArbitro,
        'IDs Pedidos': [],
        'Detalle de Prendas': [],
        'Total Prendas (Stock + Encargo)': 0,
        'Monto Total': 0,
        'Estados': new Set(),
        'Fecha (Último)': p.fecha_creacion || 'S/F'
      };
    }

    const cantidadTotal = Number(p.cantidad) + Number(p.cantidad_encargada);

    mapaArbitros[nombreArbitro]['IDs Pedidos'].push(`#${p.id}`);
    mapaArbitros[nombreArbitro]['Detalle de Prendas'].push(`${cantidadTotal}x ${p.descripcion} (Talle: ${p.talle})`);
    mapaArbitros[nombreArbitro]['Total Prendas (Stock + Encargo)'] += cantidadTotal;
    mapaArbitros[nombreArbitro]['Monto Total'] += (cantidadTotal * p.precioUnitario);
    mapaArbitros[nombreArbitro]['Estados'].add(p.estado.toUpperCase());
  });

  const datosHoja2 = Object.values(mapaArbitros).map(a => ({
    'Árbitro': a['Árbitro'],
    'Detalle del Pedido': a['Detalle de Prendas'].join('  |  '),
    'Prendas Totales': a['Total Prendas (Stock + Encargo)'],
    'Monto Total a Cobrar': `$${a['Monto Total']}`,
    'Estado(s)': Array.from(a['Estados']).join(', '),
    'Nro(s) de Pedido': a['IDs Pedidos'].join(', '),
    'Fecha de Registro': a['Fecha (Último)']
  }));

  datosHoja2.sort((a, b) => a['Árbitro'].localeCompare(b['Árbitro']));
  const wsDetallado = XLSX.utils.json_to_sheet(datosHoja2);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsAgrupado, "Resumen Proveedor (Fabricar)");
  XLSX.utils.book_append_sheet(wb, wsDetallado, "Detalle Individual a Cobrar");

  XLSX.writeFile(wb, "Reporte_Pedidos_AAAB.xlsx");
};

onMounted(obtenerPedidos);
</script>

<style scoped>
/* ====================================================
   ESTILOS GENERALES Y CABECERA
   ==================================================== */
.full-screen-wrapper { position: relative; width: 99vw; min-height: 100vh; height: auto !important; margin-left: 50%; transform: translateX(-50%); padding: 20px; padding-bottom: 120px; box-sizing: border-box;}
.admin-panel { width: 100%; max-width: 100%; padding: 20px; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; color: #000; background-color: #0f172a; min-height: 100vh; border-radius: 12px;}

.header-section { background: white; padding: 15px 25px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 15px; border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center; }
.title { font-size: 1.1rem; font-weight: bold; margin: 0; color: #000;}
.counter { font-size: 0.85rem; color: #64748b; }

.header-actions { display: flex; gap: 8px; }
.btn-action { border: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.85rem; transition: opacity 0.2s; }
.btn-clear { background: #e2e8f0; color: #000; }
.btn-blue { background: #3b82f6; color: white; }
.btn-export { background: #10b981; color: white; }

/* ====================================================
   TABLA DESKTOP ESTRUCTURA
   ==================================================== */
.table-container { width: 100%; overflow: auto; max-height: 85vh; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
table { width: 100%; min-width: max-content; border-collapse: separate !important; border-spacing: 0; font-size: 0.85rem; }
thead tr.main-header th { position: sticky; top: 0; z-index: 50; background: #e2e8f0 !important; padding: 12px 8px; border-bottom: 1px solid #cbd5e1; font-family: 'segoe ui', Tahoma, Verdana, sans-serif; font-size: 0.75rem; color: #000; text-transform: uppercase; font-weight: 800; margin: 0; }
thead tr.filter-row td { position: sticky; top: 35px; z-index: 40; background: #f1f5f9 !important; padding: 6px 8px 12px 8px; border-bottom: 4px solid #e2e8f0; margin: 0; }

/* COLUMNAS CONGELADAS */
.col-id { left: 0; width: 60px; text-align: center; }
.col-acciones { left: 60px; width: 90px; }
.col-arbitro { left: 150px; width: 220px; box-shadow: 4px 0 8px -4px rgba(0,0,0,0.1); }
.sticky-col { position: sticky !important; z-index: 60 !important; background: white !important; border-right: 1px solid #e2e8f0; }
thead tr.main-header th.sticky-col { z-index: 100 !important; background-color: #e2e8f0 !important; }
thead tr.filter-row td.sticky-col { z-index: 95 !important; background-color: #f1f5f9 !important; }

.cell-ro { padding: 10px 8px; font-size: 0.85rem; color: #000; border-bottom: 1px solid #f1f5f9; }
.filter-input { font-size: 16px; height: 32px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; width: 100%; outline: none;}
@media (min-width: 769px) { .filter-input { font-size: 0.75rem; height: 28px; } }

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

/* INPUTS DEL MODAL */
.custom-input { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; font-size: 0.95rem; background-color: #ffffff; transition: all 0.3s ease; }
.custom-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); outline: none; }

/* MOBILE / RESPONSIVE */
.desktop-only { display: block; }
.mobile-only { display: none; }
.mobile-only-flex { display: none; }
.btn-text { display: inline; }

.mobile-filter-panel { background: #e2e8f0; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; }
.filter-grid-mobile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.filter-input-mobile {
  padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px;
  font-size: 12px; width: 100%; outline: none; background: #ffffff; color: #334155;
}

.filter-grid-mobile select.full-width { grid-column: span 2; }

@media (min-width: 769px) {
  .filter-input-mobile { font-size: 0.85rem; }
}

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
  .btn-historial-mobile { background: #fef3c7; border: 1px solid #fde047; color: #d97706; padding: 10px 14px; border-radius: 6px; display: flex; justify-content: center; align-items: center; cursor: pointer; width: 45px; }
}

@media (max-width: 600px) {
  .full-screen-wrapper {
    position: relative;
    width: 99vw;
    min-height: 100vh;
    height: auto;
    margin-left: 50%;
    transform: translateX(-50%);
    padding: 0 15px 20px 15px !important;
    box-sizing: border-box !important;
  }

  .admin-panel {
    padding: 0 !important;
    border-radius: 0;
    box-sizing: border-box !important;
  }

  .header-section { padding: 15px; flex-direction: column; align-items: flex-start; text-align: left; gap: 15px; }
  .header-info { display: flex; flex-direction: column; align-items: flex-start; width: 100%;}
  .header-info h4 { font-size: 1.25rem !important; justify-content: flex-start; }
  .header-info span.counter { font-size: 0.75rem !important; }

  .header-actions { width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 8px; }
  .btn-action { flex: none; width: 42px; height: 42px; padding: 0; justify-content: center; }
  .btn-action span.material-icons { margin: 0; }
  .btn-text { display: none !important; }
  .mobile-only-flex { display: flex !important; }

  .filter-grid-mobile { grid-template-columns: 1fr; }
  .filter-grid-mobile select.full-width { grid-column: span 1; }
}

.animate__animated { animation-duration: 0.5s; }
</style>
