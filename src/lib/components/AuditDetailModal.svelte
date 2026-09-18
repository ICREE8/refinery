<script lang="ts">
	import { 
		X, 
		ShieldCheck, 
		CheckCircle2, 
		FileText, 
		Scale, 
		Receipt, 
		Hash, 
		AlertTriangle, 
		Landmark, 
		ArrowRight 
	} from 'lucide-svelte';

	let {
		isOpen = false,
		metricKey = 'volumen',
		facilitySlug = 'el-tablazo',
		onClose = () => {}
	}: {
		isOpen: boolean;
		metricKey: string;
		facilitySlug?: string;
		onClose?: () => void;
	} = $props();

	let isRefinery = $derived(facilitySlug === 'bajo-grande');

	interface DetailData {
		title: string;
		badge: string;
		badgeColor: string;
		icon: string;
		primaryValue: string;
		primarySubtext: string;
		waterfall: string;
		invoices: { label: string; ref: string; detail: string }[];
		explanation: string;
	}

	let data = $derived.by<DetailData>(() => {
		if (metricKey === 'volumen') {
			if (isRefinery) {
				return {
					title: 'Detalle de Auditoría: Volumen Despachado',
					badge: '🟢 Verificado con Medidor Coriolis Fiscal',
					badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
					icon: '📦',
					primaryValue: '15.650,00 Barriles Fiscales',
					primarySubtext: 'Crudo pesado Boscán y asfalto de penetración AC-20 despachado hoy',
					waterfall: `├─ Tanque TK-501 Asfalto (Nivel Inicial):  22.400,00 Bbl
├─ Bombeo a Muelle de Carga:              -15.650,00 Bbl
│  ├─ Gabarra 'San Carlos' (Exportación):  11.200,00 Bbl (Guía #8812)
│  └─ Despacho Cisternas Nacional:          4.450,00 Bbl (Guía #8813)
└─ Remanente en Patio de Tanques:           6.750,00 Bbl`,
					invoices: [
						{ label: 'Guía de Despacho Fiscal', ref: '#BG-DESP-2026-0918-01', detail: 'Firmada por Fiscal de Muelle y Capitanía de Puerto' },
						{ label: 'Certificado de Aforo', ref: '#AFORO-TK501-REV3', detail: 'Densidad API corregida a 60°F: 12,4° API' },
						{ label: 'Precinto Aduanal', ref: '#SENIAT-BG-9921 al 9928', detail: 'Precintos de seguridad inviolables en brida de carga' }
					],
					explanation: 'El volumen despachado fue medido en línea con caudalímetro másico Micro Motion Coriolis con compensación de temperatura y presión en el muelle de Bajo Grande.'
				};
			}
			return {
				title: 'Detalle de Auditoría: Volumen Despachado',
				badge: '🟢 Verificado con Medidor Coriolis Fiscal',
				badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
				icon: '📦',
				primaryValue: '1.020,00 Toneladas Métricas',
				primarySubtext: 'Olefinas, polietileno de alta densidad y urea granulada en muelle',
				waterfall: `├─ Silos / Tanque TK-401 (Nivel Inicial):    1.450,00 TM
├─ Transferencia a Muelle Fiscal:          -1.020,00 TM
│  ├─ Buque Tanquero 'Caracas':               680,00 TM (Guía #4091)
│  └─ Distribución Cabotaje Regional:         340,00 TM (Guía #4092)
└─ Remanente en Silos de Almacenaje:          430,00 TM`,
				invoices: [
					{ label: 'Guía de Despacho SENIAT', ref: '#TAB-EXP-2026-0918-4091', detail: 'Carga certificada buque "Caracas" hacia puerto caribeño' },
					{ label: 'Guía de Tránsito Nacional', ref: '#TAB-CAB-2026-0918-4092', detail: 'Distribución agropecuaria de fertilizante urea' },
					{ label: 'Control Metrológico', ref: '#SENCAMER-ZUL-8820', detail: 'Balanza fiscal de muelle y medidor másico al día' }
				],
				explanation: 'Cada tonelada despachada cuenta con doble pesaje: lectura de flujo másico en el cargador continuo y calado final verificado del buque (Draft Survey).'
			};
		}

		if (metricKey === 'precio') {
			if (isRefinery) {
				return {
					title: 'Detalle de Auditoría: Precio Promedio Realizado',
					badge: '🟢 Indexado a Marcador Internacional Platts',
					badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
					icon: '🏷️',
					primaryValue: '$68,50 USD / Barril',
					primarySubtext: 'Precio ponderado de venta en muelle para el crudo y asfalto de hoy',
					waterfall: `├─ Marcador Crudo Pesado Boscán / Maya:        $71,20 / Bbl
├─ Diferencial Gravedad API (12,4° vs 14° Ref): -$1,80 / Bbl
├─ Descuento por Canal de Navegación Lago:      -$0,90 / Bbl
└─ Precio Neto Facturado en Puerto:            $68,50 / Bbl`,
					invoices: [
						{ label: 'Contrato de Venta', ref: '#PDV-INT-2026-BG-108', detail: 'Cláusula FOB Bajo Grande Terminal' },
						{ label: 'Publicación Platts', ref: '#PLATTS-LATAM-CLOSE-SEP17', detail: 'Marcador pesado referencia oficial' },
						{ label: 'Carta de Crédito LC', ref: '#LC-IRR-BNP-9021', detail: 'Garantía bancaria irrevocable confirmada' }
					],
					explanation: 'El precio se liquida mediante fórmula contractual transparente atada a cotizaciones internacionales de crudos pesados con descuentos de calidad auditados.'
				};
			}
			return {
				title: 'Detalle de Auditoría: Precio Promedio Realizado',
				badge: '🟢 Indexado a Marcador Internacional ICIS',
				badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
				icon: '🏷️',
				primaryValue: '$3.032,55 USD / Tonelada Métrica',
				primarySubtext: 'Precio neto realizado de exportación de polímeros y químicos',
				waterfall: `├─ Cotización Base ICIS PEAD (FOB Golfo):    $3.180,00 / TM
├─ Descuento Logístico Cuenca del Lago:       -$115,00 / TM
├─ Ajuste Especificación Grado Extrusión:      -$32,45 / TM
└─ Precio Neto Facturado en Puerto:          $3.032,55 / TM`,
				invoices: [
					{ label: 'Contrato Marco Internacional', ref: '#PEQUIVEN-GLOBAL-2026-88', detail: 'Términos Incoterms FOB Puerto Miranda / El Tablazo' },
					{ label: 'Boletín Semanal ICIS', ref: '#ICIS-POLYMERS-W38', detail: 'Índice de referencia para polietileno de alta densidad' },
					{ label: 'Acreditación Bancaria', ref: '#LC-CONFIRMED-SANT-441', detail: 'Fideicomiso bancario irrevocable de exportación' }
				],
				explanation: 'Los cargamentos de petroquímica se negocian bajo fórmulas de mercado globales, deduciendo fletes y ajustes por especificación molecular comprobada.'
			};
		}

		if (metricKey === 'facturado' || metricKey === 'dinero_bruto') {
			if (isRefinery) {
				return {
					title: 'Detalle de Auditoría: Total Facturado Hoy',
					badge: '🟢 Facturas Fiscales Electrónicas SENIAT',
					badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
					icon: '💵',
					primaryValue: '$1.072.025,00 USD',
					primarySubtext: 'Facturación bruta liquidada por 15.650 barriles despachados',
					waterfall: `├─ Gabarra 'San Carlos' (11.200 Bbl × $68,50): $767.200,00 USD (Fact. #7821)
├─ Cisternas (4.450 Bbl × $68,50):             $304.825,00 USD (Fact. #7822)
└─ Total Facturación Bruta del Día:          $1.072.025,00 USD`,
					invoices: [
						{ label: 'Factura Fiscal Exportación', ref: '#FAC-0001-0007821', detail: 'Monto: $767.200,00 USD · Buque "San Carlos"' },
						{ label: 'Factura Fiscal Mercado Interno', ref: '#FAC-0001-0007822', detail: 'Monto: $304.825,00 USD · Despacho asfalto vial' },
						{ label: 'Comprobante de Retención', ref: '#RET-IVA-ISLR-0918', detail: 'Aporte fiscal nacional procesado electrónicamente' }
					],
					explanation: 'El 100% de la facturación diaria está respaldado por facturas fiscales electrónicas autorizadas, con número de control correlativo y firma digital.'
				};
			}
			return {
				title: 'Detalle de Auditoría: Total Facturado Hoy',
				badge: '🟢 Facturas Fiscales Electrónicas SENIAT',
				badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
				icon: '💵',
				primaryValue: '$3.093.200,00 USD',
				primarySubtext: 'Facturación bruta liquidada por 1.020 toneladas despachadas',
				waterfall: `├─ Buque 'Caracas' (680 TM × $3.032,55):     $2.062.134,00 USD (Fact. #9901)
├─ Cabotaje (340 TM × $3.032,55):            $1.031.066,00 USD (Fact. #9902)
└─ Total Facturación Bruta del Día:          $3.093.200,00 USD`,
				invoices: [
					{ label: 'Factura Fiscal Exportación', ref: '#FAC-0002-0009901', detail: 'Monto: $2.062.134,00 USD · Exportación polietileno' },
					{ label: 'Factura Fiscal Agroquímica', ref: '#FAC-0002-0009902', detail: 'Monto: $1.031.066,00 USD · Despacho fertilizante urea' },
					{ label: 'Timbre Fiscal Aduanero', ref: '#TIMBRE-SENIAT-TAB-990', detail: 'Aranceles y tasas aduanales verificadas' }
				],
				explanation: 'Los montos facturados ingresan en dólares a través de mecanismos de compensación regulados, respaldados por facturas con valor probatorio ante la República.'
			};
		}

		if (metricKey === 'costos') {
			if (isRefinery) {
				return {
					title: 'Detalle de Auditoría: Costo Directo de Producción',
					badge: '🟢 Costos Operativos Auditados SAP / CMMS',
					badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
					icon: '⚙️',
					primaryValue: '$367.775,00 USD ($23,50 / Bbl)',
					primarySubtext: 'Gasto directo para mantener operativos los hornos y plantas de Bajo Grande',
					waterfall: `├─ Gas Combustible Hornos Atmosféricos (38%):  $139.754,50 USD
├─ Químicos Demulsificantes y Lavado (24%):     $88.266,00 USD
├─ Repuestos de Torre y Sellos Mecánicos (21%): $77.232,75 USD
├─ Nómina Operativa y Supervisión (17%):        $62.521,75 USD
└─ Total Costo Operativo Directo:              $367.775,00 USD`,
					invoices: [
						{ label: 'Suministro Gas Metano', ref: '#GAS-PDV-ZUL-0918', detail: 'Consumo térmico para calentadores de fondo de vacío' },
						{ label: 'Compra de Insumos Químicos', ref: '#OC-QUIM-2026-441', detail: 'Demulsificantes para separación de agua/sedimentos' },
						{ label: 'Órdenes de Trabajo de Turno', ref: '#OT-MAXIMO-BG-7701 a 7714', detail: '14 órdenes preventivas ejecutadas en la guardia' }
					],
					explanation: 'El costo de $23,50 por barril se encuentra por debajo de la meta de $25,00, logrando un margen de ganancia limpia de $66 por cada $100 facturados.'
				};
			}
			return {
				title: 'Detalle de Auditoría: Costo Directo de Producción',
				badge: '🟢 Costos Operativos Auditados SAP / CMMS',
				badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
				icon: '⚙️',
				primaryValue: '$1.219.920,00 USD ($1.196,00 / TM)',
				primarySubtext: 'Gasto directo para sintetizar olefinas y fertilizantes en El Tablazo',
				waterfall: `├─ Electricidad SEN y Gas Combustible (38%):   $463.569,60 USD
├─ Catalizadores Ziegler-Natta e Insumos (24%): $292.780,80 USD
├─ Repuestos de Mantenimiento y Sellos (21%):  $256.183,20 USD
├─ Cuadrillas de Planta y Nómina (17%):        $207.386,40 USD
└─ Total Costo Operativo Directo:            $1.219.920,00 USD`,
				invoices: [
					{ label: 'Suministro Eléctrico Corpoelec', ref: '#RECIBO-CORP-TAB-0918', detail: 'Potencia constante para turbocompresores' },
					{ label: 'Importación de Catalizador', ref: '#IMP-CAT-ZN-2026-12', detail: 'Reactivos para reactores de polimerización' },
					{ label: 'Órdenes de Trabajo Mecánico', ref: '#OT-MAXIMO-TAB-9901 a 9918', detail: 'Mantenimiento predictivo en compresores' }
				],
				explanation: 'Los costos directos absorben exactamente el 34% del ingreso bruto, dejando el 66% restante como excedente neto disponible para el Estado.'
			};
		}

		if (metricKey === 'fugas') {
			if (isRefinery) {
				return {
					title: 'Detalle de Auditoría: Desvío No Conciliado en Muelle',
					badge: '⚠️ En Auditoría Forense de Custodia',
					badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
					icon: '🚨',
					primaryValue: '-$18.450,00 USD (270 Barriles)',
					primarySubtext: 'Diferencia volumétrica registrada entre el tanque y la gabarra',
					waterfall: `├─ Volumen Salida de Patio de Tanques:        15.920,00 Bbl
├─ Volumen Recibido en Muelle de Despacho:   -15.650,00 Bbl
│  ├─ Contracción Térmica por Temperatura:      -120,00 Bbl (Normal)
│  ├─ Línea de Llenado Sublacustre:              -40,00 Bbl (Normal)
│  └─ Desvío en Contador Coriolis Muelle:       -110,00 Bbl (En Revisión)
└─ Impacto Fiscal No Conciliado:               -$18.450,00 USD`,
					invoices: [
						{ label: 'Acta de Discrepancia', ref: '#ACTA-DISC-BG-0918', detail: 'Levantada en conjunto por fiscal de tanque y capitán de gabarra' },
						{ label: 'Telemetría de Presión Oleoducto', ref: '#SCADA-LOG-PRESS-88', detail: 'Presión acústica estable sin indicios de perforación' },
						{ label: 'Solicitud de Calibración', ref: '#SOL-CALIB-CORIOLIS-03', detail: 'Verificación metrológica del transmisor del muelle 1' }
					],
					explanation: 'Se detectaron 270 barriles fuera de norma. 160 barriles corresponden a contracción térmica física de asfalto caliente al enfriarse, mientras que 110 barriles están en auditoría del medidor.'
				};
			}
			return {
				title: 'Detalle de Auditoría: Desvío No Conciliado en Muelle',
				badge: '⚠️ En Auditoría Forense de Custodia',
				badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
				icon: '🚨',
				primaryValue: '-$30.049,00 USD (10 Toneladas)',
				primarySubtext: 'Discrepancia entre la salida de plantas y el cargamento del buque',
				waterfall: `├─ Masa Salida de Unidades de Craqueo:        1.030,00 TM
├─ Masa Recibida en Buque (Muelle Fiscal):   -1.020,00 TM
│  ├─ Venteo Autorizado a Mechurrio:             -2,10 TM (Normal)
│  ├─ Evaporación en Ductos y Purgas:            -1,80 TM (Normal)
│  └─ Brecha No Explicada en Medidor:            -6,10 TM (En Revisión)
└─ Impacto Fiscal No Conciliado:               -$30.049,00 USD`,
				invoices: [
					{ label: 'Informe de Pérdidas de Planta', ref: '#INF-MERMA-TAB-0918', detail: 'Válvula de alivio térmico operó 18 minutos por sobrepresión' },
					{ label: 'Cámara Térmica Infrarroja Mechurrio', ref: '#IR-CAM-LOG-FLARE1', detail: 'Flama detectada sin venteos masivos no controlados' },
					{ label: 'Acta de Muestreo de Muelle', ref: '#ACTA-SGS-DRAFT-CARACAS', detail: 'Cálculo de calado del buque "Caracas"' }
				],
				explanation: 'La pérdida de 10 TM representa el 0,97% del volumen, dentro del límite de alerta pero con 6,1 TM sujetas a revisión metrológica en tolvas de despacho.'
			};
		}

		if (metricKey === 'banco') {
			if (isRefinery) {
				return {
					title: 'Detalle de Auditoría: Cobranza y Fideicomiso Bancario',
					badge: '🟢 Verificado con Banco Central y Fideicomiso',
					badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
					icon: '🏦',
					primaryValue: '82% Cobrado ($879.060 USD) · 18% Pendiente ($192.965 USD)',
					primarySubtext: 'Velocidad de liquidación promedio en 14,2 días (Meta: ≤ 18 días)',
					waterfall: `├─ Total Facturado Ciclo:                    $1.072.025,00 USD
├─ Liquidado en Cuenta Tesoro Nacional (82%):  $879.060,00 USD (Transf. #BVC-214)
└─ Facturas por Cobrar en Tránsito (18%):      $192.965,00 USD (LC Vence 5 días)`,
					invoices: [
						{ label: 'Liquidación Banco Central (BCV)', ref: '#TRANSF-BCV-2026-214', detail: 'Fondos 100% acreditados en cuenta única del Tesoro' },
						{ label: 'Carta de Crédito Irrevocable', ref: '#LC-SWIFT-MT700-4412', detail: 'Emisor: Banco de primer orden, pago contra entrega' },
						{ label: 'Certificado de Muelle', ref: '#DESCARGA-DOCK-STATION-88', detail: 'Condición de liberación automática de divisas' }
					],
					explanation: 'El 82% ya es dinero disponible en las arcas del Estado. El 18% restante está legalmente resguardado en fideicomiso bancario y se libera al atracar la gabarra en destino.'
				};
			}
			return {
				title: 'Detalle de Auditoría: Cobranza y Fideicomiso Bancario',
				badge: '🟢 Verificado con Banco Central y Fideicomiso',
				badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
				icon: '🏦',
				primaryValue: '82% Cobrado ($2.536.424 USD) · 18% Pendiente ($556.776 USD)',
				primarySubtext: 'Velocidad de liquidación promedio en 14,2 días (Meta: ≤ 18 días)',
				waterfall: `├─ Total Facturado Ciclo:                    $3.093.200,00 USD
├─ Liquidado en Cuenta Tesoro Nacional (82%):$2.536.424,00 USD (Transf. #BVC-883)
└─ Facturas por Cobrar en Tránsito (18%):      $556.776,00 USD (LC Vence 7 días)`,
				invoices: [
					{ label: 'Liquidación Banco Central (BCV)', ref: '#TRANSF-BCV-2026-883', detail: 'Fondos líquidos disponibles para presupuesto nacional' },
					{ label: 'Carta de Crédito Confirmada', ref: '#LC-SWIFT-MT700-9901', detail: 'Garantía emitida por banco internacional de comercio' },
					{ label: 'Conocimiento de Embarque (B/L)', ref: '#BL-MARITIME-CARACAS-01', detail: 'Documento original de propiedad en custodia bancaria' }
				],
				explanation: 'Los ingresos por exportaciones petroquímicas no corren riesgo de impago: están amparados por cartas de crédito comerciales irrevocables con cobro promedio en 14,2 días.'
			};
		}

		// Fallback o Valor Cívico
		return {
			title: 'Detalle de Auditoría: Valor Cívico y Distribución',
			badge: '🟢 Asignación Presupuestaria de Ley',
			badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
			icon: '🎁',
			primaryValue: isRefinery ? '$704.250 USD Excedente Neto' : '$1.873.280 USD Excedente Neto',
			primarySubtext: 'Distribución obligatoria del 100% del margen limpio para el desarrollo regional',
			waterfall: isRefinery 
				? `├─ Excedente Neto Realizado:                   $704.250,00 USD
│  ├─ Regalía Soberana (Salud y Educación):    $211.275,00 USD (30%)
│  ├─ Saneamiento Lago y Red Eléctrica:        $176.062,50 USD (25%)
│  ├─ Fondo de Mantenimiento Preventivo:       $211.275,00 USD (30%)
│  └─ Dividendo Comunitario San Francisco:     $105.637,50 USD (15%)
└─ Respaldo Eléctrico Generado:                 98.000 kWh`
				: `├─ Excedente Neto Realizado:                 $1.873.280,00 USD
│  ├─ Regalía Soberana (Salud y Educación):    $561.984,00 USD (30%)
│  ├─ Saneamiento Cuencas y Red Zulia:         $468.320,00 USD (25%)
│  ├─ Fondo de Mantenimiento de Planta:        $561.984,00 USD (30%)
│  └─ Dividendo Comunitario Altagracia:        $280.992,00 USD (15%)
└─ Respaldo Eléctrico Generado:                142.000 kWh`,
			invoices: [
				{ label: 'Gaceta Oficial Presupuestaria', ref: '#GAC-ZUL-FONDOS-2026', detail: 'Asignación del 25% para saneamiento y retiro de verdín en el Lago' },
				{ label: 'Acta de Entrega de Dividendo', ref: '#ACTA-COMUNA-0918', detail: 'Transferencia directa al poder comunal de los municipios ribereños' },
				{ label: 'Fideicomiso de Repuestos', ref: '#FID-MANT-PREVENT-88', detail: 'Fondo de contingencia para paradas de planta programadas' }
			],
			explanation: 'Cada dólar de margen neto tiene destino estipulado por ley para garantizar que la riqueza del petróleo y el gas beneficie a la gente del Zulia y al país.'
		};
	});
