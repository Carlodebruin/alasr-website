# Al-Asr Application Form Compliance Change Log

Date: 2026-03-19

## Scope Completed

- Implemented legal hardening and auditability upgrades across admissions submission flow.
- Added Next.js server relay endpoint: `app/api/applications/route.ts`.
- Preserved Google-first storage/relay design (Google Apps Script + Workspace + Vault path remains authoritative).
- Standardized canonical terms wording across all relay paths and frontend.

## Key Compliance Controls Implemented

### ECTA evidence and intent
- Forced-read + acceptance capture enforced in frontend clickwrap flow.
- Typed full-name signature and explicit intent statement enforced in submission logic.
- Terms version + SHA-256 hash relayed with audit metadata.

### POPIA controls
- POPIA minor data consent + operator disclosure acknowledged and logged.
- Honeypot + timing anti-automation controls active in admissions and contact endpoints.

### Institutional contract record hardening
- Server creates exhaustive canonical contract snapshot payload with:
  - contracting parties (School, Parents, Learner),
  - signature intent,
  - terms snapshot/version/hash (exact official wording),
  - audit summary (IP, User Agent, Timestamps),
  - branding metadata,
  - all submitted fields (Learner, Guardians, Medical, Academic, etc.).
- Deterministic contract hash generated (`export pdf_sha256` based on canonical JSON content).
- Hybrid B Annexure Index:
  - Embed images (JPG/PNG < 2MB) directly in PDF pages.
  - Large or non-image files provided as secure download links.
  - Full index included with hashes for evidence integrity.
- Email package behavior: PDF contract + download links to prevent oversized attachments.

## Files Changed

- `app/api/applications/route.ts`
- `components/forms/ApplicationForm.tsx`
- `public/api/applications.php`
- `application_form_todo.md`
- `application_form_compliance_change_log.md`

## Verification Performed

- Local build: `npm run build` executed successfully.
- Code review: Verified both PHP and Next.js relays build and forward exhaustive contract payloads.
- Terms consistency check: Synced canonical terms text across all modules.

## Targeted Retest Checklist (One Full Live Submission)

1. **Full Application Persistence**: Confirm all fields (Learner, Guardians, Contact, Employment, Medical, Emergency, Academic, Fee) appear in the final contract PDF record.
2. **Annexures Index**: Confirm PDF includes a table of all uploaded documents with correct filenames, sizes, and hashes.
3. **Image Embedding**: Confirm JPG/PNG uploads (under 2MB) appear as embedded pages in the PDF.
4. **Large File Links**: Confirm large files (e.g., 4MB PDF) appear as secure download links in the email body/contract rather than oversized attachments.
5. **Legality Audit**: Confirm `termsVersion`, `termsSha256`, `pdf_sha256`, and `signatureIntent` are present in the technical audit summary of the contract.

## Rollback Reference

- `components/forms/ApplicationForm.tsx.bak-20260317-1111`
- `public/api/applications.php.bak-20260317-1111`
- Restore procedure documented in `application_form_rollback_notes.md`.
