import MobileTrendingCarousel from "@/components/mobile/MobileTrendingCarousel";
import MobileTrendLeaderboard from "@/components/mobile/MobileTrendLeaderboard";
import MobileTradePanel from "./MobileTradePanel";
import { TrendSnapshot } from "@/lib/trends";

interface MobileTokenPageProps {
  trend: TrendSnapshot;
  trends: TrendSnapshot[];
}

export default function MobileTokenPage({ trend, trends }: MobileTokenPageProps) {
  const carouselTrends = trends.filter((item) => item.topic !== trend.topic).slice(0, 6);

  return (
    <div className="mobile-dashboard">
      <section className="mobile-hero">
        <p className="mobile-hero__eyebrow">Token Market</p>
        <h1 className="mobile-hero__title">{trend.topic}</h1>
        <p className="mobile-hero__subtitle">
          Track attention momentum and simulate trades.
        </p>
      </section>

      <section className="mobile-section">
        <div className="mobile-section__header">
          <div>
            <h2 className="mobile-section__title">Overview</h2>
            <p className="mobile-section__subtitle">Latest trend metrics</p>
          </div>
          <span className="mobile-pill">{trend.region}</span>
        </div>
        <div className="mobile-card">
          <div className="mobile-card__row">
            <div>
              <p className="mobile-card__title">Momentum</p>
              <p className="mobile-card__text">{trend.momentum.toFixed(3)}</p>
            </div>
            <div>
              <p className="mobile-card__title">Velocity</p>
              <p className="mobile-card__text">
                {trend.velocity >= 0 ? "+" : "-"}
                {Math.abs(trend.velocity).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mobile-card__row mt-2">
            <div>
              <p className="mobile-card__title">Raw score</p>
              <p className="mobile-card__text">{trend.raw_score.toFixed(1)}</p>
            </div>
            <div>
              <p className="mobile-card__title">Health</p>
              <p className="mobile-card__text">
                {trend.momentum > 0.7 ? "Breakout" : trend.momentum > 0.4 ? "Steady" : "Cooling"}
              </p>
            </div>
          </div>
          <div className="mobile-progress mt-3">
            <span style={{ width: `${Math.min(100, trend.momentum * 100)}%` }} />
          </div>
        </div>
      </section>

      <MobileTradePanel trend={trend} />
      <MobileTrendLeaderboard trends={trends} />
      <MobileTrendingCarousel trends={carouselTrends} />
    </div>
  );
}
