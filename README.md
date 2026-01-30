# TrendFi

Trading real-world trends on Solana. Turning internet attention into on-chain markets.

## Overview
TrendFi turns live trend data into on-chain market signals. The pipeline ingests real-world attention, normalizes it, and exposes it to the app and on-chain programs.

## Why this matters
Attention moves markets before prices do. TrendFi makes attention measurable and tradeable by turning live trend signals into on-chain data that can power markets, analytics, and new financial primitives.

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

## Example output
Sample snapshot payload from the ingestion pipeline:
```
{
  "topic": "ai agents",
  "score": 78,
  "momentum": 1.42,
  "velocity_24h": 0.31,
  "timestamp": "2026-01-30T10:45:00Z"
}
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

## Quickstart
### 1) Clone
```
git clone https://github.com/konstantinos193/trend.fi.git
cd trend.fi
```

### 2) Frontend
```
cd frontend
cp env.example .env.local
# Windows: copy env.example .env.local
yarn install
yarn dev
```

### 3) Supabase
```
cd supabase
supabase start
```

## Roadmap
See `ROADMAP.md`.

## Status
Early build. Shipping in public.

## Contact
Built by Konstantinos — GitHub: https://github.com/konstantinos193
