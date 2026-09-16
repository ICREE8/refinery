import type { Site, KpiDefinition, SiteSummaryRow, TacticalMaintenanceMetrics } from './types/kpi';

export const INITIAL_SITES: Site[] = [
    {
        id: '11111111-1111-4111-8111-111111111111',
        slug: 'bajo-grande',
        name: 'Bajo Grande Refinery',
        type: 'refinery',
        location: 'San Francisco / Lake Maracaibo West Shore, Zulia',
        latitude: 10.5050,
        longitude: -71.6425,
        nominal_capacity_desc: '16,000 bpd Asphalt & Distillation',
        is_active: true
    },
    {
        id: '22222222-2222-4222-8222-222222222222',
        slug: 'el-tablazo',
        name: 'Complejo Petroquímico Ana María Campos (El Tablazo)',
        type: 'petrochemical',
        location: 'Los Puertos de Altagracia / Lake Maracaibo East Shore, Zulia',
        latitude: 10.7483,
        longitude: -71.5292,
        nominal_capacity_desc: '1.2M MT/yr Olefins & Fertilizers',
        is_active: true
    }
];

export const INITIAL_KPI_DEFINITIONS: KpiDefinition[] = [
    // Refinery KPIs (Bajo Grande)
    {
        id: 'kpi-ref-1',
        site_type: 'refinery',
        code: 'CRUDE_THROUGHPUT',
        name: 'Crude Oil Throughput',
        category: 'throughput',
        unit: 'bpd',
        data_type: 'number',
        target_value: 15500.0,
        min_warning: 12000.0,
        max_warning: 16500.0,
        description: 'Daily gross atmospheric distillation charge (Boscan & heavy crude blend)',
        display_order: 1
    },
    {
        id: 'kpi-ref-2',
        site_type: 'refinery',
        code: 'VACUUM_YIELD',
        name: 'Vacuum Bottoms Yield (Asphalt Base)',
        category: 'yield',
        unit: '%',
        data_type: 'percentage',
        target_value: 62.5,
        min_warning: 55.0,
        max_warning: 70.0,
        description: 'Residuum yield from vacuum flasher tower for penetration grade paving asphalt',
        display_order: 2
    },
    {
        id: 'kpi-ref-3',
        site_type: 'refinery',
        code: 'ASPHALT_PROD',
        name: 'Asphalt Tonnage Produced',
        category: 'throughput',
        unit: 'MT/day',
        data_type: 'number',
        target_value: 1450.0,
        min_warning: 1000.0,
        max_warning: 1600.0,
        description: 'Net finished commercial asphalt run down to Bajo Grande marine terminal tanks',
        display_order: 3
    },
    {
        id: 'kpi-ref-4',
        site_type: 'refinery',
        code: 'API_GRAVITY',
        name: 'Feedstock Crude API Gravity',
        category: 'yield',
        unit: '°API',
        data_type: 'number',
        target_value: 12.5,
        min_warning: 10.0,
        max_warning: 15.0,
        description: 'Weighted crude density feed (Boscan 10.2° API heavy blend)',
        display_order: 4
    },
    {
        id: 'kpi-ref-5',
        site_type: 'refinery',
        code: 'ENERGY_INTENSITY',
        name: 'Specific Fuel & Energy Consumption',
        category: 'utility',
        unit: 'GJ/bbl',
        data_type: 'number',
        target_value: 0.32,
        min_warning: 0.25,
        max_warning: 0.45,
        description: 'Fired heaters and steam electrical consumption per barrel processed',
        display_order: 5
    },
    {
        id: 'kpi-ref-6',
        site_type: 'refinery',
        code: 'EQUIPMENT_UPTIME',
        name: 'Asset Operational Availability',
        category: 'reliability',
        unit: '%',
        data_type: 'percentage',
        target_value: 96.5,
        min_warning: 90.0,
        max_warning: 99.9,
        description: 'Operational availability of primary crude heaters and vacuum distillation columns',
        display_order: 6
    },

    // Petrochemical KPIs (El Tablazo)
    {
        id: 'kpi-pet-1',
        site_type: 'petrochemical',
        code: 'ETHYLENE_TONS',
        name: 'Ethylene Production',
        category: 'throughput',
        unit: 'MT/day',
        data_type: 'number',
        target_value: 1600.0,
        min_warning: 1200.0,
        max_warning: 1800.0,
        description: 'High-purity polymer grade ethylene from steam cracker units I & II',
        display_order: 1
    },
    {
        id: 'kpi-pet-2',
        site_type: 'petrochemical',
        code: 'PE_YIELD',
        name: 'Polyethylene Conversion Rate',
        category: 'yield',
        unit: '%',
        data_type: 'percentage',
        target_value: 94.0,
        min_warning: 88.0,
        max_warning: 98.0,
        description: 'HDPE / LLDPE polymer conversion yield efficiency',
        display_order: 2
    },
    {
        id: 'kpi-pet-3',
        site_type: 'petrochemical',
        code: 'UREA_FERTILIZER',
        name: 'Urea / Fertilizer Tonnage',
        category: 'throughput',
        unit: 'MT/day',
        data_type: 'number',
        target_value: 2200.0,
        min_warning: 1500.0,
        max_warning: 2500.0,
        description: 'Granular urea agricultural fertilizer production from ammonia synthesis loop',
        display_order: 3
    },
    {
        id: 'kpi-pet-4',
        site_type: 'petrochemical',
        code: 'CHLORINE_CAUSTIC',
        name: 'Chlorine / Caustic Soda Output',
        category: 'throughput',
        unit: 'MT/day',
        data_type: 'number',
        target_value: 450.0,
        min_warning: 300.0,
        max_warning: 500.0,
        description: 'Diaphragm chlor-alkali electrolysis output',
        display_order: 4
    },
    {
        id: 'kpi-pet-5',
        site_type: 'petrochemical',
        code: 'STEAM_INTENSITY',
        name: 'High-Pressure Steam Consumption',
        category: 'utility',
        unit: 'GJ/MT',
        data_type: 'number',
        target_value: 4.10,
        min_warning: 3.50,
        max_warning: 5.20,
        description: 'Utility high pressure steam consumed per metric ton of polymer output',
        display_order: 5
    },
    {
        id: 'kpi-pet-6',
        site_type: 'petrochemical',
        code: 'EQUIPMENT_UPTIME',
        name: 'Plant Utilization Rate',
        category: 'reliability',
        unit: '%',
        data_type: 'percentage',
        target_value: 94.0,
        min_warning: 85.0,
        max_warning: 99.0,
        description: 'Overall operating factor across Olefins, Chlor-Alkali, and Fertilizer trains',
        display_order: 6
    }
];

