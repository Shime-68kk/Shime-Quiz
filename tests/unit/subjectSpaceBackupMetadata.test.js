import { describe, expect, it } from 'vitest';
import {
  assertSubjectSpaceBackupMetadataSafe,
  createSubjectSpaceBackupMetadata,
  restoreSubjectSpaceBackupMetadata
} from '../../src/studyRoom/subjectSpaceBackupMetadata.js';

describe('subjectSpaceBackupMetadata', () => {
  it('backs up active subject preference safely', () => {
    const metadata = createSubjectSpaceBackupMetadata({ activeSubjectId: 'math', pinnedSubjectIds: ['math', 'physics'] });
    expect(metadata).toMatchObject({
      activeSubjectId: 'math',
      pinnedSubjectIds: ['math', 'physics'],
      irreversibleMigrationRequired: false,
      rawContentIncluded: false
    });
    expect(assertSubjectSpaceBackupMetadataSafe(metadata)).toBe(true);
  });

  it('restores unknown subject safely', () => {
    expect(restoreSubjectSpaceBackupMetadata({ activeSubjectId: 'missing' }, ['math'])).toMatchObject({
      ok: true,
      activeSubjectId: 'general'
    });
  });

  it('supports older backups with no metadata', () => {
    expect(restoreSubjectSpaceBackupMetadata(null, ['math'])).toMatchObject({
      ok: true,
      activeSubjectId: 'general',
      restoredFromOlderBackup: true
    });
  });

  it('detects raw content in metadata', () => {
    expect(() => assertSubjectSpaceBackupMetadataSafe({ question: 'raw' })).toThrow(/question/);
  });
});
