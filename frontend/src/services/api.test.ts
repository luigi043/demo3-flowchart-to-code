import { afterEach, describe, expect, test, vi } from "vitest";
import { convertFlowchart } from "./api";
import { Flowchart } from "../types";

const flowchart: Flowchart = {
  nodes: [{ id: "1", type: "start", label: "Start" }],
  edges: [],
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("convertFlowchart", () => {
  test("preserves structured validation errors from non-2xx responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ success: false, errors: ["Missing END node."] }),
    }));

    await expect(convertFlowchart(flowchart)).resolves.toEqual({
      success: false,
      errors: ["Missing END node."],
    });
  });

  test("reports an invalid server response clearly", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ unexpected: true }),
    }));

    await expect(convertFlowchart(flowchart)).rejects.toThrow("invalid response");
  });
});
