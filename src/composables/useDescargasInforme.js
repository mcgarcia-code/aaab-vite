import { ref } from 'vue'
import { fechaArg, fechaHoraArg } from '@/utils/fechas'
import { cargarHtml2pdf } from '@/utils/librerias'
import { etiquetaTorneo } from '@/utils/informes'

// Descargas de un informe de partido: archivos adjuntos y PDF generado en el momento (no se guarda en disco).
// Lo usan Mis informes (árbitro), Informes (coordinadores) e Informes (admin).
// - etiquetaEstado: cómo nombra cada pantalla el estado del informe (el admin no usa "anulado")
// - toast: el aviso de cada panel (inject('toast'))
export function useDescargasInforme({ etiquetaEstado, toast }) {
  // ============ ADJUNTOS ============
  const descargandoArchivo = ref(null)

  const descargarArchivo = async (arc) => {
    if (!arc || !arc.url_completa) return
    descargandoArchivo.value = arc.url_completa
    try {
      const resp = await fetch(arc.url_completa)
      if (!resp.ok) throw new Error('No se pudo descargar el archivo')
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = arc.archivo_nombre || 'archivo'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error al descargar archivo:', err)
      // Si no se puede bajar (ej. CORS), se abre en una pestaña nueva
      window.open(arc.url_completa, '_blank', 'noopener')
    } finally {
      descargandoArchivo.value = null
    }
  }

  // ============ PDF ============
  const descargandoId = ref(null)

  // Todo dato que viene del servidor se escapa antes de armar el HTML del PDF
  const escapar = (v) => String(v ?? '-')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const filaPDF = (etiqueta, valor) => `
  <tr>
    <td style="padding:8px 10px;border:1px solid #e5e7eb;background:#f8f9fa;font-weight:bold;width:38%;color:#334155;">${escapar(etiqueta)}</td>
    <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#111;">${escapar(valor)}</td>
  </tr>`

  const descargarPDF = async (inf) => {
    descargandoId.value = inf.id
    try {
      const contenedor = document.createElement('div')
      contenedor.style.padding = '28px'
      contenedor.style.fontFamily = 'Arial, Helvetica, sans-serif'
      contenedor.style.color = '#111'
      contenedor.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;border-bottom:3px solid #dc2626;padding-bottom:14px;margin-bottom:18px;">
        <img src="https://arbitroshandball.com.ar/logo.png" alt="AAAB" style="height:56px;" crossorigin="anonymous"
             onerror="this.style.display='none'">
        <div>
          <h1 style="margin:0;font-size:20px;color:#dc2626;">Informe de Partido</h1>
          <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Asociación Argentina de Árbitros de Balonmano</p>
        </div>
        <div style="margin-left:auto;text-align:right;font-size:12px;color:#64748b;">
          <div><strong>Informe #${escapar(inf.id)}</strong></div>
          <div>Estado: ${escapar(etiquetaEstado(inf.estado))}</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${filaPDF('Fecha del partido', fechaArg(inf.fecha_partido, 'S/F'))}
        ${filaPDF('Torneo', etiquetaTorneo(inf.torneo))}
        ${filaPDF('Categoría', inf.categoria || '-')}
        ${filaPDF('Encuentro', inf.encuentro)}
        ${filaPDF('Árbitros', inf.arbitros || '-')}
        ${inf.delegado_tecnico ? filaPDF('Delegado técnico (cargó el informe)', inf.delegado_tecnico) : ''}
        ${filaPDF('Implicado', inf.implicado)}
        ${filaPDF('Sanción', inf.sancion)}
        ${filaPDF('Institución a la que pertenece', inf.institucion_nombre)}
      </table>

      <div style="margin-top:16px;">
        <div style="font-weight:bold;font-size:13px;color:#334155;margin-bottom:6px;">Motivo y descripción</div>
        <div style="border:1px solid #e5e7eb;border-radius:6px;padding:12px;font-size:13px;line-height:1.5;white-space:pre-wrap;background:#fff;">${escapar(inf.motivo_descripcion)}</div>
      </div>

      <div style="margin-top:22px;font-size:11px;color:#94a3b8;border-top:1px solid #e5e7eb;padding-top:10px;">
        Cargado por ${inf.cargado_por_es_rol ? escapar(inf.cargado_por_nombre || '') : ((inf.delegado_tecnico ? 'el delegado técnico ' : 'el árbitro ') + escapar(inf.cargado_por_nombre || inf.delegado_tecnico || inf.arbitros || ''))} el ${escapar(fechaHoraArg(inf.creado_en, '-'))}.
        Documento generado el ${escapar(new Date().toLocaleDateString('es-AR'))}.
      </div>
    `

      const opciones = {
        margin: 10,
        filename: `Informe_${inf.id}_${(inf.encuentro || '').replace(/[^\w]+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      await (await cargarHtml2pdf())().set(opciones).from(contenedor).save()
    } catch (err) {
      console.error('Error al generar PDF:', err)
      toast({ titulo: 'Error', mensaje: 'No se pudo generar el PDF.', tipo: 'danger' })
    } finally {
      descargandoId.value = null
    }
  }

  return { descargandoArchivo, descargarArchivo, descargandoId, descargarPDF }
}
