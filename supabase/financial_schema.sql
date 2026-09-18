-- LakeKPI Citizen Financial Audit & Hydrocarbon Ledger Extension
-- First-Principles "Find The Money" Oversight Engine

-- 1. Extend KPI categories with 'financial_audit' if not already present
alter type kpi_category_enum add value if not exists 'financial_audit';

-- 2. Financial ledger table for public citizen audit trail
create table if not exists public.financial_ledgers (
    id uuid primary key default uuid_generate_v4(),
    site_id uuid not null references public.sites(id) on delete cascade,
    fiscal_date date not null,
    gross_volume_produced numeric(14,2) not null,   -- bpd (refinery) or MT (petrochemical)
    unit_measure text not null check (unit_measure in ('bpd', 'MT')),
    realized_price_per_unit numeric(10,2) not null, -- realized basket $/bbl or $/MT
    direct_opex_per_unit numeric(10,2) not null,    -- direct lifting/refining/cracking cost $/unit
    gross_revenue_usd numeric(16,2) not null,       -- gross physical value
    total_opex_usd numeric(16,2) not null,          -- total direct operating expense
    net_margin_usd numeric(16,2) not null,          -- gross revenue minus total opex
    
    -- Cash Settlement & DSO Speed ("Find The Money")
    days_sales_outstanding integer not null default 14, -- payment velocity in days
    settled_cash_usd numeric(16,2) not null default 0,  -- escrow / bank confirmed receipts
    pending_receivables_usd numeric(16,2) not null default 0, -- unsettled cargo receivables
    
    -- Unaccounted Leakage / Flare / Shrinkage Loss
    shrinkage_loss_usd numeric(14,2) not null default 0, -- unaccounted volume loss converted to $
    
    -- 100% Reconciled Civic Value Distribution (% allocation of Net Margin)
    gov_royalty_pct numeric(5,2) not null default 30.00,        -- Sovereign Hydrocarbon Royalty
    infrastructure_fund_pct numeric(5,2) not null default 25.00,-- Lake Sanitation & Grid Stability
    community_dividend_pct numeric(5,2) not null default 15.00, -- Direct Citizen Dividend
    operational_reserve_pct numeric(5,2) not null default 30.00,-- Maintenance & Strategic Capital Reserve
    
    notes text,
    created_at timestamptz default now(),
    unique(site_id, fiscal_date)
);

-- Indexes for time-series financial audit queries
create index if not exists idx_financial_ledgers_site_date on public.financial_ledgers(site_id, fiscal_date desc);

-- 3. Row Level Security (RLS) - Transparent Citizen Read Access
alter table public.financial_ledgers enable row level security;

create policy "Allow read access to public ledger" 
    on public.financial_ledgers for select 
    using (true);

create policy "Allow insert to audit ledger" 
    on public.financial_ledgers for insert 
    with check (true);

-- 4. Analytical View for Executive Basin-Wide Consolidation
create or replace view public.v_financial_audit_summary as
select 
    fl.id,
    fl.site_id,
    s.name as site_name,
    s.slug as site_slug,
    s.type as site_type,
    fl.fiscal_date,
    fl.gross_volume_produced,
    fl.unit_measure,
    fl.realized_price_per_unit,
    fl.direct_opex_per_unit,
    fl.gross_revenue_usd,
    fl.total_opex_usd,
    fl.net_margin_usd,
    fl.days_sales_outstanding,
    fl.settled_cash_usd,
    fl.pending_receivables_usd,
    fl.shrinkage_loss_usd,
    fl.gov_royalty_pct,
    fl.infrastructure_fund_pct,
    fl.community_dividend_pct,
    fl.operational_reserve_pct,
    round((fl.net_margin_usd * (fl.gov_royalty_pct / 100.0)), 2) as gov_royalty_usd,
    round((fl.net_margin_usd * (fl.infrastructure_fund_pct / 100.0)), 2) as infrastructure_fund_usd,
    round((fl.net_margin_usd * (fl.community_dividend_pct / 100.0)), 2) as community_dividend_usd,
    round((fl.net_margin_usd * (fl.operational_reserve_pct / 100.0)), 2) as operational_reserve_usd
from public.financial_ledgers fl
join public.sites s on s.id = fl.site_id;
