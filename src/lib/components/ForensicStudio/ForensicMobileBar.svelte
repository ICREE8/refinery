<script lang="ts">
	import type { Site } from '$lib/types/kpi';
	import { 
		ChevronDown, 
		X, 
		Layers, 
		Wrench, 
		CheckCircle2, 
		ShieldCheck
	} from 'lucide-svelte';

	let {
		sites = [],
		activeFacility = 'all',
		activeDoc = '01_produccion_y_ventas',
		onSelectFacility = (facility: string) => {},
		onSelectDoc = (docId: string) => {},
		onOpenMaintenance = () => {}
	}: {
		sites: Site[];
		activeFacility: string;
		activeDoc: string;
		onSelectFacility?: (facility: string) => void;
		onSelectDoc?: (docId: string) => void;
		onOpenMaintenance?: () => void;
	} = $props();

	let isBottomSheetOpen = $state(false);

	const docPills = [
		{ id: '01_produccion_y_ventas', label: '💰 01_producción', badge: 'Ventas' },
		{ id: '02_costos_operativos', label: '⚙️ 02_costos', badge: 'Costos' },
		{ id: '03_fugas_y_desvios', label: '🚨 03_mermas', badge: 'Fugas' },
		{ id: '04_cuenta_bancaria', label: '🏦 04_banco', badge: 'Banco' }
	];

	let facilityName = $derived.by(() => {
		if (activeFacility === 'bajo-grande') return 'Refinería Bajo Grande';
		if (activeFacility === 'el-tablazo') return 'Complejo El Tablazo';
		return 'Consolidado Cuenca del Lago';
	});

	let facilityEmoji = $derived.by(() => {
		if (activeFacility === 'bajo-grande') return '🏭';
		if (activeFacility === 'el-tablazo') return '🧪';
		return '🌐';
	});

	function handleFacilityPick(slug: string) {
		onSelectFacility(slug);
		isBottomSheetOpen = false;
	}
</script>

