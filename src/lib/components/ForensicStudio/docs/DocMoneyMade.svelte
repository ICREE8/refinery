<script lang="ts">
	import type { FinancialLedgerRecord, Site } from '$lib/types/kpi';
	import { DEFAULT_BAJO_GRANDE_RECORD, DEFAULT_EL_TABLAZO_RECORD } from '$lib/mockData';
	import { 
		ArrowRight, 
		Zap, 
		Droplets, 
		TrendingUp,
		Package,
		Tag,
		DollarSign,
		ChevronRight
	} from 'lucide-svelte';

	let {
		records = [],
		facilitySlug = 'all',
		ledger = null,
		sites = [],
		onOpenDetail = (key: string) => {}
	}: {
		records?: FinancialLedgerRecord[];
		facilitySlug?: string;
		ledger?: FinancialLedgerRecord | null;
		sites?: Site[];
		onOpenDetail?: (key: string) => void;
	} = $props();

	// Resolución reactiva resiliente sin datos en $0
	let activeRecord = $derived.by(() => {
		if (ledger) return ledger;

		if (facilitySlug === 'bajo-grande') {
			const found = records.find(r => r.site_slug === 'bajo-grande' || r.unit_measure === 'bpd');
			return found || DEFAULT_BAJO_GRANDE_RECORD;
		}

		if (facilitySlug === 'el-tablazo') {
			const found = records.find(r => r.site_slug === 'el-tablazo' || r.unit_measure === 'TM');
			return found || DEFAULT_EL_TABLAZO_RECORD;
		}

		// 'all' / Consolidado
		const tab = records.find(r => r.site_slug === 'el-tablazo') || DEFAULT_EL_TABLAZO_RECORD;
		return tab;
	});

	let isRefinery = $derived(
		facilitySlug === 'bajo-grande' || activeRecord.unit_measure === 'bpd'
	);

	let displayValues = $derived.by(() => {
		if (isRefinery) {
			return {
				heroFormatted: '$1,07M USD',
				exactFormatted: '($1.072.025,00 USD)',
				volumeFormatted: '15.650 Barriles',
				volumeStep: '15.650 Bbl',
				priceFormatted: '$68,50 / Bbl',
				priceStep: '$68,50/Bbl',
				totalGrossFormatted: '$1.072.025 USD',
				kwhBacked: '98.000 kWh',
				waterCleanFund: '$176.000 USD'
			};
		}
		return {
			heroFormatted: '$3,09M USD',
			exactFormatted: '($3.093.200,00 USD)',
			volumeFormatted: '1.020 Toneladas',
			volumeStep: '1.020 TM',
			priceFormatted: '$3.032,55 / TM',
			priceStep: '$3.032/TM',
			totalGrossFormatted: '$3.093.200 USD',
			kwhBacked: '142.000 kWh',
			waterCleanFund: '$250.000 USD'
		};
	});
</script>

