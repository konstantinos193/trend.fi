import { TrendSnapshot } from "@/lib/trends";

interface TokenStatsProps {
  trend: TrendSnapshot;
}

export default function TokenStats({ trend }: TokenStatsProps) {
  const updatedAt = new Date(trend.timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="token-stats">
      <div className="token-stats__header">
        <div>
          <h2 className="dash-card__title">{trend.topic}</h2>
          <p className="dash-card__subtitle">Attention token • {trend.region}</p>
        </div>
        <span className="small-badge">Updated {updatedAt}</span>
      </div>

      <div className="token-metrics">
        <div className="token-metric">
          <p className="token-metric__label">Momentum</p>
          <p className={`token-metric__value ${trend.momentum > 0.7 ? "is-hot" : ""}`}>
            {trend.momentum.toFixed(3)}
          </p>
        </div>
        <div className="token-metric">
          <p className="token-metric__label">Velocity</p>
          <p className={`token-metric__value ${trend.velocity >= 0 ? "is-up" : "is-down"}`}>
            {trend.velocity >= 0 ? "+" : "-"}
            {Math.abs(trend.velocity).toFixed(2)}
          </p>
        </div>
        <div className="token-metric">
          <p className="token-metric__label">Raw score</p>
          <p className="token-metric__value">{trend.raw_score.toFixed(1)}</p>
        </div>
        <div className="token-metric">
          <p className="token-metric__label">Trend health</p>
          <p className="token-metric__value">
            {trend.momentum > 0.7 ? "Breakout" : trend.momentum > 0.4 ? "Steady" : "Cooling"}
          </p>
        </div>
      </div>

      <div className="sparkline mt-4">
        <span style={{ width: `${Math.min(100, trend.momentum * 100)}%` }} />
      </div>
    </div>
  );
}
