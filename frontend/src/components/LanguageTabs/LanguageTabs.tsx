import { useState } from "react";
import { GenerationResult } from "../../types";

type Tab = keyof GenerationResult;

const TABS: { id: Tab; label: string }[] = [
  { id: "pseudocode", label: "Pseudocode" },
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
];

export function LanguageTabs({ result }: { result: GenerationResult }) {
  const [active, setActive] = useState<Tab>("pseudocode");
  const [copyStatus, setCopyStatus] = useState("Copy");
  const code = result[active];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy failed");
    }
    window.setTimeout(() => setCopyStatus("Copy"), 1500);
  };

  const handleDownload = () => {
    const extension = active === "python" ? "py" : active === "javascript" ? "js" : "txt";
    const url = URL.createObjectURL(new Blob([code], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `flowchart.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-viewer">
      <div className="tab-toolbar">
        <div className="tabs" role="tablist" aria-label="Generated languages">
          {TABS.map((tab) => (
            <button
              id={`tab-${tab.id}`}
              key={tab.id}
              className={active === tab.id ? "active" : ""}
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="code-actions">
          <button type="button" onClick={() => void handleCopy()}>{copyStatus}</button>
          <button type="button" onClick={handleDownload}>Download</button>
        </div>
      </div>
      <pre id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`} tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
