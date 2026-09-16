<script lang="ts">
	import type { Site } from '$lib/types/kpi';
	import { page } from '$app/stores';
	import { 
		Flame, 
		Activity, 
		Layers, 
		PlusCircle, 
		UploadCloud, 
		FileText, 
		ExternalLink,
		CheckCircle2,
		Radio,
		ChevronDown
	} from 'lucide-svelte';

	let { 
		sites = [], 
		currentSite = null,
		onOpenIntake = () => {},
		onOpenBrief = () => {}
	}: { 
		sites: Site[]; 
		currentSite: Site | null;
		onOpenIntake?: () => void;
		onOpenBrief?: () => void;
	} = $props();

	let isDropdownOpen = $state(false);
</script>

<header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			
			<!-- Brand & Platform Identity -->
			<div class="flex items-center space-x-4">
				<a href="/" class="flex items-center space-x-3 group">
					<div class="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800/20 group-hover:scale-105 transition-transform duration-200">
						<Activity class="w-5 h-5 text-sky-400" />
					</div>
					<div>
						<div class="flex items-center space-x-1.5">
							<span class="font-extrabold text-slate-900 tracking-tight text-lg">LakeKPI</span>
							<span class="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-sky-100 text-sky-800 border border-sky-200/80">PULSE</span>
						</div>
						<div class="text-[11px] font-medium text-slate-500 tracking-wide uppercase">Maracaibo Downstream Asset Operations</div>
					</div>
				</a>

				<!-- Divider -->
				<div class="hidden md:block h-6 w-px bg-slate-200"></div>

				<!-- Site Quick Switcher -->
				<div class="relative hidden sm:block">
					<button 
						onclick={() => isDropdownOpen = !isDropdownOpen}
						class="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 text-sm font-medium text-slate-700 transition-colors"
					>
						<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
						<span class="truncate max-w-[200px]">
							{currentSite ? currentSite.name : 'Lake Maracaibo Basin Overview'}
						</span>
						<ChevronDown class="w-4 h-4 text-slate-400" />
					</button>

					{#if isDropdownOpen}
						<div 
							class="absolute left-0 mt-1 w-72 rounded-lg bg-white border border-slate-200 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
							onmouseleave={() => isDropdownOpen = false}
						>
							<div class="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
								Managed Downstream Facilities
							</div>
							<a 
								href="/"
								onclick={() => isDropdownOpen = false}
								class="flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-700"
							>
								<div class="flex items-center space-x-2">
									<Layers class="w-4 h-4 text-slate-400" />
									<span class="font-medium">All Facilities (Basin Overview)</span>
								</div>
								{#if !currentSite}
									<CheckCircle2 class="w-4 h-4 text-sky-600" />
								{/if}
							</a>
							{#each sites as site}
								<a 
									href={`/${site.slug}`}
									onclick={() => isDropdownOpen = false}
									class="flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-sky-700 border-t border-slate-50"
								>
									<div>
										<div class="font-semibold text-slate-800">{site.name}</div>
										<div class="text-[11px] text-slate-500 capitalize">{site.type} • {site.nominal_capacity_desc}</div>
									</div>
									{#if currentSite && currentSite.id === site.id}
										<CheckCircle2 class="w-4 h-4 text-sky-600 shrink-0 ml-2" />
									{/if}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Right Control Center Actions -->
			<div class="flex items-center space-x-2 sm:space-x-3">
				
				<!-- Live Shift Tag -->
				<div class="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
					<Radio class="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
					<span>Shift A • 07:00–15:00 VET</span>
				</div>

				<!-- Action: Manual & CSV Intake -->
				<button 
					onclick={onOpenIntake}
					class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
					title="Manual Shift Log / CSV Data Intake"
				>
					<UploadCloud class="w-4 h-4 text-slate-500" />
					<span>Data Intake</span>
				</button>

				<!-- Action: Executive Shift Brief -->
				<button 
					onclick={onOpenBrief}
					class="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-700 to-indigo-800 hover:from-sky-800 hover:to-indigo-900 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer ring-1 ring-sky-900/20 hover:shadow"
					title="Generate Executive Shift Handover Brief"
				>
					<FileText class="w-4 h-4 text-sky-200" />
					<span>Shift Brief (AI)</span>
				</button>
			</div>

		</div>
	</div>
</header>
