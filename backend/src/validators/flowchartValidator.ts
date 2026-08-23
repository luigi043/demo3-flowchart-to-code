/**
 * FlowchartValidator
 *
 * Validates structural integrity of a flowchart before code generation.
 * Rules enforced:
 *   1. Exactly one START node
 *   2. Exactly one END node
 *   3. Every non-END node has at least one outgoing edge
 *   4. Every non-START node has at least one incoming edge
 *   5. Decision nodes have exactly two outgoing edges labelled "yes" and "no"
 *   6. No disconnected nodes (every node reachable from START)
 */

import { Flowchart, ValidationResult } from "../models/types";

const NODE_TYPES = new Set(["start", "end", "process", "input", "output", "decision"]);

export function validateFlowchartPayload(value: unknown): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== "object") {
    return { valid: false, errors: ["Flowchart must be an object."] };
  }

  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.nodes)) errors.push("Flowchart nodes must be an array.");
  if (!Array.isArray(candidate.edges)) errors.push("Flowchart edges must be an array.");
  if (errors.length > 0) return { valid: false, errors };

  const nodes = candidate.nodes as unknown[];
  const edges = candidate.edges as unknown[];

  nodes.forEach((node, index) => {
    if (!node || typeof node !== "object") {
      errors.push(`Node at index ${index} must be an object.`);
      return;
    }
    const item = node as Record<string, unknown>;
    if (typeof item.id !== "string" || item.id.trim() === "") {
      errors.push(`Node at index ${index} must have a non-empty string id.`);
    }
    if (typeof item.type !== "string" || !NODE_TYPES.has(item.type)) {
      errors.push(`Node at index ${index} has an unsupported type.`);
    }
    if (typeof item.label !== "string" || item.label.trim() === "") {
      errors.push(`Node at index ${index} must have a non-empty label.`);
    }
  });

  edges.forEach((edge, index) => {
    if (!edge || typeof edge !== "object") {
      errors.push(`Edge at index ${index} must be an object.`);
      return;
    }
    const item = edge as Record<string, unknown>;
    for (const key of ["id", "source", "target"] as const) {
      if (typeof item[key] !== "string" || item[key].trim() === "") {
        errors.push(`Edge at index ${index} must have a non-empty string ${key}.`);
      }
    }
    if (item.label !== undefined && typeof item.label !== "string") {
      errors.push(`Edge at index ${index} label must be a string when provided.`);
    }
  });

  return { valid: errors.length === 0, errors };
}

export function validateFlowchart(flowchart: Flowchart): ValidationResult {
  const errors: string[] = [];
  const { nodes, edges } = flowchart;

  if (nodes.length === 0) {
    return { valid: false, errors: ["Flowchart contains no nodes."] };
  }

  // ── Rule 1 & 2: count start / end nodes ──────────────────────────────────
  const startNodes = nodes.filter((n) => n.type === "start");
  const endNodes   = nodes.filter((n) => n.type === "end");

  if (startNodes.length === 0) errors.push("Missing START node.");
  if (startNodes.length > 1)   errors.push("Only one START node is allowed.");
  if (endNodes.length === 0)   errors.push("Missing END node.");
  if (endNodes.length > 1)     errors.push("Only one END node is allowed.");

  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) errors.push(`Duplicate node id "${node.id}".`);
    nodeIds.add(node.id);
  }

  const edgeIds = new Set<string>();
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) errors.push(`Duplicate edge id "${edge.id}".`);
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.source)) errors.push(`Edge "${edge.id}" has an unknown source.`);
    if (!nodeIds.has(edge.target)) errors.push(`Edge "${edge.id}" has an unknown target.`);
  }

  // ── Build adjacency helpers ───────────────────────────────────────────────
  const outgoing = new Map<string, typeof edges>(); // nodeId → edges leaving it
  const incoming = new Map<string, typeof edges>(); // nodeId → edges entering it

  for (const node of nodes) {
    outgoing.set(node.id, []);
    incoming.set(node.id, []);
  }

  for (const edge of edges) {
    outgoing.get(edge.source)?.push(edge);
    incoming.get(edge.target)?.push(edge);
  }

  // ── Rule 3 & 4: connectivity per node ────────────────────────────────────
  for (const node of nodes) {
    if (node.type !== "end" && (outgoing.get(node.id)?.length ?? 0) === 0) {
      errors.push(`Node "${node.label}" (${node.id}) has no outgoing edges.`);
    }
    if (node.type !== "start" && (incoming.get(node.id)?.length ?? 0) === 0) {
      errors.push(`Node "${node.label}" (${node.id}) has no incoming edges.`);
    }
    if (node.type === "start" && (incoming.get(node.id)?.length ?? 0) > 0) {
      errors.push("START node cannot have incoming edges.");
    }
    if (node.type === "end" && (outgoing.get(node.id)?.length ?? 0) > 0) {
      errors.push("END node cannot have outgoing edges.");
    }
    if (
      node.type !== "decision" &&
      node.type !== "end" &&
      (outgoing.get(node.id)?.length ?? 0) > 1
    ) {
      errors.push(`Node "${node.label}" must have exactly one outgoing edge.`);
    }
  }

  // ── Rule 5: decision nodes must have yes/no branches ─────────────────────
  const decisionNodes = nodes.filter((n) => n.type === "decision");
  for (const dn of decisionNodes) {
    const outs = outgoing.get(dn.id) ?? [];
    const labels = outs.map((e) => e.label?.toLowerCase());
    if (outs.length !== 2 || !labels.includes("yes") || !labels.includes("no")) {
      errors.push(
        `Decision node "${dn.label}" must have exactly two edges labelled "yes" and "no".`
      );
    }
  }

  // ── Rule 6: reachability from START via BFS ───────────────────────────────
  if (startNodes.length === 1) {
    const visited = new Set<string>();
    const queue = [startNodes[0].id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const edge of outgoing.get(current) ?? []) {
        queue.push(edge.target);
      }
    }
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        errors.push(
          `Node "${node.label}" (${node.id}) is not reachable from START.`
        );
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visiting.add(nodeId);
    for (const edge of outgoing.get(nodeId) ?? []) {
      if (hasCycle(edge.target)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };

  if (startNodes.length === 1 && hasCycle(startNodes[0].id)) {
    errors.push("Loops are not supported yet; the flowchart must be acyclic.");
  }

  return { valid: errors.length === 0, errors };
}
