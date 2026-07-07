import { describe, expect, it } from 'vitest';
import { getShimeProductDoctrine, summarizeShimeProductDoctrine, validateShimeProductDoctrine } from '../../../src/shimeIntelligence/productDoctrine.js';

describe('productDoctrine', () => {
  it('encodes Shime Robot as product face and Shime Quiz as local-first learning brain', () => {
    const doctrine = getShimeProductDoctrine();
    const validation = validateShimeProductDoctrine(doctrine);
    const summary = summarizeShimeProductDoctrine(doctrine);
    expect(doctrine.ecosystemName).toBe('Shime');
    expect(doctrine.robotProductName).toBe('Shime Robot');
    expect(doctrine.appProductName).toBe('Shime Quiz');
    expect(doctrine.robotPublicRole).toBe('product_face');
    expect(doctrine.appTechnicalRole).toBe('local_first_learning_brain');
    expect(doctrine.fsrsRole).toBe('memory_scheduler_core');
    expect(doctrine.safetyRole).toBe('highest_authority');
    expect(doctrine.invariants).toContain('robot_receives_capsules_only');
    expect(validation.ok).toBe(true);
    expect(summary.invariantCount).toBeGreaterThanOrEqual(7);
  });

  it('rejects app-led or robot-authoritative doctrine drift', () => {
    const doctrine = getShimeProductDoctrine();
    const validation = validateShimeProductDoctrine({
      ...doctrine,
      robotPublicRole: 'accessory',
      appTechnicalRole: 'cloud_client',
      invariants: []
    });
    expect(validation.ok).toBe(false);
    expect(validation.failures).toContain('robot_not_product_face');
    expect(validation.failures).toContain('app_not_learning_brain');
  });
});
