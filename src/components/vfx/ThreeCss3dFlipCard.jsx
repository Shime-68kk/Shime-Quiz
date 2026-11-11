import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { isReducedMotionRequested } from '../../uiMotion/threeCoreGuard.js';

/**
 * Component Thẻ Quiz Lật 3D Không gian Thực (Three.js CSS3D Flip Card)
 * Kết hợp sức mạnh đồ họa 3D không gian của Three.js với DOM HTML thật (100% giữ nguyên tính năng truy cập, chữ sắc nét, nút bấm).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.frontContent - Nội dung mặt trước (ví dụ: Câu hỏi trắc nghiệm)
 * @param {React.ReactNode} [props.backContent] - Nội dung mặt sau (ví dụ: Đáp án & Giải thích)
 * @param {boolean} [props.isFlipped=false] - Trạng thái lật thẻ
 * @param {boolean} [props.enableTilt=true] - Bật hiệu ứng nghiêng 3D theo con trỏ chuột
 * @param {string} [props.className='']
 */
export default function ThreeCss3dFlipCard({
  frontContent,
  backContent,
  isFlipped = false,
  enableTilt = true,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const frontDomRef = useRef(null);
  const backDomRef = useRef(null);
  const cardGroupRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const frontEl = frontDomRef.current;
    if (!container || !frontEl) return;

    // Nếu người dùng yêu cầu giảm chuyển động: không khởi tạo Three.js CSS3D, dùng layout thường
    if (isReducedMotionRequested()) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 350;

    // 1. Khởi tạo CSS3D Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 2000);
    camera.position.z = 650;

    const renderer = new CSS3DRenderer();
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const dom = renderer.domElement;
    dom.style.position = 'absolute';
    dom.style.top = '0';
    dom.style.left = '0';
    dom.style.width = '100%';
    dom.style.height = '100%';
    container.appendChild(dom);

    // 2. Tạo Group 3D chứa mặt trước và mặt sau
    const group = new THREE.Group();
    cardGroupRef.current = group;

    const frontObj = new CSS3DObject(frontEl);
    group.add(frontObj);

    let backObj = null;
    if (backDomRef.current) {
      backObj = new CSS3DObject(backDomRef.current);
      backObj.rotation.y = Math.PI; // Quay lưng 180 độ
      group.add(backObj);
    }

    scene.add(group);

    const render = () => {
      renderer.render(scene, camera);
    };

    render();

    // 3. Hiệu ứng nghiêng 3D theo chuột (Tilt)
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handleMouseMove = (e) => {
      if (!enableTilt) return;
      const rect = container.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;

      currentTiltY = normX * 0.25; // Xoay quanh trục Y
      currentTiltX = -normY * 0.2; // Xoay quanh trục X

      group.rotation.x = currentTiltX;
      group.rotation.y = (isFlipped ? Math.PI : 0) + currentTiltY;
      render();
    };

    const handleMouseLeave = () => {
      group.rotation.x = 0;
      group.rotation.y = isFlipped ? Math.PI : 0;
      render();
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // 4. Xử lý Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      render();
    };

    window.addEventListener('resize', handleResize);

    // 5. Cleanup triệt để khi unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (dom.parentNode) {
        dom.parentNode.removeChild(dom);
      }
    };
  }, [enableTilt]);

  // Cập nhật góc lật khi prop `isFlipped` thay đổi
  useEffect(() => {
    const group = cardGroupRef.current;
    if (!group) return;

    const targetRotY = isFlipped ? Math.PI : 0;
    // Animation lật mượt mà
    let startTime = performance.now();
    const duration = 500;
    const startRotY = group.rotation.y;

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      group.rotation.y = startRotY + (targetRotY - startRotY) * ease;

      if (rendererRef.current) {
        // Render lại scene
        const camera = new THREE.PerspectiveCamera(40, (containerRef.current?.clientWidth || 500) / (containerRef.current?.clientHeight || 350), 1, 2000);
        camera.position.z = 650;
        rendererRef.current.render(group.parent || group, camera);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isFlipped]);

  return (
    <div
      ref={containerRef}
      className={`threeCss3dCardContainer ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '340px',
        perspective: '1200px',
        ...style
      }}
    >
      {/* Mặt trước */}
      <div
        ref={frontDomRef}
        style={{
          width: '100%',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        {frontContent}
      </div>

      {/* Mặt sau (nếu có) */}
      {backContent && (
        <div
          ref={backDomRef}
          style={{
            width: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {backContent}
        </div>
      )}
    </div>
  );
}
