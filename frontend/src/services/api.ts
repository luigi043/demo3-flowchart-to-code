/**
 * api.ts – thin wrapper around the backend /api/convert endpoint.
 */

import { Flowchart, ConvertResponse } from "../types";

const BASE_URL = "/api";

export async function convertFlowchart(
  flowchart: Flowchart
): Promise<ConvertResponse> {
  const response = await fetch(`${BASE_URL}/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flowchart }),
  });

  if (!response.ok && response.status !== 422 && response.status !== 400) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json() as Promise<ConvertResponse>;
}
