-- LakeKPI / Maracaibo Pulse Industrial Seed Data
-- Venezuelan Assets: Bajo Grande Refinery & El Tablazo Petrochemical Complex

-- 1. Insert Target Facilities
insert into public.sites (slug, name, type, location, latitude, longitude, nominal_capacity_desc) values
('bajo-grande', 'Bajo Grande Refinery', 'refinery', 'San Francisco / Lake Maracaibo West Shore, Zulia', 10.5050, -71.6425, '16,000 bpd Asphalt & Distillation'),
('el-tablazo', 'Complejo Petroquímico Ana María Campos (El Tablazo)', 'petrochemical', 'Los Puertos de Altagracia / Lake Maracaibo East Shore, Zulia', 10.7483, -71.5292, '1.2M MT/yr Olefins & Fertilizers');

-- 2. Insert KPI Definitions for Refinery
insert into public.kpi_definitions (site_type, code, name, category, unit, data_type, target_value, min_warning, max_warning, display_order) values
('refinery', 'CRUDE_THROUGHPUT', 'Crude Oil Throughput', 'throughput', 'bpd', 'number', 15500.0, 12000.0, 16500.0, 1),
('refinery', 'VACUUM_YIELD', 'Vacuum Bottoms Yield (Asphalt Base)', 'yield', '%', 'percentage', 62.5, 55.0, 70.0, 2),
('refinery', 'ASPHALT_PROD', 'Asphalt Tonnage Produced', 'throughput', 'MT/day', 'number', 1450.0, 1000.0, 1600.0, 3),
('refinery', 'API_GRAVITY', 'Feedstock Crude API Gravity', 'yield', '°API', 'number', 12.5, 10.0, 15.0, 4),
('refinery', 'ENERGY_INTENSITY', 'Specific Fuel & Energy Consumption', 'utility', 'GJ/bbl', 'number', 0.32, 0.25, 0.45, 5),
('refinery', 'EQUIPMENT_UPTIME', 'Asset Operational Availability', 'reliability', '%', 'percentage', 96.5, 90.0, 99.9, 6);

-- 3. Insert KPI Definitions for Petrochemical Complex
insert into public.kpi_definitions (site_type, code, name, category, unit, data_type, target_value, min_warning, max_warning, display_order) values
('petrochemical', 'ETHYLENE_TONS', 'Ethylene Production', 'throughput', 'MT/day', 'number', 1600.0, 1200.0, 1800.0, 1),
('petrochemical', 'PE_YIELD', 'Polyethylene Conversion Rate', 'yield', '%', 'percentage', 94.0, 88.0, 98.0, 2),
('petrochemical', 'UREA_FERTILIZER', 'Urea / Fertilizer Tonnage', 'throughput', 'MT/day', 'number', 2200.0, 1500.0, 2500.0, 3),
('petrochemical', 'CHLORINE_CAUSTIC', 'Chlorine / Caustic Soda Output', 'throughput', 'MT/day', 'number', 450.0, 300.0, 500.0, 4),
('petrochemical', 'STEAM_INTENSITY', 'High-Pressure Steam Consumption', 'utility', 'GJ/MT', 'number', 4.10, 3.50, 5.20, 5),
('petrochemical', 'EQUIPMENT_UPTIME', 'Plant Utilization Rate', 'reliability', '%', 'percentage', 94.0, 85.0, 99.0, 6);

-- 4. Generate 30 Days of Historical Data
with dates as (
    select generate_series(
        current_date - interval '30 days',
        current_date,
        interval '1 day'
    )::date as d
),
site_data as (
    select id as site_id, slug, type from public.sites
),
kpis as (
    select id as kpi_id, site_type, code, target_value from public.kpi_definitions
)
insert into public.kpi_values (site_id, kpi_id, entry_date, value)
select
    sd.site_id,
    k.kpi_id,
    dt.d,
    case
        when k.code = 'CRUDE_THROUGHPUT' then round(14000 + (random() * 2000 - 500)::numeric, 0)
        when k.code = 'VACUUM_YIELD' then round(60 + (random() * 6 - 2)::numeric, 2)
        when k.code = 'ASPHALT_PROD' then round(1350 + (random() * 200 - 50)::numeric, 0)
        when k.code = 'API_GRAVITY' then round(12.1 + (random() * 0.8 - 0.4)::numeric, 1)
        when k.code = 'ENERGY_INTENSITY' then round(0.31 + (random() * 0.05 - 0.02)::numeric, 3)
        when k.code = 'ETHYLENE_TONS' then round(1520 + (random() * 180 - 60)::numeric, 0)
        when k.code = 'PE_YIELD' then round(93.2 + (random() * 3.5 - 1.0)::numeric, 2)
        when k.code = 'UREA_FERTILIZER' then round(2100 + (random() * 300 - 100)::numeric, 0)
        when k.code = 'CHLORINE_CAUSTIC' then round(430 + (random() * 40 - 15)::numeric, 0)
        when k.code = 'STEAM_INTENSITY' then round(4.05 + (random() * 0.4 - 0.15)::numeric, 2)
        when k.code = 'EQUIPMENT_UPTIME' then round(95.0 + (random() * 4.0 - 1.5)::numeric, 1)
        else 100.0
    end as value
from dates dt
cross join site_data sd
join kpis k on k.site_type = sd.type;
