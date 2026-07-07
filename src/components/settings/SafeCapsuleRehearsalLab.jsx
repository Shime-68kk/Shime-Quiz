import { useState } from 'react';
import {
  applySafeCapsuleRehearsalLabAction,
  createInitialSafeCapsuleRehearsalLabState,
  SAFE_CAPSULE_REHEARSAL_ACTIONS
} from './safeCapsuleRehearsalLabModel.js';

const BUTTONS = [
  ['steady_progress', 'Chạy diễn tập ổn định'],
  ['struggling_streak', 'Chạy diễn tập đang gặp khó'],
  ['review_pressure_high', 'Chạy diễn tập áp lực ôn tập cao'],
  ['low_energy_focus', 'Chạy diễn tập năng lượng thấp'],
  ['privacy_attack_raw_quiz', 'Chạy kiểm tra tấn công dữ liệu quiz'],
  ['privacy_attack_raw_rf', 'Chạy kiểm tra tấn công RF'],
  ['privacy_attack_secret', 'Chạy kiểm tra secret']
];

function ResultTable({ results }) {
  if (!results.length) return <p className="muted">Chưa có kết quả diễn tập. Mỗi lượt chạy cần bấm nút rõ ràng.</p>;

  return (
    <div className="settingsTableWrap">
      <table className="settingsTable" aria-label="Safe capsule rehearsal results">
        <thead>
          <tr>
            <th>scenario id</th>
            <th>accepted/rejected</th>
            <th>reason</th>
            <th>quality</th>
            <th>compatibility</th>
            <th>privacy</th>
            <th>package</th>
            <th>checksum</th>
            <th>summary code</th>
            <th>action</th>
            <th>tone</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr key={result.scenarioId}>
              <td>{result.scenarioId}</td>
              <td>{result.accepted ? 'accepted' : 'rejected'}</td>
              <td>{result.rejectionReasonCode || 'NONE'}</td>
              <td>{result.qualityScore.overall}</td>
              <td>{result.compatibilityScore}</td>
              <td>{result.qualityScore.privacy}</td>
              <td>{result.privacyEvidenceSummary.packageCreated ? 'yes' : 'no'}</td>
              <td>{result.privacyEvidenceSummary.checksumStatus}</td>
              <td>{result.capsule?.safeSummaryCode || 'NONE'}</td>
              <td>{result.recommendedCompanionAction}</td>
              <td>{result.companionTone}</td>
              <td>{result.noSendStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EvidenceCodes({ result }) {
  if (!result) return <p className="muted">Chưa có evidence summary codes.</p>;
  const codes = [
    ...result.qualityScore.explanationCodes,
    ...result.privacyEvidenceSummary.summaryCodes
  ];
  return (
    <ul className="settingsChecklist" aria-label="Safe capsule evidence summary codes">
      {Array.from(new Set(codes)).map(code => (
        <li key={code}>
          <strong>CODE</strong>
          <span>{code}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SafeCapsuleRehearsalLab() {
  const [state, setState] = useState(() => createInitialSafeCapsuleRehearsalLabState());

  const runScenario = scenarioId => {
    setState(current => applySafeCapsuleRehearsalLabAction(current, {
      type: SAFE_CAPSULE_REHEARSAL_ACTIONS.RUN_SCENARIO,
      scenarioId
    }));
  };

  const runAll = () => {
    setState(current => applySafeCapsuleRehearsalLabAction(current, SAFE_CAPSULE_REHEARSAL_ACTIONS.RUN_ALL));
  };

  const clear = () => {
    setState(current => applySafeCapsuleRehearsalLabAction(current, SAFE_CAPSULE_REHEARSAL_ACTIONS.CLEAR));
  };

  return (
    <section className="settingsPanel safeCapsuleRehearsalLab" aria-label="Safe Capsule Rehearsal Lab — diễn tập mock">
      <div className="sectionHeader">
        <p className="eyebrow">Mock-only rehearsal</p>
        <h2>Safe Capsule Rehearsal Lab — diễn tập mock</h2>
      </div>

      <div className="settingsNotice" role="note">
        <strong>Diễn tập nhiều trạng thái học mà không gửi robot thật</strong>
        <p>Không Serial/WebSocket/BLE/Wi-Fi. Không xuất câu hỏi/đáp án/lịch sử học. Chỉ sinh bằng chứng quyền riêng tư và gói mock import.</p>
      </div>

      <div className="settingsActions" aria-label="Safe capsule rehearsal controls">
        {BUTTONS.map(([scenarioId, label]) => (
          <button key={scenarioId} type="button" onClick={() => runScenario(scenarioId)}>
            {label}
          </button>
        ))}
        <button type="button" onClick={runAll}>Chạy toàn bộ diễn tập</button>
        <button type="button" onClick={clear}>Xóa kết quả diễn tập</button>
      </div>

      <dl className="settingsCompactList" aria-label="Safe capsule rehearsal safety status">
        <div><dt>mock-only status</dt><dd>{state.mockOnlyStatus}</dd></div>
        <div><dt>no-send status</dt><dd>{state.noSendStatus}</dd></div>
        <div><dt>realBridgeEnabled</dt><dd>{String(state.realBridgeEnabled)}</dd></div>
        <div><dt>transportEnabled</dt><dd>{String(state.transportEnabled)}</dd></div>
      </dl>

      <ResultTable results={state.results} />

      <div>
        <h3>Evidence summary codes</h3>
        <EvidenceCodes result={state.latestResult} />
      </div>
    </section>
  );
}
