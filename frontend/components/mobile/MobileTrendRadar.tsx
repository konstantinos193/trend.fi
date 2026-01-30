import { TrendSnapshot } from "@/lib/trends";

interface MobileTrendRadarProps {
  trends: TrendSnapshot[];
}

export default function MobileTrendRadar({ trends }: MobileTrendRadarProps) {
  const displayTrends = trends.slice(0, 4);

  return (
    <section id="radar" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Live Radar</h2>
          <p className="mobile-section__subtitle">Signal strength by region</p>
        </div>
        <span className="mobile-pill">Live</span>
      </div>
      <div className="mobile-list">
        {displayTrends.map((trend) => (
          <article key={trend.topic} className="mobile-card">
            <div className="mobile-card__row">
              <span className="mobile-tag">{trend.region}</span>
              <span className="mobile-metric">{trend.momentum.toFixed(3)}</span>
            </div>
            <p className="mobile-card__title">{trend.topic}</p>
            <div className="mobile-progress">
              <span style={{ width: `${Math.min(100, trend.momentum * 100)}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
