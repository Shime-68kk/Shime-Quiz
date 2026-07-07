# Shime Quiz Terminology Dictionary (Bilingual)

This document establishes the official product names and technical terminology translations for the Shime ecosystem to maintain consistency across the codebase and user documentation.

---

## 1. Product Ecosystem Branding
*   **Public Ecosystem name**: **Shime** (Unified brand name).
*   **Robot Companion**: **Shime Robot** (English) / **Robot Shime** (Vietnamese).
*   **The Learning App**: **Shime Quiz** (Used identically in both languages).

---

## 2. Terminology Mapping Table

| English Concept | Vietnamese Translation | Code Identifier (Do Not Translate) | Description |
| :--- | :--- | :--- | :--- |
| **Shime Robot** | Robot Shime | `shimeRobot` | The hardware interactive robot face of the ecosystem. |
| **Shime Quiz** | Shime Quiz | `shimeQuiz` | The software learning brain application. |
| **Companion Control Center** | Trung tâm điều khiển Trợ lý Đồng Hành | `companionControlCenter` | Settings control area for the companion robot brain. |
| **Device Bridge** | Cầu nối thiết bị | `DeviceBridge` (file/class) | Safe local-only communication proxy bridge. |
| **Cognitive Engine V2** | Não đồng hành V2 | `cognitiveEngineV2` | The next-gen local decision loop for companion behaviors. |
| **dry-run** | chạy thử khô | `dryRunOnly` / `dryRun` | Offline/observe-only processing mode without execution. |
| **not sent** | không gửi | `not_sent` / `notSent` | Indicates action is logged but blocked from transmission. |
| **redacted/coarse data** | dữ liệu đã làm mờ/rút gọn | `redactedCoarseData` | Filtered, low-fidelity study data to protect user privacy. |
| **Learning State Capsule** | capsule trạng thái học tập | `learningStateCapsule` | Local data capsule containing coarse student progress metrics. |
| **Memory Brain** | bộ não trí nhớ | `memoryBrain` | Storage logic mapping long-term FSRS parameters. |
| **Transport Brain** | bộ não kết nối | `transportBrain` | High-level interface managing device packets. |
| **Safety Governor** | bộ điều phối an toàn | `safetyGovernor` | Safe guard rails ensuring no unsafe commands reach the robot. |
| **FSRS memory signal** | tín hiệu trí nhớ FSRS | `fsrsMemorySignal` | Coarse review intervals exported to local components. |

---

## 3. Strict Rules on Non-translated Identifiers
To avoid breaking backend interfaces, event telemetry schemas, and testing fixtures, the following event properties and logic keywords **MUST** remain as English literals in the codebase:
*   `DeviceBridge`
*   `StudyRoom`
*   `CompanionDevPanel`
*   `FSRS`
*   `V2`
*   `dryRunOnly`
*   `sendStatus`
*   `not_sent`
*   `session_started`
*   `question_presented`
*   `answer_correct`
*   `answer_wrong`
*   `session_complete`
