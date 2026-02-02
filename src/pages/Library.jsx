// src/pages/Library.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Library (Upgraded)
 * - Not content. Entrances.
 * - Local-only state: Saved / Recent / Custom rituals
 * - No tracking, no ranks, no counts
 * - Enter -> /meditate with Session-compatible state
 */

const ONE_MISSION_URL = "https://one-mission.vercel.app";

const TABS = [
  { key: "packs", label: "Packs" },
  { key: "builder", label: "Builder" },
  { key: "saved", label: "Saved" },
  { key: "recent", label: "Recent" },
  { key: "gates", label: "Gates" },
];

const DURATIONS = [5, 10, 12, 15, 20, 30, 45, 60];

const MODES = [
  { key: "solo", label: "Solo (in the Field)" },
  { key: "collective", label: "Collective (in the Field)" },
];

const INTENTS = [
  { key: "awareness", title: "Awareness", sub: "See without grasping." },
  { key: "peace", title: "Peace", sub: "Quiet the inner sea." },
  { key: "unity", title: "Unity", sub: "Return to the whole." },
  { key: "compassion", title: "Compassion", sub: "Hold all with gentleness." },
  { key: "love", title: "Love", sub: "Nothing is excluded." },
];

/**
 * Must match your /public/audio paths.
 * (Keep aligned with Session.jsx to avoid mismatch.)
 */
