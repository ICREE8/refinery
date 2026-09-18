import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Site, SiteSummaryRow, FinancialLedgerRecord } from '$lib/types/kpi';
import { getInMemoryFinancialLedgers } from '$lib/mockData';

export const load: PageLoad = async ({ params, parent }) => {
    const { siteSlug } = params;

    // Reuse cached parent layout sites list to eliminate 2 redundant roundtrips
    const parentData = await parent();
    const allSites = (parentData.sites || []) as Site[];
    const site = allSites.find(s => s.slug === siteSlug);

    if (!site) {
        throw error(404, `Facility "${siteSlug}" not found.`);
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Single consolidated query for both history and latest per-KPI state (eliminates redundant DB query)
    const { data: history } = await supabase
        .from('v_daily_site_summary')
        .select('*')
        .eq('site_slug', siteSlug)
        .gte('entry_date', thirtyDaysAgo)
        .order('entry_date', { ascending: true });

    const historyRows = (history || []) as SiteSummaryRow[];
    const historyMap: Record<string, { date: string; value: number }[]> = {};
    const latestKpiMap: Record<string, SiteSummaryRow> = {};

    for (const row of historyRows) {
        if (!historyMap[row.kpi_code]) {
            historyMap[row.kpi_code] = [];
        }
        historyMap[row.kpi_code].push({ date: row.entry_date, value: row.value });

        // Maintain latest entry per KPI metric code
        if (!latestKpiMap[row.kpi_code] || row.entry_date >= latestKpiMap[row.kpi_code].entry_date) {
            latestKpiMap[row.kpi_code] = row;
        }
    }

    const latestKpis = Object.values(latestKpiMap);

    // Load financial ledgers for this site
    const { data: rawLedgers } = await supabase
        .from('financial_ledgers')
        .select('*')
        .order('fiscal_date', { ascending: false });

    const allLedgers = (rawLedgers && rawLedgers.length > 0 ? rawLedgers : getInMemoryFinancialLedgers()) as FinancialLedgerRecord[];
    const siteLedgers = allLedgers.filter(l => l.site_id === site.id || l.site_slug === siteSlug);

    return {
        site,
        latestKpis: (latestKpis || []) as SiteSummaryRow[],
        history: (history || []) as SiteSummaryRow[],
        historyMap,
        allSites,
        financialLedgers: (siteLedgers.length > 0 ? siteLedgers : allLedgers) as FinancialLedgerRecord[]
    };
};
