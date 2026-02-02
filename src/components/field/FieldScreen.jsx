import { useMemo, useState } from "react";
import FieldStatusCard from "./FieldStatusCard";
import WeeklyRitualCard from "./WeeklyRitualCard";
import PresencePanel from "./PresencePanel";
import { loadPresence } from "../../lib/presence/presenceStore";

export default function FieldScreen() {
  const [presenceEvents, setPresenceEvents] = useState(() => loadPresence());

  // v1：用“最近事件密度”模拟场域状态（后面换成链上聚合）
  const fieldStatus = useMemo(() => {
    const now = Date.now();
    const last24h = presenceEvents.filter(e => now - e.ts < 24 * 3600 * 1000);
    const n = last24h.length;
    if (n === 0) return { key: "dormant", label: "Dormant", hint: "The field is quiet." };
    if (n < 5)  return { key: "warming", label: "Warming", hint: "A gentle pulse is rising." };
    if (n < 20) return { key: "steady",  label: "Steady",  hint: "The field is holding." };
    return { key: "surge", label: "Surge", hint: "A strong resonance is present." };
  }, [presenceEvents]);

  return (
    <div className="min-h-screen w-full flex justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <div className="text-sm opacity-70">WAOC Meditation</div>
          <h1 className="text-3xl font-semibold leading-tight">
            Collective Field
          </h1>
          <p className="opacity-80">
            No tracking. No ranks. No counts. Only a shared field.
          </p>
        </header>

        <FieldStatusCard status={fieldStatus} />

        <WeeklyRitualCard />

        <PresencePanel
          onEventSaved={(next) => setPresenceEvents(next)}
        />

        <section className="rounded-2xl border border-white/10 p-5 space-y-2">
          <div className="text-sm font-medium">What is this?</div>
          <p className="text-sm opacity-80">
            This is not a check-in system. It’s a public ritual layer.
            Presence can be verifiable without surveillance.
          </p>
        </section>
      </div>
    </div>
  );
}
