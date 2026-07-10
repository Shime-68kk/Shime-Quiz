import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

export default function FlashcardItem({ item, revealed = false, onToggleReveal, onResetReveal }) {
  const { t } = useShimeLanguage();
  const answer = item?.answer || item?.correctAnswer || t('study.invalidBack');

  return (
    <div className="studyInteraction">
      <div className={`flashcard ${revealed ? 'flashcard--revealed' : ''}`}>
        <div>
          <Badge tone={revealed ? 'success' : 'info'}>{revealed ? t('study.back') : t('study.front')}</Badge>
          <p>{revealed ? answer : item.prompt}</p>
        </div>
      </div>

      <div className="studyActions studyActions--compact">
        <Button type="button" onClick={() => onToggleReveal?.()}>
          {revealed ? t('study.hideAnswer') : t('study.flip')}
        </Button>
        {revealed ? (
          <Button type="button" variant="ghost" onClick={() => onResetReveal?.()}>
            {t('study.reviewFront')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
