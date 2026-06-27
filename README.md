# AcopioVE 🇻🇪
App de gestión de solicitudes para centros de acopio - Ecosistema AyudaVenezuela

## Producción
La aplicación está desplegada en producción en: [https://acopio.ayudavenezuela.com](https://acopio.ayudavenezuela.com)

## Descripción
Aplicación móvil y de bajo ancho de banda para coordinar el acopio y distribución de ayuda humanitaria e insumos ante la emergencia por el terremoto en Venezuela, permitiendo a los centros de acopio e individuos registrar sus necesidades en tiempo real.

## Setup local
1. Clona el repositorio
2. Copia config.example.js como config.js
3. Agrega tus credenciales de Supabase en config.js
4. Abre index.html en tu navegador

## Variables de entorno requeridas
SUPABASE_URL=tu_url_aqui
SUPABASE_ANON_KEY=tu_key_aqui

## Stack
HTML5 + CSS + JS Vanilla | Supabase | Leaflet.js | Vercel

## Parte del ecosistema
[AyudaVenezuela](https://ayudavenezuela.com)

---

## Despliegue en Producción (Vercel)

Para desplegar la aplicación en Vercel con zero downtime, sigue estos pasos:

### a) Conectar el repositorio a Vercel
1. Ve al dashboard de Vercel y selecciona **"Add New Project"**.
2. Selecciona **"Import Git Repository"** e importa `github.com/[TU_USUARIO]/acopio-venezuela`.
3. Configura los siguientes campos del proyecto:
   - **Framework Preset**: Other (HTML estático, sin build)
   - **Root Directory**: `.` (raíz)
   - **Build Command**: `bash build.sh` (si usas la Opción B) o déjalo vacío (si usas la Opción A).
   - **Output Directory**: `.` (raíz)
   - **Install Command**: (dejar vacío)

### b) Cómo manejar `config.js` en producción
Dado que `config.js` contiene credenciales sensibles y está excluido del repositorio en `.gitignore`, existen dos opciones para manejarlo en producción:

#### Opción A: File Override (Manual en el Dashboard de Vercel)
1. En el Dashboard de Vercel de tu proyecto, ve a **Settings → Functions** (o mediante la sección de overrides de archivos del proyecto si está disponible).
2. Agrega `config.js` manualmente como un archivo override con el contenido de las credenciales de Supabase de producción:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://tu-proyecto-supabase.supabase.co',
     key: 'tu-anon-key'
   };
   ```

#### Opción B: Build Script Mínimo (Recomendado y Automatizado)
1. Configura las siguientes **Variables de Entorno** en Vercel (**Settings → Environment Variables**):
   - `SUPABASE_URL`: La URL del proyecto de Supabase.
   - `SUPABASE_ANON_KEY`: La clave anónima (anon key) del proyecto de Supabase.
2. Asegúrate de tener el archivo `build.sh` en la raíz de tu proyecto, el cual autogenera `config.js` durante la fase de construcción de Vercel usando estas variables de entorno.
3. Asegúrate de configurar en Vercel el **Build Command** como `bash build.sh` y el **Output Directory** como `.` (raíz).
