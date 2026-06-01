# Architecture

ChatMBA OSS is a local-first Next.js application backed by SQLite.

## Runtime

- Next.js app router
- SQLite via `better-sqlite3`
- Server-side API routes for persistence and assistant calls
- Client-side React state with refetch after mutations

## Out Of Scope

- Hosted authentication and multi-user permissions
- Realtime collaboration
- Billing or subscription flows
- Admissions coaching or insights features

## Provider Layer

`src/lib/ai/providers` exposes a small provider-neutral interface. Current providers are:

- OpenAI-compatible Chat Completions
- Anthropic Messages API
- Google Gemini API
- OpenRouter Chat Completions

When no key is configured, the assistant returns a deterministic fallback response so the app remains inspectable.

## Local Data

The SQLite database is created from `src/lib/db/schema.ts`. The app seeds sample fictional schools from `src/lib/sample-data/schools.ts`.
