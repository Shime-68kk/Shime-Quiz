import { useMemo, useState } from 'react';
import {
  applySafeCapsuleControlCenterAction,
  createInitialSafeCapsuleControlCenterState,
  SAFE_CAPSULE_CONTROL_CENTER_ACTIONS
} from './safeCapsuleControlCenterModel.js';

const PRIVACY_AUDIT_LABELS = [
  ['rawQuizFieldsDetected', 'Không phát hiện câu hỏi/prompt thô'],
  ['rawAnswerFieldsDetected', 'Không phát hiện đáp án hoặc câu trả lời người dùng'],
  ['rawHistoryDetected', 'Không phát hiện lịch sử học thô'],
  ['rawDocumentTextDetected', 'Không phát hiện nội dung tài liệu thô'],
  ['rawSourceMetadataDetected', 'Không phát hiện source metadata thô'],
  ['rawCardDeckIdsDetected', 'Không phát hiện card/deck ID thô'],
  ['rawRfIdentifiersDetected', 'Không phát hiện SSID/BSSID/MAC/AP thô'],
  ['secretsDetected', 'Không phát hiện token/secret/password'],
  ['unknownUnsafeFieldsDetected', 'Không phát hiện trường không an toàn']
];

function BucketList({ capsule }) {
  if (!capsule) return <p className="muted">Chưa có capsule preview. Hãy tạo một capsule mẫu để kiểm tra.</p>;

  return (
    <dl className="settingsCompactList" aria-label="Safe capsule buckets">
      <div><dt>learningStateBucket</dt><dd>{capsule.learningStateBucket}</dd></div>
      <div><dt>studyLoadBucket</dt><dd>{capsule.studyLoadBucket}</dd></div>
      <div><dt>reviewUrgencyBucket</dt><dd>{capsule.reviewUrgencyBucket}</dd></div>
      <div><dt>sessionMoodBucket</dt><dd>{capsule.sessionMoodBucket}</dd></div>
      <div><dt>sessionEnergyBucket</dt><dd>{capsule.sessionEnergyBucket}</dd></div>
      <div><dt>focusNeedBucket</dt><dd>{capsule.focusNeedBucket}</dd></div>
      <div><dt>safeSummaryCode</dt><dd>{capsule.safeSummaryCode}</dd></div>
      <div><dt>checksum</dt><dd>{capsule.checksum}</dd></div>
      <div><dt>privacyClass</dt><dd>{capsule.privacyClass}</dd></div>
    </dl>
  );
}

function PrivacyAudit({ audit }) {
  if (!audit) return <p className="muted">Chưa chạy kiểm tra quyền riêng tư.</p>;

  return (
    <ul className="settingsChecklist" aria-label="Privacy audit checklist">
      {PRIVACY_AUDIT_LABELS.map(([key, label]) => (
        <li key={key}>
          <strong>{audit[key] === false ? 'OK' : 'Cần kiểm tra'}</strong>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

function MockPackageSummary({ summary }) {
  if (!summary) return <p className="muted">Chưa tạo gói mock robot import.</p>;

  return (
    <dl className="settingsCompactList" aria-label="Mock robot import package summary">
      <div><dt>target</dt><dd>{summary.target}</dd></div>
      <div><dt>bridgeMode</dt><dd>{summary.bridgeMode}</dd></div>
      <div><dt>checksumStatus</dt><dd>{summary.checksumStatus}</dd></div>
      <div><dt>importPathHint</dt><dd>{summary.importPathHint}</dd></div>
      <div><dt>R5X19.2</dt><dd>{summary.compatibleWithR5X19_2 ? 'compatible' : 'not_ready'}</dd></div>
    </dl>
  );
}

export default function SafeCapsuleControlCenter() {
  const [state, setState] = useState(() => createInitialSafeCapsuleControlCenterState());
  const runAction = action => {
    setState(current => applySafeCapsuleControlCenterAction(current, action));
  };

  const bridgeFlags = useMemo(() => ([
    ['bridgeStatus', state.bridgeStatus],
    ['realBridgeEnabled', String(state.realBridgeEnabled)],
    ['transportEnabled', String(state.transportEnabled)],
    ['persistentWritesEnabled', String(state.persistentWritesEnabled)],
    ['motionControlsEnabled', String(state.motionControlsEnabled)]
  ]), [state]);

  return (
    <section className="settingsPanel safeCapsuleControlCenter" aria-label="Trung tâm Safe Capsule — chỉ mô phỏng">
      <div className="sectionHeader">
        <p className="eyebrow">Dev-only · Mock only</p>
        <h2>Safe Capsule Control Center — Mock Only</h2>
      </div>

      <div className="settingsNotice" role="note">
        <strong>Trung tâm Safe Capsule — chỉ mô phỏng</strong>
        <p>Không kết nối robot thật. Không gửi Serial/WebSocket/BLE/Wi-Fi. Không xuất câu hỏi/đáp án/lịch sử học. Chỉ tạo capsule rút gọn để kiểm tra mock import.</p>
      </div>

      <div className="settingsActions" aria-label="Safe capsule sample controls">
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STEADY)}>
          Tạo capsule mẫu ổn định
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STRUGGLING)}>
          Tạo capsule mẫu đang gặp khó
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_HIGH_REVIEW_PRESSURE)}>
          Tạo capsule áp lực ôn tập cao
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_LOW_ENERGY)}>
          Tạo capsule năng lượng thấp
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.RUN_PRIVACY_AUDIT)} disabled={!state.capsule}>
          Chạy kiểm tra quyền riêng tư
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_MOCK_ROBOT_IMPORT_PACKAGE)} disabled={!state.capsule}>
          Tạo gói mock robot import
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CLEAR_PREVIEW)}>
          Xóa preview
        </button>
      </div>

      <div className="settingsGrid">
        <div>
          <h3>Capsule preview</h3>
          <BucketList capsule={state.capsule} />
        </div>
        <div>
          <h3>Trạng thái bridge</h3>
          <dl className="settingsCompactList" aria-label="Mock bridge status">
            {bridgeFlags.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <p className="muted">Compatibility status: {state.compatibilityStatus.status}</p>
        </div>
        <div>
          <h3>Privacy audit</h3>
          <PrivacyAudit audit={state.privacyAudit} />
        </div>
        <div>
          <h3>Mock export envelope</h3>
          <MockPackageSummary summary={state.mockPackageSummary} />
        </div>
      </div>
    </section>
  );
}
