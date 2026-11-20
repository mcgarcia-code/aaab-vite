// Abre un chat de WhatsApp con el número dado (agrega el 54 de Argentina si falta),
// opcionalmente con un mensaje ya escrito.
// noopener: la pestaña nueva no puede tocar la página del panel.
export const linkWhatsApp = (numero, mensaje = '') => {
  const limpio = String(numero ?? '').replace(/\D/g, '')
  if (!limpio) return null
  const conPais = limpio.startsWith('54') ? limpio : `54${limpio}`
  return `https://wa.me/${conPais}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`
}

export const abrirWhatsApp = (numero, mensaje = '') => {
  const link = linkWhatsApp(numero, mensaje)
  if (link) window.open(link, '_blank', 'noopener')
}
