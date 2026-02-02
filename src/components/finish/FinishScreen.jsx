// src/components/finish/FinishScreen.jsx
import React, { useMemo, useState } from "react";
import ProofCardPreview from "./ProofCardPreview.jsx";
import ShareButtons from "./ShareButtons.jsx";
import {
  SHARE_CAPTIONS,
  CLOSING_LINES,
  formatDuration,
  formatSound,
} from "../proof/proofTextPool.js";

/* ---------- utils ---------- */
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
function pickFrom(arr, seedStr, salt = "") {
  const fn = xmur3(`${seedStr}:${salt}`);
  const n = fn();
  return arr[n % arr.length];
}
function makeSeed() {
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

/* ---------- component ---------- */
export default function FinishScreen({
  session,
  onEnterAgain,
  onSaveRitual,
  footerRight = "weareoneconnection.org",
}) {
  const [saved, setSaved] = useState(false);
  const [hint, setHint] = useState("");
  const [canvasApiRef, setCanvasApiRef] = useState(null);

  // ✅ 只有 session 为空才拦一下（避免 NPE），不再“硬挡 finished”
  if (!session) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>No session data.</div>
        <div style={{ marginTop: 8, color: "#64748b" }}>
          Please start a session first.
        </div>
        <button
          style={{
            marginTop: 14,
            height: 40,
            padding: "0 16px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
          onClick={() => (window.location.href = "/")}
          type="button"
        >
          Back
        </button>
      </div>
    );
  }

  const normalized = useMemo(() => {
    const ritualName = session?.ritualName || "Awareness Field";
    const durationMinutes =
      Number(session?.durationMinutes ?? session?.duration ?? 10) || 10;
    const cadence = session?.cadence || "4–6";
    const sound = formatSound(session?.sound || "Silence");

    // 兼容：如果 endedAt 没有，就用 now（预览态）
    const endedAt = session?.endedAt ?? Date.now();

    // 兼容：variantSeed 没有就生成一个（保证 caption / 主题稳定）
    const variantSeed = session?.variantSeed || makeSeed();

    // startedAt 用于推算是否结束（如果你有这个字段）
    const startedAt = session?.startedAt;

    return {
      ritualName,
      durationMinutes,
      cadence,
      sound,
      endedAt,
      variantSeed,
      startedAt,
      state: session?.state,
    };
  }, [session]);

  // ✅ 更宽松的 “结束判定”
  const isFinished = useMemo(() => {
    if (normalized?.state === "finished") return true;
    if (session?.endedAt) return true;

    const startedAt = normalized?.startedAt;
    if (startedAt) {
      const endMs = startedAt + normalized.durationMinutes * 60_000;
      if (Date.now() >= endMs) return true;
    }
    return false;
  }, [normalized, session?.endedAt]);

  const closingLine = useMemo(
    () => pickFrom(CLOSING_LINES, normalized.variantSeed, "closing"),
    [normalized.variantSeed]
  );

  const shareCaption = useMemo(() => {
    const base = pickFrom(SHARE_CAPTIONS, normalized.variantSeed, "share");
    return `${base}\n${normalized.ritualName} · ${formatDuration(
      normalized.durationMinutes
    )} · ${normalized.cadence}\n${footerRight}`;
  }, [normalized, footerRight]);

  const proofData = useMemo(
    () => ({
      ritualName: normalized.ritualName,
      durationMinutes: normalized.durationMinutes,
      cadence: normalized.cadence,
      sound: normalized.sound,
      timestamp: normalized.endedAt,
      variantSeed: normalized.variantSeed,
      footerLeft: "WAOC Meditation",
      footerRight,
    }),
    [normalized, footerRight]
  );

  // Proof canvas ready?
  const proofReady = !!canvasApiRef;

  // Share enabled only when finished AND proof ready
  const shareEnabled = isFinished && proofReady;

  async function copyCaption() {
    await copyText(shareCaption);
    setHint("Caption copied.");
    setTimeout(() => setHint(""), 1200);
  }

  async function copyClosing() {
    await copyText(closingLine);
    setHint("Closing line copied.");
    setTimeout(() => setHint(""), 1200);
  }

  function handleSave() {
    try {
      onSaveRitual?.(normalized);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="finishPage">
      <div className="wrap">
        {/* header */}
        <div className="header">
          <div className="kicker">SESSION COMPLETE</div>
          <div className="h1">You sat with others.</div>
          <div className="lead">Nothing was recorded. Nothing was taken.</div>

          <div className="pill">
            <span className="pillStrong">{normalized.ritualName}</span>
            <span className="pillDot">•</span>
            <span>{formatDuration(normalized.durationMinutes)}</span>
            <span className="pillDot">•</span>
            <span>{normalized.cadence}</span>
          </div>

          {/* ✅ 软提示，不拦截 */}
          {!isFinished ? (
            <div className="softGate">
              ⏳ Session still running. This is preview mode — share will unlock
              after it ends.
            </div>
          ) : null}
        </div>

        <div className="grid">
          {/* LEFT */}
          <div className="card proofEnergy">
            <div className="labelRow">
              <div className="label">PROOF CARD</div>
              <div className="metaTiny">
                {proofReady ? "Generated locally" : "Rendering…"}
              </div>
            </div>

            <div className="preview">
              <ProofCardPreview
                proofData={proofData}
                onCanvasRef={setCanvasApiRef}
              />
            </div>

            <div className="subCard">
              <div className="label">SUGGESTED CAPTION</div>
              <div className="caption">{shareCaption}</div>
              <div className="row">
                <button className="btn" onClick={copyCaption} type="button">
                  Copy caption
                </button>
                <div className="tinyHint">Best for X / Telegram share</div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="rightCol">
            <div className="card">
              <div className="label">CLOSING</div>
              <div className="closing">{closingLine}</div>
              <div className="row">
                <button className="btn" onClick={copyClosing} type="button">
                  Copy closing line
                </button>
                <div className="tinyHint">Bring this calm into one small act.</div>
              </div>
            </div>

            <div className="card">
              <div className="labelRow">
                <div className="label">SHARE</div>
                <div className="metaTiny">
                  {!proofReady
                    ? "Preparing proof…"
                    : isFinished
                      ? "Ready"
                      : "Locked"}
                </div>
              </div>

              <ShareButtons
                canvasApiRef={canvasApiRef}
                shareText={shareCaption}
                filename={`waoc-proof-${normalized.variantSeed.slice(0, 8)}.png`}
                disabled={!shareEnabled}
              />

              {!proofReady ? (
                <div className="warn">Proof not ready yet. Wait 1–2 seconds…</div>
              ) : !isFinished ? (
                <div className="warn">
                  Share is locked until session ends (prevents meaningless proof).
                </div>
              ) : null}
            </div>

            <div className="cta">
              <button className="btnWide" onClick={handleSave} type="button">
                {saved ? "Saved ✓" : "Save Ritual"}
              </button>
              <button className="btnPrimaryWide" onClick={onEnterAgain} type="button">
                Enter Again
              </button>
            </div>

            {hint ? <div className="hint">{hint}</div> : null}

            <div className="footerNote">
              No accounts. No tracking. Proof is generated on your device.
            </div>
          </div>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

/* ---------- styles ---------- */
const css = `
.finishPage{
  min-height:100vh;
  background:#f8fafc;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  color:#0b1220;
}
.wrap{ max-width:1100px; margin:0 auto; padding:28px 18px 40px; }

.header{ margin-bottom:12px; }
.kicker{ font-size:12px; letter-spacing:.18em; color:#94a3b8; }
.h1{ font-size:40px; font-weight:950; margin-top:10px; letter-spacing:-.02em; }
.lead{ margin-top:10px; color:#64748b; font-size:16px; }

.pill{
  margin-top:14px;
  display:inline-flex;
  align-items:center;
  gap:10px;
  padding:10px 14px;
  border:1px solid #e5e7eb;
  border-radius:999px;
  background:#fff;
  color:#475569;
  box-shadow: 0 10px 22px rgba(17,24,39,.05);
}
.pillStrong{ font-weight:900; color:#0b1220; }
.pillDot{ color:#cbd5e1; }

.softGate{
  margin-top:14px;
  padding:10px 12px;
  border-radius:12px;
  background:#fff7ed;
  border:1px solid #fed7aa;
  color:#9a3412;
  font-weight:800;
  font-size:13px;
}

.grid{
  display:grid;
  grid-template-columns:1.08fr .92fr;
  gap:18px;
  margin-top:18px;
}

.card{
  background:#ffffff;
  border:1px solid #e5e7eb;
  border-radius:18px;
  padding:14px;
  box-shadow: 0 12px 30px rgba(17,24,39,.04);
}

.labelRow{
  display:flex;
  align-items:baseline;
  justify-content:space-between;
  gap:10px;
  margin-bottom:8px;
}
.label{
  font-size:12px;
  letter-spacing:.16em;
  color:#64748b;
  font-weight:950;
}
.metaTiny{ font-size:12px; color:#94a3b8; font-weight:700; }

.preview{
  border-radius:16px;
  overflow:hidden;
  border:1px solid rgba(15,23,42,.10);
  background:#0b1220;
}

/* left proof card energy container */
.proofEnergy{
  background:
    radial-gradient(900px 520px at 12% 10%, rgba(99,102,241,.14), transparent 60%),
    radial-gradient(740px 620px at 90% 30%, rgba(34,211,238,.11), transparent 60%),
    radial-gradient(760px 760px at 52% 96%, rgba(168,85,247,.12), transparent 65%),
    #ffffff;
}

.subCard{
  margin-top:14px;
  padding:12px;
  border-radius:16px;
  background:linear-gradient(180deg, rgba(241,245,249,1), rgba(248,250,252,1));
  border:1px solid rgba(15,23,42,.06);
}
.caption{
  margin-top:8px;
  white-space:pre-line;
  font-size:14px;
  color:#0b1220;
  font-weight:800;
  line-height:1.45;
}
.row{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px; }
.tinyHint{ font-size:12px; color:#64748b; font-weight:700; }

.rightCol{ display:flex; flex-direction:column; gap:14px; }

.closing{
  font-size:20px;
  font-weight:950;
  letter-spacing:-.01em;
  margin-top:6px;
}

.btn{
  height:36px;
  padding:0 14px;
  border-radius:999px;
  border:1px solid rgba(15,23,42,.12);
  background:#fff;
  font-weight:900;
  cursor:pointer;
}
.btn:hover{ background:#f8fafc; }

.btnWide{
  height:44px;
  border-radius:999px;
  border:1px solid rgba(15,23,42,.12);
  background:#fff;
  font-weight:950;
  cursor:pointer;
}
.btnWide:hover{ background:#f8fafc; }

.btnPrimaryWide{
  height:44px;
  border-radius:999px;
  border:none;
  background:#0b1220;
  color:#fff;
  font-weight:950;
  cursor:pointer;
  box-shadow: 0 14px 26px rgba(17,24,39,.12);
}
.btnPrimaryWide:hover{ opacity:.92; }

.cta{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  margin-top:2px;
}

.warn{
  margin-top:10px;
  font-size:12px;
  color:#64748b;
  font-weight:750;
}

.hint{
  text-align:center;
  font-size:12px;
  color:#475569;
  font-weight:800;
}

.footerNote{
  font-size:12px;
  text-align:center;
  color:#64748b;
  font-weight:700;
  padding-top:4px;
}

@media(max-width:960px){
  .grid{ grid-template-columns:1fr; }
  .h1{ font-size:34px; }
}
`;
