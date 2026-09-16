<script lang="ts">
	import type { SiteSummaryRow } from '$lib/types/kpi';
	import { Calendar, Filter, Layers, Maximize2, ShieldCheck } from 'lucide-svelte';

	let { 
		kpi, 
		history = []
	}: { 
		kpi: SiteSummaryRow; 
		history: { date: string; value: number }[];
	} = $props();

	let timeRange = $state<'7d' | '14d' | '30d'>('30d');
	let hoveredIndex = $state<number | null>(null);

	// Filter history by time range
	let filteredHistory = $derived.by(() => {
		const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
		return history.slice(-days);
	});

	// Chart dimensions & scaling
	const svgWidth = 800;
	const svgHeight = 260;
	const padLeft = 60;
	const padRight = 30;
	const padTop = 30;
	const padBottom = 40;

	const plotWidth = svgWidth - padLeft - padRight;
	const plotHeight = svgHeight - padTop - padBottom;

	let minVal = $derived.by(() => {
		const vals = filteredHistory.map(h => h.value);
		const target = kpi.target_value || 0;
		const minW = kpi.min_warning ?? target * 0.8;
		const lowest = Math.min(...vals, target, minW);
		return Math.floor(lowest * 0.95);
	});

	let maxVal = $derived.by(() => {
		const vals = filteredHistory.map(h => h.value);
		const target = kpi.target_value || 100;
		const maxW = kpi.max_warning ?? target * 1.1;
		const highest = Math.max(...vals, target, maxW);
		return Math.ceil(highest * 1.05);
	});

	let valRange = $derived(maxVal - minVal || 1);

	function getY(val: number) {
		return padTop + plotHeight - ((val - minVal) / valRange) * plotHeight;
	}

	function getX(index: number, total: number) {
		if (total <= 1) return padLeft + plotWidth / 2;
		return padLeft + (index / (total - 1)) * plotWidth;
	}

	// SVG Path calculations
	let linePath = $derived.by(() => {
		if (filteredHistory.length === 0) return '';
		return filteredHistory
			.map((h, i) => {
				const x = getX(i, filteredHistory.length);
				const y = getY(h.value);
				return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
			})
			.join(' ');
	});

	let areaPath = $derived.by(() => {
		if (filteredHistory.length === 0) return '';
		const firstX = getX(0, filteredHistory.length);
		const lastX = getX(filteredHistory.length - 1, filteredHistory.length);
		const baseY = padTop + plotHeight;
		return `${linePath} L ${lastX.toFixed(1)} ${baseY} L ${firstX.toFixed(1)} ${baseY} Z`;
	});

	let targetY = $derived(getY(kpi.target_value));
	let minWarningY = $derived(kpi.min_warning ? getY(kpi.min_warning) : null);
	let maxWarningY = $derived(kpi.max_warning ? getY(kpi.max_warning) : null);

	// Grid ticks
	let yTicks = $derived.by(() => {
		const count = 4;
		const ticks = [];
		for (let i = 0; i <= count; i++) {
			const val = minVal + (valRange / count) * i;
			ticks.push({
				val: Math.round(val * 10) / 10,
				y: getY(val)
			});
		}
		return ticks;
	});

	let activePoint = $derived(hoveredIndex !== null && filteredHistory[hoveredIndex] ? filteredHistory[hoveredIndex] : null);
</script>

