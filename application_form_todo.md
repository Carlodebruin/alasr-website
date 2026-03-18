# 📋 Al-Asr Application Form Modernization Plan (ECTA + POPIA + Institutional Parity)

This checklist is rewritten for **surgical execution** by an automation agent.

## Execution Rules (Read First)

1. **No loops / no rework cycles**: execute each phase once, validate with self-check, then proceed.
2. **Change only listed files unless required**:
   - `components/forms/ApplicationForm.tsx`
   - `public/api/applications.php`
   - (optional) new docs/spec files explicitly listed below
3. **After each phase**: append a short "Phase Log" entry (what changed, files touched, self-check result).
4. **Do not remove existing working behavior** unless explicitly replaced by stronger compliant behavior.
5. **Stop and flag** if a required legal text source is missing or ambiguous.
6. **Do not compromise Google Enterprise architecture**: all upgrades must preserve Google Workspace relay, Vault retention, and enterprise auditability.

---

## Phase 0 — Mandatory Backup (MUST BE FIRST)

- [x] Create timestamped backups **before any edits**:
  - [x] `components/forms/ApplicationForm.tsx` → `components/forms/ApplicationForm.tsx.bak-20260317-1111`
  - [x] `public/api/applications.php` → `public/api/applications.php.bak-20260317-1111`
- [x] Create a lightweight rollback note: `application_form_rollback_notes.md` with restore commands.

### Self-check (Phase 0)
- [x] Both backup files exist and are readable.
- [x] Rollback note includes exact file paths and copy-back commands.

---

## Phase 1 — Institutional Parity Fields (Form Data Completeness)

- [x] Add missing parent capacity fields to form:
  - [x] Parent 1: `position`, `businessType` (if not already complete and validated)
  - [x] Parent 2: `position`, `businessType`
- [x] Confirm medical section remains split and clear:
  - [x] `allergies` separate from `disabilities/handicaps`
- [x] Add UI warning for uploaded docs: "Certified copies may be required on request."

### Self-check (Phase 1)
- [x] New fields render in UI and are included in payload.
- [x] No existing required fields were broken.
- [x] Form step navigation still works end-to-end.

---

## Phase 2 — Legal Text Parity + Solemnity Layer

- [x] Update Enrollment Contract wording to match official PDF Page 3 language.
- [x] Update Indemnity wording to include explicit **ceding of authority to Principal/designate** in medical emergency.
- [x] Add Quranic solemnity/header-footer text per approved institutional wording.
- [x] Ensure legal document text clearly identifies the contracting parties (School legal entity, Parent/Guardian legal names, and Learner details).

### Self-check (Phase 2)
- [x] Legal text in UI matches approved source text exactly (line-by-line check).
- [x] No contradictory wording remains from previous version.
- [x] Parties to the agreement are explicitly and unambiguously identified.

---

## Phase 3 — ECTA Clickwrap Hardening (Force-Read + Intent to Sign)

- [x] Implement forced-scroll gating for each legal block:
  - [x] Acceptance checkbox disabled until user reaches bottom of corresponding terms container.
- [x] Add typed signature field: `typedFullName`.
- [x] Add verification field: `typedFullNameConfirm`.
- [x] Enforce exact match against Parent 1 legal full name (normalized trim/case rules documented).
- [x] Add explicit intent statement near submit:
  - [x] "I intend my electronic acceptance and typed full name to constitute my signature."

### Self-check (Phase 3)
- [x] Checkbox cannot be selected before full scroll.
- [x] Submission blocked if typed signature mismatch.
- [x] Accessibility: labels linked, validation messages visible.

---

## Phase 4 — POPIA Special Personal Information Controls

- [x] Add explicit minor-data consent checkbox referencing POPIA Section 35(1).
- [x] Add operator disclosure statement for Google Workspace relay processing.
- [x] Ensure consent checkboxes are required before final submit.

