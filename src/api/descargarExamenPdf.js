const BASE_URL = 'https://arbitroshandball.com.ar/api/api.php'

export async function descargarExamenPdf(idEvento) {
  const token = sessionStorage.getItem('token_aaab')
  const resp = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      entity: 'examen_online',
      action: 'descargarPdfExamen',
      payload: { idEvento }
    })
  })

  // Si algo falló, el backend responde JSON (exitScript). Lo detectamos por el
  // content-type y tiramos un error legible en vez de bajar un PDF roto.
  const tipo = resp.headers.get('content-type') || ''
  if (!resp.ok || tipo.includes('application/json')) {
    let msg = 'No se pudo generar el PDF'
    try { const j = await resp.json(); msg = j.message || msg } catch{ /* noop */ }
    throw new Error(msg)
  }

  const blob = await resp.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'examen_asamblea.pdf'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
