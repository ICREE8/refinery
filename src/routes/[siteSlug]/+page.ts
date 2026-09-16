import { supabase } from '$lib/supabaseClient';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Site, SiteSummaryRow } from '$lib/types/kpi';

export const load: PageLoad = async ({ params }) => {
    const { siteSlug } = params;

    const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('slug', siteSlug)
        .single();

    if (siteError || !site) {
        throw error(404, `Facility "${siteSlug}" not found.`);
    }

    const { data: latestKpis } = await supabase
        .from('v_daily_site_summary')
        .select('*')
        .eq('site_slug', siteSlug)
        .order('entry_date', { ascending: false })
        .limit(6);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: history } = await supabase
        .from('v_daily_site_summary')
        .select('*')
        .eq('site_slug', siteSlug)
        .gte('entry_date', thirtyDaysAgo)
        .order('entry_date', { ascending: true });

    const historyMap: Record<string, { date: string; value: number }[]> = {};
    for (const row of (history || [])) {
        if (!historyMap[row.kpi_code]) {
            historyMap[row.kpi_code] = [];
        }
        historyMap[row.kpi_code].push({ date: row.entry_date, value: row.value });
    }

    const { data: allSites } = await supabase.from('sites').select('*');

    return {
        site: site as Site,
        latestKpis: (latestKpis || []) as SiteSummaryRow[],
        history: (history || []) as SiteSummaryRow[],
        historyMap,
        allSites: (allSites || []) as Site[]
    };
};
