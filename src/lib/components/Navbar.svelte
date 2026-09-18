<script lang="ts">
	import type { Site } from '$lib/types/kpi';
	import { 
		Activity, 
		Wrench, 
		Sparkles 
	} from 'lucide-svelte';

	let { 
		sites = [], 
		currentFacility = 'el-tablazo',
		onSelectFacility = (facility: string) => {},
		onOpenMaintenance = () => {},
		onOpenBrief = () => {}
	}: { 
		sites?: Site[]; 
		currentFacility: string;
		onSelectFacility?: (facility: string) => void;
		onOpenMaintenance?: () => void;
		onOpenBrief?: () => void;
	} = $props();

	// Normalizar para alternador binario de instalaciones principales
	let activeSlug = $derived(
		currentFacility === 'bajo-grande' ? 'bajo-grande' : 'el-tablazo'
	);
</script>

<header class="w-full bg-white">
	
	<!-- Row 1: App Bar (h-12 border-b border-slate-200/60 bg-white px-4 flex items-center justify-between) -->
	<div class="h-12 border-b border-slate-200/60 bg-white px-4 flex items-center justify-between max-w-5xl mx-auto w-full">
		
		<!-- Left: Brand icon + LakeKPI + AUDITORÍA badge -->
		<div class="flex items-center space-x-2">
			<a href="/" class="flex items-center space-x-2 group">
				<div class="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
					<Activity class="w-3.5 h-3.5 text-sky-400" />
				</div>
				<span class="font-bold text-slate-900 tracking-tight text-sm sm:text-base">LakeKPI</span>
			</a>
			<span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider">
				Auditoría
			</span>
		</div>

		<!-- Right: Action buttons with 36x36px tap targets (Max 2 clean icon buttons) -->
		<div class="flex items-center space-x-2">
			<!-- 🔧 Telemetría -->
			<button 
				onclick={onOpenMaintenance}
				class="w-9 h-9 rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shadow-2xs"
				title="Telemetría de Planta e Ingeniería"
				aria-label="Abrir Telemetría de Planta"
			>
				<Wrench class="w-4 h-4 text-amber-600" />
			</button>

			<!-- ✨ Resumen IA -->
			<button 
				onclick={onOpenBrief}
				class="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
				title="Resumen Ejecutivo IA de Guardia"
				aria-label="Generar Resumen Ejecutivo IA"
			>
				<Sparkles class="w-4 h-4 text-amber-300" />
			</button>
		</div>

	</div>

	<!-- Row 2: Facility Segment Switcher (px-4 py-2 bg-slate-50/80 border-b border-slate-200/80) -->
	<div class="px-4 py-2 bg-slate-50/80 border-b border-slate-200/80">
		<div class="max-w-4xl mx-auto flex items-center">
			<div class="grid grid-cols-2 p-1 bg-slate-200/60 rounded-xl w-full max-w-md mx-auto sm:mx-0 gap-1 border border-slate-200/80">
				
				<!-- 🛢️ Refinería Bajo Grande -->
				<button 
					onclick={() => onSelectFacility('bajo-grande')}
					class={`cursor-pointer transition-all py-1.5 px-3 rounded-lg text-xs sm:text-sm text-center flex items-center justify-center space-x-1.5 truncate ${
						activeSlug === 'bajo-grande'
							? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-medium'
							: 'text-slate-500 hover:text-slate-800 font-normal'
					}`}
				>
					<span class="shrink-0">🛢️</span>
					<span class="truncate">Refinería Bajo Grande</span>
				</button>

				<!-- 🏭 Complejo El Tablazo -->
				<button 
					onclick={() => onSelectFacility('el-tablazo')}
					class={`cursor-pointer transition-all py-1.5 px-3 rounded-lg text-xs sm:text-sm text-center flex items-center justify-center space-x-1.5 truncate ${
						activeSlug === 'el-tablazo'
							? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-medium'
							: 'text-slate-500 hover:text-slate-800 font-normal'
					}`}
				>
					<span class="shrink-0">🏭</span>
					<span class="truncate">Complejo El Tablazo</span>
				</button>

			</div>
		</div>
	</div>

</header>
