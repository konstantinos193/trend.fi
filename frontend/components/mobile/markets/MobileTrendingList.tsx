import Link from "next/link";
import { TrendSnapshot } from "@/lib/trends";
import { getTrendHref } from "@/lib/trendRouting";

interface MobileTrendingListProps {
  trends: TrendSnapshot[];
}

export default function MobileTrendingList({ trends }: MobileTrendingListProps) {
  return (
    <div className="mobile-list">
      {trends.map((trend) => {
        const isHot = trend.momentum > 0.7;
        const trendHref = getTrendHref(trend.topic);

        return (
          <Link
            key={`${trend.topic}-${trend.timestamp}`}
            href={trendHref}
            className="mobile-card mobile-card--link"
            aria-label={`View trend details for ${trend.topic}`}
          >
            <div className="mobile-card__row">
              <div className="mobile-tag-group">
                <span className="mobile-tag">{trend.region}</span>
                {isHot && <span className="mobile-tag mobile-tag--hot">Hot</span>}
              </div>
              <div className="mobile-metric-stack">
                <span className="mobile-metric">{trend.momentum.toFixed(3)}</span>
                <span className={`mobile-delta ${trend.velocity > 0 ? "up" : "down"}`}>
                  {trend.velocity > 0 ? "+" : "-"}
                  {Math.abs(trend.velocity).toFixed(2)}
                </span>
              </div>
            </div>
            <p className="mobile-card__title">{trend.topic}</p>
            <div className="mobile-progress">
              <span style={{ width: `${Math.min(100, trend.momentum * 95)}%` }} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