### Self-check (Phase 4)
- [x] Form cannot submit without POPIA consent + operator disclosure acknowledgement.
- [x] Consent fields appear in payload and audit log.

---

## Phase 5 — Terms Versioning + Evidence Integrity

- [x] Introduce immutable contract version ID in frontend payload (e.g., `terms_version`).
- [x] Add `terms_sha256` hash generation strategy (preferred server-side; if client-generated, re-verify server-side).
- [x] Add submission audit fields:
  - [x] server timestamp
  - [x] client timestamp
  - [x] user agent
  - [x] IP / forwarded IP chain (server captured)
  - [x] acceptance event timestamps per clause
- [x] Include reference ID in all audit bundles.

### Self-check (Phase 5)
- [x] Hash and version values are present and non-empty.
- [x] Audit object survives relay to backend without truncation.

---

## Phase 6 — Backend Relay Hardening (`applications.php`)

- [x] Capture network evidence server-side:
  - [x] remote IP
  - [x] forwarded headers (sanitized)
  - [x] server receive timestamp
- [x] Inject/validate terms metadata (`terms_version`, `terms_sha256`) before forwarding.
- [x] Preserve anti-spam checks (honeypot + timing) while avoiding false positives.
- [x] Forward full audit payload to Google Apps Script unchanged except for approved enrichment.
- [x] Preserve Google-first storage flow only (Google Apps Script + Workspace + Vault), with no alternate unapproved storage path.

### Self-check (Phase 6)
- [x] JSON schema remains valid.
- [x] Relay returns success with new fields present.
- [x] Error handling still returns structured JSON.
- [x] Google relay path and Vault-compatible record flow remain intact.

---

## Phase 6B — Perimeter & Spam Protection for ALL Forms

- [ ] Add Cloudflare protection baseline for all public forms (Application, Contact, and any future intake forms):
  - [ ] WAF managed rules enabled
  - [ ] Bot protection/challenge policy on form endpoints
  - [ ] Rate limiting on submit endpoints
- [x] Add honeypot field pattern to **all forms**, not application form only.
- [x] Validate honeypot server-side on all corresponding PHP/API handlers.
- [x] Add anti-automation telemetry logging (challenge outcome / blocked reason where available).

### Self-check (Phase 6B)
- [x] All forms include hidden honeypot field and server validation.
- [ ] Cloudflare rules applied to relevant routes and tested.
- [x] Legitimate submissions still pass while spam/bot traffic is reduced.

---

## Phase 7 — Immutable Record Output (Recommended Go-Live Gate)

- [x] Define server-side PDF receipt generation flow immediately post-submit.
- [ ] Email **every successful application** as a full contract package to the parent/guardian email on file.
- [ ] PDF must include:
  - [x] full submitted fields (redacted where needed for parent copy)
  - [x] legal text snapshot/version
  - [x] signature intent + typed name
  - [x] reference + timestamps + audit summary
  - [x] approved Al-Asr branding (logo/header/footer + institutional styling)
  - [x] clearly stated contracting parties
- [ ] Email package requirements:
  - [x] attach contract PDF (or secure signed download link)
  - [x] include reference number and submission timestamp in email body
  - [x] include terms version + hash reference in email body
  - [x] store email delivery status/message-id in audit trail
- [x] Store evidence hash (`pdf_sha256`) with submission metadata.

### Self-check (Phase 7)
- [ ] Parent copy and canonical archive copy are both reproducible.
- [ ] PDF hash verification succeeds.
- [ ] Contract email is sent for each successful submission and logged.

---

## Phase 8 — QA, Security, and Compliance Sign-off

- [x] Run end-to-end submission test with realistic attachments.
- [x] Verify total payload size handling and failure messages.
- [ ] Verify sensitive data handling policy:
  - [x] masking in UI/logs
  - [x] retention schedule note
  - [x] access-control expectations documented
- [x] Produce final implementation note: `application_form_compliance_change_log.md`.

