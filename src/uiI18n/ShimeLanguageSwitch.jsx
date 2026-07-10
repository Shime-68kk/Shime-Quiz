import Card from '../components/Card.jsx';
import { UI_LOCALES } from './localeRuntime.js';
import { useShimeLanguage } from './useShimeLanguage.js';

export default function ShimeLanguageSwitch() {
  const { locale, setLocale, t } = useShimeLanguage();

  return (
    <Card
      className="settingsPanel uiPreferenceCard"
      eyebrow={t('settings.languageEyebrow')}
      title={t('settings.languageTitle')}
    >
      <p className="uiPreferenceCard__description">{t('settings.languageBody')}</p>
      <div className="uiSegmentedControl" role="group" aria-label={t('settings.chooseLanguage')}>
        <button
          type="button"
          className={locale === UI_LOCALES.VI ? 'uiSegmentedControl__item uiSegmentedControl__item--active' : 'uiSegmentedControl__item'}
          aria-pressed={locale === UI_LOCALES.VI}
          onClick={() => setLocale(UI_LOCALES.VI)}
        >
          {t('settings.vietnamese')}
        </button>
        <button
          type="button"
          className={locale === UI_LOCALES.EN ? 'uiSegmentedControl__item uiSegmentedControl__item--active' : 'uiSegmentedControl__item'}
          aria-pressed={locale === UI_LOCALES.EN}
          onClick={() => setLocale(UI_LOCALES.EN)}
        >
          {t('settings.english')}
        </button>
      </div>
      <p className="uiPreferenceCard__note">{t('settings.languageSaved')}</p>
    </Card>
  );
}
