# Architecture

ChatMBA OSS is intentionally smaller than the private product workspace.

## Runtime

- Next.js app router
- SQLite via `better-sqlite3`
- Server-side API routes for persistence and assistant calls
- Client-side React state with refetch after mutations

## Removed From The Private Product

- InstantDB
- Instant auth/admin token/permissions
- Realtime database subscriptions
- Stripe and billing gates
- Insights and expert guidance features
- Proprietary admissions critique prompts
- Private reference profiles and strategy docs

## Provider Layer

`src/lib/ai/providers` exposes a small provider-neutral interface. Current providers are:

- OpenAI-compatible Chat Completions
- Anthropic Messages API
- Google Gemini API
- OpenRouter Chat Completions

When no key is configured, the assistant returns a deterministic fallback response so the app remains inspectable.

## Local Data

The SQLite database is created from `src/lib/db/schema.ts`. The app seeds sample fictional schools from `src/lib/sample-data/schools.ts`.
