import { describe, expect, it } from 'vitest';
import { reduceRobotPresenceSignal } from '../../src/companion/robotPresenceSignalReducer.js';

describe('robotPresenceSignalReducer', () => {
  it('accepts coarse non-identifying presence state', () => {
    const result = reduceRobotPresenceSignal({
      presenceBucket: 'approaching',
      distanceBucket: 'near',
      approachVelocityBucket: 'approaching_slow',
      confidenceBucket: 'high',
      sensorHealth: 'healthy',
      robotAvailability: 'available'
    });

    expect(result.ok).toBe(true);
    expect(result.state).toMatchObject({
      presenceBucket: 'approaching',
      distanceBucket: 'near',
      interactionConfidenceBucket: 'high',
      robotAvailability: 'available'
    });
  });

  it('marks degraded sensor as unhealthy availability', () => {
    const result = reduceRobotPresenceSignal({ sensorHealth: 'degraded' });

    expect(result.state.robotAvailability).toBe('unhealthy');
  });
});
