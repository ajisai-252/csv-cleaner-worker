import type { ParsedCsv } from './parseCsv';

export interface CsvValidationResult {
  warnings: string[];
}

export function validateCsv(input: ParsedCsv): CsvValidationResult {
  const warnings: string[] = [];

  if (input.headers.length === 0) {
    warnings.push('CSV header row is missing.');
  }

  const duplicatedHeaders = findDuplicates(input.headers);
  duplicatedHeaders.forEach((header) => {
    warnings.push(`Duplicated header detected: ${header}`);
  });

  input.rows.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const value = cell.trim();
      const label = `row ${rowIndex + 2}, column ${columnIndex + 1}`;

      if (looksLikeInvalidDate(value)) {
        warnings.push(`Invalid date-like value at ${label}: ${value}`);
      }

      if (looksLikeInvalidAmount(value)) {
        warnings.push(`Invalid amount-like value at ${label}: ${value}`);
      }
    });
  });

  return { warnings };
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicated = new Set<string>();

  values.forEach((value) => {
    const key = value.trim();
    if (seen.has(key)) {
      duplicated.add(key);
    }
    seen.add(key);
  });

  return [...duplicated];
}

function looksLikeInvalidDate(value: string): boolean {
  if (!/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value) && !/^\d{8}$/.test(value)) {
    return false;
  }

  const parts = value.includes('-') || value.includes('/')
    ? value.split(/[-/]/)
    : [value.slice(0, 4), value.slice(4, 6), value.slice(6, 8)];
  const [year, month, day] = parts.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  );
}

function looksLikeInvalidAmount(value: string): boolean {
  if (!looksLikeAmountCandidate(value)) {
    return false;
  }

  return !/^-?\s*[¥$]?\s*(?:(?:\d{1,3}(?:,\d{3})+)|\d+)(?:\.\d+)?$/.test(value.trim());
}

function looksLikeAmountCandidate(value: string): boolean {
  if (/[¥$]/.test(value)) {
    return true;
  }

  return value.includes(',') && /^-?\s*\d[\d,\s.]*/.test(value.trim());
}