<div class="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
	
	<!-- Chart Header & Controls -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-slate-100">
		<div>
			<div class="flex items-center space-x-2">
				<h3 class="font-bold text-slate-900 text-base">{kpi.kpi_name}</h3>
				<span class="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-100 text-slate-700">
					{kpi.kpi_code}
				</span>
			</div>
			<p class="text-xs text-slate-500 mt-0.5">
				Historical time-series against process target benchmarks and operational boundaries
			</p>
		</div>

		<!-- Time range buttons & stats -->
		<div class="flex items-center space-x-2">
			<div class="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200/80 text-xs font-medium">
				<button 
					onclick={() => timeRange = '7d'}
					class={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
						timeRange === '7d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
					}`}
				>
					7 Days
				</button>
				<button 
					onclick={() => timeRange = '14d'}
					class={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
						timeRange === '14d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
					}`}
				>
					14 Days
				</button>
				<button 
					onclick={() => timeRange = '30d'}
					class={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
						timeRange === '30d' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
					}`}
				>
					30 Days
				</button>
			</div>
		</div>
	</div>

	<!-- Chart Legend / Reference Keys -->
	<div class="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-3 px-1">
		<div class="flex items-center space-x-1.5">
			<span class="w-3.5 h-1 rounded bg-sky-600"></span>
			<span>Recorded Shift Actuals</span>
		</div>
		<div class="flex items-center space-x-1.5">
			<span class="w-3.5 h-0.5 border-b-2 border-dashed border-emerald-600"></span>
			<span>Target Baseline ({kpi.target_value} {kpi.unit})</span>
		</div>
		{#if kpi.min_warning}
			<div class="flex items-center space-x-1.5">
				<span class="w-3.5 h-0.5 border-b border-amber-500"></span>
				<span>Min Warning ({kpi.min_warning})</span>
			</div>
		{/if}
		{#if kpi.max_warning}
			<div class="flex items-center space-x-1.5">
				<span class="w-3.5 h-0.5 border-b border-amber-500"></span>
				<span>Max Warning ({kpi.max_warning})</span>
			</div>
		{/if}
	</div>

	<!-- Responsive SVG Chart Canvas -->
	<div class="relative w-full overflow-hidden select-none">
		<svg 
			viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
			class="w-full h-auto overflow-visible"
			onmouseleave={() => hoveredIndex = null}
		>
			<defs>
				<!-- Gradient Fill for Area -->
				<linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#0284c7" stop-opacity="0.22" />
					<stop offset="100%" stop-color="#0284c7" stop-opacity="0.01" />
				</linearGradient>
			</defs>

			<!-- Horizontal Grid Lines -->
			{#each yTicks as tick}
				<line 
					x1={padLeft} 
					y1={tick.y} 
					x2={svgWidth - padRight} 
					y2={tick.y} 
					stroke="#f1f5f9" 
					stroke-width="1" 
				/>
				<text 
					x={padLeft - 8} 
					y={tick.y + 4} 
					text-anchor="end" 
					class="text-[10px] font-mono fill-slate-400 font-medium"
				>
					{tick.val}
				</text>
			{/each}

			<!-- Warning Threshold Band (if both min and max exist) -->
			{#if minWarningY && maxWarningY}
				<rect 
					x={padLeft} 
					y={maxWarningY} 
					width={plotWidth} 
					height={minWarningY - maxWarningY} 
					fill="#fef3c7" 
					fill-opacity="0.2" 
				/>
			{/if}

			<!-- Min Warning Line -->
			{#if minWarningY}
				<line 
					x1={padLeft} 
					y1={minWarningY} 
					x2={svgWidth - padRight} 
					y2={minWarningY} 
					stroke="#f59e0b" 
					stroke-width="1" 
					stroke-dasharray="3 3"
				/>
				<text 
					x={svgWidth - padRight + 4} 
					y={minWarningY + 3} 
					class="text-[9px] font-mono fill-amber-600"
				>
					MIN
				</text>
			{/if}

			<!-- Max Warning Line -->
			{#if maxWarningY}
				<line 
					x1={padLeft} 
					y1={maxWarningY} 
					x2={svgWidth - padRight} 
					y2={maxWarningY} 
					stroke="#f59e0b" 
					stroke-width="1" 
					stroke-dasharray="3 3"
				/>
				<text 
					x={svgWidth - padRight + 4} 
					y={maxWarningY + 3} 
					class="text-[9px] font-mono fill-amber-600"
				>
					MAX
				</text>
			{/if}

			<!-- Target Baseline Line -->
			<line 
				x1={padLeft} 
				y1={targetY} 
				x2={svgWidth - padRight} 
				y2={targetY} 
				stroke="#059669" 
				stroke-width="1.5" 
				stroke-dasharray="4 4"
			/>
			<text 
				x={svgWidth - padRight + 4} 
				y={targetY + 3} 
				class="text-[10px] font-mono fill-emerald-700 font-bold"
			>
				TARGET
			</text>

			<!-- Area Fill -->
			{#if areaPath}
				<path d={areaPath} fill="url(#chartGradient)" />
			{/if}

			<!-- Primary Trend Line -->
			{#if linePath}
				<path 
					d={linePath} 
					fill="none" 
					stroke="#0284c7" 
					stroke-width="2.5" 
					stroke-linecap="round" 
					stroke-linejoin="round"
				/>
			{/if}

			<!-- Data Points & Interactive hover zones -->
			{#each filteredHistory as item, i}
				{@const x = getX(i, filteredHistory.length)}
				{@const y = getY(item.value)}
				{@const isHovered = hoveredIndex === i}

				<!-- Vertical Hover Guideline -->
				{#if isHovered}
					<line 
						x1={x} 
						y1={padTop} 
						x2={x} 
						y2={padTop + plotHeight} 
						stroke="#64748b" 
						stroke-width="1" 
						stroke-dasharray="2 2"
					/>
				{/if}

				<!-- Data Point Dot -->
				<circle 
					cx={x} 
					cy={y} 
					r={isHovered ? 5.5 : 2.5} 
					fill={isHovered ? '#0284c7' : '#ffffff'} 
					stroke="#0284c7" 
					stroke-width={isHovered ? 2.5 : 1.5}
					class="transition-all duration-150"
				/>

				<!-- Invisible Hit Target for Hover -->
				<rect 
					x={x - (plotWidth / filteredHistory.length) / 2} 
					y={padTop} 
					width={plotWidth / filteredHistory.length} 
					height={plotHeight} 
					fill="transparent" 
					class="cursor-crosshair"
					onmouseenter={() => hoveredIndex = i}
				/>
			{/each}

			<!-- X-Axis Labels (Dates) -->
			{#each filteredHistory as item, i}
				{#if i % Math.ceil(filteredHistory.length / 7) === 0 || i === filteredHistory.length - 1}
					{@const x = getX(i, filteredHistory.length)}
					<text 
						x={x} 
						y={svgHeight - 12} 
						text-anchor="middle" 
						class="text-[10px] font-mono fill-slate-500"
					>
						{item.date.slice(5)}
					</text>
				{/if}
			{/each}
		</svg>

		<!-- Floating Hover Tooltip (Clean Mode) -->
		{#if activePoint !== null && hoveredIndex !== null}
			{@const xPos = getX(hoveredIndex, filteredHistory.length)}
			{@const yPos = getY(activePoint.value)}
			{@const attainment = Number(((activePoint.value / kpi.target_value) * 100).toFixed(1))}
			
			<div 
				class="absolute pointer-events-none bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-xl ring-1 ring-slate-800 transition-all duration-75 z-20"
				style={`left: ${Math.min(Math.max(xPos - 50, 10), svgWidth - 140)}px; top: ${Math.max(yPos - 55, 10)}px;`}
			>
				<div class="text-[10px] font-mono text-slate-300 font-medium">{activePoint.date}</div>
				<div class="flex items-baseline space-x-1.5 mt-0.5">
					<span class="font-mono font-bold text-sm text-sky-300">
						{activePoint.value.toLocaleString()}
					</span>
					<span class="text-[10px] font-mono text-slate-400">{kpi.unit}</span>
				</div>
				<div class="text-[10px] font-medium text-emerald-300 mt-0.5">
					Attainment: {attainment}%
				</div>
			</div>
		{/if}
	</div>

</div>