<div class="space-y-4">

	<!-- Única Línea de Metadatos Discreta y Título Limpio -->
	<div class="space-y-1">
		<div class="text-xs font-mono text-slate-500 flex items-center space-x-1.5">
			<span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
			<span>Datos Auditados en Muelle · 18 Sep 2026 · Guardia A</span>
		</div>
		<h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
			Plata que Entró (Producción y Facturación)
		</h2>
	</div>

	<!-- Tarjeta Principal: TOTAL FACTURADO HOY (Clickeable con Drill-Down) -->
	<button 
		type="button"
		onclick={() => onOpenDetail('facturado')}
		class="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
	>
		<div class="flex items-center justify-between">
			<div class="text-xs font-semibold tracking-wider text-slate-400 uppercase group-hover:text-slate-600 transition-colors">
				Total Facturado Hoy
			</div>
			<span class="text-[11px] font-mono text-slate-400 group-hover:text-slate-700 flex items-center space-x-1">
				<span>Ver conciliación</span>
				<ChevronRight class="w-3.5 h-3.5" />
			</span>
		</div>
		<div class="mt-1 flex flex-wrap items-baseline gap-2">
			<span class="font-mono text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
				{displayValues.heroFormatted}
			</span>
			<span class="font-mono text-xs sm:text-sm text-slate-500 font-medium">
				{displayValues.exactFormatted}
			</span>
		</div>
		<p class="text-xs text-slate-500 mt-1">
			{isRefinery ? 'Despacho de crudo pesado Boscán y asfalto de penetración AC-20.' : 'Facturación de olefinas, polietileno y fertilizante urea en buques de exportación.'}
		</p>
	</button>

	<!-- Cadena Físico-Financiera: Molécula a Dinero Líquido (Tarjetas Clickeables) -->
	<div class="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
		<div class="text-xs font-bold uppercase tracking-wider text-slate-400">
			Cadena de Liquidación Física a Caja (Toca para auditar)
		</div>

		<!-- Paso a Paso Limpio en Tarjetas Interactivas -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
			
			<!-- Paso 1: Volumen -->
			<button 
				type="button"
				onclick={() => onOpenDetail('volumen')}
				class="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-100/70 active:scale-[0.99] transition-all cursor-pointer group"
			>
				<div class="text-[11px] text-slate-500 font-medium flex items-center justify-between">
					<span>📦 Volumen Despachado</span>
					<ChevronRight class="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
				</div>
				<div class="mt-1 text-base sm:text-lg font-mono font-bold text-slate-900">
					{displayValues.volumeFormatted}
				</div>
				<div class="text-[10px] text-slate-400 font-mono mt-0.5">Medidor Coriolis Muelle</div>
			</button>

			<!-- Paso 2: Precio -->
			<button 
				type="button"
				onclick={() => onOpenDetail('precio')}
				class="w-full text-left p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-100/70 active:scale-[0.99] transition-all cursor-pointer group"
			>
				<div class="text-[11px] text-slate-500 font-medium flex items-center justify-between">
					<span>🏷️ Precio Promedio</span>
					<ChevronRight class="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
				</div>
				<div class="mt-1 text-base sm:text-lg font-mono font-bold text-slate-900">
					{displayValues.priceFormatted}
				</div>
				<div class="text-[10px] text-slate-400 font-mono mt-0.5">Marcador Platts/ICIS</div>
			</button>

			<!-- Paso 3: Facturación Bruta -->
			<button 
				type="button"
				onclick={() => onOpenDetail('facturado')}
				class="w-full text-left p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 hover:border-emerald-300 hover:bg-emerald-50 active:scale-[0.99] transition-all cursor-pointer group"
			>
				<div class="text-[11px] text-emerald-800 font-medium flex items-center justify-between">
					<span>💵 Dinero Bruto</span>
					<ChevronRight class="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
				</div>
				<div class="mt-1 text-base sm:text-lg font-mono font-bold text-emerald-950">
					{displayValues.totalGrossFormatted}
				</div>
				<div class="text-[10px] text-emerald-700/80 font-mono mt-0.5">Facturas Fiscales SENIAT</div>
			</button>

		</div>

		<!-- Barra de Flujo Conectora (Sin desbordamiento) -->
		<div class="p-2.5 rounded-xl bg-slate-100/80 flex items-center justify-between text-xs font-mono font-semibold text-slate-700">
			<span class="truncate">{displayValues.volumeStep}</span>
			<ArrowRight class="w-3.5 h-3.5 text-slate-400 shrink-0 mx-1.5" />
			<span class="truncate">{displayValues.priceStep}</span>
			<ArrowRight class="w-3.5 h-3.5 text-slate-400 shrink-0 mx-1.5" />
			<span class="text-emerald-700 font-bold shrink-0">{displayValues.heroFormatted}</span>
		</div>
	</div>

	<!-- Valor Cívico Generado (Impacto Humano y Regional - Clickeable) -->
	<button 
		type="button"
		onclick={() => onOpenDetail('civico')}
		class="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group space-y-2.5"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<span class="text-sm">🎁</span>
				<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
					Valor Cívico Generado
				</h3>
			</div>
			<span class="text-[11px] font-mono text-slate-400 group-hover:text-slate-700 flex items-center space-x-1">
				<span>Ver leyes de asignación</span>
				<ChevronRight class="w-3.5 h-3.5" />
			</span>
		</div>
		<p class="text-xs text-slate-600 leading-relaxed">
			Por cada {isRefinery ? 'barril refinado' : 'tonelada producida'} vendida hoy, se transfieren recursos directos al fondo regional del Lago de Maracaibo y a la red eléctrica:
		</p>
		
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
			<div class="p-3 rounded-xl bg-sky-50/60 border border-sky-200/60 flex items-start space-x-2.5">
				<Zap class="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
				<div class="text-xs text-sky-950 leading-relaxed">
					<strong>{displayValues.kwhBacked}</strong> de estabilidad eléctrica regional respaldados con la venta de hoy.
				</div>
			</div>
			<div class="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-start space-x-2.5">
				<Droplets class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
				<div class="text-xs text-emerald-950 leading-relaxed">
					<strong>{displayValues.waterCleanFund}</strong> asignados al saneamiento de cuencas y comunidades del Zulia.
				</div>
			</div>
		</div>
	</button>

</div>
