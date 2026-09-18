<script lang="ts">
	import type { Site, TacticalMaintenanceMetrics } from '$lib/types/kpi';
	import { 
		Wrench, 
		X, 
		CheckCircle, 
		ShieldCheck, 
		AlertTriangle, 
		Activity, 
		Flame, 
		FlaskConical, 
		Gauge, 
		Cpu, 
		Radio, 
		CheckCircle2
	} from 'lucide-svelte';

	let {
		isOpen = false,
		sites = [],
		initialSite = null,
		metricsBySlug = {},
		onClose = () => {}
	}: {
		isOpen: boolean;
		sites: Site[];
		initialSite?: Site | null;
		metricsBySlug?: Record<string, TacticalMaintenanceMetrics>;
		onClose?: () => void;
	} = $props();

	// Sitio seleccionado dentro del modal
	let userSelectedSite = $state<Site | null>(null);

	let site = $derived(userSelectedSite || initialSite || (sites.length > 0 ? sites[0] : null));
	let isRefinery = $derived(site ? site.type === 'refinery' : true);

	let metrics = $derived(
		(site && metricsBySlug[site.slug]) || {
			plannedVsReactiveRatio: 81.5,
			mtbfHours: 820,
			equipmentUtilizationPct: 94.2,
			operationalAvailabilityPct: 96.8,
			openWorkOrders: 14,
			preventativeCompliancePct: 98.1
		}
	);

	// Telemetría de Ingeniería de Procesos y Presiones Diferenciales
	let equipmentTelemetry = $derived(isRefinery ? [
		{ 
			tag: 'H-101', 
			name: 'Horno de Crudo Atmosférico', 
			status: 'normal', 
			runHours: 4210, 
			healthPct: 97, 
			lastPMRound: 'Ayer',
			deltaP: '12,4 mmH2O',
			criticalParam: 'Piel de Tubo: 485°C (Límite: 520°C)',
			vibration: '0,8 mm/s RMS'
		},
		{ 
			tag: 'T-102', 
			name: 'Torre de Vacío y Bomba de Fondos', 
			status: 'attention', 
			runHours: 7380, 
			healthPct: 91, 
			lastPMRound: 'Hace 3 días',
			deltaP: '38,2 kPa (Ensuciamiento platos)',
			criticalParam: 'Temp. Fondos: 392°C',
			vibration: '2,4 mm/s RMS (Alerta: 2,5)'
		},
		{ 
			tag: 'E-201A/B', 
			name: 'Tren de Precalentamiento de Crudo', 
			status: 'normal', 
			runHours: 5120, 
			healthPct: 95, 
			lastPMRound: 'Hoy',
			deltaP: '45,0 kPa ΔP lado carcasa',
			criticalParam: 'Eficiencia LMTD: 94,2%',
			vibration: '0,4 mm/s RMS'
		},
		{ 
			tag: 'TK-501', 
			name: 'Almacenamiento de Asfalto y Bomba Marina', 
			status: 'normal', 
			runHours: 8760, 
			healthPct: 99, 
			lastPMRound: 'Hace 12 h',
			deltaP: 'Descarga: 14,2 bar',
			criticalParam: 'Viscosidad: 180 cSt @ 135°C',
			vibration: '0,6 mm/s RMS'
		}
	] : [
		{ 
			tag: 'K-201', 
			name: 'Compresor Multietapa de Gas Craqueado', 
			status: 'normal', 
			runHours: 6140, 
			healthPct: 96, 
			lastPMRound: 'Hoy',
			deltaP: 'Etapa 3 ΔP: 6,8 bar',
			criticalParam: 'Temp. Succión: 38,5°C',
			vibration: '1,2 mm/s RMS'
		},
		{ 
			tag: 'P-204B', 
			name: 'Bomba de Enfriamiento de Etileno (Quench)', 
			status: 'attention', 
			runHours: 3290, 
			healthPct: 88, 
			lastPMRound: 'Ayer',
			deltaP: 'Sello Mecánico ΔP: 2,1 bar',
			criticalParam: 'Cabezal Rotor: 98 m',
			vibration: '2,7 mm/s RMS (Inspección)'
		},
		{ 
			tag: 'R-301', 
			name: 'Reactor de Polietileno en Lecho Fluidizado Línea 2', 
			status: 'normal', 
			runHours: 4890, 
			healthPct: 94, 
			lastPMRound: 'Hoy',
			deltaP: 'Lecho ΔP: 42,1 kPa',
			criticalParam: 'Tasa Catalizador: 14,8 kg/h',
			vibration: '0,5 mm/s RMS'
		},
		{ 
			tag: 'EL-104', 
			name: 'Sala de Celdas Cloro-Soda Tren A', 
			status: 'normal', 
			runHours: 7800, 
			healthPct: 95, 
			lastPMRound: 'Hace 2 días',
			deltaP: 'Membrana ΔP: 18,4 kPa',
			criticalParam: 'Densidad Corriente: 4,8 kA/m²',
			vibration: 'Estático Nominal'
		}
	]);
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
		<div class="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
			
			<!-- Encabezado del Modal con Selector y Estado -->
			<div class="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs shrink-0">
						<Wrench class="w-5 h-5" />
					</div>
					<div>
						<div class="flex items-center space-x-2">
							<h2 class="text-base font-extrabold text-slate-900 tracking-tight">
								Telemetría de Planta e Ingeniería de Procesos
							</h2>
							<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
								SCADA Nivel Planta
							</span>
						</div>
						<p class="text-xs text-slate-500">
							Monitoreo de equipos críticos, vibraciones mecánicas y presiones diferenciales (&Delta;P).
						</p>
					</div>
				</div>

				<div class="flex items-center space-x-2 self-end sm:self-auto">
					<!-- Selector de Instalación dentro del modal -->
					{#if sites.length > 1}
						<div class="flex items-center p-0.5 rounded-lg bg-slate-200/80 border border-slate-300/80 text-xs font-semibold">
							{#each sites as s}
								<button 
									onclick={() => userSelectedSite = s}
									class={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
										site?.id === s.id 
											? 'bg-white text-slate-900 shadow-xs font-bold' 
											: 'text-slate-600 hover:text-slate-900'
									}`}
								>
									{s.name.includes('Bajo Grande') ? 'Bajo Grande' : 'El Tablazo'}
								</button>
							{/each}
						</div>
					{/if}

					<button 
						onclick={onClose}
						class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
						title="Cerrar Telemetría"
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			</div>

			<!-- Contenido con Desplazamiento -->
			<div class="p-6 overflow-y-auto space-y-6">

				<!-- Cinta de Contexto de Instalación -->
				<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<div class={`w-9 h-9 rounded-lg flex items-center justify-center border ${
							isRefinery ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'
						}`}>
							{#if isRefinery}
								<Flame class="w-5 h-5" />
							{:else}
								<FlaskConical class="w-5 h-5" />
							{/if}
						</div>
						<div>
							<div class="font-bold text-slate-900 text-sm">{site?.name}</div>
							<div class="text-xs text-slate-500 font-mono">{site?.location} · {site?.nominal_capacity_desc}</div>
						</div>
					</div>

					<div class="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
						<ShieldCheck class="w-4 h-4 text-emerald-600" />
						<span>Sincronizado con CMMS Maximo</span>
					</div>
				</div>

				<!-- Cuadrícula de Indicadores de Mantenimiento -->
				<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
					
					<!-- Planificado vs Reactivo -->
					<div class="rounded-xl p-3.5 bg-slate-50 border border-slate-200">
						<div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
							Planificado vs. Reactivo
						</div>
						<div class="flex items-baseline space-x-1.5">
							<span class="text-2xl font-mono font-black text-slate-900">{metrics.plannedVsReactiveRatio}%</span>
							<span class="text-xs text-slate-500 font-medium">Planificado</span>
						</div>
						<div class="mt-2 h-2 w-full bg-rose-200 rounded-full overflow-hidden flex">
							<div class="h-full bg-emerald-600 rounded-l-full" style={`width: ${metrics.plannedVsReactiveRatio}%`}></div>
						</div>
						<div class="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
							<span>Meta: &ge;80%</span>
							<span class="text-emerald-700 font-bold">En Norma</span>
						</div>
					</div>

					<!-- Horas MTBF -->
					<div class="rounded-xl p-3.5 bg-slate-50 border border-slate-200">
						<div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
							Horas MTBF Entre Fallas
						</div>
						<div class="flex items-baseline space-x-1.5">
							<span class="text-2xl font-mono font-black text-slate-900">{metrics.mtbfHours}</span>
							<span class="text-xs text-slate-500 font-medium">Horas</span>
						</div>
						<div class="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium mt-2">
							<CheckCircle class="w-3.5 h-3.5 text-emerald-600" />
							<span>+42 h vs media 90 días</span>
						</div>
					</div>

					<!-- Disponibilidad Operacional -->
					<div class="rounded-xl p-3.5 bg-slate-50 border border-slate-200">
						<div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
							Disponibilidad de Planta
						</div>
						<div class="flex items-baseline space-x-1.5">
							<span class="text-2xl font-mono font-black text-slate-900">{metrics.operationalAvailabilityPct}%</span>
							<span class="text-xs text-slate-500 font-medium">Operativa</span>
						</div>
						<div class="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
							<div class="h-full bg-sky-600 rounded-full" style={`width: ${metrics.operationalAvailabilityPct}%`}></div>
						</div>
						<div class="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
							<span>Meta: 95,0%</span>
							<span class="text-sky-700 font-bold">Nominal</span>
						</div>
					</div>

					<!-- Cumplimiento de Rutas Preventivas -->
					<div class="rounded-xl p-3.5 bg-slate-50 border border-slate-200">
						<div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
							Cumplimiento Preventivo (PM)
						</div>
						<div class="flex items-baseline space-x-1.5">
							<span class="text-2xl font-mono font-black text-slate-900">{metrics.preventativeCompliancePct}%</span>
							<span class="text-xs text-slate-500 font-medium">Ejecutado</span>
						</div>
						<div class="text-[11px] text-slate-500 mt-2 font-mono">
							<span class="font-bold text-amber-700">{metrics.openWorkOrders}</span> órdenes de trabajo activas
						</div>
					</div>

				</div>

				<!-- Tabla Forense de Trenes Rotativos y Térmicos Críticos -->
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-sm font-bold text-slate-900 tracking-tight">
								Trenes Rotativos y Térmicos Críticos de la Planta
							</h3>
							<p class="text-xs text-slate-500">
								Lecturas en vivo: Presión Diferencial (&Delta;P), Vibración de Cojinetes y Horas de Marcha
							</p>
						</div>
						<span class="text-[11px] font-mono text-slate-400">
							Intervalo: 1 seg
						</span>
					</div>

					<div class="overflow-x-auto border border-slate-200 rounded-xl">
						<table class="w-full text-left text-xs text-slate-700">
							<thead class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400">
								<tr>
									<th class="py-3 px-3.5">Tag</th>
									<th class="py-3 px-3.5">Equipo Industrial</th>
									<th class="py-3 px-3.5">&Delta;P / Sensor</th>
									<th class="py-3 px-3.5">Parámetro Crítico</th>
									<th class="py-3 px-3.5">Vibración RMS</th>
									<th class="py-3 px-3.5">Salud Mecánica</th>
									<th class="py-3 px-3.5 text-right">Estado</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100 font-sans">
								{#each equipmentTelemetry as eq}
									<tr class="hover:bg-slate-50/80 transition-colors">
										<td class="py-3 px-3.5 font-mono font-bold text-slate-900">{eq.tag}</td>
										<td class="py-3 px-3.5 font-medium text-slate-800">{eq.name}</td>
										<td class="py-3 px-3.5 font-mono text-slate-700 font-semibold">{eq.deltaP}</td>
										<td class="py-3 px-3.5 font-mono text-slate-600 text-[11px]">{eq.criticalParam}</td>
										<td class="py-3 px-3.5 font-mono text-slate-600 text-[11px]">{eq.vibration}</td>
										<td class="py-3 px-3.5">
											<div class="flex items-center space-x-2">
												<div class="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
													<div 
														class={`h-full rounded-full ${eq.healthPct >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
														style={`width: ${eq.healthPct}%`}
													></div>
												</div>
												<span class="font-mono text-[11px] font-bold">{eq.healthPct}%</span>
											</div>
										</td>
										<td class="py-3 px-3.5 text-right">
											{#if eq.status === 'normal'}
												<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
													En Operación
												</span>
											{:else}
												<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
													En Observación
												</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

			</div>

			<!-- Pie del Modal -->
			<div class="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
				<div class="flex items-center space-x-2 font-mono text-[11px]">
					<Radio class="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
					<span>Enlace SCADA / CMMS Maximo en Tiempo Real</span>
				</div>
				<button 
					onclick={onClose}
					class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
				>
					Volver a la Auditoría Ciudadana
				</button>
			</div>

		</div>
	</div>
{/if}
