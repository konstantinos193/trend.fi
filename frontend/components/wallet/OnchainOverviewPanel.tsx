"use client";

import { useMemo } from "react";
import { usePhantom } from "@phantom/react-sdk";
import { useOnchainOverview } from "@/lib/solana/useOnchainOverview";
import { useSolanaAddress } from "@/lib/solana/useSolanaAddress";

const solFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export default function OnchainOverviewPanel() {
  const { isConnected } = usePhantom();
  const addressState = useSolanaAddress();
  const walletAddress = addressState.address;
  const overview = useOnchainOverview(walletAddress);

  const balanceText = useMemo(() => {
    if (!overview.data) return "--";
    return `${solFormatter.format(overview.data.balanceSol)} SOL`;
  }, [overview.data]);

  return (
    <section id="onchain" className="dash-card animate-in delay-2">
      <div className="dash-card__header">
        <div>
          <h2 className="dash-card__title">On-chain Overview</h2>
          <p className="dash-card__subtitle">Live data from localnet programs</p>
        </div>
        <span className="small-badge">Localnet</span>
      </div>

      {!isConnected && (
        <p className="text-sm text-slate-500">
          Connect your wallet to load on-chain balances and market data.
        </p>
      )}

      {isConnected && addressState.status === "loading" && (
        <p className="text-sm text-slate-500">Resolving wallet address...</p>
      )}

      {isConnected && addressState.status === "error" && (
        <p className="text-sm text-rose-400">
          Unable to load wallet address: {addressState.error}
        </p>
      )}

      {isConnected &&
        addressState.status === "ready" &&
        overview.status === "loading" && (
          <p className="text-sm text-slate-500">Loading on-chain data...</p>
        )}

      {isConnected && addressState.status === "ready" && overview.status === "error" && (
        <p className="text-sm text-rose-400">
          Unable to load on-chain data: {overview.error}
        </p>
      )}

      {isConnected &&
        addressState.status === "ready" &&
        overview.status === "ready" &&
        overview.data && (
        <>
          <div className="token-metrics">
            <div className="token-metric">
              <span className="token-metric__label">Wallet Balance</span>
              <span className="token-metric__value is-up">{balanceText}</span>
            </div>
            <div className="token-metric">
              <span className="token-metric__label">Factory Markets</span>
              <span className="token-metric__value">
                {overview.data.factory?.marketCount ?? "Not initialized"}
              </span>
            </div>
            <div className="token-metric">
              <span className="token-metric__label">Factory Address</span>
              <span className="token-metric__value">
                {overview.data.factory?.address
                  ? formatAddress(overview.data.factory.address)
                  : "--"}
              </span>
            </div>
          </div>

          <div className="wallet-onchain__markets">
            <h3 className="text-sm font-semibold text-slate-200">Latest markets</h3>
            {overview.data.markets.length === 0 ? (
              <p className="text-sm text-slate-500">
                No markets found on-chain yet.
              </p>
            ) : (
              <div className="wallet-onchain__list">
                {overview.data.markets.map((market) => (
                  <div key={market.address} className="wallet-onchain__item">
                    <div>
                      <p className="text-sm font-medium text-slate-100">{market.topic}</p>
                      <p className="text-xs text-slate-500">
                        Market {market.index} • {market.settled ? "Settled" : "Open"}
                      </p>
                    </div>
                    <div className="wallet-onchain__metrics">
                      <span className="wallet-onchain__metric">
                        Momentum {market.momentum}
                      </span>
                      <span className="wallet-onchain__metric">
                        Velocity {market.velocity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
