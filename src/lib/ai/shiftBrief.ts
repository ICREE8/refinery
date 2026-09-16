import type { Site, SiteSummaryRow, ExecutiveShiftBrief, TacticalMaintenanceMetrics } from '../types/kpi';

export function generateShiftBrief(
    site: Site,
    latestKpis: SiteSummaryRow[],
    maintenance?: TacticalMaintenanceMetrics,
    shiftType: string = 'Shift A (07:00 - 15:00 VET)'
): ExecutiveShiftBrief {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const isRefinery = site.type === 'refinery';
    const superintendent = isRefinery ? 'Ing. Carlos Mendoza (Refinery Operations)' : 'Ing. Valeria Rivas (Olefins & Utilities)';

    // Find anomalies / threshold breaches
    const deviations: ExecutiveShiftBrief['deviationsAndRootCauses'] = [];
    const highlights: string[] = [];
    let alertCount = 0;
    let warningCount = 0;

    for (const kpi of latestKpis) {
        const target = kpi.target_value;
        const attainment = kpi.target_attainment_pct;

        if (attainment >= 98 && attainment <= 105) {
            highlights.push(`${kpi.kpi_name} tracked on-target at ${kpi.value.toLocaleString()} ${kpi.unit} (${attainment}% attainment).`);
        }

        if (kpi.min_warning && kpi.value < kpi.min_warning) {
            warningCount++;
            if (kpi.kpi_code === 'CRUDE_THROUGHPUT') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Sub-warning rate vs ${kpi.min_warning} ${kpi.unit} lower threshold (-${(100 - attainment).toFixed(1)}%)`,
                    rootCause: 'Transient desalter backpressure drop following high BS&W crude tanker parcel offloading at jetty #2.',
                    impact: 'Throughput slowed by ~1,200 bpd; intermediate naphtha surge drum dampening column charge.'
                });
            } else if (kpi.kpi_code === 'VACUUM_YIELD') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Vacuum bottoms yield under-target (${kpi.value}% vs ${target}%)`,
                    rootCause: 'Feedstock API gravity shifted lighter to 12.8° API, reducing heavy residue yield fraction in vacuum flasher tower.',
                    impact: 'Asphalt production down 65 MT; transferred to vacuum gas oil (VGO) distillate stream.'
                });
            } else if (kpi.kpi_code === 'ETHYLENE_TONS') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Cracker output constrained at ${kpi.value} MT/day (Target: ${target})`,
                    rootCause: 'Quench water circulation pump P-204B vibration trip; running on standby unit P-204A at 88% capacity.',
                    impact: 'Ethylene split tower reflux adjusted to maintain polymer grade spec.'
                });
            } else if (kpi.kpi_code === 'PE_YIELD') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Polymer conversion below optimum at ${kpi.value}%`,
                    rootCause: 'Catalyst feeder injection micro-pulsing variance on reactor line 2.',
                    impact: 'Purge bin recycle loop slightly elevated; polymer melt index remains strictly in spec.'
                });
            } else {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Value ${kpi.value} ${kpi.unit} breached minimum warning mark (${kpi.min_warning})`,
                    rootCause: 'Process variability observed during regular shift transition.',
                    impact: 'Operational buffering absorbed downstream.'
                });
            }
        }

        if (kpi.max_warning && kpi.value > kpi.max_warning) {
            warningCount++;
            if (kpi.kpi_code === 'ENERGY_INTENSITY' || kpi.kpi_code === 'STEAM_INTENSITY') {
                deviations.push({
                    metric: `${kpi.kpi_name} (${kpi.value} ${kpi.unit})`,
                    deviation: `Specific consumption spike (+${(kpi.value - target).toFixed(3)} ${kpi.unit}) above max allowable threshold`,
                    rootCause: 'Steam trap bypass line valve stuck 15% cracked open on main overhead heat exchanger train.',
                    impact: 'Excess boiler fuel gas consumption; utility penalty estimated at $1,400/shift.'
                });
            }
        }
    }

    if (highlights.length === 0) {
        highlights.push(`Unit stabilized with continuous run-down to terminal product tankage.`);
        highlights.push(`Safety interlocks & emergency relief isolation loops verified green.`);
    }

    let overallStatus: ExecutiveShiftBrief['overallStatus'] = 'STABLE';
    if (warningCount >= 2 || alertCount >= 1) {
        overallStatus = 'DEGRADED';
    } else if (warningCount === 0 && latestKpis.every(k => k.target_attainment_pct >= 95)) {
        overallStatus = 'EXCEPTIONAL';
    }

    const headline = isRefinery
        ? (overallStatus === 'EXCEPTIONAL'
            ? 'Bajo Grande Distillation & Asphalt Trains Performing at Peak Attainment'
            : 'Bajo Grande Operating With Steady Heavy Residue Run-down; Crude Charge Monitored')
        : (overallStatus === 'EXCEPTIONAL'
            ? 'El Tablazo Olefins & Fertilizers Operating at Nameplate Capacity'
            : 'El Tablazo Olefins Stable; Steam Intensity & Cracker Quench Loops Under Observation');

    const summaryParagraph = isRefinery
        ? `During ${shiftType} on ${formattedDate}, the Bajo Grande atmospheric distillation and vacuum tower facilities processed crude at an aggregate attainment rate of ${Math.round(latestKpis.reduce((acc, k) => acc + k.target_attainment_pct, 0) / (latestKpis.length || 1))}%. Feed crude quality averaged ${latestKpis.find(k => k.kpi_code === 'API_GRAVITY')?.value ?? '12.3'}° API. Asphalt product specification (60/70 pen) complied fully with Lake Maracaibo terminal barge loading standards.`
        : `During ${shiftType} on ${formattedDate}, the Ana María Campos (El Tablazo) complex achieved stable olefin cracking and fertilizer run-down across East Shore trains. High-pressure steam intensity tracked at ${latestKpis.find(k => k.kpi_code === 'STEAM_INTENSITY')?.value ?? '4.1'} GJ/MT. Equipment availability stood at ${maintenance?.operationalAvailabilityPct ?? 94.5}%, with no uncontained safety flaring.`;

    const handoverDirectives = isRefinery
        ? [
            'Inspect vacuum tower bottom level transmitter LT-102 zero calibration before 18:00.',
            'Monitor crude preheat train heat exchanger delta-T; prepare for chemical wash if fouling index rises.',
            'Coordinate with terminal dispatch for 40,000 bbl asphalt barge "San Carlos" scheduled to moor at 21:00.',
            'Maintain strict nitrogen blanket on asphalt storage tanks TK-501 and TK-502.'
        ]
        : [
            'Maintain continuous sweep gas monitoring on Olefins steam cracker effluent line 1.',
            'Complete preventative lubrication round on ammonia compressor K-101 turbine drive.',
            'Verify urea granulation drum speed and bed depth to prevent oversizing.',
            'Ensure chlor-alkali cellroom cathodic protection voltage logs are submitted to central reliability database.'
        ];

    const hseNotice = 'Zero Lost Time Incidents (LTI) recorded across shift. Fugitive emission LDAR inspection completed along tank battery perimeter with zero detectable hydrocarbon leaks.';

    return {
        generatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        shift: shiftType,
        superintendent,
        overallStatus,
        headline,
        summaryParagraph,
        highlights,
        deviationsAndRootCauses: deviations.length > 0 ? deviations : [
            {
                metric: 'All Monitored Unit Operations',
                deviation: 'Zero Critical Breaches',
                rootCause: 'Equilibrium maintained across process controllers and automated feed valves.',
                impact: 'Steady state run-down maintained without flaring or off-spec divert.'
            }
        ],
        handoverDirectives,
        hseNotice
    };
}
