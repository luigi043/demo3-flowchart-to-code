import { afterEach, expect, test, vi } from 'vitest';
import { convertFlowchart } from './api';

afterEach(() => { vi.unstubAllGlobals(); });
test('preserves actionable graph validation errors from the API', async () => {
  const body = { success: false, errors: ['Missing START node.'] };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 422, json: async () => body }));
  expect(await convertFlowchart({ nodes: [], edges: [] })).toEqual(body);
});
test('reports server failure', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
  await expect(convertFlowchart({ nodes: [], edges: [] })).rejects.toThrow('HTTP error 500');
});
