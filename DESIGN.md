---
name: Mental Math Bowl Practice
description: A paper-first practice desk for competition mental math, grades 1 to 5.
colors:
  paper: "oklch(99% 0.008 82)"
  surface-muted: "oklch(96% 0.012 82)"
  bg-tint: "oklch(93% 0.02 82)"
  border: "oklch(84% 0.018 82)"
  border-strong: "oklch(67% 0.025 78)"
  text: "oklch(23% 0.026 58)"
  text-muted: "oklch(45% 0.022 64)"
  competition-red: "oklch(49% 0.17 28)"
  competition-red-strong: "oklch(38% 0.15 28)"
  pencil-gold: "oklch(57% 0.105 78)"
  on-primary: "oklch(98% 0.012 82)"
  success: "oklch(43% 0.12 150)"
  danger: "oklch(48% 0.16 28)"
  grade-1-gold: "oklch(76% 0.11 76)"
  grade-2-green: "oklch(69% 0.105 142)"
  grade-3-blue: "oklch(69% 0.09 205)"
  grade-4-purple: "oklch(70% 0.09 285)"
  grade-5-magenta: "oklch(70% 0.105 345)"
typography:
  display:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.25rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.018em"
  headline:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.55rem, 3vw, 2.2rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.018em"
  body:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Satoshi, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
  math:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, monospace"
    fontSize: "1.18rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  window: "22px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.competition-red}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "18px 28px"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: "0 13px"
  rail-link-active:
    backgroundColor: "oklch(92% 0.038 30)"
    textColor: "{colors.competition-red-strong}"
    rounded: "{rounded.md}"
    padding: "11px 14px"
  answer-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    typography: "{typography.math}"
    width: "92px"
    padding: "12px"
  grade-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "108px"
---

# Design System: Mental Math Bowl Practice

## 1. Overview

**Creative North Star: "The Competition Desk"**

This is the surface of a quiet desk the morning of a meet: ruled paper warmed by lamp light, a pencil that writes in clean monospace, a small trophy in the corner, and red ink held back for the moments that actually count. The whole system is paper-first. The background is a faint grid like graph paper, content sits on warm off-white sheets, and the competition red appears only on the active path: the live nav item, the score, a problem number, the button you press to commit an answer. Nothing on the screen competes for attention with the math.

The personality is encouraging and focused, never babyish and never corporate. It rejects the things PRODUCT.md names as enemies: babyish classroom clip-art, sterile enterprise dashboards, flashy arcade treatment, generic AI-tutor gloss, and flat card grids where every tile carries equal weight. Density is calm and scannable for repeated daily use; a student should be able to glance at a sheet and know the next action without reading instructions. Light is the default because the scene is a desk under ordinary daytime or lamp light; a warm-tinted dark mode exists for evening practice, but it is a response to the room, not a style flex.

Color does the heavy lifting of meaning without raising its voice. The grade levels each own one support hue (gold, green, blue, purple, magenta) so a returning student reads "I'm in Grade 3" from the blue underline before reading the word. Correctness speaks in green and red plus an icon and position, never color alone.

**Key Characteristics:**
- Paper-first: warm off-white sheets on a faint graph-paper field, framed in one elevated window with a left rail.
- Red is rare and earned; it marks the active path and the act of committing, nothing decorative.
- Two type voices only: Satoshi for everything human, JetBrains Mono for everything numeric.
- Grade identity carried by a single support hue per level.
- Calm, exam-ruled components: thin warm borders, generous internal air, motion limited to a 1px lift on hover.

## 2. Colors

A warm, paper-toned neutral field (hues 58 to 88) with a single saturated competition red, a muted pencil gold for supporting actions, and five grade-identity hues used only as level markers.

### Primary
- **Competition Red** (`oklch(49% 0.17 28)`): The accent and the act of committing. Live nav item, the active grade pill, problem numbers, the score figure, and the primary "Check My Answers" button. Used sparingly by doctrine, see the One-Round Rule.
- **Competition Red Strong** (`oklch(38% 0.15 28)`): Text-on-paper weight of the accent, used for active rail-link labels, eyebrow kickers, and the "Look for / Try first" tip labels where red sits directly on a light surface and needs contrast.

### Secondary
- **Pencil Gold** (`oklch(57% 0.105 78)`): The supporting-action warm. "Study Winning Tricks" pill, worksheet/answer-key indicators, the gentle highlight that is friendly without being loud. Never competes with the red.

