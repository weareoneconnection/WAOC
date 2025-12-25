import React, { useEffect, useMemo, useRef, useState } from "react";

export default function AudioPlayer({
  src = "/audio/ocean.mp3",
  label = "Ambient",
  defaultVolume = 0.5,
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(defaultVolume);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol;
  }, [vol]);

  // iOS/Chrome 通常要求用户手势后才允许播放
  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;

    try {
      if (playing) {
        el.pause();
        setPlaying(false);
      } else {
        await el.play();
        setPlaying(true);
      }
    } catch (e) {
      // 常见原因：未与用户手势触发、或音频未加载成功
      console.error("Audio play failed:", e);
      alert("Browser blocked autoplay. Please tap Play again.");
    }
  };

  const onEnded = () => setPlaying(false);

  return (
    <div style={styles.wrap}>
      <div style={styles.row}>
        <div style={styles.label}>{label}</div>
        <button onClick={toggle} style={styles.btn}>
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      <div style={styles.row2}>
        <span style={styles.muted}>Volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={vol}
          onChange={(e) => setVol(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      <audio ref={audioRef} src={src} loop onEnded={onEnded} preload="auto" />
    </div>
  );
}

const styles = {
  wrap: {
    border: "1px solid rgba(11,15,26,0.10)",
    borderRadius: 16,
    padding: 14,
    background: "#fff",
  },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  row2: { display: "flex", alignItems: "center", gap: 12, marginTop: 10 },
  label: { fontWeight: 750 },
  muted: { fontSize: 12, color: "rgba(11,15,26,0.55)", width: 54 },
  btn: {
    background: "#0b0f1a",
    color: "#fff",
    border: "1px solid rgba(11,15,26,0.12)",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 750,
    cursor: "pointer",
  },
};
