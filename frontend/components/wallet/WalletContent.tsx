import WalletPanel from "@/components/wallet/WalletPanel";
import OnchainOverviewPanel from "@/components/wallet/OnchainOverviewPanel";

export default function WalletContent() {
  return (
    <section className="wallet space-y-6">
      <section id="overview" className="dash-card animate-in page-hero">
        <div className="dash-card__header">
          <div>
            <h1 className="dash-card__title">Wallet</h1>
            <p className="dash-card__subtitle">Connect your Phantom wallet to trade</p>
          </div>
          <span className="small-badge">Phantom</span>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Securely link your Phantom wallet to authenticate and manage your Solana address in
          TrendFi.
        </p>
      </section>

      <section id="connect" className="dash-card animate-in delay-1">
        <div className="dash-card__header">
          <div>
            <h2 className="dash-card__title">Wallet Connection</h2>
            <p className="dash-card__subtitle">Status, addresses, and session controls</p>
          </div>
          <span className="small-badge">Solana</span>
        </div>
        <WalletPanel />
      </section>

      <OnchainOverviewPanel />
    </section>
  );
}
