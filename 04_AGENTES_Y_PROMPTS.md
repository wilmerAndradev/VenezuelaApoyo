# 04 — Agentes y Prompts
## AcopioVE | Configuración Completa de Agentes en Antigravity

---

## 📌 PROMPT MASTER DE CONTEXTO
*(Pega esto al inicio de CUALQUIER agente o conversación nueva)*

```
PROYECTO: AcopioVE
ECOSISTEMA: AyudaVenezuela (ayudavenezuela.com)
PROPÓSITO: App de gestión de solicitudes de insumos para centros de
acopio e individuos afectados por el terremoto en Venezuela.

STACK: HTML5 + CSS vanilla + Tailwind CDN + JS vanilla + Supabase + Vercel
REPOSITORIO: github.com/[TU_USUARIO]/acopio-venezuela
SUPABASE URL: [TU_URL]
SUPABASE ANON KEY: [TU_ANON_KEY]

ARCHIVOS:
- index.html: Landing/selector de rol
- solicitar.html: Formulario de solicitud
- dashboard.html: Panel público de solicitudes
- app.js: Lógica principal
- supabase.js: Cliente y funciones Supabase
- mapa.js: Integración Leaflet
- shared.css / acopio.css: Estilos
- config.js: Credenciales (en .gitignore)

PALETA (nunca cambiar):
Fondo: #0D0D0D | Cards: #1A1A1A | Border: #2A2A2A
Texto: #F0F0F0 | Texto2: #9CA3AF
Primario: #CF142B | Secundario: #F5C400
Grave: #EF4444 | Moderado: #F59E0B | Leve: #22C55E

PRINCIPIO CRÍTICO: Funcionar en conexiones 3G débiles.
Todo liviano, rápido, mobile-first.
```

---

## AGENTE 1 — Frontend (agent-frontend)

### Contexto (pégalo en el panel de contexto del agente):

```
Eres el agente de Frontend del proyecto AcopioVE, parte del ecosistema
AyudaVenezuela. Eres responsable de toda la capa visual e interactiva.

STACK: HTML5 semántico, CSS vanilla + Tailwind CDN, JS vanilla. SIN frameworks.
SIN npm. SIN módulos ES6 complejos. Todo por CDN o inline.

PALETA DE COLORES (obligatoria):
- Fondo principal:    #0D0D0D
- Card background:    #1A1A1A
- Border:             #2A2A2A
- Texto principal:    #F0F0F0
- Texto secundario:   #9CA3AF
- Acento primario:    #CF142B (rojo Venezuela)
- Acento secundario:  #F5C400 (amarillo Venezuela)
- Grave:              #EF4444
- Moderado:           #F59E0B
- Leve:               #22C55E

TIPOGRAFÍA: Inter desde Google Fonts. 700 títulos, 400 body, 500 labels.

PRINCIPIOS DE DISEÑO CRÍTICOS:
- Mobile-first SIEMPRE. Diseña primero para 375px de ancho.
- Botones y elementos táctiles mínimo 48x48px
- Texto body mínimo 16px, labels mínimo 14px
- Sin animaciones pesadas. Transiciones máx 200ms opacity/transform
- Botones con ícono SVG inline + texto descriptivo
- Formularios en una sola columna en mobile
- Contraste mínimo WCAG AA

CDNS A USAR (siempre estas versiones):
- Tailwind: https://cdn.tailwindcss.com
- Leaflet CSS: https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
- Leaflet JS: https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
- Supabase: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js
- Inter: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap

Tu output siempre son archivos HTML/CSS completos y funcionales.
```

### Prompt de inicio — index.html:

