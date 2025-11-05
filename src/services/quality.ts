import { EventLog } from '../data/types';

export type QualityMetrics = {
  timeToFirstShockSec: number | null;
  timeToFirstIvIoSec: number | null;
  timeToAdvancedAirwaySec: number | null;
  compressionInterruptions: number;
  teamActionsByActor: Record<string, number>;
  resourcesUsed: Record<string, number>;
  actionCount: number;
  durationSec: number | null;
  cprRatio: '30:2' | 'continuous';
};

export type DebriefSummary = {
  strengths: string[];
  suggestions: string[];
  headline: string;
};

function secFromItem(item: any): number {
  if (typeof item?.tSec === 'number') return item.tSec;
  if (typeof item?.tRelMs === 'number') return Math.round(item.tRelMs / 1000);
  return 0;
}

export function computeQualityMetrics(events: EventLog[]): QualityMetrics {
  const sorted = [...events].slice().reverse(); // oldest -> newest if needed
  let timeToFirstShockSec: number | null = null;
  let timeToFirstIvIoSec: number | null = null;
  let timeToAdvancedAirwaySec: number | null = null;
  let compressionInterruptions = 0;
  const teamActionsByActor: Record<string, number> = {};
  const resourcesUsed: Record<string, number> = {};
  let cprRatio: QualityMetrics['cprRatio'] = '30:2';

  let startSec: number | null = null;
  let endSec: number | null = null;

  for (const e of sorted) {
    const t = secFromItem(e);
    if (startSec === null) startSec = t; // first event time as start baseline
    endSec = t;

    // Derive key metrics from action strings and event types
    if ('action' in e) {
      const a = (e as any).action?.toLowerCase?.() ?? '';
      const section = (e as any).section || '';
      if (timeToFirstShockSec == null && (a.includes('shock') || a.includes('defibrill'))) timeToFirstShockSec = t;
      if (timeToFirstIvIoSec == null && (a.includes('iv') || a.includes('io'))) timeToFirstIvIoSec = t;
      if (a.includes('ratio changed') || a.includes('continuous')) cprRatio = 'continuous';
    }

    if ((e as any).type === 'airway') {
      if (timeToAdvancedAirwaySec == null && ((e as any).technique === 'advanced')) {
        timeToAdvancedAirwaySec = t;
        cprRatio = 'continuous';
      }
    }

    if ((e as any).type === 'team_action') {
      const actor = (e as any).actor || (e as any).who || 'Unknown';
      teamActionsByActor[actor] = (teamActionsByActor[actor] || 0) + 1;
    }

    if ((e as any).type === 'resource_use') {
      const res = (e as any).resource || 'Unknown';
      resourcesUsed[res] = (resourcesUsed[res] || 0) + ((e as any).quantity ?? 1);
    }

    // Naive compression interruption estimate: count events labeled 'pause' in C section
    if (((e as any).section === 'C') && ((e as any).action?.toLowerCase?.() || '').includes('pause')) {
      compressionInterruptions += 1;
    }
  }

  const durationSec = startSec !== null && endSec !== null ? Math.max(0, endSec - startSec) : null;

  const actionCount = events.length;

  return {
    timeToFirstShockSec,
    timeToFirstIvIoSec,
    timeToAdvancedAirwaySec,
    compressionInterruptions,
    teamActionsByActor,
    resourcesUsed,
    actionCount,
    durationSec,
    cprRatio,
  };
}

export function buildDebrief(metrics: QualityMetrics): DebriefSummary {
  const strengths: string[] = [];
  const suggestions: string[] = [];

  // Strengths and suggestions based on thresholds (simplified defaults)
  if (metrics.timeToFirstShockSec != null) {
    if (metrics.timeToFirstShockSec <= 120) strengths.push(`Early defibrillation (${metrics.timeToFirstShockSec}s)`);
    else suggestions.push(`Time to first shock was ${metrics.timeToFirstShockSec}s — consider earlier rhythm check/defibrillation.`);
  } else {
    suggestions.push('No shock delivered — verify defibrillator readiness and rhythm detection.');
  }

  if (metrics.timeToFirstIvIoSec != null) {
    if (metrics.timeToFirstIvIoSec <= 180) strengths.push(`Early IV/IO access (${metrics.timeToFirstIvIoSec}s)`);
    else suggestions.push(`IV/IO access at ${metrics.timeToFirstIvIoSec}s — consider earlier access planning.`);
  } else {
    suggestions.push('No IV/IO recorded — ensure access attempts are documented.');
  }

  if (metrics.timeToAdvancedAirwaySec != null) {
    strengths.push(`Advanced airway placed at ${metrics.timeToAdvancedAirwaySec}s; switched to ${metrics.cprRatio} compressions.`);
  }

  if (metrics.compressionInterruptions > 0) {
    suggestions.push(`${metrics.compressionInterruptions} noted CPR pauses — minimize interruptions and coordinate rhythm checks.`);
  } else {
    strengths.push('Minimal CPR interruptions recorded.');
  }

  const actorEntries = Object.entries(metrics.teamActionsByActor).sort((a,b) => b[1]-a[1]);
  if (actorEntries.length) {
    const top = actorEntries.slice(0,3).map(([name,count]) => `${name} (${count})`).join(', ');
    strengths.push(`Active participation: ${top}`);
  }

  const headline = 'Debrief summary based on timeline and actions';
  return { strengths, suggestions, headline };
}

export function metricsToRows(metrics: QualityMetrics): { key: string; value: string | number }[] {
  const rows = [
    { key: 'Duration (s)', value: metrics.durationSec ?? '' },
    { key: 'Total actions', value: metrics.actionCount },
    { key: 'CPR ratio', value: metrics.cprRatio },
    { key: 'Time to first shock (s)', value: metrics.timeToFirstShockSec ?? '' },
    { key: 'Time to IV/IO (s)', value: metrics.timeToFirstIvIoSec ?? '' },
    { key: 'Time to advanced airway (s)', value: metrics.timeToAdvancedAirwaySec ?? '' },
    { key: 'CPR interruptions', value: metrics.compressionInterruptions },
  ];
  return rows;
}
