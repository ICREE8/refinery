<script lang="ts">
	import type { Site } from '$lib/types/kpi';
	import { 
		Building2, 
		Flame, 
		Droplets, 
		Layers, 
		Wrench, 
		ShieldCheck, 
		FileText
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

	const docFiles = [
		{
			id: '01_produccion_y_ventas',
			name: '01_produccion_y_ventas.doc',
			title: 'Plata que Entró (Producción y Facturación)',
			emoji: '💰',
			badge: 'Ingresos'
		},
		{
			id: '02_costos_operativos',
			name: '02_costos_operativos.doc',
			title: '¿Cuánto Costó Producirlo? (Electricidad, Gas y Mano de Obra)',
			emoji: '⚙️',
			badge: 'Costos'
		},
		{
			id: '03_fugas_y_desvios',
			name: '03_fugas_y_desvios.doc',
			title: 'Alerta de Fugas y Mermas (¿Dónde se perdió producto o plata?)',
			emoji: '🚨',
			badge: 'Mermas'
		},
		{
			id: '04_cuenta_bancaria',
			name: '04_cuenta_bancaria.doc',
			title: 'Plata en Mano vs. Facturas por Cobrar',
			emoji: '🏦',
			badge: 'Banco'
		}
	];
</script>

<aside class="hidden lg:flex w-80 flex-shrink-0 flex-col justify-between border-r border-slate-200/80 bg-slate-50/60 p-5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
	
	<!-- Superior: Selector de Instalación y Archivos de Auditoría -->
	<div class="space-y-6">
		
		<!-- Identificador del Estudio Forense -->
		<div class="space-y-1">
			<div class="flex items-center space-x-2.5">
				<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white flex items-center justify-center shadow-xs font-bold text-xs font-mono">
					LK
				</div>
				<div>
					<h1 class="text-sm font-black text-slate-900 tracking-tight leading-none">
						Auditoría Forense Ciudadana
					</h1>
					<span class="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
						Cuenca del Lago de Maracaibo
					</span>
				</div>
			</div>
		</div>

		<!-- Selector de Ámbito / Instalación -->
		<div class="space-y-1.5">
			<div class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
				Ámbito de Auditoría
			</div>

			<div class="space-y-1">
				<!-- Consolidado de la Cuenca -->
				<button 
					onclick={() => onSelectFacility('all')}
					class={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
						activeFacility === 'all'
							? 'bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
					}`}
				>
					<div class="flex items-center space-x-2 truncate">
						<Layers class="w-4 h-4 text-slate-400 shrink-0" />
						<div class="truncate">
							<div class="truncate text-slate-900 font-bold">Consolidado Cuenca del Lago</div>
							<div class="text-[10px] text-slate-500 font-normal">Todas las Instalaciones</div>
						</div>
					</div>
					{#if activeFacility === 'all'}
						<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
					{/if}
				</button>

				<!-- Refinería Bajo Grande -->
				<button 
					onclick={() => onSelectFacility('bajo-grande')}
					class={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
						activeFacility === 'bajo-grande'
							? 'bg-white text-slate-900 shadow-xs border border-amber-200 font-bold'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
					}`}
				>
					<div class="flex items-center space-x-2 truncate">
						<span class="text-sm shrink-0">🏭</span>
						<div class="truncate">
							<div class="truncate text-slate-900 font-bold">Refinería Bajo Grande</div>
							<div class="text-[10px] text-slate-500 font-normal truncate">Petróleo Pesado y Asfalto</div>
						</div>
					</div>
					{#if activeFacility === 'bajo-grande'}
						<span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
					{/if}
				</button>

				<!-- Complejo El Tablazo -->
				<button 
					onclick={() => onSelectFacility('el-tablazo')}
					class={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
						activeFacility === 'el-tablazo'
							? 'bg-white text-slate-900 shadow-xs border border-sky-200 font-bold'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
					}`}
				>
					<div class="flex items-center space-x-2 truncate">
						<span class="text-sm shrink-0">🧪</span>
						<div class="truncate">
							<div class="truncate text-slate-900 font-bold">Complejo El Tablazo</div>
							<div class="text-[10px] text-slate-500 font-normal truncate">Olefinas y Fertilizantes</div>
						</div>
					</div>
					{#if activeFacility === 'el-tablazo'}
						<span class="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Directorio de Archivos Forenses -->
		<div class="space-y-1.5">
			<div class="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
				<span>Archivos Forenses</span>
				<span class="text-[10px] font-normal text-slate-400">4 documentos</span>
			</div>

			<nav class="space-y-1" aria-label="Árbol de Documentos Forenses">
				{#each docFiles as doc}
					{@const isActive = activeDoc === doc.id || (activeDoc === '01_money_made' && doc.id === '01_produccion_y_ventas') || (activeDoc === '02_cost_to_make' && doc.id === '02_costos_operativos') || (activeDoc === '03_missing_money' && doc.id === '03_fugas_y_desvios') || (activeDoc === '04_bank_status' && doc.id === '04_cuenta_bancaria')}
					<button 
						onclick={() => onSelectDoc(doc.id)}
						class={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
							isActive
								? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
						}`}
					>
						<div class="flex items-center space-x-2.5 truncate">
							<span class="text-sm shrink-0">{doc.emoji}</span>
							<div class="truncate">
								<div class="font-mono text-xs truncate">{doc.name}</div>
								<div class="text-[10px] text-slate-500 font-normal truncate">{doc.title}</div>
							</div>
						</div>

						<span class={`px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0 ml-1 ${
							isActive ? 'bg-slate-900 text-white font-bold' : 'bg-slate-200/60 text-slate-600'
						}`}>
							{doc.badge}
						</span>
					</button>
				{/each}
			</nav>
		</div>

	</div>

	<!-- Inferior: Botón de Telemetría e Indicador de Integridad -->
	<div class="pt-4 border-t border-slate-200/80 space-y-3">
		
		<!-- Botón de Telemetría e Ingeniería -->
		<button 
			onclick={onOpenMaintenance}
			class="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl border border-amber-300/80 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-bold shadow-xs transition-all cursor-pointer"
			title="Abrir Telemetría de Planta e Ingeniería"
		>
			<Wrench class="w-4 h-4 text-amber-700 shrink-0" />
			<span class="truncate">Telemetría de Planta e Ingeniería</span>
		</button>

		<!-- Estado de Integridad Supabase -->
		<div class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
			<ShieldCheck class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
			<span class="truncate">Seguridad Criptográfica RLS Activa</span>
		</div>
	</div>

</aside>
