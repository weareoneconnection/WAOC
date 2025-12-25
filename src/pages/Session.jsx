// src/pages/Session.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CollectiveResonanceField from "../components/CollectiveResonanceField.jsx";
import AudioPlayer from "../components/AudioPlayer.jsx";

/** ---------------- Options ---------------- */

const DURATIONS = [5, 10, 12, 15, 20, 30, 45, 60];

const MODES = [
  { key: "solo", label: "Solo (in the Field)" },
  { key: "collective", label: "Collective (in the Field)" },
];

const INTENTS = [
  { key: "peace", title: "Peace", sub: "Quiet the inner sea." },
  { key: "unity", title: "Unity", sub: "Return to the whole." },
  { key: "awareness", title: "Awareness", sub: "See without grasping." },
  { key: "compassion", title: "Compassion", sub: "Hold all with gentleness." },
  { key: "love", title: "Love", sub: "Nothing is excluded." },
];

/**
 * ✅ Sound Library
 * /public/audio/... (keep your existing structure)
 */
const SOUND_LIBRARY = [
  { group: "Silence", items: [{ key: "silence", label: "Silence (no audio)", src: null }] },
  {
    group: "Ambient (Classic)",
    items: [
      { key: "ocean", label: "Ocean", src: "/audio/ambient/ocean.mp3" },
      { key: "rain", label: "Rain", src: "/audio/ambient/rain.mp3" },
      { key: "wind", label: "Wind", src: "/audio/ambient/wind.mp3" },
      { key: "brown", label: "Brown Noise", src: "/audio/ambient/brown noise.mp3" },
    ],
  },
  {
    group: "Nature (Meditation)",
    items: [
      { key: "nature_forest", label: "Forest Calm", src: "/audio/meditation/nature/forest-calm.mp3" },
      { key: "nature_stream", label: "Stream Flow", src: "/audio/meditation/nature/stream-flow.mp3" },
      { key: "nature_night", label: "Night Insects", src: "/audio/meditation/nature/night-insects.mp3" },
    ],
  },
  {
    group: "Space (Meditation)",
    items: [
      { key: "space_deep", label: "Deep Space Drone", src: "/audio/meditation/space/deep-space-drone.mp3" },
      { key: "space_stars", label: "Starlight Pad", src: "/audio/meditation/space/starlight-pad.mp3" },
    ],
  },
  {
    group: "Tones (Meditation)",
    items: [
      { key: "tone_soft", label: "Soft Drone", src: "/audio/meditation/tones/soft-drone.mp3" },
      { key: "tone_binaural", label: "Binaural (gentle)", src: "/audio/meditation/tones/binaural-gentle.mp3" },
    ],
  },
];

const ANCHOR = {
  dayOfWeek: 0, // Sunday
  hourUTC: 20,
  minuteUTC: 0,
  title: "WAOC Global Sit",
  subtitle: "One World · One Breath · One Field",
};

const INTENT_PROFILE = {
  awareness: {
    mood: "Warming",
    pulse: "Steady",
    copy: "Nothing is required. Only attention.",
    statement: "For the next minutes, I will see without grasping — and let things be as they are.",
  },
  peace: {
    mood: "Quiet",
    pulse: "Soft",
    copy: "Let the field settle. Let breath widen.",
    statement: "For the next minutes, I quiet the inner sea — and return to simple breath.",
  },
  unity: {
    mood: "Warming",
    pulse: "Steady",
    copy: "Many breaths. One rhythm.",
    statement: "For the next minutes, I return myself to the whole — many breaths, one field.",
  },
  compassion: {
    mood: "Luminous",
    pulse: "Bright",
    copy: "Hold without choosing.",
    statement: "For the next minutes, I hold all with gentleness — without separating anything.",
  },
  love: {
    mood: "Open",
    pulse: "Wide",
    copy: "Nothing is excluded. Connection is allowed.",
    statement: "For the next minutes, I open the heart — nothing is excluded from the field.",
  },
};

/** ---------------- Component ---------------- */

