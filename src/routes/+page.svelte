<script lang="ts">
	import type { PageData } from './$types';
	import type { Site } from '$lib/types/kpi';
	import Navbar from '$lib/components/Navbar.svelte';
	import ForensicStudio from '$lib/components/ForensicStudio/ForensicStudio.svelte';
	import TacticalMaintenanceModal from '$lib/components/TacticalMaintenanceModal.svelte';
	import DataIntakeModal from '$lib/components/DataIntakeModal.svelte';
	import ExecutiveBrief from '$lib/components/ExecutiveBrief.svelte';
	import { 
		INITIAL_SITES, 
		INITIAL_KPI_DEFINITIONS, 
		getInMemorySummaryRows, 
		SITE_MAINTENANCE_METRICS,
		getInMemoryFinancialLedgers
	} from '$lib/mockData';
	import { generateShiftBrief } from '$lib/ai/shiftBrief';

	let { data }: { data: PageData } = $props();

	let sites = $derived(data.sites || INITIAL_SITES);
	let allRows = $state(getInMemorySummaryRows());
	let financialLedgers = $derived(data.financialLedgers || getInMemoryFinancialLedgers());

	let currentFacility = $state<string>('all');

	let isIntakeOpen = $state(false);
	let isBriefOpen = $state(false);
	let isMaintenanceOpen = $state(false);

	let activeSiteObj = $derived.by(() => {
		if (currentFacility === 'bajo-grande') {
			return sites.find(s => s.slug === 'bajo-grande') || sites[0];
		}
		if (currentFacility === 'el-tablazo') {
			return sites.find(s => s.slug === 'el-tablazo') || sites[1] || sites[0];
		}
		return sites[0];
	});

	let briefData = $derived(
		generateShiftBrief(
			activeSiteObj,
			allRows.filter(r => r.site_slug === activeSiteObj.slug).slice(-6),
			SITE_MAINTENANCE_METRICS[activeSiteObj.slug]
		)
	);
</script>

<div class="min-h-screen bg-slate-50/70 flex flex-col">
	
	<!-- Header Unificado de 56px con Selector Compacto y 2 Botones de Acción -->
	<Navbar 
		sites={sites} 
		currentFacility={currentFacility}
		onSelectFacility={(fac) => currentFacility = fac}
		onOpenMaintenance={() => isMaintenanceOpen = true}
		onOpenBrief={() => isBriefOpen = true}
	/>

	<!-- Estudio Forense Ciudadano Ultra-Limpio (Linear / Family iOS Mobile-First) -->
	<ForensicStudio 
		records={financialLedgers}
		sites={sites}
		initialFacility={currentFacility}
		activeFacility={currentFacility}
		onOpenMaintenance={() => isMaintenanceOpen = true}
	/>

	<!-- Pie Sutil con Enlace a Carga de Datos (Sin saturar la vista principal) -->
	<footer class="border-t border-slate-200/80 bg-white/60 py-5 text-center text-xs text-slate-400 space-y-1">
		<div>
			LakeKPI · Auditoría Forense y Ciudadana de Hidrocarburos y Petroquímica · Cuenca del Lago de Maracaibo
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
		site={activeSiteObj}
		kpiDefinitions={INITIAL_KPI_DEFINITIONS.filter(d => d.site_type === activeSiteObj.type)}
		onClose={() => isIntakeOpen = false}
		onDataIngested={() => { allRows = getInMemorySummaryRows(); }}
	/>

	<!-- Modal de Resumen Ejecutivo (IA) -->
	<ExecutiveBrief 
		isOpen={isBriefOpen}
		site={activeSiteObj}
		brief={briefData}
		onClose={() => isBriefOpen = false}
	/>

	<!-- Modal de Telemetría de Planta e Ingeniería -->
	<TacticalMaintenanceModal 
		isOpen={isMaintenanceOpen}
		sites={sites}
		initialSite={activeSiteObj}
		metricsBySlug={SITE_MAINTENANCE_METRICS}
		onClose={() => isMaintenanceOpen = false}
	/>

</div>
