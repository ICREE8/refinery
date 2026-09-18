<script lang="ts">
	import type { Site, KpiDefinition, SiteSummaryRow } from '$lib/types/kpi';
	import { insertInMemoryKpiValues } from '$lib/mockData';
	import { 
		X, 
		UploadCloud, 
		FileSpreadsheet, 
		PlusCircle, 
		Check, 
		AlertTriangle,
		Database
	} from 'lucide-svelte';

	let { 
		isOpen = false, 
		site, 
		kpiDefinitions = [], 
		onClose = () => {},
		onDataIngested = () => {}
	}: { 
		isOpen: boolean; 
		site: Site; 
		kpiDefinitions: KpiDefinition[]; 
		onClose?: () => void;
		onDataIngested?: () => void;
	} = $props();

	let activeTab = $state<'manual' | 'csv'>('manual');
	
	// Estado de Entrada Manual
	let selectedKpiCode = $state('');

	$effect(() => {
		if (!selectedKpiCode && kpiDefinitions.length > 0) {
			selectedKpiCode = kpiDefinitions[0].code;
		}
	});

	let entryDate = $state(new Date().toISOString().split('T')[0]);
	let entryValue = $state<number | string>('');
	let entryNotes = $state('');
	let manualSuccess = $state(false);

	// Estado de Entrada CSV
	let csvText = $state('');
	let parsedRows = $state<any[]>([]);
	let csvError = $state<string | null>(null);
	let isSubmitting = $state(false);

	let currentSelectedDef = $derived(kpiDefinitions.find(d => d.code === selectedKpiCode));

	// Plantilla CSV predeterminada para la instalación
	let sampleCsv = $derived.by(() => {
		const today = new Date().toISOString().split('T')[0];
		if (site.type === 'refinery') {
			return `entry_date,kpi_code,value,notes\n${today},CRUDE_THROUGHPUT,15650,Desalador operando a plena carga\n${today},VACUUM_YIELD,63.1,Corte de fondo de vacío en especificación\n${today},ASPHALT_PROD,1460,Bombeo de asfalto AC-20 al Tanque 501\n${today},API_GRAVITY,12.4,Cargamento Boscán pesado recibido en patio`;
		} else {
			return `entry_date,kpi_code,value,notes\n${today},ETHYLENE_TONS,1620,Trenes de craqueo con vapor nominales\n${today},PE_YIELD,94.5,Polietileno de alta densidad en especificación\n${today},UREA_FERTILIZER,2250,Granulación de fertilizantes línea A y B activa\n${today},STEAM_INTENSITY,3.95,Calderas de recuperación operando eficientemente`;
		}
	});

	function handleLoadSampleCsv() {
		csvText = sampleCsv;
		handleParseCsv();
	}

	function handleParseCsv() {
		csvError = null;
		parsedRows = [];

		if (!csvText.trim()) return;

		try {
			const lines = csvText.trim().split('\n').map(l => l.trim()).filter(Boolean);
			if (lines.length < 2) {
				csvError = 'El CSV debe contener una fila de encabezado y al menos una fila de datos.';
				return;
			}

			const header = lines[0].split(',').map(h => h.trim().toLowerCase());
			const dateIdx = header.indexOf('entry_date');
			const codeIdx = header.indexOf('kpi_code');
			const valIdx = header.indexOf('value');
			const notesIdx = header.indexOf('notes');

			if (dateIdx === -1 || codeIdx === -1 || valIdx === -1) {
				csvError = 'El encabezado debe incluir las columnas "entry_date", "kpi_code" y "value".';
				return;
			}

			const rows: any[] = [];
			for (let i = 1; i < lines.length; i++) {
				const cols = lines[i].split(',').map(c => c.trim());
				if (cols.length >= 3) {
					const code = cols[codeIdx];
					const def = kpiDefinitions.find(d => d.code === code);
					const val = parseFloat(cols[valIdx]);

					if (isNaN(val)) {
						csvError = `Fila ${i + 1}: Valor numérico inválido "${cols[valIdx]}"`;
						return;
					}

					rows.push({
						entry_date: cols[dateIdx],
						kpi_code: code,
						kpi_name: def ? def.name : code,
						unit: def ? def.unit : '',
						value: val,
						notes: notesIdx !== -1 ? cols[notesIdx] : ''
					});
				}
			}

			parsedRows = rows;
		} catch (e: any) {
			csvError = `Error al procesar CSV: ${e.message}`;
		}
	}

	function handleManualSubmit() {
		if (!entryValue || isNaN(Number(entryValue))) {
			alert('Por favor ingrese un valor numérico válido');
			return;
		}

		const def = kpiDefinitions.find(d => d.code === selectedKpiCode);
		if (!def) return;

		const numVal = Number(entryValue);
		const attainment = def.target_value > 0 ? Number(((numVal / def.target_value) * 100).toFixed(2)) : 100;

		const newRow: SiteSummaryRow = {
			site_id: site.id,
			site_name: site.name,
			site_slug: site.slug,
			site_type: site.type,
			entry_date: entryDate,
			kpi_code: def.code,
			kpi_name: def.name,
			kpi_category: def.category,
			unit: def.unit,
			value: numVal,
			target_value: def.target_value,
			target_attainment_pct: attainment,
			min_warning: def.min_warning,
			max_warning: def.max_warning
		};

		insertInMemoryKpiValues([newRow]);
		manualSuccess = true;
		setTimeout(() => {
			manualSuccess = false;
			onDataIngested();
			onClose();
		}, 800);
	}

	function handleCommitCsv() {
		if (parsedRows.length === 0) return;
		isSubmitting = true;

		const newRows: SiteSummaryRow[] = parsedRows.map(r => {
			const def = kpiDefinitions.find(d => d.code === r.kpi_code);
			const targetVal = def?.target_value ?? 100;
			const attainment = targetVal > 0 ? Number(((r.value / targetVal) * 100).toFixed(2)) : 100;

			return {
				site_id: site.id,
				site_name: site.name,
				site_slug: site.slug,
				site_type: site.type,
				entry_date: r.entry_date,
				kpi_code: r.kpi_code,
				kpi_name: def?.name ?? r.kpi_code,
				kpi_category: def?.category ?? 'throughput',
				unit: def?.unit ?? '',
				value: r.value,
				target_value: targetVal,
				target_attainment_pct: attainment,
				min_warning: def?.min_warning,
				max_warning: def?.max_warning
			};
		});

		insertInMemoryKpiValues(newRows);
		setTimeout(() => {
			isSubmitting = false;
			onDataIngested();
			onClose();
		}, 600);
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
		<div 
			class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
		>
			<!-- Encabezado del Modal -->
			<div class="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<div class="w-9 h-9 rounded-lg bg-sky-100 border border-sky-200 text-sky-800 flex items-center justify-center">
						<Database class="w-5 h-5" />
					</div>
					<div>
						<h2 class="text-base font-bold text-slate-900">Carga de Datos y Telemetría Operacional</h2>
						<p class="text-xs text-slate-500">Registrar mediciones operativas para {site.name}</p>
					</div>
				</div>
				<button 
					onclick={onClose}
					class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Pestañas de Navegación -->
			<div class="flex border-b border-slate-200 px-6 pt-3 bg-white">
				<button 
					onclick={() => activeTab = 'manual'}
					class={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center space-x-2 cursor-pointer transition-colors ${
						activeTab === 'manual' 
							? 'border-sky-600 text-sky-700' 
							: 'border-transparent text-slate-500 hover:text-slate-700'
					}`}
				>
					<PlusCircle class="w-4 h-4" />
					<span>Registro Manual de Operador</span>
				</button>
				<button 
					onclick={() => activeTab = 'csv'}
					class={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center space-x-2 cursor-pointer transition-colors ${
						activeTab === 'csv' 
							? 'border-sky-600 text-sky-700' 
							: 'border-transparent text-slate-500 hover:text-slate-700'
					}`}
				>
					<FileSpreadsheet class="w-4 h-4" />
					<span>Carga Masiva CSV / SCADA</span>
				</button>
			</div>

			<!-- Cuerpo de las Pestañas -->
			<div class="p-6 overflow-y-auto space-y-4">
				
				{#if activeTab === 'manual'}
					<form onsubmit={(e) => { e.preventDefault(); handleManualSubmit(); }} class="space-y-4">
						
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<!-- KPI Seleccionado -->
							<div>
								<label for="kpi-select" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
									Métrica / Parámetro de Proceso
								</label>
								<select 
									id="kpi-select"
									bind:value={selectedKpiCode}
									class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-sky-600 font-medium"
								>
									{#each kpiDefinitions as def}
										<option value={def.code}>{def.name} ({def.unit})</option>
									{/each}
								</select>
							</div>

							<!-- Fecha de la Guardia -->
							<div>
								<label for="entry-date" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
									Fecha de la Guardia
								</label>
								<input 
									id="entry-date"
									type="date" 
									bind:value={entryDate}
									class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-sky-600 font-mono"
								/>
							</div>
						</div>

						<!-- Contexto de Metas -->
						{#if currentSelectedDef}
							<div class="rounded-lg p-3 bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
								<span class="text-slate-500">Meta en Presupuesto: <strong class="text-slate-800">{currentSelectedDef.target_value} {currentSelectedDef.unit}</strong></span>
								<span class="text-slate-500">Rango de Alerta: <strong class="text-amber-700">{currentSelectedDef.min_warning ?? 'Ninguno'} — {currentSelectedDef.max_warning ?? 'Ninguno'}</strong></span>
							</div>
						{/if}

						<!-- Entrada de Valor -->
						<div>
							<label for="recorded-value" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
								Valor Registrado ({currentSelectedDef?.unit || ''})
							</label>
							<input 
								id="recorded-value"
								type="number" 
								step="any"
								placeholder={`p. ej. ${currentSelectedDef?.target_value ?? '100'}`}
								bind:value={entryValue}
								required
								class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-mono font-bold text-slate-900 focus:outline-sky-600"
							/>
						</div>

						<!-- Observaciones -->
						<div>
							<label for="entry-notes" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
								Bitácora de Campo y Novedades del Turno
							</label>
							<textarea 
								id="entry-notes"
								rows="3" 
								bind:value={entryNotes}
								placeholder="p. ej. Despacho a buque tanquero completado, ajuste en quemadores de horno, inspección de sellos mecánicos..."
								class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-sky-600 resize-none"
							></textarea>
						</div>

						<div class="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
							<button 
								type="button" 
								onclick={onClose}
								class="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
							>
								Cancelar
							</button>
							<button 
								type="submit"
								class="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
							>
								{#if manualSuccess}
									<Check class="w-4 h-4 text-emerald-300" />
									<span>¡Guardado!</span>
								{:else}
									<PlusCircle class="w-4 h-4" />
									<span>Guardar Registro</span>
								{/if}
							</button>
						</div>

					</form>
				{:else}
					<!-- Sección CSV -->
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<p class="text-xs text-slate-500">
								Pegue los registros separados por comas o cargue la plantilla base:
							</p>
							<button 
								onclick={handleLoadSampleCsv}
								class="text-xs font-semibold text-sky-700 hover:text-sky-800 underline cursor-pointer"
							>
								Cargar Plantilla CSV de Ejemplo
							</button>
						</div>

						<textarea 
							rows="6" 
							bind:value={csvText}
							oninput={handleParseCsv}
							placeholder="entry_date,kpi_code,value,notes..."
							class="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-800 focus:outline-sky-600 resize-none"
						></textarea>

						{#if csvError}
							<div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
								<AlertTriangle class="w-4 h-4 shrink-0 text-rose-600" />
								<span>{csvError}</span>
							</div>
						{/if}

						<!-- Vista previa de filas procesadas -->
						{#if parsedRows.length > 0}
							<div class="rounded-lg border border-slate-200 overflow-hidden">
								<div class="bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 flex justify-between">
									<span>Validación Exitosa ({parsedRows.length} registros listos)</span>
									<span class="text-emerald-700 font-mono">Formato Correcto</span>
								</div>
								<div class="max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
									{#each parsedRows as r}
										<div class="px-3 py-1.5 flex items-center justify-between text-slate-700">
											<span class="font-mono text-slate-500">{r.entry_date}</span>
											<span class="font-semibold">{r.kpi_name}</span>
											<span class="font-mono font-bold text-slate-900">{r.value} {r.unit}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<div class="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
							<button 
								type="button" 
								onclick={onClose}
								class="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
							>
								Cancelar
							</button>
							<button 
								type="button"
								onclick={handleCommitCsv}
								disabled={parsedRows.length === 0 || isSubmitting}
								class="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
							>
								{#if isSubmitting}
									<span>Guardando en BD...</span>
								{:else}
									<UploadCloud class="w-4 h-4" />
									<span>Cargar Lote {parsedRows.length > 0 ? `(${parsedRows.length})` : ''}</span>
								{/if}
							</button>
						</div>

					</div>
				{/if}

			</div>
		</div>
	</div>
{/if}
