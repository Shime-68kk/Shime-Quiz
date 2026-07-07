import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CompanionDevPanel from '../../src/components/settings/CompanionDevPanel.jsx';
import {
  disableSharedCompanionLiveDevTap,
  enableSharedCompanionLiveDevTap,
  getSharedCompanionLiveDevTapSnapshot,
  resetSharedCompanionLiveDevTapForTests,
  subscribeSharedCompanionLiveDevTap,
  createCompanionDevTapRuntime
} from '../../src/companion/companionDevTapRuntime.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const panelSource = fs.readFileSync(resolve(PROJECT_ROOT, 'src/components/settings/CompanionDevPanel.jsx'), 'utf8');

function createFakeFacade() {
  const listeners = new Set();
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emitEvent(event) {
      listeners.forEach(listener => listener({ type: 'facade_event_sent', event }));
    },
    listenerCount() {
      return listeners.size;
    }
  };
}

describe('live DeviceBridge companion tap panel', () => {
  it('renders live observe warning and starts disabled', () => {
    const html = renderToStaticMarkup(<CompanionDevPanel />);

    expect(html).toContain('Theo dõi Device Bridge thật — chỉ quan sát');
    expect(html).toContain('Theo dõi dữ liệu đã làm mờ/rút gọn');
    expect(html).toContain('Không can thiệp vào phòng học');
    expect(html).toContain('không gửi lệnh ra robot thật');
    expect(html).toContain('Đang tắt theo dõi');
    expect(html).toContain('Chưa đăng ký nhận');
  });

  it('enabling fake panel does not enable live tap by construction', () => {
    expect(panelSource).toContain('const handleEnable = () =>');
    expect(panelSource).toContain('const handleEnableLiveTap = () =>');
    const fakeEnableBlock = panelSource.slice(
      panelSource.indexOf('const handleEnable = () =>'),
      panelSource.indexOf('const handleDisable = () =>')
    );

    expect(fakeEnableBlock).not.toContain('createCompanionDevTapRuntime');
    expect(fakeEnableBlock).not.toContain('getSharedDeviceBridgeFacade');
  });

  it('live tap subscribes only after explicit runtime enable', () => {
    const facade = createFakeFacade();
    const runtime = createCompanionDevTapRuntime({ facade });

    expect(facade.listenerCount()).toBe(0);
    expect(runtime.getSnapshot()).toMatchObject({ runtimeEnabled: false, subscribed: false });
    runtime.enable();
    expect(facade.listenerCount()).toBe(1);
    expect(runtime.getSnapshot()).toMatchObject({ runtimeEnabled: true, subscribed: true });
  });

  it('live tap unsubscribes on disable', () => {
    const facade = createFakeFacade();
    const runtime = createCompanionDevTapRuntime({ facade });

    runtime.enable();
    runtime.disable();
    expect(facade.listenerCount()).toBe(0);
    expect(runtime.getSnapshot()).toMatchObject({ runtimeEnabled: false, subscribed: false });
  });

  it('panel unmount unsubscribes UI listener without disabling live runtime', () => {
    expect(panelSource).toContain('return subscribeSharedCompanionLiveDevTap');
    expect(panelSource).not.toContain('liveRuntimeRef.current.disable();');
  });

  it('safe fake DeviceBridge event appears in runtime transcript', () => {
    const facade = createFakeFacade();
    const runtime = createCompanionDevTapRuntime({ facade });

    runtime.enable();
    facade.emitEvent({
      eventType: 'session_started',
      sessionId: 'live_test',
      payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' }
    });

    expect(runtime.getSnapshot()).toMatchObject({
      observedEventCount: 1,
      acceptedEventCount: 1,
      lastInputEventType: 'session_started'
    });
    expect(runtime.getTranscript()[0]).toMatchObject({
      inputEventType: 'session_started',
      accepted: true,
      privacyStatus: 'redacted_coarse_only'
    });
  });

  it('does not expose raw payloads or robot send controls', () => {
    const html = renderToStaticMarkup(<CompanionDevPanel />);

    expect(html).not.toContain('payload');
    expect(html).not.toContain('Send robot');
    expect(panelSource).not.toContain('sendRobotCommand');
    expect(panelSource).not.toContain('emitStudyEvent');
  });

  it('route navigation survival keeps live runtime observing while panel is unmounted', () => {
    resetSharedCompanionLiveDevTapForTests();
    const facade = createFakeFacade();
    const unmountSettings = subscribeSharedCompanionLiveDevTap(() => {});
    enableSharedCompanionLiveDevTap({ facade });
    unmountSettings();

    facade.emitEvent({
      eventType: 'session_started',
      sessionId: 'route_survival',
      payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' }
    });

    const remounted = getSharedCompanionLiveDevTapSnapshot();
    expect(remounted.snapshot).toMatchObject({ runtimeEnabled: true, observedEventCount: 1 });
    expect(remounted.transcript[0]).toMatchObject({ inputEventType: 'session_started', privacyStatus: 'redacted_coarse_only' });
    resetSharedCompanionLiveDevTapForTests();
  });

  it('StudyRoom completion route simulation records events while panel is unmounted', () => {
    resetSharedCompanionLiveDevTapForTests();
    const facade = createFakeFacade();
    enableSharedCompanionLiveDevTap({ facade });

    facade.emitEvent({ eventType: 'session_started', sessionId: 'completion_flow', payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' } });
    facade.emitEvent({ eventType: 'question_presented', sessionId: 'completion_flow', payload: { itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: 3 } });
    facade.emitEvent({ eventType: 'session_complete', sessionId: 'completion_flow', payload: { progressCount: 3, totalCount: 3, accuracyBucket: 'high' } });

    const remounted = getSharedCompanionLiveDevTapSnapshot();
    expect(remounted.snapshot).toMatchObject({ runtimeEnabled: true, observedEventCount: 3, acceptedEventCount: 3 });
    expect(remounted.transcript.map(entry => entry.inputEventType)).toEqual(['session_started', 'question_presented', 'session_complete']);
    resetSharedCompanionLiveDevTapForTests();
  });

  it('explicit disable stops observation', () => {
    resetSharedCompanionLiveDevTapForTests();
    const facade = createFakeFacade();
    enableSharedCompanionLiveDevTap({ facade });
    disableSharedCompanionLiveDevTap();

    facade.emitEvent({
      eventType: 'session_started',
      sessionId: 'disabled_flow',
      payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' }
    });

    const current = getSharedCompanionLiveDevTapSnapshot();
    expect(current.snapshot).toMatchObject({ runtimeEnabled: false, observedEventCount: 0 });
    expect(current.transcript).toHaveLength(0);
    resetSharedCompanionLiveDevTapForTests();
  });

  it('reset helper simulates refresh with disabled empty live tap', () => {
    resetSharedCompanionLiveDevTapForTests();
    expect(getSharedCompanionLiveDevTapSnapshot()).toEqual({ snapshot: null, transcript: [] });
  });
});
