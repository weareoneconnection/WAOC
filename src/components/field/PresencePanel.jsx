import { useMemo, useState } from "react";
import { hashLite, loadPresence, savePresence } from "../../lib/presence/presenceStore";

export default function PresencePanel({ onEventSaved }) {
  const [connected, setConnected] = useState(false); // v1 占位：后面接 wallet adapter
  const [busy, setBusy] = useState(false);

  const ritualId = "global_field_v1";
  const sessionId = useMemo(() => {
    // 每次进入页面生成一个 session（你也可以改成“开始冥想时生成”）
    return hashLite(`${ritualId}:${Date.now()}:${Math.random()}`);
  }, []);

  const onEnter = async () => {
    setBusy(true);
    try {
      // v1：本地记录，后面替换为链上 tx
      const next = savePresence({
        type: "enter",
        ritualIdHash: hashLite(ritualId),
        sessionIdHash: hashLite(sessionId),
        wallet: connected ? "connected" : "anonymous",
      });
      onEventSaved?.(next);
    } finally {
      setBusy(false);
    }
  };

  const onComplete = async () => {
    setBusy(true);
    try {
      const next = savePresence({
        type: "complete",
        ritualIdHash: hashLite(ritualId),
        sessionIdHash: hashLite(sessionId),
        wallet: connected ? "connected" : "anonymous",
      });
      onEventSaved?.(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">Proof of Presence (optional)</div>

        <button
          className="text-sm px-3 py-1 rounded-xl border border-white/10"
          onClick={() => setConnected(v => !v)}
        >
          {connected ? "Wallet: Connected" : "Connect Wallet"}
        </button>
      </div>

      <div className="text-sm opacity-80">
        Start: “I enter the field.” End: “I completed the ritual.”
        <br />
        On-chain later: only hashes + timestamps. No tracking.
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 rounded-2xl px-4 py-3 border border-white/10"
          disabled={busy}
          onClick={onEnter}
        >
          Enter the Field
        </button>

        <button
          className="flex-1 rounded-2xl px-4 py-3 border border-white/10"
          disabled={busy}
          onClick={onComplete}
        >
          Complete Ritual
        </button>
      </div>

      <div className="text-xs opacity-60">
        You can meditate without connecting a wallet.
        Connecting simply adds public meaning — not rewards.
      </div>
    </section>
  );
}
