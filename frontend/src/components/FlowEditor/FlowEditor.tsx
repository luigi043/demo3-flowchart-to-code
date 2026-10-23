/**
 * FlowEditor
 *
 * Main drag-and-drop flowchart canvas powered by React Flow.
 */

import React, { useCallback, useRef, useState } from "react";
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
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  MarkerType,
  NodeProps,
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

// SVG polygons keep the label upright and the connection handles outside the shape.
function FlowNode({ data }: NodeProps) {
  const type = data.nodeType as NodeType;
  const fill = NODE_COLORS[type];
  return <div style={{ width: 190, height: 86, position: "relative", color: "white" }}>
    {type !== "start" && <Handle type="target" position={Position.Top} />}
    <svg width="190" height="86" aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
      {type === "decision" ? <polygon points="95,1 189,43 95,85 1,43" fill={fill} />
        : type === "input" || type === "output" ? <polygon points="20,1 189,1 170,85 1,85" fill={fill} />
        : <rect x="1" y="1" width="188" height="84" rx={type === "start" || type === "end" ? 42 : 2} fill={fill} />}
    </svg>
    <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 25px", textAlign: "center", color: type === "decision" ? "#111" : "white", overflowWrap: "anywhere" }}>{data.label}</div>
    {type !== "end" && <Handle type="source" position={Position.Bottom} />}
  </div>;
}
const NODE_TYPES = { flow: FlowNode };

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
    position: { x: 120, y: 280 },
    data: { label: "number % 2 == 0", nodeType: "decision" },
    style: { background: NODE_COLORS.decision, color: "#000", border: "none", borderRadius: 6 },
  },
  {
    id: "4",
    type: "default",
    position: { x: 20, y: 400 },
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

let nodeIdCounter = 10;

interface FlowEditorProps {
  onAddNode: (adder: (type: NodeType) => void) => void;
  onFlowchartChange: (fc: Flowchart) => void;
}

export const FlowEditor: React.FC<FlowEditorProps> = ({
  onAddNode,
  onFlowchartChange,
}) => {
  const [nodes, setNodes] = useState<Node[]>(() => INITIAL_NODES.map(n => ({ ...n, type: "flow", style: undefined, data: { ...n.data, label: String(n.data.label).replace(/^(INPUT|OUTPUT) /, "") } })));
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    const newNode: Node = {
      id,
      type: "flow",
      position: { x: 180 + Math.random() * 80, y: 180 + Math.random() * 80 },
      data: { label, nodeType: type },
    };
    setNodes((prev) => {
      const updated = [...prev, newNode];
      return updated;
    });
  }, [edges, onFlowchartChange, toFlowchart]);

  React.useEffect(() => {
    onAddNode(addNode);
  }, [addNode]);
  React.useEffect(() => {
    onFlowchartChange(toFlowchart(nodes, edges));
  }, [nodes, edges, onFlowchartChange, toFlowchart]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const updated = applyNodeChanges(changes, nds);
      return updated;
    });
  }, [edges, onFlowchartChange, toFlowchart]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const updated = applyEdgeChanges(changes, eds);
      return updated;
    });
  }, [nodes, onFlowchartChange, toFlowchart]);

  const onConnect = useCallback((params: Connection) => {
    let label: string | undefined;
    if (nodes.find(n => n.id === params.source)?.data.nodeType === "decision") {
      const answer = window.prompt("Decision branch: yes or no", "yes");
      if (answer === null) return;
      label = answer.trim().toLowerCase();
      if (label !== "yes" && label !== "no") return;
    }
    setEdges((eds) => {
      const updated = addEdge({ ...params, label, animated: true }, eds);
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
      return updated;
    });
  }, [edges, onFlowchartChange, toFlowchart]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
      setNodes(nds => nds.filter(n => n.id !== selectedId));
      setEdges(eds => eds.filter(edge => edge.source !== selectedId && edge.target !== selectedId));
      setSelectedId(null);
    }
  }, [selectedId, edges, onFlowchartChange, toFlowchart]);

  return (
    <div style={{ flex: 1, height: "100%" }} onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={NODE_TYPES}
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeDoubleClick={(_, edge) => {
          const label = window.prompt("Edge label (yes/no for a decision):", String(edge.label ?? ""));
          if (label !== null) setEdges(eds => eds.map(e => e.id === edge.id ? { ...e, label: label.trim().toLowerCase() } : e));
        }}
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
