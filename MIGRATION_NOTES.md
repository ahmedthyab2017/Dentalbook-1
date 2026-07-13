# Migration Notes — Phase 0 + Phase 1 (vanilla JS → Next.js)

This tracks scope decisions made while porting the dentist370 admin app
(`../app/`) to Next.js/React, per the approved plan
(`warm-plotting-pearl` plan). The legacy `app/` folder is untouched and
still fully functional — this is a parallel rewrite.

## What's built (Phase 0 + Phase 1)

- Next.js 16 App Router + TypeScript project scaffold, `app.css` ported
  verbatim as the global stylesheet (same CSS variables/classes as legacy).
- Zustand stores: `useDbStore` (persisted to `localStorage['mukhtasar_v1']`
  in the exact bare-object format the legacy app uses — verified
  byte-compatible), `useSessionStore` (in-memory), `useUiPrefsStore`
  (persisted lang/theme), `useUndoStore` (in-memory, last 10 snapshots).
- 3-step auth flow: email/password gate (`/login`) → role picker
  (`/role`) → PIN (`/pin`), gated by license tier.
- AppShell: Sidebar (role/tier-filtered nav, unimplemented pages greyed
  out), Topbar (undo, theme toggle, settings, sign-out), idle-lock
  (auto-logout after `db.meta.idleLockMin` minutes).
- Dashboard: stat cards, today's appointments (with finish/revert),
  recent patients, 7-day revenue canvas chart (owner only).
- Patients: list + search + add/edit modal.
- Patient Profile: all 8 tabs (Info, Plans, Appointments, Rx, Payments,
  Chart/odontogram, Portal, Audit).

## Stubs / placeholders introduced (NOT full parity yet)

These are intentional Phase 1 simplifications, not oversights — call them
out explicitly before starting Phase 2 so nothing is silently skipped:

- **Referral / Consent / General Exam** buttons (Info tab) — omitted
  entirely. These depend on a printing/document-generation layer that
  doesn't exist yet in the new app.
- **Prescription printing** — the "طباعة" button in the Rx tab is
  present but disabled (no print pipeline yet).
- **Treatment plan sessions** — "بدء جلسة جديدة" / "إكمال" are simple
  status-flip actions (append a completed session / mark plan
  completed). The legacy app's full guided **QuickFlow** (4-step
  clinical session workflow, ~2,500 lines) is NOT ported — that's its
  own later phase.
- **Patient Portal tab** — shows a static "enable Cloud Sync" placeholder
  only. The real portal (QR code, access link, AI-drafted patient
  updates) depends on Cloud Sync integration, which isn't wired up in
  this phase.
- **Settings page** — placeholder stub only (exists so the Topbar's
  settings icon and sign-out flow have somewhere to link to).
- **Cloud Sync / license activation / AI X-ray assist** — not
  implemented; `DB.meta.cloud`/`ai`/`license` fields exist in the type
  model and default DB but have no UI yet.
- **Case Documentation, Photo Editor** — not started.
- **Finance, Reports, Insights, Recall & Reminders, Staff, Services,
  Inventory, Contacts, Backup, About, Tasks pages** — not started; their
  nav items render greyed-out ("قريباً") in the sidebar via the
  `IMPLEMENTED_PAGES` allowlist in `src/lib/constants.ts`.
- **Patient-facing pages** (MyFile/MyAppointments/MyPrescriptions) and
  the separate marketing `portal.html`/`patient-portal.html` — out of
  scope for this phase, not touched.
- **i18n** — Arabic-only for now; the legacy app's bilingual AR/EN
  toggle (`toggleLang`) isn't ported. `useUiPrefsStore` has a `lang`
  field reserved for this.
- **Demo seed data** is a small hand-written set (3 patients) for local
  dev convenience — not the legacy app's full elaborate seed.

## Verified

- `npm run build` and `npm run dev` succeed with no console errors on
  Dashboard, Patients, and Patient Profile (all 8 tabs).
- `localStorage['mukhtasar_v1']` written by the Next.js app is a bare
  `DentistDb` JSON object (no Zustand envelope) — confirmed identical
  top-level key set to the legacy app's `DB` object, so data created in
  either app is visible in the other when opened in the same browser
  profile.
- Auth flow works end-to-end for the `owner` role against seeded demo
  data; PIN default is `1234` (from `db.meta.ownerPin`).

## Next steps (Phase 2, not started)

Per the plan: Appointments (calendar page), Staff, Finance (5 tabs),
Reports, Insights, Recall & Reminders, Prescriptions (list page),
Inventory, Vendors/Contacts, Services, Settings (real), Backup, About —
then the highest-complexity items last: Case Documentation/Photo Editor
and the QuickFlow guided workflow.
