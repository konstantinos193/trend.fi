import Link from "next/link";
import { TrendSnapshot } from "@/lib/trends";
import { getTrendHref } from "@/lib/trendRouting";

interface MobileTrendingCarouselProps {
  trends: TrendSnapshot[];
}

export default function MobileTrendingCarousel({ trends }: MobileTrendingCarouselProps) {
  return (
    <section id="trending" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Trending Now</h2>
          <p className="mobile-section__subtitle">Hot topics rising fast</p>
        </div>
        <span className="mobile-pill">Updated 5m</span>
      </div>
      <div className="mobile-scroll">
        {trends.map((trend) => {
          const isHot = trend.momentum > 0.7;
          const trendHref = getTrendHref(trend.topic);
          return (
            <Link
              key={trend.topic}
              href={trendHref}
              className="mobile-card mobile-card--compact mobile-card--link"
              aria-label={`View trend details for ${trend.topic}`}
            >
              <div className="mobile-card__row">
                <span className="mobile-tag">{trend.region}</span>
                {isHot && <span className="mobile-tag mobile-tag--hot">Hot</span>}
              </div>
              <h3 className="mobile-card__title">{trend.topic}</h3>
              <div className="mobile-card__row">
                <span className="mobile-metric">{trend.momentum.toFixed(3)}</span>
                <span className={`mobile-delta ${trend.velocity > 0 ? "up" : "down"}`}>
                  {trend.velocity > 0 ? "+" : "-"}
                  {Math.abs(trend.velocity).toFixed(2)}
                </span>
              </div>
              <div className="mobile-progress">
                <span style={{ width: `${Math.min(100, trend.momentum * 95)}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
