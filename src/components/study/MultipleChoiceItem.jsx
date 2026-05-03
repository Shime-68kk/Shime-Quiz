import { useMemo } from 'react';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import { normalizeAnswerText } from '../../utils/text.js';


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
        Item trắc nghiệm này chưa có lựa chọn hợp lệ.
      </div>
    );
  }

  return (
    <div className="studyInteraction">
      <fieldset className="choiceList" aria-describedby={checked ? `feedback-${item.id}` : undefined}>
        <legend className="srOnly">Chọn một đáp án</legend>
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
              {showCorrect ? <Badge tone="success">Đúng</Badge> : null}
              {showWrong ? <Badge tone="danger">Sai</Badge> : null}
            </label>
          );
        })}
      </fieldset>

      <div className="studyActions studyActions--compact">
        <Button type="button" onClick={() => onCheck?.()} disabled={!selectedChoiceId}>
          Kiểm tra đáp án
        </Button>
        <Button type="button" variant="ghost" onClick={() => onReset?.()}>
          Làm lại
        </Button>
      </div>

      {checked ? (
        <div
          id={`feedback-${item.id}`}
          className={`studyFeedback ${isCorrect ? 'studyFeedback--success' : 'studyFeedback--danger'}`}
          role="status"
        >
          <strong>{isCorrect ? 'Chính xác.' : 'Chưa đúng.'}</strong>
          {!isCorrect && correctChoice ? <p>Đáp án đúng: {getChoiceText(correctChoice)}</p> : null}
          {item.explanation ? <p>{item.explanation}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
