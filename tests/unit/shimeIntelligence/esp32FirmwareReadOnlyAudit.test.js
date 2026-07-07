import { describe, expect, it } from 'vitest';
import { createEsp32FirmwareReadOnlyAudit } from '../../../src/shimeIntelligence/esp32FirmwareReadOnlyAudit.js';

describe('esp32FirmwareReadOnlyAudit', () => {
  it('handles missing files safely', () => {
    const audit = createEsp32FirmwareReadOnlyAudit({});
    expect(audit.auditStatus).toBe('WARN');
    expect(audit.firmwareFilesFound).toEqual([]);
  });

  it('reports current firmware capabilities from file text', () => {
    const audit = createEsp32FirmwareReadOnlyAudit({
      'firmware/esp32-shime-robot/platformio.ini': 'framework = arduino',
      'firmware/esp32-shime-robot/src/main.cpp': 'processSerialLine MAX_SERIAL_LINE_LENGTH = 2048',
      'firmware/esp32-shime-robot/include/ShimeProtocol.h': 'header',
      'firmware/esp32-shime-robot/src/ShimeProtocol.cpp': 'shime-ws-robot-v0 robot_event robot_command containsJsonPropertyName',
      'firmware/esp32-shime-robot/include/ShimeRobotActions.h': 'actions',
      'firmware/esp32-shime-robot/src/ShimeRobotActions.cpp': 'action stub',
      'firmware/esp32-shime-robot/protocol.md': 'notes'
    });
    expect(audit.auditStatus).toBe('PASS');
    expect(audit.currentCapabilities.serialLineParser).toBe(true);
    expect(audit.currentCapabilities.actionStubsOnly).toBe(true);
  });
});

