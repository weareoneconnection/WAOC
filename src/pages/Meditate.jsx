// src/pages/Meditate.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * WAOC Meditate (extreme upgraded)
 * - 3 phases: arriving -> breathing -> closing
 * - Breath cadence selectable (inhale/exhale)
 * - Pause/Resume/Restart/Finish
 * - Optional WebAudio sound engine (no external files)
 * - Compatible with location.state OR location.state.preset
 */

export default function Meditate() {
  const nav = useNavigate();
  const location = useLocation();

  // ✅兼容两种传参结构：state.preset 或 state 直接字段
  const incoming = location.state?.preset ?? location.state ?? {};
  const intent = incoming.intent ?? "awareness";
  const mode = incoming.mode ?? "Solo (in the Field)";
  const sound = incoming.sound ?? "Silence";
  const durationMin = Number(incoming.durationMin ?? 10);

  // ---- timing ----
  const totalSec = useMemo(() => Math.max(60, Math.round(durationMin * 60)), [durationMin]);

  // phases: arriving (short) | breathing (main) | closing (short)
  const ARRIVE_SEC = 8;
  const CLOSING_SEC = 10;

  const [phase, setPhase] = useState("arriving"); // arriving | breathing | closing
  const [running, setRunning] = useState(true);
  const [secLeft, setSecLeft] = useState(totalSec);

  // Breath cadence (inhale / exhale)
  const [cadence, setCadence] = useState("4-6"); // 4-4 | 4-6 | 4-8
  const cadenceMs = useMemo(() => {
    const [inh, exh] = cadence.split("-").map((x) => Math.max(2, Number(x)));
    return { inhaleMs: inh * 1000, exhaleMs: exh * 1000, cycleMs: (inh + exh) * 1000 };
  }, [cadence]);

  // breath direction
  const [breathDir, setBreathDir] = useState("inhale"); // inhale | exhale
  const breathCycleRef = useRef({ t0: performance.now() });

  // sound engine (web audio)
  const soundEngine = useSoundEngine(sound, running);

  // phase management
  useEffect(() => {
    // Arriving automatically transitions to breathing
    const id = setTimeout(() => {
      setPhase("breathing");
    }, ARRIVE_SEC * 1000);
    return () => clearTimeout(id);
  }, []);

  // main timer
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (secLeft === 0) setPhase("closing");
  }, [secLeft]);

  // breath direction loop (sync with cadence)
  useEffect(() => {
    if (phase !== "breathing") return;

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const elapsed = now - breathCycleRef.current.t0;
      const cycle = cadenceMs.cycleMs;
      const t = elapsed % cycle;

      const inhaleEnd = cadenceMs.inhaleMs;
      const dir = t < inhaleEnd ? "inhale" : "exhale";
      setBreathDir(dir);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, cadenceMs]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        setRunning((v) => !v);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        nav("/session", { state: { preset: incoming } });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // closing auto-finish
  useEffect(() => {
    if (phase !== "closing") return;
    const id = setTimeout(() => {
      nav("/session", { state: { preset: incoming } });
    }, CLOSING_SEC * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // display
  const mm = String(Math.floor(secLeft / 60)).padStart(2, "0");
  const ss = String(secLeft % 60).padStart(2, "0");
  const progress = 1 - secLeft / totalSec; // 0..1

  const guidance = useMemo(() => {
    if (phase === "arriving") return "Nothing is required. Only attention.";
    if (phase === "closing") return "Carry the field into the next moment.";
    // breathing
    if (breathDir === "inhale") return inhaleLine(intent);
    return exhaleLine(intent);
  }, [phase, breathDir, intent]);

  const title = useMemo(() => {
    if (phase === "arriving") return "Arriving";
    if (phase === "closing") return "Closing";
    return breathDir === "inhale" ? "Inhale" : "Exhale";
  }, [phase, breathDir]);

  // actions
  const onBack = () => nav("/session", { state: { preset: incoming } });
  const onFinish = () => {
    setPhase("closing");
    setRunning(false);
    // fade out sound
    soundEngine.stopSoft();
  };
  const onRestart = () => {
    setSecLeft(totalSec);
    setRunning(true);
    setPhase("breathing");
    breathCycleRef.current.t0 = performance.now();
    soundEngine.restartIfNeeded();
  };

  return (
    <div className="page pageFull">
      <div className="topRow">
        <div>
          <div className="kicker">MEDITATION</div>
          <div className="h1">Enter the Field</div>
          <div className="lead">Breathe. Notice. Return.</div>
        </div>

        <div className="fieldState">
          <div className="tiny">Mode: {mode}</div>
          <div className="tiny">Sound: {sound}</div>

          <div className="pill">
            <span className="pillStrong">{intentLabel(intent)}</span>
            <span className="pillDot">•</span>
            <span className="pillStrong">{mm}:{ss}</span>
          </div>
        </div>
      </div>

      <div className="meditateStage">
        <div className="stageGrid">
          {/* Orb */}
          <div className="orbWrap">
            <ProgressRing progress={progress} />

            <div
              className={[
                "breathOrb",
                phase,
                running ? "running" : "paused",
                breathDir,
              ].join(" ")}
              style={{
                // Sync animation duration with cadence
                ["--inhaleMs"]: `${cadenceMs.inhaleMs}ms`,
                ["--exhaleMs"]: `${cadenceMs.exhaleMs}ms`,
              }}
            >
              <div className="breathInner" />
              <div className="breathText">
                <div className="breathTitle">{title}</div>
                <div className="breathSub">{guidance}</div>
              </div>
            </div>

            <div className="micro">
              <span>Space: {running ? "Pause" : "Resume"}</span>
              <span className="dot">•</span>
              <span>Esc: Exit</span>
            </div>
          </div>

          {/* Controls */}
          <div className="panel">
            <div className="panelTitle">Session Controls</div>

            <div className="row">
              <div className="label">Cadence</div>
              <div className="seg">
                {["4-4", "4-6", "4-8"].map((x) => (
                  <button
                    key={x}
                    className={["segBtn", cadence === x ? "on" : ""].join(" ")}
                    onClick={() => setCadence(x)}
                    disabled={phase === "closing"}
                  >
                    {x}
                  </button>
                ))}
              </div>
              <div className="hint">Inhale–Exhale (seconds)</div>
            </div>

            <div className="row">
              <div className="label">State</div>
              <div className="chips">
                <span className="chip">{phaseLabel(phase)}</span>
                <span className="chip">{running ? "Running" : "Paused"}</span>
              </div>
              <div className="hint">No tracking. Only resonance.</div>
            </div>

            <div className="actions">
              <button className="btnGhost" onClick={onBack}>Back</button>
              <button
                className="btnGhost"
                onClick={() => setRunning((v) => !v)}
                disabled={phase === "closing"}
              >
                {running ? "Pause" : "Resume"}
              </button>
              <button className="btnGhost" onClick={onRestart}>Restart</button>
              <button className="btnPrimary" onClick={onFinish}>Finish</button>
            </div>

            <div className="waocBox">
              <div className="waocTitle">WAOC Core</div>
              <div className="waocLine">No addresses. No ranks. No counts.</div>
              <div className="waocLine">Connection is the proof — not a reward.</div>
              <div className="waocLine">You are sitting with others, even if you never met.</div>
            </div>
          </div>
        </div>
      </div>

      {/* keyframes + styles */}
      <style>{`
        /* Layout */
        .pageFull { padding-bottom: 28px; }
        .topRow { display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:flex-start; }
        .kicker { letter-spacing:.18em; font-size:12px; color:var(--muted); font-weight:900; }
        .h1 { font-size:28px; font-weight:980; margin-top:6px; }
        .lead { margin-top:8px; color:var(--muted); max-width:760px; line-height:1.45; }

        .fieldState { text-align:right; min-width:280px; }
        .tiny { font-size:12px; color:var(--muted); }
        .pill {
          margin-top:8px;
          display:inline-flex; align-items:center; gap:10px;
          border:1px solid var(--line);
          border-radius:999px;
          padding:10px 12px;
          background:#fff;
          font-weight:900;
        }
        .pillStrong { color:#111827; }
        .pillDot { color:var(--muted); }

        .meditateStage { margin-top:14px; }
        .stageGrid {
          display:grid;
          grid-template-columns: 1.2fr .8fr;
          gap:14px;
          align-items:stretch;
        }
        @media (max-width: 980px){
          .stageGrid{ grid-template-columns: 1fr; }
          .fieldState{ text-align:left; }
        }

        /* Orb + Ring */
        .orbWrap{
          position:relative;
          border:1px solid var(--line);
          border-radius:16px;
          background:#fff;
          padding:18px;
          overflow:hidden;
          min-height: 420px;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-direction:column;
        }
        .micro{
          margin-top:14px;
          font-size:12px;
          color:var(--muted);
          display:flex;
          gap:10px;
          align-items:center;
          flex-wrap:wrap;
          justify-content:center;
        }
        .micro .dot{ opacity:.6; }

        /* Breath Orb */
        .breathOrb{
          position:relative;
          width:min(420px, 90%);
          aspect-ratio: 1 / 1;
          border-radius:999px;
          display:flex;
          align-items:center;
          justify-content:center;
          isolation:isolate;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.95), rgba(0,0,0,.06));
          border:1px solid rgba(0,0,0,.08);
          box-shadow: 0 24px 80px rgba(0,0,0,.08);
        }
        .breathInner{
          position:absolute;
          inset: 14%;
          border-radius:999px;
          background: radial-gradient(circle at 40% 30%, rgba(255,255,255,.7), rgba(0,0,0,.10));
          border:1px solid rgba(0,0,0,.06);
          z-index:1;
        }
        .breathText{
          position:absolute;
          inset: 0;
          display:flex;
          align-items:center;
          justify-content:center;
          flex-direction:column;
          text-align:center;
          padding: 18px;
          z-index:2;
        }
        .breathTitle{
          font-size:18px;
          font-weight:980;
          letter-spacing:.08em;
          text-transform:uppercase;
        }
        .breathSub{
          margin-top:8px;
          max-width: 320px;
          color: var(--muted);
          line-height:1.45;
          font-size: 13px;
          font-weight: 700;
        }

        /* Phase flavors */
        .breathOrb.arriving{
          opacity:.98;
        }
        .breathOrb.closing{
          opacity:.92;
          filter: grayscale(.1);
        }

        /* Running/pause */
        .breathOrb.paused{
          transform: scale(0.99);
          opacity: .92;
        }

        /* Breath motion synced with cadence */
        .breathOrb.running.inhale{
          animation: waocInhale var(--inhaleMs) ease-in-out infinite;
        }
        .breathOrb.running.exhale{
          animation: waocExhale var(--exhaleMs) ease-in-out infinite;
        }
        .breathOrb.running.inhale .breathInner{
          animation: waocInhaleInner var(--inhaleMs) ease-in-out infinite;
        }
        .breathOrb.running.exhale .breathInner{
          animation: waocExhaleInner var(--exhaleMs) ease-in-out infinite;
        }

        @keyframes waocInhale {
          0% { transform: scale(1.00); opacity: .70; }
          100% { transform: scale(1.075); opacity: .95; }
        }
        @keyframes waocExhale {
          0% { transform: scale(1.075); opacity: .95; }
          100% { transform: scale(1.00); opacity: .70; }
        }
        @keyframes waocInhaleInner {
          0% { transform: scale(1.00); opacity: .45; }
          100% { transform: scale(.95); opacity: .78; }
        }
        @keyframes waocExhaleInner {
          0% { transform: scale(.95); opacity: .78; }
          100% { transform: scale(1.00); opacity: .45; }
        }

        /* Right panel */
        .panel{
          border:1px solid var(--line);
          border-radius:16px;
          background:#fff;
          padding:14px;
          display:flex;
          flex-direction:column;
          gap:12px;
        }
        .panelTitle{
          font-size:14px;
          font-weight:980;
          letter-spacing:.12em;
          text-transform:uppercase;
        }
        .row{
          border:1px solid rgba(0,0,0,.08);
          background: rgba(0,0,0,.02);
          border-radius:14px;
          padding:12px;
        }
        .label{
          font-size:12px;
          font-weight:980;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:#111827;
        }
        .hint{
          margin-top:8px;
          font-size:12px;
          color:var(--muted);
          font-weight: 700;
        }
        .seg{
          margin-top:10px;
          display:flex;
          gap:10px;
          flex-wrap:wrap;
        }
        .segBtn{
          border:1px solid var(--line);
          background:#fff;
          border-radius:999px;
          padding:10px 12px;
          cursor:pointer;
          font-weight:950;
          color:#111827;
        }
        .segBtn.on{
          background:#111827;
          color:#fff;
          border-color:#111827;
        }
        .segBtn:disabled{
          opacity:.6;
          cursor:not-allowed;
        }

        .chips{ margin-top:10px; display:flex; gap:10px; flex-wrap:wrap; }
        .chip{
          border:1px solid var(--line);
          border-radius:999px;
          padding:8px 10px;
          font-weight:900;
          background:#fff;
        }

        .actions{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
        }
        .btnPrimary{
          background:#111827;
          color:#fff;
          border:none;
          padding:10px 12px;
          border-radius:12px;
          cursor:pointer;
          font-weight:950;
        }
        .btnGhost{
          background:#fff;
          border:1px solid var(--line);
          color:#111827;
          padding:10px 12px;
          border-radius:12px;
          cursor:pointer;
          font-weight:900;
        }
        .btnGhost:disabled{
          opacity:.6;
          cursor:not-allowed;
        }

        .waocBox{
          margin-top:auto;
          border:1px solid rgba(0,0,0,.08);
          border-radius:14px;
          padding:12px;
          background: rgba(255,255,255,.9);
        }
        .waocTitle{
          font-size:12px;
          font-weight:980;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:var(--muted);
        }
        .waocLine{
          margin-top:6px;
          font-weight:900;
          color:#111827;
          font-size:13px;
        }
      `}</style>
    </div>
  );
}

/* ---------- UI: Progress Ring ---------- */
function ProgressRing({ progress }) {
  const size = 520;
  const r = 220;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - clamp(progress, 0, 1));

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${size} ${size}`}
      style={{
        position: "absolute",
        inset: "-40px",
        pointerEvents: "none",
        opacity: 0.18,
        filter: "blur(0px)",
      }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(0,0,0,.18)"
        strokeWidth="2"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(0,0,0,.75)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${c}`}
        strokeDashoffset={`${dash}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
}

/* ---------- Sound Engine (WebAudio) ---------- */
function useSoundEngine(sound, running) {
  const ctxRef = useRef(null);
  const nodesRef = useRef({ gain: null, osc: null, noise: null, filter: null });

  const ensure = async () => {
    if (sound === "Silence") return;
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") {
      try { await ctxRef.current.resume(); } catch {}
    }
  };

  const stopSoft = () => {
    const ctx = ctxRef.current;
    const { gain, osc, noise } = nodesRef.current;
    if (!ctx || !gain) return;

    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0.0001, t + 0.35);

    setTimeout(() => {
      try { osc?.stop?.(); } catch {}
      try { noise?.stop?.(); } catch {}
      nodesRef.current = { gain: null, osc: null, noise: null, filter: null };
    }, 450);
  };

  const start = async () => {
    if (sound === "Silence") return;
    await ensure();
    const ctx = ctxRef.current;
    if (!ctx) return;

    // already started?
    if (nodesRef.current.gain) return;

    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.connect(ctx.destination);

    // Soft drone / Deep space
    if (sound === "Soft drone" || sound === "Deep space") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = sound === "Deep space" ? 56 : 72;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = sound === "Deep space" ? 220 : 420;
      filter.Q.value = sound === "Deep space" ? 1.2 : 0.8;

      osc.connect(filter);
      filter.connect(gain);
      osc.start();

      nodesRef.current = { gain, osc, noise: null, filter };
    } else {
      // fallback: gentle noise (if you later add "Ocean breath" etc.)
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.12;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 180;

      noise.connect(filter);
      filter.connect(gain);
      noise.start();

      nodesRef.current = { gain, osc: null, noise, filter };
    }

    // fade in
    const t = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(0.045, t + 0.6);
  };

  const restartIfNeeded = async () => {
    stopSoft();
    await start();
  };

  useEffect(() => {
    // running + not silence => keep sound alive
    if (sound === "Silence") {
      stopSoft();
      return;
    }
    if (running) start();
    else stopSoft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound, running]);

  useEffect(() => {
    // cleanup on unmount
    return () => stopSoft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { stopSoft, restartIfNeeded };
}

/* ---------- copy helpers ---------- */
function intentLabel(x) {
  if (x === "peace") return "Peace";
  if (x === "unity") return "Unity";
  if (x === "awareness") return "Awareness";
  if (x === "compassion") return "Compassion";
  return "Presence";
}

function phaseLabel(p) {
  if (p === "arriving") return "Arriving";
  if (p === "closing") return "Closing";
  return "Breathing";
}

function inhaleLine(intent) {
  if (intent === "peace") return "Inhale — invite quiet into the inner sea.";
  if (intent === "unity") return "Inhale — remember the whole.";
  if (intent === "awareness") return "Inhale — open the seeing.";
  if (intent === "compassion") return "Inhale — soften and include.";
  return "Inhale — stay with the breath.";
}

function exhaleLine(intent) {
  if (intent === "peace") return "Exhale — release the ripple.";
  if (intent === "unity") return "Exhale — loosen separation.";
  if (intent === "awareness") return "Exhale — let grasping fall away.";
  if (intent === "compassion") return "Exhale — offer gentleness outward.";
  return "Exhale — return to presence.";
}

function clamp(x, a, b) {
  return Math.max(a, Math.min(b, x));
}
