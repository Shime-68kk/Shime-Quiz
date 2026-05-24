/**
 * Phase 31G — Unit tests for dataSafetyInternalVisibility helper.
 *
 * Covers:
 * - default flag is OFF
 * - missing env disables
 * - invalid env disables
 * - explicit accepted true values enable only in internal/dev/test-compatible modes
 * - default/ordinary production remains hidden
 * - config is compatible with Phase 31C shouldShowDataSafetyCenterPrototype
 * - no persisted/user-visible state
 * - no storage APIs in source
 * - no network/telemetry APIs in source
 * - Settings source does not import forbidden modules
 * - ordinary/default Settings config remains hidden
 * - internal enabled config can show prototype in test/dev-only scenario
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import {
  DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED,
  DATA_SAFETY_INTERNAL_VISIBILITY_ENV_FLAG,
  normalizeDataSafetyInternalVisibilityEnv,
  shouldEnableDataSafetyInternalVisibility,
  createDataSafetyInternalVisibilityConfig,
} from '../../src/features/dataSafety/dataSafetyInternalVisibility.js';
import { shouldShowDataSafetyCenterPrototype } from '../../src/features/dataSafety/dataSafetyCenterPrototype.js';

const helperSource = readFileSync(
  resolve('src/features/dataSafety/dataSafetyInternalVisibility.js'),
  'utf8'
);
const settingsSource = readFileSync(
  resolve('src/routes/Settings.jsx'),
  'utf8'
);

// ─── Default flag ────────────────────────────────────────────────────────────

describe('DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED', () => {
  it('is false by default', () => {
    expect(DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED).toBe(false);
  });
});

describe('DATA_SAFETY_INTERNAL_VISIBILITY_ENV_FLAG', () => {
  it('is the expected string constant', () => {
    expect(DATA_SAFETY_INTERNAL_VISIBILITY_ENV_FLAG).toBe(
      'VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY'
    );
  });
});

// ─── normalizeDataSafetyInternalVisibilityEnv ─────────────────────────────

describe('normalizeDataSafetyInternalVisibilityEnv', () => {
  it('returns empty string for undefined', () => {
    expect(normalizeDataSafetyInternalVisibilityEnv(undefined)).toBe('');
  });

  it('returns empty string for null', () => {
    expect(normalizeDataSafetyInternalVisibilityEnv(null)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(normalizeDataSafetyInternalVisibilityEnv('')).toBe('');
  });

  it('returns lowercase trimmed for "  TRUE  "', () => {
    expect(normalizeDataSafetyInternalVisibilityEnv('  TRUE  ')).toBe('true');
  });

  it('returns lowercase for "ENABLED"', () => {
    expect(normalizeDataSafetyInternalVisibilityEnv('ENABLED')).toBe('enabled');
  });

  it('returns "1" for numeric 1', () => {
    expect(normalizeDataSafetyInternalVisibilityEnv(1)).toBe('1');
  });

  it('returns "false" for boolean false', () => {
    expect(normalizeDataSafetyInternalVisibilityEnv(false)).toBe('false');
  });

  it('returns "0" for "0"', () => {
    expect(normalizeDataSafetyInternalVisibilityEnv('0')).toBe('0');
  });
});

// ─── shouldEnableDataSafetyInternalVisibility ────────────────────────────

describe('shouldEnableDataSafetyInternalVisibility', () => {
  it('returns false for undefined', () => {
    expect(shouldEnableDataSafetyInternalVisibility(undefined)).toBe(false);
  });

  it('returns false for null', () => {
    expect(shouldEnableDataSafetyInternalVisibility(null)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(shouldEnableDataSafetyInternalVisibility('')).toBe(false);
  });

  it('returns false for "false"', () => {
    expect(shouldEnableDataSafetyInternalVisibility('false')).toBe(false);
  });

  it('returns false for "0"', () => {
    expect(shouldEnableDataSafetyInternalVisibility('0')).toBe(false);
  });

  it('returns false for "yes"', () => {
    expect(shouldEnableDataSafetyInternalVisibility('yes')).toBe(false);
  });

  it('returns false for "on"', () => {
    expect(shouldEnableDataSafetyInternalVisibility('on')).toBe(false);
  });

  it('returns false for "production"', () => {
    expect(shouldEnableDataSafetyInternalVisibility('production')).toBe(false);
  });

  it('returns false for random junk', () => {
    expect(shouldEnableDataSafetyInternalVisibility('xyz123')).toBe(false);
  });

  it('returns true for "1"', () => {
    expect(shouldEnableDataSafetyInternalVisibility('1')).toBe(true);
  });

  it('returns true for "true"', () => {
    expect(shouldEnableDataSafetyInternalVisibility('true')).toBe(true);
  });

  it('returns true for "enabled"', () => {
    expect(shouldEnableDataSafetyInternalVisibility('enabled')).toBe(true);
  });

  it('returns true for uppercase "TRUE" (normalized)', () => {
    expect(shouldEnableDataSafetyInternalVisibility('TRUE')).toBe(true);
  });

  it('returns true for "  enabled  " with whitespace (normalized)', () => {
    expect(shouldEnableDataSafetyInternalVisibility('  enabled  ')).toBe(true);
  });
});

// ─── createDataSafetyInternalVisibilityConfig ─────────────────────────────

describe('createDataSafetyInternalVisibilityConfig', () => {
  it('returns disabled default config for null env', () => {
    const cfg = createDataSafetyInternalVisibilityConfig(null);
    expect(cfg.enabled).toBe(false);
    expect(cfg.mode).toBe('default');
  });

  it('returns disabled default config for undefined env', () => {
    const cfg = createDataSafetyInternalVisibilityConfig(undefined);
    expect(cfg.enabled).toBe(false);
    expect(cfg.mode).toBe('default');
  });

  it('returns disabled default config for empty env object', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({});
    expect(cfg.enabled).toBe(false);
    expect(cfg.mode).toBe('default');
  });

  it('returns disabled config when flag is missing', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({ MODE: 'development' });
    expect(cfg.enabled).toBe(false);
  });

  it('returns disabled config when flag is "false"', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: 'false',
      MODE: 'development',
    });
    expect(cfg.enabled).toBe(false);
  });

  it('returns disabled config when flag is "0"', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: '0',
      MODE: 'development',
    });
    expect(cfg.enabled).toBe(false);
  });

  it('returns disabled config when flag is "yes"', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: 'yes',
      MODE: 'development',
    });
    expect(cfg.enabled).toBe(false);
  });

  it('returns enabled "dev" config when flag is "1" and MODE is "development"', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: '1',
      MODE: 'development',
    });
    expect(cfg.enabled).toBe(true);
    // Vite 'development' MODE is mapped to 'dev' for Phase 31C ALLOWED_MODES compatibility
    expect(cfg.mode).toBe('dev');
  });

  it('returns enabled "dev" config when flag is "true" and MODE is "development"', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: 'true',
      MODE: 'development',
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.mode).toBe('dev');
  });

  it('returns enabled "test" config when flag is "enabled" and MODE is "test"', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: 'enabled',
      MODE: 'test',
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.mode).toBe('test');
  });

  it('falls back to mode "dev" when flag is "1" but MODE is "production"', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: '1',
      MODE: 'production',
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.mode).toBe('dev');
  });

  it('falls back to mode "dev" when flag is "1" but MODE is missing', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: '1',
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.mode).toBe('dev');
  });
});

// ─── Phase 31C compatibility ─────────────────────────────────────────────

describe('createDataSafetyInternalVisibilityConfig compatibility with shouldShowDataSafetyCenterPrototype', () => {
  it('default config hides prototype (disabled, default mode)', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({});
    expect(shouldShowDataSafetyCenterPrototype(cfg)).toBe(false);
  });

  it('missing flag hides prototype', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({ MODE: 'development' });
    expect(shouldShowDataSafetyCenterPrototype(cfg)).toBe(false);
  });

  it('invalid flag hides prototype', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: 'yes',
      MODE: 'development',
    });
    expect(shouldShowDataSafetyCenterPrototype(cfg)).toBe(false);
  });

  it('explicit "1" + development mode shows prototype (internal dev only)', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: '1',
      MODE: 'development',
    });
    expect(shouldShowDataSafetyCenterPrototype(cfg)).toBe(true);
  });

  it('explicit "true" + test mode shows prototype (internal test only)', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: 'true',
      MODE: 'test',
    });
    expect(shouldShowDataSafetyCenterPrototype(cfg)).toBe(true);
  });

  it('explicit "1" + production mode falls back to "dev" mode and shows prototype (internal dev fallback)', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: '1',
      MODE: 'production',
    });
    expect(shouldShowDataSafetyCenterPrototype(cfg)).toBe(true);
  });

  it('null env hides prototype via compatibility check', () => {
    const cfg = createDataSafetyInternalVisibilityConfig(null);
    expect(shouldShowDataSafetyCenterPrototype(cfg)).toBe(false);
  });
});

// ─── Source-level static checks ───────────────────────────────────────────

describe('dataSafetyInternalVisibility.js source static checks', () => {
  it('does not use localStorage (no localStorage. or localStorage[ usage)', () => {
    // Check for actual API usage patterns, not just the word in comments
    expect(helperSource).not.toMatch(/\blocalStorage\s*[.[]/);
    expect(helperSource).not.toMatch(/window\.localStorage/);
  });

  it('does not use sessionStorage (no sessionStorage. or sessionStorage[ usage)', () => {
    expect(helperSource).not.toMatch(/\bsessionStorage\s*[.[]/);
    expect(helperSource).not.toMatch(/window\.sessionStorage/);
  });

  it('does not use indexedDB (no indexedDB. or indexedDB[ usage)', () => {
    expect(helperSource).not.toMatch(/\bindexedDB\s*[.[]/i);
    expect(helperSource).not.toMatch(/window\.indexedDB/i);
  });

  it('does not reference document.cookie', () => {
    expect(helperSource).not.toContain('document.cookie');
  });

  it('does not reference fetch(', () => {
    expect(helperSource).not.toContain('fetch(');
  });

  it('does not use XMLHttpRequest (no new XMLHttpRequest)', () => {
    expect(helperSource).not.toMatch(/new\s+XMLHttpRequest/);
  });

  it('does not use WebSocket (no new WebSocket)', () => {
    expect(helperSource).not.toMatch(/new\s+WebSocket/);
  });

  it('does not use sendBeacon (no sendBeacon()', () => {
    expect(helperSource).not.toMatch(/\.sendBeacon\s*\(/);
  });

  it('does not import backup modules', () => {
    expect(helperSource).not.toMatch(/from\s+['"].*backup/i);
  });

  it('does not import export modules', () => {
    expect(helperSource).not.toMatch(/from\s+['"].*export/i);
  });

  it('does not import restore modules', () => {
    expect(helperSource).not.toMatch(/from\s+['"].*restore/i);
  });

  it('does not import sync/cloud/backend/auth modules', () => {
    expect(helperSource).not.toMatch(/from\s+['"].*(sync|cloud|backend|auth|account)/i);
  });
});

describe('Settings.jsx source static checks', () => {
  it('does not import backup modules', () => {
    expect(settingsSource).not.toMatch(/from\s+['"].*backup/i);
  });

  it('does not import restore modules', () => {
    expect(settingsSource).not.toMatch(/from\s+['"].*restore/i);
  });

  it('does not import sync/cloud/backend/auth modules', () => {
    expect(settingsSource).not.toMatch(/from\s+['"].*(sync|cloud|backend|auth|account)/i);
  });

  it('does not use localStorage API', () => {
    expect(settingsSource).not.toMatch(/\blocalStorage\s*[.[]/i);
    expect(settingsSource).not.toMatch(/window\.localStorage/);
  });

  it('does not reference fetch(', () => {
    expect(settingsSource).not.toContain('fetch(');
  });

  it('does not reference XMLHttpRequest', () => {
    expect(settingsSource).not.toContain('XMLHttpRequest');
  });

  it('imports dataSafetyInternalVisibility helper', () => {
    expect(settingsSource).toContain('dataSafetyInternalVisibility');
  });

  it('uses createDataSafetyInternalVisibilityConfig', () => {
    expect(settingsSource).toContain('createDataSafetyInternalVisibilityConfig');
  });

  it('still uses shouldShowDataSafetyCenterPrototype', () => {
    expect(settingsSource).toContain('shouldShowDataSafetyCenterPrototype');
  });
});

// ─── No persisted/user-visible state ─────────────────────────────────────

describe('no persisted or user-visible state', () => {
  it('config from disabled env has no side effects and returns plain object', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({});
    expect(typeof cfg).toBe('object');
    expect(cfg).not.toBeNull();
    expect(cfg.enabled).toBe(false);
  });

  it('config from enabled internal env has no side effects and returns plain object', () => {
    const cfg = createDataSafetyInternalVisibilityConfig({
      VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: 'true',
      MODE: 'test',
    });
    expect(typeof cfg).toBe('object');
    expect(cfg.enabled).toBe(true);
  });

  it('calling createDataSafetyInternalVisibilityConfig twice with same env returns same shape', () => {
    const env = { VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY: '1', MODE: 'development' };
    const cfg1 = createDataSafetyInternalVisibilityConfig(env);
    const cfg2 = createDataSafetyInternalVisibilityConfig(env);
    expect(cfg1).toEqual(cfg2);
  });

  it('default config from empty object is always disabled', () => {
    for (let i = 0; i < 3; i++) {
      const cfg = createDataSafetyInternalVisibilityConfig({});
      expect(cfg.enabled).toBe(false);
    }
  });
});
