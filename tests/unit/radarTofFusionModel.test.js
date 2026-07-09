import { describe, expect, it } from 'vitest';
import { fuseRadarTofPresence } from '../../src/robotSensing/radarTofFusionModel.js';

describe('radarTofFusionModel', () => {
  const base = {
    radarAvailable: true, radarOccupied: true, radarActive: false, radarStationary: false, radarConfidenceBucket: 'high',
    tofAvailable: true, tofDistanceBucket: 'study_range', tofTrend: 'stable', tofBlockedLikely: false,
    robotRecentlyMoved: false, appFocusNeedBucket: 'none', appStudyLoadBucket: 'none'
  };
  it('maps required coarse scenarios deterministically', () => {
    expect(fuseRadarTofPresence({ ...base, tofDistanceBucket: 'out_of_range' }).fusionState).toBe('user_present_off_axis');
    expect(fuseRadarTofPresence(base).fusionState).toBe('user_present_in_front');
    expect(fuseRadarTofPresence({ ...base, radarStationary: true, appFocusNeedBucket: 'high' }).fusionState).toBe('quiet_study_presence');
    expect(fuseRadarTofPresence({ ...base, radarActive: true, tofTrend: 'approaching' }).fusionState).toBe('active_interaction');
    expect(fuseRadarTofPresence({ ...base, radarOccupied: false, tofDistanceBucket: 'very_near' }).fusionState).toBe('object_in_front_not_user');
    expect(fuseRadarTofPresence({ ...base, tofBlockedLikely: true }).fusionState).toBe('sensor_blocked');
    expect(fuseRadarTofPresence({ ...base, radarAvailable: false, tofDistanceBucket: 'out_of_range' }).fusionState).toBe('uncertain_environment');
    expect(fuseRadarTofPresence({ radarAvailable: false, tofAvailable: false }).fusionState).toBe('empty_room');
  });
  it('never uses raw data or identity', () => {
    const result = fuseRadarTofPresence(base);
    expect(result.rawDataUsed).toBe(false);
    expect(result.safetyClass).toBe('safe_coarse_sensing_only');
    expect(JSON.stringify(result)).not.toMatch(/camera|microphone|identity|ssid|mac/i);
  });
});
