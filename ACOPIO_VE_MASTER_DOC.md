# 🇻🇪 AcopioVE — Documentación Maestra de Desarrollo
### Ecosistema: AyudaVenezuela | App #1: Centros de Acopio
**IDE:** Google Antigravity | **Stack:** HTML + CSS + JS Vanilla + Supabase + Vercel

---

## 📐 Arquitectura General del Proyecto

```
acopio-venezuela/
├── index.html          # Landing + selector de rol
├── solicitar.html      # Formulario de solicitud
├── dashboard.html      # Panel público (mapa + lista)
├── app.js              # Lógica principal
├── supabase.js         # Cliente y queries Supabase
├── mapa.js             # Lógica Leaflet
├── shared.css          # Estilos globales del ecosistema
└── acopio.css          # Estilos específicos de esta app
```

---

## 👥 Arquitectura de Agentes en Antigravity

Usarás el **Manager View** de Antigravity para orquestar múltiples agentes en paralelo.
Cada agente tiene un rol específico, un contexto propio y prompts definidos.

---

### AGENTE 1 — Frontend (UI/UX)
**Nombre en Antigravity:** `agent-frontend`
**Modo:** Plan Mode → luego Fast Mode para iteraciones

#### Contexto del agente (pégalo en su panel de contexto):
```
Eres el agente de Frontend del proyecto AcopioVE, parte del ecosistema 
AyudaVenezuela. Tu responsabilidad es toda la capa visual e interactiva.

STACK: HTML5 semántico, CSS vanilla + Tailwind CDN, JS vanilla. SIN frameworks.

PALETA DE COLORES (obligatoria, no cambiar):
- Fondo principal: #0D0D0D
- Acento primario: #CF142B (rojo Venezuela)
- Acento secundario: #F5C400 (amarillo Venezuela)
- Texto principal: #F0F0F0
- Texto secundario: #9CA3AF
- Grave: #EF4444
- Moderado: #F59E0B  
- Leve: #22C55E
- Card background: #1A1A1A
- Border: #2A2A2A

TIPOGRAFÍA: Inter desde Google Fonts. Display: 700. Body: 400. Labels: 500.

PRINCIPIOS DE DISEÑO (críticos para este proyecto):
- Mobile-first SIEMPRE. Diseña primero para pantalla de 375px.
- Elementos táctiles mínimo 48x48px (dedos en emergencia)
- Contraste mínimo AA (zonas con pantallas dañadas)
- Sin animaciones pesadas. Transiciones máx 200ms.
- Botones grandes y claros con iconos + texto
- Formularios de una columna en mobile

ACCESIBILIDAD DE EMERGENCIA:
- Texto mínimo 16px en body, 14px en labels
- Nunca dependas solo del color para comunicar estado
- Íconos SVG inline (no cargar fuentes de iconos externas)

Tu output siempre son archivos HTML/CSS listos para funcionar.
No uses npm. No uses módulos. Todo por CDN o inline.
```

#### Prompt de inicio (Fase 1):
```
Crea el archivo index.html completo para AcopioVE.

Esta es la pantalla de entrada. El usuario llega aquí y debe elegir su rol.

CONTENIDO DE LA PÁGINA:
1. Header con logo "AyudaVenezuela" (texto estilizado) y tagline 
   "Plataforma de respuesta humanitaria"

2. Sección hero con mensaje de emergencia urgente:
   Título: "Venezuela necesita tu ayuda"
   Subtítulo: "Conectamos centros de acopio con personas que pueden ayudar"

3. Dos cards grandes de selección de rol:
   CARD A: "Soy un Centro de Acopio"
   - Ícono: almacén/caja SVG inline
   - Descripción: "Registra tu centro y publica los insumos que necesitas"
   - Botón: "Registrar necesidades" → link a solicitar.html?tipo=centro_acopio

   CARD B: "Necesito Ayuda Urgente"  
   - Ícono: persona/SOS SVG inline
   - Descripción: "Reporta tu situación de emergencia personal"
   - Botón: "Pedir ayuda ahora" → link a solicitar.html?tipo=individuo

4. Botón secundario: "Ver todas las solicitudes activas" → dashboard.html

5. Footer con: contador de solicitudes activas (cargado desde Supabase), 
   créditos del ecosistema AyudaVenezuela

REQUISITOS TÉCNICOS:
- Tailwind CSS via CDN
- Inter via Google Fonts
- Supabase JS via CDN (importar pero no inicializar aún)
- Responsive: mobile 375px, tablet 768px, desktop 1024px
- Colores exactos de la paleta definida en mi contexto
- SVG icons inline, no librerías externas

Genera el archivo HTML completo y funcional.
```

