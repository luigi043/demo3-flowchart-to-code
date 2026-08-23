import { useCallback, useRef, useState } from "react";
import { FlowEditor } from "./components/FlowEditor/FlowEditor";
import { NodePanel } from "./components/NodePanel/NodePanel";
import { OutputPanel } from "./components/OutputPanel/OutputPanel";
import { useConverter } from "./hooks/useConverter";
import { Flowchart, NodeType } from "./types";
import "./styles.css";

export default function App() {
  const { result, errors, loading, convert } = useConverter();
  const [flowchart, setFlowchart] = useState<Flowchart>({ nodes: [], edges: [] });
  const addNodeRef = useRef<((type: NodeType) => void) | null>(null);

  const registerAddNode = useCallback((adder: (type: NodeType) => void) => {
    addNodeRef.current = adder;
  }, []);

  const handleConvert = () => {
    if (flowchart.nodes.length > 0) void convert(flowchart);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">F</div>
          <div>
            <p className="eyebrow">Visual programming workspace</p>
            <h1>Flowchart <span>to Code</span></h1>
          </div>
        </div>

        <div className="header-actions">
          <p className="keyboard-hint">Double-click to edit. Select and press Delete to remove.</p>
          <button
            className="convert-button"
            type="button"
            onClick={handleConvert}
            disabled={loading || flowchart.nodes.length === 0}
          >
            <span aria-hidden="true">{loading ? "↻" : "▶"}</span>
            {loading ? "Generating" : "Generate code"}
          </button>
        </div>
      </header>

      <main className="workspace">
        <NodePanel onAddNode={(type) => addNodeRef.current?.(type)} />
        <section className="canvas-panel" aria-label="Flowchart editor">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Canvas</p>
              <h2>Even or odd</h2>
            </div>
            <span className="status-pill">{flowchart.nodes.length} nodes</span>
          </div>
          <FlowEditor onAddNode={registerAddNode} onFlowchartChange={setFlowchart} />
        </section>
        <OutputPanel result={result} errors={errors} loading={loading} />
      </main>
    </div>
  );
}
