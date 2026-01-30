export default function MobileHeroSection() {
  return (
    <section id="overview" className="mobile-hero">
      <div className="mobile-hero__eyebrow-group">
        <span className="mobile-hero__eyebrow">Attention Markets</span>
        <span className="mobile-hero__chain-badge">
          <img src="/solana-mark.svg" alt="Solana" className="mobile-hero__chain-logo" />
          <span>Solana</span>
        </span>
      </div>
      <h1 className="mobile-hero__title">Trade momentum before it hits the timeline.</h1>
      <p className="mobile-hero__subtitle">
        Track trending topics, spot velocity shifts, and act on signals backed by
        on-chain oracle snapshots.
      </p>
      <div className="mobile-hero__actions">
        <a href="#wallet" className="btn-cta w-full">
          <span>Join Now</span>
        </a>
        <a href="/markets" className="btn-secondary w-full">
          View Live Trends
        </a>
      </div>
      <div className="mobile-hero__meta">
        <div>
          <p className="mobile-hero__label">Refresh cadence</p>
          <p className="mobile-hero__value">Every 5 minutes</p>
        </div>
        <div>
          <p className="mobile-hero__label">Signal coverage</p>
          <p className="mobile-hero__value">Global + social sources</p>
        </div>
        <div>
          <p className="mobile-hero__label">Execution ready</p>
          <p className="mobile-hero__value">Wallet connect in one step</p>
        </div>
      </div>
    </section>
  );
}
