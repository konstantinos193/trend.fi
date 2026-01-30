import { deserialize } from "https://esm.sh/borsh@2.0.0?target=deno";
import type { Schema } from "https://esm.sh/borsh@2.0.0?target=deno";
import { PublicKey } from "https://esm.sh/@solana/web3.js@1.98.4?target=deno";

const marketFactorySchema: Schema = {
  struct: {
    authority: { array: { type: "u8", len: 32 } },
    bump: "u8",
    market_count: "u64",
  },
};

const trendMarketSchema: Schema = {
  struct: {
    factory: { array: { type: "u8", len: 32 } },
    creator: { array: { type: "u8", len: 32 } },
    bump: "u8",
    index: "u64",
    topic: "string",
    base_price: "u64",
    expiry_ts: "i64",
    momentum: "i64",
    velocity: "i64",
    raw_score: "u64",
    last_updated: "i64",
    settled: "u8",
    settlement_price: "u64",
  },
};

export type MarketFactory = {
  authority: string;
  bump: number;
  marketCount: number;
};

export type TrendMarket = {
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

function stripDiscriminator(data: Uint8Array) {
  if (data.length < 9) {
    throw new Error("Account data too short to contain discriminator.");
  }
  return data.subarray(8);
}

function toNumber(value: number | bigint, label: string) {
  const numberValue = typeof value === "bigint" ? Number(value) : value;
  if (!Number.isSafeInteger(numberValue)) {
    throw new Error(`Value overflow for ${label}`);
  }
  return numberValue;
}

export function decodeMarketFactory(data: Uint8Array): MarketFactory {
  const decoded = deserialize(marketFactorySchema, stripDiscriminator(data)) as {
    authority: Uint8Array;
    bump: number;
    market_count: number | bigint;
  };

  return {
    authority: new PublicKey(decoded.authority).toBase58(),
    bump: decoded.bump,
    marketCount: toNumber(decoded.market_count, "market_count"),
  };
}

export function decodeTrendMarket(data: Uint8Array): TrendMarket {
  const decoded = deserialize(trendMarketSchema, stripDiscriminator(data)) as {
    factory: Uint8Array;
    creator: Uint8Array;
    bump: number;
    index: number | bigint;
    topic: string;
    base_price: number | bigint;
    expiry_ts: number | bigint;
    momentum: number | bigint;
    velocity: number | bigint;
    raw_score: number | bigint;
    last_updated: number | bigint;
    settled: number;
    settlement_price: number | bigint;
  };

  return {
    factory: new PublicKey(decoded.factory).toBase58(),
    creator: new PublicKey(decoded.creator).toBase58(),
    bump: decoded.bump,
    index: toNumber(decoded.index, "index"),
    topic: decoded.topic,
    basePrice: toNumber(decoded.base_price, "base_price"),
    expiryTs: toNumber(decoded.expiry_ts, "expiry_ts"),
    momentum: toNumber(decoded.momentum, "momentum"),
    velocity: toNumber(decoded.velocity, "velocity"),
    rawScore: toNumber(decoded.raw_score, "raw_score"),
    lastUpdated: toNumber(decoded.last_updated, "last_updated"),
    settled: decoded.settled === 1,
    settlementPrice: toNumber(decoded.settlement_price, "settlement_price"),
  };
}
