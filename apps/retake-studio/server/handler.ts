// Core request handler — framework-agnostic so it can run under the bundled
// dev server (server/index.ts) or as a serverless function (api/generate.ts).

import { getPreset } from "../shared/presets.ts";
import {
  checkConsent,
  screenText,
  provenanceTag,
  type ConsentClaim,
} from "../shared/safety.ts";
import { getProvider } from "./providers.ts";

export type GenerateRequest = {
  image?: string;
  presetId?: string;
  extraPrompt?: string;
  count?: number;
  consent?: ConsentClaim;
};

export type HandlerResult = {
  status: number;
  body: Record<string, unknown>;
};

let jobCounter = 0;

export async function handleGenerate(
  req: GenerateRequest
): Promise<HandlerResult> {
  // 1. Basic shape validation.
  if (!req.image || typeof req.image !== "string") {
    return { status: 400, body: { error: "Missing 'image'." } };
  }
  const preset = getPreset(req.presetId ?? "");
  if (!preset) {
    return { status: 400, body: { error: "Unknown or missing 'presetId'." } };
  }

  // 2. Consent gate — enforced server-side.
  const consent = checkConsent(req.consent ?? ({} as ConsentClaim));
  if (!consent.ok) {
    return { status: 403, body: { error: "Consent required", reasons: consent.reasons } };
  }

  // 3. Acceptable-use screen on any free-text the user added.
  const screen = screenText(req.extraPrompt);
  if (!screen.ok) {
    return { status: 422, body: { error: "Request blocked", reasons: screen.reasons } };
  }

  // 4. Clamp count to a sane range.
  const count = Math.min(Math.max(req.count ?? 4, 1), 8);

  // 5. Compose the prompt (preset + optional user note).
  const prompt = req.extraPrompt
    ? `${preset.prompt}, ${req.extraPrompt}`
    : preset.prompt;

  // 6. Generate.
  const jobId = `job_${Date.now()}_${++jobCounter}`;
  try {
    const provider = getProvider();
    const out = await provider.generate({
      image: req.image,
      prompt,
      negativePrompt: preset.negativePrompt,
      count,
    });
    return {
      status: 200,
      body: {
        jobId,
        images: out.images,
        provider: out.provider,
        preset: preset.id,
        provenance: provenanceTag(jobId, preset.id),
      },
    };
  } catch (err) {
    return {
      status: 502,
      body: { error: "Generation failed", detail: (err as Error).message },
    };
  }
}
