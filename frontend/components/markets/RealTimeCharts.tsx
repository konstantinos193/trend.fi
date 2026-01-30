import TrendRadar from "@/components/TrendRadar";
import TrendingCarousel from "@/components/TrendingCarousel";
import { TrendSnapshot } from "@/lib/trends";

interface RealTimeChartsProps {
  trends: TrendSnapshot[];
}

export default function RealTimeCharts({ trends }: RealTimeChartsProps) {
  const carouselTrends = trends.slice(0, 6);

  return (
    <section id="markets" className="dash-card animate-in">
      <div className="dash-card__header">
        <div>
          <h2 className="dash-card__title">Real-Time Charts</h2>
          <p className="dash-card__subtitle">Momentum snapshot and live radar</p>
        </div>
        <span className="small-badge">Updated 5m</span>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-3">
            Trending Snapshot
          </h3>
          <TrendingCarousel trends={carouselTrends} />
        </div>
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wide text-slate-500 mb-3">
            Live Radar
          </h3>
          <TrendRadar trends={trends} />
        </div>
      </div>
    </section>
  );
}
