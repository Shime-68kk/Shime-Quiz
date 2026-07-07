import { createRobotExpressionDisplayModel } from '../../shimeIntelligence/robotExpressionDisplayModel.js';

export function createFakeRobotConsoleModel(snapshot = {}) {
  const display = createRobotExpressionDisplayModel({
    expressionFamily: snapshot.currentExpressionFamily,
    displayExpression: snapshot.displayExpression,
    ledPattern: snapshot.ledPattern,
    soundCue: snapshot.soundCue,
    motionPolicy: snapshot.motionPolicy,
    safetyStatus: snapshot.safetyStatus,
    privacyStatus: snapshot.privacyStatus,
    dryRunOnly: snapshot.dryRunOnly,
    sendStatus: snapshot.sendStatus,
    reasonCodes: snapshot.reasonCodes
  });
  return {
    fakeRobotStatusLabel: 'robot giả lập / không gửi',
    currentFaceLabel: display.displayExpressionLabel,
    currentLightLabel: display.ledPatternLabel,
    currentSoundLabel: display.soundCueLabel,
    motionLockLabel: display.motionPolicyLabel,
    lastExpressionLabel: display.expressionFamilyLabel,
    dryRunLabel: display.dryRunLabel,
    transcriptRows: [...(snapshot.recentPreviewRows || [])].slice(-12),
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}
