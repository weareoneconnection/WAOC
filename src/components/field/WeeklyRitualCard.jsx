function nextGlobalRitual() {
  // 示例：每周日 21:00（你可改）
  const now = new Date();
  const target = new Date(now);
  target.setHours(21, 0, 0, 0);

  const day = now.getDay(); // 0=Sun
  const diff = (7 - day) % 7; // days until Sun
  target.setDate(now.getDate() + diff);
  if (target <= now) target.setDate(target.getDate() + 7);

  return target;
}

export default function WeeklyRitualCard() {
  const t = nextGlobalRitual();

  return (
    <section className="rounded-2xl border border-white/10 p-5 space-y-2">
      <div className="text-sm opacity-70">Weekly Global Ritual</div>
      <div className="text-lg font-semibold">Field is open</div>
      <div className="text-sm opacity-80">
        Next opening: {t.toLocaleString()}
      </div>
      <div className="text-xs opacity-60">
        We don’t publish counts. We publish a shared moment.
      </div>
    </section>
  );
}
