<script lang="ts">
	import type { SiteSummaryRow } from '$lib/types/kpi';
	import { 
		TrendingUp, 
		TrendingDown, 
		AlertTriangle, 
		CheckCircle2, 
		ShieldAlert, 
		Minus,
		Target,
		BarChart3
	} from 'lucide-svelte';

	let { 
		kpi, 
		history = [],
		isSelected = false,
		onSelect = () => {}
	}: { 
		kpi: SiteSummaryRow; 
		history?: { date: string; value: number }[];
		isSelected?: boolean;
		onSelect?: () => void;
	} = $props();

	// Calculate delta vs previous day
	let prevValue = $derived(history.length >= 2 ? history[history.length - 2].value : null);
	let delta = $derived(prevValue !== null ? kpi.value - prevValue : 0);
	let deltaPct = $derived(prevValue && prevValue !== 0 ? (delta / prevValue) * 100 : 0);

	// Status calculation
	let status = $derived.by(() => {
		const val = kpi.value;
		const minW = kpi.min_warning;
		const maxW = kpi.max_warning;

		if (minW !== undefined && minW !== null && val < minW) {
			return 'warning';
		}
		if (maxW !== undefined && maxW !== null && val > maxW) {
			return 'warning';
		}
		if (kpi.target_attainment_pct < 85) {
			return 'alert';
		}
		return 'optimal';
	});

	// Sparkline SVG path generator
	let sparklinePoints = $derived.by(() => {
		if (history.length < 2) return '';
		const values = history.slice(-14).map(h => h.value);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const range = max - min || 1;
		const width = 110;
		const height = 32;

		return values
			.map((v, i) => {
				const x = (i / (values.length - 1)) * width;
				const y = height - ((v - min) / range) * (height - 6) - 3;
				return `${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	});
</script>

<div 
	onclick={onSelect}
	onkeydown={(e) => { if (e.key === 'Enter') onSelect(); }}
	tabindex="0"
	role="button"
	class={`text-left rounded-xl p-4 transition-all duration-200 border cursor-pointer select-none relative overflow-hidden ${
		isSelected 
			? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-300 shadow-md' 
			: 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md'
	}`}
>
	<!-- Top Bar: Category Pill & Status Badge -->
	<div class="flex items-center justify-between gap-2 mb-2.5">
		<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200/60">
			{kpi.kpi_category}
		</span>

		<div class="flex items-center space-x-1.5">
			{#if status === 'optimal'}
				<span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
					<CheckCircle2 class="w-3 h-3 text-emerald-600" />
					<span>Optimal</span>
				</span>
			{:else if status === 'warning'}
				<span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
					<AlertTriangle class="w-3 h-3 text-amber-600" />
					<span>Caution</span>
				</span>
			{:else}
				<span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
					<ShieldAlert class="w-3 h-3 text-rose-600" />
					<span>Sub-Target</span>
				</span>
			{/if}
		</div>
	</div>

	<!-- KPI Metric Title -->
	<h3 class="font-semibold text-slate-800 text-sm tracking-tight leading-snug line-clamp-1 mb-2" title={kpi.kpi_name}>
		{kpi.kpi_name}
	</h3>

	<!-- Value & Sparkline Row -->
	<div class="flex items-baseline justify-between gap-2 mb-3">
		<div class="flex items-baseline space-x-1.5">
			<span class="text-2xl font-mono font-bold text-slate-900 tracking-tight">
				{kpi.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
			</span>
			<span class="text-xs font-mono font-medium text-slate-500">{kpi.unit}</span>
		</div>

		<!-- Mini Sparkline Graph -->
		{#if sparklinePoints}
			<div class="w-24 h-8 shrink-0 flex items-center justify-end" title="14-day telemetry sparkline">
				<svg viewBox="0 0 110 32" class="w-full h-full overflow-visible">
					<polyline
						fill="none"
						stroke={status === 'optimal' ? '#0284c7' : status === 'warning' ? '#d97706' : '#e11d48'}
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						points={sparklinePoints}
					/>
				</svg>
			</div>
		{/if}
	</div>

	<!-- Attainment & Target Benchmark Bar -->
	<div class="space-y-1.5 pt-2 border-t border-slate-100">
		<div class="flex items-center justify-between text-xs">
			<div class="flex items-center space-x-1 text-slate-500 font-medium">
				<Target class="w-3.5 h-3.5 text-slate-400" />
				<span>Target: {kpi.target_value.toLocaleString()} {kpi.unit}</span>
			</div>
			<span class={`font-mono font-bold ${
				kpi.target_attainment_pct >= 95 ? 'text-emerald-700' : 'text-slate-700'
			}`}>
				{kpi.target_attainment_pct}%
			</span>
		</div>

		<!-- Visual Progress Bar -->
		<div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 relative">
			<!-- 100% Target tick mark indicator -->
			<div class="absolute left-full -ml-[1px] top-0 bottom-0 w-0.5 bg-slate-400 z-10"></div>
			<div 
				class={`h-full rounded-full transition-all duration-500 ${
					kpi.target_attainment_pct >= 95 
						? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
						: kpi.target_attainment_pct >= 85 
							? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
							: 'bg-gradient-to-r from-rose-500 to-orange-500'
				}`}
				style={`width: ${Math.min(kpi.target_attainment_pct, 100)}%`}
			></div>
		</div>

		<!-- Warning boundaries note if applicable -->
		{#if kpi.min_warning || kpi.max_warning}
			<div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
				<span>Min: {kpi.min_warning ?? '—'}</span>
				<span>Max: {kpi.max_warning ?? '—'}</span>
			</div>
		{/if}
	</div>

	<!-- 24h Delta footer -->
	{#if prevValue !== null}
		<div class="mt-2 flex items-center justify-between text-[11px] pt-1 text-slate-500">
			<span>Prev Shift</span>
			<div class="flex items-center space-x-1 font-mono font-medium">
				{#if delta > 0}
					<TrendingUp class="w-3.5 h-3.5 text-emerald-600" />
					<span class="text-emerald-700">+{delta > 10 ? Math.round(delta) : delta.toFixed(2)} ({deltaPct > 0 ? '+' : ''}{deltaPct.toFixed(1)}%)</span>
				{:else if delta < 0}
					<TrendingDown class="w-3.5 h-3.5 text-rose-600" />
					<span class="text-rose-700">{delta < -10 ? Math.round(delta) : delta.toFixed(2)} ({deltaPct.toFixed(1)}%)</span>
				{:else}
					<Minus class="w-3.5 h-3.5 text-slate-400" />
					<span>0.00 (0.0%)</span>
				{/if}
			</div>
		</div>
	{/if}
</div>