---

### AGENTE 2 — Backend / Supabase
**Nombre en Antigravity:** `agent-backend`
**Modo:** Plan Mode siempre (opera sobre la base de datos real)

#### Contexto del agente:
```
Eres el agente de Backend del proyecto AcopioVE. Tu responsabilidad es 
toda la capa de datos: Supabase, SQL, storage y seguridad.

SUPABASE PROJECT:
- URL: [REEMPLAZAR CON TU URL]
- Anon Key: [REEMPLAZAR CON TU ANON KEY]
- Región: East US

TIENES ACCESO VÍA MCP al proyecto Supabase. Puedes ejecutar SQL directamente.

TABLAS DEL PROYECTO:
- solicitudes: tabla principal (ver schema abajo)
- storage bucket: fotos-solicitudes (público)

SCHEMA ACTUAL:
create table solicitudes (
  id uuid default gen_random_uuid() primary key,
  tipo text not null check (tipo in ('centro_acopio', 'individuo')),
  nombre text not null,
  apellido text not null,
  cedula text not null,
  motivo text not null,
  gravedad text not null check (gravedad in ('leve', 'moderado', 'grave')),
  items jsonb default '[]',
  foto_url text,
  latitud numeric,
  longitud numeric,
  direccion_referencia text,
  activo boolean default true,
  created_at timestamptz default now()
);

PRINCIPIOS:
- Row Level Security SIEMPRE habilitado
- Nunca expongas service_role key en frontend
- Toda operación de escritura pública debe tener policy explícita
- Valida constraints a nivel de DB, no solo frontend
- Genera migrations como archivos SQL versionados

Tu output son: archivos SQL de migration, funciones JS para supabase.js,
y documentación de cada endpoint/query.
```

#### Prompt de inicio (Fase 1):
```
Configura completamente la base de datos de AcopioVE en Supabase via MCP.

TAREA 1: Ejecuta el schema completo:
- Tabla solicitudes con todos los campos definidos en mi contexto
- Habilita RLS
- Crea policies: lectura pública, inserción pública
- Crea bucket de storage "fotos-solicitudes" como público

TAREA 2: Crea el archivo supabase.js con estas funciones:
- initSupabase() → inicializa el cliente
- crearSolicitud(datos) → inserta nueva solicitud
- obtenerSolicitudes(filtros) → obtiene solicitudes con filtros opcionales
- obtenerEstadisticas() → cuenta total, por gravedad, por tipo
- subirFoto(archivo) → sube foto a storage y retorna URL pública

TAREA 3: Crea el archivo supabase.sql con la migration completa 
(para versionado en GitHub)

Verifica que todo esté correcto consultando las tablas creadas.
```

---

### AGENTE 3 — Mapa e Integración
**Nombre en Antigravity:** `agent-maps`
**Modo:** Fast Mode

#### Contexto del agente:
```
Eres el agente de Integración de Mapas para AcopioVE. Tu especialidad
es Leaflet.js y la integración entre el mapa y Supabase.

LIBRERÍA: Leaflet.js 1.9.4 via CDN. SIN plugins externos pesados.

CONFIGURACIÓN DEL MAPA:
- Centro inicial: Venezuela [6.4238, -66.5897] zoom 6
- Tiles: OpenStreetMap (gratuito, sin API key)
- URL tiles: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

MARCADORES POR GRAVEDAD:
- Grave: círculo rojo #EF4444, radio 12px
- Moderado: círculo amarillo #F59E0B, radio 10px
- Leve: círculo verde #22C55E, radio 8px

MARCADORES POR TIPO:
- Centro de acopio: marcador cuadrado con ícono de caja
- Individuo: marcador circular con ícono de persona

POPUP DE MARCADOR debe mostrar:
- Nombre completo
- Tipo (Centro/Individuo)
- Gravedad con badge de color
- Lista de ítems necesarios
- Foto si existe (thumbnail)
- Tiempo desde la solicitud ("hace 2 horas")
- Botón "Ver detalle completo"

MODO SOLICITAR (mapa para colocar pin):
- Usuario hace clic → coloca pin
- Puede mover el pin
- Muestra coordenadas en tiempo real
- Reverse geocoding simple via Nominatim (gratuito)

PERFORMANCE:
- Clustering de marcadores cuando hay más de 20 pins
- Lazy init: el mapa solo se inicializa cuando el div es visible
- No cargar tiles fuera del viewport

Tu output es el archivo mapa.js completo y funcional.
```

