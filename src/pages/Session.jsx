// src/pages/Session.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectiveResonanceField from "../components/CollectiveResonanceField.jsx";
import { logIntent } from "../utils/intentSignal.js";

const DURATIONS = [5, 10, 15, 20, 30, 45, 60];
const MODES = ["Solo (in the Field)", "Collective (in the Field)"];
const SOUNDS = ["Silence", "Ocean", "Rain", "Wind", "Brown Noise"];

export default function Session() {
  const nav = useNavigate();
  const [intent, setIntent] = useState("awareness");
  const [durationMin, setDurationMin] = useState(10);
  const [mode, setMode] = useState(MODES[0]);
  const [sound, setSound] = useState(SOUNDS[0]);

  const fieldMeta = useMemo(() => {
    // 让右上角 Field State 随 intent 轻微变化，但不显示人数/地址
    const base = {
      title: "We Are One Connection",
      lead: "You are not alone here. The field listens, even in silence.",
    };
    const map = {
      peace: { mood: "Quiet", pulseLabel: "Soft" },
      unity: { mood: "Warming", pulseLabel: "Steady" },
      awareness: { mood: "Warming", pulseLabel: "Steady" },
      compassion: { mood: "Luminous", pulseLabel: "Bright" },
    };
    return { ...base, ...(map[intent] || map.awareness) };
  }, [intent]);

  function onPickIntent(next) {
    setIntent(next);
    logIntent(next);
  }

  function enter() {
    nav("/meditate", {
      state: { intent, durationMin, mode, sound },
    });
  }

  return (
    <div className="waocPage">
      <div className="waocHeaderRow">
        <div className="waocHeaderLeft">
          <div className="waocKicker">COLLECTIVE RESONANCE</div>
          <div className="waocH1">{fieldMeta.title}</div>
          <div className="waocLead">{fieldMeta.lead}</div>
        </div>

        <div className="waocHeaderRight">
          <div className="waocTiny">Field state</div>
          <div className="waocPill">
            <span className="waocPillStrong">{fieldMeta.mood}</span>
            <span className="waocPillDot">•</span>
            <span className="waocTiny">Pulse</span>
            <span className="waocPillStrong">{fieldMeta.pulseLabel}</span>
          </div>
          <div className="waocFine">No addresses. No ranks. No counts.</div>
        </div>
      </div>

      {/* Globe Stage — 不要任何遮挡 */}
      <div className="waocStageCard">
        <CollectiveResonanceField intent={intent} mode={mode} durationMin={durationMin} />
      </div>

      {/* B 位：核心价值观（替代你之前那条引言卡片） */}
      <div className="waocValuesCard">
        <div className="waocValuesTitle">WAOC — Core Values</div>
        <div className="waocValuesGrid">
          <div className="waocValue">
            <div className="waocValueTop">
              <span className="waocValueBadge">01</span>
              <span className="waocValueName">Privacy by design</span>
            </div>
            <div className="waocValueDesc">No addresses. No ranks. No counts.</div>
          </div>

          <div className="waocValue">
            <div className="waocValueTop">
              <span className="waocValueBadge">02</span>
              <span className="waocValueName">Proof of connection</span>
            </div>
            <div className="waocValueDesc">Connection is the proof — not a reward.</div>
          </div>

          <div className="waocValue">
            <div className="waocValueTop">
              <span className="waocValueBadge">03</span>
              <span className="waocValueName">Collective resonance</span>
            </div>
            <div className="waocValueDesc">You are sitting with others, even if you never met.</div>
          </div>
        </div>
      </div>

      {/* Enter Bar — 简化成“一条” */}
      <div className="waocEnterCard">
        <div className="waocEnterTop">
          <div>
            <div className="waocEnterTitle">Enter the Session</div>
            <div className="waocEnterSub">Cross the threshold. Nothing is required.</div>
          </div>
          <button className="waocBtnPrimary" onClick={enter}>
            Enter
          </button>
        </div>

        <div className="waocEnterGrid">
          <div className="waocGroup">
            <div className="waocLabel">Intent</div>
            <div className="waocPills">
              <IntentPill value="peace" active={intent === "peace"} onClick={onPickIntent} />
              <IntentPill value="unity" active={intent === "unity"} onClick={onPickIntent} />
              <IntentPill value="awareness" active={intent === "awareness"} onClick={onPickIntent} />
              <IntentPill value="compassion" active={intent === "compassion"} onClick={onPickIntent} />
            </div>
          </div>

          <div className="waocGroup">
            <div className="waocLabel">Duration</div>
            <select
              className="waocSelect"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>

          <div className="waocGroup">
            <div className="waocLabel">Mode</div>
            <select className="waocSelect" value={mode} onChange={(e) => setMode(e.target.value)}>
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="waocGroup">
            <div className="waocLabel">Sound</div>
            <select className="waocSelect" value={sound} onChange={(e) => setSound(e.target.value)}>
              {SOUNDS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="waocFine waocEnterFoot">No tracking. No ranking. Only resonance.</div>
      </div>

      <div className="waocFooter">
        In this field, <span className="waocStrong">connection is the proof</span> — not a reward.
      </div>

      {/* 页面样式（独立，不依赖 Tailwind） */}
      <style>{css}</style>
    </div>
  );
}

function IntentPill({ value, active, onClick }) {
  const meta = {
    peace: { t: "Peace", s: "Quiet the inner sea." },
    unity: { t: "Unity", s: "Return to the whole." },
    awareness: { t: "Awareness", s: "See without grasping." },
    compassion: { t: "Compassion", s: "Hold all with gentleness." },
  }[value];

  return (
    <button
      type="button"
      className={`waocPillBtn ${active ? "active" : ""}`}
      onClick={() => onClick(value)}
      title={meta.s}
    >
      <span className="waocPillBtnTitle">{meta.t}</span>
      <span className="waocPillBtnSub">{meta.s}</span>
    </button>
  );
}

const css = `
  .waocPage{
    max-width: 1100px;
    margin: 0 auto;
    padding: 28px 18px 40px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    color:#0b1220;
  }
  .waocHeaderRow{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:18px;
    margin-bottom:14px;
  }
  .waocKicker{
    font-size:12px;
    letter-spacing:.18em;
    color:#6b7280;
  }
  .waocH1{
    font-size:34px;
    line-height:1.12;
    margin-top:10px;
    font-weight:700;
  }
  .waocLead{
    margin-top:10px;
    color:#4b5563;
    font-size:15.5px;
  }
  .waocHeaderRight{
    text-align:right;
    min-width: 220px;
  }
  .waocTiny{ font-size:12px; color:#6b7280; }
  .waocFine{ font-size:12px; color:#6b7280; margin-top:8px; }
  .waocPill{
    display:inline-flex;
    align-items:center;
    gap:10px;
    margin-top:6px;
    padding:8px 12px;
    border:1px solid #e5e7eb;
    border-radius:999px;
    background:#fff;
    box-shadow: 0 1px 0 rgba(0,0,0,.02);
  }
  .waocPillStrong{ font-weight:650; font-size:13px; color:#111827; }
  .waocPillDot{ color:#9ca3af; }

  .waocStageCard{
    border:1px solid #e5e7eb;
    border-radius:18px;
    background:#fff;
    overflow:hidden;
    box-shadow: 0 12px 30px rgba(17,24,39,.06);
  }

  .waocValuesCard{
    margin-top:14px;
    border:1px solid #e5e7eb;
    border-radius:18px;
    background:#fff;
    padding:16px;
  }
  .waocValuesTitle{
    font-weight:700;
    color:#111827;
    margin-bottom:12px;
  }
  .waocValuesGrid{
    display:grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap:12px;
  }
  .waocValue{
    border:1px solid #eef2f7;
    border-radius:14px;
    padding:12px;
    background: linear-gradient(180deg, rgba(249,250,251,.9), rgba(255,255,255,1));
  }
  .waocValueTop{
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom:8px;
  }
  .waocValueBadge{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    width:26px;
    height:26px;
    border-radius:8px;
    border:1px solid #e5e7eb;
    font-size:12px;
    color:#374151;
    background:#fff;
  }
  .waocValueName{ font-weight:650; color:#111827; }
  .waocValueDesc{ color:#4b5563; font-size:13px; }

  .waocEnterCard{
    margin-top:14px;
    border:1px solid #e5e7eb;
    border-radius:18px;
    background:#fff;
    padding:16px;
  }
  .waocEnterTop{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:14px;
    margin-bottom:14px;
  }
  .waocEnterTitle{ font-size:18px; font-weight:800; }
  .waocEnterSub{ color:#6b7280; font-size:13px; margin-top:2px; }

  .waocBtnPrimary{
    border:none;
    border-radius:14px;
    padding:12px 18px;
    background:#0b1220;
    color:#fff;
    font-weight:700;
    cursor:pointer;
    box-shadow: 0 10px 18px rgba(17,24,39,.15);
  }
  .waocBtnPrimary:hover{ opacity:.92; }

  .waocEnterGrid{
    display:grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap:12px;
    align-items:start;
  }
  .waocGroup{ display:flex; flex-direction:column; gap:8px; }
  .waocLabel{ font-size:12px; letter-spacing:.12em; color:#6b7280; text-transform:uppercase; }

  .waocSelect{
    width:100%;
    height:44px;
    border-radius:14px;
    border:1px solid #e5e7eb;
    padding:0 12px;
    background:#fff;
    outline:none;
    font-size:14px;
  }
  .waocSelect:focus{
    border-color:#cbd5e1;
    box-shadow: 0 0 0 4px rgba(148,163,184,.25);
  }

  .waocPills{
    display:grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap:10px;
  }
  .waocPillBtn{
    text-align:left;
    border:1px solid #e5e7eb;
    border-radius:14px;
    background:#fff;
    padding:10px 12px;
    cursor:pointer;
    transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
  }
  .waocPillBtn:hover{
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(17,24,39,.08);
  }
  .waocPillBtn.active{
    border-color:#111827;
    box-shadow: 0 0 0 4px rgba(17,24,39,.08);
  }
  .waocPillBtnTitle{ display:block; font-weight:750; color:#111827; font-size:13px; }
  .waocPillBtnSub{ display:block; color:#6b7280; font-size:12px; margin-top:2px; }

  .waocEnterFoot{ margin-top:10px; }

  .waocFooter{
    margin-top:14px;
    color:#4b5563;
    font-size:14px;
  }
  .waocStrong{ font-weight:750; color:#111827; }

  @media (max-width: 960px){
    .waocHeaderRow{ flex-direction:column; }
    .waocHeaderRight{ text-align:left; }
    .waocValuesGrid{ grid-template-columns:1fr; }
    .waocEnterGrid{ grid-template-columns:1fr; }
    .waocPills{ grid-template-columns:1fr 1fr; }
  }
`;
