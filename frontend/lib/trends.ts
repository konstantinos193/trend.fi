import { supabaseClient } from "./supabaseClient";

export interface TrendSnapshot {
  topic: string;
  momentum: number;
  raw_score: number;
  velocity: number;
  region: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export async function getLatestTrends(limit = 12): Promise<TrendSnapshot[]> {
  const { data, error } = await supabaseClient
    .from("trend_snapshots")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to load trends", error);
    return [];
  }

  return (data ?? []) as TrendSnapshot[];
}

export async function getTrendByTopic(topic: string): Promise<TrendSnapshot | null> {
  const normalizedTopic = normalizeTopic(topic);
  const tokens = normalizedTopic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);

  const exact = await supabaseClient
    .from("trend_snapshots")
    .select("*")
    .eq("topic", topic)
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (exact.error) {
    console.error("Failed to load trend by topic", exact.error);
    return null;
  }

  if (exact.data) {
    return exact.data as TrendSnapshot;
  }

  const normalized = await supabaseClient
    .from("trend_snapshots")
    .select("*")
    .ilike("topic", normalizedTopic)
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (normalized.error) {
    console.error("Failed to load trend by topic (normalized)", normalized.error);
    return null;
  }

  if (normalized.data) {
    return normalized.data as TrendSnapshot;
  }

  if (tokens.length > 0) {
    let tokenQuery = supabaseClient
      .from("trend_snapshots")
      .select("*");

    tokens.forEach((token) => {
      tokenQuery = tokenQuery.ilike("topic", `%${token}%`);
    });

    const tokenMatch = await tokenQuery
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenMatch.error) {
      console.error("Failed to load trend by topic (tokens)", tokenMatch.error);
      return null;
    }

    if (tokenMatch.data) {
      return tokenMatch.data as TrendSnapshot;
    }
  }

  const fuzzy = await supabaseClient
    .from("trend_snapshots")
    .select("*")
    .ilike("topic", `%${normalizedTopic}%`)
    .order("timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fuzzy.error) {
    console.error("Failed to load trend by topic (fuzzy)", fuzzy.error);
    return null;
  }

  return (fuzzy.data ?? null) as TrendSnapshot | null;
}

function normalizeTopic(topic: string): string {
  return topic.replace(/\s+/g, " ").trim();
}