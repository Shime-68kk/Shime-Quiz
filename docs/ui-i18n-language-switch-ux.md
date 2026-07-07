# Language Switch UX Proposal

This document outlines the UX design and placement choices for the language switch feature.

---

## 1. Toggle Labels & Design
*   **Locales supported**: 
    *   `vi` (Tiếng Việt - Default)
    *   `en` (English - Preview only for current beta phase)
*   **Control Type**: Toggle Button / Segmented Control
    *   Buttons should be labeled `"Tiếng Việt"` and `"English"` respectively.
    *   The active button displays in the primary brand style (`primary` theme), and the inactive button uses the `secondary` or `ghost` style.

---

## 2. Placements Options

### Option A: Settings Panel Top Section (Recommended for Dev/Beta)
*   **UX Location**: Positioned at the very top of the Settings Page (`src/routes/Settings.jsx`), right above the Theme settings or FSRS panel.
*   **Aesthetics**: Inside a standard layout `Card` containing the title "Display Language" (Ngôn ngữ hiển thị).
*   **Pros**: Consolidates all configuration tools into a single page; easily visible without cluttering the main navigation.

### Option B: App Shell Header / Top Right Corner (Recommended for Production)
*   **UX Location**: Placed in the top-right corner of the global application sidebar or header, adjacent to the Theme toggle.
*   **Aesthetics**: A compact dropdown or small icon button switcher.
*   **Pros**: Allows users to quickly toggle the language on any screen without entering Settings.

---

## 3. Temporary Preview Notice Requirements
During the current beta/planning phase, the language switcher displays an informative banner:
*   **Vietnamese**: `"💡 Bản xem trước Ngôn ngữ: Lưu ý: Đây chỉ là bản xem trước chế độ ngôn ngữ, lựa chọn chưa được lưu trữ. Codex sẽ tích hợp bộ não đa ngôn ngữ và chạy kiểm thử tự động tại các pha sau."`
*   **English**: `"💡 Language Preview Mode: Note: This is a language preview only, choices are not persisted. Codex will integrate the multi-language engine and run automated tests in subsequent phases."`

This prevents user confusion regarding persistent state while Codex finishes backend architecture work.
