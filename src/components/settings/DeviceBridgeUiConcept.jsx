import { useState, useEffect } from 'react';
import Card from '../Card.jsx';
import Button from '../Button.jsx';
import {
  getSharedDeviceBridgeFacade,
  DEVICE_BRIDGE_TRANSPORT_MODE_MOCK,
  DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN,
  DEVICE_BRIDGE_UI_STATUSES,
  DEVICE_BRIDGE_TRANSPORT_STATUSES,
  getDeviceBridgeStatusLabel,
  getDeviceBridgePrivacyWarning
} from '../../deviceBridge/index.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

const facade = getSharedDeviceBridgeFacade();

export function formatEventTime(emittedAt) {
  if (!emittedAt) return '—';
  const time = Date.parse(emittedAt);
  if (!Number.isFinite(time)) return '—';
  try {
    const dateObj = new Date(time);
    if (isNaN(dateObj.getTime())) return '—';
    return dateObj.toLocaleTimeString();
  } catch {
    return '—';
  }
}

export default function DeviceBridgeUiConcept() {
  const { t } = useShimeLanguage();
  const [snapshot, setSnapshot] = useState(() => facade.getSnapshot());
  const [debugEvents, setDebugEvents] = useState(() => facade.getDebugEvents());
  const [realLanUrl, setRealLanUrl] = useState('');
  const [realLanMessage, setRealLanMessage] = useState('');

  useEffect(() => {
    const unsubscribe = facade.subscribe(() => {
      setSnapshot(facade.getSnapshot());
      setDebugEvents(facade.getDebugEvents());
    });
    return () => unsubscribe();
  }, []);

  const handleToggleBridge = () => {
    if (snapshot.enabled) {
      facade.disable();
    } else {
      facade.enable();
    }
  };

  const handleConnectMock = () => {
    setRealLanMessage('');
    facade.selectTransportMode(DEVICE_BRIDGE_TRANSPORT_MODE_MOCK);
    facade.connectMock();
  };

  const handleDisconnectMock = () => {
    facade.disconnect();
  };

  const handleClearEvents = () => {
    facade.clearDebugEvents();
  };

  const handleSelectMockMode = () => {
    setRealLanMessage('');
    facade.selectTransportMode(DEVICE_BRIDGE_TRANSPORT_MODE_MOCK);
  };

  const handleSelectRealLanMode = () => {
    setRealLanMessage('');
    facade.selectTransportMode(DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN);
  };

  const handleConnectRealLan = () => {
    const result = facade.connectRealTransport({ url: realLanUrl });
    setRealLanMessage(result.ok ? t('developer.bridgeConnecting') : t('developer.bridgeConnectFailed', { reason: result.reason || 'unknown_error' }));
  };

  const handleDisconnectTransport = () => {
    const result = facade.disconnectTransport();
    setRealLanMessage(result.ok ? t('developer.bridgeDisconnectedReal') : t('developer.bridgeDisconnectFailed'));
  };

  return (
    <Card className="settingsPanel" eyebrow="Device Bridge" title={t('developer.bridgeTitle')}>
      <div style={{ display: 'grid', gap: '16px', textSelf: 'stretch' }}>
        
        {/* Privacy Warning block */}
        <div style={{
          background: 'rgba(235, 140, 20, 0.08)',
          borderLeft: '4px solid #eb8c14',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: 'var(--color-text)'
        }}>
          <strong style={{ display: 'block', marginBottom: '4px', color: '#d97706' }}>
            {t('developer.bridgePrivacyTitle')}
          </strong>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--color-text-muted)' }}>
            {t('developer.bridgePrivacyBody')}
          </p>
          <span style={{ fontSize: '0.75rem', opacity: 0.85, fontFamily: 'monospace' }}>
            {getDeviceBridgePrivacyWarning()}
          </span>
        </div>

        {/* Configuration toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          background: 'var(--surface-strong)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <div>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>{t('developer.bridgeToggle')}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {t('developer.bridgeToggleBody')}
            </span>
          </div>
          <Button 
            type="button" 
            variant={snapshot.enabled ? 'secondary' : 'primary'}
            onClick={handleToggleBridge}
            style={{ minWidth: '120px' }}
          >
            {snapshot.enabled ? t('developer.bridgeDisable') : t('developer.bridgeEnable')}
          </Button>
        </div>

        {/* Conditional status panels based on active state */}
        {!snapshot.enabled ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            borderRadius: '8px',
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem'
          }}>
            {t('developer.bridgeOff')}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <strong style={{ fontSize: '0.9rem' }}>{t('developer.bridgeChooseMode')}</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Button
                  type="button"
                  variant={snapshot.selectedTransportMode === DEVICE_BRIDGE_TRANSPORT_MODE_MOCK ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleSelectMockMode}
                >
                  Mock mode
                </Button>
                <Button
                  type="button"
                  variant={snapshot.selectedTransportMode === DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleSelectRealLanMode}
                >
                  Real LAN / WS
                </Button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>{t('developer.bridgeState')} </strong>
                {snapshot.bridgeStatus === DEVICE_BRIDGE_UI_STATUSES.DISABLED && (
                  <span style={{ color: 'var(--muted)', fontWeight: 'bold' }}>{t('developer.bridgeDisconnected')}</span>
                )}
                {snapshot.bridgeStatus === DEVICE_BRIDGE_UI_STATUSES.ENABLED && (
                  <span style={{ color: '#d97706', fontWeight: 'bold' }}>{t('developer.bridgeReady')}</span>
                )}
                {snapshot.bridgeStatus === DEVICE_BRIDGE_UI_STATUSES.CONNECTED && (
                  <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                    {snapshot.selectedTransportMode === DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN
                      ? t('developer.bridgeConnectedReal')
                      : t('developer.bridgeConnectedMock')}
                  </span>
                )}
                {snapshot.bridgeStatus === DEVICE_BRIDGE_UI_STATUSES.DISCONNECTED && (
                  <span style={{ color: 'var(--muted)', fontWeight: 'bold' }}>{t('developer.bridgeDisconnected')}</span>
                )}
                {snapshot.bridgeStatus === DEVICE_BRIDGE_UI_STATUSES.ERROR && (
                  <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{t('developer.bridgeError')}</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {snapshot.selectedTransportMode !== DEVICE_BRIDGE_TRANSPORT_MODE_MOCK ? null : !snapshot.connected ? (
                  <Button type="button" size="sm" onClick={handleConnectMock}>
                    {t('developer.bridgeConnectMock')}
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" size="sm" onClick={handleDisconnectMock}>
                    {t('developer.bridgeDisconnect')}
                  </Button>
                )}
              </div>

            </div>

            {snapshot.selectedTransportMode === DEVICE_BRIDGE_TRANSPORT_MODE_WEBSOCKET_LAN ? (
              <div style={{
                display: 'grid',
                gap: '12px',
                padding: '14px',
                border: '1px solid #d97706',
                borderRadius: '8px',
                background: 'rgba(217, 119, 6, 0.08)'
              }}>
                <div>
                  <strong style={{ display: 'block', color: '#d97706', marginBottom: '4px' }}>{t('developer.bridgeManual')}</strong>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.45 }}>
                    {t('developer.bridgeManualBody')}
                  </p>
                </div>

                <label style={{ display: 'grid', gap: '6px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700 }}>{t('developer.bridgeAddress')}</span>
                  <input
                    type="text"
                    value={realLanUrl}
                    onChange={event => setRealLanUrl(event.target.value)}
                    placeholder="ws://192.168.1.20:81"
                    autoComplete="off"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-strong)',
                      color: 'var(--color-text)'
                    }}
                  />
                </label>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {!snapshot.connected ? (
                    <Button type="button" size="sm" onClick={handleConnectRealLan}>
                      {t('developer.bridgeConnectReal')}
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" size="sm" onClick={handleDisconnectTransport}>
                      {t('developer.bridgeDisconnectReal')}
                    </Button>
                  )}
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {t('developer.bridgeState')} {snapshot.realTransportState || 'idle'}
                    {snapshot.realTransportHost ? ` · ${snapshot.realTransportHost}` : ''}
                  </span>
                </div>

                {realLanMessage ? (
                  <div style={{ color: snapshot.lastError ? 'var(--color-danger)' : 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {realLanMessage}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Transport Kind & Privacy Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ padding: '8px', background: 'var(--surface-strong)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('developer.bridgeTransport')} </span>
                <strong>{snapshot.transportKind}</strong>
              </div>
              <div style={{ padding: '8px', background: 'var(--surface-strong)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('developer.bridgePrivacyMode')} </span>
                <strong>{snapshot.privacyMode}</strong>
              </div>
              <div style={{ padding: '8px', background: 'var(--surface-strong)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('developer.bridgeEventCount')} </span>
                <strong>{snapshot.eventCount}</strong>
              </div>
              <div style={{ padding: '8px', background: 'var(--surface-strong)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('developer.bridgeLastEvent')} </span>
                <strong>{snapshot.lastEventType || 'None'}</strong>
              </div>
            </div>

            {/* Debug Event List */}
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem' }}>{t('developer.bridgeLog')}</strong>
                {debugEvents.length > 0 && (
                  <Button type="button" variant="ghost" size="xs" onClick={handleClearEvents}>
                    {t('developer.bridgeClearLog')}
                  </Button>
                )}
              </div>
              <div style={{
                background: 'var(--surface-strong)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.8rem',
                maxHeight: '160px',
                overflowY: 'auto',
                display: 'grid',
                gap: '6px'
              }}>
                {debugEvents.length > 0 ? (
                  [...debugEvents].reverse().map((evt, idx) => (
                    <div key={idx} style={{ color: 'var(--color-text)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                      <span style={{ color: 'var(--muted)', marginRight: '8px' }}>
                        {formatEventTime(evt.emittedAt)}
                      </span>
                      <span style={{ color: 'var(--brand)', fontWeight: 'bold', marginRight: '8px' }}>{evt.eventType}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        {JSON.stringify(evt.payload)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '12px' }}>
                    {t('developer.bridgeNoEvents')}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </Card>
  );
}
