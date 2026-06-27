/**
 * supabase.js - Módulo de Integración con Supabase para AcopioVE
 * 
 * Este archivo actúa como el punto único de contacto entre el frontend
 * y la base de datos/almacenamiento de Supabase.
 * Todas las funciones se exponen globalmente a través del objeto window.
 */

(function() {
  // Instancia privada del cliente Supabase
  let supabaseClient = null;

  /**
   * 1. Inicializa el cliente de Supabase.
   * Lee credenciales globales de window.SUPABASE_CONFIG.
   * 
   * @returns {Object|null} El cliente Supabase inicializado o null en caso de error.
   */
  window.inicializarSupabase = function() {
    if (supabaseClient) {
      return supabaseClient;
    }

    // Validar existencia de configuración global
    if (typeof window.SUPABASE_CONFIG === 'undefined') {
      console.error('Error: SUPABASE_CONFIG no está definido. Asegúrate de incluir config.js antes de supabase.js.');
      return null;
    }

    const { url, key } = window.SUPABASE_CONFIG;
    if (!url || !key || url.includes('AQUI') || key.includes('AQUI')) {
      console.error('Error: Las credenciales de Supabase en config.js no son válidas o están vacías.');
      return null;
    }

    try {
      // Verificar que la librería de Supabase del CDN esté cargada
      if (typeof window.supabase === 'undefined') {
        console.error('Error: El SDK global de Supabase no está cargado. Asegúrate de incluir la etiqueta script del CDN en el HTML.');
        return null;
      }

      // Crear e instanciar el cliente
      supabaseClient = window.supabase.createClient(url, key);
      window._supabase = supabaseClient;
      
      console.log('Supabase inicializado correctamente.');
      return supabaseClient;
    } catch (error) {
      console.error('Error al instanciar el cliente de Supabase:', error);
      return null;
    }
  };

  /**
   * Obtiene la instancia activa del cliente Supabase, inicializándolo si es necesario.
   * 
   * @returns {Object} El cliente Supabase.
   * @throws {Error} Si Supabase no ha sido inicializado.
   */
  function obtenerCliente() {
    const client = window.inicializarSupabase();
    if (!client) {
      throw new Error('Supabase no está inicializado. Verifica las credenciales en config.js.');
    }
    return client;
  }

  /**
   * 2. Crea una nueva solicitud de ayuda en la base de datos.
   * 
   * @param {Object} datos - Objeto con los datos de la solicitud.
   * @returns {Promise<Object>} Promesa que resuelve a { success: true, id } o { success: false, error }.
   */
  window.crearSolicitud = async function(datos) {
    try {
      const client = obtenerCliente();

      // Validaciones básicas de tipo de datos en el cliente para ahorrar ancho de banda
      if (!datos.tipo || (datos.tipo !== 'centro_acopio' && datos.tipo !== 'individuo')) {
        return { success: false, error: 'El campo tipo es obligatorio y debe ser "centro_acopio" o "individuo".' };
      }
      if (!datos.nombre || datos.nombre.trim() === '') {
        return { success: false, error: 'El nombre es requerido.' };
      }
      if (!datos.apellido || datos.apellido.trim() === '') {
        return { success: false, error: 'El apellido es requerido.' };
      }
      if (!datos.cedula || !/^[0-9]{6,10}$/.test(datos.cedula)) {
        return { success: false, error: 'La cédula debe contener únicamente números y tener entre 6 y 10 dígitos.' };
      }
      if (!datos.motivo || datos.motivo.trim() === '') {
        return { success: false, error: 'El motivo es requerido.' };
      }
      if (!datos.gravedad || (datos.gravedad !== 'leve' && datos.gravedad !== 'moderado' && datos.gravedad !== 'grave')) {
        return { success: false, error: 'La gravedad debe ser "leve", "moderado" o "grave".' };
      }

      // Preparar payload de inserción sanitizado
      const payload = {
        tipo: datos.tipo,
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        cedula: datos.cedula.trim(),
        motivo: datos.motivo.trim(),
        gravedad: datos.gravedad,
        items: Array.isArray(datos.items) ? datos.items : [],
        foto_url: datos.foto_url ? datos.foto_url.trim() : null,
        latitud: datos.latitud ? parseFloat(datos.latitud) : null,
        longitud: datos.longitud ? parseFloat(datos.longitud) : null,
        direccion_referencia: datos.direccion_referencia ? datos.direccion_referencia.trim() : null,
        activo: true
      };

      const { data, error } = await client
        .from('solicitudes')
        .insert([payload])
        .select('id');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No se recibió confirmación de ID de la fila insertada.');
      }

      return { success: true, id: data[0].id };
    } catch (error) {
      console.error('Error en crearSolicitud:', error);
      return { success: false, error: error.message || 'Error desconocido al guardar la solicitud.' };
    }
  };

  /**
   * 3. Obtiene una lista de solicitudes con filtros opcionales.
   * 
   * @param {Object} filtros - Opciones de filtrado y ordenación.
   * @param {string} [filtros.tipo] - Filtra por 'centro_acopio' o 'individuo'.
   * @param {string} [filtros.gravedad] - Filtra por 'leve', 'moderado', 'grave'.
   * @param {boolean} [filtros.activo=true] - Filtra por estado activo.
   * @param {number} [filtros.limite=100] - Cantidad máxima de registros.
   * @returns {Promise<Object>} Resuelve a { success: true, data } o { success: false, error }.
   */
  window.obtenerSolicitudes = async function(filtros = {}) {
    try {
      const client = obtenerCliente();

      // Construcción base del query
      let query = client.from('solicitudes').select('*');

      // Filtro de activo (por defecto true)
      const activo = (filtros.activo !== undefined) ? filtros.activo : true;
      if (activo !== null) {
        query = query.eq('activo', activo);
      }

      // Filtro de tipo
      if (filtros.tipo && filtros.tipo !== 'todos') {
        query = query.eq('tipo', filtros.tipo);
      }

      // Filtro de gravedad
      if (filtros.gravedad && filtros.gravedad !== 'todos') {
        query = query.eq('gravedad', filtros.gravedad);
      }

      // Ordenar por defecto de más reciente a más antiguo
      query = query.order('created_at', { ascending: false });

      // Limitar cantidad de filas (por defecto 100)
      const limite = (filtros.limite !== undefined) ? filtros.limite : 100;
      query = query.limit(limite);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error en obtenerSolicitudes:', error);
      return { success: false, error: error.message || 'Error al obtener las solicitudes de ayuda.' };
    }
  };

  /**
   * 4. Obtiene estadísticas dinámicas consolidadas de solicitudes activas.
   * 
   * @returns {Promise<Object>} Resuelve a { success: true, total, grave, moderado, leve, centros, individuos } o { success: false, error }.
   */
  window.obtenerEstadisticas = async function() {
    try {
      const client = obtenerCliente();

      // Consultar únicamente campos clave de filas activas para optimizar ancho de banda
      const { data, error } = await client
        .from('solicitudes')
        .select('tipo, gravedad')
        .eq('activo', true);

      if (error) {
        throw error;
      }

      // Contadores
      let grave = 0;
      let moderado = 0;
      let leve = 0;
      let centros = 0;
      let individuos = 0;

      data.forEach(item => {
        // Gravedad
        if (item.gravedad === 'grave') grave++;
        else if (item.gravedad === 'moderado') moderado++;
        else if (item.gravedad === 'leve') leve++;

        // Tipo de solicitante
        if (item.tipo === 'centro_acopio') centros++;
        else if (item.tipo === 'individuo') individuos++;
      });

      return {
        success: true,
        total: data.length,
        grave,
        moderado,
        leve,
        centros,
        individuos
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      return { success: false, error: error.message || 'Error al calcular estadísticas.' };
    }
  };

  /**
   * 5. Sube una foto a Supabase Storage en el bucket 'fotos-solicitudes'.
   * 
   * @param {Blob|File} archivoBlob - El archivo o blob de la imagen a subir.
   * @param {string} nombreArchivo - Nombre original del archivo.
   * @returns {Promise<Object>} Resuelve a { success: true, url } o { success: false, error }.
   */
  window.subirFoto = async function(archivoBlob, nombreArchivo) {
    try {
      const client = obtenerCliente();

      if (!archivoBlob) {
        return { success: false, error: 'No se ha provisto ningún archivo.' };
      }

      // Generar nombre de archivo único libre de caracteres especiales
      const timestamp = Date.now();
      const nombreLimpio = nombreArchivo.replace(/[^a-zA-Z0-9.]/g, '_');
      const nombreUnico = `${timestamp}_${nombreLimpio}`;

      // Subir archivo al bucket
      const { error } = await client.storage
        .from('fotos-solicitudes')
        .upload(nombreUnico, archivoBlob, {
          contentType: archivoBlob.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Generar y obtener URL pública
      const { data: publicUrlData } = client.storage
        .from('fotos-solicitudes')
        .getPublicUrl(nombreUnico);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('No se pudo generar la URL pública del archivo subido.');
      }

      return { success: true, url: publicUrlData.publicUrl };
    } catch (error) {
      console.error('Error en subirFoto:', error);
      return { success: false, error: error.message || 'Error al subir la imagen al servidor.' };
    }
  };

  /**
   * 6. Se suscribe a inserciones de solicitudes en tiempo real vía Realtime.
   * Llama a la función callback cada vez que se inserta una nueva solicitud activa.
   * 
   * @param {Function} callback - Función que recibe la nueva solicitud.
   * @returns {Object} El canal de realtime activo, con el método .unsubscribe() envuelto.
   */
  window.suscribirCambios = function(callback) {
    try {
      const client = obtenerCliente();

      if (typeof callback !== 'function') {
        console.warn('Advertencia: El parámetro callback de suscribirCambios no es una función válida.');
        return null;
      }

      const canal = client
        .channel('solicitudes_realtime_insert')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'solicitudes' },
          (payload) => {
            // Solo notificar si la solicitud entrante está activa
            if (payload.new && payload.new.activo) {
              callback(payload.new);
            }
          }
        )
        .subscribe();

      // El objeto canal devuelto ya tiene incorporado el método .unsubscribe() nativo en Supabase v2
      return canal;
    } catch (error) {
      console.error('Error en suscribirCambios:', error);
      return null;
    }
  };

  // Bloque de auto-inicialización al cargarse el DOM
  document.addEventListener('DOMContentLoaded', () => {
    window.inicializarSupabase();
  });
})();
