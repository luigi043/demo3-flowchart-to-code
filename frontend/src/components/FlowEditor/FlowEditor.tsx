/**
 * FlowEditor
 *
 * Main drag-and-drop flowchart canvas powered by React Flow.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import { NodeType, Flowchart } from "../../types";

const NODE_COLORS: Record<NodeType, string> = {
  start:    "#22c55e",
  end:      "#ef4444",
  process:  "#3b82f6",
  input:    "#a855f7",
  output:   "#f97316",
  decision: "#eab308",
};

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
    data: { label: "number", nodeType: "input" },
    style: { background: NODE_COLORS.input, color: "#fff", border: "none", borderRadius: 6 },
  },
  {
    id: "3",
    type: "default",
    position: { x: 120, y: 280 },
    data: { label: "number % 2 == 0", nodeType: "decision" },
    style: { background: NODE_COLORS.decision, color: "#000", border: "none", borderRadius: 6 },
  },
  {
    id: "4",
    type: "default",
    position: { x: 20, y: 400 },
    data: { label: '"Even"', nodeType: "output" },
    style: { background: NODE_COLORS.output, color: "#fff", border: "none", borderRadius: 6 },
  },
  {
    id: "5",
    type: "default",
    position: { x: 280, y: 400 },
    data: { label: '"Odd"', nodeType: "output" },
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

let nodeIdCounter = 10;

interface FlowEditorProps {
  onAddNode: (adder: (type: NodeType) => void) => void;
  onFlowchartChange: (fc: Flowchart) => void;
}

export const FlowEditor: React.FC<FlowEditorProps> = ({
  onAddNode,
  onFlowchartChange,
}) => {
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const flowInstanceRef = useRef<ReactFlowInstance | null>(null);

  const toFlowchart = useCallback((ns: Node[], es: Edge[]): Flowchart => ({
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
  }), []);

  const addNode = useCallback((type: NodeType) => {
    const id    = String(++nodeIdCounter);
    const defaultLabels: Record<NodeType, string> = {
      start: "Start",
      end: "End",
      process: "result = value * 2",
      input: "value",
      output: '"Result"',
      decision: "value > 0",
    };
    const newNode: Node = {
      id,
      type: "default",
      position: { x: 180 + Math.random() * 80, y: 180 + Math.random() * 80 },
      data: { label: defaultLabels[type], nodeType: type },
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
    setNodes((prev) => {
      const updated = [...prev, newNode];
      onFlowchartChange(toFlowchart(updated, edges));
      return updated;
    });
  }, [edges, onFlowchartChange, toFlowchart]);

  useEffect(() => {
    onAddNode(addNode);
    onFlowchartChange(toFlowchart(nodes, edges));
  }, [addNode, edges, nodes, onAddNode, onFlowchartChange, toFlowchart]);

  useEffect(() => {
    if (!editorRef.current) return;

    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        void flowInstanceRef.current?.fitView({ padding: 0.18, duration: 200 });
      });
    });
    observer.observe(editorRef.current);
    return () => observer.disconnect();
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const updated = applyNodeChanges(changes, nds);
      onFlowchartChange(toFlowchart(updated, edges));
      return updated;
    });
  }, [edges, onFlowchartChange, toFlowchart]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const updated = applyEdgeChanges(changes, eds);
      onFlowchartChange(toFlowchart(nodes, updated));
      return updated;
    });
  }, [nodes, onFlowchartChange, toFlowchart]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => {
      const updated = addEdge({ ...params, animated: true }, eds);
      onFlowchartChange(toFlowchart(nodes, updated));
      return updated;
    });
  }, [nodes, onFlowchartChange, toFlowchart]);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    const newLabel = window.prompt("Edit node label:", String(node.data.label));
    if (newLabel === null) return;
    setNodes((nds) => {
      const updated = nds.map((n) =>
        n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n
      );
      onFlowchartChange(toFlowchart(updated, edges));
      return updated;
    });
  }, [edges, onFlowchartChange, toFlowchart]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
      setNodes((nds) => {
        const updatedNodes = nds.filter((n) => n.id !== selectedId);
        setEdges((currentEdges) => {
          const updatedEdges = currentEdges.filter(
            (edge) => edge.source !== selectedId && edge.target !== selectedId
          );
          onFlowchartChange(toFlowchart(updatedNodes, updatedEdges));
          return updatedEdges;
        });
        return updatedNodes;
      });
      setSelectedId(null);
    }
  }, [selectedId, onFlowchartChange, toFlowchart]);

  return (
    <div ref={editorRef} className="flow-editor" onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={(_, node) => setSelectedId(node.id)}
        onPaneClick={() => setSelectedId(null)}
        onInit={(instance) => {
          flowInstanceRef.current = instance;
          window.requestAnimationFrame(() => void instance.fitView({ padding: 0.18 }));
        }}
        aria-label="Interactive flowchart canvas"
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
