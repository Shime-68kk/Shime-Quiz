import{r as p,j as M}from"./index-D2TFMxga.js";import{S as C,d as P,W as b,T as q,e as F,C as x,a as I,c as L}from"./three.module-B1vB_WoO.js";import{i as W,a as B,g as U,c as j,b as D}from"./threeCoreGuard-BhqINVTw.js";const g={vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,fragmentShader:`
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
  `};function z({active:o=!1,textureIndex:i=2,duration:s=1200,onComplete:n}){const l=p.useRef(null);return p.useEffect(()=>{if(!o)return;if(!W()||B()){n?.();return}const m=l.current;if(!m)return;const w=window.innerWidth,R=window.innerHeight,a=new C,d=new P(-1,1,1,-1,0,1),e=new b({alpha:!0,antialias:!1,powerPreference:"high-performance"});e.setSize(w,R),e.setPixelRatio(U(1.5)),e.domElement.style.position="fixed",e.domElement.style.top="0",e.domElement.style.left="0",e.domElement.style.width="100vw",e.domElement.style.height="100vh",e.domElement.style.pointerEvents="none",e.domElement.style.zIndex="9998",m.appendChild(e.domElement);const E=`./textures/transition/transition${Math.min(6,Math.max(1,Number(i)||1))}.png`,c=new q().load(E,()=>{e.render(a,d)}),r=new F({vertexShader:g.vertexShader,fragmentShader:g.fragmentShader,uniforms:{mixRatio:{value:0},threshold:{value:.1},tTransition:{value:c},colorA:{value:new x(988970)},colorB:{value:new x(165063)}},transparent:!0,depthTest:!1,depthWrite:!1}),u=new I(2,2),S=new L(u,r);a.add(S);let y=performance.now(),t=null;const f=T=>{const A=T-y,v=Math.min(A/s,1);r.uniforms.mixRatio.value=v,e.render(a,d),v<1?t=requestAnimationFrame(f):(h(),n?.())};t=requestAnimationFrame(f);function h(){t&&cancelAnimationFrame(t),u.dispose(),j(r),c.dispose(),D(e)}return()=>{h()}},[o,i,s,n]),M.jsx("div",{ref:l,"aria-hidden":"true",style:{pointerEvents:"none"}})}export{z as default};
