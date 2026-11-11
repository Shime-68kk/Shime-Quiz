import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchedulerAdapter } from '../src/scheduler/schedulerAdapterContract.js';
import {
  getDefaultScheduler,
  listSchedulers,
  resetSchedulerRegistryForTest,
  unregisterScheduler
} from '../src/scheduler/schedulerRegistry.js';
import { scheduleRecordWithKernel } from '../src/scheduler/schedulerKernel.js';
import { sm2SchedulerAdapter } from '../src/scheduler/sm2SchedulerAdapter.js';
import { fsrsBetaSchedulerAdapter } from '../src/scheduler/fsrsBetaSchedulerAdapter.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fail(message) {
  throw new Error(`Scheduler Kernel v2 validation failed: ${message}`);
}

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) fail(message);
}

resetSchedulerRegistryForTest();

assert(getDefaultScheduler()?.schedulerId === 'sm2', 'SM-2 must remain the default scheduler');
assert(unregisterScheduler('sm2') === false, 'SM-2 must not be removable');
assert(validateSchedulerAdapter(sm2SchedulerAdapter).ok === true, 'SM-2 adapter contract failed');
assert(validateSchedulerAdapter(fsrsBetaSchedulerAdapter).ok === true, 'FSRS beta adapter contract failed');
assert(listSchedulers().some(item => item.schedulerId === 'fsrs-beta' && item.stabilityLevel === 'beta'), 'FSRS must remain beta');

const scheduled = scheduleRecordWithKernel({
  record: {
    itemId: 'validator-card',
    lastReviewedAt: '2026-01-01T00:00:00.000Z',
    dueAt: '2026-01-01T00:00:00.000Z',
    intervalDays: 0,
    repetitionCount: 0,
    easeFactor: 2.2,
    correctStreak: 0,
    wrongCount: 0
  },
  outcome: 'correct',
  schedulerId: 'sm2',
  context: { now: '2026-01-02T00:00:00.000Z' }
});
assert(scheduled.schedulerId === 'sm2', 'stable scheduling did not return SM-2');
assert(scheduled.schedulerStateSchemaVersion === 1, 'generic scheduler state envelope missing');
assert(Number.isFinite(new Date(scheduled.dueAt).getTime()), 'kernel returned an invalid due date');

const dueSelector = read('src/study/dueReviewSelector.js');
assert(!dueSelector.includes("../quiz/fsrsWrapper.js"), 'due selector imports FSRS directly');
assert(dueSelector.includes('getSchedulerRetrievability'), 'due selector does not use scheduler capabilities');

const storage = read('src/state/reviewScheduleStorage.js');
assert(!storage.includes('function updateRecordFromResult'), 'storage contains a duplicate SM-2 implementation');
assert(storage.includes('schedulerStateSchemaVersion'), 'storage does not preserve generic scheduler state');
assert(storage.includes('fallbackSnapshot'), 'storage does not preserve the stable fallback snapshot');

const compatibilityFacade = read('src/quiz/reviewSchedulerAdapter.js');
assert(compatibilityFacade.includes('scheduleRecordWithKernel'), 'production compatibility facade bypasses the kernel');

console.log('Scheduler Kernel v2 validation passed.');