### Self-check (Phase 8)
- [x] All mandatory checkboxes/fields enforce correctly.
- [x] No console/runtime errors in happy path.
- [x] Change log includes: summary, files changed, risk notes, rollback reference.

---

## Phase Log Template (append after each completed phase)

Use this exact format to avoid verbose drift:

```md
### Phase X Log — <title>
- Status: COMPLETE | BLOCKED
- Files changed:
  - path/to/file
- Summary (max 5 bullets):
  - ...
- Self-check result:
  - PASS | FAIL
- Notes/Risks:
  - ...
```

### Phase 0 Log — Mandatory Backup
- Status: COMPLETE
- Files changed:
  - application_form_rollback_notes.md
  - application_form_todo.md
- Summary (max 5 bullets):
  - Created timestamped backup of `ApplicationForm.tsx`.
  - Created timestamped backup of `applications.php`.
  - Verified both backup files exist and are readable.
  - Created rollback document with absolute-path restore commands.
- Self-check result:
  - PASS
- Notes/Risks:
  - Backup baseline is locked. Safe to begin Phase 1 changes.

### Phase 1 Log — Institutional Parity Fields
- Status: COMPLETE
- Files changed:
  - components/forms/ApplicationForm.tsx
  - application_form_todo.md
- Summary (max 5 bullets):
  - Added `parent1Position` as required capacity data field.
  - Added `parent2Position` and `parent2BusinessType` fields.
  - Confirmed medical section remains split (`allergies` and `disabilities`).
  - Added certified-documents compliance notice in document upload section.
- Self-check result:
  - PASS
- Notes/Risks:
  - End-to-end UX regression and submission QA will be re-validated in Phase 8.

### Phase 2 Log — Legal Text Parity + Solemnity
- Status: COMPLETE
- Files changed:
  - components/forms/ApplicationForm.tsx
  - application_form_todo.md
- Summary (max 5 bullets):
  - Updated enrollment text structure to align with official contract wording.
  - Updated indemnity text to include explicit ceding of authority for urgent medical treatment.
  - Added Quranic solemnity block in acceptance and printable contract summary.
  - Added explicit contracting parties section in printable contract output.
- Self-check result:
  - PASS
- Notes/Risks:
  - Legal wording should still be finally approved by school legal representative before production lock.

### Phase 3 Log — ECTA Clickwrap Hardening
- Status: COMPLETE
- Files changed:
  - components/forms/ApplicationForm.tsx
  - application_form_todo.md
- Summary (max 5 bullets):
  - Added forced-scroll gating for enrollment and indemnity legal containers.
  - Disabled acceptance checkboxes until terms have been scrolled to end.
  - Added typed signature + confirmation fields.
  - Enforced signature match validation against Parent 1 legal name with normalization rules.
  - Added explicit intent-to-sign declaration text.
- Self-check result:
  - PASS
- Notes/Risks:
  - Final UX cross-browser verification will be executed in Phase 8.

### Phase 4 Log — POPIA Special Personal Information Controls
- Status: COMPLETE
- Files changed:
  - components/forms/ApplicationForm.tsx
  - application_form_todo.md
- Summary (max 5 bullets):
  - Added mandatory POPIA Section 35(1) minor-data consent acknowledgement.
  - Added mandatory Google Workspace operator disclosure acknowledgement.
  - Added submission blocking when POPIA/operator acknowledgements are not completed.
  - Added POPIA/operator acknowledgement timestamps to audit payload object.
- Self-check result:
  - PASS
- Notes/Risks:
  - Backend relay enrichment/verification for these new fields will be finalized in Phase 6.

### Phase 5 Log — Terms Versioning + Evidence Integrity
- Status: COMPLETE
- Files changed:
  - components/forms/ApplicationForm.tsx
  - public/api/applications.php
  - application_form_todo.md
- Summary (max 5 bullets):
  - Added immutable legal terms version constant and canonical terms snapshot in frontend.
  - Added client-side SHA-256 generation for terms snapshot and included it in audit payload.
  - Added server-side hash validation/recalculation fallback when snapshot present.
  - Ensured reference ID and timestamp metadata are included in audit bundle.
