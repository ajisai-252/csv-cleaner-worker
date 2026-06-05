import type { ParsedCsv } from './parseCsv';

export interface TransformCsvResult {
  data: ParsedCsv;
  warnings: string[];
}

/**
 * Apply conservative CSV cleanup rules that are safe for an initial prototype:
 * trim surrounding whitespace, normalize obvious date values, and normalize
 * currency-like numeric strings without changing unrelated text fields.
 */
export function transformCsv(input: ParsedCsv): TransformCsvResult {
  const warnings: string[] = [];

  const headers = input.headers.map((header) => header.trim());
  const rows = input.rows.map((row) =>
    row.map((cell) => normalizeCell(cell.trim(), warnings)),
  );

  return { data: { headers, rows }, warnings };
}

function normalizeCell(value: string, warnings: string[]): string {
  const normalizedDate = normalizeDate(value);
  if (normalizedDate) {
    return normalizedDate;
  }

  const normalizedAmount = normalizeAmount(value);
  if (normalizedAmount) {
    return normalizedAmount;
  }

  if (looksLikeInvalidDate(value)) {
    warnings.push(`Value looks like a date but could not be normalized: ${value}`);
  }

  return value;
}

function normalizeDate(value: string): string | undefined {
  const ymd = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    return buildDate(ymd[1], ymd[2], ymd[3]);
  }

  const compact = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    return buildDate(compact[1], compact[2], compact[3]);
  }

  return undefined;
}

function buildDate(year: string, month: string, day: string): string | undefined {
  const yyyy = Number(year);
  const mm = Number(month);
  const dd = Number(day);
  const date = new Date(Date.UTC(yyyy, mm - 1, dd));

  if (
    date.getUTCFullYear() !== yyyy ||
    date.getUTCMonth() !== mm - 1 ||
    date.getUTCDate() !== dd
  ) {
    return undefined;
  }

  return `${year}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

function normalizeAmount(value: string): string | undefined {
  if (!/[¥$,]/.test(value)) {
    return undefined;
  }

  const normalized = value.replace(/[¥$,\s]/g, '');
  return /^-?\d+(\.\d+)?$/.test(normalized) ? normalized : undefined;
}

function looksLikeInvalidDate(value: string): boolean {
  return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value) || /^\d{8}$/.test(value);
}
