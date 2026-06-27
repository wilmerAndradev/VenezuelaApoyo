# 01 — Visión General y Arquitectura
## AcopioVE | Ecosistema AyudaVenezuela

---

## ¿Qué es AcopioVE?

AcopioVE es la primera aplicación del ecosistema **AyudaVenezuela**, una plataforma digital de respuesta humanitaria creada tras el terremoto en Venezuela. Su función es conectar centros de acopio e individuos en emergencia con personas dispuestas a ayudar con insumos o asistencia directa.

---

## Ecosistema AyudaVenezuela

```
ayudavenezuela.com (Hub central — directorio de apps)
│
├── acopio.ayudavenezuela.com     → AcopioVE (esta app)
├── servicios.ayudavenezuela.com  → Servicios básicos activos
├── medicamentos.ayudavenezuela.com → Banco de medicamentos
├── rutas.ayudavenezuela.com      → Estado de vías
└── refugio.ayudavenezuela.com    → Alojamiento temporal
```

Cada app es independiente pero comparte diseño, paleta y header del ecosistema.

---

## Flujo de usuario de AcopioVE

```
Usuario llega a index.html
│
├── "Soy Centro de Acopio"
│     └── solicitar.html?tipo=centro_acopio
│           └── Formulario: datos + lista de insumos + pin en mapa
│                 └── Guarda en Supabase → aparece en dashboard
│
├── "Necesito Ayuda Urgente"
│     └── solicitar.html?tipo=individuo
│           └── Formulario: datos + motivo + gravedad + pin en mapa
│                 └── Guarda en Supabase → aparece en dashboard
│
└── "Ver todas las solicitudes"
      └── dashboard.html
            ├── Mapa con pins por gravedad (rojo/amarillo/verde)
            ├── Lista filtrable de solicitudes activas
            └── Se actualiza en tiempo real vía Supabase Realtime
```

---

## Stack tecnológico

| Capa | Tecnología | Razón |
|---|---|---|
| Frontend | HTML5 + CSS vanilla + JS vanilla | Mínimo peso, máxima velocidad |
| Estilos | Tailwind CSS via CDN | Sin build, sin npm |
| Mapa | Leaflet.js 1.9.4 via CDN | El más liviano, gratuito |
| Base de datos | Supabase (PostgreSQL) | Realtime, storage, MCP |
| Fotos | Supabase Storage | Integrado, público |
| Deploy | Vercel | Gratis, automático |
| IDE | Google Antigravity | Desarrollo agéntico |
| Versiones | GitHub | Control de cambios |

**Principio rector:** La app debe cargar en menos de 3 segundos en una conexión 3G débil.

---

## Archivos del proyecto

```
acopio-venezuela/
├── index.html          # Landing: selector de rol
├── solicitar.html      # Formulario de solicitud
├── dashboard.html      # Panel público con mapa y lista
├── app.js              # Lógica principal de la aplicación
├── supabase.js         # Cliente Supabase y todas las queries
├── mapa.js             # Integración Leaflet (pin + dashboard)
├── shared.css          # Estilos globales del ecosistema
├── acopio.css          # Estilos específicos de esta app
├── config.js           # Credenciales (en .gitignore)
├── config.example.js   # Plantilla pública sin credenciales
├── vercel.json         # Configuración de deploy
├── .gitignore          # Archivos excluidos de GitHub
└── README.md           # Documentación pública del repo
```

---

## Paleta de colores (nunca cambiar)

```
Fondo principal:    #0D0D0D
Card background:    #1A1A1A
Border:             #2A2A2A
Texto principal:    #F0F0F0
Texto secundario:   #9CA3AF
Acento primario:    #CF142B  ← rojo bandera Venezuela
Acento secundario:  #F5C400  ← amarillo bandera Venezuela
Acento terciario:   #003087  ← azul bandera Venezuela

Estados de gravedad:
Grave:              #EF4444  (rojo)
Moderado:           #F59E0B  (amarillo)
Leve:               #22C55E  (verde)
```

---

## Tipografía

- **Fuente:** Inter (Google Fonts)
- **Display/Títulos:** Inter 700 (Bold)
- **Body:** Inter 400 (Regular)
- **Labels/UI:** Inter 500 (Medium)
- **Tamaño mínimo body:** 16px
- **Tamaño mínimo labels:** 14px

---

## Base de datos — Tabla principal

```
solicitudes
├── id                uuid (PK, auto)
├── tipo              text: 'centro_acopio' | 'individuo'
├── nombre            text (requerido)
├── apellido          text (requerido)
├── cedula            text (requerido)
├── motivo            text (requerido)
├── gravedad          text: 'leve' | 'moderado' | 'grave'
├── items             jsonb: ["item1", "item2", ...]
├── foto_url          text (URL pública en Supabase Storage)
├── latitud           numeric(10,7)
├── longitud          numeric(10,7)
├── direccion_referencia text
├── activo            boolean (default: true)
└── created_at        timestamptz (auto)
```

---

## Agentes en Antigravity

| Agente | Responsabilidad |
|---|---|
| agent-frontend | HTML, CSS, diseño, UI |
| agent-backend | Supabase, SQL, storage, supabase.js |
| agent-maps | Leaflet, pins, mapa.js |
| agent-qa | Testing, auditoría, bugs |
| agent-github | Commits, branches, checkpoints |
| agent-deploy | Vercel, dominio, variables de entorno |

---

## Orden de desarrollo (4 días)

```
DÍA 1: Setup
  → Supabase configurado
  → GitHub repo inicializado
  → index.html completo

DÍA 2: Formulario
  → solicitar.html con validación
  → mapa.js con pin interactivo
  → supabase.js con crearSolicitud()

DÍA 3: Dashboard
  → dashboard.html con mapa + lista
  → Filtros por tipo y gravedad
  → Realtime activado

DÍA 4: QA y Deploy
  → Audit completo
  → Correcciones
  → Deploy en Vercel
  → Dominio configurado
```

---
*AcopioVE v1.0 | Ecosistema AyudaVenezuela | 2026*
