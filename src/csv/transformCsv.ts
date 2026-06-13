import type { ParsedCsv } from './parseCsv';

export const DATE_FORMATS = ['yyyy/MM/dd', 'yyyy-MM-dd', 'yyyyMMdd'] as const;
export const AMOUNT_FORMATS = ['plain', 'comma'] as const;

export type DateFormat = (typeof DATE_FORMATS)[number];
export type AmountFormat = (typeof AMOUNT_FORMATS)[number];

export interface TransformCsvOptions {
  dateFormat: DateFormat;
  amountFormat: AmountFormat;
}

export interface TransformCsvResult {
  data: ParsedCsv;
  warnings: string[];
}

export const DEFAULT_TRANSFORM_OPTIONS: TransformCsvOptions = {
  dateFormat: 'yyyy/MM/dd',
  amountFormat: 'plain',
};

/**
 * Apply conservative CSV cleanup rules that are safe for an initial prototype:
 * trim surrounding whitespace, normalize obvious date values, and normalize
 * currency-like numeric strings without changing unrelated text fields.
 */
export function transformCsv(
  input: ParsedCsv,
  options: TransformCsvOptions = DEFAULT_TRANSFORM_OPTIONS,
): TransformCsvResult {
  const warnings: string[] = [];

  const headers = input.headers.map((header) => header.trim());
  const rows = input.rows.map((row) =>
    row.map((cell) => normalizeCell(cell.trim(), warnings, options)),
  );

  return { data: { headers, rows }, warnings };
}

export function isTransformCsvOptions(value: unknown): value is TransformCsvOptions {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const options = value as Record<string, unknown>;
  return (
    typeof options.dateFormat === 'string' &&
    DATE_FORMATS.includes(options.dateFormat as DateFormat) &&
    typeof options.amountFormat === 'string' &&
    AMOUNT_FORMATS.includes(options.amountFormat as AmountFormat)
  );
}

function normalizeCell(
  value: string,
  warnings: string[],
  options: TransformCsvOptions,
): string {
  const normalizedDate = normalizeDate(value, options.dateFormat);
  if (normalizedDate) {
    return normalizedDate;
  }

  const normalizedAmount = normalizeAmount(value, options.amountFormat);
  if (normalizedAmount) {
    return normalizedAmount;
  }

  if (looksLikeInvalidDate(value)) {
    warnings.push(`Value looks like a date but could not be normalized: ${value}`);
  }

  return value;
}

function normalizeDate(value: string, format: DateFormat): string | undefined {
  const ymd = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    return buildDate(ymd[1], ymd[2], ymd[3], format);
  }

  const compact = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    return buildDate(compact[1], compact[2], compact[3], format);
  }

  return undefined;
}

function buildDate(
  year: string,
  month: string,
  day: string,
  format: DateFormat,
): string | undefined {
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

  const paddedMonth = String(mm).padStart(2, '0');
  const paddedDay = String(dd).padStart(2, '0');

  switch (format) {
    case 'yyyy-MM-dd':
      return `${year}-${paddedMonth}-${paddedDay}`;
    case 'yyyyMMdd':
      return `${year}${paddedMonth}${paddedDay}`;
    case 'yyyy/MM/dd':
      return `${year}/${paddedMonth}/${paddedDay}`;
  }
}

function normalizeAmount(value: string, format: AmountFormat): string | undefined {
  if (!isValidAmountCandidate(value)) {
    return undefined;
  }

  const normalized = value.replace(/[¥$,"]/g, '').replace(/\s/g, '');
  return format === 'comma' ? addThousandsSeparators(normalized) : normalized;
}

function isValidAmountCandidate(value: string): boolean {
  return /^-?\s*[¥$]?\s*(?:(?:\d{1,3}(?:,\d{3})+)|\d+)(?:\.\d+)?$/.test(value);
}

function addThousandsSeparators(value: string): string {
  const sign = value.startsWith('-') ? '-' : '';
  const unsigned = sign ? value.slice(1) : value;
  const [integerPart, decimalPart] = unsigned.split('.');
  const integerWithSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${sign}${integerWithSeparators}${decimalPart === undefined ? '' : `.${decimalPart}`}`;
}

function looksLikeInvalidDate(value: string): boolean {
  return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value) || /^\d{8}$/.test(value);
}
