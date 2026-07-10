import Badge from '../Badge.jsx';
import Card from '../Card.jsx';
import MultipleChoiceItem from './MultipleChoiceItem.jsx';
import ShortAnswerItem from './ShortAnswerItem.jsx';
import FlashcardItem from './FlashcardItem.jsx';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

function getTone(type) {
  if (type === 'multiple_choice') return 'info';
  if (type === 'short_answer') return 'warning';
  if (type === 'flashcard') return 'success';
  return 'neutral';
}

export default function StudyItemRenderer({ item, contextLabel, itemState = {}, actions = {} }) {
  const { t } = useShimeLanguage();
  const itemTypeLabels = {
    multiple_choice: t('library.multipleChoice'),
    short_answer: t('library.shortAnswer'),
    flashcard: t('library.flashcard')
  };
  if (!item) {
    return (
      <Card title={t('study.noItem')} variant="elevated">
        <p className="muted">{t('study.noItemBody')}</p>
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
        {t('study.unsupportedItem', { type: item.type || t('study.unknown') })}
      </div>
    );
  }

  return (
    <Card className="studyItemCard" variant="elevated">
      <div className="studyItemHeader">
        <div className="badgeList">
          <Badge tone={getTone(item.type)}>{itemTypeLabels[item.type] || item.type || t('study.unknownType')}</Badge>
          {item.difficulty ? <Badge tone="neutral">{item.difficulty}</Badge> : null}
          {contextLabel ? <Badge tone="neutral">{contextLabel}</Badge> : null}
        </div>
        {item.source ? <p className="muted">{t('study.source', { source: item.source })}</p> : null}
      </div>
      <h2 className="studyPrompt">{item.prompt || t('study.invalidPrompt')}</h2>
      {body}
      {Array.isArray(item.tags) && item.tags.length ? (
        <div className="badgeList" aria-label={t('study.itemTags')}>
          {item.tags.slice(0, 5).map(tag => <Badge key={tag} tone="neutral">#{tag}</Badge>)}
        </div>
      ) : null}
    </Card>
  );
}
