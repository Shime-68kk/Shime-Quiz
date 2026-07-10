import { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../Card.jsx';
import Button from '../Button.jsx';
import {
  clearSharedCompanionLiveDevTapTranscript,
  disableSharedCompanionLiveDevTap,
  enableSharedCompanionLiveDevTap,
  getSharedCompanionLiveDevTapSnapshot,
  subscribeSharedCompanionLiveDevTap
} from '../../companion/index.js';
import { getSharedDeviceBridgeFacade } from '../../deviceBridge/index.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';
import {
  createInitialLiveTapPanelState,
  createInitialCompanionPanelState,
  getCompanionDemoScenarios,
  runCompanionPanelScenario,
  summarizeLiveTapSnapshot
} from './companionDevPanelModel.js';
import {
  getCompanionPanelCopy,
  getCompanionLabel,
  getReasonCodeLabel,
  getEventLabel,
  getCommandLabel,
  getTableHeaderLabel
} from './companionDevPanelCopy.js';
import {
  createV2PanelSnapshot,
  runV2DryRunFromTranscript,
  toV2PanelRows
} from './companionV2PanelAdapter.js';
import { runShimeFusionPanelDryRun } from './shimeEcosystemFusionPanelAdapter.js';
import { runRobotExpressionPreviewPanel } from './robotExpressionPreviewPanelAdapter.js';

const metricStyle = {
  padding: '10px',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  background: 'var(--surface-strong)',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
};

const explicitDevControlLabels = ['Kích hoạt bảng thử nghiệm', 'Bật theo dõi thật'];

function EmptyTranscript({ locale }) {
  const copy = getCompanionPanelCopy(locale);
  return (
    <div style={{ color: 'var(--color-text-muted)', padding: '16px', textAlign: 'center', fontStyle: 'italic' }}>
      {copy.emptyTranscript}
    </div>
  );
}

function TranscriptTable({ entries, emptyMessage, locale }) {
  if (entries.length === 0) {
    return (
      <div style={{ color: 'var(--color-text-muted)', padding: '16px', textAlign: 'center', fontStyle: 'italic' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
      <thead>
        <tr>
          {['Step', 'Event', 'Status', 'Intent', 'Tone', 'Safety', 'Command', 'Reasons', 'Privacy'].map(header => (
            <th key={header} style={{ textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid var(--border)', color: 'var(--color-text-muted)', fontWeight: '600' }}>
              {getTableHeaderLabel(header, locale)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map(entry => {
          // Format fields to respect active locale
          const isEn = locale === 'en';
          const displayStatus = isEn ? entry.status : (entry.status === 'accepted' ? 'chấp nhận' : 'từ chối');
          const displayIntent = isEn ? entry.companionIntent : (entry.companionIntent === 'none' ? 'không' : entry.companionIntent);
          const displayTone = isEn ? entry.tone : (entry.tone === 'quiet' ? 'yên lặng' : entry.tone);
          const displaySafety = isEn ? entry.safetyOutcome : (entry.safetyOutcome === 'allowed' ? 'cho phép' : (entry.safetyOutcome === 'blocked' ? 'bị chặn' : entry.safetyOutcome));
          const displayPrivacy = isEn ? (
            entry.privacyStatus === 'dữ liệu đã làm mờ/rút gọn' ? 'redacted/coarse only' : 
            (entry.privacyStatus === 'đã chặn bởi lớp bảo mật' ? 'blocked by privacy guard' : 'unknown')
          ) : entry.privacyStatus;

          return (
            <tr key={`${entry.step}-${entry.eventType}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <td style={{ padding: '10px 8px', fontWeight: '500' }}>{entry.step}</td>
              <td style={{ padding: '10px 8px', color: 'var(--color-brand)' }}>{getEventLabel(entry.eventType, locale)}</td>
              <td style={{ padding: '10px 8px', fontWeight: '500', color: entry.status === 'accepted' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {displayStatus}
              </td>
              <td style={{ padding: '10px 8px' }}>{displayIntent}</td>
              <td style={{ padding: '10px 8px', color: 'var(--color-text-muted)' }}>{displayTone}</td>
              <td style={{ padding: '10px 8px' }}>{displaySafety}</td>
              <td style={{ padding: '10px 8px', fontWeight: '600' }}>{getCommandLabel(entry.robotCommand, locale)}</td>
              <td style={{ padding: '10px 8px', color: 'var(--color-text-muted)' }}>
                {entry.reasonCodes.map(code => getReasonCodeLabel(code, locale)).join(', ') || (isEn ? 'none' : 'không')}
              </td>
              <td style={{ padding: '10px 8px', fontStyle: 'italic', fontSize: '0.78rem' }}>{displayPrivacy}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function CompanionDevPanel() {
  const { locale, t } = useShimeLanguage();
  const copy = getCompanionPanelCopy(locale);
  const isEn = locale === 'en';

  const scenarios = useMemo(() => getCompanionDemoScenarios(), []);
  const [panelState, setPanelState] = useState(() => createInitialCompanionPanelState());
  const [liveState, setLiveState] = useState(() => createInitialLiveTapPanelState());
  const [v2DryRun, setV2DryRun] = useState(null);
  const [shimeFusion, setShimeFusion] = useState(null);
  const [robotExpressionPreview, setRobotExpressionPreview] = useState(null);

  useEffect(() => {
    return subscribeSharedCompanionLiveDevTap(({ snapshot, transcript }) => {
      setLiveState(summarizeLiveTapSnapshot(snapshot, transcript));
    });
  }, []);

  const handleEnable = () => {
    setPanelState(previous => ({ ...previous, enabled: true, ignoredBeforeEnable: false }));
  };

  const handleDisable = () => {
    setPanelState(previous => ({ ...createInitialCompanionPanelState(), selectedScenarioId: previous.selectedScenarioId }));
  };

  const handleRunScenario = scenarioId => {
    setPanelState(previous => runCompanionPanelScenario(scenarioId, { enabled: previous.enabled }));
  };

  const handleClearTranscript = () => {
    setPanelState(previous => ({
      ...createInitialCompanionPanelState(),
      enabled: previous.enabled,
      selectedScenarioId: previous.selectedScenarioId
    }));
  };

  const syncLiveState = runtime => {
    setLiveState(summarizeLiveTapSnapshot(runtime.getSnapshot(), runtime.getTranscript()));
  };

  const handleEnableLiveTap = () => {
    const runtime = enableSharedCompanionLiveDevTap({ facade: getSharedDeviceBridgeFacade() });
    syncLiveState(runtime);
  };

  const handleDisableLiveTap = () => {
    const runtime = disableSharedCompanionLiveDevTap();
    if (runtime) syncLiveState(runtime);
    else setLiveState(previous => ({ ...previous, enabled: false, subscribed: false }));
  };

  const handleClearLiveTranscript = () => {
    const runtime = clearSharedCompanionLiveDevTapTranscript();
    if (runtime) syncLiveState(runtime);
    else setLiveState(createInitialLiveTapPanelState());
  };

  const getCurrentTranscript = () => {
    const shared = getSharedCompanionLiveDevTapSnapshot();
    if (Array.isArray(shared.transcript) && shared.transcript.length > 0) return shared.transcript;
    return panelState.transcript || [];
  };

  const handleRunV2DryRun = () => {
    setV2DryRun(runV2DryRunFromTranscript(getCurrentTranscript()));
  };

  const handleClearV2DryRun = () => {
    setV2DryRun(null);
  };

  const handleRunShimeFusion = () => {
    setShimeFusion(runShimeFusionPanelDryRun(getCurrentTranscript()));
  };

  const handleClearShimeFusion = () => {
    setShimeFusion(null);
    setRobotExpressionPreview(null);
  };

  const handleRunRobotExpressionPreview = () => {
    setRobotExpressionPreview(runRobotExpressionPreviewPanel(shimeFusion));
  };

  const handleClearRobotExpressionPreview = () => {
    setRobotExpressionPreview(null);
  };

  return (
    <Card className="settingsPanel" eyebrow={copy.eyebrow} title={copy.title}>
      <div style={{ display: 'grid', gap: '16px' }}>
        
        {/* Banner cảnh báo Dev-only và bảo mật dữ liệu */}
        <div
          style={{
            border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.06) 0%, rgba(217, 119, 6, 0.02) 100%)',
            padding: '12px 14px',
            display: 'grid',
            gap: '6px'
          }}
        >
          <strong style={{ color: '#d97706', fontSize: '0.92rem' }}>{copy.fakeOnly}</strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', lineHeight: 1.45 }}>
            {copy.fakeOnlyDescription}
          </span>
        </div>

        {/* Chế độ A: Kịch bản giả lập */}
        <div style={{ display: 'grid', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <strong style={{ fontSize: '0.98rem', color: 'var(--color-text)' }}>{copy.fakeModeTitle}</strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
            {copy.fakeModeSub}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <Button type="button" variant={panelState.enabled ? 'secondary' : 'primary'} onClick={handleEnable} disabled={panelState.enabled}>
            {copy.btnEnable}
          </Button>
          <Button type="button" variant="secondary" onClick={handleDisable} disabled={!panelState.enabled}>
            {copy.btnDisable}
          </Button>
          <Button type="button" variant="ghost" onClick={handleClearTranscript}>
            {copy.btnClearLog}
          </Button>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: panelState.enabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
            {panelState.enabled ? copy.statusEnabled : copy.statusDisabled}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {scenarios.map(scenario => {
            const displayLabel = isEn ? {
              normal_session: 'Normal session',
              struggle_session: 'Struggle session',
              review_due: 'Review due',
              disconnected_error: 'Disconnected/error',
              sensitive_attack: 'Sensitive attack'
            }[scenario.id] || scenario.label : scenario.label;

            return (
              <Button
                key={scenario.id}
                type="button"
                variant={scenario.invalid ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => handleRunScenario(scenario.id)}
                disabled={!panelState.enabled}
              >
                {displayLabel}
              </Button>
            );
          })}
        </div>

        {!panelState.enabled && (
          <div style={{ color: '#d97706', fontSize: '0.84rem', fontStyle: 'italic' }}>
            {copy.warnEnableFirst}
          </div>
        )}

        {panelState.ignoredBeforeEnable ? (
          <div style={{ color: '#d97706', fontSize: '0.84rem', fontWeight: '500' }}>
            {copy.ignoredBeforeEnable}
          </div>
        ) : null}

        {/* Grid hiển thị chỉ số giả lập */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
          <div style={metricStyle}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.metricObserved}</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '2px' }}>{panelState.observedCount}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.metricAccepted}</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '2px', color: 'var(--color-success)' }}>{panelState.acceptedCount}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.metricRejected}</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '2px', color: panelState.rejectedCount > 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>{panelState.rejectedCount}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.metricBlocked}</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '2px', color: panelState.blockedSensitiveCount > 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>{panelState.blockedSensitiveCount}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.metricIntent}</span>
            <strong style={{ display: 'block', fontSize: '0.85rem', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{panelState.lastCompanionIntent || (isEn ? 'none' : 'không')}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.metricCommand}</span>
            <strong style={{ display: 'block', fontSize: '0.85rem', marginTop: '2px' }}>{getCommandLabel(panelState.lastRobotCommand, locale)}</strong>
          </div>
          <div style={metricStyle}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.metricSafety}</span>
            <strong style={{ display: 'block', fontSize: '0.85rem', marginTop: '2px' }}>{isEn ? (panelState.lastSafetyOutcome || 'none') : (panelState.lastSafetyOutcome === 'allowed' ? 'cho phép' : (panelState.lastSafetyOutcome === 'blocked' ? 'bị chặn' : 'không'))}</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <strong style={{ fontSize: '0.9rem' }}>{copy.transcriptTitle}</strong>
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--surface-strong)',
              overflowX: 'auto',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            {panelState.transcript.length === 0 ? (
              <EmptyTranscript locale={locale} />
            ) : (
              <TranscriptTable entries={panelState.transcript} emptyMessage={copy.emptyTranscript} locale={locale} />
            )}
          </div>
        </div>

        <section style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', display: 'grid', gap: '10px' }}>
          <strong>{getCompanionLabel('commandPreviewTitle', locale)}</strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>{getCompanionLabel('commandPreviewDescription', locale)}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{getCompanionLabel('companionSummaryTitle', locale)}</span>
              <strong style={{ display: 'block', fontSize: '0.9rem', marginTop: '2px' }}>
                {getCommandLabel(panelState.lastRobotCommand, locale)}
              </strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{getCompanionLabel('learningRhythmTitle', locale)}</span>
              <strong style={{ display: 'block', fontSize: '0.9rem', marginTop: '2px' }}>
                {panelState.observedCount > 0 ? `${panelState.acceptedCount}/${panelState.observedCount}` : (isEn ? 'none' : 'không')}
              </strong>
            </div>
          </div>
        </section>

        {/* Chế độ B: Theo dõi thật — chỉ quan sát */}
        <div
          style={{
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0.02) 100%)',
            padding: '12px 14px',
            display: 'grid',
            gap: '8px',
            marginTop: '12px'
          }}
        >
          <strong style={{ color: '#2563eb', fontSize: '0.98rem' }}>{copy.liveModeTitle}</strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', lineHeight: 1.45 }}>
            {copy.liveModeDescription}
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <Button type="button" variant={liveState.enabled ? 'secondary' : 'primary'} onClick={handleEnableLiveTap} disabled={liveState.enabled}>
              {copy.btnEnableLive}
            </Button>
            <Button type="button" variant="secondary" onClick={handleDisableLiveTap} disabled={!liveState.enabled}>
              {copy.btnDisableLive}
            </Button>
            <Button type="button" variant="ghost" onClick={handleClearLiveTranscript}>
              {copy.btnClearLive}
            </Button>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: liveState.enabled ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
              {liveState.enabled ? copy.statusLiveEnabled : copy.statusLiveDisabled} · {liveState.subscribed ? copy.statusSubscribed : copy.statusNotSubscribed}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.liveMetricObserved}</span>
              <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '2px' }}>{liveState.observedCount}</strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.liveMetricAccepted}</span>
              <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '2px', color: 'var(--color-success)' }}>{liveState.acceptedCount}</strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.liveMetricRejected}</span>
              <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '2px' }}>{liveState.rejectedCount}</strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.liveMetricBlocked}</span>
              <strong style={{ display: 'block', fontSize: '1.05rem', marginTop: '2px' }}>{liveState.blockedSensitiveCount}</strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.liveMetricLastEvent}</span>
              <strong style={{ display: 'block', fontSize: '0.85rem', marginTop: '2px' }}>{liveState.lastInputEventType ? getEventLabel(liveState.lastInputEventType, locale) : (isEn ? 'none' : 'không')}</strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.liveMetricIntent}</span>
              <strong style={{ display: 'block', fontSize: '0.85rem', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{liveState.lastCompanionIntent || (isEn ? 'none' : 'không')}</strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.liveMetricCommand}</span>
              <strong style={{ display: 'block', fontSize: '0.85rem', marginTop: '2px' }}>{getCommandLabel(liveState.lastRobotCommand, locale)}</strong>
            </div>
            <div style={metricStyle}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{copy.liveMetricSafety}</span>
              <strong style={{ display: 'block', fontSize: '0.85rem', marginTop: '2px' }}>{isEn ? (liveState.lastSafetyOutcome || 'none') : (liveState.lastSafetyOutcome === 'allowed' ? 'cho phép' : (liveState.lastSafetyOutcome === 'blocked' ? 'bị chặn' : 'không'))}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <strong style={{ fontSize: '0.9rem' }}>{copy.liveTranscriptTitle}</strong>
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--surface-strong)',
                overflowX: 'auto',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              <TranscriptTable entries={liveState.transcript} emptyMessage={copy.emptyLiveTranscript} locale={locale} />
            </div>
          </div>
        </div>

        <section style={{ border: '1px solid rgba(124, 58, 237, 0.22)', borderRadius: '8px', padding: '12px 14px', display: 'grid', gap: '10px' }}>
          <strong>{t('developer.v2Title')}</strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
            {t('developer.v2Body')}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Button type="button" size="sm" onClick={handleRunV2DryRun}>{t('developer.v2Run')}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleClearV2DryRun}>{t('developer.v2Clear')}</Button>
          </div>
          {v2DryRun ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              <span>{t('developer.v2Status')} {v2DryRun.empty ? t('developer.v2Empty') : t('developer.v2Ran')}</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                {Object.entries(createV2PanelSnapshot(v2DryRun)).slice(0, 6).map(([key, value]) => (
                  <div key={key} style={metricStyle}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{key}</span>
                    <strong style={{ display: 'block', fontSize: '0.85rem', marginTop: '2px' }}>{String(value ?? (locale === 'en' ? 'none' : 'không'))}</strong>
                  </div>
                ))}
              </div>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                {t('developer.v2Rows', { count: toV2PanelRows(v2DryRun).length })}
              </span>
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{t('developer.v2NotRun')}</div>
          )}
        </section>

        <section style={{ border: '1px solid rgba(34, 197, 94, 0.22)', borderRadius: '8px', padding: '12px 14px', display: 'grid', gap: '10px' }}>
          <strong>{t('developer.fusionTitle')}</strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
            {t('developer.fusionBody')}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Button type="button" size="sm" onClick={handleRunShimeFusion}>{t('developer.fusionRun')}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleClearShimeFusion}>{t('developer.fusionClear')}</Button>
          </div>
          {shimeFusion && !shimeFusion.empty ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px' }}>
              <div style={metricStyle}><span>{t('developer.fusionMemory')}</span><strong style={{ display: 'block' }}>{shimeFusion.snapshot.memoryPressureLabel}</strong></div>
              <div style={metricStyle}><span>{t('developer.fusionRobot')}</span><strong style={{ display: 'block' }}>{shimeFusion.snapshot.robotInterventionLabel}</strong></div>
              <div style={metricStyle}><span>{t('developer.fusionSchedule')}</span><strong style={{ display: 'block' }}>{shimeFusion.snapshot.timetableRecommendationLabel}</strong></div>
              <div style={metricStyle}><span>{t('developer.fusionTransport')}</span><strong style={{ display: 'block' }}>{shimeFusion.snapshot.transportRecommendationLabel}</strong></div>
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              {t('developer.fusionNotRun')}
            </div>
          )}
        </section>

        <section style={{ border: '1px solid rgba(14, 165, 233, 0.22)', borderRadius: '8px', padding: '12px 14px', display: 'grid', gap: '10px' }}>
          <strong>{t('developer.expressionTitle')}</strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>{t('developer.expressionBody')}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Button type="button" size="sm" onClick={handleRunRobotExpressionPreview}>{t('developer.expressionRun')}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleClearRobotExpressionPreview}>{t('developer.expressionClear')}</Button>
          </div>
          {robotExpressionPreview && !robotExpressionPreview.empty ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px' }}>
              <div style={metricStyle}><span>{t('developer.expression')}</span><strong style={{ display: 'block' }}>{robotExpressionPreview.expressionDisplay.expressionFamilyLabel}</strong></div>
              <div style={metricStyle}><span>{t('developer.expressionScreen')}</span><strong style={{ display: 'block' }}>{robotExpressionPreview.fakeRobotConsole.currentFaceLabel}</strong></div>
              <div style={metricStyle}><span>{t('developer.expressionMotion')}</span><strong style={{ display: 'block' }}>{robotExpressionPreview.fakeRobotConsole.motionLockLabel}</strong></div>
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{t('developer.expressionNotRun')}</div>
          )}
        </section>
      </div>
    </Card>
  );
}
