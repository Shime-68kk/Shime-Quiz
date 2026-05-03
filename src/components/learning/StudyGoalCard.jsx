import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import ProgressBar from '../ProgressBar.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';
import {
  DEFAULT_DAILY_ITEM_TARGET,
  STUDY_GOAL_FOCUS_MODES,
  clearStudyGoal,
  saveStudyGoal
} from '../../state/studyGoalStorage.js';

const focusModeLabels = {
  [STUDY_GOAL_FOCUS_MODES.BALANCED]: 'Cân bằng',
  [STUDY_GOAL_FOCUS_MODES.DUE_REVIEW_FIRST]: 'Ưu tiên ôn tập',
  [STUDY_GOAL_FOCUS_MODES.WEAK_AREAS_FIRST]: 'Ưu tiên phần yếu'
};

function formatDate(value) {
  if (!value) return 'Chưa đặt';
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`));
  } catch {
    return 'Chưa đặt';
  }
}

function getInitialForm(goal) {
  return {
    dailyItemTarget: goal?.dailyItemTarget || DEFAULT_DAILY_ITEM_TARGET,
    targetDate: goal?.targetDate || '',
    focusMode: goal?.focusMode || STUDY_GOAL_FOCUS_MODES.BALANCED
  };
}

export default function StudyGoalCard() {
  const navigate = useNavigate();
  const { goalState, historyState, goalProgress: progress } = useDashboardLearningData();
  const goal = goalState.goal;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => getInitialForm(goal));
  const [status, setStatus] = useState(null);
  useEffect(() => {
    if (!isEditing) setForm(getInitialForm(goal));
  }, [goal, isEditing]);

  function startEditing() {
    setStatus(null);
    setForm(getInitialForm(goal));
    setIsEditing(true);
  }

  function cancelEditing() {
    setStatus(null);
    setForm(getInitialForm(goal));
    setIsEditing(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = saveStudyGoal({
      dailyItemTarget: form.dailyItemTarget,
      targetDate: form.targetDate,
      focusMode: form.focusMode,
      isActive: true
    });

    if (!result.ok) {
      setStatus({ tone: 'danger', text: 'Không thể lưu mục tiêu cục bộ. Bạn vẫn có thể tiếp tục học.' });
      return;
    }

    setStatus({ tone: 'success', text: 'Đã lưu mục tiêu học tập.' });
    setIsEditing(false);
  }

  function handleClear() {
    if (!window.confirm('Xóa mục tiêu học tập? Thao tác này không xóa thư viện hoặc lịch sử học.')) return;
    const result = clearStudyGoal();
    if (!result.ok) {
      setStatus({ tone: 'danger', text: 'Không thể xóa mục tiêu cục bộ.' });
      return;
    }
    setStatus({ tone: 'success', text: 'Đã xóa mục tiêu học tập.' });
    setIsEditing(false);
  }

  function startStudy() {
    navigate('/study-room');
  }

  return (
    <Card title="Mục tiêu học tập" eyebrow="Mục tiêu cục bộ" variant="elevated" className="studyGoalCard">
      {isEditing ? (
        <form className="studyGoalForm" onSubmit={handleSubmit}>
          <label className="studyGoalField">
            <span>Mục tiêu hôm nay</span>
            <select
              value={form.dailyItemTarget}
              onChange={event => setForm(current => ({ ...current, dailyItemTarget: Number(event.target.value) }))}
            >
              {[10, 20, 30].map(value => <option key={value} value={value}>{value} mục/ngày</option>)}
            </select>
          </label>

          <label className="studyGoalField">
            <span>Ngày mục tiêu</span>
            <input
              type="date"
              value={form.targetDate}
              onChange={event => setForm(current => ({ ...current, targetDate: event.target.value }))}
            />
          </label>

          <label className="studyGoalField">
            <span>Chế độ ưu tiên</span>
            <select
              value={form.focusMode}
              onChange={event => setForm(current => ({ ...current, focusMode: event.target.value }))}
            >
              <option value={STUDY_GOAL_FOCUS_MODES.BALANCED}>Cân bằng</option>
              <option value={STUDY_GOAL_FOCUS_MODES.DUE_REVIEW_FIRST}>Ưu tiên ôn tập</option>
              <option value={STUDY_GOAL_FOCUS_MODES.WEAK_AREAS_FIRST}>Ưu tiên phần yếu</option>
            </select>
          </label>

          <div className="studyGoalActions">
            <Button type="submit" size="sm">Lưu mục tiêu</Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancelEditing}>Hủy</Button>
          </div>
        </form>
      ) : goal ? (
        <div className="studyGoalPanel">
          <div className="studyGoalSummary">
            <Badge tone="info">{focusModeLabels[goal.focusMode] || 'Cân bằng'}</Badge>
            <div>
              <strong>Mục tiêu hôm nay: {goal.dailyItemTarget} mục</strong>
              <p className="muted">
                Đã luyện hôm nay: {progress.itemsPracticedToday}. Còn lại: {progress.remainingToday}.
              </p>
            </div>
          </div>

          <ProgressBar value={progress.progressPercent} label="Tiến độ mục tiêu hôm nay" />

          <div className="studyGoalMetrics" aria-label="Tóm tắt mục tiêu học tập">
            <div className="reviewScheduleMetric">
              <span>Đã luyện hôm nay</span>
              <strong>{progress.itemsPracticedToday}</strong>
            </div>
            <div className="reviewScheduleMetric">
              <span>Còn lại</span>
              <strong>{progress.remainingToday}</strong>
            </div>
            <div className="reviewScheduleMetric">
              <span>Phiên hôm nay</span>
              <strong>{progress.sessionsToday}</strong>
            </div>
          </div>

          <div className="studyGoalMeta">
            <span>Ngày mục tiêu: <strong>{formatDate(goal.targetDate)}</strong></span>
            {goal.targetDate ? (
              <span>
                {progress.daysRemaining >= 0
                  ? `Còn ${progress.daysRemaining} ngày`
                  : 'Ngày mục tiêu đã qua'}
              </span>
            ) : null}
            <span>Chế độ ưu tiên: <strong>{focusModeLabels[goal.focusMode] || 'Cân bằng'}</strong></span>
          </div>

          {progress.targetDateWarning ? (
            <p className="historyPanelMessage" role="status">{progress.targetDateWarning}</p>
          ) : null}

          <div className="studyGoalActions">
            <Button type="button" size="sm" onClick={startStudy}>Bắt đầu học</Button>
            <Button type="button" size="sm" variant="ghost" onClick={startEditing}>Chỉnh sửa</Button>
            <Button type="button" size="sm" variant="danger" onClick={handleClear}>Xóa mục tiêu</Button>
          </div>
        </div>
      ) : (
        <div className="studyGoalEmpty">
          <p className="muted">Đặt mục tiêu đơn giản để theo dõi số mục luyện mỗi ngày.</p>
          <Button type="button" size="sm" onClick={startEditing}>Thiết lập mục tiêu</Button>
        </div>
      )}

      {(goalState.discarded || historyState.discarded) ? (
        <p className="historyPanelMessage" role="status">
          Một phần dữ liệu cũ bị lỗi nên đã được bỏ qua an toàn.
        </p>
      ) : null}

      {status ? (
        <p className={`recommendationFeedback__status recommendationFeedback__status--${status.tone}`} role="status">
          {status.text}
        </p>
      ) : null}
    </Card>
  );
}
