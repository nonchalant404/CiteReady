# CiteReady® — Enterprise Generative Engine Optimization (GEO) Framework

> Complete technical documentation: what this project is, how the audit works, where the intelligence comes from, and how to act on it.

---

## 1. What Is This Project?

**CiteReady** is an enterprise **Generative Engine Optimization (GEO)** audit prototype. It demonstrates how a team could assess whether a brand is likely to be **cited, recommended, and understood** by AI answer engines — ChatGPT Search, Perplexity, Google AI Overviews, and Claude.

### The core problem it solves

In the *Search* era, ranking #1 on Google's ten blue links was the goal. In the *Answer* era, AI engines do something fundamentally different:

- They **read and synthesize** hundreds of pages in milliseconds.
- They produce **one synthesized answer** instead of a list of links.
- They attach **only 2–3 sources** (citations) as bubbles or footnotes.

If your content is promotional fluff without primary data, you are **silently skipped (Zero-Click Search)** — even if you rank well in classic SEO.

CiteReady's interface demonstrates how to diagnose:

1. Are AI crawler bots allowed to read your site?
2. Does your content carry **information gain** worth quoting?
3. What is the probability your brand is named when a buyer asks an AI?
4. What technical fixes move the score the fastest?

> **Implementation note:** this repository currently ships a browser-side GEO **simulation**, not a live crawler or connected AI service. It does not fetch the submitted URL, inspect its live `robots.txt` or `llms.txt`, or send prompts to OpenAI, Perplexity, Google, or Anthropic. The UI demonstrates the audit workflow; its findings are deterministic illustrative estimates. See the engine notes below before treating a report as a real measurement.

---

## 2. Where the Current Engine Comes From

The current engine is implemented locally in `src/lib/analyze.ts`. It uses **FNV-1a URL hashing and a seeded PRNG** to produce a stable demonstration: the same normalized URL produces the same simulated findings and scores (the audit timestamp changes). There is no LLM model, hosted inference API, crawler backend, or external data source connected in this build.

The diagram below describes the product's **simulated audit stages** and the backend architecture a production version would need. It is not evidence that this prototype performs live network checks.

```
[Target URL]
     │
     ▼
┌────────────────────────────────────────────────────────┐
│ 1. INGESTION & DIRECTIVE LAYER (production backend)     │
│    • Fetch robots.txt and public page HTML              │
│    • Probe /llms.txt and /llms-full.txt                 │
│    • Extract JSON-LD / schema.org                       │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. SEMANTIC & KNOWLEDGE-GRAPH RESOLVER                 │
│    • Resolve entities against trusted knowledge sources │
│    • Extract atomic claims and original evidence        │
│    • Score structure, provenance, and information gain  │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. AUDIT SCORER & EVIDENCE STORE                        │
│    • Weighted GEO scoring and reproducible snapshots    │
│    • Store observed evidence and timestamp each check   │
│    • Compare citation observations over time            │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. ANSWER-ENGINE CONNECTORS (optional production layer)  │
│    • Call approved model/search APIs from a secure server│
│    • Run fixed prompts and retain model/version metadata│
│    • Verify citations against returned source URLs      │
└────────────────────────────────────────────────────────┘
```

### Layer details

**A. Ingestion & Bot Directives**
In this prototype the crawler statuses are generated from the URL seed; `robots.txt` is **not requested**. A production checker needs a server-side fetcher with timeouts, redirect controls, response-size limits, DNS/IP protections, and transparent evidence links. The intended user-agents to check include:
- `GPTBot` — OpenAI live web browsing & training index
- `PerplexityBot` — Perplexity search ingestion index
- `ClaudeBot` / `Claude-Web` — Anthropic citation crawler
- `Google-Extended` — Gemini training & AI Overview generation

If a domain blocks a bot used for a particular retrieval feature, that can limit its access. The effect depends on the engine, product, and bot policy; a bot directive alone does not prove whether a page is indexed or cited.

**B. The `llms.txt` Standard**
The interface models a check for a Markdown manifest at `/llms.txt`. This build does not request that path. `llms.txt` is a community proposal, not a universal requirement or a guaranteed ranking/citation factor; implementations should measure whether their target systems actually use it.

**C. Information Gain & Quotability**
- **Quotability Index** — ratio of atomic (15–25 word) self-contained sentences an LLM can lift verbatim.
- **Statistical Density** — primary numeric claims, sample sizes (`n=…`), and p99 / SLA metrics. Models have a strong algorithmic bias toward verified numbers over qualitative opinion.
- **Entity Salience** — evaluate structured data and public entity references such as JSON-LD `sameAs`. This prototype does not query Wikidata or another knowledge graph.

