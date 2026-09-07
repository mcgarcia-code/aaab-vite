// ============================================================
//  useVistaPreviaObservacion
//  ------------------------------------------------------------
//  Lee la planilla de Excel EN EL NAVEGADOR (con ExcelJS) y arma
//  una vista previa idéntica a la del modal "Detalle de la
//  Observación", ANTES de subir el archivo al backend.
//
//  Replica exactamente las celdas que lee observaciones.php
//  (cargarObservacionExcel), de modo que lo que se ve en la
//  preview es lo mismo que quedará guardado.
//
//  Sirve para que el observador/admin confirme el PUNTAJE FINAL
//  y para BLOQUEAR la carga si el Excel tiene errores o no se
//  puede leer la nota final.
// ============================================================

import { ref, computed } from 'vue';
import ExcelJS from 'exceljs';

// --- Mapa de categorías / ítems: copiado 1:1 de _categoriasEvaluacionExcel() del PHP ---
const CATEGORIAS_EVALUACION = [
  { nombre: 'Conducción de partido', filaComentario: 3, filasItems: [26, 27, 28, 29, 30] },
  { nombre: 'Lectura del juego', filaComentario: 8, filasItems: [31, 32, 33, 34] },
  { nombre: 'Posición, desplazamiento y cooperación', filaComentario: 13, filasItems: [35, 36, 37, 38] },
  { nombre: 'Body language y comunicación', filaComentario: 18, filasItems: [39, 40, 41] },
  { nombre: 'Línea de sanciones', filaComentario: 23, filasItems: [42, 43, 44, 45, 46, 47] },
  { nombre: 'Zona del pívot', filaComentario: 28, filasItems: [48, 49, 50, 51] },
  { nombre: 'Línea de 7 metros', filaComentario: 33, filasItems: [52, 53, 54, 55] },
  { nombre: 'Faltas en ataque', filaComentario: 38, filasItems: [56, 57, 58, 59] },
  { nombre: 'Errores técnicos', filaComentario: 43, filasItems: [60, 61, 62, 63, 64] },
  { nombre: 'Habilidades mentales', filaComentario: 48, filasItems: [65, 66, 67, 68, 69, 70] },
];

// Columnas de valoración marcadas con 'x' (mismo mapa que _extraerItemsEvaluacionExcel del PHP).
const BUCKET_COLUMNAS = {
  X: 'Muy bien',
  Z: 'Por encima de lo adecuado',
  AB: 'Adecuado',
  AD: 'Por debajo de adecuado',
  AF: 'Insuficiente',
  AG: 'No aplica',
};

// ------------------------------------------------------------
//  Helpers de lectura de celdas (equivalentes a los del PHP).
//  Para celdas con fórmula, ExcelJS guarda el valor cacheado
//  por Excel en cell.value.result -> es el análogo de
//  getOldCalculatedValue() de PhpSpreadsheet.
// ------------------------------------------------------------
function valorCrudo(hoja, coord) {
  const celda = hoja.getCell(coord);
  let v = celda.value;
  // Fórmula: { formula, result } -> usamos el resultado cacheado.
  if (v && typeof v === 'object' && 'result' in v) v = v.result;
  // Texto enriquecido: { richText: [...] }
  if (v && typeof v === 'object' && Array.isArray(v.richText)) {
    v = v.richText.map(t => t.text).join('');
  }
  // Hipervínculos u objetos con .text
  if (v && typeof v === 'object' && 'text' in v) v = v.text;
  return v;
}

function celdaTexto(hoja, coord) {
  const v = valorCrudo(hoja, coord);
  if (v === null || v === undefined || typeof v === 'object') return null;
  const t = String(v).trim();
  return t === '' ? null : t;
}

