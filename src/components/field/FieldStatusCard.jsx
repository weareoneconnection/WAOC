export default function FieldStatusCard({ status }) {
  return (
    <section className="rounded-2xl border border-white/10 p-5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">Field Status</div>
        <div className="text-sm font-semibold">{status.label}</div>
      </div>
      <div className="text-sm opacity-80">{status.hint}</div>
      <div className="text-xs opacity-60">
        This is a resonance signal — not a participant count.
      </div>
    </section>
  );
}
