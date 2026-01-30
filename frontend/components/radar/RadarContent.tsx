import TrendRadar from "@/components/TrendRadar";
import TrendGrid from "@/components/TrendGrid";
import TrendLeaderboard from "@/components/TrendLeaderboard";
import NewsFeed from "@/components/NewsFeed";
import { TrendSnapshot } from "@/lib/trends";

interface RadarContentProps {
  trends: TrendSnapshot[];
}

export default function RadarContent({ trends }: RadarContentProps) {
  return (
    <section className="radar space-y-6">
      <section id="overview" className="dash-card animate-in page-hero page-hero--radar">
        <div className="dash-card__header">
          <div>
            <h1 className="dash-card__title">Live Radar</h1>
            <p className="dash-card__subtitle">
              Signal strength and momentum shifts across regions
            </p>
          </div>
          <span className="small-badge">Live</span>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Monitor the strongest trend signals in real time, spot emerging
          momentum, and keep track of regional surges as they happen.
        </p>
      </section>

      <div className="dashboard__grid">
        <div className="dashboard__col dashboard__col--main">
          <section id="radar" className="dash-card animate-in">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Radar Sweep</h2>
                <p className="dash-card__subtitle">Live pulses updated every 5 minutes</p>
              </div>
              <span className="small-badge">Updated 5m</span>
            </div>
            <TrendRadar trends={trends} />
          </section>

          <section id="momentum" className="dash-card animate-in delay-1">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Momentum Stream</h2>
                <p className="dash-card__subtitle">
                  All active trends sorted by recency
                </p>
              </div>
              <span className="small-badge">Stream</span>
            </div>
            <TrendGrid
              trends={trends.map((trend) => ({
                topic: trend.topic,
                momentum: trend.momentum,
                raw_score: trend.raw_score,
                velocity: trend.velocity,
                region: trend.region,
                timestamp: trend.timestamp,
              }))}
            />
          </section>
        </div>

        <div className="dashboard__col dashboard__col--aside">
          <section id="leaderboard" className="dash-card animate-in delay-1">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Top Signals</h2>
                <p className="dash-card__subtitle">Highest momentum today</p>
              </div>
              <span className="small-badge">Alpha</span>
            </div>
            <TrendLeaderboard trends={trends} />
          </section>

          <NewsFeed />
        </div>
      </div>
    </section>
  );
}
