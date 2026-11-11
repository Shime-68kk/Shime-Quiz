import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  isWebGLAvailable,
  getSafePixelRatio,
  isReducedMotionRequested,
  deepDisposeObject,
  disposeRenderer
} from '../../uiMotion/threeCoreGuard.js';

const CONFETTI_COLORS = [
  0x38bdf8, // Sky Blue
  0x10b981, // Emerald Green
  0xf59e0b, // Amber Gold
  0xec4899, // Pink
  0x8b5cf6, // Violet
  0x06b6d4  // Cyan
];

/**
 * Component Hiệu ứng Pháo hoa Hạt 3D GPU (Three.js Confetti Celebration)
 * Bắn tung hạt 3D khi hoàn thành bài thi hoặc đạt chuỗi trả lời đúng cao (Streak).
 * Tự động biến mất và giải phóng 100% VRAM GPU sau thời gian chỉ định.
 *
 * @param {Object} props
 * @param {number} [props.particleCount=160] - Số lượng mảnh confetti
 * @param {number} [props.duration=3500] - Thời gian chạy hiệu ứng (ms)
 * @param {Function} [props.onComplete] - Callback khi hiệu ứng kết thúc
 */
export default function ThreeConfettiCelebration({
  particleCount = 160,
  duration = 3500,
  onComplete
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    // Nếu thiết bị không hỗ trợ WebGL hoặc người dùng chọn giảm chuyển động -> kết thúc ngay
    if (!isWebGLAvailable() || isReducedMotionRequested()) {
      onComplete?.();
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Khởi tạo Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(getSafePixelRatio(2.0));
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '9999';
    container.appendChild(renderer.domElement);

    // 2. Tạo hình dạng và chất liệu các mảnh confetti
    const cardGeo = new THREE.PlaneGeometry(7, 12);
    const materials = CONFETTI_COLORS.map(
      color => new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
    );

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(cardGeo, mat);

      // Phân bố xuất phát ở khu vực giữa - dưới màn hình
      mesh.position.set(
        (Math.random() - 0.5) * (width * 0.4),
        -height * 0.35,
        (Math.random() - 0.5) * 100
      );

      // Thiết lập vận tốc ban đầu dạng vụ nổ hình quạt
      const angle = (Math.random() * Math.PI * 0.6) + (Math.PI * 0.2); // Hướng lên
      const speed = Math.random() * 12 + 10;

      mesh.userData = {
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
        vy: Math.sin(angle) * speed * 1.3,
        vz: (Math.random() - 0.5) * 6,
        rotSpeedX: (Math.random() - 0.5) * 0.25,
        rotSpeedY: (Math.random() - 0.5) * 0.25,
        rotSpeedZ: (Math.random() - 0.5) * 0.15,
        opacity: 1
      };

      scene.add(mesh);
      particles.push(mesh);
    }

    // 3. Animation Loop
    let animationFrameId = null;
    let isRunning = true;
    const gravity = -0.32;
    const drag = 0.985; // Lực cản không khí nhẹ

    const animate = () => {
      if (!isRunning) return;

      particles.forEach(p => {
        p.userData.vy += gravity;
        p.userData.vx *= drag;
        p.userData.vz *= drag;

        p.position.x += p.userData.vx;
        p.position.y += p.userData.vy;
        p.position.z += p.userData.vz;

        p.rotation.x += p.userData.rotSpeedX;
        p.rotation.y += p.userData.rotSpeedY;
        p.rotation.z += p.userData.rotSpeedZ;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 4. Hẹn giờ dọn dẹp và kết thúc
    const timer = setTimeout(() => {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      deepDisposeObject(scene);
      cardGeo.dispose();
      materials.forEach(m => m.dispose());
      disposeRenderer(renderer);
      onComplete?.();
    }, duration);

    // 5. Cleanup nếu unmount sớm
    return () => {
      clearTimeout(timer);
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      deepDisposeObject(scene);
      cardGeo.dispose();
      materials.forEach(m => m.dispose());
      disposeRenderer(renderer);
    };
  }, [particleCount, duration, onComplete]);

  return <div ref={mountRef} aria-hidden="true" style={{ pointerEvents: 'none' }} />;
}
