<script lang="ts">
	import type { PageData } from './$types';
	import type { Site } from '$lib/types/kpi';
	import Navbar from '$lib/components/Navbar.svelte';
	import DataIntakeModal from '$lib/components/DataIntakeModal.svelte';
	import ExecutiveBrief from '$lib/components/ExecutiveBrief.svelte';
	import { 
		INITIAL_SITES, 
		INITIAL_KPI_DEFINITIONS, 
		getInMemorySummaryRows, 
		SITE_MAINTENANCE_METRICS 
	} from '$lib/mockData';
	import { generateShiftBrief } from '$lib/ai/shiftBrief';
	import { 
		Flame, 
		FlaskConical, 
		MapPin, 
		ArrowRight, 
		ShieldCheck, 
		Activity, 
		Layers
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let sites = $derived(data.sites || INITIAL_SITES);
	let allRows = $state(getInMemorySummaryRows());

	// Group latest row per site
	const siteCards = $derived(sites.map(site => {
		const siteRows = allRows.filter(r => r.site_slug === site.slug);
		const latestDate = siteRows.length > 0 ? siteRows[siteRows.length - 1].entry_date : '';
		const latestKpis = siteRows.filter(r => r.entry_date === latestDate);
		const avgAttainment = latestKpis.length > 0 
			? Math.round(latestKpis.reduce((a, b) => a + b.target_attainment_pct, 0) / latestKpis.length)
			: 100;
		const maintenance = SITE_MAINTENANCE_METRICS[site.slug];

		return {
			site,
			latestDate,
			latestKpis,
			avgAttainment,
			maintenance
		};
	}));

	let isIntakeOpen = $state(false);
	let isBriefOpen = $state(false);
	let activeModalSite = $state<Site>(INITIAL_SITES[0]);

	$effect(() => {
		if (sites.length > 0 && activeModalSite.id === INITIAL_SITES[0].id && sites[0].id !== INITIAL_SITES[0].id) {
			activeModalSite = sites[0];
		}
	});

	let briefData = $derived(
		generateShiftBrief(
			activeModalSite,
			allRows.filter(r => r.site_slug === activeModalSite.slug).slice(-6),
			SITE_MAINTENANCE_METRICS[activeModalSite.slug]
		)
	);

	function openIntakeForSite(site: Site) {
		activeModalSite = site;
		isIntakeOpen = true;
	}

	function openBriefForSite(site: Site) {
		activeModalSite = site;
		isBriefOpen = true;
	}
</script>

<div class="min-h-screen bg-slate-100/60 flex flex-col">
	<Navbar 
		sites={sites} 
		currentSite={null}
		onOpenIntake={() => openIntakeForSite(sites[0])}
		onOpenBrief={() => openBriefForSite(sites[0])}
	/>

	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
		
		<!-- Hero / Basin Context Banner -->
		<div class="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white shadow-lg relative overflow-hidden">
			<!-- Subtle background decorative mesh -->
			<div class="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

			<div class="relative z-10 max-w-3xl space-y-3">
				<div class="flex items-center space-x-2">
					<span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
						Lake Maracaibo Basin Control Center
					</span>
					<span class="text-xs text-slate-400">• Multi-Tenant Industrial Performance</span>
				</div>

				<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
					Downstream Oil Refining & Petrochemical Portfolio
				</h1>

				<p class="text-sm sm:text-base text-slate-300 leading-relaxed">
					Universal performance framework orchestrating heterogeneous asset classes across Lake Maracaibo. Seamlessly tracking refinery heavy distillation (<span class="font-mono text-sky-300">bpd</span>, <span class="font-mono text-sky-300">%</span>) and petrochemical olefin synthesis (<span class="font-mono text-emerald-300">MT/day</span>, <span class="font-mono text-emerald-300">GJ/MT</span>) under a unified data schema.
				</p>

				<div class="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-slate-300">
					<div class="flex items-center space-x-1.5">
						<Activity class="w-4 h-4 text-emerald-400" />
						<span>2 Active Core Facilities</span>
					</div>
					<div class="flex items-center space-x-1.5">
						<Layers class="w-4 h-4 text-sky-400" />
						<span>12 Monitored Critical KPIs</span>
					</div>
					<div class="flex items-center space-x-1.5">
						<ShieldCheck class="w-4 h-4 text-teal-400" />
						<span>Live Supabase Postgres + RLS Engine</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Managed Facilities Dual Grid (Refinery vs Petrochemical) -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-lg font-bold text-slate-900 tracking-tight">Active Asset Facilities</h2>
					<p class="text-xs text-slate-500">Universal schema powering downstream refining and chemical complexes</p>
				</div>
				<span class="text-xs font-mono font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
					Clean Mode Active
				</span>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{#each siteCards as item}
					{@const s = item.site}
					{@const isRef = s.type === 'refinery'}

					<div class="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
						
						<!-- Facility Card Top -->
						<div class="p-6">
							<div class="flex items-start justify-between gap-4 mb-4">
								<div class="flex items-center space-x-3.5">
									<div class={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs border ${
										isRef 
											? 'bg-amber-50 text-amber-700 border-amber-200' 
											: 'bg-sky-50 text-sky-700 border-sky-200'
									}`}>
										{#if isRef}
											<Flame class="w-6 h-6" />
										{:else}
											<FlaskConical class="w-6 h-6" />
										{/if}
									</div>
									<div>
										<div class="flex items-center space-x-2">
											<h3 class="font-extrabold text-slate-900 text-lg">{s.name}</h3>
											<span class={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
												isRef 
													? 'bg-amber-50 text-amber-800 border-amber-200' 
													: 'bg-sky-50 text-sky-800 border-sky-200'
											}`}>
												{s.type}
											</span>
										</div>
										<div class="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
											<MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
											<span>{s.location}</span>
										</div>
									</div>
								</div>

								<!-- Overall Attainment Badge -->
								<div class="text-right shrink-0">
									<div class="text-[10px] uppercase font-bold text-slate-400">Shift Attainment</div>
									<div class="text-xl font-mono font-extrabold text-slate-900">
										{item.avgAttainment}%
									</div>
								</div>
							</div>

							<!-- Nominal Capacity Descriptor -->
							<div class="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 mb-5 flex items-center justify-between">
								<span class="text-slate-500 font-medium">Design Capacity:</span>
								<strong class="font-mono text-slate-900">{s.nominal_capacity_desc}</strong>
							</div>

							<!-- Key Metrics Snapshot -->
							<div class="space-y-2.5 mb-2">
								<div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
									Current Shift Telemetry
								</div>
								<div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
									{#each item.latestKpis.slice(0, 6) as kpi}
										<div class="rounded-lg p-2.5 bg-slate-50/70 border border-slate-200/70 text-xs">
											<div class="text-[10px] text-slate-500 truncate" title={kpi.kpi_name}>
												{kpi.kpi_name}
											</div>
											<div class="flex items-baseline space-x-1 mt-1">
												<span class="font-mono font-bold text-sm text-slate-900">
													{kpi.value.toLocaleString()}
												</span>
												<span class="font-mono text-[10px] text-slate-500">{kpi.unit}</span>
											</div>
											<div class="text-[10px] font-mono mt-1 text-slate-500">
												Target: {kpi.target_value} ({kpi.target_attainment_pct}%)
											</div>
										</div>
									{/each}
								</div>
							</div>
						</div>

						<!-- Card Bottom Action Bar -->
						<div class="px-6 py-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between">
							<div class="flex items-center space-x-2">
								<button 
									onclick={() => openIntakeForSite(s)}
									class="text-xs font-semibold text-slate-700 hover:text-sky-700 underline cursor-pointer"
								>
									Log Shift Data
								</button>
								<span class="text-slate-300">•</span>
								<button 
									onclick={() => openBriefForSite(s)}
									class="text-xs font-semibold text-indigo-700 hover:text-indigo-800 underline cursor-pointer"
								>
									AI Shift Brief
								</button>
							</div>

							<a 
								href={`/${s.slug}`}
								class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
							>
								<span>Open Facility Dashboard</span>
								<ArrowRight class="w-3.5 h-3.5" />
							</a>
						</div>

					</div>
				{/each}
			</div>
		</div>

		<!-- Four Core Industry Pivots Architecture Highlights -->
		<div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
			<div class="border-b border-slate-100 pb-4">
				<h2 class="text-lg font-bold text-slate-900 tracking-tight">Production Architecture & Industry Solutions</h2>
				<p class="text-xs text-slate-500">Engineered to eliminate operational noise, siloed ERPs, and reactive maintenance</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
				<div class="space-y-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
					<div class="font-bold text-sky-800 flex items-center space-x-1.5 text-sm">
						<span class="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-mono text-xs">1</span>
						<span>Decision Framework</span>
					</div>
					<p class="text-slate-600 leading-relaxed">
						Replaces static gigabyte SCADA overload with laser-focused executive attainment thresholds, warning boundaries, and delta tracking.
					</p>
				</div>

				<div class="space-y-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
					<div class="font-bold text-sky-800 flex items-center space-x-1.5 text-sm">
						<span class="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-mono text-xs">2</span>
						<span>Universal Schema</span>
					</div>
					<p class="text-slate-600 leading-relaxed">
						Polymorphic <code class="font-mono text-slate-800">site_type_enum</code> model easily supporting refineries, petrochemical complexes, LNG terminals, and mining plants without code edits.
					</p>
				</div>

				<div class="space-y-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
					<div class="font-bold text-sky-800 flex items-center space-x-1.5 text-sm">
						<span class="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-mono text-xs">3</span>
						<span>Tactical Maintenance</span>
					</div>
					<p class="text-slate-600 leading-relaxed">
						Balances volumetric run-down targets with predictive asset reliability, planned vs reactive ratios, and MTBF monitoring.
					</p>
				</div>

				<div class="space-y-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
					<div class="font-bold text-sky-800 flex items-center space-x-1.5 text-sm">
						<span class="w-5 h-5 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-mono text-xs">4</span>
						<span>Unified Intake Layer</span>
					</div>
					<p class="text-slate-600 leading-relaxed">
						Standardized intake API and operator log portal enabling rapid SCADA/CSV ingestion from fragmented plant systems.
					</p>
				</div>
			</div>
		</div>

	</main>

	<!-- Data Intake Modal -->
	<DataIntakeModal 
		isOpen={isIntakeOpen}
		site={activeModalSite}
		kpiDefinitions={INITIAL_KPI_DEFINITIONS.filter(d => d.site_type === activeModalSite.type)}
		onClose={() => isIntakeOpen = false}
		onDataIngested={() => { allRows = getInMemorySummaryRows(); }}
	/>

	<!-- Executive Shift Brief Modal -->
	<ExecutiveBrief 
		isOpen={isBriefOpen}
		site={activeModalSite}
		brief={briefData}
		onClose={() => isBriefOpen = false}
	/>
</div>