const SOUND_LIBRARY = [
  { group: "Silence", items: [{ key: "silence", label: "Silence (no audio)", src: null }] },
  {
    group: "Ambient (Classic)",
    items: [
      { key: "ocean", label: "Ocean", src: "/audio/ambient/ocean.mp3" },
      { key: "rain", label: "Rain", src: "/audio/ambient/rain.mp3" },
      { key: "wind", label: "Wind", src: "/audio/ambient/wind.mp3" },
      { key: "brown", label: "Brown Noise", src: "/audio/ambient/brown-noise.mp3" },
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

const STORAGE_SAVED = "waoc_library_saved_v1";
const STORAGE_RECENT = "waoc_library_recent_v1";
const STORAGE_CUSTOM = "waoc_library_custom_v1";

const CORE_VALUES = [
  "No addresses. No ranks. No counts.",
  "Connection is the proof — not a reward.",
  "You are sitting with others, even if you never met.",
];

// ---------- Base Packs ----------
const BASE_PACKS = [
  {
    packId: "awareness",
    title: "Awareness Pack",
    sub: "Seeing without grasping. The world becomes wide again.",
    items: [
      {
        id: "aw_enter_threshold",
        title: "Enter the Threshold",
        desc: "A clean doorway. One breath becomes a signal.",
        intent: "awareness",
        durationMin: 10,
        mode: MODES[0].label,
        soundGroup: "Silence",
        soundKey: "silence",
        tags: ["proof", "silence", "threshold"],
      },
      {
        id: "aw_wide_seeing",
        title: "Wide Seeing",
        desc: "Let attention open. No forcing.",
        intent: "awareness",
        durationMin: 12,
        mode: MODES[0].label,
        soundGroup: "Space (Meditation)",
        soundKey: "space_deep",
        tags: ["wide", "space"],
      },
      {
        id: "aw_silent_circle",
        title: "Silent Circle",
        desc: "Nothing added. Nothing taken.",
        intent: "awareness",
        durationMin: 20,
        mode: "Silent Circle",
        soundGroup: "Silence",
        soundKey: "silence",
        tags: ["circle", "minimal"],
      },
    ],
  },
  {
    packId: "peace",
    title: "Peace Pack",
    sub: "Quiet across oceans. A gentler world begins inside you.",
    items: [
      {
        id: "p_quiet_inner_sea",
        title: "Quiet the Inner Sea",
        desc: "Soften the world by softening your grasp.",
        intent: "peace",
        durationMin: 15,
        mode: MODES[1].label,
        soundGroup: "Ambient (Classic)",
        soundKey: "ocean",
        tags: ["ocean", "breath", "collective"],
      },
      {
        id: "p_soft_breath",
        title: "Soft Breath",
        desc: "Short, clean, steady.",
        intent: "peace",
        durationMin: 10,
        mode: MODES[0].label,
        soundGroup: "Silence",
        soundKey: "silence",
        tags: ["simple", "quiet"],
      },
      {
        id: "p_ocean_field",
        title: "Ocean Field",
        desc: "Wave-like presence.",
        intent: "peace",
        durationMin: 12,
        mode: MODES[1].label,
        soundGroup: "Ambient (Classic)",
        soundKey: "ocean",
        tags: ["ocean", "field"],
      },
    ],
  },
  {
    packId: "unity",
    title: "Unity Pack",
    sub: "Many breaths. One field. Separation loosens for a moment.",
    items: [
      {
        id: "u_return_whole",
        title: "Return to the Whole",
        desc: "Shared attention, not agreement.",
        intent: "unity",
        durationMin: 10,
        mode: MODES[1].label,
        soundGroup: "Tones (Meditation)",
        soundKey: "tone_soft",
        tags: ["whole", "together"],
      },
      {
        id: "u_we_are_one",
        title: "We Are One Connection",
        desc: "Sit as if the world can feel it.",
        intent: "unity",
        durationMin: 15,
        mode: MODES[1].label,
        soundGroup: "Space (Meditation)",
        soundKey: "space_deep",
        tags: ["waoc", "collective"],
      },
    ],
  },
  {
    packId: "compassion",
    title: "Compassion Pack",
    sub: "Hold all with gentleness. Nothing is excluded.",
    items: [
      {
        id: "c_hold_whole",
        title: "Hold the Whole",
        desc: "Include what you usually reject.",
        intent: "compassion",
        durationMin: 12,
        mode: MODES[0].label,
        soundGroup: "Space (Meditation)",
        soundKey: "space_deep",
        tags: ["hold", "gentle"],
      },
      {
        id: "c_gentle_return",
        title: "Gentle Return",
        desc: "Short ritual, warm center.",
        intent: "compassion",
        durationMin: 10,
        mode: MODES[0].label,
        soundGroup: "Silence",
        soundKey: "silence",
        tags: ["warm", "short"],
      },
    ],
  },
];

// ---------- Page ----------
export default function Library() {
  const nav = useNavigate();

  const [tab, setTab] = useState("packs");
  const [query, setQuery] = useState("");

  const [savedIds, setSavedIds] = useState(() => loadSavedIds());
  const [recent, setRecent] = useState(() => loadRecent());
  const [custom, setCustom] = useState(() => loadCustom());

  useEffect(() => saveSavedIds(savedIds), [savedIds]);
  useEffect(() => saveRecent(recent), [recent]);
  useEffect(() => saveCustom(custom), [custom]);

  // Builder form
  const [bTitle, setBTitle] = useState("My Ritual");
  const [bDesc, setBDesc] = useState("A small doorway. A clean start.");
  const [bIntent, setBIntent] = useState("awareness");
  const [bDuration, setBDuration] = useState(10);
  const [bMode, setBMode] = useState(MODES[0].label);
  const [bSoundGroup, setBSoundGroup] = useState("Silence");
  const [bSoundKey, setBSoundKey] = useState("silence");

  const groups = useMemo(() => SOUND_LIBRARY.map((g) => g.group), []);
  const groupItems = useMemo(
    () => SOUND_LIBRARY.find((g) => g.group === bSoundGroup)?.items ?? [],
    [bSoundGroup]
  );

  useEffect(() => {
    if (!groupItems.length) return;
    const ok = groupItems.some((it) => it.key === bSoundKey);
    if (!ok) setBSoundKey(groupItems[0].key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bSoundGroup]);

  const allPacks = useMemo(() => {
    const customPack =
      custom.length > 0
        ? [
            {
              packId: "custom",
              title: "Custom",
              sub: "Your own entrances. Local-only.",
              items: custom,
            },
          ]
        : [];
    return [...customPack, ...BASE_PACKS];
  }, [custom]);

  const allItemsFlat = useMemo(() => {
    const base = [];
    for (const p of allPacks) for (const it of p.items) base.push({ ...it, packId: p.packId, packTitle: p.title });
    return base;
  }, [allPacks]);

  const savedItems = useMemo(() => {
    const set = new Set(savedIds);
    return allItemsFlat.filter((x) => set.has(x.id));
  }, [allItemsFlat, savedIds]);

  const recentItems = useMemo(() => {
    const byId = new Map(allItemsFlat.map((x) => [x.id, x]));
    return recent
      .map((r) => {
        const it = byId.get(r.id);
        if (!it) return null;
        return { ...it, recentAt: r.at };
      })
      .filter(Boolean);
  }, [allItemsFlat, recent]);

  const filteredPacks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allPacks;

    const match = (it) => {
      const intentTitle = INTENTS.find((x) => x.key === it.intent)?.title ?? "";
      const hay = [
        it.title,
        it.desc,
        it.intent,
        intentTitle,
        it.mode,
        it.soundGroup,
        it.soundKey,
        ...(it.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    };

    return allPacks
      .map((p) => ({ ...p, items: p.items.filter(match) }))
      .filter((p) => p.items.length > 0);
  }, [allPacks, query]);

  function isSaved(id) {
    return savedIds.includes(id);
  }

  function toggleSaved(id) {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }

  function pushRecent(id) {
    const at = new Date().toISOString();
    setRecent((prev) => {
      const next = [{ id, at }, ...prev.filter((x) => x.id !== id)];
      return next.slice(0, 20);
    });
  }

  function getSound(it) {
    const items = SOUND_LIBRARY.find((g) => g.group === it.soundGroup)?.items ?? [];
    const selected = items.find((x) => x.key === it.soundKey) ?? { label: "Silence (no audio)", src: null };
    const srcRaw = selected.src ?? null;
    const soundSrc = srcRaw ? encodeURI(srcRaw) : null;
    return {
      sound: soundSrc ? selected.label : "Silence",
      soundSrc,
      soundLabel: selected.label ?? "Silence (no audio)",
    };
  }

  function enter(it) {
    const { sound, soundSrc } = getSound(it);

    pushRecent(it.id);

    nav("/meditate", {
      state: {
        intent: it.intent,
        durationMin: Number(it.durationMin) || 10,
        mode: it.mode,

        ritualName: it.title,
        cadence: "4–6",

        sound,
        soundSrc,

        variantSeed: `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`,
      },
    });
  }

  function addCustomAndEnter() {
    const id = `custom-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
    const newItem = {
      id,
      title: safeText(bTitle, "My Ritual"),
      desc: safeText(bDesc, "A small doorway."),
      intent: bIntent,
      durationMin: bDuration,
      mode: bMode,
      soundGroup: bSoundGroup,
      soundKey: bSoundKey,
      tags: ["custom"],
    };

    setCustom((prev) => [newItem, ...prev]);
    setTab("packs");
    setTimeout(() => enter(newItem), 0);
  }

  function saveCustomOnly() {
    const id = `custom-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
    const newItem = {
      id,
      title: safeText(bTitle, "My Ritual"),
      desc: safeText(bDesc, "A small doorway."),
      intent: bIntent,
      durationMin: bDuration,
      mode: bMode,
      soundGroup: bSoundGroup,
      soundKey: bSoundKey,
      tags: ["custom"],
    };
    setCustom((prev) => [newItem, ...prev]);
    setTab("packs");
  }

  return (
    <div className="page">
      {/* Header row */}
      <div className="heroRow">
        <div>
          <div className="kicker">COLLECTIVE RESONANCE</div>
          <div className="h1">Library</div>
          <div className="lead">
            Not content. <span className="strong">Entrances.</span> A library of rituals aligned with WAOC: collective
            resonance without identity.
          </div>
          {/* ✅ Presence note (Hero) */}
          <div className="presenceNote">You don’t need to finish anything here.</div>
        </div>

        <div className="values">
          <div className="valuesTitle">WAOC Core Values</div>
          <ul className="valuesList">
            {CORE_VALUES.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tabs + Search + Action */}
      <div className="toolbar">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rightBar">
          <input
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entrances… (peace, unity, proof, silence)"
          />
          <button className="buildBtn" onClick={() => setTab("builder")}>
            + Build Ritual
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === "packs" && (
        <>
          {/* ✅ Presence note (Packs) */}
          <div className="presenceNote">
            You are not choosing the best ritual. <br />
            You are noticing what resonates.
          </div>

          <div className="grid">
            {filteredPacks.map((p) => (
              <div key={p.packId} className="packCard">
                <div className="packHead">
                  <div className="packTitle">{p.title}</div>
                  <div className="packSub">{p.sub}</div>
                </div>

                <div className="items">
                  {p.items.map((it, idx) => (
                    <RitualCard
                      key={it.id}
                      it={it}
                      saved={isSaved(it.id)}
                      onToggleSaved={() => toggleSaved(it.id)}
                      onEnter={() => enter(it)}
                      showPresenceNote={idx === 0}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "saved" && (
        <div className="panel">
          <div className="panelTitle">Saved</div>
          <div className="panelSub">Local-only. No accounts. No syncing.</div>
          {/* ✅ Presence note (Saved) */}
          <div className="presenceNote" style={{ marginTop: 8 }}>
            Saved does not mean important.
          </div>

          {savedItems.length === 0 ? (
            <div className="empty">Nothing saved yet. Tap ☆ on an entrance.</div>
          ) : (
            <div className="gridOne">
              {savedItems.map((it) => (
                <RitualRow key={it.id} it={it} saved onToggleSaved={() => toggleSaved(it.id)} onEnter={() => enter(it)} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "recent" && (
        <div className="panel">
          <div className="panelTitle">Recent</div>
          <div className="panelSub">A quiet memory on this device only.</div>
          {/* ✅ Presence note (Recent) */}
          <div className="presenceNote" style={{ marginTop: 8 }}>
            Recent does not mean progress.
          </div>

          {recentItems.length === 0 ? (
            <div className="empty">No recent entrances yet. Enter one from Packs.</div>
          ) : (
            <div className="gridOne">
              {recentItems.map((it) => (
                <RitualRow
                  key={it.id}
                  it={it}
                  saved={isSaved(it.id)}
                  onToggleSaved={() => toggleSaved(it.id)}
                  onEnter={() => enter(it)}
                  metaRight={it.recentAt ? `Last: ${toNice(it.recentAt)}` : null}
                />
              ))}
            </div>
          )}

          {recentItems.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <button className="ghost" onClick={() => setRecent([])}>
                Clear recent
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "builder" && (
        <div className="panel">
          <div className="panelTitle">Builder</div>
          <div className="panelSub">Create an entrance. Local-only. No identity.</div>
          {/* ✅ Presence note (Builder top) */}
          <div className="presenceNote" style={{ marginTop: 8 }}>
            This is not something to perfect.
          </div>

          <div className="builder">
            <div className="bCol">
              <div className="label">Title</div>
              <input className="input" value={bTitle} onChange={(e) => setBTitle(e.target.value)} />
              <div className="label" style={{ marginTop: 10 }}>
                Description
              </div>
              <textarea className="textarea" value={bDesc} onChange={(e) => setBDesc(e.target.value)} rows={4} />
            </div>

            <div className="bCol">
              <div className="bGrid">
                <div>
                  <div className="label">Intent</div>
                  <select className="select" value={bIntent} onChange={(e) => setBIntent(e.target.value)}>
                    {INTENTS.map((x) => (
                      <option key={x.key} value={x.key}>
                        {x.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="label">Duration</div>
                  <select className="select" value={bDuration} onChange={(e) => setBDuration(Number(e.target.value))}>
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} min
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="label">Mode</div>
                  <select className="select" value={bMode} onChange={(e) => setBMode(e.target.value)}>
                    {MODES.map((m) => (
                      <option key={m.key} value={m.label}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="musicBox">
                <div className="musicHead">
                  <div className="label">Field Environment</div>
                  <div className="micro">Optional</div>
                </div>

                <div className="bGrid">
                  <div>
                    <div className="tiny">Category</div>
                    <select className="select" value={bSoundGroup} onChange={(e) => setBSoundGroup(e.target.value)}>
                      {groups.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="tiny">Soundscape</div>
                    <select className="select" value={bSoundKey} onChange={(e) => setBSoundKey(e.target.value)}>
                      {groupItems.map((it) => (
                        <option key={it.key} value={it.key}>
                          {it.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="builderHint">Tip: Silence is valid. If you choose audio, keep it low and stable.</div>
              </div>

              {/* ✅ Presence note (Builder actions) */}
              <div className="presenceNote" style={{ marginTop: 10, marginBottom: 8 }}>
                A simple doorway is enough.
              </div>

              <div className="builderActions">
                <button className="ghost" onClick={saveCustomOnly}>
                  Save to Packs
                </button>
                <button className="primary" onClick={addCustomAndEnter}>
                  Save & Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "gates" && (
        <div className="panel">
          <div className="panelTitle">Gates</div>
          {/* ✅ Presence note (Gates) */}
          <div className="presenceNote" style={{ marginTop: 8 }}>
            Presence comes before action.
          </div>
          <div className="panelSub">Three simple doors. No accounts.</div>

          <div className="gates">
            <div className="gateCard">
              <div className="gateKicker">PROOF LAYER</div>
              <div className="gateTitle">Proof of Presence</div>
              <div className="gateDesc">Hashes + timestamps only. Optional wallet signature.</div>
              <Link className="gateBtn" to="/field">
                Open Proof →
              </Link>
            </div>

            <div className="gateCard">
              <div className="gateKicker">SESSION</div>
              <div className="gateTitle">Enter the Field</div>
              <div className="gateDesc">Pick intent, duration, mode, sound — then sit.</div>
              <Link className="gateBtn" to="/session">
                Open Session →
              </Link>
            </div>

            <div className="gateCard">
              <div className="gateKicker">WAOC INFRA</div>
              <div className="gateTitle">One Mission</div>
              <div className="gateDesc">On-chain contribution & reputation layer. Missions → Points.</div>
              <a className="gateBtn" href={ONE_MISSION_URL} target="_blank" rel="noreferrer">
                Open One Mission →
              </a>
            </div>
          </div>

          {/* ✅ Presence note (Bottom) */}
          <div className="presenceNote" style={{ marginTop: 12, marginBottom: 8 }}>
            The field does not require loyalty.
          </div>

          <div className="bottomLinks">
            <Link to="/meditate">Meditate</Link>
            <span className="sep">•</span>
            <a href={ONE_MISSION_URL} target="_blank" rel="noreferrer">
              One Mission
            </a>
            <span className="sep">•</span>
            <Link to="/about">About</Link>
            <span className="sep">•</span>
            <Link to="/settings">Settings</Link>
          </div>
        </div>
      )}

      <style>{css}</style>
    </div>
  );
}

// ---------- Components ----------
function RitualCard({ it, saved, onToggleSaved, onEnter, showPresenceNote }) {
  const intentTitle = useMemo(() => INTENTS.find((x) => x.key === it.intent)?.title ?? it.intent, [it.intent]);

  return (
    <div className="ritualCard">
      <div className="ritualMain">
        <div>
          <div className="ritualTitle">{it.title}</div>
          <div className="ritualDesc">{it.desc}</div>

          <div className="metaRow">
            <span className="chip">{intentTitle}</span>
            <span className="chip">{it.durationMin} min</span>
            <span className="chip">{prettySound(it)}</span>
            <span className="chip">{it.mode}</span>
          </div>

          {showPresenceNote && <div className="presenceNote inCard">Enter as you are.</div>}
        </div>

        <div className="ritualActions">
          <button className="star" onClick={onToggleSaved} title={saved ? "Unsave" : "Save"}>
            {saved ? "★" : "☆"}
          </button>
          <button className="saveBtn" onClick={onToggleSaved}>
            {saved ? "Saved" : "Save"}
          </button>
          <button className="enterBtn" onClick={onEnter}>
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}

function RitualRow({ it, saved, onToggleSaved, onEnter, metaRight }) {
  const intentTitle = useMemo(() => INTENTS.find((x) => x.key === it.intent)?.title ?? it.intent, [it.intent]);

  return (
    <div className="rowCard">
      <div>
        <div className="rowTitle">{it.title}</div>
        <div className="rowSub">
          {intentTitle} · {it.durationMin} min · {prettySound(it)} · {it.mode}
        </div>
        {metaRight && <div className="rowMeta">{metaRight}</div>}
      </div>

      <div className="rowActions">
        <button className="star" onClick={onToggleSaved} title={saved ? "Unsave" : "Save"}>
          {saved ? "★" : "☆"}
        </button>
        <button className="ghost" onClick={onEnter}>
          Enter
        </button>
      </div>
    </div>
  );
}

function prettySound(it) {
  if (!it.soundGroup || it.soundGroup === "Silence") return "Silence";
  if (it.soundKey === "ocean") return "Ocean breath";
  if (it.soundKey === "space_deep") return "Deep space";
  if (it.soundKey === "tone_soft") return "Soft drone";
  return it.soundGroup.replace(" (Meditation)", "").replace(" (Classic)", "");
}

// ---------- Storage ----------
function loadSavedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveSavedIds(ids) {
  try {
    localStorage.setItem(STORAGE_SAVED, JSON.stringify(Array.isArray(ids) ? ids : []));
  } catch {}
}

function loadRecent() {
  try {
    const raw = localStorage.getItem(STORAGE_RECENT);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveRecent(arr) {
  try {
    localStorage.setItem(STORAGE_RECENT, JSON.stringify(Array.isArray(arr) ? arr : []));
  } catch {}
}

function loadCustom() {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveCustom(arr) {
  try {
    localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(Array.isArray(arr) ? arr : []));
  } catch {}
}

function safeText(s, fallback) {
  const t = String(s ?? "").trim();
  return t.length ? t : fallback;
}

function toNice(iso) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

// ---------- Styling (Calm Minimal + Masonry) ----------
const css = `
  :root{
    --bg:#ffffff;
    --ink:#0b1220;
    --muted:#4b5563;
    --muted2:#6b7280;
    --border: rgba(15, 23, 42, .10);
    --soft: rgba(15, 23, 42, .06);

    --r16:16px;
    --r18:18px;

    --chipBg: rgba(15, 23, 42, .035);
    --chipText: rgba(15, 23, 42, .78);
  }

  .page{
    max-width: 1120px;
    margin: 0 auto;
    padding: 22px 16px 44px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    color: var(--ink);
    background: var(--bg);
  }

  /* Presence notes (static, minimal) */
  .presenceNote{
    margin: 10px 0 0;
    font-size: 12.5px;
    line-height: 1.45;
    color: rgba(15,23,42,.45);
    font-weight: 500;
  }
  .presenceNote.inCard{
    margin-top: 10px;
  }

  .kicker{
    font-size: 11px;
    letter-spacing: .18em;
    color: var(--muted2);
    text-transform: uppercase;
    font-weight: 650;
  }
  .h1{
    font-size: 34px;
    line-height: 1.06;
    margin-top: 10px;
    font-weight: 760;
    letter-spacing: -0.035em;
  }
  .lead{
    margin-top: 10px;
    color: var(--muted);
    font-size: 14.5px;
    line-height: 1.5;
    max-width: 760px;
  }
  .strong{ font-weight: 760; color: var(--ink); }
  .tiny, .micro{ font-size: 12px; color: var(--muted2); }
  .sep{ color: rgba(15,23,42,.32); }

  .heroRow{
    display:flex;
    justify-content:space-between;
    gap: 16px;
    align-items:flex-start;
  }
  .values{
    min-width: 320px;
    border: 1px solid var(--soft);
    border-radius: var(--r18);
    padding: 14px;
    background: rgba(15,23,42,.02);
  }
  .valuesTitle{
    font-weight: 720;
    color: var(--ink);
    font-size: 14px;
    letter-spacing: .01em;
  }
  .valuesList{
    margin: 10px 0 0;
    padding-left: 18px;
    color: var(--muted);
    font-weight: 560;
  }
  .valuesList li{ margin: 6px 0; line-height: 1.4; }

  .toolbar{
    margin-top: 14px;
    display:flex;
    justify-content:space-between;
    gap: 12px;
    align-items:center;
  }
  .tabs{
    display:flex;
    gap: 10px;
    align-items:center;
    flex-wrap: wrap;
  }
  .tab{
    border: 1px solid var(--soft);
    background: transparent;
    border-radius: 999px;
    padding: 9px 12px;
    font-weight: 650;
    font-size: 13px;
    cursor:pointer;
    color: rgba(15,23,42,.78);
  }
  .tab:hover{ border-color: var(--border); }
  .tab.active{
    border-color: var(--border);
    background: rgba(15,23,42,.03);
    box-shadow: 0 0 0 4px rgba(15,23,42,.04);
    color: rgba(15,23,42,.92);
  }

  .rightBar{
    display:flex;
    gap: 10px;
    align-items:center;
    justify-content:flex-end;
    flex: 1;
    min-width: 320px;
  }
  .search{
    width: 560px;
    max-width: 56vw;
    height: 42px;
    border-radius: 999px;
    border: 1px solid var(--soft);
    padding: 0 14px;
    outline: none;
    font-size: 14px;
    background: rgba(15,23,42,.02);
    color: var(--ink);
  }
  .search::placeholder{ color: rgba(15,23,42,.45); }
  .search:focus{
    border-color: var(--border);
    background: #fff;
    box-shadow: 0 0 0 4px rgba(15,23,42,.05);
  }

  .buildBtn{
    height: 42px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.12);
    padding: 0 14px;
    background: rgba(15,23,42,.92);
    color: #fff;
    font-weight: 700;
    cursor:pointer;
    white-space: nowrap;
  }
  .buildBtn:hover{ opacity:.93; }

  /* Masonry */
  .grid{
    margin-top: 14px;
    column-count: 2;
    column-gap: 14px;
  }
  .packCard{
    display:inline-block;
    width:100%;
    break-inside: avoid;
    margin: 0 0 14px;
    border: 1px solid var(--soft);
    border-radius: var(--r18);
    background: #fff;
    overflow:hidden;
  }
  .packHead{
    padding: 14px 14px 10px;
    border-bottom: 1px solid var(--soft);
    background: rgba(15,23,42,.015);
  }
  .packTitle{
    font-size: 16px;
    font-weight: 740;
    color: rgba(15,23,42,.92);
    letter-spacing: -0.01em;
  }
  .packSub{
    margin-top: 6px;
    color: rgba(15,23,42,.56);
    font-weight: 560;
    font-size: 12.8px;
    line-height: 1.4;
  }
  .items{ padding: 12px; display:flex; flex-direction: column; gap: 10px; }

  .ritualCard{
    border: 1px solid var(--soft);
    border-radius: var(--r16);
    padding: 12px;
    background:#fff;
  }
  .ritualMain{
    display:flex;
    justify-content:space-between;
    gap: 12px;
    align-items:flex-start;
  }
  .ritualTitle{
    font-weight: 720;
    font-size: 15px;
    color: rgba(15,23,42,.92);
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .ritualDesc{
    margin-top: 6px;
    color: rgba(15,23,42,.56);
    font-weight: 560;
    font-size: 12.8px;
    line-height: 1.4;
    max-width: 560px;
  }

  .metaRow{
    margin-top: 10px;
    display:flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip{
    font-size: 11.5px;
    font-weight: 650;
    color: var(--chipText);
    border: 1px solid rgba(15,23,42,.06);
    border-radius: 999px;
    padding: 6px 10px;
    background: var(--chipBg);
    line-height:1;
  }

  .ritualActions{
    display:flex;
    gap: 10px;
    align-items:center;
    justify-content:flex-end;
    min-width: 184px;
  }
  .star{
    width: 38px; height: 38px;
    border-radius: 999px;
    border: 1px solid var(--soft);
    background: rgba(15,23,42,.02);
    cursor:pointer;
    font-weight: 720;
    font-size: 18px;
    line-height: 1;
    color: rgba(15,23,42,.78);
  }
  .star:hover{ border-color: var(--border); background: rgba(15,23,42,.03); }

  .saveBtn{
    height: 38px;
    border-radius: 14px;
    border: 1px solid var(--soft);
    background: rgba(15,23,42,.02);
    cursor:pointer;
    font-weight: 650;
    padding: 0 12px;
    color: rgba(15,23,42,.78);
  }
  .saveBtn:hover{ border-color: var(--border); background: rgba(15,23,42,.03); }

  .enterBtn{
    height: 38px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.12);
    background: rgba(15,23,42,.92);
    color:#fff;
    cursor:pointer;
    font-weight: 720;
    padding: 0 14px;
  }
  .enterBtn:hover{ opacity:.93; }

  .panel{
    margin-top: 14px;
    border: 1px solid var(--soft);
    border-radius: var(--r18);
    background:#fff;
    padding: 14px;
  }
  .panelTitle{
    font-size: 16px;
    font-weight: 740;
    color: rgba(15,23,42,.92);
  }
  .panelSub{
    margin-top: 6px;
    color: rgba(15,23,42,.56);
    font-weight: 560;
    font-size: 12.8px;
  }
  .empty{
    margin-top: 14px;
    color: rgba(15,23,42,.56);
    font-weight: 560;
    padding: 14px;
    border: 1px dashed rgba(15,23,42,.16);
    border-radius: var(--r16);
    background: rgba(15,23,42,.02);
  }

  .gridOne{
    margin-top: 12px;
    display:flex;
    flex-direction: column;
    gap: 10px;
  }
  .rowCard{
    border: 1px solid var(--soft);
    border-radius: var(--r16);
    padding: 12px;
    display:flex;
    justify-content:space-between;
    gap: 12px;
    align-items:center;
    background:#fff;
  }
  .rowTitle{ font-weight: 720; font-size: 14.5px; color: rgba(15,23,42,.92); }
  .rowSub{ margin-top: 4px; color: rgba(15,23,42,.56); font-weight: 560; font-size: 12.8px; }
  .rowMeta{ margin-top: 4px; color: rgba(15,23,42,.48); font-weight: 560; font-size: 12px; }

  .rowActions{ display:flex; gap: 10px; align-items:center; }

  .ghost{
    height: 38px;
    border-radius: 14px;
    border: 1px solid var(--soft);
    background: rgba(15,23,42,.02);
    cursor:pointer;
    font-weight: 650;
    padding: 0 14px;
    color: rgba(15,23,42,.78);
  }
  .ghost:hover{ border-color: var(--border); background: rgba(15,23,42,.03); }

  .builder{
    margin-top: 12px;
    display:grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 14px;
  }
  .bCol{
    border: 1px solid var(--soft);
    border-radius: var(--r16);
    padding: 12px;
    background:#fff;
  }
  .label{
    font-size: 11px;
    letter-spacing: .14em;
    color: rgba(15,23,42,.48);
    text-transform: uppercase;
    font-weight: 650;
  }
  .input{
    width:100%;
    height: 42px;
    border-radius: 14px;
    border: 1px solid var(--soft);
    padding: 0 12px;
    font-size: 14px;
    outline:none;
    background: rgba(15,23,42,.02);
  }
  .input:focus{ border-color: var(--border); background:#fff; box-shadow: 0 0 0 4px rgba(15,23,42,.05); }
  .textarea{
    width:100%;
    border-radius: 14px;
    border: 1px solid var(--soft);
    padding: 10px 12px;
    font-size: 14px;
    outline:none;
    resize: vertical;
    background: rgba(15,23,42,.02);
  }
  .textarea:focus{ border-color: var(--border); background:#fff; box-shadow: 0 0 0 4px rgba(15,23,42,.05); }

  .bGrid{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items:start;
  }
  .select{
    width:100%;
    height: 42px;
    border-radius: 14px;
    border: 1px solid var(--soft);
    padding: 0 12px;
    font-size: 14px;
    outline:none;
    background: rgba(15,23,42,.02);
  }
  .select:focus{ border-color: var(--border); background:#fff; box-shadow: 0 0 0 4px rgba(15,23,42,.05); }

  .musicBox{
    margin-top: 12px;
    border: 1px solid var(--soft);
    border-radius: var(--r16);
    padding: 12px;
    background: rgba(15,23,42,.015);
  }
  .musicHead{
    display:flex;
    justify-content:space-between;
    align-items:baseline;
    gap: 10px;
    margin-bottom: 10px;
  }
  .builderHint{
    margin-top: 10px;
    color: rgba(15,23,42,.48);
    font-weight: 560;
    font-size: 12px;
    line-height: 1.4;
  }

  .builderActions{
    display:flex;
    justify-content:flex-end;
    gap: 10px;
  }
  .primary{
    height: 38px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.12);
    background: rgba(15,23,42,.92);
    color:#fff;
    cursor:pointer;
    font-weight: 720;
    padding: 0 14px;
  }
  .primary:hover{ opacity:.93; }

  .gates{
    margin-top: 12px;
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
  }
  .gateCard{
    border: 1px solid var(--soft);
    border-radius: var(--r16);
    padding: 14px;
    background:#fff;
  }
  .gateKicker{
    font-size: 11px;
    letter-spacing: .18em;
    color: rgba(15,23,42,.48);
    text-transform: uppercase;
    font-weight: 650;
  }
  .gateTitle{
    margin-top: 8px;
    font-size: 16px;
    font-weight: 740;
    color: rgba(15,23,42,.92);
  }
  .gateDesc{
    margin-top: 6px;
    color: rgba(15,23,42,.56);
    font-weight: 560;
    font-size: 12.8px;
    line-height: 1.4;
  }
  .gateBtn{
    margin-top: 12px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    height: 38px;
    padding: 0 14px;
    border-radius: 14px;
    background: rgba(15,23,42,.92);
    color:#fff;
    text-decoration:none;
    font-weight: 720;
    border: 1px solid rgba(15,23,42,.12);
  }
  .gateBtn:hover{ opacity:.93; }

  .bottomLinks{
    margin-top: 10px;
    display:flex;
    gap: 10px;
    align-items:center;
    color: rgba(15,23,42,.48);
    font-weight: 650;
    flex-wrap: wrap;
  }
  .bottomLinks a{ color: rgba(15,23,42,.78); text-decoration:none; }
  .bottomLinks a:hover{ text-decoration:underline; }

  @media (max-width: 960px){
    .heroRow{ flex-direction: column; }
    .values{ min-width: auto; }
    .toolbar{ flex-direction: column; align-items: stretch; }
    .rightBar{ justify-content: space-between; min-width: unset; }
    .search{ width: 100%; max-width: none; }
    .grid{ column-count: 1; }
    .builder{ grid-template-columns: 1fr; }
    .bGrid{ grid-template-columns: 1fr; }
    .gates{ grid-template-columns: 1fr; }
    .ritualActions{ min-width: auto; }
    .ritualMain{ flex-direction: column; }
  }
`;
