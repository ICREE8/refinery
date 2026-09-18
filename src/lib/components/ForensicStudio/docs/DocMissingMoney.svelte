<script lang="ts">
	import type { FinancialLedgerRecord } from '$lib/types/kpi';
	import { DEFAULT_BAJO_GRANDE_RECORD, DEFAULT_EL_TABLAZO_RECORD } from '$lib/mockData';
	import { 
		Flame, 
		AlertTriangle, 
		ShieldAlert, 
		Scale, 
		Eye, 
		CheckCircle2,
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
				alertMoney: '-$18.450 USD',
				explanation: 'Se registraron 15.920 barriles saliendo de los tanques, pero solo 15.650 barriles registrados en los buques tanqueros. Faltan 270 barriles sin justificación física (~$18.450 USD).',
				missingUnit: '270 barriles',
				percentage: '1,72% de merma total'
			};
		}
		return {
			alertMoney: '-$30.049 USD',
			explanation: 'Se registraron 1.030 TM saliendo de las unidades, pero solo 1.020 TM registradas en los buques tanqueros. Faltan 10 TM sin justificación física (~$30.049 USD).',
			missingUnit: '10 Toneladas',
			percentage: '0,97% de merma total'
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
			Alerta de Fugas y Mermas (¿Dónde se perdió plata o producto?)
		</h2>
	</div>

	<!-- Tarjeta de Estado de Alerta (Clickeable con Drill-Down) -->
	<button 
		type="button"
		onclick={() => onOpenDetail('fugas')}
		class="w-full text-left bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-rose-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group space-y-3"
	>
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
			<div class="flex items-center space-x-2">
				<span class="text-lg">⚠️</span>
				<h3 class="text-sm sm:text-base font-bold text-rose-900 tracking-tight">
					Desvío No Conciliado en Muelle
				</h3>
			</div>
			<div class="flex items-center space-x-2 self-start sm:self-auto">
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
					{displayValues.percentage}
				</span>
				<span class="text-[11px] font-mono text-rose-700/80 group-hover:text-rose-900 flex items-center space-x-0.5">
					<span>Ver balance</span>
					<ChevronRight class="w-3.5 h-3.5" />
				</span>
			</div>
		</div>

		<!-- Monto en Grande y Explicación Llana -->
		<div class="space-y-2">
			<div class="font-mono text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
				{displayValues.alertMoney}
			</div>
			<p class="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-rose-200/80">
				{displayValues.explanation}
			</p>
		</div>
	</button>

	<!-- Lista de Auditoría Forense (Audit Checklist Clickeable) -->
	<button 
		type="button"
		onclick={() => onOpenDetail('fugas')}
		class="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group space-y-3"
	>
		<div class="flex items-center justify-between">
			<div class="text-xs font-bold uppercase tracking-wider text-slate-400">
				Puntos de Auditoría en Campo
			</div>
			<span class="text-[11px] font-mono text-slate-400 group-hover:text-slate-700 flex items-center space-x-1">
				<span>Ver bitácora de campo</span>
				<ChevronRight class="w-3.5 h-3.5" />
			</span>
		</div>

		<div class="space-y-2">
			<!-- Punto 1: Mechurrio -->
			<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
				<div class="flex items-center space-x-2.5">
					<Flame class="w-4 h-4 text-amber-600 shrink-0" />
					<div>
						<div class="text-xs font-bold text-slate-900">Venteo y Mechurrio</div>
						<div class="text-[11px] text-slate-500">Cámaras infrarrojas térmicas en línea</div>
					</div>
				</div>
				<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
					Normal (&lt; 0.8%)
				</span>
			</div>

			<!-- Punto 2: Evaporación en Tanques -->
			<div class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
				<div class="flex items-center space-x-2.5">
					<Eye class="w-4 h-4 text-sky-600 shrink-0" />
					<div>
						<div class="text-xs font-bold text-slate-900">Evaporación en Tanques de Almacenaje</div>
						<div class="text-[11px] text-slate-500">Sellos de techo flotante y recuperación de vapores (VRU)</div>
					</div>
				</div>
				<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
					Normal (0.4%)
				</span>
			</div>

			<!-- Punto 3: Medidores Fiscales de Muelle -->
			<div class="p-3 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
				<div class="flex items-center space-x-2.5">
					<Scale class="w-4 h-4 text-amber-700 shrink-0" />
					<div>
						<div class="text-xs font-bold text-amber-950">Medidores Fiscales de Muelle</div>
						<div class="text-[11px] text-amber-800">Calibración de medidor másico Coriolis en muelle</div>
					</div>
				</div>
				<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
					En Revisión
				</span>
			</div>
		</div>
	</button>

</div>
