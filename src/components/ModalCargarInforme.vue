<template>
  <ModalBase :show="show" @close="cerrar" titulo="Cargar informe" icono="note_add" colorIcono="bg-danger text-white" maxWidth="680px">
    <div class="text-start">
      <p class="text-muted small mb-3">
        Cargá un informe manualmente cuando el árbitro no lo hizo. Seleccioná el partido y completá los datos.
      </p>

      <!-- DATOS DEL PARTIDO -->
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Género *</label>
          <select v-model="carga.genero" class="form-select form-select-sm shadow-none">
            <option value="" disabled>Seleccioná</option>
            <option value="Caballeros">Caballeros</option>
            <option value="Damas">Damas</option>
          </select>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Categoría *</label>
          <select v-model="carga.tipo" class="form-select form-select-sm shadow-none">
            <option value="" disabled>Seleccioná</option>
            <option value="Mayores">Mayores</option>
            <option value="Inferiores">Inferiores</option>
          </select>
        </div>

        <!-- Mayores: competencia -->
        <div v-if="carga.tipo === 'Mayores'" class="col-12">
          <label class="form-label small fw-bold text-dark mb-1">Competencia (Mayores) *</label>
          <select @change="seleccionarCategoriaCarga" v-model="carga.inf_nivel" class="form-select form-select-sm shadow-none" :disabled="cargandoCat">
            <option value="" disabled>{{ cargandoCat ? 'Cargando...' : 'Seleccioná competencia' }}</option>
            <option v-for="(div, k) in divisionesMayoresCarga" :key="k" :value="div.idCategoria">{{ div.division }}</option>
          </select>
        </div>

        <!-- Inferiores: categoría específica + nivel -->
        <template v-if="carga.tipo === 'Inferiores'">
          <div class="col-12 col-md-8">
            <label class="form-label small fw-bold text-dark mb-1">Categoría específica *</label>
            <select @change="setDivisionesCarga" v-model="carga.id_categoria_especifica" class="form-select form-select-sm shadow-none" :disabled="cargandoCat">
              <option value="" disabled>{{ cargandoCat ? 'Cargando...' : 'Seleccioná categoría' }}</option>
              <option v-for="(cat, k) in listasCarga.divisiones_categorias" :key="k" :value="k">{{ cat.categoria }}</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label small fw-bold text-dark mb-1">Nivel *</label>
            <select @change="seleccionarCategoriaCarga" v-model="carga.inf_nivel" class="form-select form-select-sm shadow-none">
              <option value="" disabled>Nivel</option>
              <option v-for="opt in listasCarga.divisiones" :key="opt.idCategoria" :value="opt.idCategoria">{{ opt.division }}</option>
            </select>
          </div>
        </template>

        <!-- Fecha -->
        <div v-if="idCategoriaCarga" class="col-12 col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Fecha del partido *</label>
          <input type="date" @change="obtenerPartidosCarga" v-model="fechaPartidoCarga" class="form-control form-control-sm shadow-none">
        </div>

        <!-- Partido -->
        <div v-if="fechaPartidoCarga" class="col-12 col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Partido *</label>
          <select v-model="idPartidoCarga" class="form-select form-select-sm shadow-none" :disabled="cargandoPartidos">
            <option :value="null" disabled>{{ cargandoPartidos ? 'Cargando...' : (partidosCarga.length ? 'Seleccioná partido' : 'No hay partidos para esa fecha') }}</option>
            <option v-for="p in partidosCarga" :key="p.id" :value="p.id">{{ p.local }} vs {{ p.visitante }}</option>
          </select>
        </div>
      </div>

      <!-- Árbitros del partido (solo lectura) -->
      <div v-if="partidoCargaSel" class="mt-3 p-2 bg-light border rounded small">
        <div class="fw-bold text-muted mb-1"><i class="bi bi-person-badge me-1"></i>Árbitros designados</div>
        <div>{{ arbitrosPartidoCarga || 'Sin designar' }}</div>
      </div>

      <hr class="my-3">

      <!-- DATOS DEL INFORME -->
      <div class="row g-3" v-if="partidoCargaSel">
        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Torneo *</label>
          <select v-model="carga.torneo" class="form-select form-select-sm shadow-none">
            <option value="" disabled>Seleccioná</option>
            <option v-for="t in opcionesTorneo" :key="t.valor" :value="t.valor">{{ t.etiqueta }}</option>
          </select>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Institución del implicado *</label>
          <select v-model="carga.institucion" class="form-select form-select-sm shadow-none">
            <option value="" disabled>Seleccioná</option>
            <option value="local">{{ partidoCargaSel.local }} (Local)</option>
            <option value="visitante">{{ partidoCargaSel.visitante }} (Visitante)</option>
          </select>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Implicado *</label>
          <input type="text" v-model="carga.implicado" class="form-control form-control-sm shadow-none" placeholder="Nombre del implicado">
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Sanción *</label>
          <input type="text" v-model="carga.sancion" class="form-control form-control-sm shadow-none" placeholder="Sanción aplicada">
        </div>
        <div class="col-12">
          <label class="form-label small fw-bold text-dark mb-1">Motivo y descripción *</label>
          <textarea v-model="carga.motivo_descripcion" class="form-control shadow-none" rows="4" placeholder="Describí el motivo del informe..."></textarea>
        </div>

        <!-- Archivos -->
        <div class="col-12">
          <label class="form-label small fw-bold text-dark mb-1">
            <i class="bi bi-paperclip me-1"></i>Archivos adjuntos <span class="text-muted fw-normal">(opcional)</span>
          </label>
          <input ref="inputArchivosCarga" type="file" class="form-control form-control-sm shadow-none" multiple @change="onArchivosCarga">
          <p class="text-muted small mt-1 mb-2">Máx. 10&nbsp;MB por archivo.</p>
          <ul v-if="carga.archivos.length" class="list-group list-group-flush border rounded">
            <li v-for="(arc, idx) in carga.archivos" :key="idx" class="list-group-item d-flex justify-content-between align-items-center py-2 px-2 small">
              <span class="text-break d-flex align-items-center gap-2 min-w-0">
                <i class="bi bi-file-earmark-text text-danger flex-shrink-0"></i>
                <span class="text-truncate">{{ arc.name }}</span>
              </span>
              <button type="button" @click="quitarArchivoCarga(idx)" class="btn btn-sm btn-link text-danger p-0 ms-2 flex-shrink-0" title="Quitar">
                <i class="bi bi-x-circle-fill"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        @click="guardarInformeCarga"
        class="btn btn-danger rounded-pill px-4 fw-bold shadow-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
        :disabled="guardandoCarga || !cargaValida"
      >
        <span v-if="guardandoCarga" class="spinner-border spinner-border-sm"></span>
        <span v-else class="material-icons" style="font-size:18px;">save</span> Cargar informe
      </button>
      <button @click="cerrar" class="btn btn-light border rounded-pill px-4 fw-bold flex-grow-1" :disabled="guardandoCarga">CANCELAR</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { ref, reactive, computed, watch, inject } from 'vue';
