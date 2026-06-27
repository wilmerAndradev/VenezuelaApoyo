-- ================================================
-- ACOPIO VE — Schema principal y migración de BD
-- ================================================

-- Tabla principal
create table if not exists public.solicitudes (
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

-- Habilitar Row Level Security (RLS)
alter table public.solicitudes enable row level security;

-- Políticas de RLS
create policy "lectura_publica"
  on public.solicitudes for select using (true);

create policy "insercion_publica"
  on public.solicitudes for insert with check (true);

-- Índices de rendimiento
create index if not exists idx_solicitudes_tipo on public.solicitudes(tipo);
create index if not exists idx_solicitudes_gravedad on public.solicitudes(gravedad);
create index if not exists idx_solicitudes_activo on public.solicitudes(activo);
create index if not exists idx_solicitudes_created on public.solicitudes(created_at desc);

-- Creación del Bucket de Storage para fotos (500kb max, solo imágenes)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fotos-solicitudes', 'fotos-solicitudes', true, 524288,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Políticas de RLS para el Bucket
create policy "storage_lectura_publica"
  on storage.objects for select
  using (bucket_id = 'fotos-solicitudes');

create policy "storage_insercion_publica"
  on storage.objects for insert
  with check (bucket_id = 'fotos-solicitudes');