### Tertiary (grade identity)
- **Grade 1 Gold** (`oklch(76% 0.11 76)`), **Grade 2 Green** (`oklch(69% 0.105 142)`), **Grade 3 Blue** (`oklch(69% 0.09 205)`), **Grade 4 Purple** (`oklch(70% 0.09 285)`), **Grade 5 Magenta** (`oklch(70% 0.105 345)`): One hue per grade, worn as a short underline bar on grade cards. Identity markers only; never used for status, text, or fills.

### Neutral
- **Paper** (`oklch(99% 0.008 82)`): The primary writing surface for cards, sheets, inputs, and the canvas.
- **Surface Muted** (`oklch(96% 0.012 82)`): Recessed panels, the tip card, the rail field, the timer bar.
- **Border** (`oklch(84% 0.018 82)`): Hairline dividers inside the worksheet grid and between list rows.
- **Border Strong** (`oklch(67% 0.025 78)`): The structural stroke on cards, inputs, the window frame, and ghost buttons.
- **Text** (`oklch(23% 0.026 58)`) / **Text Muted** (`oklch(45% 0.022 64)`): Primary reading ink and secondary captions, both tinted warm so nothing reads as cold gray.

### Named Rules
**The One-Round Rule.** Competition red covers no more than roughly 10% of any screen. It belongs to the live path and the commit action. If two red elements compete on one screen, one of them is decoration and must be demoted to neutral or pencil gold.

**The Grade-Hue Rule.** The five grade colors are identity, not status. They appear only as the grade-card underline. Never recolor a button, score, or alert with a grade hue.

## 3. Typography

**Display / UI Font:** Satoshi (Fontshare), with `ui-sans-serif, system-ui, sans-serif` fallback.
**Math / Worksheet Font:** JetBrains Mono (Google Fonts), with `ui-monospace, SF Mono, monospace` fallback.

**Character:** Two voices, cleanly split by meaning. Satoshi is a humanist sans that stays warm and confident at black weight without turning playful; it carries all human language. JetBrains Mono carries every number and expression because its unambiguous digits and balanced spacing make `1 / l / I` and `0 / O` impossible to confuse and let columns of problems align like a worksheet. The split is the system: if it is words, it is Satoshi; if it is math, it is mono.

### Hierarchy
- **Display** (Satoshi 900, `clamp(2.25rem, 5vw, 3.25rem)`, line-height 1, tracking -0.018em): The single page hero, e.g. "Math Bowl Practice."
- **Headline** (Satoshi 700, `clamp(1.55rem, 3vw, 2.2rem)`, line-height 1.08): Screen titles like a grade name or problem-type name.
- **Body** (Satoshi 400, ~1.05rem, line-height 1.55): Instructions and descriptions. Cap measure at 62ch.
- **Label / Eyebrow** (Satoshi 800, 0.78rem, tracking 0.08em, uppercase): Kickers ("MENTAL MATH BOWL PREP"), the "TODAY'S TIP" eyebrow, rail and section micro-labels.
- **Math** (JetBrains Mono 400, ~1.18rem, tabular-nums): Problem expressions, answer inputs, worksheet numbers, score figures.

### Named Rules
**The Two-Voice Rule.** Exactly two families ship. Words are Satoshi, numbers are JetBrains Mono. No third display face, no script, no Comic Sans lineage; the babyish classroom font is explicitly forbidden.

## 4. Elevation

A near-flat, paper system. Depth comes from one elevated window frame, thin warm borders, and tonal layering (paper over surface-muted over the graph-paper field), not from stacked shadows. The whole app lives inside a single soft-shadowed window; everything else inside it is delineated by 1px borders and background tint. Motion-wise, surfaces are flat at rest and lift exactly 1px on hover.

### Shadow Vocabulary
- **Hairline** (`box-shadow: 0 1px 0 oklch(24% 0.02 58 / 0.08)`): The resting whisper under cards, inputs, and buttons. Barely there.
- **Hover** (`box-shadow: 0 10px 24px oklch(24% 0.02 58 / 0.1)`): Appears only on hover, paired with a 1px upward translate.
- **Window** (`box-shadow: 0 24px 60px oklch(24% 0.02 58 / 0.14)`): Reserved for the single app shell that frames the whole experience.

### Named Rules
**The Flat-Desk Rule.** Surfaces are flat at rest. A shadow larger than the hairline is a response to state (hover, the app window), never a default decoration. If a card has a drop shadow sitting idle, delete it and use a border.

