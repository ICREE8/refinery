import { json, type RequestHandler } from '@sveltejs/kit';
import { insertInMemoryKpiValues, INITIAL_KPI_DEFINITIONS, INITIAL_SITES } from '$lib/mockData';
import type { SiteSummaryRow } from '$lib/types/kpi';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { site_slug, records } = body;

        if (!site_slug || !Array.isArray(records)) {
            return json({ error: 'Payload must contain site_slug and records array.' }, { status: 400 });
        }

        const site = INITIAL_SITES.find(s => s.slug === site_slug);
        if (!site) {
            return json({ error: `Facility with slug "${site_slug}" not found.` }, { status: 404 });
        }

        const newRows: SiteSummaryRow[] = [];

        for (const rec of records) {
            const def = INITIAL_KPI_DEFINITIONS.find(d => d.code === rec.kpi_code && d.site_type === site.type);
            const targetVal = def?.target_value ?? 100;
            const numVal = Number(rec.value);
            const attainment = targetVal > 0 ? Number(((numVal / targetVal) * 100).toFixed(2)) : 100;

            newRows.push({
                site_id: site.id,
                site_name: site.name,
                site_slug: site.slug,
                site_type: site.type,
                entry_date: rec.entry_date || new Date().toISOString().split('T')[0],
                kpi_code: rec.kpi_code,
                kpi_name: def?.name || rec.kpi_code,
                kpi_category: def?.category || 'throughput',
                unit: def?.unit || '',
                value: numVal,
                target_value: targetVal,
                target_attainment_pct: attainment,
                min_warning: def?.min_warning,
                max_warning: def?.max_warning
            });
        }

        insertInMemoryKpiValues(newRows);

        return json({
            success: true,
            ingested_count: newRows.length,
            site: site.name,
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        return json({ error: err.message || 'Internal server error during ingestion.' }, { status: 500 });
    }
};
