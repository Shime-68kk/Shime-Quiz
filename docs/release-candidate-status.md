# Release Candidate Status — Shime Quiz v2.0.0-beta.1

This document consolidates the current release-candidate status for Shime Quiz after Phase 8F.

## Current completed phase

- Current completed implementation phase: **through Phase 8F**.
- Phase 8F fixed the Dashboard/Overview **Kế hoạch hôm nay** completion behavior at the source and validator level.
- Phase 8F.1 status: **PARTIAL / manual Ubuntu browser smoke still pending**. Do not claim a successful Phase 8F.1 Ubuntu browser smoke unless a separate real Ubuntu browser manual test is provided.

## Supported import paths

Shime currently supports these import paths:

- JSON import.
- CSV import.
- Paste text/Markdown draft import.
- Local `.txt` / `.md` draft import.
- PDF/DOCX/PPTX/ZIP draft import via separate EduGen service when configured and running.
- Manual AI prompt/export paste-back workflow, where the user manually copies prompts to an external AI tool and manually pastes output back into Shime.

All user-friendly draft sources must still go through existing parsing/import validation, advisory quality review, preview, and user-confirmed save. Shime must not auto-save imported or generated draft content.

## EduGen boundary and deployment caveat

EduGen is a separate Document Ingestion Engine and is **not bundled into Shime**. Shime only calls EduGen as an optional extraction service and consumes `extraction.cleanedText`.

For document import, a browser-reachable EduGen service is required. Configure Shime with `VITE_FILE_PROCESSOR_URL`, for example:

```bash
VITE_FILE_PROCESSOR_URL=http://localhost:3001
```

A Vercel/Netlify/frontend-only deployment does not include EduGen by itself. PDF/DOCX/PPTX/ZIP document import will not work from a hosted frontend unless the browser can reach a configured EduGen URL with appropriate CORS settings.

## AI boundaries and forbidden claims

Shime currently has AI planning, manual prompt/export, manual AI output import hardening, provider-readiness documentation, and AI draft evaluation fixtures. Shime does **not** have built-in AI quiz generation.

Do not claim:

- built-in AI quiz generation
- external AI/API calls from Shime
- API key or BYOK support
- backend/auth/cloud sync
- OCR
- automatic high-quality quiz generation
- AI output is guaranteed correct or private
- hosted production/security certification

Any future AI provider flow must preserve this boundary:

source text → explicit user confirmation → AI provider call → parse/normalize flat v2 draft → import validation → manual AI output review → quiz draft quality review → preview → user confirms save

## Validator coverage summary

The release validator chain includes:

- `validate-smoke-fixture`
- `validate-v2-release-hardening`
- `validate-exam-readiness`
- `validate-recommendation-feedback`
- `validate-weighted-selection`
- `validate-storage-sync`
- `validate-import-validation`
- `validate-dashboard-performance`
- `validate-dashboard-plan-completion-guard`
- `validate-backup-restore-recovery`
- `validate-text-quiz-parser`
- `validate-text-file-import`
- `validate-edugen-pdf-integration`
- `validate-edugen-document-integration`
- `validate-quiz-draft-quality`
- `validate-import-ux-release-readiness`
- `validate-ai-planning-docs`
- `validate-ai-prompt-export`
- `validate-ai-output-import-hardening`
- `validate-ai-integration-readiness`
- `validate-ai-draft-evaluation-fixtures`
- `validate-release-candidate-status`
- Playwright E2E smoke in GitHub Actions

## Final manual smoke checklist

Before labeling a final release candidate beyond AI-verified status, complete manual smoke on a real browser/device environment:

- Dashboard loads and the **Kế hoạch hôm nay** completed item remains complete when clicked again.
- JSON import preview/save still works.
- CSV import preview/save still works.
- Paste text/Markdown draft import still works.
- Local `.txt` / `.md` file upload draft import still works.
- EduGen PDF import works with a configured service.
- EduGen DOCX import works with a configured service.
- EduGen PPTX import works with a configured service.
- EduGen ZIP import works with a configured service.
- Advisory quiz draft quality review appears before save.
- Manual AI prompt/export appears and copies a prompt without calling an AI provider.
- Manual AI output review reports format issues without auto-importing or auto-saving.
- Backup/export controls render and safe recovery docs remain accurate.
- Hosted deployment caveat is visible in docs before using a Vercel/Netlify frontend for document import.

## Known gaps / not supported

- Phase 8F.1 real Ubuntu browser smoke is still pending unless separately confirmed.
- No built-in AI quiz generation.
- No external AI/API calls from Shime.
- No API key/BYOK support.
- No backend/auth/cloud sync.
- No OCR.
- No legacy `.doc` / `.ppt` support.
- EduGen is not bundled into Shime.
- No hosted production/security certification.
- No guarantee of data recovery, AI correctness, or automatic quiz quality.

## Recommended next steps

1. Run a real Ubuntu browser manual smoke for Phase 8F.1.
2. Rerun GitHub Actions after any release-candidate documentation or validator changes.
3. Perform final import smoke across JSON, CSV, text/Markdown, `.txt`/`.md`, and EduGen document paths.
4. Keep release wording constrained to the validated claims above.
