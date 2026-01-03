'use client';

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

type Background3DProps = {
  scroll: number;
};

// Firefly shader ported verbatim from serene Vite build
const FireflyShader = {
  uniforms: {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: 200.0 },
    uColor: { value: new THREE.Color('#eaffbd') },
    uMouse: { value: new THREE.Vector3(9999, 9999, 0) },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uScroll;
    uniform float uPixelRatio;
    uniform float uSize;
    uniform vec3 uMouse;

    attribute float aScale;
    attribute float aOffset;
    attribute float aSpeed;

    varying float vOpacity;
    varying float vInteraction;

    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);

      float t = uTime * aSpeed * 0.15;

      modelPosition.x += sin(t + aOffset) * 1.5;
      modelPosition.y += cos(t * 0.8 + aOffset) * 1.0;
      modelPosition.z += sin(t * 0.4 + aOffset) * 0.8;

      float scrollY = uScroll * 30.0;
      modelPosition.y += scrollY;
      modelPosition.y = mod(modelPosition.y + 25.0, 50.0) - 25.0;

      float distToMouse = distance(modelPosition.xy, uMouse.xy);
      float influenceRadius = 5.0;
      float interactionStrength = 0.0;

      if (distToMouse < influenceRadius) {
        float strength = smoothstep(influenceRadius, 0.0, distToMouse);
        interactionStrength = strength;

        vec2 pushDir = normalize(modelPosition.xy - uMouse.xy);
        modelPosition.xy += pushDir * strength * 4.0;
        modelPosition.z -= strength * 3.0;
      }

      vInteraction = interactionStrength;

      vec4 viewPosition = viewMatrix * modelPosition;
      gl_Position = projectionMatrix * viewPosition;

      float blinkSpeed = 2.0;
      float blink = sin(uTime * blinkSpeed * aSpeed + aOffset);
      blink = pow((blink + 1.0) * 0.5, 2.0);

      gl_PointSize = uSize * aScale * uPixelRatio;
      gl_PointSize *= (1.0 / -viewPosition.z);

      float depthFade = smoothstep(40.0, 10.0, -viewPosition.z);
      vOpacity = (0.4 + blink * 0.6) * depthFade;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying float vOpacity;
    varying float vInteraction;

    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);

      if (d > 0.5) discard;

      float glow = 0.06 / (d + 0.06);
      glow *= smoothstep(0.5, 0.2, d);
      glow *= 1.8;

      vec3 activeColor = mix(uColor, vec3(1.0, 1.0, 0.8), vInteraction);

      float core = smoothstep(0.05, 0.0, d);
      vec3 finalColor = mix(activeColor, vec3(1.0), core * 0.7);

      gl_FragColor = vec4(finalColor, glow * vOpacity);
    }
  `,
};

const ShootingStarShader = {
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uColor: { value: new THREE.Color('#ffffff') },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uPixelRatio;

    attribute float aOffset;
    attribute float aSpeed;
    attribute vec3 aStart;

    varying float vProgress;
    varying float vAlpha;

    void main() {
      float loopDuration = 18.0;
      float time = mod(uTime + aOffset, loopDuration);
      float flightDuration = 1.5;

      if (time > flightDuration) {
        gl_Position = vec4(0.0);
        gl_PointSize = 0.0;
        vAlpha = 0.0;
        return;
      }

      float progress = time / flightDuration;
      vProgress = progress;

      vec3 currentPos = aStart;
      float moveX = time * 40.0 * aSpeed;
      float moveY = time * 8.0 * aSpeed;

      currentPos.x -= moveX;
      currentPos.y -= moveY;

      vec4 viewPosition = viewMatrix * vec4(currentPos, 1.0);
      gl_Position = projectionMatrix * viewPosition;

      gl_PointSize = 500.0 * uPixelRatio;
      gl_PointSize *= (1.0 / -viewPosition.z);

      float fadeIn = smoothstep(0.0, 0.2, progress);
      float fadeOut = smoothstep(1.0, 0.7, progress);
      vAlpha = fadeIn * fadeOut;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying float vProgress;
    varying float vAlpha;

    void main() {
      if (vAlpha < 0.01) discard;

      vec2 uv = gl_PointCoord - 0.5;
      float angle = 0.2;
      float s = sin(angle);
      float c = cos(angle);
      vec2 rUV = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);

      float distY = abs(rUV.y) * 4.0;
      float distX = rUV.x;

      float head = smoothstep(0.5, -0.4, distX);
      float shape = (1.0 - length(vec2(distX + 0.4, rUV.y * 3.0)));
      shape = max(shape, 0.0);

      float streak = smoothstep(0.5, 0.0, abs(rUV.y)) * smoothstep(0.5, -0.5, distX);

      float alpha = (streak + shape) * 0.5;
      float glow = 0.03 / (length(vec2(rUV.x, rUV.y*5.0)) + 0.01);

      vec3 finalColor = uColor + vec3(0.5, 0.8, 1.0) * glow;

      gl_FragColor = vec4(finalColor, (alpha + glow) * vAlpha);
    }
  `
};

