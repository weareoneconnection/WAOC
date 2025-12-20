// src/components/IntentPanel.jsx
import React from "react";

export default function IntentPanel({ intent, setIntent }) {
  const items = [
    { key: "peace", title: "Peace", sub: "Quiet the inner sea." },
    { key: "unity", title: "Unity", sub: "Return to the whole." },
    { key: "awareness", title: "Awareness", sub: "See without grasping." },
    { key: "compassion", title: "Compassion", sub: "Hold all with gentleness." },
  ];

  return (
    <div className="card">
      <div className="cardHead">
        <div>
          <div className="kicker">Intent Signal</div>
          <div className="h2">Today I sit with…</div>
          <div className="muted">No addresses. No ranks. No counts. Only resonance.</div>
        </div>
      </div>

      <div className="grid2">
        {items.map((it) => {
          const active = intent === it.key;
          return (
            <button
              key={it.key}
              className={`intentBtn ${active ? "active" : ""}`}
              onClick={() => setIntent(it.key)}
              type="button"
            >
              <div className="intentTitle">
                {it.title}
                {active ? <span className="chip">chosen</span> : null}
              </div>
              <div className="intentSub">{it.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
