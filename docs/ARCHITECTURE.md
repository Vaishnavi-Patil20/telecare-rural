# Architecture

## Backend layering
Controller → Service → Repository → Database (Prisma/PostgreSQL)

## Auth
- Passwords hashed with argon2id (never plain text).
- Access token: short-lived JWT. Refresh token: rotating, stored hashed in DB, revocable.
- Rate limiting + brute-force lockout on auth endpoints.
- RBAC middleware: roles PATIENT, DOCTOR, HEALTH_WORKER, ADMIN, SUPER_ADMIN.

## Real-time (Phase 3)
- WebSocket gateway (socket.io) for chat, presence, typing, read receipts, WebRTC signaling.
- TURN/STUN config for NAT traversal; low-bandwidth mode degrades video → audio-first.

## Security
- Helmet headers, CORS allowlist, request validation (zod), centralized error handler.
- Audit log on every privileged/admin action.
- Medical files served via short-lived signed URLs — never public storage URLs.
