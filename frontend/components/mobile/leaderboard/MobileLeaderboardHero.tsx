export default function MobileLeaderboardHero() {
  return (
    <section id="overview" className="mobile-leaderboard-hero">
      <div>
        <span className="mobile-hero__eyebrow">Top Signals</span>
        <h1 className="mobile-hero__title">Leaderboard</h1>
        <p className="mobile-hero__subtitle">
          Follow the highest momentum trends and spot breakout leaders.
        </p>
      </div>
      <div className="mobile-leaderboard-hero__meta">
        <div>
          <p className="mobile-hero__label">Refresh cadence</p>
          <p className="mobile-hero__value">Every 5 minutes</p>
        </div>
        <div>
          <p className="mobile-hero__label">Focus</p>
          <p className="mobile-hero__value">Momentum leaders</p>
        </div>
      </div>
    </section>
  );
}
