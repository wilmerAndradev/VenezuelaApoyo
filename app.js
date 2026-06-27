// app.js - Utilidades compartidas y monitoreo de conectividad para AcopioVE

/**
 * Sanitiza cadenas de texto para prevenir ataques XSS al renderizar contenido.
 * @param {string} str - Texto a sanitizar.
 * @returns {string} Texto sanitizado.
 */
function sanitizeHTML(str) {
  if (!str) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return str.replace(reg, (match) => map[match]);
}

/**
 * Obtiene parámetros de la URL actual.
 * @returns {Object} Diccionario con los parámetros.
 */
function getQueryParams() {
  const params = {};
  const search = window.location.search.substring(1);
  if (search) {
    search.split('&').forEach(pair => {
      const parts = pair.split('=');
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
    });
  }
  return params;
}

/**
 * Monitoreo de conectividad en tiempo real (Optimizado para 3G lento/inestable)
 */
document.addEventListener("DOMContentLoaded", () => {
  const statusBanner = document.createElement("div");
  statusBanner.id = "connection-status-banner";
  statusBanner.className = "fixed top-0 left-0 right-0 z-[10000] bg-[#EF4444] text-white text-center py-1.5 text-xs font-bold transition-all duration-300 transform -translate-y-full flex items-center justify-center gap-2";
  statusBanner.innerHTML = `
    <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    <span>Sin conexión a internet. La aplicación intentará reconectarse automáticamente.</span>
  `;
  document.body.appendChild(statusBanner);

  // Detectar desconexión
  window.addEventListener("offline", () => {
    statusBanner.classList.remove("-translate-y-full");
    console.warn("Dispositivo offline detectado.");
  });

  // Detectar reconexión
  window.addEventListener("online", () => {
    statusBanner.classList.add("-translate-y-full");
    console.log("Dispositivo online de nuevo.");
  });

  // Monitorear velocidad si la API de información de red está disponible
  if (navigator.connection) {
    const connection = navigator.connection;
    console.log(`Tipo de red: ${connection.effectiveType}, RTT estimado: ${connection.rtt}ms, Downlink: ${connection.downlink}Mb/s`);
    
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' || (connection.rtt && connection.rtt > 1500)) {
      console.warn("Alerta: Conexión de red muy lenta detectada.");
    }
  }
});
