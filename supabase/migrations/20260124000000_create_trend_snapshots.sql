create table if not exists public.trend_snapshots (
  id bigserial primary key,
  topic text not null,
  momentum double precision not null,
  raw_score double precision not null,
  velocity double precision not null,
  region text not null,
  "timestamp" timestamptz not null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists trend_snapshots_timestamp_idx
  on public.trend_snapshots ("timestamp" desc);
