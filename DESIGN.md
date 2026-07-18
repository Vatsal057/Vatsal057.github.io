# DESIGN.md — Lab Notebook system

## Theme
Quiet-study lab notebook: warm paper, graph-grid background, pinned index
cards, marker underlines, handwritten margin notes. Committed identity —
preserved, refined, not replaced.

## Color (existing tokens, style.css `:root`)
- `--paper #F7F5F0` body bg (graph grid `--grid #E7E3D8` at 28px)
- `--card #FFFDF8` surfaces
- `--ink #2B3A42` text · `--ink-soft #5A6B73` secondary (≥4.5:1 on paper)
- `--sage #8FA98F` / `--sage-deep #6E8B6E` primary accent (links, pass-states)
- `--amber #D9A86C` highlight/marker · `--rose #C98A8A` failure states
- Strategy: restrained neutrals + three deliberate accents with semantic
  meaning (sage=live/pass, amber=attention/highlight, rose=failed/kept).

## Typography
- Fraunces (display, 500-700) — headings only
- Inter (400-600) — body, max ~70ch
- JetBrains Mono — labels, stats, terminal, pipelines, metadata
- Caveat — handwritten margin notes ONLY (never body)
- `text-wrap: balance` on headings.

## Signature components
- **Pinned card**: cream card, slight rotation, amber pin dot. Projects.
- **Terminal window**: dark titlebar + traffic dots. Real command output only.
- **Sticky note**: sage/amber/rose tinted squares. Experiment board.
- **Index card**: Caveat heading + short prose. Principles.
- **Pipeline chips**: mono spans with arrows. How-it-works.
- **Git log rows**: hash + date + message. Timeline.
- **Marker underline**: amber skewed bar behind key phrases.

## Motion
- Lenis smooth scroll + GSAP reveals (translate+fade, ease-out, ≤0.6s).
- Rule: motion reveals content that is already visible without it (no
  opacity:0 default without JS fallback).
- `prefers-reduced-motion` + recruiter mode: instant states, no Lenis.
- No scroll-jacking. No horizontal pin sections.

## Layout
- Max content 1100px; sections `clamp(3rem, 9vh, 6rem)` vertical rhythm.
- Cards: `repeat(auto-fit, minmax(280px, 1fr))`.
- Mobile: single column, nav collapses, tap targets ≥44px.

## Z-scale
grid-bg(-1) → content(0) → topbar(50) → companion(60) → terminal(70).
