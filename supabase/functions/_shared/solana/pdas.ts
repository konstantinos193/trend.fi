import { PublicKey } from "https://esm.sh/@solana/web3.js@1.98.4?target=deno";
import {
  TREND_FACTORY_PROGRAM_ID,
  TREND_ORACLE_PROGRAM_ID,
  TREND_TRADING_PROGRAM_ID,
} from "./config.ts";

const textEncoder = new TextEncoder();

function toU64LE(value: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(value), true);
  return new Uint8Array(buffer);
}

export function getFactoryPda() {
  return PublicKey.findProgramAddressSync(
    [textEncoder.encode("factory")],
    new PublicKey(TREND_FACTORY_PROGRAM_ID),
  );
}

export function getMarketPda(factory: PublicKey, index: number) {
  return PublicKey.findProgramAddressSync(
    [textEncoder.encode("market"), factory.toBuffer(), toU64LE(index)],
    new PublicKey(TREND_FACTORY_PROGRAM_ID),
  );
}

export function getOraclePda() {
  return PublicKey.findProgramAddressSync(
    [textEncoder.encode("oracle")],
    new PublicKey(TREND_ORACLE_PROGRAM_ID),
  );
}

export function getOracleFeedPda(market: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [textEncoder.encode("feed"), market.toBuffer()],
    new PublicKey(TREND_ORACLE_PROGRAM_ID),
  );
}

export function getVaultPda(market: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [textEncoder.encode("vault"), market.toBuffer()],
    new PublicKey(TREND_TRADING_PROGRAM_ID),
  );
}

export function getPositionPda(market: PublicKey, trader: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [textEncoder.encode("position"), market.toBuffer(), trader.toBuffer()],
    new PublicKey(TREND_TRADING_PROGRAM_ID),
  );
}
