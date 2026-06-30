// Style presets for the studio. Each preset is a prompt template applied to the
// user's OWN uploaded selfies to render a hyper-realistic photo of themselves.
// These are "restyle the subject" prompts — they do not change identity.

export type Preset = {
  id: string;
  name: string;
  blurb: string;
  emoji: string;
  // Prompt guidance handed to the image model alongside the user's photo.
  prompt: string;
  negativePrompt: string;
};

export const PRESETS: Preset[] = [
  {
    id: "linkedin-headshot",
    name: "LinkedIn Headshot",
    blurb: "Clean studio headshot, soft key light, neutral backdrop.",
    emoji: "💼",
    prompt:
      "professional corporate headshot of the same person, soft studio key light, shallow depth of field, neutral grey backdrop, natural skin texture, sharp eyes, business-casual attire, photorealistic, 85mm lens",
    negativePrompt:
      "cartoon, illustration, plastic skin, distorted face, extra fingers, watermark, text",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    blurb: "Warm outdoor light, cinematic and candid.",
    emoji: "🌅",
    prompt:
      "candid outdoor portrait of the same person at golden hour, warm rim light, soft bokeh, cinematic color grade, natural skin texture, photorealistic",
    negativePrompt:
      "cartoon, illustration, plastic skin, overexposed, distorted face, watermark, text",
  },
  {
    id: "editorial-bw",
    name: "Editorial B&amp;W",
    blurb: "High-contrast black & white magazine portrait.",
    emoji: "🎞️",
    prompt:
      "high-contrast black and white editorial portrait of the same person, dramatic single-source lighting, fine film grain, sharp focus, photorealistic",
    negativePrompt:
      "color, cartoon, illustration, plastic skin, distorted face, watermark, text",
  },
  {
    id: "passport",
    name: "ID / Passport",
    blurb: "Even front lighting, plain white background, neutral pose.",
    emoji: "🪪",
    prompt:
      "front-facing ID photo of the same person, even flat lighting, plain white background, neutral expression, sharp focus, photorealistic, no shadows",
    negativePrompt:
      "tilt, smile, harsh shadows, cartoon, illustration, distorted face, watermark, text",
  },
  {
    id: "outdoor-lifestyle",
    name: "Lifestyle",
    blurb: "Relaxed, natural daylight, blurred city background.",
    emoji: "🚶",
    prompt:
      "relaxed lifestyle portrait of the same person, natural daylight, blurred urban background, candid expression, natural skin texture, photorealistic",
    negativePrompt:
      "studio, cartoon, illustration, plastic skin, distorted face, watermark, text",
  },
  {
    id: "creative-color",
    name: "Creative Color",
    blurb: "Bold gel lighting, fashion-forward, vibrant.",
    emoji: "🎨",
    prompt:
      "fashion portrait of the same person with bold colored gel lighting, vibrant magenta and teal tones, glossy editorial look, natural skin texture, photorealistic",
    negativePrompt:
      "muted, cartoon, illustration, plastic skin, distorted face, watermark, text",
  },
];

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
