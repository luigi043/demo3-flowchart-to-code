/**
 * IRBuilder
 *
 * Traverses a validated flowchart (DAG) depth-first and emits a flat,
 * ordered list of IR statements.  The IR is the single source of truth
 * consumed by every code generator.
 *
 * Supported patterns
 * ──────────────────
 *   • Linear sequence   : start → process/input/output chain → end
 *   • Simple if/else    : decision node with yes/no branches that rejoin
 */

import {
  Flowchart,
  FlowEdge,
  FlowNode,
  IR,
  IRStatement,
} from "../models/types";

export class IRBuilder {
  private nodes: Map<string, FlowNode>;
  private outgoing: Map<string, FlowEdge[]>;
  private visited: Set<string>;
  private ir: IR;
  private depth: number;

  constructor(flowchart: Flowchart) {
    this.nodes    = new Map(flowchart.nodes.map((n) => [n.id, n]));
    this.outgoing = new Map(flowchart.nodes.map((n) => [n.id, []]));
    this.visited  = new Set();
    this.ir       = [];
    this.depth    = 0;

    for (const edge of flowchart.edges) {
      this.outgoing.get(edge.source)?.push(edge);
    }
  }

  build(): IR {
    const start = [...this.nodes.values()].find((n) => n.type === "start");
    if (!start) throw new Error("No START node found.");
    this.visit(start.id);
    return this.ir;
  }

  // ── Recursive DFS visitor ─────────────────────────────────────────────────

  private visit(nodeId: string, stopId?: string): void {
    if (nodeId === stopId) return;
    if (this.visited.has(nodeId)) return;

    const node = this.nodes.get(nodeId);
    if (!node) return;

    switch (node.type) {
      case "start":
        this.emit("START", undefined);
        this.visited.add(nodeId);
        this.advance(nodeId, stopId);
        break;

      case "end":
        this.emit("END", undefined);
        this.visited.add(nodeId);
        break;

      case "process":
        this.emit("PROCESS", node.label);
        this.visited.add(nodeId);
        this.advance(nodeId, stopId);
        break;

      case "input":
        this.emit("INPUT", node.label);
        this.visited.add(nodeId);
        this.advance(nodeId, stopId);
        break;

      case "output":
        this.emit("OUTPUT", node.label);
        this.visited.add(nodeId);
        this.advance(nodeId, stopId);
        break;

      case "decision":
        this.handleDecision(node, stopId);
        break;
    }
  }

  // ── Decision (if/else) handler ────────────────────────────────────────────

  private handleDecision(node: FlowNode, stopId?: string): void {
    this.visited.add(node.id);
    this.emit("IF", node.label);
    this.depth++;

    const outs  = this.outgoing.get(node.id) ?? [];
    const yesEdge = outs.find((e) => e.label?.toLowerCase() === "yes");
    const noEdge  = outs.find((e) => e.label?.toLowerCase() === "no");
    const mergeId = this.findMerge(yesEdge?.target, noEdge?.target);

    // YES branch
    if (yesEdge) this.visit(yesEdge.target, mergeId);

    this.depth--;
    this.emit("ELSE", undefined);
    this.depth++;

    // NO branch
    if (noEdge) this.visit(noEdge.target, mergeId);

    this.depth--;
    this.emit("END_IF", undefined);

    // Find the merge point (first node both branches reach) and continue
    if (mergeId) this.visit(mergeId, stopId);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private advance(nodeId: string, stopId?: string): void {
    const outs = this.outgoing.get(nodeId) ?? [];
    if (outs.length > 0) this.visit(outs[0].target, stopId);
  }

  private emit(type: IRStatement["type"], value: string | undefined): void {
    this.ir.push({ type, value, depth: this.depth });
  }

  /**
   * Naive merge-point finder: the first unvisited node reachable from
   * both branches of a decision.  Works for simple non-nested if/else.
   */
  private findMerge(
    yesStart: string | undefined,
    noStart: string | undefined
  ): string | undefined {
    if (!yesStart || !noStart) return undefined;

    const reachable = (startId: string): Set<string> => {
      const visited = new Set<string>();
      const queue = [startId];
      while (queue.length) {
        const id = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        for (const e of this.outgoing.get(id) ?? []) queue.push(e.target);
      }
      return visited;
    };

    const yesReach = reachable(yesStart);
    const noReach  = reachable(noStart);

    // Return the first node in yesReach that also appears in noReach
    for (const id of yesReach) {
      if (noReach.has(id) && !this.visited.has(id)) return id;
    }
    return undefined;
  }
}
