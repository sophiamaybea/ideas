import { useState } from "react";
import { PRESETS } from "../../shared/presets.ts";
import { ACCEPTABLE_USE } from "../../shared/safety.ts";
import { generate, fileToDataUrl, type GenerateResponse } from "../lib/api.ts";

export default function Studio() {
  const [image, setImage] = useState<string | null>(null);
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [extra, setExtra] = useState("");
  const [count, setCount] = useState(4);

  const [ownLikeness, setOwnLikeness] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const canSubmit = image && ownLikeness && acceptedPolicy && !loading;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setImage(await fileToDataUrl(file));
  }

  async function onGenerate() {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generate({
        image,
        presetId,
        extraPrompt: extra.trim() || undefined,
        count,
        consent: { ownLikenessOrConsent: ownLikeness, acceptedPolicy },
      });
      setResult(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 grid lg:grid-cols-[380px_1fr] gap-8">
      {/* Controls */}
      <div className="space-y-6">
        <div className="card p-5">
          <h2 className="font-600 text-lg">1 · Your photo</h2>
          <p className="text-sm text-ink/60 mt-1">
            Upload a clear selfie of yourself.
          </p>
          <label className="mt-4 block">
            <div className="aspect-[4/5] rounded-xl border-2 border-dashed border-black/15 grid place-items-center overflow-hidden cursor-pointer hover:border-accent transition">
              {image ? (
                <img src={image} alt="Your upload" className="w-full h-full object-cover" />
              ) : (
                <span className="text-ink/40 text-sm">Click to upload</span>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
        </div>

        <div className="card p-5">
          <h2 className="font-600 text-lg">2 · Look</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                className={`text-left p-3 rounded-xl border text-sm transition ${
                  presetId === p.id
                    ? "border-accent bg-accent/5"
                    : "border-black/10 hover:border-black/25"
                }`}
              >
                <div>{p.emoji} {p.name}</div>
              </button>
            ))}
          </div>
          <label className="block mt-4 text-sm">
            <span className="text-ink/60">Optional note</span>
            <input
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="e.g. navy blazer, smiling"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-black/10"
            />
          </label>
          <label className="block mt-4 text-sm">
            <span className="text-ink/60">How many ({count})</span>
            <input
              type="range"
              min={1}
              max={8}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-1 w-full accent-accent"
            />
          </label>
        </div>

        <div className="card p-5">
          <h2 className="font-600 text-lg">3 · Consent</h2>
          <label className="flex gap-2 mt-3 text-sm">
            <input
              type="checkbox"
              checked={ownLikeness}
              onChange={(e) => setOwnLikeness(e.target.checked)}
              className="mt-0.5 accent-accent"
            />
            <span>
              This is a photo of me, or of someone who has given explicit consent
              for AI generation of their likeness.
            </span>
          </label>
          <label className="flex gap-2 mt-3 text-sm">
            <input
              type="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
              className="mt-0.5 accent-accent"
            />
            <span>I accept the acceptable-use policy.</span>
          </label>
          <details className="mt-3 text-xs text-ink/55">
            <summary className="cursor-pointer">Read the policy</summary>
            <ul className="mt-2 space-y-1 list-disc pl-4">
              {ACCEPTABLE_USE.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </details>
        </div>

        <button
          onClick={onGenerate}
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-full bg-accent text-white font-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90"
        >
          {loading ? "Generating…" : "Generate my photos"}
        </button>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
        )}
      </div>

      {/* Results */}
      <div className="card p-6 min-h-[400px]">
        <h2 className="font-600 text-lg">Results</h2>
        {!result && !loading && (
          <div className="h-full grid place-items-center text-ink/40 text-sm py-20">
            Your generated photos will appear here.
          </div>
        )}
        {loading && (
          <div className="grid grid-cols-2 gap-4 mt-5">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-xl bg-gradient-to-r from-black/5 via-black/10 to-black/5 bg-[length:200%_100%] animate-shimmer"
              />
            ))}
          </div>
        )}
        {result && (
          <>
            <p className="text-xs text-ink/50 mt-1">
              Job {result.jobId} · provider: {result.provider} · all images
              labelled AI-generated
            </p>
            <div className="grid grid-cols-2 gap-4 mt-5">
              {result.images.map((src, i) => (
                <a
                  key={i}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative rounded-xl overflow-hidden"
                >
                  <img src={src} alt={`Result ${i + 1}`} className="w-full aspect-[4/5] object-cover" />
                  <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full">
                    AI-generated
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
