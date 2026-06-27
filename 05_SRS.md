# 05 — SRS: Software Requirements Specification
## AcopioVE v1.0 | Ecosistema AyudaVenezuela

---

## 1. Introducción

### 1.1 Propósito
Este documento define los requisitos funcionales y no funcionales de AcopioVE, primera aplicación del ecosistema AyudaVenezuela, desarrollada como respuesta a la emergencia humanitaria generada por el terremoto en Venezuela en 2026.

### 1.2 Alcance
AcopioVE es una aplicación web pública que permite a centros de acopio e individuos afectados registrar sus necesidades de insumos y asistencia, visibles en tiempo real para cualquier persona dispuesta a ayudar.

### 1.3 Definiciones
- **Centro de acopio:** Instalación organizada que recibe y distribuye insumos humanitarios
- **Individuo:** Persona afectada directamente por el desastre que necesita ayuda personal
- **Solicitud:** Registro de necesidad creado por un usuario
- **Insumo:** Ítem físico necesitado (agua, medicamento, ropa, etc.)
- **Gravedad:** Nivel de urgencia de la solicitud (leve, moderado, grave)

---

## 2. Descripción General

### 2.1 Perspectiva del producto
AcopioVE opera como subdominio `acopio.ayudavenezuela.com` dentro del ecosistema AyudaVenezuela. Comparte identidad visual y filosofía de diseño con las demás apps del ecosistema.

### 2.2 Usuarios del sistema

| Tipo de usuario | Descripción | Acción principal |
|---|---|---|
| Centro de acopio | Organización receptora de insumos | Registra qué insumos necesita |
| Individuo | Persona en emergencia personal | Solicita ayuda con gravedad SOS |
| Donante/Voluntario | Persona que quiere ayudar | Consulta el dashboard y actúa |

### 2.3 Restricciones generales
- Sin autenticación de usuarios (acceso público total)
- Sin backend propio (Supabase como BaaS)
- Funcionar en conexiones 3G débiles (< 500kb carga inicial)
- Soporte mínimo: Chrome 90+, Firefox 88+, Safari 14+, Chrome Android 90+

---

## 3. Requisitos Funcionales

### RF-01: Selección de rol
- El sistema debe permitir al usuario identificarse como "Centro de Acopio" o "Individuo"
- La selección determina el tipo de formulario mostrado
- Ambas opciones deben ser visualmente diferenciadas y accesibles desde la landing

### RF-02: Formulario de solicitud — Datos comunes
- El sistema debe solicitar: nombre, apellido, número de cédula
- La cédula debe validarse como solo numérica con mínimo 6 dígitos
- El sistema debe solicitar un motivo/descripción de la situación (mínimo 20 caracteres)
- El sistema debe permitir seleccionar nivel de gravedad: leve, moderado o grave
- La gravedad debe representarse visualmente con colores (verde, amarillo, rojo)

### RF-03: Formulario de solicitud — Lista de insumos
- Si el tipo es "Centro de Acopio", el sistema debe mostrar un campo para agregar ítems
- El usuario puede agregar múltiples ítems de texto libre
- El usuario puede eliminar ítems individuales
- Se requiere mínimo 1 ítem para centros de acopio

### RF-04: Subida de foto
- El sistema debe permitir adjuntar una foto (opcional)
- Formatos aceptados: JPEG, PNG, WebP
- El sistema debe comprimir la imagen en el cliente antes de subir a máx 500kb
- Debe mostrarse un preview de la imagen seleccionada

### RF-05: Geolocalización
- El sistema debe incluir un mapa interactivo para que el usuario marque su ubicación
- El usuario puede hacer clic en el mapa para colocar un pin
- El pin debe ser arrastrable para ajustar la posición
- El sistema debe ofrecer un botón "Usar mi ubicación GPS"
- Al colocar pin: mostrar reverse geocoding de la dirección aproximada
- El usuario puede ingresar una descripción de referencia adicional
- Las coordenadas son requeridas para enviar la solicitud

### RF-06: Envío y persistencia
- Al enviar el formulario, el sistema debe guardar todos los datos en Supabase
- Subir la foto a Supabase Storage si se adjuntó
- Mostrar confirmación con el ID único de la solicitud
- Ofrecer enlace directo al dashboard

### RF-07: Dashboard público
- El sistema debe mostrar todas las solicitudes activas
- Las solicitudes deben verse en un mapa con pins
- Las solicitudes deben verse en una lista de cards debajo del mapa
- Los pins deben distinguirse por gravedad (colores) y tipo (forma)
- Al hacer clic en un pin: mostrar popup con información completa

### RF-08: Filtrado
- El dashboard debe permitir filtrar por tipo: todos / centros / individuos
- El dashboard debe permitir filtrar por gravedad: todos / grave / moderado / leve
- Los filtros aplican simultáneamente al mapa y a la lista

