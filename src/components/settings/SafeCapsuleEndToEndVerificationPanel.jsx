import { useState } from 'react';
import {
  applySafeCapsuleEndToEndVerificationAction,
  createInitialSafeCapsuleEndToEndVerificationState,
  SAFE_CAPSULE_E2E_ACTIONS
} from './safeCapsuleEndToEndVerificationModel.js';

export default function SafeCapsuleEndToEndVerificationPanel() {
  const [state, setState] = useState(() => createInitialSafeCapsuleEndToEndVerificationState());
  const run = action => setState(current => applySafeCapsuleEndToEndVerificationAction(current, action));

  return (
    <section className="settingsPanel safeCapsuleEndToEndVerificationPanel" aria-label="Xác minh App → Robot Mock — chưa kết nối thật">
      <div className="sectionHeader">
        <p className="eyebrow">Mock verification only</p>
        <h2>Xác minh App → Robot Mock — chưa kết nối thật</h2>
      </div>
      <div className="settingsNotice" role="note">
        <strong>Luồng này chỉ xác minh gói mock đã được robot mock import chấp nhận</strong>
        <p>Không kết nối robot thật. Không Serial/WebSocket/BLE/Wi-Fi. Không gửi tự động. Không xuất câu hỏi/đáp án/lịch sử học. Bridge thật vẫn bị khóa.</p>
      </div>

      <div className="settingsActions" aria-label="End-to-end mock verification controls">
        <button type="button" onClick={() => run(SAFE_CAPSULE_E2E_ACTIONS.CREATE_SAMPLE_HANDOFF)}>Tạo gói bàn giao mẫu</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_E2E_ACTIONS.CREATE_MATCHING_REPORT)} disabled={!state.handoffPack}>Tạo report mock khớp</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_E2E_ACTIONS.CREATE_FAILING_CHECKSUM_REPORT)} disabled={!state.handoffPack}>Tạo report lỗi checksum</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_E2E_ACTIONS.CREATE_PRIVACY_ATTACK_REPORT)} disabled={!state.handoffPack}>Tạo report tấn công quyền riêng tư</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_E2E_ACTIONS.VERIFY)} disabled={!state.robotReport}>Xác minh end-to-end</button>
        <button type="button" onClick={() => run(SAFE_CAPSULE_E2E_ACTIONS.CLEAR)}>Xóa xác minh</button>
      </div>

      <dl className="settingsCompactList" aria-label="End-to-end mock verification status">
        <div><dt>pipeline status</dt><dd>{state.overallStatus}</dd></div>
        <div><dt>export package count</dt><dd>{state.handoffPack?.manifest?.packageCount || 0}</dd></div>
        <div><dt>robot accepted count</dt><dd>{state.robotReport?.acceptedCount ?? 0}</dd></div>
        <div><dt>robot rejected count</dt><dd>{state.robotReport?.rejectedCount ?? 0}</dd></div>
        <div><dt>checksum match</dt><dd>{String(state.checksumMatch)}</dd></div>
        <div><dt>privacy pass</dt><dd>{String(state.privacyPass)}</dd></div>
        <div><dt>R5X19.2 compatibility</dt><dd>{String(state.r5x19CompatibilityPass)}</dd></div>
        <div><dt>motion locked</dt><dd>{String(state.motionLockedPass)}</dd></div>
        <div><dt>bridge locked</dt><dd>{String(state.realBridgeDisabledPass && state.readinessGate.realBridgeAllowed === false)}</dd></div>
        <div><dt>transport disabled</dt><dd>{String(state.transportDisabledPass)}</dd></div>
        <div><dt>readiness level</dt><dd>{state.readinessGate.readinessLevel}</dd></div>
        <div><dt>next step</dt><dd>{state.recommendedNextStepCode}</dd></div>
        <div><dt>no raw data leak pass</dt><dd>{String(state.rawDataLeakPass)}</dd></div>
      </dl>
    </section>
  );
}
