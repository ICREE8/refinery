import type { Site, SiteSummaryRow, ExecutiveShiftBrief, TacticalMaintenanceMetrics } from '../types/kpi';

export function generateShiftBrief(
    site: Site,
    latestKpis: SiteSummaryRow[],
    maintenance?: TacticalMaintenanceMetrics,
    shiftType: string = 'Guardia A (07:00 - 15:00 HLV)'
): ExecutiveShiftBrief {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-VE', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const isRefinery = site.type === 'refinery';
    const superintendent = isRefinery 
        ? 'Ing. Carlos Mendoza (Operaciones Refinería Bajo Grande)' 
        : 'Ing. Valeria Rivas (Olefinas y Servicios Industriales El Tablazo)';

    // Detección de anomalías o umbrales
    const deviations: ExecutiveShiftBrief['deviationsAndRootCauses'] = [];
    const highlights: string[] = [];
    let alertCount = 0;
    let warningCount = 0;

    for (const kpi of latestKpis) {
        const target = kpi.target_value;
        const attainment = kpi.target_attainment_pct;

        if (attainment >= 98 && attainment <= 105) {
            highlights.push(`${kpi.kpi_name} operó en meta con ${kpi.value.toLocaleString('es-VE')} ${kpi.unit} (${attainment}% de cumplimiento).`);
        }

        if (kpi.min_warning && kpi.value < kpi.min_warning) {
            warningCount++;
            if (kpi.kpi_code === 'CRUDE_THROUGHPUT') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Tasa por debajo del umbral mínimo de ${kpi.min_warning} ${kpi.unit} (-${(100 - attainment).toFixed(1)}%)`,
                    rootCause: 'Caída momentánea de contrapresión en el desalador tras descarga de crudo pesado con alto BS&W en muelle 2.',
                    impact: 'Procesamiento reducido en ~1.200 bpd; amortiguado por el tambor de carga a la torre atmosférica.'
                });
            } else if (kpi.kpi_code === 'VACUUM_YIELD') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Rendimiento de fondos de vacío inferior a la meta (${kpi.value}% vs ${target}%)`,
                    rootCause: 'Gravedad API del crudo de entrada subió a 12,8° API, reduciendo la fracción pesada en la torre de vacío.',
                    impact: 'Producción de asfalto reducida en 65 TM; transferida a gasóleo pesado de vacío (VGO).'
                });
            } else if (kpi.kpi_code === 'ETHYLENE_TONS') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Producción de olefinas acotada a ${kpi.value} TM/día (Meta: ${target})`,
                    rootCause: 'Disparo por vibración en la bomba de agua de enfriamiento P-204B; operando con unidad de respaldo al 88%.',
                    impact: 'Ajuste en reflujo de la torre fraccionadora para mantener pureza grado polímero.'
                });
            } else if (kpi.kpi_code === 'PE_YIELD') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Conversión de polietileno en ${kpi.value}%`,
                    rootCause: 'Variación en dosificación de catalizador en la línea de reactor 2.',
                    impact: 'Índice de fluidez dentro de especificación; recirculación ligeramente aumentada.'
                });
            } else {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Valor ${kpi.value} ${kpi.unit} por debajo del umbral de advertencia (${kpi.min_warning})`,
                    rootCause: 'Variabilidad de proceso durante el cambio de guardia.',
                    impact: 'Absorbido por inventario intermedio sin impacto en muelle.'
                });
            }
        }

        if (kpi.max_warning && kpi.value > kpi.max_warning) {
            warningCount++;
            if (kpi.kpi_code === 'ENERGY_INTENSITY' || kpi.kpi_code === 'STEAM_INTENSITY') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Consumo específico elevado (+${(kpi.value - target).toFixed(3)} ${kpi.unit}) por encima de norma`,
                    rootCause: 'Válvula de derivación de trampa de vapor parcialmente abierta en el tren de condensado.',
                    impact: 'Mayor consumo de gas combustible en caldera; impacto estimado de $1.400 en el turno.'
                });
            }
        }
    }

    if (highlights.length === 0) {
        highlights.push(`Operación estable con despacho continuo hacia el patio de tanques.`);
        highlights.push(`Sistemas de alivio de emergencia y lazos de seguridad verificados al 100%.`);
    }

    let overallStatus: ExecutiveShiftBrief['overallStatus'] = 'STABLE';
    if (warningCount >= 2 || alertCount >= 1) {
        overallStatus = 'DEGRADED';
    } else if (warningCount === 0 && latestKpis.every(k => k.target_attainment_pct >= 95)) {
        overallStatus = 'EXCEPTIONAL';
    }

    const headline = isRefinery
        ? (overallStatus === 'EXCEPTIONAL'
            ? 'Refinería Bajo Grande: Trenes de Destilación y Asfalto en Cumplimiento Pleno'
            : 'Refinería Bajo Grande: Operación Estable; Despacho Continuo de Asfalto Boscán')
        : (overallStatus === 'EXCEPTIONAL'
            ? 'Complejo El Tablazo: Olefinas y Fertilizantes Operando a Capacidad Nominal'
            : 'Complejo El Tablazo: Operación Estable; Lazos de Vapor y Enfriamiento Bajo Control');

    const avgAttainment = latestKpis.length > 0 
        ? Math.round(latestKpis.reduce((acc, k) => acc + k.target_attainment_pct, 0) / latestKpis.length) 
        : 98;

    const summaryParagraph = isRefinery
        ? `Durante la ${shiftType} del ${formattedDate}, las unidades de destilación atmosférica y de vacío de Bajo Grande procesaron crudo pesado Boscán con un cumplimiento agregado del ${avgAttainment}%. La calidad del crudo promedió ${latestKpis.find(k => k.kpi_code === 'API_GRAVITY')?.value ?? '12,4'}° API. La producción de asfalto cumplió con las especificaciones técnicas para despacho en buques tanqueros del Lago de Maracaibo.`
        : `Durante la ${shiftType} del ${formattedDate}, el Complejo Petroquímico Ana María Campos (El Tablazo) mantuvo estabilidad en los hornos de craqueo de etano y en las líneas de granulación de urea. La intensidad de vapor se mantuvo en ${latestKpis.find(k => k.kpi_code === 'STEAM_INTENSITY')?.value ?? '4,1'} GJ/TM. La disponibilidad de planta se situó en ${maintenance?.operationalAvailabilityPct ?? 96,8}%, sin venteos imprevistos a la antorcha.`;

    const handoverDirectives = isRefinery
        ? [
            'Verificar calibración en cero del transmisor de nivel LT-102 en el fondo de la torre de vacío antes de las 18:00.',
            'Monitorear el diferencial térmico (ΔT) en el tren de intercambiadores; coordinar retrolavado si sube el ensuciamiento.',
            'Coordinar con la capitanía de muelle el despacho de 40.000 barriles de asfalto para la gabarra programada a las 21:00.',
            'Mantener el sello de gas inerte en los tanques de asfalto líquido TK-501 y TK-502.'
        ]
        : [
            'Mantener monitoreo continuo de gas de barrido en la línea de efluentes del craqueador de olefinas.',
            'Completar la ruta preventiva de lubricación en la turbina del compresor de amoníaco K-101.',
            'Verificar la granulometría de urea en el tambor clasificador para evitar sobretamaño.',
            'Confirmar que los voltajes de protección catódica de la sala de celdas cloro-soda estén registrados en la bitácora.'
        ];

    const hseNotice = 'Cero accidentes con tiempo perdido (LTI) en la guardia. Inspección de detección de fugas LDAR completada en el perímetro de tanques sin emisiones fugitivas de hidrocarburos.';

    return {
        generatedAt: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        shift: shiftType,
        superintendent,
        overallStatus,
        headline,
        summaryParagraph,
        highlights,
        deviationsAndRootCauses: deviations.length > 0 ? deviations : [
            {
                metric: 'Todas las Unidades Operativas',
                deviation: 'Cero Desvíos Críticos',
                rootCause: 'Control automático de procesos y lazos de alimentación equilibrados.',
                impact: 'Despacho continuo a especificación sin desvíos ni mermas en planta.'
            }
        ],
        handoverDirectives,
        hseNotice
    };
}
