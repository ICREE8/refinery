<script lang="ts">
	import type { ExecutiveShiftBrief, Site } from '$lib/types/kpi';
	import { 
		X, 
		Sparkles, 
		FileText, 
		Copy, 
		Check, 
		AlertTriangle, 
		ShieldCheck, 
		ListChecks, 
		RefreshCw,
		Building2,
		Clock,
		UserCheck
	} from 'lucide-svelte';

	let { 
		isOpen = false, 
		site, 
		brief, 
		onClose = () => {},
		onRegenerate = () => {}
	}: { 
		isOpen: boolean; 
		site: Site; 
		brief: ExecutiveShiftBrief; 
		onClose?: () => void;
		onRegenerate?: () => void;
	} = $props();

	let copied = $state(false);

	function copyToClipboard() {
		const text = `
LAKEKPI / PULSO DEL LAGO — RESUMEN EJECUTIVO DE GUARDIA
Instalación: ${site.name} (${site.nominal_capacity_desc})
Guardia: ${brief.shift} | Generado: ${brief.generatedAt}
Superintendente: ${brief.superintendent}
Estado General: ${brief.overallStatus}

TITULAR:
${brief.headline}

SÍNTESIS FORENSE:
${brief.summaryParagraph}

HITOS PRINCIPALES DE PRODUCCIÓN:
${brief.highlights.map(h => `- ${h}`).join('\n')}

DESVÍOS Y ANÁLISIS DE CAUSA RAÍZ:
${brief.deviationsAndRootCauses.map(d => `• ${d.metric}: ${d.deviation}\n  Causa Raíz: ${d.rootCause}\n  Impacto: ${d.impact}`).join('\n\n')}

DIRECTIVAS PARA LA PRÓXIMA GUARDIA:
${brief.handoverDirectives.map((d, i) => `${i + 1}. ${d}`).join('\n')}

AVISO SIAHO / AMBIENTAL:
${brief.hseNotice}
		`.trim();

		navigator.clipboard.writeText(text).then(() => {
			copied = true;
			setTimeout(() => copied = false, 2000);
		});
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
		<div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
			
			<!-- Barra Superior del Modal -->
			<div class="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<div class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-700 to-sky-700 text-white flex items-center justify-center shadow-xs">
						<Sparkles class="w-5 h-5 text-amber-300" />
					</div>
					<div>
						<div class="flex items-center space-x-2">
							<h2 class="text-base font-bold text-slate-900">Resumen Ejecutivo de Guardia (IA)</h2>
							<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
								Síntesis Inteligente
							</span>
						</div>
						<p class="text-xs text-slate-500">{site.name} · {brief.shift}</p>
					</div>
				</div>

				<div class="flex items-center space-x-2">
					<button 
						onclick={copyToClipboard}
						class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
					>
						{#if copied}
							<Check class="w-3.5 h-3.5 text-emerald-600" />
							<span>¡Copiado!</span>
						{:else}
							<Copy class="w-3.5 h-3.5 text-slate-500" />
							<span>Copiar Resumen</span>
						{/if}
					</button>

					<button 
						onclick={onClose}
						class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
					>
						<X class="w-5 h-5" />
					</button>
				</div>
			</div>

			<!-- Cuerpo del Resumen -->
			<div class="p-6 overflow-y-auto space-y-6">
				
				<!-- Banner de Estado Operativo -->
				<div class={`rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
					brief.overallStatus === 'EXCEPTIONAL' 
						? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
						: brief.overallStatus === 'STABLE'
							? 'bg-sky-50/80 border-sky-200 text-sky-950'
							: 'bg-amber-50/80 border-amber-200 text-amber-950'
				}`}>
					<div>
						<div class="text-[11px] font-mono uppercase font-bold tracking-wider opacity-75">
							Evaluación del Estado Operativo
						</div>
						<div class="text-lg font-bold tracking-tight mt-0.5">
							{brief.headline}
						</div>
					</div>

					<div class="flex items-center space-x-2 shrink-0">
						<span class={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide border ${
							brief.overallStatus === 'EXCEPTIONAL'
								? 'bg-emerald-600 text-white border-emerald-700'
								: brief.overallStatus === 'STABLE'
									? 'bg-sky-700 text-white border-sky-800'
									: 'bg-amber-600 text-white border-amber-700'
						}`}>
							{brief.overallStatus === 'EXCEPTIONAL' ? 'SOBRESALIENTE' : brief.overallStatus === 'STABLE' ? 'ESTABLE' : 'BAJO ATENCIÓN'}
						</span>
					</div>
				</div>

				<!-- Metadatos de la Guardia -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
					<div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center space-x-2">
						<UserCheck class="w-4 h-4 text-slate-400 shrink-0" />
						<div>
							<div class="text-[10px] text-slate-400 font-medium">Superintendente de Guardia</div>
							<div class="font-bold text-slate-800">{brief.superintendent}</div>
						</div>
					</div>
					<div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center space-x-2">
						<Clock class="w-4 h-4 text-slate-400 shrink-0" />
						<div>
							<div class="text-[10px] text-slate-400 font-medium">Horario de Guardia</div>
							<div class="font-mono font-bold text-slate-800">{brief.shift}</div>
						</div>
					</div>
					<div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center space-x-2">
						<Building2 class="w-4 h-4 text-slate-400 shrink-0" />
						<div>
							<div class="text-[10px] text-slate-400 font-medium">Unidad Industrial</div>
							<div class="font-semibold text-slate-800 truncate">{site.name}</div>
						</div>
					</div>
				</div>

				<!-- Narrativa Forense Operacional -->
				<div class="space-y-2">
					<h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
						<FileText class="w-4 h-4 text-slate-400" />
						<span>Narrativa Operacional</span>
					</h4>
					<p class="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200/70">
						{brief.summaryParagraph}
					</p>
				</div>

				<!-- Hitos de Producción -->
				<div class="space-y-2">
					<h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Hitos Principales de Producción</h4>
					<ul class="space-y-1.5">
						{#each brief.highlights as highlight}
							<li class="flex items-start space-x-2 text-xs text-slate-700">
								<Check class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
								<span>{highlight}</span>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Desvíos y Causa Raíz -->
				<div class="space-y-2.5">
					<h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
						<AlertTriangle class="w-4 h-4 text-amber-500" />
						<span>Desvíos, Causa Raíz e Impacto en Despacho</span>
					</h4>
					<div class="space-y-2">
						{#each brief.deviationsAndRootCauses as dev}
							<div class="rounded-xl p-3.5 bg-slate-50 border border-slate-200 text-xs space-y-1.5">
								<div class="flex items-center justify-between">
									<span class="font-bold text-slate-900 text-sm">{dev.metric}</span>
									<span class="text-amber-700 font-mono font-semibold">{dev.deviation}</span>
								</div>
								<div class="text-slate-600">
									<strong class="text-slate-700">Hipótesis / Causa Raíz:</strong> {dev.rootCause}
								</div>
								<div class="text-slate-600">
									<strong class="text-slate-700">Impacto Aguas Abajo:</strong> {dev.impact}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Directivas de Entrega de Guardia -->
				<div class="space-y-2.5">
					<h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
						<ListChecks class="w-4 h-4 text-sky-600" />
						<span>Directivas Prioritarias de Entrega de Guardia</span>
					</h4>
					<ol class="space-y-2">
						{#each brief.handoverDirectives as directive, i}
							<li class="flex items-start space-x-2 text-xs text-slate-800 bg-sky-50/40 p-2.5 rounded-lg border border-sky-100">
								<span class="w-5 h-5 rounded-full bg-sky-200 text-sky-800 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
									{i + 1}
								</span>
								<span class="font-medium pt-0.5">{directive}</span>
							</li>
						{/each}
					</ol>
				</div>

				<!-- Aviso SIAHO -->
				<div class="rounded-lg p-3 bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2.5">
					<ShieldCheck class="w-4 h-4 text-emerald-700 shrink-0" />
					<div>
						<strong class="font-semibold">Seguridad Industrial y Ambiente (SIAHO):</strong> {brief.hseNotice}
					</div>
				</div>

			</div>

			<!-- Pie del Modal -->
			<div class="px-6 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
				<div class="text-[11px] text-slate-400 font-mono">
					Generado {brief.generatedAt} HLV · Motor Forense Cuenca del Lago
				</div>
				<button 
					onclick={onRegenerate}
					class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
				>
					<RefreshCw class="w-3.5 h-3.5 text-slate-500" />
					<span>Regenerar Resumen</span>
				</button>
			</div>

		</div>
	</div>
{/if}
