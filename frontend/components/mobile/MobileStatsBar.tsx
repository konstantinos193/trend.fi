import { TrendSnapshot } from "@/lib/trends";

interface MobileStatsBarProps {
  trends: TrendSnapshot[];
}

export default function MobileStatsBar({ trends }: MobileStatsBarProps) {
  const totalTrends = trends.length;
  const avgMomentum = trends.length > 0
    ? (trends.reduce((sum, t) => sum + t.momentum, 0) / trends.length).toFixed(3)
    : "0.000";
  const hotTrends = trends.filter((trend) => trend.momentum > 0.7).length;
  const avgVelocity = trends.length > 0
    ? (trends.reduce((sum, t) => sum + t.velocity, 0) / trends.length).toFixed(2)
    : "0.00";

  const stats = [
    { label: "Active Trends", value: totalTrends, accent: "cyan" },
    { label: "Avg Momentum", value: avgMomentum, accent: "magenta" },
    { label: "Hot Signals", value: hotTrends, accent: "gold" },
    { label: "Avg Velocity", value: avgVelocity, accent: "lime" },
  ];

  return (
    <section className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Snapshot</h2>
          <p className="mobile-section__subtitle">Live metrics</p>
        </div>
        <span className="mobile-pill">Now</span>
      </div>
      <div className="mobile-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="mobile-stat" data-accent={stat.accent}>
            <span className="mobile-stat__value">{stat.value}</span>
            <span className="mobile-stat__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
