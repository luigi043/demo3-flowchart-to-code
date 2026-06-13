/**
 * JavaScriptGenerator
 *
 * Converts the IR into valid JavaScript (ES2020) source code.
 *
 * Conventions
 * ───────────
 *   • INPUT nodes  → const variable = prompt("...")
 *   • OUTPUT nodes → console.log(...)
 *   • PROCESS nodes → emitted verbatim
 *   • IF/ELSE      → if (...) { ... } else { ... }
 */

import { IR } from "../../models/types";

const INDENT = "  "; // 2-space JS convention

export function generateJavaScript(ir: IR): string {
  const lines: string[] = [];

  for (const stmt of ir) {
    const pad = INDENT.repeat(stmt.depth);

    switch (stmt.type) {
      case "START":
        lines.push("// ── Program Start ──────────────────────────────────");
        break;

      case "END":
        lines.push("// ── Program End ────────────────────────────────────");
        break;

      case "PROCESS":
        lines.push(`${pad}${stmt.value ?? ""}`);
        break;

      case "INPUT": {
        const [prompt, varName] = parseInput(stmt.value ?? "");
        lines.push(`${pad}const ${varName} = prompt("${prompt}");`);
        break;
      }

      case "OUTPUT":
        lines.push(`${pad}console.log(${stmt.value ?? ""});`);
        break;

      case "IF":
        lines.push(`${pad}if (${stmt.value ?? ""}) {`);
        break;

      case "ELSE":
        lines.push(`${pad}} else {`);
        break;

      case "END_IF":
        lines.push(`${pad}}`);
        break;
    }
  }

  return lines.join("\n");
}

/**
 * Parses an INPUT label into [prompt, variableName].
 * Same convention as the Python generator.
 */
function parseInput(label: string): [string, string] {
  if (label.includes("->")) {
    const [promptPart, varPart] = label.split("->").map((s) => s.trim());
    return [`${promptPart}: `, varPart];
  }
  return [`Enter ${label}: `, label.trim()];
}