<div class="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
	
	<!-- Fila Superior: Selector de Instalación y Botón de Telemetría -->
	<div class="flex items-center justify-between px-3 sm:px-4 h-14 gap-2">
		
		<!-- Selector de Instalación (Abre Bottom Sheet) -->
		<button 
			onclick={() => isBottomSheetOpen = true}
			class="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 transition-colors min-h-[44px] cursor-pointer min-w-0 flex-1 truncate"
			aria-label="Seleccionar Instalación Auditada"
		>
			<span class="text-sm shrink-0">{facilityEmoji}</span>
			<span class="truncate">{facilityName}</span>
			<ChevronDown class="w-3.5 h-3.5 text-slate-400 shrink-0" />
		</button>

		<!-- Botón de Telemetría e Ingeniería -->
		<button 
			onclick={onOpenMaintenance}
			class="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-amber-300/80 bg-amber-50 text-amber-900 text-xs font-bold transition-colors min-h-[44px] cursor-pointer shrink-0"
			title="Telemetría de Planta e Ingeniería"
		>
			<Wrench class="w-4 h-4 text-amber-700 shrink-0" />
			<span class="truncate">Telemetría</span>
		</button>

	</div>

	<!-- Riel Horizontal de Píldoras de Documentos Forenses -->
	<div class="flex overflow-x-auto no-scrollbar gap-2 py-2 px-3 sm:px-4 border-t border-slate-100">
		{#each docPills as item}
			{@const isSelected = activeDoc === item.id || (activeDoc === '01_money_made' && item.id === '01_produccion_y_ventas') || (activeDoc === '02_cost_to_make' && item.id === '02_costos_operativos') || (activeDoc === '03_missing_money' && item.id === '03_fugas_y_desvios') || (activeDoc === '04_bank_status' && item.id === '04_cuenta_bancaria')}
			<button 
				onclick={() => onSelectDoc(item.id)}
				class={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all min-h-[44px] cursor-pointer ${
					isSelected 
						? 'bg-slate-900 text-white font-bold shadow-xs' 
						: 'bg-slate-100 text-slate-600 hover:text-slate-900'
				}`}
			>
				<span class="whitespace-nowrap">{item.label}</span>
				<span class={`text-[9px] uppercase px-1 rounded whitespace-nowrap ${
					isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
				}`}>
					{item.badge}
				</span>
			</button>
		{/each}
	</div>

</div>

<!-- Modal Bottom Sheet Móvil para Selección de Instalación -->
{#if isBottomSheetOpen}
	<div class="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
		
		<!-- Ventana del Bottom Sheet -->
		<div class="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
			
			<!-- Encabezado del Bottom Sheet -->
			<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<span class="text-base">📋</span>
					<h3 class="font-bold text-slate-900 text-sm">Seleccionar Instalación a Auditar</h3>
				</div>
				<button 
					onclick={() => isBottomSheetOpen = false}
					class="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Opciones de Instalación -->
			<div class="p-5 space-y-2.5 overflow-y-auto">
				
				<!-- Consolidado Cuenca del Lago -->
				<button 
					onclick={() => handleFacilityPick('all')}
					class={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all min-h-[48px] ${
						activeFacility === 'all' 
							? 'bg-emerald-50/50 border-emerald-300 text-slate-900 font-bold' 
							: 'bg-slate-50 border-slate-200/80 text-slate-700'
					}`}
				>
					<div class="flex items-center space-x-3">
						<div class="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-lg shrink-0">
							🌐
						</div>
						<div>
							<div class="font-bold text-sm">Consolidado Cuenca del Lago</div>
							<div class="text-xs text-slate-500 font-normal">Todas las Instalaciones Combinadas</div>
						</div>
					</div>
					{#if activeFacility === 'all'}
						<CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
					{/if}
				</button>

				<!-- Refinería Bajo Grande -->
				<button 
					onclick={() => handleFacilityPick('bajo-grande')}
					class={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all min-h-[48px] ${
						activeFacility === 'bajo-grande' 
							? 'bg-amber-50/50 border-amber-300 text-slate-900 font-bold' 
							: 'bg-slate-50 border-slate-200/80 text-slate-700'
					}`}
				>
					<div class="flex items-center space-x-3">
						<div class="w-9 h-9 rounded-lg bg-white border border-amber-200 flex items-center justify-center text-lg shrink-0">
							🏭
						</div>
						<div>
							<div class="font-bold text-sm">Refinería Bajo Grande</div>
							<div class="text-xs text-slate-500 font-normal">Petróleo Pesado y Asfalto</div>
						</div>
					</div>
					{#if activeFacility === 'bajo-grande'}
						<CheckCircle2 class="w-5 h-5 text-amber-600 shrink-0" />
					{/if}
				</button>

				<!-- Complejo Petroquímico El Tablazo -->
				<button 
					onclick={() => handleFacilityPick('el-tablazo')}
					class={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all min-h-[48px] ${
						activeFacility === 'el-tablazo' 
							? 'bg-sky-50/50 border-sky-300 text-slate-900 font-bold' 
							: 'bg-slate-50 border-slate-200/80 text-slate-700'
					}`}
				>
					<div class="flex items-center space-x-3">
						<div class="w-9 h-9 rounded-lg bg-white border border-sky-200 flex items-center justify-center text-lg shrink-0">
							🧪
						</div>
						<div>
							<div class="font-bold text-sm">Complejo El Tablazo (Ana María Campos)</div>
							<div class="text-xs text-slate-500 font-normal">Olefinas y Fertilizantes</div>
						</div>
					</div>
					{#if activeFacility === 'el-tablazo'}
						<CheckCircle2 class="w-5 h-5 text-sky-600 shrink-0" />
					{/if}
				</button>

			</div>

		</div>
	</div>
{/if}
