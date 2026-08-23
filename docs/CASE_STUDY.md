# Case Study: Flowchart to Code

## Problem

Visual flowcharts and source code represent the same control flow in different
forms. Converting directly from UI nodes into three languages would duplicate
graph traversal and make correctness depend on every generator.

## Options considered

| Approach | Benefit | Cost |
|---|---|---|
| Generate directly from React Flow nodes | Fast prototype | Traversal and validation duplicated per language |
| Convert the graph into an IR | One traversal contract for all languages | Requires a clear supported graph model |
| Parse into a full control-flow graph compiler | Handles complex programs | Too large for the educational scope |

## Recommendation

Use a small intermediate representation and reject graph shapes the IR cannot
represent honestly. This keeps the implementation understandable while giving
validation, traversal, and generation separate responsibilities.

## Implementation

The Express boundary first validates runtime JSON types. Structural validation
then checks unique identifiers, edge references, connectivity, decision labels,
and acyclic flow. `IRBuilder` finds the shared merge point before visiting
decision branches, which prevents the final `END` from being emitted inside the
yes branch. Three generators render the resulting ordered statements.

The React client uses the same domain contract, preserves structured API
validation errors, deletes connected edges with a removed node, and re-fits the
canvas after responsive layout changes. The interface exposes meaningful tab
and live-region semantics while respecting reduced-motion preferences.

## Verification

- Backend unit tests cover validation, merge ordering, and all generators.
- Frontend contract tests cover non-2xx validation payloads and invalid responses.
- Production TypeScript and Vite builds run locally and in GitHub Actions.
- Desktop and mobile screenshots were captured from the running application after an end-to-end conversion.

## Trade-offs and next steps

The current IR intentionally does not model loops, functions, or typed
expressions. Process and condition labels are emitted as user-provided syntax,
so a flowchart can be structurally valid while containing an expression that is
not valid in every target language. A future version should add loop statements
and a language-neutral expression grammar before advertising more complex
control flow.
