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
