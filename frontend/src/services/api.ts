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

  const payload = await response.json().catch(() => null) as ConvertResponse | null;
  if (payload && typeof payload.success === "boolean") return payload;

  throw new Error(
    response.ok
      ? "The server returned an invalid response."
      : `The conversion service is unavailable (HTTP ${response.status}).`
  );
}
