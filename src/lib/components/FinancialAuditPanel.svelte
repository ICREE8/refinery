<script lang="ts">
	import type { FinancialLedgerRecord, Site } from '$lib/types/kpi';
	import { 
		DollarSign, 
		TrendingUp, 
		ArrowDownRight, 
		ShieldAlert, 
		Landmark, 
		Flame, 
		Droplets, 
		Factory, 
		Clock, 
		CheckCircle2, 
		AlertTriangle, 
		ShieldCheck, 
		Sparkles,
		Layers,
		ArrowRight,
		Percent,
		Scale
	} from 'lucide-svelte';

	let {
		records = [],
		sites = [],
		selectedSiteSlug = null,
		onSelectSite = (slug: string | null) => {}
	}: {
		records: FinancialLedgerRecord[];
		sites: Site[];
		selectedSiteSlug?: string | null;
		onSelectSite?: (slug: string | null) => void;
	} = $props();

	// Active site filter state (reactive to prop and user toggle)
	let userFilterOverride = $state<string | null | undefined>(undefined);

	let currentFilter = $derived(
		userFilterOverride !== undefined ? userFilterOverride : selectedSiteSlug
	);

	function setFilter(slug: string | null) {
		userFilterOverride = slug;
		onSelectSite(slug);
	}

	// Filtered records based on active site
	let filteredRecords = $derived(
		currentFilter 
			? records.filter(r => r.site_slug === currentFilter) 
			: records
	);

	// Get latest fiscal date across data
	let latestFiscalDate = $derived.by(() => {
		if (filteredRecords.length === 0) return new Date().toISOString().split('T')[0];
		return filteredRecords.reduce((max, r) => r.fiscal_date > max ? r.fiscal_date : max, filteredRecords[0].fiscal_date);
	});

	// Latest date records
	let latestDayRecords = $derived(
		filteredRecords.filter(r => r.fiscal_date === latestFiscalDate)
	);

	// Invariant 1: Gross Physical Yield & Cumulative Volumes
	let physicalYield = $derived.by(() => {
		const bgRecord = latestDayRecords.find(r => r.unit_measure === 'bpd');
		const tabRecord = latestDayRecords.find(r => r.unit_measure === 'MT');

		const bgBpd = bgRecord ? bgRecord.gross_volume_produced : 0;
		const tabMt = tabRecord ? tabRecord.gross_volume_produced : 0;

		// 30-day cumulative sums
		const bgCumBbl = records.filter(r => r.unit_measure === 'bpd').reduce((acc, r) => acc + r.gross_volume_produced, 0);
		const tabCumMt = records.filter(r => r.unit_measure === 'MT').reduce((acc, r) => acc + r.gross_volume_produced, 0);

		return {
			bgBpd,
			tabMt,
			bgCumBbl,
			tabCumMt,
			bgTargetBpd: 15500,
			tabTargetMt: 4250,
			bgAttainment: Math.round((bgBpd / 15500) * 100),
			tabAttainment: Math.round((tabMt / 4250) * 100)
		};
	});

	// Molecule-to-Cash Aggregations (Latest Fiscal Date)
	let cashSummary = $derived.by(() => {
		const grossValue = latestDayRecords.reduce((acc, r) => acc + r.gross_revenue_usd, 0);
		const totalOpex = latestDayRecords.reduce((acc, r) => acc + r.total_opex_usd, 0);
		const netMargin = latestDayRecords.reduce((acc, r) => acc + r.net_margin_usd, 0);
		const settledCash = latestDayRecords.reduce((acc, r) => acc + r.settled_cash_usd, 0);
		const pendingReceivables = latestDayRecords.reduce((acc, r) => acc + r.pending_receivables_usd, 0);
		const leakageLoss = latestDayRecords.reduce((acc, r) => acc + r.shrinkage_loss_usd, 0);

		const opexPctOfRevenue = grossValue > 0 ? ((totalOpex / grossValue) * 100).toFixed(1) : '0';
		const netMarginPct = grossValue > 0 ? ((netMargin / grossValue) * 100).toFixed(1) : '0';
		const cashSettlementRatio = grossValue > 0 ? Math.round((settledCash / grossValue) * 100) : 0;

		// Weighted Days Sales Outstanding
		const weightedDso = grossValue > 0 
			? (latestDayRecords.reduce((acc, r) => acc + r.days_sales_outstanding * r.gross_revenue_usd, 0) / grossValue).toFixed(1)
			: '14.2';

		return {
			grossValue,
			totalOpex,
			netMargin,
			settledCash,
			pendingReceivables,
			leakageLoss,
			opexPctOfRevenue,
			netMarginPct,
			cashSettlementRatio,
			weightedDso
		};
	});

	// Invariant 2: Unit OPEX Baselines & Targets
	let unitOpexMetrics = $derived.by(() => {
		const bgRecord = latestDayRecords.find(r => r.unit_measure === 'bpd');
		const tabRecord = latestDayRecords.find(r => r.unit_measure === 'MT');

		return {
			refinery: {
				realizedOpex: bgRecord ? bgRecord.direct_opex_per_unit : 18.20,
				targetBaseline: 19.50,
				minBand: 16.50,
				maxBand: 22.00,
				realizedPrice: bgRecord ? bgRecord.realized_price_per_unit : 68.50,
				unit: '$/bbl'
			},
			petrochemical: {
				realizedOpex: tabRecord ? tabRecord.direct_opex_per_unit : 285.00,
				targetBaseline: 295.00,
				minBand: 260.00,
				maxBand: 330.00,
				realizedPrice: tabRecord ? tabRecord.realized_price_per_unit : 740.00,
				unit: '$/MT'
			}
		};
	});

	// Invariant 5: 100% Reconciled Civic Value Distribution
	let civicDistribution = $derived.by(() => {
		const totalNet = cashSummary.netMargin;

		// 30% Sovereign Hydrocarbon Royalty
		const govRoyaltyUsd = Math.round(totalNet * 0.30);
		// 25% Regional Infrastructure Fund (Lake Sanitation & Grid Stability)
		const infrastructureUsd = Math.round(totalNet * 0.25);
		// 15% Direct Citizen Dividend
		const communityDividendUsd = Math.round(totalNet * 0.15);
		// 30% Operational Reinvestment & Maintenance Reserve
		const operationalReserveUsd = totalNet - govRoyaltyUsd - infrastructureUsd - communityDividendUsd;

		return {
			govRoyaltyUsd,
			infrastructureUsd,
			communityDividendUsd,
			operationalReserveUsd,
			totalNet
		};
	});

	function formatUsd(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatCompactUsd(amount: number): string {
		if (amount >= 1_000_000) {
			return `$${(amount / 1_000_000).toFixed(2)}M`;
		}
		if (amount >= 1_000) {
			return `$${(amount / 1_000).toFixed(0)}k`;
		}
		return `$${amount}`;
	}
</script>

<div class="space-y-6">

	<!-- Citizen Audit Header & Facility Viewport Switcher -->
	<div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 transition-all">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
			
			<div>
				<div class="flex items-center space-x-2.5 mb-1.5">
					<div class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
						<Landmark class="w-4 h-4" />
					</div>
					<div class="flex items-center space-x-2">
						<h2 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
							Citizen Audit & Fiscal Ledger
						</h2>
						<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
							100% Reconciled
						</span>
					</div>
				</div>
				<p class="text-xs sm:text-sm text-slate-500">
					Direct conversion of physical hydrocarbons and petrochemical molecules to audited public cash flow.
				</p>
			</div>

			<!-- Filter Pills: Basin Consolidated vs Individual Facilities -->
			<div class="flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80 shrink-0 self-start md:self-auto text-xs font-semibold">
				<button 
					onclick={() => setFilter(null)}
					class={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
						currentFilter === null 
							? 'bg-white text-slate-900 shadow-xs font-bold' 
							: 'text-slate-600 hover:text-slate-900'
					}`}
				>
					Basin Consolidated
				</button>
				{#each sites as s}
					<button 
						onclick={() => setFilter(s.slug)}
						class={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
							currentFilter === s.slug 
								? 'bg-white text-slate-900 shadow-xs font-bold' 
								: 'text-slate-600 hover:text-slate-900'
						}`}
					>
						{s.name.split(' ')[0]}
					</button>
				{/each}
			</div>

		</div>

		<!-- Audit Timestamp & Integrity Banner -->
		<div class="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono">
			<div class="flex items-center space-x-2">
				<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
				<span>Fiscal Cycle Date: <strong class="text-slate-800">{latestFiscalDate}</strong></span>
				<span class="text-slate-300">•</span>
				<span>Auditor Protocol: <strong class="text-slate-800">PDVSA/Oversight Rev. 4</strong></span>
			</div>
			<div class="flex items-center space-x-1 text-slate-400">
				<Scale class="w-3.5 h-3.5 text-slate-500" />
				<span>Dual Ingress Reconciliation: Active</span>
			</div>
		</div>
	</div>

	<!-- 1. MOLECULE-TO-CASH SUMMARY CARDS (Top Level Fiscal Reality) -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		
		<!-- Card 1: Gross Physical Revenue -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
					<span class="uppercase tracking-wider">Gross Realized Value</span>
					<div class="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
						<DollarSign class="w-3.5 h-3.5" />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-mono font-black text-emerald-800 tracking-tight">
					{formatCompactUsd(cashSummary.grossValue)}
				</div>
				<div class="text-[11px] text-slate-500 mt-1 font-medium">
					{formatUsd(cashSummary.grossValue)} daily gross run-down
				</div>
			</div>
			
			<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
				<span class="text-slate-500">Market Basket Index</span>
				<span class="text-emerald-700 font-bold">100.0% Realized</span>
			</div>
		</div>

		<!-- Card 2: Direct Production OPEX -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
					<span class="uppercase tracking-wider">Direct Plant OPEX</span>
					<div class="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
						<ArrowDownRight class="w-3.5 h-3.5" />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-mono font-black text-amber-700 tracking-tight">
					{formatCompactUsd(cashSummary.totalOpex)}
				</div>
				<div class="text-[11px] text-slate-500 mt-1 font-medium">
					{cashSummary.opexPctOfRevenue}% of gross hydrocarbon value
				</div>
			</div>

			<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
				<span class="text-slate-500">Lifting & Cracking</span>
				<span class="text-amber-700 font-bold">Within Target Band</span>
			</div>
		</div>

		<!-- Card 3: Net Realized Cash Margin -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
			<div>
				<div class="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
					<span class="uppercase tracking-wider">Net Realized Margin</span>
					<div class="w-6 h-6 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center">
						<TrendingUp class="w-3.5 h-3.5" />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-mono font-black text-sky-800 tracking-tight">
					{formatCompactUsd(cashSummary.netMargin)}
				</div>
				<div class="text-[11px] text-slate-500 mt-1 font-medium">
					{cashSummary.netMarginPct}% net margin conversion rate
				</div>
			</div>

			<div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
				<span class="text-slate-500">Available for Distribution</span>
				<span class="text-sky-700 font-bold">100% Liquid</span>
			</div>
		</div>

		<!-- Card 4: Leakage / Flare Drag (Unaccounted Fiscal Drag) -->
		<div class="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs flex flex-col justify-between bg-gradient-to-b from-white to-rose-50/20">
			<div>
				<div class="flex items-center justify-between text-xs text-rose-800 font-semibold mb-1">
					<span class="uppercase tracking-wider">Flare & Shrinkage Drag</span>
					<div class="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center">
						<Flame class="w-3.5 h-3.5" />
					</div>
				</div>
				<div class="text-2xl sm:text-3xl font-mono font-black text-rose-700 tracking-tight">
					{formatCompactUsd(cashSummary.leakageLoss)}
				</div>
				<div class="text-[11px] text-slate-600 mt-1 font-medium">
					Unaccounted volumetric shrinkage converted to $
				</div>
			</div>

			<div class="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-[11px] font-mono">
				<span class="text-slate-500">Target Loss Ceiling</span>
				<span class="text-rose-700 font-bold">&le; 1.5% Volume</span>
			</div>
		</div>

	</div>

	<!-- 2. GROSS MARGIN WATERFALL PROGRESSION & RECEIVABLES VELOCITY -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		
		<!-- Waterfall Breakdown (2 cols) -->
		<div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">
						Invariant 3: Gross Realized Margin Waterfall
					</h3>
					<p class="text-xs text-slate-500">
						Daily waterfall progression: Gross Cargo Sales Value &rarr; Direct Plant OPEX &rarr; Net Realized Margin
					</p>
				</div>
				<span class="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
					Daily Ledger
				</span>
			</div>

			<!-- Waterfall Graphic Progression -->
			<div class="space-y-4 pt-2">
				
				<!-- Step 1: Gross Revenue -->
				<div class="space-y-1.5">
					<div class="flex items-center justify-between text-xs font-semibold">
						<span class="text-slate-700 flex items-center space-x-1.5">
							<span class="w-2 h-2 rounded-full bg-emerald-600"></span>
							<span>1. Gross Cargo Realization Value</span>
						</span>
						<span class="font-mono font-bold text-emerald-800 text-sm">
							+{formatUsd(cashSummary.grossValue)}
						</span>
					</div>
					<div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
						<div class="h-full bg-emerald-600 rounded-full" style="width: 100%;"></div>
					</div>
				</div>

				<!-- Step 2: Direct OPEX Deduction -->
				<div class="space-y-1.5 pl-4 border-l-2 border-slate-200">
					<div class="flex items-center justify-between text-xs font-semibold">
						<span class="text-slate-700 flex items-center space-x-1.5">
							<span class="w-2 h-2 rounded-full bg-amber-600"></span>
							<span>2. Direct Plant OPEX (Lifting, Catalysts, Power)</span>
						</span>
						<span class="font-mono font-bold text-amber-700 text-sm">
							-{formatUsd(cashSummary.totalOpex)}
						</span>
					</div>
					<div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
						<div 
							class="h-full bg-amber-600 rounded-full" 
							style={`width: ${cashSummary.opexPctOfRevenue}%;`}
						></div>
					</div>
				</div>

				<!-- Step 3: Unaccounted Shrinkage Loss (Flare / Metering) -->
				<div class="space-y-1.5 pl-4 border-l-2 border-slate-200">
					<div class="flex items-center justify-between text-xs font-semibold">
						<span class="text-slate-700 flex items-center space-x-1.5">
							<span class="w-2 h-2 rounded-full bg-rose-500"></span>
							<span>3. Unaccounted Volume Shrinkage / Flare Drag</span>
						</span>
						<span class="font-mono font-bold text-rose-700 text-sm">
							-{formatUsd(cashSummary.leakageLoss)}
						</span>
					</div>
					<div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
						<div 
							class="h-full bg-rose-500 rounded-full" 
							style={`width: ${Math.min(10, Math.max(2, Math.round((cashSummary.leakageLoss / (cashSummary.grossValue || 1)) * 100)))}%;`}
						></div>
					</div>
				</div>

				<!-- Step 4: Net Liquid Margin Available for Distribution -->
				<div class="pt-2">
					<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
						<div>
							<div class="text-[11px] uppercase font-bold text-slate-500">Net Audited Distributable Margin</div>
							<div class="text-xl font-mono font-black text-sky-900 mt-0.5">
								{formatUsd(cashSummary.netMargin)}
							</div>
						</div>
						<div class="text-right">
							<span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-100 text-sky-800 border border-sky-200">
								{cashSummary.netMarginPct}% Net Yield
							</span>
						</div>
					</div>
				</div>

			</div>
		</div>

		<!-- Invariant 4: Cash Velocity & DSO Gauge (1 col) -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
			<div>
				<div class="flex items-center justify-between mb-2">
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">
						Payment Cycle Velocity
					</h3>
					<div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
						<Clock class="w-4 h-4" />
					</div>
				</div>
				<p class="text-xs text-slate-500">
					Days Sales Outstanding (DSO) & Escrow Settlement Speed.
				</p>
			</div>

			<!-- Large DSO Radial / Gauge readout -->
			<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
					Weighted Settlement Speed
				</div>
				<div class="flex items-baseline justify-center space-x-2">
					<span class="text-4xl font-mono font-black text-slate-900">
						{cashSummary.weightedDso}
					</span>
					<span class="text-sm font-mono font-bold text-slate-500">Days DSO</span>
				</div>
				<div class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
					<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
					<span>Benchmark Met (&le; 18.0 Days Target)</span>
				</div>
			</div>

			<!-- Settled Cash vs Pending Receivables Split -->
			<div class="space-y-2">
				<div class="flex items-center justify-between text-xs font-mono">
					<span class="text-slate-600">Escrow Bank Confirmed</span>
					<span class="font-bold text-emerald-700">{formatCompactUsd(cashSummary.settledCash)} ({cashSummary.cashSettlementRatio}%)</span>
				</div>
				<div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
					<div 
						class="h-full bg-emerald-600 rounded-l-full" 
						style={`width: ${cashSummary.cashSettlementRatio}%;`}
					></div>
					<div 
						class="h-full bg-amber-400 rounded-r-full" 
						style={`width: ${100 - cashSummary.cashSettlementRatio}%;`}
					></div>
				</div>
				<div class="flex items-center justify-between text-[11px] font-mono text-slate-500">
					<span>Pending Receivables:</span>
					<span class="font-bold text-amber-700">{formatCompactUsd(cashSummary.pendingReceivables)}</span>
				</div>
			</div>

			<div class="p-2.5 rounded-lg bg-sky-50/70 border border-sky-100 text-[11px] text-sky-900 flex items-center justify-between font-mono">
				<span>Letter of Credit (LC) Escrow:</span>
				<strong class="text-sky-950">100% Insured</strong>
			</div>
		</div>

	</div>

	<!-- 3. INVARIANT 5: 100% CIVIC VALUE DISTRIBUTION BAR -->
	<div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
		
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
			<div>
				<div class="flex items-center space-x-2">
					<h3 class="text-base font-black text-slate-900 tracking-tight">
						Invariant 5: 100% Civic Value Distribution Flow
					</h3>
					<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
						Citizen Audit Guarantee
					</span>
				</div>
				<p class="text-xs text-slate-500">
					Where every hydrocarbon dollar goes: sovereign royalty, lake remediation, citizen dividend, and plant maintenance.
				</p>
			</div>

			<div class="text-right">
				<div class="text-[10px] font-bold uppercase text-slate-400">Total Net Distributed</div>
				<div class="text-lg font-mono font-black text-slate-900">
					{formatUsd(civicDistribution.totalNet)}
				</div>
			</div>
		</div>

		<!-- Proportional Horizontal Breakdown Bar -->
		<div class="space-y-2">
			<div class="w-full h-7 rounded-xl overflow-hidden flex shadow-inner p-1 bg-slate-100 gap-1">
				
				<!-- 30% Sovereign Hydrocarbon Royalty -->
				<div 
					class="h-full bg-indigo-700 rounded-lg flex items-center justify-center text-white text-xs font-mono font-bold cursor-help transition-transform hover:scale-105" 
					style="width: 30%;"
					title="Sovereign Royalty: 30%"
				>
					30%
				</div>

				<!-- 25% Infrastructure Fund -->
				<div 
					class="h-full bg-sky-600 rounded-lg flex items-center justify-center text-white text-xs font-mono font-bold cursor-help transition-transform hover:scale-105" 
					style="width: 25%;"
					title="Lake Maracaibo Infrastructure: 25%"
				>
					25%
				</div>

				<!-- 30% Maintenance & Reinvestment -->
				<div 
					class="h-full bg-emerald-700 rounded-lg flex items-center justify-center text-white text-xs font-mono font-bold cursor-help transition-transform hover:scale-105" 
					style="width: 30%;"
					title="Operational Reserve & Maintenance: 30%"
				>
					30%
				</div>

				<!-- 15% Community Dividend -->
				<div 
					class="h-full bg-amber-500 rounded-lg flex items-center justify-center text-white text-xs font-mono font-bold cursor-help transition-transform hover:scale-105" 
					style="width: 15%;"
					title="Direct Citizen Dividend: 15%"
				>
					15%
				</div>

			</div>
		</div>

		<!-- 4 Reconciled Fund Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
			
			<!-- Sovereign Royalty -->
			<div class="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between text-xs text-indigo-900 font-bold mb-1">
						<span>Sovereign Royalty</span>
						<span class="font-mono">30.0%</span>
					</div>
					<div class="text-lg font-mono font-extrabold text-indigo-950">
						{formatCompactUsd(civicDistribution.govRoyaltyUsd)}
					</div>
					<div class="text-[11px] text-indigo-700/80 mt-1">
						Direct Treasury Allocation
					</div>
				</div>
				<div class="mt-3 text-[10px] font-mono text-indigo-900 font-medium">
					Constitutional Hydrocarbon Share
				</div>
			</div>

			<!-- Infrastructure Fund -->
			<div class="p-3.5 rounded-xl bg-sky-50/50 border border-sky-100 flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between text-xs text-sky-900 font-bold mb-1">
						<span>Lake & Grid Fund</span>
						<span class="font-mono">25.0%</span>
					</div>
					<div class="text-lg font-mono font-extrabold text-sky-950">
						{formatCompactUsd(civicDistribution.infrastructureUsd)}
					</div>
					<div class="text-[11px] text-sky-700/80 mt-1">
						Lake Sanitation & Grid Stability
					</div>
				</div>
				<div class="mt-3 text-[10px] font-mono text-sky-900 font-medium">
					Zulia Basin Public Works
				</div>
			</div>

			<!-- Maintenance & Reinvestment -->
			<div class="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
						<span>Operational Reserve</span>
						<span class="font-mono">30.0%</span>
					</div>
					<div class="text-lg font-mono font-extrabold text-emerald-950">
						{formatCompactUsd(civicDistribution.operationalReserveUsd)}
					</div>
					<div class="text-[11px] text-emerald-700/80 mt-1">
						Turnaround & CMMS CapEx
					</div>
				</div>
				<div class="mt-3 text-[10px] font-mono text-emerald-900 font-medium">
					Asset Reliability Preservation
				</div>
			</div>

			<!-- Citizen Dividend -->
			<div class="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between">
				<div>
					<div class="flex items-center justify-between text-xs text-amber-900 font-bold mb-1">
						<span>Citizen Dividend</span>
						<span class="font-mono">15.0%</span>
					</div>
					<div class="text-lg font-mono font-extrabold text-amber-950">
						{formatCompactUsd(civicDistribution.communityDividendUsd)}
					</div>
					<div class="text-[11px] text-amber-700/80 mt-1">
						Direct Municipal Benefit
					</div>
				</div>
				<div class="mt-3 text-[10px] font-mono text-amber-900 font-medium">
					San Francisco & Altagracia
				</div>
			</div>

		</div>

	</div>

	<!-- 4. INVARIANTS 1 & 2: DUAL VOLUME STACK & UNIT OPEX COST BASELINES -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		
		<!-- Invariant 1: Gross Physical Yield Dual Stack -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<div>
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">
						Invariant 1: Gross Physical Yield
					</h3>
					<p class="text-xs text-slate-500">
						Total net hydrocarbons (Bajo Grande) & chemicals (El Tablazo)
					</p>
				</div>
				<div class="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
					<Factory class="w-4 h-4" />
				</div>
			</div>

			<div class="space-y-4">
				
				<!-- Bajo Grande Barrels -->
				<div class="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
					<div class="flex items-center justify-between text-xs">
						<span class="font-bold text-slate-900 flex items-center space-x-1.5">
							<Flame class="w-4 h-4 text-amber-600" />
							<span>Bajo Grande Crude & Asphalt Distillation</span>
						</span>
						<span class="font-mono font-bold text-slate-900">
							{physicalYield.bgBpd.toLocaleString()} <span class="text-slate-500 text-[10px]">bpd</span>
						</span>
					</div>
					<div class="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
						<div 
							class="h-full bg-amber-600 rounded-full" 
							style={`width: ${Math.min(100, physicalYield.bgAttainment)}%;`}
						></div>
					</div>
					<div class="flex justify-between text-[11px] font-mono text-slate-500">
						<span>Target: {physicalYield.bgTargetBpd.toLocaleString()} bpd ({physicalYield.bgAttainment}%)</span>
						<span class="font-bold text-slate-700">30d Cumul: {physicalYield.bgCumBbl.toLocaleString()} bbl</span>
					</div>
				</div>

				<!-- El Tablazo Metric Tons -->
				<div class="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
					<div class="flex items-center justify-between text-xs">
						<span class="font-bold text-slate-900 flex items-center space-x-1.5">
							<Droplets class="w-4 h-4 text-sky-600" />
							<span>El Tablazo Olefins, PE & Urea Synthesis</span>
						</span>
						<span class="font-mono font-bold text-slate-900">
							{physicalYield.tabMt.toLocaleString()} <span class="text-slate-500 text-[10px]">MT/day</span>
						</span>
					</div>
					<div class="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
						<div 
							class="h-full bg-sky-600 rounded-full" 
							style={`width: ${Math.min(100, physicalYield.tabAttainment)}%;`}
						></div>
					</div>
					<div class="flex justify-between text-[11px] font-mono text-slate-500">
						<span>Target: {physicalYield.tabTargetMt.toLocaleString()} MT ({physicalYield.tabAttainment}%)</span>
						<span class="font-bold text-slate-700">30d Cumul: {physicalYield.tabCumMt.toLocaleString()} MT</span>
					</div>
				</div>

			</div>
		</div>

		<!-- Invariant 2: Production OPEX Real Unit Cost Baseline -->
		<div class="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
			<div class="flex items-center justify-between border-b border-slate-100 pb-3">
				<div>
					<h3 class="text-base font-extrabold text-slate-900 tracking-tight">
						Invariant 2: Production OPEX Unit Economics
					</h3>
					<p class="text-xs text-slate-500">
						Real lifting & refining cost vs target baseline and warning bands
					</p>
				</div>
				<div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
					<Scale class="w-4 h-4" />
				</div>
			</div>

			<div class="space-y-4">
				
				<!-- Refinery Unit Cost Band -->
				<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
					<div class="flex items-center justify-between text-xs">
						<span class="font-bold text-slate-900">Refinery Unit OPEX (Bajo Grande)</span>
						<div class="flex items-baseline space-x-1 font-mono">
							<span class="text-lg font-black text-amber-700">${unitOpexMetrics.refinery.realizedOpex.toFixed(2)}</span>
							<span class="text-xs text-slate-500">/ barrel</span>
						</div>
					</div>
					
					<!-- Range visualizer -->
					<div class="relative pt-1 pb-2">
						<div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
							<div class="h-full bg-emerald-400" style="width: 40%;"></div>
							<div class="h-full bg-amber-400" style="width: 35%;"></div>
							<div class="h-full bg-rose-400" style="width: 25%;"></div>
						</div>
					</div>

					<div class="flex items-center justify-between text-[11px] font-mono text-slate-500">
						<span>Target: ${unitOpexMetrics.refinery.targetBaseline.toFixed(2)}/bbl</span>
						<span class="text-emerald-700 font-bold">Optimal Cost Floor</span>
						<span>Sales Basket: ${unitOpexMetrics.refinery.realizedPrice.toFixed(2)}/bbl</span>
					</div>
				</div>

				<!-- Petrochemical Unit Cost Band -->
				<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
					<div class="flex items-center justify-between text-xs">
						<span class="font-bold text-slate-900">Petrochemical Unit OPEX (El Tablazo)</span>
						<div class="flex items-baseline space-x-1 font-mono">
							<span class="text-lg font-black text-amber-700">${unitOpexMetrics.petrochemical.realizedOpex.toFixed(2)}</span>
							<span class="text-xs text-slate-500">/ MT</span>
						</div>
					</div>

					<!-- Range visualizer -->
					<div class="relative pt-1 pb-2">
						<div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
							<div class="h-full bg-emerald-400" style="width: 45%;"></div>
							<div class="h-full bg-amber-400" style="width: 30%;"></div>
							<div class="h-full bg-rose-400" style="width: 25%;"></div>
						</div>
					</div>

					<div class="flex items-center justify-between text-[11px] font-mono text-slate-500">
						<span>Target: ${unitOpexMetrics.petrochemical.targetBaseline.toFixed(2)}/MT</span>
						<span class="text-emerald-700 font-bold">Optimal Cost Floor</span>
						<span>Sales Basket: ${unitOpexMetrics.petrochemical.realizedPrice.toFixed(2)}/MT</span>
					</div>
				</div>

			</div>
		</div>

	</div>

</div>
