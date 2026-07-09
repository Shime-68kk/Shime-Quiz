import Button from '../Button.jsx';

export default function StudyRoomSubjectSpaces({
  subjectSpaces = [],
  activeSubjectId = '',
  navigation = {},
  alerts = [],
  onSelectSubject,
  onNavigateSubject
}) {
  if (!subjectSpaces.length) return null;
  const activeSpace = subjectSpaces.find(space => space.subjectId === activeSubjectId) || subjectSpaces[0];
  const activeAlert = alerts.find(alert => alert.subjectId === activeSpace.subjectId);

  return (
    <section className="studySubjectSpaces mobileStudyRoomPolish" aria-label="Phòng học theo môn" data-mobile-studyroom-polish="true">
      <div className="studySubjectSpaces__header">
        <div>
          <strong>Phòng học theo môn</strong>
          <p>Vuốt để chuyển môn hoặc dùng nút chuyển môn. Không gian này chỉ dùng tóm tắt cục bộ.</p>
        </div>
        <div className="studySubjectSpaces__nav">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigateSubject?.('keyboard_prev')}
            disabled={!navigation.canGoPrev}
          >
            Môn trước
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigateSubject?.('keyboard_next')}
            disabled={!navigation.canGoNext}
          >
            Môn sau
          </Button>
        </div>
      </div>

      <div className="studySubjectSpaces__rail" role="tablist" aria-label="Danh sách môn học">
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
              <small>{space.dueCount} đến hạn · {space.overdueCount} quá hạn</small>
            </button>
          );
        })}
      </div>

      <div className="studySubjectPanel" aria-label={navigation.ariaLabel || `Không gian học ${activeSpace.subjectLabel}`}>
        <div>
          <span className={`studySubjectPanel__pressure studySubjectPanel__pressure--${activeSpace.forgettingPressureBucket}`}>
            Sắp quên: {activeSpace.forgettingPressureBucket}
          </span>
          <h2>{activeSpace.subjectLabel}</h2>
          <p>
            {activeSpace.cardCount} thẻ · {activeSpace.newCount} mới · {activeSpace.reviewCount} đã có lịch · {activeSpace.workloadBucket}
          </p>
        </div>
        <div className="studySubjectPanel__action">
          <strong>{activeSpace.focusRecommendation === 'rescue_review' ? 'Ôn nhanh' : activeSpace.focusRecommendation === 'deep_focus' ? 'Buổi học tập trung' : 'Phiên học bình thường'}</strong>
          <span>{activeAlert?.userFacingBody || 'Không có cảnh báo quên gấp cho môn này.'}</span>
        </div>
      </div>
    </section>
  );
}
