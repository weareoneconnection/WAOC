// src/pages/Settings.jsx
import React, { useMemo, useState } from "react";

function GlowBG() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[#05060A]" />

      {/* Soft nebula glows */}
      <div className="absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute top-24 -left-40 h-[420px] w-[420px] rounded-full bg-white/4 blur-3xl" />
      <div className="absolute bottom-0 -right-52 h-[520px] w-[520px] rounded-full bg-white/4 blur-3xl" />

      {/* Star noise */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.10) 0 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.08) 0 1px, transparent 1px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.06) 0 1px, transparent 1px)",
          backgroundSize: "240px 240px, 320px 320px, 420px 420px",
        }}
      />

      {/* Top divider glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

function Card({ title, hint, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
      {/* subtle inner glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
      <div className="relative px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/90">{title}</h2>
          {hint ? <span className="text-xs text-white/45">{hint}</span> : null}
        </div>
      </div>
      <div className="relative px-5 divide-y divide-white/10">{children}</div>
    </div>
  );
}

function Row({ label, desc, right, danger }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <div className={`text-sm font-medium ${danger ? "text-red-400" : "text-white/85"}`}>{label}</div>
        {desc ? <div className="mt-1 text-xs text-white/45 leading-relaxed">{desc}</div> : null}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function Toggle({ checked, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition",
        checked ? "bg-white/85" : "bg-white/15",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full transition shadow",
          checked ? "translate-x-5 bg-black/90" : "translate-x-1 bg-white/85",
        ].join(" ")}
      />
    </button>
  );
}

function Select({ value, onChange, options, ariaLabel }) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white/85 outline-none focus:ring-2 focus:ring-white/20"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#07080E]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function IconMark() {
  return (
    <div className="relative grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
      {/* energy ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_40px_rgba(255,255,255,0.06)]" />
      <span className="text-sm font-semibold text-white/90">W</span>
    </div>
  );
}

function PrimaryBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 rounded-xl border border-white/10 bg-white/90 px-3 text-sm text-black hover:opacity-90"
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white/80 hover:bg-white/[0.10]"
    >
      {children}
    </button>
  );
}

export default function Settings() {
  // demo states (后续接入真实钱包/存储)
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("0x9cB7…41A2");
  const [network, setNetwork] = useState("Solana");

  const [theme, setTheme] = useState("dark"); // light | dark | system
  const [reduceMotion, setReduceMotion] = useState(false);

  const [defaultDuration, setDefaultDuration] = useState("10");
  const [defaultIntent, setDefaultIntent] = useState("awareness");
  const [sound, setSound] = useState("silence");

  const [notifySessionEnd, setNotifySessionEnd] = useState(true);
  const [notifyCollective, setNotifyCollective] = useState(false);

  const [shareApproxLocation, setShareApproxLocation] = useState(true);
  const [analytics, setAnalytics] = useState(false);

  const profileTitle = useMemo(() => (connected ? "Wallet Connected" : "Connect Wallet"), [connected]);

  return (
    <div className="relative min-h-screen text-white">
      <GlowBG />

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#05060A]/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <IconMark />
            <div>
              <h1 className="text-lg font-semibold text-white/90">Settings</h1>
              <p className="text-xs text-white/45">WAOC Meditation · We Are One Connection</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GhostBtn onClick={() => alert("Saved (demo). 你可接入真实保存逻辑。")}>Save</GhostBtn>
            <PrimaryBtn onClick={() => alert("Sync (demo). 后续可用于链上/云端同步。")}>Sync</PrimaryBtn>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-5 py-6 lg:grid-cols-2">
        {/* Account */}
        <Card title="Account" hint="Wallet identity">
          <Row
            label={profileTitle}
            desc={
              connected
                ? "Your wallet is your identity. No email. No ranks. Connection is the proof."
                : "Login with wallet to access resonance features."
            }
            right={
              connected ? (
                <GhostBtn onClick={() => setConnected(false)}>Disconnect</GhostBtn>
              ) : (
                <PrimaryBtn onClick={() => setConnected(true)}>Connect</PrimaryBtn>
              )
            }
          />

          {connected ? (
            <>
              <Row
                label="Network"
                desc="Select the chain context for WAOC."
                right={
                  <Select
                    ariaLabel="Network"
                    value={network}
                    onChange={setNetwork}
                    options={[
                      { value: "Solana", label: "Solana" },
                      { value: "BSC", label: "BSC" },
                      { value: "Ethereum", label: "Ethereum (later)" },
                    ]}
                  />
                }
              />
              <Row
                label="Address"
                desc="Always displayed as truncated."
                right={
                  <div className="flex items-center gap-2">
                    <Pill>{address}</Pill>
                    <GhostBtn
                      onClick={() => {
                        navigator.clipboard?.writeText(address);
                      }}
                    >
                      Copy
                    </GhostBtn>
                  </div>
                }
              />
            </>
          ) : null}
        </Card>

        {/* Appearance */}
        <Card title="Appearance" hint="Minimal comfort">
          <Row
            label="Theme"
            desc="Dark recommended for the field."
            right={
              <Select
                ariaLabel="Theme"
                value={theme}
                onChange={setTheme}
                options={[
                  { value: "system", label: "System" },
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                ]}
              />
            }
          />
          <Row
            label="Reduce motion"
            desc="Lower animation intensity."
            right={<Toggle ariaLabel="Reduce motion" checked={reduceMotion} onChange={setReduceMotion} />}
          />
        </Card>

        {/* Meditation defaults */}
        <Card title="Meditation" hint="Session defaults">
          <Row
            label="Default duration"
            desc="Applied when starting new sessions."
            right={
              <Select
                ariaLabel="Default duration"
                value={defaultDuration}
                onChange={setDefaultDuration}
                options={[
                  { value: "5", label: "5 min" },
                  { value: "10", label: "10 min" },
                  { value: "15", label: "15 min" },
                  { value: "20", label: "20 min" },
                ]}
              />
            }
          />
          <Row
            label="Default intent"
            desc="Intent is a signal — not a score."
            right={
              <Select
                ariaLabel="Default intent"
                value={defaultIntent}
                onChange={setDefaultIntent}
                options={[
                  { value: "awareness", label: "Awareness" },
                  { value: "peace", label: "Peace" },
                  { value: "unity", label: "Unity" },
                  { value: "compassion", label: "Compassion" },
                ]}
              />
            }
          />
          <Row
            label="Sound"
            desc="Your default soundscape."
            right={
              <Select
                ariaLabel="Sound"
                value={sound}
                onChange={setSound}
                options={[
                  { value: "silence", label: "Silence" },
                  { value: "tone", label: "Soft Tone" },
                  { value: "rain", label: "Rain" },
                  { value: "ocean", label: "Ocean" },
                ]}
              />
            }
          />
        </Card>

        {/* Notifications */}
        <Card title="Notifications" hint="Gentle nudges">
          <Row
            label="Session end"
            desc="Notify when your meditation ends."
            right={<Toggle ariaLabel="Session end" checked={notifySessionEnd} onChange={setNotifySessionEnd} />}
          />
          <Row
            label="Collective events"
            desc="Resonance waves & community sits (optional)."
            right={<Toggle ariaLabel="Collective events" checked={notifyCollective} onChange={setNotifyCollective} />}
          />
        </Card>

        {/* Privacy */}
        <Card title="Privacy" hint="Respect by design">
          <Row
            label="Share approximate location"
            desc="Only to place a soft glow on the globe. Never precise."
            right={
              <Toggle
                ariaLabel="Share approximate location"
                checked={shareApproxLocation}
                onChange={setShareApproxLocation}
              />
            }
          />
          <Row
            label="Analytics"
            desc="Anonymous metrics to improve the app."
            right={<Toggle ariaLabel="Analytics" checked={analytics} onChange={setAnalytics} />}
          />
        </Card>

        {/* Security & About */}
        <Card title="Security & About" hint="Support">
          <Row
            label="Export settings"
            desc="Download your preferences as JSON."
            right={
              <GhostBtn
                onClick={() => {
                  const data = {
                    theme,
                    reduceMotion,
                    defaultDuration,
                    defaultIntent,
                    sound,
                    notifySessionEnd,
                    notifyCollective,
                    shareApproxLocation,
                    analytics,
                    network: connected ? network : null,
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "waoc-settings.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export
              </GhostBtn>
            }
          />
          <Row
            label="Reset to defaults"
            desc="Restore recommended values."
            right={
              <GhostBtn
                onClick={() => {
                  setTheme("dark");
                  setReduceMotion(false);
                  setDefaultDuration("10");
                  setDefaultIntent("awareness");
                  setSound("silence");
                  setNotifySessionEnd(true);
                  setNotifyCollective(false);
                  setShareApproxLocation(true);
                  setAnalytics(false);
                  alert("Reset done (demo).");
                }}
              >
                Reset
              </GhostBtn>
            }
          />
          <Row label="App version" desc="WAOC Meditation Web" right={<Pill>v0.1</Pill>} />
          <Row
            label="Support"
            desc="Report an issue or suggest a feature."
            right={<PrimaryBtn onClick={() => alert("Support (demo). 可接入 TG/Discord/Email")}>Contact</PrimaryBtn>}
          />
          <Row
            label="Danger zone"
            desc="Clear local data on this browser."
            danger
            right={
              <button
                type="button"
                className="h-9 rounded-xl bg-red-500/90 px-3 text-sm text-white hover:opacity-90"
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch {}
                  alert("Local data cleared (demo).");
                }}
              >
                Clear data
              </button>
            }
          />
        </Card>
      </div>

      <div className="h-10" />
    </div>
  );
}
