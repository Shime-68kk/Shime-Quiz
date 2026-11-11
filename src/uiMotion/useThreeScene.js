import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  isWebGLAvailable,
  getSafePixelRatio,
  isReducedMotionRequested,
  deepDisposeObject,
  disposeRenderer
} from './threeCoreGuard.js';

/**
 * Custom React Hook quản lý vòng đời khởi tạo, resize và tự động dọn sạch Three.js scene.
 *
 * @param {Object} options
 * @param {Function} options.onInit - Hàm khởi tạo đối tượng 3D (scene, camera, renderer, { width, height })
 * @param {Function} [options.onFrame] - Hàm cập nhật frame (delta, time, { scene, camera, renderer })
 * @param {boolean} [options.alpha=true] - Cho phép nền canvas trong suốt
 * @param {boolean} [options.antialias=true] - Bật khử răng cưa
 * @param {number} [options.maxPixelRatio=2.0] - Giới hạn tỉ lệ pixel
 */
export function useThreeScene({
  onInit,
  onFrame,
  alpha = true,
  antialias = true,
  maxPixelRatio = 2.0
} = {}) {
  const containerRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isWebGLAvailable()) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 150;

    // 1. Khởi tạo Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;

    // 2. Khởi tạo Scene
    const scene = new THREE.Scene();

    // 3. Khởi tạo Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha,
      antialias,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(getSafePixelRatio(maxPixelRatio));
    container.appendChild(renderer.domElement);

    const context = { scene, camera, renderer, width, height };

    // 4. Gọi callback khởi tạo người dùng
    const customTeardown = onInit ? onInit(context) : null;

    // 5. Animation Loop
    let animationFrameId = null;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (onFrame) {
        onFrame(delta, elapsed, context);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    if (onFrame && !isReducedMotionRequested()) {
      animate();
    } else {
      // Nếu không có frame loop hoặc người dùng yêu cầu giảm chuyển động: render 1 lần tĩnh
      renderer.render(scene, camera);
    }

    // 6. Xử lý Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(getSafePixelRatio(maxPixelRatio));
      if (!onFrame) {
        renderer.render(scene, camera);
      }
    };

    window.addEventListener('resize', handleResize);

    stateRef.current = {
      ...context,
      cleanup: () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        if (typeof customTeardown === 'function') {
          customTeardown();
        }
        deepDisposeObject(scene);
        disposeRenderer(renderer);
      }
    };

    // Cleanup khi component unmount
    return () => {
      stateRef.current?.cleanup();
      stateRef.current = null;
    };
  }, []);

  return { containerRef, stateRef };
}