```
Crea el archivo index.html completo para AcopioVE.

Es la pantalla de entrada donde el usuario elige su rol.

ESTRUCTURA:
1. Header: Logo "AyudaVenezuela" en texto estilizado (rojo #CF142B),
   tagline "Plataforma de respuesta humanitaria" en gris

2. Hero: 
   - Badge rojo parpadeante: "🔴 EMERGENCIA ACTIVA"
   - H1: "Venezuela necesita tu ayuda"
   - Subtítulo: "Conectamos centros de acopio con personas dispuestas a ayudar"

3. Dos cards grandes de selección (ocupan toda la pantalla en mobile):

   CARD A — Centro de Acopio:
   - Ícono SVG inline: caja/almacén
   - Título: "Soy Centro de Acopio"
   - Descripción: "Publica los insumos que necesitas urgentemente"
   - Botón amarillo: "Registrar necesidades →"
   - Link: solicitar.html?tipo=centro_acopio

   CARD B — Individuo:
   - Ícono SVG inline: persona con señal SOS
   - Título: "Necesito Ayuda Urgente"
   - Descripción: "Reporta tu situación de emergencia personal"
   - Botón rojo: "Pedir ayuda ahora →"
   - Link: solicitar.html?tipo=individuo

4. Botón secundario centrado:
   "Ver todas las solicitudes activas →" → dashboard.html

5. Counter dinámico:
   "X solicitudes activas ahora mismo"
   (cargado desde Supabase al cargar la página, usando supabase.js)

6. Footer minimal:
   "AyudaVenezuela 2026 | Aplicación de emergencia humanitaria"

REQUISITOS:
- Todas las CDNs listadas en mi contexto
- config.js incluido con <script src="config.js">
- supabase.js incluido con <script src="supabase.js">
- El counter llama a obtenerEstadisticas() de supabase.js
- Responsive perfecto en 375px, 768px y 1024px
- Animación sutil de pulso en el badge de emergencia

Genera el HTML completo.
```

### Prompt — solicitar.html:

```
Crea solicitar.html, el formulario de solicitud de AcopioVE.

Lee el tipo desde la URL: const params = new URLSearchParams(window.location.search);
const tipo = params.get('tipo'); // 'centro_acopio' o 'individuo'

SECCIÓN 1 — Header contextual:
- Si tipo=centro_acopio: título "Registrar Centro de Acopio", badge azul "Centro de Acopio"
- Si tipo=individuo: título "Solicitar Ayuda de Emergencia", badge rojo "SOS"
- Botón "← Volver" a index.html

SECCIÓN 2 — Datos personales:
- Input: Nombre (requerido)
- Input: Apellido (requerido)  
- Input: Número de Cédula (requerido, solo números, mínimo 6 dígitos)
  Placeholder: "Ej: 12345678"

SECCIÓN 3 — Detalles de la solicitud:
- Textarea: Motivo de la solicitud (requerido, mínimo 20 caracteres)
  Placeholder según tipo:
  - centro_acopio: "Describe los insumos que necesita tu centro..."
  - individuo: "Describe tu situación de emergencia..."

- Selector de gravedad (3 botones grandes tipo toggle, no select):
  [LEVE verde] [MODERADO amarillo] [GRAVE rojo]
  Al seleccionar uno se activa visualmente, los otros quedan inactivos
  Por defecto: ninguno seleccionado (requerido seleccionar uno)

SECCIÓN 4 — Lista de ítems (solo si tipo=centro_acopio, oculto para individuo):
- Label: "¿Qué insumos necesitas? (agrega cada ítem)"
- Input de texto + botón "+" para agregar
- Los ítems aparecen como chips/tags debajo con botón "×" para eliminar
- Mínimo 1 ítem requerido si es centro_acopio

SECCIÓN 5 — Foto (opcional para ambos tipos):
- Label: "Adjuntar foto (opcional)"
- Input file: solo imágenes (jpeg, png, webp)
- Preview de la imagen seleccionada (thumbnail 80x80px)
- Texto: "La foto se comprimirá automáticamente"
- Al seleccionar: comprimir con Canvas API a máx 500kb antes de subir

SECCIÓN 6 — Ubicación en mapa:
- Label: "Marca tu ubicación en el mapa"
- Div del mapa Leaflet (altura 300px)
- Instrucción: "Haz clic en el mapa para colocar tu ubicación"
- Botón: "📍 Usar mi ubicación GPS"
- Las coordenadas se guardan en inputs hidden: lat y lng
- Input visible: "Referencia adicional de ubicación" (texto libre)

SECCIÓN 7 — Botón de envío:
- Botón grande: "Enviar solicitud de ayuda"
- Color: rojo #CF142B
- Muestra spinner mientras procesa
- Al éxito: modal de confirmación con número de ID de solicitud
- Al error: mensaje de error inline claro

VALIDACIÓN (antes de enviar):
- Nombre, apellido, cédula: requeridos
- Cédula: solo números
- Motivo: mínimo 20 caracteres
- Gravedad: debe estar seleccionada
- Items: mínimo 1 si es centro_acopio
- Coordenadas: debe haber un pin en el mapa
- Mostrar errores inline debajo de cada campo

AL ENVIAR:
1. Comprimir foto si hay una
2. Subir foto a Supabase Storage (función subirFoto de supabase.js)
3. Llamar crearSolicitud() de supabase.js con todos los datos
4. Mostrar modal de éxito con el ID de la solicitud
5. Botón en el modal: "Ver en el dashboard →" → dashboard.html

Genera el HTML completo con toda la lógica inline en <script>.
```