const ShootingStarTrailShader = {
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uPixelRatio;

    attribute float aOffset;
    attribute float aSpeed;
    attribute vec3 aStart;
    attribute float aLag;
    attribute vec3 aRand;
    attribute float aColor;

    varying float vAlpha;
    varying float vColorVar;

    void main() {
      float loopDuration = 18.0;
      float time = mod(uTime + aOffset, loopDuration);
      float particleTime = time - aLag;
      float flightDuration = 1.5;

      if (particleTime < 0.0 || particleTime > flightDuration) {
        gl_Position = vec4(0.0);
        gl_PointSize = 0.0;
        vAlpha = 0.0;
        return;
      }

      vec3 currentPos = aStart;
      float moveX = particleTime * 40.0 * aSpeed;
      float moveY = particleTime * 8.0 * aSpeed;
      currentPos.x -= moveX;
      currentPos.y -= moveY;
      currentPos += aRand * 0.6;

      vec4 viewPosition = viewMatrix * vec4(currentPos, 1.0);
      gl_Position = projectionMatrix * viewPosition;

      float ageNorm = aLag / 1.5;
      float size = (1.0 - ageNorm) * 70.0;

      gl_PointSize = size * uPixelRatio;
      gl_PointSize *= (1.0 / -viewPosition.z);

      vAlpha = smoothstep(1.0, 0.0, ageNorm);

      float progress = particleTime / flightDuration;
      float globalFade = smoothstep(0.0, 0.1, progress) * smoothstep(1.0, 0.8, progress);
      vAlpha *= globalFade;

      vColorVar = aColor;
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying float vColorVar;

    vec3 getMagicColor(float t) {
        vec3 c1 = vec3(0.06, 0.73, 0.5);
        vec3 c2 = vec3(0.02, 0.71, 0.83);
        vec3 c3 = vec3(0.85, 0.7, 1.0);
        vec3 c4 = vec3(1.0, 0.9, 0.4);

        if (t < 0.25) return mix(c1, c2, t * 4.0);
        if (t < 0.5) return mix(c2, c3, (t - 0.25) * 4.0);
        if (t < 0.75) return mix(c3, c4, (t - 0.5) * 4.0);
        return mix(c4, c1, (t - 0.75) * 4.0);
    }

    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      if (d > 0.5) discard;

      float glow = 0.05 / (d + 0.05);
      glow *= smoothstep(0.5, 0.0, d);

      vec3 color = getMagicColor(vColorVar);
      color = mix(color, vec3(1.0), smoothstep(0.3, 0.0, d));

      gl_FragColor = vec4(color, glow * vAlpha);
    }
  `
};

const ShootingStars: React.FC = () => {
  const headRef = useRef<THREE.Points>(null!);
  const trailRef = useRef<THREE.Points>(null!);
  const headMatRef = useRef<THREE.ShaderMaterial>(null!);
  const trailMatRef = useRef<THREE.ShaderMaterial>(null!);
  const { gl } = useThree();

  const starCount = 5;
  const trailParticlesPerStar = 40;

  const [headData, trailData] = useMemo(() => {
    const hPos = new Float32Array(starCount * 3);
    const hOff = new Float32Array(starCount);
    const hSpd = new Float32Array(starCount);
    const hStr = new Float32Array(starCount * 3);

    const totalTrail = starCount * trailParticlesPerStar;
    const tPos = new Float32Array(totalTrail * 3);
    const tOff = new Float32Array(totalTrail);
    const tSpd = new Float32Array(totalTrail);
    const tStr = new Float32Array(totalTrail * 3);
    const tLag = new Float32Array(totalTrail);
    const tRand = new Float32Array(totalTrail * 3);
    const tColor = new Float32Array(totalTrail);

    for (let i = 0; i < starCount; i++) {
      const off = Math.random() * 20.0;
      const spd = 0.8 + Math.random() * 0.4;
      const sx = 10.0 + Math.random() * 40.0;
      const sy = 5.0 + Math.random() * 25.0;
      const sz = -5.0 - Math.random() * 15.0;

      hPos[i*3] = 0; hPos[i*3+1] = 0; hPos[i*3+2] = 0;
      hOff[i] = off;
      hSpd[i] = spd;
      hStr[i*3] = sx; hStr[i*3+1] = sy; hStr[i*3+2] = sz;

      for (let j = 0; j < trailParticlesPerStar; j++) {
        const idx = i * trailParticlesPerStar + j;

        tPos[idx*3] = 0; tPos[idx*3+1] = 0; tPos[idx*3+2] = 0;
        tOff[idx] = off;
        tSpd[idx] = spd;
        tStr[idx*3] = sx; tStr[idx*3+1] = sy; tStr[idx*3+2] = sz;

        const r = Math.random();
        const lag = r * r * 1.5;
        tLag[idx] = lag;

        tRand[idx*3] = (Math.random() - 0.5);
        tRand[idx*3+1] = (Math.random() - 0.5);
        tRand[idx*3+2] = (Math.random() - 0.5);

        tColor[idx] = Math.random();
      }
    }

    return [
      { pos: hPos, off: hOff, spd: hSpd, str: hStr },
      { pos: tPos, off: tOff, spd: tSpd, str: tStr, lag: tLag, rand: tRand, col: tColor }
    ];
  }, []);

  useEffect(() => {
    if (headMatRef.current) headMatRef.current.uniforms.uPixelRatio.value = gl.getPixelRatio();
    if (trailMatRef.current) trailMatRef.current.uniforms.uPixelRatio.value = gl.getPixelRatio();
  }, [gl]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (headMatRef.current) headMatRef.current.uniforms.uTime.value = time;
    if (trailMatRef.current) trailMatRef.current.uniforms.uTime.value = time;
  });

  return (
    <group>
      <points ref={headRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={starCount} array={headData.pos} itemSize={3} />
          <bufferAttribute attach="attributes-aOffset" count={starCount} array={headData.off} itemSize={1} />
          <bufferAttribute attach="attributes-aSpeed" count={starCount} array={headData.spd} itemSize={1} />
          <bufferAttribute attach="attributes-aStart" count={starCount} array={headData.str} itemSize={3} />
        </bufferGeometry>
        <shaderMaterial
          ref={headMatRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={ShootingStarShader.uniforms}
          vertexShader={ShootingStarShader.vertexShader}
          fragmentShader={ShootingStarShader.fragmentShader}
        />
      </points>

      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={starCount * trailParticlesPerStar} array={trailData.pos} itemSize={3} />
          <bufferAttribute attach="attributes-aOffset" count={starCount * trailParticlesPerStar} array={trailData.off} itemSize={1} />
          <bufferAttribute attach="attributes-aSpeed" count={starCount * trailParticlesPerStar} array={trailData.spd} itemSize={1} />
          <bufferAttribute attach="attributes-aStart" count={starCount * trailParticlesPerStar} array={trailData.str} itemSize={3} />
          <bufferAttribute attach="attributes-aLag" count={starCount * trailParticlesPerStar} array={trailData.lag} itemSize={1} />
          <bufferAttribute attach="attributes-aRand" count={starCount * trailParticlesPerStar} array={trailData.rand} itemSize={3} />
          <bufferAttribute attach="attributes-aColor" count={starCount * trailParticlesPerStar} array={trailData.col} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          ref={trailMatRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={ShootingStarTrailShader.uniforms}
          vertexShader={ShootingStarTrailShader.vertexShader}
          fragmentShader={ShootingStarTrailShader.fragmentShader}
        />
      </points>
    </group>
  );
};

const Fireflies: React.FC<{ scroll: number }> = ({ scroll }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { gl, viewport } = useThree();

  const count = 200;

  const [positions, scales, speeds, offsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sca = new Float32Array(count);
    const spd = new Float32Array(count);
    const off = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      sca[i] = 0.3 + Math.random() * 0.4;
      spd[i] = 0.2 + Math.random() * 0.4;
      off[i] = Math.random() * Math.PI * 2;
    }
    return [pos, sca, spd, off];
  }, []);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uPixelRatio.value = gl.getPixelRatio();
    }
  }, [gl]);

  const targetMouse = useRef(new THREE.Vector3(9999, 9999, 0));

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

      materialRef.current.uniforms.uScroll.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uScroll.value,
        scroll,
        0.08
      );

      const x = (state.pointer.x * viewport.width) / 2;
      const y = (state.pointer.y * viewport.height) / 2;

      targetMouse.current.set(x, y, 0);

      materialRef.current.uniforms.uMouse.value.lerp(targetMouse.current, 0.1);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aScale" count={count} array={scales} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} />
        <bufferAttribute attach="attributes-aOffset" count={count} array={offsets} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={FireflyShader.uniforms}
        vertexShader={FireflyShader.vertexShader}
        fragmentShader={FireflyShader.fragmentShader}
      />
    </points>
  );
};

const SubtleDust: React.FC = () => {
  const count = 300;
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    return [pos];
  }, []);

  useFrame((state) => {
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.001;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#10b981"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.03}
      />
    </Points>
  );
};

export const Background3D: React.FC<Background3DProps> = ({ scroll }) => {
  const [webglFailed, setWebglFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault();
    setWebglFailed(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
      }
    };
  }, [handleContextLost]);

  if (webglFailed) {
    return <div className="w-full h-full fixed inset-0 z-0 bg-[#050807]" aria-hidden="true" />;
  }

  const eventSource = typeof document !== 'undefined' ? document.documentElement : undefined;

  return (
    <div className="w-full h-full fixed inset-0 z-0 bg-[#050807] pointer-events-none" aria-hidden="true">
      <Canvas
        className="pointer-events-none"
        eventSource={eventSource}
        onCreated={({ gl }) => {
          canvasRef.current = gl.domElement;
          gl.domElement.addEventListener('webglcontextlost', handleContextLost, { once: true });
        }}
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={1}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: false }}
      >
        <color attach="background" args={['#050807']} />

        <ShootingStars />
        <Fireflies scroll={scroll} />
        <SubtleDust />

        <mesh position={[0, 0, -30]}>
          <sphereGeometry args={[60, 32, 32]} />
          <meshBasicMaterial
            color="#06120c"
            transparent
            opacity={0.4}
            side={THREE.BackSide}
          />
        </mesh>

        <fog attach="fog" args={['#050807', 5, 40]} />
      </Canvas>
    </div>
  );
};
