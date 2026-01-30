import { TrendSnapshot } from "@/lib/trends";

interface MobileRadarListProps {
  trends: TrendSnapshot[];
}

export default function MobileRadarList({ trends }: MobileRadarListProps) {
  const displayTrends = trends.slice(0, 4);

  return (
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
  );
}
