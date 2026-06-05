import type { ParsedCsv } from './parseCsv';

export function buildCsv(input: ParsedCsv): string {
  return [input.headers, ...input.rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n');
}

function escapeCsvCell(value: string): string {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}