import { api } from '@/api/api';
import ModalBase from '@/components/ModalBase.vue';

const props = defineProps({
  show: { type: Boolean, default: false }
});
const emit = defineEmits(['close', 'cargado']);

const toast = inject('toast', ({ mensaje }) => alert(mensaje));

const opcionesTorneo = [
  { valor: 'metropolitano_apertura', etiqueta: 'Metropolitano Apertura' },
  { valor: 'metropolitano_clausura', etiqueta: 'Metropolitano Clausura' },
  { valor: 'super_8', etiqueta: 'Super 8' },
  { valor: 'copa_campeones', etiqueta: 'Copa de Campeones' },
  { valor: 'desarrollo_apertura', etiqueta: 'Torneo Desarrollo Apertura' },
  { valor: 'desarrollo_clausura', etiqueta: 'Torneo Desarrollo Clausura' },
  { valor: 'otros', etiqueta: 'Otros' }
];

const guardandoCarga = ref(false);
const cargandoCat = ref(false);
const cargandoPartidos = ref(false);
const inputArchivosCarga = ref(null);

const divisionesMayoresCarga = ref([]);
const listasCarga = reactive({ divisiones_categorias: [], divisiones: [] });
const idCategoriaCarga = ref(null);
const fechaPartidoCarga = ref('');
const partidosCarga = ref([]);
const idPartidoCarga = ref(null);

