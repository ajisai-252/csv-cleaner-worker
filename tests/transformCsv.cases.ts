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
      rows: [
        [' Alice ', '2026/5/1', '¥12,000'],
        [' Bob ', '2026-5-1', '$3,000'],
        [' Carol ', '20260501', ' 4,500 '],
      ],
    },
    expected: {
      headers: ['name', 'date', 'amount'],
      rows: [
        ['Alice', '2026/05/01', '12000'],
        ['Bob', '2026/05/01', '3000'],
        ['Carol', '2026/05/01', '4500'],
      ],
    },
  },
];

export { transformCsvTestCases };
