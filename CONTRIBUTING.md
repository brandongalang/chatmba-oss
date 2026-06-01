# Contributing

Thanks for helping improve ChatMBA OSS.

## Project Boundaries

This repository is a local-first, self-hostable application workspace. Contributions should preserve these boundaries:

- Keep setup simple: SQLite plus bring-your-own-model keys.
- Do not add hosted-only dependencies as required defaults.
- Do not add proprietary admissions coaching prompts or expert guidance methods.
- Do not add real applicant profiles, private essays, or personal data.
- Keep school data clearly sourced or sample-only.
- Keep the generic assistant useful but non-proprietary.

## Development

```bash
bun install
cp .env.example .env.local
bun run db:migrate
bun run db:seed
bun run dev
```

Before opening a pull request:

```bash
bun run test
bun run typegen
bun run typecheck
bun run lint
bun run build
```

If a command fails because of a local native dependency or missing provider key, include the exact output in the pull request.

## Good First Contributions

- Improve local setup docs.
- Add tests around SQLite repository behavior.
- Improve accessibility and keyboard navigation.
- Add import/export for local applicant data.
- Add optional deployment guides for community programs.

## Licensing

By contributing, you agree that your contributions are licensed under AGPL-3.0-only.
