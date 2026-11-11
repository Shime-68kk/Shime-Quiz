import { describe, expect, it, vi } from 'vitest';
import {
  isWebGLAvailable,
  getSafePixelRatio,
  isReducedMotionRequested,
  disposeMaterial,
  deepDisposeObject,
  disposeRenderer
} from '../../src/uiMotion/threeCoreGuard.js';

describe('threeCoreGuard module', () => {
  it('isWebGLAvailable returns boolean without throwing in Node', () => {
    const result = isWebGLAvailable();
    expect(typeof result).toBe('boolean');
  });

  it('getSafePixelRatio clamps to specified maxRatio', () => {
    expect(getSafePixelRatio(1.5)).toBeLessThanOrEqual(1.5);
    expect(getSafePixelRatio(2.0)).toBeLessThanOrEqual(2.0);
  });

  it('isReducedMotionRequested returns boolean safely', () => {
    const result = isReducedMotionRequested();
    expect(typeof result).toBe('boolean');
  });

  it('disposeMaterial disposes material and its textures', () => {
    const mockTexture = { dispose: vi.fn() };
    const mockMaterial = {
      map: mockTexture,
      normalMap: mockTexture,
      dispose: vi.fn()
    };

    disposeMaterial(mockMaterial);
    expect(mockMaterial.dispose).toHaveBeenCalled();
    expect(mockTexture.dispose).toHaveBeenCalledTimes(2);

    // Safely handles null
    expect(() => disposeMaterial(null)).not.toThrow();
  });

  it('deepDisposeObject recursively disposes child geometries and materials', () => {
    const geomDispose = vi.fn();
    const matDispose = vi.fn();

    const mockChild = {
      geometry: { dispose: geomDispose },
      material: { dispose: matDispose }
    };

    const mockRoot = {
      traverse: fn => {
        fn(mockChild);
      }
    };

    deepDisposeObject(mockRoot);
    expect(geomDispose).toHaveBeenCalled();
    expect(matDispose).toHaveBeenCalled();

    // Safely handles null
    expect(() => deepDisposeObject(null)).not.toThrow();
  });

  it('disposeRenderer safely calls dispose and forceContextLoss', () => {
    const mockRenderer = {
      dispose: vi.fn(),
      forceContextLoss: vi.fn(),
      domElement: { parentNode: null }
    };

    disposeRenderer(mockRenderer);
    expect(mockRenderer.dispose).toHaveBeenCalled();
    expect(mockRenderer.forceContextLoss).toHaveBeenCalled();

    // Safely handles null
    expect(() => disposeRenderer(null)).not.toThrow();
  });
});
