/**
 * Phase 26D — Backup Health Developer/Test Harness (Hidden Default-Off)
 *
 * PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_STATUS: IMPLEMENTED_HIDDEN_DEFAULT_OFF_PROTOTYPE_PENDING_TESTER
 * PHASE26D_UI_WIRING_SCOPE: HIDDEN_DEFAULT_OFF_DEV_TEST_HARNESS_NO_PRODUCTION_NAV_NO_WRITES
 * PHASE26D_MANUAL_BROWSER_TESTER_STATUS: REQUIRED_BEFORE_BROWSER_BEHAVIOR_CLAIM
 * PHASE26D_UI_WIRING_DECISION: HOLD_FOR_STRICT_REVIEW_AND_TESTER_BEFORE_MERGE
 * PHASE26D_TESTER_RUN_PACK_STATUS: PREPARED_FOR_EXTERNAL_TESTER
 *
 * Hidden default-off developer/test harness component.
 * Disabled by default when props/options are missing.
 * Enabled only when enabled === true and mode is 'test' or 'default-off'.
 * Production/live modes return null/hidden sentinel.
 * Read-only display only. No writes. No network. No navigation links.
 * Import gate: imports Phase 25M view-model only from allowed path.
 */

import {
  createBackupHealthUiModel,
  BACKUP_HEALTH_STATE,
} from '../../state/backupHealthUiPrototype.js';

const PHASE26D_HARNESS_DISABLED_SENTINEL = 'PHASE26D_HARNESS_DISABLED';

/**
 * Determines whether the Phase 26D harness is enabled for rendering.
 *
 * Enabled only with explicit test/default-off opt-in.
 * Production/live modes are rejected and return false.
 *
 * @param {object|undefined|null} props
 * @param {boolean} [props.enabled]
 * @param {string} [props.mode] - must be 'test' or 'default-off'
 * @returns {boolean}
 */
export function isHarnessEnabled(props) {
  if (props === null || props === undefined) return false;
  if (typeof props !== 'object') return false;
  if (props.enabled !== true) return false;
  const mode = props.mode;
  return mode === 'test' || mode === 'default-off';
}

/**
 * BackupHealthDevHarness — hidden default-off developer/test harness.
 *
 * Returns null when disabled (no props, empty props, enabled false,
 * production/live modes). Renders calm Vietnamese-first copy from the
 * Phase 25M view-model only when explicitly enabled with test/default-off mode.
 *
 * @param {object} [props]
 * @param {boolean} [props.enabled]
 * @param {string} [props.mode] - 'test' or 'default-off' to enable
 * @param {object} [props.signalInput] - raw signal input forwarded to Phase 25M view-model
 * @param {number} [props.currentTimeMs] - injected timestamp for testing
 * @param {number} [props.staleThresholdMs] - stale threshold override for testing
 */
export default function BackupHealthDevHarness(props) {
  if (!isHarnessEnabled(props)) {
    return null;
  }

  const viewModelOptions = {
    enabled: props.enabled,
    mode: props.mode,
  };
  if (typeof props.currentTimeMs === 'number') {
    viewModelOptions.currentTimeMs = props.currentTimeMs;
  }
  if (typeof props.staleThresholdMs === 'number') {
    viewModelOptions.staleThresholdMs = props.staleThresholdMs;
  }

  const model = createBackupHealthUiModel(props.signalInput, viewModelOptions);

  if (!model.visible) {
    return null;
  }

  return (
    <div
      data-testid="backup-health-dev-harness"
      data-phase="phase26d"
      data-harness="backup-health"
      data-mode={props.mode}
      data-disabled-sentinel={PHASE26D_HARNESS_DISABLED_SENTINEL}
      style={{ fontFamily: 'monospace', fontSize: '13px', padding: '12px', border: '1px dashed #999' }}
    >
      <div data-testid="harness-header" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        [DEV/TEST ONLY — Bản sao lưu sức khỏe — Chỉ dùng cho kiểm tra]
      </div>
      <div data-testid="harness-state-id">Trạng thái: {model.stateId}</div>
      {model.titleVi && (
        <div data-testid="harness-title">{model.titleVi}</div>
      )}
      {model.bodyVi && (
        <div data-testid="harness-body">{model.bodyVi}</div>
      )}
      {model.tone && (
        <div data-testid="harness-tone" style={{ color: '#666', fontSize: '11px' }}>
          tone: {model.tone}
        </div>
      )}
      <div data-testid="harness-source" style={{ color: '#999', fontSize: '11px' }}>
        source: {model.source} | mode: {props.mode}
      </div>
      <div data-testid="harness-warning" style={{ color: '#c00', fontSize: '11px', marginTop: '8px' }}>
        Chỉ dành cho nhà phát triển và kiểm thử viên. Không dùng trong sản xuất.
      </div>
    </div>
  );
}

export { BACKUP_HEALTH_STATE, PHASE26D_HARNESS_DISABLED_SENTINEL };