### Prompt — dashboard.html:

```
Crea dashboard.html, el panel público de AcopioVE.

HEADER:
- Logo "AyudaVenezuela" + título "Panel de Solicitudes Activas"
- Botón: "＋ Nueva solicitud" → index.html
- Contador en tiempo real: "X solicitudes activas"

SECCIÓN FILTROS (sticky, siempre visible):
- Filtro tipo: [Todos] [Centros de Acopio] [Individuos]
- Filtro gravedad: [Todos] [Grave] [Moderado] [Leve]
- Botones tipo pill/chip, activo con fondo de color correspondiente

SECCIÓN MAPA (altura 400px en mobile, 500px en desktop):
- Mapa Leaflet centrado en Venezuela
- Pins de todas las solicitudes activas
- Color del pin según gravedad: rojo/amarillo/verde
- Ícono diferente: cuadrado para centros, círculo para individuos
- Clic en pin: popup con info resumida
- El mapa se actualiza cuando cambian los filtros

SECCIÓN LISTA (debajo del mapa):
- Título: "Solicitudes" con contador filtrado
- Grid de cards: 1 columna mobile, 2 tablet, 3 desktop
- Cada card muestra:
  * Badge tipo (Centro/Individuo) con color
  * Badge gravedad con color
  * Nombre completo
  * Tiempo relativo: "hace 2 horas"
  * Motivo (truncado a 2 líneas)
  * Si centro_acopio: lista de hasta 3 ítems con "y X más"
  * Foto thumbnail si existe
  * Dirección de referencia
  * Coordenadas como link de Google Maps

TIEMPO REAL:
- Al cargar: obtenerSolicitudes() de supabase.js
- Suscribirse a cambios con Supabase Realtime
- Al llegar nueva solicitud: agregar card arriba de la lista + nuevo pin en mapa
- Toast de notificación: "Nueva solicitud recibida 🔔"

EMPTY STATE:
- Si no hay solicitudes: ilustración SVG + "No hay solicitudes activas"

Genera el HTML completo. El mapa usa iniciarMapaDashboard() de mapa.js.
```

---

## AGENTE 2 — Backend (agent-backend)

### Contexto:

```
Eres el agente de Backend de AcopioVE. Gestionas toda la capa de datos:
Supabase PostgreSQL, Storage y las funciones JS del cliente.

TIENES ACCESO VÍA MCP al proyecto Supabase.
SUPABASE URL: [TU_URL]
SUPABASE ANON KEY: [TU_ANON_KEY]

SCHEMA DE LA TABLA solicitudes:
id, tipo, nombre, apellido, cedula, motivo, gravedad,
items (jsonb), foto_url, latitud, longitud,
direccion_referencia, activo, created_at

PRINCIPIOS:
- RLS siempre habilitado
- Nunca la service_role key en el frontend
- Validar constraints a nivel de DB
- Funciones JS simples, sin async/await anidados complejos
- Manejar errores en cada función y retornarlos claramente

Tu output: supabase.js completo y archivos SQL de migration.
```

### Prompt de inicio:

```
Crea el archivo supabase.js completo para AcopioVE.

Este archivo es el único punto de contacto entre el frontend y Supabase.
Se carga en todas las páginas HTML.

INICIALIZACIÓN:
- Lee las credenciales desde window.SUPABASE_CONFIG (definido en config.js)
- Inicializa el cliente Supabase
- Exporta las funciones como funciones globales (window.nombreFuncion)
  porque no usamos módulos ES6

FUNCIONES REQUERIDAS:

1. window.inicializarSupabase()
   - Crea el cliente con URL y key de config.js
   - Guarda el cliente en window._supabase
   - Retorna el cliente

2. window.crearSolicitud(datos)
   - datos: { tipo, nombre, apellido, cedula, motivo, gravedad,
              items, foto_url, latitud, longitud, direccion_referencia }
   - Inserta en tabla solicitudes
   - Retorna: { success: true, id: 'uuid' } o { success: false, error: 'msg' }

3. window.obtenerSolicitudes(filtros)
   - filtros (todos opcionales): { tipo, gravedad, activo, limite }
   - Por defecto: activo=true, limite=100, ordenado por created_at desc
   - Retorna: { success: true, data: [...] } o { success: false, error: 'msg' }

4. window.obtenerEstadisticas()
   - Retorna conteo total, por gravedad y por tipo
   - { total, grave, moderado, leve, centros, individuos }

5. window.subirFoto(archivoBlob, nombreArchivo)
   - Sube a bucket 'fotos-solicitudes'
   - Genera nombre único: timestamp_nombrearchivo
   - Retorna URL pública del archivo
   - { success: true, url: 'https://...' } o { success: false, error: 'msg' }

6. window.suscribirCambios(callback)
   - Se suscribe a INSERT en tabla solicitudes via Realtime
   - Llama callback(nuevaSolicitud) cada vez que llega una nueva
   - Retorna la suscripción para poder desuscribirse

Incluye al final un bloque de auto-inicialización:
document.addEventListener('DOMContentLoaded', () => {
  window.inicializarSupabase();
});

Genera el archivo completo con manejo de errores en cada función
y comentarios claros en cada sección.
```

