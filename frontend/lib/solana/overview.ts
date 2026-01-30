import { Connection, PublicKey } from "@solana/web3.js";
import { decodeMarketFactory, decodeTrendMarket, TrendMarket } from "./accounts";
import { getFactoryPda, getMarketPda } from "./pdas";

export type OnchainMarketSnapshot = TrendMarket & {
  address: string;
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

const MAX_MARKETS = 5;

export async function fetchOnchainOverview(
  connection: Connection,
  walletAddress: string,
  limit = MAX_MARKETS,
): Promise<OnchainOverview> {
  const walletKey = new PublicKey(walletAddress);
  const balanceLamports = await connection.getBalance(walletKey);

  const [factoryAddress] = getFactoryPda();
  const factoryInfo = await connection.getAccountInfo(factoryAddress);

  if (!factoryInfo) {
    return {
      balanceLamports,
      balanceSol: balanceLamports / 1e9,
      markets: [],
    };
  }

  const factory = decodeMarketFactory(factoryInfo.data);
  const marketCount = factory.marketCount;
  const marketFetchCount = Math.min(Math.max(limit, 0), marketCount);
  const startIndex = Math.max(0, marketCount - marketFetchCount);

  const marketPromises: Promise<OnchainMarketSnapshot | null>[] = [];
  for (let index = startIndex; index < marketCount; index += 1) {
    const [marketAddress] = getMarketPda(factoryAddress, index);
    marketPromises.push(
      connection.getAccountInfo(marketAddress).then((account) => {
        if (!account) return null;
        const market = decodeTrendMarket(account.data);
        return {
          address: marketAddress.toBase58(),
          ...market,
        };
      }),
    );
  }

  const markets = (await Promise.all(marketPromises)).filter(
    (market): market is OnchainMarketSnapshot => market !== null,
  );

  return {
    balanceLamports,
    balanceSol: balanceLamports / 1e9,
    factory: {
      address: factoryAddress.toBase58(),
      marketCount,
    },
    markets,
  };
}
