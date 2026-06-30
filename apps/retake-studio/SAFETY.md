# Safety & Acceptable Use

RetakeStudio generates realistic photos of a person **from their own selfies**.
The underlying technology (identity-preserving image generation) is dual-use:
the same models can be abused to fabricate non-consensual or deceptive imagery.
This product is deliberately scoped to the legitimate use case and enforces that
scope in code.

## What this tool is for

- Making better photos of **yourself** (headshots, lifestyle, editorial) from
  selfies you took or own.
- Generating a likeness of someone who has given **explicit, informed consent**.

## What this tool will not do

- Place your (or anyone's) face onto a **different person** or a named target.
- Generate images of **public figures**, or of private individuals **without
  consent**.
- Produce **sexual, nude, or otherwise exploitative** content.
- Generate images of **minors**.

## How the guardrails are enforced

These run on the server (`server/handler.ts` → `shared/safety.ts`) and cannot be
bypassed by the client:

1. **Consent gate.** Every request must carry two affirmative attestations —
   own-likeness/consent and acceptance of this policy — or it is rejected with
   HTTP 403.
2. **Text screen.** Any free-text prompt addition is screened for
   targeting/exploitation terms; matches are rejected with HTTP 422.
3. **Provenance.** Every job is stamped with an AI-generated disclosure
   (`provenanceTag`), and every rendered image is visibly labelled
   "AI-generated" in the UI. A production build should embed a signed C2PA
   manifest and an invisible watermark.

## Hardening checklist before any public deployment

- [ ] Replace the keyword screen with a real moderation/classifier model on both
      the uploaded image and the prompt.
- [ ] Add a face-match check so the output identity matches the uploaded
      consenting subject.
- [ ] Embed a cryptographic C2PA manifest + invisible watermark in outputs.
- [ ] Add rate limiting, authentication, and abuse logging.
- [ ] Add an age-estimation / minor-detection block on uploads.
- [ ] Keep an auditable record of the consent attestation per job.

The current keyword screen and checkbox consent are a **baseline**, not a
complete trust-and-safety system. Treat the checklist above as required work
before exposing this to real users.
