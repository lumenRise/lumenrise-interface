# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- People exploring and participating in Stellar-native token launches, including fixed-price sales, community rounds, and auctions.
- Stellar project teams configuring launches, eligibility policies, allocations, vesting, campaigns, and on-chain distribution.
- Stellar developers consuming reusable reputation signals through an API, SDK, CLI, or Soroban contracts.

## Product Purpose

Create a reusable identity and reputation layer for Stellar and demonstrate it through a launch platform. Visitors can browse without an account; actions that move funds or join a launch require authentication. After login, people can optionally connect public social and developer identities to strengthen an explainable, multidimensional reputation profile.

## Positioning

The product combines user-controlled identity connections, transparent reputation signals, and Soroban-verifiable eligibility policies with a launch application that uses those primitives directly. It is infrastructure for other Stellar applications as well as an end-user launch destination.

## Operating Context

The participant journey is: discover a project, inspect its permanent project page, build reputation when needed, participate or bid, receive an allocation, claim, access available Stellar liquidity, and track activity in a portfolio.

The project journey is: create a project, configure a launch and reputation rules, deploy Soroban contracts, create campaigns, raise, distribute, and maintain a permanent project page.

## Capabilities and Constraints

- Public browsing requires no login.
- Deposits, token purchases, auction bids, claims, and other participation actions require Blux authentication.
- Blux supplies the wallet and social login flow and yields a Stellar G-address for the authenticated user.
- X is the user's public social profile. GitHub and GitLab contribute a developer signal. If one of those providers is the login method, its optional connection step is already complete.
- Optional account connections may be skipped and managed later in Settings.
- The current frontend prototype may simulate post-login OAuth connections and scores because production OAuth linking requires backend support.
- Reputation is category-based and explainable, not a single opaque investment rating.
- External identity connections are optional and user-controlled.
- The platform does not provide investment recommendations, predict prices, or promise returns.
- Launch and reputation values in the current frontend are illustrative mock data, not factual performance claims.
- The product uses React, TypeScript, Vite, and `@bluxcc/react`.

## Brand Commitments

- Product working name: Launchpad.
- The interface is minimal and uses a white background throughout.
- Copy should be direct, factual, and transparent about eligibility, contracts, and illustrative data.

## Evidence on Hand

- Product and infrastructure brief: `/Users/matin/.codex/attachments/acee568d-f307-4e94-9f86-01b32d78c4ad/Pasted text.txt`.
- Page map and end-to-end user flows: `/Users/matin/.codex/attachments/cd080b00-59c2-4bbc-a463-74e279a4fef0/Pasted text.txt`.
- No production project logos, token data, testimonials, audits, or metrics were supplied; the interface must label authored content as illustrative.

## Product Principles

- Let anyone investigate before asking them to authenticate.
- Ask for identity only at the point of meaningful participation.
- Make reputation legible by showing the signals and requirements behind it.
- Keep optional identity connections genuinely optional and reversible.
- Present factual project data without implying financial endorsement.

## Accessibility & Inclusion

The web interface must remain keyboard navigable, use visible focus states, preserve readable contrast, and support reduced motion. Authentication and participation states must not rely on color alone.
