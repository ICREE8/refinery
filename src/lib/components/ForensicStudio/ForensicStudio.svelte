<script lang="ts">
	import type { FinancialLedgerRecord, Site } from '$lib/types/kpi';
	import DocMoneyMade from './docs/DocMoneyMade.svelte';
	import DocCostToMake from './docs/DocCostToMake.svelte';
	import DocMissingMoney from './docs/DocMissingMoney.svelte';
	import DocBankStatus from './docs/DocBankStatus.svelte';
	import AuditDetailModal from '$lib/components/AuditDetailModal.svelte';
	import TacticalMaintenanceModal from '$lib/components/TacticalMaintenanceModal.svelte';
	import { SITE_MAINTENANCE_METRICS, DEFAULT_BAJO_GRANDE_RECORD, DEFAULT_EL_TABLAZO_RECORD } from '$lib/mockData';

	let {
		records = [],
		sites = [],
		initialFacility = 'el-tablazo',
		activeFacility = 'el-tablazo',
		onOpenMaintenance = () => {}
	}: {
		records?: FinancialLedgerRecord[];
		sites?: Site[];
		initialFacility?: string;
		activeFacility?: string;
		onOpenMaintenance?: () => void;
	} = $props();

	type TabKey = 'ventas' | 'costos' | 'fugas' | 'banco';
	let activeTab = $state<TabKey>('ventas');

	// Estado del modal de detalle interactivo
	let isDetailOpen = $state<boolean>(false);
	let selectedMetricKey = $state<string>('volumen');

	function handleOpenDetail(key: string) {
		selectedMetricKey = key;
		isDetailOpen = true;
	}

	const tabs: { id: TabKey; label: string }[] = [
		{ id: 'ventas', label: '💰 Ventas' },
		{ id: 'costos', label: '⚙️ Costos' },
		{ id: 'fugas', label: '🚨 Fugas' },
		{ id: 'banco', label: '🏦 Banco' }
	];

	let activeLedger = $derived.by(() => {
		if (records.length > 0) {
			const found = records.find(r => r.site_slug === activeFacility);
			if (found) return found;
		}
		return activeFacility === 'bajo-grande'
			? DEFAULT_BAJO_GRANDE_RECORD
			: DEFAULT_EL_TABLAZO_RECORD;
	});
</script>

<div class="min-h-[calc(100vh-3.5rem)] bg-slate-50/70 text-slate-800 flex flex-col antialiased">
	
	<!-- Row 3: Audit Tabs (px-4 py-2 bg-white sticky top-0 z-20 border-b border-slate-100) -->
	<div class="px-4 py-2 bg-white sticky top-0 z-20 border-b border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
		<div class="max-w-4xl mx-auto">
			<div class="grid grid-cols-4 p-1 bg-slate-100/90 rounded-xl sm:inline-flex sm:w-auto w-full gap-1 border border-slate-200/60">
				{#each tabs as tab}
					{@const isActive = activeTab === tab.id}
					<button
						onclick={() => activeTab = tab.id}
						class={`cursor-pointer transition-all py-1.5 px-3 text-center text-xs sm:text-sm font-semibold rounded-lg truncate ${
							isActive
								? 'bg-white text-slate-900 shadow-xs font-bold'
								: 'text-slate-500 hover:text-slate-800 font-medium'
						}`}
					>
						{tab.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Vista Principal del Documento Forense (Max-w-4xl, Zero-scroll clarity, Clickeable para drill-downs) -->
	<main class="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
		{#if activeTab === 'ventas'}
			<DocMoneyMade 
				records={records}
				facilitySlug={activeFacility}
				sites={sites}
				ledger={activeLedger}
				onOpenDetail={handleOpenDetail}
			/>
		{:else if activeTab === 'costos'}
			<DocCostToMake 
				records={records}
				facilitySlug={activeFacility}
				ledger={activeLedger}
				onOpenDetail={handleOpenDetail}
			/>
		{:else if activeTab === 'fugas'}
			<DocMissingMoney 
				records={records}
				facilitySlug={activeFacility}
				ledger={activeLedger}
				onOpenDetail={handleOpenDetail}
			/>
		{:else if activeTab === 'banco'}
			<DocBankStatus 
				records={records}
				facilitySlug={activeFacility}
				ledger={activeLedger}
				onOpenDetail={handleOpenDetail}
			/>
		{/if}
	</main>

	<!-- Modal de Detalle Forense Interactivo (Cascada de cálculo y comprobantes físicos) -->
	<AuditDetailModal 
		isOpen={isDetailOpen}
		metricKey={selectedMetricKey}
		facilitySlug={activeFacility}
		onClose={() => isDetailOpen = false}
	/>

</div>
