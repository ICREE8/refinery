<script lang="ts">
	import type { PageData } from './$types';
	import type { SiteSummaryRow } from '$lib/types/kpi';
	import Navbar from '$lib/components/Navbar.svelte';
	import KpiCard from '$lib/components/KpiCard.svelte';
	import KpiChart from '$lib/components/KpiChart.svelte';
	import MaintenancePanel from '$lib/components/MaintenancePanel.svelte';
	import DataIntakeModal from '$lib/components/DataIntakeModal.svelte';
	import ExecutiveBrief from '$lib/components/ExecutiveBrief.svelte';
	import { 
		INITIAL_KPI_DEFINITIONS, 
		SITE_MAINTENANCE_METRICS,
		getInMemorySummaryRows 
	} from '$lib/mockData';
	import { generateShiftBrief } from '$lib/ai/shiftBrief';
	import { 
		Flame, 
		FlaskConical, 
		MapPin, 
		Calendar, 
		Clock, 
		FileText, 
		UploadCloud, 
		Target, 
		TrendingUp,
		Radio,
		Activity,
		ShieldCheck,
		RefreshCw
	} from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const site = $derived(data.site);
	const isRefinery = $derived(site.type === 'refinery');
	const allSites = $derived(data.allSites || []);

	// Active KPI selection for chart inspection
	let selectedKpiCode = $state<string>('');

	$effect(() => {
		if (data.latestKpis.length > 0 && !selectedKpiCode) {
			selectedKpiCode = data.latestKpis[0].kpi_code;
		}
	});

	let selectedKpi = $derived(
		data.latestKpis.find(k => k.kpi_code === selectedKpiCode) || data.latestKpis[0]
	);

	let selectedHistory = $derived(
		selectedKpiCode && data.historyMap[selectedKpiCode] 
			? data.historyMap[selectedKpiCode] 
			: []
	);

	const maintenance = $derived(
		SITE_MAINTENANCE_METRICS[site.slug] || {
			plannedVsReactiveRatio: 80.0,
			mtbfHours: 750,
			equipmentUtilizationPct: 93.0,
			operationalAvailabilityPct: 96.0,
			openWorkOrders: 12,
			preventativeCompliancePct: 95.0
		}
	);

	// Modals State
	let isIntakeOpen = $state(false);
	let isBriefOpen = $state(false);

	let briefData = $derived(
		generateShiftBrief(site, data.latestKpis, maintenance)
	);

	function handleDataIngested() {
		invalidateAll();
	}
</script>

<div class="min-h-screen bg-slate-100/60 flex flex-col">
	<Navbar 
		sites={allSites} 
		currentSite={site}
		onOpenIntake={() => isIntakeOpen = true}
		onOpenBrief={() => isBriefOpen = true}
	/>

	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
		
		<!-- Facility Header Banner -->
		<div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
			<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
				
				<!-- Facility Identity & Metadata -->
				<div class="flex items-start space-x-4">
					<div class={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs border shrink-0 ${
						isRefinery 
							? 'bg-amber-50 text-amber-700 border-amber-200' 
							: 'bg-sky-50 text-sky-700 border-sky-200'
					}`}>
						{#if isRefinery}
							<Flame class="w-7 h-7" />
						{:else}
							<FlaskConical class="w-7 h-7" />
						{/if}
					</div>

					<div class="space-y-1">
						<div class="flex flex-wrap items-center gap-2">
							<h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
								{site.name}
							</h1>
							<span class={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${
								isRefinery 
									? 'bg-amber-50 text-amber-800 border-amber-200' 
									: 'bg-sky-50 text-sky-800 border-sky-200'
							}`}>
								{site.type}
							</span>
							<span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
								<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
								<span>Online / Nominal</span>
							</span>
						</div>

						<div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
							<div class="flex items-center space-x-1">
								<MapPin class="w-3.5 h-3.5 text-slate-400" />
								<span>{site.location}</span>
							</div>
							<div class="flex items-center space-x-1 font-mono">
								<span>{site.latitude}° N, {site.longitude}° W</span>
							</div>
							<div class="flex items-center space-x-1 font-semibold text-slate-700">
								<span>Nominal: {site.nominal_capacity_desc}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Header Quick Action Bar -->
				<div class="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
					<button 
						onclick={() => isIntakeOpen = true}
						class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
					>
						<UploadCloud class="w-4 h-4 text-slate-500" />
						<span>Log Shift Data / CSV</span>
					</button>

					<button 
						onclick={() => isBriefOpen = true}
						class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-700 to-indigo-800 hover:from-sky-800 hover:to-indigo-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ring-1 ring-sky-900/20"
					>
						<FileText class="w-4 h-4 text-sky-200" />
						<span>Executive Shift Brief</span>
					</button>
				</div>

			</div>
		</div>

		<!-- Pivot 1: Decision-Oriented Metric Cards Grid -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-base font-bold text-slate-900 tracking-tight">Shift Performance Indicators</h2>
					<p class="text-xs text-slate-500">Target attainment & operational boundaries for active shift</p>
				</div>
				<div class="text-xs font-mono text-slate-400">
					Click card to inspect 30-day time-series
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.latestKpis as kpi}
					<KpiCard 
						kpi={kpi} 
						history={data.historyMap[kpi.kpi_code] || []}
						isSelected={selectedKpiCode === kpi.kpi_code}
						onSelect={() => selectedKpiCode = kpi.kpi_code}
					/>
				{/each}
			</div>
		</div>

		<!-- Interactive Time-Series Inspection Chart -->
		{#if selectedKpi}
			<KpiChart 
				kpi={selectedKpi}
				history={selectedHistory}
			/>
		{/if}

		<!-- Pivot 3: Tactical Maintenance & Equipment Reliability -->
		<MaintenancePanel 
			site={site}
			metrics={maintenance}
		/>

	</main>

	<!-- Data Intake Modal -->
	<DataIntakeModal 
		isOpen={isIntakeOpen}
		site={site}
		kpiDefinitions={INITIAL_KPI_DEFINITIONS.filter(d => d.site_type === site.type)}
		onClose={() => isIntakeOpen = false}
		onDataIngested={handleDataIngested}
	/>

	<!-- Executive Shift Brief Modal -->
	<ExecutiveBrief 
		isOpen={isBriefOpen}
		site={site}
		brief={briefData}
		onClose={() => isBriefOpen = false}
	/>
</div>
