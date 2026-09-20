# Architecture

## Data flow
```
Google Trends -> Ingestion Job -> Supabase (snapshots)
                                  |
                                  v
                              Oracle/API
                                  |
                                  v
                       Ethereum contracts + Web app
```

## Components
- Ingestion job: pulls trends on a schedule and normalizes metrics
- Supabase: stores snapshots and serves read APIs
- Oracle/API: signs and exposes normalized trend data
- Ethereum contracts: consume oracle data and power market logic
- Web app: displays trends, markets, and activity

## Smart Contracts
- TrendToken: ERC20 token for collateral and trading
- TrendOracle: Manages oracle data verification and signatures
- TrendMarket: Handles position opening/closing and PnL calculations
- TrendFi: Basic trend management and metadata

## Backend API
- Oracle service for signing trend data
- Trend data endpoints for frontend consumption
- Leaderboard and analytics endpoints

## Frontend Integration
- Ethereum wallet connection (MetaMask)
- Contract interactions via ethers.js
- Real-time market data and trading interface

## Current focus
- Reliability of ingestion
- Schema stability for trend snapshots
- Read API for overview and historical ranges
- Smart contract deployment and testing
