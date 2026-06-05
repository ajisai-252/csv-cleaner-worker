/**
 * Future test target for transformCsv.
 *
 * Recommended minimal setup (not installed in this initial整理 step): Vitest or
 * Cloudflare Workers' official test tooling. Keep this file as a concrete test
 * scenario list until dependencies are intentionally added.
 */

const transformCsvTestCases = [
  {
    name: 'trims cells and normalizes simple dates and amounts',
    input: {
      headers: [' name ', ' date ', ' amount '],
      rows: [[' Alice ', '2026/5/1', '¥12,000']],
    },
    expected: {
      headers: ['name', 'date', 'amount'],
      rows: [['Alice', '2026-05-01', '12000']],
    },
  },
];

export { transformCsvTestCases };
