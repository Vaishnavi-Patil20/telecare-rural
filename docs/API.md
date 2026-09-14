# API Reference (v1)

Base: `/api/v1`

## Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/signup | – | phone + password; Indian 10-digit mobile validation |
| POST | /auth/login | – | rate-limited (20/15min), argon2id verify |
| POST | /auth/refresh | refresh token | rotating refresh tokens, hashed at rest |
| POST | /auth/logout | refresh token | revokes token |

## Doctors
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /doctors | – | search: `specialty`, `language`, `minExperience`, `maxFee`, `gender`, `verifiedOnly`; returns avg rating + consult count; **only verified doctors are returned by default** |
| GET | /doctors/:id | – | profile + reviews (documents never exposed) |
| GET | /doctors/:id/slots?date=YYYY-MM-DD | – | generated from availability rules, excludes taken/past slots; 403 if doctor unverified |
| PUT | /doctors/me/availability | DOCTOR | replace weekly availability rules (validated day 0–6, HH:MM, start < end) |

## Profiles
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET / PUT | /profiles/me | PATIENT | patient profile fields (name, DOB, gender, village, emergency contact, blood group, allergies, conditions) |
| POST / GET | /profiles/family | PATIENT | family member profiles (bookable as appointment subjects) |
| DELETE | /profiles/family/:id | PATIENT | ownership enforced server-side |

## Appointments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /appointments | PATIENT/HEALTH_WORKER | booking double-booking-safe; conservative triage tags ROUTINE/SOON/HIGH_PRIORITY/EMERGENCY_WARNING — triage support only, never a diagnosis |
| GET | /appointments/mine | any | list own appointments |
| PATCH | /appointments/:id/status | participant or ADMIN | lifecycle transitions; audited; notifies patient |

## Admin (ADMIN / SUPER_ADMIN only)
| Method | Endpoint | Description |
|---|---|---|
| GET | /admin/stats | platform counts (patients, doctors, verified, workers, appointments, consultations) |
| GET | /admin/users?role=&status=&search= | user list with role-specific name/verification info |
| PATCH | /admin/users/:id/status | suspend/activate (self-change blocked; confirmation happens in UI; audited) |
| GET | /admin/doctors/pending | applications incl. credential document metadata |
| POST | /admin/doctors/:id/verify | approve/reject → sets verified badge + notifies doctor (audited) |

## Conventions
- Errors: `{ "error": { "code", "message", "details?" } }`
- All privileged actions write an AuditLog row.
- Medical files: private object storage + short-lived signed URLs only.

## Coming in Phase 3+
Consultations + WebRTC signaling (WebSocket), chat, e-prescriptions, medical records, AI symptom assistant & report summarizer, reminders, notifications (email/push), reviews, analytics dashboards, facility finder, i18n.
