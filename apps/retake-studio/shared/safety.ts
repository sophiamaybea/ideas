// Consent + acceptable-use guardrails.
//
// This product generates realistic photos of a person from THEIR OWN selfies.
// The same technology can be abused to fabricate non-consensual imagery of
// other people, so consent is a first-class, enforced part of every request —
// not a checkbox we hope someone read. These checks run on the server and
// cannot be bypassed by the client.

export type ConsentClaim = {
  // The user attests every uploaded photo is of themselves, or of someone who
  // has given explicit permission for AI generation.
  ownLikenessOrConsent: boolean;
  // The user accepts the acceptable-use policy.
  acceptedPolicy: boolean;
  // Free-text attestation, stored with the job for provenance/audit.
  signature?: string;
};

export type SafetyVerdict = {
  ok: boolean;
  reasons: string[];
};

export const ACCEPTABLE_USE = [
  "Only upload photos of yourself, or of someone who has explicitly consented to AI generation of their likeness.",
  "Do not target public figures, private individuals without consent, or minors.",
  "Do not use outputs to deceive, defraud, impersonate, harass, or create sexual content.",
  "Generated images are labelled as AI-generated and carry provenance metadata.",
  "You are responsible for how you use the images you create.",
] as const;

// Words that suggest the request is about putting a face onto someone else /
// a named target rather than restyling the user's own photo. Used to nudge the
// user back toward the supported, consent-based flow.
const TARGETING_TERMS = [
  "celebrity",
  "celeb",
  "president",
  "politician",
  "actor",
  "actress",
  "swap onto",
  "put my face on",
  "their body",
  "without consent",
  "nude",
  "naked",
  "nsfw",
  "porn",
  "sexual",
  "minor",
  "child",
  "kid",
];

export function checkConsent(consent: ConsentClaim): SafetyVerdict {
  const reasons: string[] = [];
  if (!consent.ownLikenessOrConsent) {
    reasons.push(
      "You must confirm every photo is of you, or of someone who consented."
    );
  }
  if (!consent.acceptedPolicy) {
    reasons.push("You must accept the acceptable-use policy.");
  }
  return { ok: reasons.length === 0, reasons };
}

export function screenText(text: string | undefined): SafetyVerdict {
  if (!text) return { ok: true, reasons: [] };
  const lower = text.toLowerCase();
  const hits = TARGETING_TERMS.filter((t) => lower.includes(t));
  if (hits.length > 0) {
    return {
      ok: false,
      reasons: [
        "This studio only restyles photos of yourself (or a consenting person). It can't be used to place a face on someone else, target a named person, or generate explicit content.",
      ],
    };
  }
  return { ok: true, reasons: [] };
}

// Provenance metadata stamped onto every generated job.
export function provenanceTag(jobId: string, presetId: string) {
  return {
    generator: "retake-studio",
    aiGenerated: true,
    jobId,
    preset: presetId,
    // C2PA-style note; a production build would sign + embed a real manifest.
    disclosure: "This image was generated or modified by AI.",
  };
}
