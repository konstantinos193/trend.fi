# Architecture

## Data flow
```
Google Trends -> Ingestion Job -> Supabase (snapshots)
                                  |
                                  v
                              Oracle/API
                                  |
                                  v
                       Solana programs + Web app
```

## Components
- Ingestion job: pulls trends on a schedule and normalizes metrics
- Supabase: stores snapshots and serves read APIs
- Oracle/API: signs and exposes normalized trend data
- Solana programs: consume oracle data and power market logic
- Web app: displays trends, markets, and activity

## Current focus
- Reliability of ingestion
- Schema stability for trend snapshots
- Read API for overview and historical ranges
