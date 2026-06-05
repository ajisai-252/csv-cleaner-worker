export type CsvRow = string[];

export interface ParsedCsv {
  headers: string[];
  rows: CsvRow[];
}

export interface ParseCsvResult {
  data: ParsedCsv;
  warnings: string[];
}

/**
 * Parse a small UTF-8 CSV string into headers and rows.
 *
 * This intentionally keeps the initial implementation dependency-free for the
 * Worker starter. It supports quoted fields and escaped double quotes, while
 * returning warnings instead of throwing for non-fatal data issues.
 */
export function parseCsv(input: string): ParseCsvResult {
  const warnings: string[] = [];
  const records = splitCsvRecords(removeTrailingLineBreaks(input), warnings);

  if (records.length === 0) {
    return { data: { headers: [], rows: [] }, warnings: ['CSV is empty.'] };
  }

  const [headers, ...rows] = records;
  const expectedColumns = headers.length;

  rows.forEach((row, index) => {
    if (row.length !== expectedColumns) {
      warnings.push(
        `Row ${index + 2} has ${row.length} columns, expected ${expectedColumns}.`,
      );
    }
  });

  return { data: { headers, rows }, warnings };
}

function removeTrailingLineBreaks(input: string): string {
  return input.replace(/(?:\r\n|\r|\n)+$/, '');
}

function splitCsvRecords(input: string, warnings: string[]): CsvRow[] {
  const records: CsvRow[] = [];
  let record: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      record.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      record.push(field);
      records.push(record);
      record = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (inQuotes) {
    warnings.push('CSV contains an unclosed quoted field.');
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  // Ignore fully empty physical lines while preserving intentional spaces in non-empty cells.
  return records.filter((row) => row.some((value) => value.length > 0));
}
