<script lang="ts">
	import type { PageData } from './$types';
	import Navbar from '$lib/components/Navbar.svelte';
	import ForensicStudio from '$lib/components/ForensicStudio/ForensicStudio.svelte';
	import TacticalMaintenanceModal from '$lib/components/TacticalMaintenanceModal.svelte';
	import DataIntakeModal from '$lib/components/DataIntakeModal.svelte';
	import ExecutiveBrief from '$lib/components/ExecutiveBrief.svelte';
	import { 
		INITIAL_KPI_DEFINITIONS, 
		SITE_MAINTENANCE_METRICS
	} from '$lib/mockData';
	import { generateShiftBrief } from '$lib/ai/shiftBrief';
	import { goto, invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const site = $derived(data.site);
	const allSites = $derived(data.allSites || []);

	let isIntakeOpen = $state(false);
	let isBriefOpen = $state(false);
	let isMaintenanceOpen = $state(false);

	let briefData = $derived(
		generateShiftBrief(site, data.latestKpis, SITE_MAINTENANCE_METRICS[site.slug] || {
			plannedVsReactiveRatio: 80.0,
			mtbfHours: 750,
			equipmentUtilizationPct: 93.0,
			operationalAvailabilityPct: 96.0,
			openWorkOrders: 12,
			preventativeCompliancePct: 95.0
		})
	);

	function handleFacilitySelect(fac: string) {
		if (fac === 'all') {
			goto('/');
		} else {
			goto(`/${fac}`);
		}
	}

	function handleDataIngested() {
		invalidateAll();
	}
</script>

<div class="min-h-screen bg-slate-50/70 flex flex-col">
	
	<!-- Header Unificado 56px -->
	<Navbar 
		sites={allSites} 
		currentFacility={site.slug}
		onSelectFacility={handleFacilitySelect}
		onOpenMaintenance={() => isMaintenanceOpen = true}
		onOpenBrief={() => isBriefOpen = true}
	/>

	<!-- Estudio Forense Ciudadano Ultra-Limpio prebloqueado en la instalación -->
	<ForensicStudio 
		records={data.financialLedgers || []}
		sites={allSites}
		initialFacility={site.slug}
		activeFacility={site.slug}
		onOpenMaintenance={() => isMaintenanceOpen = true}
	/>

	<!-- Pie Sutil -->
	<footer class="border-t border-slate-200/80 bg-white/60 py-5 text-center text-xs text-slate-400 space-y-1">
		<div>
			LakeKPI · Auditoría Forense y Ciudadana · {site.name}
		</div>
		<div>
			<button 
				onclick={() => isIntakeOpen = true}
				class="text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
			>
				Cargar Datos Operacionales (Manual / CSV)
			</button>
		</div>
	</footer>

	<!-- Modal de Carga de Datos -->
	<DataIntakeModal 
		isOpen={isIntakeOpen}
		site={site}
		kpiDefinitions={INITIAL_KPI_DEFINITIONS.filter(d => d.site_type === site.type)}
		onClose={() => isIntakeOpen = false}
		onDataIngested={handleDataIngested}
	/>

	<!-- Modal de Resumen Ejecutivo (IA) -->
	<ExecutiveBrief 
		isOpen={isBriefOpen}
		site={site}
		brief={briefData}
		onClose={() => isBriefOpen = false}
	/>

	<!-- Modal de Telemetría de Planta e Ingeniería -->
	<TacticalMaintenanceModal 
		isOpen={isMaintenanceOpen}
		sites={allSites}
		initialSite={site}
		metricsBySlug={SITE_MAINTENANCE_METRICS}
		onClose={() => isMaintenanceOpen = false}
	/>

</div>
