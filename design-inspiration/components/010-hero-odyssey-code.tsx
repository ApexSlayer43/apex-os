// SOURCE: 21st.dev — Hero Odyssey
// DEPS: framer-motion
// STACK: React + Tailwind + TypeScript + WebGL GLSL shader
// INSTALL: npm install framer-motion

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── ELASTIC HUE SLIDER ───────────────────────────────────────────────────────
// Custom range input with spring-animated thumb and live value display.
// The native <input type="range"> handles all drag events invisibly behind
// the styled track. The styled thumb is driven by Framer motion springs.
// scale: isDragging = 1.2 creates the "elastic squeeze" feel on mouse down.

interface ElasticHueSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

const ElasticHueSlider: React.FC<ElasticHueSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 360,
  step = 1,
  label = 'Adjust Hue',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // progress is 0–1 float, thumbPosition is 0–100% for CSS positioning
  const progress = ((value - min) / (max - min));
  const thumbPosition = progress * 100;

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  // Architecture: native input is z-20 (invisible, handles events)
  // styled track and thumb are z-0/z-10/z-30 (purely visual)
  // This avoids any custom drag logic — browser handles all pointer events
  return (
    <div className="scale-50 relative w-full max-w-xs flex flex-col items-center" ref={sliderRef}>
      {label && (
        <label htmlFor="hue-slider-native" className="text-gray-300 text-sm mb-1">
          {label}
        </label>
      )}
      <div className="relative w-full h-5 flex items-center">
        {/* Native range input — invisible but handles all drag/click events */}
        <input
          id="hue-slider-native"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20"
          style={{ WebkitAppearance: 'none' }}
        />
        {/* Track background */}
        <div className="absolute left-0 w-full h-1 bg-gray-700 rounded-full z-0"></div>
        {/* Track fill — width matches thumb position */}
        <div
          className="absolute left-0 h-1 bg-blue-500 rounded-full z-10"
          style={{ width: `${thumbPosition}%` }}
        ></div>
        {/* Animated thumb — spring scale on drag. No actual dragging logic needed
            since the native input above handles it. This is pure cosmetic. */}
        <motion.div
          className="absolute top-1/2 transform -translate-y-1/2 z-30"
          style={{ left: `${thumbPosition}%` }}
          animate={{ scale: isDragging ? 1.2 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: isDragging ? 20 : 30 }}
        >
          {/* Thumb visual — add a dot/circle here if desired */}
        </motion.div>
      </div>

      {/* Live value display — AnimatePresence key={value} replaces the element
          each time value changes, triggering enter/exit animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-gray-500 mt-2"
        >
          {value}°
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── LIGHTNING COMPONENT (WEBGL GLSL SHADER) ─────────────────────────────────
// Full-screen WebGL canvas running a custom fragment shader.
// The shader uses FBM (fractal Brownian motion) noise to distort UV space,
// then draws a 1/dist lightning beam through the distorted field.
// Hue is a uniform — changing it in real time re-renders immediately.

interface LightningProps {
  hue?: number;        // 0–360: color of the lightning beam via HSV→RGB
  xOffset?: number;    // horizontal origin bias for the beam
  speed?: number;      // animation rate multiplier
  intensity?: number;  // brightness multiplier for the beam
  size?: number;       // scale of the FBM noise texture
}

const Lightning: React.FC<LightningProps> = ({
  hue = 230,
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Canvas must match its CSS display size in pixels
    // or WebGL viewport will be wrong (stretched/blurry)
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // ── VERTEX SHADER: passthrough — all work is in the fragment shader ──
    // Full-screen quad: -1 to +1 in both X and Y
    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // ── FRAGMENT SHADER: FBM lightning ────────────────────────────────────
    // Core algorithm:
    // 1. Normalize UV to -1..+1 centered, aspect-corrected
    // 2. Displace UV by FBM noise (creates organic, non-straight lightning)
    // 3. Compute distance from X=0 axis (the beam center)
    // 4. Color = baseColor * (intensity / dist) — classic 1/r falloff
    //
    // FBM = 10 octaves of noise, each octave: rotate45° + scale2x + half amplitude
    // The rotation prevents axis-aligned artifacts from appearing in the noise
    //
    // HSV→RGB: GLSL vectorized, no if-statements
    // uHue passes the React state hue value directly as a float uniform
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;       // 0–360 degrees
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;

      #define OCTAVE_COUNT 10

      // HSV to RGB conversion — vectorized, no branching
      // Input: c = (hue 0–1, saturation 0–1, value 0–1)
      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      // 1D hash — pseudo-random float from float
      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      // 2D hash — pseudo-random float from vec2
      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      // 2x2 rotation matrix — used per FBM octave to prevent axis artifacts
      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      // Value noise — bilinear interpolation of 4 hash samples
      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      // FBM: 10 octaves of noise, each octave rotated 0.45 rad and scaled 2x
      // Each octave: value += amplitude * noise(p)
      // Rotation per octave prevents diagonal striping artifacts
      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45);  // ~25.8° rotation per octave
              p *= 2.0;             // frequency doubles each octave
              amplitude *= 0.5;     // amplitude halves each octave
          }
          return value;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          // Normalize to -1..+1, centered, aspect-corrected
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          uv.x += uXOffset;  // horizontal offset shifts beam origin

          // Displace UV by FBM — this is what makes the lightning not straight
          // The 0.8 * iTime * uSpeed drives temporal animation
          uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;

          // Lightning = 1/dist from the X=0 axis
          // hash11(iTime) adds frame-to-frame flicker (subtle brightness variation)
          float dist = abs(uv.x);
          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
          vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
          col = pow(col, vec3(1.0));
          fragColor = vec4(col, 1.0);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    // ── SHADER COMPILATION HELPER ──────────────────────────────────────────
    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    // ── PROGRAM LINKING ────────────────────────────────────────────────────
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // ── FULL-SCREEN QUAD ───────────────────────────────────────────────────
    // 2 triangles covering the NDC space (-1 to +1 in X and Y)
    // 6 vertices = 2 triangles = 1 quad
    const vertices = new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // ── UNIFORM LOCATIONS ─────────────────────────────────────────────────
    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const uHueLocation = gl.getUniformLocation(program, "uHue");
    const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
    const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
    const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
    const uSizeLocation = gl.getUniformLocation(program, "uSize");

    // ── RENDER LOOP ────────────────────────────────────────────────────────
    // performance.now() → time in seconds, drives the animation
    // Uniforms update every frame — hue changes take effect immediately
    const startTime = performance.now();
    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);

      const currentTime = performance.now();
      gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
      gl.uniform1f(uHueLocation, hue);
      gl.uniform1f(uXOffsetLocation, xOffset);
      gl.uniform1f(uSpeedLocation, speed);
      gl.uniform1f(uIntensityLocation, intensity);
      gl.uniform1f(uSizeLocation, size);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [hue, xOffset, speed, intensity, size]);
  // Dependency array: any prop change tears down and rebuilds the WebGL context
  // with the new uniform values. For hue, this means instant color change.

  return <canvas ref={canvasRef} className="w-full h-full relative" />;
};

// ─── FEATURE ITEM ─────────────────────────────────────────────────────────────
// Floating label with a glow dot. Position is passed as a Tailwind absolute
// positioning string (e.g. "left-0 top-40"). The dot has a blur halo behind
// it that brightens on hover. The entire item scales 110% on hover.
// pointer-events-auto on these allows hover even over the canvas layer.

interface FeatureItemProps {
  name: string;
  value: string;
  position: string;  // Tailwind positioning classes, e.g. "left-0 sm:left-10 top-40"
}

const FeatureItem: React.FC<FeatureItemProps> = ({ name, value, position }) => {
  return (
    <div className={`absolute ${position} z-10 group transition-all duration-300 hover:scale-110`}>
      <div className="flex items-center gap-2 relative">
        <div className="relative">
          {/* White dot — pulses on hover */}
          <div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse"></div>
          {/* Blur halo behind the dot — creates glow effect */}
          <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="text-white relative">
          <div className="font-medium group-hover:text-white transition-colors duration-300">{name}</div>
          <div className="text-white/70 text-sm group-hover:text-white/70 transition-colors duration-300">{value}</div>
          {/* Background glow behind text block */}
          <div className="absolute -inset-2 bg-white/10 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN HERO SECTION ────────────────────────────────────────────────────────
// Layer stack (back to front):
// z-0  → WebGL lightning canvas (absolute inset-0)
// z-0  → Black overlay (absolute inset-0, bg-black/80) — tones down raw shader
// z-0  → Radial gradient sphere (absolute centered, CSS radial-gradient)
// z-0  → Blue/purple glow blob (absolute, blur-3xl — ambient light effect)
// z-10 → FeatureItem floating labels
// z-20 → Nav + hero text content
// z-30 → CTA button (needs to be above feature items)

export const HeroSection: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightningHue, setLightningHue] = useState(220); // Default: blue

  // ── FRAMER MOTION VARIANTS ──────────────────────────────────────────────
  // containerVariants staggers child animations with 0.3s gap between each
  // staggerChildren fires children in DOM order
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative w-full bg-black text-white overflow-hidden">
      {/* ── FOREGROUND CONTENT ─────────────────────────────────────────────── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-screen">

        {/* ── FROSTED GLASS NAV ─────────────────────────────────────────── */}
        {/* backdrop-blur-3xl + bg-black/50 creates the frosted glass look.
            rounded-50 is a very high border-radius for the pill shape. */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="px-4 backdrop-blur-3xl bg-black/50 rounded-50 py-4 flex justify-between items-center mb-12"
        >
          <div className="flex items-center">
            {/* Diamond SVG wordmark */}
            <div className="text-2xl font-bold">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 5L5 20L20 35L35 20L20 5Z" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            {/* Desktop nav links — hidden on mobile */}
            <div className="hidden md:flex items-center space-x-6 ml-8">
              <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full text-sm transition-colors">Start</button>
              <button className="px-4 py-2 text-sm hover:text-gray-300 transition-colors">Home</button>
              <button className="px-4 py-2 text-sm hover:text-gray-300 transition-colors">Contacts</button>
              <button className="px-4 py-2 text-sm hover:text-gray-300 transition-colors">Help</button>
              <button className="px-4 py-2 text-sm hover:text-gray-300 transition-colors">Docs</button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hidden md:block px-4 py-2 text-sm hover:text-gray-300 transition-colors">Register</button>
            <button className="px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full text-sm hover:bg-gray-700/80 transition-colors">Application</button>
            {/* Mobile hamburger — state-toggled SVG swap (no libraries needed) */}
            <button
              className="md:hidden p-2 rounded-md focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── MOBILE FULL-SCREEN MENU ───────────────────────────────────── */}
        {/* fixed inset-0 covers the entire viewport. z-50 above all content.
            AnimatePresence not used here — conditional render handles it. */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-lg"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-6 text-lg">
              <button className="absolute top-6 right-6 p-2" onClick={() => setMobileMenuOpen(false)}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button className="px-6 py-3 bg-gray-800/50 rounded-full">Start</button>
              <button className="px-6 py-3">Home</button>
              <button className="px-6 py-3">Contacts</button>
              <button className="px-6 py-3">Help</button>
              <button className="px-6 py-3">Docs</button>
              <button className="px-6 py-3">Register</button>
              <button className="px-6 py-3 bg-gray-800/80 backdrop-blur-sm rounded-full">Application</button>
            </div>
          </motion.div>
        )}

        {/* ── FEATURE ITEMS (floating labels) ────────────────────────────── */}
        {/* Each FeatureItem is wrapped in a motion.div that uses itemVariants.
            The container staggerChildren drives them in sequentially. */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full z-200 top-[30%] relative"
        >
          <motion.div variants={itemVariants}>
            <FeatureItem name="React" value="for base" position="left-0 sm:left-10 top-40" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Tailwind" value="for styles" position="left-1/4 top-24" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Framer-motion" value="for animations" position="right-1/4 top-24" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <FeatureItem name="Shaders" value="for lightning" position="right-0 sm:right-10 top-40" />
          </motion.div>
        </motion.div>

        {/* ── HERO TEXT CONTENT ──────────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-30 flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          {/* Hue slider — live-updates lightning color via React state */}
          <ElasticHueSlider
            value={lightningHue}
            onChange={setLightningHue}
            label="Adjust Lightning Hue"
          />

          {/* Pill badge CTA — arrow icon translates right on hover */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6 transition-all duration-300 group"
          >
            <span>Join us for free world</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transform group-hover:translate-x-1 transition-transform duration-300">
              <path d="M8 3L13 8L8 13M13 8H3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>

          {/* Main headline — font-light gives it editorial feel (not bold/heavy) */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-light mb-2">
            Hero Odyssey
          </motion.h1>

          {/* Gradient subheadline — bg-clip-text creates the gradient text effect */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl pb-3 font-light bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 bg-clip-text text-transparent"
          >
            Lighting Up The Future
          </motion.h2>

          <motion.p variants={itemVariants} className="text-gray-400 mb-9 max-w-2xl">
            Lightning animation is 100% code generated, so feel free to customize it to your liking.
          </motion.p>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-[100px] sm:mt-[100px] px-8 py-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
          >
            Discover Those Worlds
          </motion.button>
        </motion.div>
      </div>

      {/* ── BACKGROUND LAYER STACK ─────────────────────────────────────────── */}
      {/* All z-0 — entire bg stack sits behind the z-20 foreground content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        {/* Black overlay — prevents raw shader from being too bright */}
        <div className="absolute inset-0 bg-black/80"></div>

        {/* Ambient glow blob — blue/purple radial, blur-3xl, centered behind sphere */}
        <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-blue-500/20 to-purple-600/10 blur-3xl"></div>

        {/* WebGL lightning canvas — full width/height of the bg container */}
        <div className="absolute top-0 w-[100%] left-1/2 transform -translate-x-1/2 h-full">
          <Lightning
            hue={lightningHue}
            xOffset={0}
            speed={1.6}
            intensity={0.6}
            size={2}
          />
        </div>

        {/* CSS sphere / planet — radial-gradient creates a 3D orb illusion.
            backdrop-blur-3xl frosts anything behind this sphere.
            The gradient: bright blue highlight at 25%/90%, fades to near-black.
            Position: centered at 55% from top, below the hero text */}
        <div className="z-10 absolute top-[55%] left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] backdrop-blur-3xl rounded-full bg-[radial-gradient(circle_at_25%_90%,_#1e386b_15%,_#000000de_70%,_#000000ed_100%)]"></div>
      </motion.div>
    </div>
  );
};

// ─── DEMO USAGE ───────────────────────────────────────────────────────────────
/*
// Default (blue hue 220)
<HeroSection />

// AetherTrace adaptation:
// - Change title to "Evidence Sealed." / "Cryptographically."
// - Change hue default to 180 (teal/cyan) — matches AetherTrace palette
// - Change FeatureItems to: "SHA-256 / on capture", "Chain / append-only",
//   "Timestamp / immutable", "Verify / public URL"
// - Change lightning speed to 1.2 (slightly slower = more deliberate)
// - Change intensity to 0.4 (subtler = professional, not flashy)
// - The sphere backdrop serves as a "data orb" / custody container visual

// High-energy neon (demo mode):
// <Lightning hue={120} speed={2.5} intensity={1.2} size={1.5} />

// Slow, meditative purple:
// <Lightning hue={280} speed={0.8} intensity={0.5} size={3} />

// Emergency red (alert state):
// <Lightning hue={0} speed={3.0} intensity={1.5} size={1} />
*/