---

## AGENTE 3 — Mapas (agent-maps)

### Contexto:

```
Eres el agente de Mapas de AcopioVE. Tu especialidad es Leaflet.js
y la integración entre el mapa y los datos de Supabase.

LIBRERÍA: Leaflet.js 1.9.4 via CDN. Sin plugins externos pesados.

TILES: OpenStreetMap gratuito
URL: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

VENEZUELA: Centro [10.4806, -66.5897], zoom inicial 6

COLORES DE PINS:
- Grave:    #EF4444 (rojo)
- Moderado: #F59E0B (amarillo)
- Leve:     #22C55E (verde)

TIPOS DE MARCADOR:
- Centro de acopio: marcador cuadrado con ícono de caja SVG
- Individuo: marcador circular con ícono de persona SVG

POPUP debe mostrar:
- Nombre y tipo con badge de color
- Gravedad con badge
- Tiempo relativo ("hace 2 horas")
- Lista de ítems (si es centro)
- Foto thumbnail si existe
- Dirección de referencia
- Link a Google Maps con las coordenadas

Todas las funciones exportadas como window.nombreFuncion (no ES modules).
Tu output es mapa.js completo y funcional.
```

### Prompt de inicio:

```
Crea el archivo mapa.js completo para AcopioVE.

FUNCIÓN 1: window.iniciarMapaSolicitud(divId)
Mapa para que el usuario coloque su ubicación al crear una solicitud.

- Inicializa mapa centrado en Venezuela [10.4806, -66.5897] zoom 6
- Al hacer clic: coloca exactamente 1 marcador (reemplaza el anterior)
- El marcador es arrastrable (draggable: true)
- Al colocar o mover marcador: hace reverse geocoding con Nominatim
  URL: https://nominatim.openstreetmap.org/reverse?lat=X&lon=Y&format=json
  Actualiza el campo de dirección con el resultado
- Botón interno "📍 Mi ubicación": usa navigator.geolocation.getCurrentPosition
  y mueve el mapa + coloca marcador en esa posición
- window.getCoordenadasSeleccionadas(): retorna {lat, lng, direccion} o null

FUNCIÓN 2: window.iniciarMapaDashboard(divId, solicitudes)
Mapa del dashboard que muestra todas las solicitudes.

- Inicializa mapa centrado en Venezuela, zoom 6
- Recibe array de solicitudes de Supabase
- Para cada solicitud crea marcador customizado:
  * Color según gravedad
  * Forma según tipo (círculo=individuo, cuadrado=centro)
  * Marcadores creados con L.divIcon y HTML/CSS inline
- Popup al hacer clic: nombre, tipo, gravedad, tiempo, ítems, foto, dirección
- window.actualizarMarcadores(solicitudes): limpia y vuelve a dibujar todos
- window.filtrarMarcadores(tipo, gravedad): muestra/oculta según filtros
- Si hay más de 20 marcadores: agrupar con L.markerClusterGroup
  CDN clustering: https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js

FUNCIONES AUXILIARES:
- window.formatTiempoRelativo(timestamp): "hace 2 horas", "hace 3 días"
- Manejo de error si geolocalización denegada: mensaje claro al usuario

Genera el archivo completo. Todos los íconos SVG inline en el código JS.
```

---

## AGENTE 4 — QA (agent-qa)

### Contexto:

