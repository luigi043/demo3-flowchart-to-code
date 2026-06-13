# Flowchart-to-Code Converter

A full-stack educational tool that converts visual flowcharts into
**Pseudocode**, **Python**, and **JavaScript** simultaneously.

---

## Features

| Feature | Details |
|---|---|
| Visual editor | Drag-and-drop canvas (React Flow) |
| Node types | Start, End, Process, Input, Output, Decision |
| Code generation | Pseudocode · Python 3 · JavaScript (ES2020) |
| Validation | Structural checks before generation |
| Export | Copy to clipboard · Download as file |
| Architecture | Modular IR pipeline — easy to add more languages |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · TypeScript · React Flow |
| Backend | Node.js · Express · TypeScript |
| Build | Vite (frontend) · ts-node-dev (backend) |
| Testing | Jest (backend) · Vitest (frontend) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd flowchart-to-code-converter

# Install all dependencies (root + workspaces)
npm install
cd frontend && npm install && cd ..
cd backend  && npm install && cd ..
```

### Running in development

```bash
# Terminal 1 – Backend (port 3001)
cd backend
npm run dev

# Terminal 2 – Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Usage

1. **Add nodes** – click any button in the left sidebar.
2. **Connect nodes** – drag from the handle on one node to another.
3. **Edit labels** – double-click any node.
4. **Delete nodes** – select a node, press `Delete`.
5. **Convert** – click the **▶ Convert** button in the header.
6. **View output** – switch tabs (Pseudocode / Python / JavaScript).
7. **Export** – click **Copy** or **↓ Download**.

---

## API Reference

### `POST /api/convert`

**Request body**

```json
{
  "flowchart": {
    "nodes": [
      { "id": "1", "type": "start",    "label": "Start" },
      { "id": "2", "type": "input",    "label": "number" },
      { "id": "3", "type": "decision", "label": "number % 2 == 0" },
      { "id": "4", "type": "output",   "label": "\"Even\"" },
      { "id": "5", "type": "output",   "label": "\"Odd\""  },
      { "id": "6", "type": "end",      "label": "End" }
    ],
    "edges": [
      { "id": "e1", "source": "1", "target": "2" },
      { "id": "e2", "source": "2", "target": "3" },
      { "id": "e3", "source": "3", "target": "4", "label": "yes" },
      { "id": "e4", "source": "3", "target": "5", "label": "no"  },
      { "id": "e5", "source": "4", "target": "6" },
      { "id": "e6", "source": "5", "target": "6" }
    ]
  }
}
```

**Success response (200)**

```json
{
  "success": true,
  "result": {
    "pseudocode": "BEGIN\n    INPUT number\n    IF number % 2 == 0 THEN\n    ...",
    "python":     "# ── Program Start ──\nnumber = input(\"Enter number: \")\n...",
    "javascript": "// ── Program Start ──\nconst number = prompt(\"Enter number: \");\n..."
  }
}
```

**Validation error response (422)**

```json
{
  "success": false,
  "errors": ["Decision node \"number % 2 == 0\" must have exactly two edges labelled \"yes\" and \"no\"."]
}
```

---

## Architecture

```
User
 │
 ▼
React Flow Editor  ──────────────────────► React State (Flowchart)
                                                    │
                                            POST /api/convert
                                                    │
                                                    ▼
                                           FlowchartValidator
                                                    │
                                                    ▼
                                              IRBuilder
                                       (graph → flat IR list)
                                                    │
                              ┌─────────────────────┼──────────────────────┐
                              ▼                     ▼                      ▼
                   PseudocodeGenerator    PythonGenerator     JavaScriptGenerator
                              │                     │                      │
                              └─────────────────────┴──────────────────────┘
                                                    │
                                           GenerationResult
                                                    │
                                                    ▼
                                          OutputPanel (frontend)
```

---

## Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## Project Structure

```
flowchart-to-code-converter/
├── package.json                    # Root workspace config
│
├── frontend/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx                # React entry point
│       ├── App.tsx                 # Root layout
│       ├── types/index.ts          # Shared types
│       ├── services/api.ts         # HTTP layer
│       ├── hooks/useConverter.ts   # Conversion state hook
│       └── components/
│           ├── FlowEditor/         # React Flow canvas
│           ├── NodePanel/          # Node palette sidebar
│           ├── OutputPanel/        # Error / output container
│           └── LanguageTabs/       # Pseudocode / Python / JS tabs
│
├── backend/
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Express entry point
│       ├── models/types.ts         # Domain types & API contracts
│       ├── routes/convert.ts       # POST /api/convert handler
│       ├── services/
│       │   ├── conversionService.ts  # Pipeline orchestrator
│       │   └── irBuilder.ts          # Flowchart → IR
│       ├── validators/
│       │   └── flowchartValidator.ts
│       └── generators/
│           ├── pseudocode/pseudocodeGenerator.ts
│           ├── python/pythonGenerator.ts
│           └── javascript/javascriptGenerator.ts
│
├── examples/
│   └── even-odd.json              # Sample flowchart for curl testing
│
└── docs/
    └── ARCHITECTURE.md
```

---

## Extending — Adding a New Language

1. Create `backend/src/generators/<lang>/<lang>Generator.ts`
2. Implement `generate<Lang>(ir: IR): string`
3. Import and call it in `conversionService.ts`
4. Add a new tab in `LanguageTabs.tsx`

---

## Future Improvements

- Loop support (while / for nodes in IR)
- AI-assisted flowchart generation from plain text
- Reverse conversion: paste code → generate flowchart
- Java, C#, Kotlin generators
- PDF export of full flowchart + code report
- User accounts & saved flowcharts

---

## License

MIT
