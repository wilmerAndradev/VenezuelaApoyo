# 06 — Deploy en Vercel
## AcopioVE | Guía de Despliegue en Producción

---

## Prerequisitos antes de hacer deploy

- [ ] Supabase configurado y funcionando (doc 02)
- [ ] GitHub repo con todos los archivos (doc 03)
- [ ] QA aprobado (CP-07 commiteado)
- [ ] `main` actualizado con todos los cambios
- [ ] `vercel.json` presente en el repo
- [ ] `config.js` NO está en el repo (está en .gitignore)

---

## PASO 1 — Crear cuenta en Vercel

1. Ve a **https://vercel.com**
2. Clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"** (usa la misma cuenta del repo)
4. Autoriza Vercel en GitHub

---

## PASO 2 — Importar el proyecto

1. En el dashboard de Vercel → **"Add New Project"**
2. Selecciona **"Import Git Repository"**
3. Busca y selecciona `acopio-venezuela`
4. En la pantalla de configuración:

| Campo | Valor |
|---|---|
| Framework Preset | **Other** |
| Root Directory | `.` (dejar como está) |
| Build Command | `bash build.sh` |
| Output Directory | `.` (dejar como está) |
| Install Command | *(dejar vacío)* |

5. **No hagas deploy todavía** — primero configura las variables de entorno

---

## PASO 3 — Configurar variables de entorno

En la misma pantalla de configuración → **"Environment Variables"**:

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | `https://XXXXXXXX.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` (tu anon key) |

Clic en **"Add"** para cada una.

Asegúrate que apliquen a: **Production, Preview, Development**

---

## PASO 4 — Deploy

1. Clic en **"Deploy"**
2. Espera ~1 minuto (el build.sh genera config.js desde las variables)
3. Vercel te dará una URL temporal: `acopio-venezuela-xxxx.vercel.app`
4. Abre esa URL y verifica que la app funciona

---

## PASO 5 — Verificar el deploy

Prueba en la URL de Vercel:

```
✅ index.html carga correctamente
✅ El contador de solicitudes muestra un número
✅ Ir a /solicitar → formulario aparece
✅ Ir a /dashboard → mapa y lista cargan
✅ Crear una solicitud de prueba end-to-end
✅ La solicitud aparece en el dashboard
✅ Probar en mobile (DevTools → toggle device)
```

---

## PASO 6 — Configurar dominio personalizado

### Si ya tienes el dominio `ayudavenezuela.com`:

1. En Vercel → tu proyecto → **Settings → Domains**
2. Escribe: `acopio.ayudavenezuela.com`
3. Clic en **"Add"**
4. Vercel te mostrará los registros DNS a agregar:

```
Tipo: CNAME
Nombre: acopio
Valor: cname.vercel-dns.com
```

5. Ve al panel de tu proveedor de dominio (GoDaddy, Namecheap, etc.)
6. Agrega ese registro CNAME
7. Espera 5-30 minutos para que propague

### Si aún no tienes el dominio:
- Crea la cuenta con el dominio temporal de Vercel por ahora
- El dominio `ayudavenezuela.com` se puede comprar en Namecheap (~$10/año)

---

## PASO 7 — Deploy final y commit CP-08

Una vez verificado que todo funciona en producción:

Dile a `agent-github`:
```
El deploy fue exitoso. La app está funcionando en producción.
Haz el commit final CP-08:
"deploy: AcopioVE en producción en Vercel - CP-08"
Actualiza el README con la URL de producción.
```

---

## Deploys automáticos (en adelante)

Cada vez que hagas push a `main`, Vercel redeploya automáticamente.
Workflow recomendado:

```
1. Trabajas en los agentes → cambios en archivos
2. agent-github hace commit en develop
3. Cuando todo está listo: merge develop → main
4. Vercel detecta el push a main
5. Deploy automático en ~1 minuto
6. Verificas en la URL de producción
```

---

## Solución de problemas comunes

### La app carga pero no hay datos de Supabase
- Verifica que las variables de entorno estén correctas en Vercel
- Abre DevTools → Console → busca errores de conexión
- Verifica que `build.sh` generó `config.js` correctamente

### El mapa no carga
- Verifica que Leaflet CDN sea accesible
- Abre DevTools → Network → busca leaflet.js con error

### Las fotos no se suben
- Verifica que el bucket `fotos-solicitudes` es público en Supabase
- Verifica las policies de storage

### Error CORS
- En Supabase → Settings → API → Authentication → agrega tu dominio Vercel a la lista de URLs permitidas

---

## URLs finales del ecosistema

```
Landing hub:    https://ayudavenezuela.com
AcopioVE:       https://acopio.ayudavenezuela.com
(próximas apps se agregan como subdominios)
```

---
*AcopioVE v1.0 | Deploy Guide | Ecosistema AyudaVenezuela | 2026*
