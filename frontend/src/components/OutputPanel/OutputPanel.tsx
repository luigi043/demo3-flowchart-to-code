/**
 * OutputPanel
 *
 * Right-hand panel that shows either:
 *   • Validation errors
 *   • The LanguageTabs with generated code
 *   • An empty-state prompt
 */

import React from "react";
import { GenerationResult } from "../../types";
import { LanguageTabs } from "../LanguageTabs/LanguageTabs";

interface OutputPanelProps {
  result:  GenerationResult | null;
  errors:  string[];
  loading: boolean;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ result, errors, loading }) => {
  return (
    <section
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#1e1e2e",
        borderLeft: "1px solid #313244",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid #313244",
          color: "#cdd6f4",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          background: "#181825",
        }}
      >
        Generated Code
      </header>

      <div style={{ flex: 1, overflow: "auto" }}>
        {loading && (
          <div style={centerStyle}>
            <span style={{ color: "#89b4fa", fontSize: 14 }}>⟳ Generating…</span>
          </div>
        )}

        {!loading && errors.length > 0 && (
          <div style={{ padding: 20 }}>
            <p style={{ color: "#f38ba8", fontWeight: 700, marginBottom: 8 }}>
              ✕ Validation errors
            </p>
            <ul style={{ paddingLeft: 20, color: "#fab387", fontSize: 13 }}>
              {errors.map((e, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {!loading && !errors.length && result && (
          <LanguageTabs result={result} />
        )}

        {!loading && !errors.length && !result && (
          <div style={centerStyle}>
            <p style={{ color: "#6c7086", fontSize: 13, textAlign: "center" }}>
              Build a flowchart on the canvas,<br />then press <strong style={{ color: "#cdd6f4" }}>Convert</strong>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const centerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: 40,
};
