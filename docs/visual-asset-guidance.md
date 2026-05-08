# Shime Quiz visual asset guidance

Use this guidance when preparing future README, public release, or demo screenshots. This phase prepares naming, alt text, and claim boundaries only; it does not add screenshot image assets.

## Recommended image folder path

When screenshots are explicitly captured and approved in a later phase, place them under:

```text
docs/assets/screenshots/
```

Do not reference screenshot files from README or public docs until the actual image files are committed.

## Recommended screenshot filenames and alt text

| Screenshot | Recommended filename | Recommended alt text |
| --- | --- | --- |
| Dashboard overview | `dashboard-overview.png` | Dashboard overview showing local study progress, today journey, and review surfaces. |
| Library import panel | `library-import-panel.png` | Library import panel showing supported local JSON, CSV, text, and document draft import entry points. |
| Text/Markdown import preview | `text-markdown-import-preview.png` | Text and Markdown import preview showing parsed quiz draft content before save confirmation. |
| Quiz draft quality review | `quiz-draft-quality-review.png` | Advisory quiz draft quality review showing warnings before the user confirms save. |
| Study Room | `study-room.png` | Study Room showing a local quiz or study item practice session. |
| Manual AI prompt/export | `manual-ai-prompt-export.png` | Manual AI prompt export workflow where the user copies a prompt by choice. |
| Manual AI output review | `manual-ai-output-review.png` | Manual AI output review surface before using the existing text import flow. |
| EduGen document import surface | `edugen-document-import-surface.png` | Document import surface explaining that PDF, DOCX, PPTX, and ZIP import requires a separate EduGen service. |

## Capture guidance

- Use the public demo sample pack at [`docs/demo-samples/README.md`](demo-samples/README.md) so screenshots use synthetic, education-oriented content instead of private notes or copyrighted material.
- Prefer short Vietnamese-friendly samples when showing import preview, quality review, and Study Room.
- Capture preview and review screens before save when possible, because Shime keeps validation, advisory quality review, preview, and user confirmation in the import flow.
- When showing document import, explicitly mention that EduGen is a separate service and is not bundled into Shime.
- If EduGen is not running or not reachable, use the text/Markdown sample path instead of implying document import is active in that environment.

## Unsupported-claim guardrails

Avoid screenshots, captions, alt text, or surrounding copy that imply unsupported features. In particular:

- Do not imply built-in AI quiz generation.
- Do not imply Shime calls external AI APIs.
- Do not imply API key support or BYOK support.
- Do not imply OCR support.
- Do not imply backend accounts, authentication, cloud sync, or cross-device sync.
- Do not imply hosted production certification or security certification.
- Do not imply EduGen is bundled into Shime.
- Do not imply frontend-only hosting can import PDF/DOCX/PPTX/ZIP without a browser-reachable EduGen service.
- Do not imply AI output is guaranteed correct, private, or high quality.

## README/public docs usage

For now, README and public documentation should link to this guidance and the screenshot checklist rather than embed missing images. Add actual Markdown image references only after screenshot files are captured, reviewed, committed, and verified by a later validator.


## Onboarding screenshots added to the capture plan

For the current release-candidate onboarding polish, also consider these future screenshots after they are explicitly captured and approved:

| Screenshot | Recommended filename | Recommended alt text |
| --- | --- | --- |
| Dashboard first-run onboarding | `dashboard-first-run-onboarding.png` | Dashboard first-run onboarding callout guiding an empty-data user to Library safe start options. |
| Library empty-state onboarding | `library-empty-state-onboarding.png` | Library empty-state onboarding explaining demo sample, JSON/CSV import, text/Markdown import, manual AI copy/paste, and separate EduGen document import. |
| Library demo sample quickstart | `library-demo-sample-quickstart.png` | Library Dùng quiz mẫu quickstart before loading the local sample into preview and review. |
| Demo sample preview and quality review | `demo-sample-preview-quality-review.png` | Demo sample preview with validation and advisory quality review before confirm-save. |

Keep the same visual guardrails: these screenshots should not imply auto-save, built-in AI generation, AI/API calls, OCR, backend/cloud sync, bundled EduGen, or production/security certification.
