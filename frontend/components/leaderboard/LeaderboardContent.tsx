import TrendLeaderboard from "@/components/TrendLeaderboard";
import TrendGrid from "@/components/TrendGrid";
import NewsFeed from "@/components/NewsFeed";
import { TrendSnapshot } from "@/lib/trends";

interface LeaderboardContentProps {
  trends: TrendSnapshot[];
}

export default function LeaderboardContent({ trends }: LeaderboardContentProps) {
  return (
    <section className="leaderboard-page space-y-6">
      <section id="overview" className="dash-card animate-in">
        <div className="dash-card__header">
          <div>
            <h1 className="dash-card__title">Leaderboard</h1>
            <p className="dash-card__subtitle">Top momentum and breakout signals</p>
          </div>
          <span className="small-badge">Alpha</span>
        </div>
        <p className="text-sm text-slate-400 max-w-2xl">
          Track the strongest trend momentum across regions, highlight leaders by
          velocity, and monitor the latest breakout candidates.
        </p>
      </section>

      <div className="dashboard__grid">
        <div className="dashboard__col dashboard__col--main">
          <section id="leaderboard" className="dash-card animate-in">
            <div className="dash-card__header">
              <div>
                <h2 className="dash-card__title">Top Signals</h2>
                <p className="dash-card__subtitle">Highest momentum today</p>
              </div>
              <span className="small-badge">Top 3</span>
            </div>
            <TrendLeaderboard trends={trends} />
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
          <NewsFeed />
        </div>
      </div>
    </section>
  );
}
