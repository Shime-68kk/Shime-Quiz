import { describe, expect, it } from 'vitest';
import { getShimeEcosystemRoadmap, summarizeShimeEcosystemRoadmap, validateShimeEcosystemRoadmap } from '../../../src/shimeIntelligence/ecosystemRoadmapModel.js';

describe('ecosystemRoadmapModel', () => {
  it('defines a gated 12-stage local-first robot-led roadmap', () => {
    const roadmap = getShimeEcosystemRoadmap();
    const validation = validateShimeEcosystemRoadmap(roadmap);
    const summary = summarizeShimeEcosystemRoadmap(roadmap);
    expect(roadmap.stages).toHaveLength(12);
    expect(roadmap.stages[0].goal).toBe('Local-first app intelligence');
    expect(roadmap.stages[3].goal).toBe('FSRS-to-robot learning capsule');
    expect(roadmap.stages[11].goal).toBe('Motion-capable robot future safety phase');
    expect(roadmap.stages.every(stage => stage.forbiddenCapabilities.includes('raw_learning_payload_to_robot'))).toBe(true);
    expect(roadmap.stages.every(stage => stage.privacyGate === 'capsule_redacted_coarse_only')).toBe(true);
    expect(validation.ok).toBe(true);
    expect(summary.stageCount).toBe(12);
  });
});
