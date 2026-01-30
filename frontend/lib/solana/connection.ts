import { Connection } from "@solana/web3.js";
import { SOLANA_RPC_URL } from "./config";

let cachedConnection: Connection | null = null;

export function getSolanaConnection() {
  if (!cachedConnection) {
    cachedConnection = new Connection(SOLANA_RPC_URL, "confirmed");
  }
  return cachedConnection;
}
