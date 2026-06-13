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

  return { valid: errors.length === 0, errors };
}
