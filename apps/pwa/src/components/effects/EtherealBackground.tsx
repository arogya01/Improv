import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// A classic procedural 3D Simplex Noise Shader implementation.
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  varying vec2 vUv;

  // Permutation polynomial: (34x^2 + x) mod 289
  vec3 permute(vec3 x) {
    return mod((34.0 * x + 1.0) * x, 289.0);
  }

  // Simplex 2D noise
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    // Parallax interaction driven by mouse.
    vec2 pos = vUv * 3.0;
    pos.x += uMouse.x * 0.1;
    pos.y += uMouse.y * 0.1;

    // Layered noise for topographic effect.
    float n = snoise(pos + uTime * 0.05);
    n += 0.5 * snoise(pos * 2.0 - uTime * 0.08);

    // Normalize roughly to 0.0 -> 1.0
    n = n * 0.5 + 0.5;

    // Generate contour lines: sharp edges around fractional bounds.
    float contours = fract(n * 10.0); // 10 contour layers
    // Smoothstep creates the actual line thickness.
    float line = smoothstep(0.0, 0.05, contours) - smoothstep(0.95, 1.0, contours);
    // Inverse so lines are dark.
    float lineAlpha = 1.0 - line;

    // Base ethereal gradient (greens/yellows matching reference).
    vec3 colorTop   = vec3(0.85, 0.95, 0.88); // Soft mint/white
    vec3 colorMid   = vec3(0.40, 0.70, 0.50); // Ethereal teal/green
    vec3 colorBot   = vec3(0.98, 0.90, 0.65); // Warm yellow/sand
    
    // Mix based on UV and noise.
    vec3 bgBase = mix(colorBot, colorTop, vUv.y + n * 0.2);
    vec3 bgGrad = mix(bgBase, colorMid, smoothstep(0.2, 0.8, n));

    // Combine gradient with thin very subtle dark contour lines.
    vec3 finalColor = mix(bgGrad, vec3(0.1, 0.2, 0.1), lineAlpha * 0.15);

    // Subtle dark vignette at edges.
    float dist = distance(vUv, vec2(0.5));
    finalColor = mix(finalColor, vec3(0.05, 0.1, 0.05), smoothstep(0.5, 1.2, dist) * 0.5);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const ShaderPlane = () => {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [size],
  );

  useFrame((state) => {
    if (material.current) {
      // @ts-ignore
      material.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Mouse ranges from -1 to 1 based on screen coordinates
      // We apply easing to mouse movement for smooth parallax
      const targetX = (state.pointer.x * viewport.width) / 2;
      const targetY = (state.pointer.y * viewport.height) / 2;
      // @ts-ignore
      material.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(targetX, targetY),
        0.05,
      );
    }
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
};

export const EtherealBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={window.devicePixelRatio > 1 ? 2 : 1}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
};
