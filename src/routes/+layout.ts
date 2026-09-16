import { supabase } from '$lib/supabaseClient';
import type { LayoutLoad } from './$types';
import type { Site } from '$lib/types/kpi';

export const load: LayoutLoad = async () => {
    const { data: sites } = await supabase
        .from('sites')
        .select('*')
        .order('name', { ascending: true });

    return {
        sites: (sites || []) as Site[]
    };
};
