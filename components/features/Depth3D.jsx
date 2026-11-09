"use client";

import { useEffect, useRef } from "react";

// A photo that looks 3D: a WebGL shader shifts each pixel by its depth (from a hand-made depth map)
// as the pointer moves or the phone tilts. Returns nothing visible if WebGL is missing or motion is reduced;
// the normal <img> underneath stays.
const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;
const FS = `precision mediump float;
uniform sampler2D img; uniform sampler2D dep; uniform vec2 off; varying vec2 uv;
void main(){
 float d = texture2D(dep, uv).r;
 vec2 p = uv - off * (d - .42) * .042;
 // a second, smaller step reduces stretching at depth edges
 float d2 = texture2D(dep, p).r;
 p = uv - off * (mix(d, d2, .5) - .42) * .042;
 gl_FragColor = texture2D(img, clamp(p, .002, .998));
}`;

export function Depth3D({ src, depth, onOffset, className = "" }) {
 const ref = useRef(null);

 useEffect(() => {
  const canvas = ref.current;
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
  if (!gl) return;
  const sh = (type, s) => {
   const o = gl.createShader(type);
   gl.shaderSource(o, s);
   gl.compileShader(o);
   return o;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uOff = gl.getUniformLocation(prog, "off");

  const tex = (unit, im) => {
   const t = gl.createTexture();
   gl.activeTexture(gl.TEXTURE0 + unit);
   gl.bindTexture(gl.TEXTURE_2D, t);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
  };
  const load = (u) =>
   new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = u;
   });

  let raf = 0;
  let alive = true;
  let visible = true;
  let cur = [0, 0];
  let target = [0, 0];
  let lastInput = 0;
  const t0 = performance.now();

  const size = () => {
   const dpr = Math.min(2, window.devicePixelRatio || 1);
   canvas.width = Math.round(canvas.clientWidth * dpr);
   canvas.height = Math.round(canvas.clientHeight * dpr);
   gl.viewport(0, 0, canvas.width, canvas.height);
  };
  const frame = (now) => {
   raf = 0;
   if (!alive || !visible) return;
   // no input for a while: drift slowly so it still feels alive
   if (now - lastInput > 2500) {
    const t = (now - t0) / 1000;
    target = [Math.sin(t * 0.45) * 0.55, Math.cos(t * 0.33) * 0.3];
   }
   cur = [cur[0] + (target[0] - cur[0]) * 0.07, cur[1] + (target[1] - cur[1]) * 0.07];
   gl.uniform2f(uOff, cur[0], cur[1]);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
   onOffset?.(cur);
   raf = requestAnimationFrame(frame);
  };
  const kick = () => {
   if (!raf && alive && visible) raf = requestAnimationFrame(frame);
  };

  const host = canvas.parentElement;
  const move = (e) => {
   const r = host.getBoundingClientRect();
   target = [Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)), Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))];
   lastInput = performance.now();
  };
  const tilt = (e) => {
   if (e.gamma == null || e.beta == null) return;
   target = [Math.max(-1, Math.min(1, e.gamma / 25)), Math.max(-1, Math.min(1, (e.beta - 45) / 25))];
   lastInput = performance.now();
  };
  const io = new IntersectionObserver(([en]) => {
   visible = en.isIntersecting && document.visibilityState === "visible";
   kick();
  });

  Promise.all([load(src), load(depth)])
   .then(([im, dm]) => {
    if (!alive) return;
    tex(0, im);
    tex(1, dm);
    gl.uniform1i(gl.getUniformLocation(prog, "img"), 0);
    gl.uniform1i(gl.getUniformLocation(prog, "dep"), 1);
    size();
    canvas.style.opacity = "1";
    host.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("deviceorientation", tilt, { passive: true });
    window.addEventListener("resize", size);
    io.observe(canvas);
    kick();
   })
   .catch(() => {});

  return () => {
   alive = false;
   cancelAnimationFrame(raf);
   io.disconnect();
   host.removeEventListener("pointermove", move);
   window.removeEventListener("deviceorientation", tilt);
   window.removeEventListener("resize", size);
  };
 }, [src, depth, onOffset]);

 return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 ${className}`} />;
}
