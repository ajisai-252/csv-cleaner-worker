import { buildCsv } from './csv/buildCsv';
import { parseCsv } from './csv/parseCsv';
import {
  isTransformCsvOptions,
  transformCsv,
  type TransformCsvOptions,
} from './csv/transformCsv';
import { validateCsv } from './csv/validateCsv';
import { renderPage } from './html/renderPage';

const MAX_CSV_BYTES = 1_048_576;
const CSV_TOO_LARGE_ERROR = 'CSV is too large. Maximum size is 1MB.';

export interface Env {}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      if (request.method !== 'GET') {
        return jsonError('Method Not Allowed', 405, { Allow: 'GET' });
      }

      return new Response(renderPage(), {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    if (url.pathname === '/api/clean') {
      if (request.method !== 'POST') {
        return jsonError('Method Not Allowed', 405, { Allow: 'POST' });
      }

      return cleanCsv(request);
    }

    return jsonError('Not Found', 404);
  },
};

async function cleanCsv(request: Request): Promise<Response> {
  if (isContentLengthTooLarge(request.headers.get('content-length'))) {
    return jsonError(CSV_TOO_LARGE_ERROR, 413);
  }

  const body = await readCleanCsvRequest(request);
  if (!body) {
    return jsonError('Invalid request body.', 400);
  }

  const { csv, options } = body;
  if (isCsvTextTooLarge(csv)) {
    return jsonError(CSV_TOO_LARGE_ERROR, 413);
  }

  const parsed = parseCsv(csv);
  const validation = validateCsv(parsed.data);
  const transformed = transformCsv(parsed.data, options);
  const output = buildCsv(transformed.data);

  return Response.json({
    csv: output,
    warnings: [
      ...parsed.warnings,
      ...validation.warnings,
      ...transformed.warnings,
    ],
  });
}

interface CleanCsvRequestBody {
  csv: string;
  options: TransformCsvOptions;
}

async function readCleanCsvRequest(request: Request): Promise<CleanCsvRequestBody | undefined> {
  let body: unknown;

  try {
    body = await request.json();
  } catch (_error) {
    return undefined;
  }

  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const payload = body as Record<string, unknown>;
  if (typeof payload.csv !== 'string') {
    return undefined;
  }

  if (!isTransformCsvOptions(payload.options)) {
    return undefined;
  }

  return { csv: payload.csv, options: payload.options };
}

function isContentLengthTooLarge(contentLength: string | null): boolean {
  if (!contentLength) {
    return false;
  }

  const byteLength = Number(contentLength);
  return Number.isFinite(byteLength) && byteLength > MAX_CSV_BYTES;
}

function isCsvTextTooLarge(csv: string): boolean {
  return csv.length > MAX_CSV_BYTES || new TextEncoder().encode(csv).byteLength > MAX_CSV_BYTES;
}

function jsonError(error: string, status: number, headers?: HeadersInit): Response {
  return Response.json({ error }, { status, headers });
}
