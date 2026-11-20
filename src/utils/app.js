// true si el sitio se abrió como app instalada (PWA) y no en una pestaña del navegador.
// En iPhone se usa navigator.standalone; en el resto, el modo de visualización del manifest.
export const esAppInstalada = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.matchMedia?.('(display-mode: fullscreen)').matches ||
  window.navigator.standalone === true
