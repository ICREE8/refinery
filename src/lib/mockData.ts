import type { 
    Site, 
    KpiDefinition, 
    SiteSummaryRow, 
    TacticalMaintenanceMetrics,
    FinancialLedgerRecord,
    BasinFinancialSummary
} from './types/kpi';

export const INITIAL_SITES: Site[] = [
    {
        id: '11111111-1111-4111-8111-111111111111',
        slug: 'bajo-grande',
        name: 'Refinería Bajo Grande (Petróleo Pesado y Asfalto)',
        type: 'refinery',
        location: 'San Francisco / Costa Occidental del Lago de Maracaibo, Zulia',
        latitude: 10.5050,
        longitude: -71.6425,
        nominal_capacity_desc: '16.000 bpd Destilación y Asfalto',
        is_active: true
    },
    {
        id: '22222222-2222-4222-8222-222222222222',
        slug: 'el-tablazo',
        name: 'Complejo Petroquímico Ana María Campos - El Tablazo (Olefinas y Fertilizantes)',
        type: 'petrochemical',
        location: 'Los Puertos de Altagracia / Costa Oriental del Lago de Maracaibo, Zulia',
        latitude: 10.7483,
        longitude: -71.5292,
        nominal_capacity_desc: '1.2M TM/año Olefinas y Fertilizantes',
        is_active: true
    }
];

