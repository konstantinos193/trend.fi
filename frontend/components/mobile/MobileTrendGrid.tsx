import { TrendSnapshot } from "@/lib/trends";

interface MobileTrendGridProps {
  trends: TrendSnapshot[];
}

export default function MobileTrendGrid({ trends }: MobileTrendGridProps) {
  if (!trends.length) {
    return (
      <section id="markets" className="mobile-section">
        <div className="mobile-section__header">
          <div>
            <h2 className="mobile-section__title">Momentum Stream</h2>
            <p className="mobile-section__subtitle">Fresh activity across markets</p>
          </div>
        </div>
        <div className="mobile-empty">
          <p>No trends available right now.</p>
          <span>Check back in a few minutes for fresh data.</span>
        </div>
      </section>
    );
  }

  return (
    <section id="markets" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Momentum Stream</h2>
          <p className="mobile-section__subtitle">All active trends sorted by recency</p>
        </div>
        <span className="mobile-pill">Stream</span>
      </div>
      <div className="mobile-list">
        {trends.map((trend) => (
          <article key={`${trend.topic}-${trend.timestamp}`} className="mobile-card">
            <div className="mobile-card__row">
              <div>
                <p className="mobile-card__title">{trend.topic}</p>
                <span className="mobile-tag">{trend.region}</span>
              </div>
              <div className="mobile-metric-stack">
                <span className="mobile-metric">{trend.momentum.toFixed(3)}</span>
                <span className={`mobile-delta ${trend.velocity > 0 ? "up" : "down"}`}>
                  {trend.velocity > 0 ? "+" : "-"}
                  {Math.abs(trend.velocity).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mobile-progress">
              <span style={{ width: `${Math.min(100, trend.momentum * 100)}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
