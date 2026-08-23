# Architecture — Flowchart-to-Code Converter

## Pipeline overview

```
Flowchart (JSON)
      │
      ▼
PayloadValidator            ← runtime JSON shape and supported node types
      │
      ▼
FlowchartValidator          ← graph invariants, references, branches, reachability, cycles
      │
      ▼ (valid)
IRBuilder                   ← DFS traversal → flat ordered list of IRStatement objects
      │
      ├──► PseudocodeGenerator   → academic pseudocode (BEGIN/END/IF/ELSE)
      ├──► PythonGenerator       → Python 3 source
      └──► JavaScriptGenerator   → ES2020 source
```

## Intermediate Representation (IR)

The IR is a flat array of `IRStatement` objects:

```typescript
interface IRStatement {
  type:   IRStatementType;   // "START" | "END" | "PROCESS" | "INPUT" | "OUTPUT" | "IF" | "ELSE" | "END_IF"
  value?: string;            // Node label / expression
  depth:  number;            // Indentation level (0-based)
}
```

This design means:
- Generators are simple switch statements — easy to add new languages.
- The IR can be serialised / cached / compared between runs.
- Validation is completely decoupled from generation.

## Validation rules

| Rule | Description |
|---|---|
| Single START | Exactly one node of type `start` |
| Single END | Exactly one node of type `end` |
| Outgoing edges | Every non-END node must have ≥ 1 outgoing edge |
| Incoming edges | Every non-START node must have ≥ 1 incoming edge |
| Decision branches | Decision nodes must have exactly 2 edges: `yes` and `no` |
| Reachability | BFS from START must reach every node |
| Unique IDs | Node and edge identifiers cannot be duplicated |
| Edge references | Every edge source and target must name an existing node |
| Linear nodes | Non-decision nodes have at most one outgoing edge |
| Acyclic graph | Loops are rejected until loop statements exist in the IR |

## Decision node handling

```
Decision node
      │
      ├── yes ──► YES branch chain ──► merge point
      └── no  ──► NO  branch chain ──► merge point
                                             │
                                         continues
```

The IRBuilder determines the first shared reachable node before traversing
either branch. Each branch stops at that merge, `END_IF` is emitted, and only
then does traversal continue from the shared node. This prevents a shared END
node from being incorrectly emitted inside one branch.

This merge strategy is intentionally scoped to simple acyclic `if/else` flows.
General nested or irreducible control flow requires post-dominator analysis and
is not part of the current contract.

## Adding a language generator

```typescript
// 1. Create the file
// backend/src/generators/java/javaGenerator.ts

import { IR } from "../../models/types";

export function generateJava(ir: IR): string {
  const lines: string[] = ["public class Main {", "  public static void main(String[] args) {"];
  for (const stmt of ir) {
    // ... switch on stmt.type
  }
  lines.push("  }", "}");
  return lines.join("\n");
}

// 2. Call it in conversionService.ts
// 3. Add the tab in LanguageTabs.tsx
```
