import { EventLog } from '../data/types';

export type CsvRow = Record<string, string | number | null | undefined>;

export function toCsv(rows: CsvRow[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = (v ?? '').toString();
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => esc(r[h])).join(',')),
  ];
  return lines.join('\n');
}

export function logItemToCsvRow(item: EventLog, index: number): CsvRow {
  // Handle basic LogItem (backward compatibility)
  if (!('type' in item)) {
    return {
      index,
      time: (item as any).tSec ?? Math.round(((item as any).tRelMs ?? 0) / 1000),
      type: 'basic_event',
      section: (item as any).section,
      action: (item as any).action,
      details: (item as any).details,
    };
  }

  // Handle enhanced event types
  switch (item.type) {
    case 'resuscitation_ended':
      return {
        index,
        time: (item as any).tSec ?? Math.round(((item as any).tRelMs ?? 0) / 1000),
        type: item.type,
        reason: item.reason,
        cause: item.cause,
        notes: item.notes || '',
      };

    case 'rosc_achieved':
      return {
        index,
        time: (item as any).tSec ?? Math.round(((item as any).tRelMs ?? 0) / 1000),
        type: item.type,
        cause: item.cause,
        team: item.team,
        notes: item.notes || '',
      };

    case 'reversible_cause_note':
      return {
        index,
        time: (item as any).tSec ?? Math.round(((item as any).tRelMs ?? 0) / 1000),
        type: item.type,
        cause: item.cause,
        discussion: item.discussion,
        intervention: (item as any).intervention || (item as any).action || '',
      };

    case 'rhythm_analysis':
      return {
        index,
        time: (item as any).tSec ?? Math.round(((item as any).tRelMs ?? 0) / 1000),
        type: item.type,
        rhythm: item.rhythm,
        analysis: item.analysis,
        plan: item.plan,
      };

    case 'airway':
      return {
        index,
        time: (item as any).tSec ?? Math.round(((item as any).tRelMs ?? 0) / 1000),
        type: item.type,
        technique: (item as any).technique,
        step: (item as any).step,
        action: (item as any).action,
        details: (item as any).details ?? '',
      };

    case 'team_action':
      return {
        index,
        time: (item as any).tSec ?? Math.round(((item as any).tRelMs ?? 0) / 1000),
        type: item.type,
        actor: (item as any).actor ?? (item as any).who ?? '',
        role: (item as any).roleName ?? (item as any).role ?? '',
        action: (item as any).action,
        details: (item as any).details ?? '',
      };

    case 'resource_use':
      return {
        index,
        time: (item as any).tSec ?? Math.round(((item as any).tRelMs ?? 0) / 1000),
        type: item.type,
        resource: (item as any).resource,
        quantity: (item as any).quantity ?? '',
        purpose: (item as any).purpose ?? '',
      };

    case 'quality_metric':
      return {
        index,
        time: (item as any).tSec ?? Math.round(((item as any).tRelMs ?? 0) / 1000),
        type: item.type,
        metric: (item as any).metric,
        value: (item as any).value,
        benchmark: (item as any).benchmark ?? '',
      };

    default:
      return {
        index,
        time: (item as any).tSec ?? '',
        type: 'unknown_event',
        description: 'Unhandled event type',
      };
  }
}

export async function saveCsv(
  filename: string,
  rows: CsvRow[],
): Promise<string> {
  const header = '# MedResus Case Export\n# © 2025 MedResus. All rights reserved.\n# Generated: ' + new Date().toISOString() + '\n\n';
  const csv = header + toCsv(rows);
  // import expo-file-system dynamically so tests (node) that don't handle
  // the native module can mock or avoid loading it at module-eval time.
  const FileSystem = await import('expo-file-system').catch(() => null as any);
  const FS: any = FileSystem || {};
  const uri = (FS.documentDirectory ?? '') + filename;
  if (FS.writeAsStringAsync) await FS.writeAsStringAsync(uri, csv, { encoding: FS.EncodingType?.UTF8 });
  return uri; // file:// URI
}

export async function saveText(
  filename: string,
  text: string,
): Promise<string> {
  const header = 'MedResus Case Debrief\n© 2025 MedResus. All rights reserved.\nGenerated: ' + new Date().toISOString() + '\n\n';
  const content = header + text;
  const FileSystem = await import('expo-file-system').catch(() => null as any);
  const FS: any = FileSystem || {};
  const uri = (FS.documentDirectory ?? '') + filename;
  if (FS.writeAsStringAsync) await FS.writeAsStringAsync(uri, content, { encoding: FS.EncodingType?.UTF8 });
  return uri;
}
