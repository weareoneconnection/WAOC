// src/components/proof/proofTextPool.js

export const HEADER_LINES = [
  "THE FIELD IS OPEN",
  "I SAT WITH OTHERS",
  "PRESENCE CONFIRMED",
];

export const DECLARATION_LINES = [
  "No accounts. No tracking.",
  "Presence is the only signal.",
  "Proof of presence, not reward.",
  "Nothing was recorded. Everything was shared.",
  "No ranks. No counts. Only presence.",
  "No witness. No performance. Only being.",
  "A public ritual. A private mind.",
];

export const SHARE_CAPTIONS = [
  "I sat with others. No accounts. No tracking.",
  "A quiet ritual. Presence only.",
  "Proof of presence — not proof of work.",
  "No ranks. No counts. I was here.",
  "A minute of silence in the open field.",
];

/**
 * B2: Finish 收束语（50句）
 * 用于 FinishScreen（不必上链、不必上卡片，可选）
 */
export const CLOSING_LINES = [
  "Carry the silence gently.",
  "Let the field fade, not the clarity.",
  "No need to hold it—just keep walking.",
  "Your breath did enough.",
  "Stay soft. Stay real.",
  "Nothing to prove. Everything to live.",
  "Return to the day—slowly.",
  "Keep the quiet behind your eyes.",
  "The field closes. You remain.",
  "This is enough for today.",
  "No record. No residue.",
  "Leave with a lighter mind.",
  "Bring this calm into one small act.",
  "You don’t have to explain it.",
  "Let your next word be kinder.",
  "Let your next step be steady.",
  "The world didn’t change—your center did.",
  "Hold the thread of presence.",
  "Breathe once more, then continue.",
  "A small pause can reshape the day.",
  "Let the noise pass through you.",
  "Keep the signal. Drop the static.",
  "Nothing was taken from you.",
  "You gave time back to yourself.",
  "Stay close to what is true.",
  "The quiet is yours to keep.",
  "You are allowed to be simple.",
  "Leave the field open inside.",
  "Calm is not an outcome—it's a choice.",
  "No rush. No chase.",
  "Return without hurry.",
  "Let today be a little gentler.",
  "Your presence is complete.",
  "Keep your shoulders loose.",
  "Let the breath lead.",
  "This moment can follow you.",
  "You did not perform. You arrived.",
  "Let the mind unclench.",
  "The field is closed. The path continues.",
  "No victory. No loss. Only now.",
  "Step back into life with less weight.",
  "A quiet mind is a generous mind.",
  "Let the next minute be clean.",
  "Don’t carry the session—carry the ease.",
  "Silence is not empty. It’s space.",
  "You are not behind.",
  "Be where your feet are.",
  "One breath at a time, still.",
  "Keep what matters. Release the rest.",
  "Nothing to add. Nothing to fix.",
];

export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return "—";
  if (minutes === 1) return "1 minute";
  return `${minutes} minutes`;
}

export function formatSound(sound) {
  if (!sound) return "Silence";
  const s = String(sound).toLowerCase();
  if (s.includes("sil")) return "Silence";
  if (s.includes("tone")) return "Tone";
  if (s.includes("ocean")) return "Ocean";
  if (s.includes("noise")) return "Noise";
  return sound;
}
