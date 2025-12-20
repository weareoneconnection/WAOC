import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LS_FAV = "waoc_library_favs_v1";
const LS_SAVED = "waoc_saved_rituals_v1";
const LS_RECENT = "waoc_recent_rituals_v1";

const INTENTS = [
  { key: "peace", label: "Peace", line: "Quiet the inner sea." },
  { key: "unity", label: "Unity", line: "Return to the whole." },
  { key: "awareness", label: "Awareness", line: "See without grasping." },
  { key: "compassion", label: "Compassion", line: "Hold all with gentleness." },
];

const MODES = [
  "Solo (in the Field)",
  "Collective (in the Field)",
  "Silent Circle",
];

const SOUNDS = [
  "Silence",
  "Soft drone",
  "Ocean breath",
  "Deep space",
];

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function intentLabel(k) {
  return INTENTS.find((x) => x.key === k)?.label || "Presence";
}

export default function Library() {
  const nav = useNavigate();

  const [tab, setTab] = useState("Packs"); // Packs | Builder | Saved | Recent | Gates
  const [q, setQ] = useState("");

  const [favs, setFavs] = useState(() => readLS(LS_FAV, {})); // {id:true}
  const [saved, setSaved] = useState(() => readLS(LS_SAVED, [])); // array of rituals
  const [recent, setRecent] = useState(() => readLS(LS_RECENT, [])); // array of rituals

  // Builder state
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builder, setBuilder] = useState({
    title: "Enter the Threshold",
    intent: "awareness",
    durationMin: 10,
    mode: "Solo (in the Field)",
    sound: "Silence",
    note: "A small ritual of attention.",
  });

  useEffect(() => writeLS(LS_FAV, favs), [favs]);
  useEffect(() => writeLS(LS_SAVED, saved), [saved]);
  useEffect(() => writeLS(LS_RECENT, recent), [recent]);

  // Packs（与你的 WAOC 理念对齐：不是内容，而是入口）
  const packs = useMemo(() => {
    const mk = (p) => ({
      id: p.id,
      title: p.title,
      tag: p.tag,
      line: p.line,
      ritual: {
        id: p.id,
        title: p.title,
        intent: p.intent,
        durationMin: p.durationMin,
        mode: p.mode,
        sound: p.sound,
        note: p.note,
      },
    });

    return [
      {
        id: "pack-awareness",
        title: "Awareness Pack",
        subtitle: "Seeing without grasping. The world becomes wide again.",
        items: [
          mk({
            id: "aw-threshold-10",
            title: "Enter the Threshold",
            tag: "Foundational",
            line: "A clean doorway. One breath becomes a signal.",
            intent: "awareness",
            durationMin: 10,
            mode: "Solo (in the Field)",
            sound: "Silence",
            note: "Connection is the proof — not a reward.",
          }),
          mk({
            id: "aw-wide-12",
            title: "Wide Seeing",
            tag: "Awareness",
            line: "Let attention open. No forcing.",
            intent: "awareness",
            durationMin: 12,
            mode: "Solo (in the Field)",
            sound: "Deep space",
            note: "Seeing becomes wide again.",
          }),
          mk({
            id: "aw-silent-20",
            title: "Silent Circle",
            tag: "Ritual",
            line: "Nothing added. Nothing taken.",
            intent: "awareness",
            durationMin: 20,
            mode: "Silent Circle",
            sound: "Silence",
            note: "No counts. Only resonance.",
          }),
        ],
      },
      {
        id: "pack-peace",
        title: "Peace Pack",
        subtitle: "Quiet across oceans. A gentler world begins inside you.",
        items: [
          mk({
            id: "pc-inner-sea-15",
            title: "Quiet the Inner Sea",
            tag: "Peace",
            line: "Soften the world by softening your grasp.",
            intent: "peace",
            durationMin: 15,
            mode: "Collective (in the Field)",
            sound: "Ocean breath",
            note: "A calm that doesn’t need control.",
          }),
          mk({
            id: "pc-soft-10",
            title: "Soft Breath",
            tag: "Peace",
            line: "Short, clean, steady.",
            intent: "peace",
            durationMin: 10,
            mode: "Solo (in the Field)",
            sound: "Silence",
            note: "The field listens in silence.",
          }),
          mk({
            id: "pc-ocean-12",
            title: "Ocean Field",
            tag: "Peace",
            line: "Wave-like presence.",
            intent: "peace",
            durationMin: 12,
            mode: "Collective (in the Field)",
            sound: "Ocean breath",
            note: "No ranks. Only resonance.",
          }),
        ],
      },
      {
        id: "pack-unity",
        title: "Unity Pack",
        subtitle: "Many breaths. One field. Separation loosens for a moment.",
        items: [
          mk({
            id: "un-return-10",
            title: "Return to the Whole",
            tag: "Unity",
            line: "Shared attention, not agreement.",
            intent: "unity",
            durationMin: 10,
            mode: "Collective (in the Field)",
            sound: "Soft drone",
            note: "Unity as practice.",
          }),
          mk({
            id: "un-we-are-15",
            title: "We Are One Connection",
            tag: "WAOC",
            line: "Sit as if the world can feel it.",
            intent: "unity",
            durationMin: 15,
            mode: "Collective (in the Field)",
            sound: "Deep space",
            note: "You are sitting with others, even if you never met.",
          }),
        ],
      },
      {
        id: "pack-compassion",
        title: "Compassion Pack",
        subtitle: "Hold all with gentleness. Nothing is excluded.",
        items: [
          mk({
            id: "cp-hold-12",
            title: "Hold the Whole",
            tag: "Compassion",
            line: "Include what you usually reject.",
            intent: "compassion",
            durationMin: 12,
            mode: "Solo (in the Field)",
            sound: "Deep space",
            note: "Nothing is excluded.",
          }),
          mk({
            id: "cp-gentle-10",
            title: "Gentle Return",
            tag: "Compassion",
            line: "Short ritual, warm center.",
            intent: "compassion",
            durationMin: 10,
            mode: "Solo (in the Field)",
            sound: "Silence",
            note: "Hold all with gentleness.",
          }),
        ],
      },
    ];
  }, []);

  const gates = useMemo(
    () => [
      {
        id: "gate-1",
        title: "WAOC = Access / Proof of Resonance",
        status: "Coming soon",
        line: "Holding WAOC is not payment. It is existence-as-permission. The field recognizes presence, not purchase.",
      },
      {
        id: "gate-2",
        title: "WAOC = Intent Signal",
        status: "Planned",
        line: "Intent can be anonymously recorded into a collective resonance map — no identity, no address.",
      },
      {
        id: "gate-3",
        title: "Collective Map",
        status: "Planned",
        line: "A living globe of resonance. Not a leaderboard — a weather system of attention.",
      },
    ],
    []
  );

  // Search helper
  const matches = (obj) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    const t = `${obj.title || ""} ${obj.tag || ""} ${obj.line || ""} ${obj.note || ""}`.toLowerCase();
    return t.includes(s);
  };

  function toggleFav(id) {
    setFavs((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }

  function pushRecent(ritual) {
    setRecent((prev) => {
      const next = [
        { ...ritual, _ts: Date.now() },
        ...prev.filter((x) => x.id !== ritual.id),
      ].slice(0, 12);
      return next;
    });
  }

  function enterRitual(ritual) {
    // 最稳：统一走 /session，让 Session 页面读取 state 预填
    pushRecent(ritual);
    nav("/session", {
      state: {
        preset: {
          intent: ritual.intent,
          durationMin: ritual.durationMin,
          mode: ritual.mode,
          sound: ritual.sound,
          title: ritual.title,
          note: ritual.note,
        },
      },
    });
  }

  function saveRitual(ritual) {
    const item = { ...ritual, savedId: uid(), savedAt: Date.now() };
    setSaved((prev) => [item, ...prev]);
  }

  function removeSaved(savedId) {
    setSaved((prev) => prev.filter((x) => x.savedId !== savedId));
  }

  const savedFiltered = useMemo(() => saved.filter(matches), [saved, q]);
  const recentFiltered = useMemo(() => recent.filter(matches), [recent, q]);

  return (
    <div className="page">
      {/* Header */}
      <div className="topRow">
        <div>
          <div className="kicker">COLLECTIVE RESONANCE</div>
          <div className="h1">Library</div>
          <div className="lead">
            Not content. <b>Entrances.</b> A library of rituals aligned with WAOC:
            collective resonance without identity.
          </div>
        </div>

        <div className="fieldState">
          <div className="muted">WAOC Core Values</div>
          <div className="values">
            <div className="value">No addresses. No ranks. No counts.</div>
            <div className="value">Connection is the proof — not a reward.</div>
            <div className="value">You are sitting with others, even if you never met.</div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="libTop">
          <div className="tabs">
            {["Packs", "Builder", "Saved", "Recent", "Gates"].map((t) => (
              <button
                key={t}
                type="button"
                className={`tabBtn ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="rightTop">
            <input
              className="search"
              placeholder="Search entrances… (peace, unity, proof, silence)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btnPrimary" onClick={() => { setTab("Builder"); setBuilderOpen(true); }}>
              + Build Ritual
            </button>
          </div>
        </div>

        {/* Packs */}
        {tab === "Packs" && (
          <div className="packGrid">
            {packs.map((p) => (
              <div key={p.id} className="pack">
                <div className="packHead">
                  <div className="packTitle">{p.title}</div>
                  <div className="packSub">{p.subtitle}</div>
                </div>

                <div className="packItems">
                  {p.items.filter((x) => matches(x)).map((it) => (
                    <div key={it.id} className="ritualRow">
                      <div className="ritualLeft">
                        <div className="ritualTitle">{it.title}</div>
                        <div className="ritualLine">{it.line}</div>
                        <div className="chips">
                          <span className="chip">{intentLabel(it.ritual.intent)}</span>
                          <span className="chip">{it.ritual.durationMin} min</span>
                          <span className="chip">{it.ritual.sound}</span>
                          <span className="chip">{it.ritual.mode}</span>
                        </div>
                      </div>

                      <div className="ritualActions">
                        <button className="btnGhost" onClick={() => toggleFav(it.id)}>
                          {favs[it.id] ? "★" : "☆"}
                        </button>
                        <button className="btnGhost" onClick={() => saveRitual(it.ritual)}>
                          Save
                        </button>
                        <button className="btnPrimary" onClick={() => enterRitual(it.ritual)}>
                          Enter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Builder */}
        {tab === "Builder" && (
          <div className="builderWrap">
            <div className="builderCard">
              <div className="builderHead">
                <div>
                  <div className="h2">Ritual Builder</div>
                  <div className="muted">
                    Build a session template. No wallet required. No counts shown.
                  </div>
                </div>
                <button className="btnPrimary" onClick={() => setBuilderOpen(true)}>
                  Open Builder
                </button>
              </div>

              <div className="preview">
                <div className="previewTitle">{builder.title}</div>
                <div className="previewLine">{builder.note}</div>
                <div className="chips">
                  <span className="chip">{intentLabel(builder.intent)}</span>
                  <span className="chip">{builder.durationMin} min</span>
                  <span className="chip">{builder.sound}</span>
                  <span className="chip">{builder.mode}</span>
                </div>

                <div className="previewActions">
                  <button className="btnGhost" onClick={() => saveRitual({ id: `custom-${uid()}`, ...builder })}>
                    Save to Library
                  </button>
                  <button className="btnPrimary" onClick={() => enterRitual({ id: `custom-${uid()}`, ...builder })}>
                    Enter Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved */}
        {tab === "Saved" && (
          <div className="listGrid">
            {savedFiltered.length === 0 ? (
              <Empty title="No saved rituals" hint="Save a ritual from Packs or Builder." />
            ) : (
              savedFiltered.map((r) => (
                <div key={r.savedId} className="itemCard">
                  <div className="itemHead">
                    <div className="itemTitle">{r.title}</div>
                    <span className="tag">Saved</span>
                  </div>
                  <div className="itemLine">{r.note}</div>
                  <div className="chips">
                    <span className="chip">{intentLabel(r.intent)}</span>
                    <span className="chip">{r.durationMin} min</span>
                    <span className="chip">{r.sound}</span>
                    <span className="chip">{r.mode}</span>
                  </div>
                  <div className="rowActions">
                    <button className="btnGhost" onClick={() => removeSaved(r.savedId)}>Remove</button>
                    <button className="btnPrimary" onClick={() => enterRitual(r)}>Enter</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Recent */}
        {tab === "Recent" && (
          <div className="listGrid">
            {recentFiltered.length === 0 ? (
              <Empty title="No recent entries" hint="Enter any ritual once — it will appear here." />
            ) : (
              recentFiltered.map((r) => (
                <div key={r.id} className="itemCard">
                  <div className="itemHead">
                    <div className="itemTitle">{r.title}</div>
                    <span className="tag">Recent</span>
                  </div>
                  <div className="itemLine">{r.note}</div>
                  <div className="chips">
                    <span className="chip">{intentLabel(r.intent)}</span>
                    <span className="chip">{r.durationMin} min</span>
                    <span className="chip">{r.sound}</span>
                    <span className="chip">{r.mode}</span>
                  </div>
                  <div className="rowActions">
                    <button className="btnPrimary" onClick={() => enterRitual(r)}>Enter</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Gates */}
        {tab === "Gates" && (
          <div className="listGrid">
            {gates.filter(matches).map((g) => (
              <div key={g.id} className="itemCard">
                <div className="itemHead">
                  <div className="itemTitle">{g.title}</div>
                  <span className="tag">{g.status}</span>
                </div>
                <div className="itemLine">{g.line}</div>
                <div className="gateNote">
                  WAOC is not a reward token here. It’s a proof-of-resonance key — “存在即许可”.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Builder Modal */}
      {builderOpen && (
        <div className="modalBack" onMouseDown={() => setBuilderOpen(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <div>
                <div className="h2">Build a Ritual</div>
                <div className="muted">A template for entering the field.</div>
              </div>
              <button className="btnGhost" onClick={() => setBuilderOpen(false)}>Close</button>
            </div>

            <div className="formGrid">
              <div className="field">
                <div className="label">Title</div>
                <input
                  className="input"
                  value={builder.title}
                  onChange={(e) => setBuilder((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="field">
                <div className="label">Intent</div>
                <select
                  className="input"
                  value={builder.intent}
                  onChange={(e) => setBuilder((p) => ({ ...p, intent: e.target.value }))}
                >
                  {INTENTS.map((x) => (
                    <option key={x.key} value={x.key}>{x.label}</option>
                  ))}
                </select>
                <div className="hint">{INTENTS.find((x) => x.key === builder.intent)?.line}</div>
              </div>

              <div className="field">
                <div className="label">Duration</div>
                <select
                  className="input"
                  value={builder.durationMin}
                  onChange={(e) => setBuilder((p) => ({ ...p, durationMin: Number(e.target.value) }))}
                >
                  {[5, 8, 10, 12, 15, 20, 25, 30].map((n) => (
                    <option key={n} value={n}>{n} min</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="label">Mode</div>
                <select
                  className="input"
                  value={builder.mode}
                  onChange={(e) => setBuilder((p) => ({ ...p, mode: e.target.value }))}
                >
                  {MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <div className="label">Sound</div>
                <select
                  className="input"
                  value={builder.sound}
                  onChange={(e) => setBuilder((p) => ({ ...p, sound: e.target.value }))}
                >
                  {SOUNDS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="field span2">
                <div className="label">Note</div>
                <input
                  className="input"
                  value={builder.note}
                  onChange={(e) => setBuilder((p) => ({ ...p, note: e.target.value }))}
                />
              </div>
            </div>

            <div className="modalActions">
              <button className="btnGhost" onClick={() => saveRitual({ id: `custom-${uid()}`, ...builder })}>
                Save to Library
              </button>
              <button className="btnPrimary" onClick={() => { enterRitual({ id: `custom-${uid()}`, ...builder }); setBuilderOpen(false); }}>
                Enter
              </button>
            </div>

            <div className="modalFoot">
              No addresses. No ranks. No counts. Only resonance.
            </div>
          </div>
        </div>
      )}

      {/* Styles (self-contained) */}
      <style>{`
        .topRow{ display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:flex-start; }
        .kicker{ letter-spacing:.18em; font-size:12px; color:var(--muted); font-weight:900; }
        .h1{ font-size:28px; font-weight:950; margin-top:6px; }
        .lead{ margin-top:8px; color:var(--muted); max-width:720px; line-height:1.45; }
        .muted{ color:var(--muted); }
        .fieldState{ min-width:320px; border:1px solid var(--line); border-radius:14px; padding:12px; background:#fff; }
        .values{ margin-top:8px; display:flex; flex-direction:column; gap:6px; }
        .value{ font-size:13px; font-weight:800; color:#111827; }
        .card{ margin-top:14px; border:1px solid var(--line); border-radius:16px; background:#fff; padding:14px; }
        .libTop{ display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
        .tabs{ display:flex; gap:8px; flex-wrap:wrap; }
        .tabBtn{ border:1px solid var(--line); background:#fff; padding:8px 12px; border-radius:999px; cursor:pointer; font-weight:950; color:var(--muted); }
        .tabBtn.active{ color:#111827; border-color:#111827; }
        .rightTop{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; justify-content:flex-end; }
        .search{ min-width:320px; max-width:520px; flex:1; border:1px solid var(--line); border-radius:12px; padding:10px 12px; font-size:14px; }
        .btnPrimary{ background:#111827; color:#fff; border:none; padding:10px 14px; border-radius:12px; cursor:pointer; font-weight:950; }
        .btnGhost{ background:#fff; border:1px solid var(--line); color:#111827; padding:10px 12px; border-radius:12px; cursor:pointer; font-weight:900; }
        .packGrid{ margin-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .pack{ border:1px solid var(--line); border-radius:16px; padding:12px; background:rgba(0,0,0,.02); }
        .packHead{ padding:6px 4px 10px 4px; }
        .packTitle{ font-weight:980; font-size:16px; }
        .packSub{ margin-top:4px; color:var(--muted); font-size:13px; }
        .packItems{ display:flex; flex-direction:column; gap:10px; }
        .ritualRow{ border:1px solid var(--line); border-radius:14px; background:#fff; padding:12px; display:flex; gap:12px; align-items:flex-start; justify-content:space-between; }
        .ritualLeft{ flex:1; min-width:0; }
        .ritualTitle{ font-weight:950; }
        .ritualLine{ margin-top:4px; color:var(--muted); font-size:13px; line-height:1.45; }
        .chips{ margin-top:8px; display:flex; flex-wrap:wrap; gap:8px; }
        .chip{ border:1px solid var(--line); border-radius:999px; padding:4px 10px; font-size:12px; color:var(--muted); font-weight:800; }
        .ritualActions{ display:flex; gap:8px; align-items:center; }
        .listGrid{ margin-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .itemCard{ border:1px solid var(--line); border-radius:16px; padding:12px; background:#fff; }
        .itemHead{ display:flex; justify-content:space-between; align-items:center; gap:10px; }
        .itemTitle{ font-weight:950; }
        .tag{ border:1px solid var(--line); border-radius:999px; padding:4px 10px; font-size:12px; color:#111827; font-weight:900; white-space:nowrap; }
        .itemLine{ margin-top:6px; color:var(--muted); line-height:1.45; font-size:13px; }
        .rowActions{ margin-top:10px; display:flex; gap:10px; justify-content:flex-end; }
        .gateNote{ margin-top:10px; font-size:12px; color:var(--muted); border-top:1px solid rgba(0,0,0,.06); padding-top:10px; }
        .builderWrap{ margin-top:12px; }
        .builderCard{ border:1px solid var(--line); border-radius:16px; padding:14px; background:rgba(0,0,0,.02); }
        .builderHead{ display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; align-items:center; }
        .h2{ font-size:18px; font-weight:980; }
        .preview{ margin-top:12px; border:1px solid var(--line); border-radius:16px; padding:14px; background:#fff; }
        .previewTitle{ font-weight:980; font-size:16px; }
        .previewLine{ margin-top:6px; color:var(--muted); }
        .previewActions{ margin-top:12px; display:flex; gap:10px; justify-content:flex-end; flex-wrap:wrap; }

        .modalBack{ position:fixed; inset:0; background:rgba(0,0,0,.38); display:flex; align-items:center; justify-content:center; padding:18px; z-index:50; }
        .modal{ width:min(860px, 100%); background:#fff; border-radius:18px; border:1px solid rgba(255,255,255,.18); box-shadow:0 20px 60px rgba(0,0,0,.25); padding:14px; }
        .modalHead{ display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .formGrid{ margin-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .field{ border:1px solid var(--line); border-radius:14px; padding:10px; background:rgba(0,0,0,.02); }
        .span2{ grid-column: span 2; }
        .label{ font-size:12px; font-weight:950; color:#111827; letter-spacing:.08em; text-transform:uppercase; }
        .input{ margin-top:8px; width:100%; border:1px solid var(--line); border-radius:12px; padding:10px 12px; font-size:14px; background:#fff; }
        .hint{ margin-top:6px; color:var(--muted); font-size:12px; }
        .modalActions{ margin-top:12px; display:flex; justify-content:flex-end; gap:10px; flex-wrap:wrap; }
        .modalFoot{ margin-top:10px; color:var(--muted); font-size:12px; border-top:1px solid rgba(0,0,0,.06); padding-top:10px; }

        @media (max-width: 920px){
          .packGrid{ grid-template-columns:1fr; }
          .listGrid{ grid-template-columns:1fr; }
          .formGrid{ grid-template-columns:1fr; }
          .span2{ grid-column: span 1; }
          .search{ min-width:0; width:100%; }
        }
      `}</style>
    </div>
  );
}

function Empty({ title, hint }) {
  return (
    <div style={{
      border: "1px dashed var(--line)",
      borderRadius: 16,
      padding: 18,
      background: "rgba(0,0,0,.02)"
    }}>
      <div style={{ fontWeight: 950, fontSize: 16 }}>{title}</div>
      <div style={{ marginTop: 6, color: "var(--muted)" }}>{hint}</div>
    </div>
  );
}
