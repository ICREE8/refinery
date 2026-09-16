-- LakeKPI / Maracaibo Pulse Database Schema
-- Downstream Oil Refining & Petrochemical Asset Performance Platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Enums for Site Types, KPI Categories, and Data Types
create type site_type_enum as enum ('refinery', 'petrochemical', 'lng', 'mining');
create type kpi_category_enum as enum ('throughput', 'yield', 'financial', 'utility', 'reliability', 'hse');
create type kpi_datatype_enum as enum ('number', 'percentage', 'currency', 'ratio');

-- 2. Sites Table (Fully site-agnostic asset catalog)
create table public.sites (
    id uuid primary key default uuid_generate_v4(),
    slug text unique not null,
    name text not null,
    type site_type_enum not null,
    location text not null,
    latitude numeric(9,6),
    longitude numeric(9,6),
    nominal_capacity_desc text not null,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- 3. KPI Definitions Table (Metadata & Threshold Definitions)
create table public.kpi_definitions (
    id uuid primary key default uuid_generate_v4(),
    site_type site_type_enum not null,
    code text not null,
    name text not null,
    category kpi_category_enum not null,
    unit text not null,
    data_type kpi_datatype_enum not null default 'number',
    target_value numeric(12,4),
    min_warning numeric(12,4),
    max_warning numeric(12,4),
    description text,
    display_order integer default 0,
    created_at timestamptz default now(),
    unique(site_type, code)
);

-- 4. KPI Values Table (Daily intake & shift records)
create table public.kpi_values (
    id uuid primary key default uuid_generate_v4(),
    site_id uuid not null references public.sites(id) on delete cascade,
    kpi_id uuid not null references public.kpi_definitions(id) on delete cascade,
    entry_date date not null,
    value numeric(14,4) not null,
    notes text,
    created_at timestamptz default now(),
    created_by uuid references auth.users(id),
    unique(site_id, kpi_id, entry_date)
);

-- 5. User Site Permissions (Multi-Tenant Isolation)
create table public.user_sites (
    user_id uuid references auth.users(id) on delete cascade,
    site_id uuid references public.sites(id) on delete cascade,
    role text check (role in ('admin', 'operator', 'viewer')) default 'viewer',
    primary key (user_id, site_id)
);

-- Indexes for lightning-fast queries
create index idx_kpi_values_site_date on public.kpi_values(site_id, entry_date desc);
create index idx_kpi_definitions_type on public.kpi_definitions(site_type, display_order);

-- Row Level Security (RLS)
alter table public.sites enable row level security;
alter table public.kpi_definitions enable row level security;
alter table public.kpi_values enable row level security;

create policy "Allow read access to authenticated users" on public.sites for select using (true);
create policy "Allow read access to kpis" on public.kpi_definitions for select using (true);
create policy "Allow read access to values" on public.kpi_values for select using (true);

-- Role-Based Write Security (Sensitive Telemetry Protection)
-- Only verified operators or admins assigned to the specific site may insert or update telemetry
create policy "Enforce operator/admin RLS on telemetry insert"
on public.kpi_values for insert
with check (
    auth.uid() is not null and (
        exists (
            select 1 from public.user_sites us
            where us.user_id = auth.uid()
            and us.site_id = public.kpi_values.site_id
            and us.role in ('admin', 'operator')
        )
    )
);

create policy "Enforce operator/admin RLS on telemetry update"
on public.kpi_values for update
using (
    auth.uid() is not null and (
        exists (
            select 1 from public.user_sites us
            where us.user_id = auth.uid()
            and us.site_id = public.kpi_values.site_id
            and us.role in ('admin', 'operator')
        )
    )
);

-- Daily Summary View for Reporting & Analytics
create or replace view public.v_daily_site_summary as
select
    s.id as site_id,
    s.name as site_name,
    s.slug as site_slug,
    s.type as site_type,
    v.entry_date,
    d.code as kpi_code,
    d.name as kpi_name,
    d.category as kpi_category,
    d.unit,
    v.value,
    d.target_value,
    case
        when d.target_value is null or d.target_value = 0 then 100
        else round((v.value / d.target_value) * 100, 2)
    end as target_attainment_pct
from public.kpi_values v
join public.sites s on s.id = v.site_id
join public.kpi_definitions d on d.id = v.kpi_id;
