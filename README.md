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
