delete from public.trend_snapshots
where payload->>'source' = 'seed';