// Helper to generate 30 days of data deterministically
function generateHistoricalSeedData(): SiteSummaryRow[] {
    const rows: SiteSummaryRow[] = [];
    const now = new Date();

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
        const d = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
        const entry_date = d.toISOString().split('T')[0];

        // Pseudo-random pseudo-deterministic variation based on day
        const seed = Math.sin(dayOffset * 11.7) * 0.5 + 0.5;

        for (const site of INITIAL_SITES) {
            const defs = INITIAL_KPI_DEFINITIONS.filter(def => def.site_type === site.type);

            for (const def of defs) {
                let val = def.target_value;

                if (def.code === 'CRUDE_THROUGHPUT') {
                    // Under slight turnaround in mid-month
                    const dip = dayOffset >= 12 && dayOffset <= 15 ? -2500 : 0;
                    val = Math.round(14200 + seed * 1600 + dip);
                } else if (def.code === 'VACUUM_YIELD') {
                    val = Number((60.5 + seed * 4.2).toFixed(2));
                } else if (def.code === 'ASPHALT_PROD') {
                    val = Math.round(1320 + seed * 190);
                } else if (def.code === 'API_GRAVITY') {
                    val = Number((12.1 + (seed - 0.5) * 0.8).toFixed(1));
                } else if (def.code === 'ENERGY_INTENSITY') {
                    val = Number((0.31 + seed * 0.04).toFixed(3));
                } else if (def.code === 'ETHYLENE_TONS') {
                    val = Math.round(1510 + seed * 160);
                } else if (def.code === 'PE_YIELD') {
                    val = Number((92.8 + seed * 2.8).toFixed(2));
                } else if (def.code === 'UREA_FERTILIZER') {
                    val = Math.round(2080 + seed * 260);
                } else if (def.code === 'CHLORINE_CAUSTIC') {
                    val = Math.round(425 + seed * 38);
                } else if (def.code === 'STEAM_INTENSITY') {
                    val = Number((4.02 + seed * 0.35).toFixed(2));
                } else if (def.code === 'EQUIPMENT_UPTIME') {
                    val = Number((94.5 + seed * 3.5).toFixed(1));
                }

                const attainment = def.target_value > 0
                    ? Number(((val / def.target_value) * 100).toFixed(2))
                    : 100;

                rows.push({
                    site_id: site.id,
                    site_name: site.name,
                    site_slug: site.slug,
                    site_type: site.type,
                    entry_date,
                    kpi_code: def.code,
                    kpi_name: def.name,
                    kpi_category: def.category,
                    unit: def.unit,
                    value: val,
                    target_value: def.target_value,
                    target_attainment_pct: attainment,
                    min_warning: def.min_warning,
                    max_warning: def.max_warning
                });
            }
        }
    }

    return rows;
}

// In-memory persistent rows for runtime additions (manual logs / CSV intake)
let liveRows: SiteSummaryRow[] = generateHistoricalSeedData();

export function getInMemorySummaryRows(): SiteSummaryRow[] {
    return [...liveRows];
}

export function insertInMemoryKpiValues(newRows: SiteSummaryRow[]) {
    liveRows = [...liveRows, ...newRows];
}

export const SITE_MAINTENANCE_METRICS: Record<string, TacticalMaintenanceMetrics> = {
    'bajo-grande': {
        plannedVsReactiveRatio: 81.5, // 81.5% planned vs 18.5% reactive
        mtbfHours: 820,
        equipmentUtilizationPct: 94.2,
        operationalAvailabilityPct: 96.8,
        openWorkOrders: 14,
        preventativeCompliancePct: 98.1
    },
    'el-tablazo': {
        plannedVsReactiveRatio: 76.0, // 76% planned vs 24% reactive
        mtbfHours: 695,
        equipmentUtilizationPct: 91.8,
        operationalAvailabilityPct: 94.5,
        openWorkOrders: 29,
        preventativeCompliancePct: 92.4
    }
};