#### Prompt de inicio:
```
Crea el archivo mapa.js completo para AcopioVE con estas dos funciones principales:

FUNCIÓN 1: iniciarMapaSolicitud(divId)
- Inicializa mapa centrado en Venezuela
- Permite al usuario hacer clic para colocar exactamente 1 marcador
- Al colocar marcador: muestra coordenadas, hace reverse geocoding con Nominatim
- Expone función getCoordenadasSeleccionadas() que retorna {lat, lng, direccion}
- El marcador es arrastrable

FUNCIÓN 2: iniciarMapaDashboard(divId, solicitudes)
- Recibe array de solicitudes desde Supabase
- Renderiza marcadores con colores por gravedad
- Marcadores con ícono diferente para centro vs individuo (SVG inline)
- Al clic: popup con info completa de la solicitud
- Función actualizarMarcadores(nuevasSolicitudes) para refresh en tiempo real
- Clustering automático si hay más de 15 marcadores

Incluye también:
- función formatTiempoRelativo(timestamp) → "hace 2 horas"
- Manejo de error si el usuario no da permisos de geolocalización
- Botón "Usar mi ubicación" que centra el mapa en el GPS del usuario

Todas las dependencias de Leaflet via CDN, documentadas al inicio del archivo.
```

---

### AGENTE 4 — QA y Testing
**Nombre en Antigravity:** `agent-qa`
**Modo:** Plan Mode

#### Contexto del agente:
```
Eres el agente de QA del proyecto AcopioVE. Tu trabajo es verificar que
todo funcione correctamente antes de cada deploy.

TU CHECKLIST DE VERIFICACIÓN:

FUNCIONAL:
□ Formulario valida todos los campos requeridos
□ Cédula: solo números, mínimo 6 dígitos
□ Foto: compresión funciona, máx 500kb después de comprimir
□ Mapa: pin se puede colocar y mover
□ Lista de ítems: se pueden agregar y eliminar
□ Selector de gravedad: cambia colores correctamente
□ Submit: datos llegan correctamente a Supabase
□ Dashboard: muestra solicitudes del día
□ Filtros: funcionan por tipo y gravedad
□ Pins del mapa: aparecen con colores correctos

PERFORMANCE:
□ Tiempo de carga inicial < 3 segundos en 3G simulado
□ Peso total de página < 500kb (sin contar imágenes de usuario)
□ Sin console errors en Chrome DevTools
□ Sin recursos bloqueantes

MOBILE:
□ Funciona en viewport 375px
□ Botones táctiles mínimo 48px
□ Teclado virtual no rompe el layout
□ Mapa funciona con touch

ACCESIBILIDAD:
□ Contraste WCAG AA en todos los textos
□ Formulario navegable por teclado
□ Labels asociados a inputs

Para cada bug encontrado, genera: descripción, archivo afectado, 
línea aproximada, y prompt exacto para que agent-frontend lo corrija.
```

#### Prompt de inicio:
```
Realiza un audit completo de los archivos actuales del proyecto AcopioVE.

PASO 1: Lee todos los archivos del proyecto (index.html, solicitar.html, 
dashboard.html, app.js, supabase.js, mapa.js)

PASO 2: Verifica cada ítem del checklist de tu contexto

PASO 3: Abre el browser y prueba el flujo completo:
- Ir a index.html → seleccionar "Centro de Acopio"
- Completar el formulario con datos de prueba
- Colocar pin en el mapa
- Agregar 3 ítems a la lista
- Subir una foto de prueba
- Enviar el formulario
- Verificar que aparece en dashboard.html

PASO 4: Genera un reporte con:
- ✅ Lo que funciona
- ❌ Bugs encontrados (con prompt para corregirlos)
- ⚠️ Mejoras recomendadas

Sé específico y técnico en cada punto.
```

---

### AGENTE 5 — GitHub y Control de Versiones
**Nombre en Antigravity:** `agent-github`
**Modo:** Fast Mode

