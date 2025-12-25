// src/utils/audioEngine.js
let audio = null;

export function getAudio() {
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.35;
  }
  return audio;
}

export async function playAmbient(src, { volume = 0.35 } = {}) {
  const a = getAudio();
  if (a.src !== new URL(src, window.location.origin).toString()) {
    a.src = src; // public 路径如 /audio/ambient/ocean.mp3
  }
  a.volume = volume;
  try {
    await a.play(); // 需要用户手势触发（Enter 点击是手势）
    return true;
  } catch (e) {
    console.warn("Autoplay blocked:", e);
    return false;
  }
}

export function pauseAmbient() {
  const a = getAudio();
  a.pause();
}

export function setAmbientVolume(v) {
  const a = getAudio();
  a.volume = Math.max(0, Math.min(1, v));
}

export function isPlaying() {
  const a = getAudio();
  return !!a && !a.paused;
}
