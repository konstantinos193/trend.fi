import TrendGrid from "@/components/TrendGrid";
import { TrendSnapshot } from "@/lib/trends";

interface MomentumTablesProps {
  trends: TrendSnapshot[];
}

export default function MomentumTables({ trends }: MomentumTablesProps) {
  const gridTrends = trends.slice(0, 12).map((trend) => ({
    topic: trend.topic,
    momentum: trend.momentum,
    raw_score: trend.raw_score,
    velocity: trend.velocity,
    region: trend.region,
    timestamp: trend.timestamp,
  }));

  return (
    <section id="momentum" className="dash-card animate-in delay-1">
      <div className="dash-card__header">
        <div>
          <h2 className="dash-card__title">Momentum Tables</h2>
          <p className="dash-card__subtitle">Fast-moving topics sorted by strength</p>
        </div>
        <span className="small-badge">Stream</span>
      </div>
      <TrendGrid trends={gridTrends} />
    </section>
  );
}
