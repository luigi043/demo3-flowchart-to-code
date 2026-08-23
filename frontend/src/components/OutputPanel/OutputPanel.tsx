import { GenerationResult } from "../../types";
import { LanguageTabs } from "../LanguageTabs/LanguageTabs";

interface OutputPanelProps {
  result: GenerationResult | null;
  errors: string[];
  loading: boolean;
}

export function OutputPanel({ result, errors, loading }: OutputPanelProps) {
  return (
    <section className="output-panel" aria-labelledby="output-title" aria-live="polite">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Output</p>
          <h2 id="output-title">Generated code</h2>
        </div>
        <span className="status-dot"><i aria-hidden="true" /> API ready</span>
      </div>

      <div className="output-content">
        {loading && <div className="empty-state"><span className="loader" aria-hidden="true" /><p>Building three outputs...</p></div>}

        {!loading && errors.length > 0 && (
          <div className="error-state" role="alert">
            <strong>Check the flowchart</strong>
            <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
          </div>
        )}

        {!loading && errors.length === 0 && result && <LanguageTabs result={result} />}

        {!loading && errors.length === 0 && !result && (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">{`</>`}</span>
            <strong>Your code will appear here</strong>
            <p>Build a valid flowchart, then generate pseudocode, Python, and JavaScript together.</p>
          </div>
        )}
      </div>
    </section>
  );
}
