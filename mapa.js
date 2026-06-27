// mapa.js - Integración de Leaflet para AcopioVE

// Coordenadas iniciales por defecto (Centro de Venezuela)
const VENEZUELA_CENTRO = [6.4238, -66.5897];
const ZOOM_INICIAL = 6;

// Variables globales del mapa
let mapaSolicitudInstance = null;
let marcadorSolicitud = null;
let coordenadasSeleccionadas = {
  lat: null,
  lng: null,
  direccion: ""
};

let mapaDashboardInstance = null;
let grupoMarcadores = null;
let listaMarcadores = []; // Para poder filtrarlos o buscarlos

/**
 * Retorna las coordenadas y dirección seleccionadas en el mapa de solicitud
 */
function getCoordenadasSeleccionadas() {
  return coordenadasSeleccionadas;
}

/**
 * Helper para formatear tiempo relativo ("hace 2 horas")
 */
function formatTiempoRelativo(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "hace unos segundos";
  if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  if (diffHr < 24) return `hace ${diffHr} ${diffHr === 1 ? 'hora' : 'horas'}`;
  return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
}

/**
 * Reverse geocoding usando la API gratuita de Nominatim
 */
async function obtenerDireccionNominatim(lat, lng) {
  try {
    // Respetar política de uso de Nominatim (user-agent y rate limit)
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
      headers: {
        'Accept-Language': 'es'
      }
    });
    if (!response.ok) throw new Error("Nominatim request failed");
    const data = await response.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch (error) {
    console.warn("Error en reverse geocoding:", error);
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

/**
 * FUNCIÓN 1: iniciarMapaSolicitud(divId)
 * Inicializa el mapa para registrar una solicitud
 */
function iniciarMapaSolicitud(divId) {
  const container = document.getElementById(divId);
  if (!container) return;

  // Si ya existía una instancia del mapa, la destruimos
  if (mapaSolicitudInstance) {
    mapaSolicitudInstance.remove();
  }

  // Inicializar Leaflet
  mapaSolicitudInstance = L.map(divId, {
    zoomControl: true,
    tap: false // Evita doble toque en móviles
  }).setView(VENEZUELA_CENTRO, ZOOM_INICIAL);

  // Cargar Tiles de OpenStreetMap (ligeras)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapaSolicitudInstance);

  // Manejador del clic en el mapa
  mapaSolicitudInstance.on('click', async function(e) {
    const { lat, lng } = e.latlng;
    await colocarMarcadorSolicitud(lat, lng);
  });

  // Botón "Usar mi ubicación"
  const gpsBtn = document.createElement('button');
  gpsBtn.className = 'absolute top-16 left-3 z-[1000] bg-[#1A1A1A] border-2 border-[#2A2A2A] text-white p-2 rounded-md shadow-md text-sm font-semibold flex items-center gap-2 hover:bg-[#222] min-h-[48px]';
  gpsBtn.type = 'button';
  gpsBtn.innerHTML = `
    <svg class="w-5 h-5 text-[#F5C400]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    <span>Mi Ubicación</span>
  `;
  gpsBtn.onclick = function() {
    if (navigator.geolocation) {
      // Mostrar feedback de carga
      gpsBtn.disabled = true;
      gpsBtn.querySelector('span').innerText = 'Buscando...';
      
      navigator.geolocation.getCurrentPosition(
        async function(position) {
          const { latitude, longitude } = position.coords;
          mapaSolicitudInstance.setView([latitude, longitude], 15);
          await colocarMarcadorSolicitud(latitude, longitude);
          gpsBtn.disabled = false;
          gpsBtn.querySelector('span').innerText = 'Mi Ubicación';
        },
        function(error) {
          gpsBtn.disabled = false;
          gpsBtn.querySelector('span').innerText = 'Mi Ubicación';
          let msg = "No se pudo obtener la geolocalización. Por favor, selecciona tu ubicación manualmente en el mapa.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Permiso de ubicación denegado. Haz clic en el mapa para colocar el pin.";
          }
          alert(msg);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert("Tu navegador no soporta geolocalización. Elige la ubicación manualmente haciendo clic en el mapa.");
    }
  };

  container.parentElement.style.position = 'relative';
  container.parentElement.appendChild(gpsBtn);
}

/**
 * Coloca o actualiza el marcador en el mapa de solicitud
 */
async function colocarMarcadorSolicitud(lat, lng) {
  coordenadasSeleccionadas.lat = lat;
  coordenadasSeleccionadas.lng = lng;

  // Actualizar UI del form con las coordenadas
  const latInput = document.getElementById('input-latitud');
  const lngInput = document.getElementById('input-longitud');
  const dirTextarea = document.getElementById('input-direccion-referencia');

  if (latInput) latInput.value = lat.toFixed(6);
  if (lngInput) lngInput.value = lng.toFixed(6);

  // Feedback de reverse geocoding
  if (dirTextarea) {
    dirTextarea.placeholder = "Obteniendo dirección...";
  }

  const direccionStr = await obtenerDireccionNominatim(lat, lng);
  coordenadasSeleccionadas.direccion = direccionStr;

  if (dirTextarea && !dirTextarea.value.trim()) {
    dirTextarea.value = direccionStr;
  }

  // Si ya existía marcador, lo movemos
  if (marcadorSolicitud) {
    marcadorSolicitud.setLatLng([lat, lng]);
  } else {
    // Obtener la gravedad seleccionada para el color
    const selectGrav = document.getElementById('input-gravedad');
    const gravedad = selectGrav ? selectGrav.value : 'moderado';
    let color = "#F59E0B"; // moderado
    if (gravedad === 'grave') color = "#EF4444";
    if (gravedad === 'leve') color = "#22C55E";

    // Marcador interactivo personalizado
    const pinIcon = L.divIcon({
      className: 'custom-pin-solicitud',
      html: `<div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="background-color: ${color};"><div class="w-2.5 h-2.5 bg-white rounded-full"></div></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    marcadorSolicitud = L.marker([lat, lng], {
      draggable: true,
      icon: pinIcon
    }).addTo(mapaSolicitudInstance);

    // Evento de arrastrar marcador
    marcadorSolicitud.on('dragend', async function(event) {
      const marker = event.target;
      const position = marker.getLatLng();
      await colocarMarcadorSolicitud(position.lat, position.lng);
    });
  }
}

/**
 * FUNCIÓN 2: iniciarMapaDashboard(divId, solicitudes)
 * Dibuja el mapa del dashboard con todos los pins
 */
function iniciarMapaDashboard(divId, solicitudes) {
  const container = document.getElementById(divId);
  if (!container) return;

  if (mapaDashboardInstance) {
    mapaDashboardInstance.remove();
  }

  mapaDashboardInstance = L.map(divId, {
    zoomControl: true,
    tap: false
  }).setView(VENEZUELA_CENTRO, ZOOM_INICIAL);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapaDashboardInstance);

  // Inicializar grupo de marcadores (con soporte a clustering)
  if (typeof L.markerClusterGroup !== 'undefined') {
    grupoMarcadores = L.markerClusterGroup({
      maxClusterRadius: 40,
      showCoverageOnHover: false
    });
  } else {
    grupoMarcadores = L.featureGroup();
  }

  mapaDashboardInstance.addLayer(grupoMarcadores);
  renderizarMarcadoresDashboard(solicitudes);
}

/**
 * Crea un HTML de marcador personalizado según tipo y gravedad
 */
function crearDivIcon(tipo, gravedad) {
  let color = "#22C55E"; // Leve por defecto
  if (gravedad === 'grave') color = "#EF4444";
  if (gravedad === 'moderado') color = "#F59E0B";

  const shapeClass = tipo === 'centro_acopio' ? 'rounded-lg' : 'rounded-full';
  
  // Iconos SVG inline
  const svgIcon = tipo === 'centro_acopio'
    ? `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`
    : `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`;

  return L.divIcon({
    className: 'custom-dashboard-marker',
    html: `
      <div class="relative flex flex-col items-center">
        <div class="w-9 h-9 ${shapeClass} flex items-center justify-center shadow-lg border border-white" style="background-color: ${color};">
          ${svgIcon}
        </div>
        <div class="w-3 h-3 rotate-45 -mt-1.5 shadow-md border-r border-b border-white" style="background-color: ${color};"></div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42]
  });
}

/**
 * Renderiza los marcadores en el dashboard a partir de la lista de solicitudes
 */
function renderizarMarcadoresDashboard(solicitudes) {
  if (!grupoMarcadores) return;

  // Limpiar marcadores anteriores
  grupoMarcadores.clearLayers();
  listaMarcadores = [];

  solicitudes.forEach(solicitud => {
    if (!solicitud.latitud || !solicitud.longitud) return;

    const lat = parseFloat(solicitud.latitud);
    const lng = parseFloat(solicitud.longitud);
    const icon = crearDivIcon(solicitud.tipo, solicitud.gravedad);

    const marker = L.marker([lat, lng], { icon: icon });

    // Armar contenido del Popup
    const badgeGravedad = solicitud.gravedad === 'grave'
      ? `<span class="badge-severe">GRAVE</span>`
      : (solicitud.gravedad === 'moderado'
        ? `<span class="badge-moderate">MODERADO</span>`
        : `<span class="badge-mild">LEVE</span>`);

    const tipoLabel = solicitud.tipo === 'centro_acopio' ? '🏡 Centro de Acopio' : '🚨 Emergencia Individual';

    // Lista de ítems
    let itemsHtml = '';
    if (solicitud.items && solicitud.items.length > 0) {
      itemsHtml = `
        <div class="mt-2 text-xs">
          <strong class="text-slate-700">Necesidades:</strong>
          <div class="flex flex-wrap gap-1 mt-1">
            ${solicitud.items.map(i => `<span class="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px]">${typeof sanitizeHTML !== 'undefined' ? sanitizeHTML(i) : i}</span>`).join('')}
          </div>
        </div>
      `;
    }

    // Foto si existe
    const fotoHtml = solicitud.foto_url
      ? `<img src="${solicitud.foto_url}" class="w-full h-24 object-cover rounded-md mt-2 border border-slate-200" alt="Foto de la situación">`
      : '';

    const safeNombre = typeof sanitizeHTML !== 'undefined' ? sanitizeHTML(`${solicitud.nombre} ${solicitud.apellido}`) : `${solicitud.nombre} ${solicitud.apellido}`;
    const safeMotivo = typeof sanitizeHTML !== 'undefined' ? sanitizeHTML(solicitud.motivo.substring(0, 100)) : solicitud.motivo.substring(0, 100);
    const dots = solicitud.motivo.length > 100 ? '...' : '';

    // Teléfono
    const tlfHtml = solicitud.telefono
      ? `<div class="text-xs text-slate-500 mt-1">📞 Tel: <a href="tel:${typeof sanitizeHTML !== 'undefined' ? sanitizeHTML(solicitud.telefono) : solicitud.telefono}" class="text-[#003087] font-semibold hover:underline">${typeof sanitizeHTML !== 'undefined' ? sanitizeHTML(solicitud.telefono) : solicitud.telefono}</a></div>`
      : '';

    // Botón de Google Maps para voluntario
    const mapsRouteBtn = `
      <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="w-full text-center bg-[#003087] text-white py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 mt-3 hover:bg-[#002060] transition-emergency cursor-pointer">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        <span>🚙 Cómo Llegar</span>
      </a>
    `;

    const popupHtml = `
      <div class="p-1 max-w-[240px] text-slate-800 font-sans">
        <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
          <span class="text-xs font-bold text-slate-500">${tipoLabel}</span>
          ${badgeGravedad}
        </div>
        <div class="mt-2">
          <h4 class="text-sm font-bold text-slate-900 m-0 leading-tight">${safeNombre}</h4>
          ${tlfHtml}
          <p class="text-xs text-slate-500 my-1 leading-snug">${safeMotivo}${dots}</p>
          ${itemsHtml}
          ${fotoHtml}
          ${mapsRouteBtn}
          <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
            <span>${formatTiempoRelativo(solicitud.created_at)}</span>
            <button onclick="verDetalleSolicitud('${solicitud.id}')" class="text-[#003087] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-[11px]">Ver más</button>
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    grupoMarcadores.addLayer(marker);

    // Guardar referencia
    listaMarcadores.push({
      id: solicitud.id,
      marker: marker,
      solicitud: solicitud
    });
  });
}

/**
 * FUNCIÓN 3: actualizarMarcadores(nuevasSolicitudes)
 * Actualiza los marcadores al filtrar o recibir datos en tiempo real
 */
function actualizarMarcadores(nuevasSolicitudes) {
  renderizarMarcadoresDashboard(nuevasSolicitudes);
}

/**
 * Centra el mapa en un marcador específico y abre su popup
 */
function centrarMapaEnMarcador(id) {
  const item = listaMarcadores.find(x => x.id === id);
  if (item && mapaDashboardInstance) {
    const latlng = item.marker.getLatLng();
    mapaDashboardInstance.setView(latlng, 15);
    
    // Si estamos en cluster, abrimos el popup mediante el cluster group
    if (typeof grupoMarcadores.zoomToShowLayer !== 'undefined') {
      grupoMarcadores.zoomToShowLayer(item.marker, function() {
        item.marker.openPopup();
      });
    } else {
      item.marker.openPopup();
    }
  }
}

/**
 * Cambia el color del pin interactivo en el mapa de registro según la gravedad
 */
function actualizarColorPinSolicitud(gravedad) {
  if (!marcadorSolicitud) return;
  let color = "#F59E0B"; // moderado
  if (gravedad === 'grave') color = "#EF4444";
  if (gravedad === 'leve') color = "#22C55E";

  const newPinIcon = L.divIcon({
    className: 'custom-pin-solicitud',
    html: `<div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style="background-color: ${color};"><div class="w-2.5 h-2.5 bg-white rounded-full"></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
  
  marcadorSolicitud.setIcon(newPinIcon);
}

// ===========================================================
//   INTEGRACIÓN: Venezuela Reporta API  (api/v1/sitios)
// ===========================================================

let grupoSitiosExternos = null;
let sitiosExternosVisibles = false;
let sitiosExternosCache = [];

const VR_SITIO_COLORS = {
  hospital: '#7C3AED',
  clinica:  '#8B5CF6',
  acopio:   '#0891B2',
  refugio:  '#0D9488'
};

const VR_SITIO_ICONS = {
  hospital: `<path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9"/>`,
  clinica:  `<path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>`,
  acopio:   `<path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>`,
  refugio:  `<path stroke-linecap="round" stroke-linejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`
};

/**
 * Carga los sitios de VenezuelaReporta en el mapa como capa separada.
 * Retorna el número de sitios cargados.
 * @param {L.Map} mapInstance - Instancia del mapa Leaflet del dashboard
 */
async function cargarSitiosExternos(mapInstance) {
  if (!mapInstance) return 0;

  try {
    const resp = await fetch('https://venezuelareporta.org/api/v1/sitios', {
      headers: { 'Accept': 'application/json' }
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (!data.ok || !Array.isArray(data.sitios)) return 0;
    sitiosExternosCache = data.sitios;

    // Crear grupo de marcadores para esta capa
    grupoSitiosExternos = L.featureGroup();

    data.sitios.forEach(sitio => {
      const lat = parseFloat(sitio.lat);
      const lng = parseFloat(sitio.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const tipo   = (sitio.tipo || 'acopio').toLowerCase();
      const color  = VR_SITIO_COLORS[tipo] || '#6B7280';
      const svgPath = VR_SITIO_ICONS[tipo] || VR_SITIO_ICONS['acopio'];

      const icon = L.divIcon({
        className: '',
        html: `<div style="
            background:${color};
            width:34px;height:34px;border-radius:8px;
            border:2.5px solid white;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 3px 10px rgba(0,0,0,0.25);">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
               stroke="white" stroke-width="2.5" stroke-linecap="round"
               stroke-linejoin="round">${svgPath}</svg>
        </div>`,
        iconSize:   [34, 34],
        iconAnchor: [17, 34]
      });

      // Badges de estado
      const estadoBadges = {
        activo:  `<span style="background:#22C55E;color:#fff;padding:2px 9px;border-radius:999px;font-size:10px;font-weight:700">ACTIVO</span>`,
        lleno:   `<span style="background:#F59E0B;color:#1A1A1A;padding:2px 9px;border-radius:999px;font-size:10px;font-weight:700">LLENO</span>`,
        cerrado: `<span style="background:#6B7280;color:#fff;padding:2px 9px;border-radius:999px;font-size:10px;font-weight:700">CERRADO</span>`
      };
      const estadoBadge = estadoBadges[(sitio.estado || 'activo').toLowerCase()] || estadoBadges.activo;
      const nombreSitio = typeof sanitizeHTML !== 'undefined'
        ? sanitizeHTML(sitio.nombre || 'Sin nombre')
        : (sitio.nombre || 'Sin nombre');
      const tipoLabel = tipo.charAt(0).toUpperCase() + tipo.slice(1);

      const popupHtml = `
        <div style="font-family:Inter,sans-serif;padding:4px;max-width:230px">
          <div style="display:flex;align-items:center;justify-content:space-between;
                      margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #E2E8F0">
            <span style="font-size:10px;color:${color};font-weight:700;
                         text-transform:uppercase;letter-spacing:.04em">${tipoLabel}</span>
            ${estadoBadge}
          </div>
          <h4 style="font-size:13px;font-weight:700;color:#0F172A;margin:0 0 3px">${nombreSitio}</h4>
          ${sitio.direccion ? `<p style="font-size:11px;color:#475569;margin:2px 0">${sitio.direccion}</p>` : ''}
          ${sitio.ciudad    ? `<p style="font-size:11px;color:#94A3B8;margin:2px 0">${sitio.ciudad}</p>`    : ''}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank"
             style="display:flex;align-items:center;gap:6px;margin-top:10px;
                    background:#003087;color:white;padding:7px 12px;border-radius:8px;
                    font-size:11px;font-weight:700;text-decoration:none">
            🚙 Cómo Llegar
          </a>
          <div style="font-size:10px;color:#94A3B8;margin-top:8px;padding-top:6px;
                      border-top:1px solid #E2E8F0;text-align:right">
            Fuente: <a href="https://venezuelareporta.org" target="_blank"
                       style="color:#003087;font-weight:600">Venezuela Reporta</a>
          </div>
        </div>`;

      const marker = L.marker([lat, lng], { icon });
      marker.bindPopup(popupHtml, { maxWidth: 250 });
      grupoSitiosExternos.addLayer(marker);
    });

    mapInstance.addLayer(grupoSitiosExternos);
    sitiosExternosVisibles = true;

    return data.sitios.length;

  } catch (err) {
    console.warn('[VenezuelaReporta] Error cargando sitios:', err);
    return 0;
  }
}

/**
 * Alterna la visibilidad de la capa de sitios de VenezuelaReporta
 * @returns {boolean} Nuevo estado de visibilidad
 */
function toggleCapaSitios() {
  if (!grupoSitiosExternos || !mapaDashboardInstance) return false;
  if (sitiosExternosVisibles) {
    mapaDashboardInstance.removeLayer(grupoSitiosExternos);
    sitiosExternosVisibles = false;
  } else {
    mapaDashboardInstance.addLayer(grupoSitiosExternos);
    sitiosExternosVisibles = true;
  }
  return sitiosExternosVisibles;
}

/**
 * Retorna el array de sitios externos cargados (para uso en la UI)
 */
function getSitiosExternosCache() {
  return sitiosExternosCache;
}

