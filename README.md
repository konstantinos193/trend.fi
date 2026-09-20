# TrendFi

Trading real-world trends on Ethereum. Turning internet attention into on-chain markets.

## Overview
TrendFi turns live trend data into on-chain market signals. The pipeline ingests real-world attention, normalizes it, and exposes it to the app and smart contracts.

## Problem + opportunity
Markets price assets, but attention moves first. TrendFi makes attention measurable and tradeable by turning live trend signals into on-chain data that can power markets, analytics, and new financial primitives.

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
                       Ethereum contracts + Web app
```

## Smart Contracts
- **TrendToken**: ERC20 token for collateral and trading
- **TrendOracle**: Manages oracle data verification and signatures
- **TrendMarket**: Handles position opening/closing and PnL calculations
- **TrendFi**: Basic trend management and metadata

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

## Screenshots
Coming soon. The initial UI mock and data ingestion preview will be added here.

## MVP goals
- Ingest Google Trends snapshots on a schedule
- Store trend snapshots in Supabase
- Expose a read API for current + historical trend data
- Deploy Ethereum smart contracts
- Simple UI that displays top trends and trading interface

## This week
- Trend ingestion pipeline
- Snapshot schema + migrations
- API endpoint for overview
- Smart contract deployment
- UI mock with real data

## Repo structure
- `frontend/` - Next.js web app with Ethereum integration
- `smartcontracts/` - Ethereum smart contracts (Hardhat)
- `backend/` - Node.js API server for oracle functionality
- `supabase/` - DB, edge functions, and migrations
- `docs/` - Architecture and planning docs

## Quickstart
### 1) Clone
```
git clone https://github.com/konstantinos193/trend.fi.git
cd trend.fi
```

### 2) Smart Contracts
```bash
cd smartcontracts
npm install
npx hardhat compile
npx hardhat node  # In separate terminal
npx hardhat run scripts/deploy-all.js --network localhost
```

### 3) Backend
```bash
cd backend
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

### 4) Frontend
```bash
cd frontend
cp env.example .env.local
# Windows: copy env.example .env.local
npm install
npm dev
```

### 5) Supabase
```bash
cd supabase
supabase start
```

## Environment Variables
### Backend (.env)
```
PORT=3001
ORACLE_PRIVATE_KEY=your_oracle_private_key_here
RPC_URL=http://localhost:8545
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_TREND_TOKEN_ADDRESS=deployed_token_address
NEXT_PUBLIC_TREND_ORACLE_ADDRESS=deployed_oracle_address
NEXT_PUBLIC_TREND_MARKET_ADDRESS=deployed_market_address
NEXT_PUBLIC_TREND_FI_ADDRESS=deployed_trendfi_address
```

## Roadmap
See `ROADMAP.md`.

## Status
Ethereum migration complete. Smart contracts deployed, backend API functional, frontend integration ready.

## Contact
Built by Konstantinos — GitHub: https://github.com/konstantinos193
