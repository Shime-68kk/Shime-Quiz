import Button from '../Button.jsx';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

export default function StudyRoomSubjectSpaces({
  subjectSpaces = [],
  activeSubjectId = '',
  navigation = {},
  alerts = [],
  onSelectSubject,
  onNavigateSubject
}) {
  const { t } = useShimeLanguage();
  if (!subjectSpaces.length) return null;
  const activeSpace = subjectSpaces.find(space => space.subjectId === activeSubjectId) || subjectSpaces[0];
  const activeAlert = alerts.find(alert => alert.subjectId === activeSpace.subjectId);

  return (
    <section className="studySubjectSpaces mobileStudyRoomPolish" aria-label={t('study.subjectSpaces')} data-mobile-studyroom-polish="true">
      <div className="studySubjectSpaces__header">
        <div>
          <strong>{t('study.subjectSpaces')}</strong>
          <p>{t('study.subjectSpacesBody')}</p>
        </div>
        <div className="studySubjectSpaces__nav">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigateSubject?.('keyboard_prev')}
            disabled={!navigation.canGoPrev}
          >
            {t('study.previousSubject')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigateSubject?.('keyboard_next')}
            disabled={!navigation.canGoNext}
          >
            {t('study.nextSubject')}
          </Button>
        </div>
      </div>

      <div className="studySubjectSpaces__rail" role="tablist" aria-label={t('study.subjectList')}>
        {subjectSpaces.map(space => {
          const selected = space.subjectId === activeSpace.subjectId;
          return (
            <button
              key={space.subjectId}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={`studySubjectChip ${selected ? 'studySubjectChip--active' : ''}`}
              onClick={() => onSelectSubject?.(space.subjectId)}
            >
              <span>{space.subjectLabel}</span>
              <small>{t('study.subjectDue', { due: space.dueCount, overdue: space.overdueCount })}</small>
            </button>
          );
        })}
      </div>

      <div className="studySubjectPanel" aria-label={navigation.ariaLabel || t('study.subjectSpaceLabel', { subject: activeSpace.subjectLabel })}>
        <div>
          <span className={`studySubjectPanel__pressure studySubjectPanel__pressure--${activeSpace.forgettingPressureBucket}`}>
            {t('study.forgettingPressure', { bucket: activeSpace.forgettingPressureBucket })}
          </span>
          <h2>{activeSpace.subjectLabel}</h2>
          <p>
            {t('study.subjectCounts', { cards: activeSpace.cardCount, newCount: activeSpace.newCount, reviewCount: activeSpace.reviewCount, workload: activeSpace.workloadBucket })}
          </p>
        </div>
        <div className="studySubjectPanel__action">
          <strong>{activeSpace.focusRecommendation === 'rescue_review' ? t('study.rescueReview') : activeSpace.focusRecommendation === 'deep_focus' ? t('study.deepFocus') : t('study.steadySession')}</strong>
          <span>{activeAlert?.userFacingBody || t('study.noUrgentAlert')}</span>
        </div>
      </div>
    </section>
  );
}
