import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';
import type { FinancialLedgerRecord } from '$lib/types/kpi';
import { getInMemoryFinancialLedgers } from '$lib/mockData';

export const load: PageLoad = async () => {
    const { data: ledgers } = await supabase
        .from('financial_ledgers')
        .select('*')
        .order('fiscal_date', { ascending: false });

    return {
        financialLedgers: (ledgers && ledgers.length > 0 ? ledgers : getInMemoryFinancialLedgers()) as FinancialLedgerRecord[]
    };
};
