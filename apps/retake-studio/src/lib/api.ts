import type { ConsentClaim } from "../../shared/safety.ts";

export type GenerateResponse = {
  jobId: string;
  images: string[];
  provider: string;
  preset: string;
  provenance: Record<string, unknown>;
};

export type GenerateError = {
  error: string;
  reasons?: string[];
  detail?: string;
};

export async function generate(params: {
  image: string;
  presetId: string;
  extraPrompt?: string;
  count: number;
  consent: ConsentClaim;
}): Promise<GenerateResponse> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = data as GenerateError;
    const msg = err.reasons?.length ? err.reasons.join(" ") : err.error || "Request failed";
    throw new Error(msg);
  }
  return data as GenerateResponse;
}

// Read a File into a data URL for upload + preview.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
