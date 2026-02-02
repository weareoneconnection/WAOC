import React from "react";

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:px-8">
      {/* Top */}
      <header className="space-y-4">
        <div className="text-xs tracking-[0.22em] text-slate-500 uppercase">
          We Are One Connection
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
          About WAOC
        </h1>

        <p className="text-base md:text-lg leading-relaxed text-slate-600">
          WAOC stands for <span className="font-semibold text-slate-900">We Are One Connection</span> —
          an experiment in shared attention, collective belief, and how simple symbols can connect people
          across cultures, languages, and backgrounds.
        </p>

        {/* Official site */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href="https://weareoneconnection.org"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:opacity-95"
          >
            Visit Official Site →
          </a>

          <a
            href="https://weareoneconnection.org"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            weareoneconnection.org
          </a>
        </div>
      </header>

      <div className="my-10 h-px w-full bg-slate-200/70" />

      {/* Origin */}
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
          Origin
        </h2>

        <p className="text-slate-600 leading-relaxed">
          WAOC began as a meme coin — not as a joke, but as an experiment.
          In Web3, memes are not meaningless: they are compressed expressions of emotion, values,
          and collective identity — carried by people, not controlled by institutions.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-medium text-slate-900">WAOC is culture-first.</span>{" "}
            Markets move. Narratives shift. But a shared signal can still connect strangers.
          </p>
        </div>
      </section>

      <div className="my-10 h-px w-full bg-slate-200/70" />

      {/* Philosophy */}
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
          Core Philosophy
        </h2>

        <p className="text-slate-600 leading-relaxed">
          At its core, WAOC is built on five simple ideas:
          <span className="font-semibold text-slate-900"> love, peace, unity, awareness, and shared destiny</span>.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <ValueCard title="Love" desc="Empathy beyond differences." />
          <ValueCard title="Peace" desc="Calm within chaos." />
          <ValueCard title="Unity" desc="Connection beyond identity." />
          <ValueCard title="Awareness" desc="Seeing before reacting." />
          <ValueCard title="Shared destiny" desc="No one evolves alone." />
        </div>

        <p className="text-slate-600 leading-relaxed">
          Beneath markets, narratives, and technologies,{" "}
          <span className="font-semibold text-slate-900">connection comes first</span>.
          Before systems, before value, before belief — there is awareness.
        </p>
      </section>

      <div className="my-10 h-px w-full bg-slate-200/70" />

      {/* What we build */}
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
          What WAOC Builds
        </h2>

        <p className="text-slate-600 leading-relaxed">
          WAOC is evolving into a set of interfaces that help communities coordinate without losing the human layer:
          presence, meaning, and long-term coherence.
        </p>

        <ul className="space-y-2 text-slate-600">
          <li className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>
              <span className="font-medium text-slate-900">Meditation</span> — a calm practice layer.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>
              <span className="font-medium text-slate-900">Presence / Proof</span> — minimal signals, no social pressure.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span>
              <span className="font-medium text-slate-900">Missions</span> — contribution as meaning, not noise.
            </span>
          </li>
        </ul>
      </section>

      <div className="my-10 h-px w-full bg-slate-200/70" />

      {/* Meditation */}
      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
          Meditation as Practice
        </h2>

        <p className="text-slate-600 leading-relaxed">
          This meditation space is not separate from WAOC.
          It is a quiet reflection of the same philosophy — a place to pause, breathe, and return to presence.
        </p>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-slate-600 leading-relaxed">
            Less noise. Less control. More awareness. <br />
            Not to escape the world, but to meet it with clarity.
          </p>
        </div>

        <p className="text-slate-600 leading-relaxed">
          No hype here. No promises. Just a moment of stillness — to remember that we are already connected.
        </p>
      </section>

      <div className="my-10 h-px w-full bg-slate-200/70" />

      {/* Footer */}
      <footer className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <a
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
            href="https://weareoneconnection.org"
            target="_blank"
            rel="noreferrer"
          >
            Official Site →
          </a>

          <span className="text-slate-400">•</span>

          <span className="text-slate-500">
            weareoneconnection.org
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          WAOC Meditation is a non-financial, non-incentive experience.
          It exists as a cultural and philosophical extension of the WAOC community and its shared vision.
        </p>
      </footer>
    </div>
  );
}

function ValueCard({ title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{desc}</div>
    </div>
  );
}
