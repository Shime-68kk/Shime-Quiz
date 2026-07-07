# Cognitive Companion Copy Map

Date: 2026-06-27 09:21:43 +07

## Scope

`src/components/settings/companionDevPanelCopy.js` is a scoped copy map for the Companion Dev Panel only. It is not a global app i18n system.

## Supported Locales

- `vi`: default current UI copy.
- `en`: developer-facing English copy.

Unknown locales safely fall back to Vietnamese.

## Why Not Global i18n Yet

The companion panel is still dev-only. A global language system would touch routing, settings, persistence, and broader app copy, which is outside this phase.

## Persistence

No language choice is persisted. There is no localStorage, sessionStorage, indexedDB, URL persistence, browser language auto-detection, or global app language setting.

## Future Path

If the companion experience graduates beyond dev mode, the copy map can be migrated into a broader app localization system after a separate design and privacy review.

