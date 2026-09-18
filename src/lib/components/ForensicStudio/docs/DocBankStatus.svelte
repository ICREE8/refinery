<script lang="ts">
	import type { FinancialLedgerRecord } from '$lib/types/kpi';
	import { DEFAULT_BAJO_GRANDE_RECORD, DEFAULT_EL_TABLAZO_RECORD } from '$lib/mockData';
	import { 
		ShieldCheck, 
		Clock, 
		Landmark,
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
				totalInvoiced: '$1.072.025 USD',
				cashAmount: '$879.060 USD',
				iouAmount: '$192.965 USD',
				dsoDays: '14,2 Días'
			};
		}
		return {
			totalInvoiced: '$3.093.200 USD',
			cashAmount: '$2.536.424 USD',
			iouAmount: '$556.776 USD',
			dsoDays: '14,2 Días'
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
			Plata en Mano vs. Facturas por Cobrar
		</h2>
	</div>

	<!-- Tarjeta Principal: ESTADO DE COBRANZA EN BANCO (Clickeable con Drill-Down) -->
	<button 
		type="button"
		onclick={() => onOpenDetail('banco')}
		class="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group space-y-3"
	>
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
			<div>
				<div class="text-xs font-semibold tracking-wider text-slate-400 uppercase group-hover:text-slate-600 transition-colors">
					Estado de Cobranza en Banco
				</div>
				<div class="mt-1 text-xs text-slate-500">
					Monto total facturado en ciclo: <strong class="font-mono text-slate-900">{displayValues.totalInvoiced}</strong>
				</div>
			</div>

			<!-- Velocidad de Pago -->
			<div class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 shrink-0 self-start sm:self-auto">
				<Clock class="w-3.5 h-3.5 text-indigo-600 shrink-0" />
				<span>{displayValues.dsoDays} para Cobro Efectivo (Meta: &le; 18 Días)</span>
			</div>
		</div>

		<!-- Barra Bicolor del Tesoro (Mobile-safe) -->
		<div class="space-y-2 pt-1">
			<div class="w-full h-11 rounded-xl overflow-hidden flex shadow-inner p-1 bg-slate-100 gap-1.5">
				<!-- En Cuenta Bancaria (82%) -->
				<div 
					class="h-full bg-emerald-600 rounded-lg flex items-center justify-between px-3 text-white text-xs font-mono font-bold" 
					style="width: 82%;"
				>
					<span class="truncate">🟢 En Banco</span>
					<span class="text-[11px] opacity-90 font-mono">82%</span>
				</div>

				<!-- Facturas Pendientes (18%) -->
				<div 
					class="h-full bg-amber-400 rounded-lg flex items-center justify-between px-3 text-slate-900 text-xs font-mono font-bold flex-1 min-w-0"
				>
					<span class="truncate">🟡 Pendiente</span>
					<span class="text-[11px] opacity-90 font-mono">18%</span>
				</div>
			</div>

			<!-- Desglose en Filas Dedicadas (Cero textos cortados en móvil 375px) -->
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
				<div class="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
					<div class="flex items-center justify-between text-xs font-bold text-emerald-900">
						<span>🟢 En Cuenta Bancaria del Tesoro</span>
						<span class="font-mono">82%</span>
					</div>
					<div class="text-lg sm:text-xl font-mono font-extrabold text-emerald-950">
						{displayValues.cashAmount}
					</div>
					<p class="text-[11px] text-emerald-800 leading-tight">
						Dinero líquido en la cuenta del Banco Central / Fideicomiso.
					</p>
				</div>

				<div class="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
					<div class="flex items-center justify-between text-xs font-bold text-amber-900">
						<span>🟡 Cuentas por Cobrar (Pendientes)</span>
						<span class="font-mono">18%</span>
					</div>
					<div class="text-lg sm:text-xl font-mono font-extrabold text-amber-950">
						{displayValues.iouAmount}
					</div>
					<p class="text-[11px] text-amber-800 leading-tight">
						Buques en tránsito marítimo; liquidación al descargar en muelle.
					</p>
				</div>
			</div>
		</div>

		<div class="pt-1 flex items-center justify-end text-[11px] font-mono text-slate-400 group-hover:text-slate-700">
			<span>Ver liquidaciones BCV y Cartas de Crédito</span>
			<ChevronRight class="w-3.5 h-3.5 ml-1" />
		</div>
	</button>

	<!-- Resumen Ciudadano Ejecutivo Sobrio (Clickeable) -->
	<button 
		type="button"
		onclick={() => onOpenDetail('banco')}
		class="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group space-y-2"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<Landmark class="w-4 h-4 text-slate-700 shrink-0" />
				<h3 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
					Resumen Ciudadano
				</h3>
			</div>
			<span class="text-[11px] font-mono text-slate-400 group-hover:text-slate-700 flex items-center space-x-1">
				<span>Ver garantías legales</span>
				<ChevronRight class="w-3.5 h-3.5" />
			</span>
		</div>
		<p class="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
			El petróleo no está vendido hasta que los dólares tocan la cuenta bancaria del Estado. Aquí se audita la plata que ya cayó en el banco frente a las facturas que los compradores todavía deben.
		</p>
	</button>

</div>
