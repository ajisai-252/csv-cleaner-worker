import { buildCsv } from './csv/buildCsv';
import { parseCsv } from './csv/parseCsv';
import { transformCsv } from './csv/transformCsv';
import { validateCsv } from './csv/validateCsv';
import { renderPage } from './html/renderPage';

const MAX_CSV_BYTES = 1_048_576;

export interface Env {}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(renderPage(), {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/clean') {
      const contentLength = request.headers.get('content-length');
      if (contentLength && Number(contentLength) > MAX_CSV_BYTES) {
        return Response.json(
          { error: 'CSV payload is too large. Limit is about 1MB.' },
          { status: 413 },
        );
      }

      const csv = await request.text();
      if (new TextEncoder().encode(csv).byteLength > MAX_CSV_BYTES) {
        return Response.json(
          { error: 'CSV payload is too large. Limit is about 1MB.' },
          { status: 413 },
        );
      }

      const parsed = parseCsv(csv);
      const validation = validateCsv(parsed.data);
      const transformed = transformCsv(parsed.data);
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

    return new Response('Not Found', { status: 404 });
  },
};
