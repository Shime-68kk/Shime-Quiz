import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { SHIME_LOCALES } from './shimeUiCopyProposal.js';
import { useShimeLanguage } from './useShimeLanguage.js';

export default function ShimeLanguageSwitch() {
  const { locale, setLocale, t } = useShimeLanguage();
  const isEnglish = locale === SHIME_LOCALES.EN;

  return (
    <Card className="settingsPanel" eyebrow={t('settingsLanguage')} title={isEnglish ? 'Language' : 'Ngôn ngữ'}>
      <div style={{ display: 'grid', gap: '12px' }}>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.45 }}>
          {t('previewOnlyNote')}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 700 }}>{isEnglish ? 'Language' : 'Ngôn ngữ'}</span>
          <Button
            type="button"
            size="sm"
            variant={locale === SHIME_LOCALES.VI ? 'primary' : 'secondary'}
            onClick={() => setLocale(SHIME_LOCALES.VI)}
          >
            {isEnglish ? 'Vietnamese' : 'Tiếng Việt'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={locale === SHIME_LOCALES.EN ? 'primary' : 'secondary'}
            onClick={() => setLocale(SHIME_LOCALES.EN)}
          >
            English
          </Button>
        </div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
          {isEnglish ? 'Preview only. Reloading the page resets to Vietnamese.' : 'Chỉ là bản xem trước. Tải lại trang sẽ quay về Tiếng Việt.'}
        </div>
      </div>
    </Card>
  );
}
