import assert from 'node:assert/strict';
import fs from 'node:fs';

const listeners = new Map();
const storageData = new Map();

const localStorageMock = {
  getItem(key) {
    return storageData.has(String(key)) ? storageData.get(String(key)) : null;
  },
  setItem(key, value) {
    storageData.set(String(key), String(value));
  },
  removeItem(key) {
    storageData.delete(String(key));
  },
  clear() {
    storageData.clear();
  }
};

globalThis.CustomEvent = class CustomEvent extends Event {
  constructor(type, init = {}) {
    super(type);
    this.detail = init.detail;
  }
};

globalThis.window = {
  localStorage: localStorageMock,
  addEventListener(type, listener) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(listener);
  },
  removeEventListener(type, listener) {
    listeners.get(type)?.delete(listener);
  },
  dispatchEvent(event) {
    listeners.get(event.type)?.forEach(listener => listener(event));
    return true;
  }
};

const dashboardSource = fs.readFileSync('src/components/learning/TodayJourneyCard.jsx', 'utf8');
assert.ok(dashboardSource.includes('Kế hoạch hôm nay'), 'Dashboard plan UI should still exist');
assert.ok(dashboardSource.includes('Bước này đã hoàn thành và sẽ không tự bỏ đánh dấu khi bấm lại.'), 'completed plan no-op feedback should be Vietnamese');
assert.ok(dashboardSource.includes("isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'"), 'completed button label should not offer unmark');
assert.equal(dashboardSource.includes('unmarkStudyPlanStepComplete'), false, 'Dashboard today-plan click path must not unmark completed steps');
assert.equal(dashboardSource.includes('Đã bỏ đánh dấu bước này.'), false, 'Dashboard should not show unmark success copy');

const {
  STUDY_PLAN_PROGRESS_STORAGE_KEY,
  markStudyPlanStepComplete,
  readStudyPlanProgress
} = await import('../src/state/studyPlanProgressStorage.js');

const dateKey = '2026-05-07';
const firstResult = markStudyPlanStepComplete('daily-step-1', dateKey);
assert.equal(firstResult.ok, true, 'incomplete item can be marked complete');
let progress = readStudyPlanProgress(dateKey);
assert.deepEqual(progress.day.completedStepIds, ['daily-step-1']);

const secondResult = markStudyPlanStepComplete('daily-step-1', dateKey);
assert.equal(secondResult.ok, true, 'repeated complete action should remain safe');
progress = readStudyPlanProgress(dateKey);
assert.deepEqual(progress.day.completedStepIds, ['daily-step-1'], 'repeated complete action must not unmark or duplicate the completed item');

const thirdResult = markStudyPlanStepComplete('daily-step-2', dateKey);
assert.equal(thirdResult.ok, true, 'other plan items can still be completed');
progress = readStudyPlanProgress(dateKey);
assert.deepEqual(progress.day.completedStepIds.sort(), ['daily-step-1', 'daily-step-2']);

const stored = JSON.parse(localStorageMock.getItem(STUDY_PLAN_PROGRESS_STORAGE_KEY));
assert.equal(stored.schemaVersion, 'v2-study-plan-progress-v1', 'study plan progress schema version should remain unchanged');
assert.equal(Array.isArray(stored.days), true, 'study plan progress storage shape should remain day-based');
assert.equal(stored.days[0].dateKey, dateKey);

const workflow = fs.readFileSync('.github/workflows/e2e-smoke.yml', 'utf8');
assert.ok(workflow.includes('node scripts/validate-dashboard-plan-completion-guard.js'), 'CI should run the dashboard plan completion guard validator');
assert.ok(workflow.includes('node scripts/validate-ai-draft-evaluation-fixtures.js'), 'existing AI draft evaluation validator should remain in CI');

console.log('dashboard plan completion guard validator passed');
