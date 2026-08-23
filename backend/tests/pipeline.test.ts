/**
 * Unit tests for the core pipeline:
 *   validator → IRBuilder → generators
 */

import { validateFlowchart, validateFlowchartPayload } from "../src/validators/flowchartValidator";
import { IRBuilder } from "../src/services/irBuilder";
import { generatePseudocode } from "../src/generators/pseudocode/pseudocodeGenerator";
import { generatePython } from "../src/generators/python/pythonGenerator";
import { generateJavaScript } from "../src/generators/javascript/javascriptGenerator";
import { Flowchart } from "../src/models/types";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const evenOddFlowchart: Flowchart = {
  nodes: [
    { id: "1", type: "start",    label: "Start" },
    { id: "2", type: "input",    label: "number" },
    { id: "3", type: "decision", label: "number % 2 == 0" },
    { id: "4", type: "output",   label: '"Even"' },
    { id: "5", type: "output",   label: '"Odd"' },
    { id: "6", type: "end",      label: "End" },
  ],
  edges: [
    { id: "e1", source: "1", target: "2" },
    { id: "e2", source: "2", target: "3" },
    { id: "e3", source: "3", target: "4", label: "yes" },
    { id: "e4", source: "3", target: "5", label: "no"  },
    { id: "e5", source: "4", target: "6" },
    { id: "e6", source: "5", target: "6" },
  ],
};

const linearFlowchart: Flowchart = {
  nodes: [
    { id: "1", type: "start",   label: "Start" },
    { id: "2", type: "process", label: "x = 10" },
    { id: "3", type: "output",  label: "x" },
    { id: "4", type: "end",     label: "End" },
  ],
  edges: [
    { id: "e1", source: "1", target: "2" },
    { id: "e2", source: "2", target: "3" },
    { id: "e3", source: "3", target: "4" },
  ],
};

// ── Validator tests ────────────────────────────────────────────────────────────

describe("validateFlowchart", () => {
  test("passes a valid even/odd flowchart", () => {
    const result = validateFlowchart(evenOddFlowchart);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("fails when no START node", () => {
    const fc: Flowchart = {
      nodes: [{ id: "1", type: "end", label: "End" }],
      edges: [],
    };
    const result = validateFlowchart(fc);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("START"))).toBe(true);
  });

  test("fails when decision node lacks yes/no edges", () => {
    const fc: Flowchart = {
      nodes: [
        { id: "1", type: "start",    label: "Start" },
        { id: "2", type: "decision", label: "x > 0" },
        { id: "3", type: "end",      label: "End" },
      ],
      edges: [
        { id: "e1", source: "1", target: "2" },
        { id: "e2", source: "2", target: "3", label: "yes" },
        // Missing "no" edge
      ],
    };
    const result = validateFlowchart(fc);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("yes") || e.includes("no"))).toBe(true);
  });

  test("rejects cycles that the generators cannot represent", () => {
    const flowchart: Flowchart = {
      nodes: [
        { id: "1", type: "start", label: "Start" },
        { id: "2", type: "process", label: "x = x + 1" },
        { id: "3", type: "end", label: "End" },
      ],
      edges: [
        { id: "e1", source: "1", target: "2" },
        { id: "e2", source: "2", target: "2" },
      ],
    };

    const result = validateFlowchart(flowchart);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Loops are not supported yet; the flowchart must be acyclic.");
  });

  test("rejects malformed API payloads without throwing", () => {
    const result = validateFlowchartPayload({ nodes: "invalid", edges: [] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Flowchart nodes must be an array.");
  });
});

// ── IR Builder tests ───────────────────────────────────────────────────────────

describe("IRBuilder", () => {
  test("builds correct IR for linear flowchart", () => {
    const ir = new IRBuilder(linearFlowchart).build();
    const types = ir.map((s) => s.type);
    expect(types).toEqual(["START", "PROCESS", "OUTPUT", "END"]);
  });

  test("builds IF/ELSE/END_IF for decision node", () => {
    const ir = new IRBuilder(evenOddFlowchart).build();
    const types = ir.map((s) => s.type);
    expect(types).toEqual([
      "START",
      "INPUT",
      "IF",
      "OUTPUT",
      "ELSE",
      "OUTPUT",
      "END_IF",
      "END",
    ]);
  });
});

// ── Generator tests ───────────────────────────────────────────────────────────

describe("generatePseudocode", () => {
  test("contains BEGIN and END", () => {
    const ir = new IRBuilder(linearFlowchart).build();
    const code = generatePseudocode(ir);
    expect(code).toContain("BEGIN");
    expect(code).toContain("END");
  });
});

describe("generatePython", () => {
  test("contains print() for OUTPUT nodes", () => {
    const ir = new IRBuilder(linearFlowchart).build();
    const code = generatePython(ir);
    expect(code).toContain("print(");
  });

  test("contains input() for INPUT nodes", () => {
    const ir = new IRBuilder(evenOddFlowchart).build();
    const code = generatePython(ir);
    expect(code).toContain("input(");
  });
});

describe("generateJavaScript", () => {
  test("contains console.log() for OUTPUT nodes", () => {
    const ir = new IRBuilder(linearFlowchart).build();
    const code = generateJavaScript(ir);
    expect(code).toContain("console.log(");
  });

  test("contains closing brace for END_IF", () => {
    const ir = new IRBuilder(evenOddFlowchart).build();
    const code = generateJavaScript(ir);
    expect(code).toContain("}");
  });
});
