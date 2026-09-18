import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { 
    INITIAL_SITES, 
    INITIAL_KPI_DEFINITIONS, 
    getInMemorySummaryRows, 
    insertInMemoryKpiValues,
    getInMemoryFinancialLedgers
} from './mockData';
import type { Site, SiteSummaryRow, FinancialLedgerRecord } from './types/kpi';

// Read env variables if available in client or server
const supabaseUrl = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.PUBLIC_SUPABASE_URL) ||
    undefined;

const supabaseAnonKey = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.PUBLIC_SUPABASE_ANON_KEY) ||
    undefined;

export const isLiveSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let rawClient: SupabaseClient | null = null;
if (isLiveSupabaseConfigured) {
    rawClient = createClient(supabaseUrl!, supabaseAnonKey!);
}

/**
 * Resilient Supabase wrapper that falls back gracefully to in-memory seed dataset
 * matching schema.sql and seed.sql when live Supabase is not connected.
 */
class ResilientQueryBuilder<T> {
    private tableName: string;
    private filters: Array<(item: any) => boolean> = [];
    private orderField?: string;
    private orderAscending = true;
    private limitCount?: number;
    private isSingle = false;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    select(fields: string = '*') {
        return this;
    }

    eq(field: string, value: any) {
        this.filters.push((item: any) => item[field] === value);
        return this;
    }

    gte(field: string, value: any) {
        this.filters.push((item: any) => item[field] >= value);
        return this;
    }

    lte(field: string, value: any) {
        this.filters.push((item: any) => item[field] <= value);
        return this;
    }

    order(field: string, options: { ascending?: boolean } = {}) {
        this.orderField = field;
        this.orderAscending = options.ascending ?? true;
        return this;
    }

    limit(count: number) {
        this.limitCount = count;
        return this;
    }

    single() {
        this.isSingle = true;
        return this.execute();
    }

    then(onfulfilled?: ((value: { data: any; error: any }) => any) | null, onrejected?: ((reason: any) => any) | null): Promise<any> {
        return this.execute().then(onfulfilled, onrejected);
    }

    private async execute(): Promise<{ data: any; error: any }> {
        let dataset: any[] = [];

        if (this.tableName === 'sites') {
            dataset = [...INITIAL_SITES];
        } else if (this.tableName === 'kpi_definitions') {
            dataset = [...INITIAL_KPI_DEFINITIONS];
        } else if (this.tableName === 'v_daily_site_summary') {
            dataset = getInMemorySummaryRows();
        } else if (this.tableName === 'financial_ledgers' || this.tableName === 'v_financial_audit_summary') {
            dataset = getInMemoryFinancialLedgers();
        } else {
            dataset = [];
        }

        // Apply filters
        let result = dataset.filter(item => {
            return this.filters.every(f => f(item));
        });

        // Apply ordering
        if (this.orderField) {
            const field = this.orderField;
            const asc = this.orderAscending;
            result.sort((a, b) => {
                if (a[field] < b[field]) return asc ? -1 : 1;
                if (a[field] > b[field]) return asc ? 1 : -1;
                return 0;
            });
        }

        // Apply limit
        if (typeof this.limitCount === 'number') {
            result = result.slice(0, this.limitCount);
        }

        if (this.isSingle) {
            if (result.length === 0) {
                return { data: null, error: { message: `Row not found in ${this.tableName}` } };
            }
            return { data: result[0], error: null };
        }

        return { data: result, error: null };
    }
}

export const supabase = {
    from: (tableName: string) => {
        if (rawClient) {
            return rawClient.from(tableName);
        }
        return new ResilientQueryBuilder(tableName);
    }
};
