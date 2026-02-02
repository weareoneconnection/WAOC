// src/context/WalletProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [state, setState] = useState({
    kind: null, // "solana" | "evm" | null
    name: null,
    connected: false,
    address: null,
    canSign: false,
    isReady: false,
    error: null,
  });

  // ---- Detect wallets (Phantom / EVM) ----
  const detect = useCallback(() => {
    const sol = window?.solana;
    const eth = window?.ethereum;

    if (sol?.isPhantom) {
      return { kind: "solana", name: "Phantom", canSign: typeof sol.signMessage === "function" };
    }
    if (eth) {
      return { kind: "evm", name: "EVM Wallet", canSign: true };
    }
    return { kind: null, name: null, canSign: false };
  }, []);

  // ---- Safe: mask ----
  const mask = useCallback((addr) => {
    if (!addr) return "";
    const s = String(addr);
    if (s.length <= 12) return s;
    return `${s.slice(0, 4)}…${s.slice(-4)}`;
  }, []);

  // ---- Auto init (onlyIfTrusted for Phantom) ----
  useEffect(() => {
    const info = detect();
    setState((s) => ({ ...s, ...info, isReady: true }));

    // try restore Phantom trusted connection
    if (info.kind === "solana" && window?.solana?.isPhantom) {
      window.solana
        .connect({ onlyIfTrusted: true })
        .then((res) => {
          const addr = res?.publicKey?.toString?.() || null;
          if (addr) {
            setState((s) => ({ ...s, connected: true, address: addr, error: null }));
          }
        })
        .catch(() => {});
    }

    // restore EVM accounts if already authorized
    if (info.kind === "evm" && window?.ethereum?.request) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          const addr = Array.isArray(accounts) ? accounts[0] : null;
          if (addr) setState((s) => ({ ...s, connected: true, address: addr, error: null }));
        })
        .catch(() => {});
    }
  }, [detect]);

  // ---- Event listeners ----
  useEffect(() => {
    const sol = window?.solana;
    const eth = window?.ethereum;

    // Phantom events
    if (sol?.isPhantom && sol?.on) {
      const onConnect = () => {};
      const onDisconnect = () => setState((s) => ({ ...s, connected: false, address: null }));
      const onAccountChanged = (pk) => {
        const addr = pk?.toString?.() || null;
        setState((s) => ({ ...s, connected: !!addr, address: addr }));
      };

      sol.on("connect", onConnect);
      sol.on("disconnect", onDisconnect);
      sol.on("accountChanged", onAccountChanged);

      return () => {
        try {
          sol.removeListener("connect", onConnect);
          sol.removeListener("disconnect", onDisconnect);
          sol.removeListener("accountChanged", onAccountChanged);
        } catch {}
      };
    }

    // EVM events
    if (eth?.on) {
      const onAccountsChanged = (accounts) => {
        const addr = Array.isArray(accounts) ? accounts[0] : null;
        setState((s) => ({ ...s, connected: !!addr, address: addr }));
      };
      const onDisconnect = () => setState((s) => ({ ...s, connected: false, address: null }));

      eth.on("accountsChanged", onAccountsChanged);
      eth.on("disconnect", onDisconnect);

      return () => {
        try {
          eth.removeListener("accountsChanged", onAccountsChanged);
          eth.removeListener("disconnect", onDisconnect);
        } catch {}
      };
    }
  }, [state.kind]);

  // ---- Actions ----
  const connect = useCallback(async () => {
    const info = detect();
    if (!info.kind) {
      setState((s) => ({ ...s, error: "No wallet detected. Install Phantom or an EVM wallet." }));
      throw new Error("No wallet detected");
    }

    // Always refresh kind before connecting (in case user installed wallet)
    setState((s) => ({ ...s, ...info, error: null }));

    try {
      if (info.kind === "solana" && window?.solana?.isPhantom) {
        const res = await window.solana.connect();
        const addr = res?.publicKey?.toString?.() || null;
        setState((s) => ({ ...s, connected: !!addr, address: addr, error: null }));
        return addr;
      }

      if (info.kind === "evm" && window?.ethereum?.request) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const addr = Array.isArray(accounts) ? accounts[0] : null;
        setState((s) => ({ ...s, connected: !!addr, address: addr, error: null }));
        return addr;
      }

      setState((s) => ({ ...s, error: "Wallet detected but cannot connect." }));
      throw new Error("Cannot connect");
    } catch (e) {
      setState((s) => ({ ...s, error: "Wallet connection cancelled or failed." }));
      throw e;
    }
  }, [detect]);

  const disconnect = useCallback(async () => {
    try {
      if (state.kind === "solana" && window?.solana?.isPhantom) {
        await window.solana.disconnect();
      }
      // EVM: no standard programmatic disconnect; just clear local state
    } catch {}
    setState((s) => ({ ...s, connected: false, address: null }));
  }, [state.kind]);

  const signMessage = useCallback(
    async (message) => {
      if (!state.connected) throw new Error("Wallet not connected");

      // Solana signMessage expects Uint8Array
      if (state.kind === "solana" && window?.solana?.isPhantom && typeof window.solana.signMessage === "function") {
        const encoded = new TextEncoder().encode(String(message));
        const res = await window.solana.signMessage(encoded, "utf8");
        // res.signature: Uint8Array
        if (res?.signature) return bytesToHex(res.signature);
        return "signed";
      }

      // EVM personal_sign expects hex message
      if (state.kind === "evm" && window?.ethereum?.request) {
        const from = state.address;
        const msgHex = "0x" + stringToHex(String(message));
        const sig = await window.ethereum.request({
          method: "personal_sign",
          params: [msgHex, from],
        });
        return sig || "signed";
      }

      throw new Error("signMessage not supported");
    },
    [state.connected, state.kind, state.address]
  );

  const value = useMemo(
    () => ({
      ...state,
      maskAddress: mask,
      connect,
      disconnect,
      signMessage,
    }),
    [state, mask, connect, disconnect, signMessage]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

/* ---------- helpers ---------- */

function bytesToHex(u8) {
  try {
    return Array.from(u8).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "signed";
  }
}

function stringToHex(str) {
  const bytes = new TextEncoder().encode(str);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}
