/**
 * FlowEditor
 *
 * The main drag-and-drop flowchart canvas powered by React Flow.
 * Handles node/edge state and exposes the current flowchart to App.
 */

import React, { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

import { NodeType, Flowchart } from "../../types";

// ── Node colour map ───────────────────────────────────────────────────────────

const NODE_COLORS: Record<NodeType, string> = {
  start:    "#22c55e",
  end:      "#ef4444",
  process:  "#3b82f6",
  input:    "#a855f7",
  output:   "#f97316",
  decision: "#eab308",
};

// ── Default example nodes ─────────────────────────────────────────────────────

const INITIAL_NODES: Node[] = [
  {
    id: "1",
    type: "default",
    position: { x: 200, y: 40 },
    data: { label: "Start", nodeType: "start" },
    style: { background: NODE_COLORS.start, color: "#fff", border: "none", borderRadius: 50, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" },
  },
  {
    id: "2",
    type: "default",
    position: { x: 160, y: 160 },
    data: { label: "INPUT number", nodeType: "input" },
    style: { background: NODE_COLORS.input, color: "#fff", border: "none", borderRadius: 6 },
  },
  {
    id: "3",
    type: "default",
    position: { x: 130, y: 280 },
    data: { label: "number % 2 == 0", nodeType: "decision" },
    style: { background: NODE_COLORS.decision, color: "#000", border: "none", borderRadius: 6 },
  },
  {
    id: "4",
    type: "default",
    position: { x: 40, y: 400 },
    data: { label: 'OUTPUT "Even"', nodeType: "output" },
    style: { background: NODE_COLORS.output, color: "#fff", border: "none", borderRadius: 6 },
  },
  {
    id: "5",
    type: "default",
    position: { x: 280, y: 400 },
    data: { label: 'OUTPUT "Odd"', nodeType: "output" },
    style: { background: NODE_COLORS.output, color: "#fff", border: "none", borderRadius: 6 },
  },
  {
    id: "6",
    type: "default",
    position: { x: 200, y: 520 },
    data: { label: "End", nodeType: "end" },
    style: { background: NODE_COLORS.end, color: "#fff", border: "none", borderRadius: 50, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" },
  },
];

const INITIAL_EDGES: Edge[] = [
  { id: "e1", source: "1", target: "2", animated: true },
  { id: "e2", source: "2", target: "3", animated: true },
  { id: "e3", source: "3", target: "4", label: "yes", animated: true },
  { id: "e4", source: "3", target: "5", label: "no",  animated: true },
  { id: "e5", source: "4", target: "6", animated: true },
  { id: "e6", source: "5", target: "6", animated: true },
];

// ── Component ─────────────────────────────────────────────────────────────────

let nodeIdCounter = 10;

interface FlowEditorProps {
  onAddNode: (adder: (type: NodeType) => void) => void;
  onFlowchartChange: (fc: Flowchart) => void;
}

export const FlowEditor: React.FC<FlowEditorProps> = ({
  onAddNode,
  onFlowchartChange,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Expose add-node function to parent (for NodePanel)
  const addNode = useCallback(
    (type: NodeType) => {
      const id    = String(++nodeIdCounter);
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      const newNode: Node = {
        id,
        type: "default",
        position: { x: 200 + Math.random() * 80, y: 200 + Math.random() * 80 },
        data: { label, nodeType: type },
        style: {
          background: NODE_COLORS[type],
          color: type === "decision" ? "#000" : "#fff",
          border: "none",
          borderRadius: type === "start" || type === "end" ? 50 : 6,
          ...(type === "start" || type === "end"
            ? { width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }
            : {}),
        },
      };

      setNodes((nds) => {
        const updated = [...nds, newNode];
        syncFlowchart(updated, edges);
        return updated;
      });
    },
    [edges]
  );

  // Give parent access to addNode
  React.useEffect(() => {
    onAddNode(addNode);
  }, [addNode, onAddNode]);

  // Sync helpers
  const syncFlowchart = useCallback(
    (ns: Node[], es: Edge[]) => {
      onFlowchartChange({
        nodes: ns.map((n) => ({
          id: n.id,
          type: (n.data.nodeType as NodeType) ?? "process",
          label: String(n.data.label ?? ""),
          position: n.position,
        })),
        edges: es.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label ? String(e.label) : undefined,
        })),
      });
    },
    [onFlowchartChange]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const updated = addEdge({ ...params, animated: true }, eds);
        syncFlowchart(nodes, updated);
        return updated;
      });
    },
    [nodes, syncFlowchart]
  );

  // Label editing on double-click
  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const newLabel = window.prompt("Edit node label:", String(node.data.label));
      if (newLabel === null) return;
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n
        );
        syncFlowchart(updated, edges);
        return updated;
      });
    },
    [edges, syncFlowchart]
  );

  // Delete selected node with Delete/Backspace
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        setNodes((nds) => {
          const updated = nds.filter((n) => n.id !== selectedId);
          syncFlowchart(updated, edges);
          return updated;
        });
        setSelectedId(null);
      }
    },
    [selectedId, edges, syncFlowchart]
  );

  return (
    <div
      style={{ flex: 1, height: "100%" }}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChange(changes);
          syncFlowchart(nodes, edges);
        }}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={(_, node) => setSelectedId(node.id)}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} color="#313244" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(n) => NODE_COLORS[(n.data.nodeType as NodeType) ?? "process"]}
          style={{ background: "#181825" }}
        />
      </ReactFlow>
    </div>
  );
};
