import { supabaseAdmin } from "../_shared/supabaseClient.ts";

type TrendSnapshotInput = {
  topic: string;
  momentum: number;
  raw_score: number;
  velocity: number;
  region: string;
  timestamp?: string;
  payload?: Record<string, unknown>;
};

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeSnapshot(input: TrendSnapshotInput): TrendSnapshotInput {
  return {
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString(),
    payload: input.payload ?? {},
  };
}

function validateSnapshot(input: TrendSnapshotInput): string | null {
  if (!input.topic?.trim()) return "topic is required";
  if (!isNumber(input.momentum)) return "momentum must be a number";
  if (!isNumber(input.raw_score)) return "raw_score must be a number";
  if (!isNumber(input.velocity)) return "velocity must be a number";
  if (!input.region?.trim()) return "region is required";
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: TrendSnapshotInput | TrendSnapshotInput[];
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const snapshots = Array.isArray(body) ? body : [body];
  for (const snapshot of snapshots) {
    const error = validateSnapshot(snapshot);
    if (error) {
      return Response.json({ error }, { status: 400 });
    }
  }

  const rows = snapshots.map(normalizeSnapshot);
  const { error } = await supabaseAdmin
    .from("trend_snapshots")
    .insert(rows);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ inserted: rows.length }, { status: 200 });
});
