// src/components/proof/ProofCardCanvas.jsx
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SIZE = 1024;

const ProofCardCanvas = forwardRef(function ProofCardCanvas({ data }, ref) {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    toBlob: () =>
      new Promise((resolve) => {
        if (!canvasRef.current) return resolve(null);
        canvasRef.current.toBlob((blob) => resolve(blob), "image/png");
      }),
  }));

  useEffect(() => {
    if (!data) return;
    draw(canvasRef.current, data);
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{ width: "100%", height: "auto", borderRadius: 24, display: "block" }}
    />
  );
});

export default ProofCardCanvas;

/* ---------- Drawing ---------- */

function draw(canvas, data) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = SIZE;
  const H = SIZE;

  ctx.clearRect(0, 0, W, H);

  drawCosmicBackground(ctx, W, H, data?.variantSeed);
  drawEnergyRings(ctx, W, H);
  drawCoreGlow(ctx, W, H);
  drawFrame(ctx, W, H);
  drawText(ctx, W, H, data);
}

function seededRand(seedStr = "") {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return (h >>> 0) / 4294967296;
  };
}

function drawCosmicBackground(ctx, W, H, seed = "") {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0b1020");
  g.addColorStop(0.45, "#141b34");
  g.addColorStop(1, "#06080f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // nebula 1
  const neb1 = ctx.createRadialGradient(W * 0.25, H * 0.25, 40, W * 0.25, H * 0.25, 520);
  neb1.addColorStop(0, "rgba(99,102,241,0.22)");
  neb1.addColorStop(0.5, "rgba(168,85,247,0.10)");
  neb1.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = neb1;
  ctx.fillRect(0, 0, W, H);

  // nebula 2
  const neb2 = ctx.createRadialGradient(W * 0.85, H * 0.35, 40, W * 0.85, H * 0.35, 520);
  neb2.addColorStop(0, "rgba(34,211,238,0.18)");
  neb2.addColorStop(0.55, "rgba(59,130,246,0.08)");
  neb2.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, W, H);

  // stars (deterministic)
  const rand = seededRand(String(seed));
  for (let i = 0; i < 260; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const a = rand() * 0.22;
    const s = rand() > 0.9 ? 2 : 1;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(x, y, s, s);
  }
}

function drawEnergyRings(ctx, W, H) {
  ctx.save();
  ctx.translate(W / 2, H / 2 + 40);

  for (let i = 0; i < 6; i++) {
    const r = 120 + i * 90;
    ctx.strokeStyle = `rgba(140,170,255,${0.10 - i * 0.012})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
  ctx.setLineDash([]);
}

function drawCoreGlow(ctx, W, H) {
  const g = ctx.createRadialGradient(W / 2, H / 2 + 40, 40, W / 2, H / 2 + 40, 360);
  g.addColorStop(0, "rgba(180,200,255,0.40)");
  g.addColorStop(0.45, "rgba(130,160,255,0.18)");
  g.addColorStop(1, "rgba(130,160,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2 + 40, 360, 0, Math.PI * 2);
  ctx.fill();
}

function drawFrame(ctx, W, H) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;

  roundRect(ctx, 24, 24, W - 48, H - 48, 26);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, 44, 44, W - 88, H - 88, 22);
  ctx.stroke();

  ctx.restore();
}

function drawText(ctx, W, H, data) {
  const ritualName = data?.ritualName ?? "Awareness Field";
  const durationMinutes = data?.durationMinutes ?? 10;
  const sound = data?.sound ?? "Silence";
  const cadence = data?.cadence ?? "4–6";
  const footerLeft = data?.footerLeft ?? "WAOC Meditation";
  const footerRight = data?.footerRight ?? "weareoneconnection.org";

  ctx.save();
  ctx.fillStyle = "#fff";

  ctx.globalAlpha = 0.7;
  ctx.font = "600 26px system-ui";
  ctx.fillText("THE FIELD IS OPEN", 80, 120);

  ctx.globalAlpha = 1;
  ctx.font = "800 72px system-ui";
  ctx.fillText(ritualName, 80, 200);

  ctx.globalAlpha = 0.82;
  ctx.font = "600 32px system-ui";
  ctx.fillText(`${durationMinutes} minutes · ${sound} · ${cadence} breath`, 80, 252);

  ctx.globalAlpha = 0.40;
  ctx.font = "600 24px system-ui";
  ctx.fillText("No accounts. No tracking.", 80, H - 180);

  ctx.globalAlpha = 0.62;
  ctx.font = "700 22px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(footerLeft, 80, H - 110);

  ctx.textAlign = "right";
  ctx.fillText(footerRight, W - 80, H - 110);

  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
