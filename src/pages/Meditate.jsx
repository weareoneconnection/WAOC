// src/pages/Meditate.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { playAmbient, pauseAmbient, setAmbientVolume, isPlaying } from "../utils/audioEngine.js";

const SOUND_MAP = {
  Silence: null,
  Ocean: "/audio/ambient/ocean.mp3",
  Rain: "/audio/ambient/rain.mp3",
  Wind: "/audio/ambient/wind.mp3",
  "Brown Noise": "/audio/ambient/brown-noise.mp3",
};

const CADENCES = [
  { key: "4-4", inhale: 4, exhale: 4 },
  { key: "4-6", inhale: 4, exhale: 6 },
  { key: "4-8", inhale: 4, exhale: 8 },
];

export default function Meditate() {
  const nav = useNavigate();
  const { state } = useLocation();

  const intent = state?.intent ?? "awareness";
  const durationMin = Number(state?.durationMin ?? 10);
  const mode = state?.mode ?? "Solo (in the Field)";
  const sound = state?.sound ?? "Silence";

  const totalSec = useMemo(() => Math.max(60, durationMin * 60), [durationMin]);
  const [secLeft, setSecLeft] = useState(totalSec);
  const [running, setRunning] = useState(true);
  const [phase, setPhase] = useState("ARRIVING"); // ARRIVING | RUNNING | COMPLETE
  const tickRef = useRef(null);

  const [cadenceKey, setCadenceKey] = useState("4-6");
  const cadence = useMemo(() => CADENCES.find((c) => c.key === cadenceKey) ?? CADENCES[1], [cadenceKey]);

  // audio
  const audioSrc = SOUND_MAP[sound] ?? null;
  const [vol, setVol] = useState(0.35);
  const [audioOn, setAudioOn] = useState(false);

  const intentLabel = useMemo(() => {
    const map = { peace: "Peace", unity: "Unity", awareness: "Awareness", compassion: "Compassion" };
    return map[intent] ?? "Awareness";
  }, [intent]);

  const centerLabel = useMemo(() => {
    if (phase === "ARRIVING") return "ARRIVING";
    if (phase === "COMPLETE") return "COMPLETE";
    return running ? "RUNNING" : "PAUSED";
  }, [phase, running]);

  function getSubtitle() {
    if (phase === "ARRIVING") return "Nothing is required. Only attention.";
    if (phase === "COMPLETE") return "Thank you. The field remembers you.";
    return `Inhale ${cadence.inhale}s · Exhale ${cadence.exhale}s`;
  }

  // ✅ guarantee audio is aligned with selected sound
  useEffect(() => {
    if (!audioSrc) {
      pauseAmbient();
      setAudioOn(false);
      return;
    }
    (async () => {
      const ok = await playAmbient(audioSrc, { volume: vol });
      setAudioOn(ok || isPlaying());
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc]);

  useEffect(() => {
    setAmbientVolume(vol);
  }, [vol]);

  // ARRIVING -> RUNNING
  useEffect(() => {
    if (phase !== "ARRIVING") return;
    const t = setTimeout(() => setPhase("RUNNING"), 1100);
    return () => clearTimeout(t);
  }, [phase]);

  // timer
  useEffect(() => {
    if (!running) return;
    if (phase === "COMPLETE") return;

    tickRef.current = setInterval(() => {
      setSecLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running, phase]);

  // complete
  useEffect(() => {
    if (secLeft !== 0) return;
    if (phase === "COMPLETE") return;

    setPhase("COMPLETE");
    setRunning(false);

    // product choice: end -> silence
    pauseAmbient();
    setAudioOn(false);
  }, [secLeft, phase]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setRunning((v) => !v);
      }
      if (e.code === "Escape") {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onBack() {
    pauseAmbient();
    nav("/session");
  }

  function onRestart() {
    setSecLeft(totalSec);
    setPhase("ARRIVING");
    setRunning(true);

    if (audioSrc) {
      playAmbient(audioSrc, { volume: vol }).then(() => setAudioOn(isPlaying()));
    }
  }

  function onFinish() {
    pauseAmbient();
    setAudioOn(false);
    nav("/session");
  }

  async function toggleAudio() {
    if (!audioSrc) return;
    if (audioOn) {
      pauseAmbient();
      setAudioOn(false);
      return;
    }
    const ok = await playAmbient(audioSrc, { volume: vol });
    setAudioOn(ok || isPlaying());
  }

  return (
    <div className="mPage">
      <div className="mTop">
        <div>
          <div className="mKicker">MEDITATION</div>
          <div className="mH1">Enter the Field</div>
          <div className="mLead">Breathe. Notice. Return.</div>
        </div>

        <div className="mTopRight">
          <div className="mMetaRow">
            <span className="mTiny">Sound:</span> <span className="mStrong">{sound}</span>
          </div>
          <div className="mIntentPill">
            <span className="mStrong">{intentLabel}</span>
            <span className="mDot">•</span>
            <span className="mTiny">{durationMin} min</span>
          </div>
        </div>
      </div>

      <div className="mGrid">
        <div className="mField">
          <div className="mAura">
            <div className="mAuraInner">
              <div className="mBig">{centerLabel}</div>
              <div className="mSub">{getSubtitle()}</div>
              <div className="mTimer">{formatMMSS(secLeft)} remaining</div>
            </div>
          </div>
          <div className="mHint">Space: Pause · Esc: Exit</div>
        </div>

        <div className="mPanel">
          <div className="mPanelTitle">SESSION CONTROLS</div>

          <div className="mCard">
            <div className="mCardTitle">CADENCE</div>
            <div className="mPills">
              {CADENCES.map((c) => (
                <button
                  key={c.key}
                  className={`mPill ${cadenceKey === c.key ? "active" : ""}`}
                  onClick={() => setCadenceKey(c.key)}
                  type="button"
                >
                  {c.key}
                </button>
              ))}
            </div>
            <div className="mTiny2">Inhale—Exhale (seconds)</div>
          </div>

          <div className="mCard">
            <div className="mCardTitle">STATE</div>
            <div className="mPills">
              <button className={`mPill ${!running ? "active" : ""}`} type="button" onClick={() => setRunning(false)}>
                Paused
              </button>
              <button className={`mPill ${running ? "active" : ""}`} type="button" onClick={() => setRunning(true)}>
                Running
              </button>
            </div>
            <div className="mTiny2">No tracking. Only resonance.</div>
          </div>

          <div className="mCard">
            <div className="mCardTitle">AUDIO</div>
            {audioSrc ? (
              <>
                <div className="mAudioRow">
                  <button className="mBtnDark" type="button" onClick={toggleAudio}>
                    {audioOn ? "Pause" : "Play"}
                  </button>
                  <div className="mTiny2">{audioOn ? "Playing" : "Stopped"}</div>
                </div>

                <div className="mVolRow">
                  <span className="mTiny">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={vol}
                    onChange={(e) => setVol(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              </>
            ) : (
              <div className="mTiny2">Silence is a valid sound.</div>
            )}
          </div>

          <div className="mActions">
            <button className="mBtn" onClick={onBack} type="button">
              Back
            </button>
            <button className="mBtn" onClick={() => setRunning((v) => !v)} type="button">
              {running ? "Pause" : "Resume"}
            </button>
            <button className="mBtn" onClick={onRestart} type="button">
              Restart
            </button>
          </div>

          <button className="mBtnPrimary" onClick={onFinish} type="button">
            Finish
          </button>

          <div className="mCore">
            <div className="mCoreK">WAOC CORE</div>
            <div className="mCoreT">
              No addresses. No ranks. No counts.
              <br />
              Connection is the proof — not a reward.
              <br />
              You are sitting with others, even if you never met.
            </div>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

function formatMMSS(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const css = `
  .mPage{ max-width:1200px; margin:0 auto; padding:26px 18px 40px; font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; color:#0b1220; }
  .mTop{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:16px; }
  .mKicker{ font-size:12px; letter-spacing:.18em; color:#6b7280; }
  .mH1{ font-size:44px; line-height:1.02; margin-top:8px; font-weight:900; letter-spacing:-.02em; }
  .mLead{ margin-top:10px; color:#6b7280; font-size:16px; }
  .mTopRight{ text-align:right; display:flex; flex-direction:column; gap:10px; align-items:flex-end; }
  .mMetaRow{ color:#4b5563; font-size:13px; }
  .mTiny{ font-size:12px; color:#6b7280; }
  .mStrong{ font-weight:800; color:#111827; }
  .mDot{ color:#9ca3af; margin:0 8px; }
  .mIntentPill{ display:inline-flex; align-items:center; gap:10px; padding:10px 12px; border:1px solid #e5e7eb; border-radius:999px; background:#fff; }

  .mGrid{ display:grid; grid-template-columns:1.2fr .8fr; gap:14px; align-items:start; }
  .mField{ border:1px solid #e5e7eb; border-radius:18px; background:#fff; min-height:520px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .mAura{ width:min(560px,92%); aspect-ratio:1/1; border-radius:999px; background:radial-gradient(circle at 50% 45%, rgba(17,24,39,.06), rgba(17,24,39,.03) 45%, rgba(17,24,39,.015) 68%, rgba(255,255,255,0) 72%); display:grid; place-items:center; }
  .mAuraInner{ width:74%; aspect-ratio:1/1; border-radius:999px; background:radial-gradient(circle at 50% 40%, rgba(17,24,39,.08), rgba(17,24,39,.04) 55%, rgba(255,255,255,1) 72%); border:1px solid rgba(17,24,39,.08); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:18px; }
  .mBig{ font-size:30px; font-weight:1000; letter-spacing:.14em; color:#111827; }
  .mSub{ margin-top:10px; color:#6b7280; font-size:14px; line-height:1.5; }
  .mTimer{ margin-top:16px; font-weight:900; letter-spacing:-.02em; color:#111827; }
  .mHint{ position:absolute; bottom:16px; color:#6b7280; font-size:13px; }

  .mPanel{ border:1px solid #e5e7eb; border-radius:18px; background:#fff; padding:14px; position:sticky; top:12px; }
  .mPanelTitle{ font-weight:900; letter-spacing:.16em; font-size:13px; color:#111827; margin-bottom:10px; }
  .mCard{ border:1px solid #eef2f7; border-radius:16px; padding:12px; background:linear-gradient(180deg, rgba(249,250,251,.75), rgba(255,255,255,1)); margin-bottom:12px; }
  .mCardTitle{ font-weight:900; letter-spacing:.18em; font-size:12px; color:#111827; margin-bottom:10px; }
  .mPills{ display:flex; gap:10px; flex-wrap:wrap; }
  .mPill{ height:36px; padding:0 14px; border-radius:999px; border:1px solid #e5e7eb; background:#fff; font-weight:800; cursor:pointer; }
  .mPill.active{ border-color:#111827; box-shadow:0 0 0 4px rgba(17,24,39,.08); }
  .mTiny2{ font-size:12px; color:#6b7280; margin-top:10px; }

  .mActions{ display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; margin-bottom:10px; }
  .mBtn{ height:38px; padding:0 14px; border-radius:999px; border:1px solid #e5e7eb; background:#fff; font-weight:800; cursor:pointer; }
  .mBtnPrimary{ width:120px; height:44px; border:none; border-radius:14px; background:#0b1220; color:#fff; font-weight:900; cursor:pointer; box-shadow:0 10px 18px rgba(17,24,39,.15); }
  .mBtnPrimary:hover{ opacity:.92; }
  .mBtnDark{ height:38px; padding:0 14px; border-radius:999px; border:1px solid rgba(11,15,26,.12); background:#0b1220; color:#fff; font-weight:900; cursor:pointer; }

  .mAudioRow{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .mVolRow{ margin-top:12px; display:flex; align-items:center; gap:10px; }

  .mCore{ margin-top:14px; border:1px solid #eef2f7; border-radius:16px; padding:12px; background:#fff; }
  .mCoreK{ font-size:12px; letter-spacing:.18em; color:#9ca3af; font-weight:900; }
  .mCoreT{ margin-top:8px; font-size:13px; color:#111827; font-weight:800; line-height:1.5; }

  @media (max-width:980px){
    .mTop{ flex-direction:column; }
    .mTopRight{ text-align:left; align-items:flex-start; }
    .mGrid{ grid-template-columns:1fr; }
    .mPanel{ position:relative; top:0; }
    .mField{ min-height:420px; }
  }
`;