export const INITIAL_KPI_DEFINITIONS: KpiDefinition[] = [
    // KPIs de Refinería (Bajo Grande)
    {
        id: 'kpi-ref-1',
        site_type: 'refinery',
        code: 'CRUDE_THROUGHPUT',
        name: 'Carga de Crudo Atmosférico',
        category: 'throughput',
        unit: 'bpd',
        data_type: 'number',
        target_value: 15650.0,
        min_warning: 12000.0,
        max_warning: 16500.0,
        description: 'Carga bruta diaria a destilación atmosférica (mezcla de crudo pesado Boscán)',
        display_order: 1
    },
    {
        id: 'kpi-ref-2',
        site_type: 'refinery',
        code: 'VACUUM_YIELD',
        name: 'Rendimiento Fondos de Vacío (Base Asfalto)',
        category: 'yield',
        unit: '%',
        data_type: 'percentage',
        target_value: 63.1,
        min_warning: 55.0,
        max_warning: 70.0,
        description: 'Rendimiento de residuo en torre de vacío para asfalto de pavimentación',
        display_order: 2
    },
    {
        id: 'kpi-ref-3',
        site_type: 'refinery',
        code: 'ASPHALT_PROD',
        name: 'Producción de Asfalto Líquido (AC-20)',
        category: 'throughput',
        unit: 'TM/día',
        data_type: 'number',
        target_value: 1460.0,
        min_warning: 1000.0,
        max_warning: 1600.0,
        description: 'Asfalto terminado despachado a tanques de almacenamiento del terminal marino',
        display_order: 3
    },
    {
        id: 'kpi-ref-4',
        site_type: 'refinery',
        code: 'API_GRAVITY',
        name: 'Gravedad API del Crudo de Carga',
        category: 'yield',
        unit: '°API',
        data_type: 'number',
        target_value: 12.4,
        min_warning: 10.0,
        max_warning: 15.0,
        description: 'Densidad del crudo de alimentación (mezcla pesada Boscán)',
        display_order: 4
    },
    {
        id: 'kpi-ref-5',
        site_type: 'refinery',
        code: 'ENERGY_INTENSITY',
        name: 'Consumo Específico de Energía y Combustible',
        category: 'utility',
        unit: 'GJ/barril',
        data_type: 'number',
        target_value: 0.32,
        min_warning: 0.25,
        max_warning: 0.45,
        description: 'Consumo térmico en hornos y electricidad por barril refinado',
        display_order: 5
    },
    {
        id: 'kpi-ref-6',
        site_type: 'refinery',
        code: 'EQUIPMENT_UPTIME',
        name: 'Disponibilidad Operacional de Planta',
        category: 'reliability',
        unit: '%',
        data_type: 'percentage',
        target_value: 96.8,
        min_warning: 90.0,
        max_warning: 99.9,
        description: 'Disponibilidad en línea de hornos de crudo y torre de vacío',
        display_order: 6
    },

    // KPIs Petroquímicos (El Tablazo)
    {
        id: 'kpi-pet-1',
        site_type: 'petrochemical',
        code: 'ETHYLENE_TONS',
        name: 'Producción de Etileno Grado Polímero',
        category: 'throughput',
        unit: 'TM/día',
        data_type: 'number',
        target_value: 1620.0,
        min_warning: 1200.0,
        max_warning: 1800.0,
        description: 'Etileno de alta pureza proveniente de trenes de craqueo con vapor I y II',
        display_order: 1
    },
    {
        id: 'kpi-pet-2',
        site_type: 'petrochemical',
        code: 'PE_YIELD',
        name: 'Tasa de Conversión a Polietileno (PEAD/PEBD)',
        category: 'yield',
        unit: '%',
        data_type: 'percentage',
        target_value: 94.5,
        min_warning: 88.0,
        max_warning: 98.0,
        description: 'Eficiencia de conversión de polímero en lecho fluidizado',
        display_order: 2
    },
    {
        id: 'kpi-pet-3',
        site_type: 'petrochemical',
        code: 'UREA_FERTILIZER',
        name: 'Producción de Urea y Fertilizantes Agrícolas',
        category: 'throughput',
        unit: 'TM/día',
        data_type: 'number',
        target_value: 2250.0,
        min_warning: 1500.0,
        max_warning: 2500.0,
        description: 'Fertilizante granular a partir de síntesis de amoníaco',
        display_order: 3
    },
    {
        id: 'kpi-pet-4',
        site_type: 'petrochemical',
        code: 'CHLORINE_CAUSTIC',
        name: 'Producción de Cloro y Soda Cáustica',
        category: 'throughput',
        unit: 'TM/día',
        data_type: 'number',
        target_value: 450.0,
        min_warning: 300.0,
        max_warning: 500.0,
        description: 'Producción electroquímica en sala de celdas cloro-soda',
        display_order: 4
    },
    {
        id: 'kpi-pet-5',
        site_type: 'petrochemical',
        code: 'STEAM_INTENSITY',
        name: 'Consumo de Vapor de Alta Presión',
        category: 'utility',
        unit: 'GJ/TM',
        data_type: 'number',
        target_value: 3.95,
        min_warning: 3.50,
        max_warning: 5.20,
        description: 'Vapor industrial consumido por tonelada métrica sintetizada',
        display_order: 5
    },
    {
        id: 'kpi-pet-6',
        site_type: 'petrochemical',
        code: 'EQUIPMENT_UPTIME',
        name: 'Tasa de Utilización de Planta Petroquímica',
        category: 'reliability',
        unit: '%',
        data_type: 'percentage',
        target_value: 94.2,
        min_warning: 85.0,
        max_warning: 99.5,
        description: 'Disponibilidad de reactores, compresores de gas y servicios industriales',
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

// Generate 30 days of realistic financial ledger records matching financial_schema.sql
function generateHistoricalFinancialLedgers(): FinancialLedgerRecord[] {
    const ledgers: FinancialLedgerRecord[] = [];
    const now = new Date();

    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
        const d = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
        const fiscal_date = d.toISOString().split('T')[0];
        const seed = Math.sin(dayOffset * 7.9) * 0.5 + 0.5;

        // 1. Bajo Grande (Heavy Crude / Asphalt Refining)
        const isLatest = dayOffset === 0;
        const bgVolume = isLatest ? 15650 : Math.round(14850 + seed * 950);
        const bgPrice = isLatest ? 68.50 : Number((67.40 + seed * 2.80).toFixed(2));
        const bgOpexPerUnit = isLatest ? 23.50 : Number((22.80 + seed * 1.30).toFixed(2));
        const bgGrossRev = isLatest ? 1072025 : Math.round(bgVolume * bgPrice);
        const bgTotalOpex = isLatest ? 367775 : Math.round(bgVolume * bgOpexPerUnit);
        const bgNetMargin = bgGrossRev - bgTotalOpex;
        const bgDso = isLatest ? 14 : Math.round(13 + seed * 3);
        const bgSettledCash = isLatest ? 879060 : Math.round(bgGrossRev * 0.82);
        const bgPending = isLatest ? 192965 : bgGrossRev - bgSettledCash;
        const bgShrinkage = isLatest ? 18450 : Math.round(bgGrossRev * 0.017);

        ledgers.push({
            id: `fin-bg-${fiscal_date}`,
            site_id: '11111111-1111-4111-8111-111111111111',
            site_slug: 'bajo-grande',
            site_name: 'Refinería Bajo Grande (Petróleo Pesado y Asfalto)',
            fiscal_date,
            gross_volume_produced: bgVolume,
            unit_measure: 'bpd',
            realized_price_per_unit: bgPrice,
            direct_opex_per_unit: bgOpexPerUnit,
            gross_revenue_usd: bgGrossRev,
            total_opex_usd: bgTotalOpex,
            net_margin_usd: bgNetMargin,
            days_sales_outstanding: bgDso,
            settled_cash_usd: bgSettledCash,
            pending_receivables_usd: bgPending,
            shrinkage_loss_usd: bgShrinkage,
            gov_royalty_pct: 30.00,
            infrastructure_fund_pct: 25.00,
            community_dividend_pct: 15.00,
            operational_reserve_pct: 30.00,
            gov_royalty_usd: Math.round(bgNetMargin * 0.30),
            infrastructure_fund_usd: Math.round(bgNetMargin * 0.25),
            community_dividend_usd: Math.round(bgNetMargin * 0.15),
            operational_reserve_usd: Math.round(bgNetMargin * 0.30),
            notes: 'Corrida de crudo pesado Boscán y despacho de asfalto de penetración'
        });

        // 2. El Tablazo (Olefins, Polyethylene, Granular Urea)
        const tabVolume = isLatest ? 1020 : Math.round(1000 + seed * 80);
        const tabPrice = isLatest ? 3032.55 : Number((3000.00 + seed * 50.00).toFixed(2));
        const tabOpexPerUnit = isLatest ? 1196.00 : Number((1180.00 + seed * 30.00).toFixed(2));
        const tabGrossRev = isLatest ? 3093200 : Math.round(tabVolume * tabPrice);
        const tabTotalOpex = isLatest ? 1219920 : Math.round(tabVolume * tabOpexPerUnit);
        const tabNetMargin = tabGrossRev - tabTotalOpex;
        const tabDso = isLatest ? 14 : Math.round(14 + seed * 2);
        const tabSettledCash = isLatest ? 2536424 : Math.round(tabGrossRev * 0.82);
        const tabPending = isLatest ? 556776 : tabGrossRev - tabSettledCash;
        const tabShrinkage = isLatest ? 30049 : Math.round(tabGrossRev * 0.0097);

        ledgers.push({
            id: `fin-tab-${fiscal_date}`,
            site_id: '22222222-2222-4222-8222-222222222222',
            site_slug: 'el-tablazo',
            site_name: 'Complejo Petroquímico Ana María Campos - El Tablazo (Olefinas y Fertilizantes)',
            fiscal_date,
            gross_volume_produced: tabVolume,
            unit_measure: 'TM',
            realized_price_per_unit: tabPrice,
            direct_opex_per_unit: tabOpexPerUnit,
            gross_revenue_usd: tabGrossRev,
            total_opex_usd: tabTotalOpex,
            net_margin_usd: tabNetMargin,
            days_sales_outstanding: tabDso,
            settled_cash_usd: tabSettledCash,
            pending_receivables_usd: tabPending,
            shrinkage_loss_usd: tabShrinkage,
            gov_royalty_pct: 30.00,
            infrastructure_fund_pct: 25.00,
            community_dividend_pct: 15.00,
            operational_reserve_pct: 30.00,
            gov_royalty_usd: Math.round(tabNetMargin * 0.30),
            infrastructure_fund_usd: Math.round(tabNetMargin * 0.25),
            community_dividend_usd: Math.round(tabNetMargin * 0.15),
            operational_reserve_usd: Math.round(tabNetMargin * 0.30),
            notes: 'Producción de olefinas, polietileno y urea granulada para fertilizantes'
        });
    }

    return ledgers;
}

export const DEFAULT_BAJO_GRANDE_RECORD: FinancialLedgerRecord = {
    id: 'fin-bg-default',
    site_id: '11111111-1111-4111-8111-111111111111',
    site_slug: 'bajo-grande',
    site_name: 'Refinería Bajo Grande (Petróleo Pesado y Asfalto)',
    fiscal_date: '2026-09-17',
    gross_volume_produced: 15650,
    unit_measure: 'bpd',
    realized_price_per_unit: 68.50,
    direct_opex_per_unit: 23.50,
    gross_revenue_usd: 1072025,
    total_opex_usd: 367775,
    net_margin_usd: 704250,
    days_sales_outstanding: 14,
    settled_cash_usd: 879060,
    pending_receivables_usd: 192965,
    shrinkage_loss_usd: 18450,
    gov_royalty_pct: 30.00,
    infrastructure_fund_pct: 25.00,
    community_dividend_pct: 15.00,
    operational_reserve_pct: 30.00,
    gov_royalty_usd: 211275,
    infrastructure_fund_usd: 176063,
    community_dividend_usd: 105638,
    operational_reserve_usd: 211275,
    notes: 'Corrida de crudo pesado Boscán y despacho de asfalto de penetración'
};

export const DEFAULT_EL_TABLAZO_RECORD: FinancialLedgerRecord = {
    id: 'fin-tab-default',
    site_id: '22222222-2222-4222-8222-222222222222',
    site_slug: 'el-tablazo',
    site_name: 'Complejo Petroquímico Ana María Campos - El Tablazo (Olefinas y Fertilizantes)',
    fiscal_date: '2026-09-17',
    gross_volume_produced: 1020,
    unit_measure: 'TM',
    realized_price_per_unit: 3032.55,
    direct_opex_per_unit: 1196.00,
    gross_revenue_usd: 3093200,
    total_opex_usd: 1219920,
    net_margin_usd: 1873280,
    days_sales_outstanding: 14,
    settled_cash_usd: 2536424,
    pending_receivables_usd: 556776,
    shrinkage_loss_usd: 30049,
    gov_royalty_pct: 30.00,
    infrastructure_fund_pct: 25.00,
    community_dividend_pct: 15.00,
    operational_reserve_pct: 30.00,
    gov_royalty_usd: 561984,
    infrastructure_fund_usd: 468320,
    community_dividend_usd: 280992,
    operational_reserve_usd: 561984,
    notes: 'Producción de olefinas, polietileno y urea granulada para fertilizantes'
};

let liveFinancialLedgers: FinancialLedgerRecord[] = generateHistoricalFinancialLedgers();

export function getInMemoryFinancialLedgers(): FinancialLedgerRecord[] {
    return [...liveFinancialLedgers];
}

export function insertInMemoryFinancialLedger(record: FinancialLedgerRecord) {
    liveFinancialLedgers = [record, ...liveFinancialLedgers];
}

export function getLatestFinancialSummary(siteSlug?: string): BasinFinancialSummary {
    const all = getInMemoryFinancialLedgers();
    const filtered = siteSlug ? all.filter(r => r.site_slug === siteSlug) : all;
    
    // Group by latest date
    const latestDate = filtered.length > 0 
        ? filtered.reduce((max, r) => r.fiscal_date > max ? r.fiscal_date : max, filtered[0].fiscal_date)
        : new Date().toISOString().split('T')[0];

    const latestRecords = filtered.filter(r => r.fiscal_date === latestDate);

    const totalGrossRevenueUsd = latestRecords.reduce((acc, r) => acc + r.gross_revenue_usd, 0);
    const totalOpexUsd = latestRecords.reduce((acc, r) => acc + r.total_opex_usd, 0);
    const totalNetMarginUsd = latestRecords.reduce((acc, r) => acc + r.net_margin_usd, 0);
    const totalSettledCashUsd = latestRecords.reduce((acc, r) => acc + r.settled_cash_usd, 0);
    const totalPendingReceivablesUsd = latestRecords.reduce((acc, r) => acc + r.pending_receivables_usd, 0);
    const totalShrinkageLossUsd = latestRecords.reduce((acc, r) => acc + r.shrinkage_loss_usd, 0);
    
    const weightedDsoDays = latestRecords.length > 0 && totalGrossRevenueUsd > 0
        ? Number((latestRecords.reduce((acc, r) => acc + r.days_sales_outstanding * r.gross_revenue_usd, 0) / totalGrossRevenueUsd).toFixed(1))
        : 14.5;

    const bgRecord = latestRecords.find(r => r.unit_measure === 'bpd');
    const tabRecord = latestRecords.find(r => r.unit_measure === 'MT');

    return {
        totalGrossRevenueUsd,
        totalOpexUsd,
        totalNetMarginUsd,
        totalSettledCashUsd,
        totalPendingReceivablesUsd,
        totalShrinkageLossUsd,
        weightedDsoDays,
        refineryVolumeBpd: bgRecord ? bgRecord.gross_volume_produced : 0,
        petrochemicalVolumeMt: tabRecord ? tabRecord.gross_volume_produced : 0,
        infrastructureFundUsd: Math.round(totalNetMarginUsd * 0.25),
        govRoyaltyUsd: Math.round(totalNetMarginUsd * 0.30),
        communityDividendUsd: Math.round(totalNetMarginUsd * 0.15),
        operationalReserveUsd: Math.round(totalNetMarginUsd * 0.30),
        fiscalDate: latestDate
    };
}
