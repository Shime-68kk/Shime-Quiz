import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getDefaultScheduler, resolveUserSchedulerPreference } from '../../src/scheduler/schedulerRegistry.js';
import { evaluateFsrsReadinessGate, createPassingFsrsBetaEvidence } from '../../src/scheduler/fsrsReadinessGate.js';
import { createSubjectRobotSafeSummary, assertSubjectRobotSafeSummary } from '../../src/studyRoom/subjectRobotSafeSummary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('BIG-UPDATE-9 architecture boundary rules', () => {
  it('keeps SM2 as the default scheduler', () => {
    expect(getDefaultScheduler()?.schedulerId).toBe('sm2');
    expect(resolveUserSchedulerPreference({}).activeSchedulerId).toBe('sm2');
  });

  it('keeps FSRS beta opt-in and blocked from becoming default', () => {
    const gate = evaluateFsrsReadinessGate(createPassingFsrsBetaEvidence());
    expect(gate.fsrsCanBeDefault).toBe(false);
    expect(gate.fsrsCanBeBetaOptIn).toBe(true);
    expect(resolveUserSchedulerPreference({ schedulerPreference: 'fsrs-beta' }).activeSchedulerId).toBe('sm2');
    expect(resolveUserSchedulerPreference({ schedulerPreference: 'fsrs-beta', fsrsBetaOptIn: true }).activeSchedulerId).toBe('fsrs-beta');
  });

  it('keeps subject robot-safe summaries coarse and raw-content-free', () => {
    const summary = createSubjectRobotSafeSummary({
      activeSubjectId: 'math',
      subjectSpaces: [{ subjectId: 'math', forgettingPressureBucket: 'high' }]
    });
    expect(assertSubjectRobotSafeSummary(summary)).toBe(true);
    expect(summary).toMatchObject({
      rawContentIncluded: false,
      privacyClass: 'subject_state_coarse_only'
    });
    expect(JSON.stringify(summary)).not.toMatch(/question|answer|prompt|explanation|rawQuizPayload/i);
  });

  it('does not add network or hardware APIs to app-facing architecture surfaces', () => {
    const files = [
      'src/routes/StudyRoom.jsx',
      'src/components/study/StudyRoomSubjectSpaces.jsx',
      'src/studyRoom/mobileGestureIntentModel.js',
      'src/studyRoom/studyRoomSwipeGesture.js',
      'src/studyRoom/studySubjectSpaceModel.js',
      'src/studyRoom/subjectRobotSafeSummary.js',
      'src/scheduler/schedulerRegistry.js',
      'src/scheduler/sm2SchedulerAdapter.js',
      'src/scheduler/fsrsBetaSchedulerAdapter.js',
      'src/scheduler/fsrsReadinessGate.js'
    ];
    const forbidden = /fetch\s*\(|XMLHttpRequest|WebSocket|navigator\.serial|navigator\.bluetooth|getUserMedia|MediaRecorder|Notification\.requestPermission|serviceWorker\.register/;
    for (const file of files) {
      expect(read(file), file).not.toMatch(forbidden);
    }
  });
});
