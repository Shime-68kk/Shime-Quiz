import { useState } from 'react';
import Card from '../Card.jsx';
import { setTheme } from '../../ui/theme.js';
import { readStoredUiTheme, UI_THEME_IDS } from '../../uiTheme/themeRuntime.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

export const THEME_OPTIONS = Object.freeze(UI_THEME_IDS.map(id => ({
  id,
  labelKey: `settings.theme.${id}`,
  descriptionKey: `settings.theme.${id}Desc`
})));

export default function ThemeSettingsPanel() {
  const { t } = useShimeLanguage();
  const [activeTheme, setActiveTheme] = useState(() => readStoredUiTheme());

  function handleThemeChange(themeId) {
    setActiveTheme(setTheme(themeId));
  }

  return (
    <Card
      title={t('settings.themeTitle')}
      eyebrow={t('settings.themeEyebrow')}
      variant="elevated"
      className="themeSettingsCard uiPreferenceCard"
    >
      <p className="uiPreferenceCard__description">{t('settings.themeBody')}</p>
      <div className="themeOptionGrid" role="radiogroup" aria-label={t('settings.chooseTheme')}>
        {THEME_OPTIONS.map(theme => {
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => handleThemeChange(theme.id)}
              className={isActive ? 'themeOption themeOption--active' : 'themeOption'}
              data-theme-preview={theme.id}
            >
              <span className="themeOption__swatch" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="themeOption__copy">
                <strong>{t(theme.labelKey)}</strong>
                <small>{t(theme.descriptionKey)}</small>
              </span>
              {isActive ? <span className="themeOption__selected">{t('settings.selected')}</span> : null}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
