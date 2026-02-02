// src/pages/Field.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Field / Proof of Presence (minimal)
 * - No tracking, no ranks, no counts
 * - Local v1: hashes + timestamps only
 * - Optional wallet connect (Phantom / EVM) without adding deps
 */

const STORAGE_KEY = "waoc_presence_v1";

export default function Field() {
  const nav = useNavigate();

  // presence local state
  const [presence, setPresence] = useState(() => loadPresence());
  useEffect(() => savePresence(presence), [presence]);

  // wallet state (optional)
  const [wallet, setWallet] = useState({
    kind: null, // "solana" | "evm" | null
    address: null,
    connected: false,
    canSign: false,
    name: null,
    evmProvider: null,
  });

  // modal state
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [available, setAvailable] = useState({
    hasPhantom: false,
    evmProviders: [],
    hasEvm: false,
  });

  // proof export ui state
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(false);

  // --- detect wallets + listeners ---
  useEffect(() => {
    const sol = window?.solana;
    const evmList = getEvmProviders();
    const hasPhantom = !!sol?.isPhantom;
    const hasEvm = evmList.length > 0;

    setAvailable({ hasPhantom, evmProviders: evmList, hasEvm });

    // ✅ Solana Phantom
    if (sol?.isPhantom) {
      setWallet((w) => ({
        ...w,
        kind: w.connected ? w.kind : "solana",
        name: w.connected ? w.name : "Phantom",
        canSign: typeof sol.signMessage === "function",
      }));

      sol
        .connect({ onlyIfTrusted: true })
        .then((res) => {
          const addr = res?.publicKey?.toString?.() || null;
          if (addr) setWallet((w) => ({ ...w, connected: true, address: addr, kind: "solana", name: "Phantom" }));
        })
        .catch(() => {});

      const onConnect = (pubKey) => {
        const addr = pubKey?.toString?.() || sol?.publicKey?.toString?.() || null;
        setWallet((w) => ({ ...w, connected: !!addr, address: addr, kind: "solana", name: "Phantom" }));
      };
      const onDisconnect = () => setWallet((w) => ({ ...w, connected: false, address: null }));
      const onAccountChanged = (pubKey) => {
        const addr = pubKey?.toString?.() || null;
        setWallet((w) => ({ ...w, connected: !!addr, address: addr, kind: "solana", name: "Phantom" }));
      };

      sol.on?.("connect", onConnect);
      sol.on?.("disconnect", onDisconnect);
      sol.on?.("accountChanged", onAccountChanged);

      return () => {
        sol.off?.("connect", onConnect);
        sol.off?.("disconnect", onDisconnect);
        sol.off?.("accountChanged", onAccountChanged);
      };
    }

    // ✅ EVM
    if (!sol?.isPhantom && hasEvm) {
      const chosen = pickBestEvmProvider(evmList);
      const name = detectEvmName(chosen);

      setWallet((w) => ({
        ...w,
        kind: w.connected ? w.kind : "evm",
        name: w.connected ? w.name : name,
        canSign: true,
        evmProvider: w.evmProvider || chosen,
      }));

      chosen
        .request?.({ method: "eth_accounts" })
        .then((accounts) => {
          const addr = Array.isArray(accounts) ? accounts[0] : null;
          if (addr) setWallet((w) => ({ ...w, connected: true, address: addr, kind: "evm", name, evmProvider: chosen }));
        })
        .catch(() => {});

      const onAccountsChanged = (accounts) => {
        const addr = Array.isArray(accounts) ? accounts[0] : null;
        setWallet((w) => ({ ...w, connected: !!addr, address: addr }));
      };
      const onChainChanged = () => {
        chosen
          .request?.({ method: "eth_accounts" })
          .then((accounts) => onAccountsChanged(accounts))
          .catch(() => {});
      };

      chosen.on?.("accountsChanged", onAccountsChanged);
      chosen.on?.("chainChanged", onChainChanged);

      return () => {
        chosen.removeListener?.("accountsChanged", onAccountsChanged);
        chosen.removeListener?.("chainChanged", onChainChanged);
      };
    }
  }, []);

  const presenceState = useMemo(() => {
    if (presence?.enteredAt && presence?.completedAt) return "Completed";
    if (presence?.enteredAt) return "Entered";
    return "Idle";
  }, [presence]);

  function openWalletModal() {
    const evmProviders = getEvmProviders();
    setAvailable({
      hasPhantom: !!window?.solana?.isPhantom,
      evmProviders,
      hasEvm: evmProviders.length > 0,
    });
    setWalletModalOpen(true);
  }
  function closeWalletModal() {
    setWalletModalOpen(false);
  }

  async function connectPhantom() {
    try {
      const sol = window?.solana;
      if (!sol?.isPhantom) {
        alert("Phantom not detected.");
        return;
      }
      setWallet((w) => ({ ...w, kind: "solana", name: "Phantom", canSign: typeof sol.signMessage === "function" }));
      const res = await sol.connect();
      const addr = res?.publicKey?.toString?.() || sol?.publicKey?.toString?.() || null;
      if (!addr) throw new Error("No publicKey");
      setWallet((w) => ({ ...w, connected: true, address: addr, kind: "solana", name: "Phantom" }));
      closeWalletModal();
    } catch (e) {
      console.error(e);
      alert("Wallet connection cancelled or failed.");
    }
  }

  async function connectEvm(provider) {
    try {
      if (!provider?.request) {
        alert("EVM wallet not detected.");
        return;
      }
      const name = detectEvmName(provider);
      setWallet((w) => ({ ...w, kind: "evm", name, canSign: true, evmProvider: provider }));
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const addr = Array.isArray(accounts) ? accounts[0] : null;
      if (!addr) throw new Error("No account");
      setWallet((w) => ({ ...w, connected: true, address: addr, kind: "evm", name, evmProvider: provider }));
      closeWalletModal();
    } catch (e) {
      console.error(e);
      alert("Wallet connection cancelled or failed.");
    }
  }

  async function connectEvmAuto() {
    const providers = getEvmProviders();
    if (!providers.length) {
      alert("No EVM wallet detected.");
      return;
    }
    const best = pickBestEvmProvider(providers);
    await connectEvm(best);
  }

  async function onDisconnectWallet() {
    try {
      if (wallet.kind === "solana" && window?.solana?.isPhantom) {
        await window.solana.disconnect();
      }
    } catch {}
    setWallet((w) => ({ ...w, connected: false, address: null }));
  }

  async function enterField() {
    const enteredAt = new Date().toISOString();
    const sessionId = presence?.sessionId || `field-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
    const payload = `waoc:enter|${sessionId}|${enteredAt}`;

    let signature = null;
    if (wallet.connected && wallet.canSign) signature = await trySign(payload, wallet);

    const sessionHash = await sha256Hex(`waoc|session|${payload}|${signature || "nosig"}`);

    setPresence({
      version: 1,
      sessionId,
      enteredAt,
      completedAt: null,
      sessionHash,
      completionHash: null,
      wallet: wallet.connected ? maskAddress(wallet.address) : null,
      proof: signature ? "signed" : "local",
    });
  }

  async function completeRitual() {
    if (!presence?.enteredAt || !presence?.sessionId) {
      alert("Enter the field first.");
      return;
    }
    const completedAt = new Date().toISOString();
    const payload = `waoc:complete|${presence.sessionId}|${completedAt}`;

    let signature = null;
    if (wallet.connected && wallet.canSign) signature = await trySign(payload, wallet);

    const completionHash = await sha256Hex(`waoc|completion|${payload}|${signature || "nosig"}`);

    setPresence((p) => ({
      ...p,
      completedAt,
      completionHash,
      wallet: wallet.connected ? maskAddress(wallet.address) : p?.wallet || null,
      proof: signature ? "signed" : p?.proof || "local",
    }));
  }

  function resetPresence() {
    setPresence({
      version: 1,
      sessionId: null,
      enteredAt: null,
      completedAt: null,
      sessionHash: null,
      completionHash: null,
      wallet: null,
      proof: "local",
    });
    setCopied(false);
    setShowProof(false);
  }

  function openSession() {
    nav("/session");
  }

  // ✅ proof JSON (read-only export)
  const proofObject = useMemo(() => getProofJSON(presence), [presence]);
  const proofText = useMemo(() => JSON.stringify(proofObject, null, 2), [proofObject]);

  async function copyProofJSON() {
    try {
      await navigator.clipboard.writeText(proofText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      // fallback for some browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = proofText;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      } catch (err) {
        console.error(e, err);
        alert("Copy failed. Please select text manually.");
        setShowProof(true);
      }
    }
  }

  const evmOptions = useMemo(() => {
    const list = available.evmProviders || [];
    const unique = [];
    const seen = new Set();
    for (const p of list) {
      const fp = providerFingerprint(p);
      if (!seen.has(fp)) {
        seen.add(fp);
        unique.push(p);
      }
    }
    return unique;
  }, [available.evmProviders]);

  return (
    <div className="page">
      {/* Header */}
      <div className="topRow">
        <div>
          <div className="kicker">WAOC MEDITATION</div>
          <div className="h1">Proof of Presence</div>
          <div className="lead">
            Verifiable presence — <span className="strong">without surveillance</span>.
          </div>
          <div className="fine">No identity. No tracking. No rankings.</div>
        </div>

        <div className="status">
          <div className="tiny">Status</div>
          <div className={`statusPill ${presenceState.toLowerCase()}`}>
            <span className="pillStrong">{presenceState}</span>
            <span className="dot">•</span>
            <span className="tiny">Mode</span>
            <span className="pillStrong">{wallet.connected ? "signed" : "local"}</span>
          </div>
          <div className="fine">Stores hashes + timestamps only.</div>
        </div>
      </div>

      {/* Main */}
      <div className="card main">
        <div className="proofWrap">
          <div className="proofHead">
            <div>
              <div className="label">Proof of Presence</div>
              <div className="proofTitle">Hashes + timestamps only</div>
              <div className="micro">Start: “I enter the field.” &nbsp; End: “I completed the ritual.”</div>
            </div>

            <div className={`badge ${presenceState.toLowerCase()}`}>{presenceState}</div>
          </div>

          <div className="actions">
            <button className="actionPrimary" onClick={enterField} disabled={!!presence?.enteredAt}>
              Enter the Field
            </button>
            <button className="action" onClick={completeRitual} disabled={!presence?.enteredAt || !!presence?.completedAt}>
              Complete Ritual
            </button>
            <button className="reset" onClick={resetPresence}>
              Reset
            </button>
          </div>

          <div className="factsCard">
            <div className="factsKicker">PUBLIC FACTS (PREVIEW)</div>

            <div className="factsGrid">
              <div className="row">
                <div className="k">Entered</div>
                <div className="v">{presence?.enteredAt ? toNice(presence.enteredAt) : "—"}</div>
              </div>
              <div className="row">
                <div className="k">Completed</div>
                <div className="v">{presence?.completedAt ? toNice(presence.completedAt) : "—"}</div>
              </div>
              <div className="row">
                <div className="k">Session hash</div>
                <div className="v mono">{presence?.sessionHash ? ellipsizeHex(presence.sessionHash) : "—"}</div>
              </div>
              <div className="row">
                <div className="k">Completion hash</div>
                <div className="v mono">{presence?.completionHash ? ellipsizeHex(presence.completionHash) : "—"}</div>
              </div>
              <div className="row">
                <div className="k">Proof mode</div>
                <div className="v">{presence?.proof || "local"}</div>
              </div>
              <div className="row">
                <div className="k">Wallet (optional)</div>
                <div className="v">{presence?.wallet || "—"}</div>
              </div>

              {/* ✅ NEW: Proof JSON export */}
              <div className="row">
                <div className="k">Proof (JSON)</div>
                <div className="v">
                  <button className="miniBtn" onClick={() => setShowProof((s) => !s)}>
                    {showProof ? "Hide" : "View"}
                  </button>
                  <button className="miniBtn solid" onClick={copyProofJSON}>
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {showProof && (
              <pre className="proofBox" aria-label="proof-json">
{proofText}
              </pre>
            )}

            <div className="factsNote">
              On-chain later: we store only <span className="strong">hashes + timestamps</span>. No identities. No tracking.
            </div>
          </div>

          {/* Wallet (Optional) */}
          <div className="walletRow">
            <div>
              <div className="label">Wallet (optional)</div>
              <div className="micro">
                Connecting adds public meaning — <span className="strong">not rewards</span>.
              </div>
            </div>

            <div className="walletRight">
              {wallet.connected ? (
                <>
                  <div className="walletPill">
                    <span className="dotSolid">●</span>
                    <span className="mono">{maskAddress(wallet.address)}</span>
                    <span className="tiny">({wallet.name || wallet.kind})</span>
                  </div>
                  <button className="ghost" onClick={onDisconnectWallet}>
                    Disconnect
                  </button>
                </>
              ) : (
                <button className="ghost" onClick={openWalletModal}>
                  Connect Wallet
                </button>
              )}
            </div>
          </div>

          <div className="bottomNav">
            <button className="navBtn" onClick={openSession}>
              Open Session →
            </button>

            <div className="links">
              <Link to="/meditate">Meditate</Link>
              <span className="sep">•</span>
              <Link to="/library">Library</Link>
              <span className="sep">•</span>
              <Link to="/about">About</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        This is not a check-in system. It’s a <span className="strong">public ritual layer</span>.
      </div>

      {/* Wallet modal */}
      {walletModalOpen && (
        <div className="modalOverlay" onMouseDown={closeWalletModal}>
          <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalTop">
              <div>
                <div className="modalTitle">Connect Wallet</div>
                <div className="modalSub">Choose a wallet provider. Optional only.</div>
              </div>
              <button className="modalX" onClick={closeWalletModal} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modalSection">
              <div className="modalLabel">Solana</div>
              {available.hasPhantom ? (
                <button className="modalBtn" onClick={connectPhantom}>
                  Phantom (Solana)
                </button>
              ) : (
                <div className="modalHint">No Phantom detected.</div>
              )}
            </div>

            <div className="modalSection">
              <div className="modalLabel">EVM</div>

              {available.hasEvm ? (
                <>
                  <button className="modalBtn" onClick={connectEvmAuto}>
                    Auto (recommended)
                  </button>

                  <div className="modalGrid">
                    {evmOptions.map((p, idx) => (
                      <button key={`${providerFingerprint(p)}-${idx}`} className="modalBtnLite" onClick={() => connectEvm(p)}>
                        {detectEvmName(p)}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="modalHint">No EVM wallet detected (MetaMask / Trust / Rabby / OKX / Coinbase...).</div>
              )}
            </div>

            <div className="modalFoot">
              <div className="modalFootText">Tip: If popup doesn’t appear, refresh once.</div>
              <button className="modalCancel" onClick={closeWalletModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{css}</style>
    </div>
  );
}

/* ---------------- Proof JSON ---------------- */

function getProofJSON(presence) {
  return {
    protocol: "WAOC-PoP",
    version: 1,
    sessionHash: presence?.sessionHash ?? null,
    completionHash: presence?.completionHash ?? null,
    enteredAt: presence?.enteredAt ?? null,
    completedAt: presence?.completedAt ?? null,
    proof: presence?.proof ?? "local",
    // optional public meaning (masked)
    wallet: presence?.wallet ?? null,
  };
}

/* ---------------- Helpers ---------------- */

function loadPresence() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
      return {
        version: 1,
        sessionId: null,
        enteredAt: null,
        completedAt: null,
        sessionHash: null,
        completionHash: null,
        wallet: null,
        proof: "local",
      };
    const obj = JSON.parse(raw);
    return {
      version: 1,
      sessionId: obj?.sessionId ?? null,
      enteredAt: obj?.enteredAt ?? null,
      completedAt: obj?.completedAt ?? null,
      sessionHash: obj?.sessionHash ?? null,
      completionHash: obj?.completionHash ?? null,
      wallet: obj?.wallet ?? null,
      proof: obj?.proof ?? "local",
    };
  } catch {
    return {
      version: 1,
      sessionId: null,
      enteredAt: null,
      completedAt: null,
      sessionHash: null,
      completionHash: null,
      wallet: null,
      proof: "local",
    };
  }
}

function savePresence(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p || {}));
  } catch {}
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
      second: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function ellipsizeHex(hex) {
  if (!hex) return "—";
  if (hex.length <= 14) return hex;
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`;
}

function maskAddress(addr) {
  if (!addr) return "—";
  const s = String(addr);
  if (s.length <= 12) return s;
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", enc);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function trySign(message, wallet) {
  try {
    if (wallet.kind === "solana" && window?.solana?.isPhantom && typeof window.solana.signMessage === "function") {
      const encoded = new TextEncoder().encode(message);
      const res = await window.solana.signMessage(encoded, "utf8");
      if (res?.signature) return bytesToHex(res.signature);
      return "signed";
    }

    if (wallet.kind === "evm" && wallet.address) {
      const provider = wallet.evmProvider || window?.ethereum;
      if (!provider?.request) return null;

      const sig = await provider.request({
        method: "personal_sign",
        params: [message, wallet.address],
      });
      return sig || "signed";
    }
  } catch (e) {
    console.warn("sign failed", e);
  }
  return null;
}

function bytesToHex(u8) {
  try {
    return Array.from(u8)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "signed";
  }
}

/* -------- EVM multi-wallet helpers -------- */

function detectEvmName(eth) {
  if (!eth) return "EVM Wallet";
  if (eth.isTrust) return "Trust Wallet";
  if (eth.isRabby) return "Rabby";
  if (eth.isOKExWallet) return "OKX Wallet";
  if (eth.isCoinbaseWallet) return "Coinbase Wallet";
  if (eth.isMetaMask) return "MetaMask";
  return "EVM Wallet";
}

function providerFingerprint(p) {
  const flags = [
    p?.isMetaMask ? "mm" : "",
    p?.isTrust ? "trust" : "",
    p?.isRabby ? "rabby" : "",
    p?.isOKExWallet ? "okx" : "",
    p?.isCoinbaseWallet ? "cb" : "",
  ]
    .filter(Boolean)
    .join("-");
  return flags || "evm";
}

function getEvmProviders() {
  const eth = window?.ethereum;
  if (!eth) return [];
  const providers = Array.isArray(eth.providers) ? eth.providers : [eth];
  return providers.filter((p) => typeof p?.request === "function");
}

function pickBestEvmProvider(providers) {
  const score = (p) => {
    if (p?.isMetaMask) return 100;
    if (p?.isTrust) return 90;
    if (p?.isRabby) return 80;
    if (p?.isOKExWallet) return 70;
    if (p?.isCoinbaseWallet) return 60;
    return 10;
  };
  const sorted = [...providers].sort((a, b) => score(b) - score(a));
  return sorted[0] || providers[0] || null;
}

/* ---------------- Styling ---------------- */

const css = `
  .page{
    max-width: 1100px;
    margin: 0 auto;
    padding: 26px 18px 44px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    color:#0b1220;
  }

  .kicker{ font-size:12px; letter-spacing:.18em; color:#6b7280; text-transform:uppercase; }
  .h1{ font-size:38px; line-height:1.10; margin-top:10px; font-weight:950; letter-spacing:-.03em; }
  .lead{ margin-top:10px; color:#4b5563; font-size:15.5px; }
  .tiny{ font-size:12px; color:#6b7280; }
  .fine{ font-size:12px; color:#6b7280; margin-top:8px; }
  .micro{ font-size:12px; color:#6b7280; margin-top:6px; }
  .strong{ font-weight:900; color:#111827; }
  .dot{ color:#9ca3af; padding: 0 6px; }

  .topRow{ display:flex; justify-content:space-between; gap:16px; margin-bottom:14px; align-items:flex-start; }
  .status{ text-align:right; min-width:280px; }

  .statusPill{
    display:inline-flex; align-items:center; gap:10px;
    margin-top:8px; padding:8px 12px; border:1px solid #e5e7eb;
    border-radius:999px; background:#fff; box-shadow: 0 1px 0 rgba(0,0,0,.02);
  }
  .statusPill.idle{ opacity:.88; }
  .statusPill.entered{ border-color:#111827; box-shadow: 0 0 0 4px rgba(17,24,39,.06); }
  .statusPill.completed{ border-color:#111827; box-shadow: 0 0 0 4px rgba(17,24,39,.08); }
  .pillStrong{ font-weight:900; font-size:13px; color:#111827; }

  .card{
    border:1px solid #e5e7eb; border-radius:18px; background:#fff;
    box-shadow: 0 12px 30px rgba(17,24,39,.06);
  }
  .main{ padding:16px; }

  .proofWrap{
    border:1px solid #eef2f7;
    border-radius:16px;
    padding:14px;
    background:#fff;
  }

  .proofHead{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:12px;
  }

  .label{ font-size:12px; letter-spacing:.14em; color:#6b7280; text-transform:uppercase; }
  .proofTitle{ margin-top:6px; font-size:30px; font-weight:950; letter-spacing:-.03em; color:#111827; }

  .badge{
    border:1px solid #e5e7eb;
    border-radius:999px;
    padding:8px 12px;
    font-weight:950;
    font-size:13px;
    color:#111827;
    background:#fff;
    height: fit-content;
  }
  .badge.idle{ opacity:.85; }
  .badge.entered{ border-color:#111827; box-shadow: 0 0 0 4px rgba(17,24,39,.06); }
  .badge.completed{ border-color:#111827; box-shadow: 0 0 0 4px rgba(17,24,39,.08); }

  .actions{
    margin-top:12px;
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    align-items:center;
  }

  .actionPrimary{
    border:none; border-radius:14px; padding:12px 16px;
    background:#0b1220; color:#fff; font-weight:950; cursor:pointer;
    box-shadow: 0 10px 18px rgba(17,24,39,.15);
  }
  .actionPrimary:disabled{ opacity:.55; cursor:not-allowed; }

  .action{
    border:1px solid #e5e7eb; border-radius:14px; padding:12px 16px;
    background:#fff; color:#111827; font-weight:950; cursor:pointer;
  }
  .action:disabled{ opacity:.55; cursor:not-allowed; }

  .reset{
    border:none; background:transparent; cursor:pointer;
    font-weight:900; color:#6b7280;
    padding:10px 8px;
  }
  .reset:hover{ color:#111827; }

  .factsCard{
    margin-top:12px;
    border:1px solid #eef2f7;
    border-radius:16px;
    padding:12px;
    background: linear-gradient(180deg, rgba(249,250,251,.65), rgba(255,255,255,1));
  }
  .factsKicker{
    font-size:11px; letter-spacing:.18em; color:#6b7280;
    text-transform:uppercase;
    margin-bottom:8px;
    font-weight:900;
  }

  .factsGrid{ display:flex; flex-direction:column; }
  .row{
    display:flex; justify-content:space-between; gap:12px;
    padding:10px 0;
    border-top:1px dashed rgba(148,163,184,.35);
  }
  .row:first-child{ border-top:none; }
  .k{ font-size:13px; color:#6b7280; font-weight:800; }
  .v{ font-size:13px; color:#111827; font-weight:900; text-align:right; }
  .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

  .factsNote{
    margin-top:10px;
    font-size:12px;
    color:#6b7280;
  }

  .miniBtn{
    height:30px;
    padding:0 10px;
    border-radius:999px;
    border:1px solid #e5e7eb;
    background:#fff;
    cursor:pointer;
    font-weight:900;
    font-size:12px;
    margin-left:8px;
    color:#111827;
  }
  .miniBtn:hover{ border-color:#cbd5e1; }
  .miniBtn.solid{
    border-color:#111827;
    background:#111827;
    color:#fff;
  }
  .miniBtn.solid:hover{ opacity:.92; }

  .proofBox{
    margin-top:10px;
    border:1px solid #eef2f7;
    border-radius:14px;
    padding:12px;
    background:#fff;
    font-size:12px;
    line-height:1.5;
    color:#0b1220;
    overflow:auto;
    max-height: 260px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .walletRow{
    margin-top:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:12px;
    padding-top:12px;
    border-top:1px solid #eef2f7;
  }

  .walletRight{
    display:flex;
    gap:10px;
    align-items:center;
    justify-content:flex-end;
  }

  .walletPill{
    display:inline-flex;
    align-items:center;
    gap:10px;
    padding:8px 12px;
    border:1px solid #e5e7eb;
    border-radius:999px;
    background:#fff;
  }
  .dotSolid{ color:#0b1220; opacity:.75; }

  .ghost{
    height:38px; padding:0 14px; border-radius:999px;
    border:1px solid #e5e7eb; background:#fff; cursor:pointer;
    font-weight:900; color:#111827; font-size:13px;
  }
  .ghost:hover{ border-color:#cbd5e1; }

  .bottomNav{
    margin-top:12px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:12px;
    flex-wrap:wrap;
  }

  .navBtn{
    border:none; border-radius:14px; padding:12px 16px;
    background:#0b1220; color:#fff; font-weight:950; cursor:pointer;
    box-shadow: 0 10px 18px rgba(17,24,39,.15);
  }
  .navBtn:hover{ opacity:.92; }

  .links{
    display:flex;
    gap:10px;
    align-items:center;
    color:#6b7280;
    font-weight:900;
  }
  .links a{ color:#111827; text-decoration:none; }
  .links a:hover{ text-decoration:underline; }
  .sep{ color:#9ca3af; }

  .footer{
    margin-top:14px;
    color:#4b5563;
    font-size:14px;
  }

  /* -------- Modal -------- */
  .modalOverlay{
    position:fixed;
    inset:0;
    background: rgba(15,23,42,.55);
    display:flex;
    align-items:center;
    justify-content:center;
    padding: 18px;
    z-index: 9999;
  }
  .modalCard{
    width: min(520px, 100%);
    background:#fff;
    border:1px solid #e5e7eb;
    border-radius: 18px;
    box-shadow: 0 18px 60px rgba(0,0,0,.22);
    padding: 14px;
  }
  .modalTop{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eef2f7;
  }
  .modalTitle{
    font-weight: 950;
    font-size: 18px;
    color:#0b1220;
    letter-spacing: -.02em;
  }
  .modalSub{
    margin-top: 6px;
    font-size: 12px;
    color:#6b7280;
  }
  .modalX{
    border:1px solid #e5e7eb;
    background:#fff;
    height:34px;
    width:34px;
    border-radius: 10px;
    cursor:pointer;
    font-weight: 900;
  }
  .modalX:hover{ border-color:#cbd5e1; }

  .modalSection{
    padding: 12px 0;
    border-bottom: 1px solid #eef2f7;
  }
  .modalSection:last-of-type{
    border-bottom:none;
  }
  .modalLabel{
    font-size: 11px;
    letter-spacing:.18em;
    text-transform: uppercase;
    color:#6b7280;
    font-weight: 900;
    margin-bottom: 10px;
  }
  .modalBtn{
    width:100%;
    height:42px;
    border-radius: 14px;
    border: 1px solid #0b1220;
    background:#0b1220;
    color:#fff;
    font-weight: 950;
    cursor:pointer;
    box-shadow: 0 10px 18px rgba(17,24,39,.14);
  }
  .modalBtn:hover{ opacity:.92; }

  .modalGrid{
    margin-top: 10px;
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .modalBtnLite{
    height:40px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background:#fff;
    color:#111827;
    font-weight: 950;
    cursor:pointer;
  }
  .modalBtnLite:hover{ border-color:#cbd5e1; }

  .modalHint{
    margin-top: 10px;
    font-size: 12px;
    color:#6b7280;
  }

  .modalFoot{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap: 10px;
    padding-top: 12px;
    border-top: 1px solid #eef2f7;
    margin-top: 10px;
  }
  .modalFootText{
    font-size: 12px;
    color:#6b7280;
  }
  .modalCancel{
    height:38px;
    padding:0 14px;
    border-radius: 999px;
    border:1px solid #e5e7eb;
    background:#fff;
    font-weight: 900;
    cursor:pointer;
  }
  .modalCancel:hover{ border-color:#cbd5e1; }

  @media (max-width: 960px){
    .topRow{ flex-direction:column; }
    .status{ text-align:left; min-width:auto; }
    .proofTitle{ font-size:26px; }
    .walletRow{ flex-direction:column; align-items:stretch; }
    .walletRight{ justify-content:space-between; }
    .modalGrid{ grid-template-columns: 1fr; }
  }
`;
