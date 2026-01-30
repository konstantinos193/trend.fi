export default function HeroSection() {
  return (
    <section id="overview" className="hero dash-card animate-in">
      <div className="hero__content">
        <div className="hero__eyebrow-group">
          <span className="hero__eyebrow">Attention Markets</span>
          <span className="hero__chain-badge">
            <img src="/solana-mark.svg" alt="Solana" className="hero__chain-logo" />
            <span>Solana</span>
          </span>
        </div>
        <h1 className="hero__title">Trade momentum before it hits the timeline.</h1>
        <p className="hero__subtitle">
          Track trending topics, spot velocity shifts, and act on signals backed by
          on-chain oracle snapshots.
        </p>
        <div className="hero__actions">
          <a href="#wallet" className="btn-cta">
            <span>Join Now</span>
          </a>
          <a href="/markets" className="btn-secondary">
            View Live Trends
          </a>
        </div>
      </div>
      <div className="hero__panel">
        <div className="hero__panel-item">
          <span className="hero__panel-label">Refresh cadence</span>
          <span className="hero__panel-value">Every 5 minutes</span>
        </div>
        <div className="hero__panel-item">
          <span className="hero__panel-label">Signal coverage</span>
          <span className="hero__panel-value">Global + social sources</span>
        </div>
        <div className="hero__panel-item">
          <span className="hero__panel-label">Execution ready</span>
          <span className="hero__panel-value">Wallet connect in one step</span>
        </div>
      </div>
    </section>
  );
}
