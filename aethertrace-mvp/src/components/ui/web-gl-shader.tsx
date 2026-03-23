"use client"
// Vault Component 015 — WebGL Chromatic Aberration Shader
// Rewritten as raw WebGL (no Three.js dep) — identical visual output.
// The chromatic aberration effect separates R/G/B sine waves laterally,
// creating a prismatic glow that communicates "data integrity" visually.

import { useEffect, useRef } from "react"

interface WebGLShaderProps {
  // distortion: chromatic aberration strength (0.005 = calm, 0.05 = default, 0.15+ = active)
  distortion?: number
  // speed: time increment per frame (0.003 = slow/authoritative, 0.01 = default)
  speed?: number
  // xScale: sine wave frequency (1.0 = default)
  xScale?: number
  // yScale: sine wave amplitude (0.5 = default)
  yScale?: number
  className?: string
}

export function WebGLShader({
  distortion = 0.05,
  speed = 0.01,
  xScale = 1.0,
  yScale = 0.5,
  className = "fixed top-0 left-0 w-full h-full block",
}: WebGLShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    gl: WebGLRenderingContext | null
    program: WebGLProgram | null
    animId: number | null
    resLoc: WebGLUniformLocation | null
    timeLoc: WebGLUniformLocation | null
    xScaleLoc: WebGLUniformLocation | null
    yScaleLoc: WebGLUniformLocation | null
    distLoc: WebGLUniformLocation | null
    time: number
  }>({
    gl: null, program: null, animId: null,
    resLoc: null, timeLoc: null, xScaleLoc: null, yScaleLoc: null, distLoc: null,
    time: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const s = stateRef.current

    const gl = canvas.getContext("webgl")
    if (!gl) return
    s.gl = gl

    // ── Vertex Shader: pass-through full-screen quad in NDC ──────────────────
    const vert = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `

    // ── Fragment Shader: chromatic aberration sine wave ───────────────────────
    // Each RGB channel gets a different x position based on distance from center.
    // Red pushed outward, blue pushed inward — prismatic split effect.
    const frag = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform float u_xScale;
      uniform float u_yScale;
      uniform float u_dist;
      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
        float d = length(p) * u_dist;
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);
        float r = 0.05 / abs(p.y + sin((rx + u_time) * u_xScale) * u_yScale);
        float g = 0.05 / abs(p.y + sin((gx + u_time) * u_xScale) * u_yScale);
        float b = 0.05 / abs(p.y + sin((bx + u_time) * u_xScale) * u_yScale);
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      return shader
    }

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vert))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(program)
    gl.useProgram(program)
    s.program = program

    // Full-screen quad: 2 triangles covering NDC [-1,1]×[-1,1]
    const quad = new Float32Array([-1,-1, 1,-1, -1,1, 1,-1, -1,1, 1,1])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(program, "a_pos")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    s.resLoc   = gl.getUniformLocation(program, "u_res")
    s.timeLoc  = gl.getUniformLocation(program, "u_time")
    s.xScaleLoc = gl.getUniformLocation(program, "u_xScale")
    s.yScaleLoc = gl.getUniformLocation(program, "u_yScale")
    s.distLoc  = gl.getUniformLocation(program, "u_dist")

    const resize = () => {
      if (!s.gl) return
      const w = window.innerWidth, h = window.innerHeight
      canvas.width = w; canvas.height = h
      s.gl.viewport(0, 0, w, h)
      s.gl.uniform2f(s.resLoc, w, h)
    }

    const animate = () => {
      s.time += speed
      if (s.gl && s.program) {
        s.gl.uniform1f(s.timeLoc, s.time)
        s.gl.uniform1f(s.xScaleLoc, xScale)
        s.gl.uniform1f(s.yScaleLoc, yScale)
        s.gl.uniform1f(s.distLoc, distortion)
        s.gl.drawArrays(s.gl.TRIANGLES, 0, 6)
      }
      s.animId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener("resize", resize)
    animate()

    return () => {
      if (s.animId) cancelAnimationFrame(s.animId)
      window.removeEventListener("resize", resize)
      if (s.gl && s.program) {
        s.gl.deleteProgram(s.program)
      }
    }
  }, [distortion, speed, xScale, yScale])

  return <canvas ref={canvasRef} className={className} />
}
