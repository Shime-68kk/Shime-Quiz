import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  isWebGLAvailable,
  getSafePixelRatio,
  isReducedMotionRequested,
  disposeRenderer,
  disposeMaterial
} from '../../uiMotion/threeCoreGuard.js';

const TRANSITION_SHADER = {
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform float mixRatio;
    uniform float threshold;
    uniform sampler2D tTransition;
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying vec2 vUv;

    void main() {
      vec4 mask = texture2D(tTransition, vUv);
      float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
      float f = clamp((mask.r - r) * (1.0 / threshold), 0.0, 1.0);

      // Hòa trộn giữa màu A (cảnh cũ) và màu B (cảnh mới) thông qua mặt nạ độ sáng
      vec3 finalColor = mix(colorB, colorA, f);
      float alpha = clamp(sin(mixRatio * 3.14159265) * 1.5, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

/**
 * Component Màn Chuyển Cảnh Điện Ảnh WebGL Shaders (Three.js Shader Transition Curtain)
 * Sử dụng kỹ thuật RenderTransitionPass trích xuất từ Three.js dev kết hợp 6 textures chuyển cảnh cục bộ.
 *
 * @param {Object} props
 * @param {boolean} [props.active=false] - Kích hoạt chạy hiệu ứng chuyển cảnh
 * @param {number} [props.textureIndex=2] - Loại mặt nạ chuyển cảnh (1: Wipe, 2: Dissolve, 3: Diagonal, 4: Fracture, 5: Radial, 6: Matrix)
 * @param {number} [props.duration=1200] - Thời lượng chuyển cảnh (ms)
 * @param {Function} [props.onComplete] - Callback sau khi kết thúc chuyển cảnh
 */
export default function ThreeShaderTransitionCurtain({
  active = false,
  textureIndex = 2,
  duration = 1200,
  onComplete
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    if (!isWebGLAvailable() || isReducedMotionRequested()) {
      onComplete?.();
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Khởi tạo Renderer & Scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(getSafePixelRatio(1.5));
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '9998';
    container.appendChild(renderer.domElement);

    // 2. Tải Texture mặt nạ chuyển cảnh từ thư mục public cục bộ
    const safeIndex = Math.min(6, Math.max(1, Number(textureIndex) || 1));
    const texturePath = `./textures/transition/transition${safeIndex}.png`;
    const textureLoader = new THREE.TextureLoader();
    const transitionTexture = textureLoader.load(texturePath, () => {
      renderer.render(scene, camera);
    });

    // 3. Tạo Fullscreen Quad Shader
    const material = new THREE.ShaderMaterial({
      vertexShader: TRANSITION_SHADER.vertexShader,
      fragmentShader: TRANSITION_SHADER.fragmentShader,
      uniforms: {
        mixRatio: { value: 0.0 },
        threshold: { value: 0.1 },
        tTransition: { value: transitionTexture },
        colorA: { value: new THREE.Color(0x0f172a) }, // Slate Dark
        colorB: { value: new THREE.Color(0x0284c7) }  // Sky Accent
      },
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    // 4. Animation Tween cho mixRatio từ 0.0 -> 1.0
    let startTime = performance.now();
    let animationFrameId = null;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      material.uniforms.mixRatio.value = progress;

      renderer.render(scene, camera);

      if (progress < 1.0) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Dọn dẹp sau khi kết thúc
        cleanup();
        onComplete?.();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    function cleanup() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      disposeMaterial(material);
      transitionTexture.dispose();
      disposeRenderer(renderer);
    }

    return () => {
      cleanup();
    };
  }, [active, textureIndex, duration, onComplete]);

  return <div ref={mountRef} aria-hidden="true" style={{ pointerEvents: 'none' }} />;
}
