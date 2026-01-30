"use client";

import { useAccounts, usePhantom } from "@phantom/react-sdk";
import { useOnchainOverview } from "@/lib/solana/useOnchainOverview";

const solFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export default function MobileOnchainOverview() {
  const accounts = useAccounts();
  const { isConnected } = usePhantom();
  const walletAddress = accounts?.[0]?.address;
  const overview = useOnchainOverview(walletAddress);

  return (
    <section id="onchain" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">On-chain</h2>
          <p className="mobile-section__subtitle">Localnet stats</p>
        </div>
        <span className="mobile-pill">Solana</span>
      </div>

      <div className="mobile-card">
        {!isConnected && (
          <p className="mobile-wallet__helper">
            Connect your wallet to load on-chain balances and markets.
          </p>
        )}

        {isConnected && overview.status === "loading" && (
          <p className="mobile-wallet__helper">Loading on-chain data...</p>
        )}

        {isConnected && overview.status === "error" && (
          <p className="mobile-wallet__error">
            Unable to load on-chain data: {overview.error}
          </p>
        )}

        {isConnected && overview.status === "ready" && overview.data && (
          <>
            <div className="mobile-stats">
              <div className="mobile-stat">
                <span className="mobile-stat__label">Balance</span>
                <span className="mobile-stat__value">
                  {solFormatter.format(overview.data.balanceSol)} SOL
                </span>
              </div>
              <div className="mobile-stat">
                <span className="mobile-stat__label">Markets</span>
                <span className="mobile-stat__value">
                  {overview.data.factory?.marketCount ?? "--"}
                </span>
              </div>
            </div>

            <div className="mobile-onchain__markets">
              <h3 className="text-sm font-semibold text-slate-200">Latest markets</h3>
              {overview.data.markets.length === 0 ? (
                <p className="mobile-wallet__helper">No markets found yet.</p>
              ) : (
                <div className="mobile-onchain__list">
                  {overview.data.markets.map((market) => (
                    <div key={market.address} className="mobile-onchain__item">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{market.topic}</p>
                        <p className="text-xs text-slate-500">
                          Market {market.index} • {market.settled ? "Settled" : "Open"}
                        </p>
                      </div>
                      <div className="mobile-onchain__metrics">
                        <span className="mobile-onchain__metric">
                          M {market.momentum}
                        </span>
                        <span className="mobile-onchain__metric">
                          V {market.velocity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
