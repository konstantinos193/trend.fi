export default function MobileRadarHero() {
  return (
    <section id="overview" className="mobile-radar-hero">
      <div>
        <span className="mobile-hero__eyebrow">Live Radar</span>
        <h1 className="mobile-hero__title">Radar</h1>
        <p className="mobile-hero__subtitle">
          Track signal strength and momentum shifts as they emerge across regions.
        </p>
      </div>
      <div className="mobile-radar-hero__meta">
        <div>
          <p className="mobile-hero__label">Refresh cadence</p>
          <p className="mobile-hero__value">Every 5 minutes</p>
        </div>
        <div>
          <p className="mobile-hero__label">Coverage</p>
          <p className="mobile-hero__value">Regional signal sweep</p>
        </div>
      </div>
    </section>
  );
}
