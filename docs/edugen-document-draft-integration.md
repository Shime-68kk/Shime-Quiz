# Phase 7E — EduGen document-to-draft integration note

Phase 7E expands the existing EduGen draft import path in Shime Quiz from PDF-only to document files supported by EduGen.

## Boundary

EduGen remains a separate Document Ingestion Engine. Shime Quiz does not copy EduGen source code, does not inspect document internals directly, and does not store raw uploaded files.

Current Shime flow:

1. User selects a local PDF, DOCX, PPTX, or ZIP in Library.
2. Shime sends that file to EduGen `POST /api/extract/single` with multipart field `file`.
3. Shime reads only `response.extraction.cleanedText`.
4. Shime sends the cleaned text through `parseTextQuizDraft`.
5. The generated draft goes through existing import validation/preview.
6. The user explicitly confirms save.

There is no auto-save after extraction.

## Local setup

Start EduGen separately:

```bash
npm ci
npm start
```

Start Shime separately:

```bash
npm ci
npm run dev
```

Optional Shime env:

```bash
VITE_FILE_PROCESSOR_URL=http://localhost:3333
```

EduGen CORS should allow Shime local preview/dev origins such as:

- `http://localhost:4173`
- `http://127.0.0.1:4173`

## Supported in Shime Phase 7E

- PDF document upload through EduGen
- DOCX document upload through EduGen
- PPTX document upload through EduGen
- ZIP document upload through EduGen
- `extraction.cleanedText` to Shime draft parser
- existing Shime validation/preview before save

## Not supported in Shime Phase 7E

- Legacy `.doc` or `.ppt` files
- OCR for scanned/image-only documents
- AI quiz generation
- backend accounts/auth/cloud sync
- schema/storage/scoring/SRT/mastery changes
- production hosted/security certification

ZIP extraction quality depends on EduGen and the supported files inside the archive. Shime treats ZIP like any other EduGen-supported document source and only consumes the cleaned text returned by EduGen.

## Phase 10H boundary polish reference

See [`docs/edugen-boundary-polish.md`](edugen-boundary-polish.md) for the current public-release wording rules. PDF/DOCX/PPTX/ZIP import continues to require a separate configured browser-reachable EduGen/File Processor service through `VITE_FILE_PROCESSOR_URL`; Shime does not bundle EduGen and does not include OCR.
