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
