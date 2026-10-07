# Product Reconstruction + Invention Engine

## Goal
Given a reference website/product/image, reconstruct the strongest parts with high visual and behavioural fidelity, understand likely implementation choices, then improve the underlying product rather than merely copying the surface.

## Pipeline
1. Observe visual system and interaction grammar.
2. Decompose layout, typography, motion, depth, timing and responsive behaviour.
3. Infer likely technical primitives.
4. Search GitHub for the best reusable components/engines.
5. Inspect exact source modules and licences.
6. Build a minimal behavioural clone.
7. Compare against the reference.
8. Fix fidelity gaps.
9. Improve performance, accessibility and resilience.
10. Add a defensible invention layer.

## Repository archaeology questions
- Is there already a physics/motion/layout engine that reproduces the hard part?
- Is the interaction a known WebGL/R3F/GSAP/scroll pattern?
- Can we reuse a primitive without inheriting an entire template?
- What exact modules matter?
- Can a reference implementation teach us the algorithm while we implement our own version?

## Anti-copy rule
The objective is not trademark or content imitation. Reconstruct interaction/engineering patterns, then create an original product identity and stronger system.
