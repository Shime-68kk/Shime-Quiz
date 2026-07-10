import { useMemo } from 'react';
import Button from '../Button.jsx';
import { normalizeAnswerText } from '../../utils/text.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';


function getAcceptableAnswers(item) {
  const answers = Array.isArray(item?.acceptableAnswers) ? item.acceptableAnswers : [];
  return [item?.correctAnswer, item?.answer, ...answers]
    .map(answer => String(answer ?? '').trim())
    .filter(Boolean)
    .filter((answer, index, all) => all.findIndex(candidate => normalizeAnswerText(candidate) === normalizeAnswerText(answer)) === index);
}

export default function ShortAnswerItem({ item, response = '', checked = false, onResponseChange, onCheck, onReset }) {
  const { t } = useShimeLanguage();
  const acceptableAnswers = useMemo(() => getAcceptableAnswers(item), [item]);
  const normalizedResponse = normalizeAnswerText(response);
  const isCorrect = checked && normalizedResponse && acceptableAnswers.some(answer => normalizeAnswerText(answer) === normalizedResponse);

  return (
    <div className="studyInteraction">
      <label className="shortAnswerField">
        <span>{t('study.yourAnswer')}</span>
        <input
          type="text"
          value={response}
          onChange={event => onResponseChange?.(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && response.trim()) onCheck?.();
          }}
          placeholder={t('study.shortPlaceholder')}
          aria-describedby={checked ? `feedback-${item.id}` : undefined}
        />
      </label>

      <div className="studyActions studyActions--compact">
        <Button type="button" onClick={() => onCheck?.()} disabled={!response.trim()}>
          {t('study.check')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => onReset?.()}>
          {t('study.clearAnswer')}
        </Button>
      </div>

      {checked ? (
        <div
          id={`feedback-${item.id}`}
          className={`studyFeedback ${isCorrect ? 'studyFeedback--success' : 'studyFeedback--danger'}`}
          role="status"
        >
          <strong>{isCorrect ? t('study.correctSentence') : t('study.incorrectSentence')}</strong>
          {!isCorrect && acceptableAnswers.length ? <p>{t('study.suggestedAnswer', { answer: acceptableAnswers[0] })}</p> : null}
          {item.explanation ? <p>{item.explanation}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
