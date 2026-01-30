export interface TrendCardProps {
  topic: string;
  momentum: number;
  raw_score: number;
  velocity: number;
  timestamp: string;
  region: string;
}

import Link from "next/link";
import { getTrendHref } from "@/lib/trendRouting";

export default function TrendCard({
  topic,
  momentum,
  raw_score,
  velocity,
  timestamp,
  region,
}: TrendCardProps) {
  const minute = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const sparklineWidth = Math.min(100, Math.max(10, Math.round(momentum * 90)));
  const isHot = momentum > 0.7;
  const isMild = momentum < 0.3;

  const trendHref = getTrendHref(topic);

  return (
    <Link
      href={trendHref}
      className="trend-card"
      aria-label={`View trend details for ${topic}`}
    >
      <header className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wide text-slate-500">
          {region}
        </span>
        <span className="text-xs font-mono text-slate-500">{minute}</span>
      </header>

      <h3 className="mt-4 text-xl font-semibold tracking-tight">{topic}</h3>
      
      <p className="text-xs text-slate-500 mt-1 font-mono">
        Raw score: {raw_score.toLocaleString()}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-mono uppercase text-slate-500 mb-1">Momentum</p>
          <p className={`text-2xl font-mono font-semibold ${isHot ? 'text-cyan' : isMild ? 'text-slate-400' : 'text-slate-200'}`}>
            {momentum.toFixed(3)}
          </p>
        </div>
        <div>
          <p className="text-xs font-mono uppercase text-slate-500 mb-1">Velocity</p>
          <p className={`text-2xl font-mono font-semibold ${velocity > 0 ? 'text-cyan' : 'text-magenta'}`}>
            {velocity > 0 ? '+' : ''}{velocity.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="sparkline">
        <span style={{ width: `${sparklineWidth}%` }} />
      </div>

      {isHot && (
        <div className="mt-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono text-cyan uppercase tracking-wide">Breakout signal</span>
        </div>
      )}
    </Link>
  );
}
