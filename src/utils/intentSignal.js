// src/utils/intentSignal.js
const KEY = "waoc:intent_log_v1";

export function logIntent(intent, meta = {}) {
  try {
    const item = {
      t: Date.now(),
      intent: intent || "unknown",
      durationMin: meta.durationMin ?? 10,
      mode: meta.mode ?? "Solo",
      sound: meta.sound ?? "Silence",
    };
    const arr = readLog();
    arr.push(item);
    localStorage.setItem(KEY, JSON.stringify(arr.slice(-500)));
  } catch {}
}

export function getPulseFromLog({ intent = null, mode = "Solo", durationMin = 10 } = {}) {
  try {
    const arr = readLog();
    const now = Date.now();
    const windowMs = 6 * 60 * 60 * 1000;
    const recent = arr.filter((x) => now - x.t < windowMs);

    let score = 0.20;
    score += Math.min(0.18, recent.length * 0.008);

    if (intent === "peace") score += 0.02;
    if (intent === "unity") score += 0.05;
    if (intent === "awareness") score += 0.07;
    if (intent === "compassion") score += 0.05;

    if (String(mode).toLowerCase().includes("collect")) score += 0.05;
    score += Math.min(0.05, Math.max(0, (durationMin - 10) / 60));
    score += (Math.random() - 0.5) * 0.01;

    return clamp(score, 0.15, 0.55);
  } catch {
    return 0.25;
  }
}

export function clearIntentLog() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

/* ---------- internal ---------- */
function readLog() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

