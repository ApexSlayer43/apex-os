// SOURCE: 21st.dev — Horizon Hero Section
// DEPS: three, gsap
// STACK: React + TypeScript + Three.js + GSAP + custom GLSL shaders
// INSTALL: npm install three gsap
// TYPES: npm install --save-dev @types/three

'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

gsap.registerPlugin(ScrollTrigger);

export const Component = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLDivElement | null>(null);
  const scrollProgressRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const cameraVelocity = useRef({ x: 0, y: 0, z: 0 });

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [isReady, setIsReady] = useState<boolean>(false);
  const totalSections = 2;

  const threeRefs = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    composer: EffectComposer | null;
    stars: THREE.Points[];
    nebula: THREE.Mesh | null;
    mountains: THREE.Mesh[];
    animationId: number | null;
    targetCameraX?: number;
    targetCameraY?: number;
    targetCameraZ?: number;
    locations?: number[];
  }>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    animationId: null
  });

  // ─── THREE.JS INITIALIZATION ─────────────────────────────────────────────────
  useEffect(() => {
    const initThree = () => {
      const { current: refs } = threeRefs;

      // Scene
      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

      // Camera
      refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
      refs.camera.position.z = 100;
      refs.camera.position.y = 20;

      // Renderer — ACESFilmic tonemapping for cinematic look
      refs.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true, alpha: true });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.5;

      // Post-processing: bloom (UnrealBloomPass)
      refs.composer = new EffectComposer(refs.renderer);
      refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
      refs.composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,   // strength
        0.4,   // radius
        0.85   // threshold
      ));

      createStarField();
      createNebula();
      createMountains();
      createAtmosphere();
      getLocation();
      animate();

      setIsReady(true);
    };

    // ─── STAR FIELD — 3 depth layers, custom GLSL ──────────────────────────────
    // Each layer rotates at different speed; additive blending = no black backgrounds
    const createStarField = () => {
      const { current: refs } = threeRefs;
      const starCount = 5000;

      for (let i = 0; i < 3; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          // Spherical distribution
          const radius = 200 + Math.random() * 800;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          // Color: 70% white, 20% warm (orange), 10% cool (blue)
          const color = new THREE.Color();
          const colorChoice = Math.random();
          if (colorChoice < 0.7) color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
          else if (colorChoice < 0.9) color.setHSL(0.08, 0.5, 0.8);
          else color.setHSL(0.6, 0.5, 0.8);

          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;
          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: { time: { value: 0 }, depth: { value: i } },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float depth;
            void main() {
              vColor = color;
              vec3 pos = position;
              // Depth-based rotation speed — deeper layers rotate slower
              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;
              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;
              float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
              gl_FragColor = vec4(vColor, opacity);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const stars = new THREE.Points(geometry, material);
        refs.scene!.add(stars);
        refs.stars.push(stars);
      }
    };

    // ─── NEBULA — animated sine-wave displaced plane with color mixing ──────────
    const createNebula = () => {
      const { current: refs } = threeRefs;

      const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x0033ff) },
          color2: { value: new THREE.Color(0xff0066) },
          opacity: { value: 0.3 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float time;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += elevation;
            vElevation = elevation;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;
          void main() {
            float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
            float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            alpha *= 1.0 + vElevation * 0.01;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -1050;
      refs.scene!.add(nebula);
      refs.nebula = nebula;
    };

    // ─── MOUNTAIN SILHOUETTES — procedural ShapeGeometry layers ───────────────
    // Each layer: darker/more opaque in front, lighter/more transparent in back
    const createMountains = () => {
      const { current: refs } = threeRefs;

      const layers = [
        { distance: -50,  height: 60,  color: 0x1a1a2e, opacity: 1.0 },
        { distance: -100, height: 80,  color: 0x16213e, opacity: 0.8 },
        { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6 },
        { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4 }
      ];

      layers.forEach((layer, index) => {
        const points: THREE.Vector2[] = [];
        const segments = 50;

        for (let i = 0; i <= segments; i++) {
          const x = (i / segments - 0.5) * 1000;
          const y = Math.sin(i * 0.1) * layer.height +
                    Math.sin(i * 0.05) * layer.height * 0.5 +
                    Math.random() * layer.height * 0.2 - 100;
          points.push(new THREE.Vector2(x, y));
        }
        // Close the shape at the bottom
        points.push(new THREE.Vector2(5000, -300));
        points.push(new THREE.Vector2(-5000, -300));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide
        });

        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = layer.distance;
        mountain.position.y = layer.distance;
        mountain.userData = { baseZ: layer.distance, index };
        refs.scene!.add(mountain);
        refs.mountains.push(mountain);
      });
    };

    // ─── ATMOSPHERE — Fresnel-like edge glow sphere ────────────────────────────
    const createAtmosphere = () => {
      const { current: refs } = threeRefs;

      const geometry = new THREE.SphereGeometry(600, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform float time;
          void main() {
            // Fresnel: bright at edges, transparent at center
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            atmosphere *= pulse;
            gl_FragColor = vec4(atmosphere, intensity * 0.25);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      refs.scene!.add(new THREE.Mesh(geometry, material));
    };

    // ─── ANIMATION LOOP ─────────────────────────────────────────────────────────
    // Camera lerp (0.05) → smooth scroll-driven flythrough
    // Star rotation per-frame via uniform time
    // Mountain float via sine/cosine
    const animate = () => {
      const { current: refs } = threeRefs;
      refs.animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      refs.stars.forEach((starField) => {
        if (starField.material instanceof THREE.ShaderMaterial) {
          starField.material.uniforms.time.value = time;
        }
      });

      if (refs.nebula && refs.nebula.material instanceof THREE.ShaderMaterial) {
        refs.nebula.material.uniforms.time.value = time * 0.5;
      }

      if (refs.camera && refs.targetCameraX !== undefined) {
        const s = 0.05; // lerp factor
        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * s;
        smoothCameraPos.current.y += (refs.targetCameraY! - smoothCameraPos.current.y) * s;
        smoothCameraPos.current.z += (refs.targetCameraZ! - smoothCameraPos.current.z) * s;

        // Subtle floating motion layered on top of scroll position
        refs.camera.position.x = smoothCameraPos.current.x + Math.sin(time * 0.1) * 2;
        refs.camera.position.y = smoothCameraPos.current.y + Math.cos(time * 0.15) * 1;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      refs.mountains.forEach((mountain, i) => {
        const parallaxFactor = 1 + i * 0.5;
        mountain.position.x = Math.sin(time * 0.1) * 2 * parallaxFactor;
        mountain.position.y = 50 + (Math.cos(time * 0.15) * 1 * parallaxFactor);
      });

      refs.composer?.render();
    };

    initThree();

    const handleResize = () => {
      const { current: refs } = threeRefs;
      if (refs.camera && refs.renderer && refs.composer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
        refs.composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      const { current: refs } = threeRefs;
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      window.removeEventListener('resize', handleResize);
      refs.stars.forEach(s => { s.geometry.dispose(); (s.material as THREE.Material).dispose(); });
      refs.mountains.forEach(m => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      if (refs.nebula) { refs.nebula.geometry.dispose(); (refs.nebula.material as THREE.Material).dispose(); }
      refs.renderer?.dispose();
    };
  }, []);

  // Snapshot mountain Z positions after creation
  const getLocation = () => {
    const { current: refs } = threeRefs;
    refs.locations = refs.mountains.map(m => m.position.z);
  };

  // ─── GSAP ENTER ANIMATION ────────────────────────────────────────────────────
  // Fires once after Three.js is ready — staggered character reveal + slide-ins
  useEffect(() => {
    if (!isReady) return;

    gsap.set([menuRef.current, titleRef.current, subtitleRef.current, scrollProgressRef.current], {
      visibility: 'visible'
    });

    const tl = gsap.timeline();

    if (menuRef.current) {
      tl.from(menuRef.current, { x: -100, opacity: 0, duration: 1, ease: "power3.out" });
    }
    if (titleRef.current) {
      const titleChars = titleRef.current.querySelectorAll('.title-char');
      tl.from(titleChars, { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: "power4.out" }, "-=0.5");
    }
    if (subtitleRef.current) {
      const subtitleLines = subtitleRef.current.querySelectorAll('.subtitle-line');
      tl.from(subtitleLines, { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out" }, "-=0.8");
    }
    if (scrollProgressRef.current) {
      tl.from(scrollProgressRef.current, { opacity: 0, y: 50, duration: 1, ease: "power2.out" }, "-=0.5");
    }

    return () => { tl.kill(); };
  }, [isReady]);

  // ─── SCROLL HANDLER — camera waypoint interpolation + mountain parallax ─────
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);

      setScrollProgress(progress);
      setCurrentSection(Math.floor(progress * totalSections));

      const { current: refs } = threeRefs;

      // Interpolate camera between section waypoints
      const totalProgress = progress * totalSections;
      const sectionProgress = totalProgress % 1;
      const sectionIndex = Math.floor(totalProgress);

      const cameraPositions = [
        { x: 0, y: 30, z: 300 },   // Section 0 — HORIZON
        { x: 0, y: 40, z: -50 },   // Section 1 — COSMOS
        { x: 0, y: 50, z: -700 }   // Section 2 — INFINITY
      ];

      const currentPos = cameraPositions[sectionIndex] || cameraPositions[0];
      const nextPos = cameraPositions[sectionIndex + 1] || currentPos;

      refs.targetCameraX = currentPos.x + (nextPos.x - currentPos.x) * sectionProgress;
      refs.targetCameraY = currentPos.y + (nextPos.y - currentPos.y) * sectionProgress;
      refs.targetCameraZ = currentPos.z + (nextPos.z - currentPos.z) * sectionProgress;

      // Mountain parallax — different speeds per layer
      refs.mountains.forEach((mountain, i) => {
        const speed = 1 + i * 0.9;
        const targetZ = mountain.userData.baseZ + scrollY * speed * 0.5;
        mountain.userData.targetZ = targetZ;

        // At 70% scroll: fly mountains off-screen for full nebula reveal
        if (progress > 0.7) mountain.position.z = 600000;
        if (progress < 0.7) mountain.position.z = refs.locations![i];
      });

      if (refs.nebula) refs.nebula.position.z = refs.mountains[3].position.z;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalSections]);

  return (
    <div ref={containerRef} className="hero-container cosmos-style">
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* Side menu — slides in from left on mount */}
      <div ref={menuRef} className="side-menu" style={{ visibility: 'hidden' }}>
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="vertical-text">SPACE</div>
      </div>

      {/* Hero headline + subtitle */}
      <div className="hero-content cosmos-content">
        <h1 ref={titleRef} className="hero-title">HORIZON</h1>
        <div ref={subtitleRef} className="hero-subtitle cosmos-subtitle">
          <p className="subtitle-line">Where vision meets reality,</p>
          <p className="subtitle-line">we shape the future of tomorrow</p>
        </div>
      </div>

      {/* Scroll progress indicator */}
      <div ref={scrollProgressRef} className="scroll-progress" style={{ visibility: 'hidden' }}>
        <div className="scroll-text">SCROLL</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
        <div className="section-counter">
          {String(currentSection).padStart(2, '0')} / {String(totalSections).padStart(2, '0')}
        </div>
      </div>

      {/* Scroll sections — provides page height for scroll distance */}
      <div className="scroll-sections">
        {[...Array(2)].map((_, i) => {
          const titles: Record<number, string> = { 0: 'HORIZON', 1: 'COSMOS', 2: 'INFINITY' };
          const subtitles: Record<number, { line1: string; line2: string }> = {
            0: { line1: 'Where vision meets reality,', line2: 'we shape the future of tomorrow' },
            1: { line1: 'Beyond the boundaries of imagination,', line2: 'lies the universe of possibilities' },
            2: { line1: 'In the space between thought and creation,', line2: 'we find the essence of true innovation' }
          };
          return (
            <section key={i} className="content-section">
              <h1 className="hero-title">{titles[i + 1] || 'DEFAULT'}</h1>
              <div className="hero-subtitle cosmos-subtitle">
                <p className="subtitle-line">{subtitles[i + 1].line1}</p>
                <p className="subtitle-line">{subtitles[i + 1].line2}</p>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

// ─── REQUIRED CSS (globals.css or component CSS) ────────────────────────────────
/*
.hero-container { position: relative; width: 100%; }
.hero-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: 0; }
.side-menu { position: fixed; left: 20px; top: 50%; transform: translateY(-50%); z-index: 10; display: flex; flex-direction: column; gap: 16px; }
.menu-icon { display: flex; flex-direction: column; gap: 4px; cursor: pointer; }
.menu-icon span { display: block; width: 24px; height: 2px; background: white; }
.vertical-text { writing-mode: vertical-rl; text-orientation: mixed; font-size: 10px; letter-spacing: 0.2em; color: rgba(255,255,255,0.5); }
.hero-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; text-align: center; }
.hero-title { font-size: clamp(4rem, 12vw, 10rem); font-weight: 900; color: #ff2200; letter-spacing: -0.02em; overflow: hidden; }
.hero-subtitle { margin-top: 24px; }
.subtitle-line { font-size: clamp(0.9rem, 1.5vw, 1.1rem); color: rgba(255,255,255,0.7); line-height: 1.8; overflow: hidden; }
.scroll-progress { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); z-index: 10; display: flex; align-items: center; gap: 16px; }
.scroll-text { font-size: 10px; letter-spacing: 0.2em; color: rgba(255,255,255,0.5); }
.progress-track { width: 120px; height: 1px; background: rgba(255,255,255,0.2); }
.progress-fill { height: 100%; background: white; transition: width 0.1s linear; }
.section-counter { font-size: 10px; letter-spacing: 0.1em; color: rgba(255,255,255,0.5); font-variant-numeric: tabular-nums; }
.scroll-sections { position: relative; z-index: 1; }
.content-section { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
*/

// ─── DEMO ───────────────────────────────────────────────────────────────────────
// import { Component } from "@/components/ui/horizon-hero-section";
// export default function Page() { return <Component />; }