## 5. Components

### Buttons
- **Shape:** Gently rounded (8px for the primary CTA, 12px for ghost and utility buttons).
- **Primary (commit):** Solid Competition Red fill, Paper text, padding 18px 28px. This is the "Check My Answers / Submit Early" action and the heaviest red on any screen.
- **Ghost (utility, e.g. Print):** Paper background, Border Strong stroke, Text Muted label with an inline printer SVG. On hover the label and border shift to Competition Red Strong. Quiet by default so a column of them does not read as a wall of red.
- **Hover / Focus:** 1px upward translate plus the Hover shadow; focus-visible shows a 3px red focus ring (`0 0 0 3px oklch(49% 0.17 28 / 0.22)`).

### Chips
- **Category chip** (Surprise Me rows): Soft red-tinted pill, Competition Red Strong text, small uppercase. Sits stacked above the expression, never inline crowding the math.
- **Grade pill / nav state:** Active state uses a soft red fill (`oklch(92% 0.038 30)`) with a soft red border and red-strong label.

### Cards / Containers
- **Corner Style:** 12px (cards), 18px (the worksheet panel), 22px (the app window).
- **Background:** Paper, on the graph-paper canvas.
- **Shadow Strategy:** Hairline at rest, Hover on hover (see Elevation). Never idle drop shadows.
- **Border:** 1px Border Strong is the default frame.
- **Internal Padding:** 16 to 18px for cards; 13 to 18px per cell in the worksheet grid.
- **Grade card signature:** A short rounded underline bar (6px tall) in that grade's hue, anchored to the bottom of the card.

### Inputs / Fields
- **Style:** Paper background, 2px Border Strong stroke, 8px radius, JetBrains Mono value, tabular-nums, centered. ~92px wide for a single answer.
- **Focus:** Border shifts to Competition Red plus the red focus ring. No glow, no scale.

### Navigation (left rail)
- **Style:** A persistent vertical rail inside the window: trophy mark over a stacked "Mental Math Bowl" wordmark, then Practice / Results / Worksheets links, and a "Practice. Focus. Be ready." footer pinned to the bottom.
- **States:** Links are Text Muted ghost rows; hover fills Paper and darkens to Text; the active link takes the soft-red pill with red-strong label and `aria-current="page"`. Disabled links (Results before a round exists) drop to 45% opacity with a tooltip.
- **Mobile:** The rail collapses to a horizontal top bar; labels hide to icon-only, the wordmark hides below 480px, the footer hides.

### Two-Column Worksheet Grid (signature component)
The quiz renders ten problems in one bordered panel split into two columns by a vertical hairline, filled column-major (1 to 5 left, 6 to 10 right) so it reads like a printed practice sheet. Each row is `number . expression input`. In Surprise Me mode a category chip stacks above the expression so the math keeps full width. Collapses to a single column at 720px.

## 6. Do's and Don'ts

### Do:
- **Do** keep Competition Red under ~10% of the screen; spend it on the live path and the commit button (the One-Round Rule).
- **Do** set every number, expression, input, and score in JetBrains Mono, and every word in Satoshi (the Two-Voice Rule).
- **Do** carry grade identity with the single underline hue per grade, and nowhere else (the Grade-Hue Rule).
- **Do** frame surfaces with 1px Border Strong and tonal layering; reserve real shadow for hover and the app window (the Flat-Desk Rule).
- **Do** pair every correct/incorrect signal with an icon and position, never color alone (WCAG AA, color-blind safe).
- **Do** tint every neutral warm (hue 58 to 88); there is no cold gray and no pure black or white in this system.

### Don't:
- **Don't** reintroduce babyish classroom visuals or a Comic Sans / Comic Neue lineage font. The math font is JetBrains Mono, the UI font is Satoshi, full stop.
- **Don't** let the interface drift toward a sterile enterprise dashboard, flashy arcade treatment, or generic AI-tutor gloss (PRODUCT.md anti-references).
- **Don't** build flat card grids where every tile has equal weight and decoration. Hierarchy first.
- **Don't** use a border-left or border-right thicker than 1px as a colored accent stripe; use a full border, a background tint, or the grade underline instead.
- **Don't** add idle drop shadows, gradient text, or decorative glassmorphism.
- **Don't** spend the grade hues or pencil gold on status meaning; status is green/red plus icon.
- **Don't** add a third type family or stack red on red until the screen feels loud.