function celdaNumero(hoja, coord) {
  const t = celdaTexto(hoja, coord);
  if (t === null) return null;
  const n = Number(t.replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

function celdaMarcada(hoja, coord) {
  const t = celdaTexto(hoja, coord);
  return t !== null && t.toLowerCase() === 'x';
}

function opcionMarcada(hoja, fila, columnas) {
  for (const [col, etiqueta] of Object.entries(columnas)) {
    if (celdaMarcada(hoja, `${col}${fila}`)) return etiqueta;
  }
  return null;
}

// ------------------------------------------------------------
//  Extracción de ítems (equivalente a _extraerItemsEvaluacionExcel).
//  Devuelve la misma forma que usa el modal de detalle:
//    { tipo, categoria, item, puntaje, valoracion, comentario }
// ------------------------------------------------------------
function extraerItems(scoreSheet, commentSheet) {
  const items = [];
  for (const cat of CATEGORIAS_EVALUACION) {
    const filaHeader = cat.filasItems[0];
    items.push({
      tipo: 'categoria',
      categoria: cat.nombre,
      item: null,
      puntaje: celdaNumero(scoreSheet, `M${filaHeader}`),
      valoracion: null,
      comentario: celdaTexto(commentSheet, `E${cat.filaComentario}`),
    });

    for (const fila of cat.filasItems) {
      const texto = celdaTexto(scoreSheet, `N${fila}`);
      if (texto === null) continue;
      items.push({
        tipo: 'criterio',
        categoria: cat.nombre,
        item: texto,
        puntaje: celdaNumero(scoreSheet, `AH${fila}`),
        valoracion: opcionMarcada(scoreSheet, fila, BUCKET_COLUMNAS),
        comentario: null,
      });
    }
  }
  return items;
}

// ============================================================
//  Composable
// ============================================================
export function useVistaPreviaObservacion() {
  const analizando = ref(false);
  // Objeto con la misma forma que `detalle` del modal + { errores, advertencias }
  const preview = ref(null);
  const errorLectura = ref(null);

  // La carga se habilita SOLO si hay preview y no tiene errores.
  const previewValida = computed(() =>
    !!preview.value && preview.value.errores.length === 0
  );

  const limpiarPreview = () => {
    preview.value = null;
    errorLectura.value = null;
    analizando.value = false;
  };

  // datosPartido: lo que devuelve armarDatosPartido() en cada .vue
  // (categoria, fecha_partido, etc.) para completar la cabecera de la preview.
  const analizarArchivo = async (file, datosPartido = {}) => {
    limpiarPreview();
    if (!file) return;

    analizando.value = true;
    try {
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);

      const scoreSheet = wb.getWorksheet('Score sheet');
      const commentSheet = wb.getWorksheet('Comment sheet');

      const errores = [];
      const advertencias = [];

      // --- Validación de formato: mismas hojas que exige el PHP ---
      if (!scoreSheet || !commentSheet) {
        errorLectura.value =
          "El archivo no tiene el formato esperado (faltan las hojas 'Score sheet' / 'Comment sheet').";
        return;
      }

      // --- Lecturas (mismas celdas que cargarObservacionExcel) ---
      const puntajeFinal = celdaNumero(scoreSheet, 'S11');
      const items = extraerItems(scoreSheet, commentSheet);

      // --- Regla que BLOQUEA la carga: solo la falta de puntaje final ---
      if (puntajeFinal === null) {
        errores.push('No figura el PUNTAJE FINAL. Revisá haber puesto el PUNTAJE INICIAL. No se puede cargar la observación hasta que la planilla lo muestre. ');
      }

      // --- Armado del objeto de preview (forma compatible con el modal de detalle) ---
      preview.value = {
        // Puntaje final (lo que se confirma antes de cargar)
        puntaje_final: puntajeFinal,

        // Ítems (misma estructura que detalle.items)
        items,

        // Comentarios (para reutilizar la pestaña de comentarios del modal)
        prioridad_mejora_1: celdaTexto(commentSheet, 'F53'),
        prioridad_mejora_2: celdaTexto(commentSheet, 'F55'),
        prioridad_mejora_resto: celdaTexto(commentSheet, 'F57'),
        influencia_resultado_comentarios: celdaTexto(scoreSheet, 'W84'),

        // Diagnóstico
        errores,
        advertencias,
      };
    } catch (e) {
      console.error('analizarArchivo:', e);
      errorLectura.value = 'No se pudo leer el archivo Excel. ¿Está dañado o protegido con contraseña?';
    } finally {
      analizando.value = false;
    }
  };

  return {
    analizando,
    preview,
    previewValida,
    errorLectura,
    analizarArchivo,
    limpiarPreview,
  };
}
