# TrendFi

Trading real-world trends on Solana. Turning internet attention into on-chain markets.

## Overview
TrendFi turns live trend data into on-chain market signals. The pipeline ingests real-world attention, normalizes it, and exposes it to the app and on-chain programs.

## Architecture (high level)
```
Google Trends -> Ingestion Job -> Supabase (snapshots)
                                  |
                                  v
                              Oracle/API
                                  |
                                  v
                       Solana programs + Web app
```

## MVP goals
- Ingest Google Trends snapshots on a schedule
- Store trend snapshots in Supabase
- Expose a read API for current + historical trend data
- Simple UI that displays top trends and a mock market

## This week
- Trend ingestion pipeline
- Snapshot schema + migrations
- API endpoint for overview
- UI mock with fake data

## Repo structure
- `frontend/` - Next.js web app
- `smartcontracts/` - Solana programs (Anchor)
- `supabase/` - DB, edge functions, and migrations
- `docs/` - Architecture and planning docs

## Local dev
### Frontend
```
cd frontend
cp env.example .env.local
# Windows: copy env.example .env.local
yarn install
yarn dev
```

### Supabase
```
cd supabase
supabase start
```

## Status
Early build. Shipping in public.
