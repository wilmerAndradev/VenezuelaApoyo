// supabase.js - Cliente y funciones de base de datos para AcopioVE

let supabaseClient = null;

/**
 * Inicializa el cliente de Supabase usando la configuración global.
 * Debe llamarse después de cargar config.js y la CDN de Supabase.
 */
function initSupabase() {
  if (typeof SUPABASE_CONFIG === 'undefined') {
    console.error("Error: SUPABASE_CONFIG no está definido. Asegúrate de que config.js esté cargado.");
    return null;
  }
  if (typeof supabase === 'undefined') {
    console.error("Error: La librería de Supabase no está cargada desde CDN.");
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
  }
  return supabaseClient;
}

/**
 * Obtiene el cliente inicializado, garantizando que esté listo.
 */
function getSupabaseClient() {
  if (!supabaseClient) {
    initSupabase();
  }
  return supabaseClient;
}

/**
 * Registra una nueva solicitud de insumos en la base de datos.
 * @param {Object} datos - Objeto con los datos del formulario.
 * @returns {Promise<Object>} Resultado de la inserción.
 */
async function crearSolicitud(datos) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no inicializado");

  // Sanitización y formateo básico de datos
  const payload = {
    tipo: datos.tipo, // 'centro_acopio' | 'individuo'
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    cedula: datos.cedula.trim(),
    motivo: datos.motivo.trim(),
    gravedad: datos.gravedad, // 'leve' | 'moderado' | 'grave'
    items: datos.items || [], // array de strings
    foto_url: datos.foto_url || null,
    latitud: parseFloat(datos.latitud),
    longitud: parseFloat(datos.longitud),
    direccion_referencia: datos.direccion_referencia ? datos.direccion_referencia.trim() : '',
    activo: true
  };

  const { data, error } = await client
    .from('solicitudes')
    .insert([payload])
    .select();

  if (error) {
    console.error("Error al crear solicitud:", error);
    throw error;
  }

  return data[0];
}

/**
 * Obtiene la lista de solicitudes activas aplicando filtros opcionales.
 * @param {Object} filtros - Filtros opcionales { tipo, gravedad }
 * @returns {Promise<Array>} Lista de solicitudes.
 */
async function obtenerSolicitudes(filtros = {}) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no inicializado");

  let query = client
    .from('solicitudes')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false });

  if (filtros.tipo && filtros.tipo !== 'todos') {
    query = query.eq('tipo', filtros.tipo);
  }

  if (filtros.gravedad && filtros.gravedad !== 'todos') {
    query = query.eq('gravedad', filtros.gravedad);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al obtener solicitudes:", error);
    throw error;
  }

  return data;
}

/**
 * Obtiene estadísticas generales de las solicitudes activas.
 * @returns {Promise<Object>} Estadísticas { total, centro_acopio, individuo, grave, moderado, leve }
 */
async function obtenerEstadisticas() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no inicializado");

  // Hacemos una consulta ligera trayendo solo tipo y gravedad de las activas para procesar localmente
  const { data, error } = await client
    .from('solicitudes')
    .select('tipo, gravedad')
    .eq('activo', true);

  if (error) {
    console.error("Error al obtener estadísticas:", error);
    throw error;
  }

  const stats = {
    total: data.length,
    centro_acopio: 0,
    individuo: 0,
    grave: 0,
    moderado: 0,
    leve: 0
  };

  data.forEach(item => {
    if (stats.hasOwnProperty(item.tipo)) {
      stats[item.tipo]++;
    }
    if (stats.hasOwnProperty(item.gravedad)) {
      stats[item.gravedad]++;
    }
  });

  return stats;
}

/**
 * Sube una foto comprimida al bucket 'fotos-solicitudes' y retorna su URL pública.
 * @param {Blob|File} archivo - Archivo a subir.
 * @returns {Promise<string>} URL pública de la imagen.
 */
async function subirFoto(archivo) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no inicializado");

  // Generar un nombre de archivo único
  const fileExt = archivo.name ? archivo.name.split('.').pop() : 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = fileName;

  const { data, error } = await client.storage
    .from('fotos-solicitudes')
    .upload(filePath, archivo, {
      contentType: archivo.type || 'image/jpeg',
      cacheControl: '3600'
    });

  if (error) {
    console.error("Error al subir foto:", error);
    throw error;
  }

  // Obtener URL pública
  const { data: publicUrlData } = client.storage
    .from('fotos-solicitudes')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
