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
    // Marcador interactivo personalizado
    const redPin = L.divIcon({
      className: 'custom-pin-solicitud',
      html: `<div class="w-8 h-8 rounded-full bg-[#CF142B] border-2 border-white flex items-center justify-center shadow-lg"><div class="w-2.5 h-2.5 bg-white rounded-full"></div></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    marcadorSolicitud = L.marker([lat, lng], {
      draggable: true,
      icon: redPin
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
          <strong class="text-[#F0F0F0]">Necesidades:</strong>
          <div class="flex flex-wrap gap-1 mt-1">
            ${solicitud.items.map(i => `<span class="bg-[#2A2A2A] text-white px-2 py-0.5 rounded text-[11px]">${typeof sanitizeHTML !== 'undefined' ? sanitizeHTML(i) : i}</span>`).join('')}
          </div>
        </div>
      `;
    }

    // Foto si existe
    const fotoHtml = solicitud.foto_url
      ? `<img src="${solicitud.foto_url}" class="w-full h-24 object-cover rounded-md mt-2 border border-[#2A2A2A]" alt="Foto de la situación">`
      : '';

    const safeNombre = typeof sanitizeHTML !== 'undefined' ? sanitizeHTML(`${solicitud.nombre} ${solicitud.apellido}`) : `${solicitud.nombre} ${solicitud.apellido}`;
    const safeMotivo = typeof sanitizeHTML !== 'undefined' ? sanitizeHTML(solicitud.motivo.substring(0, 100)) : solicitud.motivo.substring(0, 100);
    const dots = solicitud.motivo.length > 100 ? '...' : '';

    const popupHtml = `
      <div class="p-1 max-w-[240px] text-[#F0F0F0] font-sans">
        <div class="flex items-center justify-between gap-2 border-b border-[#2A2A2A] pb-1">
          <span class="text-xs font-bold text-[#9CA3AF]">${tipoLabel}</span>
          ${badgeGravedad}
        </div>
        <div class="mt-2">
          <h4 class="text-sm font-bold text-white m-0 leading-tight">${safeNombre}</h4>
          <p class="text-xs text-[#9CA3AF] my-1 leading-snug">${safeMotivo}${dots}</p>
          ${itemsHtml}
          ${fotoHtml}
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-[#2A2A2A] text-[10px] text-[#9CA3AF]">
            <span>${formatTiempoRelativo(solicitud.created_at)}</span>
            <button onclick="verDetalleSolicitud('${solicitud.id}')" class="text-[#F5C400] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer text-[11px]">Ver más</button>
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
