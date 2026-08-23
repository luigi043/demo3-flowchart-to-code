import { CSSProperties } from "react";
import { NodeType } from "../../types";

interface NodeEntry {
  type: NodeType;
  label: string;
  description: string;
  color: string;
  symbol: string;
}

const NODE_PALETTE: NodeEntry[] = [
  { type: "start", label: "Start", description: "Entry point", color: "#34d399", symbol: "●" },
  { type: "end", label: "End", description: "Exit point", color: "#fb7185", symbol: "●" },
  { type: "process", label: "Process", description: "Run a statement", color: "#60a5fa", symbol: "▬" },
  { type: "input", label: "Input", description: "Read a value", color: "#c084fc", symbol: "⬡" },
  { type: "output", label: "Output", description: "Display a value", color: "#fb923c", symbol: "⬡" },
  { type: "decision", label: "Decision", description: "Branch yes or no", color: "#facc15", symbol: "◆" },
];

interface NodePanelProps {
  onAddNode: (type: NodeType) => void;
}

export function NodePanel({ onAddNode }: NodePanelProps) {
  return (
    <aside className="node-panel" aria-labelledby="node-panel-title">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Toolbox</p>
          <h2 id="node-panel-title">Add a node</h2>
        </div>
      </div>
      <div className="node-list">
        {NODE_PALETTE.map((entry) => (
          <button
            className="node-button"
            key={entry.type}
            type="button"
            onClick={() => onAddNode(entry.type)}
            style={{ "--node-accent": entry.color } as CSSProperties}
          >
            <span className="node-symbol" aria-hidden="true">{entry.symbol}</span>
            <span>
              <strong>{entry.label}</strong>
              <small>{entry.description}</small>
            </span>
          </button>
        ))}
      </div>
      <p className="panel-tip"><span aria-hidden="true">✦</span> Connect decisions with yes and no labels.</p>
    </aside>
  );
}
