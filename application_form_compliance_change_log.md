# Al-Asr Application Form Compliance Change Log

Date: 2026-03-17

## Scope Completed

- Implemented legal hardening and auditability upgrades across admissions submission flow.
- Added Next.js server relay endpoint: `app/api/applications/route.ts`.
- Preserved Google-first storage/relay design (Google Apps Script + Workspace + Vault path remains authoritative).

## Key Compliance Controls Implemented

### ECTA evidence and intent
- Forced-read + acceptance capture remains in frontend clickwrap flow.
- Typed full-name signature and explicit intent statement enforced in submission logic.
- Terms version + SHA-256 hash relayed with audit metadata.

### POPIA controls
- POPIA minor data consent + operator disclosure acknowledged and logged.
- Honeypot + timing anti-automation controls active in admissions and contact endpoints.

### Institutional contract record hardening
- Server creates canonical contract snapshot payload with:
  - contracting parties,
  - signature intent,
  - terms snapshot/version/hash,
  - audit summary,
  - branding metadata,
  - submitted fields.
- Deterministic contract hash generated (`pdf_sha256` based on canonical content) and included in audit metadata.
- Email package requirements are now explicitly enforced in relay payload (`email_package`) including delivery audit requirement.

## Files Changed (Final pass)

- `app/api/applications/route.ts`
- `components/forms/ApplicationForm.tsx`
- `app/contact/page.tsx`
- `public/api/contact.php`
- `public/api/applications.php`
- `application_form_todo.md`
- `application_form_compliance_change_log.md`

## Verification Performed

- API route POST validation:
  - Endpoint: `/api/applications/`
  - Result: JSON success response with reference (e.g., `ALASR-2026-00013`).
- Confirmed frontend submits to `/api/applications/` (avoids prior HTML 405 path).
- PHP syntax checks for updated PHP endpoints previously passed.

## Open Operational Blockers (Non-code)

- Cloudflare WAF/bot/rate-limit policy rollout must be configured in Cloudflare dashboard.
- Google Apps Script / Workspace side must confirm:
  - actual PDF rendering implementation,
  - contract package email attachment/link handling,
  - delivery message-id logging in audit trail,
  - retention and access policy enforcement in production.

## Rollback Reference

- `components/forms/ApplicationForm.tsx.bak-20260317-1111`
- `public/api/applications.php.bak-20260317-1111`
- Restore procedure documented in `application_form_rollback_notes.md`.
