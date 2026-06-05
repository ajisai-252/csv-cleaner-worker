/**
 * Future test target for validateCsv.
 *
 * The initial repository intentionally avoids adding a test framework or lockfile.
 * These cases document validation behavior to convert into executable tests when
 * the test runner is selected.
 */

const validateCsvTestCases = [
  {
    name: 'warns about duplicated headers and invalid date-like values',
    input: {
      headers: ['date', 'date'],
      rows: [['2026/13/01', 'ok']],
    },
    expectedWarnings: [
      'Duplicated header detected: date',
      'Invalid date-like value at row 2, column 1: 2026/13/01',
    ],
  },
];

export { validateCsvTestCases };
