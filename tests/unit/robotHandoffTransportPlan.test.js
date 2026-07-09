import { describe, expect, it } from 'vitest';
import {
  ROBOT_HANDOFF_TRANSPORT_IDS,
  getRobotHandoffTransportMode,
  getRobotHandoffTransportModes,
  recommendFutureRobotHandoff
} from '../../src/deviceBridge/robotHandoffTransportPlan.js';

describe('robotHandoffTransportPlan', () => {
  it('models every required transport without enabling a real transport', () => {
    const modes = getRobotHandoffTransportModes();
    expect(modes.map(mode => mode.transportId)).toEqual([
      'manual_export',
      'usb_dev_only',
      'ble_candidate',
      'wifi_lan_candidate',
      'qr_pairing_candidate',
      'native_wrapper_required'
    ]);
    expect(modes.every(mode => mode.dataAllowed === 'safe_capsule_only')).toBe(true);
    expect(modes.every(mode => mode.notesCodes.includes('NOT_ENABLED') || mode.transportId === 'manual_export' || mode.transportId === 'usb_dev_only')).toBe(true);
  });

  it('keeps manual export available now and USB lab-only', () => {
    expect(getRobotHandoffTransportMode(ROBOT_HANDOFF_TRANSPORT_IDS.MANUAL_EXPORT)).toMatchObject({
      implementationStage: 'available_now',
      requiresCable: false,
      supportsPhoneUse: true
    });
    expect(getRobotHandoffTransportMode(ROBOT_HANDOFF_TRANSPORT_IDS.USB_DEV_ONLY)).toMatchObject({
      implementationStage: 'lab_only',
      requiresCable: true,
      userExperienceFit: 'poor'
    });
  });

  it('forbids raw quiz payloads in every mode', () => {
    for (const mode of getRobotHandoffTransportModes()) {
      expect(mode.forbiddenPayloads).toEqual(expect.arrayContaining([
        'question',
        'answer',
        'correctAnswer',
        'explanation',
        'rawQuizPayload',
        'importedDocumentText'
      ]));
    }
  });

  it('recommends manual export for current web and wireless candidates for native future', () => {
    expect(recommendFutureRobotHandoff({ platform: 'pwa_web', userGoal: 'normal_user' })).toMatchObject({
      recommendedTransportId: 'manual_export',
      realTransportEnabled: false
    });
    expect(recommendFutureRobotHandoff({ platform: 'native_mobile_wrapper', userGoal: 'normal_user' })).toMatchObject({
      recommendedTransportId: 'native_wrapper_required',
      realTransportEnabled: false
    });
    expect(recommendFutureRobotHandoff({ platform: 'desktop', userGoal: 'developer_debug' })).toMatchObject({
      recommendedTransportId: 'usb_dev_only',
      realTransportEnabled: false
    });
  });
});
