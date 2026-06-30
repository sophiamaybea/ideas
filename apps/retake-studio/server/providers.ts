// Image-generation provider abstraction.
//
// The studio sends the user's own photo + a style prompt to an image model that
// returns a restyled, photorealistic version of the same person. Providers are
// pluggable; pick one with the IMAGE_PROVIDER env var.
//
//   IMAGE_PROVIDER=mock        -> no key needed, returns a placeholder (default)
//   IMAGE_PROVIDER=replicate   -> calls Replicate (needs REPLICATE_API_TOKEN)
//
// Add your own by implementing the Provider interface.

export type GenerateInput = {
  // Data URL or https URL of the user's uploaded photo.
  image: string;
  prompt: string;
  negativePrompt: string;
  count: number;
};

export type GenerateOutput = {
  images: string[]; // URLs or data URLs of generated images
  provider: string;
};

export interface Provider {
  name: string;
  generate(input: GenerateInput): Promise<GenerateOutput>;
}

// ---------------------------------------------------------------------------
// Mock provider — lets the whole app run end-to-end with zero credentials.
// Returns deterministic placeholder portraits so the UI is fully demoable.
// ---------------------------------------------------------------------------
class MockProvider implements Provider {
  name = "mock";
  async generate(input: GenerateInput): Promise<GenerateOutput> {
    // Simulate model latency.
    await new Promise((r) => setTimeout(r, 1200));
    const seedBase = encodeURIComponent(input.prompt).slice(0, 24);
    const images = Array.from({ length: input.count }, (_, i) =>
      `https://picsum.photos/seed/${seedBase}-${i}/640/800`
    );
    return { images, provider: this.name };
  }
}

// ---------------------------------------------------------------------------
// Replicate provider — runs an image-to-image / instant-id style model.
// Set REPLICATE_API_TOKEN and (optionally) REPLICATE_MODEL_VERSION.
// ---------------------------------------------------------------------------
class ReplicateProvider implements Provider {
  name = "replicate";
  private token = process.env.REPLICATE_API_TOKEN ?? "";
  // Default to a portrait identity-preserving model version. Override via env.
  private version =
    process.env.REPLICATE_MODEL_VERSION ??
    // photomaker-style identity portrait model version hash
    "ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4";

  async generate(input: GenerateInput): Promise<GenerateOutput> {
    if (!this.token) {
      throw new Error(
        "REPLICATE_API_TOKEN is not set. Set it, or use IMAGE_PROVIDER=mock."
      );
    }
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: this.version,
        input: {
          input_image: input.image,
          prompt: input.prompt,
          negative_prompt: input.negativePrompt,
          num_outputs: input.count,
        },
      }),
    });
    if (!start.ok) {
      throw new Error(`Replicate error ${start.status}: ${await start.text()}`);
    }
    let pred = (await start.json()) as {
      id: string;
      status: string;
      output?: string[] | string;
      error?: string;
      urls: { get: string };
    };

    // Poll until the prediction settles.
    const deadline = Date.now() + 120_000;
    while (
      pred.status !== "succeeded" &&
      pred.status !== "failed" &&
      pred.status !== "canceled"
    ) {
      if (Date.now() > deadline) throw new Error("Replicate timed out.");
      await new Promise((r) => setTimeout(r, 1500));
      const poll = await fetch(pred.urls.get, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      pred = await poll.json();
    }
    if (pred.status !== "succeeded") {
      throw new Error(`Generation ${pred.status}: ${pred.error ?? "unknown"}`);
    }
    const out = pred.output;
    const images = Array.isArray(out) ? out : out ? [out] : [];
    return { images, provider: this.name };
  }
}

export function getProvider(): Provider {
  const which = (process.env.IMAGE_PROVIDER ?? "mock").toLowerCase();
  switch (which) {
    case "replicate":
      return new ReplicateProvider();
    case "mock":
    default:
      return new MockProvider();
  }
}
