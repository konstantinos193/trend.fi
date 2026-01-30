import Link from "next/link";
import { TrendSnapshot } from "@/lib/trends";
import { getTrendHref } from "@/lib/trendRouting";
import MedalIcon from "@/components/icons/MedalIcon";

interface MobileTrendLeaderboardProps {
  trends: TrendSnapshot[];
}

export default function MobileTrendLeaderboard({ trends }: MobileTrendLeaderboardProps) {
  const topTrends = [...trends]
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 3);

  return (
    <section id="leaderboard" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Leaderboard</h2>
          <p className="mobile-section__subtitle">Top breakout candidates</p>
        </div>
        <span className="mobile-pill">Alpha</span>
      </div>
      <div className="mobile-list">
        {topTrends.map((trend, index) => {
          const trendHref = getTrendHref(trend.topic);

          return (
            <Link
              key={trend.topic}
              href={trendHref}
              className="mobile-card mobile-card--link"
              aria-label={`View trend details for ${trend.topic}`}
            >
            <div className="mobile-card__row">
              <div className="mobile-card__row">
                <span className="mobile-medal">
                  <MedalIcon
                    rank={(index + 1) as 1 | 2 | 3}
                    className="h-5 w-5"
                  />
                </span>
                <div>
                  <p className="mobile-card__title">{trend.topic}</p>
                  <span className="mobile-tag">{trend.region}</span>
                </div>
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
            </Link>
          );
        })}
      </div>
    </section>
  );
}
