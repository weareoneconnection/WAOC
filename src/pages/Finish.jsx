// src/pages/Finish.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FinishScreen from "../components/finish/FinishScreen.jsx";

/**
 * Finish page responsibilities:
 * - Receive session summary from /meditate via navigate state
 * - Render FinishScreen (Proof Card + Share + Closing line)
 * - Save ritual locally (optional) with no tracking
 */

const LS_KEY = "waoc_saved_rituals_v1";

function loadSaved() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveRitualLocal(entry) {
  const list = loadSaved();
  const next = [entry, ...list].slice(0, 50); // keep last 50
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

export default function Finish() {
  const nav = useNavigate();
  const { state } = useLocation();

  // If user refreshes /finish and state is lost
  const fallbackSession = {
    ritualName: "Silent Circle",
    durationMinutes: 10,
    cadence: "4–6",
    sound: "Silence",
    endedAt: Date.now(),
  };

  const session = state
    ? {
        ritualName: state.ritualName || fallbackSession.ritualName,
        durationMinutes: Number(state.durationMinutes ?? state.durationMin ?? 10) || 10,
        cadence: state.cadence || "4–6",
        sound: state.sound || "Silence",
        endedAt: state.endedAt ?? Date.now(),
        variantSeed: state.variantSeed, // optional
      }
    : fallbackSession;

  return (
    <FinishScreen
      session={session}
      onEnterAgain={() => {
        // 回到 session 配置页（不破坏结构）
        nav("/session");
      }}
      onSaveRitual={(s) => {
        // 本地保存，不上传
        saveRitualLocal({
          ...s,
          savedAt: Date.now(),
        });
      }}
      footerRight="weareoneconnection.org"
    />
  );
}
