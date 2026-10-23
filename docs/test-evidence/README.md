# Test evidence

Captured on 23 October 2026 for Demo 3.

| Evidence | Result |
|---|---|
| backend-build | TypeScript compilation passed |
| backend-tests | 16 named tests passed, including actual Python execution |
| frontend-tests | 2 named API response tests passed |
| frontend-build | TypeScript and Vite production build passed |
| ui-pseudocode | Starter graph converted to matching pseudocode |
| ui-python | Python output tab displayed numeric input and both branches |
| ui-javascript | JavaScript tab, clipboard contents and download filename checked |
| ui-edit | Edited label appeared in regenerated output |
| ui-validation | Deleting Start produced the expected API validation message |

The four command PNGs are browser screenshots of the corresponding saved HTML
transcripts; their raw outputs are retained as `.log` files. Standard output and
standard error are captured separately and concatenated. They are not photographs
of an interactive terminal. The five `ui-` PNGs are direct screenshots of the
running application in Chromium.

`browser-smoke.log` records the successful UI checks and absence of page errors.
`browser-smoke-initial.log` preserves the initial clipboard assertion failure:
Windows supplied CRLF line endings and the test expected LF. The harness was
corrected to normalize line endings before comparison, then rerun successfully.

The scripts in `docs/` capture and package these results using this workstation's
bundled Node, Python, Playwright and python-docx dependencies. Adjust the runtime
paths when running elsewhere. Evidence generation does not alter the demo graph
stored on disk. Browser tests use temporary local ports 3303 and 5303.

Unexercised interactions: node dragging and creating/editing connections. The
converter intentionally supports structured, acyclic numeric algorithms rather
than arbitrary code translation or loops.
