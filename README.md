# ChatMBA OSS

ChatMBA OSS is a self-hostable MBA application workspace for applicants, advisors, schools, and community programs. It helps users track target schools, collect profile material, draft essays, and use a generic AI assistant while keeping application data in a local SQLite database.

This repository is the public, open-source edition. It intentionally excludes proprietary admissions guidance, expert critique prompts, insights features, paywalls, private reference profiles, and internal product strategy.

## Why This Exists

MBA applications contain sensitive personal, career, and family context. A local-first option lets applicants and advisors keep that material under their own control while still using modern AI workflows.

The project is also designed for scholarship hosting: a maintainer, nonprofit, school, or community program can run a hosted version for applicants who cannot pay for commercial coaching tools.

## Features

- SQLite local storage with `DATABASE_URL=file:./data/chatmba.db`
- Sample school/application tracking
- Profile material library for resume bullets, stories, notes, and raw context
- Essay draft storage
- Generic assistant with bring-your-own-model support
- Provider options for OpenAI, Anthropic, Google Gemini API, and OpenRouter
- No InstantDB, realtime backend, payment provider, or hosted auth required

## What Is Not Included

- Expert admissions guidance prompts
- Insights and strategic interpretation features
- Proprietary essay critique methods
- Real applicant profiles or reference profiles
- Stripe/paywall flows
- Internal launch, pricing, marketing, or research docs

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

Before deploying or submitting changes, run:

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
