# Security Policy

ChatMBA OSS stores sensitive application material. Treat local databases, exports, logs, and provider keys with care.

## Reporting Issues

Please open a private security advisory on GitHub or contact the maintainer directly. Do not publish exploit details or real applicant data in public issues.

## Supported Version

Until the first tagged release, security fixes target `main`.

## Data Handling Notes

- The default SQLite database is local to the machine.
- `.env*` files are ignored except `.env.example`.
- Model provider API keys should stay in local environment files or deployment secrets.
- The generic assistant prompt avoids admissions guarantees and proprietary critique methods.
- Hosted deployments are responsible for adding auth, rate limits, backups, and transport security.

## Known Non-Goals In OSS V1

- No built-in multi-user permission system.
- No realtime collaboration.
- No payment processing.
- No hosted auth provider.
