import TrendingCarousel from "@/components/TrendingCarousel";
import TrendLeaderboard from "@/components/TrendLeaderboard";
import TokenStats from "./TokenStats";
import TradePanel from "@/components/trade/TradePanel";
import { TrendSnapshot } from "@/lib/trends";

interface TokenContentProps {
  trend: TrendSnapshot;
  trends: TrendSnapshot[];
}

export default function TokenContent({ trend, trends }: TokenContentProps) {
  const carouselTrends = trends.filter((item) => item.topic !== trend.topic).slice(0, 6);

  return (
    <section className="token space-y-6">
      <section className="dash-card animate-in page-hero page-hero--token">
        <div className="dash-card__header">
          <div>
            <h1 className="dash-card__title">Token Market</h1>
            <p className="dash-card__subtitle">Trade attention momentum in real time</p>
          </div>
          <span className="small-badge">Live</span>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Every topic has a tradable token that tracks momentum and velocity. Use the paper
          trade module to simulate entries before you go on-chain.
        </p>
      </section>

      <div className="dashboard__grid">
        <div className="dashboard__col dashboard__col--main">
          <section id="overview" className="dash-card animate-in">
            <TokenStats trend={trend} />
          </section>

          <section id="trade" className="dash-card animate-in delay-1">
            <TradePanel trend={trend} />
          </section>
        </div>

        <div className="dashboard__col dashboard__col--aside">
          <section id="leaderboard" className="dash-card animate-in">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Top Signals</h2>
                <p className="dash-card__subtitle">Highest momentum right now</p>
              </div>
              <span className="small-badge">Alpha</span>
            </div>
            <TrendLeaderboard trends={trends} />
          </section>

          <section id="trending" className="dash-card animate-in delay-1">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Related Momentum</h2>
                <p className="dash-card__subtitle">More topics gaining speed</p>
              </div>
              <span className="small-badge">Updated 5m</span>
            </div>
            <TrendingCarousel trends={carouselTrends} />
          </section>
        </div>
      </div>
    </section>
  );
}