**D. Multi-Engine Citation Emulator**
The report creates **template-based example responses**, not model output. It does not make requests to these services. A real connector must use supported APIs, disclose the exact model/search mode, retain prompt and response metadata, and verify each cited source:
1. **Perplexity Pro (Sonar)** — tests whether content earns a source bubble `[1]`.
2. **ChatGPT Search (OpenAI)** — tests whether the brand is named in the synthesized recommendation.
3. **Google Gemini 2.0 (AI Overviews)** — tests whether the URL enters the sources carousel.
4. **Claude 3.7 Sonnet (Anthropic)** — tests architectural synthesis and attribution.

---

## 3. The 6 Core Evaluation Axes

| # | Axis | Why It Matters to AI | Target |
|---|------|---------------------|--------|
| 1 | **AI Bot Directives** | A blocked bot never reads the page | All search bots allowed |
| 2 | **llms.txt Manifest** | Cheap, clean context for LLMs | `/llms.txt` live |
| 3 | **Quotability Index** | Models only pick clean, standalone lines | > 75 |
| 4 | **Statistical Richness** | Primary data beats generic text | ≥ 3 numbers / page |
| 5 | **Entity Salience** | Prevents brand hallucination | `sameAs` Wikidata |
| 6 | **Freshness Signals** | Engines favor 2025/2026 content | Explicit `dateModified` |

---

## 4. Scoring Formula

$$\text{GEO Score} = \sum_{i=1}^{n} (V_i \times W_i)$$

Weighting:

- Quotability & Thesis Density — **0.22**
- Statistical & Empirical Gain — **0.20**
- AI Bot Ingestion Directives — **0.18**
- llms.txt Manifest — **0.15**
- Entity & Schema Salience — **0.15**
- Temporal Anchors & Provenance — **0.10**

**Grade bands:** A+ (90–100) · A (82–89) · B+ (74–81) · B (65–73) · C (52–64) · D/F (< 52).

In the current demo, dimension values are seeded illustrative values—not measurements extracted from the submitted page. The formula describes the scoring model shown in the interface; it is not a validated prediction of real citation probability.

---

## 5. How an Audit Actually Runs (User Flow)

1. **Input** — user enters any URL (or clicks a random example).
2. **Scan phase** — terminal-style log illustrates DNS, parsing, manifest, entity and engine stages. These are simulated messages in this build; no target URL is fetched. A resonant audio bed follows the progress animation.
3. **Results dashboard** — six tabs:
   - **Score** — gauge, 6-axis radar, dimension bars, priority action plan.
   - **AI Answers** — side-by-side simulated answers for Perplexity / ChatGPT / Gemini / Claude with citation slots.
   - **Extraction** — every sentence classified as Primary Data / Atomic Claim / Entity Fact / Promotional, with the discarded lines struck through.
   - **Crawlers** — per-bot allow/block status with severity.
   - **Fixes** — before/after content rewrite + one-click copy of `llms.txt`, `robots.txt`, and JSON-LD.
   - **Rival** — head-to-head benchmark vs an industry competitor.
4. **Export** — download full JSON report or copy a shareable link.

---

## 6. Procedural Audio Engine

All sound is **synthesized live in the browser** (Web Audio API) — no files, no network, no latency. Graph:

```
sources ─┬─▶ master ─▶ analyser ─▶ destination
         └─▶ reverbSend (feedback delay) ─▶ master
```

| Event | Synthesis | Trigger |
|-------|-----------|---------|
| `boot()` | Sub rumble + bright sawtooth swell | Audit starts |
| `startScan()` | Resonant lowpass sweep + shimmer octave + radar tremolo | 4.6s scan |
| `ping(step)` | Sine rising per octave | Even terminal lines |
| `tick()` | Triangle keystroke | Odd terminal lines |
| `chime()` | Major add9 arpeggio + reverb tail | Report ready |
| `whoosh()` | Noise sweep through reverb | Tab / engine switch |
| `rise(n)` | Square rising per enabled signal | Signal Sandbox toggle |
| `thud()` | Sawtooth drop | Blocked crawler |
| `ding()` | Two-note bell | Copy / export |
| `hover()` | Short sine blip | Cursor over interactive el. |

Audio unlocks on the first user gesture (browser autoplay policy) and the mute preference persists in `localStorage`. On low-power/mobile devices the idle ambient drone is skipped; short UI cues and the scan sound remain available when enabled.

---

## 7. Interaction Architecture

### Scroll — `src/lib/scroll.ts`
Single source of truth to avoid three classic bugs:
1. `window.scrollTo()` fighting Lenis → all navigation uses `scrollToTop()` / `scrollToTarget()`.
2. Competing `overflow` writers → only `setScrollLock()` writes, via `html.is-locked`.
3. Native anchor clicks → intercepted and animated by Lenis with a `-72px` navbar offset.

### Cursor — `src/components/Cursor.tsx`
- One white dot replaces the native cursor only on precise pointers.
- The dot grows over clickable controls; it has no rings, labels, or scroll distortion.
- Touch/coarse-pointer devices do not mount the custom cursor.

