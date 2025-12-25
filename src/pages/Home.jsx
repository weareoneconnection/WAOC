import React from "react";
import { useNavigate } from "react-router-dom";

// ✅ 把这里改成你的 WAOC logo 路径
// 例：把 logo 放到 src/assets/waoc-logo.png
import waocLogo from "../assets/waoc-logo.png";

export default function Home() {
  const nav = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.centerWrap}>
        {/* LOGO */}
        <div style={styles.logoWrap} aria-hidden="true">
          <img src={waocLogo} alt="WAOC logo" style={styles.logoImg} />
        </div>

        {/* TITLE */}
        <h1 style={styles.title}>WAOC Meditation</h1>

        {/* MINIMAL INTRO */}
        <p style={styles.subTitle}>
          <span style={styles.brandLine}>We Are One Connection.</span>
          <br />
          A quiet ritual of attention—where your breath meets a shared field.
          <br />
          Sit. Breathe. You are not alone.
        </p>

        {/* ✅ SHADOW HINT (timeless) */}
        <div style={styles.shadowHint}>The field gathers weekly.</div>

        {/* MICRO DISCLAIMER (optional, very WAOC) */}
        <div style={styles.microLine}>
          No accounts. No scores. No tracking.
          <br />
          Presence is the only signal.
        </div>

        {/* CTA */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Start</div>
          <div style={styles.cardDesc}>Open the collective field and enter the session.</div>

          <button
            style={styles.cta}
            onClick={() =>
              nav("/session", {
                state: { intent: "awareness", mode: "Solo (in the Field)", durationMin: 10 },
              })
            }
          >
            Enter the Field
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 64px)",
    display: "flex",
    justifyContent: "center",
    padding: "56px 16px 80px",
    background: "#fff",
    color: "#0b0f1a",
  },

  centerWrap: {
    width: "100%",
    maxWidth: 920,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    marginBottom: 18,
    // 极淡的“光晕”，不抢戏（不算贴图）
    boxShadow: "0 0 0 10px rgba(11,15,26,0.03)",
  },

  logoImg: {
    width: 88,
    height: 88,
    objectFit: "contain",
    userSelect: "none",
    WebkitUserDrag: "none",
  },

  title: {
    fontSize: 48,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    margin: "8px 0 14px",
    fontWeight: 800,
  },

  subTitle: {
    margin: "0 0 18px",
    maxWidth: 720,
    color: "rgba(11,15,26,0.7)",
    fontSize: 18,
    lineHeight: 1.6,
  },

  brandLine: {
    display: "inline-block",
    color: "rgba(11,15,26,0.88)",
    fontWeight: 650,
    letterSpacing: "0.01em",
    marginBottom: 8,
  },

  /* ✅ 新增：影子提示（不出现具体时间） */
  shadowHint: {
    marginTop: 2,
    marginBottom: 18,
    fontSize: 13,
    color: "rgba(11,15,26,0.38)",
    fontStyle: "italic",
    letterSpacing: "0.02em",
    userSelect: "none",
  },

  microLine: {
    marginTop: 2,
    marginBottom: 30,
    fontSize: 12,
    lineHeight: 1.5,
    color: "rgba(11,15,26,0.45)",
  },

  card: {
    width: "100%",
    maxWidth: 760,
    border: "1px solid rgba(11,15,26,0.10)",
    borderRadius: 18,
    padding: 22,
    textAlign: "left",
    background: "rgba(255,255,255,0.9)",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: 800,
    marginBottom: 6,
  },

  cardDesc: {
    fontSize: 15,
    color: "rgba(11,15,26,0.65)",
    marginBottom: 14,
  },

  cta: {
    appearance: "none",
    border: "1px solid rgba(11,15,26,0.12)",
    background: "#0b0f1a",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 750,
    cursor: "pointer",
  },
};
