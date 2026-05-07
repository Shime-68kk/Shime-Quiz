# Import readiness checklist

This checklist is for release/manual smoke around Shime Quiz import flows. It does not add a backend, auth, OCR, or AI quiz generation.

## Local paths

- Shime Quiz: `/home/quang/Documents/quiz_beta/shimechamhoc-v2.0.0-rc1-project`
- EduGen File Processor: `/home/quang/Documents/quiz_beta/shime-edugen-file-processor`

## Run EduGen locally

```bash
cd /home/quang/Documents/quiz_beta/shime-edugen-file-processor
npm ci
PORT=3001 npm start
```

Expected health check:

```bash
curl http://localhost:3001/health
```

## Build and preview Shime with EduGen

```bash
cd /home/quang/Documents/quiz_beta/shimechamhoc-v2.0.0-rc1-project
npm ci
VITE_FILE_PROCESSOR_URL=http://localhost:3001 npm run build
npm run preview
```

Shime reads `VITE_FILE_PROCESSOR_URL` in the browser build. If the frontend is deployed online, the configured EduGen URL must be reachable from the user browser and must allow the frontend origin via CORS.

## Manual smoke checklist

- [ ] Paste structured text/Markdown and confirm draft preview appears.
- [ ] Upload a `.txt` or `.md` file and confirm draft preview appears.
- [ ] Upload a PDF through EduGen and confirm draft preview appears.
- [ ] Upload a DOCX through EduGen and confirm draft preview appears.
- [ ] Upload a PPTX through EduGen and confirm draft preview appears.
- [ ] Upload a ZIP through EduGen and confirm draft preview appears when EduGen extracts usable text.
- [ ] Confirm the quality review panel appears in the import preview.
- [ ] Confirm warnings are advisory and do not auto-fix content.
- [ ] Confirm no auto-save happens after parse/extraction.
- [ ] Confirm save/import only happens after user confirmation.
- [ ] Confirm Study Room can open the saved imported content.

## Hosted deployment caveat

A Vercel/Netlify/static Shime frontend does not include EduGen. Document import from PDF/DOCX/PPTX/ZIP requires a separately running and reachable EduGen service configured through `VITE_FILE_PROCESSOR_URL`.

## Unsupported in the current release

- OCR for scanned/image-only files
- AI quiz generation
- legacy `.doc` / `.ppt` files
- backend accounts/auth/cloud sync
- production security certification
- automatic correction/fixing of generated quiz drafts
