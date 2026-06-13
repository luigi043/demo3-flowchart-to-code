/**
 * NodePanel
 *
 * Sidebar listing the available node types.
 * Users drag items from here onto the React Flow canvas.
 */

import React from "react";
import { NodeType } from "../../types";

interface NodeEntry {
  type: NodeType;
  label: string;
  color: string;
  shape: string;
}

const NODE_PALETTE: NodeEntry[] = [
  { type: "start",    label: "Start",    color: "#22c55e", shape: "●" },
  { type: "end",      label: "End",      color: "#ef4444", shape: "●" },
  { type: "process",  label: "Process",  color: "#3b82f6", shape: "▬" },
  { type: "input",    label: "Input",    color: "#a855f7", shape: "⬡" },
  { type: "output",   label: "Output",   color: "#f97316", shape: "⬡" },
  { type: "decision", label: "Decision", color: "#eab308", shape: "◆" },
];

interface NodePanelProps {
  onAddNode: (type: NodeType) => void;
}

export const NodePanel: React.FC<NodePanelProps> = ({ onAddNode }) => {
  return (
    <aside
      style={{
        width: 160,
        background: "#1e1e2e",
        borderRight: "1px solid #313244",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <p
        style={{
          color: "#cdd6f4",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        Nodes
      </p>

      {NODE_PALETTE.map((entry) => (
        <button
          key={entry.type}
          onClick={() => onAddNode(entry.type)}
          title={`Add ${entry.label} node`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#313244",
            border: `1px solid ${entry.color}55`,
            borderRadius: 6,
            padding: "8px 10px",
            color: "#cdd6f4",
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#45475a")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#313244")
          }
        >
          <span style={{ color: entry.color, fontSize: 16 }}>{entry.shape}</span>
          {entry.label}
        </button>
      ))}
    </aside>
  );
};
