import { PRESETS } from "../../shared/presets.ts";
import { ACCEPTABLE_USE } from "../../shared/safety.ts";

const STEPS = [
  {
    n: "01",
    title: "Upload your selfies",
    body: "Drop in 5–15 photos of yourself from different angles and lighting.",
  },
  {
    n: "02",
    title: "Pick a look",
    body: "Choose a studio preset — headshot, golden hour, editorial, and more.",
  },
  {
    n: "03",
    title: "Get hyper-real photos",
    body: "The model renders photorealistic images that keep your real likeness.",
  },
];

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-600 uppercase tracking-wider px-3 py-1 rounded-full bg-accent/10 text-accent">
            ✦ Your photos · your likeness · your consent
          </span>
          <h1 className="mt-5 font-display text-5xl md:text-6xl font-700 leading-[1.05]">
            Hyper-real photos of <span className="gradient-text">you</span>,
            from your own selfies.
          </h1>
          <p className="mt-5 text-lg text-ink/70 max-w-md">
            RetakeStudio turns a handful of everyday selfies into a studio shoot —
            headshots, editorials, lifestyle. It restyles <em>you</em>, never
            someone else.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              onClick={onStart}
              className="px-6 py-3 rounded-full bg-ink text-white font-600 hover:bg-ink/90"
            >
              Open the Studio →
            </button>
            <a
              href="#how"
              className="px-6 py-3 rounded-full border border-black/10 font-600 hover:bg-black/5"
            >
              How it works
            </a>
          </div>
          <p className="mt-4 text-xs text-ink/50">
            Runs with a free mock model out of the box — no API key needed to try.
          </p>
        </div>

        {/* Floating preview cards */}
        <div className="relative h-[420px]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute card overflow-hidden animate-floaty"
              style={{
                width: 190,
                left: i * 90,
                top: i * 60,
                animationDelay: `${i * 0.8}s`,
                zIndex: 3 - i,
              }}
            >
              <img
                src={`https://picsum.photos/seed/retake-hero-${i}/380/480`}
                alt="Example AI portrait"
                className="w-full h-[240px] object-cover"
              />
              <div className="px-3 py-2 text-xs text-ink/60">
                {PRESETS[i].emoji} {PRESETS[i].name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white border-y border-black/5">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="font-display text-3xl font-700">Three steps</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="card p-6">
                <div className="text-accent font-display text-2xl font-700">
                  {s.n}
                </div>
                <h3 className="mt-2 text-lg font-600">{s.title}</h3>
                <p className="mt-1 text-ink/65 text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presets */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="font-display text-3xl font-700">Studio looks</h2>
        <p className="mt-2 text-ink/65">Six presets, each a full lighting setup.</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESETS.map((p) => (
            <div key={p.id} className="card p-5 flex gap-4 items-start">
              <div className="text-3xl">{p.emoji}</div>
              <div>
                <h3 className="font-600">{p.name}</h3>
                <p className="text-sm text-ink/60">{p.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Consent / acceptable use */}
      <section className="bg-ink text-cloud">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <h2 className="font-display text-3xl font-700">
            Built for consent, by design
          </h2>
          <p className="mt-3 text-cloud/70 max-w-2xl">
            Realistic face generation can be abused. RetakeStudio is scoped to a
            single, legitimate use — making better photos of yourself — and
            enforces that on every request.
          </p>
          <ul className="mt-8 grid md:grid-cols-2 gap-4">
            {ACCEPTABLE_USE.map((rule) => (
              <li
                key={rule}
                className="flex gap-3 text-sm text-cloud/85 bg-white/5 rounded-xl p-4"
              >
                <span className="text-accent-soft">✓</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-20 text-center">
        <h2 className="font-display text-4xl font-700">Ready for your retake?</h2>
        <button
          onClick={onStart}
          className="mt-6 px-8 py-3.5 rounded-full bg-accent text-white font-600 hover:bg-accent/90"
        >
          Open the Studio →
        </button>
      </section>
    </div>
  );
}
