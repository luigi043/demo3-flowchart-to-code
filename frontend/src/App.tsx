/**
 * App.tsx – root component
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  Header (title + Convert button)                    │
 *   ├──────────┬──────────────────────┬───────────────────┤
 *   │ NodePanel│   FlowEditor canvas  │   OutputPanel     │
 *   └──────────┴──────────────────────┴───────────────────┘
 */

import React, { useCallback, useRef, useState } from "react";
import { NodePanel } from "./components/NodePanel/NodePanel";
import { FlowEditor } from "./components/FlowEditor/FlowEditor";
import { OutputPanel } from "./components/OutputPanel/OutputPanel";
import { useConverter } from "./hooks/useConverter";
import { Flowchart, NodeType } from "./types";

export default function App() {
  const { result, errors, loading, convert } = useConverter();
  const [flowchart, setFlowchart] = useState<Flowchart>({ nodes: [], edges: [] });

  // addNode function registered by FlowEditor, called by NodePanel
  const addNodeRef = useRef<((type: NodeType) => void) | null>(null);

  const handleAddNode = useCallback((adder: (type: NodeType) => void) => {
    addNodeRef.current = adder;
  }, []);

  const handleConvert = () => {
    if (flowchart.nodes.length === 0) return;
    convert(flowchart);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#11111b",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: "#cdd6f4",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 24px",
          background: "#181825",
          borderBottom: "1px solid #313244",
          flexShrink: 0,
        }}
      >
        <div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#89b4fa" }}>
            ◈ Flowchart
          </span>
          <span style={{ fontSize: 18, fontWeight: 400, color: "#cdd6f4" }}>
            {" "}to Code
          </span>
          <span
            style={{
              marginLeft: 10,
              fontSize: 11,
              background: "#313244",
              padding: "2px 8px",
              borderRadius: 20,
              color: "#6c7086",
              verticalAlign: "middle",
            }}
          >
            v1.0.0
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#6c7086" }}>
            Double-click node to edit · Delete key to remove
          </span>
          <button
            onClick={handleConvert}
            disabled={loading}
            style={{
              background: loading ? "#313244" : "#89b4fa",
              color: loading ? "#6c7086" : "#11111b",
              border: "none",
              borderRadius: 8,
              padding: "8px 22px",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "Converting…" : "▶ Convert"}
          </button>
        </div>
      </header>

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <NodePanel onAddNode={(type) => addNodeRef.current?.(type)} />

        {/* Canvas */}
        <FlowEditor
          onAddNode={handleAddNode}
          onFlowchartChange={setFlowchart}
        />

        {/* Output */}
        <div style={{ width: 480, flexShrink: 0 }}>
          <OutputPanel result={result} errors={errors} loading={loading} />
        </div>
      </div>
    </div>
  );
}
