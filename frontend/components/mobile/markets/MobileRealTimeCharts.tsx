import { TrendSnapshot } from "@/lib/trends";
import MobileRadarList from "./MobileRadarList";
import MobileTrendingList from "./MobileTrendingList";

interface MobileRealTimeChartsProps {
  trends: TrendSnapshot[];
}

export default function MobileRealTimeCharts({ trends }: MobileRealTimeChartsProps) {
  const listTrends = trends.slice(0, 6);

  return (
    <section id="markets" className="mobile-section">
      <div className="mobile-section__header">
        <div>
          <h2 className="mobile-section__title">Real-Time Charts</h2>
          <p className="mobile-section__subtitle">Momentum snapshot and live radar</p>
        </div>
        <span className="mobile-pill">Updated 5m</span>
      </div>
      <div className="mobile-list">
        <div className="mobile-chart-block">
          <p className="mobile-chart-block__label">Trending Snapshot</p>
          <MobileTrendingList trends={listTrends} />
        </div>
        <div className="mobile-chart-block">
          <p className="mobile-chart-block__label">Live Radar</p>
          <MobileRadarList trends={trends} />
        </div>
      </div>
    </section>
  );
}
