# TeleCare Rural — Healthcare Beyond Distance

Production-style telemedicine platform for rural/underserved communities in India.

## Monorepo Layout

```
telecare-rural/
├── apps/
│   ├── web/          # Next.js + TypeScript + Tailwind + shadcn/ui (frontend)
│   └── api/          # Node.js + TypeScript modular backend (Controller → Service → Repository)
├── packages/
│   └── database/     # Prisma schema + client
├── docs/             # Architecture, API, security notes
└── docker-compose.yml
```

## Phase Status

- [x] Phase 1 — Data model (Prisma), backend foundation (auth, RBAC, error handling, rate limiting)
- [ ] Phase 2 — Patient/Doctor/Admin portals (Next.js), appointment booking engine
- [ ] Phase 3 — WebRTC consultation + WebSocket chat/signaling
- [ ] Phase 4 — AI assistants (symptom triage, report summarization), i18n, voice, low-bandwidth mode
- [ ] Phase 5 — Notifications, reminders, analytics, hardening, deployment

## Quick Start (backend)

```bash
cd packages/database && npx prisma migrate dev --name init
cd ../../apps/api && npm install && npm run dev
```

## Safety Principles (non-negotiable)

1. AI output is **never** presented as diagnosis. Every AI surface shows:
   "This information is for assistance only and does not replace professional medical advice."
2. Emergency indicators route to: "Please contact emergency services or visit the nearest healthcare facility immediately."
3. AI assists with triage organization and summarization — it does not diagnose or prescribe.