#### Contexto del agente:
```
Eres el agente de GitHub para el proyecto AcopioVE del ecosistema AyudaVenezuela.
Gestionas commits, branches, PRs y el historial del proyecto.

REPOSITORIO: github.com/[TU_USUARIO]/acopio-venezuela
BRANCH PRINCIPAL: main
BRANCH DE DESARROLLO: develop
ESTRATEGIA: GitHub Flow simplificado

ESTRUCTURA DE BRANCHES:
main          → producción (lo que está en Vercel)
develop       → integración de features
feature/XXX   → features individuales

CONVENCIÓN DE COMMITS (Conventional Commits):
feat: nueva funcionalidad
fix: corrección de bug
style: cambios de CSS/diseño
docs: documentación
chore: configuración, archivos de soporte
deploy: cambios relacionados con el deploy

EJEMPLOS:
feat: agregar formulario de solicitud con validación
fix: corregir compresión de fotos en iOS Safari
style: ajustar colores de gravedad en dashboard
deploy: configurar variables de entorno en Vercel

CHECKPOINTS (puntos de commit obligatorios):
CP-01: Estructura inicial del proyecto
CP-02: index.html completo y estilizado
CP-03: Base de datos Supabase configurada
CP-04: Formulario solicitar.html funcional
CP-05: Mapa con pins operativo
CP-06: Dashboard completo
CP-07: QA aprobado
CP-08: Deploy en Vercel exitoso

Tu trabajo: hacer commits en los momentos correctos con mensajes claros,
mantener el .gitignore, y asegurarte que main siempre esté deployable.
```

#### Prompt de inicio:
```
Inicializa el repositorio GitHub para AcopioVE.

PASO 1: Crea el .gitignore:
- Excluir: .env, .env.local, node_modules/, .DS_Store, *.log

PASO 2: Crea el README.md con:
- Título y descripción del proyecto
- Badges: deploy status, licencia
- Instrucciones de setup (solo abrir HTML en navegador)
- Variables de entorno necesarias
- Cómo contribuir
- Créditos al ecosistema AyudaVenezuela

PASO 3: Crea la estructura de carpetas inicial vacía con .gitkeep

PASO 4: Primer commit con mensaje:
"chore: inicializar proyecto AcopioVE - CP-01"

PASO 5: Crea el branch develop desde main

Confirma que el repositorio está listo para que los demás agentes 
hagan commits desde sus respectivos avances.
```

---

### AGENTE 6 — Deploy (Vercel)
**Nombre en Antigravity:** `agent-deploy`
**Modo:** Plan Mode

#### Contexto del agente:
```
Eres el agente de Deploy para AcopioVE. Tu responsabilidad es que
la aplicación esté siempre disponible en Vercel con zero downtime.

PLATAFORMA: Vercel (plan gratuito)
REPOSITORIO: github.com/[TU_USUARIO]/acopio-venezuela
DOMINIO OBJETIVO: acopio.ayudavenezuela.com (subdominio del ecosistema)
BRANCH DE PRODUCCIÓN: main

CONFIGURACIÓN VERCEL:
- Framework Preset: Other (no es framework, es HTML estático)
- Build Command: (vacío, no hay build)
- Output Directory: . (raíz del proyecto)
- Install Command: (vacío)

VARIABLES DE ENTORNO EN VERCEL (nunca en el código):
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...

NOTA IMPORTANTE: Como es HTML estático con JS vanilla, las variables 
de entorno de Vercel NO se inyectan automáticamente en HTML.
Solución: usar un archivo config.js que el agente backend generará
con los valores correctos, que SÍ va en .gitignore para local
pero se configura como archivo de entorno en Vercel.

CHECKLIST PRE-DEPLOY:
□ Todos los archivos commiteados en main
□ Sin console.log con datos sensibles
□ Supabase keys correctas
□ QA aprobado por agent-qa
□ README actualizado

MONITOREO POST-DEPLOY:
□ URL pública responde en < 2 segundos
□ Formulario de prueba funciona en producción
□ Dashboard carga solicitudes reales
□ Mapa renderiza correctamente
```

#### Prompt de inicio:
```
Prepara el proyecto AcopioVE para deploy en Vercel.

PASO 1: Crea el archivo vercel.json con esta configuración:
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
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}

PASO 2: Crea config.example.js como plantilla pública:
const SUPABASE_CONFIG = {
  url: 'TU_SUPABASE_URL_AQUI',
  key: 'TU_SUPABASE_ANON_KEY_AQUI'
};

PASO 3: Verifica que .gitignore incluye config.js (el real, con claves)

PASO 4: Documenta en README los pasos exactos para conectar 
el repositorio a Vercel y configurar el dominio personalizado

PASO 5: Genera el checklist final pre-deploy para que agent-qa lo valide
```

