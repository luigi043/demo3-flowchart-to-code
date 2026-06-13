/**
 * Core domain types for the Flowchart-to-Code Converter.
 * These types represent the Intermediate Representation (IR) that sits
 * between the visual editor and the code generators.
 */

// ─── Node Types ──────────────────────────────────────────────────────────────

export type NodeType =
  | "start"
  | "end"
  | "process"
  | "input"
  | "output"
  | "decision";

/**
 * A single node in the flowchart (maps directly to a React Flow node).
 */
export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;          // User-supplied text, e.g. "x = x + 1"
  position?: { x: number; y: number };
}

/**
 * A directed edge between two nodes.
 * For decision nodes: label should be "yes" or "no".
 */
export interface FlowEdge {
  id: string;
  source: string;         // Node id
  target: string;         // Node id
  label?: string;         // "yes" | "no" for decision branches
}

// ─── Flowchart (raw input from frontend) ─────────────────────────────────────

export interface Flowchart {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// ─── Intermediate Representation ─────────────────────────────────────────────

/**
 * The IR is a flat ordered list of statements derived from the flowchart.
 * Generators consume the IR, not the raw flowchart graph.
 */
export type IRStatementType =
  | "START"
  | "END"
  | "PROCESS"
  | "INPUT"
  | "OUTPUT"
  | "IF"
  | "ELSE"
  | "END_IF";

export interface IRStatement {
  type: IRStatementType;
  value?: string;           // Expression / variable name
  depth: number;            // Indentation level
}

export type IR = IRStatement[];

// ─── Generation Result ────────────────────────────────────────────────────────

export interface GenerationResult {
  pseudocode: string;
  python: string;
  javascript: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── API Contracts ────────────────────────────────────────────────────────────

export interface ConvertRequest {
  flowchart: Flowchart;
}

export interface ConvertResponse {
  success: boolean;
  result?: GenerationResult;
  errors?: string[];
}
