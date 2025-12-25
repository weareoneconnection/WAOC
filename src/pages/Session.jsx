// src/pages/Session.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectiveResonanceField from "../components/CollectiveResonanceField.jsx";
import { logIntent } from "../utils/intentSignal.js";
import { playAmbient, pauseAmbient } from "../utils/audioEngine.js";

const DURATIONS = [5, 10, 15, 20, 30, 45, 60];
const MODES = ["Solo (in the Field)", "Collective (in the Field)"];
const SOUNDS = ["Silence", "Ocean", "Rain", "Wind", "Brown Noise"];

// ✅ Sound name -> public audio path (MUST match Meditate)
const SOUND_MAP = {
  Silence: null,
  Ocean: "/audio/ambient/ocean.mp3",
  Rain: "/audio/ambient/ambient.mp3",
  Wind: "/audio/ambient/ambient.mp3",
  "Brown Noise": "/audio/ambient/ambient.mp3",
};

// Ritual schedule (UTC)
const ANCHOR = {
  dayOfWeek: 0,
  hourUTC: 20,
  minuteUTC: 0,
  title: "WAOC Global Sit",
  subtitle: "One World · One Breath · One Field",
};

export default function Session() {
  const nav = useNavigate();

  const [intent, setIntent] = useState("awareness");
  const [durationMin, setDurationMin] = useState(10);
  const [mode, setMode] = useState(MODES[0]);
  const [sound, setSound] = useState(SOUNDS[0]);

  const fieldMeta = useMemo(() => {
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

  const isCollective = mode === MODES[1];

  const anchorInfo = useMemo(() => {
    const nextUTC = getNextWeeklyUTC(ANCHOR.dayOfWeek, ANCHOR.hourUTC, ANCHOR.minuteUTC);
    const now = new Date();
    const msLeft = Math.max(0, nextUTC.getTime() - now.getTime());
    return {
      nextUTC,
      msLeft,
      localLabel: formatLocal(nextUTC),
      utcLabel: formatUTC(nextUTC),
      countdown: formatCountdown(msLeft),
    };
  }, [mode]);

  function onPickIntent(next) {
    setIntent(next);
    logIntent(next);
  }

  // ✅ Single source of truth: audioEngine only
  // ✅ Enter is a user gesture => browsers allow audio play
  async function enter() {
    const src = SOUND_MAP[sound];
    if (src) {
      await playAmbient(src, { volume: 0.35 });
    } else {
      pauseAmbient(); // ensure silence is really silent
    }

    nav("/meditate", {
      state: { intent, durationMin, mode, sound },
    });
  }

  function downloadICS() {
    const dtStart = anchorInfo.nextUTC;
    const dtEnd = new Date(dtStart.getTime() + 30 * 60 * 1000);

    const ics = buildICS({
      title: ANCHOR.title,
      description: `${ANCHOR.subtitle}\\nA quiet ritual of attention — where your breath meets a shared field.`,
      startUTC: dtStart,
      endUTC: dtEnd,
      url: window.location.origin + "/session",
      rrule: "FREQ=WEEKLY;BYDAY=SU;BYHOUR=20;BYMINUTE=0;BYSECOND=0",
    });

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "waoc-global-sit.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
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

      {/* Globe Stage */}
      <div className="waocStageCard">
        <CollectiveResonanceField intent={intent} mode={mode} durationMin={durationMin} />
      </div>

      {/* Values */}
      <div className="waocValuesCard">
        <div className="waocValuesTitle">WAOC — Core Values</div>
        <div className="waocValuesGrid">
          <div className="waocValue">
            <div className="waocValueTop">
              <span className="waocValueBadge">01</span>
              <span className="waocValueName">Privacy by design</span>
            </div>
            <div className="waocValueDesc">
              No addresses.
              <br />
              No ranks. No counts.
            </div>
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

      {/* Enter */}
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

        {/* Time Anchor */}
        <div className={`waocAnchor ${isCollective ? "collective" : ""}`}>
          <div className="waocAnchorLeft">
            <div className="waocAnchorKicker">COLLECTIVE TIME ANCHOR</div>
            <div className="waocAnchorTitle">{ANCHOR.subtitle}</div>
            <div className="waocAnchorMeta">
              <span className="waocAnchorStrong">Every Sunday</span>
              <span className="waocAnchorDot">•</span>
              <span className="waocAnchorStrong">20:00 UTC</span>
              <span className="waocAnchorDot">•</span>
              <span className="waocTiny">{anchorInfo.localLabel}</span>
            </div>
          </div>

          <div className="waocAnchorRight">
            <div className="waocTiny">Next gathering</div>
            <div className="waocAnchorCountdown">{anchorInfo.countdown}</div>
            <div className="waocAnchorActions">
              <button type="button" className="waocBtnGhost" onClick={downloadICS}>
                Add to calendar
              </button>
              <div className="waocAnchorHint">You may enter now — or return when the field gathers.</div>
            </div>
          </div>
        </div>

        {/* Selectors */}
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
            <select className="waocSelect" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}>
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

            <div className="waocFine" style={{ marginTop: 10 }}>
              {SOUND_MAP[sound] ? "Sound will begin after you press Enter." : "Silence is a valid sound."}
            </div>
          </div>
        </div>

        <div className="waocFine waocEnterFoot">No tracking. No ranking. Only resonance.</div>
      </div>

      <div className="waocFooter">
        In this field, <span className="waocStrong">connection is the proof</span> — not a reward.
      </div>

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

/* ---------- Time helpers ---------- */

function getNextWeeklyUTC(targetDow, hourUTC, minuteUTC) {
  const now = new Date();
  const nowUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds())
  );

  const candidate = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate(), hourUTC, minuteUTC, 0));
  const dow = nowUTC.getUTCDay();
  let diff = (targetDow - dow + 7) % 7;
  if (diff === 0 && candidate.getTime() <= nowUTC.getTime()) diff = 7;

  candidate.setUTCDate(candidate.getUTCDate() + diff);
  return candidate;
}

