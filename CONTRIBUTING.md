# Contributing

## Local workflow

1. Create a focused branch from `main`.
2. Install both applications with `npm run install:all`.
3. Add tests for new validation, traversal, generator, or API behavior.
4. Run `npm test` and `npm run build` from the repository root.
5. Use a Conventional Commit message such as `fix(backend): reject cyclic graphs`.

## Project rules

- Keep graph traversal inside the IR layer. Generators should only consume IR statements.
- Validate untrusted request data at the API boundary.
- Keep frontend and backend contracts synchronized.
- Do not commit `.env` files, build output, dependency folders, or generated coverage.
- Document a new node type or generator in both the README and architecture guide.

Pull requests should explain the user-facing change, the design decision, and
the commands used to verify it. Include screenshots when the interface changes.
