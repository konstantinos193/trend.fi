import Link from "next/link";
import { TrendSnapshot } from "@/lib/trends";
import { getTrendHref } from "@/lib/trendRouting";
import MedalIcon from "@/components/icons/MedalIcon";

interface TrendLeaderboardProps {
  trends: TrendSnapshot[];
}

export default function TrendLeaderboard({ trends }: TrendLeaderboardProps) {
  const topTrends = [...trends]
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 3);

  return (
    <div className="leaderboard">
      {topTrends.map((trend, index) => {
        const trendHref = getTrendHref(trend.topic);

        return (
          <Link
            key={trend.topic}
            href={trendHref}
            className="leaderboard-card"
            aria-label={`View trend details for ${trend.topic}`}
          >
          <div className="flex items-center gap-3">
            <MedalIcon
              rank={(index + 1) as 1 | 2 | 3}
              className="h-6 w-6"
            />
            <div className="flex-1 min-w-0">
              <strong className="text-sm block truncate">{trend.topic}</strong>
              <p className="text-xs font-mono text-slate-500">{trend.region}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-mono font-semibold text-cyan">
                {trend.momentum.toFixed(3)}
              </p>
              <p className={`text-xs font-mono ${trend.velocity > 0 ? 'text-cyan' : 'text-magenta'}`}>
                {trend.velocity > 0 ? '+' : ''}{trend.velocity.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="sparkline mt-3">
            <span style={{ width: `${Math.min(100, trend.momentum * 100)}%` }} />
          </div>
          </Link>
        );
      })}
    </div>
  );
}
