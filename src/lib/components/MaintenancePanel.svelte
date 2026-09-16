<script lang="ts">
	import type { TacticalMaintenanceMetrics, Site } from '$lib/types/kpi';
	import { 
		Wrench, 
		CheckCircle, 
		ShieldCheck
	} from 'lucide-svelte';

	let { 
		site, 
		metrics 
	}: { 
		site: Site; 
		metrics: TacticalMaintenanceMetrics;
	} = $props();

	let isRefinery = $derived(site.type === 'refinery');

	// Specific critical equipment units for Venezuelan facilities
	let equipmentItems = $derived(isRefinery ? [
		{ tag: 'H-101', name: 'Atmospheric Crude Fired Heater', status: 'normal', runHours: 4210, healthPct: 97, lastPMRound: 'Yesterday' },
		{ tag: 'T-102', name: 'Vacuum Flasher Tower & Bottoms Pump', status: 'attention', runHours: 7380, healthPct: 91, lastPMRound: '3 days ago' },
		{ tag: 'E-201A/B', name: 'Crude-Preheat Exchanger Train', status: 'normal', runHours: 5120, healthPct: 95, lastPMRound: 'Today' },
		{ tag: 'TK-501', name: 'Heavy Asphalt Storage & Marine Run-down', status: 'normal', runHours: 8760, healthPct: 99, lastPMRound: '12 hrs ago' }
	] : [
		{ tag: 'K-201', name: 'Steam Cracker Cracked Gas Compressor', status: 'normal', runHours: 6140, healthPct: 96, lastPMRound: 'Today' },
		{ tag: 'P-204B', name: 'Ethylene Quench Water Primary Circulation', status: 'attention', runHours: 3290, healthPct: 88, lastPMRound: 'Yesterday' },
		{ tag: 'R-301', name: 'Polyethylene Fluidized Bed Reactor Line 2', status: 'normal', runHours: 4890, healthPct: 94, lastPMRound: 'Today' },
		{ tag: 'EL-104', name: 'Chlor-Alkali Electrolysis Cellroom Train A', status: 'normal', runHours: 7800, healthPct: 95, lastPMRound: '2 days ago' }
	]);
</script>

<div class="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
	
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
		<div class="flex items-center space-x-2.5">
			<div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
				<Wrench class="w-4 h-4" />
			</div>
			<div>
				<h3 class="font-bold text-slate-900 text-base">Tactical Maintenance & Asset Reliability</h3>
				<p class="text-xs text-slate-500">Balancing strategic production targets with predictive asset health (Pivot 3)</p>
			</div>
		</div>

		<span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
			<ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
			<span>CMMS Sync Active</span>
		</span>
	</div>

	<!-- Top Metrics Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
		
		<!-- Planned vs. Reactive Ratio -->
		<div class="rounded-lg p-3 bg-slate-50 border border-slate-200/80">
			<div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
				Planned vs Reactive
			</div>
			<div class="flex items-baseline space-x-1.5">
				<span class="text-xl font-mono font-bold text-slate-900">{metrics.plannedVsReactiveRatio}%</span>
				<span class="text-xs text-slate-500 font-medium">Planned</span>
			</div>
			<!-- Split progress bar -->
			<div class="mt-2 h-1.5 w-full bg-rose-200 rounded-full overflow-hidden flex">
				<div class="h-full bg-emerald-600 rounded-l-full" style={`width: ${metrics.plannedVsReactiveRatio}%`}></div>
			</div>
			<div class="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
				<span>Target: ≥80%</span>
				<span class="text-emerald-700 font-semibold">Healthy</span>
			</div>
		</div>

		<!-- MTBF Hours -->
		<div class="rounded-lg p-3 bg-slate-50 border border-slate-200/80">
			<div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
				Mean Time Between Failures
			</div>
			<div class="flex items-baseline space-x-1.5">
				<span class="text-xl font-mono font-bold text-slate-900">{metrics.mtbfHours}</span>
				<span class="text-xs text-slate-500 font-medium">Operating Hrs</span>
			</div>
			<div class="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium mt-2">
				<CheckCircle class="w-3 h-3 text-emerald-600" />
				<span>+42 hrs vs prior month</span>
			</div>
		</div>

		<!-- Equipment Availability -->
		<div class="rounded-lg p-3 bg-slate-50 border border-slate-200/80">
			<div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
				Operational Availability
			</div>
			<div class="flex items-baseline space-x-1.5">
				<span class="text-xl font-mono font-bold text-slate-900">{metrics.operationalAvailabilityPct}%</span>
				<span class="text-xs text-slate-500 font-medium">Uptime</span>
			</div>
			<div class="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
				<div class="h-full bg-sky-600 rounded-full" style={`width: ${metrics.operationalAvailabilityPct}%`}></div>
			</div>
			<div class="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
				<span>Benchmark: 95.0%</span>
				<span class="text-sky-700 font-semibold">Nominal</span>
			</div>
		</div>

		<!-- PM Compliance & Work Orders -->
		<div class="rounded-lg p-3 bg-slate-50 border border-slate-200/80">
			<div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
				PM Route Compliance
			</div>
			<div class="flex items-baseline space-x-1.5">
				<span class="text-xl font-mono font-bold text-slate-900">{metrics.preventativeCompliancePct}%</span>
				<span class="text-xs text-slate-500 font-medium">Completed</span>
			</div>
			<div class="text-[11px] text-slate-500 mt-2 font-mono">
				<span class="font-bold text-amber-700">{metrics.openWorkOrders}</span> open work orders
			</div>
		</div>

	</div>

	<!-- Critical Asset Train Status -->
	<div class="overflow-x-auto">
		<table class="w-full text-left text-xs text-slate-700">
			<thead>
				<tr class="border-b border-slate-200 text-[11px] font-semibold uppercase text-slate-400">
					<th class="py-2.5 px-3">Equipment Tag</th>
					<th class="py-2.5 px-3">Asset Description</th>
					<th class="py-2.5 px-3">Condition Index</th>
					<th class="py-2.5 px-3">Run Hours</th>
					<th class="py-2.5 px-3">Last PM Round</th>
					<th class="py-2.5 px-3 text-right">Status</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-100">
				{#each equipmentItems as eq}
					<tr class="hover:bg-slate-50/70 transition-colors">
						<td class="py-2.5 px-3 font-mono font-bold text-slate-800">{eq.tag}</td>
						<td class="py-2.5 px-3 font-medium text-slate-900">{eq.name}</td>
						<td class="py-2.5 px-3">
							<div class="flex items-center space-x-2">
								<div class="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
									<div 
										class={`h-full rounded-full ${eq.healthPct >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
										style={`width: ${eq.healthPct}%`}
									></div>
								</div>
								<span class="font-mono text-[11px]">{eq.healthPct}%</span>
							</div>
						</td>
						<td class="py-2.5 px-3 font-mono text-slate-500">{eq.runHours.toLocaleString()} hrs</td>
						<td class="py-2.5 px-3 text-slate-500">{eq.lastPMRound}</td>
						<td class="py-2.5 px-3 text-right">
							{#if eq.status === 'normal'}
								<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
									Online
								</span>
							{:else}
								<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
									Observed
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

</div>