const carga = reactive({
  genero: '', tipo: '', inf_nivel: '', id_categoria_especifica: '',
  torneo: '', institucion: '', implicado: '', sancion: '', motivo_descripcion: '',
  archivos: []  // File[]
});

const partidoCargaSel = computed(() => partidosCarga.value.find(p => p.id === idPartidoCarga.value) || null);
const arbitrosPartidoCarga = computed(() => {
  const p = partidoCargaSel.value;
  if (!p) return '';
  return [p.arbitro_1, p.arbitro_2].filter(Boolean).join(' - ');
});

const cargaValida = computed(() =>
  partidoCargaSel.value &&
  carga.torneo && carga.institucion && carga.implicado.trim() &&
  carga.sancion.trim() && carga.motivo_descripcion.trim()
);

const reiniciarCarga = () => {
  Object.assign(carga, {
    genero: '', tipo: '', inf_nivel: '', id_categoria_especifica: '',
    torneo: '', institucion: '', implicado: '', sancion: '', motivo_descripcion: '',
    archivos: []
  });
  divisionesMayoresCarga.value = [];
  listasCarga.divisiones_categorias = [];
  listasCarga.divisiones = [];
  idCategoriaCarga.value = null;
  fechaPartidoCarga.value = '';
  partidosCarga.value = [];
  idPartidoCarga.value = null;
  if (inputArchivosCarga.value) inputArchivosCarga.value.value = '';
};

const cerrar = () => { emit('close'); };

// Al abrirse el modal, reiniciar el formulario
watch(() => props.show, (visible) => {
  if (visible) reiniciarCarga();
});

// Catálogos
const pedirCategoriasCarga = async () => {
  if (!carga.genero || !carga.tipo) return;
  cargandoCat.value = true;
  listasCarga.divisiones = [];
  carga.id_categoria_especifica = '';
  carga.inf_nivel = '';
  idCategoriaCarga.value = null;
  try {
    const res = await api.get({
      entity: 'observaciones',
      action: 'obtenerCategorias',
      payload: { genero: carga.genero, tipo: carga.tipo }
    });
    if (res.ok) {
      if (carga.tipo === 'Mayores') {
        divisionesMayoresCarga.value = res.payload[0]?.divisiones || [];
      } else {
        listasCarga.divisiones_categorias = res.payload;
      }
    }
  } catch (err) {
    console.error('Error pidiendo categorías:', err);
  } finally {
    cargandoCat.value = false;
  }
};

const setDivisionesCarga = () => {
  const cat = listasCarga.divisiones_categorias[carga.id_categoria_especifica];
  listasCarga.divisiones = cat ? cat.divisiones : [];
  carga.inf_nivel = '';
  idCategoriaCarga.value = null;
};

const seleccionarCategoriaCarga = () => {
  idCategoriaCarga.value = carga.inf_nivel;
  fechaPartidoCarga.value = '';
  partidosCarga.value = [];
  idPartidoCarga.value = null;
};

const obtenerPartidosCarga = async () => {
  partidosCarga.value = [];
  idPartidoCarga.value = null;
  if (!fechaPartidoCarga.value || !idCategoriaCarga.value) return;
  cargandoPartidos.value = true;
  try {
    const r = await api.get({
      entity: 'designaciones',
      action: 'obtenerPartidos',
      payload: { fecha: fechaPartidoCarga.value, idCategoria: idCategoriaCarga.value }
    });
    if (r.ok) partidosCarga.value = r.payload;
  } catch (err) {
    console.error('Error pidiendo partidos:', err);
  } finally {
    cargandoPartidos.value = false;
  }
};

