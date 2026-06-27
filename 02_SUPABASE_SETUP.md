# 02 — Setup Supabase
## AcopioVE | Configuración de Base de Datos

---

## PASO 1 — Crear cuenta y proyecto

1. Ve a **https://supabase.com** → clic en **"Start your project"**
2. Inicia sesión con **GitHub**
3. Clic en **"New project"** y llena:

| Campo | Valor |
|---|---|
| Project name | `acopio-venezuela` |
| Database Password | Genera uno fuerte, guárdalo |
| Region | **East US (North Virginia)** |

4. Espera ~2 minutos

---

## PASO 2 — Ejecutar el Schema SQL

Sidebar → **SQL Editor** → **New query** → pega y ejecuta:

```sql
-- ================================================
-- ACOPIO VE — Schema principal
-- ================================================

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

-- Row Level Security
alter table public.solicitudes enable row level security;

create policy "lectura_publica"
  on public.solicitudes for select using (true);

create policy "insercion_publica"
  on public.solicitudes for insert with check (true);

-- Índices
create index idx_solicitudes_tipo on public.solicitudes(tipo);
create index idx_solicitudes_gravedad on public.solicitudes(gravedad);
create index idx_solicitudes_activo on public.solicitudes(activo);
create index idx_solicitudes_created on public.solicitudes(created_at desc);

-- Storage bucket para fotos (500kb máx, solo imágenes)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-solicitudes', 'fotos-solicitudes', true, 524288,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "storage_lectura_publica"
  on storage.objects for select
  using (bucket_id = 'fotos-solicitudes');

create policy "storage_insercion_publica"
  on storage.objects for insert
  with check (bucket_id = 'fotos-solicitudes');
```

Resultado esperado: `Success. No rows returned`

---

## PASO 3 — Verificar creación

Nueva query → ejecuta:

```sql
-- Debe mostrar 13 columnas
select column_name, data_type
from information_schema.columns
where table_name = 'solicitudes'
order by ordinal_position;

-- Debe mostrar 2 policies
select policyname, cmd
from pg_policies
where tablename = 'solicitudes';
```

---

## PASO 4 — Obtener credenciales

**Settings → API** → copia y guarda:

```
SUPABASE_URL=https://XXXXXXXXXXXXXXXX.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ Solo necesitas la `anon public key`. Nunca uses la `service_role key` en el frontend.

---

## PASO 5 — Activar Realtime

**Database → Replication** → tabla `solicitudes` → activa el toggle **Realtime**

---

## PASO 6 — Dato de prueba

```sql
insert into public.solicitudes
  (tipo, nombre, apellido, cedula, motivo, gravedad, items, latitud, longitud, direccion_referencia)
values (
  'centro_acopio', 'Cruz Roja', 'Caracas', '00000001',
  'Centro principal necesita insumos urgentes', 'grave',
  '["Agua potable", "Medicamentos", "Ropa", "Alimentos"]',
  10.4806, -66.9036, 'Av. Libertador, Caracas'
);

select * from public.solicitudes;
```

---

## ✅ Checklist Supabase

- [ ] Proyecto creado en East US
- [ ] SQL ejecutado sin errores
- [ ] 13 columnas visibles
- [ ] 2 policies creadas
- [ ] Bucket `fotos-solicitudes` creado
- [ ] Realtime activado
- [ ] SUPABASE_URL guardada
- [ ] SUPABASE_ANON_KEY guardada
- [ ] Dato de prueba insertado y visible

---
*AcopioVE v1.0 | Ecosistema AyudaVenezuela | 2026*
