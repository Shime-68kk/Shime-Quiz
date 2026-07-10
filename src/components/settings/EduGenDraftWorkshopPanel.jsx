import { useState } from 'react';
import { getSettings, updateSettings } from '../../state/settingsStorage.js';
import {
  EDUGEN_HEALTH_STATUS,
  checkEdugenHealth,
  isEdugenServiceConfigured,
  normalizeEdugenServiceUrl
} from '../../edugen/edugenConnector.js';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

const STATUS_IDLE = 'idle';
const STATUS_CHECKING = 'checking';

export default function EduGenDraftWorkshopPanel() {
  const { t } = useShimeLanguage();
  const [storedUrl, setStoredUrl] = useState(() => getSettings().edugenServiceUrl || '');
  const [draftUrl, setDraftUrl] = useState(storedUrl);
  const [phase, setPhase] = useState(STATUS_IDLE);
  const [lastCheck, setLastCheck] = useState(null);
  const [saveError, setSaveError] = useState('');

  function handleUrlChange(event) {
    setDraftUrl(event.target.value);
  }

  function handleSave() {
    setSaveError('');
    const normalized = normalizeEdugenServiceUrl(draftUrl);
    const trimmed = draftUrl.trim();
    if (trimmed && !normalized) {
      setSaveError(t('edugen.urlInvalidError'));
      return;
    }
    const result = updateSettings({ edugenServiceUrl: normalized });
    if (!result.ok) {
      setSaveError(t('edugen.urlSaveError'));
      return;
    }
    setStoredUrl(normalized);
    setDraftUrl(normalized);
    setLastCheck(null);
  }

  function handleClear() {
    setSaveError('');
    const result = updateSettings({ edugenServiceUrl: '' });
    if (!result.ok) {
      setSaveError(t('edugen.urlClearError'));
      return;
    }
    setStoredUrl('');
    setDraftUrl('');
    setLastCheck(null);
  }

  async function handleHealthCheck() {
    if (phase === STATUS_CHECKING) return;
    setPhase(STATUS_CHECKING);
    setLastCheck(null);
    const result = await checkEdugenHealth(storedUrl);
    setPhase(STATUS_IDLE);
    setLastCheck(result);
  }

  const configured = isEdugenServiceConfigured(storedUrl);

  const checkLabel = phase === STATUS_CHECKING
    ? t('edugen.checking')
    : t('edugen.check');

  let statusBadgeTone = 'neutral';
  let statusLabel = t('edugen.notConfigured');
  let statusHelper = t('edugen.notConfiguredBody');
  if (lastCheck) {
    if (lastCheck.status === EDUGEN_HEALTH_STATUS.REACHABLE) {
      statusBadgeTone = 'success';
      statusLabel = t('edugen.reachable');
      statusHelper = t('edugen.reachableBody');
    } else if (lastCheck.status === EDUGEN_HEALTH_STATUS.TIMEOUT) {
      statusBadgeTone = 'warning';
      statusLabel = t('edugen.timeout');
      statusHelper = t('edugen.timeoutBody');
    } else if (lastCheck.status === EDUGEN_HEALTH_STATUS.NOT_CONFIGURED) {
      statusBadgeTone = 'neutral';
      statusLabel = t('edugen.notConfigured');
      statusHelper = t('edugen.configureFirst');
    } else if (lastCheck.status === EDUGEN_HEALTH_STATUS.INVALID_URL) {
      statusBadgeTone = 'warning';
      statusLabel = t('edugen.invalidUrl');
      statusHelper = t('edugen.invalidUrlBody');
    } else {
      statusBadgeTone = 'warning';
      statusLabel = t('edugen.unreachable');
      statusHelper = t('edugen.unreachableBody');
    }
  } else if (configured) {
    statusBadgeTone = 'neutral';
    statusLabel = t('edugen.notChecked');
    statusHelper = t('edugen.notCheckedBody');
  }

  return (
    <div className="settingsPanel edugenWorkshopPanel" aria-label={t('edugen.title')}>
      <Card
        eyebrow={t('edugen.optional')}
        title={t('edugen.title')}
        variant="default"
      >
        <div className="settingsPanel__section">
          <p className="settingsPanel__helperSecondary">
            EduGen Draft Workshop — optional companion service. Not bundled with Shime.
          </p>
          <p className="settingsPanel__helper">
            {t('edugen.workshopBody')}
          </p>
          <p className="settingsPanel__helperSecondary">
            EduGen is an optional companion you run separately. Shime keeps your data local and never calls an AI provider on your behalf.
          </p>

          <label className="edugenWorkshopPanel__fieldLabel" htmlFor="edugenServiceUrlInput">
            {t('edugen.serviceUrl')}
          </label>
          <input
            id="edugenServiceUrlInput"
            type="url"
            inputMode="url"
            spellCheck="false"
            autoComplete="off"
            placeholder="http://localhost:3333"
            value={draftUrl}
            onChange={handleUrlChange}
            className="edugenWorkshopPanel__urlInput"
            aria-describedby="edugenServiceUrlHelp"
          />
          <p id="edugenServiceUrlHelp" className="settingsPanel__helperSecondary">
            Service URL — health check only. Document upload is not performed by this panel.
          </p>

          {saveError && (
            <p
              className="edugenWorkshopPanel__error"
              role="alert"
            >
              {saveError}
            </p>
          )}

          <div className="edugenWorkshopPanel__actions">
            <Button type="button" variant="primary" onClick={handleSave}>
              {t('edugen.saveUrl')}
            </Button>
            <Button type="button" variant="ghost" onClick={handleClear} disabled={!storedUrl}>
              {t('edugen.clearUrl')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleHealthCheck}
              disabled={!configured || phase === STATUS_CHECKING}
            >
              {checkLabel}
            </Button>
          </div>

          <div className="edugenWorkshopPanel__status" aria-live="polite">
            <Badge tone={statusBadgeTone}>{statusLabel}</Badge>
            <p className="settingsPanel__helper">{statusHelper}</p>
            {configured && (
              <p className="settingsPanel__helperSecondary edugenWorkshopPanel__storedUrl">
                {t('edugen.currentUrl', { url: storedUrl })}
              </p>
            )}
          </div>

          <ul className="edugenWorkshopPanel__guardrails">
            <li>{t('edugen.guardSeparate')}</li>
            <li>{t('edugen.guardReview')}</li>
            <li>{t('edugen.guardScheduler')}</li>
            <li>{t('edugen.guardLocal')}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