---

## 8. Quick Implementation Checklist

- [ ] Allow `GPTBot` and `PerplexityBot` in `robots.txt`.
- [ ] Publish `/llms.txt` with markdown links to core pages.
- [ ] Add a 20-word atomic claim with real numbers under H1.
- [ ] Attach JSON-LD `sameAs` to your Wikidata / Wikipedia entity.
- [ ] Show an explicit `dateModified` timestamp (ISO 8601).

---

## 9. Mobile & Low-Power Performance

The app uses `src/lib/performance.ts` to select a conservative visual tier when a device has a coarse pointer, a narrow viewport, limited reported memory/CPU cores, data-saving enabled, or reduced-motion requested. Capability signals are hints, so the code keeps the fallback safe when a browser does not expose them.

| Workload | Desktop / capable device | Mobile / low-power device |
|---|---|---|
| Citation canvas | Animated nodes, pointer response, up to 90 nodes and DPR up to 2 | One static paint, up to 14 nodes, DPR 1, no pointer listener or animation loop |
| Custom cursor | One spring-following white dot | Not mounted |
| Opening | Pointer parallax, hover response, rotating accent | Smaller mark, no mouse listener, no continuous orbit |
| Waveform | Live canvas animation, up to the requested bar count | One static paint, up to 28 bars, DPR 1 |
| Ambient sound | Optional idle drone after an explicit audio gesture | Idle drone skipped; short effects stay user-controlled |
| Grain overlay | Subtle animated texture | Disabled for coarse pointers |
| Smooth scrolling | Lenis requests frames while scrolling | Same smooth behavior, but no permanent idle animation loop |

The difference is intentional: a desktop has more headroom for decorative motion and pointer-reactive detail, while phones avoid expensive repaint loops, high-DPR canvas buffers, mouse tracking, and idle audio oscillators. The mobile interface keeps the same content and audit controls; only non-essential effects are simplified. No mobile capability is assumed to be a desktop capability, and `prefers-reduced-motion` uses the static tier as well.

### What keeps the mobile tier light

1. `ParticleField` draws a small network once rather than recalculating every particle and edge each frame.
2. `Waveform` uses a smaller DPR-1 canvas and does not start a requestAnimationFrame loop.
3. `scroll.ts` starts Lenis frames on scroll input and stops when scrolling settles, instead of scheduling frames continuously while idle.
4. `sound.ts` avoids the always-on ambient oscillator/noise layer on mobile and low-power devices.
5. The opening removes the always-repainting waveform and limits pointer/hover animation to capable desktop pointers.

These choices reduce ongoing CPU/GPU work and canvas memory; they do not change the audit report content or remove the website's core functionality.

---

## 11. Layout Composition & Overlay Scrolling

**Composition.** Sections no longer share one template. Each uses a 12-column grid with deliberate asymmetry:

| Section | Composition |
|---|---|
| Hero | Staircase headline (each line indented further), statement pinned top-right, command bar bottom-left, vertical margin note |
| 01 Thesis | Oversized outlined index number in the left margin; statement dropped into the right two-thirds |
| 02 Method | Sticky left column (heading + stat ledger); staggered feature blocks on the right; split-screen SEO vs GEO comparison |
| 03 Emulator | Heading pushed to the right edge; console-style vertical engine list on the left, output pane on the right |
| 04 Signals | Score and heading sticky on the left; ruled checklist (no cards) on the right |
| 05 CTA | Left-aligned oversized headline, rotating button anchored bottom-right, ghost word cropped off the corner |
| Footer | 5 / 6 column split with link columns offset to the right |

The second marquee is tilted −1.6° so it cuts across the page instead of sitting in a straight band.

**Overlay scrolling.** Lenis intercepts every wheel/touch event while the page is locked (`lenis.stop()`), which also blocked scrolling *inside* modals. Scrollable overlays (`DocModal` body, `Analysis`) now carry `data-lenis-prevent`, which Lenis checks before its stopped-state guard, so native scrolling works inside them while the page behind stays locked.

---

## 10. Opening Logo Handoff

The opening captures the logo mark's on-screen rectangle and the navbar mark's destination rectangle. Once the counter completes:

1. The opening mark fades out and the navbar fades in without shifting its layout.
2. `BrandFlight` renders one temporary mark in a separate fixed layer and interpolates its position and size from the captured source to the navbar target.
3. At arrival, the temporary mark is removed and the real navbar mark is revealed, avoiding a duplicate or a jump.

The handoff takes about **0.74 seconds on desktop** and **0.62 seconds on mobile**; reduced-motion preference shortens it. On capable desktop pointers, the opening mark also has a restrained spring parallax and hover response. Mobile skips pointer tracking and continuous orbit motion.

---

*CiteReady Labs — The visibility layer for the answer era.*
