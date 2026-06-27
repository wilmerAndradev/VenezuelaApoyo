# 07 — Referencia Rápida y Checklist Maestro
## AcopioVE | Cheatsheet de Desarrollo

---

## 🗂️ Índice de toda la documentación

| Doc | Contenido |
|---|---|
| `01_VISION_Y_ARQUITECTURA.md` | Qué es el proyecto, stack, estructura de archivos |
| `02_SUPABASE_SETUP.md` | Crear BD, schema SQL, credenciales |
| `03_GITHUB_ANTIGRAVITY_SETUP.md` | Repo, MCP, agentes, convención de commits |
| `04_AGENTES_Y_PROMPTS.md` | Contexto y prompts de inicio de los 6 agentes |
| `05_SRS.md` | Requisitos funcionales y no funcionales completos |
| `06_DEPLOY_VERCEL.md` | Deploy, dominio, variables de entorno |
| `07_REFERENCIA_RAPIDA.md` | Este archivo: cheatsheet y checklist maestro |

---

## ⚡ Cheatsheet de CDNs

Copia estas líneas en el `<head>` de todos los HTML:

```html
<!-- Google Fonts: Inter -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">

<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<!-- Leaflet JS (antes de cerrar body) -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Supabase JS (antes de cerrar body) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

<!-- Config y lógica propia (después de las CDNs) -->
<script src="config.js"></script>
<script src="supabase.js"></script>
<script src="mapa.js"></script>
<script src="app.js"></script>
```

---

## 🎨 Paleta de colores (variables CSS)

```css
:root {
  --bg-main:      #0D0D0D;
  --bg-card:      #1A1A1A;
  --border:       #2A2A2A;
  --text-main:    #F0F0F0;
  --text-muted:   #9CA3AF;
  --primary:      #CF142B;  /* rojo Venezuela */
  --secondary:    #F5C400;  /* amarillo Venezuela */
  --accent:       #003087;  /* azul Venezuela */
  --grave:        #EF4444;
  --moderado:     #F59E0B;
  --leve:         #22C55E;
}
```

---

## 🗄️ Schema SQL resumido

```sql
create table public.solicitudes (
  id uuid default gen_random_uuid() primary key,
  tipo text not null,           -- 'centro_acopio' | 'individuo'
  nombre text not null,
  apellido text not null,
  cedula text not null,
  motivo text not null,
  gravedad text not null,       -- 'leve' | 'moderado' | 'grave'
  items jsonb default '[]',     -- ["item1", "item2"]
  foto_url text,
  latitud numeric(10, 7),
  longitud numeric(10, 7),
  direccion_referencia text,
  activo boolean default true,
  created_at timestamptz default now()
);
```

---

## 🤖 Qué agente usar para cada tarea

| Tarea | Agente |
|---|---|
| Crear o editar HTML/CSS | agent-frontend |
| Agregar validación al formulario | agent-frontend |
| Cambiar estilos o colores | agent-frontend |
| Agregar columna a la BD | agent-backend |
| Crear nueva query a Supabase | agent-backend |
| Problema con el mapa | agent-maps |
| Agregar tipo de marcador | agent-maps |
| Algo no funciona, encontrar bug | agent-qa |
| Hacer commit de cambios | agent-github |
| Problema en producción | agent-deploy |

---

## 📝 Prompts de corrección rápida

### Corregir un bug específico:
```
[Pega el contexto del proyecto]

BUG ENCONTRADO:
Archivo: [nombre del archivo]
Problema: [descripción del problema]
Comportamiento actual: [qué hace mal]
Comportamiento esperado: [qué debería hacer]

Corrige el bug y muestra solo las líneas modificadas con contexto.
```

### Agregar una funcionalidad nueva:
```
[Pega el contexto del proyecto]

NUEVA FUNCIONALIDAD:
Descripción: [qué debe hacer]
Archivo(s) a modificar: [lista]
No romper: [qué debe seguir funcionando]

Genera los cambios necesarios.
```

### Revisar un archivo específico:
```
[Pega el contexto del proyecto]

Revisa el archivo [nombre] y verifica:
1. Que todas las funciones estén correctamente definidas
2. Que no haya errores de sintaxis
3. Que las CDNs estén correctamente importadas
4. Que el código sea mobile-first

Reporta cualquier problema encontrado.
```

---

## 🏁 Checklist Maestro Completo

