import { useMemo } from 'react';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import { normalizeAnswerText } from '../../utils/text.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';


function getChoiceText(choice) {
  if (typeof choice === 'string') return choice;
  return choice?.text ?? choice?.label ?? choice?.value ?? '';
}

function isChoiceCorrect(choice, correctAnswer) {
  const expected = normalizeAnswerText(correctAnswer);
  if (!expected) return false;
  return normalizeAnswerText(choice?.id) === expected || normalizeAnswerText(getChoiceText(choice)) === expected;
}

export default function MultipleChoiceItem({ item, selectedChoiceId = '', checked = false, onSelectChoice, onCheck, onReset }) {
  const { t } = useShimeLanguage();
  const choices = Array.isArray(item?.choices) ? item.choices : [];
  const selectedChoice = choices.find(choice => String(choice.id) === selectedChoiceId);
  const isCorrect = checked && selectedChoice ? isChoiceCorrect(selectedChoice, item.correctAnswer) : false;
  const correctChoice = useMemo(
    () => choices.find(choice => isChoiceCorrect(choice, item.correctAnswer)),
    [choices, item.correctAnswer]
  );

  function selectChoice(choiceId) {
    onSelectChoice?.(String(choiceId));
  }

  if (!choices.length) {
    return (
      <div className="studyFeedback studyFeedback--warning" role="status">
        {t('study.noChoices')}
      </div>
    );
  }

  return (
    <div className="studyInteraction">
      <fieldset className="choiceList" aria-describedby={checked ? `feedback-${item.id}` : undefined}>
        <legend className="srOnly">{t('study.chooseAnswer')}</legend>
        {choices.map((choice, index) => {
          const choiceId = String(choice.id ?? index + 1);
          const isSelected = selectedChoiceId === choiceId;
          const showCorrect = checked && isChoiceCorrect(choice, item.correctAnswer);
          const showWrong = checked && isSelected && !showCorrect;

          return (
            <label
              key={choiceId}
              className={[
                'choiceOption',
                isSelected ? 'choiceOption--selected' : '',
                showCorrect ? 'choiceOption--correct' : '',
                showWrong ? 'choiceOption--wrong' : ''
              ].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name={`choice-${item.id}`}
                value={choiceId}
                checked={isSelected}
                onChange={() => selectChoice(choiceId)}
              />
              <span className="choiceOption__marker" aria-hidden="true">{index + 1}</span>
              <span className="choiceOption__text">{getChoiceText(choice)}</span>
              {showCorrect ? <Badge tone="success">{t('study.correct')}</Badge> : null}
              {showWrong ? <Badge tone="danger">{t('study.wrong')}</Badge> : null}
            </label>
          );
        })}
      </fieldset>

      <div className="studyActions studyActions--compact">
        <Button type="button" onClick={() => onCheck?.()} disabled={!selectedChoiceId}>
          {t('study.check')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => onReset?.()}>
          {t('study.reset')}
        </Button>
      </div>

      {checked ? (
        <div
          id={`feedback-${item.id}`}
          className={`studyFeedback ${isCorrect ? 'studyFeedback--success' : 'studyFeedback--danger'}`}
          role="status"
        >
          <strong>{isCorrect ? t('study.correctSentence') : t('study.incorrectSentence')}</strong>
          {!isCorrect && correctChoice ? <p>{t('study.correctAnswer', { answer: getChoiceText(correctChoice) })}</p> : null}
          {item.explanation ? <p>{item.explanation}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
