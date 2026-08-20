---
name: "Launchpad"
description: "A white editorial ledger for inspecting and participating in Stellar launches."
colors:
  graphite-ink: "#111318"
  slate-muted: "#586171"
  slate-faint: "#646d7d"
  ledger-line: "#dfe2e8"
  ledger-line-strong: "#cbd0d9"
  paper: "#ffffff"
  paper-soft: "#f5f6f8"
  cobalt-wash: "#edf3ff"
  cobalt-action: "#1455ee"
  cobalt-deep: "#0d3eb8"
  live-mint: "#d9f7e7"
  live-mint-ink: "#12613a"
  upcoming-amber: "#fff0c7"
  upcoming-amber-ink: "#7b4c00"
typography:
  display:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "clamp(54px, 6.2vw, 92px)"
    fontWeight: 480
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "26px"
    fontWeight: 560
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "22px"
    fontWeight: 560
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "10px"
    fontWeight: 750
    lineHeight: 1.5
    letterSpacing: "0.09em"
rounded:
  compact: "6px"
  quiet: "7px"
  control: "10px"
  panel: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  control: "12px"
  md: "16px"
  lg: "24px"
  page: "42px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt-action}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 15px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 15px"
    height: "40px"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.slate-muted}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "40px"
  filter-chip-active:
    backgroundColor: "{colors.cobalt-action}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "9px 12px"
  status-live:
    backgroundColor: "{colors.live-mint}"
    textColor: "{colors.live-mint-ink}"
    rounded: "{rounded.pill}"
    padding: "3px 7px"
  score-chip:
    backgroundColor: "{colors.cobalt-wash}"
    textColor: "{colors.cobalt-deep}"
    rounded: "{rounded.compact}"
    padding: "5px 7px"
  launch-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite-ink}"
    padding: "16px 0"
    height: "130px"
---

# Design System: Launchpad

## Overview

**Creative North Star: "The Public Offering Ledger"**

Launchpad should feel like a public record prepared for inspection: white paper, graphite type, exact data, and hairline rules that make every term easy to audit. Newsreader gives launches editorial consequence, while Manrope keeps amounts, requirements, and controls contemporary and precise. The result is institutional without becoming cold, and financial without borrowing the noise of a trading terminal.

The interface is compact where facts repeat and expansive where orientation matters. Large serif openings establish context; dense rows then disclose status, price, progress, timing, allocation, eligibility, and action in a stable reading order. Cobalt is scarce and purposeful, reserved for action, selection, focus, and live progress. Rounded treatments belong to controls and small status objects, never to large decorative shells.

**Key Characteristics:**

- White editorial canvas with graphite copy and hairline ledger rules.
- Newsreader display type paired with Manrope for body copy and data.
- Cobalt reserved for actions, focus, active state, and meaningful progress.
- Compact, tabular rows in place of card-grid dashboards.
- Restrained rounding, flat depth, and crisp state changes.

## Colors

The palette is a paper-and-ink neutral field with one decisive cobalt voice and pale, readable status washes.

### Primary

- **Cobalt Action:** Use for primary actions, active navigation rules, selected filters, progress fills, focus outlines, and high-signal links.
- **Cobalt Deep:** Use for hover states and readable foreground text on Cobalt Wash.
- **Cobalt Wash:** Use as a quiet background for eligibility, score, selected-setting, and informational affordances.

### Secondary

- **Live Mint / Live Mint Ink:** Pair only for positive live or connected states; never use mint as a generic decorative accent.
- **Upcoming Amber / Upcoming Amber Ink:** Pair for pending and upcoming status where the distinction must remain legible without urgency.

### Neutral

- **Paper:** The universal page and control surface.
- **Graphite Ink:** The default text, strong rule, and icon color.
- **Slate Muted:** Supporting copy, metadata, and inactive navigation.
- **Slate Faint:** Column labels and tertiary annotations that remain readable.
- **Ledger Line / Ledger Line Strong:** Row divisions, section boundaries, field borders, and secondary-control outlines.
- **Paper Soft:** Quiet state fills, icon grounds, and low-emphasis explanatory notes.

### Named Rules

**The One Cobalt Voice Rule.** Cobalt identifies an action, active state, focus target, or live measure; it is not page decoration.

**The Paper Is the Surface Rule.** Keep the product on white; introduce separation with rules and spacing before adding a tinted container.

## Typography

**Display Font:** Newsreader Variable (with Georgia and serif fallbacks)  
**Body Font:** Manrope Variable (with sans-serif fallback)

**Character:** Newsreader makes project names and page openings feel published rather than promoted. Manrope carries interface copy, numerals, and controls with deliberate neutrality; tabular numerals keep repeated values aligned.

### Hierarchy

- **Display:** Fluid, large, tightly led, and lightly weighted; reserve it for the first contextual statement on a surface.
- **Headline:** Editorial section headings and prominent summaries, compact enough to sit beside data.
- **Title:** Project and row titles that need distinction without interrupting scan rhythm.
- **Body:** Direct explanatory copy and control text; introductory paragraphs stay comfortably narrow and use a more generous line height.
- **Label:** Small, bold, tracked, and usually uppercase for table heads, status language, and compact metadata.

### Named Rules

**The Two Registers Rule.** Newsreader carries names, propositions, and summaries; Manrope carries instructions, controls, labels, and facts.

**The Data Must Line Up Rule.** Use tabular numerals wherever amounts, percentages, dates, participant counts, or scores repeat in a row or column.

## Layout

The principal canvas is centered at a maximum width of 1540px with 42px desktop gutters, reducing to 28px below 1180px and 20px below 600px. A 72px masthead uses a three-part grid—wordmark, centered navigation, and account action—before becoming a two-row header below 860px.

Discovery is a ruled ledger. Its desktop directory uses seven stable columns and rows with a 130px minimum height; the participant column drops at intermediate widths, then the ledger becomes a labeled two-column record below 860px and a single-column record below 600px. Other dense surfaces use the same logic: summary strips, settings sections, connection rows, and portfolio activity are grids divided by rules, not collections of floating cards.

Spacing alternates between compact internal rhythms and generous orientation zones. Controls and metadata cluster tightly; page introductions, dashboard column changes, and major section transitions use broad breathing room. Responsive changes preserve information order and move actions below their data rather than compressing text past readability.

**The Row Before Card Rule.** When several objects share comparable facts, use aligned rows and dividing rules before considering a card grid.

## Elevation & Depth

The system is flat by default and uses no resting shadow on content surfaces, navigation, rows, or standard controls. Depth comes from strong and soft rules, white-to-soft tonal shifts, and occasional inset grouping. Shadows are reserved for the transient toast and the physical thumb of a toggle; focus uses a cobalt outline or halo rather than elevation.

### Shadow Vocabulary

- **Toast Overlay:** A broad, low-opacity shadow separates temporary feedback from the ledger beneath it.
- **Toggle Thumb:** A compact shadow makes the movable thumb legible against its track.

### Named Rules

**The Flat Ledger Rule.** Never use a shadow to make ordinary content look important; use hierarchy, rules, and spacing.

## Shapes

