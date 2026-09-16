import { supabase } from '$lib/supabaseClient';
import type { LayoutLoad } from './$types';
import type { Site } from '$lib/types/kpi';

export const load: LayoutLoad = async ({ setHeaders }) => {
    // Cache static site metadata on the edge/browser to eliminate unnecessary roundtrips
    setHeaders({
        'cache-control': 'public, max-age=300, stale-while-revalidate=600'
    });

    const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .order('name', { ascending: true });

    return {
        sites: (sites || []) as Site[]
    };
};
