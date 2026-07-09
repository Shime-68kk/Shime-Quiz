import { describe, expect, it } from 'vitest';
import {
  createSubjectForgettingAlert,
  createSubjectForgettingAlerts
} from '../../src/studyRoom/subjectForgettingAlertModel.js';

describe('subjectForgettingAlertModel', () => {
  it('creates due soon alert', () => {
    const alert = createSubjectForgettingAlert({ subjectId: 'math', subjectLabel: 'Môn Toán', dueCount: 2, overdueCount: 0, forgettingPressureBucket: 'low' });
    expect(alert).toMatchObject({ severity: 'info', triggerReason: 'due_soon', rawContentIncluded: false });
    expect(alert.userFacingTitle).toContain('Môn Toán sắp đến hạn ôn');
  });

  it('creates overdue urgent alert', () => {
    const alert = createSubjectForgettingAlert({ subjectId: 'physics', subjectLabel: 'Vật lý', dueCount: 8, overdueCount: 8, forgettingPressureBucket: 'urgent' });
    expect(alert).toMatchObject({ severity: 'urgent', recommendedAction: 'rescue_review', notificationTimingBucket: 'now' });
    expect(alert.userFacingTitle).toContain('Vật lý');
  });

  it('creates high forgetting pressure warning', () => {
    const alert = createSubjectForgettingAlert({ subjectId: 'bio', subjectLabel: 'Sinh học', dueCount: 10, overdueCount: 0, forgettingPressureBucket: 'high' });
    expect(alert).toMatchObject({ severity: 'warning', triggerReason: 'review_queue_spike' });
  });

  it('keeps quiet subjects silent', () => {
    expect(createSubjectForgettingAlert({ subjectId: 'eng', subjectLabel: 'English', dueCount: 0, overdueCount: 0, forgettingPressureBucket: 'none' })).toBeNull();
  });

  it('uses unknown subject fallback and no raw content', () => {
    const [alert] = createSubjectForgettingAlerts([{ subjectId: '', subjectLabel: '', dueCount: 1, forgettingPressureBucket: 'low' }]);
    expect(alert.subjectId).toBe('general');
    expect(JSON.stringify(alert)).not.toMatch(/prompt|question|answer|explanation/i);
  });
});
