// src/context/WalletContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * ✅ 方案A（推荐）：钱包“可选绑定”，不阻塞 App
 * - 不安装 Phantom 也能正常用冥想 App
 * - 安装 Phantom 后可点击 Connect Wallet 绑定地址
 * - 暂时不做 WAOC SPL Token 持仓校验（后续再加）
 */

const WalletContext = createContext(null);

function getPhantomProvider() {
  // Phantom 注入：window.phantom?.solana
  if (typeof window === "undefined") return null;
  const phantom = window?.phantom?.solana;
  if (phantom?.isPhantom) return phantom;
  return null;
}

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);

  // 连接状态
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 预留：WAOC “意识凭证”状态（方案A先不校验）
  const [hasWAOC, setHasWAOC] = useState(false);

  // 用于 UI 提示（不强制）
  const [error, setError] = useState("");

  // 初始化：检测 Phantom 是否存在
  useEffect(() => {
    const p = getPhantomProvider();
    setProvider(p || null);
  }, []);

  // ✅ 不阻塞：无 Phantom 也不报错，只把 provider 设为 null
  const isPhantomInstalled = !!provider;

  const clearState = useCallback(() => {
    setConnected(false);
    setAddress("");
    setHasWAOC(false);
  }, []);

  // 可选：静默尝试自动连接（只在用户曾授权过时才成功）
  const tryAutoConnect = useCallback(async () => {
    if (!provider) return;

    try {
      setLoading(true);
      setError("");

      // onlyIfTrusted: true → 不会弹窗；用户以前授权过才会成功
      const res = await provider.connect({ onlyIfTrusted: true });
      const pubkey = res?.publicKey?.toString?.() || "";
      if (pubkey) {
        setConnected(true);
        setAddress(pubkey);

        // 方案A：先不查 SPL Token
        setHasWAOC(false);
      }
    } catch {
      // 静默失败不算错（用户可能没授权过）
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    tryAutoConnect();
  }, [tryAutoConnect]);

  const connectWallet = useCallback(async () => {
    if (!provider) {
      // ✅ 不要 alert 阻塞体验；把错误交给 UI 自己展示
      setError("Phantom not found. Please install Phantom wallet.");
      return false;
    }

    try {
      setLoading(true);
      setError("");

      const res = await provider.connect(); // 会弹 Phantom 授权
      const pubkey = res?.publicKey?.toString?.() || "";
      if (!pubkey) throw new Error("No publicKey returned");

      setConnected(true);
      setAddress(pubkey);

      // 方案A：先不校验 WAOC（后续层级一再加）
      setHasWAOC(false);

      return true;
    } catch (e) {
      setError(e?.message || "Wallet connection failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [provider]);

  const disconnectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (provider?.isConnected) {
        await provider.disconnect();
      }
      clearState();
      return true;
    } catch (e) {
      setError(e?.message || "Wallet disconnect failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [provider, clearState]);

  // 监听账户切换（Phantom 会触发）
  useEffect(() => {
    if (!provider) return;

    const onAccountChanged = (pubkey) => {
      if (!pubkey) {
        // 用户在钱包里断开/锁定
        clearState();
        return;
      }
      const next = pubkey?.toString?.() || "";
      setConnected(true);
      setAddress(next);

      // 方案A：先不查 WAOC
      setHasWAOC(false);
    };

    provider.on("accountChanged", onAccountChanged);
    return () => {
      try {
        provider.removeListener("accountChanged", onAccountChanged);
      } catch {
        // 某些版本 removeListener 可能不可用，忽略
      }
    };
  }, [provider, clearState]);

  const value = useMemo(
    () => ({
      // 状态
      connected,
      address,
      hasWAOC,
      loading,
      error,
      isPhantomInstalled,

      // 动作
      connectWallet,
      disconnectWallet,

      // 预留：以后你要做“层级一/二/三”时，这里可以挂更多方法
      // setHasWAOC, etc.
    }),
    [
      connected,
      address,
      hasWAOC,
      loading,
      error,
      isPhantomInstalled,
      connectWallet,
      disconnectWallet,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