export default function Session() {
  const nav = useNavigate();

  const [intent, setIntent] = useState("awareness");
  const [durationMin, setDurationMin] = useState(10);
  const [mode, setMode] = useState(MODES[0].label);

  const [soundGroup, setSoundGroup] = useState("Ambient (Classic)");
  const [soundKey, setSoundKey] = useState("ocean");

  const isCollective = mode === MODES[1].label;
  const profile = useMemo(() => INTENT_PROFILE[intent] || INTENT_PROFILE.awareness, [intent]);

  // ✅ ticker (for countdown + field status)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const anchorInfo = useMemo(() => {
    const nextUTC = getNextWeeklyUTC(ANCHOR.dayOfWeek, ANCHOR.hourUTC, ANCHOR.minuteUTC);
    const now = new Date();
    const msLeft = Math.max(0, nextUTC.getTime() - now.getTime());
    return {
      nextUTC,
      msLeft,
      localLabel: formatLocal(nextUTC),
      countdown: formatCountdown(msLeft),
      fieldState: getFieldState(msLeft),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tick]);

  const groups = useMemo(() => SOUND_LIBRARY.map((g) => g.group), []);
  const groupItems = useMemo(
    () => SOUND_LIBRARY.find((g) => g.group === soundGroup)?.items ?? [],
    [soundGroup]
  );

  useEffect(() => {
    if (!groupItems.length) return;
    const ok = groupItems.some((it) => it.key === soundKey);
    if (!ok) setSoundKey(groupItems[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundGroup]);

  const selectedSound = useMemo(() => {
    const it = groupItems.find((x) => x.key === soundKey);
    return it ?? { label: "Silence (no audio)", src: null };
  }, [groupItems, soundKey]);

  const soundSrc = selectedSound.src ?? null;
  const soundLabel = selectedSound.label ?? "Silence (no audio)";
  const showPlayer = !!soundSrc;

  const intentTitle = useMemo(() => INTENTS.find((x) => x.key === intent)?.title ?? "Awareness", [intent]);

  const readyLine = useMemo(() => {
    const modeShort = isCollective ? "Collective" : "Solo";
    const soundShort = soundSrc ? soundLabel : "Silence";
    return `${intentTitle} · ${durationMin} min · ${modeShort} · ${soundShort}`;
  }, [intentTitle, durationMin, isCollective, soundLabel, soundSrc]);

  function enter() {
    nav("/meditate", {
      state: {
        intent,
        durationMin,
        mode,
        sound: soundSrc ? soundLabel : "Silence",
        soundSrc,
      },
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

  const statement = useMemo(() => {
    const raw = profile.statement || "";
    return raw.replace("next minutes", `next ${durationMin} minutes`);
  }, [profile.statement, durationMin]);

  const enterHint = useMemo(() => {
    if (anchorInfo.fieldState === "Active") return "Enter now — the field is open.";
    if (anchorInfo.fieldState === "Gathering") return "The field is gathering. Enter gently.";
    return "Enter now — or return when the field gathers.";
  }, [anchorInfo.fieldState]);

  return (
    <div className="waocPage">
      {/* Top */}
      <div className="topRow">
        <div>
          <div className="kicker">COLLECTIVE RESONANCE</div>
          <div className="h1">We Are One Connection</div>
          <div className="lead">You are not alone here. The field listens, even in silence.</div>
        </div>

        <div className="status">
          <div className="tiny">Field status</div>
          <div className={`statusPill ${anchorInfo.fieldState.toLowerCase()}`}>
            <span className="pillStrong">{anchorInfo.fieldState}</span>
            <span className="dot">•</span>
            <span className="tiny">Mood</span>
            <span className="pillStrong">{profile.mood}</span>
            <span className="dot">•</span>
            <span className="tiny">Pulse</span>
            <span className="pillStrong">{profile.pulse}</span>
          </div>
          <div className="fine">No addresses. No ranks. No counts.</div>
        </div>
      </div>

      {/* Globe */}
      <div className="card stage">
        <CollectiveResonanceField intent={intent} mode={mode} durationMin={durationMin} />
      </div>

      {/* Main card */}
      <div className="card main">
        {/* Anchor */}
        <div className={`anchor ${isCollective ? "collective" : ""}`}>
          <div className="anchorLeft">
            <div className="anchorKicker">COLLECTIVE TIME ANCHOR</div>
            <div className="anchorTitle">{ANCHOR.subtitle}</div>
            <div className="anchorMeta">
              <span className="strong">Every Sunday</span>
              <span className="dot">•</span>
              <span className="strong">20:00 UTC</span>
              <span className="dot">•</span>
              <span className="tiny">{anchorInfo.localLabel}</span>
            </div>

            <div className="anchorRitual">
              <span className="ritualDot">●</span>
              <span>Take one natural breath before entering.</span>
            </div>
          </div>

          <div className="anchorRight">
            <div className="tiny">Next gathering</div>
            <div className="countdown">{anchorInfo.countdown}</div>
            <button className="ghost" onClick={downloadICS}>
              Add to calendar
            </button>
            <div className="hint">{enterHint}</div>
          </div>
        </div>

        {/* Two-column */}
        <div className="grid">
          {/* Left: Intent */}
          <section className="section">
            <div className="labelRow">
              <div className="label">Intent</div>
              <div className="micro">{profile.copy}</div>
            </div>

            <div className="intentGrid">
              {INTENTS.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  className={`intentPill ${intent === it.key ? "active" : ""}`}
                  onClick={() => setIntent(it.key)}
                >
                  <div className="intentTitle">{it.title}</div>
                  <div className="intentSub">{it.sub}</div>
                </button>
              ))}
            </div>

            {/* ✅ Intent statement */}
            <div className="statementCard">
              <div className="statementKicker">Intent Statement</div>
              <div className="statementText">{statement}</div>
            </div>
          </section>

          {/* Right: Settings + Music */}
          <section className="section">
            <div className="rightTop">
              <div>
                <div className="label">Duration</div>
                <select className="select" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} min
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="label">Mode</div>
                <select className="select" value={mode} onChange={(e) => setMode(e.target.value)}>
                  {MODES.map((m) => (
                    <option key={m.key} value={m.label}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <div className="fine">
                  {isCollective
                    ? "Collective mode · A shared field. Keep sound low and stable."
                    : "Solo mode · Your breath enters the field quietly."}
                </div>
              </div>
            </div>

            {/* Cleaner music block */}
            <div className="music">
              <div className="musicHead">
                <div className="label">Field Environment</div>
                <div className="micro">Optional</div>
              </div>

              <div className="musicPick">
                <div>
                  <div className="tiny">Category</div>
                  <select className="select" value={soundGroup} onChange={(e) => setSoundGroup(e.target.value)}>
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="tiny">Soundscape</div>
                  <select className="select" value={soundKey} onChange={(e) => setSoundKey(e.target.value)}>
                    {groupItems.map((it) => (
                      <option key={it.key} value={it.key}>
                        {it.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="playerCard">
                {showPlayer ? (
                  <AudioPlayer src={soundSrc} label={soundLabel} defaultVolume={0.22} />
                ) : (
                  <div className="silenceHint">Silence is a valid sound.</div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Final confirm bar */}
        <div className="enterBar">
          <div>
            <div className="enterTitle">Enter the Session</div>
            <div className="enterSub">Choose first. Then enter.</div>

            <div className="readyPill">
              <span className="readyTag">READY</span>
              <span className="readyText">{readyLine}</span>
              {soundSrc && <span className="audioTag">● audio</span>}
            </div>
          </div>

          <div className="enterRight">
            <div className="fine" style={{ margin: 0 }}>
              No tracking. No ranking. Only resonance.
            </div>
            <button className="primary" onClick={enter}>
              Enter the Field
            </button>
          </div>
        </div>
      </div>

      <div className="footer">
        In this field, <span className="strong">connection is the proof</span> — not a reward.
      </div>

      <style>{css}</style>
    </div>
  );
}

/* ---------------- Time helpers ---------------- */

function getNextWeeklyUTC(targetDow, hourUTC, minuteUTC) {
  const now = new Date();
  const nowUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    )
  );

  const candidate = new Date(
    Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate(), hourUTC, minuteUTC, 0)
  );

  const dow = nowUTC.getUTCDay();
  let diff = (targetDow - dow + 7) % 7;
  if (diff === 0 && candidate.getTime() <= nowUTC.getTime()) diff = 7;

  candidate.setUTCDate(candidate.getUTCDate() + diff);
  return candidate;
}

function formatLocal(d) {
  const parts = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
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

/**
 * Field status logic:
 * - Active: within 0–60 minutes to anchor (or just started)
 * - Gathering: within 60 minutes to 24 hours
 * - Dormant: otherwise
 */
function getFieldState(msLeft) {
  const minLeft = msLeft / 60000;
  if (minLeft <= 60) return "Active";
  if (minLeft <= 24 * 60) return "Gathering";
  return "Dormant";
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
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/* ---------------- Styling ---------------- */

const css = `
  .waocPage{
    max-width: 1100px;
    margin: 0 auto;
    padding: 26px 18px 44px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    color:#0b1220;
  }

  .kicker{ font-size:12px; letter-spacing:.18em; color:#6b7280; }
  .h1{ font-size:34px; line-height:1.12; margin-top:10px; font-weight:900; letter-spacing:-.02em; }
  .lead{ margin-top:10px; color:#4b5563; font-size:15.5px; }

  .topRow{ display:flex; justify-content:space-between; gap:16px; margin-bottom:12px; align-items:flex-start; }
  .status{ text-align:right; min-width:260px; }
  .tiny{ font-size:12px; color:#6b7280; }
  .fine{ font-size:12px; color:#6b7280; margin-top:8px; }
  .micro{ font-size:12px; color:#6b7280; }

  .statusPill{
    display:inline-flex; align-items:center; gap:10px;
    margin-top:6px; padding:8px 12px; border:1px solid #e5e7eb;
    border-radius:999px; background:#fff; box-shadow: 0 1px 0 rgba(0,0,0,.02);
  }
  .statusPill.active{ border-color:#111827; box-shadow: 0 0 0 4px rgba(17,24,39,.08); }
  .statusPill.gathering{ border-color:#0f172a; box-shadow: 0 0 0 4px rgba(15,23,42,.06); opacity:.96; }
  .statusPill.dormant{ opacity:.88; }

  .pillStrong{ font-weight:850; font-size:13px; color:#111827; }
  .dot{ color:#9ca3af; }

  .card{
    border:1px solid #e5e7eb; border-radius:18px; background:#fff;
    box-shadow: 0 12px 30px rgba(17,24,39,.06);
  }
  .stage{ overflow:hidden; margin-bottom:14px; }
  .main{ padding:16px; }

  .anchor{
    display:flex; justify-content:space-between; gap:14px;
    padding:14px; border-radius:16px; border:1px solid #eef2f7;
    background: linear-gradient(180deg, rgba(249,250,251,.75), rgba(255,255,255,1));
    margin-bottom:14px;
  }
  .anchor.collective{ border-color:#111827; box-shadow: 0 0 0 4px rgba(17,24,39,.06); }
  .anchorKicker{ font-size:11px; letter-spacing:.18em; color:#6b7280; }
  .anchorTitle{ margin-top:6px; font-weight:950; font-size:14px; color:#111827; }
  .anchorMeta{ margin-top:6px; display:flex; flex-wrap:wrap; gap:8px; font-size:13px; color:#4b5563; }
  .strong{ font-weight:900; color:#111827; }

  .anchorRitual{
    margin-top:10px;
    display:flex; align-items:center; gap:10px;
    font-size:12.5px;
    color:#6b7280;
  }
  .ritualDot{ color:#111827; opacity:.35; }

  .anchorRight{ text-align:right; min-width:210px; display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
  .countdown{ font-weight:950; font-size:18px; letter-spacing:-.02em; color:#111827; }
  .ghost{
    height:34px; padding:0 12px; border-radius:999px;
    border:1px solid #e5e7eb; background:#fff; cursor:pointer;
    font-weight:800; color:#111827; font-size:12.5px;
  }
  .ghost:hover{ border-color:#cbd5e1; }
  .hint{ font-size:12px; color:#6b7280; max-width:260px; text-align:right; }

  .grid{
    display:grid;
    grid-template-columns: 1.1fr 1fr;
    gap:16px;
    align-items:start;
  }

  .section{ display:flex; flex-direction:column; gap:10px; }
  .labelRow{ display:flex; justify-content:space-between; gap:10px; align-items:baseline; }
  .label{ font-size:12px; letter-spacing:.14em; color:#6b7280; text-transform:uppercase; }

  .intentGrid{
    display:grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap:10px;
  }
  .intentPill{
    text-align:left; border:1px solid #e5e7eb; border-radius:14px; background:#fff;
    padding:10px 12px; cursor:pointer;
    transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
  }
  .intentPill:hover{ transform: translateY(-1px); box-shadow: 0 10px 20px rgba(17,24,39,.08); }
  .intentPill.active{ border-color:#111827; box-shadow: 0 0 0 4px rgba(17,24,39,.08); }
  .intentTitle{ font-weight:900; font-size:13px; color:#111827; }
  .intentSub{ margin-top:2px; font-size:12px; color:#6b7280; }

  .statementCard{
    margin-top:6px;
    border:1px solid #eef2f7;
    border-radius:16px;
    padding:12px;
    background: linear-gradient(180deg, rgba(249,250,251,.65), rgba(255,255,255,1));
  }
  .statementKicker{
    font-size:11px; letter-spacing:.18em; color:#6b7280;
    text-transform:uppercase;
  }
  .statementText{
    margin-top:8px;
    font-size:13.5px;
    color:#111827;
    font-weight:800;
    line-height:1.35;
  }

  .rightTop{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap:12px;
    align-items:start;
  }

  .select{
    width:100%; height:44px; border-radius:14px; border:1px solid #e5e7eb;
    padding:0 12px; background:#fff; outline:none; font-size:14px;
  }
  .select:focus{ border-color:#cbd5e1; box-shadow: 0 0 0 4px rgba(148,163,184,.25); }

  .music{
    margin-top:2px;
    border:1px solid #eef2f7;
    border-radius:16px;
    padding:12px;
    background:#fff;
  }
  .musicHead{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; margin-bottom:8px; }
  .musicPick{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap:12px;
    margin-bottom:10px;
  }
  .playerCard{
    border:1px solid #eef2f7; border-radius:14px; padding:10px 12px; background:#fff;
  }
  .silenceHint{ font-size:12.5px; color:#6b7280; }

  .enterBar{
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #eef2f7;
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap: 12px;
  }
  .enterTitle{ font-size:18px; font-weight:950; }
  .enterSub{ color:#6b7280; font-size:13px; margin-top:2px; }

  .readyPill{
    margin-top:10px;
    display:flex; align-items:center; gap:10px;
    padding:8px 10px;
    border:1px solid #eef2f7;
    border-radius:999px;
    background:#fff;
    width: fit-content;
    max-width: 100%;
  }
  .readyTag{
    font-size:11px; letter-spacing:.12em; text-transform:uppercase;
    color:#6b7280; font-weight:900;
  }
  .readyText{
    font-size:12.5px; color:#111827; font-weight:850;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    max-width: 560px;
  }
  .audioTag{ font-size:12px; color:#111827; font-weight:900; opacity:.75; }

  .enterRight{ display:flex; align-items:flex-end; gap: 12px; }
  .primary{
    border:none; border-radius:14px; padding:12px 18px;
    background:#0b1220; color:#fff; font-weight:950; cursor:pointer;
    box-shadow: 0 10px 18px rgba(17,24,39,.15); min-width: 150px;
  }
  .primary:hover{ opacity:.92; }

  .footer{ margin-top:14px; color:#4b5563; font-size:14px; }

  @media (max-width: 960px){
    .topRow{ flex-direction:column; }
    .status{ text-align:left; min-width:auto; }
    .anchor{ flex-direction:column; }
    .anchorRight{ text-align:left; align-items:flex-start; min-width:auto; }
    .hint{ text-align:left; }
    .grid{ grid-template-columns: 1fr; }
    .rightTop{ grid-template-columns: 1fr; }
    .musicPick{ grid-template-columns: 1fr; }
    .enterBar{ flex-direction:column; align-items:stretch; }
    .enterRight{ justify-content:space-between; align-items:center; }
    .readyText{ max-width: 100%; }
  }
`;
