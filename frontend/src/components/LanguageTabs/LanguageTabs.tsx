/**
 * LanguageTabs
 *
 * Tabbed panel that displays the three generated outputs:
 * Pseudocode | Python | JavaScript
 */

import React, { useState } from "react";
import { GenerationResult } from "../../types";

interface LanguageTabsProps {
  result: GenerationResult;
}

type Tab = "pseudocode" | "python" | "javascript";

const TABS: { id: Tab; label: string; accent: string }[] = [
  { id: "pseudocode",  label: "Pseudocode",  accent: "#cdd6f4" },
  { id: "python",      label: "Python",      accent: "#3b82f6" },
  { id: "javascript",  label: "JavaScript",  accent: "#eab308" },
];

export const LanguageTabs: React.FC<LanguageTabsProps> = ({ result }) => {
  const [active, setActive] = useState<Tab>("pseudocode");
  const [copied, setCopied] = useState(false);

  const code = result[active];

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleDownload = () => {
    const ext = active === "python" ? "py" : active === "javascript" ? "js" : "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #313244",
          background: "#181825",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "none",
              borderBottom: active === tab.id ? `2px solid ${tab.accent}` : "2px solid transparent",
              color: active === tab.id ? tab.accent : "#6c7086",
              fontSize: 13,
              fontWeight: active === tab.id ? 700 : 400,
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}

        {/* Action buttons */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingRight: 12 }}>
          <button onClick={handleCopy} style={actionBtnStyle}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button onClick={handleDownload} style={actionBtnStyle}>
            ↓ Download
          </button>
        </div>
      </div>

      {/* Code area */}
      <pre
        style={{
          flex: 1,
          margin: 0,
          padding: "16px 20px",
          background: "#1e1e2e",
          color: "#cdd6f4",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: 13,
          lineHeight: 1.7,
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {code}
      </pre>
    </div>
  );
};

const actionBtnStyle: React.CSSProperties = {
  background: "#313244",
  border: "1px solid #45475a",
  borderRadius: 5,
  color: "#cdd6f4",
  fontSize: 12,
  padding: "4px 10px",
  cursor: "pointer",
};
