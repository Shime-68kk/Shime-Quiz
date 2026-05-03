import { useMemo } from 'react';
import Button from '../Button.jsx';
import { normalizeAnswerText } from '../../utils/text.js';


function getAcceptableAnswers(item) {
  const answers = Array.isArray(item?.acceptableAnswers) ? item.acceptableAnswers : [];
  return [item?.correctAnswer, item?.answer, ...answers]
    .map(answer => String(answer ?? '').trim())
    .filter(Boolean)
    .filter((answer, index, all) => all.findIndex(candidate => normalizeAnswerText(candidate) === normalizeAnswerText(answer)) === index);
}

export default function ShortAnswerItem({ item, response = '', checked = false, onResponseChange, onCheck, onReset }) {
  const acceptableAnswers = useMemo(() => getAcceptableAnswers(item), [item]);
  const normalizedResponse = normalizeAnswerText(response);
  const isCorrect = checked && normalizedResponse && acceptableAnswers.some(answer => normalizeAnswerText(answer) === normalizedResponse);

  return (
    <div className="studyInteraction">
      <label className="shortAnswerField">
        <span>Câu trả lời của bạn</span>
        <input
          type="text"
          value={response}
          onChange={event => onResponseChange?.(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && response.trim()) onCheck?.();
          }}
          placeholder="Nhập câu trả lời ngắn..."
          aria-describedby={checked ? `feedback-${item.id}` : undefined}
        />
      </label>

      <div className="studyActions studyActions--compact">
        <Button type="button" onClick={() => onCheck?.()} disabled={!response.trim()}>
          Kiểm tra đáp án
        </Button>
        <Button type="button" variant="ghost" onClick={() => onReset?.()}>
          Xóa câu trả lời
        </Button>
      </div>

      {checked ? (
        <div
          id={`feedback-${item.id}`}
          className={`studyFeedback ${isCorrect ? 'studyFeedback--success' : 'studyFeedback--danger'}`}
          role="status"
        >
          <strong>{isCorrect ? 'Chính xác.' : 'Chưa đúng.'}</strong>
          {!isCorrect && acceptableAnswers.length ? <p>Đáp án gợi ý: {acceptableAnswers[0]}</p> : null}
          {item.explanation ? <p>{item.explanation}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