</script>

{#if isOpen}
	<!-- Backdrop: fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 -->
	<div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
		
		<!-- Container: Bottom sheet on mobile (rounded-t-2xl w-full max-h-[85vh] bg-white p-5 overflow-y-auto), centered card on desktop (sm:rounded-2xl sm:max-w-lg) -->
		<div class="rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] bg-white p-5 overflow-y-auto shadow-2xl border border-slate-200 flex flex-col space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
			
			<!-- Modal Header: Category icon + Title + Close button + Badge -->
			<div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
				<div class="space-y-1">
					<div class="flex items-center space-x-2">
						<span class="text-xl shrink-0">{data.icon}</span>
						<h3 class="font-bold text-slate-900 text-sm sm:text-base leading-tight">
							{data.title}
						</h3>
					</div>
					<div class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border {data.badgeColor}">
						{data.badge}
					</div>
				</div>

				<button 
					onclick={onClose}
					class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
					aria-label="Cerrar detalle"
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- 1. Top Summary Box -->
			<div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
				<div class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
					Cifra Fiscal Auditada
				</div>
				<div class="font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
					{data.primaryValue}
				</div>
				<p class="text-xs text-slate-500">
					{data.primarySubtext}
				</p>
			</div>

			<!-- 2. Formula & Calculation Waterfall (Indented 2-space grid) -->
			<div class="space-y-1.5">
				<div class="text-xs font-bold uppercase tracking-wider text-slate-400">
					Conciliación y Cascada de Cálculo
				</div>
				<pre class="font-mono text-xs text-slate-800 bg-slate-900/5 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed overflow-x-auto whitespace-pre">{data.waterfall}</pre>
			</div>

			<!-- 3. Physical Invoices & Audit Proof -->
			<div class="space-y-2">
				<div class="text-xs font-bold uppercase tracking-wider text-slate-400">
					Comprobantes Físicos y Guías de Entrega
				</div>
				<div class="space-y-1.5">
					{#each data.invoices as inv}
						<div class="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs flex flex-col space-y-0.5">
							<div class="flex items-center justify-between">
								<span class="font-semibold text-slate-900">{inv.label}</span>
								<span class="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">{inv.ref}</span>
							</div>
							<p class="text-[11px] text-slate-500">{inv.detail}</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- 4. Human-readable explanation in dignified Venezuelan Spanish -->
			<div class="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs text-amber-950 leading-relaxed">
				<strong>Criterio Ciudadano:</strong> {data.explanation}
			</div>

			<!-- Botón de Cierre -->
			<div class="pt-2">
				<button 
					onclick={onClose}
					class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
				>
					Entendido, Volver al Tablero
				</button>
			</div>

		</div>

	</div>
{/if}