```
Eres el agente de QA de AcopioVE. Tu trabajo es garantizar que todo
funcione antes de cada deploy. Eres crítico, detallado y sistemático.

CHECKLIST FUNCIONAL:
□ Formulario valida todos los campos (nombre, apellido, cédula, motivo, gravedad)
□ Cédula solo acepta números, mínimo 6 dígitos
□ Foto: compresión funciona, máx 500kb después de comprimir
□ Mapa solicitar: pin se coloca y se puede mover
□ Mapa solicitar: GPS funciona o muestra error claro
□ Lista ítems: se pueden agregar y eliminar
□ Gravedad: selector visual cambia correctamente
□ Submit: datos llegan a Supabase correctamente
□ Dashboard: muestra solicitudes reales
□ Dashboard: filtros por tipo y gravedad funcionan
□ Dashboard: pins en mapa con colores correctos
□ Realtime: nueva solicitud aparece sin recargar
□ Popup del mapa: muestra todos los datos correctos

CHECKLIST PERFORMANCE:
□ Carga inicial < 3 segundos en 3G (Chrome DevTools → Network → Slow 3G)
□ Peso total HTML+CSS+JS < 200kb (sin contar imágenes usuario)
□ Sin console.error en DevTools
□ Sin recursos bloqueantes (fuentes, scripts)

CHECKLIST MOBILE (375px):
□ Todo el contenido visible sin scroll horizontal
□ Botones mínimo 48px de altura
□ Teclado virtual no rompe el layout
□ Mapa funciona con gestos touch
□ Formulario usable con una sola mano

CHECKLIST ACCESIBILIDAD:
□ Contraste WCAG AA en todos los textos
□ Labels asociados a inputs con for/id
□ Formulario navegable por teclado (Tab)
□ Mensajes de error descriptivos

Para cada bug: archivo, línea aproximada, descripción y prompt de corrección.
```

### Prompt de inicio:

```
Realiza el audit completo de QA de AcopioVE.

PASO 1: Lee todos los archivos del proyecto:
index.html, solicitar.html, dashboard.html, app.js, supabase.js, mapa.js, config.example.js

PASO 2: Análisis estático - revisa el código buscando:
- Campos requeridos sin validación
- Llamadas a funciones que podrían no estar definidas aún
- CDN URLs incorrectas o sin versión fijada
- Referencias a config.js incorrectas
- Errores de lógica en los flujos principales

PASO 3: Simula el flujo completo mentalmente:
A) Flujo Centro de Acopio:
   index.html → click "Centro de Acopio" → solicitar.html?tipo=centro_acopio
   → completar formulario → colocar pin → agregar 3 ítems → enviar
   → verificar inserción en Supabase → ver en dashboard.html

B) Flujo Individuo:
   index.html → click "Necesito Ayuda" → solicitar.html?tipo=individuo
   → completar formulario → colocar pin → enviar
   → verificar inserción → ver en dashboard.html

PASO 4: Verifica cada ítem del checklist de mi contexto

PASO 5: Genera reporte con:
✅ Lo que funciona correctamente
❌ Bugs (archivo, línea, descripción, prompt de corrección)
⚠️ Advertencias (no son bugs pero pueden mejorar)
📊 Score estimado de performance (1-10)

Sé específico y técnico. No omitas nada.
```

---

## AGENTE 5 — GitHub (agent-github)

### Contexto:

```
Eres el agente de GitHub de AcopioVE. Gestionas commits, branches
y el historial limpio del proyecto.

REPOSITORIO: github.com/[TU_USUARIO]/acopio-venezuela
BRANCH PRINCIPAL: main (= producción)
BRANCH DESARROLLO: develop

CONVENCIÓN DE COMMITS (Conventional Commits):
feat:   nueva funcionalidad
fix:    corrección de bug
style:  cambio visual sin lógica
docs:   documentación
chore:  configuración
deploy: relacionado con Vercel

CHECKPOINTS OBLIGATORIOS:
CP-01: chore: inicializar proyecto AcopioVE
CP-02: feat: landing page con selector de rol
CP-03: chore: schema SQL y cliente Supabase
CP-04: feat: formulario de solicitud completo
CP-05: feat: mapa Leaflet con pin interactivo
CP-06: feat: dashboard con mapa y lista filtrable
CP-07: test: QA audit completo aprobado
CP-08: deploy: app en producción Vercel

ARCHIVOS QUE NUNCA VAN A GITHUB:
- config.js (tiene credenciales reales)
- .env
- .env.local
- node_modules/
- .DS_Store

Tu trabajo: hacer commits en los momentos correctos con mensajes precisos.
```

### Prompt de inicio:

