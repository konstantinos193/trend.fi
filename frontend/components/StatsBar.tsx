import { TrendSnapshot } from "@/lib/trends";

interface StatsBarProps {
  trends: TrendSnapshot[];
}

export default function StatsBar({ trends }: StatsBarProps) {
  const totalTrends = trends.length;
  const avgMomentum = trends.length > 0 
    ? (trends.reduce((sum, t) => sum + t.momentum, 0) / trends.length).toFixed(3)
    : '0.000';
  const hotTrends = trends.filter(t => t.momentum > 0.7).length;
  const avgVelocity = trends.length > 0
    ? (trends.reduce((sum, t) => sum + t.velocity, 0) / trends.length).toFixed(2)
    : '0.00';

  const stats = [
    { label: 'Active Trends', value: totalTrends, accent: 'cyan' },
    { label: 'Avg Momentum', value: avgMomentum, accent: 'magenta' },
    { label: 'Hot Signals', value: hotTrends, accent: 'gold' },
    { label: 'Avg Velocity', value: avgVelocity, accent: 'lime' },
  ];

  return (
    <div className="stats-bar">
      {stats.map((stat) => (
        <div key={stat.label} className="stats-bar__item">
          <span className="stats-bar__value" data-accent={stat.accent}>
            {stat.value}
          </span>
          <span className="stats-bar__label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
