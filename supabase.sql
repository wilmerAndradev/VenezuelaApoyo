-- =====================================================================
-- ACOPIO VE — Schema Migration
-- Proyecto: AcopioVE (Venezuela Terremoto)
-- =====================================================================

-- 1. Tabla de Solicitudes y Restricciones a nivel de Base de Datos
create table if not exists public.solicitudes (
  id uuid default gen_random_uuid() primary key,
  tipo text not null check (tipo in ('centro_acopio', 'individuo')),
  nombre text not null check (length(trim(nombre)) > 0),
  apellido text not null check (length(trim(apellido)) > 0),
  cedula text not null check (cedula ~ '^[0-9]{6,10}$'), -- V-XXXXXXXX: solo números, entre 6 y 10 dígitos
  motivo text not null check (length(trim(motivo)) > 0),
  gravedad text not null check (gravedad in ('leve', 'moderado', 'grave')),
  items jsonb default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  foto_url text check (foto_url is null or length(trim(foto_url)) > 0),
  latitud numeric(10, 7) check (latitud is null or (latitud >= -90.0 and latitud <= 90.0)),
  longitud numeric(10, 7) check (longitud is null or (longitud >= -180.0 and longitud <= 180.0)),
  direccion_referencia text check (direccion_referencia is null or length(trim(direccion_referencia)) > 0),
  activo boolean default true not null,
  created_at timestamptz default now() not null
);

-- 2. Habilitar Row Level Security (RLS)
alter table public.solicitudes enable row level security;

-- 3. Políticas de Seguridad RLS en la tabla solicitudes
-- Permitir lectura pública (anon y authenticated)
create policy "lectura_publica"
  on public.solicitudes
  for select
  to anon, authenticated
  using (true);

-- Permitir inserción pública (anon y authenticated)
create policy "insercion_publica"
  on public.solicitudes
  for insert
  to anon, authenticated
  with check (true);

-- 4. Índices para optimizar el rendimiento de búsquedas y filtrados comunes
create index if not exists idx_solicitudes_tipo on public.solicitudes(tipo);
create index if not exists idx_solicitudes_gravedad on public.solicitudes(gravedad);
create index if not exists idx_solicitudes_activo on public.solicitudes(activo);
create index if not exists idx_solicitudes_created on public.solicitudes(created_at desc);

-- 5. Creación del Storage Bucket para fotos-solicitudes
-- Límite de tamaño: 500kb (524288 bytes). Tipos permitidos: jpeg, png, webp.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-solicitudes', 
  'fotos-solicitudes', 
  true, 
  524288, 
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 6. Políticas de RLS en Storage (storage.objects)
-- Permitir que cualquier usuario acceda a las fotos del bucket
create policy "storage_lectura_publica"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'fotos-solicitudes');

-- Permitir que cualquier usuario suba fotos al bucket
create policy "storage_insercion_publica"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'fotos-solicitudes');
