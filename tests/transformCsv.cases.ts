/**
 * Future test target for transformCsv.
 *
 * Recommended minimal setup (not installed in this initial整理 step): Vitest or
 * Cloudflare Workers' official test tooling. Keep this file as a concrete test
 * scenario list until dependencies are intentionally added.
 */

const transformCsvTestCases = [
  {
    name: 'trims cells and normalizes simple dates and amounts with default options',
    input: {
      headers: [' name ', ' date ', ' amount '],
      rows: [
        [' Alice ', '2026/5/1', '¥12,000'],
        [' Bob ', '2026-5-1', '$3,000'],
        [' Carol ', '20260501', ' 4,500 '],
      ],
    },
    options: { dateFormat: 'yyyy/MM/dd', amountFormat: 'plain' },
    expected: {
      headers: ['name', 'date', 'amount'],
      rows: [
        ['Alice', '2026/05/01', '12000'],
        ['Bob', '2026/05/01', '3000'],
        ['Carol', '2026/05/01', '4500'],
      ],
    },
  },
  {
    name: 'normalizes dates with hyphen output and amounts with comma output',
    input: {
      headers: ['date', 'amount'],
      rows: [
        ['2026/5/1', '¥12,000'],
        ['2026-5-1', '$1,200.50'],
        ['20260501', '-¥12,000'],
      ],
    },
    options: { dateFormat: 'yyyy-MM-dd', amountFormat: 'comma' },
    expected: {
      headers: ['date', 'amount'],
      rows: [
        ['2026-05-01', '12,000'],
        ['2026-05-01', '1,200.50'],
        ['2026-05-01', '-12,000'],
      ],
    },
  },
  {
    name: 'normalizes dates with compact output',
    input: {
      headers: ['date'],
      rows: [['2026/5/1'], ['2026-5-1'], ['20260501']],
    },
    options: { dateFormat: 'yyyyMMdd', amountFormat: 'plain' },
    expected: {
      headers: ['date'],
      rows: [['20260501'], ['20260501'], ['20260501']],
    },
  },
  {
    name: 'does not normalize comma-separated text as amounts',
    input: {
      headers: ['company', 'note', 'amount'],
      rows: [['ABC, Inc.', 'Hello, world', '12,000']],
    },
    options: { dateFormat: 'yyyy/MM/dd', amountFormat: 'plain' },
    expected: {
      headers: ['company', 'note', 'amount'],
      rows: [['ABC, Inc.', 'Hello, world', '12000']],
    },
  },
];

export { transformCsvTestCases };
