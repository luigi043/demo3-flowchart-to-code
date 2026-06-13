/**
 * PythonGenerator
 *
 * Converts the IR into valid Python 3 source code.
 *
 * Conventions
 * ───────────
 *   • INPUT nodes  → variable = input("...")
 *   • OUTPUT nodes → print(...)
 *   • PROCESS nodes → emitted verbatim (user writes valid Python)
 *   • IF/ELSE      → if .../else:
 */

import { IR } from "../../models/types";

const INDENT = "    "; // PEP 8: 4 spaces

export function generatePython(ir: IR): string {
  const lines: string[] = [];

  for (const stmt of ir) {
    const pad = INDENT.repeat(stmt.depth);

    switch (stmt.type) {
      case "START":
        lines.push("# ── Program Start ──────────────────────────────────");
        break;

      case "END":
        lines.push("# ── Program End ────────────────────────────────────");
        break;

      case "PROCESS":
        lines.push(`${pad}${stmt.value ?? ""}`);
        break;

      case "INPUT": {
        // Expect label like: "number" or "Enter a number: -> number"
        const [prompt, varName] = parseInput(stmt.value ?? "");
        lines.push(`${pad}${varName} = input("${prompt}")`);
        break;
      }

      case "OUTPUT":
        lines.push(`${pad}print(${stmt.value ?? ""})`);
        break;

      case "IF":
        lines.push(`${pad}if ${stmt.value ?? ""}:`);
        break;

      case "ELSE":
        lines.push(`${pad}else:`);
        break;

      case "END_IF":
        // Python has no explicit end-if; indentation handles it
        break;
    }
  }

  return lines.join("\n");
}

/**
 * Parses an INPUT label into [prompt, variableName].
 *
 * Supported formats:
 *   "number"                → prompt = "Enter number: ", var = "number"
 *   "Enter a number -> num" → prompt = "Enter a number: ", var = "num"
 */
function parseInput(label: string): [string, string] {
  if (label.includes("->")) {
    const [promptPart, varPart] = label.split("->").map((s) => s.trim());
    return [`${promptPart}: `, varPart];
  }
  return [`Enter ${label}: `, label.trim()];
}