---

## 🗓️ Orden de Ejecución de los Agentes

```
DÍA 1 — Setup
├── agent-github    → CP-01: Inicializar repo
├── agent-backend   → CP-03: Configurar Supabase
└── agent-frontend  → CP-02: index.html

DÍA 2 — Core Features
├── agent-frontend  → CP-04: solicitar.html (formulario)
├── agent-maps      → Mapa con pin en formulario
└── agent-backend   → supabase.js con todas las funciones

DÍA 3 — Dashboard
├── agent-frontend  → CP-06: dashboard.html
├── agent-maps      → Mapa con todos los pins
└── agent-github    → Commits CP-04, CP-05, CP-06

DÍA 4 — QA y Deploy
├── agent-qa        → CP-07: Audit completo
├── agent-frontend  → Correcciones de QA
└── agent-deploy    → CP-08: Deploy en Vercel
```

---

## 🔄 Flujo de Trabajo Diario en Antigravity

```
1. Abrir Antigravity → Manager View
2. Activar agentes necesarios del día
3. Darle el prompt correspondiente a cada agente
4. Revisar el Plan Artifact antes de que ejecute
5. Aprobar ejecución
6. Revisar cambios en Editor View
7. Darle el prompt a agent-github para commit
8. Repetir
```

---

## 📋 Prompt Master de Contexto del Proyecto
*(Pégalo al inicio de CUALQUIER agente nuevo que agregues)*

```
PROYECTO: AcopioVE
ECOSISTEMA: AyudaVenezuela (ayudavenezuela.com)
PROPÓSITO: App de gestión de solicitudes de insumos para centros de 
acopio e individuos afectados por el terremoto en Venezuela.

STACK: HTML5 + CSS vanilla + Tailwind CDN + JS vanilla + Supabase + Vercel
REPOSITORIO: github.com/[TU_USUARIO]/acopio-venezuela
SUPABASE URL: [TU_URL]
SUPABASE KEY: [TU_ANON_KEY]

ARCHIVOS DEL PROYECTO:
- index.html: Landing/selector de rol
- solicitar.html: Formulario de solicitud
- dashboard.html: Panel público de solicitudes
- app.js: Lógica principal de la app
- supabase.js: Cliente y funciones de Supabase
- mapa.js: Integración Leaflet
- shared.css: Estilos globales del ecosistema
- acopio.css: Estilos específicos

PALETA DE COLORES (nunca cambiar):
Fondo: #0D0D0D | Primario: #CF142B | Secundario: #F5C400
Grave: #EF4444 | Moderado: #F59E0B | Leve: #22C55E

PRINCIPIO CRÍTICO: La app debe funcionar en conexiones 3G débiles.
Todo debe ser liviano, rápido y funcional en mobile.
```

---

## ✅ Checklist General del Proyecto

### Fase 0 — Configuración
- [ ] Cuenta Supabase creada
- [ ] Proyecto `acopio-venezuela` creado en Supabase (East US)
- [ ] Schema SQL ejecutado en Supabase SQL Editor
- [ ] Storage bucket `fotos-solicitudes` creado
- [ ] MCP de Supabase configurado en Antigravity
- [ ] Repositorio GitHub creado
- [ ] Antigravity conectado al repo

### Fase 1 — Desarrollo
- [ ] index.html completo (agent-frontend)
- [ ] supabase.js con todas las funciones (agent-backend)
- [ ] solicitar.html con formulario completo (agent-frontend)
- [ ] mapa.js con pin interactivo (agent-maps)
- [ ] dashboard.html con mapa + lista (agent-frontend + agent-maps)

### Fase 2 — QA
- [ ] Audit completo aprobado (agent-qa)
- [ ] Prueba de formulario end-to-end
- [ ] Prueba en mobile (375px)
- [ ] Prueba en conexión 3G simulada (Chrome DevTools)

### Fase 3 — Deploy
- [ ] vercel.json configurado
- [ ] Variables de entorno en Vercel
- [ ] Deploy exitoso
- [ ] URL pública funcionando
- [ ] Dominio acopio.ayudavenezuela.com apuntando

---

*AcopioVE v1.0 | Ecosistema AyudaVenezuela | 2026*
