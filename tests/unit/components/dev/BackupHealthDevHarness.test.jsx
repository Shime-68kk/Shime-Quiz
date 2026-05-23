/**
 * Phase 26D — BackupHealthDevHarness Unit Tests
 *
 * PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_STATUS: IMPLEMENTED_HIDDEN_DEFAULT_OFF_PROTOTYPE_PENDING_TESTER
 * PHASE26D_UI_WIRING_SCOPE: HIDDEN_DEFAULT_OFF_DEV_TEST_HARNESS_NO_PRODUCTION_NAV_NO_WRITES
 * PHASE26D_MANUAL_BROWSER_TESTER_STATUS: REQUIRED_BEFORE_BROWSER_BEHAVIOR_CLAIM
 * PHASE26D_UI_WIRING_DECISION: HOLD_FOR_STRICT_REVIEW_AND_TESTER_BEFORE_MERGE
 * PHASE26D_TESTER_RUN_PACK_STATUS: PREPARED_FOR_EXTERNAL_TESTER
 *
 * Test-only. Uses generated/fixture data only. No real learner data.
 * No browser APIs, no localStorage, no IndexedDB, no network.
 * DOM/component rendering is not available (no jsdom vitest environment).
 * Tests cover static source analysis and exported pure functions.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  isHarnessEnabled,
  BACKUP_HEALTH_STATE,
  PHASE26D_HARNESS_DISABLED_SENTINEL,
} from '../../../../src/components/dev/BackupHealthDevHarness.jsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const HARNESS_PATH = path.join(PROJECT_ROOT, 'src/components/dev/BackupHealthDevHarness.jsx');

const harnessSource = fs.readFileSync(HARNESS_PATH, 'utf8');

// ── 1. Default-off gate behavior ─────────────────────────────────────────────

describe('BackupHealthDevHarness — isHarnessEnabled default-off gate', () => {
  it('disabled by default with undefined props', () => {
    expect(isHarnessEnabled(undefined)).toBe(false);
  });

  it('disabled by default with null props', () => {
    expect(isHarnessEnabled(null)).toBe(false);
  });

  it('disabled with empty props object', () => {
    expect(isHarnessEnabled({})).toBe(false);
  });

  it('disabled with enabled false', () => {
    expect(isHarnessEnabled({ enabled: false })).toBe(false);
  });

  it('disabled with enabled true but no mode', () => {
    expect(isHarnessEnabled({ enabled: true })).toBe(false);
  });

  it('disabled with enabled true and empty string mode', () => {
    expect(isHarnessEnabled({ enabled: true, mode: '' })).toBe(false);
  });

  it('enabled only with explicit test mode', () => {
    expect(isHarnessEnabled({ enabled: true, mode: 'test' })).toBe(true);
  });

  it('enabled only with explicit default-off mode', () => {
    expect(isHarnessEnabled({ enabled: true, mode: 'default-off' })).toBe(true);
  });
});

// ── 2. Rejects production/live modes ─────────────────────────────────────────

describe('BackupHealthDevHarness — isHarnessEnabled rejects production/live modes', () => {
  it('rejects production mode', () => {
    expect(isHarnessEnabled({ enabled: true, mode: 'production' })).toBe(false);
  });

  it('rejects live mode', () => {
    expect(isHarnessEnabled({ enabled: true, mode: 'live' })).toBe(false);
  });

  it('rejects staging mode', () => {
    expect(isHarnessEnabled({ enabled: true, mode: 'staging' })).toBe(false);
  });

  it('rejects beta mode', () => {
    expect(isHarnessEnabled({ enabled: true, mode: 'beta' })).toBe(false);
  });
});

// ── 3. Does not mutate inputs ─────────────────────────────────────────────────

describe('BackupHealthDevHarness — does not mutate inputs', () => {
  it('does not mutate props object in isHarnessEnabled', () => {
    const props = Object.freeze({ enabled: true, mode: 'test' });
    expect(() => isHarnessEnabled(props)).not.toThrow();
    expect(props.enabled).toBe(true);
    expect(props.mode).toBe('test');
  });

  it('does not mutate disabled props object', () => {
    const props = Object.freeze({ enabled: false, mode: 'production' });
    expect(() => isHarnessEnabled(props)).not.toThrow();
    expect(props.enabled).toBe(false);
  });
});

// ── 4. Exported constants ─────────────────────────────────────────────────────

describe('BackupHealthDevHarness — exported constants', () => {
  it('exports PHASE26D_HARNESS_DISABLED_SENTINEL as a non-empty string', () => {
    expect(typeof PHASE26D_HARNESS_DISABLED_SENTINEL).toBe('string');
    expect(PHASE26D_HARNESS_DISABLED_SENTINEL.length).toBeGreaterThan(0);
  });

  it('exports BACKUP_HEALTH_STATE from Phase 25M', () => {
    expect(BACKUP_HEALTH_STATE).toBeDefined();
    expect(typeof BACKUP_HEALTH_STATE).toBe('object');
    expect(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP).toBeDefined();
    expect(BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE).toBeDefined();
    expect(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE).toBeDefined();
    expect(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED).toBeDefined();
    expect(BACKUP_HEALTH_STATE.UNKNOWN).toBeDefined();
  });
});

// ── 5. Source: imports Phase 25M view-model only from allowed path ────────────

describe('BackupHealthDevHarness source — Phase 25M import boundary', () => {
  it('imports from backupHealthUiPrototype.js (allowed path)', () => {
    expect(harnessSource).toContain(`from '../../state/backupHealthUiPrototype.js'`);
  });

  it('imports createBackupHealthUiModel from allowed path', () => {
    expect(harnessSource).toContain('createBackupHealthUiModel');
  });

  it('imports BACKUP_HEALTH_STATE from allowed path', () => {
    expect(harnessSource).toContain('BACKUP_HEALTH_STATE');
  });

  it('does not import from backupHealthIntegrationPrototype directly', () => {
    expect(harnessSource).not.toContain(`from '../../state/backupHealthIntegrationPrototype`);
    expect(harnessSource).not.toContain(`from '../state/backupHealthIntegrationPrototype`);
  });

  it('does not import from backupHealthSignal directly', () => {
    expect(harnessSource).not.toContain('backupHealthSignal');
  });
});

// ── 6. Source: no write/network/telemetry APIs ────────────────────────────────

describe('BackupHealthDevHarness source — no write/network/telemetry APIs', () => {
  it('does not call localStorage', () => {
    expect(harnessSource).not.toContain('localStorage');
  });

  it('does not call indexedDB', () => {
    expect(harnessSource).not.toContain('indexedDB');
    expect(harnessSource).not.toContain('IndexedDB');
  });

  it('does not call fetch(', () => {
    expect(harnessSource).not.toContain('fetch(');
  });

  it('does not call XMLHttpRequest', () => {
    expect(harnessSource).not.toContain('XMLHttpRequest');
  });

  it('does not call navigator.sendBeacon', () => {
    expect(harnessSource).not.toContain('navigator.sendBeacon');
  });

  it('does not call analytics(', () => {
    expect(harnessSource).not.toContain('analytics(');
  });

  it('does not call gtag(', () => {
    expect(harnessSource).not.toContain('gtag(');
  });

  it('does not call Date.now() directly', () => {
    expect(harnessSource).not.toContain('Date.now()');
  });

  it('does not import fs or file APIs', () => {
    expect(harnessSource).not.toContain(`from 'fs'`);
    expect(harnessSource).not.toContain(`from 'node:fs'`);
    expect(harnessSource).not.toContain('readFileSync');
  });
});

// ── 7. Source: no navigation links/hrefs/route registration ──────────────────

describe('BackupHealthDevHarness source — no navigation links/hrefs/route registration', () => {
  it('does not contain href attribute in JSX', () => {
    const hrefMatch = harnessSource.match(/href\s*=/g);
    expect(hrefMatch).toBeNull();
  });

  it('does not contain a route registration (path: )', () => {
    expect(harnessSource).not.toMatch(/path:\s*['"`]\/[^'"`]+['"`]/);
  });

  it('does not reference showInNav', () => {
    expect(harnessSource).not.toContain('showInNav');
  });

  it('does not reference navRoutes', () => {
    expect(harnessSource).not.toContain('navRoutes');
  });

  it('does not reference routeConfig', () => {
    expect(harnessSource).not.toContain('routeConfig');
  });

  it('does not import Link or NavLink from react-router', () => {
    expect(harnessSource).not.toContain(`from 'react-router`);
  });
});

// ── 8. Source: does not expose settings/library/dashboard broad rollout ───────

describe('BackupHealthDevHarness source — no settings/library/dashboard broad rollout', () => {
  it('does not import Settings', () => {
    expect(harnessSource).not.toContain(`from '../../routes/Settings`);
    expect(harnessSource).not.toContain(`from '../routes/Settings`);
  });

  it('does not import Library', () => {
    expect(harnessSource).not.toContain(`from '../../routes/Library`);
  });

  it('does not import Dashboard', () => {
    expect(harnessSource).not.toContain(`from '../../routes/Dashboard`);
  });

  it('does not reference dashboard card pattern', () => {
    expect(harnessSource).not.toContain('DashboardCard');
    expect(harnessSource).not.toContain('dashboardCard');
  });

  it('does not reference settings card pattern', () => {
    expect(harnessSource).not.toContain('SettingsCard');
    expect(harnessSource).not.toContain('settingsCard');
  });

  it('does not reference library card pattern', () => {
    expect(harnessSource).not.toContain('LibraryCard');
    expect(harnessSource).not.toContain('libraryCard');
  });
});

// ── 9. Source: does not contain forbidden guarantee/automatic/cloud language ──

describe('BackupHealthDevHarness source — no forbidden claim language', () => {
  it('does not claim BETA_READY', () => {
    expect(harnessSource).not.toContain('BETA_READY');
  });

  it('does not claim guaranteed data-loss prevention', () => {
    expect(harnessSource).not.toContain('guaranteed data-loss prevention');
    expect(harnessSource).not.toContain('guarantees data');
  });

  it('does not claim automatic backup', () => {
    expect(harnessSource).not.toContain('automatic backup');
    expect(harnessSource).not.toContain('tự động sao lưu');
  });

  it('does not claim cloud sync', () => {
    expect(harnessSource).not.toContain('cloud sync');
    expect(harnessSource).not.toContain('đồng bộ đám mây');
  });

  it('does not claim account recovery', () => {
    expect(harnessSource).not.toContain('account recovery');
    expect(harnessSource).not.toContain('khôi phục tài khoản');
  });

  it('does not claim platform backup preservation', () => {
    expect(harnessSource).not.toContain('platform preservation');
    expect(harnessSource).not.toContain('platform backup preservation');
  });

  it('does not claim broad backup reliability', () => {
    expect(harnessSource).not.toContain('broad backup reliability');
  });

  it('does not claim production adapter-aware backup/export/restore', () => {
    expect(harnessSource).not.toContain('production adapter-aware');
  });
});

// ── 10. Source: Vietnamese-first copy check ───────────────────────────────────

describe('BackupHealthDevHarness source — Vietnamese-first copy', () => {
  it('contains Vietnamese dev/test-only warning copy', () => {
    expect(harnessSource).toContain('Chỉ dùng cho kiểm tra');
  });

  it('contains Vietnamese backup state label', () => {
    expect(harnessSource).toContain('Bản sao lưu sức khỏe');
  });

  it('displays Trạng thái label', () => {
    expect(harnessSource).toContain('Trạng thái:');
  });

  it('contains developer-only disclaimer in Vietnamese', () => {
    expect(harnessSource).toContain('Chỉ dành cho nhà phát triển và kiểm thử viên');
  });
});

// ── 11. Source: Phase 26D tokens in source file ───────────────────────────────

describe('BackupHealthDevHarness source — required Phase 26D tokens', () => {
  it('contains PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_STATUS token', () => {
    expect(harnessSource).toContain(
      'PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_STATUS: IMPLEMENTED_HIDDEN_DEFAULT_OFF_PROTOTYPE_PENDING_TESTER'
    );
  });

  it('contains PHASE26D_UI_WIRING_SCOPE token', () => {
    expect(harnessSource).toContain(
      'PHASE26D_UI_WIRING_SCOPE: HIDDEN_DEFAULT_OFF_DEV_TEST_HARNESS_NO_PRODUCTION_NAV_NO_WRITES'
    );
  });

  it('contains PHASE26D_MANUAL_BROWSER_TESTER_STATUS token', () => {
    expect(harnessSource).toContain(
      'PHASE26D_MANUAL_BROWSER_TESTER_STATUS: REQUIRED_BEFORE_BROWSER_BEHAVIOR_CLAIM'
    );
  });

  it('contains PHASE26D_UI_WIRING_DECISION token', () => {
    expect(harnessSource).toContain(
      'PHASE26D_UI_WIRING_DECISION: HOLD_FOR_STRICT_REVIEW_AND_TESTER_BEFORE_MERGE'
    );
  });

  it('contains PHASE26D_TESTER_RUN_PACK_STATUS token', () => {
    expect(harnessSource).toContain(
      'PHASE26D_TESTER_RUN_PACK_STATUS: PREPARED_FOR_EXTERNAL_TESTER'
    );
  });
});

// ── 12. Source: maps view-model states correctly ──────────────────────────────

describe('BackupHealthDevHarness source — view-model state mapping', () => {
  it('uses model.stateId for state display', () => {
    expect(harnessSource).toContain('model.stateId');
  });

  it('uses model.titleVi for Vietnamese title', () => {
    expect(harnessSource).toContain('model.titleVi');
  });

  it('uses model.bodyVi for Vietnamese body', () => {
    expect(harnessSource).toContain('model.bodyVi');
  });

  it('uses model.tone for tone display', () => {
    expect(harnessSource).toContain('model.tone');
  });

  it('uses model.source for source attribution', () => {
    expect(harnessSource).toContain('model.source');
  });

  it('checks model.visible before rendering', () => {
    expect(harnessSource).toContain('model.visible');
  });
});

// ── 13. Source: no backup/export/restore imports ──────────────────────────────

describe('BackupHealthDevHarness source — no backup/export/restore imports', () => {
  it('does not import backup modules', () => {
    expect(harnessSource).not.toContain(`from '../../utils/backup`);
    expect(harnessSource).not.toContain(`from '../utils/backup`);
    expect(harnessSource).not.toContain('exportBackup');
    expect(harnessSource).not.toContain('importBackup');
    expect(harnessSource).not.toContain('restoreBackup');
  });

  it('does not import storage driver modules', () => {
    expect(harnessSource).not.toContain(`from '../../storage/`);
    expect(harnessSource).not.toContain(`from '../storage/`);
    expect(harnessSource).not.toContain('IndexedDBAdapter');
    expect(harnessSource).not.toContain('StorageAdapter');
  });
});

// ── 14. Source: data-testid attributes present ────────────────────────────────

describe('BackupHealthDevHarness source — data-testid attributes', () => {
  it('has data-testid for harness container', () => {
    expect(harnessSource).toContain('data-testid="backup-health-dev-harness"');
  });

  it('has data-phase attribute', () => {
    expect(harnessSource).toContain('data-phase="phase26d"');
  });

  it('has data-harness attribute', () => {
    expect(harnessSource).toContain('data-harness="backup-health"');
  });

  it('has data-disabled-sentinel attribute', () => {
    expect(harnessSource).toContain('data-disabled-sentinel={PHASE26D_HARNESS_DISABLED_SENTINEL}');
  });
});

// ── 15. Phase 26D wiring file check ──────────────────────────────────────────

describe('Phase 26D — routeConfig.js wiring check', () => {
  const routeConfigPath = path.join(PROJECT_ROOT, 'src/routes/routeConfig.js');
  const routeConfigSource = fs.readFileSync(routeConfigPath, 'utf8');

  it('routeConfig.js exists', () => {
    expect(fs.existsSync(routeConfigPath)).toBe(true);
  });

  it('routeConfig.js has /dev/backup-health-harness path', () => {
    expect(routeConfigSource).toContain('/dev/backup-health-harness');
  });

  it('backup health harness route has showInNav: false', () => {
    const routeBlock = routeConfigSource.match(
      /path:\s*['"]\/dev\/backup-health-harness['"][\s\S]*?showInNav:\s*(true|false)/
    );
    expect(routeBlock).not.toBeNull();
    expect(routeBlock[1]).toBe('false');
  });

  it('backup health harness route does not appear in navRoutes (showInNav false)', () => {
    expect(routeConfigSource).toContain('showInNav: false');
  });

  it('/dev/fsrs-ui-fixture is still present (existing harness unchanged)', () => {
    expect(routeConfigSource).toContain('/dev/fsrs-ui-fixture');
  });
});
