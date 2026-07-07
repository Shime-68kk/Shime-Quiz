import { describe, expect, it } from 'vitest';
import { createShimeFusionManualQaChecklist, summarizeShimeFusionManualQaChecklist } from '../../../src/shimeIntelligence/shimeFusionManualQaModel.js';

describe('shimeFusionManualQaModel', () => {
  it('contains Vietnamese Section D checklist with no production claim', () => {
    const checklist = createShimeFusionManualQaChecklist();
    const summary = summarizeShimeFusionManualQaChecklist(checklist);
    expect(checklist.sectionDTitleVi).toBe('D. Hệ sinh thái Shime — chạy thử khớp nối');
    expect(checklist.runButtonVi).toBe('Chạy khớp nối Shime');
    expect(checklist.items.length).toBeGreaterThanOrEqual(15);
    expect(summary.productionClaim).toBe('no_production_claim');
    expect(summary.dryRunOnly).toBe(true);
  });
});
