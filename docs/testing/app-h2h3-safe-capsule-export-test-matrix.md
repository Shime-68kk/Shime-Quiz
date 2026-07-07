# APP-H2/H3 — Safe Capsule Export Test Matrix

## Status token
APP_H2H3_SAFE_CAPSULE_EXPORT_TEST_MATRIX_STATUS: APP_H2H3_TEST_MATRIX_DEFINED

## Adapter tests
| Coverage | Test file |
| --- | --- |
| derived steady session exports valid safe capsule | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| struggling session maps to gentle companion action | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| high review pressure maps to review urgency high | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| low energy long session maps to rest or light review | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| checksum matches APP-H1 and robot rule | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| output contains only allowed capsule fields | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| monotonicImportId is safe | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| capsuleId does not equal raw session bucket | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects raw question | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects raw answer | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects correctAnswer | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects explanation | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects userAnswer | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects sourceMetadata | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects settings | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects studyHistory | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects importedDocumentText | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects documentText | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects raw FSRS logs | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects cardId and deckId | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects RF identifiers and MAC-like values | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects secrets, tokens, and passwords | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| rejects unknown unsafe fields | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |
| diagnostics do not echo raw values | `tests/unit/studyRoomSafeCapsuleAdapter.test.js` |

## Mock export tests
| Coverage | Test file |
| --- | --- |
| valid capsule serializes to safe mock envelope | `tests/unit/safeCapsuleMockExport.test.js` |
| invalid capsule rejected | `tests/unit/safeCapsuleMockExport.test.js` |
| raw fields never appear in envelope | `tests/unit/safeCapsuleMockExport.test.js` |
| `realBridgeEnabled=false` | `tests/unit/safeCapsuleMockExport.test.js` |
| `transportEnabled=false` | `tests/unit/safeCapsuleMockExport.test.js` |
| no network or transport APIs are called | `tests/unit/safeCapsuleMockExport.test.js` |

## Preview tests
| Coverage | Test file |
| --- | --- |
| preview includes only safe fields | `tests/unit/safeCapsulePreviewModel.test.js` |
| preview never shows raw question, answer, history, or source text | `tests/unit/safeCapsulePreviewModel.test.js` |
| checksum status is displayed | `tests/unit/safeCapsulePreviewModel.test.js` |
| bridgeStatus is `mock_only_not_connected` | `tests/unit/safeCapsulePreviewModel.test.js` |

## Regression checks
| Coverage | Command |
| --- | --- |
| APP-H1 tests still pass | `npx vitest run tests/unit/safeLearningCapsule.test.js` |
| APP-H2/H3 validator passes | `node scripts/validate-app-h2h3-safe-capsule-export-adapter.js` |
| no runtime StudyRoom integration changed | validator source/worktree guard |
| no firmware files changed | validator source/worktree guard |
| build still succeeds | `npm run build` |
