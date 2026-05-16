/**
 * storageAdapterRegistry — single source of truth for the active StorageAdapter.
 *
 * Production default: LocalStorageAdapter.
 * Tests may override with setStorageAdapterForTests / resetStorageAdapterForTests.
 *
 * No user-facing setting. No feature flag. No driver state machine.
 */

import { LocalStorageAdapter } from './LocalStorageAdapter.js';

let _adapter = null;
let _testOverride = null;

function defaultAdapter() {
  if (!_adapter) _adapter = new LocalStorageAdapter();
  return _adapter;
}

/**
 * Returns the active StorageAdapter instance.
 * @returns {import('./StorageAdapter.js').StorageAdapter}
 */
export function getStorageAdapter() {
  return _testOverride ?? defaultAdapter();
}

/**
 * Override the adapter for tests only. Must be reset after each test.
 * @param {import('./StorageAdapter.js').StorageAdapter} adapter
 */
export function setStorageAdapterForTests(adapter) {
  _testOverride = adapter;
}

/**
 * Reset the test override, restoring the production LocalStorageAdapter default.
 */
export function resetStorageAdapterForTests() {
  _testOverride = null;
}