### RF-09: Tiempo real
- El dashboard debe actualizarse automáticamente cuando llegan nuevas solicitudes
- Debe mostrarse una notificación visible al recibir nueva solicitud
- Sin necesidad de recargar la página

### RF-10: Contador de solicitudes
- La landing debe mostrar el número total de solicitudes activas
- El dashboard debe mostrar el conteo filtrado

---

## 4. Requisitos No Funcionales

### RNF-01: Performance
- Tiempo de carga inicial: < 3 segundos en conexión 3G (1.5 Mbps)
- Peso total de recursos (HTML + CSS + JS): < 500kb sin imágenes de usuario
- Time to Interactive: < 5 segundos en 3G

### RNF-02: Disponibilidad
- Uptime objetivo: 99% (garantizado por Vercel + Supabase)
- Sin dependencias de servidores propios

### RNF-03: Compatibilidad
- Mobile-first: diseño primario para 375px de ancho
- Breakpoints: 375px (mobile), 768px (tablet), 1024px (desktop)
- Táctil: elementos interactivos mínimo 48x48px

### RNF-04: Accesibilidad
- Contraste mínimo WCAG AA (4.5:1 para texto normal)
- Texto mínimo 16px en body
- Labels asociados a todos los campos de formulario
- Mensajes de error descriptivos y ubicados junto al campo

### RNF-05: Seguridad
- Credenciales de Supabase nunca expuestas en código fuente del repo
- Solo se usa la anon key (no service_role)
- Row Level Security habilitado en todas las tablas
- Sanitización de inputs antes de insertar en la DB

### RNF-06: Usabilidad de emergencia
- Flujo de solicitud completable en menos de 3 minutos
- Sin registro de cuenta requerido
- Instrucciones claras en cada paso del formulario
- Funcionar con una sola mano en mobile

---

## 5. Restricciones técnicas

| Restricción | Detalle |
|---|---|
| Sin frameworks JS | Solo HTML, CSS y JS vanilla |
| Sin npm/Node.js | Todo via CDN |
| Sin build process | Deploy directo de archivos estáticos |
| Leaflet 1.9.4 | Via CDN, sin plugins pesados |
| Tailwind CDN | Solo para estilos utilitarios |
| Supabase JS v2 | Via CDN |
| OpenStreetMap | Tiles gratuitos para el mapa |
| Nominatim | Reverse geocoding gratuito |

---

## 6. Diagrama de flujo

```
[Usuario] → index.html
               │
    ┌──────────┴──────────┐
    │                     │
[Centro de Acopio]    [Individuo]
    │                     │
    └──────────┬──────────┘
               │
        solicitar.html
               │
    ┌──────────┴──────────┐
    │                     │
[Llena formulario]   [Coloca pin en mapa]
    │                     │
    └──────────┬──────────┘
               │
         [Enviar]
               │
    ┌──────────┴──────────┐
    │                     │
[Supabase Storage]  [Tabla solicitudes]
  (foto si hay)       (todos los datos)
               │
         [Confirmación]
               │
        dashboard.html
               │
    ┌──────────┴──────────┐
    │                     │
[Mapa con pins]    [Lista de cards]
    │                     │
    └──────────┬──────────┘
               │
     [Filtros tipo/gravedad]
               │
    [Realtime: nuevas solicitudes]
```

---

## 7. Entregables del proyecto

| Archivo | Descripción | Responsable |
|---|---|---|
| `index.html` | Landing y selector de rol | agent-frontend |
| `solicitar.html` | Formulario completo | agent-frontend |
| `dashboard.html` | Panel público | agent-frontend |
| `supabase.js` | Cliente y queries | agent-backend |
| `mapa.js` | Integración Leaflet | agent-maps |
| `app.js` | Lógica auxiliar compartida | agent-frontend |
| `shared.css` | Estilos del ecosistema | agent-frontend |
| `acopio.css` | Estilos específicos | agent-frontend |
| `config.example.js` | Plantilla de credenciales | agent-backend |
| `vercel.json` | Configuración deploy | agent-deploy |
| `.gitignore` | Exclusiones GitHub | agent-github |
| `README.md` | Documentación pública | agent-github |
| `schema.sql` | Migration de BD | agent-backend |

---

## 8. Criterios de aceptación (QA)

La app se considera lista para deploy cuando:

1. Un usuario puede crear una solicitud de principio a fin en menos de 3 minutos
2. La solicitud aparece en el dashboard en menos de 5 segundos
3. El pin en el mapa muestra el color correcto según gravedad
4. La app carga en menos de 3 segundos en 3G simulado en Chrome DevTools
5. El formulario funciona correctamente en un iPhone SE (375px)
6. No hay errores en la consola de DevTools
7. Las fotos se comprimen correctamente a menos de 500kb
8. Los filtros del dashboard funcionan correctamente

---
*AcopioVE v1.0 | SRS | Ecosistema AyudaVenezuela | 2026*
