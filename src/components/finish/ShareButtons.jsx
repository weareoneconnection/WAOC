// src/components/finish/ShareButtons.jsx
import React, { useMemo, useState } from "react";

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

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "waoc-proof.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openXShare(text) {
  const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(u, "_blank", "noopener,noreferrer");
}

function openTelegramShare(text) {
  const u = `https://t.me/share/url?text=${encodeURIComponent(text)}`;
  window.open(u, "_blank", "noopener,noreferrer");
}

/**
 * Props:
 * - canvasApiRef: { toBlob(): Promise<Blob|null> } OR { toDataURL(): string }
 * - shareText: string
 * - filename: string
 * - disabled: boolean
 */
export default function ShareButtons({
  canvasApiRef,
  shareText,
  filename = "waoc-proof.png",
  disabled = false,
}) {
  const [status, setStatus] = useState("");

  const canNativeShare = useMemo(
    () => typeof navigator !== "undefined" && !!navigator.share,
    []
  );
  const canShareFiles = useMemo(
    () => typeof navigator !== "undefined" && typeof navigator.canShare === "function",
    []
  );

  async function ensureBlob() {
    if (!canvasApiRef) return null;

    if (typeof canvasApiRef.toBlob === "function") {
      const blob = await canvasApiRef.toBlob();
      return blob || null;
    }

    if (typeof canvasApiRef.toDataURL === "function") {
      const dataUrl = canvasApiRef.toDataURL();
      if (!dataUrl) return null;
      const res = await fetch(dataUrl);
      return await res.blob();
    }

    return null;
  }

  async function onDownload() {
    setStatus("");
    if (disabled) return;

    const blob = await ensureBlob();
    if (!blob) {
      setStatus("Proof not ready yet.");
      return;
    }
    downloadBlob(blob, filename);
    setStatus("Downloaded.");
    setTimeout(() => setStatus(""), 1200);
  }

  async function onCopyCaption() {
    setStatus("");
    await copyText(shareText || "");
    setStatus("Caption copied.");
    setTimeout(() => setStatus(""), 1200);
  }

  async function onShare() {
    setStatus("");
    if (disabled) return;

    const blob = await ensureBlob();
    if (!blob) {
      setStatus("Proof not ready yet.");
      return;
    }

    const file = new File([blob], filename, { type: "image/png" });

    // 1) Native share (best)
    if (canNativeShare) {
      try {
        if (canShareFiles) {
          const ok = navigator.canShare({ files: [file] });
          if (!ok) {
            // native share exists but can't share files
            await navigator.share({
              title: "WAOC Proof Card",
              text: shareText,
            });
            setStatus("Shared text (image not supported).");
            setTimeout(() => setStatus(""), 1600);
            return;
          }
        }

        await navigator.share({
          title: "WAOC Proof Card",
          text: shareText,
          files: [file],
        });

        setStatus("Shared.");
        setTimeout(() => setStatus(""), 1200);
        return;
      } catch {
        // fallthrough
      }
    }

    // 2) Fallback: open X share (text only)
    openXShare(shareText);
    setStatus("Opened X share (text). You can also share to Telegram.");
    setTimeout(() => setStatus(""), 2200);
  }

  return (
    <div className="sbWrap">
      <div className="sbRowTop">
        <button
          className="sbBtnPrimary"
          onClick={onShare}
          type="button"
          disabled={disabled}
          title={disabled ? "Share is locked until session ends." : ""}
        >
          Share Proof Card
        </button>

        <div className="sbTiny">
          {disabled
            ? "Locked"
            : canNativeShare
              ? "Native share supported"
              : "Fallback: X share"}
        </div>
      </div>

      <div className="sbRow">
        <button className="sbBtn" onClick={onDownload} type="button" disabled={disabled}>
          Download
        </button>
        <button className="sbBtn" onClick={onCopyCaption} type="button">
          Copy Caption
        </button>
      </div>

      <div className="sbRow">
        <button
          className="sbBtnGhost"
          onClick={() => openTelegramShare(shareText)}
          type="button"
        >
          Telegram
        </button>
        <button
          className="sbBtnGhost"
          onClick={() => openXShare(shareText)}
          type="button"
        >
          X / Twitter
        </button>
      </div>

      {status ? <div className="sbStatus">{status}</div> : null}

      <style>{css}</style>
    </div>
  );
}

const css = `
.sbWrap{ display:flex; flex-direction:column; gap:10px; }
.sbRowTop{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.sbRow{ display:flex; gap:10px; }

.sbBtnPrimary{
  height:38px;
  padding:0 14px;
  border-radius:999px;
  border:1px solid rgba(15,23,42,.14);
  background:linear-gradient(180deg, rgba(15,23,42,.98), rgba(15,23,42,.92));
  color:#fff;
  font-weight:950;
  cursor:pointer;
  box-shadow: 0 10px 20px rgba(17,24,39,.12);
}
.sbBtnPrimary:hover{ opacity:.94; }
.sbBtnPrimary:disabled{
  opacity:.55;
  cursor:not-allowed;
  box-shadow:none;
}

.sbBtn{
  flex:1;
  height:36px;
  border-radius:12px;
  border:1px solid rgba(15,23,42,.12);
  background:#fff;
  font-weight:900;
  cursor:pointer;
}
.sbBtn:hover{ background:#f8fafc; }
.sbBtn:disabled{ opacity:.55; cursor:not-allowed; }

.sbBtnGhost{
  flex:1;
  height:34px;
  border-radius:12px;
  border:1px dashed rgba(15,23,42,.18);
  background:#fff;
  font-weight:900;
  cursor:pointer;
  color:#0b1220;
}
.sbBtnGhost:hover{ background:#f8fafc; }

.sbTiny{ font-size:12px; color:#94a3b8; font-weight:700; white-space:nowrap; }
.sbStatus{ font-size:12px; color:#64748b; font-weight:800; }
`;
