import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { getSolanaConnection } from "@/lib/solana/connection";
import { fetchOnchainOverview } from "@/lib/solana/overview";

export type OnchainMarketSnapshot = {
  address: string;
  factory: string;
  creator: string;
  bump: number;
  index: number;
  topic: string;
  basePrice: number;
  expiryTs: number;
  momentum: number;
  velocity: number;
  rawScore: number;
  lastUpdated: number;
  settled: boolean;
  settlementPrice: number;
};

export type OnchainOverview = {
  balanceLamports: number;
  balanceSol: number;
  factory?: {
    address: string;
    marketCount: number;
  };
  markets: OnchainMarketSnapshot[];
};

type OnchainOverviewState =
  | {
      status: "idle";
      data: null;
      error: null;
    }
  | {
      status: "loading";
      data: null;
      error: null;
    }
  | {
      status: "ready";
      data: OnchainOverview;
      error: null;
    }
  | {
      status: "error";
      data: null;
      error: string;
    };

export function useOnchainOverview(walletAddress?: string) {
  const useEdge =
    process.env.NEXT_PUBLIC_ONCHAIN_SOURCE === "edge" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const [state, setState] = useState<OnchainOverviewState>({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!walletAddress) {
      setState({ status: "idle", data: null, error: null });
      return;
    }

    let cancelled = false;

    setState({ status: "loading", data: null, error: null });

    if (useEdge) {
      supabaseClient.functions
        .invoke<OnchainOverview>("onchain_overview", {
          body: { walletAddress },
        })
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) {
            setState({ status: "error", data: null, error: error.message });
            return;
          }
          if (!data) {
            setState({ status: "error", data: null, error: "Empty response" });
            return;
          }
          setState({ status: "ready", data, error: null });
        })
        .catch((error) => {
          if (cancelled) return;
          const message = error instanceof Error ? error.message : "Unknown error";
          setState({ status: "error", data: null, error: message });
        });
    } else {
      const connection = getSolanaConnection();
      fetchOnchainOverview(connection, walletAddress)
        .then((data) => {
          if (cancelled) return;
          setState({ status: "ready", data, error: null });
        })
        .catch((error) => {
          if (cancelled) return;
          const message = error instanceof Error ? error.message : "Unknown error";
          setState({ status: "error", data: null, error: message });
        });
    }

    return () => {
      cancelled = true;
    };
  }, [useEdge, walletAddress]);

  return state;
}
