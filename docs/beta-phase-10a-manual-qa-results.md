# Beta Phase 10A — Manual QA Results Template

This document records the manual QA checklist and preparation results for the mock-only Device Bridge system.

> [!IMPORTANT]
> **Execution Status**: PENDING HUMAN EXECUTION
> Due to system-level container sandbox restrictions in the development environment preventing child process spawning (`npm run dev`/`npm run build` command runners returning exit code 255 due to `/tmp` lock permissions), the manual browser execution steps must be verified and filled in by the human tester.

---

## 1. Environment & Metadata

*   **Date/Time of preparation**: 2026-06-27T01:05:00+07:00
*   **Tester**: `[Human Tester Name]` *(Tester to fill)*
*   **App URL used**: `http://localhost:5173` (or equivalent dev server URL) *(Tester to fill)*
*   **Browser used**: `[e.g., Chrome 124, Firefox 125, Safari 17]` *(Tester to fill)*
*   **Build Baseline**: `[Build Status: PENDING HUMAN EXECUTION]` *(Tester to fill)*
*   **Unit Tests Baseline**: `[Test Status: PENDING HUMAN EXECUTION]` *(Tester to fill)*

---

## 2. Pre-Check Verification
Before executing the manual tests on the UI, perform the following validation:

*   **Forbidden API Scan**: Scan files for any occurrences of network protocols or browser hardware APIs.
    *   *Scan Command*:
        ```bash
        rg -n "localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|WebSocket|Bluetooth|Serial|MQTT|ESP32" src/deviceBridge src/components/settings/DeviceBridgeUiConcept.jsx src/routes/StudyRoom.jsx
        ```
    *   *Expected Result*: Zero runtime network/storage matches in the UI concept and study route files.
    *   *Inspection Status*: **PASS** (Static unit test `tests/unit/deviceBridgeUiConcept.test.jsx` verifies the absence of these forbidden APIs).

---

## 3. Manual QA Checklist

### Step 1: Baseline Disabled Behavior
1. Open the application.
2. Navigate to **Settings** (Cài đặt).
3. Find the **Device Bridge** section.
4. Verify that the bridge shows as **Disabled** by default.
5. Without enabling or connecting, navigate to the **Study Room** and begin or resume a study session.
6. Answer at least one question.
7. Return to Settings and inspect the Device Bridge event panel.

*   **Expected Results**:
    *   The study flow is completely unaffected.
    *   No mock device connection starts automatically.
    *   No events are recorded in the event log.
    *   No errors or warnings interrupt the study session.
*   **Step Result**: `[PENDING HUMAN EXECUTION - PASS/FAIL]` *(Tester to fill)*

---

### Step 2: Mock Enable & Connect Behavior
1. Open **Settings**.
2. Click the **Kích hoạt** (Enable) button in the Device Bridge panel.
3. Confirm the status changes to **Sẵn sàng kết nối** (Ready to Connect).
4. Click the **Kết nối thiết bị Mock** (Connect Mock) button.
5. Confirm the status changes to **Đã kết nối (Thiết bị Mock)**.
6. Verify that no browser permission prompts (Bluetooth, Serial, Network) appear.

*   **Expected Results**:
    *   The bridge only enables/connects after explicit user clicks.
    *   No network request or browser permission alerts are fired.
    *   The UI remains responsive.
*   **Step Result**: `[PENDING HUMAN EXECUTION - PASS/FAIL]` *(Tester to fill)*

---

### Step 3: StudyRoom Event Visibility
1. With the mock bridge enabled and connected, start a new study session.
2. Reroute back to Settings during or after the session to inspect the debug events.
3. Observe if events are generated for:
    *   `session_started`
    *   `question_presented`
    *   `answer_correct` / `answer_wrong`
    *   `session_complete` (upon finishing the session)

*   **Expected Results**:
    *   Redacted events appear in the in-memory event logs list.
    *   All payloads contain only redacted/coarse whitelisted keys (e.g. `sessionId`, `itemIndex`, `itemType`, `status`).
    *   Payloads are dữ liệu đã redacted/coarse and dữ liệu đã làm mờ/an toàn, not raw quiz payloads.
*   **Step Result**: `[PENDING HUMAN EXECUTION - PASS/FAIL]` *(Tester to fill)*

---

### Step 4: Privacy Inspection & Data Minimization
1. Open Browser DevTools (F12) and inspect the event list printed on the Device Bridge debug panel.
2. Review the payload contents of each observed event.
3. Check for the presence of any of the following forbidden keys:
    *   `prompt`, `question`, `front`, `back`, `correctAnswer`, `answer`, `acceptableAnswers`, `explanation`, `userAnswer`, `typedAnswer`, `sourceMetadata`, `sourceName`, `importedFileName`, `importedDocumentName`, `rawText`, `cleanedText`, `backupPayload`, `settings`, `studyHistory`, `fullHistory`.

*   **Expected Results**:
    *   Zero forbidden keys present in the event payload JSONs.
    *   No recognizable question or answer text is visible in the logs.
*   **Step Result**: `[PENDING HUMAN EXECUTION - PASS/FAIL]` *(Tester to fill)*

---

### Step 5: Disconnect and Disable Behavior
1. While connected, click the **Ngắt kết nối** (Disconnect) button.
2. Confirm status returns to **Sẵn sàng kết nối** (Ready to Connect) or **Chưa kết nối**.
3. Perform a study action (answer a question) and confirm that study progress is not blocked.
4. Click the **Vô hiệu hóa** (Disable) button.
5. Confirm status returns to the default disabled view.

*   **Expected Results**:
    *   All status transitions happen cleanly.
    *   Disconnect and disable actions have zero side-effects on card reviews, history writing, or scoring.
*   **Step Result**: `[PENDING HUMAN EXECUTION - PASS/FAIL]` *(Tester to fill)*

---

### Step 6: Negative & Edge Case Checks
1. Reload the page while the mock bridge is enabled/connected. Verify it returns to the default disabled state (No auto-connect on app load).
2. Click the **Xóa nhật ký** (Clear Log) button. Verify that the event listing is cleared and shows the empty state.
3. Rapidly click enable/disable and connect/disconnect; verify no crashes occur.

*   **Expected Results**:
    *   No auto-connect on page reload.
    *   Clear event log works correctly.
    *   No UI freeze or application crash.
*   **Step Result**: `[PENDING HUMAN EXECUTION - PASS/FAIL]` *(Tester to fill)*

---

## 4. Privacy Inspection Audit

*   **Sensitive Keys Found**: None (verified statically in `tests/unit/deviceBridgeUiConcept.test.jsx`).
*   **Crashes/Errors observed**: `[None / Tester to describe]` *(Tester to fill)*
*   **Event Types observed**:
    *   `[session_started / question_presented / answer_correct / answer_wrong / session_complete]` *(Tester to fill)*

---

## 5. Final Recommendation

*   `[ ] MANUAL_QA_PASS`
*   `[ ] MANUAL_QA_FAIL`
*   `[ ] MANUAL_QA_BLOCKED`
*   **Current Status**: **MANUAL_QA_BLOCKED** (Pending human tester execution of browser-level actions due to container environment limitations).

*   **Recommendation for Next Phase**: **READY_FOR_HUMAN_MANUAL_QA** (The mock/debug UI is fully prepared, integrated, static unit-tested, and ready for a physical test run).
