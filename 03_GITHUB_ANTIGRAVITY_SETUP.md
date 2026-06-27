# 03 — GitHub y Antigravity Setup
## AcopioVE | Control de Versiones y Entorno de Desarrollo

---

## PARTE A — GitHub

### Paso 1: Crear el repositorio

1. Ve a **https://github.com** → **New repository**
2. Llena:

| Campo | Valor |
|---|---|
| Repository name | `acopio-venezuela` |
| Description | `App de gestión de insumos para centros de acopio - Ecosistema AyudaVenezuela` |
| Visibility | **Public** |
| Add README | ✅ Sí |
| Add .gitignore | No (el agente lo creará) |

3. Clic en **"Create repository"**
4. Copia la URL del repo: `https://github.com/TU_USUARIO/acopio-venezuela`

### Paso 2: Estructura de branches

En el repo → **Settings → Branches → Add rule**:
- Branch name pattern: `main`
- ✅ Require pull request before merging (opcional, para cuando tengas colaboradores)

Branches que usarás:
```
main      → producción (lo que está en Vercel, siempre estable)
develop   → integración (aquí se fusionan los features)
```

---

## PARTE B — Antigravity IDE

### Paso 1: Abrir el proyecto

1. Abre **Google Antigravity**
2. **File → Clone repository**
3. Pega la URL de tu repo de GitHub
4. Selecciona una carpeta local donde guardar el proyecto
5. Espera que clone

### Paso 2: Configurar el MCP de Supabase

En Antigravity → **Settings → MCP Servers** → **Add Server**:

```json
{
  "name": "supabase",
  "type": "url",
  "url": "https://mcp.supabase.com",
  "headers": {
    "Authorization": "Bearer TU_SUPABASE_ANON_KEY"
  },
  "config": {
    "supabaseUrl": "TU_SUPABASE_URL",
    "supabaseKey": "TU_SUPABASE_ANON_KEY"
  }
}
```

Reemplaza `TU_SUPABASE_URL` y `TU_SUPABASE_ANON_KEY` con tus credenciales reales.

### Paso 3: Verificar conexión MCP

En el chat de Antigravity, escríbele al agente:
```
Usa el MCP de Supabase para listar las tablas disponibles 
en el proyecto acopio-venezuela
```

Debe responder listando la tabla `solicitudes`. Si lo hace, el MCP está conectado.

### Paso 4: Configurar los agentes

En Antigravity → **Agents** (o **Manager View**) → **Add Agent** para cada uno:

```
agent-frontend  → responsable de HTML/CSS/JS visual
agent-backend   → responsable de Supabase y lógica de datos
agent-maps      → responsable de Leaflet y mapas
agent-qa        → responsable de testing y auditoría
agent-github    → responsable de commits y control de versiones
agent-deploy    → responsable de Vercel y deploy
```

Para cada agente: pégale su **bloque de contexto** del documento `04_AGENTES_PROMPTS.md`

### Paso 5: Crear el archivo config.js (local, no va a GitHub)

Crea manualmente en la raíz del proyecto el archivo `config.js`:

```javascript
// config.js — NO SUBIR A GITHUB (está en .gitignore)
const SUPABASE_CONFIG = {
  url: 'https://XXXXXXXXXXXXXXXX.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

Y `config.example.js` (este SÍ va a GitHub, sin credenciales reales):

```javascript
// config.example.js — Plantilla. Copia este archivo como config.js
// y reemplaza con tus credenciales de Supabase
const SUPABASE_CONFIG = {
  url: 'TU_SUPABASE_URL_AQUI',
  key: 'TU_SUPABASE_ANON_KEY_AQUI'
};
```

---

## PARTE C — Convención de Commits

Todos los commits siguen el estándar **Conventional Commits**:

```
tipo: descripción breve en minúsculas

Tipos válidos:
feat:   nueva funcionalidad
fix:    corrección de bug
style:  cambio visual/CSS sin lógica
docs:   documentación
chore:  configuración, archivos de soporte
deploy: cambios relacionados con Vercel/deploy
test:   archivos de prueba
```

Ejemplos:
```
feat: agregar formulario de solicitud con validación completa
fix: corregir compresión de fotos en iOS Safari
style: ajustar colores de badges de gravedad en dashboard
chore: agregar .gitignore y config.example.js
deploy: configurar vercel.json con rewrites de rutas
```

---

## PARTE D — Checkpoints de GitHub

Commits obligatorios en momentos clave:

| ID | Momento | Mensaje de commit |
|---|---|---|
| CP-01 | Repo inicializado | `chore: inicializar proyecto AcopioVE - CP-01` |
| CP-02 | index.html listo | `feat: landing page con selector de rol - CP-02` |
| CP-03 | Supabase configurado | `chore: schema SQL y supabase.js completo - CP-03` |
| CP-04 | Formulario listo | `feat: formulario de solicitud con validación - CP-04` |
| CP-05 | Mapa funcional | `feat: mapa leaflet con pin interactivo - CP-05` |
| CP-06 | Dashboard listo | `feat: dashboard con mapa y lista filtrable - CP-06` |
| CP-07 | QA aprobado | `test: audit QA completo aprobado - CP-07` |
| CP-08 | Deploy exitoso | `deploy: app en producción en Vercel - CP-08` |

---

## ✅ Checklist GitHub + Antigravity

- [ ] Repositorio `acopio-venezuela` creado en GitHub
- [ ] Repo clonado en Antigravity
- [ ] MCP de Supabase configurado y verificado
- [ ] 6 agentes creados en Antigravity con su contexto
- [ ] `config.js` creado localmente (con credenciales reales)
- [ ] `config.example.js` creado (sin credenciales)
- [ ] Branch `develop` creado desde `main`
- [ ] Primer commit CP-01 realizado

---
*AcopioVE v1.0 | Ecosistema AyudaVenezuela | 2026*
