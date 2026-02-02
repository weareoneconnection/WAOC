// src/components/proof/proofCardTheme.js

export const PROOF_CARD_SIZE = 1080;

export const proofCardTheme = {
  size: PROOF_CARD_SIZE,

  // Palette
  bg: "#07070A",
  fg: "#F2F2F2",
  muted: "rgba(242,242,242,0.66)",
  faint: "rgba(242,242,242,0.20)",
  hairline: "rgba(242,242,242,0.12)",
  ultraFaint: "rgba(242,242,242,0.08)",

  // Fonts (system safe)
  fontSans:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
  fontMono:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace',

  // Layout
  pad: 88,
  cornerRadius: 38,

  // Typography
  headerSize: 42,
  ritualSize: 78,
  metaSize: 34,
  declSize: 34,
  footerSize: 28,
  microSize: 22,

  // Decorative
  ringAlpha: 0.12,
  ringAlphaInner: 0.16,
  grainAlpha: 0.10,
  glowAlpha: 0.12,

  // “Seal” mark
  sealAlpha: 0.16,
};
