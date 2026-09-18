<script lang="ts">
	import type { FinancialLedgerRecord } from '$lib/types/kpi';
	import { DEFAULT_BAJO_GRANDE_RECORD, DEFAULT_EL_TABLAZO_RECORD } from '$lib/mockData';
	import { 
		CheckCircle2, 
		Zap, 
		FlaskConical, 
		Wrench, 
		Users,
		ChevronRight 
	} from 'lucide-svelte';

	let {
		records = [],
		facilitySlug = 'all',
		ledger = null,
		onOpenDetail = (key: string) => {}
	}: {
		records?: FinancialLedgerRecord[];
		facilitySlug?: string;
		ledger?: FinancialLedgerRecord | null;
		onOpenDetail?: (key: string) => void;
	} = $props();

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
		const tab = records.find(r => r.site_slug === 'el-tablazo') || DEFAULT_EL_TABLAZO_RECORD;
		return tab;
	});

	let isRefinery = $derived(
		facilitySlug === 'bajo-grande' || activeRecord.unit_measure === 'bpd'
	);

	let displayValues = $derived.by(() => {
		if (isRefinery) {
			return {
				heroOpex: '$367.775 USD',
				unitOpex: '$23,50 USD / Barril',
				unitTarget: '≤ $25,00 USD / Barril',
				opexSharePct: 34,
				profitSharePct: 66,
				unitDesc: 'Procesamiento de crudo pesado Boscán y calentamiento de torres de vacío.'
			};
		}
		return {
			heroOpex: '$1,22M USD',
			unitOpex: '$1.196 USD / Tonelada',
			unitTarget: '≤ $1.250 USD / Tonelada',
			opexSharePct: 34,
			profitSharePct: 66,
			unitDesc: 'Craqueo de etano con vapor de alta presión y síntesis química de urea.'
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
			¿Cuánto Costó Producirlo? (Costos Operativos)
		</h2>
	</div>

	<!-- Tarjeta Principal: COSTO DIRECTO DE PRODUCCIÓN (Clickeable con Drill-Down) -->
	<button 
		type="button"
		onclick={() => onOpenDetail('costos')}
		class="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
	>
		<div class="flex items-center justify-between">
			<div class="text-xs font-semibold tracking-wider text-slate-400 uppercase group-hover:text-slate-600 transition-colors">
				Costo Directo de Producción
			</div>
			<span class="text-[11px] font-mono text-slate-400 group-hover:text-slate-700 flex items-center space-x-1">
				<span>Ver auditoría de gastos</span>
				<ChevronRight class="w-3.5 h-3.5" />
			</span>
		</div>
		<div class="mt-1 flex flex-wrap items-baseline gap-2">
			<span class="font-mono text-3xl sm:text-4xl font-extrabold text-amber-700 tracking-tight">
				{displayValues.heroOpex}
			</span>
			<span class="font-mono text-xs sm:text-sm text-slate-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
				{displayValues.unitOpex}
			</span>
		</div>
		<p class="text-xs text-slate-500 mt-1">
			{displayValues.unitDesc} (Meta presupuestaria: {displayValues.unitTarget}).
		</p>
	</button>

	<!-- La Regla del Billete de $100 (Barra de Progreso Clickeable) -->
	<button 
		type="button"
		onclick={() => onOpenDetail('costos')}
		class="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group space-y-3"
	>
		<div class="flex items-center justify-between">
			<div class="text-xs font-bold uppercase tracking-wider text-slate-400">
				La Regla del Billete de $100
			</div>
			<span class="text-[11px] font-mono text-slate-400 group-hover:text-slate-700 flex items-center space-x-1">
				<span>Eficiencia 66% Neta</span>
				<ChevronRight class="w-3.5 h-3.5" />
			</span>
		</div>

		<!-- Barra Segmentada Proporcional -->
		<div class="space-y-2">
			<div class="w-full h-11 rounded-xl overflow-hidden flex shadow-inner p-1 bg-slate-100 gap-1.5">
				<!-- Gastos de Operación (34%) -->
				<div 
					class="h-full bg-amber-500 rounded-lg flex items-center justify-between px-3 text-white text-xs font-mono font-bold" 
					style={`width: ${displayValues.opexSharePct}%;`}
				>
					<span class="truncate">⚙️ Gastos: $34</span>
					<span class="text-[10px] opacity-90 font-mono hidden sm:inline">(34%)</span>
				</div>

				<!-- Ganancia Neta Estado (66%) -->
				<div 
					class="h-full bg-emerald-600 rounded-lg flex items-center justify-between px-3 text-white text-xs font-mono font-bold flex-1 min-w-0"
				>
					<span class="truncate">💵 Ganancia Estado: $66</span>
					<span class="text-[10px] opacity-90 font-mono">(66%)</span>
				</div>
			</div>

			<!-- Explicación en Lenguaje Ciudadano Directo -->
			<p class="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
				💡 <em>De cada $100 que entraron por ventas, $34 se usaron para mantener las plantas operando y $66 quedaron libres para el Estado.</em>
			</p>
		</div>
	</button>

	<!-- 4 Rubros Operativos de Gasto en Planta (Clickeables) -->
	<button 
		type="button"
		onclick={() => onOpenDetail('costos')}
		class="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group space-y-3"
	>
		<div class="flex items-center justify-between">
			<div class="text-xs font-bold uppercase tracking-wider text-slate-400">
				Composición del Gasto en Planta
			</div>
			<span class="text-[11px] font-mono text-slate-400 group-hover:text-slate-700 flex items-center space-x-1">
				<span>Ver facturas de compra</span>
				<ChevronRight class="w-3.5 h-3.5" />
			</span>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
			<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
				<div class="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
					<Zap class="w-3.5 h-3.5 text-amber-600 shrink-0" />
					<span class="truncate">Gas & Electricidad</span>
				</div>
				<div class="text-sm font-mono font-bold text-slate-800">38%</div>
				<p class="text-[10px] text-slate-500 leading-tight">Hornos y compresores</p>
			</div>

			<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
				<div class="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
					<FlaskConical class="w-3.5 h-3.5 text-sky-600 shrink-0" />
					<span class="truncate">Catalizadores</span>
				</div>
				<div class="text-sm font-mono font-bold text-slate-800">24%</div>
				<p class="text-[10px] text-slate-500 leading-tight">Insumos químicos</p>
			</div>

			<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
				<div class="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
					<Wrench class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
					<span class="truncate">Repuestos</span>
				</div>
				<div class="text-sm font-mono font-bold text-slate-800">21%</div>
				<p class="text-[10px] text-slate-500 leading-tight">Sellos mecánicos</p>
			</div>

			<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
				<div class="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
					<Users class="w-3.5 h-3.5 text-indigo-600 shrink-0" />
					<span class="truncate">Mano de Obra</span>
				</div>
				<div class="text-sm font-mono font-bold text-slate-800">17%</div>
				<p class="text-[10px] text-slate-500 leading-tight">Cuadrillas y técnicos</p>
			</div>
		</div>
	</button>

</div>
