export function createEsp32ExpressionRollbackPlan() {
  return {
    rollbackPlanVersion: 'shime-esp32-expression-rollback-plan-v1',
    steps: [
      'Keep firmware changes isolated to protocol parser files.',
      'Restore previous firmware files if parser safety fails.',
      'Keep PlatformIO build baseline before and after parser patch.',
      'Disable parser path if unsafe input handling appears.',
      'Run serial test vectors before and after rollback.',
      'Do not add app runtime dependency.',
      'Do not add motion dependency.',
      'Do not add radio dependency.',
      'Do not store secret material.'
    ],
    restorePaths: [
      'firmware/esp32-shime-robot/include/ShimeProtocol.h',
      'firmware/esp32-shime-robot/src/ShimeProtocol.cpp',
      'firmware/esp32-shime-robot/src/main.cpp',
      'firmware/esp32-shime-robot/protocol.md'
    ],
    dryRunOnly: true,
    sendStatus: 'not_sent',
    motionPolicy: 'locked',
    reasonCodes: ['esp32_expression_rollback_plan_created']
  };
}

