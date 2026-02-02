const KEY = "waoc_presence_v1";

export function loadPresence() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function savePresence(event) {
  const all = loadPresence();
  const next = [{ ...event, ts: Date.now() }, ...all].slice(0, 200);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function hashLite(input) {
  // 占位：后面换成 sha256/keccak（浏览器 crypto.subtle）
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return "h" + (h >>> 0).toString(16);
}