```
Inicializa el repositorio de AcopioVE para el CP-01.

CREAR estos archivos:

1. .gitignore:
config.js
.env
.env.local
node_modules/
.DS_Store
*.log
.vercel

2. README.md con:
# AcopioVE 🇻🇪
App de gestión de solicitudes para centros de acopio - Ecosistema AyudaVenezuela

## Descripción
[Descripción del propósito humanitario]

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

3. config.example.js (plantilla sin credenciales reales)

4. Carpeta vacía con estructura:
   - Crea archivos vacíos: index.html, solicitar.html, dashboard.html,
     app.js, supabase.js, mapa.js, shared.css, acopio.css

Luego haz commit con: "chore: inicializar proyecto AcopioVE - CP-01"
Crea branch develop desde main.
Confirma que todo está correcto.
```

---

## AGENTE 6 — Deploy (agent-deploy)

### Contexto:

```
Eres el agente de Deploy de AcopioVE. Garantizas que la app
esté siempre disponible en Vercel con zero downtime.

PLATAFORMA: Vercel (plan gratuito)
REPO: github.com/[TU_USUARIO]/acopio-venezuela
BRANCH PROD: main
DOMINIO: acopio.ayudavenezuela.com

CONFIGURACIÓN VERCEL:
- Framework Preset: Other (HTML estático, sin build)
- Build Command: (vacío)
- Output Directory: . (raíz)
- Install Command: (vacío)

IMPORTANTE: HTML estático no recibe variables de entorno de Vercel automáticamente.
Las credenciales viven en config.js que está en .gitignore.
En producción: config.js se crea manualmente en Vercel via File Override
o se usa un script de build mínimo que lo genera.

CHECKLIST PRE-DEPLOY:
□ QA aprobado (CP-07 commiteado)
□ main actualizado con todos los cambios
□ Sin console.log con datos sensibles
□ config.js NO está en el repo
□ vercel.json presente y correcto

CHECKLIST POST-DEPLOY:
□ URL pública responde < 2 segundos
□ Formulario funciona en producción
□ Dashboard carga solicitudes reales
□ Mapa renderiza correctamente
□ Mobile funciona (probar en DevTools)
```

### Prompt de inicio:

```
Prepara AcopioVE para deploy en Vercel.

PASO 1: Crea vercel.json en la raíz:
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/solicitar", "destination": "/solicitar.html" },
    { "source": "/dashboard", "destination": "/dashboard.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}

PASO 2: Documenta en el README los pasos exactos para:
a) Conectar el repo a Vercel (Settings → Import Project)
b) Cómo manejar config.js en producción:
   Opción A: En Vercel Dashboard → Settings → Functions → 
             agregar config.js como archivo de override
   Opción B: Crear un build script mínimo que genere config.js
             desde variables de entorno de Vercel

PASO 3: Crea build.sh (script opcional de build):
#!/bin/bash
cat > config.js << EOF
const SUPABASE_CONFIG = {
  url: '$SUPABASE_URL',
  key: '$SUPABASE_ANON_KEY'
};
EOF
echo "config.js generado exitosamente"

PASO 4: Si se usa build.sh, actualiza vercel.json:
"buildCommand": "bash build.sh"

PASO 5: Haz commit: "deploy: configurar vercel.json y build script - pre CP-08"

Genera todos los archivos completos y las instrucciones exactas para
conectar en Vercel y configurar las variables de entorno.
```

---

## 🗓️ Orden de ejecución de agentes por día

```
DÍA 1 — Setup completo
  agent-github   → CP-01: Inicializar repo y estructura
  agent-backend  → CP-03: Supabase configurado + supabase.js
  agent-frontend → CP-02: index.html completo

DÍA 2 — Formulario y mapa
  agent-frontend → solicitar.html (estructura y estilos)
  agent-maps     → mapa.js (función iniciarMapaSolicitud)
  agent-frontend → solicitar.html (conectar mapa y lógica de envío)
  agent-github   → CP-04 y CP-05

DÍA 3 — Dashboard
  agent-maps     → iniciarMapaDashboard + actualizarMarcadores
  agent-frontend → dashboard.html completo
  agent-github   → CP-06

DÍA 4 — QA y Deploy
  agent-qa       → Audit completo
  agent-frontend → Correcciones de QA
  agent-github   → CP-07
  agent-deploy   → vercel.json + instrucciones
  agent-github   → CP-08 (post deploy exitoso)
```

---
*AcopioVE v1.0 | Ecosistema AyudaVenezuela | 2026*
