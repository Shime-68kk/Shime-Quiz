# Phase 7D — EduGen PDF-to-draft integration note

Phase 7D adds a minimal Shime Quiz integration with the standalone EduGen File Processor for PDF text extraction only.

## Boundary

EduGen remains a separate Document Ingestion Engine. Shime Quiz does not copy EduGen source code and does not store raw PDF files.

Current Shime flow:

1. User selects a local PDF in Library.
2. Shime sends that PDF to EduGen `POST /api/extract/single` with multipart field `file`.
3. Shime reads `response.extraction.cleanedText`.
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

## Supported in Shime Phase 7D

- PDF file selection in Shime Library
- EduGen extraction via `/api/extract/single`
- `extraction.cleanedText` to Shime draft parser
- existing Shime validation/preview before save

## Not supported in Shime Phase 7D

- DOCX/PPTX/ZIP import UI in Shime
- OCR
- AI quiz generation
- backend accounts/auth/cloud sync
- schema/storage/scoring/SRT/mastery changes
- production hosted/security certification


## Phase 7E follow-up

Phase 7E keeps the PDF flow above and expands the same EduGen boundary to DOCX, PPTX, and ZIP in Shime. Shime still consumes only `extraction.cleanedText`, still shows a draft preview before save, and still does not add OCR or AI quiz generation.
