import Badge from '../Badge.jsx';
import Button from '../Button.jsx';

export default function FlashcardItem({ item, revealed = false, onToggleReveal, onResetReveal }) {
  const answer = item?.answer || item?.correctAnswer || 'Chưa có mặt sau hợp lệ.';

  return (
    <div className="studyInteraction">
      <div className={`flashcard ${revealed ? 'flashcard--revealed' : ''}`}>
        <div>
          <Badge tone={revealed ? 'success' : 'info'}>{revealed ? 'Mặt sau' : 'Mặt trước'}</Badge>
          <p>{revealed ? answer : item.prompt}</p>
        </div>
      </div>

      <div className="studyActions studyActions--compact">
        <Button type="button" onClick={() => onToggleReveal?.()}>
          {revealed ? 'Ẩn đáp án' : 'Lật thẻ'}
        </Button>
        {revealed ? (
          <Button type="button" variant="ghost" onClick={() => onResetReveal?.()}>
            Xem lại mặt trước
          </Button>
        ) : null}
      </div>
    </div>
  );
}
