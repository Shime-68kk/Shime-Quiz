import Badge from '../Badge.jsx';
import Card from '../Card.jsx';
import MultipleChoiceItem from './MultipleChoiceItem.jsx';
import ShortAnswerItem from './ShortAnswerItem.jsx';
import FlashcardItem from './FlashcardItem.jsx';

const itemTypeLabels = {
  multiple_choice: 'Trắc nghiệm',
  short_answer: 'Trả lời ngắn',
  flashcard: 'Flashcard'
};

function getTone(type) {
  if (type === 'multiple_choice') return 'info';
  if (type === 'short_answer') return 'warning';
  if (type === 'flashcard') return 'success';
  return 'neutral';
}

export default function StudyItemRenderer({ item, contextLabel, itemState = {}, actions = {} }) {
  if (!item) {
    return (
      <Card title="Chưa có mục học" variant="elevated">
        <p className="muted">Không tìm thấy mục học phù hợp với lựa chọn hiện tại.</p>
      </Card>
    );
  }

  let body = null;
  if (item.type === 'multiple_choice') {
    body = (
      <MultipleChoiceItem
        item={item}
        selectedChoiceId={itemState.answer || ''}
        checked={Boolean(itemState.checked)}
        onSelectChoice={actions.onAnswerChange}
        onCheck={actions.onCheck}
        onReset={actions.onResetAnswer}
      />
    );
  }
  else if (item.type === 'short_answer') {
    body = (
      <ShortAnswerItem
        item={item}
        response={itemState.answer || ''}
        checked={Boolean(itemState.checked)}
        onResponseChange={actions.onAnswerChange}
        onCheck={actions.onCheck}
        onReset={actions.onResetAnswer}
      />
    );
  }
  else if (item.type === 'flashcard') {
    body = (
      <FlashcardItem
        item={item}
        revealed={Boolean(itemState.revealed)}
        onToggleReveal={actions.onToggleReveal}
        onResetReveal={actions.onResetReveal}
      />
    );
  }
  else {
    body = (
      <div className="studyFeedback studyFeedback--warning" role="status">
        Loại mục này chưa được hỗ trợ trong Phòng học: {item.type || 'không rõ'}.
      </div>
    );
  }

  return (
    <Card className="studyItemCard" variant="elevated">
      <div className="studyItemHeader">
        <div className="badgeList">
          <Badge tone={getTone(item.type)}>{itemTypeLabels[item.type] || item.type || 'Không rõ loại'}</Badge>
          {item.difficulty ? <Badge tone="neutral">{item.difficulty}</Badge> : null}
          {contextLabel ? <Badge tone="neutral">{contextLabel}</Badge> : null}
        </div>
        {item.source ? <p className="muted">Nguồn: {item.source}</p> : null}
      </div>
      <h2 className="studyPrompt">{item.prompt || 'Item này chưa có prompt hợp lệ.'}</h2>
      {body}
      {Array.isArray(item.tags) && item.tags.length ? (
        <div className="badgeList" aria-label="Nhãn của mục học">
          {item.tags.slice(0, 5).map(tag => <Badge key={tag} tone="neutral">#{tag}</Badge>)}
        </div>
      ) : null}
    </Card>
  );
}
