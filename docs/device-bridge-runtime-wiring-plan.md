# Device Bridge Runtime Wiring Plan

Phase 7A is planning-only. It does not implement shared runtime wiring, UI changes, StudyRoom changes, persistence, real transport, network code, or hardware integration.

## Current State

The Device Bridge foundation has two active consumers:

- `src/components/settings/DeviceBridgeUiConcept.jsx`
- `src/routes/StudyRoom.jsx`

Current UI behavior:

- `DeviceBridgeUiConcept.jsx` imports public API from `src/deviceBridge/index.js`.
- It creates a module-scope facade with `const facade = createDeviceBridgeFacade()`.
- It exposes manual UI controls for enable, disable, connect mock, disconnect, and clear debug events.
- It no longer calls `facade.emitStudyEvent()`.
- It does not auto-connect.
- It does not persist settings.

Current StudyRoom behavior:

- `StudyRoom.jsx` imports `createStudyRoomBridgeAdapter` from `src/deviceBridge/studyRoomBridgeAdapter.js`.
- It creates an adapter ref with `createStudyRoomBridgeAdapter()` and no options.
- The adapter creates its own facade internally.
- The adapter/facade remains disabled by default.
- StudyRoom emits coarse event attempts through adapter methods only.
- Because the adapter is disabled by default, StudyRoom behavior remains unchanged unless a future phase wires it to an enabled shared runtime.

## Current Runtime Isolation Finding

The UI and StudyRoom are currently isolated.

Reasons:

- `DeviceBridgeUiConcept.jsx` owns a module-scope facade instance created by `createDeviceBridgeFacade()`.
- `StudyRoom.jsx` owns a separate adapter instance created by `createStudyRoomBridgeAdapter()`.
- `createStudyRoomBridgeAdapter()` creates a new facade internally when no facade is passed.
- Enabling or connecting the UI facade affects only the UI facade instance.
- StudyRoom emits into its own disabled adapter/facade instance, so UI enable/connect does not cause StudyRoom events to appear in the UI debug log.

Result: enabling the UI mock panel cannot affect StudyRoom events right now.

## Problem Statement

Future mock/debug UI needs to observe the same runtime instance that StudyRoom emits into. The system must do this without weakening privacy or local-first constraints:

- No persistence.
- No auto-enable.
- No auto-connect.
- Mock transport only.
- No network or hardware APIs.
- No scheduler/storage/import/backup changes.
- No raw study payloads.

## Options Compared

### Option A: Global Singleton Bridge Runtime Module

Example future shape:

- Add a module such as `src/deviceBridge/deviceBridgeRuntime.js`.
- It creates one runtime-only facade instance at module scope.
- Export `getDeviceBridgeRuntimeFacade()` and possibly `createDeviceBridgeRuntimeAdapter()`.
- UI imports the shared facade from public `src/deviceBridge/index.js`.
- StudyRoom adapter can receive the shared facade or a shared adapter can be created from it.

Benefits:

- Smallest wiring change.
- No React context plumbing.
- Runtime-only, no storage needed.
- Easy for Settings UI and StudyRoom to share one in-memory facade.
- Good unit-test target.

Risks:

- Module-level state can leak between tests if not reset.
- Singleton state can persist across route navigation within the same browser session.
- Needs an explicit test reset helper or factory override for tests.

Testability:

- Good if the runtime module exposes a reset function for tests only or allows dependency injection.
- Tests can assert that UI enable/connect affects StudyRoom adapter emissions.

Risk of state leakage:

- Medium. Manage with `resetDeviceBridgeRuntimeForTests()` or explicit factory creation in tests.

Risk of breaking local-first/privacy:

- Low if the singleton remains mock-only, disabled by default, and uses the existing facade/redaction path.

Requires StudyRoom changes:

- Yes, small change to use the shared adapter/facade instead of constructing an isolated adapter.

Requires UI changes:

- Yes, replace local module-scope `createDeviceBridgeFacade()` with public shared runtime getter.

Requires storage:

- No.

Recommendation:

- Recommended for Phase 7B if kept runtime-only and public-API-based.

### Option B: React Context/Provider

Example future shape:

- Add a `DeviceBridgeProvider` near the app root.
- Provider owns one facade instance.
- Settings UI and StudyRoom consume it through a hook.

Benefits:

- Idiomatic for React state sharing.
- Easier to scope and reset per app root.
- Avoids hidden module singleton state.

Risks:

- Requires React runtime code and provider placement.
- Touches root/app wiring and both consumers.
- More UI/framework coupling than the current deviceBridge core.

Testability:

- Good for component tests.
- More setup required for route tests.

Risk of state leakage:

- Low to medium, depending on provider lifecycle.

Risk of breaking local-first/privacy:

- Low if provider only wraps existing facade.

Requires StudyRoom changes:

- Yes.

Requires UI changes:

- Yes.

Requires storage:

- No.

Recommendation:

- Good later if Device Bridge becomes a broader UI feature, but larger than needed for Phase 7B.

### Option C: Dependency Injection From App/Root Route

Example future shape:

- App/root creates one facade.
- It passes the facade down to Settings and StudyRoom through props or route context.

Benefits:

- Explicit dependencies.
- No module singleton.
- Strong testability.

Risks:

- Requires touching app/root route wiring.
- Prop drilling may be awkward depending on current router structure.
- Larger blast radius than a runtime-only module.

Testability:

- Strong in isolation.
- Requires route-level tests or mocks.

Risk of state leakage:

- Low.

Risk of breaking local-first/privacy:

- Low.

Requires StudyRoom changes:

- Yes.

Requires UI changes:

- Yes.

Requires storage:

- No.

Recommendation:

- Architecturally clean, but likely too broad for the next minimal phase.

### Option D: Event Bus Or Custom Browser Event

Example future shape:

- StudyRoom emits sanitized events to a browser event target.
- UI listens and forwards to the facade or stores debug events.

Benefits:

- Minimal direct imports between UI and StudyRoom.
- Can be runtime-only.

Risks:

- Hidden coupling.
- Harder to reason about ordering and cleanup.
- Browser event payloads can bypass facade boundaries if not carefully enforced.
- Tempting to send raw payloads.

Testability:

- Medium to poor compared with direct facade/adapter wiring.

Risk of state leakage:

- Medium.

Risk of breaking local-first/privacy:

- Medium because event payload boundaries are easier to weaken.

Requires StudyRoom changes:

- Yes.

Requires UI changes:

- Yes.

Requires storage:

- No.

Recommendation:

- Not recommended.

### Option E: Keep UI Debug-Only And Do Not Wire StudyRoom Yet

Benefits:

- Lowest risk.
- No runtime source changes.
- No behavior change.

Risks:

- UI remains misleading: enable/connect controls do not observe StudyRoom emissions.
- Debug event list stays empty during real study flow.
- Does not advance the core mock integration goal.

Testability:

- Already tested enough for static UI safety.

Risk of state leakage:

- Low.

Risk of breaking local-first/privacy:

- Low.

Requires StudyRoom changes:

- No.

Requires UI changes:

- No.

Requires storage:

- No.

Recommendation:

- Acceptable if the next phase is still planning/review, but not recommended for Phase 7B if the goal is shared mock runtime.

## Recommended Architecture

Recommendation for Phase 7B: Option A, a small runtime-only shared facade module, with explicit test reset support.

Proposed constraints:

- Runtime-only.
- No persistence.
- Disabled by default.
- No auto-connect.
- Mock transport only.
- No network.
- No storage.
- No real ESP32 or hardware path.
- UI imports public API only.
- StudyRoom still emits only through adapter methods.
- Adapter/facade still enforce redaction and safe failures.

Proposed future module:

- `src/deviceBridge/deviceBridgeRuntime.js`

Potential public exports through `src/deviceBridge/index.js`:

- `getSharedDeviceBridgeFacade()`
- `createSharedStudyRoomBridgeAdapter()`
- `resetSharedDeviceBridgeRuntimeForTests()` only if tests need it.

The shared runtime should create the facade lazily:

```js
let sharedFacade = null;

export function getSharedDeviceBridgeFacade() {
  if (!sharedFacade) sharedFacade = createDeviceBridgeFacade();
  return sharedFacade;
}
```

StudyRoom should not import `deviceBridgeRuntime.js` directly if the public barrel can expose a safe helper. Future UI should also continue importing only from `src/deviceBridge/index.js`.

## Proposed Files For Phase 7B

Likely files:

- `src/deviceBridge/deviceBridgeRuntime.js`
- `src/deviceBridge/index.js`
- `src/components/settings/DeviceBridgeUiConcept.jsx`
- `src/routes/StudyRoom.jsx`
- `tests/unit/deviceBridgeRuntimeSharedInstance.test.js`
- `tests/unit/deviceBridgeUiConcept.test.jsx` if UI static expectations need updating
- `docs/beta-phase-7b-shared-runtime.md`

Possible StudyRoom change:

- Replace `createStudyRoomBridgeAdapter()` with a public shared adapter helper, or pass the shared facade into `createStudyRoomBridgeAdapter({ facade })`.

Possible UI change:

- Replace module-scope `createDeviceBridgeFacade()` with public `getSharedDeviceBridgeFacade()`.

## Exact Forbidden Areas

Phase 7B must not touch:

- Scheduler/FSRS logic.
- Review schedule logic.
- Study history writes.
- Import/export/backup.
- Learning data.
- EduGen.
- Services/network code.
- Real transports.
- Storage/persistence.
- Package scripts.

Phase 7B must not add:

- `localStorage`, `sessionStorage`, or `indexedDB`.
- `fetch`, `XMLHttpRequest`, `WebSocket`, Bluetooth, Serial, MQTT, ESP32, backend, cloud, auth, sync, or AI API calls.
- Auto-enable or auto-connect.
- Raw payload creation in UI.

## Test Plan

Focused tests:

- Shared runtime defaults disabled.
- UI/shared facade and StudyRoom/shared adapter reference the same runtime.
- Enabling and connecting the shared facade allows adapter-emitted mock events to appear in shared debug events.
- Disabled shared runtime still drops StudyRoom emissions safely.
- No auto-connect on import or render.
- Reset helper isolates tests if added.
- Source scan confirms no network/storage APIs.

Existing checks:

```bash
npx vitest run tests/unit/deviceBridgeEventSchema.test.js tests/unit/deviceBridgeMockTransport.test.js tests/unit/deviceBridgeRuntime.test.js tests/unit/deviceBridgeRedactionPolicy.test.js tests/unit/deviceBridgeStudyEventFactories.test.js tests/unit/deviceBridgeFacade.test.js tests/unit/deviceBridgeUiContract.test.js tests/unit/deviceBridgeStudyRoomAdapter.test.js
npm run build
npm run test:unit
```

## Rollback Plan

If shared runtime causes issues:

- Revert UI to local `createDeviceBridgeFacade()`.
- Revert StudyRoom to local `createStudyRoomBridgeAdapter()`.
- Remove `src/deviceBridge/deviceBridgeRuntime.js`.
- Remove shared-runtime tests.
- Keep existing facade, adapter, schema, redaction, and mock transport modules unchanged.