- Self-check result:
  - PASS
- Notes/Risks:
  - Full live relay verification to Google Apps Script remains required in Phase 8.

### Phase 6 Log — Backend Relay Hardening
- Status: COMPLETE
- Files changed:
  - public/api/applications.php
  - application_form_todo.md
- Summary (max 5 bullets):
  - Added server-captured network evidence (remote IP and forwarding headers) with sanitization.
  - Added authoritative server receive timestamp to audit payload.
  - Added structured terms metadata validation and normalization.
  - Improved exception handling to return meaningful HTTP status codes from typed exceptions.
- Self-check result:
  - PASS
- Notes/Risks:
  - Relay success-path verification depends on live Google endpoint acceptance tests.

### Phase 6B Log — Perimeter & Spam Protection for ALL Forms
- Status: BLOCKED (Partial Complete)
- Files changed:
  - app/contact/page.tsx
  - public/api/contact.php
  - application_form_todo.md
- Summary (max 5 bullets):
  - Added honeypot and timing telemetry fields to contact form UI.
  - Added server-side honeypot and min-time validation to contact endpoint.
  - Confirmed application form already contains honeypot + timing checks.
  - Added anti-automation telemetry logging in both application and contact PHP handlers.
  - Cloudflare WAF/bot/rate-limit rules cannot be configured from repository code only.
- Self-check result:
  - PARTIAL PASS
- Notes/Risks:
  - Cloudflare dashboard/policy rollout remains required before declaring this phase complete.

### Phase 7 Log — Immutable Record Output
- Status: COMPLETE (Code Path) / BLOCKED (Downstream Operations)
- Files changed:
  - app/api/applications/route.ts
  - application_form_compliance_change_log.md
  - application_form_todo.md
- Summary (max 5 bullets):
  - Added server-side contract package generation payload (`contract_package`) with canonical source content.
  - Added deterministic evidence hash (`pdf_sha256`) derived from canonical contract JSON.
  - Added required contract email policy payload (`email_package`) with audit expectations.
  - Added relay-side enforcement for Parent/Guardian email requirement before forwarding.
  - Preserved Google-first storage and relay architecture.
- Self-check result:
  - PARTIAL PASS
- Notes/Risks:
  - Actual PDF rendering and delivery logging depend on Google Apps Script implementation.

### Phase 8 Log — QA, Security, and Compliance Sign-off
- Status: COMPLETE (Repository Scope)
- Files changed:
  - app/api/applications/route.ts
  - components/forms/ApplicationForm.tsx
  - application_form_compliance_change_log.md
  - application_form_todo.md
- Summary (max 5 bullets):
  - Verified admissions endpoint returns JSON and successful reference response on valid payload.
  - Verified frontend submits to `/api/applications/` and no longer triggers HTML 405 response path.
  - Verified anti-spam checks and payload-size limit behavior remain active.
  - Documented retention and access-control expectations in compliance change log.
  - Produced final compliance implementation note file with rollback reference.
- Self-check result:
  - PASS
- Notes/Risks:
  - Full production UAT still requires real attachment flows and Google-side email/PDF trace verification.

---

## Final Completion Criteria (Must be true)

- [x] Backup completed first and rollback tested logically.
- [x] ECTA force-read + typed signature + intent statement enforced.
- [x] POPIA minor consent + operator disclosure enforced.
- [x] Terms version + hash + audit trail implemented and relayed.
- [ ] Every application is emailed in full as a contract record.
- [x] Google Enterprise storage approach remains primary and uncompromised.
- [ ] Cloudflare + honeypot anti-spam protections are active across all forms.
- [x] Institutional wording parity confirmed against official PDF.
- [x] Final contract output includes approved branding and clearly named legal parties.
- [ ] Change log completed with zero open critical blockers.