function formatUTC(d) {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC`;
}

function formatLocal(d) {
  const parts = new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" }).formatToParts(d);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "";
  return `Local: ${weekday}, ${hour}:${minute}`;
}

function formatCountdown(ms) {
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);

  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function buildICS({ title, description, startUTC, endUTC, url, rrule }) {
  const uid = `waoc-${startUTC.getTime()}@waoc`;
  const dtstamp = toICSDate(new Date());
  const dtstart = toICSDate(startUTC);
  const dtend = toICSDate(endUTC);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WAOC//Meditation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `URL:${escapeICS(url)}`,
    `RRULE:${rrule}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function toICSDate(d) {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${da}T${hh}${mm}${ss}Z`;
}

function escapeICS(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

const css = `
  .waocPage{ max-width:1100px; margin:0 auto; padding:28px 18px 40px; font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; color:#0b1220; }
  .waocHeaderRow{ display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-bottom:14px; }
  .waocKicker{ font-size:12px; letter-spacing:.18em; color:#6b7280; }
  .waocH1{ font-size:34px; line-height:1.12; margin-top:10px; font-weight:700; }
  .waocLead{ margin-top:10px; color:#4b5563; font-size:15.5px; }
  .waocHeaderRight{ text-align:right; min-width:220px; }
  .waocTiny{ font-size:12px; color:#6b7280; }
  .waocFine{ font-size:12px; color:#6b7280; margin-top:8px; }
  .waocPill{ display:inline-flex; align-items:center; gap:10px; margin-top:6px; padding:8px 12px; border:1px solid #e5e7eb; border-radius:999px; background:#fff; box-shadow:0 1px 0 rgba(0,0,0,.02); }
  .waocPillStrong{ font-weight:650; font-size:13px; color:#111827; }
  .waocPillDot{ color:#9ca3af; }
  .waocStageCard{ border:1px solid #e5e7eb; border-radius:18px; background:#fff; overflow:hidden; box-shadow:0 12px 30px rgba(17,24,39,.06); }
  .waocValuesCard{ margin-top:14px; border:1px solid #e5e7eb; border-radius:18px; background:#fff; padding:16px; }
  .waocValuesTitle{ font-weight:700; color:#111827; margin-bottom:12px; }
  .waocValuesGrid{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
  .waocValue{ border:1px solid #eef2f7; border-radius:14px; padding:12px; background:linear-gradient(180deg,rgba(249,250,251,.9),rgba(255,255,255,1)); }
  .waocValueTop{ display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .waocValueBadge{ display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:8px; border:1px solid #e5e7eb; font-size:12px; color:#374151; background:#fff; }
  .waocValueName{ font-weight:650; color:#111827; }
  .waocValueDesc{ color:#4b5563; font-size:13px; }
  .waocEnterCard{ margin-top:14px; border:1px solid #e5e7eb; border-radius:18px; background:#fff; padding:16px; }
  .waocEnterTop{ display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:14px; }
  .waocEnterTitle{ font-size:18px; font-weight:800; }
  .waocEnterSub{ color:#6b7280; font-size:13px; margin-top:2px; }
  .waocBtnPrimary{ border:none; border-radius:14px; padding:12px 18px; background:#0b1220; color:#fff; font-weight:700; cursor:pointer; box-shadow:0 10px 18px rgba(17,24,39,.15); }
  .waocBtnPrimary:hover{ opacity:.92; }
  .waocAnchor{ display:flex; align-items:flex-start; justify-content:space-between; gap:14px; padding:14px; border-radius:16px; border:1px solid #eef2f7; background:linear-gradient(180deg,rgba(249,250,251,.75),rgba(255,255,255,1)); margin-bottom:14px; }
  .waocAnchor.collective{ border-color:#111827; box-shadow:0 0 0 4px rgba(17,24,39,.06); }
  .waocAnchorKicker{ font-size:11px; letter-spacing:.18em; color:#6b7280; }
  .waocAnchorTitle{ margin-top:6px; font-weight:800; color:#111827; font-size:14px; }
  .waocAnchorMeta{ margin-top:6px; display:flex; align-items:center; flex-wrap:wrap; gap:8px; color:#4b5563; font-size:13px; }
  .waocAnchorStrong{ font-weight:750; color:#111827; }
  .waocAnchorDot{ color:#9ca3af; }
  .waocAnchorRight{ text-align:right; min-width:200px; }
  .waocAnchorCountdown{ margin-top:6px; font-weight:900; letter-spacing:-.02em; font-size:18px; color:#111827; }
  .waocAnchorActions{ margin-top:8px; display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
  .waocBtnGhost{ height:34px; padding:0 12px; border-radius:999px; border:1px solid #e5e7eb; background:#fff; cursor:pointer; font-weight:650; color:#111827; font-size:12.5px; }
  .waocBtnGhost:hover{ border-color:#cbd5e1; }
  .waocAnchorHint{ font-size:12px; color:#6b7280; max-width:260px; }
  .waocEnterGrid{ display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:12px; align-items:start; }
  .waocGroup{ display:flex; flex-direction:column; gap:8px; }
  .waocLabel{ font-size:12px; letter-spacing:.12em; color:#6b7280; text-transform:uppercase; }
  .waocSelect{ width:100%; height:44px; border-radius:14px; border:1px solid #e5e7eb; padding:0 12px; background:#fff; outline:none; font-size:14px; }
  .waocSelect:focus{ border-color:#cbd5e1; box-shadow:0 0 0 4px rgba(148,163,184,.25); }
  .waocPills{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
  .waocPillBtn{ text-align:left; border:1px solid #e5e7eb; border-radius:14px; background:#fff; padding:10px 12px; cursor:pointer; transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease; }
  .waocPillBtn:hover{ transform:translateY(-1px); box-shadow:0 10px 20px rgba(17,24,39,.08); }
  .waocPillBtn.active{ border-color:#111827; box-shadow:0 0 0 4px rgba(17,24,39,.08); }
  .waocPillBtnTitle{ display:block; font-weight:750; color:#111827; font-size:13px; }
  .waocPillBtnSub{ display:block; color:#6b7280; font-size:12px; margin-top:2px; }
  .waocEnterFoot{ margin-top:10px; }
  .waocFooter{ margin-top:14px; color:#4b5563; font-size:14px; }
  .waocStrong{ font-weight:750; color:#111827; }
  @media (max-width:960px){
    .waocHeaderRow{ flex-direction:column; }
    .waocHeaderRight{ text-align:left; }
    .waocValuesGrid{ grid-template-columns:1fr; }
    .waocEnterGrid{ grid-template-columns:1fr; }
    .waocPills{ grid-template-columns:1fr 1fr; }
    .waocAnchor{ flex-direction:column; }
    .waocAnchorRight{ text-align:left; min-width:auto; }
    .waocAnchorActions{ align-items:flex-start; }
  }
`;
