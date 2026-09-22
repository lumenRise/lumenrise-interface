# Launchpad interface

A routed React prototype for Stellar reputation and launch infrastructure. Visitors can browse illustrative launches without an account; participation actions open Blux authentication and send authenticated users through an optional identity setup before they continue.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Create a project in the Blux dashboard and set `VITE_BLUX_APP_ID` in `.env.local`. Without a valid app ID, the interface remains browsable and Blux correctly reports that authentication is unavailable.

## Included flows

- Public Discover directory with launch filters, search, eligibility, raise progress, and gated participation actions.
- Blux wallet, email, passkey, X, GitHub, and GitLab login configuration on Stellar Testnet.
- Optional post-login X/GitHub/GitLab setup with illustrative local reputation signals.
- Signed-in portfolio panel and connection/privacy settings.
- Routed coming-soon states for reputation, missions, project pages, auctions, campaigns, explorer, developer platform, launch creation, and CLI/agent tooling.

Identity-linking buttons outside the Blux login flow are intentionally frontend-only until a backend OAuth linking service is connected. All launch, portfolio, and score values are illustrative.

## Checks

```bash
npm run build
npm run lint
```
