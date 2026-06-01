# ChatMBA OSS

ChatMBA OSS is a self-hostable MBA application workspace for applicants, advisors, schools, and community programs. It helps users track target schools, collect profile material, draft essays, and use a generic AI assistant while keeping application data in a local SQLite database.

## Why This Exists

MBA applications contain sensitive personal, career, and family context. A local-first option lets applicants and advisors keep that material under their own control while still using modern AI workflows.

Community programs can also host instances for applicants who need free access.

## Features

- SQLite local storage with `DATABASE_URL=file:./data/chatmba.db`
- Sample school/application tracking
- Profile material library for resume bullets, stories, notes, and raw context
- Essay draft storage
- Generic assistant with bring-your-own-model support
- Provider options for OpenAI, Anthropic, Google Gemini API, and OpenRouter
- Runs locally with SQLite; no hosted backend or payment integration required

## Scope

ChatMBA OSS focuses on local organization and drafting:

- school and application tracking
- profile material storage
- essay draft storage
- a generic planning assistant with bring-your-own-model support

It does not include hosted authentication, billing, realtime collaboration, or admissions coaching workflows. Multi-user hosted deployments should add their own auth, access controls, and operational hardening.

## Quick Start

Prerequisites: Bun, Node 20 or newer, and native build tools if your machine needs to compile `better-sqlite3`.

```bash
bun install
cp .env.example .env.local
bun run db:migrate
bun run db:seed
bun run dev
```

Open `http://localhost:3000`.

If you do not configure a model API key, the app runs in fallback mode so you can still inspect the workspace.

Before deploying or opening changes, run:

```bash
bun run test
bun run typegen
bun run typecheck
bun run lint
bun run build
```

## Model Providers

Set one provider in `.env.local`:

```bash
CHAT_MODEL_PROVIDER=openai
CHAT_MODEL_PRIMARY=gpt-4.1-mini
OPENAI_API_KEY=
```

```bash
CHAT_MODEL_PROVIDER=anthropic
CHAT_MODEL_PRIMARY=claude-sonnet-4-5
ANTHROPIC_API_KEY=
```

```bash
CHAT_MODEL_PROVIDER=google
CHAT_MODEL_PRIMARY=gemini-2.5-flash
GOOGLE_GENERATIVE_AI_API_KEY=
```

```bash
CHAT_MODEL_PROVIDER=openrouter
CHAT_MODEL_PRIMARY=deepseek/deepseek-v4-flash
OPENROUTER_API_KEY=
```

## Data Model

The local SQLite schema covers:

- schools
- selected schools and status
- profile materials
- essay drafts
- chat sessions
- chat messages

The default app is single-user. Hosted multi-user deployments should add their own auth and deployment hardening.

## License

ChatMBA OSS is licensed under AGPL-3.0-only. Modified network-hosted versions must publish their corresponding source changes under the same license.

The ChatMBA name, logo, hosted service identity, and scholarship program branding are not granted for use as official branding of modified versions.

## Scholarship Hosting

See [SCHOLARSHIP.md](./SCHOLARSHIP.md) for the intended free hosted access model.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
