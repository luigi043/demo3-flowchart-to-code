// Mirrors backend/src/models/types.ts for use in the React app.

export type NodeType = "start" | "end" | "process" | "input" | "output" | "decision";

export interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  position?: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Flowchart {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface GenerationResult {
  pseudocode: string;
  python: string;
  javascript: string;
}

export interface ConvertResponse {
  success: boolean;
  result?: GenerationResult;
  errors?: string[];
}
