import { fmtElapsed, caseKey, newId } from '../src/screens/codeblue/helpers';
import { toCsv } from '../src/services/exportCSV';

describe('codeblue helpers', () => {
  test('fmtElapsed formats mm:ss', () => {
    expect(fmtElapsed(0)).toBe('00:00');
    expect(fmtElapsed(1000)).toBe('00:01');
    expect(fmtElapsed(61000)).toBe('01:01');
    expect(fmtElapsed(5 * 60000 + 7 * 1000)).toBe('05:07');
  });

  test('caseKey prefixes id', () => {
    expect(caseKey('abc123')).toBe('case:abc123');
  });

  test('newId returns short string', () => {
    const id = newId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThanOrEqual(6);
  });
});

describe('exportCSV toCsv', () => {
  test('toCsv produces CSV headers and rows', () => {
    const rows = [
      { a: '1', b: 'two' },
      { a: '3', b: 'four' }
    ];
    const csv = toCsv(rows as any);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('a,b');
    expect(lines[1]).toBe('1,two');
    expect(lines[2]).toBe('3,four');
  });
});
