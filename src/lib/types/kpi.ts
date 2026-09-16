export type SiteType = 'refinery' | 'petrochemical' | 'lng' | 'mining';
export type KpiCategory = 'throughput' | 'yield' | 'financial' | 'utility' | 'reliability' | 'hse';
export type KpiDataType = 'number' | 'percentage' | 'currency' | 'ratio';

export interface Site {
    id: string;
    slug: string;
    name: string;
    type: SiteType;
    location: string;
    latitude: number;
    longitude: number;
    nominal_capacity_desc: string;
    is_active: boolean;
    created_at?: string;
}

export interface KpiDefinition {
    id: string;
    site_type: SiteType;
    code: string;
    name: string;
    category: KpiCategory;
    unit: string;
    data_type: KpiDataType;
    target_value: number;
    min_warning: number;
    max_warning: number;
    description?: string;
    display_order: number;
}

export interface KpiValue {
    id: string;
    site_id: string;
    kpi_id: string;
    entry_date: string;
    value: number;
    notes?: string;
    created_at?: string;
}

export interface SiteSummaryRow {
    site_id: string;
    site_name: string;
    site_slug: string;
    site_type: SiteType;
    entry_date: string;
    kpi_code: string;
    kpi_name: string;
    kpi_category: KpiCategory;
    unit: string;
    value: number;
    target_value: number;
    target_attainment_pct: number;
    min_warning?: number;
    max_warning?: number;
}

export interface MetricWithHistory {
    definition: KpiDefinition;
    latestValue: number;
    targetValue: number;
    targetAttainmentPct: number;
    previousValue?: number;
    delta?: number;
    deltaPct?: number;
    status: 'optimal' | 'warning' | 'alert';
    history: { date: string; value: number }[];
}

export interface TacticalMaintenanceMetrics {
    plannedVsReactiveRatio: number; // e.g. 78% planned, 22% reactive
    mtbfHours: number; // Mean Time Between Failures in hours (e.g. 740 hrs)
    equipmentUtilizationPct: number; // e.g. 92.4%
    operationalAvailabilityPct: number; // e.g. 96.8%
    openWorkOrders: number;
    preventativeCompliancePct: number;
}

export interface ExecutiveShiftBrief {
    generatedAt: string;
    shift: string; // Shift 1 (07:00 - 15:00), Shift 2, etc.
    superintendent: string;
    overallStatus: 'STABLE' | 'DEGRADED' | 'EXCEPTIONAL' | 'ALERT';
    headline: string;
    summaryParagraph: string;
    highlights: string[];
    deviationsAndRootCauses: {
        metric: string;
        deviation: string;
        rootCause: string;
        impact: string;
    }[];
    handoverDirectives: string[];
    hseNotice: string;
}
