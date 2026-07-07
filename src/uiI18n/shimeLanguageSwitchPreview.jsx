import { useState } from 'react';
import Card from '../Card.jsx';
import Button from '../Button.jsx';
import {
  SHIME_LOCALES,
  SHIME_DEFAULT_LOCALE,
  getUiString
} from './shimeUiCopyProposal.js';

/**
 * Isolated bilingual language switch UX prototype.
 * Designed for future Settings top area integration.
 * Safe for preview: in-memory only and has zero runtime side effects.
 */
export default function ShimeLanguageSwitchPreview() {
  const [currentLocale, setCurrentLocale] = useState(SHIME_DEFAULT_LOCALE);

  const handleLanguageChange = (locale) => {
    setCurrentLocale(locale);
  };

  return (
    <Card 
      className="settingsPanel" 
      eyebrow={getUiString('settingsLanguage', currentLocale)}
      title={getUiString('settingsLanguage', currentLocale)}
    >
      <div style={{ display: 'grid', gap: '16px', textSelf: 'stretch' }}>
        
        {/* Informative notice block */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          borderLeft: '4px solid #3b82f6',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.88rem',
          lineHeight: '1.45',
          color: 'var(--color-text)'
        }}>
          <strong style={{ display: 'block', marginBottom: '4px', color: '#2563eb' }}>
            {currentLocale === SHIME_LOCALES.VI ? '💡 Bản xem trước Ngôn ngữ' : '💡 Language Preview Mode'}
          </strong>
          <p style={{ margin: '0', color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
            {getUiString('previewOnlyNote', currentLocale)}
          </p>
          <span style={{ display: 'block', marginTop: '6px', fontSize: '0.76rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            {currentLocale === SHIME_LOCALES.VI 
              ? '* Codex sẽ tích hợp bộ não đa ngôn ngữ và chạy kiểm thử tự động tại các pha sau.' 
              : '* Codex will integrate the multi-language engine and run automated tests in subsequent phases.'}
          </span>
        </div>

        {/* Toggle Controls */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          padding: '8px',
          background: 'var(--surface-strong)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '0.9rem', marginRight: 'auto', fontWeight: 'bold' }}>
            {currentLocale === SHIME_LOCALES.VI ? 'Chọn ngôn ngữ:' : 'Select Language:'}
          </span>

          <Button
            type="button"
            variant={currentLocale === SHIME_LOCALES.VI ? 'primary' : 'secondary'}
            onClick={() => handleLanguageChange(SHIME_LOCALES.VI)}
            size="sm"
          >
            Tiếng Việt
          </Button>

          <Button
            type="button"
            variant={currentLocale === SHIME_LOCALES.EN ? 'primary' : 'secondary'}
            onClick={() => handleLanguageChange(SHIME_LOCALES.EN)}
            size="sm"
          >
            English
          </Button>
        </div>

        {/* Short display previewing translation results */}
        <div style={{
          padding: '12px',
          background: 'var(--surface)',
          border: '1px dashed var(--border)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          display: 'grid',
          gap: '8px'
        }}>
          <strong>
            {currentLocale === SHIME_LOCALES.VI ? 'Từ vựng mẫu đã chọn:' : 'Sample terminology selected:'}
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
            <div>navDashboard:</div> <div>{getUiString('navDashboard', currentLocale)}</div>
            <div>shimeRobot:</div> <div>{getUiString('shimeRobot', currentLocale)}</div>
            <div>deviceBridge:</div> <div>{getUiString('deviceBridge', currentLocale)}</div>
            <div>cognitiveEngineV2:</div> <div>{getUiString('cognitiveEngineV2', currentLocale)}</div>
            <div>learningStateCapsule:</div> <div>{getUiString('learningStateCapsule', currentLocale)}</div>
            <div>fsrsMemorySignal:</div> <div>{getUiString('fsrsMemorySignal', currentLocale)}</div>
          </div>
        </div>

      </div>
    </Card>
  );
}
