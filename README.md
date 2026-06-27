# 🇻🇪 AcopioVE — Gestión de Solicitudes de Insumos

[![Vercel Deployment](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Ecosystem: AyudaVenezuela](https://img.shields.io/badge/Ecosystem-AyudaVenezuela-CF142B)](https://ayudavenezuela.com)

**AcopioVE** es una aplicación web de respuesta rápida y humanitaria diseñada para conectar centros de acopio y personas afectadas por el terremoto en Venezuela con voluntarios, donantes y personal de asistencia en tiempo real.

Este proyecto forma parte del ecosistema de ayuda humanitaria **AyudaVenezuela**.

---

## 🎨 Paleta de Colores Oficial

- **Fondo Principal:** `#0D0D0D`
- **Tarjetas / Contenedores:** `#1A1A1A`
- **Bordes:** `#2A2A2A`
- **Texto Principal:** `#F0F0F0`
- **Texto Muted:** `#9CA3AF`
- **Urgencia SOS / Primario:** `#CF142B` (Rojo Venezuela)
- **Acento / Secundario:** `#F5C400` (Amarillo Venezuela)

---

## ⚡ Optimización para Emergencias (3G / Conexiones Débiles)

La aplicación ha sido construida bajo los siguientes principios críticos para funcionar en zonas con cobertura celular reducida:
1. **Sin Frameworks JS:** Construida con HTML5, CSS vanilla, Tailwind (CDN utilitario) y JS vanilla para reducir drásticamente el peso de descarga inicial.
2. **Compresión Forzada en Cliente:** Las fotos adjuntadas son redimensionadas y comprimidas a través del elemento Canvas de HTML5 localmente a menos de **500 KB** antes de ser subidas a la base de datos.
3. **Pines SVG e Iconos en Línea:** No se cargan fuentes externas de iconos pesadas (como FontAwesome) ni imágenes grandes para la UI. Todo se dibuja dinámicamente con SVG inline.
4. **Resiliente a Desconexiones:** Se incluye un banner que alerta al usuario en tiempo real cuando se pierde la conexión de datos, monitoreando activamente el estado de la red.

---

## 🚀 Guía de Instalación y Uso Local

La aplicación es estática, por lo que no requiere compilación ni dependencias de Node.js.

### 1. Clonar el repositorio
```bash
git clone https://github.com/[TU_USUARIO]/acopio-venezuela.git
cd acopio-venezuela
```

### 2. Configurar Credenciales
Copia el archivo de plantilla a tu entorno local:
```bash
cp config.example.js config.js
```
Abre `config.js` y coloca tus claves públicas de Supabase:
```javascript
const SUPABASE_CONFIG = {
  url: "https://TU_PROYECTO.supabase.co",
  key: "TU_CLAVE_ANON_KEY"
};
```
*Nota: `config.js` está incluido en `.gitignore` para evitar filtraciones involuntarias.*

### 3. Ejecutar Localmente
Puedes abrir directamente el archivo `index.html` en cualquier navegador moderno, o servirlo usando un servidor local rápido como `Live Server` de VSCode o Python:
```bash
# Con Python 3
python -m http.server 8000
```
Luego ve a `http://localhost:8000`.

---

## 🗄️ Esquema de la Base de Datos (Supabase)

La tabla `solicitudes` debe tener la siguiente estructura:

```sql
create table public.solicitudes (
  id uuid default gen_random_uuid() primary key,
  tipo text not null check (tipo in ('centro_acopio', 'individuo')),
  nombre text not null,
  apellido text not null,
  cedula text not null,
  motivo text not null,
  gravedad text not null check (gravedad in ('leve', 'moderado', 'grave')),
  items jsonb default '[]'::jsonb,
  foto_url text,
  latitud numeric(10, 7),
  longitud numeric(10, 7),
  direccion_referencia text,
  activo boolean default true,
  created_at timestamptz default now()
);
```

### Reglas RLS (Row Level Security)
- **Lectura Pública (`lectura_publica`):** Permitida para todos los usuarios.
- **Inserción Pública (`insercion_publica`):** Permitida para todos los usuarios.

---

## ❤️ Contribuciones

Si deseas colaborar con el desarrollo de AcopioVE:
1. Crea un branch de desarrollo a partir de `develop`: `git checkout -b feature/mi-mejora`
2. Realiza tus commits respetando Conventional Commits (ej. `feat: ...`, `fix: ...`).
3. Envía tu Pull Request para revisión de QA.

---

*Desarrollado para el Ecosistema AyudaVenezuela. ¡Fuerza Venezuela!*
