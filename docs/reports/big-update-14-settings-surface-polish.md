# BIG-UPDATE-14 Settings Surface Polish

## Confirmed Defect

The FSRS warning strip was rounded in BIG-UPDATE-13, but `.settingsSection--experimental .settingsPanel` still painted an opaque rectangular surface behind the rounded Card. That intermediate background caused the nested experimental area to retain sharp visible corners.

## Fix

- The structural `.settingsPanel` grid is now transparent.
- The actual inner Card remains the semantic surface and uses `--radius-panel` (`28px` computed).
- The preparation strip retains `--radius-control` (`16px` computed), semantic warning background, and coordinated left accent.
- The outer experimental section, copy, layout, toggle, and modal remain unchanged.
- Overflow remains visible; focus is not clipped.

## Safety

`FsrsExperimentalSettingsPanel.jsx` behavior was not modified. `handleToggle`, `handleConfirm`, `handleCancel`, both `updateSettings` writes, labels, switch semantics, and beta/default boundaries are unchanged. No scheduler or storage file changed.

## Browser Evidence

The experimental wrapper computes to transparent, the Card to `28px`, the warning strip to `16px`, and the page has no horizontal overflow. Five-theme verification is included in the final report.
