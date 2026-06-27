// supabase.js - Cliente e integración con Supabase
// Proporciona todas las funciones de base de datos y storage para la aplicación.

(function() {
  // Cliente Supabase global
  let supabaseClient = null;

  // Inicializar Supabase
  window.inicializarSupabase = function() {
    if (supabaseClient) return supabaseClient;

    if (typeof window.SUPABASE_CONFIG === 'undefined') {
      console.warn('SUPABASE_CONFIG no está definido. Asegúrate de incluir config.js.');
      return null;
    }

    const { url, key } = window.SUPABASE_CONFIG;
    if (!url || !key || url.includes('AQUI') || key.includes('AQUI')) {
      console.warn('Credenciales de Supabase no configuradas o con valores de plantilla.');
      return null;
    }

    try {
      // supabase es cargado desde el CDN de UMD como una variable global
      if (typeof window.supabase === 'undefined') {
        console.error('El script de Supabase no está cargado.');
        return null;
      }
      supabaseClient = window.supabase.createClient(url, key);
      window._supabase = supabaseClient;
      return supabaseClient;
    } catch (e) {
      console.error('Error al inicializar el cliente de Supabase:', e);
      return null;
    }
  };

  // Crear una nueva solicitud en la base de datos
  window.crearSolicitud = async function(datos) {
    const client = window.inicializarSupabase();
    if (!client) {
      // Fallback local en memoria para desarrollo/emergencia si no hay BD
      console.warn('Modo sin conexión/mock: Guardando solicitud localmente.');
      const mockId = 'mock-' + Math.floor(Math.random() * 10000000);
      const mockSolicitudes = JSON.parse(localStorage.getItem('mock_solicitudes') || '[]');
      const nuevaSolicitud = { id: mockId, ...datos, created_at: new Date().toISOString(), activo: true };
      mockSolicitudes.push(nuevaSolicitud);
      localStorage.setItem('mock_solicitudes', JSON.stringify(mockSolicitudes));
      return { success: true, id: mockId, mock: true };
    }

    try {
      const { data, error } = await client
        .from('solicitudes')
        .insert([
          {
            tipo: datos.tipo,
            nombre: datos.nombre,
            apellido: datos.apellido,
            cedula: datos.cedula,
            motivo: datos.motivo,
            gravedad: datos.gravedad,
            items: datos.items || [],
            foto_url: datos.foto_url || null,
            latitud: datos.latitud,
            longitud: datos.longitud,
            direccion_referencia: datos.direccion_referencia || ''
          }
        ])
        .select();

      if (error) throw error;
      return { success: true, id: data[0].id };
    } catch (e) {
      console.error('Error al crear solicitud en Supabase:', e);
      // Fallback si la tabla no existe o falla la red
      const mockId = 'mock-' + Math.floor(Math.random() * 10000000);
      const mockSolicitudes = JSON.parse(localStorage.getItem('mock_solicitudes') || '[]');
      const nuevaSolicitud = { id: mockId, ...datos, created_at: new Date().toISOString(), activo: true };
      mockSolicitudes.push(nuevaSolicitud);
      localStorage.setItem('mock_solicitudes', JSON.stringify(mockSolicitudes));
      return { success: true, id: mockId, mock: true, warning: 'Guardado localmente debido a un fallo en la base de datos.' };
    }
  };

  // Obtener solicitudes con filtros opcionales
  window.obtenerSolicitudes = async function(filtros = {}) {
    const client = window.inicializarSupabase();
    const mockSolicitudes = JSON.parse(localStorage.getItem('mock_solicitudes') || '[]');

    if (!client) {
      // Filtrar solicitudes locales
      let data = [...mockSolicitudes];
      if (filtros.activo !== undefined) data = data.filter(s => s.activo === filtros.activo);
      if (filtros.tipo && filtros.tipo !== 'todos') data = data.filter(s => s.tipo === filtros.tipo);
      if (filtros.gravedad && filtros.gravedad !== 'todos') data = data.filter(s => s.gravedad === filtros.gravedad);
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (filtros.limite) data = data.slice(0, filtros.limite);
      return { success: true, data };
    }

    try {
      let query = client
        .from('solicitudes')
        .select('*');

      if (filtros.activo !== undefined) {
        query = query.eq('activo', filtros.activo);
      } else {
        query = query.eq('activo', true);
      }

      if (filtros.tipo && filtros.tipo !== 'todos') {
        query = query.eq('tipo', filtros.tipo);
      }

      if (filtros.gravedad && filtros.gravedad !== 'todos') {
        query = query.eq('gravedad', filtros.gravedad);
      }

      query = query.order('created_at', { ascending: false });

      if (filtros.limite) {
        query = query.limit(filtros.limite);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Combinar con mock local para consistencia si el usuario insertó algo localmente
      const combinados = [...data, ...mockSolicitudes];
      // Eliminar duplicados si los hay por ID
      const unicos = [];
      const ids = new Set();
      for (const item of combinados) {
        if (!ids.has(item.id)) {
          ids.add(item.id);
          unicos.push(item);
        }
      }
      unicos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return { success: true, data: unicos };
    } catch (e) {
      console.error('Error al obtener solicitudes de Supabase:', e);
      // Fallback a locales
      return { success: true, data: mockSolicitudes, mock: true };
    }
  };

  // Obtener estadísticas dinámicas
  window.obtenerEstadisticas = async function() {
    const client = window.inicializarSupabase();
    
    // Obtener mock local
    const mockSolicitudes = JSON.parse(localStorage.getItem('mock_solicitudes') || '[]');
    let localTotal = mockSolicitudes.filter(s => s.activo).length;
    let localGrave = mockSolicitudes.filter(s => s.activo && s.gravedad === 'grave').length;
    let localModerado = mockSolicitudes.filter(s => s.activo && s.gravedad === 'moderado').length;
    let localLeve = mockSolicitudes.filter(s => s.activo && s.gravedad === 'leve').length;
    let localCentros = mockSolicitudes.filter(s => s.activo && s.tipo === 'centro_acopio').length;
    let localIndividuos = mockSolicitudes.filter(s => s.activo && s.tipo === 'individuo').length;

    if (!client) {
      return {
        total: localTotal,
        grave: localGrave,
        moderado: localModerado,
        leve: localLeve,
        centros: localCentros,
        individuos: localIndividuos,
        mock: true
      };
    }

    try {
      const { data, error } = await client
        .from('solicitudes')
        .select('tipo, gravedad, activo');

      if (error) throw error;

      const activas = data.filter(s => s.activo);
      
      const stats = {
        total: activas.length + localTotal,
        grave: activas.filter(s => s.gravedad === 'grave').length + localGrave,
        moderado: activas.filter(s => s.gravedad === 'moderado').length + localModerado,
        leve: activas.filter(s => s.gravedad === 'leve').length + localLeve,
        centros: activas.filter(s => s.tipo === 'centro_acopio').length + localCentros,
        individuos: activas.filter(s => s.tipo === 'individuo').length + localIndividuos
      };

      return stats;
    } catch (e) {
      console.error('Error al obtener estadísticas de Supabase:', e);
      return {
        total: localTotal,
        grave: localGrave,
        moderado: localModerado,
        leve: localLeve,
        centros: localCentros,
        individuos: localIndividuos,
        mock: true
      };
    }
  };

  // Subir foto a Supabase Storage
  window.subirFoto = async function(archivoBlob, nombreArchivo) {
    const client = window.inicializarSupabase();
    if (!client) {
      console.warn('Supabase no inicializado, simulando subida de foto.');
      // En modo mock retornamos una URL de datos Base64 o de objeto local si es posible
      const urlLocal = URL.createObjectURL(archivoBlob);
      return { success: true, url: urlLocal, mock: true };
    }

    try {
      const timestamp = new Date().getTime();
      const nombreLimpio = nombreArchivo.replace(/[^a-zA-Z0-9.]/g, '_');
      const nombreUnico = `${timestamp}_${nombreLimpio}`;

      const { data, error } = await client.storage
        .from('fotos-solicitudes')
        .upload(nombreUnico, archivoBlob, {
          contentType: archivoBlob.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: publicUrlData } = client.storage
        .from('fotos-solicitudes')
        .getPublicUrl(nombreUnico);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (e) {
      console.error('Error al subir foto a Supabase:', e);
      // Fallback local url
      const urlLocal = URL.createObjectURL(archivoBlob);
      return { success: true, url: urlLocal, mock: true, warning: 'Foto guardada temporalmente en navegador.' };
    }
  };

  // Suscribirse a cambios en tiempo real
  window.suscribirCambios = function(callback) {
    const client = window.inicializarSupabase();
    if (!client) {
      console.warn('Realtime no disponible en modo sin conexión.');
      return { unsubscribe: () => {} };
    }

    try {
      const canal = client
        .channel('solicitudes_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'solicitudes' },
          (payload) => {
            if (payload.new && payload.new.activo) {
              callback(payload.new);
            }
          }
        )
        .subscribe();

      return canal;
    } catch (e) {
      console.error('Error al suscribirse a Realtime:', e);
      return { unsubscribe: () => {} };
    }
  };

  // Autocarga de la inicialización al estar listo el DOM
  document.addEventListener('DOMContentLoaded', () => {
    window.inicializarSupabase();
  });
})();
