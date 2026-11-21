# ADR-005: Deterministic Bilingual Math Narration & MathJax MathML

- **Status:** Accepted
- **Date:** 2026-11-21

## Decision
Combine deterministic rule-based LaTeX-to-Speech (`narrateLatexEquation`) supporting English and Indonesian (`id`) with MathJax (`latexToMathMl`) syntax validation rather than delegating every equation unconditionally to an LLM.

## Consequences
- Common academic formulas (fractions, powers, roots, integrals, summations, limits, Greek symbols) narrate predictably with zero hallucination and zero API latency.
- Complex unsupported macros (e.g., matrices, piecewise systems) and MathJax parse errors automatically penalize block confidence and route the item to volunteer review.