### FASE 0 — Preparación
- [ ] Supabase: proyecto creado en East US
- [ ] Supabase: schema SQL ejecutado sin errores
- [ ] Supabase: 13 columnas en tabla solicitudes
- [ ] Supabase: 2 policies creadas (lectura + inserción)
- [ ] Supabase: bucket fotos-solicitudes creado
- [ ] Supabase: Realtime activado
- [ ] Supabase: SUPABASE_URL guardada
- [ ] Supabase: SUPABASE_ANON_KEY guardada
- [ ] GitHub: repo acopio-venezuela creado (público)
- [ ] GitHub: branch develop creado
- [ ] Antigravity: repo clonado
- [ ] Antigravity: MCP Supabase configurado y verificado
- [ ] Antigravity: 6 agentes creados con sus contextos
- [ ] Local: config.js creado con credenciales reales
- [ ] Local: config.example.js creado sin credenciales

### FASE 1 — CP-01, CP-02, CP-03
- [ ] .gitignore creado (incluye config.js)
- [ ] README.md creado
- [ ] Estructura de archivos vacíos creada
- [ ] Commit CP-01: "chore: inicializar proyecto AcopioVE"
- [ ] supabase.js con las 6 funciones completas
- [ ] schema.sql generado como migration
- [ ] Commit CP-03: "chore: schema SQL y cliente Supabase"
- [ ] index.html completo con selector de roles
- [ ] Counter de solicitudes activas funcionando
- [ ] Commit CP-02: "feat: landing page con selector de rol"

### FASE 2 — CP-04, CP-05
- [ ] solicitar.html: estructura HTML completa
- [ ] solicitar.html: validación de todos los campos
- [ ] solicitar.html: selector de gravedad visual
- [ ] solicitar.html: lista dinámica de ítems
- [ ] solicitar.html: compresión de foto en cliente
- [ ] solicitar.html: mapa con pin interactivo
- [ ] solicitar.html: GPS funcional o error claro
- [ ] solicitar.html: envío a Supabase funcionando
- [ ] solicitar.html: modal de confirmación con ID
- [ ] mapa.js: iniciarMapaSolicitud() completo
- [ ] mapa.js: getCoordenadasSeleccionadas() retorna datos
- [ ] Commit CP-04: "feat: formulario de solicitud completo"
- [ ] Commit CP-05: "feat: mapa Leaflet con pin interactivo"

### FASE 3 — CP-06
- [ ] dashboard.html: mapa con todos los pins
- [ ] dashboard.html: pins con colores por gravedad
- [ ] dashboard.html: íconos diferentes por tipo
- [ ] dashboard.html: popup con info completa
- [ ] dashboard.html: lista de cards debajo del mapa
- [ ] dashboard.html: filtros por tipo y gravedad
- [ ] dashboard.html: filtros afectan mapa y lista
- [ ] dashboard.html: Realtime actualiza sin recargar
- [ ] dashboard.html: toast de nueva solicitud
- [ ] mapa.js: iniciarMapaDashboard() completo
- [ ] mapa.js: actualizarMarcadores() funcionando
- [ ] mapa.js: filtrarMarcadores() funcionando
- [ ] Commit CP-06: "feat: dashboard con mapa y lista filtrable"

### FASE 4 — CP-07 y CP-08
- [ ] QA: flujo centro de acopio end-to-end
- [ ] QA: flujo individuo end-to-end
- [ ] QA: carga < 3s en 3G simulado
- [ ] QA: funciona en 375px sin scroll horizontal
- [ ] QA: sin errores en DevTools console
- [ ] QA: fotos comprimen correctamente
- [ ] QA: filtros del dashboard funcionan
- [ ] QA: Realtime actualiza correctamente
- [ ] Correcciones de QA aplicadas
- [ ] Commit CP-07: "test: QA audit completo aprobado"
- [ ] vercel.json creado
- [ ] build.sh creado
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy exitoso
- [ ] URL de producción verificada
- [ ] Dominio acopio.ayudavenezuela.com configurado
- [ ] Commit CP-08: "deploy: AcopioVE en producción en Vercel"

---

## 🔗 Links de referencia

| Recurso | URL |
|---|---|
| Supabase Dashboard | https://app.supabase.com |
| Supabase Docs JS | https://supabase.com/docs/reference/javascript |
| Leaflet Docs | https://leafletjs.com/reference.html |
| Vercel Dashboard | https://vercel.com/dashboard |
| Nominatim (geocoding) | https://nominatim.org/release-docs/latest/api/Reverse/ |
| Tailwind Docs | https://tailwindcss.com/docs |
| Conventional Commits | https://www.conventionalcommits.org |

---
*AcopioVE v1.0 | Cheatsheet | Ecosistema AyudaVenezuela | 2026*
