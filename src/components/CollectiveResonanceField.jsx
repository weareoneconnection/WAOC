// src/components/CollectiveResonanceField.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function CollectiveResonanceField({
  intent = "awareness",
  mode = "Solo (in the Field)",
  durationMin = 10,
  participants = [], // [{lat, lon, w?}] 真实经纬度
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [pulse, setPulse] = useState(0.26);

  // “有人在冥想”的活动强度：不显示数量，但用于驱动光环波动
  const activity = useMemo(() => {
    const n = clamp((participants?.length || 0) / 180, 0, 1); // 180人左右到达强度上限（可改）
    const modeBoost = String(mode).toLowerCase().includes("collective") ? 0.18 : 0;
    const intentBoost = { peace: 0.08, unity: 0.12, awareness: 0.10, compassion: 0.11 }[intent] ?? 0.1;
    return clamp(n * 0.75 + modeBoost + intentBoost * 0.4, 0, 1);
  }, [participants, mode, intent]);

  const nodes = useMemo(() => {
    if (participants?.length) {
      return participants
        .map((p) => ({
          lat: clamp(Number(p.lat) || 0, -85, 85),
          lon: normLon(Number(p.lon) || 0),
          w: clamp(Number(p.w ?? 0.7), 0.15, 1),
          seed: Math.random() * 1000,
        }))
        .slice(0, 1600);
    }
    // fallback demo（不展示数量）
    const n = 48;
    return Array.from({ length: n }, () => ({
      lat: rand(-65, 65),
      lon: rand(-180, 180),
      w: rand(0.25, 0.9),
      seed: Math.random() * 1000,
    }));
  }, [participants]);

  const target = useMemo(() => {
    const base = { peace: 0.22, unity: 0.28, awareness: 0.32, compassion: 0.30 }[intent] ?? 0.26;
    const collectiveBoost = String(mode).toLowerCase().includes("collective") ? 0.06 : 0;
    const durationBoost = Math.min(0.08, Math.max(0, (Number(durationMin) - 10) / 60));
    // activity 也会拉高一点脉冲（但不直接代表“人数”）
    return clamp(base + collectiveBoost + durationBoost + activity * 0.08, 0.18, 0.62);
  }, [intent, mode, durationMin, activity]);

  useEffect(() => {
    const id = setInterval(() => {
      setPulse((p) =>
        clamp(
          p + (target - p) * 0.10 + (Math.random() - 0.5) * (0.01 + activity * 0.008),
          0.14,
          0.68
        )
      );
    }, 420);
    return () => clearInterval(id);
  }, [target, activity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let mounted = true;

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = parent.clientWidth;
      const h = Math.max(420, Math.min(620, Math.round(w * 0.50)));

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();

    function draw(now) {
      if (!mounted) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      drawSoftBackground(ctx, w, h, pulse);

      const cx = w * 0.5;
      const cy = h * 0.52;

      // ✅ 中间更大（你要的“排面”）
      const r = Math.min(w, h) * 0.30 + pulse * 9;

      const t = (now - start) / 1000;

      // ✅ 地球慢转
      const rot = t * (0.11 + pulse * 0.18);

      // 频率波动（有人冥想时更明显）
      const freq = makeFrequency(t, pulse, activity);

      // 先画背光（把主体“托起来”）
      drawBackGlow(ctx, cx, cy, r, pulse, activity);

      // ✅ 外圈“WAOC Resonance Ring”旋转 + 波动
      drawResonanceRing(ctx, cx, cy, r, t, freq, pulse, activity, 0);

      // ✅ 中间 WAOC Logo 地球（线框球 + 交错轨道）
      drawWaocGlobe(ctx, cx, cy, r, rot, t, pulse, activity);

      // nodes（真实经纬度点投影在球面上）
      const projected = nodes
        .map((p) => {
          const pt = projectLatLon(p.lat, p.lon, cx, cy, r * 0.92, rot);
          if (!pt) return null;
          pt.w = p.w;
          pt.seed = p.seed;
          return pt;
        })
        .filter(Boolean);

      // 连接线更轻（更高级）
      drawConnections(ctx, projected, pulse, activity);
      for (const pt of projected) drawNode(ctx, pt.x, pt.y, pt.depth, now, pulse, activity, pt.w);

      // ✅ 前景环（更像“包裹住地球”）
      drawResonanceRing(ctx, cx, cy, r, t, freq, pulse, activity, 1);

      // 氛围大气
      drawAtmosphere(ctx, cx, cy, r, pulse, activity);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [nodes, pulse, activity]);

  return (
    <div className="waocFieldWrap">
      <div className="waocFieldInner">
        <canvas ref={canvasRef} className="waocCanvas" />
      </div>

      <style>{`
        .waocFieldWrap{
          background: linear-gradient(180deg, #ffffff 0%, #fbfbfc 100%);
          padding: 14px;
        }
        .waocFieldInner{
          border:1px solid #eef2f7;
          border-radius: 16px;
          background:#fff;
          overflow:hidden;
        }
        .waocCanvas{ display:block; width:100%; height:100%; }
      `}</style>
    </div>
  );
}

/* =========================
   Visuals
========================= */

function drawSoftBackground(ctx, w, h, pulse) {
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);

  const a = 0.05 + pulse * 0.11;
  const g = ctx.createRadialGradient(w * 0.5, h * 0.55, 12, w * 0.5, h * 0.55, Math.max(w, h) * 0.78);
  g.addColorStop(0, `rgba(17,24,39,${a})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 柔雾带（高级感）
  ctx.globalAlpha = 0.03 + pulse * 0.03;
  const haze = ctx.createLinearGradient(0, h * 0.30, 0, h * 0.78);
  haze.addColorStop(0, "rgba(120,180,255,0)");
  haze.addColorStop(0.5, "rgba(120,180,255,0.14)");
  haze.addColorStop(1, "rgba(170,120,255,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

function drawBackGlow(ctx, cx, cy, r, pulse, activity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.10 + pulse * 0.10 + activity * 0.10;

  const g = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.9);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.55, "rgba(120,180,255,0.14)");
  g.addColorStop(0.75, "rgba(170,120,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.9, 0, Math.PI * 2);
  ctx.fill();

  // 影子
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "rgba(17,24,39,0.25)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 1.22, r * 1.05, r * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* =========================
   WAOC Globe (logo-like)
========================= */

function drawWaocGlobe(ctx, cx, cy, r, rot, t, pulse, activity) {
  // sphere base（干净的玻璃球感）
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  const glass = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.25, cx, cy, r);
  glass.addColorStop(0, "rgba(255,255,255,0.94)");
  glass.addColorStop(0.60, "rgba(245,248,255,0.72)");
  glass.addColorStop(1, "rgba(17,24,39,0.10)");
  ctx.fillStyle = glass;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  // 内部“微纹理” —— 让它不空（但不显得像假大陆）
  ctx.save();
  ctx.globalAlpha = 0.06 + pulse * 0.05;
  ctx.filter = "blur(6px)";
  const fog = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 1.05);
  fog.addColorStop(0, "rgba(120,180,255,0.20)");
  fog.addColorStop(0.6, "rgba(170,120,255,0.12)");
  fog.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = fog;
  ctx.beginPath();
  ctx.arc(cx + Math.sin(t * 0.3) * r * 0.08, cy + Math.cos(t * 0.22) * r * 0.06, r * 1.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ✅ 地球线框网格（更像“地球”）
  drawGlobeGrid(ctx, cx, cy, r, rot, pulse);

  // ✅ WAOC Logo “交错弧线”融合进球（不突兀）
  drawWaocInnerOrbits(ctx, cx, cy, r, t, pulse, activity);

  // 终结线阴影（立体）
  ctx.save();
  ctx.globalAlpha = 0.18;
  const shade = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  shade.addColorStop(0, "rgba(17,24,39,0.46)");
  shade.addColorStop(0.50, "rgba(17,24,39,0.10)");
  shade.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shade;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  // 高光
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.10 + pulse * 0.06;
  const spec = ctx.createRadialGradient(
    cx - r * 0.32,
    cy - r * 0.34,
    r * 0.08,
    cx - r * 0.10,
    cy - r * 0.12,
    r * 0.98
  );
  spec.addColorStop(0, "rgba(255,255,255,0.80)");
  spec.addColorStop(0.35, "rgba(255,255,255,0.20)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.restore(); // clip end

  // rim
  ctx.save();
  ctx.globalAlpha = 0.26 + pulse * 0.10;
  ctx.strokeStyle = "rgba(17,24,39,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawGlobeGrid(ctx, cx, cy, r, rot, pulse) {
  ctx.save();
  ctx.globalAlpha = 0.12 + pulse * 0.06;
  ctx.strokeStyle = "rgba(17,24,39,0.26)";
  ctx.lineWidth = 1;

  // 纬线
  for (let i = -3; i <= 3; i++) {
    const y = cy + (i * r) / 3.6;
    ctx.beginPath();
    ctx.ellipse(cx, y, r * 0.94, r * 0.18, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 经线：随着 rot 微微变化
  for (let i = -3; i <= 3; i++) {
    const x = cx + (i * r) / 4.0;
    ctx.beginPath();
    ctx.ellipse(x + Math.sin(rot * 0.35) * 2, cy, r * 0.18, r * 0.94, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawWaocInnerOrbits(ctx, cx, cy, r, t, pulse, activity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const alpha = 0.10 + pulse * 0.10 + activity * 0.08;
  ctx.globalAlpha = alpha;

  const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, "rgba(120,180,255,0.48)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "rgba(170,120,255,0.44)");

  // 模拟 logo 的交错：几条“粗弧线”穿过球体
  const lw = 3.2 + pulse * 1.8;
  strokeOrbit(ctx, cx, cy, r * 0.92, 0.70, t * 0.28 + 0.25, lw, grad);
  strokeOrbit(ctx, cx, cy, r * 0.90, 0.70, -t * 0.24 - 0.55, lw * 0.95, grad);
  strokeOrbit(ctx, cx, cy, r * 0.96, 0.58, t * 0.20 + 1.25, lw * 0.88, grad);

  // 细环（像 logo 的细交错）
  ctx.globalAlpha *= 0.70;
  strokeOrbit(ctx, cx, cy, r * 0.86, 0.82, t * 0.18 + 2.10, 1.6, "rgba(255,255,255,0.26)");

  ctx.restore();
}

function strokeOrbit(ctx, cx, cy, radius, squashY, rotation, lineW, strokeStyle) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.scale(1, squashY);

  ctx.lineWidth = lineW;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = strokeStyle;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/* =========================
   Resonance Ring (outer halo + frequency wobble)
========================= */

function drawResonanceRing(ctx, cx, cy, r, t, freq, pulse, activity, layer = 0) {
  const baseA = layer === 0 ? 0.12 : 0.08;
  const a = baseA + pulse * 0.12 + activity * 0.12;

  const spin = t * (layer === 0 ? 0.18 : 0.12);
  const radius = r * (layer === 0 ? 1.18 : 1.10);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = a;

  // 彩色渐变
  const cg = ctx.createLinearGradient(cx - r * 1.6, cy, cx + r * 1.6, cy);
  cg.addColorStop(0, "rgba(120,180,255,0.48)");
  cg.addColorStop(0.5, "rgba(255,255,255,0.16)");
  cg.addColorStop(1, "rgba(170,120,255,0.46)");

  // 能量雾
  ctx.globalAlpha = a * 0.55;
  const fog = ctx.createRadialGradient(cx, cy, r * 1.06, cx, cy, r * 1.85);
  fog.addColorStop(0, "rgba(255,255,255,0)");
  fog.addColorStop(0.58, "rgba(120,180,255,0.12)");
  fog.addColorStop(0.78, "rgba(170,120,255,0.10)");
  fog.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = fog;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.85, 0, Math.PI * 2);
  ctx.fill();

  // 主环：用“波动半径”画出频率效果
  ctx.globalAlpha = a;
  ctx.strokeStyle = cg;
  ctx.lineWidth = 2.0;

  const wobble = (0.010 + activity * 0.030) * r; // 人越多波动越明显（但不暴露人数）
  const seg = 140;

  ctx.beginPath();
  for (let i = 0; i <= seg; i++) {
    const ang = (i / seg) * Math.PI * 2;
    const wob = wobble * Math.sin(ang * (3 + freq.k) + spin * 2.2 + freq.phase) * (0.55 + 0.45 * freq.amp);
    const rr = radius + wob;
    const x = cx + Math.cos(ang + spin) * rr;
    const y = cy + Math.sin(ang + spin) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 次环（细一点）
  ctx.globalAlpha *= 0.55;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= seg; i++) {
    const ang = (i / seg) * Math.PI * 2;
    const wob = wobble * 0.65 * Math.sin(ang * (5 + freq.k * 0.7) - spin * 1.8 - freq.phase);
    const rr = radius * 1.06 + wob;
    const x = cx + Math.cos(ang - spin * 0.8) * rr;
    const y = cy + Math.sin(ang - spin * 0.8) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.restore();
}

function makeFrequency(t, pulse, activity) {
  // k：波数，amp：振幅，phase：相位
  const k = 2 + Math.floor(3 * activity); // 2..5
  const amp = clamp(0.35 + pulse * 0.55 + activity * 0.35, 0.2, 1);
  const phase = t * (0.9 + pulse * 1.2 + activity * 1.1);
  return { k, amp, phase };
}

/* =========================
   Atmosphere
========================= */

function drawAtmosphere(ctx, cx, cy, r, pulse, activity) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const a1 = 0.10 + pulse * 0.12 + activity * 0.10;
  ctx.globalAlpha = a1;

  const g = ctx.createRadialGradient(cx, cy, r * 0.92, cx, cy, r * 1.45);
  g.addColorStop(0.00, "rgba(255,255,255,0)");
  g.addColorStop(0.55, "rgba(120,180,255,0.18)");
  g.addColorStop(0.78, "rgba(170,120,255,0.14)");
  g.addColorStop(1.00, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.10 + pulse * 0.10;
  ctx.strokeStyle = "rgba(120,180,255,0.22)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.06 + pulse * 0.08;
  ctx.strokeStyle = "rgba(170,120,255,0.16)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.24, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/* =========================
   Nodes + Connections
========================= */

function drawConnections(ctx, pts, pulse, activity) {
  const alpha = 0.016 + pulse * 0.04 + activity * 0.03;
  ctx.save();
  ctx.strokeStyle = `rgba(17,24,39,${alpha})`;
  ctx.lineWidth = 1;

  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    let best = null;
    let bestD = Infinity;

    for (let j = 0; j < pts.length; j++) {
      if (i === j) continue;
      const b = pts[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }

    if (best && bestD < 12000) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(best.x, best.y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawNode(ctx, x, y, depth, now, pulse, activity, w = 0.7) {
  const t = now / 1000;
  const breathe = 0.62 + 0.38 * Math.sin(t * 2.0 + x * 0.01 + y * 0.01);
  const size = (1.0 + depth * 2.6 + pulse * 1.4) * (0.75 + 0.6 * w);

  ctx.save();

  // glow（蓝白 + 紫晕）
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = (0.06 + pulse * 0.14 + activity * 0.10) * breathe * (0.55 + 0.55 * w);
  ctx.fillStyle = "rgba(140,200,255,0.95)";
  ctx.beginPath();
  ctx.arc(x, y, size * 3.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha *= 0.6;
  ctx.fillStyle = "rgba(180,140,255,0.55)";
  ctx.beginPath();
  ctx.arc(x, y, size * 4.6, 0, Math.PI * 2);
  ctx.fill();

  // core
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = (0.52 + depth * 0.30) * (0.75 + 0.5 * w);
  ctx.fillStyle = "rgba(17,24,39,0.95)";
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* =========================
   Projection
========================= */

function projectLatLon(lat, lon, cx, cy, r, rot) {
  const phi = (lat * Math.PI) / 180;
  const theta = ((lon * Math.PI) / 180) + rot;

  const x = Math.cos(phi) * Math.sin(theta);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(theta);

  if (z <= 0.02) return null;

  return {
    x: cx + x * r * 0.965,
    y: cy - y * r * 0.965,
    depth: z,
    visible: true,
  };
}

/* =========================
   Utils
========================= */

function rand(a, b) {
  return a + Math.random() * (b - a);
}
function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}
function normLon(lon) {
  let x = lon;
  while (x > 180) x -= 360;
  while (x < -180) x += 360;
  return x;
}
