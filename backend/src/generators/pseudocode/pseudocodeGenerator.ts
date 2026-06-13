/**
 * PseudocodeGenerator
 *
 * Converts the IR into human-readable pseudocode using standard
 * academic conventions (BEGIN/END, INPUT, OUTPUT, IF/ELSE/END IF).
 */

import { IR } from "../../models/types";

const INDENT = "    "; // 4 spaces per depth level

export function generatePseudocode(ir: IR): string {
  const lines: string[] = [];

  for (const stmt of ir) {
    const pad = INDENT.repeat(stmt.depth);

    switch (stmt.type) {
      case "START":
        lines.push("BEGIN");
        break;

      case "END":
        lines.push("END");
        break;

      case "PROCESS":
        lines.push(`${pad}${stmt.value ?? ""}`);
        break;

      case "INPUT":
        lines.push(`${pad}INPUT ${stmt.value ?? ""}`);
        break;

      case "OUTPUT":
        lines.push(`${pad}OUTPUT ${stmt.value ?? ""}`);
        break;

      case "IF":
        lines.push(`${pad}IF ${stmt.value ?? ""} THEN`);
        break;

      case "ELSE":
        lines.push(`${pad}ELSE`);
        break;

      case "END_IF":
        lines.push(`${pad}END IF`);
        break;
    }
  }

  return lines.join("\n");
}
