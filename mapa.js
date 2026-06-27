// mapa.js - Integración y lógica de mapas interactivos con Leaflet.js
// Soporta la selección de ubicación (formulario) y la visualización/filtrado (dashboard).

(function() {
  // Guardar referencias a mapas y marcadores
  let mapaSolicitud = null;
  let marcadorSolicitud = null;
  let coordenadasSeleccionadas = { lat: null, lng: null, direccion: '' };

  let mapaDashboard = null;
  let marcadoresDashboardGroup = null; // Puede ser L.markerClusterGroup o L.featureGroup
  let solicitudesDashboardRaw = []; // Almacena el array original de solicitudes
  let todosLosMarcadores = []; // Almacena referencias { marker, data } para filtrado rápido

  // Estado del loading del plugin de clusters
  let markerClusterCargado = false;
  let cargandoMarkerCluster = false;
  let callbacksEsperaMarkerCluster = [];

  // Formateador de tiempo relativo en español: "hace 2 horas"
  window.formatTiempoRelativo = function(timestamp) {
    if (!timestamp) return 'hace un momento';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'hace un momento';

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) return 'hace unos segundos';
    if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    if (diffHrs < 24) return `hace ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`;
    return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  };

  // Iconos SVG inline de alta calidad
  const ICONO_BOX_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="12" x2="12" y2="22"></line>
    </svg>
  `;

  const ICONO_PERSONA_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  `;

  // Crear HTML para el marcador basado en tipo y gravedad
  function crearHtmlMarcador(tipo, gravedad) {
    let colorHex = '#22C55E'; // Leve
    if (gravedad === 'grave') colorHex = '#EF4444';
    else if (gravedad === 'moderado') colorHex = '#F59E0B';

    const esCentro = tipo === 'centro_acopio';
    const svgIcon = esCentro ? ICONO_BOX_SVG : ICONO_PERSONA_SVG;
    const shapeClass = esCentro ? 'map-marker-square' : 'map-marker-circle';
    
    const pulseHtml = gravedad === 'grave' 
      ? `<div class="map-pulse" style="color: ${colorHex};"></div>` 
      : '';

    return `
      <div class="map-marker-pin ${shapeClass}" style="background-color: ${colorHex};">
        ${pulseHtml}
        <div style="display: flex; align-items: center; justify-content: center;">
          ${svgIcon}
        </div>
      </div>
    `;
  }

  // --- FUNCIÓN 1: MAPA PARA CREAR SOLICITUD ---
  window.iniciarMapaSolicitud = function(divId) {
    if (mapaSolicitud) return;

    if (typeof L === 'undefined') {
      console.error('Leaflet JS no está cargado. No se puede iniciar el mapa.');
      return;
    }

    if (!document.getElementById(divId)) {
      console.error(`El contenedor del mapa de solicitud "${divId}" no existe.`);
      return;
    }

    // Inicializar mapa centrado en Venezuela
    mapaSolicitud = L.map(divId, {
      center: [10.4806, -66.5897],
      zoom: 6,
      zoomControl: true
    });

    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapaSolicitud);

    // Agregar control de GPS interno en el mapa
    new GPSControl().addTo(mapaSolicitud);

    // Evento de click para colocar marcador único
    mapaSolicitud.on('click', function(e) {
      colocarMarcadorFormulario(e.latlng.lat, e.latlng.lng, mapaSolicitud);
    });

    // Hook para el botón externo GPS en el HTML si existe
    const btnGPS = document.getElementById('btn-gps');
    if (btnGPS) {
      btnGPS.addEventListener('click', function() {
        ejecutarGeolocalizacion(mapaSolicitud);
      });
    }
  };

  // Exponer coordenadas seleccionadas
  window.getCoordenadasSeleccionadas = function() {
    if (coordenadasSeleccionadas.lat === null || coordenadasSeleccionadas.lng === null) {
      return null;
    }
    return {
      lat: coordenadasSeleccionadas.lat,
      lng: coordenadasSeleccionadas.lng,
      direccion: coordenadasSeleccionadas.direccion
    };
  };

  // --- FUNCIÓN 2: MAPA DASHBOARD ---
  window.iniciarMapaDashboard = function(divId, solicitudes) {
    if (typeof L === 'undefined') {
      console.error('Leaflet JS no está cargado. No se puede iniciar el mapa del dashboard.');
      return;
    }

    if (!document.getElementById(divId)) {
      console.error(`El contenedor del mapa del dashboard "${divId}" no existe.`);
      return;
    }

    // Limpiar mapa anterior si existe
    if (mapaDashboard) {
      mapaDashboard.remove();
      mapaDashboard = null;
    }

    solicitudesDashboardRaw = solicitudes || [];

    // Inicializar mapa
    mapaDashboard = L.map(divId, {
      center: [10.4806, -66.5897],
      zoom: 6,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapaDashboard);

    // Iniciar renderizado y agrupación
    window.actualizarMarcadores(solicitudesDashboardRaw);
  };

  // Función para actualizar y redibujar marcadores
  window.actualizarMarcadores = function(solicitudes) {
    if (!mapaDashboard) return;

    solicitudesDashboardRaw = solicitudes || [];
    todosLosMarcadores = [];

    // Limpiar capa actual
    if (marcadoresDashboardGroup) {
      mapaDashboard.removeLayer(marcadoresDashboardGroup);
      marcadoresDashboardGroup = null;
    }

    const cantidad = solicitudesDashboardRaw.length;
    const necesitaClustering = cantidad > 20;

    if (necesitaClustering) {
      cargarMarkerCluster(function() {
        if (typeof L.markerClusterGroup !== 'undefined') {
          marcadoresDashboardGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 50
          });
        } else {
          marcadoresDashboardGroup = L.featureGroup();
        }
        crearYAgregarMarcadores();
      });
    } else {
      marcadoresDashboardGroup = L.featureGroup();
      crearYAgregarMarcadores();
    }
  };

  // Función para filtrar marcadores en el mapa sin refrescar
  window.filtrarMarcadores = function(tipo, gravedad) {
    if (!mapaDashboard || !marcadoresDashboardGroup) return;

    marcadoresDashboardGroup.clearLayers();
    const marcadoresFiltrados = [];

    todosLosMarcadores.forEach(function(item) {
      const matchTipo = (tipo === 'todos' || item.data.tipo === tipo);
      const matchGravedad = (gravedad === 'todos' || item.data.gravedad === gravedad);

      if (matchTipo && matchGravedad) {
        marcadoresDashboardGroup.addLayer(item.marker);
        marcadoresFiltrados.push(item.marker);
      }
    });

    // Ajustar zoom a los visibles
    if (marcadoresFiltrados.length > 0) {
      try {
        const bounds = L.featureGroup(marcadoresFiltrados).getBounds();
        if (bounds.isValid()) {
          mapaDashboard.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
      } catch (e) {
        console.warn('No se pudieron ajustar límites tras filtrar:', e);
      }
    }
  };

  // --- AUXILIARES E INTERNAS ---

  // Colocar y configurar el marcador único en el formulario de solicitud
  function colocarMarcadorFormulario(lat, lng, map) {
    const pinIcon = L.divIcon({
      className: 'map-custom-pin-form',
      html: `
        <div class="map-marker-pin map-marker-circle" style="background-color: #CF142B;">
          <div class="map-pulse" style="color: #CF142B;"></div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #FFFFFF;"></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    if (marcadorSolicitud) {
      marcadorSolicitud.setLatLng([lat, lng]);
    } else {
      marcadorSolicitud = L.marker([lat, lng], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      // Evento al terminar de arrastrar el pin
      marcadorSolicitud.on('dragend', function() {
        const pos = marcadorSolicitud.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });
    }

    reverseGeocode(lat, lng);
  }

  // Reverse Geocoding usando Nominatim
  async function reverseGeocode(lat, lng) {
    const inputDirText = document.getElementById('direccion_autocompletada');
    const inputDirVal = document.getElementById('direccion');

    if (inputDirText) {
      if (inputDirText.tagName === 'INPUT' || inputDirText.tagName === 'TEXTAREA') {
        inputDirText.value = 'Obteniendo dirección...';
      } else {
        inputDirText.textContent = 'Obteniendo dirección...';
      }
      inputDirText.classList.remove('hidden');
    }
    if (inputDirVal) {
      inputDirVal.value = 'Obteniendo dirección...';
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
        headers: {
          'Accept-Language': 'es'
        }
      });
      if (!response.ok) throw new Error('Nominatim falló');
      const data = await response.json();
      const address = data.display_name || 'Ubicación seleccionada';

      coordenadasSeleccionadas.lat = parseFloat(lat.toFixed(7));
      coordenadasSeleccionadas.lng = parseFloat(lng.toFixed(7));
      coordenadasSeleccionadas.direccion = address;

      // Actualizar inputs hidden
      const inputLat = document.getElementById('lat');
      const inputLng = document.getElementById('lng');
      if (inputLat) {
        inputLat.value = coordenadasSeleccionadas.lat;
        inputLat.dispatchEvent(new Event('input'));
      }
      if (inputLng) {
        inputLng.value = coordenadasSeleccionadas.lng;
        inputLng.dispatchEvent(new Event('input'));
      }

      if (inputDirText) {
        if (inputDirText.tagName === 'INPUT' || inputDirText.tagName === 'TEXTAREA') {
          inputDirText.value = address;
        } else {
          inputDirText.textContent = address;
        }
      }
      if (inputDirVal) {
        inputDirVal.value = address;
      }
    } catch (err) {
      console.error('Error Nominatim:', err);
      const fallbackDir = `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      coordenadasSeleccionadas.lat = parseFloat(lat.toFixed(7));
      coordenadasSeleccionadas.lng = parseFloat(lng.toFixed(7));
      coordenadasSeleccionadas.direccion = fallbackDir;

      if (inputDirText) {
        if (inputDirText.tagName === 'INPUT' || inputDirText.tagName === 'TEXTAREA') {
          inputDirText.value = fallbackDir;
        } else {
          inputDirText.textContent = fallbackDir;
        }
      }
      if (inputDirVal) {
        inputDirVal.value = fallbackDir;
      }
    }
  }

  // Autorizar y ejecutar el geoposicionamiento del GPS
  function ejecutarGeolocalizacion(map) {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }

    const btnGPS = document.getElementById('btn-gps');
    const originalText = btnGPS ? btnGPS.innerHTML : '';

    if (btnGPS) {
      btnGPS.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style="width: 1.25rem; height: 1.25rem; vertical-align: middle; animation: spin 1s linear infinite;">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style="opacity: 0.75;"></path>
        </svg>
        Localizando...
      `;
      btnGPS.disabled = true;
    }

    navigator.geolocation.getCurrentPosition(
      async function(pos) {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        map.setView([lat, lng], 14);
        colocarMarcadorFormulario(lat, lng, map);

        if (btnGPS) {
          btnGPS.innerHTML = originalText || '📍 Usar mi ubicación GPS';
          btnGPS.disabled = false;
        }
      },
      function(error) {
        manejarErrorGeolocalizacion(error);
        if (btnGPS) {
          btnGPS.innerHTML = originalText || '📍 Usar mi ubicación GPS';
          btnGPS.disabled = false;
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // Manejo amigable de errores de GPS
  function manejarErrorGeolocalizacion(error) {
    let mensaje = 'No se pudo obtener tu ubicación.';
    switch(error.code) {
      case error.PERMISSION_DENIED:
        mensaje = '📍 Permiso de ubicación denegado. Concede permisos en tu navegador o selecciona manualmente en el mapa.';
        break;
      case error.POSITION_UNAVAILABLE:
        mensaje = '📍 Ubicación no disponible actualmente. Intenta de nuevo o selecciona en el mapa.';
        break;
      case error.TIMEOUT:
        mensaje = '📍 Se agotó el tiempo para obtener la ubicación. Selecciona manualmente en el mapa.';
        break;
      default:
        mensaje = '📍 Error al obtener ubicación. Selecciona manualmente en el mapa.';
        break;
    }
    alert(mensaje);
  }

  // Control personalizado de Leaflet para botón GPS interno en el mapa
  const GPSControl = L.Control.extend({
    options: {
      position: 'topright'
    },
    onAdd: function(map) {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      const button = L.DomUtil.create('a', 'gps-control-button', container);
      
      button.innerHTML = '📍';
      button.title = 'Usar mi ubicación';
      button.href = '#';
      button.style.backgroundColor = '#1A1A1A';
      button.style.color = '#FFFFFF';
      button.style.border = 'none';
      button.style.width = '34px';
      button.style.height = '34px';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.fontSize = '16px';
      button.style.cursor = 'pointer';
      button.style.transition = 'background-color 0.2s';
      
      button.onmouseover = function() { button.style.backgroundColor = '#2A2A2A'; };
      button.onmouseout = function() { button.style.backgroundColor = '#1A1A1A'; };

      L.DomEvent.on(button, 'click', function(e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        ejecutarGeolocalizacion(map);
      });

      return container;
    }
  });

  // Crea y añade marcadores individuales del array de datos al grupo
  function crearYAgregarMarcadores() {
    if (!mapaDashboard || !marcadoresDashboardGroup) return;

    solicitudesDashboardRaw.forEach(function(sol) {
      if (!sol.latitud || !sol.longitud) return;

      const lat = parseFloat(sol.latitud);
      const lng = parseFloat(sol.longitud);
      if (isNaN(lat) || isNaN(lng)) return;

      const customIcon = L.divIcon({
        className: 'map-custom-pin',
        html: crearHtmlMarcador(sol.tipo, sol.gravedad),
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19]
      });

      const popupContent = crearHtmlPopup(sol);

      const marker = L.marker([lat, lng], { icon: customIcon });
      marker.bindPopup(popupContent, {
        className: 'custom-dark-popup',
        maxWidth: 260
      });

      todosLosMarcadores.push({
        marker: marker,
        data: sol
      });

      marcadoresDashboardGroup.addLayer(marker);
    });

    mapaDashboard.addLayer(marcadoresDashboardGroup);

    if (todosLosMarcadores.length > 0) {
      try {
        const bounds = marcadoresDashboardGroup.getBounds();
        if (bounds.isValid()) {
          mapaDashboard.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
      } catch (e) {
        console.warn('No se pudieron ajustar límites del mapa:', e);
      }
    }
  }

  // Genera el HTML enriquecido para el popup detallado
  function crearHtmlPopup(sol) {
    const lat = parseFloat(sol.latitud);
    const lng = parseFloat(sol.longitud);
    const nombreCompleto = `${sol.nombre || ''} ${sol.apellido || ''}`.trim() || 'Anónimo';

    const esCentro = sol.tipo === 'centro_acopio';
    const tipoLabel = esCentro ? 'Centro de Acopio' : 'Individuo / SOS';
    const tipoBadgeColor = esCentro ? 'background-color: #003087; color: #FFFFFF;' : 'background-color: #CF142B; color: #FFFFFF;';

    const gravedadLabel = (sol.gravedad || 'leve').toUpperCase();
    let gravedadBadgeStyle = 'background-color: rgba(34, 197, 94, 0.15); color: #22C55E; border: 1px solid #22C55E;';
    if (sol.gravedad === 'grave') {
      gravedadBadgeStyle = 'background-color: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid #EF4444;';
    } else if (sol.gravedad === 'moderado') {
      gravedadBadgeStyle = 'background-color: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid #F59E0B;';
    }

    const tiempoRelativo = window.formatTiempoRelativo(sol.created_at);

    const motivoHtml = sol.motivo ? `
      <p style="margin: 8px 0; font-size: 12.5px; color: #E5E7EB; line-clamp: 3; -webkit-line-clamp: 3; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; font-style: italic;">
        "${sol.motivo}"
      </p>
    ` : '';

    let itemsHtml = '';
    if (esCentro) {
      let itemsArray = [];
      if (sol.items) {
        if (Array.isArray(sol.items)) {
          itemsArray = sol.items;
        } else if (typeof sol.items === 'string') {
          try {
            itemsArray = JSON.parse(sol.items);
          } catch (e) {
            itemsArray = sol.items.split(',').map(i => i.trim()).filter(Boolean);
          }
        }
      }

      if (itemsArray.length > 0) {
        const itemPills = itemsArray.map(item => `
          <span style="background-color: #2A2A2A; color: #E5E7EB; font-size: 10px; padding: 2px 6px; border-radius: 4px; border: 1px solid #3A3A3A; white-space: nowrap; display: inline-block;">
            ${item}
          </span>
        `).join('');

        itemsHtml = `
          <div style="margin-top: 8px;">
            <strong style="color: #9CA3AF; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Insumos Necesarios:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; max-height: 70px; overflow-y: auto; padding-right: 2px;">
              ${itemPills}
            </div>
          </div>
        `;
      }
    }

    const fotoHtml = sol.foto_url ? `
      <div style="margin-top: 8px; border-radius: 6px; overflow: hidden; border: 1px solid #2A2A2A; height: 100px; cursor: pointer;" onclick="window.open('${sol.foto_url}', '_blank')">
        <img src="${sol.foto_url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentNode.style.display='none';" />
      </div>
    ` : '';

    const direccionRef = sol.direccion_referencia || sol.direccion || 'Ubicación marcada';

    return `
      <div style="font-family: 'Inter', sans-serif; text-align: left; color: #F0F0F0; width: 240px; word-wrap: break-word;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
          <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; ${tipoBadgeColor}">
            ${tipoLabel}
          </span>
          <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; ${gravedadBadgeStyle}">
            ${gravedadLabel}
          </span>
        </div>
        
        <h3 style="margin: 0; font-size: 14.5px; font-weight: 700; color: #FFFFFF; line-height: 1.2;">
          ${nombreCompleto}
        </h3>
        
        <span style="font-size: 10.5px; color: #9CA3AF; display: block; margin-top: 1px;">
          ${tiempoRelativo}
        </span>
        
        ${motivoHtml}
        ${itemsHtml}
        ${fotoHtml}
        
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #2A2A2A; display: flex; align-items: center; justify-content: space-between; gap: 4px; font-size: 11px;">
          <span style="color: #9CA3AF; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1;" title="${direccionRef}">
            📍 ${direccionRef}
          </span>
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" style="color: #F5C400; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0;" class="gmaps-link-hover">
            GMaps ↗
          </a>
        </div>
      </div>
    `;
  }

  // Cargador dinámico para Leaflet.markercluster
  function cargarMarkerCluster(callback) {
    if (typeof L.markerClusterGroup !== 'undefined') {
      callback();
      return;
    }

    callbacksEsperaMarkerCluster.push(callback);

    if (cargandoMarkerCluster) return;
    cargandoMarkerCluster = true;

    const css1 = document.createElement('link');
    css1.rel = 'stylesheet';
    css1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
    document.head.appendChild(css1);

    const css2 = document.createElement('link');
    css2.rel = 'stylesheet';
    css2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
    document.head.appendChild(css2);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
    script.onload = function() {
      markerClusterCargado = true;
      cargandoMarkerCluster = false;
      inyectarEstilosCluster();
      
      while (callbacksEsperaMarkerCluster.length > 0) {
        const cb = callbacksEsperaMarkerCluster.shift();
        if (typeof cb === 'function') cb();
      }
    };
    script.onerror = function() {
      console.error('No se pudo cargar Leaflet.markercluster CDN.');
      cargandoMarkerCluster = false;
      while (callbacksEsperaMarkerCluster.length > 0) {
        const cb = callbacksEsperaMarkerCluster.shift();
        if (typeof cb === 'function') cb();
      }
    };
    document.head.appendChild(script);
  }

  // Estilos CSS para el agrupador de marcadores
  function inyectarEstilosCluster() {
    if (document.getElementById('leaflet-cluster-dark-styles')) return;

    const style = document.createElement('style');
    style.id = 'leaflet-cluster-dark-styles';
    style.innerHTML = `
      .marker-cluster-small {
        background-color: rgba(245, 196, 0, 0.2) !important;
      }
      .marker-cluster-small div {
        background-color: rgba(245, 196, 0, 0.6) !important;
        color: #0D0D0D !important;
        font-weight: bold !important;
      }
      .marker-cluster-medium {
        background-color: rgba(245, 158, 11, 0.2) !important;
      }
      .marker-cluster-medium div {
        background-color: rgba(245, 158, 11, 0.6) !important;
        color: #0D0D0D !important;
        font-weight: bold !important;
      }
      .marker-cluster-large {
        background-color: rgba(239, 68, 68, 0.2) !important;
      }
      .marker-cluster-large div {
        background-color: rgba(239, 68, 68, 0.6) !important;
        color: #FFFFFF !important;
        font-weight: bold !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Inyección inicial de estilos CSS para los pines y popups
  function inyectarEstilosMapa() {
    if (document.getElementById('leaflet-custom-premium-styles')) return;

    const style = document.createElement('style');
    style.id = 'leaflet-custom-premium-styles';
    style.innerHTML = `
      .map-marker-pin {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        border: 2.5px solid #FFFFFF;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3);
        color: #FFFFFF;
        position: relative;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .map-marker-pin:hover {
        transform: scale(1.15);
        z-index: 1000 !important;
      }
      .map-marker-square {
        border-radius: 6px;
      }
      .map-marker-circle {
        border-radius: 50%;
      }
      .map-pulse {
        position: absolute;
        top: -2.5px;
        left: -2.5px;
        width: 38px;
        height: 38px;
        border-radius: inherit;
        border: 2px solid currentColor;
        opacity: 0;
        animation: map-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        pointer-events: none;
      }
      @keyframes map-ping {
        0% {
          transform: scale(1);
          opacity: 0.85;
        }
        100% {
          transform: scale(1.6);
          opacity: 0;
        }
      }
      .custom-dark-popup .leaflet-popup-content-wrapper {
        background-color: #1A1A1A !important;
        color: #F0F0F0 !important;
        border: 1px solid #2A2A2A !important;
        border-radius: 10px !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7) !important;
        padding: 4px !important;
      }
      .custom-dark-popup .leaflet-popup-content {
        margin: 8px 10px !important;
        line-height: 1.4 !important;
      }
      .custom-dark-popup .leaflet-popup-tip {
        background-color: #1A1A1A !important;
        border: 1px solid #2A2A2A !important;
      }
      .custom-dark-popup .leaflet-popup-close-button {
        color: #9CA3AF !important;
        font-size: 16px !important;
        padding: 6px 4px 0 0 !important;
      }
      .custom-dark-popup .leaflet-popup-close-button:hover {
        color: #FFFFFF !important;
        background: transparent !important;
      }
      .gmaps-link-hover:hover {
        text-decoration: underline !important;
        color: #FFD700 !important;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Inicializar inyección de estilos
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inyectarEstilosMapa);
  } else {
    inyectarEstilosMapa();
  }
})();