watch(() => [carga.genero, carga.tipo], () => { pedirCategoriasCarga(); });

// Archivos
const MAX_ARCHIVO_BYTES_CARGA = 10 * 1024 * 1024;
const onArchivosCarga = (e) => {
  const files = Array.from(e.target.files || []);
  for (const file of files) {
    if (file.size > MAX_ARCHIVO_BYTES_CARGA) {
      toast({ titulo: 'Archivo muy grande', mensaje: `"${file.name}" supera los 10 MB y no se adjuntó.`, tipo: 'warning' });
      continue;
    }
    carga.archivos.push(file);
  }
  if (inputArchivosCarga.value) inputArchivosCarga.value.value = '';
};
const quitarArchivoCarga = (idx) => { carga.archivos.splice(idx, 1); };

const guardarInformeCarga = async () => {
  if (!cargaValida.value) return;
  const p = partidoCargaSel.value;
  const institucionNombre = carga.institucion === 'local' ? p.local : p.visitante;

  // Armamos el texto de categoría igual que viene en las designaciones del árbitro:
  //  - Mayores  -> la división elegida (ej. "Mayores Masc. Liga de Honor")
  //  - Inferiores -> "Categoría División" (ej. "Cadetes Masc. B")
  // La división elegida se ubica por inf_nivel (que guarda el idCategoria).
  let categoriaTexto = '';
  if (carga.tipo === 'Mayores') {
    const div = divisionesMayoresCarga.value.find(d => String(d.idCategoria) === String(carga.inf_nivel));
    categoriaTexto = div ? div.division : 'Mayores';
  } else {
    const cat = listasCarga.divisiones_categorias[carga.id_categoria_especifica];
    const nombreCat = cat ? cat.categoria : '';
    const div = (listasCarga.divisiones || []).find(d => String(d.idCategoria) === String(carga.inf_nivel));
    const nombreDiv = div ? div.division : '';
    categoriaTexto = [nombreCat, nombreDiv].filter(Boolean).join(' ').trim();
  }

  guardandoCarga.value = true;
  try {
    const fd = new FormData();
    fd.append('id_partido', p.id);
    fd.append('id_arb1', p.id_arb1 ?? '');
    fd.append('id_arb2', p.id_arb2 ?? '');
    fd.append('fecha_partido', fechaPartidoCarga.value);
    fd.append('encuentro', `${p.local} vs ${p.visitante}`);
    fd.append('equipo_local', p.local);
    fd.append('equipo_visitante', p.visitante);
    fd.append('categoria', categoriaTexto);
    fd.append('arbitros', arbitrosPartidoCarga.value);
    fd.append('torneo', carga.torneo);
    fd.append('implicado', carga.implicado.trim());
    fd.append('sancion', carga.sancion.trim());
    fd.append('institucion', carga.institucion);
    fd.append('institucion_nombre', institucionNombre);
    fd.append('motivo_descripcion', carga.motivo_descripcion.trim());
    carga.archivos.forEach(file => fd.append('archivos[]', file, file.name));

    const res = await api.postFile({
      entity: 'informes',
      action: 'crearInformeAdmin',
      payload: fd
    });

    if (res.ok || res.success) {
      toast({ titulo: 'Informe cargado', mensaje: 'El informe se registró correctamente.', tipo: 'success' });
      emit('cargado');
      emit('close');
    } else {
      throw new Error((res.payload && res.payload.mensaje) ? res.payload.mensaje : 'No se pudo cargar el informe.');
    }
  } catch (err) {
    console.error('Error al cargar informe:', err);
    toast({ titulo: 'Error', mensaje: err.message || 'No se pudo cargar el informe.', tipo: 'danger' });
  } finally {
    guardandoCarga.value = false;
  }
};
</script>
