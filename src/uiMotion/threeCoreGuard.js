/**
 * Three.js Core Guard & Memory Management Utilities
 * Chống rò rỉ VRAM, tự động dọn dẹp tài nguyên GPU và kiểm tra khả năng phần cứng.
 */

/**
 * Kiểm tra xem thiết bị và trình duyệt có hỗ trợ WebGL không.
 * @returns {boolean}
 */
export function isWebGLAvailable() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Lấy tỉ lệ Pixel an toàn (giới hạn tối đa để tránh quá tải GPU trên màn hình 3K/4K/Retina).
 * @param {number} [maxRatio=2.0]
 * @returns {number}
 */
export function getSafePixelRatio(maxRatio = 2.0) {
  if (typeof window === 'undefined') return 1;
  return Math.min(window.devicePixelRatio || 1, maxRatio);
}

/**
 * Kiểm tra xem người dùng có yêu cầu giảm chuyển động trong hệ điều hành không.
 * @returns {boolean}
 */
export function isReducedMotionRequested() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Dọn dẹp đệ quy một Material và các Texture đính kèm.
 * @param {import('three').Material} material
 */
export function disposeMaterial(material) {
  if (!material) return;

  // Dọn dẹp tất cả các bản đồ texture có trong material
  const textureKeys = [
    'map', 'alphaMap', 'aoMap', 'bumpMap', 'displacementMap',
    'emissiveMap', 'envMap', 'lightMap', 'metalnessMap',
    'normalMap', 'roughnessMap'
  ];

  for (const key of textureKeys) {
    if (material[key] && typeof material[key].dispose === 'function') {
      material[key].dispose();
    }
  }

  // Dọn dẹp uniforms nếu là ShaderMaterial
  if (material.uniforms) {
    for (const u of Object.values(material.uniforms)) {
      if (u?.value && typeof u.value.dispose === 'function') {
        u.value.dispose();
      }
    }
  }

  if (typeof material.dispose === 'function') {
    material.dispose();
  }
}

/**
 * Dọn dẹp đệ quy toàn bộ cây Scene Graph (Geometry, Material, Texture, Child Objects).
 * @param {import('three').Object3D} rootObject
 */
export function deepDisposeObject(rootObject) {
  if (!rootObject) return;

  rootObject.traverse?.(child => {
    // 1. Dọn dẹp Geometry
    if (child.geometry && typeof child.geometry.dispose === 'function') {
      child.geometry.dispose();
    }

    // 2. Dọn dẹp Material (hỗ trợ cả mảng material)
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(disposeMaterial);
      } else {
        disposeMaterial(child.material);
      }
    }
  });

  // Hủy liên kết với cha nếu có
  if (rootObject.parent) {
    rootObject.parent.remove(rootObject);
  }
}

/**
 * Dọn dẹp triệt để một WebGLRenderer và giải phóng ngữ cảnh WebGL.
 * @param {import('three').WebGLRenderer} renderer
 */
export function disposeRenderer(renderer) {
  if (!renderer) return;

  try {
    if (typeof renderer.dispose === 'function') {
      renderer.dispose();
    }
    if (typeof renderer.forceContextLoss === 'function') {
      renderer.forceContextLoss();
    }
    const dom = renderer.domElement;
    if (dom && dom.parentNode) {
      dom.parentNode.removeChild(dom);
    }
  } catch (err) {
    console.warn('[ThreeCoreGuard] Lỗi khi giải phóng renderer:', err);
  }
}
