export const SUBJECT_SPACE_BACKUP_SCHEMA_VERSION = 'subject-space-backup-v1';

function safeId(value, fallback = 'general') {
  const id = String(value || '').trim();
  return id || fallback;
}

export function createSubjectSpaceBackupMetadata(input = {}) {
  return {
    schemaVersion: SUBJECT_SPACE_BACKUP_SCHEMA_VERSION,
    activeSubjectId: safeId(input.activeSubjectId),
    pinnedSubjectIds: Array.isArray(input.pinnedSubjectIds)
      ? input.pinnedSubjectIds.map(id => safeId(id, '')).filter(Boolean).slice(0, 20)
      : [],
    restoredFromOlderBackup: false,
    irreversibleMigrationRequired: false,
    rawContentIncluded: false
  };
}

export function restoreSubjectSpaceBackupMetadata(raw = {}, availableSubjectIds = []) {
  const available = new Set((Array.isArray(availableSubjectIds) ? availableSubjectIds : []).map(id => safeId(id, '')));
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: true, activeSubjectId: 'general', pinnedSubjectIds: [], restoredFromOlderBackup: true };
  }
  const requestedActive = safeId(raw.activeSubjectId);
  const activeSubjectId = available.size === 0 || available.has(requestedActive) ? requestedActive : 'general';
  const pinnedSubjectIds = Array.isArray(raw.pinnedSubjectIds)
    ? raw.pinnedSubjectIds.map(id => safeId(id, '')).filter(id => id && (available.size === 0 || available.has(id))).slice(0, 20)
    : [];
  return {
    ok: true,
    activeSubjectId,
    pinnedSubjectIds,
    restoredFromOlderBackup: raw.schemaVersion !== SUBJECT_SPACE_BACKUP_SCHEMA_VERSION,
    irreversibleMigrationRequired: false,
    rawContentIncluded: false
  };
}

export function assertSubjectSpaceBackupMetadataSafe(metadata = {}) {
  const text = JSON.stringify(metadata);
  for (const key of ['question', 'answer', 'prompt', 'explanation', 'correctAnswer']) {
    if (text.includes(key)) throw new TypeError(`unsafe_subject_space_metadata_${key}`);
  }
  return true;
}
